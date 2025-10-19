// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { App as AntdApp } from 'antd';
import { AuthProvider } from './context/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AntdApp>
        <AuthProvider>
            <App />
        </AuthProvider>
      </AntdApp>
    </BrowserRouter>
  </React.StrictMode>,
);