import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { 
  Home, MessageSquare, Video, Settings, 
  LogOut, User, Bot, Plus, Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [servers, setServers] = useState([]);

  useEffect(() => {
    loadUserData();
    loadServers();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const loadServers = async () => {
    try {
      const serverList = await base44.entities.Server.list();
      setServers(serverList);
    } catch (error) {
      console.error("Error loading servers:", error);
    }
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="flex h-screen bg-[#1e1f22] text-white overflow-hidden">
      <style>{`
        :root {
          --primary: #5865F2;
          --primary-dark: #4752C4;
          --bg-primary: #1e1f22;
          --bg-secondary: #2b2d31;
          --bg-tertiary: #313338;
          --text-primary: #f2f3f5;
          --text-secondary: #b5bac1;
        }
      `}</style>

      {/* Server List Sidebar */}
      <div className="w-[72px] bg-[#1e1f22] flex flex-col items-center py-3 gap-2 border-r border-black/20">
        <Link to={createPageUrl("Home")}>
          <div className="w-12 h-12 rounded-2xl bg-[#5865F2] hover:rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer group">
            <Home className="w-6 h-6" />
          </div>
        </Link>
        
        <div className="w-8 h-[2px] bg-[#35363c] rounded-full my-1" />
        
        <ScrollArea className="flex-1 w-full">
          <div className="flex flex-col items-center gap-2 px-3">
            {servers.map((server) => (
              <Link key={server.id} to={createPageUrl("Server") + `?id=${server.id}`}>
                <div className="w-12 h-12 rounded-3xl hover:rounded-xl transition-all duration-200 bg-[#313338] hover:bg-[#5865F2] flex items-center justify-center cursor-pointer overflow-hidden group">
                  {server.icon_url ? (
                    <img src={server.icon_url} alt={server.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-semibold">{server.name.charAt(0)}</span>
                  )}
                </div>
              </Link>
            ))}
            
            <button
              onClick={() => navigate(createPageUrl("CreateServer"))}
              className="w-12 h-12 rounded-3xl hover:rounded-xl transition-all duration-200 bg-[#313338] hover:bg-[#23a559] flex items-center justify-center cursor-pointer group"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </ScrollArea>
      </div>

      {/* Main Navigation Sidebar */}
      <div className="w-60 bg-[#2b2d31] flex flex-col">
        <div className="h-12 px-4 flex items-center shadow-md border-b border-black/20">
          <h2 className="font-semibold text-[#f2f3f5] truncate">
            {currentPageName === "Home" ? "Home" : "Navigation"}
          </h2>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            <Link to={createPageUrl("Home")}>
              <div className={`flex items-center gap-3 px-2 py-2 rounded-md hover:bg-[#35373c] cursor-pointer transition-colors ${
                location.pathname === createPageUrl("Home") ? "bg-[#404249] text-white" : "text-[#b5bac1]"
              }`}>
                <Home className="w-5 h-5" />
                <span className="font-medium">Home</span>
              </div>
            </Link>

            <Link to={createPageUrl("DirectMessages")}>
              <div className={`flex items-center gap-3 px-2 py-2 rounded-md hover:bg-[#35373c] cursor-pointer transition-colors ${
                location.pathname === createPageUrl("DirectMessages") ? "bg-[#404249] text-white" : "text-[#b5bac1]"
              }`}>
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium">Direct Messages</span>
              </div>
            </Link>

            <Link to={createPageUrl("AIAssistant")}>
              <div className={`flex items-center gap-3 px-2 py-2 rounded-md hover:bg-[#35373c] cursor-pointer transition-colors ${
                location.pathname === createPageUrl("AIAssistant") ? "bg-[#404249] text-white" : "text-[#b5bac1]"
              }`}>
                <Bot className="w-5 h-5" />
                <span className="font-medium">AI Assistant</span>
              </div>
            </Link>

            <Link to={createPageUrl("VideoCall")}>
              <div className={`flex items-center gap-3 px-2 py-2 rounded-md hover:bg-[#35373c] cursor-pointer transition-colors ${
                location.pathname === createPageUrl("VideoCall") ? "bg-[#404249] text-white" : "text-[#b5bac1]"
              }`}>
                <Video className="w-5 h-5" />
                <span className="font-medium">Video Calls</span>
              </div>
            </Link>

            <Link to={createPageUrl("Profile")}>
              <div className={`flex items-center gap-3 px-2 py-2 rounded-md hover:bg-[#35373c] cursor-pointer transition-colors ${
                location.pathname === createPageUrl("Profile") ? "bg-[#404249] text-white" : "text-[#b5bac1]"
              }`}>
                <User className="w-5 h-5" />
                <span className="font-medium">Profile</span>
              </div>
            </Link>
          </div>
        </ScrollArea>

        {/* User Panel */}
        <div className="h-[52px] bg-[#232428] px-2 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.avatar_url} />
              <AvatarFallback className="bg-[#5865F2] text-white text-sm">
                {user?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#f2f3f5] truncate">
                {user?.username || user?.display_name || user?.email?.split('@')[0] || "User"}
              </p>
              <p className="text-xs text-[#b5bac1] truncate">
                {user?.status || "online"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#b5bac1] hover:text-[#f2f3f5] hover:bg-[#35373c]"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-[#313338] overflow-hidden">
        {children}
      </div>
    </div>
  );
}