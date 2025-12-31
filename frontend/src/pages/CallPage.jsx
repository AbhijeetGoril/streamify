import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";

import { useAuthUser } from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getVideoToken } from "../api/video";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";
import { useNavigate, useParams } from "react-router-dom";

const VIDEO_API_KEY = import.meta.env.VITE_STREAM_VIDEO_API_KEY;

const CallPage = () => {
  const { callId } = useParams();
  const { authUser, isLoading } = useAuthUser();

  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const { data: tokenData } = useQuery({
    queryKey: ["streamVideoToken"],
    queryFn: getVideoToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    if (!tokenData?.token || !authUser || !callId) return;

    let videoClient;
    let callInstance;

    const initCall = async () => {
      try {
        videoClient = new StreamVideoClient({
          apiKey: VIDEO_API_KEY,
          user: {
            id: authUser._id,
            name: authUser.fullname,
            image: authUser.profilePic,
          },
          token: tokenData.token,
        });

        callInstance = videoClient.call("default", callId);
        await callInstance.join({ create: true });

        setClient(videoClient);
        setCall(callInstance);
      } catch (err) {
        console.error(err);
        toast.error("Could not join the call");
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();

    return () => {
      if (callInstance) callInstance.leave();
      if (videoClient) videoClient.disconnectUser();
    };
  }, [tokenData, authUser, callId]);

  if (isLoading || isConnecting) return <PageLoader />;

  if (!client || !call) {
    return (
      <div className="h-screen flex items-center justify-center">
        Failed to initialize call
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <CallUI />
      </StreamCall>
    </StreamVideo>
  );
};

export default CallPage;

/* ---------------- UI ---------------- */

const CallUI = () => {
  const navigate = useNavigate();
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      navigate("/");
    }
  }, [callingState, navigate]);

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Connecting…
      </div>
    );
  }

  return (
    <StreamTheme>
      <div className="h-screen w-screen bg-black flex flex-col">
        {/* MAIN VIDEO */}
        <div className="flex-1">
          <SpeakerLayout participantsBarPosition="none" />
        </div>

        {/* CONTROLS */}
        <div className="pb-6 flex justify-center">
          <CallControls />
        </div>
      </div>
    </StreamTheme>
  );
};
