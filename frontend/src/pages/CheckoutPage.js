import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOffer, acceptOffer, getWalletBalance } from '../api';

export default function CheckoutPage() {
  const { offerId } = useParams();
  const navigate = useNavigate();
  const [offer, setOffer] = useState(null);
  const [walletBalance, setWalletBalance] = useState('0.00');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      getOffer(offerId),
      getWalletBalance()
    ]).then(([offerRes, walletRes]) => {
      setOffer(offerRes.data);
      setWalletBalance(parseFloat(walletRes.data.balance).toFixed(2));
      setLoading(false);
    }).catch(err => {
      setError(err.response?.data?.error || 'Failed to load checkout details');
      setLoading(false);
    });
  }, [offerId]);

  const handlePayment = async () => {
    setProcessing(true);
    setError('');
    try {
      const res = await acceptOffer(offerId);
      navigate(`/order-confirmation/${res.data.orderId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed. Please top up your wallet.');
      setProcessing(false);
    }
  };

  if (loading) return <div className="page"><div className="container loading-center"><div className="spinner" /></div></div>;
  if (error) return <div className="page"><div className="container"><div className="alert alert-danger">{error}</div></div></div>;
  if (!offer) return null;

  return (
    <div className="page" style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 70px)' }}>
      <div className="container" style={{ maxWidth: 600, padding: '40px 20px' }}>
        <h1 style={{ marginBottom: 30, textAlign: 'center' }}>Secure Checkout</h1>

        <div style={{ background: 'white', borderRadius: 16, padding: 30, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
          <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: 15, marginBottom: 20 }}>Order Summary</h3>
          
          <div style={{ display: 'flex', gap: 20, marginBottom: 30 }}>
            {offer.gig_image ? (
              <img src={offer.gig_image} alt={offer.gig_title} style={{ width: 100, height: 75, objectFit: 'cover', borderRadius: 8 }} />
            ) : (
              <div style={{ width: 100, height: 75, background: 'var(--light)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📦</div>
            )}
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: 18 }}>{offer.gig_title}</h4>
              <div style={{ color: 'var(--gray)', fontSize: 14 }}>Seller: @{offer.seller_username}</div>
              <div style={{ color: 'var(--gray)', fontSize: 14 }}>Delivery: {offer.delivery_days} Days</div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, marginBottom: 30 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: 'var(--gray)' }}>Custom Offer Price</span>
              <span>${parseFloat(offer.price).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: 'var(--gray)' }}>Service Fee</span>
              <span>$0.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTop: '1px dashed var(--border)', fontSize: 20, fontWeight: 700 }}>
              <span>Total</span>
              <span>${parseFloat(offer.price).toFixed(2)}</span>
            </div>
          </div>

          <div style={{ background: 'var(--light)', padding: 20, borderRadius: 12, marginBottom: 30 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ background: 'var(--green)', color: 'white', padding: 8, borderRadius: 8 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>SkillBazaar Wallet</div>
                  <div style={{ fontSize: 12, color: 'var(--gray)' }}>Available Balance: ${walletBalance}</div>
                </div>
              </div>
              {parseFloat(walletBalance) < parseFloat(offer.price) && (
                <span className="badge badge-danger">Insufficient</span>
              )}
            </div>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: 16, fontSize: 18, fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}
            onClick={handlePayment}
            disabled={processing || parseFloat(walletBalance) < parseFloat(offer.price)}
          >
            {processing ? (
              <><div className="spinner" style={{ width: 20, height: 20, borderWidth: 3 }} /> Processing...</>
            ) : parseFloat(walletBalance) < parseFloat(offer.price) ? (
              'Top Up Wallet to Pay'
            ) : (
              `Confirm & Pay $${parseFloat(offer.price).toFixed(2)}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
