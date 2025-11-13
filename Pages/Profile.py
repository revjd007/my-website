import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, Save, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [status, setStatus] = useState("online");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bannerColor, setBannerColor] = useState("#5865F2");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setUsername(userData.username || "");
      setDisplayName(userData.display_name || "");
      setBio(userData.bio || "");
      setStatus(userData.status || "online");
      setAvatarUrl(userData.avatar_url || "");
      setBannerColor(userData.banner_color || "#5865F2");
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setAvatarUrl(file_url);
    } catch (error) {
      console.error("Error uploading avatar:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        username: username.trim(),
        display_name: displayName.trim(),
        bio: bio.trim(),
        status,
        avatar_url: avatarUrl,
        banner_color: bannerColor
      });
      await loadUserProfile();
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5865F2]"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Banner */}
        <Card className="bg-[#2b2d31] border-[#1e1f22] overflow-hidden mb-6">
          <div className="h-32" style={{ backgroundColor: bannerColor }} />
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16">
              <div className="relative">
                <Avatar className="w-32 h-32 border-8 border-[#2b2d31]">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="bg-[#5865F2] text-white text-3xl">
                    {username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={uploading}
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              <div className="flex-1 pb-2">
                <h1 className="text-2xl font-bold text-[#f2f3f5]">
                  {username || user.email?.split('@')[0]}
                </h1>
                <p className="text-[#949ba4]">{user.email}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Profile Form */}
        <Card className="bg-[#2b2d31] border-[#1e1f22] p-6">
          <h2 className="text-xl font-bold text-[#f2f3f5] mb-6">Edit Profile</h2>
          
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-xs font-semibold text-[#b5bac1] uppercase mb-2 block">
                  Username
                </Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="bg-[#1e1f22] border-[#1e1f22] text-[#f2f3f5]"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-[#b5bac1] uppercase mb-2 block">
                  Display Name
                </Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter display name"
                  className="bg-[#1e1f22] border-[#1e1f22] text-[#f2f3f5]"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-[#b5bac1] uppercase mb-2 block">
                Bio
              </Label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself"
                className="bg-[#1e1f22] border-[#1e1f22] text-[#f2f3f5] h-24"
                maxLength={200}
              />
              <p className="text-xs text-[#949ba4] mt-1">
                {bio.length}/200 characters
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-xs font-semibold text-[#b5bac1] uppercase mb-2 block">
                  Status
                </Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="bg-[#1e1f22] border-[#1e1f22] text-[#f2f3f5]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">🟢 Online</SelectItem>
                    <SelectItem value="away">🟡 Away</SelectItem>
                    <SelectItem value="busy">🔴 Busy</SelectItem>
                    <SelectItem value="offline">⚫ Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-[#b5bac1] uppercase mb-2 block">
                  Banner Color
                </Label>
                <Input
                  type="color"
                  value={bannerColor}
                  onChange={(e) => setBannerColor(e.target.value)}
                  className="bg-[#1e1f22] border-[#1e1f22] h-10 cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="bg-[#5865F2] hover:bg-[#4752C4] text-white w-full md:w-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}