import asyncHandler from "../utils/asyncHandler.js";

export const processProposal = asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: "Proposal processing is not implemented yet",
  });
});

export const getProposalStatus = asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: "Proposal status lookup is not implemented yet",
  });
});