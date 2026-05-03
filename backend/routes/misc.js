const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/auth');

// ─── REVIEWS ─────────────────────────────────────────────────────────────────

// POST /api/reviews - Add a review
router.post('/reviews', verifyToken, async (req, res) => {
  try {
    const { order_id, rating, comment } = req.body;
    if (!order_id || !rating) return res.status(400).json({ error: 'Order ID and rating required.' });

    // Verify order belongs to buyer and is completed
    const [orders] = await db.execute(
      'SELECT * FROM orders WHERE id = ? AND buyer_id = ? AND status = "completed"',
      [order_id, req.user.id]
    );
    if (orders.length === 0) {
      return res.status(400).json({ error: 'Order not found or not completed.' });
    }

    const order = orders[0];

    // Check existing review
    const [existing] = await db.execute('SELECT id FROM reviews WHERE order_id = ?', [order_id]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Review already submitted for this order.' });
    }

    await db.execute(
      'INSERT INTO reviews (order_id, gig_id, reviewer_id, seller_id, rating, comment) VALUES (?,?,?,?,?,?)',
      [order_id, order.gig_id, req.user.id, order.seller_id, rating, comment || null]
    );

    // Recalculate average rating for the gig
    const [avgResult] = await db.execute(
      'SELECT AVG(rating) AS avg_rating FROM reviews WHERE gig_id = ?',
      [order.gig_id]
    );
    await db.execute(
      'UPDATE gigs SET avg_rating = ? WHERE id = ?',
      [avgResult[0].avg_rating, order.gig_id]
    );

    res.status(201).json({ message: 'Review submitted successfully.' });
  } catch (err) {
    console.error('Review error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/reviews/gig/:gigId - Get reviews for a gig
router.get('/reviews/gig/:gigId', async (req, res) => {
  try {
    const [reviews] = await db.execute(`
      SELECT r.*, u.username AS reviewer_name, u.avatar_url AS reviewer_avatar
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      WHERE r.gig_id = ?
      ORDER BY r.created_at DESC
    `, [req.params.gigId]);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ─── MESSAGES ────────────────────────────────────────────────────────────────

// POST /api/messages - Send a message
router.post('/messages', verifyToken, async (req, res) => {
  try {
    const { receiver_id, content } = req.body;
    if (!receiver_id || !content) {
      return res.status(400).json({ error: 'Receiver and content required.' });
    }

    if (parseInt(receiver_id) === req.user.id) {
      return res.status(400).json({ error: 'You cannot message yourself.' });
    }

    const [result] = await db.execute(
      'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?,?,?)',
      [req.user.id, receiver_id, content]
    );

    res.status(201).json({ message: 'Message sent.', messageId: result.insertId });
  } catch (err) {
    console.error('Message error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/messages - Get all conversations for current user
router.get('/messages', verifyToken, async (req, res) => {
  try {
    const [conversations] = await db.execute(`
      SELECT DISTINCT
        CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END AS other_user_id,
        u.username AS other_username, u.full_name AS other_name, u.avatar_url AS other_avatar,
        (SELECT content FROM messages m2
         WHERE (m2.sender_id = ? AND m2.receiver_id = other_user_id)
            OR (m2.sender_id = other_user_id AND m2.receiver_id = ?)
         ORDER BY m2.created_at DESC LIMIT 1) AS last_message,
        (SELECT created_at FROM messages m3
         WHERE (m3.sender_id = ? AND m3.receiver_id = other_user_id)
            OR (m3.sender_id = other_user_id AND m3.receiver_id = ?)
         ORDER BY m3.created_at DESC LIMIT 1) AS last_message_time,
        (SELECT COUNT(*) FROM messages m4
         WHERE m4.sender_id = other_user_id AND m4.receiver_id = ? AND m4.is_read = FALSE) AS unread_count
      FROM messages m
      JOIN users u ON u.id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END
      WHERE m.sender_id = ? OR m.receiver_id = ?
      ORDER BY last_message_time DESC
    `, [req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id]);

    res.json(conversations);
  } catch (err) {
    console.error('Get conversations error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/messages/:userId - Get conversation with specific user
router.get('/messages/:userId', verifyToken, async (req, res) => {
  try {
    const otherUserId = parseInt(req.params.userId);

    const [messages] = await db.execute(`
      SELECT m.*, u.username AS sender_username, u.avatar_url AS sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE (m.sender_id = ? AND m.receiver_id = ?)
         OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.created_at ASC
    `, [req.user.id, otherUserId, otherUserId, req.user.id]);

    // Mark messages as read
    await db.execute(
      'UPDATE messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE',
      [otherUserId, req.user.id]
    );

    res.json(messages);
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ─── FAVORITES ───────────────────────────────────────────────────────────────

// POST /api/favorites - Toggle favorite
router.post('/favorites', verifyToken, async (req, res) => {
  try {
    const { gig_id } = req.body;
    if (!gig_id) return res.status(400).json({ error: 'Gig ID required.' });

    const [existing] = await db.execute(
      'SELECT id FROM favorites WHERE user_id = ? AND gig_id = ?',
      [req.user.id, gig_id]
    );

    if (existing.length > 0) {
      await db.execute('DELETE FROM favorites WHERE user_id = ? AND gig_id = ?', [req.user.id, gig_id]);
      return res.json({ message: 'Removed from favorites.', favorited: false });
    } else {
      await db.execute('INSERT INTO favorites (user_id, gig_id) VALUES (?,?)', [req.user.id, gig_id]);
      return res.json({ message: 'Added to favorites.', favorited: true });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/favorites - Get user's favorites
router.get('/favorites', verifyToken, async (req, res) => {
  try {
    const [favorites] = await db.execute(`
      SELECT g.*, u.username AS seller_name, u.full_name AS seller_full_name, c.name AS category_name
      FROM favorites f
      JOIN gigs g ON f.gig_id = g.id
      JOIN users u ON g.seller_id = u.id
      JOIN categories c ON g.category_id = c.id
      WHERE f.user_id = ? AND g.is_active = TRUE
      ORDER BY f.created_at DESC
    `, [req.user.id]);
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ─── CATEGORIES ──────────────────────────────────────────────────────────────

router.get('/categories', async (req, res) => {
  try {
    const [categories] = await db.execute('SELECT * FROM categories ORDER BY name');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
