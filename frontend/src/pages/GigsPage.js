import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getGigs, getTrendingGigs, getCategories } from '../api';
import GigCard from '../components/GigCard';

const RECENT_KEY = 'sb_recent_searches';
const MAX_RECENT = 6;

function saveRecentSearch(term) {
  if (!term.trim()) return;
  const saved = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  const updated = [term, ...saved.filter(s => s !== term)].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
}

function getRecentSearches() {
  return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
}

function removeRecentSearch(term) {
  const saved = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  localStorage.setItem(RECENT_KEY, JSON.stringify(saved.filter(s => s !== term)));
}

export default function GigsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [gigs, setGigs] = useState([]);
  const [trendingGigs, setTrendingGigs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentSearches, setRecentSearches] = useState(getRecentSearches());
  const [showRecent, setShowRecent] = useState(false);
  const searchRef = useRef(null);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: '',
    maxPrice: '',
  });

  useEffect(() => {
    getCategories().then(r => setCategories(r.data)).catch(console.error);
    getTrendingGigs().then(r => setTrendingGigs(r.data)).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filters.search)   params.search   = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;

    getGigs(params)
      .then(r => setGigs(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters]);

  // Close recent dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowRecent(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleFilter = (key, val) => {
    setFilters(f => ({ ...f, [key]: val }));
  };

  const applySearch = (term) => {
    saveRecentSearch(term);
    setRecentSearches(getRecentSearches());
    setShowRecent(false);
    setFilters(f => ({ ...f, search: term }));
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      applySearch(filters.search);
    }
  };

  const handleRemoveRecent = (e, term) => {
    e.stopPropagation();
    removeRecentSearch(term);
    setRecentSearches(getRecentSearches());
  };

  const isSearchActive = filters.search || filters.category || filters.minPrice || filters.maxPrice;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>Browse Services</h1>
          <p className="text-gray">{gigs.length} services available</p>
        </div>

        {/* ── Search + Filters ── */}
        <div className="filter-bar">
          <div ref={searchRef} style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <input
              placeholder="🔍 Search services..."
              value={filters.search}
              onChange={e => handleFilter('search', e.target.value)}
              onFocus={() => setShowRecent(true)}
              onKeyDown={handleSearchKeyDown}
              style={{ width: '100%' }}
            />
            {/* Recent Searches Dropdown */}
            {showRecent && recentSearches.length > 0 && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 100,
                background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12,
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)', overflow: 'hidden'
              }}>
                <div style={{ padding: '10px 16px 6px', fontSize: 11, fontWeight: 700, color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Recent Searches
                </div>
                {recentSearches.map(term => (
                  <div
                    key={term}
                    onClick={() => applySearch(term)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 16px', cursor: 'pointer', fontSize: 14,
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--light)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span>🕐 {term}</span>
                    <button
                      onClick={e => handleRemoveRecent(e, term)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray)', fontSize: 16, lineHeight: 1 }}
                      title="Remove"
                    >×</button>
                  </div>
                ))}
                <div
                  onClick={() => { localStorage.removeItem(RECENT_KEY); setRecentSearches([]); setShowRecent(false); }}
                  style={{ padding: '8px 16px 10px', fontSize: 12, color: 'var(--danger)', cursor: 'pointer', borderTop: '1px solid var(--border)', textAlign: 'center' }}
                >
                  Clear all recent searches
                </div>
              </div>
            )}
          </div>

          <select value={filters.category} onChange={e => handleFilter('category', e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            type="number" placeholder="Min price ($)"
            value={filters.minPrice} onChange={e => handleFilter('minPrice', e.target.value)}
            style={{ width: 120 }}
          />
          <input
            type="number" placeholder="Max price ($)"
            value={filters.maxPrice} onChange={e => handleFilter('maxPrice', e.target.value)}
            style={{ width: 120 }}
          />
          <button className="btn btn-outline btn-sm" onClick={() => setFilters({ search: '', category: '', minPrice: '', maxPrice: '' })}>
            Clear
          </button>
        </div>

        {/* ── Trending Gigs Section (shown only when no active filters) ── */}
        {!isSearchActive && trendingGigs.length > 0 && (
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span style={{ fontSize: 22 }}>🔥</span>
              <h2 style={{ margin: 0 }}>Trending Right Now</h2>
              <span style={{
                background: 'linear-gradient(135deg, #ff6b35, #f7c59f)',
                color: 'white', fontSize: 11, fontWeight: 700,
                padding: '3px 10px', borderRadius: 20, letterSpacing: 0.5
              }}>HOT</span>
            </div>
            <div className="gig-grid">
              {trendingGigs.map(gig => (
                <div key={gig.id} style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute', top: 10, left: 10, zIndex: 10,
                    background: 'linear-gradient(135deg, #ff6b35, #f7c59f)',
                    color: 'white', fontSize: 11, fontWeight: 700,
                    padding: '3px 8px', borderRadius: 8
                  }}>🔥 Trending</div>
                  <GigCard gig={gig} />
                </div>
              ))}
            </div>
            <div style={{ margin: '32px 0', borderBottom: '1px solid var(--border)' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span style={{ fontSize: 22 }}>✨</span>
              <h2 style={{ margin: 0 }}>All Services</h2>
            </div>
          </div>
        )}

        {/* ── All / Filtered Gigs ── */}
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : gigs.length === 0 ? (
          <div className="text-center text-gray" style={{ padding: 80 }}>
            <div style={{ fontSize: 48 }}>🔍</div>
            <h3 style={{ marginTop: 16 }}>No services found</h3>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          <div className="gig-grid">
            {gigs.map(gig => <GigCard key={gig.id} gig={gig} />)}
          </div>
        )}
      </div>
    </div>
  );
}
