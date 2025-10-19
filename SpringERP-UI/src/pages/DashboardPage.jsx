// src/pages/Dashboard.jsx
import React from 'react';
import { Layout, Menu, Breadcrumb, Card, Row, Col, Statistic, Table, Tag } from 'antd';
import { ShoppingCartOutlined, DollarCircleOutlined, StockOutlined, UserOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext'; // Để lấy thông tin người dùng

const { Header, Content, Footer, Sider } = Layout;

// Styled Component cho khu vực chính (Nếu bạn muốn tùy chỉnh layout ngoài AntD)
const DashboardContent = styled(Content)`
    padding: 24px;
    min-height: 280px;
`;

// Styled Component cho tiêu đề
const PageHeader = styled.h1`
    margin-bottom: 24px;
    font-size: 1.8em;
    color: #001529;
`;

// Dữ liệu mẫu cho Dashboard
const mockData = {
    totalPO: 125,
    pendingPO: 15,
    inventoryValue: 750000000, // VND
    lowStockItems: 7,
    recentPO: [
        { key: '1', poNumber: 'PO-00125', vendor: 'Công ty A', date: '2025-10-18', total: 15000000, status: 'Completed' },
        { key: '2', poNumber: 'PO-00124', vendor: 'Công ty B', date: '2025-10-17', total: 2500000, status: 'Pending' },
        { key: '3', poNumber: 'PO-00123', vendor: 'Nhà cung cấp C', date: '2025-10-15', total: 45000000, status: 'In Progress' },
    ],
    lowStock: [
        { key: '1', itemCode: 'IT-005', itemName: 'Bàn phím cơ', stock: 12, minStock: 20 },
        { key: '2', itemCode: 'IT-010', itemName: 'Ổ cứng SSD 1TB', stock: 5, minStock: 10 },
    ]
};

// Định dạng tiền tệ VND
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};


// Cột cho bảng Đơn hàng gần đây
const poColumns = [
    { title: 'Mã PO', dataIndex: 'poNumber', key: 'poNumber' },
    { title: 'Nhà cung cấp', dataIndex: 'vendor', key: 'vendor' },
    { title: 'Ngày đặt', dataIndex: 'date', key: 'date' },
    { title: 'Tổng tiền', dataIndex: 'total', key: 'total', render: total => formatCurrency(total) },
    {
        title: 'Trạng thái', dataIndex: 'status', key: 'status',
        render: status => {
            let color = status === 'Completed' ? 'green' : status === 'Pending' ? 'volcano' : 'geekblue';
            return <Tag color={color}>{status.toUpperCase()}</Tag>;
        }
    },
];

// Cột cho bảng Hàng tồn kho thấp
const stockColumns = [
    { title: 'Mã hàng', dataIndex: 'itemCode', key: 'itemCode' },
    { title: 'Tên hàng', dataIndex: 'itemName', key: 'itemName' },
    { title: 'Tồn kho', dataIndex: 'stock', key: 'stock' },
    { title: 'Mức tối thiểu', dataIndex: 'minStock', key: 'minStock' },
];


const DashboardPage = () => {
    // eslint-disable-next-line no-unused-vars
    const { token } = useAuth(); // Dùng để kiểm tra trạng thái đăng nhập/lấy thông tin

    return (
        <DashboardContent>
            {/* <PageHeader>Tổng quan Hệ thống ERP</PageHeader>
            <Row gutter={24} style={{ marginBottom: 24 }}>

                <Col xs={24} sm={12} lg={6}>
                    <Card variant='outlined'>
                        <Statistic
                            title="Tổng Đơn Mua"
                            value={mockData.totalPO}
                            prefix={<ShoppingCartOutlined />}
                            suffix="Đơn"
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card variant='outlined'>
                        <Statistic
                            title="Giá trị Tồn kho"
                            value={mockData.inventoryValue}
                            formatter={formatCurrency}
                            prefix={<DollarCircleOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card variant='outlined'>
                        <Statistic
                            title="Đơn chờ xử lý"
                            value={mockData.pendingPO}
                            prefix={<ArrowUpOutlined />}
                            suffix="Đơn"
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card variant='outlined'>
                        <Statistic
                            title="Hàng tồn kho thấp"
                            value={mockData.lowStockItems}
                            prefix={<StockOutlined />}
                            suffix="Mặt hàng"
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={24}>

                <Col xs={24} lg={12} style={{ marginBottom: 24 }}>
                    <Card title="Phân tích Tổng quan Mua hàng (6 tháng)" variant='outlined' style={{ height: '100%' }}>
                        <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>

                        </div>
                    </Card>
                </Col>

                <Col xs={24} lg={12} style={{ marginBottom: 24 }}>
                    <Card title="Mặt hàng Tồn kho dưới Mức Tối thiểu" variant='outlined' style={{ height: '100%' }}>
                        <Table
                            dataSource={mockData.lowStock}
                            columns={stockColumns}
                            pagination={{ pageSize: 5 }}
                            size="small"
                        />
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col span={24}>
                    <Card title="Các Đơn Mua hàng Gần đây" bordered={false}>
                        <Table
                            dataSource={mockData.recentPO}
                            columns={poColumns}
                            pagination={{ pageSize: 5 }}
                        />
                    </Card>
                </Col>
            </Row> */}
        </DashboardContent>
    );
};

export default DashboardPage;