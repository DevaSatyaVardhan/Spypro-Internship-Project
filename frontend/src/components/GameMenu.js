import React, { useState, useEffect } from 'react';
import './GameMenu.css';

const GameMenu = ({ onStartGame }) => {
  const [username, setUsername] = useState(
    localStorage.getItem('breakout_username') || ''
  );
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dbError, setDbError] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/scores/leaderboard');
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
        setDbError(false);
      } else {
        setDbError(true);
      }
    } catch (err) {
      console.warn('Backend server seems offline. Leaderboard disabled.');
      setDbError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a username to start!');
      return;
    }
    if (username.trim().length > 15) {
      setError('Username must be 15 characters or less!');
      return;
    }
    setError('');
    onStartGame(username.trim());
  };

  return (
    <div className="game-menu">
      <div className="menu-container">
        <div className="menu-content">
          <h1 className="game-title">🎮 BREAKOUT</h1>
          <div className="game-subtitle">Classic Arcade Game</div>
          
          <form className="username-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="username-input">Enter Arcade Name:</label>
              <input
                id="username-input"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. PLAYER1"
                maxLength={15}
                className={error ? 'input-error' : ''}
              />
              {error && <span className="error-message">{error}</span>}
            </div>
            
            <button type="submit" className="start-button">
              🚀 Start Game
            </button>
          </form>

          <div className="menu-instructions">
            <h3>How to Play:</h3>
            <ul>
              <li>🖱️ Move the paddle with mouse or touch</li>
              <li>⚡ Break all bricks to advance</li>
              <li>💎 Don't let the ball fall!</li>
              <li>🏆 Complete levels to win</li>
            </ul>
          </div>
        </div>

        <div className="leaderboard-panel">
          <h2 className="leaderboard-title">🏆 HALL OF FAME</h2>
          {loading ? (
            <div className="leaderboard-status">Loading high scores...</div>
          ) : dbError ? (
            <div className="leaderboard-status offline">
              <p>Leaderboard offline 🔌</p>
              <p className="subtext">Play locally - score won't be saved</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="leaderboard-status empty">
              No scores recorded yet. Be the first!
            </div>
          ) : (
            <div className="leaderboard-table-container">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Player</th>
                    <th>Score</th>
                    <th>Level</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((item, index) => (
                    <tr key={item.id || index} className={index === 0 ? 'top-rank' : ''}>
                      <td>{index + 1}</td>
                      <td className="player-name">{item.username}</td>
                      <td className="player-score">{item.score}</td>
                      <td>Lvl {item.level}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameMenu; 