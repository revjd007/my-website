import React, { useState, useRef, useEffect } from "react";
import { Video, VideoOff, Mic, MicOff, Phone, Users, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function VideoCall() {
  const [inCall, setInCall] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCall = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setInCall(true);
    } catch (error) {
      console.error("Error accessing media devices:", error);
      alert("Unable to access camera/microphone. Please check permissions.");
    }
  };

  const endCall = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setInCall(false);
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  if (!inCall) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-[#2b2d31] border-[#1e1f22] p-8">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#5865F2] to-[#7289da] flex items-center justify-center mx-auto mb-4">
              <Video className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#f2f3f5] mb-2">
              Video Calls
            </h2>
            <p className="text-sm text-[#949ba4]">
              Start or join a video call room
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-xs font-semibold text-[#b5bac1] uppercase mb-2 block">
                Room Name
              </Label>
              <Input
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name..."
                className="bg-[#1e1f22] border-[#1e1f22] text-[#f2f3f5]"
              />
            </div>

            <Button
              onClick={startCall}
              className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white py-6"
            >
              <Video className="w-5 h-5 mr-2" />
              Start Call
            </Button>

            <div className="pt-4 border-t border-[#1e1f22]">
              <p className="text-xs text-[#949ba4] text-center">
                Note: This is a basic video call interface. For production use, integration with a WebRTC service like Agora, Twilio, or Daily.co would be required.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#1e1f22]">
      {/* Header */}
      <div className="h-14 px-6 flex items-center justify-between border-b border-black/20 bg-[#2b2d31]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
            <Video className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[#f2f3f5]">
              {roomName || "Video Call"}
            </h3>
            <p className="text-xs text-[#949ba4]">1 participant</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-[#949ba4] hover:text-[#f2f3f5]"
        >
          <Users className="w-4 h-4 mr-2" />
          Invite
        </Button>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-6">
        <div className="h-full grid grid-cols-1 gap-4">
          <Card className="relative bg-[#2b2d31] border-[#1e1f22] overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-sm text-white font-medium">You</span>
            </div>
            {!videoEnabled && (
              <div className="absolute inset-0 bg-[#2b2d31] flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-[#5865F2] flex items-center justify-center">
                  <VideoOff className="w-12 h-12 text-white" />
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Controls */}
      <div className="h-24 px-6 flex items-center justify-center gap-4 bg-[#2b2d31] border-t border-black/20">
        <Button
          onClick={toggleAudio}
          size="icon"
          className={`h-14 w-14 rounded-full ${
            audioEnabled
              ? "bg-[#35373c] hover:bg-[#404249]"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          {audioEnabled ? (
            <Mic className="w-6 h-6 text-white" />
          ) : (
            <MicOff className="w-6 h-6 text-white" />
          )}
        </Button>

        <Button
          onClick={toggleVideo}
          size="icon"
          className={`h-14 w-14 rounded-full ${
            videoEnabled
              ? "bg-[#35373c] hover:bg-[#404249]"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          {videoEnabled ? (
            <Video className="w-6 h-6 text-white" />
          ) : (
            <VideoOff className="w-6 h-6 text-white" />
          )}
        </Button>

        <Button
          onClick={endCall}
          size="icon"
          className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-600"
        >
          <Phone className="w-6 h-6 text-white rotate-135" />
        </Button>

        <Button
          size="icon"
          className="h-14 w-14 rounded-full bg-[#35373c] hover:bg-[#404249]"
        >
          <Monitor className="w-6 h-6 text-white" />
        </Button>
      </div>
    </div>
  );
}