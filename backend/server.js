// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:8080', 'http://localhost:5173', 'http://127.0.0.1:8080', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const connectDB = require("./config");

// Connect to MongoDB Atlas
connectDB();

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'StudySync Backend API is running!', 
    timestamp: new Date().toISOString() 
  });
});

// Routes
app.use('/api/auth', require('./routes/AuthRoutes'));
app.use('/api/users', require('./routes/UserRoutes'));
app.use('/api/notes', require('./routes/NoteRoutes'));
app.use('/api/shared', require('./routes/SharedRoutes'));
app.use('/api/dashboard', require('./routes/DashboardRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
