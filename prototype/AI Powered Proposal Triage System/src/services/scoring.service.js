
const WEIGHTS = {
  experience: 30,
  price: 25,
  timeline: 15,
  warranty: 15,
  teamAndApproach: 15,
};

const REFERENCE_YEAR = 2026;

function round(value) {
  return Math.round(value * 100) / 100;
}

function isValidNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function getName(proposal) {
  return proposal.data?.contractorName?.value ?? "Unknown contractor";
}

// function hasRecentExperience(period) {
//   if (typeof period !== "string") return false;

//   const text = period.toLowerCase();

//   if (/\b(?:last|past)\s+[1-5]\s+years?\b/.test(text)) {
//     return true;
//   }

//   const sinceYear = text.match(/\bsince\s+(\d{4})\b/);

//   return sinceYear
//     ? Number(sinceYear[1]) >= REFERENCE_YEAR - 5
//     : false;
// }

// function scoreExperience(data, notes) {
//   const experience = data.experience;

//   let score = 0;

//   const hasInstallations =
//     isValidNumber(experience.installationCount) &&
//     experience.installationCount > 0;

//   const recent = hasRecentExperience(experience.period);

//   if (hasInstallations && recent) {
//     // Baseline for qualifying commercial installations.
//     score = 50;

//     const evidence = experience.evidence ?? "";

//     const installationsOver100KW =
//       (isValidNumber(experience.maximumCapacityKW) &&
//         experience.maximumCapacityKW > 100) ||
//       /\b(?:over|above|greater than|>\s*)100\s*kw\b/i.test(evidence);

//     if (installationsOver100KW) {
//       score += 10;
//     }
//   } else {
//     notes.push(
//       "Recent qualifying installation experience needs confirmation."
//     );
//   }

//   if (isValidNumber(experience.warehouseInstallations)) {
//     if (experience.warehouseInstallations >= 3) {
//       score += 10;
//     } else if (experience.warehouseInstallations >= 1) {
//       score += 5;
//     }
//   } else {
//     // Missing warehouse evidence gets no bonus, not automatic rejection.
//     notes.push(
//       "Warehouse installation count is not stated; no warehouse bonus awarded."
//     );
//   }

//   return Math.min(score, 100);
// }


function hasRecentExperience(period) {
  if (typeof period !== "string") return false;

  const text = period.toLowerCase();

  // Accept numeric and written forms, e.g. "last 5 years"
  // and "within the past five years".
  if (
    /\b(?:last|past|within the last|within the past|in the last|in the past)\s+(?:[1-5]|one|two|three|four|five)\s+years?\b/.test(text)
  ) {
    return true;
  }

  const sinceYear = text.match(/\bsince\s+(\d{4})\b/);

  // "Since 2020" overlaps the assessment's five-year window,
  // but exact qualifying dates may still need human confirmation.
  return sinceYear
    ? Number(sinceYear[1]) >= REFERENCE_YEAR - 6
    : false;
}

function scoreExperience(data, notes) {
  const experience = data.experience ?? {};
  let rawScore = 0;

  const hasInstallations =
    isValidNumber(experience.installationCount) &&
    experience.installationCount > 0;

  const recent = hasRecentExperience(experience.period);

  const evidence = experience.evidence ?? "";

  const has100KWInstallations =
    (isValidNumber(experience.minimumCapacityKW) &&
      experience.minimumCapacityKW >= 100) ||
    /\b(?:at least|minimum(?: of)?|>=|≥)\s*100\s*kw\b/i.test(evidence) ||
    /\b100\s*kw\s*(?:or more|and above|and over)\b/i.test(evidence);


    const hasOver100KWInstallations =
  (isValidNumber(experience.maximumCapacityKW) &&
    experience.maximumCapacityKW > 100) ||
  /\b(?:over|above|greater than)\s*100\s*kw\b/i.test(evidence) ||
  />\s*100\s*kw\b/i.test(evidence);

  if (hasInstallations && recent && has100KWInstallations) {
    rawScore = 50;

    if (hasOver100KWInstallations) {
      rawScore += 10;
    }
  } else {
    notes.push(
      "Confirm the number, capacity, and dates of qualifying commercial installations."
    );
  }

  if (isValidNumber(experience.warehouseInstallations)) {
    rawScore +=
      Math.min(3, Math.max(0, experience.warehouseInstallations)) * 5;
  }

  // Maximum possible raw score: 50 + 10 + 15 = 75.
  // Normalize it to 100 so the 30% criterion weight is meaningful.
  return round((rawScore / 75) * 100);
}

function scorePrice(data, lowestEligiblePrice, notes) {
  const price = data.price?.amount;

  if (
    !isValidNumber(price) ||
    price <= 0 ||
    !isValidNumber(lowestEligiblePrice)
  ) {
    notes.push("A valid total bid price is needed for price scoring.");
    return 0;
  }

  if (data.price.currency !== "CAD") {
    notes.push("Confirm that the bid price is in CAD.");
    return 0;
  }

  return Math.min(100, round((lowestEligiblePrice / price) * 100));
}

function scoreTimeline(data, shortestEligibleTimeline, notes) {
  const weeks = data.timeline?.completionWeeks;

  if (
    !isValidNumber(weeks) ||
    weeks <= 0 ||
    !isValidNumber(shortestEligibleTimeline)
  ) {
    notes.push("A stated completion timeline is needed for scoring.");
    return 0;
  }

  if (weeks > 16) {
    notes.push("The proposed timeline exceeds the 16-week project limit.");
    return 0;
  }

  return Math.min(
    100,
    round((shortestEligibleTimeline / weeks) * 100)
  );
}

