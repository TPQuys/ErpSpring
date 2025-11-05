import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, Space, Card, Input, Tag, Popconfirm, Select, Row, Col } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined, EuroOutlined, DownloadOutlined } from '@ant-design/icons';
import { getInvoiceList, deleteInvoice, approveInvoice } from '../../api/vendorInvoiceApi'; 
import { getInvoiceListColumns } from './invoiceListColumns'; // ✅ Import từ file mới
import InvoiceModal from './modal/InvoiceModal'; // ✅ Import Modal
import { useNavigate } from 'react-router-dom';
import { Content } from 'antd/es/layout/layout';
import { notify } from '../../components/notify';

const VendorInvoiceListPage = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    const [isModalVisible, setIsModalVisible] = useState(false); // ✅ State quản lý Modal
    const [currentInvoice, setCurrentInvoice] = useState(null); // ✅ State lưu Hóa đơn đang chỉnh sửa

    const navigate = useNavigate();

    const loadInvoices = async () => {
        setLoading(true);
        try {
            const data = await getInvoiceList({ refType: 'PURCHASE' }); 
            setInvoices(data);
        } catch (error) {
            console.error('Load Invoice error:', error);
            notify.error('Lỗi khi tải danh sách Hóa đơn Mua.');
        }
        setLoading(false);
    };

    useEffect(() => {
        loadInvoices();
    }, []);

    // --- Xử lý Modal ---
    const handleOpenCreateModal = () => {
        setCurrentInvoice(null);
        setIsModalVisible(true);
    };

    const handleOpenEditModal = (record) => {
        if (record.invoiceStatus !== 'DRAFT') {
            notify.warning('Chỉ có thể chỉnh sửa Hóa đơn ở trạng thái Bản Nháp.');
            return;
        }
        setCurrentInvoice(record);
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setCurrentInvoice(null);
    };

    const handleSuccess = () => {
        loadInvoices(); // Tải lại dữ liệu sau khi tạo/sửa thành công
    };
    // --- Kết thúc Xử lý Modal ---


    const handleAction = async (invoiceId, actionType, confirmMessage) => {
        if (!window.confirm(confirmMessage)) return;

        try {
            switch (actionType) {
                case 'delete':
                    await deleteInvoice(invoiceId);
                    notify.success('Xóa Hóa đơn thành công.');
                    break;
                case 'approve':
                    await approveInvoice(invoiceId);
                    notify.success('Duyệt Hóa đơn thành công. Công nợ đã được ghi nhận.');
                    break;
                case 'pay':
                    navigate(`/vendor-invoices/pay/${invoiceId}`); 
                    return; 
                default:
                    return;
            }
            loadInvoices();
        } catch (error) {
            notify.error(error.notify || 'Thực hiện hành động thất bại.');
        }
    };

    // --- Định nghĩa các nút Hành động dựa trên Trạng thái ---
    const renderActions = (record) => {
        const { invoiceId, invoiceStatus, paymentStatus } = record;

        // Nếu hóa đơn còn ở trạng thái NHÁP
        if (invoiceStatus === 'DRAFT') {
            return (
                <Space size="small">
                    {/* ✅ Mở Modal Sửa */}
                    <Button icon={<EditOutlined />} onClick={() => handleOpenEditModal(record)} size="small">Sửa</Button>
                    <Popconfirm
                        title="Duyệt Hóa đơn?" onConfirm={() => handleAction(invoiceId, 'approve', 'Xác nhận duyệt hóa đơn này?')}
                    >
                        <Button icon={<CheckCircleOutlined />} type="primary" size="small">Duyệt</Button>
                    </Popconfirm>
                    <Popconfirm
                        title="Xóa Hóa đơn?" onConfirm={() => handleAction(invoiceId, 'delete', 'Xác nhận xóa Hóa đơn DRAFT này?')}
                    >
                        <Button icon={<DeleteOutlined />} danger size="small">Xóa</Button>
                    </Popconfirm>
                </Space>
            );
        }
        
        // Nếu hóa đơn ĐÃ DUYỆT nhưng CHƯA THANH TOÁN ĐỦ
        if (invoiceStatus === 'APPROVED' || paymentStatus === 'PARTIALLY_PAID') {
            return (
                <Space size="small">
                    <Button onClick={() => navigate(`/vendor-invoices/view/${invoiceId}`)} size="small">Xem</Button>
                    {paymentStatus !== 'PAID' && (
                        <Button icon={<EuroOutlined />} onClick={() => handleAction(invoiceId, 'pay', 'Chuyển đến trang Thanh toán?')} type="primary" size="small">Thanh Toán</Button>
                    )}
                    <Popconfirm
                        title="Hủy Hóa đơn?" onConfirm={() => notify.warning("Không thể hủy HĐ đã duyệt/thanh toán một phần. Cần tạo Ghi nợ.")}
                    >
                         <Button icon={<CloseCircleOutlined />} danger size="small">Hủy</Button>
                    </Popconfirm>
                </Space>
            );
        }
        
        // Trạng thái đã thanh toán hoặc đã hủy
        return <Button onClick={() => navigate(`/vendor-invoices/view/${invoiceId}`)} size="small">Xem</Button>;
    };

    // --- Xử lý Lọc và Tìm kiếm ---
    const filteredInvoices = useMemo(() => {
        let list = invoices;

        if (filterStatus !== 'ALL') {
            list = list.filter(inv => inv.invoiceStatus === filterStatus || inv.paymentStatus === filterStatus);
        }

        if (searchText) {
            const lowerSearchText = searchText.toLowerCase();
            list = list.filter(inv => 
                inv.invoiceNumber.toLowerCase().includes(lowerSearchText) ||
                (inv.vendor && inv.vendor.name.toLowerCase().includes(lowerSearchText))
            );
        }
        return list;
    }, [invoices, filterStatus, searchText]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const columns = useMemo(() => getInvoiceListColumns(renderActions, navigate), [navigate]);

    return (
        <Content style={{ padding: 20 }}>
            <Card
                title="Quản Lý Hóa Đơn Mua (Accounts Payable)"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleOpenCreateModal} // ✅ Mở Modal Tạo mới
                    >
                        Tạo Hóa Đơn Mua
                    </Button>
                }
            >
                {/* --- Thanh Bộ Lọc --- */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={6}>
                        <Input
                            placeholder="Tìm kiếm theo Số HĐ/Tên NCC"
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </Col>
                    <Col span={4}>
                        <Select
                            placeholder="Trạng thái Hóa đơn"
                            style={{ width: '100%' }}
                            value={filterStatus}
                            onChange={setFilterStatus}
                            options={[
                                { value: 'ALL', label: 'Tất cả trạng thái' },
                                { value: 'DRAFT', label: 'Bản Nháp' },
                                { value: 'APPROVED', label: 'Đã Duyệt' },
                                { value: 'PAID', label: 'Đã Thanh Toán' },
                                { value: 'PARTIALLY_PAID', label: 'Thanh Toán 1 Phần' },
                                { value: 'CANCELED', label: 'Đã Hủy' },
                            ]}
                        />
                    </Col>
                    <Col span={6}>
                        {/* Date Range Picker... */}
                    </Col>
                    <Col span={8} style={{ textAlign: 'right' }}>
                        <Button icon={<DownloadOutlined />}>Xuất Excel</Button>
                    </Col>
                </Row>
                
                {/* --- Bảng Dữ liệu --- */}
                <Table
                    columns={columns}
                    dataSource={filteredInvoices}
                    rowKey="invoiceId"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 'max-content' }}
                />
            </Card>

            {/* ✅ Component Modal được thêm vào đây */}
            <InvoiceModal
                visible={isModalVisible}
                onCancel={handleCloseModal}
                onSuccess={handleSuccess}
                currentInvoice={currentInvoice}
            />
        </Content>
    );
};

export default VendorInvoiceListPage;