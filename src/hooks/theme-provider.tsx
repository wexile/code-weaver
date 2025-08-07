
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'dark' | 'light' | 'rose' | 'ocean' | 'solarized-dark' | 'monokai' | 'cobalt';
type IconPack = 'default' | 'lucide' | 'material' | 'fontawesome';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

interface IconContextType {
    iconPack: IconPack;
    setIconPack: (pack: IconPack) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const IconContext = createContext<IconContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    const storedTheme = localStorage.getItem('app-theme') as Theme | null;
    const body = document.body;
    
    const initialTheme = storedTheme || 'dark';
    setThemeState(initialTheme);
    document.documentElement.classList.add(initialTheme);

    return () => {
        document.documentElement.classList.remove('light', 'dark', 'rose', 'ocean', 'solarized-dark', 'monokai', 'cobalt');
    };
  }, []);

  const setTheme = (newTheme: Theme) => {
    document.documentElement.classList.remove('light', 'dark', 'rose', 'ocean', 'solarized-dark', 'monokai', 'cobalt');
    document.documentElement.classList.add(newTheme);
    setThemeState(newTheme);
    localStorage.setItem('app-theme', newTheme);
  };

  const value = { theme, setTheme };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function IconProvider({ children }: { children: ReactNode }) {
    const [iconPack, setIconPackState] = useState<IconPack>('default');
  
    useEffect(() => {
      const storedIconPack = localStorage.getItem('app-icon-pack') as IconPack | null;
      if (storedIconPack) {
        setIconPackState(storedIconPack);
      }
    }, []);
  
    const setIconPack = (newPack: IconPack) => {
      setIconPackState(newPack);
      localStorage.setItem('app-icon-pack', newPack);
    };
  
    const value = { iconPack, setIconPack };
  
    return <IconContext.Provider value={value}>{children}</IconContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function useIcon() {
    const context = useContext(IconContext);
    if (context === undefined) {
      throw new Error('useIcon must be used within an IconProvider');
    }
    return context;
}
