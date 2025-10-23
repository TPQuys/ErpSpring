import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ItemsPage from './pages/Items/ItemListPage';
import VendorPage from './pages/venders/VendorListPage';
import PurchaseOrdersPage from './pages/puchaseOrders/POListPage';
// eslint-disable-next-line no-unused-vars
import { useAuth } from './context/AuthContext';
import { App as AntdApp } from "antd";

import AppLayout from './layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import { setNotifyInstance } from './components/notify';
const UsersPage = () => <h1>Quản lý Người dùng</h1>;


const PrivateLayoutRoute = ({ element: Component }) => {
  return (
    <AppLayout>
      {Component}
    </AppLayout>
  );
};

function App() {
  const app = AntdApp.useApp();
  setNotifyInstance(app);
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/dashboard" element={<PrivateLayoutRoute element={<DashboardPage />} />} />
      <Route path="/purchase-orders" element={<PrivateLayoutRoute element={<PurchaseOrdersPage />} />} />
      <Route path="/items" element={<PrivateLayoutRoute element={<ItemsPage />} />} />
      <Route path="/vendors" element={<PrivateLayoutRoute element={<VendorPage />} />} />
      <Route path="/users" element={<PrivateLayoutRoute element={<UsersPage />} />} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;