import React, { useState, useEffect } from 'react';
import './GameOver.css';

const GameOver = ({ gameState, score, level, username, onRestart }) => {
  const isWin = gameState === 'win';
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('submitting'); // 'submitting', 'submitted', 'error'

  useEffect(() => {
    const submitAndFetchScores = async () => {
      // First, submit the score
      try {
        setSubmitStatus('submitting');
        const response = await fetch('http://localhost:8080/api/scores', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: username || 'UNKNOWN',
            score: score,
            level: level
          })
        });

        if (response.ok) {
          setSubmitStatus('submitted');
        } else {
          setSubmitStatus('error');
        }
      } catch (err) {
        console.warn('Backend server offline. Score not submitted.');
        setSubmitStatus('error');
      }

      // Then fetch the leaderboard
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
        setDbError(true);
      } finally {
        setLoading(false);
      }
    };

    submitAndFetchScores();
  }, [username, score, level]);

  return (
    <div className="game-over">
      <div className="game-over-container">
        <div className="game-over-content">
          <div className={`result-icon ${isWin ? 'win' : 'lose'}`}>
            {isWin ? '🏆' : '💔'}
          </div>
          
          <h1 className="result-title">
            {isWin ? 'Congratulations!' : 'Game Over'}
          </h1>
          
          <div className="result-subtitle">
            {isWin ? 'You completed all levels!' : 'Better luck next time!'}
          </div>
          
          <div className="game-stats">
            <div className="stat">
              <span className="stat-label">Player:</span>
              <span className="stat-value">{username || 'Anonymous'}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Final Score:</span>
              <span className="stat-value highlight">{score}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Level Reached:</span>
              <span className="stat-value">{level}</span>
            </div>
          </div>

          <div className="submit-indicator">
            {submitStatus === 'submitting' && <span className="submitting">Saving score...</span>}
            {submitStatus === 'submitted' && <span className="submitted">✓ Score saved online</span>}
            {submitStatus === 'error' && <span className="error">⚠ Score saved locally only</span>}
          </div>
          
          <button className="restart-button" onClick={onRestart}>
            {isWin ? '🎮 Play Again' : '🔄 Try Again'}
          </button>
          
          <div className="game-over-footer">
            <p>Thanks for playing, {username}!</p>
          </div>
        </div>

        <div className="leaderboard-panel">
          <h2 className="leaderboard-title">🏆 LEADERBOARD</h2>
          {loading ? (
            <div className="leaderboard-status">Loading ranks...</div>
          ) : dbError ? (
            <div className="leaderboard-status offline">
              <p>Leaderboard offline 🔌</p>
              <p className="subtext">Could not sync with the database</p>
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
                  {leaderboard.map((item, index) => {
                    const isCurrentUserScore = 
                      item.username === username && 
                      item.score === score && 
                      item.level === level;
                    return (
                      <tr 
                        key={item.id || index} 
                        className={`${index === 0 ? 'top-rank' : ''} ${isCurrentUserScore ? 'current-player-row' : ''}`}
                      >
                        <td>{index + 1}</td>
                        <td className="player-name">
                          {item.username}
                          {isCurrentUserScore && <span className="you-tag"> (You)</span>}
                        </td>
                        <td className="player-score">{item.score}</td>
                        <td>Lvl {item.level}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameOver; 