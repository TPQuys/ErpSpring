import React from 'react';
import { Form, Input, Select, Button, DatePicker, InputNumber } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;

export const getLineItemColumns = (remove, fields, items, form, calculateLineTotal) => [
    {
        title: 'Mặt hàng',
        dataIndex: 'itemId',
        key: 'item',
        width: 200,
        render: (text, record, index) => {
            const { key, ...restField } = fields[index];
            return (
                <Form.Item
                    {...restField}
                    key={key}
                    name={[index, 'itemId']}
                    rules={[{ required: true, message: 'Chọn mặt hàng' }]}
                    style={{ marginBottom: 0 }}
                >
                    <Select placeholder="Chọn mặt hàng" showSearch optionFilterProp="children">
                        {items.map(item => (
                            <Option key={item.itemId} value={item.itemId}>
                                {item.itemCode} - {item.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
            );
        },
    },
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
            <Button danger icon={<DeleteOutlined />} onClick={() => remove(index)} size="small" />
        ),
    },
];
