import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<{ isAuthenticated: boolean; login: () => void; logout: () => void } | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const login = () => {

        setIsAuthenticated(true);
    };

    const logout = () => {

        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
