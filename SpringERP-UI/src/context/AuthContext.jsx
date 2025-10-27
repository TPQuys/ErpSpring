import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginApi } from '../api/auth';
import axios from 'axios';

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [userId,setUserId] = useState(localStorage.getItem('userId')|| null);
  const [token, setToken] = useState(localStorage.getItem('authToken')|| null);
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
        const data = await loginApi(username, password);
        const jwtToken = data.jwtToken;
        const userId= data.userId;
        localStorage.setItem('authToken', data.jwtToken);
        localStorage.setItem('userId', data.userId);
        setUserId(userId);
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
    userId,
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