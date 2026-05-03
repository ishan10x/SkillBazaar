const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, isSeller } = require('../middleware/auth');

// GET /api/portfolios/:userId - Get portfolios for a user
router.get('/:userId', async (req, res) => {
  try {
    const [portfolios] = await db.execute(
      'SELECT * FROM portfolios WHERE user_id = ? ORDER BY created_at DESC',
      [req.params.userId]
    );
    res.json(portfolios);
  } catch (err) {
    console.error('Get portfolios error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/portfolios - Add a new portfolio item
router.post('/', verifyToken, isSeller, async (req, res) => {
  try {
    const { title, description, image_url, link } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const [result] = await db.execute(
      'INSERT INTO portfolios (user_id, title, description, image_url, link) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, title, description, image_url || null, link || null]
    );

    res.status(201).json({ message: 'Portfolio item added', id: result.insertId });
  } catch (err) {
    console.error('Add portfolio error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/portfolios/:id - Delete a portfolio item
router.delete('/:id', verifyToken, isSeller, async (req, res) => {
  try {
    const [items] = await db.execute('SELECT user_id FROM portfolios WHERE id = ?', [req.params.id]);
    if (items.length === 0) return res.status(404).json({ error: 'Portfolio item not found' });
    if (items[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await db.execute('DELETE FROM portfolios WHERE id = ?', [req.params.id]);
    res.json({ message: 'Portfolio item deleted' });
  } catch (err) {
    console.error('Delete portfolio error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
