import React, { useState, useEffect, useRef } from 'react';
import { getConversations, getMessages, sendMessage, getSellerGigs, sendOffer, getOffers, acceptOffer } from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function MessagesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv]       = useState(null);
  const [messages, setMessages]           = useState([]);
  const [offers, setOffers]               = useState([]);
  const [newMsg, setNewMsg]               = useState('');
  const [loading, setLoading]             = useState(true);
  const [sending, setSending]             = useState(false);
  const bottomRef = useRef(null);

  // Offer Modal State
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [sellerGigs, setSellerGigs] = useState([]);
  const [offerGigId, setOfferGigId] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [offerDays, setOfferDays] = useState('3');

  // Suggest Price State (Buyer)
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [suggestPrice, setSuggestPrice] = useState('');

  useEffect(() => {
    getConversations()
      .then(r => {
        setConversations(r.data);
        if (location.state?.autoSelectUserId) {
          const match = r.data.find(c => c.other_user_id === location.state.autoSelectUserId);
          if (match) setActiveConv(match);
          else setActiveConv({ other_user_id: location.state.autoSelectUserId, other_name: 'User', other_username: 'loading...' });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [location.state]);

  useEffect(() => {
    if (!activeConv) return;
    
    const fetchChat = () => {
      Promise.all([
        getMessages(activeConv.other_user_id),
        getOffers(activeConv.other_user_id)
      ]).then(([msgRes, offRes]) => {
        setMessages(msgRes.data);
        setOffers(offRes.data);
      }).catch(console.error);
    };

    fetchChat();
    // Poll every 3 seconds for real-time updates
    const interval = setInterval(fetchChat, 3000);
    
    // If user is seller, fetch their gigs for the offer dropdown
    if (user.role === 'seller') {
      getSellerGigs(user.id).then(res => {
        setSellerGigs(res.data);
        if (res.data.length > 0) setOfferGigId(res.data[0].id);
      }).catch(console.error);
    }

    return () => clearInterval(interval);
  }, [activeConv, user.id, user.role]);

  // Combine messages and offers, sort by created_at
  const combinedStream = [...messages, ...offers.map(o => ({ ...o, isOffer: true }))];
  combinedStream.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [combinedStream]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeConv) return;
    setSending(true);
    try {
      await sendMessage({ receiver_id: activeConv.other_user_id, content: newMsg });
      setMessages(ms => [...ms, {
        id: Date.now(), sender_id: user.id, receiver_id: activeConv.other_user_id,
        content: newMsg, created_at: new Date().toISOString(), sender_username: user.username
      }]);
      setNewMsg('');
      setConversations(cs => cs.map(c =>
        c.other_user_id === activeConv.other_user_id
          ? { ...c, last_message: newMsg, last_message_time: new Date().toISOString() }
          : c
      ));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleMakeOffer = async (e) => {
    e.preventDefault();
    if (!offerGigId || !offerPrice) return alert("Please fill all fields");
    setSending(true);
    try {
      await sendOffer({
        receiver_id: activeConv.other_user_id,
        gig_id: offerGigId,
        price: parseFloat(offerPrice),
        delivery_days: parseInt(offerDays)
      });
      alert('Offer sent successfully!');
      setShowOfferModal(false);
      // Refetch
      const offRes = await getOffers(activeConv.other_user_id);
      const msgRes = await getMessages(activeConv.other_user_id);
      setOffers(offRes.data);
      setMessages(msgRes.data);
    } catch(err) {
      alert(err.response?.data?.error || 'Failed to send offer');
    } finally {
      setSending(false);
    }
  };

  const handleAcceptOffer = (offerId) => {
    navigate(`/checkout/${offerId}`);
  };

  const handleSuggestPrice = async (e) => {
    e.preventDefault();
    if (!suggestPrice || !activeConv) return;
    setSending(true);
    try {
      const msgContent = `I would like to suggest a negotiated price of $${parseFloat(suggestPrice).toFixed(2)} for the service.`;
      await sendMessage({ receiver_id: activeConv.other_user_id, content: msgContent });
      setMessages(ms => [...ms, {
        id: Date.now(), sender_id: user.id, receiver_id: activeConv.other_user_id,
        content: msgContent, created_at: new Date().toISOString(), sender_username: user.username
      }]);
      setShowSuggestModal(false);
      setSuggestPrice('');
      setConversations(cs => cs.map(c =>
        c.other_user_id === activeConv.other_user_id
          ? { ...c, last_message: msgContent, last_message_time: new Date().toISOString() }
          : c
      ));
    } catch(err) {
      alert(err.response?.data?.error || 'Failed to send suggestion');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>Messages</h1>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : (
          <div className="messages-layout">
            {/* ── Conversations List ─────────────── */}
            <div className="conversations-list">
              {conversations.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--gray)', fontSize: 14 }}>
                  No conversations yet.<br />Start one from a gig page.
                </div>
              ) : conversations.map(conv => (
                <div
                  key={conv.other_user_id}
                  className={`conv-item ${activeConv?.other_user_id === conv.other_user_id ? 'active' : ''}`}
                  onClick={() => setActiveConv(conv)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%', background: 'var(--green)',
                      color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 14, flexShrink: 0
                    }}>
                      {(conv.other_username || 'U')[0].toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div className="name">{conv.other_name || conv.other_username}</div>
                      <div className="preview">{conv.last_message || 'No messages'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Chat Area ─────────────────────── */}
            {activeConv ? (
              <div className="chat-area">
                <div style={{
                  padding: '16px 20px', borderBottom: '1px solid var(--border)',
                  fontWeight: 600, fontSize: 15, background: 'var(--light)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    {activeConv.other_name || activeConv.other_username}
                    <div style={{ fontSize: 12, color: 'var(--gray)', fontWeight: 400 }}>
                      @{activeConv.other_username}
                    </div>
                  </div>
                  {user.role === 'seller' ? (
                    <button className="btn btn-outline btn-sm" onClick={() => setShowOfferModal(true)}>
                      Make an Offer
                    </button>
                  ) : (
                    <button className="btn btn-outline btn-sm" onClick={() => setShowSuggestModal(true)}>
                      Suggest a Price
                    </button>
                  )}
                </div>

                <div className="chat-messages">
                  {combinedStream.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--gray)', padding: 40, fontSize: 14 }}>
                      Start the conversation!
                    </div>
                  ) : combinedStream.map(item => {
                    if (item.isOffer) {
                      // Render Offer Card
                      const isSentByMe = item.sender_id === user.id;
                      return (
                        <div key={`offer-${item.id}`} style={{ display: 'flex', justifyContent: isSentByMe ? 'flex-end' : 'flex-start', margin: '8px 0' }}>
                          <div style={{
                            background: 'white', border: '1px solid var(--border)', borderRadius: 8, padding: 16,
                            width: '80%', maxWidth: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                          }}>
                            <div style={{ fontSize: 12, color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 8 }}>
                              Custom Offer
                            </div>
                            <h4 style={{ margin: '0 0 8px 0' }}>{item.gig_title}</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                              <div><strong>Price:</strong> ${item.price}</div>
                              <div><strong>Delivery:</strong> {item.delivery_days} days</div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span className={`badge badge-${item.status === 'accepted' ? 'success' : item.status === 'rejected' ? 'danger' : 'primary'}`}>
                                {item.status.toUpperCase()}
                              </span>
                              {!isSentByMe && item.status === 'pending' && (
                                <button className="btn btn-primary btn-sm" onClick={() => handleAcceptOffer(item.id)}>
                                  Accept & Pay
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      // Render Normal Message Bubble
                      return (
                        <div key={`msg-${item.id}`}>
                          <div className={`msg-bubble ${item.sender_id === user.id ? 'sent' : 'received'}`}>
                            {item.content}
                            <div className="msg-time">
                              {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      );
                    }
                  })}
                  <div ref={bottomRef} />
                </div>

                <form className="chat-input" onSubmit={handleSend}>
                  <input
                    value={newMsg}
                    onChange={e => setNewMsg(e.target.value)}
                    placeholder="Type a message..."
                    disabled={sending}
                  />
                  <button type="submit" className="btn btn-primary" disabled={sending || !newMsg.trim()}>
                    {sending ? '...' : 'Send'}
                  </button>
                </form>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray)', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 48 }}>💬</div>
                <p>Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        )}

        {/* ── Offer Modal ── */}
        {showOfferModal && (
          <div className="modal-overlay">
            <div className="modal" style={{ maxWidth: 400 }}>
              <div className="modal-header">
                <h2>Create Custom Offer</h2>
                <button className="close-btn" onClick={() => setShowOfferModal(false)}>×</button>
              </div>
              <form onSubmit={handleMakeOffer} className="modal-body">
                <div className="form-group">
                  <label>Select Gig to Offer</label>
                  <select value={offerGigId} onChange={e => setOfferGigId(e.target.value)} required>
                    <option value="" disabled>Select a gig...</option>
                    {sellerGigs.map(g => (
                      <option key={g.id} value={g.id}>{g.title}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Custom Price ($)</label>
                  <input type="number" min="5" value={offerPrice} onChange={e => setOfferPrice(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Delivery Time (Days)</label>
                  <input type="number" min="1" value={offerDays} onChange={e => setOfferDays(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={sending}>
                  {sending ? 'Sending...' : 'Send Offer'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── Suggest Price Modal ── */}
        {showSuggestModal && (
          <div className="modal-overlay">
            <div className="modal" style={{ maxWidth: 400 }}>
              <div className="modal-header">
                <h2>Suggest a Price</h2>
                <button className="close-btn" onClick={() => setShowSuggestModal(false)}>×</button>
              </div>
              <form onSubmit={handleSuggestPrice} className="modal-body">
                <div className="form-group">
                  <label>Suggested Price ($)</label>
                  <input type="number" min="5" value={suggestPrice} onChange={e => setSuggestPrice(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={sending}>
                  {sending ? 'Sending...' : 'Send Suggestion'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
