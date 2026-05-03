import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import GigsPage from './pages/GigsPage';
import GigDetail from './pages/GigDetail';
import Dashboard from './pages/Dashboard';
import OrdersPage from './pages/OrdersPage';
import MessagesPage from './pages/MessagesPage';
import CreateGig from './pages/CreateGig';
import WalletPage from './pages/WalletPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderDetailPage from './pages/OrderDetailPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import './styles.css';

function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)', padding: '40px 20px',
      background: 'var(--white)', marginTop: 'auto'
    }}>
      <div className="container" style={{ maxWidth: 1200 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 32, marginBottom: 32 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 12 }}>
              Skill<span style={{ color: 'var(--green)' }}>Bazaar</span>
            </div>
            <p style={{ color: 'var(--gray)', fontSize: 13, lineHeight: 1.7 }}>
              The premier marketplace for freelance talent. Buy and sell skills with confidence.
            </p>
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>Marketplace</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link to="/gigs" style={{ color: 'var(--gray)', fontSize: 13, textDecoration: 'none' }}>Browse Gigs</Link>
              <Link to="/register" style={{ color: 'var(--gray)', fontSize: 13, textDecoration: 'none' }}>Become a Seller</Link>
              <Link to="/dashboard" style={{ color: 'var(--gray)', fontSize: 13, textDecoration: 'none' }}>Dashboard</Link>
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>Support</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link to="/terms" style={{ color: 'var(--gray)', fontSize: 13, textDecoration: 'none' }}>Terms of Service</Link>
              <Link to="/privacy" style={{ color: 'var(--gray)', fontSize: 13, textDecoration: 'none' }}>Privacy Policy</Link>
              <a href="mailto:support@skillbazaar.com" style={{ color: 'var(--gray)', fontSize: 13, textDecoration: 'none' }}>Contact Support</a>
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>Legal</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link to="/terms" style={{ color: 'var(--gray)', fontSize: 13, textDecoration: 'none' }}>Terms of Service</Link>
              <Link to="/privacy" style={{ color: 'var(--gray)', fontSize: 13, textDecoration: 'none' }}>Privacy Policy</Link>
              <span style={{ color: 'var(--gray)', fontSize: 13 }}>Cookie Policy</span>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ color: 'var(--gray)', fontSize: 13 }}>© 2026 SkillBazaar. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 16 }}>
            <Link to="/terms" style={{ color: 'var(--gray)', fontSize: 12, textDecoration: 'none' }}>Terms</Link>
            <Link to="/privacy" style={{ color: 'var(--gray)', fontSize: 12, textDecoration: 'none' }}>Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const AppRoutes = ({ theme, toggleTheme }) => (
  <>
    <Navbar theme={theme} toggleTheme={toggleTheme} />
    <Routes>
      <Route path="/"           element={<Home />} />
      <Route path="/login"      element={<Login />} />
      <Route path="/register"   element={<Register />} />
      <Route path="/gigs"       element={<GigsPage />} />
      <Route path="/gigs/:id"   element={<GigDetail />} />
      <Route path="/dashboard"  element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/orders"     element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
      <Route path="/orders/:orderId" element={<PrivateRoute><OrderDetailPage /></PrivateRoute>} />
      <Route path="/checkout/:offerId" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
      <Route path="/order-confirmation/:orderId" element={<PrivateRoute><OrderConfirmation /></PrivateRoute>} />
      <Route path="/messages"   element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
      <Route path="/create-gig" element={<PrivateRoute><CreateGig /></PrivateRoute>} />
      <Route path="/wallet"     element={<PrivateRoute><WalletPage /></PrivateRoute>} />
      <Route path="/settings"   element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
      <Route path="/profile"    element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="/terms"      element={<TermsPage />} />
      <Route path="/privacy"    element={<PrivacyPage />} />
    </Routes>
    <Footer />
  </>
);

export default function App() {
  const [theme, setTheme] = React.useState(localStorage.getItem('theme') || 'light');

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes theme={theme} toggleTheme={toggleTheme} />
      </BrowserRouter>
    </AuthProvider>
  );
}
