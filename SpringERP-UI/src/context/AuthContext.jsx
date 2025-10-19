import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginApi } from '../api/auth';
import axios from 'axios';

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsLoggedIn(true);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setIsLoggedIn(false);
    }
  }, [token]);

const login = useCallback(async (username, password) => {
    setLoading(true);
    try {
        const jwtToken = await loginApi(username, password);
        localStorage.setItem('authToken', jwtToken);
        setToken(jwtToken);
        return jwtToken;
    } finally {
        setLoading(false); 
    }
}, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setToken(null);
    setIsLoggedIn(false);
  }, []);

  const contextValue = {
    isLoggedIn,
    token,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};