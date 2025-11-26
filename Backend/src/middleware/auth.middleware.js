import jwt from "jsonwebtoken"
import User from "../modules/User.js"

export const protectRoute=async(req,res,next)=>{
  try {
    const token=req.cookies.jwt
    if(!token){
      return res.state(401).json({message:"Unauthorized - no token provided"})
    }
    const decode=jwt.verify(token,process.env.JWT_SECRET_KEY)
    if(!decode){
      return res.status(401).json({message:"Unauthorized - Invalid token"})
    }
    const user =await User.findById(decode.userId)
    if(!user){
      return res.status(401).json({message:"Unauthorized - user not found"})
    }
    req.user=user
  } catch (error) {
    res.state(500).json({message:"Internal Server error"})
  }
}