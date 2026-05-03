import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getConversations, getWalletBalance, getNotifications, markNotificationsRead } from '../api';

export default function Navbar({ theme, toggleTheme }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [walletBalance, setWalletBalance] = useState('0.00');
  const dropdownRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotifClick = async () => {
    setShowNotifDropdown(!showNotifDropdown);
    if (!showNotifDropdown && notifications.some(n => !n.is_read)) {
      try {
        await markNotificationsRead();
        setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      } catch (err) { console.error(err); }
    }
  };

  // Fetch unread messages & wallet balance
  useEffect(() => {
    if (user) {
      const fetchData = () => {
        // Fetch Messages
        getConversations()
          .then(res => {
            const count = res.data.reduce((sum, conv) => sum + parseInt(conv.unread_count || 0), 0);
            setUnreadCount(count);
          })
          .catch(() => {});
          
        // Fetch Wallet
        getWalletBalance()
          .then(res => setWalletBalance(parseFloat(res.data.balance).toFixed(2)))
          .catch(() => {});

        // Fetch Notifications
        getNotifications()
          .then(res => setNotifications(res.data))
          .catch(() => {});
      };
      
      fetchData();
      // Also poll every 15 seconds to keep it updated while chatting/buying
      const interval = setInterval(fetchData, 15000);
      return () => clearInterval(interval);
    }
  }, [user, location.pathname]); // refetch on navigation

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          Skill<span>Bazaar</span>
        </Link>

        <div className="navbar-links">
          <Link to="/gigs">Browse Gigs</Link>

          {user ? (
            <>
              {/* Notifications */}
              <div className="profile-dropdown-container" ref={notifRef}>
                <button onClick={handleNotifClick} style={{ position: 'relative', background: 'none', border: 'none', color: 'var(--text-color)', display: 'flex', alignItems: 'center', padding: '0 8px', cursor: 'pointer' }} title="Notifications">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                  {notifications.some(n => !n.is_read) && (
                    <span style={{
                      position: 'absolute', top: -2, right: 4,
                      background: '#ff4d4f', width: 10, height: 10, borderRadius: '50%',
                      border: '2px solid var(--white)'
                    }}></span>
                  )}
                </button>
                {showNotifDropdown && (
                  <div className="dropdown-menu" style={{ right: -60, width: 300, maxHeight: 400, overflowY: 'auto' }}>
                    <div className="dropdown-header" style={{ borderBottom: '1px solid var(--border)' }}>
                      <strong>Notifications</strong>
                    </div>
                    {notifications.length === 0 ? (
                      <div style={{ padding: 16, textAlign: 'center', color: 'var(--gray)', fontSize: 13 }}>No notifications yet</div>
                    ) : (
                      notifications.map(n => (
                        <Link key={n.id} to={n.link} onClick={() => setShowNotifDropdown(false)} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 13, background: n.is_read ? 'transparent' : 'var(--light)' }}>
                          <div style={{ color: 'var(--dark)' }}>{n.message}</div>
                          <div style={{ fontSize: 11, color: 'var(--gray)', marginTop: 4 }}>{new Date(n.created_at).toLocaleString()}</div>
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Messages button outside dropdown */}
              <Link to="/messages" style={{ position: 'relative', display: 'flex', alignItems: 'center', color: 'var(--text-color)', padding: '0 8px' }} title="Messages">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: -5, right: 0,
                    background: '#ff4d4f', color: 'white', borderRadius: '50%',
                    width: 18, height: 18, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 10, fontWeight: 700
                  }}>
                    {unreadCount}
                  </span>
                )}
              </Link>
              
              {/* Cart / Wallet button outside dropdown showing balance */}
              <Link to="/wallet" style={{ fontWeight: 600, color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px' }} title="Wallet / Cart">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                <span style={{ color: 'var(--green)' }}>${walletBalance}</span>
              </Link>

              {user.role === 'seller' && (
                <Link to="/create-gig" className="btn btn-outline btn-sm" style={{ marginLeft: 8, marginRight: 16 }}>+ New Gig</Link>
              )}
              
              <button onClick={toggleTheme} style={{ background: 'none', border: 'none', color: 'var(--text-color)', display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: 18 }} title="Toggle Theme">
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>

              <div className="profile-dropdown-container" ref={dropdownRef} style={user.role !== 'seller' ? { marginLeft: 16 } : {}}>
                <button 
                  className="avatar-btn" 
                  onClick={() => setShowDropdown(!showDropdown)}
                  title={user.username}
                >
                  {user.username ? user.username[0].toUpperCase() : 'U'}
                </button>

                {showDropdown && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <strong>{user.full_name || user.username}</strong>
                      <span>@{user.username}</span>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link to="/profile" onClick={() => setShowDropdown(false)}>Profile</Link>
                    <Link to="/dashboard" onClick={() => setShowDropdown(false)}>Dashboard</Link>
                    <Link to="/orders" onClick={() => setShowDropdown(false)}>Orders</Link>
                    <Link to="/settings" onClick={() => setShowDropdown(false)}>Settings</Link>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item-logout" onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Join</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
