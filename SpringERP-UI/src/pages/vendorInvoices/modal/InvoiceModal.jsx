import React, { useState, useEffect } from 'react';
import { Modal, Form } from 'antd';
import InvoiceFormContent from './InvoiceFormContent';
import { notify } from '../../../components/notify'; // Giả định
import moment from 'moment';

// Giả định API
import {
    createInvoice,
    updateInvoice,
    fetchPoLinesByPoId // Hàm API để tải các dòng hàng
} from '../../../api/vendorInvoiceApi';

const InvoiceModal = ({ visible, onCancel, currentInvoice, onSuccess }) => {
    const [form] = Form.useForm();
    const [poLines, setPoLines] = useState([]); // State để lưu trữ các dòng hàng từ PO/GRN
    const [loading, setLoading] = useState(false);

    // Nếu có currentInvoice, thì đang ở chế độ chỉnh sửa.
    const isEditing = !!currentInvoice;

    const addIteminLines = (lines) => {
        const newLines = lines.map(line => (
            {
                ...line, item: {
                    itemCode: line.itemCode,
                    itemId: line.itemId,
                    name: line.itemName
                },
            }
        ))
        console.log(newLines)
        return newLines
    }
    // --- 1. Effect Load Dữ liệu & Reset Form ---
    useEffect(() => {
        if (!visible) {
            return;
        }

        form.resetFields();
        setPoLines([]); // Reset dòng hàng khi mở/đóng modal

        if (isEditing && currentInvoice) {
            // Trường hợp 1: CHỈNH SỬA
            const mappedValues = {
                ...currentInvoice,
                invoiceDate: currentInvoice.invoiceDate ? moment(currentInvoice.invoiceDate) : null,
                dueDate: currentInvoice.dueDate ? moment(currentInvoice.dueDate) : null,
                // ✅ Đảm bảo tên mảng là 'lines' (giống như trong form content)
                lines: addIteminLines(currentInvoice.lines)

            };
            console.log(mappedValues)
            form.setFieldsValue(mappedValues);

            // Nếu chỉnh sửa, ta sử dụng dòng hàng hóa đơn hiện tại làm source cho Table
            setPoLines(currentInvoice.lines.map(line => ({
                ...line,
                item: {
                    itemCode: line.itemCode,
                    itemId: line.itemId,
                    name: line.itemName
                },
                // Cần đảm bảo các trường hiển thị trong Table (itemCode, description, receivedQty) có sẵn
                // Nếu API trả về lines thiếu, bạn phải fetch hoặc xử lý mapping tại đây.
                receivedQty: line.receivedQty || line.quantity, // Giả định
            })));

        } else {
            // Trường hợp 2: TẠO MỚI (đặt các giá trị mặc định)
            form.setFieldsValue({
                invoiceDate: moment(),
                // Các giá trị mặc định khác
            });
        }
    }, [visible, isEditing, currentInvoice, form]);

    // --- 2. Hàm Tải Dòng PO khi PO được chọn ---
    const handleLoadPoLines = async (poId) => {
        // console.log(poId)
        if (!poId) return;

        try {
            // API trả về các dòng có thể lập hóa đơn
            const lines = await fetchPoLinesByPoId(poId);
            if (!lines) {
                notify.error("Đơn hàng không còn khoản thanh toán hợp lệ!")
                return
            }
            // 1. Cập nhật state để component con (Table) hiển thị các thông tin tĩnh (Mã hàng, SL đã nhận...)
            setPoLines(lines);
            // 2. ✅ SỬA LỖI ĐẶT GIÁ TRỊ MẶC ĐỊNH: 
            // Đặt các giá trị mặc định cho các trường form (InputNumber, Input ẩn)
            const defaultLineValues = lines.map(line => ({
                refLineId: line.id, // ID của dòng PO gốc
                itemId: line.itemId,
                // Đặt SL mặc định là maxInvoicableQty, đơn giá mặc định
                // receivedQuantity: line.receivedQuantity,
                quantity: line.maxInvoicableQty,
                unitPrice: line.unitPrice,
                taxRate: line.defaultTaxRate || 0.1, // Nếu có
            }));

            // ✅ BẮT BUỘC phải set tên trường là 'lines' để khớp với InvoiceFormContent.jsx
            form.setFieldsValue({ lines: defaultLineValues });

        } catch (error) {
            console.error(error)
            notify.error(error.message || 'Lỗi khi tải chi tiết PO và các dòng hàng.');
            setPoLines([]);
            // Quan trọng: reset các giá trị lines trong form nếu có lỗi
            form.setFieldsValue({ lines: [] });
        }
    };


    // --- 3. Xử lý sự kiện OK (Tạo/Cập nhật) ---
    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            // ✅ SỬA LỖI TRÍCH XUẤT DỮ LIỆU: Lấy dữ liệu từ trường 'lines'
            const submittedLines = values.lines.map(line => ({
                refLineId: line.refLineId,
                quantity: line.quantity,
                unitPrice: line.unitPrice,

                taxRate: line.taxRate,
                itemId: line.itemId,
            }));


            const dataToSend = {
                ...values,
                // Thêm các trường cần thiết khác (vd: taxRate, itemId)
                invoiceDate: values.invoiceDate ? values.invoiceDate.toISOString() : null,
                dueDate: values.dueDate ? values.dueDate.toISOString() : null,
                // Gán các dòng chi tiết đã trích xuất
                lines: submittedLines,

                // ✅ Loại bỏ trường 'lines' cũ khỏi root object để tránh trùng lặp
                // (Vì ta đã trích xuất và tạo lại mảng lines sạch sẽ ở trên)
                // Tuy nhiên, nếu bạn không muốn loại bỏ các trường khác không cần thiết,
                // bạn có thể xây dựng đối tượng dataToSend mới hoàn toàn.
            };

            setLoading(true);
            let response;

            if (isEditing) {
                response = await updateInvoice(currentInvoice.invoiceId, dataToSend); // Giả định ID là currentInvoice.id
                notify.success('Cập nhật Hóa đơn thành công.');
            } else {
                dataToSend.refType = 'PURCHASE';
                response = await createInvoice(dataToSend);
                notify.success('Tạo Hóa đơn thành công.');
            }

            setLoading(false);
            onSuccess(response); // Kích hoạt tải lại danh sách
            onCancel(); // Đóng Modal

        } catch (errorInfo) {
            setLoading(false);
            if (errorInfo.errorFields) {
                // Antd tự động hiển thị lỗi validation
            } else {
                notify.error(errorInfo.message || 'Thực hiện thất bại.');
            }
        }
    };

    return (
        <Modal
            title={isEditing ? "Chỉnh Sửa Hóa đơn Mua" : "Tạo Hóa đơn Mua Mới"}
            open={visible}
            onCancel={onCancel}
            onOk={handleOk}
            confirmLoading={loading}
            width={1000}
            style={{ top: 20 }}
            destroyOnHidden={true}
        >
            <InvoiceFormContent
                form={form}
                isEditing={isEditing}
                poLinesData={poLines}
                onLoadPoLines={handleLoadPoLines}
            />
        </Modal>
    );
};

export default InvoiceModal;