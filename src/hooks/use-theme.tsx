
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'dark' | 'light' | 'rose' | 'ocean';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    const storedTheme = localStorage.getItem('app-theme') as Theme | null;
    const body = document.body;
    
    if (storedTheme) {
        setThemeState(storedTheme);
        body.classList.add(storedTheme);
    } else {
        body.classList.add('dark');
    }
    
    return () => {
        body.classList.remove('light', 'dark', 'rose', 'ocean');
    };
  }, []);

  const setTheme = (newTheme: Theme) => {
    const body = document.body;
    body.classList.remove('light', 'dark', 'rose', 'ocean');
    body.classList.add(newTheme);
    setThemeState(newTheme);
    localStorage.setItem('app-theme', newTheme);
  };

  const value = {
    theme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
