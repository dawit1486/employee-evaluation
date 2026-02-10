import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for saved session
        const savedUser = localStorage.getItem('ee_current_user');
        if (savedUser) {
            // Wrap in timeout to avoid 'set state in effect' warning
            setTimeout(() => {
                setUser(JSON.parse(savedUser));
            }, 0);
        }
        api.init();
        setLoading(false);
    }, []);

    const login = async (id, password) => {
        const user = await api.login(id, password);
        setUser(user);
        localStorage.setItem('ee_current_user', JSON.stringify(user));
        return user;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('ee_current_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
