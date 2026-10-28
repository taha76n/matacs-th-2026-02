import { Router } from "express";
import {
  processProposal,
  getProposalStatus,
} from "../controllers/proposal.controller.js";

const router = Router();

router.post("/process", processProposal);
router.get("/:id", getProposalStatus);

export default router;