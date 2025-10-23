import apiClient from './axiosConfig';

export const getPOList = async () => {
    try {
        const response = await apiClient.get('/purchase-orders');
        return response.data;
    } catch (error) {
        console.error('Get PO list API error:', error.response?.data);
        const errorMessage = error.response?.data?.message || error.message || 'Lỗi kết nối server hoặc lỗi không xác định.';
        throw new Error(errorMessage);
    }
};

export const getPOById = async (id) => {
    try {
        const response = await apiClient.get(`/purchase-orders/${id}`);
        return response.data;
    } catch (error) {
        console.error('Get PO by ID API error:', error.response?.data);
        const errorMessage = error.response?.data?.message || error.message || 'Không thể tải PO chi tiết.';
        throw new Error(errorMessage);
    }
};

export const createPO = async (poDto) => {
    try {
        const response = await apiClient.post('/purchase-orders', poDto);
        console.log('PO added:', response.data);
        return response.data;
    } catch (error) {
        console.error('Add PO API error:', error.response?.data);
        const errorMessage = error.response?.data?.message || error.message || 'Tạo PO thất bại.';
        throw new Error(errorMessage);
    }
};

export const updatePO = async (id, poDto) => {
    try {
        const response = await apiClient.put(`/purchase-orders/${id}`, poDto);
        console.log('PO updated successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Update PO API error:', error.response?.data);
        const errorMessage = error.response?.data?.message || error.message || 'Cập nhật PO thất bại.';
        throw new Error(errorMessage);
    }
};

export const deletePO = async (id) => {
    try {
        await apiClient.delete(`/purchase-orders/${id}`);
        console.log(`PO ID ${id} deleted successfully.`);
        return true;
    } catch (error) {
        console.error('Delete PO API error:', error.response?.data);
        const errorMessage = error.response?.data?.message || error.message || 'Xóa PO thất bại.';
        throw new Error(errorMessage);
    }
};


export const approvePO = async (id) => {
    try {
        const response = await apiClient.post(`/purchase-orders/${id}/approve`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi duyệt PO ${id}:`, error);
        throw error.response?.data || new Error(`Duyệt PO ${id} thất bại.`);
    }
};


export const receiveFullGoods = async (id) => {
    try {
        const response = await apiClient.post(`/purchase-orders/${id}/receive`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi nhập hàng cho PO ${id}:`, error);
        throw error.response?.data || new Error(`Nhập hàng cho PO ${id} thất bại.`);
    }
};


export const cancelPO = async (id) => {
    try {
        const response = await apiClient.post(`/purchase-orders/${id}/cancel`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi hủy PO ${id}:`, error);
        throw error.response?.data || new Error(`Hủy PO ${id} thất bại.`);
    }
};

export const closePO = async (id) => {
    try {
        const response = await apiClient.post(`/purchase-orders/${id}/close`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi đóng PO ${id}:`, error);
        throw error.response?.data || new Error(`Đóng PO ${id} thất bại.`);
    }
};