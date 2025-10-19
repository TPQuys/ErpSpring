import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    DashboardOutlined,
    ShoppingCartOutlined,
    AppstoreOutlined,
    UserOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Sider } = Layout;

const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/purchase-orders', icon: <ShoppingCartOutlined />, label: 'Quản lý Mua hàng' },
    { key: '/items', icon: <AppstoreOutlined />, label: 'Quản lý Mặt hàng' },
    { key: '/users', icon: <UserOutlined />, label: 'Quản lý Người dùng' },
];

const AppSider = ({ collapsed, setCollapsed }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    const handleMenuClick = (e) => {
        if (e.key === 'logout') {
            logout();
            navigate('/login');
            return;
        }
        navigate(e.key);
    };

    const selectedKeys = [location.pathname];

    const finalMenuItems = [
        ...menuItems,
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            danger: true,
            style: { marginTop: 'auto' }
        },
    ];

    return (
        <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
            theme="dark"
            style={{
                overflow: 'auto',
                height: '100vh',
                position: 'fixed',
                left: 0,
                zIndex: 100,
                paddingTop: '32px'
            }}
        >
            <Menu
                theme="dark"
                mode="inline"
                selectedKeys={selectedKeys}
                onClick={handleMenuClick}
                items={finalMenuItems}
            />
        </Sider>
    );
};

export default AppSider;