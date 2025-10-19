import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { Form, Input, Button, Spin, App } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

import { StyledCard } from '../components/StyledCard';
import { StyledContainer } from '../components/StyledContainer';
import { notify } from '../components/notify';

function LoginForm() {
  const [form] = Form.useForm();
  const { login, isLoggedIn, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const onFinish = async (values) => {

    try {
      await login(values.username, values.password);
      notify.success("Đăng nhập thành công")
    } catch (err) {
      notify.error(err.message || 'Đã xảy ra lỗi không xác định.');
    }
  };

  if (isLoggedIn) {
    return null;
  }

  return (
    <StyledContainer>
      <StyledCard
        title="Đăng Nhập Hệ Thống"
      >
        <Spin spinning={loading}>
          <Form
            form={form}
            name="login_form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
              ]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="Tên đăng nhập"
                disabled={loading}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu!' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="Mật khẩu"
                disabled={loading}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                style={{ width: '100%' }}
                loading={loading}
              >
                Đăng Nhập
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </StyledCard>
    </StyledContainer>
  );
}


export default LoginForm;
