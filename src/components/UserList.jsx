import { FiMessageSquare } from 'react-icons/fi'

function UserList({ users, server, socket, onStartDM }) {
  function getStatusColor(status) {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'busy': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  // Group users by status
  const online = users.filter(u => u.status === 'online')
  const away = users.filter(u => u.status === 'away')
  const busy = users.filter(u => u.status === 'busy')
  const offline = users.filter(u => u.status === 'offline')

  return (
    <div className="w-60 bg-dark-secondary border-l border-dark-hover flex flex-col">
      <div className="p-4 border-b border-dark-hover">
        <h3 className="text-white font-semibold">Members</h3>
        <p className="text-sm text-gray-400">{users.length} members</p>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {/* Online */}
        {online.length > 0 && (
          <div className="mb-4">
            <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase">
              Online — {online.length}
            </div>
            {online.map(user => (
              <UserItem
                key={user.id}
                user={user}
                onStartDM={onStartDM}
                getStatusColor={getStatusColor}
              />
            ))}
          </div>
        )}

        {/* Away */}
        {away.length > 0 && (
          <div className="mb-4">
            <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase">
              Away — {away.length}
            </div>
            {away.map(user => (
              <UserItem
                key={user.id}
                user={user}
                onStartDM={onStartDM}
                getStatusColor={getStatusColor}
              />
            ))}
          </div>
        )}

        {/* Busy */}
        {busy.length > 0 && (
          <div className="mb-4">
            <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase">
              Busy — {busy.length}
            </div>
            {busy.map(user => (
              <UserItem
                key={user.id}
                user={user}
                onStartDM={onStartDM}
                getStatusColor={getStatusColor}
              />
            ))}
          </div>
        )}

        {/* Offline */}
        {offline.length > 0 && (
          <div className="mb-4">
            <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase">
              Offline — {offline.length}
            </div>
            {offline.map(user => (
              <UserItem
                key={user.id}
                user={user}
                onStartDM={onStartDM}
                getStatusColor={getStatusColor}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function UserItem({ user, onStartDM, getStatusColor }) {
  return (
    <div className="group px-2 py-1.5 rounded hover:bg-dark-hover flex items-center justify-between transition-colors">
      <div className="flex items-center space-x-2 flex-1 min-w-0">
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-purple-primary flex items-center justify-center text-white text-xs font-semibold">
            {user.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${getStatusColor(user.status)} rounded-full border-2 border-dark-secondary`}></div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-white truncate">{user.username}</div>
          {user.role === 'owner' && (
            <div className="text-xs text-purple-primary">Owner</div>
          )}
        </div>
      </div>
      <button
        onClick={() => onStartDM(user.id)}
        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-dark-tertiary rounded transition-all"
        title="Send DM"
      >
        <FiMessageSquare className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  )
}

export default UserList

