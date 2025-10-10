// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';

// Component giả định sau khi đăng nhập
const Dashboard = () => (
    <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Chào mừng! Bạn đã đăng nhập thành công.</h1>
        <p>Token đã được lưu trong Local Storage.</p>
        <button onClick={() => {
            localStorage.removeItem('authToken');
            window.location.href = '/login'; // Tải lại trang để đăng xuất
        }}>Đăng Xuất</button>
    </div>
);


function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginForm />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/dashboard" element={<Dashboard />} />
      {/* Thêm các Route khác nếu cần */}
    </Routes>
  );
}

export default App;