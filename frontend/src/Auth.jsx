import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Initialize isLoggedIn state from localStorage (default is false if not present)
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        const savedLoginStatus = localStorage.getItem('isLoggedIn');
        return savedLoginStatus === 'true' ? true : false; // Convert string to boolean
    });

    // Function to handle login and save status to localStorage
    const login = () => {
        setIsLoggedIn(true);
        localStorage.setItem('isLoggedIn', 'true');
    };

    // Function to handle logout and remove status from localStorage
    const logout = () => {
        setIsLoggedIn(false);
        localStorage.setItem('isLoggedIn', 'false');
    };

    useEffect(() => {
        // This effect could be used if you need to sync isLoggedIn with localStorage
        const savedLoginStatus = localStorage.getItem('isLoggedIn');
        if (savedLoginStatus === 'true') {
            setIsLoggedIn(true);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
