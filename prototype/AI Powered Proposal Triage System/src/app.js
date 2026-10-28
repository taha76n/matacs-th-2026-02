import express from "express";
import proposalRoutes from "./routes/proposal.routes.js";

const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Proposal Triage API is running",
  });
});

app.use("/api/proposals", proposalRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

export default app;