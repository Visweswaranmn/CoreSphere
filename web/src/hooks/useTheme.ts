import { useContext } from 'react';
import { ThemeContext } from '@/providers/ThemeProvider';

/** Access the active theme and controls. Must be used within a ThemeProvider. */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
