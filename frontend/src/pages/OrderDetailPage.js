import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder, updateOrderStatus } from '../api';
import { useAuth } from '../context/AuthContext';

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(orderId)
      .then(res => setOrder(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleUpdateStatus = async (status) => {
    try {
      await updateOrderStatus(orderId, status);
      setOrder({ ...order, status });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  if (loading) return <div className="page loading-center"><div className="spinner" /></div>;
  if (!order) return <div className="page container"><div className="alert alert-danger">Order not found.</div></div>;

  const isSeller = user.id === order.seller_id;
  const isBuyer = user.id === order.buyer_id;

  // Timeline Logic
  const steps = [
    { label: 'Order Placed', icon: '📝', active: true, time: order.created_at },
    { label: 'In Progress', icon: '⚙️', active: order.status === 'in_progress' || order.status === 'completed', time: order.status === 'in_progress' ? order.updated_at : null },
    { label: 'Delivered', icon: '🎉', active: order.status === 'completed', time: order.status === 'completed' ? order.updated_at : null }
  ];

  if (order.status === 'cancelled') {
    steps[1] = { label: 'Cancelled', icon: '❌', active: true, error: true, time: order.updated_at };
    steps[2] = { label: 'Cancelled', icon: '❌', active: false };
  }

  return (
    <div className="page" style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 70px)' }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .printable-receipt, .printable-receipt * { visibility: visible; }
          .printable-receipt { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>
      <div className="container printable-receipt" style={{ maxWidth: 800, padding: '40px 20px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
          <div>
            <h1 style={{ marginBottom: 4 }}>Order #{order.id}</h1>
            <div style={{ color: 'var(--gray)' }}>{order.gig_title}</div>
          </div>
          <div className="no-print" style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-primary" onClick={() => window.print()}>⬇️ Download Receipt</button>
            <Link to="/orders" className="btn btn-outline btn-sm">← Back to Orders</Link>
          </div>
        </div>

        {/* ── Progress Tracker ── */}
        <div style={{ background: 'white', borderRadius: 16, padding: 30, marginBottom: 30, boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: 30, textAlign: 'center' }}>Order Status</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
            {/* Progress Line */}
            <div style={{ position: 'absolute', top: 24, left: 40, right: 40, height: 4, background: 'var(--light)', zIndex: 1 }} />
            <div style={{ 
              position: 'absolute', top: 24, left: 40, 
              width: order.status === 'completed' ? 'calc(100% - 80px)' : order.status === 'in_progress' ? '50%' : '0%', 
              height: 4, background: order.status === 'cancelled' ? 'var(--danger)' : 'var(--green)', zIndex: 2,
              transition: 'width 0.5s ease'
            }} />

            {steps.map((step, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, position: 'relative', width: 80 }}>
                <div style={{ 
                  width: 48, height: 48, borderRadius: '50%', background: step.error ? 'var(--danger)' : step.active ? 'var(--green)' : 'var(--light)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                  boxShadow: step.active ? '0 0 0 4px rgba(29, 191, 115, 0.2)' : 'none',
                  transition: 'all 0.3s ease',
                  border: step.active ? 'none' : '2px solid var(--border)'
                }}>
                  {step.icon}
                </div>
                <div style={{ marginTop: 12, fontWeight: 600, fontSize: 14, textAlign: 'center', color: step.active ? 'var(--text-color)' : 'var(--gray)' }}>
                  {step.label}
                </div>
                {step.time && (
                  <div style={{ fontSize: 11, color: 'var(--gray)', textAlign: 'center', marginTop: 4, whiteSpace: 'nowrap' }}>
                    {new Date(step.time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons based on Role and Status */}
          <div className="no-print" style={{ marginTop: 40, display: 'flex', justifyContent: 'center', gap: 12 }}>
            {isSeller && order.status === 'pending' && (
              <button className="btn btn-primary" onClick={() => handleUpdateStatus('in_progress')}>Acknowledge & Start Work</button>
            )}
            {isSeller && order.status === 'in_progress' && (
              <button className="btn btn-primary" onClick={() => handleUpdateStatus('completed')}>Deliver Final Work</button>
            )}
            {isBuyer && order.status === 'completed' && (
              <Link to="/orders" className="btn btn-outline">Leave a Review in Orders Page</Link>
            )}
            {order.status === 'pending' && (
               <button className="btn btn-danger" onClick={() => handleUpdateStatus('cancelled')}>Cancel Order</button>
            )}
          </div>
        </div>

        {/* ── Order Details ── */}
        <div style={{ background: 'white', borderRadius: 16, padding: 30, boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
          <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: 15, marginBottom: 20 }}>Order Details</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            <div>
              <div style={{ color: 'var(--gray)', fontSize: 13, marginBottom: 4 }}>Gig Title</div>
              <div style={{ fontWeight: 600 }}>{order.gig_title}</div>
            </div>
            <div>
              <div style={{ color: 'var(--gray)', fontSize: 13, marginBottom: 4 }}>Price</div>
              <div style={{ fontWeight: 600 }}>${parseFloat(order.price).toFixed(2)}</div>
            </div>
            <div>
              <div style={{ color: 'var(--gray)', fontSize: 13, marginBottom: 4 }}>Date Placed</div>
              <div style={{ fontWeight: 600 }}>{new Date(order.created_at).toLocaleDateString()}</div>
            </div>
            <div>
              <div style={{ color: 'var(--gray)', fontSize: 13, marginBottom: 4 }}>Expected Delivery</div>
              <div style={{ fontWeight: 600 }}>{order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'N/A'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--gray)', fontSize: 13, marginBottom: 4 }}>Buyer</div>
              <div style={{ fontWeight: 600 }}>@{order.buyer_username}</div>
            </div>
            <div>
              <div style={{ color: 'var(--gray)', fontSize: 13, marginBottom: 4 }}>Seller</div>
              <div style={{ fontWeight: 600 }}>@{order.seller_username}</div>
            </div>
          </div>

          {order.requirements && (
            <div style={{ marginTop: 24 }}>
              <div style={{ color: 'var(--gray)', fontSize: 13, marginBottom: 8 }}>Requirements Provided</div>
              <div style={{ background: 'var(--light)', padding: 16, borderRadius: 8, whiteSpace: 'pre-wrap', fontSize: 14 }}>
                {order.requirements}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
