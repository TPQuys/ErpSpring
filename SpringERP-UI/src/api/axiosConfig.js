import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import { notify } from '../components/notify';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return true;

    const currentTime = Date.now() / 1000; 
    return decoded.exp < currentTime;
  } catch (error) {
    console.warn('Token không hợp lệ:', error);
    return true;
  }
};

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');

    if (token) {
      if (isTokenExpired(token)) {
        console.warn('Token đã hết hạn, tự động đăng xuất...');
        notify.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        localStorage.removeItem('authToken');
        window.location.href = '/login'; 
        return Promise.reject(new Error('Token expired'));
      }

      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
