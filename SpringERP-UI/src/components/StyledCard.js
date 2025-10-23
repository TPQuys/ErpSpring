// src/components/LoginForm.styles.js
import styled from 'styled-components';
import { Card } from 'antd';

export const StyledCard = styled(Card)`
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;

  .ant-card-head {
    text-align: center;
    font-size: 1.5em;
    font-weight: 600;
    color: #001529;
    border-bottom: 2px solid #007bff; 
  }
`;