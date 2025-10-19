import React from 'react';
import { Button, Space, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const getItemColumns = (handleEdit, handleDelete) => {

    const columns = [
        { title: 'Mã hàng', dataIndex: 'itemCode', key: 'itemCode', sorter: (a, b) => a.itemCode.localeCompare(b.itemCode) },
        { title: 'Tên mặt hàng', dataIndex: 'itemName', key: 'itemName' },
        { title: 'Tồn kho', dataIndex: 'quantityInStock', key: 'quantityInStock', sorter: (a, b) => a.quantityInStock - b.quantityInStock },
        { title: 'Đơn vị', dataIndex: 'unit', key: 'unit', width: 100 },
        { 
            title: 'Giá bán', 
            dataIndex: 'price', 
            key: 'price',
            render: (text) => formatCurrency(text) 
        },
        { 
            title: 'Trạng thái', 
            dataIndex: 'active', 
            key: 'active',
            render: (isActive) => (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'Hoạt động' : 'Ngừng bán'}
                </Tag>
            ),
            filters: [
                { text: 'Hoạt động', value: true },
                { text: 'Ngừng bán', value: false },
            ],
            onFilter: (value, record) => record.isActive === value,
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button 
                        icon={<EditOutlined />} 
                        onClick={() => handleEdit(record)}
                        type="primary"
                        ghost
                    >
                        Sửa
                    </Button>
                    <Button 
                        icon={<DeleteOutlined />} 
                        onClick={() => handleDelete(record.itemId)} 
                        danger
                    >
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    return columns;
};