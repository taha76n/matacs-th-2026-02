import { writeFile } from "node:fs/promises";
import { buildRankingOutput } from "./services/ranking-output.service.js";
import { readProposalPdf } from "./services/extraction.service.js";
import { extractMultipleProposals } from "./services/gemini.service.js";
import { evaluateEligibility } from "./services/eligibility.service.js";
import { scoreProposals } from "./services/scoring.service.js";

const pdf = await readProposalPdf("test.pdf");
const result = await extractMultipleProposals(pdf.buffer);

const proposals = result.proposals.map((data) => ({
  data,
  eligibility: evaluateEligibility(data),
}));

console.log("\n--- ELIGIBILITY ---");

for (const proposal of proposals) {
  console.log(

    proposal.data.proposalLetter,
    "Licence:",
    JSON.stringify(proposal.data.licence, null, 2),
    "Warranties:",
    JSON.stringify(proposal.data.warranties, null, 2),
    JSON.stringify(proposal.data.experience, null, 2),
    proposal.data.proposalLetter,
    proposal.eligibility.contractorName,
    proposal.eligibility.status
  );
}

const scores = scoreProposals(proposals);

const ranking = buildRankingOutput(scores, proposals);

await writeFile(
  "ranking.json",
  JSON.stringify(ranking, null, 2) + "\n",
  "utf8"
);

console.log("\nRanking saved to ranking.json");
console.log(JSON.stringify(ranking, null, 2));

console.log("\n--- SCORING RESULTS ---");
console.log(JSON.stringify(scores, null, 2));
