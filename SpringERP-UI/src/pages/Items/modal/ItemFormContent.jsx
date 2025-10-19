import React from 'react';
import { Form, Input, Col, Row, InputNumber, Select } from 'antd';

const ItemFormContent = ({ form, isEditing }) => {
    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={{ quantityInStock: 0, unit: 'Chiếc', active: true }}
        >
            <Row gutter={24}>
                <Col span={12}>
                    <Form.Item
                        name="itemCode"
                        label="Mã Mặt Hàng"
                        rules={[{ required: true, message: 'Vui lòng nhập mã mặt hàng!' }]}
                    >
                        <Input placeholder="Ví dụ: ITM-005" disabled={isEditing} /> 
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="itemName"
                        label="Tên Mặt Hàng"
                        rules={[{ required: true, message: 'Vui lòng nhập tên mặt hàng!' }]}
                    >
                        <Input placeholder="Ví dụ: Máy in laser" />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={24}>
                <Col span={8}>
                    <Form.Item
                        name="unit"
                        label="Đơn Vị Tính"
                        rules={[{ required: true, message: 'Vui lòng nhập đơn vị!' }]}
                    >
                        <Input placeholder="Ví dụ: Chiếc, Kg" />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name="quantityInStock"
                        label="Tồn Kho (Mặc định)"
                        rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
                    >
                        <InputNumber min={0} style={{ width: '100%' }} disabled={isEditing} /> 
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name="price"
                        label="Giá Bán (VND)"
                        rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
                    >
                        <InputNumber
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            min={0}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item name="description" label="Mô Tả Chi Tiết">
                <Input.TextArea rows={2} />
            </Form.Item>
            
            <Form.Item name="active" label="Trạng Thái">
                <Select>
                    <Select.Option value={true}>Hoạt động</Select.Option>
                    <Select.Option value={false}>Ngừng bán</Select.Option>
                </Select>
            </Form.Item>
        </Form>
    );
};

export default ItemFormContent;