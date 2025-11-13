const bcrypt = require('bcryptjs');
const { getDb } = require('../database/db');

async function setupOwner() {
  const db = getDb();
  const username = 'John';
  const password = 'admin123'; // Default password, should be changed
  const hashedPassword = await bcrypt.hash(password, 10);

  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
      if (err) {
        reject(err);
        return;
      }

      if (!user) {
        db.run(
          'INSERT INTO users (username, password, role, status) VALUES (?, ?, ?, ?)',
          [username, hashedPassword, 'owner', 'online'],
          function(err) {
            if (err) {
              console.error('Error creating owner:', err);
              reject(err);
            } else {
              console.log('Owner user "John" created successfully');
              // Create default server
              createDefaultServer(this.lastID);
              resolve();
            }
          }
        );
      } else {
        console.log('Owner user already exists');
        resolve();
      }
    });
  });
}

function createDefaultServer(ownerId) {
  const db = getDb();
  db.run(
    'INSERT INTO servers (name, ownerId) VALUES (?, ?)',
    ['General Server', ownerId],
    function(err) {
      if (err) {
        console.error('Error creating default server:', err);
        return;
      }
      const serverId = this.lastID;
      // Add owner to server
      db.run(
        'INSERT INTO server_members (serverId, userId) VALUES (?, ?)',
        [serverId, ownerId]
      );
      // Create default channels
      db.run(
        'INSERT INTO channels (serverId, name, type) VALUES (?, ?, ?)',
        [serverId, 'general', 'text']
      );
      db.run(
        'INSERT INTO channels (serverId, name, type) VALUES (?, ?, ?)',
        [serverId, 'random', 'text']
      );
      console.log('Default server and channels created');
    }
  );
}

module.exports = { setupOwner };

