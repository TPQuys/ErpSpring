import React from 'react';
import { Button, Space, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

// Giả định đường dẫn itemTypes.json là chính xác
import itemTypes from '../../data/itemTypes.json'; 

const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const formatItemType = (type) => {
    if (!type) return 'Chưa phân loại';
    return type.charAt(0) + type.slice(1).toLowerCase().replace(/_/g, ' ');
};

const itemTypeFilters = itemTypes.map(type => ({
    text: formatItemType(type), 
    value: type, 
}));


export const getItemColumns = (handleEdit, handleDelete) => {

    const columns = [
        { 
            title: 'STT', 
            dataIndex: 'index', 
            key: 'index', 
            width: 60,
            align: 'center',
            render: (text, record, index) => index + 1, 
        },
        
        { title: 'Mã hàng', dataIndex: 'itemCode', key: 'itemCode', sorter: (a, b) => a.itemCode.localeCompare(b.itemCode) },
        
        { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
        
        { 
            title: 'Loại SP', 
            dataIndex: 'itemType', 
            key: 'itemType',
            render: (type) => <Tag color="blue">{formatItemType(type)}</Tag>,
            
            filters: itemTypeFilters,
            onFilter: (value, record) => record.itemType === value,
        },
        
        { title: 'Thương hiệu', dataIndex: 'brand', key: 'brand' },

        { 
            title: 'Tồn kho', 
            dataIndex: 'currentStock', 
            key: 'currentStock', 
            sorter: (a, b) => a.currentStock - b.currentStock,
            width: 100 
        },
        
        { title: 'Đơn vị', dataIndex: 'stockUnit', key: 'stockUnit', width: 90 },
        
        { 
            title: 'Giá bán', 
            dataIndex: 'sellingPrice', 
            key: 'sellingPrice',
            render: (text) => formatCurrency(text) 
        },
        
        { 
            title: 'Giá vốn', 
            dataIndex: 'costPrice', 
            key: 'costPrice',
            render: (text) => formatCurrency(text),
            responsive: ['lg'], 
        },

        { 
            title: 'Trạng thái', 
            dataIndex: 'discontinued', 
            key: 'discontinued',
            render: (discontinued) => (
                <Tag color={!discontinued ? 'green' : 'red'}>
                    {!discontinued ? 'Đang bán' : 'Ngừng KD'}
                </Tag>
            ),
            filters: [
                { text: 'Đang bán', value: false },
                { text: 'Ngừng KD', value: true },
            ],
            onFilter: (value, record) => record.discontinued === value, 
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