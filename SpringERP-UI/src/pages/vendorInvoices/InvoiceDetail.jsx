import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Row, Col, Divider, Spin, Typography, message, Tag } from 'antd';
import { approveInvoice, cancelInvoice, getInvoiceById } from '../../api/vendorInvoiceApi'; // Giả định hàm API
import moment from 'moment';
import InvoiceHeaderCard from './components/InvoiceHeaderCard';
import InvoiceLinesTable from './components/InvoiceLinesTable';
import PaymentHistoryTable from './components/PaymentHistoryTable';
import ActionButtons from './components/ActionButtons';
import { notify } from '../../components/notify';

const { Title, Text } = Typography;

const InvoiceDetail = () => {
    // 1. Lấy ID từ URL
    const { invoiceId } = useParams();

    // 2. State quản lý dữ liệu và trạng thái tải
    const [invoiceData, setInvoiceData] = useState(null);
    const [loading, setLoading] = useState(true);

    // 3. Effect để tải dữ liệu
    useEffect(() => {
        if (invoiceId) {
            setLoading(true);
            getInvoiceById(invoiceId)
                .then(data => {
                    setInvoiceData(data);
                    console.log(data)
                })
                .catch(error => {
                    console.error("Lỗi tải chi tiết hóa đơn:", error);
                    message.error('Không thể tải chi tiết hóa đơn. Vui lòng thử lại.');
                    setInvoiceData(null);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [invoiceId]);

    const handleCancelInvoice = (invoiceId,) => {
        notify.modal.confirm({
            title: 'Xác nhận Hủy Hóa đơn',
            content: 'Bạn có chắc chắn muốn hủy hóa đơn này không? Hành động này không thể hoàn tác.',
            okText: 'Xác nhận Hủy',
            cancelText: 'Hủy bỏ',
            onOk: async () => {
                try {
                    // 1. Gọi API Backend để cập nhật trạng thái
                    await cancelInvoice(invoiceId);
                    
                    // 2. Cập nhật trạng thái trong UI
                    setInvoiceData(prevData => ({
                        ...prevData,
                        invoiceStatus: "CANCELED" // Cập nhật trạng thái cục bộ
                    }));
    
                    notify.success('Hóa đơn đã được hủy thành công.');
                    
                } catch (error) {
                    console.error("Lỗi khi hủy hóa đơn:", error);
                    notify.error('Không thể hủy hóa đơn. Vui lòng thử lại.');
                }
            },
        });
    };

     const handleApproveInvoice = (invoiceId,) => {
        notify.modal.confirm({
            title: 'Xác nhận duyêtj Hóa đơn',
            content: 'Bạn có chắc chắn muốn duyệt hóa đơn này không?',
            okText: 'Xác nhận duyệt',
            cancelText: 'Hủy bỏ',
            onOk: async () => {
                try {
                    // 1. Gọi API Backend để cập nhật trạng thái
                    await approveInvoice(invoiceId);
                    
                    // 2. Cập nhật trạng thái trong UI
                    setInvoiceData(prevData => ({
                        ...prevData,
                        invoiceStatus: "APPROVED" // Cập nhật trạng thái cục bộ
                    }));
    
                    notify.success('Hóa đơn đã được duyệt thành công.');
                    
                } catch (error) {
                    console.error("Lỗi khi duyệt hóa đơn:", error);
                    notify.error('Không thể duyệt hóa đơn. Vui lòng thử lại.');
                }
            },
        });
    };

    if (loading) {
        return <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />;
    }

    if (!invoiceData) {
        return <Title level={4} type="danger">Không tìm thấy Hóa đơn (ID: {invoiceId})</Title>;
    }

    // 4. Component chính hiển thị dữ liệu
    return (
        <div style={{ padding: 24 }}>
            <Title level={2}>Hóa đơn Nhà Cung Cấp: {invoiceData.invoiceNumber}</Title>

            {/* Thanh hành động */}
            <ActionButtons
                invoiceId={invoiceId}
                status={invoiceData.invoiceStatus}
                handleCancelInvoice={handleCancelInvoice}
                handleApproveInvoice={handleApproveInvoice}
            // Có thể thêm các hàm xử lý Duyệt/Thanh toán ở đây
            />

            <Divider />

            <Row gutter={[24, 24]}>
                {/* Cột 1: Thông tin Header & Vendor */}
                <Col span={10}>
                    <InvoiceHeaderCard invoiceData={invoiceData} />
                </Col>

                {/* Cột 2: Tổng quan số tiền & Ngày tháng */}
                <Col span={14}>
                    <Card title="Tổng quan Hóa đơn" bordered>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Text strong>Ngày Hóa đơn:</Text> <br />
                                {moment(invoiceData.invoiceDate).format('DD/MM/YYYY')}
                            </Col>
                            <Col span={12}>
                                <Text strong>Ngày Đáo hạn:</Text> <br />
                                <span style={{ color: moment(invoiceData.dueDate).isBefore(moment(), 'day') ? 'red' : 'inherit' }}>
                                    {moment(invoiceData.dueDate).format('DD/MM/YYYY')}
                                </span>
                            </Col>
                        </Row>
                        <Divider />
                        <div style={{ textAlign: 'right', fontSize: '1.2em' }}>
                            <Text>Tổng Cộng (Chưa Thuế):</Text> <Text strong>{new Intl.NumberFormat('vi-VN').format(invoiceData.subTotal)} VND</Text><br />
                            <Text>Thuế ({new Intl.NumberFormat('vi-VN').format(invoiceData.taxAmount)}):</Text> <Text strong>{new Intl.NumberFormat('vi-VN').format(invoiceData.taxAmount)} VND</Text><br />
                            <Title level={4} style={{ margin: '8px 0' }}>Tổng Tiền:</Title>
                            <Title level={4} type="success" style={{ display: 'inline' }}>
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(invoiceData.totalAmount)}
                            </Title>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Divider orientation="left">Chi tiết Dòng hàng</Divider>
            <InvoiceLinesTable lines={invoiceData.lines || []} />

            <Divider orientation="left">Lịch sử Thanh toán</Divider>
            {/* Giả định invoiceData có trường 'payments' */}
            <PaymentHistoryTable payments={invoiceData.payments || []} />

            <Divider />
            <Text italic>Ghi chú: {invoiceData.notes || 'Không có ghi chú.'}</Text>
        </div>
    );
};

export default InvoiceDetail;