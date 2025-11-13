import { useState } from 'react'
import { FiHash, FiMessageSquare, FiPlus, FiVideo, FiLogOut, FiUser, FiChevronRight } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'

function Sidebar({
  servers,
  selectedServer,
  selectedChannel,
  selectedDM,
  dms,
  onServerSelect,
  onChannelSelect,
  onDMSelect,
  onCreateServer,
  user,
  onLogout,
  onStartVideoCall
}) {
  const [showCreateServer, setShowCreateServer] = useState(false)
  const [newServerName, setNewServerName] = useState('')
  const [activeTab, setActiveTab] = useState('servers') // 'servers' or 'dms'

  function handleCreateServer(e) {
    e.preventDefault()
    if (newServerName.trim()) {
      onCreateServer(newServerName.trim())
      setNewServerName('')
      setShowCreateServer(false)
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'busy': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="w-60 bg-dark-secondary flex flex-col">
      {/* User Profile */}
      <div className="p-4 border-b border-dark-hover flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-purple-primary flex items-center justify-center text-white font-semibold">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(user?.status)} rounded-full border-2 border-dark-secondary`}></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-medium text-sm truncate">
              {user?.username}
            </div>
            <div className="text-gray-400 text-xs">
              {user?.role === 'owner' ? 'Owner' : 'User'}
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
          title="Logout"
        >
          <FiLogOut className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-dark-hover">
        <button
          onClick={() => setActiveTab('servers')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'servers'
              ? 'text-white bg-dark-hover border-b-2 border-purple-primary'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Servers
        </button>
        <button
          onClick={() => setActiveTab('dms')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'dms'
              ? 'text-white bg-dark-hover border-b-2 border-purple-primary'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          DMs
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'servers' ? (
          <div>
            {/* Servers List */}
            {servers.map(server => (
              <div key={server.id} className="mb-2">
                <div
                  onClick={() => onServerSelect(server)}
                  className={`px-4 py-2 cursor-pointer flex items-center justify-between ${
                    selectedServer?.id === server.id ? 'bg-dark-hover' : 'hover:bg-dark-hover'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <FiHash className="w-5 h-5 text-purple-primary" />
                    <span className="text-white font-medium">{server.name}</span>
                  </div>
                  {selectedServer?.id === server.id && (
                    <FiChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </div>

                {/* Channels */}
                {selectedServer?.id === server.id && server.channels?.map(channel => (
                  <div
                    key={channel.id}
                    onClick={() => onChannelSelect(channel)}
                    className={`px-8 py-2 cursor-pointer flex items-center space-x-2 ${
                      selectedChannel?.id === channel.id
                        ? 'bg-dark-tertiary text-white'
                        : 'text-gray-400 hover:text-white hover:bg-dark-hover'
                    }`}
                  >
                    <FiHash className="w-4 h-4" />
                    <span>{channel.name}</span>
                  </div>
                ))}
              </div>
            ))}

            {/* Create Server */}
            {showCreateServer ? (
              <form onSubmit={handleCreateServer} className="p-4">
                <input
                  type="text"
                  value={newServerName}
                  onChange={(e) => setNewServerName(e.target.value)}
                  placeholder="Server name"
                  className="w-full px-3 py-2 bg-dark-tertiary border border-dark-hover rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-primary"
                  autoFocus
                />
                <div className="flex space-x-2 mt-2">
                  <button
                    type="submit"
                    className="flex-1 px-3 py-1 bg-purple-primary hover:bg-purple-hover text-white text-sm rounded transition-colors"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateServer(false)
                      setNewServerName('')
                    }}
                    className="flex-1 px-3 py-1 bg-dark-tertiary hover:bg-dark-hover text-white text-sm rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowCreateServer(true)}
                className="w-full px-4 py-2 text-gray-400 hover:text-white hover:bg-dark-hover flex items-center space-x-2 transition-colors"
              >
                <FiPlus className="w-5 h-5" />
                <span>Create Server</span>
              </button>
            )}

            {/* ChatGPT Channel */}
            <div
              onClick={() => {
                const chatgptChannel = { id: 'chatgpt', name: 'ChatGPT', type: 'ai' }
                onChannelSelect(chatgptChannel)
                onServerSelect({ id: 'chatgpt', name: 'AI Assistant' })
              }}
              className={`px-4 py-2 cursor-pointer flex items-center space-x-2 ${
                selectedChannel?.id === 'chatgpt'
                  ? 'bg-dark-tertiary text-white'
                  : 'text-gray-400 hover:text-white hover:bg-dark-hover'
              }`}
            >
              <FiMessageSquare className="w-5 h-5 text-blue-primary" />
              <span>ChatGPT Assistant</span>
            </div>
          </div>
        ) : (
          <div>
            {/* DMs List */}
            {dms.map(dm => (
              <div
                key={dm.id}
                onClick={() => onDMSelect(dm)}
                className={`px-4 py-2 cursor-pointer flex items-center space-x-2 ${
                  selectedDM?.id === dm.id
                    ? 'bg-dark-tertiary text-white'
                    : 'text-gray-400 hover:text-white hover:bg-dark-hover'
                }`}
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-purple-primary flex items-center justify-center text-white text-xs font-semibold">
                    {dm.otherUsername?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${getStatusColor(dm.otherStatus)} rounded-full border-2 border-dark-secondary`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{dm.otherUsername}</div>
                  {dm.lastMessage && (
                    <div className="text-xs text-gray-500 truncate">
                      {dm.lastMessage.content}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Call Button */}
      <div className="p-4 border-t border-dark-hover">
        <button
          onClick={onStartVideoCall}
          className="w-full px-4 py-2 bg-blue-primary hover:bg-blue-hover text-white rounded-lg flex items-center justify-center space-x-2 transition-colors"
        >
          <FiVideo className="w-5 h-5" />
          <span>Start Video Call</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar

