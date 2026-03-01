import React, { useState, useEffect, useRef } from 'react';

const Loader = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('loading'); // loading -> ready -> countdown -> transition
  const [lights, setLights] = useState(0); // 0-5 red, 6 green
  const [carPos, setCarPos] = useState({ x: 0, y: 200, angle: 0 });
  
  const pathRef = useRef(null);
  const engineAudioRef = useRef(null);
  const swooshAudioRef = useRef(null);

  // 1. Simulate Loading Progression
  useEffect(() => {
    if (phase !== 'loading') return;
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 3) + 1;
        if (next >= 100) {
          clearInterval(interval);
          setPhase('ready');
          return 100;
        }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [phase]);

  // 2. Calculate Car Position based on SVG Path & Progress
  useEffect(() => {
    if (pathRef.current) {
      const pathLength = pathRef.current.getTotalLength();
      const distance = (progress / 100) * pathLength;
      const point = pathRef.current.getPointAtLength(distance);
      
      // Calculate angle by looking slightly ahead
      const nextDistance = Math.min(distance + 2, pathLength);
      const nextPoint = pathRef.current.getPointAtLength(nextDistance);
      const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);
      
      setCarPos({ x: point.x, y: point.y, angle });
    }
  }, [progress]);

  // 3. Handle Keyboard Enter to Ignite Engine
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && phase === 'ready') {
        setPhase('countdown');
        if (engineAudioRef.current) engineAudioRef.current.play();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase]);

  // 4. F1 Lights Sequence
  useEffect(() => {
    if (phase === 'countdown') {
      let currentLight = 0;
      const lightInterval = setInterval(() => {
        currentLight++;
        setLights(currentLight);
        
        if (currentLight === 6) { // GO! (Green)
          clearInterval(lightInterval);
          if (swooshAudioRef.current) swooshAudioRef.current.play();
          
          setTimeout(() => {
            setPhase('transition');
            // Trigger actual app load transition after zoom
            setTimeout(() => {
              if (onLoadingComplete) onLoadingComplete();
            }, 1000); 
          }, 400);
        }
      }, 600);
      return () => clearInterval(lightInterval);
    }
  }, [phase, onLoadingComplete]);

  // Tagline animation split
  const tagline = "Where Coding Meets Speed";

  return (
    <div className={`loader-container ${phase === 'transition' ? 'zoom-out' : ''}`}>
      {/* Hidden Audio Elements (Add your own src) */}
      <audio ref={engineAudioRef} src="/audio/engine-rev.mp3" preload="auto" />
      <audio ref={swooshAudioRef} src="/audio/wind-swoosh.mp3" preload="auto" />

      {/* Tunnel Background */}
      <div className="tunnel-bg"></div>

      {/* Main UI Container */}
      <div className="ui-layer">
        
        {/* Header: Logo & Tagline */}
        <div className="header">
          <h1 className="logo-text" data-text="DEBUG RACE">DEBUG RACE</h1>
          <div className="tagline">
            {tagline.split("").map((char, index) => (
              <span 
                key={index} 
                className="flicker-char" 
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </div>
        </div>

        {/* The Track & Car Vector Area */}
        <div className="track-area">
          <svg viewBox="0 0 1000 400" className="track-svg" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FEEA00" />
                <stop offset="100%" stopColor="#FF6E00" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="15" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Base Dark Track */}
            <path 
              id="base-track"
              d="M 50 300 C 250 300, 300 100, 500 100 C 700 100, 750 300, 950 300" 
              fill="none" 
              stroke="#1a1a1a" 
              strokeWidth="12"
              strokeLinecap="round"
            />
            
            {/* Hidden path for calculating positions */}
            <path 
              ref={pathRef}
              d="M 50 300 C 250 300, 300 100, 500 100 C 700 100, 750 300, 950 300" 
              fill="none" 
              stroke="transparent" 
            />

            {/* Glowing Gradient Trail */}
            <path 
              className={phase === 'transition' ? 'pulse-track' : ''}
              d="M 50 300 C 250 300, 300 100, 500 100 C 700 100, 750 300, 950 300" 
              fill="none" 
              stroke="url(#neonGradient)" 
              strokeWidth="6"
              strokeLinecap="round"
              filter="url(#glow)"
              strokeDasharray="1200"
              strokeDashoffset={1200 - (1200 * (progress / 100))}
              style={{ transition: 'stroke-dashoffset 0.1s linear' }}
            />

            {/* Animated Checkpoints */}
            {[25, 50, 75].map((cp, idx) => {
              const cpLen = pathRef.current ? pathRef.current.getTotalLength() * (cp / 100) : 0;
              const cpPos = pathRef.current ? pathRef.current.getPointAtLength(cpLen) : { x: 0, y: 0 };
              const isActive = progress >= cp;
              return (
                <circle 
                  key={idx}
                  cx={cpPos.x} 
                  cy={cpPos.y} 
                  r="8" 
                  fill={isActive ? '#FEEA00' : '#333'} 
                  filter={isActive ? 'url(#glow)' : ''}
                  className="checkpoint"
                />
              );
            })}

            {/* The Car & Particle Sparks */}
            <g transform={`translate(${carPos.x}, ${carPos.y}) rotate(${carPos.angle})`}>
              {/* Particle sparks trail */}
              {progress > 0 && progress < 100 && (
                <g className="sparks">
                  <circle cx="-10" cy="5" r="2" fill="#FF6E00" className="spark s1" />
                  <circle cx="-15" cy="-5" r="3" fill="#FEEA00" className="spark s2" />
                  <circle cx="-20" cy="0" r="1.5" fill="#FF6E00" className="spark s3" />
                </g>
              )}
              {/* Sleek Futuristic Car Body */}
              <polygon points="-15,-10 15,0 -15,10 -10,0" fill="#fff" filter="url(#glow)" />
              <polygon points="-12,-6 10,0 -12,6 -8,0" fill="#0B0B0B" />
            </g>
          </svg>
        </div>

        {/* Loading Progress & Action */}
        <div className="footer">
          {phase === 'loading' && (
            <div className="loading-stats">
              <span className="percent">{progress}%</span>
              <span className="sys-text">SYSTEMS INITIALIZING...</span>
            </div>
          )}

          {phase === 'ready' && (
            <div className="prompt blink">
              <span className="prompt-text">PRESS [ENTER] TO IGNITE ENGINE</span>
            </div>
          )}

          {/* F1 Countdown Lights */}
          {(phase === 'countdown' || phase === 'transition') && (
            <div className="f1-lights-container">
              {[1, 2, 3, 4, 5].map((light) => (
                <div key={light} className="f1-light-box">
                  <div className={`light ${lights >= light && lights < 6 ? 'red' : lights === 6 ? 'green' : ''}`}></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;800&family=Rajdhani:wght@600&display=swap');

        :root {
          --dark: #0B0B0B;
          --yellow: #FEEA00;
          --orange: #FF6E00;
        }

        .loader-container {
          position: relative;
          width: 100vw;
          height: 100vh;
          background-color: var(--dark);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Rajdhani', sans-serif;
          color: white;
          transition: transform 1s cubic-bezier(0.8, 0, 0.2, 1), opacity 1s ease-in;
        }

        /* The Final Zoom Transition */
        .zoom-out {
          transform: scale(4);
          opacity: 0;
          pointer-events: none;
        }

        /* Subtle Motion Tunnel Background */
        .tunnel-bg {
          position: absolute;
          top: -50%; left: -50%;
          width: 200%; height: 200%;
          background: radial-gradient(circle at center, transparent 20%, rgba(255, 110, 0, 0.05) 50%, var(--dark) 80%),
                      repeating-radial-gradient(circle at center, transparent, transparent 40px, rgba(254, 234, 0, 0.03) 41px, transparent 42px);
          animation: tunnel-move 10s infinite linear;
          z-index: 1;
        }

        @keyframes tunnel-move {
          0% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.05) rotate(1deg); }
          100% { transform: scale(1) rotate(0deg); }
        }

        .ui-layer {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1200px;
          aspect-ratio: 16/9;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 3rem;
        }

        /* Header / Logo */
        .header {
          text-align: center;
        }

        .logo-text {
          font-family: 'Orbitron', sans-serif;
          font-size: 4.5rem;
          font-weight: 800;
          margin: 0;
          background: linear-gradient(to bottom, #ffffff, #aaaaaa, #666666);
          -webkit-background-clip: text;
          color: transparent;
          position: relative;
          display: inline-block;
          filter: drop-shadow(0 0 15px rgba(255, 110, 0, 0.6));
        }
        
        /* Outline/Glow layering trick */
        .logo-text::after {
          content: attr(data-text);
          position: absolute;
          left: 0; top: 0;
          z-index: -1;
          background: linear-gradient(to right, var(--yellow), var(--orange));
          -webkit-background-clip: text;
          color: transparent;
          filter: blur(8px);
          opacity: 0.8;
        }

        .tagline {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.2rem;
          color: var(--yellow);
          letter-spacing: 4px;
          text-transform: uppercase;
          margin-top: 10px;
          text-shadow: 0 0 8px var(--orange);
        }

        .flicker-char {
          animation: neon-flicker 2s infinite forwards;
          opacity: 0;
        }

        @keyframes neon-flicker {
          0%, 10%, 12%, 18%, 20%, 100% { opacity: 1; text-shadow: 0 0 10px var(--yellow), 0 0 20px var(--orange); }
          11%, 19% { opacity: 0.3; text-shadow: none; }
        }

        /* Middle Track */
        .track-area {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          position: relative;
        }

        .track-svg {
          width: 100%;
          height: auto;
          overflow: visible;
        }

        .pulse-track {
          animation: track-pulse 0.5s infinite alternate;
        }

        @keyframes track-pulse {
          from { filter: drop-shadow(0 0 10px var(--orange)); }
          to { filter: drop-shadow(0 0 30px var(--yellow)); stroke-width: 10; }
        }

        /* Sparks */
        .spark {
          animation: fly-spark linear infinite;
        }
        .s1 { animation-duration: 0.4s; }
        .s2 { animation-duration: 0.6s; animation-delay: 0.2s; }
        .s3 { animation-duration: 0.3s; animation-delay: 0.1s; }

        @keyframes fly-spark {
          0% { transform: translateX(0) scale(1); opacity: 1; }
          100% { transform: translateX(-30px) translateY(10px) scale(0); opacity: 0; }
        }

        /* Footer / Status */
        .footer {
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .loading-stats {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .percent {
          font-family: 'Orbitron', sans-serif;
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--yellow);
          text-shadow: 0 0 15px var(--orange);
        }

        .sys-text {
          font-size: 1rem;
          color: #888;
          letter-spacing: 2px;
        }

        .prompt {
          padding: 15px 30px;
          border: 1px solid var(--orange);
          background: rgba(255, 110, 0, 0.1);
          border-radius: 4px;
          box-shadow: 0 0 15px rgba(255, 110, 0, 0.4), inset 0 0 15px rgba(255, 110, 0, 0.2);
          cursor: pointer;
        }

        .prompt-text {
          font-size: 1.5rem;
          font-weight: 600;
          background: linear-gradient(90deg, var(--yellow), var(--orange));
          -webkit-background-clip: text;
          color: transparent;
          letter-spacing: 2px;
        }

        .blink {
          animation: pulse-glow 1.5s infinite alternate;
        }

        @keyframes pulse-glow {
          0% { opacity: 0.6; box-shadow: 0 0 10px rgba(255, 110, 0, 0.2); }
          100% { opacity: 1; box-shadow: 0 0 30px rgba(254, 234, 0, 0.6); }
        }

        /* F1 Lights System */
        .f1-lights-container {
          display: flex;
          gap: 15px;
        }

        .f1-light-box {
          width: 40px;
          height: 40px;
          background: #111;
          border-radius: 50%;
          border: 2px solid #333;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 5px 10px rgba(0,0,0,0.8);
        }

        .light {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #222;
          transition: background 0.1s, box-shadow 0.1s;
        }

        .light.red {
          background: #ff0000;
          box-shadow: 0 0 20px #ff0000, inset 0 0 10px #ffaaaa;
        }

        .light.green {
          background: #00ff00;
          box-shadow: 0 0 20px #00ff00, inset 0 0 10px #aaffaa;
        }
      `}} />
    </div>
  );
};

export default Loader;