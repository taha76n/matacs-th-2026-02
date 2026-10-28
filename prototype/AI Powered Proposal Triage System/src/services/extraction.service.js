
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const proposalsDirectory = path.resolve("proposals");

export async function readProposalPdf(filename) {
  if (
    typeof filename !== "string" ||
    !/^[a-zA-Z0-9_-]+\.pdf$/i.test(filename)
  ) {
    throw new Error("Invalid PDF filename");
  }

  const filePath = path.join(proposalsDirectory, filename);

  const fileStats = await stat(filePath);

  if (!fileStats.isFile()) {
    throw new Error("The specified path is not a file");
  }

  const pdfBuffer = await readFile(filePath);

  if (
    pdfBuffer.length < 5 ||
    pdfBuffer.subarray(0, 5).toString("ascii") !== "%PDF-"
  ) {
    throw new Error("The specified file is not a valid PDF file");
  }

  return {
    filename,
    sizeInBytes: pdfBuffer.length,
    buffer: pdfBuffer,
  };
}
