import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toggleFavorite } from '../api';
import { useAuth } from '../context/AuthContext';

const ICONS = {
  'Web Development': '💻',
  'Graphic Design': '🎨',
  'Digital Marketing': '📈',
  'Video & Animation': '🎬',
  'Writing & Translation': '✍️',
  'Music & Audio': '🎵',
  'Data & Analytics': '📊',
  'Mobile Apps': '📱',
};

export default function GigCard({ gig, isFavorited = false, onFavoriteChange }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(isFavorited);
  const [loading, setLoading] = useState(false);

  const handleFavorite = async (e) => {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    setLoading(true);
    try {
      const res = await toggleFavorite(gig.id);
      setFavorited(res.data.favorited);
      if (onFavoriteChange) onFavoriteChange(gig.id, res.data.favorited);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card gig-card" onClick={() => navigate(`/gigs/${gig.id}`)}>
      <div className="gig-card-img">
        {gig.image_url
          ? <img src={gig.image_url} alt={gig.title} />
          : <span>{ICONS[gig.category_name] || '📦'}</span>
        }
      </div>

      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px 0', justifyContent: 'space-between' }}>
        <div className="gig-card-seller">
          <div className="avatar">
            {(gig.seller_name || gig.seller_full_name || 'S')[0].toUpperCase()}
          </div>
          <span className="seller-name">{gig.seller_full_name || gig.seller_name}</span>
        </div>
        <button
          className={`heart-btn ${favorited ? 'active' : ''}`}
          onClick={handleFavorite}
          disabled={loading}
          title={favorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          {favorited ? '❤️' : '🤍'}
        </button>
      </div>

      <div className="gig-card-body">
        <p className="gig-card-title">{gig.title}</p>
        <div className="gig-card-rating">
          <span className="star">★</span>
          <span>{gig.avg_rating > 0 ? parseFloat(gig.avg_rating).toFixed(1) : 'New'}</span>
          {gig.total_orders > 0 && <span>({gig.total_orders})</span>}
        </div>
        <div className="gig-card-price">
          From <strong>${parseFloat(gig.price).toFixed(2)}</strong>
        </div>
      </div>
    </div>
  );
}
