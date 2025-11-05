import React, { useEffect, useState } from 'react';
import { Form, Input, Col, Row, Select, Divider, DatePicker, InputNumber, Button, Space, Table } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { notify } from '../../../components/notify';
import { getPurchaseOrderList } from '../../../api/vendorInvoiceApi';
import { useVendorContext } from '../../../context/VendorContext';
import { getInvoiceLineColumns } from './InvoiceLineColumns';
import moment from 'moment';
const { Option } = Select;
const { TextArea } = Input;

// ✅ Chuyển hàm này ra ngoài hoặc giữ nguyên, nó không cần 'form' làm tham số


const InvoiceFormContent = ({ form, isEditing, poLinesData = [], onLoadPoLines }) => {
    // --- STATE QUẢN LÝ DỮ LIỆU ĐỘNG ---
    const [vendors, setVendors] = useState([])
    const { loadingVendors, getVendorByPO } = useVendorContext();
    useEffect(() => {
        let mounted = true;
        const fetchVendors = async () => {
            try {
                const vendors = await getVendorByPO();
                if (mounted) setVendors(vendors);
            } catch (error) {
                console.error(error);
            }
        };
        fetchVendors();
        return () => {
            mounted = false;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [poLoading, setPoLoading] = useState(false);

    // --- HANDLE SELECT VENDOR ---
    const handleSelectVendor = async (vendorId) => {
        form.setFieldsValue({ refId: undefined, currency: undefined, lines: [] }); // Xóa PO và lines cũ
        setPurchaseOrders([]);
        setPoLoading(true);
        try {
            const poList = await getPurchaseOrderList(vendorId);
            setPurchaseOrders(poList);
            console.log(poList)
        } catch (error) {
            console.error(error);
            notify.error('Lỗi tải danh sách Đơn hàng Mua (PO).');
        } finally {
            setPoLoading(false);
        }
    };

    // --- HANDLE SELECT PO ---
    const handleSelectPO = (poId) => {
        const selectedPO = purchaseOrders.find(p => p.id === poId); // Giả định poList có 'id'

        if (selectedPO) {
            form.setFieldsValue({
                // partnerId: selectedPO.vendorId, // partnerId đã được chọn ở bước 1
                refNumber: selectedPO.code, // Giả định PO có 'code'
                currency: selectedPO.currency,
                // ... set các trường khác như paymentTerms
            });
        }

        // Tải các dòng hàng PO/GRN (Truyền lên Modal)
        if (onLoadPoLines) {
            onLoadPoLines(poId);
        }
    };

    const columns = getInvoiceLineColumns(isEditing);

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={{ invoiceDate: moment.now() }}
        >
            {/* ... Các trường Header: invoiceNumber, invoiceDate, dueDate (Không đổi) ... */}
            <Divider orientation="left" plain>Thông tin Hóa đơn</Divider>
            <Row gutter={24}>
                <Col span={8}>
                    <Form.Item
                        name="invoiceNumber"
                        label="Số Hóa đơn (Vendor)"
                        rules={[{ required: true, message: 'Vui lòng nhập số HĐ!' }]}
                    >
                        <Input placeholder="Ví dụ: GTGT-00123" />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name="invoiceDate"
                        label="Ngày Hóa đơn"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
                    >
                        <DatePicker name='invoiceDate' format="DD/MM/YYYY" style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name="dueDate"
                        label="Ngày Đáo hạn"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày đáo hạn!' }]}
                    >
                        <DatePicker name='dueDate' format="DD/MM/YYYY" style={{ width: '100%' }}/>
                    </Form.Item>
                </Col>
            </Row>


            <Divider orientation="left" plain>Tham chiếu & Đối tác</Divider>
            <Row gutter={24}>
                <Col span={8}>
                    <Form.Item
                        name="partnerId"
                        label="Nhà Cung Cấp"
                        rules={[{ required: true, message: 'Vui lòng chọn NCC!' }]}
                    >
                        <Select
                            placeholder="Chọn Nhà Cung Cấp"
                            onChange={handleSelectVendor}
                            loading={loadingVendors}
                            disabled={isEditing}
                            showSearch
                        >
                            {vendors.map(v => (
                                // Giả định allVendors có 'id' và 'name'
                                <Option key={v.vendorId} value={v.vendorId}>{v.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name="refId"
                        label="Tham chiếu Đơn hàng Mua (PO)"
                        rules={[{ required: true, message: 'Vui lòng chọn PO gốc!' }]}
                    >
                        <Select
                            placeholder="Chọn PO"
                            onChange={handleSelectPO}
                            loading={poLoading}
                            disabled={isEditing || purchaseOrders.length === 0}
                            showSearch
                        >
                            {purchaseOrders.map(po => (
                                // Giả định poList có 'id' và 'code'
                                <Option key={po.id} value={po.poId}>{po.poNumber}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="currency" label="Tiền tệ">
                        <Input disabled={true} placeholder="VND" />
                    </Form.Item>
                </Col>
            </Row>

            <Divider orientation="left" plain>Chi tiết Dòng hàng (3-Way Match)</Divider>

            {/* ✅ SỬA LỖI 1: Sử dụng Form.Item dependencies để render có điều kiện */}
            <Form.Item
                dependencies={['refId']}
                noStyle
            >
                {({ getFieldValue }) => {
                    const poSelected = getFieldValue('refId');

                    if (poSelected && poLinesData.length > 0) {
                        return (
                            <div style={{ marginBottom: 20 }}>
                                <Table
                                    dataSource={poLinesData}
                                    columns={columns}
                                    rowKey="id" // Đảm bảo poLinesData có 'id' (refLineId)
                                    pagination={false}
                                    size="small"
                                    scroll={{ x: 'max-content' }}
                                    title={() => 'Dòng hàng có thể lập hóa đơn'}
                                />
                            </div>
                        );
                    }
                    return null; // Không hiển thị gì nếu chưa chọn PO
                }}
            </Form.Item>

            <Form.Item name="notes" label="Ghi Chú Hóa đơn">
                <TextArea rows={2} />
            </Form.Item>
        </Form>
    );
};

export default InvoiceFormContent;