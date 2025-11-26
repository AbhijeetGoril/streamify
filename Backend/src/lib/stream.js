import { StreamChat } from "stream-chat";
import "dotenv/config"

const apiKey=process.env.STREAM_API_KEY
const apiSecret=process.env.STREAM_API_SECRET
if(!apiKey || !apiSecret){
  console.log("Stream api key or sercert is missing")
}

const streamClient=StreamChat.getInstance(apiKey,apiSecret)

export const upsertUser= async (userdata)=>{
  try {
    await streamClient.upsertUser(userdata)
    return userdata
  } catch (error) {
    console.log("Error upserting Stream user:",error)
  }
}

