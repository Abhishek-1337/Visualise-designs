import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
}

const getInitialTheme = (): ThemeMode => {
  try {
    const stored = localStorage.getItem('theme-mode');
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {}
  return 'system';
};

const applyTheme = (mode: ThemeMode) => {
  const isDark =
    mode === 'dark' ||
    (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  document.documentElement.classList.toggle('dark', isDark);
};

applyTheme(getInitialTheme());

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: getInitialTheme() } as ThemeState,
  reducers: {
    setThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
      try {
        localStorage.setItem('theme-mode', action.payload);
      } catch {}
      applyTheme(action.payload);
    },
  },
});

export const { setThemeMode } = themeSlice.actions;
export type { ThemeMode };
export default themeSlice.reducer;
