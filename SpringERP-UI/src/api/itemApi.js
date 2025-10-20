import apiClient from './axiosConfig';

export const getItemList = async () => {
    try {
        const response = await apiClient.get('/items');
        const data = response.data;
        if (data) {
            return data;
        } else {
            throw new Error("Lấy danh sách sản phẩm thất bại.");
        }
    } catch (error) {
        console.log('Get item API error:', error.response?.data);
        const errorMessage = error.response?.data
            || error.message
            || 'Lỗi kết nối server hoặc lỗi không xác định.';

        throw new Error(errorMessage);
    }
};

export const addItem = async (item) => {
    try {
        const response = await apiClient.post('/items', item);
        const data = response.data;
        if (data) {
            console.log('Item added:', data);
            return data;
        } else {
            throw new Error("Thêm sản phẩm thất bại.");
        }
    } catch (error) {
        console.log('Add item API error:', error.response);
        const errorMessage = error.response?.data
            || error.message
            || 'Lỗi kết nối server hoặc lỗi không xác định.';

        throw new Error(errorMessage);
    }
};

export const updateItem = async (id, item) => {
    try {
        const response = await apiClient.put(`/items/${id}`, item);
        const data = response.data;
        if (data) {
            console.log('Item updated successfully:', data);
            return data;
        } else {
            throw new Error("Cập nhật mặt hàng thất bại: Server không trả về dữ liệu.");
        }
    } catch (error) {
        console.log('Edit item API error:', error.response);
        const apiErrorMessage = error.response?.data
            || error.message;

        throw new Error(apiErrorMessage || 'Lỗi kết nối server hoặc lỗi không xác định.');
    }
};

export const deleteItem = async (id) => {
    try {
        await apiClient.delete(`/items/${id}`);
        console.log('Item delete successfully:');
        return true;
    } catch (error) {
        console.log('Delete item API error:', error.response);
        const apiErrorMessage = error.response?.data
            || error.message;

        throw new Error(apiErrorMessage || 'Lỗi kết nối server hoặc lỗi không xác định.');
    }
};

export const getItemById = async (id) => {
    try {
        console.log('Get item:', id);
        const response = await apiClient.get(`/items/${id}`);
        const data = response.data;
        if (data) {
            console.log('Item :', data);
            return data;
        } else {
            throw new Error("tìm sản phẩm thất bại.");
        }
    } catch (error) {
        console.log('Get item API error:', error.response);
        const errorMessage = error.response?.data
            || error.message
            || 'Lỗi kết nối server hoặc lỗi không xác định.';

        throw new Error(errorMessage);
    }
};

export const getAllItemTypes = async () => {
    try {
        const response = await apiClient.get('/items/types');
        return response.data; 
    } catch (error) {
        console.error("Error fetching item types:", error);
        throw new Error("Không thể tải danh sách loại sản phẩm.");
    }
};

