const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, isSeller } = require('../middleware/auth');

// POST /api/offers - Send a custom offer
router.post('/', verifyToken, async (req, res) => {
  try {
    const { receiver_id, gig_id, price, delivery_days } = req.body;

    if (!receiver_id || !gig_id || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [result] = await db.execute(
      'INSERT INTO custom_offers (sender_id, receiver_id, gig_id, price, delivery_days) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, receiver_id, gig_id, price, delivery_days || 3]
    );

    // Also send a message to notify
    await db.execute(
      'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
      [req.user.id, receiver_id, `I have sent you a Custom Offer for $${price}.`]
    );

    res.status(201).json({ message: 'Custom offer sent successfully', offerId: result.insertId });
  } catch (err) {
    console.error('Create offer error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/offers/conversation/:otherUserId - Get offers in a conversation
router.get('/conversation/:otherUserId', verifyToken, async (req, res) => {
  try {
    const [offers] = await db.execute(`
      SELECT o.*, g.title as gig_title
      FROM custom_offers o
      JOIN gigs g ON o.gig_id = g.id
      WHERE (o.sender_id = ? AND o.receiver_id = ?) 
         OR (o.sender_id = ? AND o.receiver_id = ?)
      ORDER BY o.created_at ASC
    `, [req.user.id, req.params.otherUserId, req.params.otherUserId, req.user.id]);

    res.json(offers);
  } catch (err) {
    console.error('Get offers error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/offers/:id - Get specific offer by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const [offers] = await db.execute(`
      SELECT o.*, g.title as gig_title, g.image_url as gig_image, u.username as seller_username
      FROM custom_offers o
      JOIN gigs g ON o.gig_id = g.id
      JOIN users u ON o.sender_id = u.id
      WHERE o.id = ? AND (o.sender_id = ? OR o.receiver_id = ?)
    `, [req.params.id, req.user.id, req.user.id]);

    if (offers.length === 0) return res.status(404).json({ error: 'Offer not found' });
    res.json(offers[0]);
  } catch (err) {
    console.error('Get offer error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/offers/:id/accept - Accept offer and create order
router.post('/:id/accept', verifyToken, async (req, res) => {
  try {
    // Get the offer
    const [offers] = await db.execute('SELECT * FROM custom_offers WHERE id = ?', [req.params.id]);
    if (offers.length === 0) return res.status(404).json({ error: 'Offer not found' });
    const offer = offers[0];

    if (offer.receiver_id !== req.user.id) {
      return res.status(403).json({ error: 'You cannot accept this offer' });
    }
    if (offer.status !== 'pending') {
      return res.status(400).json({ error: 'Offer is already ' + offer.status });
    }

    // Check wallet balance
    const [users] = await db.execute('SELECT wallet_balance FROM users WHERE id = ?', [req.user.id]);
    const balance = parseFloat(users[0].wallet_balance);
    const price = parseFloat(offer.price);

    if (balance < price) {
      return res.status(400).json({ error: 'Insufficient wallet balance. Please top up.' });
    }

    // Deduct from buyer wallet
    await db.execute('UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?', [price, req.user.id]);
    
    // Record transaction
    await db.execute(
      'INSERT INTO wallet_transactions (user_id, amount, type, description) VALUES (?, ?, ?, ?)',
      [req.user.id, price, 'payment', `Payment for Custom Offer #${offer.id}`]
    );

    // Determine seller and buyer
    const [gigs] = await db.execute('SELECT seller_id FROM gigs WHERE id = ?', [offer.gig_id]);
    const seller_id = gigs[0].seller_id;
    const buyer_id = req.user.id;

    // Create order
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + offer.delivery_days);
    const [orderResult] = await db.execute(
      'INSERT INTO orders (gig_id, buyer_id, seller_id, price, status, delivery_date) VALUES (?, ?, ?, ?, ?, ?)',
      [offer.gig_id, buyer_id, seller_id, price, 'in_progress', deliveryDate]
    );

    // Update offer status
    await db.execute('UPDATE custom_offers SET status = "accepted" WHERE id = ?', [offer.id]);

    res.json({ message: 'Offer accepted and order created', orderId: orderResult.insertId });
  } catch (err) {
    console.error('Accept offer error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
