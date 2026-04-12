require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./src/config/db');
const { errorHandler } = require('./src/middleware/error.middleware');

// Routes imports
const authRoutes = require('./src/routes/auth.routes');
const visitorRoutes = require('./src/routes/visitor.routes');
const appointmentRoutes = require('./src/routes/appointment.routes');
const passRoutes = require('./src/routes/pass.routes');
const checklogRoutes = require('./src/routes/checklog.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/passes', passRoutes);
app.use('/api/checklogs', checklogRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
