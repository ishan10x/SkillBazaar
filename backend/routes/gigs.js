const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, isSeller } = require('../middleware/auth');

// GET /api/gigs - Get all gigs (with optional search/filter)
router.get('/', async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT g.*, u.username AS seller_name, u.full_name AS seller_full_name,
             u.avatar_url AS seller_avatar, c.name AS category_name
      FROM gigs g
      JOIN users u ON g.seller_id = u.id
      JOIN categories c ON g.category_id = c.id
      WHERE g.is_active = TRUE
    `;
    const params = [];

    if (search) {
      query += ' AND (g.title LIKE ? OR g.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      query += ' AND g.category_id = ?';
      params.push(category);
    }
    if (minPrice) {
      query += ' AND g.price >= ?';
      params.push(minPrice);
    }
    if (maxPrice) {
      query += ' AND g.price <= ?';
      params.push(maxPrice);
    }

    query += ` ORDER BY g.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

    const [gigs] = await db.execute(query, params);
    res.json(gigs);
  } catch (err) {
    console.error('Get gigs error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/gigs/trending - Get trending gigs by order count
router.get('/trending', async (req, res) => {
  try {
    const [gigs] = await db.execute(`
      SELECT g.*, u.username AS seller_name, u.full_name AS seller_full_name,
             u.avatar_url AS seller_avatar, c.name AS category_name
      FROM gigs g
      JOIN users u ON g.seller_id = u.id
      JOIN categories c ON g.category_id = c.id
      WHERE g.is_active = TRUE
      ORDER BY g.total_orders DESC, g.created_at DESC
      LIMIT 8
    `);
    res.json(gigs);
  } catch (err) {
    console.error('Get trending error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/gigs/:id - Get single gig
router.get('/:id', async (req, res) => {
  try {
    const [gigs] = await db.execute(`
      SELECT g.*, u.username AS seller_name, u.full_name AS seller_full_name,
             u.avatar_url AS seller_avatar, u.bio AS seller_bio, u.country AS seller_country,
             c.name AS category_name
      FROM gigs g
      JOIN users u ON g.seller_id = u.id
      JOIN categories c ON g.category_id = c.id
      WHERE g.id = ? AND g.is_active = TRUE
    `, [req.params.id]);

    if (gigs.length === 0) return res.status(404).json({ error: 'Gig not found.' });

    // Fetch reviews for this gig
    const [reviews] = await db.execute(`
      SELECT r.*, u.username AS reviewer_name, u.avatar_url AS reviewer_avatar
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      WHERE r.gig_id = ?
      ORDER BY r.created_at DESC
    `, [req.params.id]);

    res.json({ ...gigs[0], reviews });
  } catch (err) {
    console.error('Get gig error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

const multer = require('multer');
const path = require('path');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// POST /api/gigs - Create new gig (sellers only)
router.post('/', verifyToken, isSeller, upload.single('image'), async (req, res) => {
  try {
    const { category_id, title, description, price, delivery_days, revisions } = req.body;
    let image_url = req.body.image_url || null;

    if (req.file) {
      image_url = `http://localhost:5001/uploads/${req.file.filename}`;
    }

    if (!title || !description || !price || !category_id) {
      return res.status(400).json({ error: 'Title, description, price, and category are required.' });
    }

    const [result] = await db.execute(
      'INSERT INTO gigs (seller_id, category_id, title, description, price, delivery_days, revisions, image_url) VALUES (?,?,?,?,?,?,?,?)',
      [req.user.id, category_id, title, description, price, delivery_days || 3, revisions || 1, image_url]
    );

    res.status(201).json({ message: 'Gig created successfully.', gigId: result.insertId });
  } catch (err) {
    console.error('Create gig error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/gigs/:id - Update gig
router.put('/:id', verifyToken, isSeller, upload.single('image'), async (req, res) => {
  try {
    const { title, description, price, delivery_days, revisions, category_id } = req.body;
    let image_url = req.body.image_url || null;

    if (req.file) {
      image_url = `http://localhost:5001/uploads/${req.file.filename}`;
    }

    // Verify ownership
    const [gigs] = await db.execute('SELECT seller_id, image_url as old_image FROM gigs WHERE id = ?', [req.params.id]);
    if (gigs.length === 0) return res.status(404).json({ error: 'Gig not found.' });
    if (gigs[0].seller_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You can only edit your own gigs.' });
    }

    // if image_url is not provided in req.body and no file uploaded, keep the old image
    if (!image_url && !req.file && !req.body.hasOwnProperty('image_url')) {
        image_url = gigs[0].old_image;
    }

    await db.execute(
      'UPDATE gigs SET title=?, description=?, price=?, delivery_days=?, revisions=?, image_url=?, category_id=? WHERE id=?',
      [title, description, price, delivery_days, revisions, image_url, category_id, req.params.id]
    );

    res.json({ message: 'Gig updated successfully.', image_url });
  } catch (err) {
    console.error('Update gig error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/gigs/:id - Delete gig
router.delete('/:id', verifyToken, isSeller, async (req, res) => {
  try {
    const [gigs] = await db.execute('SELECT seller_id FROM gigs WHERE id = ?', [req.params.id]);
    if (gigs.length === 0) return res.status(404).json({ error: 'Gig not found.' });
    if (gigs[0].seller_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You can only delete your own gigs.' });
    }

    // Hard delete
    await db.execute('DELETE FROM gigs WHERE id = ?', [req.params.id]);
    res.json({ message: 'Gig permanently deleted.' });
  } catch (err) {
    console.error('Delete gig error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/gigs/seller/:sellerId - Get gigs by seller
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const [gigs] = await db.execute(`
      SELECT g.*, c.name AS category_name
      FROM gigs g
      JOIN categories c ON g.category_id = c.id
      WHERE g.seller_id = ? AND g.is_active = TRUE
      ORDER BY g.created_at DESC
    `, [req.params.sellerId]);
    res.json(gigs);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
