import React, { useRef, useEffect, useState } from 'react';

function MapCanvas({ backgroundImageSrc, showScale = false, onTokenDoubleClick }) {
  const canvasRef = useRef(null);
  
  // Track window size for full-screen canvas
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Load the background image
  const [bgImage, setBgImage] = useState(null);

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = backgroundImageSrc;
    img.onload = () => {
      setBgImage(img);
    };
  }, [backgroundImageSrc]);
  
  // State for draggable tokens
  const [tokens, setTokens] = useState([
    { id: 'player1', type: 'pc', x: window.innerWidth / 2, y: window.innerHeight / 2, color: '#3b82f6', label: 'Dietrich' },
    { id: 'enemy1', type: 'npc', x: window.innerWidth / 2 + 100, y: window.innerHeight / 2 - 50, color: '#ef4444', label: 'Cultist' },
    { id: 'enemy2', type: 'npc', x: window.innerWidth / 2 + 150, y: window.innerHeight / 2 + 50, color: '#ef4444', label: 'Cultist' }
  ]);
  
  // State for interaction
  const [draggingTokenId, setDraggingTokenId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const tokenRadius = 25; // Slightly larger for full screen

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // 1. Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Draw Background (Image or Fallback)
    if (bgImage) {
      // Calculate scale to "cover" the canvas without stretching (maintain aspect ratio)
      const hRatio = canvas.width / bgImage.width;
      const vRatio = canvas.height / bgImage.height;
      const ratio = Math.max(hRatio, vRatio);
      
      const newWidth = bgImage.width * ratio;
      const newHeight = bgImage.height * ratio;
      
      // Center the image
      const offsetX = (canvas.width - newWidth) / 2;
      const offsetY = (canvas.height - newHeight) / 2;
      
      ctx.drawImage(bgImage, offsetX, offsetY, newWidth, newHeight);
    } else {
      ctx.fillStyle = '#1e1b18'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 3. Draw Scale Key for scenes that use tactical distance
    if (showScale) {
      ctx.fillStyle = '#111';
      ctx.fillRect(10, canvas.height - 70, 180, 50);

      ctx.fillStyle = '#d4c4a8';
      ctx.font = '14px "Cinzel", serif';
      const scaleY = canvas.height - 50;
      ctx.fillText('Scale: 1 inch = 2 yards', 20, scaleY);
      ctx.beginPath();
      ctx.moveTo(20, scaleY + 10);
      ctx.lineTo(80, scaleY + 10); 
      ctx.moveTo(20, scaleY + 5);
      ctx.lineTo(20, scaleY + 15);
      ctx.moveTo(80, scaleY + 5);
      ctx.lineTo(80, scaleY + 15);
      ctx.strokeStyle = '#d4c4a8';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 4. Draw Tokens
    tokens.forEach(token => {
      ctx.beginPath();
      ctx.arc(token.x, token.y, tokenRadius, 0, 2 * Math.PI);
      ctx.fillStyle = '#2c2722'; 
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = token.color; 
      ctx.stroke();

      ctx.fillStyle = '#e5e7eb';
      ctx.font = 'bold 20px "Lora", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const initial = token.label.charAt(0).toUpperCase();
      ctx.fillText(initial, token.x, token.y);
      
      // Token Label with text shadow for readability over map
      ctx.shadowColor = "black";
      ctx.shadowBlur = 4;
      ctx.lineWidth = 2;
      ctx.fillStyle = '#a89f91';
      ctx.font = '14px "Lora", sans-serif';
      ctx.fillText(token.label, token.x, token.y + tokenRadius + 20);
      ctx.shadowBlur = 0; // Reset shadow
    });

  }, [tokens, windowSize, bgImage, showScale]); 

  // Mouse Interaction Handlers
  const getMousePos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e) => {
    const mousePos = getMousePos(e);
    
    for (let i = tokens.length - 1; i >= 0; i--) {
      const token = tokens[i];
      const dx = mousePos.x - token.x;
      const dy = mousePos.y - token.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= tokenRadius) {
        setDraggingTokenId(token.id);
        setDragOffset({ x: dx, y: dy });
        break; 
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!draggingTokenId) return;

    const mousePos = getMousePos(e);
    
    setTokens(prevTokens => prevTokens.map(token => 
      token.id === draggingTokenId 
        ? { ...token, x: mousePos.x - dragOffset.x, y: mousePos.y - dragOffset.y }
        : token
    ));
  };

  const handleMouseUp = () => {
    setDraggingTokenId(null);
  };

  const handleMouseLeave = () => {
    setDraggingTokenId(null); 
  };

  const handleDoubleClick = (e) => {
    const mousePos = getMousePos(e);
    
    for (let i = tokens.length - 1; i >= 0; i--) {
      const token = tokens[i];
      const dx = mousePos.x - token.x;
      const dy = mousePos.y - token.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= tokenRadius) {
        if (onTokenDoubleClick) {
          onTokenDoubleClick(token.id);
        }
        break; 
      }
    }
  };

  return (
    <div className="map-container" style={{ width: '100%', height: '100%' }}>
      <canvas 
        ref={canvasRef} 
        width={windowSize.width} 
        height={windowSize.height} 
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={handleDoubleClick}
        style={{ 
          cursor: draggingTokenId ? 'grabbing' : 'grab',
          display: 'block'
        }}
      />
    </div>
  );
}

export default MapCanvas;
