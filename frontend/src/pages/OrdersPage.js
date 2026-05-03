import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getOrders, updateOrderStatus, createReview } from '../api';

const STATUS_COLORS = {
  pending: 'badge-pending', in_progress: 'badge-in_progress',
  completed: 'badge-completed', cancelled: 'badge-cancelled', disputed: 'badge-disputed'
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(user.role === 'seller' ? 'seller' : 'buyer');
  const [reviewing, setReviewing] = useState(null); // order being reviewed
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewMsg, setReviewMsg] = useState('');

  const loadOrders = useCallback(() => {
    setLoading(true);
    getOrders(view)
      .then(r => setOrders(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [view]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      setOrders(os => os.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status.');
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewing) return;
    try {
      await createReview({ order_id: reviewing.id, ...reviewForm });
      setReviewMsg('Review submitted!');
      setTimeout(() => { setReviewing(null); setReviewMsg(''); loadOrders(); }, 1500);
    } catch (err) {
      setReviewMsg(err.response?.data?.error || 'Failed to submit review.');
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>My Orders</h1>
        </div>

        {/* Toggle buyer/seller if seller account */}
        {user.role === 'seller' && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            <button
              className={`btn ${view === 'buyer' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setView('buyer')}
            >
              As Buyer
            </button>
            <button
              className={`btn ${view === 'seller' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setView('seller')}
            >
              As Seller
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <div className="text-center text-gray" style={{ padding: 80 }}>
            <div style={{ fontSize: 48 }}>📭</div>
            <h3 style={{ marginTop: 16 }}>No orders found</h3>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="card" style={{ marginBottom: 16, overflow: 'visible' }}>
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <Link to={`/orders/${order.id}`} style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-color)', textDecoration: 'none' }}>
                        {order.gig_title}
                      </Link>
                      <span className={`badge ${STATUS_COLORS[order.status]}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--gray)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      <span>Order #{order.id}</span>
                      <span>{view === 'seller' ? `👤 Buyer: ${order.buyer_username}` : `👨‍💼 Seller: ${order.seller_username}`}</span>
                      <span>📅 {new Date(order.created_at).toLocaleDateString()}</span>
                      {order.delivery_date && <span>🚚 Due: {new Date(order.delivery_date).toLocaleDateString()}</span>}
                    </div>
                    {order.requirements && (
                      <div style={{ marginTop: 8, fontSize: 13, background: 'var(--light)', padding: '8px 12px', borderRadius: 6 }}>
                        <strong>Requirements: </strong>{order.requirements}
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-head)', marginBottom: 8 }}>
                      ${parseFloat(order.price).toFixed(2)}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--gray)' }}>
                      💳 {order.payment_method || 'mock'} · {order.payment_status}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                  {/* Seller can mark as in_progress or completed */}
                  {view === 'seller' && order.status === 'pending' && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleStatusChange(order.id, 'in_progress')}
                    >
                      Start Order
                    </button>
                  )}
                  {view === 'seller' && order.status === 'in_progress' && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleStatusChange(order.id, 'completed')}
                    >
                      Mark Completed
                    </button>
                  )}
                  {/* Buyer can leave a review on completed orders */}
                  {view === 'buyer' && order.status === 'completed' && (
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => { setReviewing(order); setReviewMsg(''); }}
                    >
                      ⭐ Leave Review
                    </button>
                  )}
                  {/* Either can cancel pending */}
                  {order.status === 'pending' && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleStatusChange(order.id, 'cancelled')}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Review Modal */}
        {reviewing && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div style={{ background: 'white', borderRadius: 12, padding: 32, width: '90%', maxWidth: 440 }}>
              <h3 style={{ marginBottom: 4 }}>Leave a Review</h3>
              <p style={{ color: 'var(--gray)', fontSize: 14, marginBottom: 20 }}>{reviewing.gig_title}</p>

              <div className="form-group">
                <label>Rating</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1,2,3,4,5].map(n => (
                    <button
                      key={n}
                      onClick={() => setReviewForm(f => ({ ...f, rating: n }))}
                      style={{
                        width: 40, height: 40, borderRadius: '50%', border: 'none',
                        background: n <= reviewForm.rating ? '#ffbe00' : 'var(--light)',
                        fontSize: 18, cursor: 'pointer'
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Your Review</label>
                <textarea
                  className="form-control"
                  placeholder="Share your experience..."
                  rows={4}
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                />
              </div>

              {reviewMsg && (
                <div className={`alert ${reviewMsg.includes('submitted') ? 'alert-success' : 'alert-error'}`}>
                  {reviewMsg}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setReviewing(null)}>
                  Cancel
                </button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleReviewSubmit}>
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
