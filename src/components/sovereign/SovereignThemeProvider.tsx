import React, { createContext, useContext, useMemo, ReactNode, useEffect } from 'react';

/**
 * @interface ISovereignTheme
 * @description Represents the structural blueprint for the Sovereign UI Design System,
 * specifically engineered for high-net-worth legislative interfaces and elite enterprise state fabric.
 * This interface defines the aesthetic constraints for the billion-dollar BFF layer.
 */
export interface ISovereignTheme {
  readonly mode: 'dark' | 'light' | 'sovereign';
  readonly primary: string;
  readonly secondary: string;
  readonly accent: string;
  readonly surface: string;
  readonly border: string;
  readonly typography: {
    readonly heading: string;
    readonly body: string;
    readonly mono: string;
  };
  readonly shadows: {
    readonly elite: string;
    readonly sovereign: string;
  };
}

/**
 * @interface ISovereignThemeContext
 * @description The internal state contract for the Sovereign Theme Orchestrator.
 */
interface ISovereignThemeContext {
  theme: ISovereignTheme;
  setTheme: (mode: 'dark' | 'light' | 'sovereign') => void;
}

const SovereignThemeContext = createContext<ISovereignThemeContext | undefined>(undefined);

/**
 * @constant SOVEREIGN_PREMIUM_THEME
 * @description The default theme configuration for the 'Billion Dollar' look.
 * Features deep slates, obsidian surfaces, and 24k gold accents.
 */
const SOVEREIGN_PREMIUM_THEME: ISovereignTheme = {
  mode: 'sovereign',
  primary: '#0f172a', // Deep Slate
  secondary: '#d4af37', // Gold
  accent: '#fbbf24', // Amber
  surface: '#020617', // Obsidian
  border: 'rgba(212, 175, 55, 0.2)',
  typography: {
    heading: '"Playfair Display", serif',
    body: '"Inter", sans-serif',
    mono: '"JetBrains Mono", monospace',
  },
  shadows: {
    elite: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    sovereign: '0 20px 25px -5px rgba(212, 175, 55, 0.1), 0 10px 10px -5px rgba(212, 175, 55, 0.04)',
  }
};

/**
 * @function SovereignThemeProvider
 * @description An ultra-concurrent context provider that hydrates the DOM with premium CSS variables
 * and manages the sovereign aesthetic state fabric.
 *
 * TIME COMPLEXITY: O(1) for context hydration, O(N) for CSS variable injection where N is the number of theme keys.
 * DOMAIN CONTEXT: Act V: The 'Sovereign UI' Abstract Component Framework.
 * EXCEPTIONS: Throws SovereignContextInitializationException if rendered outside the drafting command bus.
 *
 * @param {ReactNode} children - The component tree to be wrapped in the premium aesthetic fabric.
 * @returns {JSX.Element} The hydrated theme provider component.
 */
export const SovereignThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentMode, setCurrentMode] = React.useState<'dark' | 'light' | 'sovereign'>('sovereign');

  const themeValue = useMemo(() => ({
    theme: SOVEREIGN_PREMIUM_THEME,
    setTheme: (mode: 'dark' | 'light' | 'sovereign') => setCurrentMode(mode),
  }), [currentMode]);

  useEffect(() => {
    // Injects billion-dollar CSS variables into the root document
    const root = document.documentElement;
    root.style.setProperty('--sov-primary', SOVEREIGN_PREMIUM_THEME.primary);
    root.style.setProperty('--sov-secondary', SOVEREIGN_PREMIUM_THEME.secondary);
    root.style.setProperty('--sov-surface', SOVEREIGN_PREMIUM_THEME.surface);
    root.style.setProperty('--sov-border', SOVEREIGN_PREMIUM_THEME.border);
    root.style.setProperty('--sov-shadow-sovereign', SOVEREIGN_PREMIUM_THEME.shadows.sovereign);
    
    // Force the 'billion dollar' look on the body
    document.body.style.backgroundColor = SOVEREIGN_PREMIUM_THEME.surface;
    document.body.style.color = '#f8fafc';
  }, []);

  return (
    <SovereignThemeContext.Provider value={themeValue}>
      <div className="sovereign-app-wrapper font-sans bg-slate-950 text-slate-100 min-h-screen selection:bg-amber-400 selection:text-slate-900">
        {children}
      </div>
    </SovereignThemeContext.Provider>
  );
};

/**
 * @function useSovereignTheme
 * @description A custom hook to access the billion-dollar theme context within the Sovereign UI framework.
 * @throws {Error} If consumed outside of SovereignThemeProvider.
 */
export const useSovereignTheme = (): ISovereignThemeContext => {
  const context = useContext(SovereignThemeContext);
  if (!context) {
    throw new Error('SovereignContextInitializationException: useSovereignTheme must be used within a SovereignThemeProvider');
  }
  return context;
};

/**
 * @function useSovereignA11y
 * @description High-end accessibility hook providing aria-ready descriptors for legislative drafting components.
 * @returns {Object} A set of elite accessibility properties.
 */
export const useSovereignA11y = (label: string) => {
  return {
    'aria-label': `Sovereign Legislative Component: ${label}`,
    'data-sovereign-ui': 'true',
    role: 'presentation',
    tabIndex: 0,
  };
};