function scoreWarranty(data, notes) {
  const panelYears = data.panelWarranty?.years;
  const workmanshipYears = data.workmanshipWarranty?.years;

  const panelKnown =
    isValidNumber(panelYears) && panelYears >= 0;

  const workmanshipKnown =
    isValidNumber(workmanshipYears) && workmanshipYears >= 0;

  let score = 0;

  // Award the 50-point base only when both warranties are stated.
  if (panelKnown && workmanshipKnown) {
    score = 50;
  } else {
    notes.push(
      "Both panel and workmanship warranty durations need confirmation."
    );
  }

  if (panelKnown) {
    score += Math.min(panelYears, 25);
  }

  if (workmanshipKnown) {
    score += Math.min(workmanshipYears, 25);
  }

  return Math.min(score, 100);
}

function scoreTeamAndApproach(data, notes) {
  const team = data.teamAndApproach;
  let score = 0;

  if (team.namedProjectLead === true) {
    score += 25;
  } else {
    notes.push("Named project lead needs confirmation.");
  }

  if (isValidNumber(team.crewSize) && team.crewSize >= 0) {
    score += Math.max(0, 25 - 2 * Math.max(0, 6 - team.crewSize));
  } else {
    notes.push("Crew size is not stated.");
  }

  if (team.safetyPlan === true) {
    score += 25;
  } else {
    notes.push("Safety plan needs confirmation.");
  }

  if (
    isValidNumber(team.monitoringMonths) &&
    team.monitoringMonths > 0
  ) {
    score += Math.min(
      25,
      10 + Math.floor(team.monitoringMonths / 6) * 2.5
    );
  } else {
    notes.push("Monitoring plan duration is not stated.");
  }

  return Math.min(score, 100);
}

export function scoreProposals(proposals) {
  // Only bids that pass mandatory eligibility checks set the
  // comparison baselines. A flagged bid cannot set the baseline.
  const eligible = proposals.filter(
    (proposal) => proposal.eligibility?.status === "eligible"
  );

  const prices = eligible
    .map((proposal) => proposal.data.price?.amount)
    .filter((price) => isValidNumber(price) && price > 0);

  const timelines = eligible
    .map((proposal) => proposal.data.timeline?.completionWeeks)
    .filter((weeks) => isValidNumber(weeks) && weeks > 0 && weeks <= 16);

  const lowestEligiblePrice =
    prices.length > 0 ? Math.min(...prices) : null;

  const shortestEligibleTimeline =
    timelines.length > 0 ? Math.min(...timelines) : null;

  const results = proposals.map((proposal) => {
    const data = proposal.data;
    const eligibilityStatus = proposal.eligibility?.status;

    const notes = [...(data.uncertainties ?? [])];

    if (eligibilityStatus === "flagged") {
      notes.push("Mandatory eligibility evidence requires human review.");
    }

    if (eligibilityStatus === "ineligible") {
      return {
        contractorName: getName(proposal),
        status: "ineligible",
        rank: null,
        score: null,
        provisionalScore: null,
        criterionScores: null,
        reviewNotes: notes,
      };
    }

    if (eligibilityStatus !== "eligible") {
      notes.push("Eligibility status is missing or invalid.");

      return {
        contractorName: getName(proposal),
        status: "flagged",
        rank: null,
        score: null,
        provisionalScore: null,
        criterionScores: null,
        reviewNotes: notes,
      };
    }

    const criterionScores = {
      experience: scoreExperience(data, notes),
      price: scorePrice(data, lowestEligiblePrice, notes),
      timeline: scoreTimeline(data, shortestEligibleTimeline, notes),
      warranty: scoreWarranty(data, notes),
      teamAndApproach: scoreTeamAndApproach(data, notes),
    };

    const weightedScores = Object.fromEntries(
      Object.entries(criterionScores).map(([criterion, score]) => [
        criterion,
        round((score * WEIGHTS[criterion]) / 100),
      ])
    );

    const reason = [
      `Experience: ${criterionScores.experience}/100`,
      `price: ${criterionScores.price}/100`,
      `timeline: ${criterionScores.timeline}/100`,
      `warranty: ${criterionScores.warranty}/100`,
      `team and approach: ${criterionScores.teamAndApproach}/100`,
    ].join("; ");

    const provisionalScore = round(
      Object.values(weightedScores).reduce(
        (total, score) => total + score,
        0
      )
    );

    const requiresReview =
      eligibilityStatus === "flagged" ||
      notes.some((note) =>
        /confirm.*(?:licence|license|eligibility|mandatory)|mandatory.*review/i.test(note)
      );

    const status = requiresReview ? "flagged" : "ranked";


    return {
      contractorName: getName(proposal),
      status,
      rank: null,
      // Final score is only assigned to ranked proposals.
      score: status === "ranked" ? provisionalScore : null,
      provisionalScore,
      criterionScores,
      weightedScores,
      reviewNotes: notes,
      requiresReview,
      reason
      
    };
  });

  const ranked = results
    .filter((result) => result.status === "ranked")
    .sort((a, b) => b.provisionalScore - a.provisionalScore);

  ranked.forEach((result, index) => {
    result.rank = index + 1;
  });

  return results;
}
