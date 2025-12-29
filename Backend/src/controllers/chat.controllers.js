import { createToken, streamVideoClient } from "../lib/stream.js";

export async function getStreamToken(req,res) {
  try {
    const token=await createToken(req.user.id)
    res.status(200).json({token})
  } catch (error) {
    console.error("Error in getStreamToken Controller:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function getVideoToken(req,res) {
  try {
    const userId=req.user._id.toString();
    const token= streamVideoClient.createToken(userId)
    res.status(200).json({token})
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to generate video token",
    });
  }
}