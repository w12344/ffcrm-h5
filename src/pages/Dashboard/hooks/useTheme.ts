import { useState, useCallback } from 'react';
import { ThemeMode, ThemeConfig } from '../types';
import { THEME_CONFIG } from '../constants';

export const useTheme = (initialMode: ThemeMode = 'dark'): ThemeConfig => {
  const [mode, setMode] = useState<ThemeMode>(initialMode);

  const toggleTheme = useCallback(() => {
    setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  }, []);

  return {
    mode,
    toggleTheme
  };
};

export const useThemeClass = (mode: ThemeMode): string => {
  return THEME_CONFIG[mode].className;
};

export const useThemeIcon = (mode: ThemeMode): string => {
  return THEME_CONFIG[mode].icon;
};
