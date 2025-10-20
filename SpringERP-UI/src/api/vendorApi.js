import apiClient from './axiosConfig';


export const getVendorList = async () => {
    try {
        const response = await apiClient.get('/vendors');
        return response.data; 
    } catch (error) {
        console.error('Get vendor list API error:', error.response?.data);
        const errorMessage = error.response?.data?.message || error.message || 'Lỗi kết nối server hoặc lỗi không xác định.';
        throw new Error(errorMessage);
    }
};


export const createVendor = async (vendor) => {
    try {
        const response = await apiClient.post('/vendors', vendor);
        console.log('Vendor added:', response.data);
        return response.data;
    } catch (error) {
        console.error('Add vendor API error:', error.response?.data);
        const errorMessage = error.response?.data?.message || error.message || 'Lỗi kết nối server hoặc lỗi không xác định.';
        throw new Error(errorMessage);
    }
};


export const updateVendor = async (id, vendor) => {
    try {
        const response = await apiClient.put(`/vendors/${id}`, vendor);
        console.log('Vendor updated successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Update vendor API error:', error.response?.data);
        const errorMessage = error.response?.data?.message || error.message || 'Lỗi kết nối server hoặc lỗi không xác định.';
        throw new Error(errorMessage);
    }
};


export const deleteVendor = async (id) => {
    try {
        await apiClient.delete(`/vendors/${id}`);
        console.log(`Vendor ID ${id} deleted successfully.`);
        return true;
    } catch (error) {
        console.error('Delete vendor API error:', error.response?.data);
        const errorMessage = error.response?.data?.message || error.message || 'Lỗi kết nối server hoặc lỗi không xác định.';
        throw new Error(errorMessage);
    }
};


export const getVendorById = async (id) => {
    try {
        const response = await apiClient.get(`/vendors/${id}`);
        return response.data;
    } catch (error) {
        console.error('Get vendor by ID API error:', error.response?.data);
        const errorMessage = error.response?.data?.message || error.message || 'Lỗi kết nối server hoặc lỗi không xác định.';
        throw new Error(errorMessage);
    }
};


/*
// Nếu bạn cần lấy danh sách các điều khoản thanh toán (Payment Terms) từ API thay vì hardcode:
export const getPaymentTerms = async () => {
    try {
        const response = await apiClient.get('/vendors/payment-terms');
        return response.data; 
    } catch (error) {
        console.error("Error fetching payment terms:", error);
        throw new Error("Không thể tải danh sách điều khoản thanh toán.");
    }
};
*/