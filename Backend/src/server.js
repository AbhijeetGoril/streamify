import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import chatRoute from "./routes/chat.route.js";
import videoRoute from "./routes/video.route.js";
import { connectDb } from "./lib/db.js";

/* ---------------- ESM dirname fix ---------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(__dirname)
/* ---------------- Load .env ---------------- */
dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 5001;

/* ---------------- CORS ---------------- */
app.use(
  cors({
    origin: "https://streamify-4fuv.onrender.com",
    credentials: true,
  })
);


/* ---------------- Middlewares ---------------- */
app.use(express.json());
app.use(cookieParser());

/* ---------------- API Routes ---------------- */
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/chat", chatRoute);
app.use("/api/video", videoRoute);

/* ---------------- Serve Frontend (PROD) ---------------- */
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../../frontend/dist");
 

  app.use(express.static(frontendPath));

  // SPA fallback
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

/* ---------------- Start Server ---------------- */
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await connectDb();
});
