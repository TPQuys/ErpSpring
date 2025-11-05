import React from 'react';
import { Card, Descriptions, Tag } from 'antd';

const InvoiceHeaderCard = ({ invoiceData }) => {
    // Phân tách trạng thái để hiển thị màu Tag phù hợp
    const getStatusTag = (status) => {
        switch (status) {
            case 'DRAFT': return <Tag color="default">Bản Nháp</Tag>;
            case 'APPROVED': return <Tag color="blue">Đã Duyệt</Tag>;
            case 'PAID': return <Tag color="success">Đã Thanh Toán</Tag>;
            case 'CANCELED': return <Tag color="error">Đã Hủy</Tag>;
            default: return <Tag>{status}</Tag>;
        }
    };

    return (
        <Card title="Thông tin Chung & Đối tác" variant='borderless'>
            <Descriptions column={1} layout="horizontal" size="small" bordered>
                
                {/* 1. Trạng thái Hóa đơn */}
                <Descriptions.Item label="Trạng thái HĐ">
                    {getStatusTag(invoiceData.invoiceStatus)}
                </Descriptions.Item>
                
                {/* 2. Trạng thái Thanh toán (Giả định bạn đã sửa DTO) */}
                <Descriptions.Item label="Trạng thái TT">
                    {invoiceData.paymentStatus === 'PAID' ? (
                        <Tag color="success">Đã Thanh Toán</Tag>
                    ) : invoiceData.paymentStatus === 'PARTIALLY_PAID' ? (
                        <Tag color="processing">Thanh Toán Một Phần</Tag>
                    ) : (
                        <Tag color="warning">Chưa Thanh Toán</Tag>
                    )}
                </Descriptions.Item>

                {/* 3. Nhà Cung Cấp (Vendor) */}
                {/* Truy cập qua invoiceData.vendor.name (Yêu cầu DTO phải có object 'vendor') */}
                <Descriptions.Item label="Nhà Cung Cấp">
                    <span style={{ fontWeight: 'bold' }}>
                        {invoiceData.vendorName || 'N/A'}
                    </span>
                    {invoiceData.vendor?.taxCode && 
                        <Tag style={{ marginLeft: 8 }}>Mã số thuế: {invoiceData.vendor.taxCode}</Tag>
                    }
                </Descriptions.Item>

                {/* 4. Tài liệu Tham chiếu Gốc (PO/SO) */}
                {/* Truy cập qua invoiceData.refNumber (Yêu cầu DTO phải có trường này) */}
                <Descriptions.Item label={`Tham chiếu ${invoiceData.refType === 'PURCHASE' ? 'PO' : 'SO'}`}>
                    <span style={{ fontWeight: 'bold' }}>
                        {invoiceData.refNumber || `ID Gốc: ${invoiceData.refId}`}
                    </span>
                </Descriptions.Item>

                {/* 5. Mã ID nội bộ */}
                 <Descriptions.Item label="ID Hóa đơn Hệ thống">
                    {invoiceData.invoiceId}
                </Descriptions.Item>
                
            </Descriptions>
        </Card>
    );
};

export default InvoiceHeaderCard;