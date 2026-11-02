import { fork } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createConnection } from "node:net";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { resolve } from "node:path";
import { id } from "./db.mjs";
import { fail } from "./validation.mjs";
import { aiReady, extractProfile } from "./ai.mjs";

function checkDocument(file) {
  const name = file.originalname.toLowerCase();
  if (
    name.endsWith(".pdf") &&
    file.buffer.subarray(0, 5).toString() === "%PDF-"
  )
    return "pdf";
  if (name.endsWith(".docx") && file.buffer.readUInt32LE(0) === 0x04034b50) {
    // Inspect central-directory sizes before handing compressed data to a parser.
    const b = file.buffer;
    let end = -1;
    for (let i = b.length - 22; i >= Math.max(0, b.length - 65557); i--)
      if (b.readUInt32LE(i) === 0x06054b50) {
        end = i;
        break;
      }
    if (end < 0) fail(400, "The DOCX archive is invalid.");
    const count = b.readUInt16LE(end + 10);
    let offset = b.readUInt32LE(end + 16),
      total = 0,
      document = false;
    if (count > 200 || offset >= b.length)
      fail(400, "This document is too complex. Please use a simpler résumé.");
    for (let n = 0; n < count; n++) {
      if (offset + 46 > b.length || b.readUInt32LE(offset) !== 0x02014b50)
        fail(400, "The DOCX archive is invalid.");
      const size = b.readUInt32LE(offset + 24),
        length = b.readUInt16LE(offset + 28);
      total += size;
      if (total > 20 * 1024 * 1024 || b.readUInt16LE(offset + 8) & 1)
        fail(400, "Encrypted or oversized documents are not supported.");
      if (
        b.subarray(offset + 46, offset + 46 + length).toString() ===
        "word/document.xml"
      )
        document = true;
      offset +=
        46 + length + b.readUInt16LE(offset + 30) + b.readUInt16LE(offset + 32);
    }
    if (!document) fail(400, "Please upload a valid DOCX résumé.");
    return "docx";
  }
  fail(400, "Please upload a PDF or DOCX résumé (up to 5 MB).");
}
export async function scan(buffer) {
  if (!process.env.CLAMAV_HOST) {
    if (process.env.NODE_ENV === "production")
      fail(
        503,
        "Document scanning is unavailable. Please enter your details manually.",
      );
    return;
  }
  await new Promise((resolveScan, reject) => {
    const socket = createConnection({
      host: process.env.CLAMAV_HOST,
      port: Number(process.env.CLAMAV_PORT || 3310),
    });
    let reply = "";
    socket.setTimeout(10000, () => socket.destroy(new Error("Scan timeout")));
    socket.once("error", () =>
      reject(
        Object.assign(
          new Error("Document scanning is unavailable. Please try later."),
          { status: 503 },
        ),
      ),
    );
    socket.on("data", (chunk) => (reply += chunk.toString()));
    socket.on("end", () =>
      /\bOK\x00?$/.test(reply)
        ? resolveScan()
        : reject(
            Object.assign(
              new Error("This file did not pass the security scan."),
              { status: 400 },
            ),
          ),
    );
    socket.on("connect", () => {
      socket.write("zINSTREAM\0");
      for (let i = 0; i < buffer.length; i += 65536) {
        const chunk = buffer.subarray(i, i + 65536);
        const size = Buffer.alloc(4);
        size.writeUInt32BE(chunk.length);
        socket.write(size);
        socket.write(chunk);
      }
      socket.write(Buffer.alloc(4));
    });
  });
}
async function parse(file, kind) {
  return new Promise((resolveParse, reject) => {
    const worker = fork(
      fileURLToPath(new URL("./parse-worker.mjs", import.meta.url)),
      {
        stdio: ["ignore", "ignore", "ignore", "ipc"],
        execArgv: ["--max-old-space-size=256"],
        // Untrusted document parsing must not inherit provider credentials.
        env: {
          NODE_ENV: process.env.NODE_ENV || "development",
          TZ: process.env.TZ || "UTC",
        },
      },
    );
    let finished = false;
    const done = (error, result) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      worker.kill();
      error
        ? reject(Object.assign(new Error(error), { status: 400 }))
        : resolveParse(result);
    };
    const timer = setTimeout(
      () =>
        done(
          "This résumé took too long to read. Please use a simpler file or enter details manually.",
        ),
      15000,
    );
    worker.once("message", (m) => done(m.error, m.text));
    worker.once("error", () => done("The document reader is unavailable."));
    worker.once("exit", () => done("This document could not be read."));
    worker.send({ data: file.buffer.toString("base64"), kind });
  });
}
export function basicExtraction(text) {
  const lines = text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";
  const phone =
    text
      .match(
        /(?:\+\d{1,3}[\s.-]?)?(?:\(?\d{3,5}\)?[\s.-])?\d[\d\s().-]{7,17}\d/,
      )?.[0]
      ?.trim() || "";
  const name =
    lines.find(
      (s) =>
        s.length > 3 &&
        s.length < 70 &&
        !/[\d@:/]/.test(s) &&
        !/(resume|curriculum|profile|experience)/i.test(s),
    ) || "";
  const linkedin =
    text.match(/https?:\/\/(?:www\.)?linkedin\.com\/[^\s]+/i)?.[0] || "";
  const skills = lines.findIndex((s) => /^skills\s*:?$/i.test(s));
  return {
    name,
    email,
    phone,
    linkedin,
    skills: skills >= 0 ? lines[skills + 1] || "" : "",
    summary: "",
    education: "",
    location: "",
    experience: "",
    headline: "",
    portfolio: "",
  };
}
export async function saveResume(
  db,
  user,
  file,
  useAI = false,
  directory = process.env.DATA_DIR || ".data",
) {
  if (!file || file.buffer.length < 8)
    fail(400, "Choose a PDF or DOCX résumé.");
  const kind = checkDocument(file);
  await scan(file.buffer);
  const text = await parse(file, kind);
  if (text.trim().length < 20)
    fail(
      422,
      "No readable text was found. Scanned image résumés need OCR; please enter your details manually or upload a text-based file.",
    );
  let extracted = basicExtraction(text),
    method = "Document extraction",
    warning = "Review all extracted fields before submitting.";
  if (useAI) {
    if (!aiReady())
      fail(
        503,
        "AI is not connected. Turn off AI enhancement to use document extraction.",
      );
    extracted = await extractProfile(text);
    method = "AI-assisted extraction";
  }
  const resumeId = id();
  const folder = resolve(directory, "resumes");
  await mkdir(folder, { recursive: true, mode: 0o700 });
  const path = resolve(folder, resumeId + "." + kind);
  await writeFile(path, file.buffer, { mode: 0o600 });
  await db
    .insert("resumes", {
      id: resumeId,
      user_id: user.id,
      filename: file.originalname.slice(0, 200),
      mime:
        kind === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      storage_path: "resumes/" + resumeId + "." + kind,
      extracted: extracted,
    })
    .catch(async (error) => {
      await unlink(path).catch(() => {});
      throw error;
    });
  return {
    id: resumeId,
    filename: file.originalname,
    extracted,
    method,
    warning,
  };
}
