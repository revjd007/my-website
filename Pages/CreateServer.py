import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export default function CreateServer() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setIconUrl(file_url);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateServer = async () => {
    if (!name.trim()) return;

    setCreating(true);
    try {
      const user = await base44.auth.me();
      
      const server = await base44.entities.Server.create({
        name: name.trim(),
        description: description.trim(),
        icon_url: iconUrl,
        owner_id: user.id,
        is_public: isPublic
      });

      // Add creator as owner member
      await base44.entities.ServerMember.create({
        server_id: server.id,
        user_id: user.id,
        username: user.username || user.email.split('@')[0],
        role: "owner"
      });

      // Create default channels
      await base44.entities.Channel.bulkCreate([
        {
          server_id: server.id,
          name: "general",
          description: "General discussion",
          type: "text",
          position: 0
        },
        {
          server_id: server.id,
          name: "voice-chat",
          description: "Voice channel",
          type: "voice",
          position: 1
        }
      ]);

      navigate(createPageUrl("Server") + `?id=${server.id}`);
    } catch (error) {
      console.error("Error creating server:", error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="h-12 px-4 flex items-center gap-3 border-b border-black/20 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(createPageUrl("Home"))}
          className="text-[#b5bac1] hover:text-[#f2f3f5]"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold text-[#f2f3f5]">Create Server</h1>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-[#2b2d31] border-[#1e1f22] p-6">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#f2f3f5] mb-2">
                Customize your server
              </h2>
              <p className="text-sm text-[#b5bac1]">
                Give your server a personality with a name and icon
              </p>
            </div>

            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-[#313338] border-4 border-dashed border-[#4e5058] flex items-center justify-center overflow-hidden">
                  {iconUrl ? (
                    <img src={iconUrl} alt="Server icon" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="w-8 h-8 text-[#b5bac1]" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={uploading}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-xs font-semibold text-[#b5bac1] uppercase">
                  Server Name *
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Awesome Server"
                  className="bg-[#1e1f22] border-[#1e1f22] text-[#f2f3f5] mt-2"
                  maxLength={100}
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-[#b5bac1] uppercase">
                  Description
                </Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's your server about?"
                  className="bg-[#1e1f22] border-[#1e1f22] text-[#f2f3f5] mt-2 h-20"
                  maxLength={500}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => navigate(createPageUrl("Home"))}
                className="flex-1 bg-transparent border-[#4e5058] text-[#f2f3f5] hover:bg-[#35373c]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateServer}
                disabled={!name.trim() || creating}
                className="flex-1 bg-[#5865F2] hover:bg-[#4752C4] text-white"
              >
                {creating ? "Creating..." : "Create Server"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}