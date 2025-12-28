import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useAuthUser } from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getSteramToken } from "../api/user";
import { Chat, Channel, MessageList, MessageInput } from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import { Video } from "lucide-react";
import "stream-chat-react/dist/css/v2/index.css";

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

  const members = Object.values(channel.state.members || {});
  const otherUser = members.find((m) => m.user?.id !== authUser._id)?.user;

  return (
    <div className="p-4 flex items-center justify-center bg-base-200 ">
      <div className="w-full max-w-6xl h-[85vh] bg-white rounded-lg shadow-2xl overflow-hidden">
        <Chat client={chatClient} theme="messaging light" >
            <Channel channel={channel} >
              <div className="w-full h-full flex flex-col ">
                <div className="flex items-center justify-between px-4 py-3 border-b border-base-200">
                    <div className="flex items-center gap-3">
                        <div  className="p-2 ring-2 ring-primary  rounded-full">
                          <img src={otherUser?.image} className="w-10 h-10"/>
                        </div>
                        <div>
                          <p className="font-semibold text-sm"> {otherUser?.name} </p>
                          <p className="text-xs text-gray-500"> {members.length} members, {members.length} online </p>
                        </div>
                    </div>
                    <button className=" px-3 p-2 rounded-2xl bg-primary text-base-content">
                      <Video/>
                    </button>
                </div>
                <div className="min-h-0">
                  <MessageList/>
                </div>
                <div>
                  <MessageInput  />
                </div>
              </div>
              
            </Channel>
            
        </Chat>
      </div>
    </div>
  );
};

export default ChatPage;
