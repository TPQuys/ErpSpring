import React from 'react';
import { Space, Button } from 'antd';
import { CheckOutlined, EditOutlined, DollarOutlined, DeleteOutlined, PrinterOutlined } from '@ant-design/icons';
import { notify } from '../../../components/notify';
// eslint-disable-next-line no-unused-vars
import { getInvoicePdf, approveInvoice, cancelInvoice } from '../../../api/vendorInvoiceApi';
const handlePrint = async (invoiceId) => {
    try {
        const blob = await getInvoicePdf(invoiceId);

        if (!blob) {
            notify.error('Lỗi: Dữ liệu PDF rỗng.');
            return;
        }

        const fileURL = window.URL.createObjectURL(blob);
        let fileName = 'hoa_don_' + invoiceId + '.pdf';

        const link = document.createElement('a');
        link.href = fileURL;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();

        window.URL.revokeObjectURL(fileURL);

        notify.success('Tải hóa đơn thành công!');

    } catch (error) {
        console.error("Lỗi khi in hóa đơn:", error);
        const errorMessage = error.message || "Đã xảy ra lỗi không xác định.";
        notify.error(`Không thể tạo/tải file PDF: ${errorMessage}`);
    }
};





const ActionButtons = ({ invoiceId, status, handleCancelInvoice, handleApproveInvoice }) => {
    // Trạng thái hóa đơn: DRAFT, APPROVED, PAID, CANCELED

    const handleAction = async (actionName, invoiceId) => {
    try {
        switch (actionName) {
            case 'In': {
                handlePrint(invoiceId);
                break;
            };
            case 'Hủy': {
                handleCancelInvoice(invoiceId);
                break;
            };
            case 'Duyệt': {
                handleApproveInvoice(invoiceId);
                break;
            }
        }
        // Thực hiện gọi API tương ứng (ví dụ: approveInvoice(invoiceId), openPaymentModal())
        // Thực tế: Sau khi thành công, bạn nên gọi props.onSuccess() để refetch data.
    } catch (error) {
        console.error(error)
        notify.error(`Lỗi khi ${actionName} Hóa đơn.`);
    }
};

    return (
        <Space style={{ marginBottom: 16 }}>

            {/* 1. Nút SỬA (Chỉ hiện khi là Bản Nháp) */}
            {status === 'DRAFT' && (
                <Button
                    type="default"
                    icon={<EditOutlined />}
                    onClick={() => handleAction('Sửa', invoiceId)}
                >
                    Sửa Hóa đơn
                </Button>
            )}

            {/* 2. Nút DUYỆT (Chỉ hiện khi là Bản Nháp) */}
            {status === 'DRAFT' && (
                <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => handleAction('Duyệt', invoiceId)}
                >
                    Duyệt Hóa đơn
                </Button>
            )}

            {/* 3. Nút THANH TOÁN (Hiện khi đã Duyệt hoặc Thanh toán một phần) */}
            {(status === 'APPROVED' || status === 'PARTIALLY_PAID') && (
                <Button
                    type="primary"
                    icon={<DollarOutlined />}
                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }} // Màu xanh lá cho TT
                    onClick={() => handleAction('Thanh toán', invoiceId)}
                >
                    Thanh toán
                </Button>
            )}

            {/* 4. Nút IN / XUẤT (Hiện sau khi đã Duyệt) */}
            {(status !== 'DRAFT' && status !== 'CANCELED') && (
                <Button
                    icon={<PrinterOutlined />}
                    onClick={() => handleAction('In', invoiceId)}
                >
                    In/Xuất
                </Button>
            )}

            {/* 5. Nút HỦY (Không hiện khi đã Hủy/TT Đủ) */}
            {(status !== 'CANCELED' && status !== 'PAID') && (
                <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleAction('Hủy', invoiceId)}
                >
                    Hủy Hóa đơn
                </Button>
            )}

        </Space>
    );
};

export default ActionButtons;