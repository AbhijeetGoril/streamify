import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  DefaultCallLayout,
  CallControls,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { useAuthUser } from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getVideoToken } from "../api/video";

const CallPage = () => {
  const { callId } = useParams();
  const { authUser } = useAuthUser();

  const [videoClient, setVideoClient] = useState(null);
  const [call, setCall] = useState(null);

  const { data: tokenData, isLoading } = useQuery({
    queryKey: ["streamVideoToken"],
    queryFn: getVideoToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    if (!authUser || !tokenData?.token || !callId) return;

    const joinCall = async () => {
      const client = new StreamVideoClient({
        apiKey: import.meta.env.VITE_STREAM_VIDEO_API_KEY,
        user: {
          id: authUser._id,
          name: authUser.fullname,
          image: authUser.profilePic,
        },
        token: tokenData.token,
      });

      const newCall = client.call("default", callId);
      await newCall.join({ create: true });

      setVideoClient(client);
      setCall(newCall);
    };

    joinCall();

    return () => {
      if (call) call.leave();
      if (videoClient) videoClient.disconnectUser();
    };
  }, [authUser, tokenData, callId]);

  if (isLoading || !videoClient || !call) {
    return (
      <div className="h-screen flex items-center justify-center">
        Joining call…
      </div>
    );
  }

  return (
    <StreamVideo client={videoClient}>
      <StreamCall call={call}>
        <DefaultCallLayout />
        <CallControls />
      </StreamCall>
    </StreamVideo>
  );
};

export default CallPage;
