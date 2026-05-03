const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/auth');

// POST /api/orders - Place an order
router.post('/', verifyToken, async (req, res) => {
  try {
    const { gig_id, requirements } = req.body;

    if (!gig_id) return res.status(400).json({ error: 'Gig ID is required.' });

    // Fetch gig details
    const [gigs] = await db.execute(
      'SELECT id, seller_id, price, delivery_days, is_active FROM gigs WHERE id = ?',
      [gig_id]
    );
    if (gigs.length === 0) return res.status(404).json({ error: 'Gig not found.' });
    if (!gigs[0].is_active) return res.status(400).json({ error: 'This gig is no longer available.' });

    const gig = gigs[0];

    if (gig.seller_id === req.user.id) {
      return res.status(400).json({ error: 'You cannot order your own gig.' });
    }

    // Calculate delivery date
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + gig.delivery_days);

    // Create order
    const [orderResult] = await db.execute(
      'INSERT INTO orders (gig_id, buyer_id, seller_id, price, delivery_date, requirements) VALUES (?,?,?,?,?,?)',
      [gig_id, req.user.id, gig.seller_id, gig.price, deliveryDate.toISOString().split('T')[0], requirements || null]
    );

    const orderId = orderResult.insertId;

    // Create payment record (mock)
    const txnId = 'TXN-' + Date.now();
    await db.execute(
      'INSERT INTO payments (order_id, buyer_id, amount, method, status, transaction_id) VALUES (?,?,?,?,?,?)',
      [orderId, req.user.id, gig.price, 'mock', 'completed', txnId]
    );

    // Update gig total_orders
    await db.execute('UPDATE gigs SET total_orders = total_orders + 1 WHERE id = ?', [gig_id]);

    res.status(201).json({
      message: 'Order placed successfully!',
      orderId,
      transactionId: txnId
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/orders - Get orders for current user (buyer or seller)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { role } = req.query;
    let query = `
      SELECT o.*,
             g.title AS gig_title, g.image_url AS gig_image,
             buyer.username AS buyer_username, buyer.full_name AS buyer_name,
             seller.username AS seller_username, seller.full_name AS seller_name,
             p.status AS payment_status, p.transaction_id
      FROM orders o
      JOIN gigs g ON o.gig_id = g.id
      JOIN users buyer ON o.buyer_id = buyer.id
      JOIN users seller ON o.seller_id = seller.id
      LEFT JOIN payments p ON o.id = p.order_id
      WHERE
    `;

    let params = [];
    if (role === 'seller') {
      query += 'o.seller_id = ?';
      params.push(req.user.id);
    } else {
      query += 'o.buyer_id = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY o.created_at DESC';

    const [orders] = await db.execute(query, params);
    res.json(orders);
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/orders/:id - Get single order
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const [orders] = await db.execute(`
      SELECT o.*,
             g.title AS gig_title, g.description AS gig_description, g.image_url AS gig_image,
             buyer.username AS buyer_username, buyer.full_name AS buyer_name, buyer.email AS buyer_email,
             seller.username AS seller_username, seller.full_name AS seller_name,
             p.status AS payment_status, p.transaction_id, p.method AS payment_method
      FROM orders o
      JOIN gigs g ON o.gig_id = g.id
      JOIN users buyer ON o.buyer_id = buyer.id
      JOIN users seller ON o.seller_id = seller.id
      LEFT JOIN payments p ON o.id = p.order_id
      WHERE o.id = ? AND (o.buyer_id = ? OR o.seller_id = ?)
    `, [req.params.id, req.user.id, req.user.id]);

    if (orders.length === 0) return res.status(404).json({ error: 'Order not found.' });
    res.json(orders[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled', 'disputed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    const [orders] = await db.execute(
      'SELECT buyer_id, seller_id, price, status AS current_status FROM orders WHERE id = ?',
      [req.params.id]
    );
    if (orders.length === 0) return res.status(404).json({ error: 'Order not found.' });

    const order = orders[0];
    if (order.buyer_id !== req.user.id && order.seller_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    if (order.current_status === 'completed') {
       return res.status(400).json({ error: 'Order is already completed.' });
    }

    await db.execute('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);

    // Create notification
    const recipientId = order.buyer_id === req.user.id ? order.seller_id : order.buyer_id;
    let message = `Order #${req.params.id} status updated to ${status.replace('_', ' ')}.`;
    if (status === 'completed') message = `Order #${req.params.id} has been delivered! 🎉`;
    if (status === 'in_progress') message = `Order #${req.params.id} is now in progress.`;

    await db.execute(
      'INSERT INTO notifications (user_id, message, link) VALUES (?, ?, ?)',
      [recipientId, message, `/orders/${req.params.id}`]
    );

    if (status === 'completed') {
      const price = parseFloat(order.price);
      const earnings = price * 0.9; // 10% platform fee
      
      await db.execute('UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?', [earnings, order.seller_id]);
      await db.execute(
        'INSERT INTO wallet_transactions (user_id, amount, type, description) VALUES (?, ?, ?, ?)',
        [order.seller_id, earnings, 'earnings', `Earnings from Order #${req.params.id}`]
      );
    }

    res.json({ message: 'Order status updated.' });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
