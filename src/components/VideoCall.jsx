import { useEffect, useRef, useState } from 'react'
import { FiX, FiVideo, FiVideoOff, FiMic, FiMicOff } from 'react-icons/fi'

function VideoCall({ roomId, onEnd, socket }) {
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const [localStream, setLocalStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [peers, setPeers] = useState(new Map())
  const pcRef = useRef(null)

  useEffect(() => {
    if (socket && roomId) {
      startVideoCall()
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop())
      }
      if (pcRef.current) {
        pcRef.current.close()
      }
    }
  }, [socket, roomId])

  async function startVideoCall() {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })

      setLocalStream(stream)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // Join room
      socket.emit('video:join', roomId)

      // Setup WebRTC
      setupWebRTC(stream)
    } catch (error) {
      console.error('Error accessing media devices:', error)
      alert('Unable to access camera/microphone. Please check permissions.')
    }
  }

  function setupWebRTC(localStream) {
    // Listen for other users joining
    socket.on('video:user-joined', async ({ socketId, userId }) => {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      })

      // Add local stream tracks
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream)
      })

      // Handle remote stream
      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0])
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0]
        }
      }

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('video:ice-candidate', {
            roomId,
            candidate: event.candidate,
            socketId
          })
        }
      }

      pcRef.current = pc
      setPeers(prev => new Map(prev.set(socketId, pc)))

      // Create offer
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      socket.emit('video:offer', {
        roomId,
        offer,
        socketId
      })
    })

    // Handle offer
    socket.on('video:offer', async ({ offer, socketId }) => {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      })

      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream)
      })

      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0])
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0]
        }
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('video:ice-candidate', {
            roomId,
            candidate: event.candidate,
            socketId
          })
        }
      }

      await pc.setRemoteDescription(new RTCSessionDescription(offer))
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      socket.emit('video:answer', {
        roomId,
        answer,
        socketId
      })

      setPeers(prev => new Map(prev.set(socketId, pc)))
    })

    // Handle answer
    socket.on('video:answer', async ({ answer, socketId }) => {
      const pc = peers.get(socketId)
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer))
      }
    })

    // Handle ICE candidate
    socket.on('video:ice-candidate', async ({ candidate, socketId }) => {
      const pc = peers.get(socketId)
      if (pc && candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate))
      }
    })

    // Handle user leaving
    socket.on('video:user-left', ({ socketId }) => {
      const pc = peers.get(socketId)
      if (pc) {
        pc.close()
        setPeers(prev => {
          const newPeers = new Map(prev)
          newPeers.delete(socketId)
          return newPeers
        })
      }
      setRemoteStream(null)
    })
  }

  function toggleVideo() {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled
        setIsVideoEnabled(!isVideoEnabled)
      }
    }
  }

  function toggleAudio() {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled
        setIsAudioEnabled(!isAudioEnabled)
      }
    }
  }

  function handleEndCall() {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
    }
    peers.forEach(pc => pc.close())
    socket.emit('video:leave', roomId)
    onEnd()
  }

  return (
    <div className="fixed inset-0 bg-dark-bg z-50 flex flex-col">
      {/* Header */}
      <div className="h-16 bg-dark-secondary border-b border-dark-hover flex items-center justify-between px-6">
        <h2 className="text-white font-semibold text-lg">Video Call</h2>
        <button
          onClick={handleEndCall}
          className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
        >
          <FiX className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative bg-black">
        {/* Remote Video */}
        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-dark-secondary flex items-center justify-center mx-auto mb-4">
                <FiVideo className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-400">Waiting for others to join...</p>
            </div>
          </div>
        )}

        {/* Local Video */}
        {localStream && (
          <div className="absolute bottom-4 right-4 w-64 h-48 bg-dark-secondary rounded-lg overflow-hidden border-2 border-purple-primary">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="h-20 bg-dark-secondary border-t border-dark-hover flex items-center justify-center space-x-4">
        <button
          onClick={toggleAudio}
          className={`p-4 rounded-full transition-colors ${
            isAudioEnabled
              ? 'bg-dark-tertiary hover:bg-dark-hover text-white'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
          title={isAudioEnabled ? 'Mute' : 'Unmute'}
        >
          {isAudioEnabled ? (
            <FiMic className="w-6 h-6" />
          ) : (
            <FiMicOff className="w-6 h-6" />
          )}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full transition-colors ${
            isVideoEnabled
              ? 'bg-dark-tertiary hover:bg-dark-hover text-white'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
          title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {isVideoEnabled ? (
            <FiVideo className="w-6 h-6" />
          ) : (
            <FiVideoOff className="w-6 h-6" />
          )}
        </button>

        <button
          onClick={handleEndCall}
          className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
          title="End call"
        >
          <FiX className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}

export default VideoCall

