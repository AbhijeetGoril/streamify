import express from "express";
import { getVideoToken } from "../controllers/chat.controllers.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/token", protectRoute, getVideoToken);

export default router;
