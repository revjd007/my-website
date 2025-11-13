import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from './Sidebar'
import ChatArea from './ChatArea'
import UserList from './UserList'
import VideoCall from './VideoCall'
import axios from 'axios'

function ChatLayout() {
  const { user, socket, logout } = useAuth()
  const [servers, setServers] = useState([])
  const [selectedServer, setSelectedServer] = useState(null)
  const [selectedChannel, setSelectedChannel] = useState(null)
  const [selectedDM, setSelectedDM] = useState(null)
  const [dms, setDms] = useState([])
  const [users, setUsers] = useState([])
  const [videoCallActive, setVideoCallActive] = useState(false)
  const [videoRoomId, setVideoRoomId] = useState(null)
  const [showUserList, setShowUserList] = useState(true)

  useEffect(() => {
    if (socket && user) {
      loadServers()
      loadDMs()
      loadUsers()

      socket.on('message:new', (message) => {
        // Handle new message (will be handled in ChatArea)
      })

      socket.on('user:status', (data) => {
        setUsers(prev => prev.map(u => 
          u.id === data.userId ? { ...u, status: data.status } : u
        ))
      })

      return () => {
        socket.off('message:new')
        socket.off('user:status')
      }
    }
  }, [socket, user])

  async function loadServers() {
    try {
      const res = await axios.get('/api/chat/servers', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setServers(res.data)
      if (res.data.length > 0) {
        setSelectedServer(res.data[0])
        if (res.data[0].channels?.length > 0) {
          setSelectedChannel(res.data[0].channels[0])
        }
      }
    } catch (err) {
      console.error('Error loading servers:', err)
    }
  }

  async function loadDMs() {
    try {
      const res = await axios.get('/api/chat/dms', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setDms(res.data)
    } catch (err) {
      console.error('Error loading DMs:', err)
    }
  }

  async function loadUsers() {
    try {
      const res = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setUsers(res.data)
    } catch (err) {
      console.error('Error loading users:', err)
    }
  }

  function handleChannelSelect(channel) {
    setSelectedChannel(channel)
    setSelectedDM(null)
    if (socket) {
      socket.emit('channel:join', channel.id)
    }
  }

  async function handleDMSelect(dm) {
    setSelectedDM(dm)
    setSelectedChannel(null)
    if (socket) {
      socket.emit('dm:join', dm.id)
    }
  }

  async function handleStartDM(otherUserId) {
    try {
      const res = await axios.post('/api/chat/dms', { otherUserId }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      // Reload DMs to get full data
      const dmRes = await axios.get('/api/chat/dms', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setDms(dmRes.data)
      // Find and select the DM
      const dm = dmRes.data.find(d => 
        d.id === res.data.id ||
        ((d.user1Id === otherUserId && d.user2Id === user.id) ||
         (d.user2Id === otherUserId && d.user1Id === user.id))
      )
      if (dm) {
        handleDMSelect(dm)
      }
    } catch (err) {
      console.error('Error creating DM:', err)
    }
  }

  function handleCreateServer(name) {
    axios.post('/api/chat/servers', { name }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => {
      setServers([...servers, res.data])
      setSelectedServer(res.data)
      if (res.data.channels?.length > 0) {
        setSelectedChannel(res.data.channels[0])
      }
    })
    .catch(err => console.error('Error creating server:', err))
  }

  function handleStartVideoCall() {
    const roomId = `room-${Date.now()}`
    setVideoRoomId(roomId)
    setVideoCallActive(true)
  }

  function handleEndVideoCall() {
    if (socket && videoRoomId) {
      socket.emit('video:leave', videoRoomId)
    }
    setVideoCallActive(false)
    setVideoRoomId(null)
  }

  if (videoCallActive) {
    return (
      <VideoCall
        roomId={videoRoomId}
        onEnd={handleEndVideoCall}
        socket={socket}
      />
    )
  }

  return (
    <div className="flex h-screen bg-dark-bg text-gray-100">
      <Sidebar
        servers={servers}
        selectedServer={selectedServer}
        selectedChannel={selectedChannel}
        selectedDM={selectedDM}
        dms={dms}
        onServerSelect={setSelectedServer}
        onChannelSelect={handleChannelSelect}
        onDMSelect={handleDMSelect}
        onCreateServer={handleCreateServer}
        user={user}
        onLogout={logout}
        onStartVideoCall={handleStartVideoCall}
      />

      <ChatArea
        selectedServer={selectedServer}
        selectedChannel={selectedChannel}
        selectedDM={selectedDM}
        socket={socket}
        user={user}
        users={users}
        onLoadDMs={loadDMs}
      />

      {showUserList && selectedServer && (
        <UserList
          users={users.filter(u => u.id !== user.id)}
          server={selectedServer}
          socket={socket}
          onStartDM={handleStartDM}
        />
      )}
    </div>
  )
}

export default ChatLayout

