require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initSocket } = require('./socket/socketManager');
const connectDB = require('./db');

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Connect to MongoDB then start server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`🤖 AI Provider: ${process.env.AI_PROVIDER || 'mock'}`);
    console.log(`📡 WebSocket ready\n`);
  });
}).catch((err) => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});
