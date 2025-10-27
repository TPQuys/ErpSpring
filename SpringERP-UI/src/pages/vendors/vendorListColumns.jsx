import React from 'react';
import { Button, Space, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

export const getVendorColumns = (handleEdit, handleDelete) => {

    const columns = [
        { 
            title: 'STT', 
            key: 'index', 
            width: 60,
            align: 'center',
            render: (text, record, index) => index + 1, 
        },
        { 
            title: 'Mã NCC', 
            dataIndex: 'vendorCode', 
            key: 'vendorCode', 
            sorter: (a, b) => a.vendorCode.localeCompare(b.vendorCode),
            width: 120,
        },
        { 
            title: 'Tên Nhà Cung Cấp', 
            dataIndex: 'name', 
            key: 'name', 
            sorter: (a, b) => a.name.localeCompare(b.name),
            width: 250,
        },
        { 
            title: 'Mã số thuế', 
            dataIndex: 'taxCode', 
            key: 'taxCode', 
            width: 150,
            responsive: ['md'],
        },
        { 
            title: 'Người liên hệ', 
            dataIndex: 'contactPersonName', 
            key: 'contactPersonName', 
            width: 150,
            responsive: ['lg'],
        },
        { 
            title: 'SĐT', 
            dataIndex: 'phone', 
            key: 'phone', 
            width: 120,
        },
        { 
            title: 'Điều khoản TT', 
            dataIndex: 'paymentTerms', 
            key: 'paymentTerms', 
            width: 150,
            responsive: ['lg'],
        },
        { 
            title: 'Trạng thái', 
            dataIndex: 'isActive', 
            key: 'isActive',
            width: 120,
            render: (isActive) => (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'Hoạt động' : 'Ngừng hợp tác'}
                </Tag>
            ),
            filters: [
                { text: 'Hoạt động', value: true },
                { text: 'Ngừng hợp tác', value: false },
            ],
            onFilter: (value, record) => record.isActive === value,
        },
        
        {
            title: 'Hành động',
            key: 'action',
            width: 150,
            fixed: 'right',
            render: (_, record) => (
                <Space size="middle">
                    <Button 
                        icon={<EditOutlined />} 
                        onClick={() => handleEdit(record)} 
                        type="primary"
                        ghost
                        size="small"
                    />
                    <Button 
                        icon={<DeleteOutlined />} 
                        onClick={() => handleDelete(record)} 
                        danger
                        size="small"
                    />
                </Space>
            ),
        },
    ];

    return columns;
};