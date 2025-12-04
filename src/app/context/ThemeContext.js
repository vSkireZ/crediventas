'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        // Verificar preferencia guardada o del sistema
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setTheme(savedTheme);
            if (savedTheme === 'dark') {
                document.documentElement.classList.add('dark');
            }
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
            document.documentElement.classList.add('dark');
        }
    }, []);

    const setDarkTheme = () => {
        setTheme('dark');
        localStorage.setItem('theme', 'dark');
        document.documentElement.classList.add('dark');
    };

    const setLightTheme = () => {
        setTheme('light');
        localStorage.setItem('theme', 'light');
        document.documentElement.classList.remove('dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, setDarkTheme, setLightTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
