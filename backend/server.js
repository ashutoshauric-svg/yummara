require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// CORS_ORIGINS env var: comma-separated list of allowed origins
// e.g. "https://yummara.vercel.app,http://localhost:5173"
const ALLOWED_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://localhost:8080'];

const io = new Server(server, {
  cors: { origin: ALLOWED_ORIGINS, methods: ['GET', 'POST'] },
});

app.use(cors({
  origin: ALLOWED_ORIGINS,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.set('io', io);

// Routes
app.use('/api/auth',   require('./src/routes/auth'));
app.use('/api/cooks',  require('./src/routes/cooks'));
app.use('/api/orders', require('./src/routes/orders'));
app.use('/api/user',   require('./src/routes/users'));
app.use('/api/dishes', require('./src/routes/dishes'));
app.use('/api/chat',     require('./src/routes/chat'));
app.use('/api/delivery',  require('./src/routes/delivery'));
app.use('/api/whatsapp', require('./src/routes/whatsapp'));

app.get('/api/health', (_, res) => res.json({ ok: true }));

// Socket.io
require('./src/socket')(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Yummara backend running on http://localhost:${PORT}`);
});
