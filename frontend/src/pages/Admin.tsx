import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

const Admin = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [bets, setBets] = useState([]);

  useEffect(() => {
    // Only fetch if admin
    if (user?.role === 'ADMIN') {
      axios.get('http://localhost:3000/api/admin/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }).then(res => setUsers(res.data)).catch(console.error);

      axios.get('http://localhost:3000/api/admin/bets', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }).then(res => setBets(res.data)).catch(console.error);
    }
  }, [user]);

  if (user?.role !== 'ADMIN') {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '60px' }}>
        <h2 style={{ color: 'var(--danger)' }}>Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)' }}>You don't have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ marginTop: '24px' }}>
      <h1 className="page-title">Admin <span className="gradient-text">Dashboard</span></h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '32px' }}>
        <div className="glass-panel">
          <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>System Users ({users.length})</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Manage all registered users in the platform.</p>
          {/* List users basic skeleton */}
          <div style={{ marginTop: '16px' }}>
            {users.slice(0, 5).map((u: any) => (
              <div key={u.id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {u.username} - {u.coins} Coins
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel">
          <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>Global Bets ({bets.length})</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Review and manage pending and completed bets.</p>
          <div style={{ marginTop: '16px' }}>
            {bets.slice(0, 5).map((b: any) => (
              <div key={b.id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {b.title} - Status: {b.status}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
