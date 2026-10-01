import React, { useState, useEffect, useRef, useCallback } from 'react';
import './BreakoutGame.css';
import GameUI from './GameUI';

const BreakoutGame = ({
  level,
  score,
  lives,
  onUpdateScore,
  onLoseLife,
  onLevelComplete,
  onGameOver,
  onWin
}) => {
  const canvasRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [bricks, setBricks] = useState([]);
  const [ball, setBall] = useState({ x: 0, y: 0, dx: 0, dy: 0, radius: 8 });
  const [paddle, setPaddle] = useState({ x: 0, y: 0, width: 100, height: 10 });
  const [gameArea, setGameArea] = useState({ width: 800, height: 600 });
  const [bricksDestroyed, setBricksDestroyed] = useState(0);
  const [totalBricks, setTotalBricks] = useState(0);

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, [level]);

  // Keys state refs
  const keysPressed = useRef({ left: false, right: false });
  const gameStateRef = useRef({ gameStarted, gamePaused });
  const isResettingRef = useRef(false);

  // Sync game state ref with state
  useEffect(() => {
    gameStateRef.current = { gameStarted, gamePaused };
  }, [gameStarted, gamePaused]);

  // Keyboard input event listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      const { gameStarted: started, gamePaused: paused } = gameStateRef.current;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        keysPressed.current.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        keysPressed.current.right = true;
      }
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!started) {
          startGame();
        } else if (paused) {
          togglePause();
        }
      }
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        e.preventDefault();
        if (started) {
          togglePause();
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysPressed.current.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysPressed.current.right = false;
      }
    };

    const handleBlur = () => {
      keysPressed.current.left = false;
      keysPressed.current.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Game loop
  useEffect(() => {
    if (gamePaused) return;

    const gameLoop = () => {
      updateGame();
      drawGame();
    };

    const intervalId = setInterval(gameLoop, 16); // ~60 FPS

    return () => clearInterval(intervalId);
  }, [gameStarted, gamePaused, ball, paddle, bricks]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        setGameArea({ width: rect.width, height: rect.height });
        initializeGame();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const initializeGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width > 0 ? rect.width : 800;
    const height = rect.height > 0 ? rect.height : 600;

    setGameArea({ width, height });

    // Initialize paddle
    setPaddle({
      x: width / 2 - 50,
      y: height - 30,
      width: Math.min(100, width * 0.15),
      height: 10
    });

    // Initialize ball
    setBall({
      x: width / 2,
      y: height - 50,
      dx: 0,
      dy: 0,
      radius: Math.max(6, width * 0.01)
    });

    // Initialize bricks
    const brickRows = Math.min(8, Math.floor(height * 0.3 / 30));
    const brickCols = Math.min(12, Math.floor(width / 70));
    const brickWidth = width / brickCols - 4;
    const brickHeight = 25;
    const brickPadding = 2;

    const newBricks = [];
    for (let row = 0; row < brickRows; row++) {
      for (let col = 0; col < brickCols; col++) {
        newBricks.push({
          x: col * (brickWidth + brickPadding) + brickPadding,
          y: row * (brickHeight + brickPadding) + 50,
          width: brickWidth,
          height: brickHeight,
          visible: true,
          color: getBrickColor(row, level)
        });
      }
    }

    setBricks(newBricks);
    setTotalBricks(newBricks.length);
    setBricksDestroyed(0);
    setGameStarted(false);
    setGamePaused(false);
    isResettingRef.current = false;
  }, [level]);

  const getBrickColor = (row, level) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
    ];
    return colors[(row + level) % colors.length];
  };

  const startGame = useCallback(() => {
    setGameStarted(started => {
      if (!started) {
        isResettingRef.current = false;
        setBall(prev => ({
          ...prev,
          dx: 4,
          dy: -4
        }));
        return true;
      }
      return started;
    });
  }, []);

  const togglePause = useCallback(() => {
    setGamePaused(prev => !prev);
  }, []);

  const updateGame = () => {
    if (gamePaused) return;

    // Update paddle position based on keys pressed
    let paddleDx = 0;
    const paddleSpeed = 8;
    if (keysPressed.current.left) {
      paddleDx = -paddleSpeed;
    }
    if (keysPressed.current.right) {
      paddleDx = paddleSpeed;
    }

    if (paddleDx !== 0) {
      setPaddle(prev => ({
        ...prev,
        x: Math.max(0, Math.min(gameArea.width - prev.width, prev.x + paddleDx))
      }));
    }

    if (!gameStarted) return;

    // Update ball position
    setBall(prev => {
      let newX = prev.x + prev.dx;
      let newY = prev.y + prev.dy;
      let newDx = prev.dx;
      let newDy = prev.dy;

      // Wall collision
      if (newX - prev.radius <= 0 || newX + prev.radius >= gameArea.width) {
        newDx = -newDx;
        newX = Math.max(prev.radius, Math.min(gameArea.width - prev.radius, newX));
      }

      if (newY - prev.radius <= 0) {
        newDy = -newDy;
        newY = prev.radius;
      }

      // Bottom wall (lose life)
      if (newY + prev.radius >= gameArea.height) {
        if (!isResettingRef.current) {
          isResettingRef.current = true;
          onLoseLife();
          if (lives > 1) {
            setGameStarted(true);
            setGamePaused(false);
            isResettingRef.current = false;
          } else {
            setGameStarted(false);
          }
        }

        const restartX = Math.max(prev.radius, Math.min(gameArea.width - prev.radius, newX));
        const restartY = gameArea.height - prev.radius - 1;

        return {
          x: restartX,
          y: restartY,
          dx: prev.dx || 4,
          dy: -Math.abs(prev.dy || 4),
          radius: prev.radius
        };
      }

      // Paddle collision
      if (newY + prev.radius >= paddle.y &&
          newX >= paddle.x &&
          newX <= paddle.x + paddle.width &&
          newY <= paddle.y + paddle.height) {
        newDy = -Math.abs(newDy);
        newY = paddle.y - prev.radius;
        
        // Calculate bounce angle based on where ball hits paddle
        const hitPos = (newX - paddle.x) / paddle.width;
        const angle = (hitPos - 0.5) * Math.PI / 3; // -30 to 30 degrees
        const speed = Math.sqrt(newDx * newDx + newDy * newDy);
        newDx = speed * Math.sin(angle);
        newDy = -speed * Math.cos(angle);
      }

      return { ...prev, x: newX, y: newY, dx: newDx, dy: newDy };
    });

    // Update bricks and check collisions
    setBricks(prev => {
      const newBricks = [...prev];
      let bricksDestroyedThisFrame = 0;

      newBricks.forEach(brick => {
        if (!brick.visible) return;

        if (ball.x + ball.radius >= brick.x &&
            ball.x - ball.radius <= brick.x + brick.width &&
            ball.y + ball.radius >= brick.y &&
            ball.y - ball.radius <= brick.y + brick.height) {
          
          brick.visible = false;
          bricksDestroyedThisFrame++;
          onUpdateScore(10 * level);

          // Ball bounce
          const ballCenterX = ball.x;
          const ballCenterY = ball.y;
          const brickCenterX = brick.x + brick.width / 2;
          const brickCenterY = brick.y + brick.height / 2;

          const dx = ballCenterX - brickCenterX;
          const dy = ballCenterY - brickCenterY;

          if (Math.abs(dx) > Math.abs(dy)) {
            setBall(prev => ({ ...prev, dx: -prev.dx }));
          } else {
            setBall(prev => ({ ...prev, dy: -prev.dy }));
          }
        }
      });

      if (bricksDestroyedThisFrame > 0) {
        setBricksDestroyed(prev => prev + bricksDestroyedThisFrame);
      }

      return newBricks;
    });
  };

  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw bricks
    bricks.forEach(brick => {
      if (brick.visible) {
        ctx.fillStyle = brick.color;
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        
        // Add shine effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height / 3);
      }
    });

    // Draw paddle
    ctx.fillStyle = '#667eea';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    // Add shine effect to paddle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height / 2);

    // Draw ball
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add glow effect to ball
    ctx.shadowColor = '#667eea';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  // Check for level completion
  useEffect(() => {
    if (bricksDestroyed === totalBricks && totalBricks > 0) {
      if (level >= 5) {
        onWin();
      } else {
        onLevelComplete();
      }
    }
  }, [bricksDestroyed, totalBricks, level, onLevelComplete, onWin]);

  return (
    <div className="breakout-game">
      <GameUI
        score={score}
        level={level}
        lives={lives}
        gameStarted={gameStarted}
        gamePaused={gamePaused}
        onStartGame={startGame}
        onTogglePause={togglePause}
      />
      
      <div className="game-canvas-container">
        <canvas
          ref={canvasRef}
          className="game-canvas"
          width={gameArea.width}
          height={gameArea.height}
          onClick={!gameStarted ? startGame : undefined}
        />
        
        {!gameStarted && (
          <div className="start-overlay">
            <div className="start-message" onClick={startGame} style={{ cursor: 'pointer' }}>
              <h2>Press Space or Click to Start</h2>
              <p>Use Arrow keys or A/D to control the paddle</p>
            </div>
          </div>
        )}
        
        {gamePaused && (
          <div className="pause-overlay">
            <div className="pause-message" onClick={togglePause} style={{ cursor: 'pointer' }}>
              <h2>Game Paused</h2>
              <p>Press Space or Click to resume</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BreakoutGame; 