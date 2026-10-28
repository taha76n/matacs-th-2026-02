
import { readProposalPdf } from "./services/extraction.service.js";
import { extractProposalData } from "./services/gemini.service.js";
import { evaluateEligibility } from "./services/eligibility.service.js";

try {
  const proposal = await readProposalPdf("test1.pdf");

  console.log("Extracting proposal information...");
  const extractedData = await extractProposalData(proposal.buffer);

  console.log("\nExtracted data:\n");
  console.log(JSON.stringify(extractedData, null, 2));

  const eligibility = evaluateEligibility(extractedData);

  console.log("\nEligibility result:\n");
  console.log(JSON.stringify(eligibility, null, 2));
} catch (error) {
  console.error("Test failed:", error.message);
}
