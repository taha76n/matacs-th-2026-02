
function normalize(value) {
  return typeof value === "string" ? value.trim() : "";
}

function getEvidenceText(field) {
  if (typeof field === "string") {
    return field.trim();
  }

  if (field && typeof field === "object") {
    return [
      normalize(field.value),
      normalize(field.evidence),
    ]
      .filter(Boolean)
      .join(" ");
  }

  return "";
}

function evaluateRequirement({
  evidence,
  positivePattern,
  negativePattern,
  missingMessage,
  failedMessage,
}) {
  const text = normalize(evidence);

  if (!text || /\bnot stated\b|\bunknown\b|\bno information\b/i.test(text)) {
    return {
      status: "flagged",
      reason: missingMessage,
      evidence: text || "No evidence extracted",
    };
  }

  // Explicitly confirmed failure takes priority.
  if (negativePattern.test(text)) {
    return {
      status: "ineligible",
      reason: failedMessage,
      evidence: text,
    };
  }

  if (positivePattern.test(text)) {
    return {
      status: "pass",
      reason: "Required evidence appears to be stated.",
      evidence: text,
    };
  }

  return {
    status: "flagged",
    reason: missingMessage,
    evidence: text,
  };
}

function evaluateLicence(licence) {
  const text = getEvidenceText(licence);

  const subcontractorOnly =
    /(?:subcontractor|sub-contractor)/i.test(text) &&
    !/\b(?:we hold|we have|bidder holds|bidder has|contractor holds|contractor has|our company holds|our company has)\b/i.test(text);

  if (subcontractorOnly) {
    return {
      status: "flagged",
      reason:
        "The proposal refers to a subcontractor's licence, but does not clearly confirm the bidder's own licence.",
      evidence: text,
    };
  }

  return evaluateRequirement({
    evidence: text,

    positivePattern:
      /\b(?:we hold|we have|bidder holds|bidder has|contractor holds|contractor has|our company holds|our company has)\b[\s\S]{0,100}\b(?:ontario electrical contractor licence|electrical contractor licence|ecra\/esa)\b|\b(?:ontario electrical contractor licence|electrical contractor licence|ecra\/esa)\b[\s\S]{0,100}\b(?:we hold|we have|bidder holds|bidder has|contractor holds|contractor has)\b/i,

    negativePattern:
      /\b(?:we do not hold|we don't hold|bidder does not hold|contractor does not hold|licence is not held by the bidder|no electrical contractor licence)\b/i,

    missingMessage:
      "The bidder's own Ontario electrical contractor licence is not clearly confirmed.",

    failedMessage:
      "The proposal explicitly indicates that the bidder does not hold the required licence.",
  });
}

function evaluateWsib(wsib) {
  return evaluateRequirement({
    evidence: getEvidenceText(wsib),

    positivePattern:
      /\b(?:current|valid|confirmed|provided|attached)\b[\s\S]{0,60}\bwsib\b|\bwsib\b[\s\S]{0,60}\b(?:clearance|certificate|confirmed|valid|current)\b/i,

    negativePattern:
      /\b(?:no wsib clearance|wsib clearance (?:is )?(?:not available|expired|invalid|denied)|wsib (?:is )?(?:not current|expired|invalid))\b/i,

    missingMessage:
      "WSIB clearance needs confirmation.",

    failedMessage:
      "The proposal explicitly indicates that the required WSIB clearance is not valid or available.",
  });
}

function evaluateInsurance(insurance) {
  const text = getEvidenceText(insurance);

  const hasRequiredAmount =
    /\$?\s*5\s*(?:million|m\b)/i.test(text) ||
    /\$?\s*5,000,000\b/.test(text);

  const hasLiabilityInsurance =
    /\bliability\b/i.test(text) &&
    /\binsurance\b/i.test(text);

  const explicitlyInsufficient =
    /\b(?:no liability insurance|liability insurance (?:is )?(?:not available|expired|invalid|less than \$?\s*5\s*(?:million|m\b)))\b/i.test(text);

  if (!text) {
    return {
      status: "flagged",
      reason: "Liability insurance evidence is missing.",
      evidence: "No evidence extracted",
    };
  }

  if (explicitlyInsufficient) {
    return {
      status: "ineligible",
      reason:
        "The proposal explicitly indicates that the required liability insurance is unavailable or insufficient.",
      evidence: text,
    };
  }

  if (hasRequiredAmount && hasLiabilityInsurance) {
    return {
      status: "pass",
      reason: "The proposal states $5M liability insurance.",
      evidence: text,
    };
  }

  return {
    status: "flagged",
    reason:
      "Confirm that liability insurance is at least $5M.",
    evidence: text,
  };
}

export function evaluateEligibility(proposal) {
  const checks = {
    ontarioElectricalLicence: evaluateLicence(proposal.licence),
    wsibClearance: evaluateWsib(proposal.wsib),
    liabilityInsurance: evaluateInsurance(proposal.insurance),
  };

  const results = Object.values(checks);

  let status = "eligible";

  if (results.some((check) => check.status === "ineligible")) {
    status = "ineligible";
  } else if (results.some((check) => check.status === "flagged")) {
    status = "flagged";
  }

  return {
    contractorName:
      proposal.contractorName?.value ?? "Unknown contractor",
    status,
    checks,
  };
}
