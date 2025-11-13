import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

export default function DirectMessages() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadCurrentUser();
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUser && currentUser) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedUser, currentUser]);

  const loadCurrentUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading current user:", error);
    }
  };

  const loadUsers = async () => {
    try {
      const userList = await base44.entities.User.list();
      setUsers(userList);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const loadMessages = async () => {
    try {
      const sent = await base44.entities.DirectMessage.filter({
        sender_id: currentUser.id,
        receiver_id: selectedUser.id
      }, "created_date");

      const received = await base44.entities.DirectMessage.filter({
        sender_id: selectedUser.id,
        receiver_id: currentUser.id
      }, "created_date");

      const allMessages = [...sent, ...received].sort(
        (a, b) => new Date(a.created_date) - new Date(b.created_date)
      );
      setMessages(allMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      await base44.entities.DirectMessage.create({
        sender_id: currentUser.id,
        receiver_id: selectedUser.id,
        sender_username: currentUser.username || currentUser.email.split('@')[0],
        content: newMessage.trim()
      });
      setNewMessage("");
      await loadMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const filteredUsers = users.filter(u => 
    u.id !== currentUser?.id &&
    (u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 flex">
      {/* User List */}
      <div className="w-60 bg-[#2b2d31] flex flex-col border-r border-black/20">
        <div className="h-12 px-4 flex items-center border-b border-black/20">
          <h2 className="font-semibold text-[#f2f3f5]">Direct Messages</h2>
        </div>

        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#949ba4]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="bg-[#1e1f22] border-none text-[#f2f3f5] pl-9 h-8 text-sm"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                  selectedUser?.id === user.id
                    ? "bg-[#404249]"
                    : "hover:bg-[#35373c]"
                }`}
              >
                <div className="relative">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback className="bg-[#5865F2] text-white text-sm">
                      {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#2b2d31] ${
                    user.status === "online" ? "bg-green-500" :
                    user.status === "away" ? "bg-yellow-500" :
                    user.status === "busy" ? "bg-red-500" : "bg-gray-500"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#f2f3f5] truncate">
                    {user.username || user.display_name || user.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-[#949ba4] truncate">
                    {user.status || "offline"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      {selectedUser ? (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="h-12 px-4 flex items-center gap-3 border-b border-black/20 shadow-sm">
            <Avatar className="w-8 h-8">
              <AvatarImage src={selectedUser.avatar_url} />
              <AvatarFallback className="bg-[#5865F2] text-white text-sm">
                {selectedUser.username?.charAt(0).toUpperCase() || selectedUser.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-[#f2f3f5] text-sm">
                {selectedUser.username || selectedUser.display_name || selectedUser.email?.split('@')[0]}
              </h2>
              <p className="text-xs text-[#949ba4]">
                {selectedUser.status || "offline"}
              </p>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => {
                const isSent = message.sender_id === currentUser?.id;
                return (
                  <div key={message.id} className={`flex ${isSent ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] ${isSent ? "items-end" : "items-start"} flex flex-col gap-1`}>
                      <div className={`px-4 py-2 rounded-2xl ${
                        isSent
                          ? "bg-[#5865F2] text-white"
                          : "bg-[#2b2d31] text-[#dbdee1]"
                      }`}>
                        <p className="text-sm break-words">{message.content}</p>
                      </div>
                      <span className="text-xs text-[#949ba4] px-2">
                        {format(new Date(message.created_date), "h:mm a")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4">
            <form onSubmit={handleSendMessage} className="relative">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message ${selectedUser.username || selectedUser.email?.split('@')[0]}`}
                className="bg-[#383a40] border-none text-[#f2f3f5] pr-12 py-6 rounded-lg"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!newMessage.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#5865F2] hover:bg-[#4752C4] h-8 w-8 rounded-full"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-[#2b2d31] flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-[#949ba4]" />
            </div>
            <h3 className="text-xl font-semibold text-[#f2f3f5] mb-2">
              No conversation selected
            </h3>
            <p className="text-[#949ba4]">
              Choose a user from the list to start messaging
            </p>
          </div>
        </div>
      )}
    </div>
  );
}