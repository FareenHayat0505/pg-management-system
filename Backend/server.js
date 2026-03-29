const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'PG Management API is running!' });
});

// Routes
app.use('/api/auth',        require('./routes/authRoutes'));
app.use('/api/rooms',       require('./routes/roomRoutes'));
app.use('/api/tenants',     require('./routes/tenantRoutes'));
app.use('/api/payments',    require('./routes/paymentRoutes'));
app.use('/api/maintenance', require('./routes/maintenanceRoutes'));
app.use('/api/notices',     require('./routes/noticeRoutes')); 
app.use('/api/properties', require('./routes/propertyRoutes'));

// Socket.io
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('joinRoom', (ticketId) => socket.join(ticketId));
  socket.on('sendMessage', (data) => io.to(data.ticketId).emit('receiveMessage', data));
  socket.on('disconnect', () => console.log('User disconnected:', socket.id));
});

// Connect MongoDB then start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.log('DB connection error:', err));