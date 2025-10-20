import React from 'react';
import { Form, Input, Col, Row, InputNumber, Select, Divider } from 'antd';
import units from '../../../data/units.json'; // Danh sách Đơn vị (Ví dụ: Chiếc, Bộ, Kg)
import itemTypes from '../../../data/itemTypes.json'; // Danh sách Loại SP (Ví dụ: LAPTOP, SMARTPHONE)

const { Option } = Select;

const ItemFormContent = ({ form, isEditing }) => {
    return (
        <Form
            form={form}
            layout="vertical"
            // ✅ Cập nhật initialValues theo Entity/DTO mới
            initialValues={{ 
                currentStock: 0, 
                stockUnit: 'Chiếc', 
                isDiscontinued: false 
            }}
        >
            {/* Hàng 1: Mã SP và Tên SP */}
            <Row gutter={24}>
                <Col span={12}>
                    <Form.Item
                        name="itemCode"
                        label="Mã Sản Phẩm" // ✅ Đổi label
                        rules={[{ required: true, message: 'Vui lòng nhập mã sản phẩm!' }]}
                    >
                        {/* Mã SP không được sửa khi chỉnh sửa */}
                        <Input placeholder="Ví dụ: ITM-005" disabled={isEditing} /> 
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="name" // ✅ Đã sửa từ itemName
                        label="Tên Sản Phẩm" // ✅ Đổi label
                        rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
                    >
                        <Input placeholder="Ví dụ: Laptop Dell XPS 15" />
                    </Form.Item>
                </Col>
            </Row>
            
            <Divider orientation="left" plain>Thông số Kỹ thuật & Phân loại</Divider>

            {/* Hàng 2: Loại SP, Thương hiệu, Model */}
            <Row gutter={24}>
                <Col span={8}>
                    <Form.Item
                        name="itemType" // ✅ Thêm ItemType
                        label="Loại Sản Phẩm"
                        rules={[{ required: true, message: 'Vui lòng chọn loại sản phẩm!' }]}
                    >
                        <Select placeholder="Chọn loại (Ví dụ: LAPTOP)">
                            {/* Giả định itemTypes là một mảng chuỗi (Enum values) */}
                            {itemTypes.map((type) => ( 
                                <Option key={type} value={type}>
                                    {type.replace(/_/g, ' ')} 
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name="brand" // ✅ Thêm Brand
                        label="Thương Hiệu"
                    >
                        <Input placeholder="Ví dụ: Samsung, Apple" />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name="modelNumber" // ✅ Thêm ModelNumber
                        label="Model/Part No."
                    >
                        <Input placeholder="Ví dụ: P9320" />
                    </Form.Item>
                </Col>
            </Row>
            
            <Form.Item 
                name="specifications" // ✅ Thêm Specifications
                label="Thông Số Kỹ Thuật Chi Tiết"
            >
                <Input.TextArea rows={2} placeholder="Ví dụ: Core i7, RAM 16GB, SSD 512GB" />
            </Form.Item>

            <Divider orientation="left" plain>Giá cả & Tồn kho</Divider>
            
            {/* Hàng 3: Đơn vị, Tồn kho, Giá bán, Giá vốn */}
            <Row gutter={24}>
                <Col span={6}>
                    <Form.Item
                        name="stockUnit" // ✅ Đã sửa từ unit
                        label="Đơn Vị Tính"
                        rules={[{ required: true, message: 'Vui lòng chọn đơn vị!' }]}
                    >
                        <Select placeholder="Chọn đơn vị">
                            {units.map((unit) => (
                                <Option key={unit} value={unit}>
                                    {unit}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item
                        name="currentStock" // ✅ Đã sửa từ quantityInStock
                        label="Tồn Kho Khởi tạo"
                        rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
                    >
                        {/* Tồn kho không cho phép sửa khi chỉnh sửa */}
                        <InputNumber min={0} style={{ width: '100%' }} disabled={isEditing} /> 
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item
                        name="sellingPrice" // ✅ Đã sửa từ price
                        label="Giá Bán (VND)"
                        rules={[{ required: true, message: 'Vui lòng nhập giá bán!' }]}
                    >
                        <InputNumber
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            min={0}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item
                        name="costPrice" // ✅ Thêm CostPrice
                        label="Giá Vốn (VND)"
                        rules={[{ required: true, message: 'Vui lòng nhập giá vốn!' }]}
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

            <Divider orientation="left" plain>Ghi chú & Trạng thái</Divider>

            <Row gutter={24}>
                <Col span={18}>
                    <Form.Item 
                        name="notes" // 
                        label="Ghi Chú Chi Tiết"
                    >
                        <Input.TextArea rows={2} />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item 
                        name="discontinued" 
                        label="Trạng Thái Kinh Doanh"
                        // initialValue={false} 
                    >
                        <Select>
                            <Option value={false}>Đang bán (Hoạt động)</Option>
                            <Option value={true}>Ngừng kinh doanh</Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

        </Form>
    );
};

export default ItemFormContent;