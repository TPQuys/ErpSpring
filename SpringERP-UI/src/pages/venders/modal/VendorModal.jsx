import React, { useEffect } from 'react';
import { Modal, Form, message } from 'antd';
import VendorFormContent from './VendorFormContent';
import { createVendor, updateVendor } from '../../../api/vendorApi'; 

const VendorModal = ({ visible, onCancel, onSuccess, vendorToEdit }) => {
    const [form] = Form.useForm();
    const isEditing = !!vendorToEdit;

    useEffect(() => {
        if (visible) {
            if (isEditing) {
                // Đặt giá trị form khi chỉnh sửa
                form.setFieldsValue(vendorToEdit);
            } else {
                // Reset form khi thêm mới
                form.resetFields();
            }
        }
    }, [visible, isEditing, vendorToEdit, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            
            if (isEditing) {
                // GỬI API CẬP NHẬT
                await updateVendor(vendorToEdit.vendorId, values);
                message.success('Cập nhật nhà cung cấp thành công!');
            } else {
                // GỬI API TẠO MỚI
                await createVendor(values);
                message.success('Thêm nhà cung cấp mới thành công!');
            }
            onSuccess();
        } catch (errorInfo) {
            console.log('Validation Failed or API Error:', errorInfo);
            message.error('Vui lòng kiểm tra lại thông tin form.');
        }
    };

    return (
        <Modal
            title={isEditing ? "Chỉnh Sửa Nhà Cung Cấp" : "Thêm Nhà Cung Cấp Mới"}
            open={visible}
            onCancel={onCancel}
            onOk={handleOk}
            width={800}
            destroyOnClose={true} // Tự động reset khi đóng
        >
            {/* Truyền form instance xuống VendorFormContent */}
            <VendorFormContent form={form} isEditing={isEditing} />
        </Modal>
    );
};

export default VendorModal;