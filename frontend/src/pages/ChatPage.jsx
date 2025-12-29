import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useAuthUser } from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getSteramToken } from "../api/user";
import { Chat, Channel, MessageList, MessageInput, ChannelHeader,Window, Thread } from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import { Video } from "lucide-react";
import "stream-chat-react/dist/css/v2/index.css";
import CallButton from "../components/CallButton";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const { authUser } = useAuthUser();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getSteramToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser || !targetUserId) return;

      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullname,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        const channelId = [authUser._id, targetUserId].sort().join("_");

        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();

        setChatClient(client);
        setChannel(currChannel);
      } catch (error) {
        toast.error("Chat connection failed");
      } finally {
        setLoading(false);
      }
    };

    initChat();

    return () => {
      if (chatClient) chatClient.disconnectUser();
    };
  }, [tokenData, authUser, targetUserId,chatClient]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#CFEED1]">
        Loading chat...
      </div>
    );
  }

  if (!chatClient || !channel) return null;


 
  const handleVideoCall=()=>{
      if(channel){
        const callurl=`${window.location.origin}/call/${channel.id}`
        channel.sendMessage({
          text:`I've started a video call. Join me here: ${callurl}`
        })
        toast.success("Video call link sent successifully")
      }
  }
  return (
    <div className="h-[93vh]">
        <Chat client={chatClient}>

          <Channel channel={channel}>
            <div className="w-full relative">
              <CallButton handleVideoCall={handleVideoCall}/>
              <Window>
                <ChannelHeader/>
                <MessageList/>
                <MessageInput/>
              </Window>
            </div>
            <Thread/>
          </Channel>
        </Chat>
    </div>
  );
};

export default ChatPage;
