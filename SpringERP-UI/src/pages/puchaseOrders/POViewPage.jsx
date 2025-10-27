import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Table, Button, Space, Typography, Tag, Divider, Modal, Result } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EditOutlined, EyeOutlined, FileDoneOutlined, ExclamationCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { getPOById, approvePO, cancelPO, closePO } from '../../api/purchaseOrderApi'; // Giả định các hàm API
import { notify } from '../../components/notify';

const { Title, Text } = Typography;

const POViewPage = () => {
    const { poId } = useParams();
    const navigate = useNavigate();
    
    const [poData, setPoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const loadPO = async () => {
        setLoading(true);
        try {
            const data = await getPOById(poId);
            console.log(data)
            setPoData(data);
        } catch (error) {
            console.error('Load PO detail error:', error);
            notify.error('Lỗi khi tải chi tiết đơn hàng.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPO();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [poId]);


    const handleAction = (actionFunction, actionName, confirmMessage) => {
        notify.modal.confirm({
            title: `Xác nhận ${actionName}`,
            icon: <ExclamationCircleOutlined />,
            content: confirmMessage,
            onOk() {
                performAction(actionFunction, actionName);
            },
        });
    };

    const performAction = async (actionFunction, actionName) => {
        setActionLoading(true);
        try {
            const result = await actionFunction(poId);
            setPoData(result);
            notify.success(`${actionName} đơn hàng thành công! Trạng thái: ${result.status}`);
        } catch (error) {
            notify.error(`Lỗi khi ${actionName.toLowerCase()} đơn hàng: ${error.message}`);
        } finally {
            setActionLoading(false);
        }
    };
    
    // --- 3. Logic Hiển thị và Bật/Tắt Nút hành động ---
    
    const status = poData?.status;
    
    const getStatusTag = (status) => {
        switch (status) {
            case 'DRAFT': return <Tag color="default">NHÁP</Tag>;
            case 'APPROVED': return <Tag color="blue">ĐÃ DUYỆT</Tag>;
            case 'PARTIALLY_RECEIVED': return <Tag color="processing">NHẬN MỘT PHẦN</Tag>;
            case 'RECEIVED': return <Tag color="success">ĐÃ NHẬN ĐỦ</Tag>;
            case 'CANCELED': return <Tag color="error">ĐÃ HỦY</Tag>;
            case 'CLOSED': return <Tag color="volcano">ĐÃ ĐÓNG</Tag>;
            default: return <Tag>{status}</Tag>;
        }
    };

    const isActionDisabled = actionLoading || loading;

    // Các hàm xử lý hành động
    const isEditAllowed = status === 'DRAFT';
    const isApproveAllowed = status === 'DRAFT';
    const isReceiveAllowed = status === 'APPROVED' || status === 'PARTIALLY_RECEIVED';
    const isCancelAllowed = status !== 'RECEIVED' && status !== 'CLOSED' && status !== 'CANCELED';
    const isCloseAllowed = status === 'RECEIVED' || status === 'CANCELED';
    
    // --- 4. Định nghĩa cột cho Bảng Chi tiết PO ---

    const columns = [
        { title: 'Mã Item', dataIndex: ['item', 'itemId'], key: 'itemId', width: 100 },
        { title: 'Tên Mặt hàng', dataIndex: ['item', 'name'], key: 'item', width: 200 },
        { title: 'SL Đặt', dataIndex: 'quantity', key: 'orderedQty', width: 100 },
        { title: 'SL Đã nhận', dataIndex: 'receivedQuantity', key: 'receivedQty', width: 100, render: (q) => <Text strong>{q || 0}</Text> },
        { title: 'Đơn giá', dataIndex: 'unitPrice', key: 'unitPrice', width: 100 },
        { title: 'Chiết khấu (%)', dataIndex: 'discountRate', key: 'discount', width: 100 },
        { title: 'Tổng tiền', dataIndex: 'lineTotal', key: 'lineTotal', width: 120, render: (t) => <Text mark>{t}</Text> },
    ];

     if (loading) {
        return <Card title="Đang tải dữ liệu..." loading={true} />;
    }

    // Xử lý khi không tìm thấy PO
    if (!poData) {
        return (
            <Result
                status="404"
                title="404"
                subTitle={`Không tìm thấy Đơn hàng Mua (PO) với ID: ${poId}.`}
                extra={
                    <Button type="primary" onClick={() => navigate('/purchase-orders')}>
                        Quay lại Danh sách PO
                    </Button>
                }
            />
        );
    }
    // --- 5. Render Giao diện ---
    return (
        <Card 
            title={`Đơn hàng Mua: ${poData.poNumber}`}
            extra={
                <Space>
                    {isEditAllowed && (
                        <Button icon={<EditOutlined />} onClick={() => navigate(`/purchase-orders/edit/${poId}`)} disabled={isActionDisabled}>
                            Sửa
                        </Button>
                    )}
                    {isApproveAllowed && (
                        <Button 
                            type="primary" 
                            icon={<CheckCircleOutlined />} 
                            onClick={() => handleAction(approvePO, 'Duyệt', 'Bạn có chắc chắn muốn duyệt đơn hàng này?')} 
                            disabled={isActionDisabled}
                        >
                            Duyệt
                        </Button>
                    )}
                    {isReceiveAllowed && (
                        <Button 
                            type="primary" 
                            icon={<FileDoneOutlined />} 
                            onClick={() => navigate(`/purchase-orders/receive/${poId}`)} 
                            disabled={isActionDisabled}
                        >
                            Nhận hàng
                        </Button>
                    )}
                    {isCancelAllowed && (
                        <Button 
                            danger 
                            icon={<CloseCircleOutlined />} 
                            onClick={() => handleAction(cancelPO, 'Hủy', 'Thao tác này sẽ HỦY đơn hàng. Nếu đã nhận hàng, tồn kho sẽ bị hoàn lại (reversal). Bạn có muốn tiếp tục?')} 
                            disabled={isActionDisabled}
                        >
                            Hủy
                        </Button>
                    )}
                    {isCloseAllowed && (
                        <Button 
                            icon={<EyeOutlined />} 
                            onClick={() => handleAction(closePO, 'Đóng', 'Bạn có chắc chắn muốn ĐÓNG đơn hàng này?')} 
                            disabled={isActionDisabled}
                        >
                            Đóng
                        </Button>
                    )}
                    {actionLoading && <LoadingOutlined style={{ fontSize: 24 }} />}
                </Space>
            }
        >
            <Title level={4}>Trạng thái: {getStatusTag(status)}</Title>
            <Divider />

            <Descriptions bordered size="small" column={{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
                <Descriptions.Item label="Nhà cung cấp">{poData.vendor.name}</Descriptions.Item>
                <Descriptions.Item label="Ngày đặt hàng">{poData.orderDate}</Descriptions.Item>
                <Descriptions.Item label="Ngày yêu cầu">{poData.requiredDate}</Descriptions.Item>
                <Descriptions.Item label="Tổng tiền">{poData.totalAmount.toLocaleString()} VND</Descriptions.Item>
                <Descriptions.Item label="Điều khoản TT">{poData.paymentTerms}</Descriptions.Item>
                <Descriptions.Item label="Người tạo">{poData.createdBy.firstName} {poData.createdBy.username}</Descriptions.Item>
                <Descriptions.Item label="Địa chỉ giao" span={2}>{poData.deliveryAddress}</Descriptions.Item>
                <Descriptions.Item label="Ghi chú" span={4}>{poData.notes || 'Không có ghi chú'}</Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Chi Tiết Mặt Hàng</Divider>
            
            <Table
                columns={columns}
                dataSource={poData.lines}
                rowKey="poLineId"
                pagination={false}
                scroll={{ x: 'max-content' }}
                footer={() => (
                    <Text strong>Tổng cộng: {poData.totalAmount.toLocaleString()} VND</Text>
                )}
            />
        </Card>
    );
};

export default POViewPage;