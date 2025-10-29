import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import apiRoutes from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { pingDatabase } from "./db/pool.js";

dotenv.config();

const app = express();
const PORT = process.env.APP_PORT || 4000;
const allowedOrigins = (process.env.ALLOW_ORIGIN || "*")
  .split(",")
  .map((value) => value.trim());

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: !allowedOrigins.includes("*"),
};

app.use(cors(corsOptions));
app.use(express.json());

app.get("/health", async (req, res) => {
  try {
    await pingDatabase();
    res.json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.use("/api", apiRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
