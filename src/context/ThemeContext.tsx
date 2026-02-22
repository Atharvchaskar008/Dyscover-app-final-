import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { borderRadius, darkColors, lightColors, spacing, typography } from '../styles/theme';

type ThemeType = 'light' | 'dark';

interface ThemeContextProps {
    theme: {
        colors: typeof lightColors;
        typography: typeof typography;
        spacing: typeof spacing;
        borderRadius: typeof borderRadius;
    };
    isDark: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const systemColorScheme = useColorScheme();
    const [themeMode, setThemeMode] = useState<ThemeType>(systemColorScheme === 'dark' ? 'dark' : 'light');

    // Update theme when system changes if user hasn't explicitly overridden
    useEffect(() => {
        if (systemColorScheme) {
            setThemeMode(systemColorScheme);
        }
    }, [systemColorScheme]);

    const toggleTheme = () => {
        setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    const activeColors = themeMode === 'light' ? lightColors : darkColors;

    const currentTheme = {
        colors: activeColors,
        typography,
        spacing,
        borderRadius,
    };

    return (
        <ThemeContext.Provider value={{ theme: currentTheme, isDark: themeMode === 'dark', toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
