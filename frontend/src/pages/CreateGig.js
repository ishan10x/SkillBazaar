import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGig, getCategories } from '../api';
import { useAuth } from '../context/AuthContext';

export default function CreateGig() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', price: '', delivery_days: 3,
    revisions: 1, category_id: '', image: null, image_url: ''
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCategories().then(r => setCategories(r.data)).catch(console.error);
  }, []);

  if (user.role !== 'seller') {
    return (
      <div className="page">
        <div className="container text-center">
          <div style={{ padding: 80 }}>
            <div style={{ fontSize: 48 }}>🚫</div>
            <h2 style={{ marginTop: 16 }}>Seller Account Required</h2>
            <p className="text-gray" style={{ marginTop: 8 }}>
              Only sellers can create gigs. Register as a seller to get started.
            </p>
            <button className="btn btn-primary mt-24" onClick={() => navigate('/register')}>
              Register as Seller
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = e => {
    if (e.target.name === 'image') {
      const file = e.target.files[0];
      setForm({ ...form, image: file });
      setPreviewUrl(file ? URL.createObjectURL(file) : null);
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.category_id) { setError('Please select a category.'); return; }
    if (parseFloat(form.price) <= 0) { setError('Price must be greater than 0.'); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('price', parseFloat(form.price));
      formData.append('delivery_days', parseInt(form.delivery_days));
      formData.append('revisions', parseInt(form.revisions));
      formData.append('category_id', parseInt(form.category_id));
      if (form.image) {
        formData.append('image', form.image);
      } else if (form.image_url) {
        formData.append('image_url', form.image_url);
      }

      const res = await createGig(formData);
      setSuccess(`Gig created successfully! ID: ${res.data.gigId}`);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create gig.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div className="page-header">
            <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
              ← Back
            </button>
            <h1>Create a New Gig</h1>
            <p className="text-gray">Fill in the details to list your service</p>
          </div>

          <div className="card">
            <div className="card-body" style={{ padding: 32 }}>
              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Gig Title *</label>
                  <input
                    className="form-control"
                    name="title"
                    placeholder="e.g. I will build a React web application"
                    value={form.title}
                    onChange={handleChange}
                    required
                    maxLength={200}
                  />
                  <div style={{ fontSize: 12, color: 'var(--gray)', marginTop: 4 }}>
                    {form.title.length}/200 characters
                  </div>
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select className="form-control" name="category_id" value={form.category_id} onChange={handleChange} required>
                    <option value="">Select a category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    className="form-control"
                    name="description"
                    placeholder="Describe your service in detail. What will you deliver? What do buyers need to provide?"
                    rows={6}
                    value={form.description}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label>Price ($) *</label>
                    <input
                      className="form-control"
                      type="number"
                      name="price"
                      placeholder="29.00"
                      min="1"
                      step="0.01"
                      value={form.price}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Delivery (days) *</label>
                    <input
                      className="form-control"
                      type="number"
                      name="delivery_days"
                      min="1"
                      max="90"
                      value={form.delivery_days}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Revisions</label>
                    <input
                      className="form-control"
                      type="number"
                      name="revisions"
                      min="0"
                      max="10"
                      value={form.revisions}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Gig Image</label>
                  <label
                    htmlFor="gig-image-upload"
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      border: '2px dashed var(--border)', borderRadius: 12, padding: 24, cursor: 'pointer',
                      background: previewUrl ? 'transparent' : 'var(--light)', overflow: 'hidden',
                      minHeight: 180, position: 'relative', transition: 'border-color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--green)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    {previewUrl ? (
                      <>
                        <img src={previewUrl} alt="Preview" style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 8, objectFit: 'cover' }} />
                        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--gray)' }}>
                          📎 {form.image?.name} · Click to change
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: 40 }}>🖼️</div>
                        <div style={{ fontWeight: 600, marginTop: 8 }}>Click to upload an image</div>
                        <div style={{ fontSize: 12, color: 'var(--gray)', marginTop: 4 }}>PNG, JPG, WEBP up to 5MB</div>
                      </>
                    )}
                  </label>
                  <input
                    id="gig-image-upload"
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                    style={{ display: 'none' }}
                  />
                  {previewUrl && (
                    <button type="button" style={{ marginTop: 8, background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 13 }}
                      onClick={() => { setPreviewUrl(null); setForm({ ...form, image: null }); }}
                    >
                      ✕ Remove image
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block btn-lg"
                  disabled={loading}
                >
                  {loading ? <><span className="spinner" style={{width:16,height:16}} /> Creating Gig...</> : '🚀 Publish Gig'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
