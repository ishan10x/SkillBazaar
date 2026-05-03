import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGigs, getCategories } from '../api';
import GigCard from '../components/GigCard';

const CATEGORY_ICONS = {
  'Web Development': '💻', 'Graphic Design': '🎨', 'Digital Marketing': '📈',
  'Video & Animation': '🎬', 'Writing & Translation': '✍️', 'Music & Audio': '🎵',
  'Data & Analytics': '📊', 'Mobile Apps': '📱',
};

export default function Home() {
  const navigate = useNavigate();
  const [gigs, setGigs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getGigs({ limit: 8 }), getCategories()])
      .then(([gigsRes, catRes]) => {
        setGigs(gigsRes.data);
        setCategories(catRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/gigs?search=${encodeURIComponent(search)}`);
  };

  return (
    <div>
      {/* ── Hero ─────────────────────────────── */}
      <section className="hero">
        <div className="container">
          <h1>Find the <span>perfect</span><br />freelance service</h1>
          <p>Connect with talented professionals for any project. Fast, affordable, and reliable.</p>
          <form className="hero-search" onSubmit={handleSearch}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search for any service..."
            />
            <button type="submit">Search</button>
          </form>
        </div>
      </section>

      {/* ── Categories ───────────────────────── */}
      <section className="categories-section">
        <div className="container">
          <h2>Explore by Category</h2>
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : (
            <div className="category-grid">
              {categories.map(cat => (
                <div
                  key={cat.id}
                  className="category-card"
                  onClick={() => navigate(`/gigs?category=${cat.id}`)}
                >
                  <div className="icon">{CATEGORY_ICONS[cat.name] || '📦'}</div>
                  <div className="name">{cat.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Featured Gigs ────────────────────── */}
      <section className="gigs-section">
        <div className="container">
          <div className="flex between center" style={{ marginBottom: 32 }}>
            <h2>Featured Services</h2>
            <button className="btn btn-outline" onClick={() => navigate('/gigs')}>
              View all →
            </button>
          </div>

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : gigs.length === 0 ? (
            <div className="text-center text-gray" style={{ padding: 60 }}>
              <div style={{ fontSize: 48 }}>📦</div>
              <p style={{ marginTop: 16 }}>No gigs available yet. Be the first to create one!</p>
              <button
                className="btn btn-primary mt-16"
                onClick={() => navigate('/create-gig')}
              >
                Create a Gig
              </button>
            </div>
          ) : (
            <div className="gig-grid">
              {gigs.map(gig => <GigCard key={gig.id} gig={gig} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────── */}
      <section style={{ background: '#f0faf5', padding: '56px 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: 32, marginBottom: 12 }}>Ready to earn on your skills?</h2>
          <p style={{ color: '#62646a', marginBottom: 24, fontSize: 16 }}>
            Join thousands of sellers and start offering your services today.
          </p>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/register')}
          >
            Become a Seller →
          </button>
        </div>
      </section>
    </div>
  );
}
