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
  },
  'Reyes Magos': {
    bg: 'bg-gradient-to-br from-blue-50 via-yellow-50 to-purple-50',
    primary: 'bg-blue-600 hover:bg-blue-700',
    secondary: 'bg-yellow-600 hover:bg-yellow-700',
    accent: 'text-blue-600',
    border: 'border-blue-200',
    card: 'bg-white border-blue-100',
  },
  Boda: {
    bg: 'bg-gradient-to-br from-pink-50 via-white to-yellow-50',
    primary: 'bg-pink-600 hover:bg-pink-700',
    secondary: 'bg-yellow-500 hover:bg-yellow-600',
    accent: 'text-pink-600',
    border: 'border-pink-200',
    card: 'bg-white border-pink-100',
  },
  Cumpleaños: {
    bg: 'bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50',
    primary: 'bg-purple-600 hover:bg-purple-700',
    secondary: 'bg-pink-600 hover:bg-pink-700',
    accent: 'text-purple-600',
    border: 'border-purple-200',
    card: 'bg-white border-purple-100',
  },
  Otro: {
    bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
    primary: 'bg-gray-600 hover:bg-gray-700',
    secondary: 'bg-gray-500 hover:bg-gray-600',
    accent: 'text-gray-600',
    border: 'border-gray-200',
    card: 'bg-white border-gray-100',
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
