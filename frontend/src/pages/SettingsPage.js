import React, { useState } from 'react';
import { updatePassword, deleteAccount } from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [passMsg, setPassMsg] = useState({ text: '', type: '' });
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState('');

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassMsg({ text: '', type: '' });
    try {
      await updatePassword(passwordForm);
      setPassMsg({ text: 'Password updated successfully!', type: 'success' });
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPassMsg({ text: err.response?.data?.error || 'Failed to update password.', type: 'error' });
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteMsg('');
    try {
      await deleteAccount();
      logout();
      navigate('/');
    } catch (err) {
      setDeleteMsg(err.response?.data?.error || 'Failed to delete account.');
    }
  };

  return (
    <div className="page" style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 70px)' }}>
      <div className="container" style={{ maxWidth: 600, padding: '40px 20px' }}>
        <h1 style={{ marginBottom: 30 }}>Account Settings</h1>

        <div style={{ background: 'white', borderRadius: 12, padding: 30, boxShadow: 'var(--shadow)', marginBottom: 30 }}>
          <h3 style={{ marginBottom: 20 }}>Change Password</h3>
          {passMsg.text && <div className={`alert alert-${passMsg.type}`}>{passMsg.text}</div>}
          
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label>Current Password</label>
              <input 
                type="password" 
                className="form-control" 
                required 
                value={passwordForm.currentPassword}
                onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input 
                type="password" 
                className="form-control" 
                required 
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
              />
            </div>
            <button type="submit" className="btn btn-primary mt-16">Update Password</button>
          </form>
        </div>

        <div style={{ background: 'white', borderRadius: 12, padding: 30, boxShadow: 'var(--shadow)', border: '1px solid #ffccc7' }}>
          <h3 style={{ color: '#a8071a', marginBottom: 12 }}>Danger Zone</h3>
          <p style={{ color: 'var(--gray)', fontSize: 14, marginBottom: 20 }}>
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>Delete Account</button>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div style={{ background: 'white', borderRadius: 12, padding: 32, width: '90%', maxWidth: 440 }}>
              <h3 style={{ color: '#a8071a', marginBottom: 16 }}>Delete Account?</h3>
              <p style={{ color: 'var(--gray)', fontSize: 14, marginBottom: 24 }}>
                Are you absolutely sure you want to delete your account? This action cannot be undone and all your data will be lost.
              </p>
              {deleteMsg && <div className="alert alert-error">{deleteMsg}</div>}
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleDeleteAccount}>
                  Yes, Delete Forever
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
