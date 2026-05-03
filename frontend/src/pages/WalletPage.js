import React, { useState, useEffect } from 'react';
import { getWalletBalance, topupWallet } from '../api';

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTopup, setShowTopup] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchWallet = () => {
    getWalletBalance()
      .then(res => {
        setBalance(res.data.balance);
        setTransactions(res.data.transactions);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleTopup = async (e) => {
    e.preventDefault();
    if (!topupAmount || topupAmount <= 0) return alert('Invalid amount');
    setProcessing(true);
    try {
      await topupWallet({ amount: parseFloat(topupAmount), paymentMethod: 'Card' });
      alert('Wallet topped up successfully!');
      setShowTopup(false);
      setTopupAmount('');
      fetchWallet();
    } catch (err) {
      alert(err.response?.data?.error || 'Top-up failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800 }}>
        <div className="page-header flex between center">
          <h1>My Wallet</h1>
          <button className="btn btn-primary" onClick={() => setShowTopup(true)}>
            + Top Up
          </button>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : (
          <>
            <div style={{
              background: 'linear-gradient(135deg, #1dbf73 0%, #109655 100%)',
              color: 'white', borderRadius: 12, padding: 32, marginBottom: 32,
              boxShadow: '0 8px 24px rgba(29,191,115,0.2)'
            }}>
              <div style={{ fontSize: 16, opacity: 0.9 }}>Current Balance</div>
              <div style={{ fontSize: 48, fontWeight: 700, marginTop: 8 }}>
                ${parseFloat(balance).toFixed(2)}
              </div>
            </div>

            <h2>Transaction History</h2>
            <div className="card" style={{ marginTop: 16 }}>
              {transactions.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--gray)' }}>
                  No transactions yet.
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Type</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(txn => (
                      <tr key={txn.id}>
                        <td>{new Date(txn.created_at).toLocaleDateString()}</td>
                        <td>{txn.description}</td>
                        <td>
                          <span className={`badge badge-${txn.type === 'topup' || txn.type === 'earnings' ? 'success' : 'primary'}`}>
                            {txn.type}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: txn.type === 'payment' ? 'var(--red)' : 'var(--green)' }}>
                          {txn.type === 'payment' ? '-' : '+'}${parseFloat(txn.amount).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* ── Simulated Payment Gateway Modal ── */}
        {showTopup && (
          <div className="modal-overlay">
            <div className="modal" style={{ maxWidth: 400 }}>
              <div className="modal-header">
                <h2>Top Up Wallet</h2>
                <button className="close-btn" onClick={() => !processing && setShowTopup(false)}>×</button>
              </div>
              <form onSubmit={handleTopup} className="modal-body">
                <p style={{ color: 'var(--gray)', marginBottom: 20, fontSize: 14 }}>
                  Enter the amount you wish to add to your SkillBazaar wallet.
                </p>
                
                <div className="form-group">
                  <label>Amount ($)</label>
                  <input
                    type="number"
                    min="5"
                    step="0.01"
                    value={topupAmount}
                    onChange={e => setTopupAmount(e.target.value)}
                    placeholder="e.g. 50.00"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Card Details (Simulated)</label>
                  <div style={{ border: '1px solid var(--border)', borderRadius: 4, padding: '12px', background: '#f9f9f9', display: 'flex', gap: 8, alignItems: 'center', color: 'var(--gray)' }}>
                    <span>💳</span>
                    <span style={{ letterSpacing: 2 }}>•••• •••• •••• 4242</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: 16 }}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : `Pay $${topupAmount || '0'}`}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
