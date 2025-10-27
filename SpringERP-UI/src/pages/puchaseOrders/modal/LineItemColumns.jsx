import React from 'react';
import { Form, Input, Select, Button, DatePicker, InputNumber } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;

const getAvailableItems = (allItems, form, currentIndex) => {
    // 1. Lấy tất cả các dòng hiện tại
    const lines = form.getFieldValue('lines');
    
    // Nếu không có lines hoặc không có item nào đang được chọn, trả về tất cả.
    if (!lines || allItems.length === 0) {
        return allItems;
    }
    
    // 2. Lấy danh sách itemId ĐÃ được chọn ở các dòng KHÁC (trừ dòng hiện tại)
    const selectedItemIds = new Set();
    
    lines.forEach((line, index) => {
        // Chỉ thêm itemID nếu nó không phải là dòng hiện tại VÀ đã có giá trị
        if (index !== currentIndex && line.itemId) {
            selectedItemIds.add(line.itemId);
        }
    });

    // 3. Lọc danh sách item: Giữ lại item chưa được chọn HOẶC item đang được chọn ở dòng hiện tại
    const availableItems = allItems.filter(item => 
        !selectedItemIds.has(item.itemId)
    );

    return availableItems;
};


export const getLineItemColumns = (remove, fields, items, form, calculateLineTotal) => {
    
    // --- Hàm mới để cập nhật Đơn giá khi chọn Item ---
    const handleItemChange = (itemId, index) => {
        const selectedItem = items.find(item => item.itemId === itemId);
        const newPrice = selectedItem?.costPrice || 0; // Tối ưu hóa việc lấy giá
        
        // Cập nhật Đơn giá
        form.setFieldsValue({
            lines: {
                [index]: {
                    unitPrice: newPrice,
                },
            },
        });
        
        // Tính toán lại thành tiền
        calculateLineTotal(index);
    };
    // ----------------------------------------------------

    return [
        {
            title: 'Mặt hàng',
            dataIndex: 'itemId',
            key: 'item',
            width: 200,
            render: (text, record, index) => {
                const { key, ...restField } = fields[index];
                
                // GỌI HÀM LỌC: Lấy danh sách item khả dụng cho dòng này
                const availableItems = getAvailableItems(items, form, index); 

                return (
                    <Form.Item
                        {...restField}
                        key={key}
                        name={[index, 'itemId']}
                        rules={[{ required: true, message: 'Chọn mặt hàng' }]}
                        style={{ marginBottom: 0 }}
                    >
                        <Select 
                            placeholder="Chọn mặt hàng" 
                            showSearch 
                            optionFilterProp="children"
                            // THAY ĐỔI QUAN TRỌNG: Thêm onChange để cập nhật đơn giá
                            onChange={(value) => handleItemChange(value, index)}
                        >
                            {/* SỬ DỤNG DANH SÁCH ITEM ĐÃ ĐƯỢC LỌC */}
                            {availableItems.map(item => (
                                <Option key={item.itemId} value={item.itemId}>
                                    {item.itemCode} - {item.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                );
            },
        },
        // ... (Các cột khác giữ nguyên)
        {
            title: 'Đơn giá',
            dataIndex: 'unitPrice',
            key: 'unitPrice',
            width: 120,
            align: 'right',
            render: (text, record, index) => {
                const { key, ...restField } = fields[index];
                return (
                    <Form.Item
                        {...restField}
                        key={key}
                        name={[index, 'unitPrice']}
                        rules={[{ required: true, message: 'Nhập giá' }]}
                        style={{ marginBottom: 0 }}
                    >
                        <InputNumber
                            min={0}
                            style={{ width: '100%' }}
                            onChange={() => calculateLineTotal(index)}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        />
                    </Form.Item>
                );
            },
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 100,
            align: 'right',
            render: (text, record, index) => {
                const { key, ...restField } = fields[index];
                return (
                    <Form.Item
                        {...restField}
                        key={key}
                        name={[index, 'quantity']}
                        rules={[{ required: true, message: 'Nhập SL' }]}
                        style={{ marginBottom: 0 }}
                    >
                        <InputNumber min={0.01} precision={2} style={{ width: '100%' }} onChange={() => calculateLineTotal(index)} />
                    </Form.Item>
                );
            },
        },
        {
            title: 'Chiết khấu (%)',
            dataIndex: 'discountRate',
            key: 'discountRate',
            width: 100,
            align: 'right',
            render: (text, record, index) => {
                const { key, ...restField } = fields[index];
                return (
                    <Form.Item
                        {...restField}
                        key={key}
                        name={[index, 'discountRate']}
                        initialValue={0}
                        style={{ marginBottom: 0 }}
                    >
                        <InputNumber min={0} max={100} style={{ width: '100%' }} onChange={() => calculateLineTotal(index)} />
                    </Form.Item>
                );
            },
        },
        {
            title: 'Ngày dự kiến giao',
            dataIndex: 'expectedDate',
            key: 'expectedDate',
            width: 150,
            render: (text, record, index) => {
                const { key, ...restField } = fields[index];
                return (
                    <Form.Item
                        {...restField}
                        key={key}
                        name={[index, 'expectedDate']}
                        style={{ marginBottom: 0 }}
                    >
                        <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                    </Form.Item>
                );
            },
        },
        {
            title: 'Thành tiền',
            dataIndex: 'lineTotal',
            key: 'lineTotal',
            width: 120,
            align: 'right',
            render: (text, record, index) => {
                return (
                    <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, curValues) => 
                            prevValues.lines?.[index]?.quantity !== curValues.lines?.[index]?.quantity ||
                            prevValues.lines?.[index]?.unitPrice !== curValues.lines?.[index]?.unitPrice ||
                            prevValues.lines?.[index]?.discountRate !== curValues.lines?.[index]?.discountRate
                        }
                    >
                        {() => {
                            const lineTotal = form.getFieldValue(['lines', index, 'lineTotal']);
                            return (
                                <Input 
                                    value={lineTotal ? parseFloat(lineTotal).toLocaleString('vi-VN') : '0'} 
                                    disabled 
                                    style={{ textAlign: 'right' }} 
                                />
                            );
                        }}
                    </Form.Item>
                );
            },
        },
        {
            title: 'Xóa',
            key: 'action',
            width: 50,
            align: 'center',
            render: (text, record, index) => (
                <Button 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={() => remove(index)} 
                    size="small" 
                />
            ),
        },
    ];
};