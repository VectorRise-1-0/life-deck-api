import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";

const app = express();

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    env: process.env.NODE_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);

export default app;
