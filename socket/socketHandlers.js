const { getDb } = require('../database/db');
const { setupChatGPT } = require('../services/chatgpt');

const connectedUsers = new Map();

function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // User joins
    socket.on('user:join', (userData) => {
      socket.userId = userData.userId;
      socket.username = userData.username;
      connectedUsers.set(userData.userId, {
        socketId: socket.id,
        username: userData.username,
        status: 'online'
      });

      // Update status in database
      const db = getDb();
      db.run('UPDATE users SET status = ? WHERE id = ?', ['online', userData.userId]);

      // Notify others
      socket.broadcast.emit('user:status', {
        userId: userData.userId,
        status: 'online'
      });
    });

    // Join channel
    socket.on('channel:join', (channelId) => {
      socket.leaveAll();
      socket.join(`channel:${channelId}`);
      socket.currentChannel = channelId;
    });

    // Join DM
    socket.on('dm:join', (dmId) => {
      socket.leaveAll();
      socket.join(`dm:${dmId}`);
      socket.currentDM = dmId;
    });

    // Join video room
    socket.on('video:join', (roomId) => {
      socket.join(`video:${roomId}`);
      socket.to(`video:${roomId}`).emit('video:user-joined', {
        socketId: socket.id,
        userId: socket.userId
      });
    });

    // Send message
    socket.on('message:send', async (data) => {
      const db = getDb();
      const { channelId, dmId, content, type = 'text' } = data;

      if (!content || (!channelId && !dmId)) {
        return;
      }

      // Handle ChatGPT channel specially
      const isChatGPT = channelId === 'chatgpt';
      
      db.run(
        'INSERT INTO messages (channelId, dmId, userId, content, type) VALUES (?, ?, ?, ?, ?)',
        [isChatGPT ? null : (channelId || null), dmId || null, socket.userId, content, type],
        function(err) {
          if (err) {
            console.error('Error saving message:', err);
            return;
          }

          // Get message with user info
          db.get(
            `SELECT m.*, u.username, u.avatar, u.role
             FROM messages m
             INNER JOIN users u ON m.userId = u.id
             WHERE m.id = ?`,
            [this.lastID],
            async (err, message) => {
              if (err || !message) {
                return;
              }

              // For ChatGPT channel, add channelId back for frontend
              if (isChatGPT) {
                message.channelId = 'chatgpt';
              }

              // Send to channel or DM
              if (channelId) {
                io.to(`channel:${channelId}`).emit('message:new', message);
                socket.emit('message:new', message);
              } else if (dmId) {
                io.to(`dm:${dmId}`).emit('message:new', message);
                socket.emit('message:new', message);
              }

              // Check if message is for ChatGPT
              if (isChatGPT || content.includes('@ChatGPT') || content.includes('@chatgpt')) {
                await handleChatGPTMessage(io, socket, message, channelId, dmId);
              }
            }
          );
        }
      );
    });

    // Video call signaling
    socket.on('video:offer', (data) => {
      socket.to(`video:${data.roomId}`).emit('video:offer', {
        offer: data.offer,
        socketId: socket.id
      });
    });

    socket.on('video:answer', (data) => {
      socket.to(`video:${data.roomId}`).emit('video:answer', {
        answer: data.answer,
        socketId: socket.id
      });
    });

    socket.on('video:ice-candidate', (data) => {
      socket.to(`video:${data.roomId}`).emit('video:ice-candidate', {
        candidate: data.candidate,
        socketId: socket.id
      });
    });

    // Leave video room
    socket.on('video:leave', (roomId) => {
      socket.leave(`video:${roomId}`);
      socket.to(`video:${roomId}`).emit('video:user-left', {
        socketId: socket.id,
        userId: socket.userId
      });
    });

    // Typing indicator
    socket.on('typing:start', (data) => {
      if (data.channelId) {
        socket.to(`channel:${data.channelId}`).emit('typing:start', {
          userId: socket.userId,
          username: socket.username
        });
      } else if (data.dmId) {
        socket.to(`dm:${data.dmId}`).emit('typing:start', {
          userId: socket.userId,
          username: socket.username
        });
      }
    });

    socket.on('typing:stop', (data) => {
      if (data.channelId) {
        socket.to(`channel:${data.channelId}`).emit('typing:stop', {
          userId: socket.userId
        });
      } else if (data.dmId) {
        socket.to(`dm:${data.dmId}`).emit('typing:stop', {
          userId: socket.userId
        });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);

        // Update status in database
        const db = getDb();
        db.run('UPDATE users SET status = ? WHERE id = ?', ['offline', socket.userId]);

        // Notify others
        socket.broadcast.emit('user:status', {
          userId: socket.userId,
          status: 'offline'
        });
      }

      console.log('User disconnected:', socket.id);
    });
  });
}

async function handleChatGPTMessage(io, socket, message, channelId, dmId) {
  try {
    const chatgpt = setupChatGPT();
    const response = await chatgpt.getResponse(message.content);

    // Save ChatGPT response (for ChatGPT channel, don't save to DB, just send)
    const aiMessage = {
      id: Date.now(), // Temporary ID
      channelId: channelId || null,
      dmId: dmId || null,
      userId: 0,
      username: 'ChatGPT',
      avatar: null,
      role: 'ai',
      content: response,
      type: 'ai',
      createdAt: new Date().toISOString()
    };

    if (channelId) {
      io.to(`channel:${channelId}`).emit('message:new', aiMessage);
    } else if (dmId) {
      io.to(`dm:${dmId}`).emit('message:new', aiMessage);
    }
  } catch (error) {
    console.error('Error handling ChatGPT message:', error);
    const errorMessage = {
      id: Date.now(),
      channelId: channelId || null,
      dmId: dmId || null,
      userId: 0,
      username: 'ChatGPT',
      avatar: null,
      role: 'ai',
      content: 'Sorry, I encountered an error. Please check if OPENAI_API_KEY is set in the backend environment.',
      type: 'ai',
      createdAt: new Date().toISOString()
    };
    
    if (channelId) {
      socket.emit('message:new', errorMessage);
    } else if (dmId) {
      socket.emit('message:new', errorMessage);
    }
  }
}

module.exports = { setupSocketHandlers };

