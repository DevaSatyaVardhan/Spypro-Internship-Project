import React from 'react';
import './GameUI.css';

const GameUI = ({
  score,
  level,
  lives,
  gameStarted,
  gamePaused,
  onStartGame,
  onTogglePause
}) => {
  return (
    <div className="game-ui">
      <div className="ui-section">
        <span className="ui-label">Score</span>
        <span className="ui-value">{score}</span>
      </div>
      <div className="ui-section">
        <span className="ui-label">Level</span>
        <span className="ui-value">{level}</span>
      </div>
      <div className="ui-section">
        <span className="ui-label">Lives</span>
        <span className="ui-value lives">
          {Array.from({ length: lives }).map((_, i) => (
            <span key={i} className="life">❤️</span>
          ))}
        </span>
      </div>
      <div className="ui-section ui-controls">
        {!gameStarted && (
          <button className="ui-btn start-btn" onClick={onStartGame}>
            ▶️ Start
          </button>
        )}
        {gameStarted && (
          <button className="ui-btn pause-btn" onClick={onTogglePause}>
            {gamePaused ? '⏸️ Resume' : '⏸️ Pause'}
          </button>
        )}
      </div>
    </div>
  );
};

export default GameUI; 