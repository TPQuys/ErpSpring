import React from 'react';
import { Table, Typography } from 'antd';

const { Text } = Typography;

// Hàm định dạng tiền tệ
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const InvoiceLinesTable = ({ lines }) => {
    
    // Cấu trúc cột cho bảng chi tiết dòng hàng
    const columns = [
        {
            title: 'STT',
            key: 'stt',
            render: (text, record, index) => index + 1,
            width: 50,
        },
        {
            title: 'Mã hàng',
            dataIndex: ['itemCode'], // Lấy từ object item lồng nhau
            key: 'itemCode',
            width: 100,
        },
        {
            title: 'Mô tả',
            dataIndex: ['itemName'],
            key: 'description',
        },
        {
            title: 'SL',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'right',
            width: 80,
        },
        {
            title: 'Đơn giá',
            dataIndex: 'unitPrice',
            key: 'unitPrice',
            align: 'right',
            width: 150,
            render: formatCurrency,
        },
        {
            title: 'Thuế suất',
            dataIndex: 'taxRate',
            key: 'taxRate',
            align: 'right',
            width: 90,
            render: (rate) => `${(rate * 100).toFixed(0)}%`,
        },
        {
            title: 'Tổng tiền (Chưa thuế)',
            dataIndex: 'lineTotal',
            key: 'lineTotal',
            align: 'right',
            width: 180,
            render: formatCurrency,
        },
        {
            title: 'Thuế (VAT)',
            dataIndex: 'lineTaxAmount',
            key: 'lineTaxAmount',
            align: 'right',
            width: 150,
            render: formatCurrency,
        },
        {
            title: 'Thành tiền (Đã thuế)',
            key: 'finalAmount',
            align: 'right',
            width: 180,
            render: (text, record) => (
                <Text strong>{formatCurrency(record.lineTotal + record.lineTaxAmount)}</Text>
            ),
        },
    ];

    return (
        <Table
            dataSource={lines}
            columns={columns}
            rowKey="invoiceLineId" // Giả định ID của dòng hóa đơn
            pagination={false}
            size="small"
            bordered
            scroll={{ x: 'max-content' }}
        />
    );
};

export default InvoiceLinesTable;