import express from "express"
import { login, logout, onboard, signup } from "../controllers/auth.controllers.js";
import { protectRoute } from "../middleware/auth.middleware.js";
const route=express.Router();

route.post("/login",login)

route.post("/signup",signup)

route.post("/logout",logout)

route.post("/onboarding",protectRoute,onboard)

export default route;