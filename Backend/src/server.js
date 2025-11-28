import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cookieParser from"cookie-parser"

// --------------------------------------------------
// 1. FIX FOR ESM (__dirname / __filename)
// --------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------------------------------------
// 2. FORCE dotenv TO LOAD THE CORRECT .env
// --------------------------------------------------
const envPath = path.join(__dirname, "../.env");



dotenv.config({ path: envPath });


import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import { connectDb } from "./lib/db.js";


const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(cookieParser())
app.use("/api/auth", authRoute);
app.use("/api/users",userRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDb();
});
