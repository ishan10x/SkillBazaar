const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/auth');

// GET /api/wallet/balance - Get current balance and transaction history
router.get('/balance', verifyToken, async (req, res) => {
  try {
    const [users] = await db.execute('SELECT wallet_balance FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });

    const [transactions] = await db.execute(
      'SELECT * FROM wallet_transactions WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json({
      balance: users[0].wallet_balance,
      transactions
    });
  } catch (err) {
    console.error('Get wallet balance error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/wallet/topup - Simulated payment gateway top-up
router.post('/topup', verifyToken, async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid top-up amount' });
    }

    // Simulate Stripe/Payment Gateway processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Update wallet balance
    await db.execute(
      'UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?',
      [amount, req.user.id]
    );

    // Record transaction
    await db.execute(
      'INSERT INTO wallet_transactions (user_id, amount, type, status, description) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, amount, 'topup', 'completed', `Topped up via ${paymentMethod || 'Card'}`]
    );

    res.json({ message: 'Wallet topped up successfully', amount });
  } catch (err) {
    console.error('Wallet topup error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
