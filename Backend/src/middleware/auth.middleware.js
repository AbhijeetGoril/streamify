import jwt from "jsonwebtoken"
import User from "../modules/User.js"
import { sendEmail } from "../utils/sendMail.js"

export const protectRoute=async(req,res,next)=>{
  try {
    const token=req.cookies.authToken

    if(!token){
      return res.status(401).json({success: false,message:"Unauthorized - no token provided"})
    }
    const decode=jwt.verify(token,process.env.JWT_SECRET_KEY)
    if(!decode){
      return res.status(401).json({success: false,message:"Unauthorized - Invalid token"})
    }
    
    const user =await User.findById(decode.userId).select("-password")
    console.log(user)
    if(!user){
      return res.status(401).json({success: false,message:"Unauthorized - user not foundss"})
    }
      if (!user.isVerified) {

      // Generate new verification token
      const verifyToken = crypto.randomBytes(32).toString("hex");
      user.emailVerificationToken = verifyToken;
      user.emailVerificationExpires = Date.now() + 15 * 60 * 1000;

      await user.save();

      // Create link
      const verifyURL = `${process.env.CLIENT_URL}/api/auth/verify-email/${verifyToken}`;

      // Email HTML
      const html = `
        <h2>Email Verification Required</h2>
        <p>Hello <b>${user.fullName}</b>,</p>
        <p>You tried to access protected content but your email is still not verified.</p>
        <p>Click the button below to verify your email:</p>
        <a href="${verifyURL}">
          <button style="padding:10px 20px;background:#4CAF50;color:white;border:none;border-radius:5px;">
            Verify Email
          </button>
        </a>
      `;

      // Send email (using your mail function)
      await sendEmail(user.email, "Verify Your Email", html);

      return res.status(401).json({
        success: false,
        message: "Email not verified. A new verification link was sent to your email.",
      });
    }
    req.user=user
    next()
  } catch (error) {
    console.log(error)
    res.status(500).json({message:"Internal Server error",error:error.message})
  }
}