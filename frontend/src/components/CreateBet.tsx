import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';

const CreateBet = () => {
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(['YES', 'NO']);
  const [entryAmount, setEntryAmount] = useState(50);
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deadlineDate || !deadlineTime) return alert('Select deadline');
    
    const deadline = new Date(`${deadlineDate}T${deadlineTime}`).toISOString();
    
    try {
      await axios.post('http://localhost:3000/api/bets', {
        title, options, entryAmount, deadline
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      navigate('/');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create bet');
    }
  };

  const generateAITopics = async () => {
    setLoadingAI(true);
    try {
      const res = await axios.get('http://localhost:3000/api/ai/topics', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.data && res.data.length > 0) {
        setTitle(res.data[0].title);
        // ensure format
        if (Array.isArray(res.data[0].options)) {
            setOptions([res.data[0].options[0] || 'YES', res.data[0].options[1] || 'NO']);
        }
      }
    } catch (err) {
      alert('AI Generation Failed. Please ensure GEMINI_API_KEY is set in backend.');
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '40px' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '600px' }}>
        <div className="flex-between" style={{ marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Create <span className="gradient-text">Pool</span></h2>
            <p style={{ color: 'var(--text-secondary)' }}>Launch a custom prediction pool for others to join.</p>
          </div>
          <button type="button" onClick={generateAITopics} disabled={loadingAI} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '14px', borderRadius: '30px' }}>
             {loadingAI ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} color="var(--primary-color)" />}
             Auto-Gen AI Topic
          </button>
        </div>
        
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">Title / Question</label>
            <input type="text" className="form-input" placeholder="e.g. Will India win the next match?" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Option 1</label>
              <input type="text" className="form-input" value={options[0]} onChange={(e) => setOptions([e.target.value, options[1]])} required />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Option 2</label>
              <input type="text" className="form-input" value={options[1]} onChange={(e) => setOptions([options[0], e.target.value])} required />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Entry Amount (Coins)</label>
            <input type="number" className="form-input" value={entryAmount} onChange={(e) => setEntryAmount(Number(e.target.value))} min={1} required />
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>Amount each player must deposit to join the pool.</div>
          </div>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Deadline Date</label>
              <input type="date" className="form-input" value={deadlineDate} onChange={(e) => setDeadlineDate(e.target.value)} required />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Deadline Time</label>
              <input type="time" className="form-input" value={deadlineTime} onChange={(e) => setDeadlineTime(e.target.value)} required />
            </div>
          </div>
          
          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--panel-border)' }}>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '18px' }}>
              Launch Prediction Pool <ArrowRight size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBet;
