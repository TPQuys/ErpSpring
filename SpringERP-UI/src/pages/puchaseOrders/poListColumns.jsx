import React from 'react';
import { Tag } from 'antd';
import { format } from 'date-fns';

const getStatusTag = (status) => {
    switch (status) {
        case 'DRAFT': return <Tag color="default">Bản Nháp</Tag>;
        case 'APPROVED': return <Tag color="blue">Đã Duyệt</Tag>;
        case 'RECEIVED': return <Tag color="green">Đã Nhận Hàng</Tag>;
        case 'CLOSED': return <Tag color="purple">Đã Đóng</Tag>;
        case 'CANCELED': return <Tag color="red">Đã Hủy</Tag>;
        default: return <Tag>{status}</Tag>;
    }
};

export const getPOListColumns = (renderActions) => [
    { title: 'Mã PO', dataIndex: 'poNumber', key: 'poNumber', fixed: 'left', width: 120 },
    { 
        title: 'Trạng thái', 
        dataIndex: 'status', 
        key: 'status', 
        render: getStatusTag, 
        filters: [
            { text: 'Bản Nháp', value: 'DRAFT' },
            { text: 'Đã Duyệt', value: 'APPROVED' },
            { text: 'Đã Nhận Hàng', value: 'RECEIVED' },
            { text: 'Đã Hủy', value: 'CANCELED' },
        ],
        onFilter: (value, record) => record.status === value,
        width: 140,
    },
    { 
        title: 'Nhà Cung Cấp', 
        dataIndex: ['vendor', 'name'], 
        key: 'vendorName', 
        width: 250,
    },
    { 
        title: 'Ngày Đặt', 
        dataIndex: 'orderDate', 
        key: 'orderDate', 
        render: (date) => date ? format(new Date(date), 'dd/MM/yyyy') : '-',
        width: 120,
    },
    { 
        title: 'Ngày Y/C Nhận', 
        dataIndex: 'requiredDate', 
        key: 'requiredDate', 
        render: (date) => date ? format(new Date(date), 'dd/MM/yyyy') : '-',
        width: 140,
    },
    { 
        title: 'Tổng Tiền (VNĐ)', 
        dataIndex: 'totalAmount', 
        key: 'totalAmount', 
        align: 'right',
        render: (amount) => amount ? amount.toLocaleString('vi-VN') : '0',
        width: 150,
    },
    { 
        title: 'Người Tạo', 
        dataIndex: ['createdBy', 'username'], 
        key: 'createdBy', 
        width: 150,
    },
    {
        title: 'Hành động',
        key: 'action',
        fixed: 'right',
        width: 250,
        render: (text, record) => renderActions(record),
    },
];