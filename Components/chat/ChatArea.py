import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Hash, Send, Plus, Smile, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

export default function ChatArea({ channel }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState(null);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (channel) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [channel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const loadMessages = async () => {
    try {
      const messageList = await base44.entities.Message.filter(
        { channel_id: channel.id },
        "created_date",
        100
      );
      setMessages(messageList);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await base44.entities.Message.create({
        channel_id: channel.id,
        user_id: user.id,
        username: user.username || user.email.split('@')[0],
        content: newMessage.trim()
      });
      setNewMessage("");
      await loadMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#313338]">
      {/* Channel Header */}
      <div className="h-12 px-4 flex items-center gap-2 border-b border-black/20 shadow-sm">
        <Hash className="w-5 h-5 text-[#949ba4]" />
        <h2 className="text-lg font-semibold text-[#f2f3f5]">{channel.name}</h2>
        {channel.description && (
          <>
            <div className="w-px h-5 bg-[#4e5058] mx-2" />
            <p className="text-sm text-[#949ba4]">{channel.description}</p>
          </>
        )}
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message, index) => {
            const showAvatar = index === 0 || messages[index - 1].user_id !== message.user_id;
            const messageTime = new Date(message.created_date);

            return (
              <div key={message.id} className={showAvatar ? "mt-4" : "mt-1"}>
                {showAvatar ? (
                  <div className="flex gap-3 hover:bg-[#2e3035] px-4 py-1 -mx-4 rounded transition-colors">
                    <Avatar className="w-10 h-10 mt-0.5">
                      <AvatarFallback className="bg-[#5865F2] text-white text-sm">
                        {message.username?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-semibold text-[#f2f3f5] text-sm">
                          {message.username || "User"}
                        </span>
                        <span className="text-xs text-[#949ba4]">
                          {format(messageTime, "h:mm a")}
                        </span>
                      </div>
                      <p className="text-[#dbdee1] text-sm leading-relaxed break-words">
                        {message.content}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 hover:bg-[#2e3035] px-4 py-0.5 -mx-4 rounded transition-colors group">
                    <div className="w-10 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="text-xs text-[#949ba4]">
                        {format(messageTime, "h:mm")}
                      </span>
                    </div>
                    <p className="flex-1 text-[#dbdee1] text-sm leading-relaxed break-words">
                      {message.content}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4">
        <form onSubmit={handleSendMessage} className="relative">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message #${channel.name}`}
            className="bg-[#383a40] border-none text-[#f2f3f5] pr-24 py-6 rounded-lg"
            disabled={sending}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <Button
              type="submit"
              size="icon"
              disabled={!newMessage.trim() || sending}
              className="bg-[#5865F2] hover:bg-[#4752C4] h-8 w-8 rounded-full"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}