import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Coins, LogOut, PlusCircle, LayoutDashboard, Trophy, Briefcase, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { path: '/portfolio', label: 'Portfolio', icon: Briefcase },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="navbar animate-fade-in" style={{
      background: 'rgba(11, 12, 16, 0.75)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid rgba(102, 252, 241, 0.1)',
      height: '80px',
      display: 'flex',
      alignItems: 'center',
      position: 'fixed',
      top: 0,
      width: '100%',
      zIndex: 1000,
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4)'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        
        {/* Logo Section */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--accent) 100%)',
            borderRadius: '12px', padding: '8px', 
            boxShadow: '0 4px 15px rgba(102, 252, 241, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Coins size={22} color="#0b0c10" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Open<span className="gradient-text">Bet</span> AI
          </span>
        </Link>
        
        {/* Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(31, 40, 51, 0.4)', borderRadius: '100px', padding: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path} className="nav-pill" style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '100px',
                background: isActive ? 'rgba(102, 252, 241, 0.1)' : 'transparent',
                color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '14px',
                transition: 'all 0.3s ease'
              }}>
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Action Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn btn-primary" onClick={() => navigate('/create')} style={{ padding: '10px 20px', borderRadius: '100px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 20px rgba(102, 252, 241, 0.25)' }}>
            <PlusCircle size={16} /> Create Pool
          </button>
          
          <div style={{ height: '32px', width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          
          <div className="wallet-badge" style={{ padding: '8px 20px', background: 'rgba(251, 197, 49, 0.1)', border: '1px solid rgba(251, 197, 49, 0.3)', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(251, 197, 49, 0.2)', padding: '4px', borderRadius: '50%' }}>
              <Coins size={14} color="var(--warning)" />
            </div>
            <span style={{ color: 'var(--warning)', fontWeight: 700, fontSize: '15px' }}>{Math.floor(user?.coins || 0).toLocaleString()}</span>
          </div>
          
          <button onClick={handleLogout} className="btn btn-outline hover-danger" style={{ padding: '8px', borderRadius: '50%', color: 'var(--text-secondary)', borderColor: 'rgba(255, 255, 255, 0.1)', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>
      
      <style>{`
        .nav-pill:hover {
          background: rgba(102, 252, 241, 0.05) !important;
          color: var(--text-primary) !important;
        }
        .hover-danger:hover {
          background: rgba(255, 75, 75, 0.1) !important;
          color: var(--danger) !important;
          border-color: rgba(255, 75, 75, 0.3) !important;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
