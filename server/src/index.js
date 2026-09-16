import express from "express";
import cors from "cors";
import { GENRES, PORT, UPLOAD_DIR } from "./config.js";
import { initDb, waitForDb } from "./db.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import booksRouter from "./routes/books.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(UPLOAD_DIR));

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/api/genres", (_req, res) => {
  res.status(200).json({ items: GENRES });
});

app.use("/api/books", booksRouter);
app.use("/api", notFoundHandler);
app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  await waitForDb();
  await initDb();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`API listening on port ${PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
