
import { readProposalPdf } from "./services/extraction.service.js";

try {
  const proposal = await readProposalPdf("test1.pdf");

  console.log("PDF read successfully!");
  console.log("Filename:", proposal.filename);
  console.log("Size:", proposal.sizeInBytes, "bytes");
  console.log("Buffer:", proposal.buffer.constructor.name);
} catch (error) {
  console.error("Failed to read PDF:", error.message);
}
