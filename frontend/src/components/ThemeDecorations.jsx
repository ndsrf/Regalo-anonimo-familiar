import { useEffect, useState } from 'react';
import './ThemeDecorations.css';

export default function ThemeDecorations({ icons, bgStyle }) {
  const [decorations, setDecorations] = useState([]);

  useEffect(() => {
    if (!icons || icons.length === 0) return;

    // Generate random positions for decorative icons
    const generateDecorations = () => {
      const newDecorations = [];
      const iconCount = 15; // Number of decorative icons

      for (let i = 0; i < iconCount; i++) {
        const randomIcon = icons[Math.floor(Math.random() * icons.length)];
        newDecorations.push({
          id: i,
          icon: randomIcon,
          top: Math.random() * 100, // Random position from 0-100%
          left: Math.random() * 100,
          size: 1 + Math.random() * 2, // Size between 1rem and 3rem
          delay: Math.random() * 5, // Animation delay
          duration: 10 + Math.random() * 10, // Animation duration between 10-20s
          opacity: 0.1 + Math.random() * 0.2, // Opacity between 0.1 and 0.3
        });
      }
      return newDecorations;
    };

    setDecorations(generateDecorations());
  }, [icons]);

  if (!icons || icons.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={bgStyle}>
      {decorations.map((decoration) => (
        <div
          key={decoration.id}
          className="absolute animate-float"
          style={{
            top: `${decoration.top}%`,
            left: `${decoration.left}%`,
            fontSize: `${decoration.size}rem`,
            opacity: decoration.opacity,
            animationDelay: `${decoration.delay}s`,
            animationDuration: `${decoration.duration}s`,
          }}
        >
          {decoration.icon}
        </div>
      ))}
    </div>
  );
}
