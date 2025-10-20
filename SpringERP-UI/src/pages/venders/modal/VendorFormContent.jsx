import React from 'react';
import { Form, Input, Col, Row, Select, Divider } from 'antd';
import paymentOptions from '../../../data/paymentOptions.json'; 

const { Option } = Select;
const { TextArea } = Input;

const VendorFormContent = ({ form, isEditing }) => {
    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={{ 
                isActive: true, 
                paymentTerms: 'Net 30' 
            }}
        >
            <Divider orientation="left" plain>Thông tin Cơ bản</Divider>
            <Row gutter={24}>
                <Col span={12}>
                    <Form.Item
                        name="vendorCode"
                        label="Mã Nhà Cung Cấp (Vendor Code)"
                        rules={[{ required: true, message: 'Vui lòng nhập mã NCC!' }]}
                    >
                        <Input placeholder="Ví dụ: V-001, LOGITECH-VN" disabled={isEditing} /> 
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="name"
                        label="Tên Nhà Cung Cấp"
                        rules={[{ required: true, message: 'Vui lòng nhập tên NCC!' }]}
                    >
                        <Input placeholder="Ví dụ: Công ty TNHH XYZ" />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={24}>
                <Col span={12}>
                    <Form.Item
                        name="taxCode"
                        label="Mã Số Thuế"
                    >
                        <Input placeholder="Ví dụ: 0312345678" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="paymentTerms"
                        label="Điều khoản Thanh toán"
                        rules={[{ required: true, message: 'Vui lòng chọn điều khoản!' }]}
                    >
                        <Select placeholder="Chọn điều khoản">
                            {/* Giả định paymentOptions là mảng chuỗi ['Net 30', 'Net 60', ...] */}
                            {paymentOptions.map(term => ( 
                                <Option key={term} value={term}>{term}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item name="address" label="Địa Chỉ Đầy Đủ">
                <TextArea rows={2} placeholder="Nhập địa chỉ trụ sở chính" />
            </Form.Item>

            <Divider orientation="left" plain>Thông tin Liên hệ</Divider>
            <Row gutter={24}>
                <Col span={8}>
                    <Form.Item
                        name="contactPersonName"
                        label="Người Liên Hệ Chính"
                    >
                        <Input placeholder="Ví dụ: Nguyễn Văn A" />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name="contactPersonPhone"
                        label="SĐT Người Liên Hệ"
                    >
                        <Input placeholder="Ví dụ: 090xxxxxxx" />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name="contactPersonEmail"
                        label="Email Người Liên Hệ"
                    >
                        <Input placeholder="Ví dụ: a.nguyen@company.com" />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={24}>
                <Col span={12}>
                    <Form.Item
                        name="email"
                        label="Email Chung (Hóa đơn/Giao dịch)"
                    >
                        <Input placeholder="Ví dụ: accounting@company.com" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="isActive" label="Trạng Thái Hợp Tác">
                        <Select>
                            <Option value={true}>Hoạt động</Option>
                            <Option value={false}>Ngừng hợp tác</Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            
            <Form.Item name="notes" label="Ghi Chú Nội Bộ (Về chất lượng/Độ tin cậy)">
                <TextArea rows={2} />
            </Form.Item>
        </Form>
    );
};

export default VendorFormContent;