import { StreamClient } from "@stream-io/node-sdk";
import 'dotenv/config';

export const streamVideoClient = new StreamClient(
  process.env.STREAM_VIDEO_API_KEY,
  process.env.STREAM_VIDEO_API_SECRET
);
