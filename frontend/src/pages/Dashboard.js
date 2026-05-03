import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getOrders, getSellerGigs, getFavorites, deleteGig, getPortfolios, addPortfolio, deletePortfolio } from '../api';
import GigCard from '../components/GigCard';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [myGigs, setMyGigs] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [myPortfolios, setMyPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  // Add Portfolio State
  const [showAddPort, setShowAddPort] = useState(false);
  const [portForm, setPortForm] = useState({ title: '', description: '', image_url: '', link: '' });

  useEffect(() => {
    const promises = [
      getOrders(user.role === 'seller' ? 'seller' : 'buyer'),
      getFavorites()
    ];
    if (user.role === 'seller') {
      promises.push(getSellerGigs(user.id));
      promises.push(getPortfolios(user.id));
    }

    Promise.all(promises)
      .then(([ordersRes, favsRes, gigsRes, portRes]) => {
        setOrders(ordersRes.data);
        setFavorites(favsRes.data);
        if (gigsRes) setMyGigs(gigsRes.data);
        if (portRes) setMyPortfolios(portRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleDeleteGig = async (gigId) => {
    if (!window.confirm('Delete this gig?')) return;
    setDeleting(gigId);
    try {
      await deleteGig(gigId);
      setMyGigs(gs => gs.filter(g => g.id !== gigId));
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed.');
    } finally {
      setDeleting(null);
    }
  };

  const handleAddPortfolio = async (e) => {
    e.preventDefault();
    try {
      const res = await addPortfolio(portForm);
      setMyPortfolios([{ ...portForm, id: res.data.id }, ...myPortfolios]);
      setShowAddPort(false);
      setPortForm({ title: '', description: '', image_url: '', link: '' });
    } catch (err) {
      alert('Failed to add portfolio item');
    }
  };

  const handleDeletePortfolio = async (id) => {
    if (!window.confirm('Delete this portfolio item?')) return;
    try {
      await deletePortfolio(id);
      setMyPortfolios(ps => ps.filter(p => p.id !== id));
    } catch(err) {
      alert('Failed to delete item');
    }
  };

  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const pendingOrders   = orders.filter(o => o.status === 'pending' || o.status === 'in_progress').length;
  const earnings        = orders.filter(o => o.status === 'completed').reduce((s, o) => s + parseFloat(o.price), 0);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header flex between center">
          <div>
            <h1>Dashboard</h1>
            <p className="text-gray">Welcome back, {user.full_name || user.username}!</p>
          </div>
          {user.role === 'seller' && (
            <Link to="/create-gig" className="btn btn-primary">+ New Gig</Link>
          )}
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="num">{orders.length}</div>
            <div className="label">Total Orders</div>
          </div>
          <div className="stat-card">
            <div className="num">{pendingOrders}</div>
            <div className="label">Active Orders</div>
          </div>
          <div className="stat-card">
            <div className="num">{completedOrders}</div>
            <div className="label">Completed</div>
          </div>
          {user.role === 'seller' ? (
            <>
              <div className="stat-card">
                <div className="num">${earnings.toFixed(0)}</div>
                <div className="label">Total Earnings</div>
              </div>
              <div className="stat-card">
                <div className="num">{myGigs.length}</div>
                <div className="label">Active Gigs</div>
              </div>
            </>
          ) : (
            <div className="stat-card">
              <div className="num">{favorites.length}</div>
              <div className="label">Saved Gigs</div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: '2px solid var(--border)', marginBottom: 24, display: 'flex', gap: 16 }}>
          {[
            { id: 'overview', label: '📋 Recent Orders' },
            ...(user.role === 'seller' ? [{ id: 'gigs', label: '🎯 My Gigs' }] : []),
            ...(user.role === 'seller' ? [{ id: 'portfolio', label: '📁 Portfolio' }] : []),
            { id: 'favorites', label: '❤️ Favorites' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '10px 0px', border: 'none', background: 'none',
                fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
                color: tab === t.id ? 'var(--green)' : 'var(--gray)',
                borderBottom: tab === t.id ? '2px solid var(--green)' : '2px solid transparent',
                cursor: 'pointer', marginBottom: -2
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === 'overview' && (
          <div>
            {orders.length === 0 ? (
              <div className="text-center text-gray" style={{ padding: 60 }}>
                <div style={{ fontSize: 40 }}>📭</div>
                <p style={{ marginTop: 12 }}>No orders yet.</p>
                <button className="btn btn-primary mt-16" onClick={() => navigate('/gigs')}>
                  Browse Services
                </button>
              </div>
            ) : orders.slice(0, 5).map(o => (
              <div key={o.id} className="order-row" onClick={() => navigate('/orders')} style={{ cursor: 'pointer' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{o.gig_title}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray)' }}>
                    {user.role === 'seller' ? `Buyer: ${o.buyer_username}` : `Seller: ${o.seller_username}`}
                    {' · '}{new Date(o.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <strong>${parseFloat(o.price).toFixed(2)}</strong>
                  <span className={`badge badge-${o.status}`}>{o.status.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
            {orders.length > 5 && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <button className="btn btn-outline" onClick={() => navigate('/orders')}>
                  View all orders →
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'gigs' && user.role === 'seller' && (
          <div>
            {myGigs.length === 0 ? (
              <div className="text-center text-gray" style={{ padding: 60 }}>
                <div style={{ fontSize: 40 }}>🎯</div>
                <p style={{ marginTop: 12 }}>You haven't created any gigs yet.</p>
                <button className="btn btn-primary mt-16" onClick={() => navigate('/create-gig')}>
                  Create Your First Gig
                </button>
              </div>
            ) : (
              <div className="gig-grid">
                {myGigs.map(gig => (
                  <div key={gig.id} style={{ position: 'relative' }}>
                    <GigCard gig={gig} />
                    <div style={{ display: 'flex', gap: 8, padding: '8px 16px', borderTop: '1px solid var(--border)' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => navigate(`/gigs/${gig.id}`)}
                      >
                        View
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => handleDeleteGig(gig.id)}
                        disabled={deleting === gig.id}
                      >
                        {deleting === gig.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'portfolio' && user.role === 'seller' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button className="btn btn-outline" onClick={() => setShowAddPort(true)}>+ Add Portfolio Item</button>
            </div>
            {myPortfolios.length === 0 ? (
              <div className="text-center text-gray" style={{ padding: 60 }}>
                <div style={{ fontSize: 40 }}>📁</div>
                <p style={{ marginTop: 12 }}>Your portfolio is empty.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                {myPortfolios.map(p => (
                  <div key={p.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
                    {p.image_url && <img src={p.image_url} alt={p.title} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 6, marginBottom: 12 }} />}
                    <h4 style={{ margin: '0 0 8px 0' }}>{p.title}</h4>
                    <p style={{ fontSize: 14, color: 'var(--gray)', margin: '0 0 12px 0' }}>{p.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {p.link ? <a href={p.link} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: 'var(--green)' }}>View Link</a> : <span />}
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeletePortfolio(p.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'favorites' && (
          <div>
            {favorites.length === 0 ? (
              <div className="text-center text-gray" style={{ padding: 60 }}>
                <div style={{ fontSize: 40 }}>🤍</div>
                <p style={{ marginTop: 12 }}>You haven't saved any gigs yet.</p>
                <button className="btn btn-primary mt-16" onClick={() => navigate('/gigs')}>
                  Browse Services
                </button>
              </div>
            ) : (
              <div className="gig-grid">
                {favorites.map(gig => <GigCard key={gig.id} gig={gig} isFavorited={true} />)}
              </div>
            )}
          </div>
        )}

        {/* ── Add Portfolio Modal ── */}
        {showAddPort && (
          <div className="modal-overlay">
            <div className="modal" style={{ maxWidth: 500 }}>
              <div className="modal-header">
                <h2>Add Portfolio Item</h2>
                <button className="close-btn" onClick={() => setShowAddPort(false)}>×</button>
              </div>
              <form onSubmit={handleAddPortfolio} className="modal-body">
                <div className="form-group">
                  <label>Title</label>
                  <input required value={portForm.title} onChange={e => setPortForm({ ...portForm, title: e.target.value })} placeholder="Project name..." />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea rows="3" value={portForm.description} onChange={e => setPortForm({ ...portForm, description: e.target.value })} placeholder="What did you do?" />
                </div>
                <div className="form-group">
                  <label>Image URL (Optional)</label>
                  <input type="url" value={portForm.image_url} onChange={e => setPortForm({ ...portForm, image_url: e.target.value })} placeholder="https://..." />
                </div>
                <div className="form-group">
                  <label>Project Link (Optional)</label>
                  <input type="url" value={portForm.link} onChange={e => setPortForm({ ...portForm, link: e.target.value })} placeholder="https://..." />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 16 }}>Save Portfolio</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
