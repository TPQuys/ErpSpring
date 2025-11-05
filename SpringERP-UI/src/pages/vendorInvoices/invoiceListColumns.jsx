import { Tag, Button, Space } from 'antd';
import moment from 'moment';

export const getInvoiceListColumns = (renderActions, navigate) => [
    {
        title: 'Số Hóa đơn',
        dataIndex: 'invoiceNumber',
        key: 'invoiceNumber',
        render: (text, record) => (
            <a onClick={() => navigate(`/vendor-invoices/view/${record.invoiceId}`)}>{text}</a>
        ),
    },
    {
        title: 'Mã Ref Gốc',
        dataIndex: 'refNumber',
        key: 'refNumber',
    },
    {
        title: 'Nhà Cung Cấp',
        dataIndex: ['vendorName'],
        key: 'vendorName',
    },
    {
        title: 'Ngày Đáo Hạn',
        dataIndex: 'dueDate',
        key: 'dueDate',
        sorter: (a, b) => moment(a.dueDate).unix() - moment(b.dueDate).unix(),
        render: (date) => <span style={{ color: moment(date).isBefore(moment(), 'day') ? 'red' : 'inherit' }}>{date}</span>,
    },
    {
        title: 'Tổng Tiền',
        dataIndex: 'totalAmount',
        key: 'totalAmount',
        render: (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount),
        align: 'right',
    },
    {
        title: 'Trạng thái HĐ',
        dataIndex: 'invoiceStatus',
        key: 'invoiceStatus',
        render: (status) => {
            switch (status) {
                case 'DRAFT': return <Tag color="default">Bản Nháp</Tag>;
                case 'APPROVED': return <Tag color="blue">Đã Duyệt</Tag>;
                case 'PAID': return <Tag color="success">Đã Thanh Toán</Tag>;
                default: return <Tag>{status}</Tag>;
            }
        }
    },
    {
        title: 'Trạng thái TT',
        dataIndex: 'paymentStatus',
        key: 'paymentStatus',
        render: (status) => {
            switch (status) {
                case 'PAID': return <Tag color="success">Đã Thanh Toán</Tag>;
                case 'PARTIALLY_PAID': return <Tag color="processing">Thanh Toán Một Phần</Tag>;
                default: return <Tag color="warning">Chưa Thanh Toán</Tag>;
            }
        }
    },
    {
        title: 'Hành động',
        key: 'action',
        fixed: 'right',
        render: renderActions,
    }
];