import { createContext, useState, useEffect } from "react";
import { API_URL } from "../config";

export const AuthContext = createContext();

const parseToken = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return null;
    }
};

export const AuthProvider = ({ children }) => {

    const [accessToken, setAccessToken] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const handleSetAccessToken = (token) => {
        if (!token) {
            setAccessToken(null);
            setCurrentUser(null);
            return;
        }

        const payload = parseToken(token);
        if (currentUser && payload?.user_id !== currentUser) {
            setAccessToken(null);
            setCurrentUser(null);
            return;
        }

        setCurrentUser(payload?.user_id ?? null);
        setAccessToken(token);
    };

    useEffect(() => {
        fetch(`${API_URL}/api/refresh/`, {
            method: "POST",
            credentials: "include"
        })
        .then(response => {
            if (!response.ok) throw new Error("No valid session");
            return response.json();
        })
        .then(data => {
            const payload = parseToken(data.access);
            setCurrentUser(payload?.user_id ?? null);
            setAccessToken(data.access);
        })
        .catch(() => {
            setCurrentUser(null);
            setAccessToken(null);
        })
        .finally(() => setAuthChecked(true));
    }, []);

    const logout = async () => {
        await fetch(`${API_URL}/api/logout/`, {
            method: "POST",
            credentials: "include"
        });
        setAccessToken(null);
        setCurrentUser(null);
    };

    return (
        <AuthContext.Provider value={{ accessToken, setAccessToken: handleSetAccessToken, logout, authChecked, currentUser }}>
            {children}
        </AuthContext.Provider>
    );
};