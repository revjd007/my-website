const express = require('express');
const { getDb } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all servers for user
router.get('/servers', authenticateToken, (req, res) => {
  const db = getDb();
  const userId = req.user.userId;

  db.all(
    `SELECT s.* FROM servers s
     INNER JOIN server_members sm ON s.id = sm.serverId
     WHERE sm.userId = ?`,
    [userId],
    (err, servers) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching servers' });
      }

      // Get channels for each server
      const serverPromises = servers.map(server => {
        return new Promise((resolve) => {
          db.all(
            'SELECT * FROM channels WHERE serverId = ?',
            [server.id],
            (err, channels) => {
              if (err) {
                server.channels = [];
              } else {
                server.channels = channels;
              }
              resolve(server);
            }
          );
        });
      });

      Promise.all(serverPromises).then(serversWithChannels => {
        res.json(serversWithChannels);
      });
    }
  );
});

// Create server
router.post('/servers', authenticateToken, (req, res) => {
  const db = getDb();
  const { name } = req.body;
  const userId = req.user.userId;

  if (!name) {
    return res.status(400).json({ error: 'Server name is required' });
  }

  db.run(
    'INSERT INTO servers (name, ownerId) VALUES (?, ?)',
    [name, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error creating server' });
      }

      const serverId = this.lastID;

      // Add creator as member
      db.run(
        'INSERT INTO server_members (serverId, userId) VALUES (?, ?)',
        [serverId, userId],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Error adding member' });
          }

          // Create default channel
          db.run(
            'INSERT INTO channels (serverId, name, type) VALUES (?, ?, ?)',
            [serverId, 'general', 'text'],
            function(err) {
              if (err) {
                return res.status(500).json({ error: 'Error creating channel' });
              }

              res.json({
                id: serverId,
                name,
                ownerId: userId,
                channels: [{ id: this.lastID, serverId, name: 'general', type: 'text' }]
              });
            }
          );
        }
      );
    }
  );
});

// Get messages for channel
router.get('/channels/:channelId/messages', authenticateToken, (req, res) => {
  const db = getDb();
  const { channelId } = req.params;
  const limit = parseInt(req.query.limit) || 50;

  db.all(
    `SELECT m.*, u.username, u.avatar, u.role
     FROM messages m
     INNER JOIN users u ON m.userId = u.id
     WHERE m.channelId = ?
     ORDER BY m.createdAt DESC
     LIMIT ?`,
    [channelId, limit],
    (err, messages) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching messages' });
      }

      res.json(messages.reverse());
    }
  );
});

// Get direct messages
router.get('/dms', authenticateToken, (req, res) => {
  const db = getDb();
  const userId = req.user.userId;

  db.all(
    `SELECT dm.*, 
            CASE WHEN dm.user1Id = ? THEN u2.id ELSE u1.id END as otherUserId,
            CASE WHEN dm.user1Id = ? THEN u2.username ELSE u1.username END as otherUsername,
            CASE WHEN dm.user1Id = ? THEN u2.avatar ELSE u1.avatar END as otherAvatar,
            CASE WHEN dm.user1Id = ? THEN u2.status ELSE u1.status END as otherStatus
     FROM direct_messages dm
     INNER JOIN users u1 ON dm.user1Id = u1.id
     INNER JOIN users u2 ON dm.user2Id = u2.id
     WHERE dm.user1Id = ? OR dm.user2Id = ?
     ORDER BY dm.createdAt DESC`,
    [userId, userId, userId, userId, userId, userId],
    (err, dms) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching DMs' });
      }

      // Get last message for each DM
      const dmPromises = dms.map(dm => {
        return new Promise((resolve) => {
          db.get(
            `SELECT m.*, u.username, u.avatar
             FROM messages m
             INNER JOIN users u ON m.userId = u.id
             WHERE m.dmId = ?
             ORDER BY m.createdAt DESC
             LIMIT 1`,
            [dm.id],
            (err, lastMessage) => {
              dm.lastMessage = lastMessage || null;
              resolve(dm);
            }
          );
        });
      });

      Promise.all(dmPromises).then(dmsWithMessages => {
        res.json(dmsWithMessages);
      });
    }
  );
});

// Get messages for DM
router.get('/dms/:dmId/messages', authenticateToken, (req, res) => {
  const db = getDb();
  const { dmId } = req.params;
  const limit = parseInt(req.query.limit) || 50;

  db.all(
    `SELECT m.*, u.username, u.avatar, u.role
     FROM messages m
     INNER JOIN users u ON m.userId = u.id
     WHERE m.dmId = ?
     ORDER BY m.createdAt DESC
     LIMIT ?`,
    [dmId, limit],
    (err, messages) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching messages' });
      }

      res.json(messages.reverse());
    }
  );
});

// Create or get DM
router.post('/dms', authenticateToken, (req, res) => {
  const db = getDb();
  const { otherUserId } = req.body;
  const userId = req.user.userId;

  if (!otherUserId || otherUserId === userId) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  // Check if DM already exists
  db.get(
    `SELECT * FROM direct_messages
     WHERE (user1Id = ? AND user2Id = ?) OR (user1Id = ? AND user2Id = ?)`,
    [userId, otherUserId, otherUserId, userId],
    (err, dm) => {
      if (err) {
        return res.status(500).json({ error: 'Error checking DM' });
      }

      if (dm) {
        return res.json(dm);
      }

      // Create new DM
      db.run(
        'INSERT INTO direct_messages (user1Id, user2Id) VALUES (?, ?)',
        [userId, otherUserId],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Error creating DM' });
          }

          res.json({
            id: this.lastID,
            user1Id: userId,
            user2Id: otherUserId
          });
        }
      );
    }
  );
});

module.exports = router;

