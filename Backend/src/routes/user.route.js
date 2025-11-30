import express from"express"

import { protectRoute } from "../middleware/auth.middleware.js";
import { acceptFriendRequest, friendRequestReject, getFriendRequests, getMyFriends, getOutgoingRequests, getRecommendedUsers, sendFriendRequest } from "../controllers/user.controller.js";
import { verifyEmail } from "../controllers/auth.controllers.js";
const router =express.Router()

router.use(protectRoute)
router.get("/recommendedUsers", getRecommendedUsers)
router.get("/friends",getMyFriends)

router.post("/friends-request/:id",sendFriendRequest)
router.post("/friends-request/:id/accept",acceptFriendRequest)

router.get("/friends-request",getFriendRequests)
router.get("/outgoing-friend-request",getOutgoingRequests)
router.post("/reject-request/:requestId",friendRequestReject)

export default router;