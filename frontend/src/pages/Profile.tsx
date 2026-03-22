import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import { Settings, User, LogOut } from 'lucide-react';

const Profile = () => {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = !id || id === user?.id?.toString() || id === 'me';

  useEffect(() => {
    const fetchId = (!id || id === 'me') ? 'me' : id;
    
    axios.get(`http://localhost:3000/api/profile/${fetchId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => setProfile(res.data))
    .catch(console.error)
    .finally(() => setLoading(false));
  }, [id, user, isOwnProfile]);

  if (loading) return <div className="loader-container"><div className="loader"></div></div>;

  return (
    <div className="container animate-fade-in" style={{ marginTop: '24px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
      <div className="glass-panel" style={{ textAlign: 'center', padding: '40px 20px', position: 'relative' }}>
        
        {isOwnProfile && (
          <button style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <Settings size={20} />
          </button>
        )}

        <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 32px' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '140px', height: '140px', background: 'var(--accent)', filter: 'blur(50px)', opacity: 0.3, borderRadius: '50%' }}></div>
          <div style={{ 
            width: '120px', height: '120px', borderRadius: '50%', 
            background: 'linear-gradient(135deg, var(--primary-color), var(--accent))', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', zIndex: 1, border: '4px solid rgba(11, 12, 16, 0.8)',
            boxShadow: '0 8px 32px rgba(102, 252, 241, 0.4)'
          }}>
            <User size={56} color="#000" strokeWidth={2.5} />
          </div>
        </div>
        
        <h2 style={{ fontSize: '36px', marginBottom: '8px', fontWeight: 900, letterSpacing: '-1px' }}>@{profile?.username}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '16px', fontWeight: 500 }}>{profile?.bio}</p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '40px', padding: '24px', background: 'rgba(11, 12, 16, 0.5)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--warning)' }}>{Math.floor(profile?.coins || 0).toLocaleString()}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '1px', marginTop: '4px' }}>Coins</div>
          </div>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--primary-color)' }}>{profile?.winRate || 0}%</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '1px', marginTop: '4px' }}>Win Rate</div>
          </div>
        </div>

        {isOwnProfile && (
          <button onClick={() => { logout(); window.location.href = '/login'; }} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}>
            <LogOut size={16} /> Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;
