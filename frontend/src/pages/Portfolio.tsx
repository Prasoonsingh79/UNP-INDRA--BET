import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import { Briefcase, TrendingUp, TrendingDown, Clock, Activity } from 'lucide-react';

const Portfolio = () => {
  const { user } = useAuth();
  const [data, setData] = useState<{ activeStake: number, totalWon: number, totalLost: number, positions: any[] }>({ activeStake: 0, totalWon: 0, totalLost: 0, positions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:3000/api/portfolio', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => setData(res.data))
    .catch(console.error)
    .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="container animate-fade-in" style={{ marginTop: '24px' }}>
      <header className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <Briefcase size={40} color="var(--primary-color)" />
        <div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>My <span className="gradient-text">Portfolio</span></h1>
          <p className="page-subtitle">Track your active positions and performance analytics.</p>
        </div>
      </header>

      {loading ? (
        <div className="loader-container"><div className="loader"></div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '4px solid var(--primary-color)' }}>
              <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(102, 252, 241, 0.15)' }}>
                <Activity size={28} color="var(--primary-color)" />
              </div>
              <div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Stake</div>
                <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px' }}>{data.activeStake.toLocaleString()} <span style={{ fontSize: '20px', color: 'var(--primary-color)' }}>C</span></div>
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '4px solid var(--success)' }}>
              <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(76, 209, 55, 0.15)' }}>
                <TrendingUp size={28} color="var(--success)" />
              </div>
              <div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Won</div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--success)', marginTop: '4px' }}>+{data.totalWon.toLocaleString()} <span style={{ fontSize: '20px' }}>C</span></div>
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '4px solid var(--danger)' }}>
              <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(232, 65, 24, 0.15)' }}>
                <TrendingDown size={28} color="var(--danger)" />
              </div>
              <div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Lost</div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--danger)', marginTop: '4px' }}>-{data.totalLost.toLocaleString()} <span style={{ fontSize: '20px' }}>C</span></div>
              </div>
            </div>
          </div>

          <h2 style={{ fontSize: '24px', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(140, 82, 255, 0.15)', padding: '10px', borderRadius: '12px' }}>
              <Clock size={24} color="var(--accent)" />
            </div>
            Active Positions
          </h2>
          <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(140, 82, 255, 0.2)' }}>
             {data.positions.map((pos) => (
                <div key={pos.id} className="portfolio-row" style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.3s ease' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--text-primary)' }}>{pos.betTitle}</h3>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                      Your Prediction: <span style={{ color: 'var(--primary-color)', fontWeight: 700 }}>{pos.prediction}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--warning)', letterSpacing: '-0.5px' }}>{pos.stake.toLocaleString()} C</div>
                    <div style={{ fontSize: '13px', color: 'var(--success)', marginTop: '4px', fontWeight: 500 }}>Global Sentiment: {pos.currentOdds}</div>
                  </div>
                </div>
             ))}
             {data.positions.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No active positions found.</div>
             )}
             <style>{`.portfolio-row:hover { background: rgba(140, 82, 255, 0.05) !important; transform: translateX(4px); }`}</style>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
