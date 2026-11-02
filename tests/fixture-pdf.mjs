export function fixturePDF() {
  const lines = [
    "Jordan Example",
    "jordan@example.test",
    "+91 98765 43210",
    "Skills",
    "React, TypeScript, Node.js",
  ];
  const stream =
    "BT /F1 12 Tf 50 750 Td " +
    lines
      .map((line, i) => (i ? "0 -20 Td " : "") + "(" + line + ") Tj")
      .join("\n") +
    " ET";
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Length " +
      Buffer.byteLength(stream) +
      " >>\nstream\n" +
      stream +
      "\nendstream",
  ];
  let out = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((obj, i) => {
    offsets.push(Buffer.byteLength(out));
    out += i + 1 + " 0 obj\n" + obj + "\nendobj\n";
  });
  const offset = Buffer.byteLength(out);
  return Buffer.from(
    out +
      "xref\n0 6\n0000000000 65535 f \n" +
      offsets
        .slice(1)
        .map((n) => String(n).padStart(10, "0") + " 00000 n \n")
        .join("") +
      "trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n" +
      offset +
      "\n%%EOF",
  );
}
