import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Clock } from 'lucide-react';

const socket = io('http://localhost:3000');

interface Activity {
  id: string;
  message: string;
  timestamp: Date;
}

const ActivityTicker = () => {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // Listen for global betting activities
    socket.on('bet_activity', (data: { message: string }) => {
      setActivities(prev => [
        { id: Math.random().toString(), message: data.message, timestamp: new Date() },
        ...prev
      ].slice(0, 5)); // Keep last 5 activities
    });

    return () => {
      socket.off('bet_activity');
    };
  }, []);

  if (activities.length === 0) return null;

  return (
    <div className="activity-ticker" style={{ 
      background: 'rgba(11, 12, 16, 0.8)', 
      padding: '8px 16px', 
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      border: '1px solid rgba(102, 252, 241, 0.1)'
    }}>
      <Clock size={16} color="var(--primary-color)" />
      <div className="ticker-content" style={{ display: 'flex', gap: '24px', animation: 'ticker 20s linear infinite' }}>
        {activities.map(act => (
          <span key={act.id} style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {act.message} <span style={{ opacity: 0.5, fontSize: '11px', marginLeft: '6px' }}>{act.timestamp.toLocaleTimeString()}</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};

export default ActivityTicker;
