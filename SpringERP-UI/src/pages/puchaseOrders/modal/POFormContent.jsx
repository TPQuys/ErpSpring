import React, { useEffect } from 'react';
import { Form, Input, Select, Button, DatePicker, Row, Col, Table, Space, InputNumber, Divider, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getPOById } from '../../../api/purchaseOrderApi';
import paymentOptions from '../../../data/paymentOptions.json';
import moment from 'moment';
import { useItemContext } from '../../../context/ItemContext';  
import { getLineItemColumns } from './LineItemColumns';
import FormList from 'antd/es/form/FormList';
import { useVendorContext } from '../../../context/VendorContext';

const { Option } = Select;

const POFormContent = ({ form, currentPO }) => {
    const { allVendors } = useVendorContext();
    const { allItems } = useItemContext();

    const isEditing = !!currentPO?.poId;

    useEffect(() => {
        form.resetFields();

        const setFormData = async () => {
            if (isEditing) {
                try {
                    const po = currentPO?.poId ? (currentPO || (await getPOById(currentPO.poId))) : currentPO;

                    if (!po) return;

                    form.setFieldsValue({
                        ...po,
                        vendorId: po.vendor?.vendorId,
                        orderDate: po.orderDate ? moment(po.orderDate) : null,
                        requiredDate: po.requiredDate ? moment(po.requiredDate) : null,
                        lines: po.lines?.map(line => ({
                            ...line,
                            itemId: line.item?.itemId,
                            // Đảm bảo tính lại lineTotal khi load
                            lineTotal: ((line.quantity || 0) * (line.unitPrice || 0) * (1 - (line.discountRate || 0) / 100)).toFixed(2),
                            expectedDate: line.expectedDate ? moment(line.expectedDate) : null,
                        })) || [],
                    });
                } catch (error) {
                    console.error('Load PO error:', error);
                    message.error('Lỗi khi tải dữ liệu PO.');
                }
            } else {
                form.setFieldsValue({
                    orderDate: moment(),
                    paymentTerms: paymentOptions[0],
                    lines: [{ quantity: 1, unitPrice: 0, discountRate: 0, lineTotal: 0 }],
                });
            }
        };
        setFormData();

    }, [currentPO, isEditing, form]);

    const calculateLineTotal = (index) => {
        const lines = form.getFieldValue('lines');
        if (!lines || !lines[index]) return;

        const { quantity, unitPrice, discountRate } = lines[index];

        const total = (quantity || 0) * (unitPrice || 0);
        const discount = (discountRate || 0) / 100;
        const lineTotal = total * (1 - discount);

        form.setFieldsValue({
            lines: form.getFieldValue('lines').map((line, i) => i === index ? { ...line, lineTotal: lineTotal.toFixed(2) } : line)
        });
    };

    // Khởi tạo columns bằng cách gọi hàm đã tách
    const lineItemColumns = (remove, fields) =>
        getLineItemColumns(remove, fields, allItems, form, calculateLineTotal);

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={{ discountRate: 0, orderDate: moment() }}
        >
            <Divider orientation="left">Thông tin Chung</Divider>
            <Row gutter={24}>
                <Col span={6}>
                    <Form.Item name="poNumber" label="Mã PO" rules={[{ required: true, message: 'Nhập mã PO!' }]}>
                        <Input placeholder="Ví dụ: PO-2024-0001" disabled={isEditing} />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item name="orderDate" label="Ngày Đặt Hàng" rules={[{ required: true, message: 'Chọn ngày!' }]}>
                        <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item name="requiredDate" label="Ngày Yêu Cầu Nhận">
                        <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item name="paymentTerms" label="Điều khoản TT">
                        <Select placeholder="Chọn điều khoản">
                            {paymentOptions.map(term => <Option key={term} value={term}>{term}</Option>)}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={24}>
                <Col span={12}>
                    <Form.Item name="vendorId" label="Nhà Cung Cấp" rules={[{ required: true, message: 'Chọn NCC!' }]}>
                        <Select placeholder="Chọn Nhà Cung Cấp" showSearch optionFilterProp="children" disabled={isEditing}>
                            {allVendors.map(v => (
                                <Option key={v.vendorId} value={v.vendorId}>
                                    {v.vendorCode} - {v.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="deliveryAddress" label="Địa chỉ Nhận Hàng">
                        <Input.TextArea rows={1} placeholder="Địa chỉ kho nhận hàng" />
                    </Form.Item>
                </Col>
            </Row>
            <Form.Item name="notes" label="Ghi Chú">
                <Input.TextArea rows={2} />
            </Form.Item>

            <Divider orientation="left">Mặt hàng Đặt Mua</Divider>
            <FormList name="lines">
                {(fields, { add, remove }) => (
                    <>
                        <Table
                            dataSource={fields}
                            columns={lineItemColumns(remove, fields)}
                            pagination={false}
                            rowKey="key"
                            size="small"
                            scroll={{ x: 'max-content' }}
                        />
                        <Form.Item>
                            <Button
                                type="dashed"
                                onClick={() => add({ quantity: 1, unitPrice: 0, discountRate: 0, lineTotal: 0 })}
                                block
                                icon={<PlusOutlined />}
                                style={{ marginTop: 8 }}
                                disabled={isEditing}
                            >
                                Thêm Mặt hàng
                            </Button>
                        </Form.Item>
                    </>
                )}
            </FormList>


        </Form>
    );
};

export default POFormContent;