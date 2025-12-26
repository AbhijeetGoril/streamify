import { axiosInstance } from "../lib/axois.js";

export async function getUserFriends() {
  try {
    const res = await axiosInstance.get("/users/friends");
    return res.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "get friend failed"
    );
  }
}

export async function getRecommededUsers() {
  try {
    console.log("hl")
    const res = await axiosInstance.get("/users/recommendedUsers");
    return res.data;
  } catch (error) {
    console.log(error.message)
    throw new Error(
      error.response?.data?.message || "get friend failed"
    );
  }
}

export async function getOutGoingFrindsreq() {
  try {
    const res = await axiosInstance.get("/users/outgoing-friend-request");
    return res.data;
  } catch (error) {
  
    throw new Error(
      error.response?.data?.message || "get friend failed"
    );
  }
}

export async function sendFrindRequest(id) {
  try {
    const res = await axiosInstance.post(`/users/friends-request/${id}`);
    return res.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "get friend failed"
    );
  }
}

export async function incommingFrinedReq() {
  try {
    const res = await axiosInstance.get("/users/friends-request");
    return res.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "incomming friend req failed"
    );
  }
}