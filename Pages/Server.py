import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Hash, Volume2, Video, Plus, Users, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatArea from "../components/chat/ChatArea";

export default function Server() {
  const urlParams = new URLSearchParams(window.location.search);
  const serverId = urlParams.get("id");
  
  const [server, setServer] = useState(null);
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (serverId) {
      loadServerData();
    }
  }, [serverId]);

  const loadServerData = async () => {
    try {
      const [serverData, channelList, memberList] = await Promise.all([
        base44.entities.Server.filter({ id: serverId }),
        base44.entities.Channel.filter({ server_id: serverId }, "position"),
        base44.entities.ServerMember.filter({ server_id: serverId })
      ]);

      setServer(serverData[0]);
      setChannels(channelList);
      setMembers(memberList);
      
      if (channelList.length > 0 && !selectedChannel) {
        setSelectedChannel(channelList[0]);
      }
    } catch (error) {
      console.error("Error loading server data:", error);
    }
  };

  const getChannelIcon = (type) => {
    switch (type) {
      case "voice": return <Volume2 className="w-4 h-4" />;
      case "video": return <Video className="w-4 h-4" />;
      default: return <Hash className="w-4 h-4" />;
    }
  };

  if (!server) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5865F2] mx-auto mb-4"></div>
          <p className="text-[#b5bac1]">Loading server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex">
      {/* Channel Sidebar */}
      <div className="w-60 bg-[#2b2d31] flex flex-col">
        <div className="h-12 px-4 flex items-center justify-between shadow-md border-b border-black/20">
          <h2 className="font-semibold text-[#f2f3f5] truncate">{server.name}</h2>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            <div className="mb-4">
              <div className="flex items-center justify-between px-2 py-1 mb-1">
                <span className="text-xs font-semibold text-[#949ba4] uppercase">
                  Text Channels
                </span>
              </div>
              {channels.filter(c => c.type === "text").map((channel) => (
                <div
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel)}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                    selectedChannel?.id === channel.id
                      ? "bg-[#404249] text-white"
                      : "text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]"
                  }`}
                >
                  {getChannelIcon(channel.type)}
                  <span className="text-sm font-medium">{channel.name}</span>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between px-2 py-1 mb-1">
                <span className="text-xs font-semibold text-[#949ba4] uppercase">
                  Voice Channels
                </span>
              </div>
              {channels.filter(c => c.type !== "text").map((channel) => (
                <div
                  key={channel.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1] transition-colors"
                >
                  {getChannelIcon(channel.type)}
                  <span className="text-sm font-medium">{channel.name}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      {selectedChannel ? (
        <ChatArea channel={selectedChannel} />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#b5bac1]">Select a channel to start chatting</p>
        </div>
      )}

      {/* Members Sidebar */}
      <div className="w-60 bg-[#2b2d31] border-l border-black/20">
        <div className="h-12 px-4 flex items-center border-b border-black/20">
          <span className="text-xs font-semibold text-[#949ba4] uppercase">
            Members — {members.length}
          </span>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#35373c] cursor-pointer transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center text-sm font-semibold">
                  {member.username?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#f2f3f5] truncate">
                    {member.nickname || member.username}
                  </p>
                  <p className="text-xs text-[#949ba4] truncate">
                    {member.role}
                  </p>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}