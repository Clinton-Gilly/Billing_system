const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth.route');
const packagesRoutes = require('./routes/packages.route');
const customersRoutes = require('./routes/customers.route');
const invoicesRoutes = require('./routes/invoices.route');
const paymentsRoutes = require('./routes/payments.route');
const sessionsRoutes = require('./routes/sessions.route');
const mikrotikRoutes = require('./routes/mikrotik.route');
const routerRoutes = require('./routes/router.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const communicationsRoutes = require('./routes/communications.route');
const settingsRoutes = require('./routes/settings.route');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security & Parsing Middleware ───────────────────────
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:8080', // Local captive portal testing
      'http://127.0.0.1:8080',
      'http://192.168.88.1'    // Standard MikroTik router IP
    ];
    // Allow requests with no origin (like mobile apps or curl) or allowed origins
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Health Check ─────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      env: process.env.NODE_ENV,
    }
  });
});

// ─── Routes ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/packages', packagesRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/mikrotik', mikrotikRoutes);
app.use('/api/routers', routerRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/communications', communicationsRoutes);
app.use('/api/settings', settingsRoutes);

// ─── 404 Handler ──────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message || 'Server Error' });
});

const { startCronJobs } = require('./cron/session.cron');

// ─── Start Server ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV}`);
  startCronJobs();
  console.log('Server + cron started');
});

module.exports = app;
