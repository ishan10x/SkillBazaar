import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    username: '', email: '', password: '', full_name: '',
    role: 'buyer', country: ''
  });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await registerUser(form);
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create an account</h2>
        <p>Join SkillBazaar as a buyer or seller</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Username *</label>
              <input className="form-control" name="username" placeholder="johndoe" value={form.username} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Full Name</label>
              <input className="form-control" name="full_name" placeholder="John Doe" value={form.full_name} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <input className="form-control" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input className="form-control" type="password" name="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>I want to</label>
              <select className="form-control" name="role" value={form.role} onChange={handleChange}>
                <option value="buyer">Buy services</option>
                <option value="seller">Sell services</option>
              </select>
            </div>
            <div className="form-group">
              <label>Country</label>
              <input className="form-control" name="country" placeholder="India" value={form.country} onChange={handleChange} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? <><span className="spinner" style={{width:16,height:16}} /> Creating account...</> : 'Create Account'}
          </button>
        </form>

        <div className="auth-toggle">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
