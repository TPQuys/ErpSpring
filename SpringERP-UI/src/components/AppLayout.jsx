import { Collapse, Layout } from 'antd';
import AppSider from './AppSider';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { useState } from 'react';

const { Content } = Layout;

const AppLayout = ({ children }) => {
    const { isLoggedIn } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    return (
        <Layout style={{ minHeight: '100vh', width: '100vw' }}>
            <AppSider collapsed={collapsed}  setCollapsed={setCollapsed}/>
            
            <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}> {/* 80px là chiều rộng mặc định của Sider khi thu gọn */}
                
                <Content 
                    style={{ 
                        margin: '16px 16px', 
                        padding: 16, 
                        minHeight: 280, 
                        background: '#fff' 
                    }}
                >
                    {children}
                </Content>

                {/* <Layout.Footer style={{ textAlign: 'center' }}>
                    Spring ERP ©{new Date().getFullYear()} Created by Gemini AI
                </Layout.Footer> */}
            </Layout>
        </Layout>
    );
};

export default AppLayout;