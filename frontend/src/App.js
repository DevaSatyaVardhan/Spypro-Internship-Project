import React, { useState } from 'react';
import './App.css';
import BreakoutGame from './components/BreakoutGame';
import GameMenu from './components/GameMenu';
import GameOver from './components/GameOver';

function App() {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'gameOver', 'win'
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [username, setUsername] = useState(localStorage.getItem('breakout_username') || '');

  const startGame = (playerUsername) => {
    if (playerUsername) {
      setUsername(playerUsername);
      localStorage.setItem('breakout_username', playerUsername);
    }
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setLives(3);
  };

  const handleGameOver = () => {
    setGameState('gameOver');
  };

  const handleWin = () => {
    setGameState('win');
  };

  const handleLevelComplete = () => {
    setLevel(prev => prev + 1);
    setLives(3); // Reset lives for next level
  };

  const updateScore = (points) => {
    setScore(prev => prev + points);
  };

  const loseLife = () => {
    setLives(prev => {
      if (prev <= 1) {
        handleGameOver();
        return 0;
      }
      return prev - 1;
    });
  };

  return (
    <div className="App">
      {gameState === 'menu' && (
        <GameMenu onStartGame={startGame} />
      )}
      
      {gameState === 'playing' && (
        <BreakoutGame
          level={level}
          score={score}
          lives={lives}
          onUpdateScore={updateScore}
          onLoseLife={loseLife}
          onLevelComplete={handleLevelComplete}
          onGameOver={handleGameOver}
          onWin={handleWin}
        />
      )}
      
      {(gameState === 'gameOver' || gameState === 'win') && (
        <GameOver
          gameState={gameState}
          score={score}
          level={level}
          username={username}
          onRestart={() => startGame(username)}
        />
      )}
    </div>
  );
}

export default App; 