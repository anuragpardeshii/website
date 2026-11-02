process.once("message", async ({ data, kind }) => {
  try {
    const buffer = Buffer.from(data, "base64");
    let text = "";
    if (kind === "pdf") {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      try {
        const info = await parser.getInfo();
        if (info.total > 30)
          throw new Error("Use a résumé with no more than 30 pages.");
        text = (await parser.getText()).text;
      } finally {
        await parser.destroy();
      }
    } else {
      const mammoth = await import("mammoth");
      text = (await mammoth.extractRawText({ buffer })).value;
    }
    process.send({ text: text.slice(0, 60000) });
  } catch {
    process.send({
      error:
        "This document could not be read. Use a text-based PDF or DOCX, or enter your details manually.",
    });
  }
  process.disconnect();
});
