import apiClient from './axiosConfig';

export const loginApi = async (username, password) => {
    try {
        const response = await apiClient.post('/auth/login', {
            username,
            password
        });

        const token = response.data.jwtToken;
        console.log('Login API token:', response.data);

        if (token) {
            return token;
        } else {
            throw new Error("Không nhận được token từ server.");
        }
    } catch (error) {
        console.log('Login API error:', error.response?.data);
        const errorMessage = error.response?.data 
                             || error.message 
                             || 'Lỗi kết nối server hoặc lỗi không xác định.';
        
        throw new Error(errorMessage); 
    }
};