
function getProposalLetter(proposal) {
  return proposal.data?.proposalLetter ?? null;
}


function buildReason(result, proposal) {
  const data = proposal.data;
  const letter = data.proposalLetter ?? "?";

  if (result.status === "flagged") {
    const explanation =
      result.reviewNotes?.find(
        (note) =>
          !/mandatory eligibility evidence requires human review|eligibility status is missing or invalid/i.test(
            note
          )
      ) ?? "Eligibility evidence requires human review.";

    return `Proposal ${letter} is flagged: ${explanation}`;
  }

  if (result.status === "ineligible") {
    return `Proposal ${letter} does not meet a mandatory eligibility requirement.`;
  }

  const experience = data.experience ?? {};
  const price = data.price ?? {};
  const timeline = data.timeline ?? {};

  const strengths = [];

  if (typeof experience.installationCount === "number") {
    strengths.push(
      `${experience.installationCount} commercial installations`
    );
  }

  if (typeof price.amount === "number") {
    strengths.push(
      `$${price.amount.toLocaleString("en-CA")} ${price.currency ?? "CAD"}`
    );
  }

  if (typeof timeline.completionWeeks === "number") {
    strengths.push(`${timeline.completionWeeks}-week completion`);
  } else {
    strengths.push("completion timeline not confirmed");
  }

  const details = strengths.join(", ");

  const reviewNote = result.reviewNotes?.find(
    (note) =>
      !/instruction .* ignored as per the rules/i.test(note)
  );

  const caveat = reviewNote ? ` Review note: ${reviewNote}` : "";

  return `Proposal ${letter}: ${details}. Score: ${result.provisionalScore}/100.${caveat}`;
}


// export function buildRankingOutput(scoredResults, proposals) {
//   return scoredResults.map((result, index) => {
//     const proposal = proposals[index];

//     return {
//       proposal: getProposalLetter(proposal),
//       rank: result.rank,
//       status: result.status,
//       score: result.status === "ranked" ? result.score : null,
//       reason: buildReason(result, proposal),
//     };
//   });
// }



export function buildRankingOutput(scoredResults, proposals) {
  return scoredResults
    .map((result, index) => ({
      result,
      proposal: proposals[index],
    }))
    .sort((a, b) => {
      // Ranked proposals first, in ascending rank order.
      if (a.result.rank !== null && b.result.rank !== null) {
        return a.result.rank - b.result.rank;
      }

      if (a.result.rank !== null) return -1;
      if (b.result.rank !== null) return 1;

      // Keep unranked proposals in their original order.
      return 0;
    })
    .map(({ result, proposal }) => ({
      proposal: getProposalLetter(proposal),
      rank: result.rank,
      status: result.status,
      score: result.status === "ranked" ? result.score : null,
      reason: buildReason(result, proposal),
    }));
}
