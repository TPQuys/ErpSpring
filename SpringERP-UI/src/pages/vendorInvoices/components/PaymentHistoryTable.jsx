import React from 'react';
import { Table, Typography, Empty } from 'antd';
import moment from 'moment';

const { Text } = Typography;

// Hàm định dạng tiền tệ
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const PaymentHistoryTable = ({ payments }) => {
    // Cấu trúc cột cho bảng lịch sử thanh toán
    const columns = [
        {
            title: 'STT',
            key: 'stt',
            render: (text, record, index) => index + 1,
            width: 50,
        },
        {
            title: 'Mã Thanh toán',
            dataIndex: 'paymentCode', // Giả định trường paymentCode tồn tại trong Payment DTO
            key: 'paymentCode',
            // eslint-disable-next-line no-unused-vars
            render: (text, record) => (
                // Nếu bạn có trang chi tiết thanh toán, có thể thêm link ở đây
                <Text copyable>{text}</Text> 
            ),
        },
        {
            title: 'Ngày Thanh toán',
            dataIndex: 'paymentDate',
            key: 'paymentDate',
            render: (date) => moment(date).format('DD/MM/YYYY'),
            width: 150,
        },
        {
            title: 'Phương thức',
            dataIndex: 'paymentMethod', // Ví dụ: CASH, BANK_TRANSFER, CHEQUE
            key: 'paymentMethod',
            width: 150,
        },
        {
            title: 'Số tiền Thanh toán',
            dataIndex: 'amount',
            key: 'amount',
            align: 'right',
            width: 180,
            render: formatCurrency,
        },
        {
            title: 'Ghi chú',
            dataIndex: 'notes',
            key: 'notes',
        },
    ];

    if (!payments || payments.length === 0) {
        return <Empty description="Chưa có giao dịch thanh toán nào được ghi nhận." />;
    }

    return (
        <Table
            dataSource={payments}
            columns={columns}
            rowKey="paymentId" // Giả định ID của giao dịch thanh toán
            pagination={false}
            size="small"
            bordered
            scroll={{ x: 'max-content' }}
        />
    );
};

export default PaymentHistoryTable;