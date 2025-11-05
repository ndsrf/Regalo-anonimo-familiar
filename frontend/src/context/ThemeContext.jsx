import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext(null);

const themes = {
  Navidad: {
    bg: 'bg-gradient-to-br from-red-50 via-green-50 to-red-50',
    primary: 'bg-red-600 hover:bg-red-700',
    secondary: 'bg-green-600 hover:bg-green-700',
    accent: 'text-red-600',
    border: 'border-red-200',
    card: 'bg-white border-red-100',
    icons: ['🎄', '🎅', '⭐', '🎁', '❄️', '🔔', '🕯️', '🦌'],
    bgStyle: {
      backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(220, 38, 38, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(22, 163, 74, 0.1) 0%, transparent 50%)',
    },
  },
  'Reyes Magos': {
    bg: 'bg-gradient-to-br from-blue-50 via-yellow-50 to-purple-50',
    primary: 'bg-blue-600 hover:bg-blue-700',
    secondary: 'bg-yellow-600 hover:bg-yellow-700',
    accent: 'text-blue-600',
    border: 'border-blue-200',
    card: 'bg-white border-blue-100',
    icons: ['👑', '🐪', '⭐', '🎁', '✨', '🌙', '💎', '🏺'],
    bgStyle: {
      backgroundImage: 'radial-gradient(circle at 15% 20%, rgba(37, 99, 235, 0.15) 0%, transparent 50%), radial-gradient(circle at 85% 80%, rgba(168, 85, 247, 0.15) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(234, 179, 8, 0.1) 0%, transparent 50%)',
    },
  },
  Boda: {
    bg: 'bg-gradient-to-br from-pink-50 via-white to-yellow-50',
    primary: 'bg-pink-600 hover:bg-pink-700',
    secondary: 'bg-yellow-500 hover:bg-yellow-600',
    accent: 'text-pink-600',
    border: 'border-pink-200',
    card: 'bg-white border-pink-100',
    icons: ['💒', '💍', '💐', '🌹', '🕊️', '💕', '🥂', '🎊'],
    bgStyle: {
      backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(236, 72, 153, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)',
    },
  },
  Cumpleaños: {
    bg: 'bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50',
    primary: 'bg-purple-600 hover:bg-purple-700',
    secondary: 'bg-pink-600 hover:bg-pink-700',
    accent: 'text-purple-600',
    border: 'border-purple-200',
    card: 'bg-white border-purple-100',
    icons: ['🎂', '🎈', '🎉', '🎊', '🎁', '🍰', '🧁', '🎀'],
    bgStyle: {
      backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(147, 51, 234, 0.12) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(236, 72, 153, 0.12) 0%, transparent 50%)',
    },
  },
  Otro: {
    bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
    primary: 'bg-gray-600 hover:bg-gray-700',
    secondary: 'bg-gray-500 hover:bg-gray-600',
    accent: 'text-gray-600',
    border: 'border-gray-200',
    card: 'bg-white border-gray-100',
    icons: ['🎁', '🎉', '⭐', '✨', '🎊', '💝', '🌟', '🎀'],
    bgStyle: {},
  },
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('Otro');

  const setTheme = (tipoCelebracion) => {
    setCurrentTheme(tipoCelebracion);
  };

  const theme = themes[currentTheme] || themes.Otro;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
