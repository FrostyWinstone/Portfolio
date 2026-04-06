import React, { useEffect, useState } from 'react';

const linesCount = 20;

const generateGibberish = () => {
  const patterns = [
    () => `0x${Math.random().toString(16).substr(2, 8).toUpperCase()} FETCH_AHEAD...`,
    () => `[OK] SEC_NODE_${Math.floor(Math.random()*999)} CONNECTED`,
    () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>';
      let line = 'DUMP: ';
      for(let i=0; i<25; i++) line += chars.charAt(Math.floor(Math.random() * chars.length));
      return line;
    },
    () => `ROUTING PKT_LOSS: ${Math.random().toFixed(4)}`,
    () => `bypassing mainframe protocol //${Math.floor(Math.random()*99)}%`,
    () => `init sequence var_map --force-override`,
    () => `[WARN] ENCRYPTION HANDSHAKE UNSTABLE...`
  ];
  return patterns[Math.floor(Math.random() * patterns.length)]();
};

export default function TerminalHacker() {
  const [lines, setLines] = useState([]);

  useEffect(() => {
    // Initial layout
    const initial = Array(linesCount).fill('').map(() => generateGibberish());
    setLines(initial);

    const intervalId = setInterval(() => {
      setLines(prev => {
        const newLines = [...prev];
        newLines.shift(); // Remove top line
        newLines.push(generateGibberish()); // Add new bottom line
        return newLines;
      });
    }, 80); // 80ms gives a very fast, pro Hollywood hacker speed

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div style={{
      position: 'absolute',
      top: '5vh',
      right: '0',
      width: '400px',
      color: 'var(--accent-green)',
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '0.8rem',
      fontWeight: 'bold',
      lineHeight: '1.4',
      textAlign: 'right',
      opacity: 0.6,
      pointerEvents: 'none',
      textShadow: '0 0 8px var(--accent-green)',
      zIndex: 5,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      height: '400px',
      maskImage: 'linear-gradient(to bottom, transparent 0%, black 80%)',
      WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 80%)',
      whiteSpace: 'nowrap',
      overflow: 'hidden'
    }}>
      {lines.map((l, i) => (
        <div key={i}>{l}</div>
      ))}
    </div>
  );
}
