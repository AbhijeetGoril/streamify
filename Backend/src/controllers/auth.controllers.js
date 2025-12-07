// controllers/authController.js
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../modules/User.js"; // ✅ Fixed import path
import { sendEmail } from "../utils/sendMail.js";
import { upsertUser } from "../lib/stream.js"; // ✅ Fixed import path

// Signup
export async function signup(req, res) {
  const { email, fullName, password } = req.body;

  try {
    if (!email || !fullName || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
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

    // Frontend verification URL
    const verifyURL = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;

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
      <p>If the button doesn't work, copy and paste this URL:</p>
      <p>${verifyURL}</p>
      <p>This link expires in 15 minutes.</p>
    `;

    const emailResult = await sendEmail(
      email,
      "Verify Your Email - Streamify",
      html
    );

    try {
      await upsertUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePic || "",
      });
    } catch (error) {
      console.error("Stream Chat error:", error);
      // Don't fail signup if Stream Chat fails
    }

    return res.status(201).json({
      success: true,
      message:
        "Signup successful! " +
        (emailResult.success
          ? "Verification email sent."
          : "Could not send verification email. Please use resend."),
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      },
      emailSent: emailResult.success,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

// Login
export async function login(req, res) {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first",
        requiresVerification: true,
        email: user.email,
      });
    }

    // Compare password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Create JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    // Set HTTP-only cookie
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: false, // on localhost always false
      sameSite: "lax", // allow frontend <-> backend ports
      domain: "localhost", // important for cross-port cookie
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
        isVerified: user.isVerified,
        isOnboarded: user.isOnboarded,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

// Verify Email
// Verify Email - FIXED VERSION
export async function verifyEmail(req, res) {
  try {
    const { token } = req.params;

    console.log("🔐 Verification attempt for token:", token);

    if (!token || token.length < 10) {
      return res.status(400).json({
        success: false,
        error: "INVALID_TOKEN",
        message: "Invalid verification token format",
      });
    }

    // First, try to find ANY user with this token (even if expired)
    const userWithToken = await User.findOne({ emailVerificationToken: token });

    if (!userWithToken) {
      // Token doesn't exist at all
      return res.status(400).json({
        success: false,
        error: "TOKEN_NOT_FOUND",
        message: "Verification token not found or already used",
      });
    }

    // Check if user is already verified
    if (userWithToken.isVerified) {
      console.log("ℹ️ User already verified:", userWithToken.email);
      return res.status(200).json({
        success: true,
        error: "ALREADY_VERIFIED",
        message: "Email already verified",
        user: {
          id: userWithToken._id,
          email: userWithToken.email,
          name: userWithToken.fullName,
          isVerified: true,
        },
      });
    }

    // Check if token expired
    if (
      userWithToken.emailVerificationExpires &&
      new Date(userWithToken.emailVerificationExpires) < new Date()
    ) {
      console.log("❌ Token expired for user:", userWithToken.email);
      return res.status(400).json({
        success: false,
        error: "TOKEN_EXPIRED",
        message: "Verification link has expired",
        email: userWithToken.email,
        expiresAt: userWithToken.emailVerificationExpires,
      });
    }

    // Verify the user
    userWithToken.isVerified = true;
    userWithToken.verifiedAt = new Date();
    userWithToken.emailVerificationToken = undefined;
    userWithToken.emailVerificationExpires = undefined;
    await userWithToken.save();

    console.log("✅ User verified successfully:", userWithToken.email);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        id: userWithToken._id,
        email: userWithToken.email,
        name: userWithToken.fullName,
        isVerified: true,
      },
    });
  } catch (error) {
    console.error("🔥 Verification error:", error);
    return res.status(500).json({
      success: false,
      error: "SERVER_ERROR",
      message: "Internal server error during verification",
    });
  }
}

// Resend Verification Email
export async function resendVerification(req, res) {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Check if previous token is still valid
    if (user.emailVerificationExpires > Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Previous verification link is still valid",
        expiresIn: user.emailVerificationExpires - Date.now(),
      });
    }

    // Generate new token
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const tokenExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Update user with new token
    user.emailVerificationToken = verifyToken;
    user.emailVerificationExpires = tokenExpire;
    user.verificationAttempts = (user.verificationAttempts || 0) + 1;
    await user.save();

    // Send new verification email
    const verifyURL = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;

    const html = `
      <h2>New Verification Link</h2>
      <p>Hello <b>${user.fullName}</b>,</p>
      <p>You requested a new verification link. Click below to verify:</p>
      <a href="${verifyURL}" target="_blank">
        <button style="padding:10px 20px; background:#4CAF50; color:white; border:none; border-radius:5px;">
          Verify Email
        </button>
      </a>
      <p>This link expires in 15 minutes.</p>
    `;

    const emailResult = await sendEmail(
      email,
      "New Verification Link - Streamify",
      html
    );

    return res.status(200).json({
      success: true,
      message: emailResult.success
        ? "New verification email sent successfully"
        : "Failed to send verification email",
      expiresAt: tokenExpire,
      emailSent: emailResult.success,
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// Check Verification Status
// Check Verification Status - Updated
export async function checkVerificationStatus(req, res) {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email }).select(
      "isVerified emailVerificationExpires fullName"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Calculate remaining time
    let expiresIn = 0;
    if (user.emailVerificationExpires) {
      const now = Date.now();
      expiresIn = Math.max(
        0,
        Math.floor((user.emailVerificationExpires - now) / 1000)
      );
    }

    return res.status(200).json({
      success: true,
      isVerified: user.isVerified,
      expiresIn: expiresIn, // Add this for frontend timer
      expiresAt: user.emailVerificationExpires,
      fullName: user.fullName,
    });
  } catch (error) {
    console.error("Check verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// Get Current User (Me)
export async function getCurrentUser(req, res) {
  try {
    const user = await User.findById(req.userId).select(
      "-password -emailVerificationToken -resetPasswordToken"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

// Logout
export async function logout(req, res) {
  try {
    // Clear the authToken cookie
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

// Forgot Password
export async function forgotPassword(req, res) {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // For security, don't reveal that user doesn't exist
      return res.status(200).json({
        success: true,
        message:
          "If your email exists in our system, you will receive a password reset link",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenExpire = Date.now() + 60 * 60 * 1000; // 1 hour

    // Update user with reset token
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = tokenExpire;
    await user.save();

    // Send reset email
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const html = `
      <h2>Reset Your Password</h2>
      <p>Hello <b>${user.fullName}</b>,</p>
      <p>You requested to reset your password. Click below to reset:</p>
      <a href="${resetURL}" target="_blank">
        <button style="padding:10px 20px; background:#4CAF50; color:white; border:none; border-radius:5px;">
          Reset Password
        </button>
      </a>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    const emailResult = await sendEmail(
      email,
      "Reset Your Password - Streamify",
      html
    );

    return res.status(200).json({
      success: true,
      message: emailResult.success
        ? "Password reset email sent successfully"
        : "Could not send reset email. Please try again.",
      emailSent: emailResult.success,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

// Reset Password
// Reset Password - Updated to handle GET (token verification) and POST (actual reset)
export async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Handle GET request (verify token)
    if (req.method === "GET") {
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired reset token",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Token is valid",
        email: user.email,
      });
    }

    // Handle POST request (reset password)
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password is required and must be at least 6 characters",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

// Onboard User
export async function onboard(req, res) {
  try {
    const userId = req.user._id; // ✅ Fixed: Use req.userId from auth middleware
    const { bio, nativeLanguage, learningLanguage, location } = req.body;

    if (!bio || !nativeLanguage || !learningLanguage || !location) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        missingFields: [
          !bio && "bio",
          !nativeLanguage && "nativeLanguage",
          !learningLanguage && "learningLanguage",
          !location && "location",
        ].filter(Boolean),
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        bio,
        nativeLanguage,
        learningLanguage,
        location,
        isOnboarded: true,
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    try {
      await upsertUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePic || "",
      });
    } catch (error) {
      console.error("Stream Chat error:", error);
      // Don't fail onboarding if Stream Chat fails
    }

    return res.status(200).json({
      success: true,
      user: updatedUser,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Onboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

// ❌ REMOVE THIS DUPLICATE FUNCTION - You already have forgotPassword above
// export async function fotgotPassword(req, res) { ... }
