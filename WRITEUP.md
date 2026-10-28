# Design Write-up

## 1. AI vs. rules

I use AI to extract information from proposal PDFs, such as price, experience, timeline, warranty, and team details. AI is useful because different companies may present the same information in different ways.

I use normal code to check mandatory requirements, calculate scores, rank proposals, and generate the final output. These rules are fixed, so the same information should produce the same result. AI cannot change the scoring criteria or decide which company gets the contract.

## 2. Consistency and explainability

The system uses fixed scoring rules and weights to calculate scores. If the input data and criteria stay the same, the results should also stay the same. Since AI may extract information differently sometimes, saving the extracted data helps us check the results again.

Each proposal gets a score and a short reason explaining its position. Reviewers can also check individual scores and missing information. If information is missing, the system should not automatically treat it as a confirmed failure.

## 3. Human in the loop

A human reviewer checks proposals when important information is missing, unclear, or needs confirmation. The reviewer also makes the final decision and can disagree with the system's recommendation by giving a reason.

The system should keep records of the extracted information, scores, criteria version, and reviewer decisions so the results can be checked later. If a proposal contains instructions telling the AI to change its ranking, the system should ignore them and follow the actual evaluation criteria.

## 4. Changing criteria

Currently, the scoring criteria and weights are defined in the code, and criteria versioning is not implemented. In a future version, I would store them in a separate configuration file so an administrator could change them without modifying the scoring logic. The system would validate that the weights total 100% and save each change as a new version.

Previous results would remain saved with the criteria version used to calculate them. If a reviewer wanted to use new criteria, the system would calculate new scores while keeping the old results for comparison.

## 5. Risks and safeguards

- **Incorrect extraction:** AI might read a price or warranty incorrectly. Important information should be checked against the original proposal.
- **Invented information:** The system should only use information supported by the proposal. Missing information should not be treated as confirmed.
- **Prompt injection:** A proposal might contain instructions telling the AI to rank it first. The system should ignore these instructions and follow its own scoring rules.
- **Inconsistent results:** Fixed scoring rules, saved extracted data, and tests can help keep results consistent.
- **Unfair scoring:** Every proposal should be evaluated using the same criteria, without adding unrelated requirements.
- **Errors and API limits:** The system should handle invalid files and API errors properly. Saving successful extraction results can also reduce unnecessary API calls.
- **Relying only on scores:** Reviewers should be able to see the reasons and missing information behind each score. The system should help with the decision, not make the final award decision.