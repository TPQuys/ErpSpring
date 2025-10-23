import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Card, Input, Tag, message, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, SendOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { getPOList, deletePO, approvePO, cancelPO } from '../../api/purchaseOrderApi';
import { getPOListColumns } from './poListColumns';
import POFormModal from './modal/POFormModal';
import { useNavigate } from 'react-router-dom';
import { Content } from 'antd/es/layout/layout';

const POListPage = () => {
    const [pos, setPOs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentPO, setCurrentPO] = useState(null); 

    const navigate = useNavigate();

    const loadPOs = async () => {
        setLoading(true);
        try {
            const data = await getPOList();
            setPOs(data);
        } catch (error) {
            console.error('Load PO error:', error);
            message.error('Lỗi khi tải danh sách Đơn hàng Mua.');
        }
        setLoading(false);
    };

    useEffect(() => {
        loadPOs();
    }, []);

    const handleOpenCreateModal = () => {
        setCurrentPO(null);
        setIsModalVisible(true);
    };

    const handleOpenEditModal = (record) => {
        if (record.status !== 'DRAFT') {
            message.warning('Chỉ có thể chỉnh sửa PO ở trạng thái Bản Nháp.');
            return;
        }
        setCurrentPO(record);
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setCurrentPO(null);
    };

    const handleSuccess = () => {
        loadPOs();
    };

    const handleAction = async (poId, actionType, confirmMessage) => {
        if (!window.confirm(confirmMessage)) return;

        try {
            switch (actionType) {
                case 'delete':
                    await deletePO(poId);
                    message.success('Xóa PO thành công.');
                    break;
                case 'approve':
                    await approvePO(poId);
                    message.success('Duyệt PO thành công.');
                    break;
                case 'cancel':
                    await cancelPO(poId);
                    message.success('Hủy PO thành công.');
                    break;
                default:
                    return;
            }
            loadPOs();
        } catch (error) {
            message.error(error.message || 'Thực hiện hành động thất bại.');
        }
    };

    const renderActions = (record) => {
        if (record.status === 'DRAFT') {
            return (
                <Space size="small">
                    <Button icon={<EditOutlined />} onClick={() => handleOpenEditModal(record)} size="small">Sửa</Button>
                    <Popconfirm
                        title="Duyệt Đơn hàng?" onConfirm={() => handleAction(record.poId, 'approve', 'Xác nhận duyệt đơn hàng này?')}
                    >
                        <Button icon={<SendOutlined />} type="primary" size="small">Duyệt</Button>
                    </Popconfirm>
                    <Popconfirm
                        title="Xóa Đơn hàng?" onConfirm={() => handleAction(record.poId, 'delete', 'Xác nhận xóa PO DRAFT này?')}
                    >
                        <Button icon={<DeleteOutlined />} danger size="small">Xóa</Button>
                    </Popconfirm>
                </Space>
            );
        }
        if (record.status === 'APPROVED') {
            return (
                <Space size="small">
                    <Button onClick={() => navigate(`/po/view/${record.poId}`)} size="small">Xem</Button>
                    <Button icon={<CloseCircleOutlined />} onClick={() => handleAction(record.poId, 'cancel', 'Xác nhận hủy đơn hàng đã duyệt?')} danger size="small">Hủy</Button>
                    <Button icon={<CheckCircleOutlined />} onClick={() => navigate(`/po/receive/${record.poId}`)} type="primary" size="small">Nhận Hàng</Button>
                </Space>
            );
        }
        return <Button onClick={() => navigate(`/po/view/${record.poId}`)} size="small">Xem</Button>;
    };

    const columns = getPOListColumns(renderActions);

    return (
        <Content style={{ padding: 20 }}>
            <Card
                title="Quản Lý Đơn Hàng Mua"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleOpenCreateModal}
                    >
                        Tạo Đơn Hàng Mua
                    </Button>
                }
            >
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                    <Input
                        placeholder="Tìm kiếm theo Mã PO/Tên NCC"
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)} 
                        style={{ width: 300 }}
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={pos}
                    rowKey="poId"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 'max-content' }}
                />

                <POFormModal
                    visible={isModalVisible}
                    onCancel={handleCloseModal}
                    onSuccess={handleSuccess}
                    currentPO={currentPO} 
                />
            </Card>
        </Content>
    );
};

export default POListPage;