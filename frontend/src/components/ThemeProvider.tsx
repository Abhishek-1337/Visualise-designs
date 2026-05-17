import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { ThemeMode } from '../store/slices/themeSlice';

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mode = useSelector((state: RootState) => (state.theme as { mode: ThemeMode }).mode);

  useEffect(() => {
    if (mode !== 'system') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('dark', e.matches);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  return <>{children}</>;
};

export default ThemeProvider;
