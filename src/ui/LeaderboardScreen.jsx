import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { supabase } from '../lib/supabase';
import { LEVEL_META } from '../levels/registry';
import './Overlay.css';

export default function LeaderboardScreen() {
  const setScreen = useGameStore(s => s.setScreen);
  const [tab, setTab] = useState('global'); // 'global' or levelId (1-13)
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScores();
  }, [tab]);

  const fetchScores = async () => {
    setLoading(true);
    setScores([]);

    try {
      if (tab === 'global') {
        // Global: Sum of all total_scores per user
        // Note: Supabase JS client doesn't do complex GROUP BY natively easily without an RPC.
        // For simplicity without RPC, we'll fetch all scores and group them in JS (fine for early scaling),
        // or you can create a view in Supabase later.
        const { data, error } = await supabase
          .from('scores')
          .select('total_score, user_id, profiles(username)');
        
        if (!error && data) {
          const grouped = data.reduce((acc, curr) => {
            const uid = curr.user_id;
            if (!acc[uid]) acc[uid] = { 
              username: curr.profiles?.username || 'Unknown', 
              score: 0 
            };
            acc[uid].score += Number(curr.total_score);
            return acc;
          }, {});
          
          const sorted = Object.values(grouped).sort((a, b) => a.score - b.score).slice(0, 50);
          setScores(sorted);
        }
      } else {
        // Specific Level
        const { data, error } = await supabase
          .from('scores')
          .select('deaths, time_ms, total_score, profiles(username)')
          .eq('level_id', tab)
          .order('total_score', { ascending: true })
          .limit(50);
          
        if (!error && data) {
          const formatted = data.map(d => ({
            username: d.profiles?.username || 'Unknown',
            deaths: d.deaths,
            time: d.time_ms,
            score: d.total_score
          }));
          setScores(formatted);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const formatTime = (ms) => {
    const s = Math.floor(ms / 1000);
    const msPart = Math.floor((ms % 1000) / 10);
    return `${s}.${msPart.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="overlay complete-overlay" style={{ background: 'rgba(6, 6, 6, 0.95)' }}>
      <div className="overlay-content" style={{ maxWidth: '800px', width: '90%', height: '80vh', display: 'flex', flexDirection: 'column' }}>
        <h2 className="overlay-title" style={{ color: '#c8c2b8', marginBottom: '20px' }}>Leaderboards</h2>
        
        {/* Tabs */}
        <div style={{ display: 'flex', overflowX: 'auto', gap: '10px', paddingBottom: '10px', borderBottom: '1px solid rgba(200, 194, 184, 0.1)', marginBottom: '20px' }}>
          <button 
            className={`tab-btn ${tab === 'global' ? 'active' : ''}`}
            onClick={() => setTab('global')}
            style={getTabStyle(tab === 'global')}
          >
            GLOBAL
          </button>
          {LEVEL_META.map(l => (
            <button 
              key={l.id}
              className={`tab-btn ${tab === l.id ? 'active' : ''}`}
              onClick={() => setTab(l.id)}
              style={{...getTabStyle(tab === l.id), color: tab === l.id ? l.accent : '#888'}}
            >
              {l.id}. {l.name}
            </button>
          ))}
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#888', fontFamily: '"JetBrains Mono", monospace' }}>COMMUNING WITH SOULS...</div>
          ) : scores.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#888', fontFamily: '"JetBrains Mono", monospace' }}>NO RECORDS FOUND</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: '"JetBrains Mono", monospace', fontSize: '14px' }}>
              <thead>
                <tr style={{ color: '#666', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 5px' }}>RANK</th>
                  <th style={{ padding: '10px 5px' }}>SOUL</th>
                  {tab !== 'global' && <th style={{ padding: '10px 5px' }}>DEATHS</th>}
                  {tab !== 'global' && <th style={{ padding: '10px 5px' }}>TIME</th>}
                  <th style={{ padding: '10px 5px', textAlign: 'right' }}>SCORE</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((s, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: i === 0 ? '#ffcc00' : i < 3 ? '#e0e0e0' : '#888' }}>
                    <td style={{ padding: '12px 5px' }}>#{i + 1}</td>
                    <td style={{ padding: '12px 5px' }}>{s.username}</td>
                    {tab !== 'global' && <td style={{ padding: '12px 5px' }}>{s.deaths}</td>}
                    {tab !== 'global' && <td style={{ padding: '12px 5px' }}>{formatTime(s.time)}</td>}
                    <td style={{ padding: '12px 5px', textAlign: 'right' }}>{s.score.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="overlay-buttons" style={{ marginTop: '20px' }}>
          <button className="overlay-btn" onClick={() => setScreen('menu')}>RETURN TO MENU</button>
        </div>
      </div>
    </div>
  );
}

const getTabStyle = (isActive) => ({
  background: 'none',
  border: 'none',
  color: isActive ? '#c8c2b8' : '#666',
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: '12px',
  cursor: 'pointer',
  padding: '5px 10px',
  whiteSpace: 'nowrap',
  opacity: isActive ? 1 : 0.6,
  borderBottom: isActive ? '2px solid currentColor' : '2px solid transparent',
  transition: 'all 0.2s'
});
