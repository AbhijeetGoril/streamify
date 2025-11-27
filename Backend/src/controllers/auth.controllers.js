import User from "../modules/User.js";
import jwt from "jsonwebtoken";
import { upsertUser } from "../lib/stream.js";
import crypto from "crypto";
import nodemailer from "nodemailer";



export async function signup(req, res) {
  const { email, fullName, password } = req.body;

  try {
    if (!email || !fullName || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Generate a random avatar
    const idx = Math.floor(Math.random() * 100) + 1;
    const profilePic = `https://avatar.iran.liara.run/public/${idx}.png`;

    // Generate email verification token
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const tokenExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Create user
    const newUser = await User.create({
      email,
      fullName,
      password,
      profilePic,
      isVerified: false,
      emailVerificationToken: verifyToken,
      emailVerificationExpires: tokenExpire,
    });

    // Backend verification URL
    const verifyURL = `http://localhost:5001/api/auth/verify-email/${verifyToken}`;

    // Setup nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
       user: "abhijeetgorilz@gmail.com", 
      pass: "tmeueuuopvppgkaq", 
      },
    });

    // Email HTML content
    const html = `
      <h2>Verify Your Email</h2>
      <p>Hello <b>${fullName}</b>,</p>
      <p>Click the button below to verify your email:</p>
      <a href="${verifyURL}" target="_blank">
        <button style="padding:10px 20px; background:#4CAF50; color:white; border:none; border-radius:5px;">
          Verify Email
        </button>
      </a>
      <p>If the button doesn’t work, copy and paste this URL:</p>
      <p>${verifyURL}</p>
      <p>This link expires in 15 minutes.</p>
    `;

    // Send email
    await transporter.sendMail({
      from: `"Streamify" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Email - Streamify",
      html,
    });

    return res.status(201).json({
      success: true,
      message: "Signup successful! Verification email sent.",
      verifyURL, // shows in postman for testing
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
      },
    });

  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

export async function verifyEmail(req, res) {
  try {
    const { token } = req.params;

    // Find user with valid token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification token"
      });
    }

    // Mark as verified
    user.isVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully!"
    });

  } catch (error) {
    console.error("Verify email error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}



export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All filed is required" });
    }
    const user = await User.findOne({ email });
    if(!user.$isValid){
      ret
    }

    if (!user) {
      return res.status(401).json({ message: "Email or password is invalid" });
    }
    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 24,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production", // works only on HTTPS
    });

    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server Error", error: error.message });
  }
}

export async function logout(req, res) {
  try {
    res.cookie("jwt", "", {
      maxAge: 0,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

export async function onboard(req, res) {
  try {
    const userId=req.user._id;
    const {fullName,bio,nativeLanguage,learningLanguage,location}=req.body
    if(!fullName || !bio || !nativeLanguage || !learningLanguage|| !location){
      return res.status(400).json({
        message:"All fiedls are required",
        missingFields:[
          !fullName && "fullName",
          !bio && "bio",
          !nativeLanguage &&"nativeLanguage",
          !learningLanguage && "learningLanguage",
          !location&& "location"
        ].filter(Boolean)
      })
    }
    const updateduser=await User.findByIdAndUpdate(userId,{
      fullName,
      bio,
      location,
      learningLanguage,
      nativeLanguage,
      isOnboarded:true
    },{new:true})
    if(!updateduser){
      return res.status(404).json({message:"User not found"})
    }
    try {
      await upsertUser({
        id:updateduser._id.toString(),
        name:updateduser.fullName,
        image:updateduser.profilePic||""
      })

    } catch (error) {
      return res.status(401).json({message:"Error while update the user on stream chat ",errors:error.message})
    }
    res.status(200).json({success:true,updateduser})
  } catch (error) {
    res.status(500).json({message:error.message})
  }
}


