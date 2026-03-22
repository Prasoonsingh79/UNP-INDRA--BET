import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Users, Trophy } from 'lucide-react';

const MarketDetail = () => {
  const { slug } = useParams();
  const [market, setMarket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, 'slug' acts as the bet ID or slug
    // Here we fake the fetch
    setTimeout(() => {
      setMarket({
        id: slug,
        title: `Market Prediction: ${slug?.replace(/-/g, ' ').toUpperCase()}`,
        creator: 'admin',
        entryAmount: 50,
        totalPool: 12500,
        participantCount: 45,
        deadline: new Date(Date.now() + 86400000).toISOString(),
        options: [
          { id: 1, text: 'Option A (Bullish)', percentage: 65 },
          { id: 2, text: 'Option B (Bearish)', percentage: 35 }
        ]
      });
      setLoading(false);
    }, 600);
  }, [slug]);

  if (loading) return <div className="loader-container"><div className="loader"></div></div>;

  return (
    <div className="container animate-fade-in" style={{ marginTop: '24px', maxWidth: '800px' }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Back to Markets
      </Link>

      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="flex-between" style={{ marginBottom: '16px' }}>
           <div className="badge badge-accent">Featured Market</div>
           <div className="badge"><Clock size={14} /> Ends soon</div>
        </div>
        
        <h1 style={{ fontSize: '28px', marginBottom: '8px', lineHeight: '1.4' }}>{market.title}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>
          Created by <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>@{market.creator}</span>
        </p>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
          <div style={{ flex: 1, background: 'rgba(11, 12, 16, 0.4)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'rgba(251, 197, 49, 0.2)', padding: '12px', borderRadius: '12px' }}>
              <Trophy size={24} color="var(--warning)" />
            </div>
            <div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Liquidity</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--warning)' }}>{market.totalPool} C</div>
            </div>
          </div>
          <div style={{ flex: 1, background: 'rgba(11, 12, 16, 0.4)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'rgba(102, 252, 241, 0.2)', padding: '12px', borderRadius: '12px' }}>
              <Users size={24} color="var(--primary-color)" />
            </div>
            <div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Traders</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{market.participantCount}</div>
            </div>
          </div>
        </div>

        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>Trade Options</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {market.options.map((opt: any) => (
            <button key={opt.id} className="btn" style={{ 
              position: 'relative', overflow: 'hidden', padding: '16px 20px', 
              background: 'rgba(11, 12, 16, 0.6)', border: '1px solid rgba(102, 252, 241, 0.2)', 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left',
              transition: 'all 0.2s ease', cursor: 'pointer'
            }} onClick={() => alert(`Purchased shares in ${opt.text}`)}>
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${opt.percentage}%`, background: 'rgba(102, 252, 241, 0.1)', zIndex: 0 }}></div>
              <span style={{ position: 'relative', zIndex: 1, fontWeight: 'bold', fontSize: '16px' }}>{opt.text}</span>
              <span style={{ position: 'relative', zIndex: 1, color: 'var(--primary-color)', fontWeight: 'bold' }}>{opt.percentage}% • Buy @ {market.entryAmount}C</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketDetail;
