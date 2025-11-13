import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Users, Plus, Settings, Hash, Volume2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Home() {
  const navigate = useNavigate();
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = async () => {
    try {
      const serverList = await base44.entities.Server.list("-created_date");
      setServers(serverList);
    } catch (error) {
      console.error("Error loading servers:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="h-12 px-4 flex items-center justify-between border-b border-black/20 shadow-sm">
        <h1 className="text-lg font-semibold text-[#f2f3f5]">Your Servers</h1>
        <Button
          onClick={() => navigate(createPageUrl("CreateServer"))}
          className="bg-[#5865F2] hover:bg-[#4752C4] text-white h-8"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Server
        </Button>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {servers.map((server) => (
              <Card
                key={server.id}
                onClick={() => navigate(createPageUrl("Server") + `?id=${server.id}`)}
                className="bg-[#2b2d31] border-[#1e1f22] hover:bg-[#35373c] transition-all cursor-pointer overflow-hidden group"
              >
                <div className="p-0">
                  <div className="h-24 bg-gradient-to-br from-[#5865F2] to-[#7289da] relative">
                    {server.icon_url && (
                      <img 
                        src={server.icon_url} 
                        alt={server.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#313338] flex items-center justify-center -mt-8 border-4 border-[#2b2d31] group-hover:border-[#35373c] transition-colors shadow-lg">
                        {server.icon_url ? (
                          <img src={server.icon_url} alt={server.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <span className="text-xl font-bold text-[#f2f3f5]">
                            {server.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <h3 className="font-semibold text-[#f2f3f5] truncate">
                          {server.name}
                        </h3>
                        <p className="text-sm text-[#b5bac1] truncate">
                          {server.description || "No description"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4 text-xs text-[#b5bac1]">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span>Online</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>Members</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {servers.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-full bg-[#2b2d31] flex items-center justify-center mx-auto mb-4">
                <Users className="w-12 h-12 text-[#b5bac1]" />
              </div>
              <h3 className="text-xl font-semibold text-[#f2f3f5] mb-2">
                No servers yet
              </h3>
              <p className="text-[#b5bac1] mb-6">
                Create your first server to get started
              </p>
              <Button
                onClick={() => navigate(createPageUrl("CreateServer"))}
                className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Server
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}