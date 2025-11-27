import FriendRequest from "../modules/friendRequest.js";
import User from "../modules/User.js";

export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const excludeList = [
      currentUserId,
      ...(currentUser.friends || []),
      ...(currentUser.blocked || []),
    ];

    const recommendedFriends = await User.find({
      _id: { $nin: excludeList },
      isOnboarded: true,
    });
    return res.status(200).json(recommendedFriends);
  } catch (error) {
    console.error("Error in getRecommendedUsers:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
}
export async function getMyFriends(req, res) {
  try {
    const currentUserId = req.user.id;

    const recommendedFriends = await User.findById(currentUserId)
      .select("friends")
      .populate(
        "friends",
        "fullName bio profilePic nativeLanguage learningLanguage"
      );

    if (!recommendedFriends) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(recommendedFriends);
  } catch (error) {
    console.error("Error in getMyFriends:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function sendFriendRequest(req, res) {
  try {
    const myId = req.user.id;
    const { id: recipientId } = req.params;
    if (myId == recipientId) {
      return res
        .status(400)
        .json({ message: "You can't send friend to your self" });
    }
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res
        .status(404)
        .json({ message: "Recipient does not exist"  });
    }
    if(recipient.friends.includes(myId)){
      return res
        .status(400)
        .json({ message: "You are already friends" });
    }

    const existingRequest=await FriendRequest.findOne({
      $or:[
        {sender:myId,recipient:recipientId},
        {sender:recipientId,recipient:myId}
      ]
    })
    if(existingRequest){
      return res.status(400).json({message:"This friend request is already exists"})
    }
    const friendRequest=await FriendRequest.create({
      sender:myId,
      recipient:recipientId
    })
    return res.status(201).json(friendRequest);
  } catch (error) {
    console.error("Error in send the request:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function acceptFriendRequest(req, res) {
  try {
    const { id: friendRequestId } = req.params;
    const userId=req.user.id
    const friendRequest=await FriendRequest.findById(friendRequestId)
    if(!friendRequest){
        return res.status(404).json({message:"This friend request does not exists"})
    }
    if(userId!=friendRequest.recipient.toString()){
      return res.status(400).json({message:" Unauthorized Access"})
    }
    const sender=await User.findById(friendRequest.sender)
    if(!sender){
      return res.status(404).json({message:"Sender does not exists"})
    }
    const recipient=await User.findById(friendRequest.recipient)

    if(!recipient){
      return res.status(404).json({message:"Recipient does not exists"})
    }

    if (sender.friends.includes(recipient._id)) {
      return res.status(400).json({ message: "You are already friends" });
    }
    sender.friends.push(recipient._id)
    recipient.friends.push(sender._id)
    friendRequest.status="accepted"
    await sender.save();
    await recipient.save();
    await friendRequest.save()
    return res.status(200).json({
      "Sender friend": sender.friends,
      "Recipient friend": recipient.friends,
      friendRequest,
      message: "Friend request accepted successfully",
    });
  } catch (error) {
    console.error("Error in send the request:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function getFriendRequests(req,res){
  try {
    const incommingRequest=await FriendRequest.find({
      recipient:req.user.id,
      status:"pending"
    }).populate("sender","fullName profilePic nativeLanguage learningLanguage")

    const acceptedRequest= await FriendRequest.find({
      sender:req.user.id,
      status:"accepted"
    }).populate("recipient","fullName profilePic")
    return res.status(200).json({incommingRequest,acceptedRequest})

  } catch (error) {
    console.error("Error in get the request:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}