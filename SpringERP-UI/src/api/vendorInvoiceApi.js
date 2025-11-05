import apiClient from './axiosConfig';

const BASE_URL = '/vendor-invoices'; // Đã đổi tên controller thành vendor-invoices

// Helper function để xử lý lỗi API nhất quán
const handleError = (error, defaultMessage) => {
    console.error(`API error:`, error.response?.data);
    const errorMessage = error.response?.data?.message || error.response?.data || error.message || defaultMessage;
    // Ném lỗi để component React có thể bắt và hiển thị notify
    throw new Error(errorMessage);
};

// --- 1. Lấy Danh sách Hóa đơn Mua ---
export const getInvoiceList = async (params = {}) => {
    try {
        // Sử dụng query params để lọc (ví dụ: trạng thái, ngày tháng)
        const response = await apiClient.get(BASE_URL, { params });
        console.log('Vendor Invoice list fetched:', response.data.length);
        return response.data;
    } catch (error) {
        throw handleError(error, 'Lỗi khi tải danh sách Hóa đơn Mua.');
    }
};

// --- 2. Lấy Chi tiết Hóa đơn Mua theo ID ---
export const getInvoiceById = async (id) => {
    try {
        const response = await apiClient.get(`${BASE_URL}/${id}`);
        console.log(`Vendor Invoice ID ${id} fetched:`, response.data);
        return response.data;
    } catch (error) {
        throw handleError(error, `Không tìm thấy Hóa đơn Mua ID: ${id}.`);
    }
};

// --- 3. Tạo Hóa đơn Mua mới ---
export const createInvoice = async (invoiceData) => {
    console.log(invoiceData)
    try {
        // API endpoint đã được định nghĩa trong controller là POST /api/v1/vendor-invoices
        const response = await apiClient.post(BASE_URL, invoiceData);
        console.log('Vendor Invoice created:', response.data);
        return response.data;
    } catch (error) {
        throw handleError(error, 'Lỗi khi tạo Hóa đơn Mua.');
    }
};

export const cancelInvoice = async (id) => {
    try {
        await apiClient.post(`${BASE_URL}/${id}/cancel`);
    } catch (error) {
        throw handleError(error, 'Lỗi khi tạo Hóa đơn Mua.');
    }
};

// --- 4. Cập nhật Hóa đơn Mua ---
// Thường chỉ cho phép sửa đổi khi Hóa đơn ở trạng thái DRAFT
export const updateInvoice = async (invoiceId, invoiceData) => {
    try {
        console.log(invoiceData)
        const response = await apiClient.put(`${BASE_URL}/${invoiceId}`, invoiceData);
        console.log(`Vendor Invoice ID ${invoiceId} updated:`, response.data);
        return response.data;
    } catch (error) {
        throw handleError(error, 'Lỗi khi cập nhật Hóa đơn Mua. (Chỉ sửa được HĐ nháp)');
    }
};

// --- 5. Xóa Hóa đơn Mua ---
// Thường chỉ cho phép xóa khi Hóa đơn ở trạng thái DRAFT
export const deleteInvoice = async (id) => {
    try {
        await apiClient.delete(`${BASE_URL}/${id}`);
        console.log(`Vendor Invoice ID ${id} deleted successfully.`);
        return true;
    } catch (error) {
        throw handleError(error, 'Lỗi khi xóa Hóa đơn Mua. (Chỉ xóa được HĐ nháp)');
    }
};

// --- 6. Duyệt Hóa đơn Mua ---
export const approveInvoice = async (id) => {
    try {
        // Gọi endpoint POST /{invoiceId}/approve
        const response = await apiClient.post(`${BASE_URL}/${id}/approve`);
        console.log(`Vendor Invoice ID ${id} approved successfully.`);
        return response.data;
    } catch (error) {
        throw handleError(error, 'Lỗi khi duyệt Hóa đơn Mua.');
    }
};

// --- 7. Ghi nhận Thanh toán cho Hóa đơn (Chuyển đến Form Payment) ---
export const recordPayment = async (invoiceId, paymentDetails) => {
    try {
        // Giả định API cho thanh toán là /api/v1/payments
        // Hoặc một endpoint dành riêng cho việc thanh toán Hóa đơn Mua
        const response = await apiClient.post(`/payments/vendor-invoice/${invoiceId}`, paymentDetails);
        console.log(`Payment recorded for Invoice ID ${invoiceId}.`);
        return response.data;
    } catch (error) {
        throw handleError(error, 'Lỗi khi ghi nhận Thanh toán.');
    }
};

export const getPurchaseOrderList = async (vendorId) => {
    try {
        // GỌI ENDPOINT MỚI TỪ BACKEND
        const response = await apiClient.get(`/purchase-orders/by-vendor/${vendorId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const fetchPoLinesByPoId = async (poId) => {
    try {
        const response = await apiClient.get(`/purchase-orders/${poId}/invoicable-lines`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }

};

export const getInvoicePdf = async (invoiceId) => {
    try {
        const response = await apiClient.get(`${BASE_URL}/${invoiceId}/print`, {
            responseType: 'blob'
        });
        console.log(response.data)
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }

};