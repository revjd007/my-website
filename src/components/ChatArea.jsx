import { useState, useEffect, useRef } from 'react'
import { FiSend, FiSmile, FiPaperclip } from 'react-icons/fi'
import axios from 'axios'
import MessageList from './MessageList'

function ChatArea({ selectedServer, selectedChannel, selectedDM, socket, user, users, onLoadDMs }) {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [typingUsers, setTypingUsers] = useState([])
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    if (selectedChannel || selectedDM) {
      loadMessages()
      
      if (socket) {
        if (selectedChannel && selectedChannel.id !== 'chatgpt') {
          socket.emit('channel:join', selectedChannel.id)
        } else if (selectedDM) {
          socket.emit('dm:join', selectedDM.id)
        }

        const handleNewMessageEvent = (message) => {
          if (
            (selectedChannel && message.channelId === selectedChannel.id) ||
            (selectedDM && message.dmId === selectedDM.id)
          ) {
            handleNewMessage(message)
          }
        }

        socket.on('message:new', handleNewMessageEvent)
        socket.on('typing:start', handleTypingStart)
        socket.on('typing:stop', handleTypingStop)

        return () => {
          socket.off('message:new', handleNewMessageEvent)
          socket.off('typing:start', handleTypingStart)
          socket.off('typing:stop', handleTypingStop)
        }
      }
    }
  }, [selectedChannel, selectedDM, socket])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  async function loadMessages() {
    setLoading(true)
    try {
      // ChatGPT channel is virtual, no messages to load
      if (selectedChannel?.id === 'chatgpt') {
        setMessages([])
        setLoading(false)
        return
      }

      let url
      if (selectedChannel) {
        url = `/api/chat/channels/${selectedChannel.id}/messages`
      } else if (selectedDM) {
        url = `/api/chat/dms/${selectedDM.id}/messages`
      }

      if (url) {
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        setMessages(res.data)
      }
    } catch (err) {
      console.error('Error loading messages:', err)
    } finally {
      setLoading(false)
    }
  }

  function handleNewMessage(message) {
    setMessages(prev => [...prev, message])
  }

  function handleTypingStart(data) {
    if (data.userId !== user.id) {
      setTypingUsers(prev => {
        if (!prev.find(u => u.userId === data.userId)) {
          return [...prev, { userId: data.userId, username: data.username }]
        }
        return prev
      })
    }
  }

  function handleTypingStop(data) {
    setTypingUsers(prev => prev.filter(u => u.userId !== data.userId))
  }

  function handleSendMessage(e) {
    e.preventDefault()
    if (!inputMessage.trim() || !socket) return

    const messageData = {
      channelId: selectedChannel?.id && selectedChannel.id !== 'chatgpt' ? selectedChannel.id : null,
      dmId: selectedDM?.id || null,
      content: inputMessage.trim(),
      type: 'text'
    }

    // For ChatGPT channel, always include the channel ID
    if (selectedChannel?.id === 'chatgpt') {
      messageData.channelId = 'chatgpt'
    }

    socket.emit('message:send', messageData)
    setInputMessage('')

    // Stop typing
    if (socket) {
      socket.emit('typing:stop', {
        channelId: selectedChannel?.id,
        dmId: selectedDM?.id
      })
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }

  function handleInputChange(e) {
    setInputMessage(e.target.value)

    // Send typing indicator
    if (socket && e.target.value.trim()) {
      socket.emit('typing:start', {
        channelId: selectedChannel?.id,
        dmId: selectedDM?.id
      })

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing:stop', {
          channelId: selectedChannel?.id,
          dmId: selectedDM?.id
        })
      }, 3000)
    }
  }

  function getChatTitle() {
    if (selectedChannel) {
      if (selectedChannel.id === 'chatgpt') {
        return 'ChatGPT Assistant'
      }
      return `# ${selectedChannel.name}`
    } else if (selectedDM) {
      return selectedDM.otherUsername
    }
    return 'Select a channel or DM'
  }

  if (!selectedChannel && !selectedDM) {
    return (
      <div className="flex-1 flex items-center justify-center bg-dark-bg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to Chat Platform</h2>
          <p className="text-gray-400">Select a channel or DM to start chatting</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-dark-bg">
      {/* Header */}
      <div className="h-14 bg-dark-secondary border-b border-dark-hover flex items-center px-4">
        <div className="flex items-center space-x-3">
          <h2 className="text-white font-semibold">{getChatTitle()}</h2>
          {selectedDM && (
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                selectedDM.otherStatus === 'online' ? 'bg-green-500' :
                selectedDM.otherStatus === 'away' ? 'bg-yellow-500' :
                selectedDM.otherStatus === 'busy' ? 'bg-red-500' : 'bg-gray-500'
              }`}></div>
              <span className="text-sm text-gray-400 capitalize">{selectedDM.otherStatus}</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400">Loading messages...</div>
          </div>
        ) : (
          <>
            <MessageList messages={messages} currentUser={user} />
            {typingUsers.length > 0 && (
              <div className="text-sm text-gray-400 italic mb-2">
                {typingUsers.map(u => u.username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-dark-secondary border-t border-dark-hover">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Attach file"
          >
            <FiPaperclip className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            placeholder={selectedChannel?.id === 'chatgpt' ? 'Ask ChatGPT anything...' : 'Type a message...'}
            className="flex-1 px-4 py-2 bg-dark-tertiary border border-dark-hover rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-primary"
          />
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Emoji"
          >
            <FiSmile className="w-5 h-5" />
          </button>
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="p-2 bg-purple-primary hover:bg-purple-hover text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send message"
          >
            <FiSend className="w-5 h-5" />
          </button>
        </form>
        {selectedChannel?.id === 'chatgpt' && (
          <div className="mt-2 text-xs text-gray-400">
            💡 Tip: Mention @ChatGPT or just type your question you a nerd ty cash.
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatArea

