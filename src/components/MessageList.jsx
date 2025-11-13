import { format, formatDistanceToNow } from 'date-fns'
import { FiCheck, FiCheckCircle } from 'react-icons/fi'

function MessageList({ messages, currentUser }) {
  function formatMessageTime(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return format(date, 'HH:mm')
    } else if (diffInHours < 168) {
      return format(date, 'EEE HH:mm')
    } else {
      return format(date, 'MMM d, HH:mm')
    }
  }

  function groupMessages(messages) {
    const grouped = []
    let currentGroup = null

    messages.forEach((message, index) => {
      const prevMessage = index > 0 ? messages[index - 1] : null
      const timeDiff = prevMessage
        ? (new Date(message.createdAt) - new Date(prevMessage.createdAt)) / (1000 * 60)
        : Infinity

      const isSameUser = prevMessage && prevMessage.userId === message.userId
      const isRecent = timeDiff < 5

      if (isSameUser && isRecent && currentGroup) {
        currentGroup.messages.push(message)
      } else {
        if (currentGroup) {
          grouped.push(currentGroup)
        }
        currentGroup = {
          user: {
            id: message.userId,
            username: message.username,
            avatar: message.avatar,
            role: message.role
          },
          messages: [message],
          timestamp: message.createdAt
        }
      }
    })

    if (currentGroup) {
      grouped.push(currentGroup)
    }

    return grouped
  }

  const groupedMessages = groupMessages(messages)

  return (
    <div className="space-y-4">
      {groupedMessages.map((group, groupIndex) => {
        const isOwnMessage = group.user.id === currentUser.id
        const isAI = group.user.id === 0 || group.messages[0].type === 'ai'

        return (
          <div
            key={groupIndex}
            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex space-x-2 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {/* Avatar */}
              {!isOwnMessage && (
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                    isAI ? 'bg-blue-primary' : 'bg-purple-primary'
                  }`}>
                    {isAI ? 'AI' : group.user.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                {/* User info */}
                {!isOwnMessage && (
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-semibold text-white">
                      {isAI ? 'ChatGPT' : group.user.username}
                    </span>
                    {group.user.role === 'owner' && (
                      <span className="text-xs px-2 py-0.5 bg-purple-primary text-white rounded">
                        Owner
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {formatMessageTime(group.timestamp)}
                    </span>
                  </div>
                )}

                {/* Message bubbles */}
                <div className={`flex flex-col space-y-1 ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                  {group.messages.map((message, msgIndex) => (
                    <div
                      key={message.id || msgIndex}
                      className={`px-4 py-2 rounded-lg ${
                        isOwnMessage
                          ? 'bg-purple-primary text-white'
                          : isAI
                          ? 'bg-blue-primary/20 text-blue-200 border border-blue-primary/30'
                          : 'bg-dark-secondary text-gray-100'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                  ))}
                </div>

                {/* Timestamp for own messages */}
                {isOwnMessage && (
                  <div className="flex items-center space-x-1 mt-1">
                    <span className="text-xs text-gray-400">
                      {formatMessageTime(group.timestamp)}
                    </span>
                    <FiCheckCircle className="w-3 h-3 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default MessageList

