import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGig, createOrder, toggleFavorite } from '../api';
import { useAuth } from '../context/AuthContext';

export default function GigDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [gig, setGig]           = useState(null);
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [requirements, setReqs] = useState('');
  const [message, setMessage]   = useState('');
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    getGig(id)
      .then(async r => {
        setGig(r.data);
        try {
          const portRes = await import('../api').then(m => m.getPortfolios(r.data.seller_id));
          setPortfolios(portRes.data);
        } catch(e) {}
      })
      .catch(() => navigate('/gigs'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRequestOrder = async () => {
    if (!user) { navigate('/login'); return; }
    if (!requirements.trim()) {
      setMessage('Please describe your requirements first.');
      return;
    }
    setOrdering(true);
    setMessage('');
    try {
      const { sendMessage } = await import('../api');
      await sendMessage({ 
        receiver_id: gig.seller_id, 
        content: `I would like to request to order "${gig.title}".\n\nMy Requirements:\n${requirements}` 
      });
      setMessage(`✅ Request sent! Redirecting to messages...`);
      setTimeout(() => navigate('/messages', { state: { autoSelectUserId: gig.seller_id } }), 1500);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to place request.');
    } finally {
      setOrdering(false);
    }
  };

  const handleFav = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const res = await toggleFavorite(gig.id);
      setFavorited(res.data.favorited);
    } catch {}
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!gig)    return null;

  const stars = '★'.repeat(Math.round(gig.avg_rating || 0)) + '☆'.repeat(5 - Math.round(gig.avg_rating || 0));

  return (
    <div className="page">
      <div className="container">
        <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 24 }}>
          ← Back
        </button>

        <div className="gig-detail-layout">
          {/* ── Left: Info ─────────────────────── */}
          <div className="gig-detail-main">
            <h1>{gig.title}</h1>

            <div className="seller-info">
              <div className="avatar" style={{ width:48, height:48, borderRadius:'50%', background:'var(--green)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:700 }}>
                {(gig.seller_full_name || gig.seller_name || 'S')[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>{gig.seller_full_name || gig.seller_name}</div>
                <div style={{ fontSize: 13, color: 'var(--gray)' }}>@{gig.seller_name} · {gig.seller_country}</div>
                {gig.seller_bio && <div style={{ fontSize: 13, marginTop: 4 }}>{gig.seller_bio}</div>}
              </div>
            </div>

            <div className="gig-detail-img">
              {gig.image_url ? <img src={gig.image_url} alt={gig.title} /> : '📦'}
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                <span style={{ color:'#ffbe00' }}>{stars}</span>
                <strong>{gig.avg_rating > 0 ? parseFloat(gig.avg_rating).toFixed(1) : 'No ratings yet'}</strong>
                {gig.total_orders > 0 && <span className="text-gray">({gig.total_orders} orders)</span>}
                <span className="text-gray" style={{ marginLeft: 'auto' }}>
                  📁 {gig.category_name}
                </span>
              </div>
            </div>

            <h3 style={{ marginBottom: 12 }}>About This Service</h3>
            <p style={{ color: '#444', lineHeight: 1.8, marginBottom: 32 }}>{gig.description}</p>

            {/* ── Portfolios ───────────────────────── */}
            <h3 style={{ marginBottom: 16 }}>Seller's Portfolio</h3>
            {portfolios.length === 0 ? (
              <p className="text-gray" style={{ marginBottom: 32 }}>No portfolio items yet.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
                {portfolios.map(p => (
                  <div key={p.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 12, background: 'var(--light)' }}>
                    {p.image_url && <img src={p.image_url} alt={p.title} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 4, marginBottom: 8 }} />}
                    <h4 style={{ margin: '0 0 4px 0', fontSize: 14 }}>{p.title}</h4>
                    <p style={{ fontSize: 12, color: 'var(--gray)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description}</p>
                    {p.link && <a href={p.link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--green)', marginTop: 8, display: 'inline-block', fontWeight: 600 }}>Visit Link ↗</a>}
                  </div>
                ))}
              </div>
            )}

            {/* ── Reviews ───────────────────────── */}
            <h3 style={{ marginBottom: 16 }}>Reviews ({gig.reviews?.length || 0})</h3>
            {gig.reviews?.length === 0 ? (
              <p className="text-gray">No reviews yet.</p>
            ) : (
              gig.reviews?.map(r => (
                <div key={r.id} className="review-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--green)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13 }}>
                      {(r.reviewer_name || 'U')[0].toUpperCase()}
                    </div>
                    <strong>{r.reviewer_name}</strong>
                  </div>
                  <div className="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                  <p style={{ fontSize: 14, color: '#444' }}>{r.comment}</p>
                  <p style={{ fontSize: 12, color: 'var(--gray)', marginTop: 6 }}>
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* ── Right: Order Card ──────────────── */}
          <div>
            <div className="order-card">
              <div className="price">${parseFloat(gig.price).toFixed(2)}</div>

              <div className="order-meta">
                <div>
                  <div className="label">⏱ Delivery</div>
                  <div className="val">{gig.delivery_days} days</div>
                </div>
                <div>
                  <div className="label">🔁 Revisions</div>
                  <div className="val">{gig.revisions}</div>
                </div>
                <div>
                  <div className="label">📦 Orders</div>
                  <div className="val">{gig.total_orders}</div>
                </div>
              </div>

              <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid var(--border)' }} />

              {user && user.id !== gig.seller_id ? (
                <>
                  <div className="form-group">
                    <label>Your Requirements</label>
                    <textarea
                      className="form-control"
                      placeholder="Describe what you need in detail..."
                      rows={4}
                      value={requirements}
                      onChange={e => setReqs(e.target.value)}
                    />
                  </div>

                  {message && (
                    <div className={`alert ${message.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>
                      {message}
                    </div>
                  )}

                  <button
                    className="btn btn-primary btn-block btn-lg"
                    onClick={handleRequestOrder}
                    disabled={ordering}
                  >
                    {ordering ? <><span className="spinner" style={{width:16,height:16}} /> Sending...</> : `Request to Order — $${parseFloat(gig.price).toFixed(2)}`}
                  </button>

                  <button
                    className={`btn btn-outline btn-block mt-16`}
                    onClick={handleFav}
                  >
                    {favorited ? '❤️ Saved to Favorites' : '🤍 Save to Favorites'}
                  </button>
                </>
              ) : !user ? (
                <>
                  <button className="btn btn-primary btn-block btn-lg" onClick={() => navigate('/login')}>
                    Sign In to Order
                  </button>
                </>
              ) : (
                <div className="alert alert-info">This is your own gig.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
