import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../AuthContext';
import { Trophy, Clock, Users, Award, Flame, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const socket = io('http://localhost:3000');

const Home = () => {
  const [bets, setBets] = useState<any[]>([]);
  const { user, updateUserCoins } = useAuth();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBets();

    socket.on('new_bet', (bet) => {
      setBets((prev) => [bet, ...prev]);
    });

    socket.on('bet_updated', (data) => {
      setBets((prev) => prev.map(bet => {
        if (bet.id === data.betId) {
          return { ...bet, totalPool: data.totalPool, participantCount: data.participantCount, participations: data.participations };
        }
        return bet;
      }));
    });

    socket.on('bet_resolved', (data) => {
      setBets((prev) => prev.map(bet => {
        if (bet.id === data.betId) {
          return { ...bet, status: 'resolved', resultOptionId: data.winningOptionId };
        }
        return bet;
      }));
      // User coins are updated if they won
      if (data.rewardPerWinner > 0) {
        axios.get('http://localhost:3000/api/user/me', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(res => {
            updateUserCoins(res.data.coins);
        });
      }
    });

    return () => {
      socket.off('new_bet');
      socket.off('bet_updated');
      socket.off('bet_resolved');
    };
  }, []);

  const fetchBets = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/bets');
      setBets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (betId: number, optionId: number) => {
    try {
      const res = await axios.post(`http://localhost:3000/api/bets/${betId}/join`, { optionId }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      updateUserCoins(res.data.user.coins);
      alert('Successfully joined the bet!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to join');
    }
  };

  const renderBetCard = (bet: any) => {
    const isOwner = bet.creatorId === user.id;
    const isActive = bet.status === 'active';
    const isExpired = new Date() > new Date(bet.deadline);
    
    // Check if user has participated
    const userParticipation = bet.participations?.find((p: any) => p.userId === user.id);
    const hasJoined = !!userParticipation;
    
    // Process options to get percentage/odds
    const totalPool = bet.totalPool || 0;
    
    return (
      <div className="glass-panel animate-fade-in" key={bet.id} style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="flex-between" style={{ marginBottom: '16px' }}>
          <div className="badge badge-accent">
            <Flame size={14} /> Trending
          </div>
          {isActive ? (
             !isExpired ? 
             <div className="badge"><Clock size={14} /> Active</div> :
             <div className="badge badge-warning"><Clock size={14} /> Resolving...</div>
          ) : (
             <div className="badge" style={{ background: 'rgba(76, 209, 55, 0.1)', color: 'var(--success)' }}>
               <Award size={14} /> Ended
             </div>
          )}
        </div>
        
        <h3 style={{ fontSize: '20px', marginBottom: '8px', lineHeight: '1.4' }}>{bet.title}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
          Created by <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>@{bet.creator?.username || 'Unknown'}</span>
        </p>
        
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ flex: 1, background: 'rgba(11, 12, 16, 0.4)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(251, 197, 49, 0.2)', padding: '8px', borderRadius: '8px' }}>
              <Trophy size={20} color="var(--warning)" />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Pool</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--warning)' }}>{totalPool} C</div>
            </div>
          </div>
          <div style={{ flex: 1, background: 'rgba(11, 12, 16, 0.4)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(102, 252, 241, 0.2)', padding: '8px', borderRadius: '8px' }}>
              <Users size={20} color="var(--primary-color)" />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Players</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{bet.participantCount || 0}</div>
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {bet.options.map((opt: any) => {
              // Calculate percentage
              const optParticipations = bet.participations?.filter((p: any) => p.optionId === opt.id) || [];
              const optAmount = optParticipations.reduce((acc: number, p: any) => acc + p.amount, 0);
              const percentage = totalPool > 0 ? Math.round((optAmount / totalPool) * 100) : 0;
              
              const isWinner = bet.status === 'resolved' && bet.resultOptionId === opt.id;
              const isUserChoice = userParticipation?.optionId === opt.id;
              
              return (
                <div key={opt.id} style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px', background: 'rgba(11, 12, 16, 0.6)', border: `1px solid ${isWinner ? 'var(--success)' : 'rgba(255,255,255,0.05)'}`, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: (isActive && !isExpired && !hasJoined) ? 'pointer' : 'default', transition: 'all 0.2s ease' }}
                  onClick={() => {
                    if (isActive && !isExpired && !hasJoined && window.confirm(`Join "${opt.text}" for ${bet.entryAmount} coins?`)) {
                      handleJoin(bet.id, opt.id);
                    }
                  }}
                  className={(isActive && !isExpired && !hasJoined) ? "option-hover" : ""}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${percentage}%`, background: isWinner ? 'rgba(76, 209, 55, 0.2)' : 'rgba(102, 252, 241, 0.15)', zIndex: 0, transition: 'width 0.5s ease-out' }}></div>
                  
                  <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                    <span style={{ fontWeight: 600, color: isWinner ? 'var(--success)' : 'var(--text-primary)' }}>{opt.text}</span>
                    {isUserChoice && <span style={{ fontSize: '11px', background: 'rgba(140, 82, 255, 0.3)', color: '#dcb8ff', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>Your Pick</span>}
                    <div style={{ marginLeft: 'auto', fontWeight: 500, color: 'var(--text-secondary)' }}>{percentage}%</div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <style>{`.option-hover:hover { border-color: var(--primary-color) !important; background: rgba(102, 252, 241, 0.05) !important; }`}</style>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Entry: <span style={{ color: 'var(--warning)', fontWeight: 600 }}>{bet.entryAmount} Coins</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {isOwner && isActive && !isExpired && (
                <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px', borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }} onClick={(e) => {
                  e.stopPropagation();
                  axios.post(`http://localhost:3000/api/bets/${bet.id}/simulate`).catch(err => alert('Simulation failed'));
                }}>
                  Simulate Bots
                </button>
              )}
              {isOwner && isActive && isExpired && (
                  <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => {
                    const winnerId = prompt('Enter the winning option ID:\n' + bet.options.map((o:any) => `${o.id}: ${o.text}`).join('\n'));
                    if (winnerId) {
                      axios.post(`http://localhost:3000/api/bets/${bet.id}/resolve`, { winningOptionId: parseInt(winnerId) }, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                      }).then(res => {
                          alert(`Bet resolved! Winners got ${res.data.rewardPerWinner} coins each.`);
                      }).catch(err => alert(err.response?.data?.error));
                    }
                  }}>
                    Resolve Result
                  </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      <header className="page-header animate-fade-in" style={{ marginTop: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(102, 252, 241, 0.1)', borderRadius: '20px', color: 'var(--primary-color)', fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>
            <TrendingUp size={16} /> Global Market Dashboard
        </div>
        <h1 className="page-title">Live <span className="gradient-text">Predictions</span></h1>
        <p className="page-subtitle">Put your knowledge to the test. Predict correct outcomes to win big from the community pool.</p>
      </header>
      
      {!loading && (
        <div className="dashboard-stats animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div className="glass-panel hover-lift" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '4px solid var(--primary-color)' }}>
            <div style={{ background: 'rgba(102, 252, 241, 0.15)', padding: '16px', borderRadius: '16px' }}>
              <Flame size={28} color="var(--primary-color)" />
            </div>
            <div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Pools</div>
              <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px' }}>{bets.filter(b => b.status === 'active').length}</div>
            </div>
          </div>
          <div className="glass-panel hover-lift" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '4px solid var(--warning)' }}>
            <div style={{ background: 'rgba(251, 197, 49, 0.15)', padding: '16px', borderRadius: '16px' }}>
              <Trophy size={28} color="var(--warning)" />
            </div>
            <div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Volume</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>{bets.reduce((acc, bet) => acc + (bet.totalPool || 0), 0).toLocaleString()} <span style={{ fontSize: '20px', color: 'var(--warning)' }}>C</span></div>
            </div>
          </div>
          <div className="glass-panel hover-lift" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '4px solid var(--accent)' }}>
            <div style={{ background: 'rgba(140, 82, 255, 0.15)', padding: '16px', borderRadius: '16px' }}>
              <Users size={28} color="var(--accent)" />
            </div>
            <div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Global Participants</div>
              <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px' }}>{bets.reduce((acc, bet) => acc + (bet.participantCount || 0), 0)}</div>
            </div>
          </div>
        </div>
      )}
      
      <style>{`.hover-lift:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.4); }`}</style>
      
      {loading ? (
         <div className="loader-container"><div className="loader"></div></div>
      ) : bets.length === 0 ? (
         <div className="glass-panel animate-fade-in" style={{ textAlign: 'center', padding: '80px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', border: '1px dashed rgba(102, 252, 241, 0.3)', background: 'linear-gradient(180deg, rgba(31, 40, 51, 0.3) 0%, rgba(11, 12, 16, 0.6) 100%)' }}>
           <div style={{ position: 'relative' }}>
             <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '120px', height: '120px', background: 'var(--primary-color)', filter: 'blur(60px)', opacity: 0.2, borderRadius: '50%' }}></div>
             <div style={{ background: 'rgba(102, 252, 241, 0.1)', padding: '28px', borderRadius: '50%', position: 'relative', zIndex: 1, border: '1px solid rgba(102, 252, 241, 0.2)' }}>
               <Flame size={48} color="var(--primary-color)" />
             </div>
           </div>
           <div>
             <h2 style={{ fontSize: '32px', marginBottom: '12px' }}>Market is Quiet</h2>
             <p style={{ color: 'var(--text-secondary)', maxWidth: '450px', margin: '0 auto', fontSize: '16px', lineHeight: '1.6' }}>The community is waiting for the next big event. Be the first to create a prediction market and start earning from the pool!</p>
           </div>
           <button className="btn btn-primary" style={{ marginTop: '16px', padding: '16px 40px', fontSize: '18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }} onClick={() => navigate('/create')}>
             <TrendingUp size={20} /> Create First Pool
           </button>
         </div>
      ) : (
         <div className="bet-grid">
           {bets.map(renderBetCard)}
         </div>
      )}
    </div>
  );
};

export default Home;
