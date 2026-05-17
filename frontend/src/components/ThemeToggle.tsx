import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { setThemeMode } from '../store/slices/themeSlice';
import type { ThemeMode } from '../store/slices/themeSlice';
import Icon from './AppIcon';

const ThemeToggle: React.FC = () => {
  const dispatch = useDispatch();
  const mode = useSelector((state: RootState) => (state.theme as { mode: ThemeMode }).mode);
  const isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const cycleTheme = () => {
    const next: Record<string, ThemeMode> = { light: 'dark', dark: 'system', system: 'light' };
    dispatch(setThemeMode(next[mode] || 'light'));
  };

  return (
    <button
      onClick={cycleTheme}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-smooth hover:bg-muted text-muted-foreground hover:text-foreground"
      title={`Theme: ${mode}. Click to switch.`}
    >
      <Icon
        name={isDark ? 'Moon' : 'Sun'}
        size={18}
        color="currentColor"
      />
      <span className="text-sm font-medium capitalize">{mode}</span>
    </button>
  );
};

export default ThemeToggle;
