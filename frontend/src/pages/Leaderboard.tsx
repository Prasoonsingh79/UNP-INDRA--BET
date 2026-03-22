import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy } from 'lucide-react';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch global leaderboard
    axios.get('http://localhost:3000/api/leaderboard')
    .then(res => setLeaders(res.data))
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container animate-fade-in" style={{ marginTop: '24px', maxWidth: '800px' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <Trophy size={40} color="var(--warning)" />
        <div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Global <span className="gradient-text">Leaderboard</span></h1>
          <p className="page-subtitle">Top predictors ranked by net profits and coins.</p>
        </div>
      </header>

      {loading ? (
         <div className="loader-container"><div className="loader"></div></div>
      ) : (
         <div className="glass-panel" style={{ marginTop: '32px', padding: '0', overflow: 'hidden', border: '1px solid rgba(102, 252, 241, 0.2)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)' }}>
           {leaders.map((user: any, idx: number) => (
             <div key={user.id} className="leaderboard-row" style={{ 
               display: 'flex', 
               alignItems: 'center', 
               padding: '20px 24px', 
               borderBottom: '1px solid rgba(255,255,255,0.05)',
               background: idx === 0 ? 'linear-gradient(90deg, rgba(251, 197, 49, 0.1) 0%, transparent 100%)' : 'transparent',
               transition: 'all 0.3s ease'
             }}>
               <div style={{ width: '50px', fontSize: '24px', fontWeight: '900', color: idx === 0 ? 'var(--warning)' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : 'var(--text-secondary)' }}>
                 #{idx + 1}
               </div>
               <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
                 <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: idx === 0 ? 'linear-gradient(135deg, #fbc531, #e1b12c)' : 'linear-gradient(135deg, var(--primary-color), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px', color: '#000', boxShadow: idx === 0 ? '0 0 20px rgba(251, 197, 49, 0.4)' : 'none' }}>
                   {user.username.charAt(0).toUpperCase()}
                 </div>
                 <div>
                   <div style={{ fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)' }}>@{user.username}</div>
                   <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '2px' }}>Win Rate: <span style={{ color: 'var(--success)' }}>{user.winRate || 0}%</span></div>
                 </div>
               </div>
               <div style={{ fontWeight: 800, color: 'var(--warning)', fontSize: '22px', textShadow: idx === 0 ? '0 0 10px rgba(251, 197, 49, 0.3)' : 'none' }}>
                 {Math.floor(user.coins).toLocaleString()} C
               </div>
             </div>
           ))}
           {leaders.length === 0 && (
             <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <Trophy size={48} color="rgba(255,255,255,0.1)" />
                <div style={{ fontSize: '18px' }}>No rankings available yet.</div>
             </div>
           )}
           <style>{`.leaderboard-row:hover { background: rgba(102, 252, 241, 0.05) !important; transform: translateX(4px); }`}</style>
         </div>
      )}
    </div>
  );
};

export default Leaderboard;
