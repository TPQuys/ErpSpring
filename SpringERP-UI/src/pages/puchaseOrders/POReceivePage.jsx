import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Table, Space, InputNumber, Typography, Tag, Result } from 'antd'; // Import Result component
import { CheckCircleOutlined, CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { getPOById, receiveGoods } from '../../api/purchaseOrderApi';
import { notify } from '../../components/notify';

const { Title, Text } = Typography;

const POReceivePage = () => {
    const { poId } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    
    const [poData, setPoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isPoFound, setIsPoFound] = useState(true);

    // 1. Tải dữ liệu PO
    useEffect(() => {
        const loadPO = async () => {
            try {
                const data = await getPOById(poId);
                
                if (!data) { 
                    setIsPoFound(false);
                    return;
                }
                
                setPoData(data);
                
                // Khởi tạo giá trị cho form: số lượng còn thiếu cần nhận
                const initialValues = {};
                data.lines.forEach(line => {
                    // Đặt giá trị mặc định là số lượng cần nhận còn lại
                    const pendingQty = line.quantity - line.receivedQuantity;
                    // Nếu đã nhận đủ, đặt là 0, nếu chưa, đặt là số còn lại
                    initialValues[line.poLineId] = pendingQty > 0 ? pendingQty : 0; 
                });
                form.setFieldsValue(initialValues);

            } catch (error) {
                console.error('Load PO detail error:', error);
                
                if (error.response && error.response.status === 404) {
                    setIsPoFound(false);
                } else {
                    notify.error('Lỗi khi tải chi tiết đơn hàng.');
                    setIsPoFound(false);
                }
            } finally {
                setLoading(false);
            }
        };
        loadPO();
    }, [poId, form]);

    // 2. Xử lý logic Nhận hàng
    const onFinish = async (values) => {
        setSubmitting(true);
        try {
            // Lọc ra các dòng có số lượng nhận > 0
            const receivedLines = poData.lines.map(line => {
                const poLineId = line.poLineId;
                // Lấy giá trị từ form, đảm bảo là 0 nếu người dùng xóa hết
                const receivedQuantity = values[poLineId] || 0; 
                
                if (receivedQuantity > 0) {
                    // Chuyển số lượng về kiểu Number
                    return { poLineId, receivedQuantity: Number(receivedQuantity) };
                }
                return null;
            }).filter(item => item !== null);
            
            if (receivedLines.length === 0) {
                notify.warning('Vui lòng nhập số lượng muốn nhận.');
                setSubmitting(false);
                return;
            }

            const result = await receiveGoods(poId, receivedLines); 
            notify.success(`Xác nhận nhận hàng thành công. Trạng thái mới: ${result.status}`);
            
            navigate(`/purchase-orders/view/${poId}`); 

        } catch (error) {
            console.error('Receive goods error:', error);
            notify.error(error.response?.data?.message || error.message || 'Lỗi khi xử lý nhận hàng.');
        } finally {
            setSubmitting(false);
        }
    };
    
    // --- Xử lý Giao diện Tải và Lỗi ---
    if (loading) {
        return <Card title="Đang tải dữ liệu..." loading={true} />;
    }

    if (!isPoFound) {
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
    
    const isReceivingAllowed = poData.status === 'APPROVED' || poData.status === 'PARTIALLY_RECEIVED';

    // 3. Định nghĩa cột cho bảng Nhận hàng
    const columns = [
        { title: 'Mặt hàng', dataIndex: ['item', 'name'], key: 'item', width: 200 },
        { title: 'Mã Item', dataIndex: ['item', 'itemId'], key: 'itemId', width: 100 },
        { title: 'SL Đặt', dataIndex: 'quantity', key: 'orderedQty', render: (q) => <Text strong>{q}</Text>, width: 100 },
        { title: 'SL Đã nhận', dataIndex: 'receivedQuantity', key: 'receivedQty', width: 100 },
        { 
            title: 'SL Cần nhận', 
            dataIndex: 'quantity', 
            key: 'pendingQty', 
            width: 120,
            render: (quantity, record) => (
                <Text type="secondary">{quantity - record.receivedQuantity}</Text>
            ),
        },
        { 
            title: 'SL Nhận Thực tế', 
            key: 'actualReceive', 
            width: 150,
            render: (text, record) => {
                const pendingQty = record.quantity - record.receivedQuantity;
                return (
                    <Form.Item
                        name={record.poLineId} // Dùng poLineId làm key để form theo dõi
                        noStyle
                        rules={[
                            // Chỉ yêu cầu nhập nếu còn số lượng cần nhận
                            { 
                                required: pendingQty > 0, 
                                message: 'Nhập SL!' 
                            }, 
                            // eslint-disable-next-line no-unused-vars
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (value === null || value === undefined) {
                                        return Promise.resolve();
                                    }
                                    if (value < 0) {
                                        notify.error(`Số lượng phải lớn hơn hoặc bằng 0!`)
                                        return Promise.reject(new Error(`Số lượng phải lớn hơn hoặc bằng 0!`));
                                    }
                                    // THAY ĐỔI: Sử dụng validator để hiển thị lỗi khi nhập quá pendingQty
                                    if (value > pendingQty) {
                                        notify.error(`Vui lòng không nhận quá ${pendingQty} đơn vị còn thiếu!`)
                                        return Promise.reject(new Error(`Vui lòng không nhận quá ${pendingQty} đơn vị còn thiếu!`));
                                    }
                                    return Promise.resolve();
                                },
                            }),
                        ]}
                    >
                        <InputNumber 
                            min={0} 
                            style={{ width: 100 }} 
                            disabled={pendingQty <= 0 || !isReceivingAllowed}
                        />
                    </Form.Item>
                );
            },
        },
        { title: 'Đơn giá', dataIndex: 'unitPrice', key: 'unitPrice', width: 100 },
    ];

    // 4. Render giao diện
    return (
        <Card title={`Nhận Hàng cho Đơn hàng Mua: ${poData.poNumber}`}>
            <Form form={form} layout="vertical" onFinish={onFinish}>
                
                {/* THÔNG TIN CHUNG (READ-ONLY) */}
                <Card style={{ marginBottom: 24 }} size="small" title="Thông tin Đơn hàng">
                    <Space size="large">
                        <Text>Nhà cung cấp: <Text strong>{poData.vendor.name}</Text></Text>
                        <Text>Ngày đặt: <Text strong>{poData.orderDate}</Text></Text>
                        <Text>Địa chỉ giao: <Text strong>{poData.deliveryAddress}</Text></Text>
                        <Text>Trạng thái hiện tại: 
                             <Tag color={isReceivingAllowed ? "processing" : "success"}>
                                 {poData.status}
                             </Tag>
                        </Text>
                    </Space>
                </Card>

                {/* BẢNG CHI TIẾT NHẬN HÀNG (FORM) */}
                <Title level={4}>Chi tiết Nhận hàng</Title>
                <Table
                    columns={columns}
                    dataSource={poData.lines}
                    rowKey="poLineId"
                    pagination={false}
                    size="small"
                />

                {/* NÚT XÁC NHẬN */}
                <Form.Item style={{ marginTop: 24 }}>
                    <Space>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            icon={<SaveOutlined />}
                            loading={submitting}
                            disabled={!isReceivingAllowed}
                        >
                            Xác nhận Nhận hàng
                        </Button>
                        <Button 
                            icon={<CloseCircleOutlined />}
                            onClick={() => navigate(`/purchase-orders/view/${poId}`)}
                        >
                            Hủy
                        </Button>
                        {!isReceivingAllowed && (
                            <Text type="danger">PO đang ở trạng thái **{poData.status}**. Không thể nhận hàng.</Text>
                        )}
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default POReceivePage;