import { StreamChat } from 'stream-chat';
import { StreamClient } from "@stream-io/node-sdk";
import 'dotenv/config'; // Add this at the very top

const serverClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

export const upsertUser = async (userData) => {
  try {
    await serverClient.upsertUser({
      id: userData.id,
      name: userData.name,
      image: userData.image || '',
      role: 'user'
    });
    
    
    return { success: true };
  } catch (error) {
    console.error('❌ Stream Chat error:', error.message);
    // Don't throw - allow app to continue without Stream Chat
    return { success: false, error: error.message };
  }
};

export const createToken = (userId) => {
  try {
    return serverClient.createToken(userId);
  } catch (error) {
    console.error('❌ Stream Chat token error:', error);
    return null;
  }
};

export const initializeStreamChat = async () => {
  try {
    const result = await serverClient.queryUsers({});
    
    return { connected: true };
  } catch (error) {
    console.error('❌ Stream Chat initialization error:', error);
    return { connected: false, error: error.message };
  }
};

export const streamVideoClient = new StreamClient(
  process.env.STREAM_VIDEO_API_KEY,
  process.env.STREAM_VIDEO_API_SECRET
);