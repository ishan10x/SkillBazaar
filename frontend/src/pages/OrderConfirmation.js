import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';

export default function OrderConfirmation() {
  const { orderId } = useParams();

  useEffect(() => {
    // Trigger confetti on load
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#1dbf73', '#ffffff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#1dbf73', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="page" style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', padding: '60px 40px', borderRadius: 20, textAlign: 'center', maxWidth: 500, boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
        <div style={{ width: 80, height: 80, background: '#e6f7ef', color: 'var(--green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 40 }}>
          ✓
        </div>
        <h1 style={{ marginBottom: 16 }}>Payment Successful!</h1>
        <p style={{ color: 'var(--gray)', fontSize: 16, marginBottom: 30, lineHeight: 1.6 }}>
          Thank you for your order. The seller has been notified and the work has officially started. Your order ID is <strong>#{orderId}</strong>.
        </p>
        
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <Link to={`/orders/${orderId}`} className="btn btn-primary">
            Track Order Status
          </Link>
          <Link to="/gigs" className="btn btn-outline">
            Continue Browsing
          </Link>
        </div>
      </div>
    </div>
  );
}
