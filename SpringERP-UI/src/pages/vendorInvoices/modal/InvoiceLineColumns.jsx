import { Form, Input, InputNumber } from "antd";

export const getInvoiceLineColumns = (isEditing) => [
    {
        title: 'STT',
        dataIndex: 'id',
        key: 'id',
        render: (text, record, index) => index + 1,
        width: 60
    },
    {
        // ✅ Sửa: Lấy từ record.item.itemCode
        title: 'Mã hàng',
        dataIndex: ['item', 'itemCode'], // Antd tự động truy cập theo đường dẫn này
        key: 'itemCode',
        width: 100
    },
    {
        // ✅ Sửa: Lấy tên sản phẩm từ record.item.name (giả định dùng 'name' làm mô tả)
        title: 'Mô tả',
        dataIndex: ['item', 'name'],
        key: 'description'
    },
    {
        // ✅ Sửa: Dữ liệu API trả về là 'receivedQuantity'
        title: 'SL đã nhận',
        dataIndex: 'receivedQuantity',
        key: 'receivedQuantity',
        width: 120,
        align: 'right'
    },
    {
        // ✅ Sửa: Dữ liệu API trả về là 'receivedQuantity'
        title: 'SL đã lập hóa đơn',
        dataIndex: 'invoicedQuantity',
        key: 'invoicedQuantity',
        width: 120,
        align: 'right'
    },
    {
        title: 'SL Lập HĐ',
        dataIndex: 'quantity', // Dữ liệu hiển thị ban đầu, nhưng Form.Item sẽ ghi đè
        key: 'quantity',
        width: 150,
        render: (text, record, index) => (
            <Form.Item
                // Tên trường trong form: lines[index].quantity
                name={['lines', index, 'quantity']}
                rules={[{ required: true, message: 'Nhập SL' }]}
                style={{ marginBottom: 0 }}
            >
                <InputNumber
                    min={0}
                    // Sử dụng receivedQuantity làm max limit nếu maxInvoicableQty không có
                    max={record.maxInvoicableQty || record.receivedQuantity}
                    placeholder="SL"
                    style={{ width: '100%' }}
                    disabled={isEditing}
                />
            </Form.Item>
        )
    },
    
    {
        title: 'Đơn giá',
        dataIndex: 'unitPrice',
        key: 'unitPrice',
        width: 150,
        render: (text, record, index) => (
            <Form.Item
                // Tên trường trong form: lines[index].unitPrice
                name={['lines', index, 'unitPrice']}
                rules={[{ required: true, message: 'Nhập Giá' }]}
                style={{ marginBottom: 0 }}
            >
                <InputNumber
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    style={{ width: '100%' }}
                    disabled={isEditing}
                />
            </Form.Item>
        )
    },

    {
        title: 'Thuế suất (%)',
        dataIndex: 'taxRate', // Giả định PO Line có thể có taxRate
        key: 'taxRate',
        width: 120,
        render: (text, record, index) => (
            <Form.Item
                name={['lines', index, 'taxRate']}
                rules={[{ required: true, message: 'Nhập thuế suất!' }]}
                style={{ marginBottom: 0 }}
                // Đặt giá trị mặc định cho taxRate nếu có trong data PO
                initialValue={record.taxRate || 0.1} // Giả định mặc định là 0.1 (10% VAT)
            >
                <InputNumber
                    min={0}
                    max={1} // Tỷ lệ (0 đến 1)
                    step={0.01}
                    formatter={value => `${value * 100}%`} // Hiển thị 0.1 thành 10%
                    parser={value => value.replace('%', '') / 100} // Phân tích 10% thành 0.1
                    style={{ width: '100%' }}
                    disabled={isEditing}
                />
            </Form.Item>
        )
    },
    // --- CÁC TRƯỜNG ẨN ĐỂ GỬI DỮ LIỆU ---
    {
        title: 'refLineId',
        dataIndex: 'poLineId', // ✅ Sửa: Dùng poLineId làm ID tham chiếu dòng gốc
        key: 'refLineId',
        render: (text, record, index) => (
            // Lấy giá trị từ poLineId của data và set vào trường hidden refLineId của form
            <Form.Item name={['lines', index, 'refLineId']} hidden initialValue={record.poLineId}><Input /></Form.Item>
        )
    },
    {
        title: 'itemId',
        dataIndex: ['item', 'itemId'], // ✅ Sửa: Lấy từ record.item.itemId
        key: 'itemId',
        render: (text, record, index) => (
            // Lấy giá trị từ item.itemId của data và set vào trường hidden itemId của form
            <Form.Item name={['lines', index, 'itemId']} hidden initialValue={record.item?.itemId}><Input /></Form.Item>
        )
    },
];
