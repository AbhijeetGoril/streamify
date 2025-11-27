import express from"express"

import { protectRoute } from "../middleware/auth.middleware.js";
import { acceptFriendRequest, getFriendRequests, getMyFriends, getRecommendedUsers, sendFriendRequest } from "../controllers/user.controller.js";
const router =express.Router()

router.use(protectRoute)
router.get("/recommendedUsers", getRecommendedUsers)
router.get("/friends",getMyFriends)

router.post("/friends-request/:id",sendFriendRequest)
router.post("/friends-request/:id/accept",acceptFriendRequest)

router.get("/friends-request",getFriendRequests)

export default router;