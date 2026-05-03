const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ─── Middleware ───────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

// ─── Routes ──────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/gigs', require('./routes/gigs'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/offers', require('./routes/offers'));
app.use('/api/portfolios', require('./routes/portfolios'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api', require('./routes/misc'));  // reviews, messages, favorites, categories

// ─── Health check ────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '🚀 SkillBazaar API is running!',
    version: '1.0.0',
    endpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET  /api/auth/me',
      'GET  /api/gigs',
      'POST /api/gigs',
      'PUT  /api/gigs/:id',
      'DELETE /api/gigs/:id',
      'POST /api/orders',
      'GET  /api/orders',
      'POST /api/reviews',
      'GET  /api/messages',
      'POST /api/messages',
      'POST /api/favorites',
      'GET  /api/favorites',
      'GET  /api/categories'
    ]
  });
});

// ─── 404 handler ─────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── Error handler ───────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start server ────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 SkillBazaar Backend running on http://localhost:${PORT}`);
  console.log(`📚 API docs at http://localhost:${PORT}/\n`);
});
