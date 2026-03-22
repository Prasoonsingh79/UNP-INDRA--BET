import { useState, useEffect } from 'react';
import axios from 'axios';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user's betting history
    axios.get('http://localhost:3000/api/user/history', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => setHistory(res.data))
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container animate-fade-in" style={{ marginTop: '24px' }}>
      <h1 className="page-title">Betting <span className="gradient-text">History</span></h1>
      <p className="page-subtitle">Track your past predictions and outcomes.</p>

      {loading ? (
         <div className="loader-container"><div className="loader"></div></div>
      ) : history.length === 0 ? (
         <div style={{ textAlign: 'center', padding: '60px' }}>
           <h3 style={{ color: 'var(--text-secondary)' }}>No history available yet.</h3>
         </div>
      ) : (
         <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
           {history.map((item: any) => (
             <div key={item.id} className="glass-panel">
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <h3 style={{ fontSize: '16px' }}>{item.bet.title}</h3>
                 <span style={{ 
                   padding: '4px 8px', 
                   borderRadius: '4px', 
                   fontSize: '12px',
                   background: item.result === 'WON' ? 'rgba(76, 209, 55, 0.2)' : 'rgba(232, 65, 24, 0.2)',
                   color: item.result === 'WON' ? 'var(--success)' : 'var(--danger)'
                 }}>
                   {item.result}
                 </span>
               </div>
               <div style={{ marginTop: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                 Predicted: <span style={{ color: '#fff' }}>{item.option.text}</span> | Stake: <span style={{ color: 'var(--warning)' }}>{item.amount} C</span>
               </div>
             </div>
           ))}
         </div>
      )}
    </div>
  );
};

export default History;
