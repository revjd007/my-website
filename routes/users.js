const express = require('express');
const { getDb } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all users
router.get('/', authenticateToken, (req, res) => {
  const db = getDb();

  db.all(
    'SELECT id, username, email, role, status, avatar FROM users ORDER BY username',
    [],
    (err, users) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching users' });
      }

      res.json(users);
    }
  );
});

// Get user by ID
router.get('/:userId', authenticateToken, (req, res) => {
  const db = getDb();
  const { userId } = req.params;

  db.get(
    'SELECT id, username, email, role, status, avatar FROM users WHERE id = ?',
    [userId],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching user' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    }
  );
});

// Update user status
router.patch('/status', authenticateToken, (req, res) => {
  const db = getDb();
  const { status } = req.body;
  const userId = req.user.userId;

  if (!status || !['online', 'offline', 'away', 'busy'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.run(
    'UPDATE users SET status = ? WHERE id = ?',
    [status, userId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error updating status' });
      }

      res.json({ status });
    }
  );
});

// Update user avatar
router.patch('/avatar', authenticateToken, (req, res) => {
  const db = getDb();
  const { avatar } = req.body;
  const userId = req.user.userId;

  db.run(
    'UPDATE users SET avatar = ? WHERE id = ?',
    [avatar, userId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error updating avatar' });
      }

      res.json({ avatar });
    }
  );
});

module.exports = router;

