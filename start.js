const net = require('net');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

function checkPortOpen(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host: '127.0.0.1' });
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => {
      resolve(false);
    });
  });
}

async function main() {
  // Check if MongoDB connection is needed locally
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/secure_notes_vault';

  if (mongoURI.includes('127.0.0.1') || mongoURI.includes('localhost')) {
    const isMongoOpen = await checkPortOpen(27017);
    if (!isMongoOpen) {
      console.log('[Auto-Start] MongoDB is not running on port 27017.');
      console.log('[Auto-Start] Initializing local MongoDB engine...');
      const dbDir = path.join(__dirname, 'data', 'db');
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      const mongodProc = spawn('mongod', ['--dbpath', dbDir, '--port', '27017'], {
        stdio: 'ignore'
      });

      mongodProc.on('error', (err) => {
        console.warn('[Auto-Start] Note on mongod process:', err.message);
      });

      let ready = false;
      for (let i = 0; i < 25; i++) {
        await new Promise(r => setTimeout(r, 400));
        if (await checkPortOpen(27017)) {
          ready = true;
          break;
        }
      }

      if (ready) {
        console.log('[Auto-Start] Local MongoDB started successfully on 127.0.0.1:27017.');
      } else {
        console.log('[Auto-Start] Proceeding with server boot...');
      }
    } else {
      console.log('[Auto-Start] Verified MongoDB active on port 27017.');
    }
  }

  // Launch Express application
  const { startServer } = require('./server');
  startServer();
}

main().catch((err) => {
  console.error('[Launch Error]:', err);
  process.exit(1);
});

