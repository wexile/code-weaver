
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface EditorSettings {
  wordWrap: boolean;
  setWordWrap: (enabled: boolean) => void;
  minimapEnabled: boolean;
  setMinimapEnabled: (enabled: boolean) => void;
}

const EditorSettingsContext = createContext<EditorSettings | undefined>(undefined);

export function EditorSettingsProvider({ children }: { children: ReactNode }) {
  const [wordWrap, setWordWrapState] = useState<boolean>(true);
  const [minimapEnabled, setMinimapEnabledState] = useState<boolean>(false);

  useEffect(() => {
    const storedWordWrap = localStorage.getItem('editor-word-wrap');
    if (storedWordWrap) {
      setWordWrapState(JSON.parse(storedWordWrap));
    }
    
    const storedMinimap = localStorage.getItem('editor-minimap');
    if (storedMinimap) {
      setMinimapEnabledState(JSON.parse(storedMinimap));
    }
  }, []);

  const setWordWrap = (enabled: boolean) => {
    setWordWrapState(enabled);
    localStorage.setItem('editor-word-wrap', JSON.stringify(enabled));
  };

  const setMinimapEnabled = (enabled: boolean) => {
    setMinimapEnabledState(enabled);
    localStorage.setItem('editor-minimap', JSON.stringify(enabled));
  };

  const value = { wordWrap, setWordWrap, minimapEnabled, setMinimapEnabled };

  return <EditorSettingsContext.Provider value={value}>{children}</EditorSettingsContext.Provider>;
}

export function useEditorSettings() {
  const context = useContext(EditorSettingsContext);
  if (context === undefined) {
    throw new Error('useEditorSettings must be used within an EditorSettingsProvider');
  }
  return context;
}
