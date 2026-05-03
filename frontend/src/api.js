import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5001/api'
});

// Attach JWT token to every request
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Auth ─────────────────────────────────────────────
export const registerUser    = (data) => API.post('/auth/register', data);
export const loginUser       = (data) => API.post('/auth/login', data);
export const getMe           = ()     => API.get('/auth/me');
export const updateProfile   = (data) => API.put('/auth/profile', data);
export const updatePassword  = (data) => API.put('/auth/password', data);
export const deleteAccount   = ()     => API.delete('/auth/account');

// ─── Notifications ──────────────────────────────────────
export const getNotifications      = () => API.get('/notifications');
export const markNotificationsRead = () => API.put('/notifications/read');

// ─── Gigs ─────────────────────────────────────────────
export const getGigs         = (params) => API.get('/gigs', { params });
export const getTrendingGigs = ()       => API.get('/gigs/trending');
export const getGig          = (id)     => API.get(`/gigs/${id}`);
export const createGig       = (data)   => API.post('/gigs', data);
export const updateGig       = (id, d)  => API.put(`/gigs/${id}`, d);
export const deleteGig       = (id)     => API.delete(`/gigs/${id}`);
export const getSellerGigs   = (id)     => API.get(`/gigs/seller/${id}`);

// ─── Orders ───────────────────────────────────────────
export const createOrder     = (data)   => API.post('/orders', data);
export const getOrders       = (role)   => API.get('/orders', { params: { role } });
export const getOrder        = (id)     => API.get(`/orders/${id}`);
export const updateOrderStatus = (id, status) => API.put(`/orders/${id}/status`, { status });

// ─── Reviews ──────────────────────────────────────────
export const createReview    = (data)   => API.post('/reviews', data);
export const getGigReviews   = (gigId)  => API.get(`/reviews/gig/${gigId}`);

// ─── Messages ─────────────────────────────────────────
export const sendMessage     = (data)   => API.post('/messages', data);
export const getConversations= ()       => API.get('/messages');
export const getMessages     = (userId) => API.get(`/messages/${userId}`);

// ─── Favorites ────────────────────────────────────────
export const toggleFavorite  = (gig_id) => API.post('/favorites', { gig_id });
export const getFavorites    = ()       => API.get('/favorites');

// ─── Categories ───────────────────────────────────────
export const getCategories   = ()       => API.get('/categories');

// ─── Wallet ───────────────────────────────────────────
export const getWalletBalance= ()       => API.get('/wallet/balance');
export const topupWallet     = (data)   => API.post('/wallet/topup', data);

// ─── Custom Offers ────────────────────────────────────
export const sendOffer       = (data)   => API.post('/offers', data);
export const getOffers       = (uid)    => API.get(`/offers/conversation/${uid}`);
export const getOffer        = (id)     => API.get(`/offers/${id}`);
export const acceptOffer     = (id)     => API.post(`/offers/${id}/accept`);

// ─── Portfolios ───────────────────────────────────────
export const getPortfolios   = (uid)    => API.get(`/portfolios/${uid}`);
export const addPortfolio    = (data)   => API.post('/portfolios', data);
export const deletePortfolio = (id)     => API.delete(`/portfolios/${id}`);

export default API;
