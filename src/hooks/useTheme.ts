// useTheme.ts - Theme Toggle Hook for Light/Dark Mode
import { useState, useEffect, createContext, useContext } from 'react';

interface ThemeContextValue {
    isDark: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
    isDark: false,
    toggleTheme: () => { }
});

// Hook to use theme
export const useTheme = (): ThemeContextValue => {
    const context = useContext(ThemeContext);
    return context;
};

// Standalone hook for components that don't use provider
export const useThemeLocal = () => {
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('glowhub_theme');
            if (saved) return saved === 'dark';
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    useEffect(() => {
        localStorage.setItem('glowhub_theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    const toggleTheme = () => setIsDark(prev => !prev);

    return { isDark, toggleTheme };
};

// Re-export for simpler usage without provider
export { ThemeContext };
