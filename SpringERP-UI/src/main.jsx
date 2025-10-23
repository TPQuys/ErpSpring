// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { App as AntdApp } from 'antd';
import AppProviders from './providers/AppProviders';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AntdApp>
        <AppProviders>
          <App />
        </AppProviders>
      </AntdApp>
    </BrowserRouter>
  </React.StrictMode>
);