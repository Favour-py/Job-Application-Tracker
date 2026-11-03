import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(() => {
        const savedTheme = localStorage.getItem("job-app-theme");
        return savedTheme ? savedTheme === "dark" : false;
    });

    useEffect(() => {
        const themeName = isDark ? "dark" : "light";
        document.body.classList.remove("theme-dark", "theme-light");
        document.body.classList.add(`theme-${themeName}`);
        document.body.style.colorScheme = themeName;
        localStorage.setItem("job-app-theme", themeName);
    }, [isDark]);

    const toggleTheme = () => setIsDark((prev) => !prev);

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
