import { readProposalPdf } from "./services/extraction.service.js";
import { extractMultipleProposals } from "./services/gemini.service.js";

const pdf = await readProposalPdf("test.pdf");

const result = await extractMultipleProposals(pdf.buffer);

console.log("Proposals found:", result.proposals.length);

// for (const proposal of result.proposals) {
//   console.log(
//     proposal.proposalLetter,
//     proposal.contractorName.value
//   );
// }

for (const proposal of result.proposals) {
  console.log(`\n========== PROPOSAL ${proposal.proposalLetter} ==========`);
  console.log(JSON.stringify(proposal, null, 2));
}
