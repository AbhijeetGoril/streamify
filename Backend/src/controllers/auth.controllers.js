import User from "../modules/User.js";
import jwt from "jsonwebtoken";
import { StreamChat } from "stream-chat";
import { upsertUser } from "../lib/stream.js";


export async function signup(req, res) {
  const { email, fullName, password } = req.body;
  console.log("hello")
  try {
    if (!email || !fullName || !password) {
      return res.status(400).json({ message: "All filed is required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must have be at least 6 charactors" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "This email is already exits" });
    }
    const idx = Math.floor(Math.random() * 100) + 1;
    const profilePic = `https://avatar.iran.liara.run/public/${idx}.png`;
    // 2. Create new user (pre-save hook will hash password)
    const newUser = await User.create({
      email,
      fullName,
      password,
      profilePic,
    });
   
    //  Create user in Stream Chat
    await upsertUser({
      id:newUser._id.toString(),
      name:newUser.fullName,
      email:newUser.email,
      image:newUser.profilePic||""
    })

    // Create Stream token (frontend will use this)
    // const streamToken= streamClient.createToken(newUser._id.toString())

    
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      sameSite: "strict", // ✔ correct capitalization
      secure: process.env.NODE_ENV === "production", // works only on HTTPS
    });
    return res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server Error", error: error.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All filed is required" });
    }
    const user = await User.findOne({ email });
    console.log(user);
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