import express from "express"
import { fotgotPassword, login, logout, onboard, resetPassword, signup, verifyEmail } from "../controllers/auth.controllers.js";
import { protectRoute } from "../middleware/auth.middleware.js";
const route=express.Router();

route.post("/login",login)

route.post("/signup",signup)

route.post("/logout",logout)

route.post("/onboarding",protectRoute,onboard)

route.get("/me",protectRoute,(req,res)=>{
  try {
    return res.status(200).json({success:true,user:req.user})
  } catch (error) {
    res.status(500).json({success:false,message:error.message})
  }
})

route.post("/forgot-password",fotgotPassword)
route.post("/reset-password/:token",resetPassword)

route.get("/verify-email/:token", verifyEmail);

export default route;