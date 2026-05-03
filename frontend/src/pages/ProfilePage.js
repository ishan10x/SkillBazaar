import React, { useState, useEffect } from 'react';
import { getMe, updateProfile, getSellerGigs, deleteGig } from '../api';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState({ text: '', type: '' });
  
  const [gigs, setGigs] = useState([]);
  const [loadingGigs, setLoadingGigs] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await getMe();
      setProfile(res.data);
      setForm({
        full_name: res.data.full_name || '',
        bio: res.data.bio || '',
        country: res.data.country || '',
        avatar_url: res.data.avatar_url || '',
        dob: res.data.dob ? res.data.dob.split('T')[0] : '',
        language: res.data.language || ''
      });
      if (res.data.role === 'seller') {
        loadGigs(res.data.id);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const loadGigs = async (id) => {
    setLoadingGigs(true);
    try {
      const res = await getSellerGigs(id);
      setGigs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingGigs(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });
    try {
      await updateProfile(form);
      setMsg({ text: 'Profile updated successfully!', type: 'success' });
      setEditing(false);
      loadProfile();
    } catch (err) {
      setMsg({ text: 'Failed to update profile.', type: 'error' });
    }
  };

  const handleDeleteGig = async (gigId) => {
    if (!window.confirm('Are you sure you want to delete this gig?')) return;
    try {
      await deleteGig(gigId);
      setGigs(gigs.filter(g => g.id !== gigId));
    } catch (err) {
      alert('Failed to delete gig.');
    }
  };

  if (loading) return <div className="page loading-center"><div className="spinner" /></div>;
  if (!profile) return null;

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      <div className="container" style={{ maxWidth: 900 }}>
        
        {/* Profile Section */}
        <div style={{ background: 'white', borderRadius: 16, padding: 40, boxShadow: 'var(--shadow)', marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 30 }}>
            <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
              <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--green)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 700, overflow: 'hidden' }}>
                {profile.avatar_url ? <img src={profile.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : profile.username[0].toUpperCase()}
              </div>
              <div>
                <h1 style={{ margin: '0 0 4px 0', fontSize: 28 }}>{profile.full_name || profile.username}</h1>
                <div style={{ color: 'var(--gray)', fontSize: 16 }}>@{profile.username} • {profile.role}</div>
              </div>
            </div>
            {!editing && (
              <button className="btn btn-outline" onClick={() => setEditing(true)}>Edit Profile</button>
            )}
          </div>

          {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

          {editing ? (
            <form onSubmit={handleProfileSubmit} style={{ marginTop: 24, padding: 24, background: 'var(--light)', borderRadius: 12 }}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" className="form-control" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Avatar URL</label>
                <input type="text" className="form-control" value={form.avatar_url} onChange={e => setForm({...form, avatar_url: e.target.value})} placeholder="https://..." />
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Country</label>
                  <input type="text" className="form-control" value={form.country} onChange={e => setForm({...form, country: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Date of Birth</label>
                  <input type="date" className="form-control" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Preferred Language</label>
                <select className="form-control" value={form.language || ''} onChange={e => setForm({...form, language: e.target.value})}>
                  <option value="">Select Language</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                </select>
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea className="form-control" rows={3} value={form.bio} onChange={e => setForm({...form, bio: e.target.value})}></textarea>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, marginTop: 24 }}>
              <div>
                <div style={{ color: 'var(--gray)', fontSize: 13, marginBottom: 4 }}>Country</div>
                <div style={{ fontWeight: 600 }}>{profile.country || 'Not specified'}</div>
              </div>
              <div>
                <div style={{ color: 'var(--gray)', fontSize: 13, marginBottom: 4 }}>Language</div>
                <div style={{ fontWeight: 600 }}>{profile.language || 'English'}</div>
              </div>
              <div>
                <div style={{ color: 'var(--gray)', fontSize: 13, marginBottom: 4 }}>Date of Birth</div>
                <div style={{ fontWeight: 600 }}>{profile.dob ? new Date(profile.dob).toLocaleDateString() : 'Not specified'}</div>
              </div>
              <div>
                <div style={{ color: 'var(--gray)', fontSize: 13, marginBottom: 4 }}>Member Since</div>
                <div style={{ fontWeight: 600 }}>{new Date(profile.created_at).toLocaleDateString()}</div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ color: 'var(--gray)', fontSize: 13, marginBottom: 4 }}>Bio</div>
                <div style={{ lineHeight: 1.6 }}>{profile.bio || 'No bio provided.'}</div>
              </div>
            </div>
          )}
        </div>

        {/* Gig Management (Sellers Only) */}
        {profile.role === 'seller' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2>My Gigs</h2>
              <Link to="/create-gig" className="btn btn-primary">+ Create New Gig</Link>
            </div>
            
            {loadingGigs ? (
              <div className="spinner" />
            ) : gigs.length === 0 ? (
              <div style={{ background: 'white', padding: 40, textAlign: 'center', borderRadius: 12, border: '1px dashed var(--border)' }}>
                You haven't created any gigs yet.
              </div>
            ) : (
              <div className="gig-grid">
                {gigs.map(gig => (
                  <div key={gig.id} className="card">
                    <div className="gig-card-img" style={{ height: 140 }}>
                      {gig.image_url ? <img src={gig.image_url} alt={gig.title} /> : '📦'}
                    </div>
                    <div className="card-body">
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, height: 42, overflow: 'hidden' }}>{gig.title}</div>
                      <div style={{ color: 'var(--green)', fontWeight: 700, marginBottom: 16 }}>${gig.price}</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {/* Note: In a real app we'd have an edit page, for now we just link to detail or delete */}
                        <Link to={`/gigs/${gig.id}`} className="btn btn-outline btn-sm" style={{ flex: 1 }}>View</Link>
                        <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={() => handleDeleteGig(gig.id)}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
