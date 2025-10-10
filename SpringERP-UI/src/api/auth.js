import apiClient from './axiosConfig';

export const loginApi = async (username, password) => {
    try {
        const response = await apiClient.post('/auth/login', {
            username,
            password
        });

        const token = response.data.token;

        if (token) {
            console.log("Đăng nhập thành công");
            return token;
        } else {
            console.error("Lỗi: Không nhận được token từ server.");
        }
    } catch (error) {
        if (error.response && error.response.data) {
            console.error(error.response.data || 'Đăng nhập thất bại.');
        }
        else
            console.error(error.message || 'Đã xảy ra lỗi kết nối.');
    }
};