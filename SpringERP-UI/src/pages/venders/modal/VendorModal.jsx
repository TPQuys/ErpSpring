import React, { useEffect } from 'react';
import { Modal, Form, message } from 'antd';
import VendorFormContent from './VendorFormContent';

const VendorModal = ({ visible, onCancel, onSuccess, vendorToEdit, createVendor, updateVendor }) => {
    const [form] = Form.useForm();
    const isEditing = !!vendorToEdit;

    useEffect(() => {
        if (visible) {
            if (isEditing) {
                form.setFieldsValue(vendorToEdit);
            } else {
                form.resetFields();
            }
        }
    }, [visible, isEditing, vendorToEdit, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            
            if (isEditing) {
                await updateVendor(vendorToEdit.vendorId, values);
                message.success('Cập nhật nhà cung cấp thành công!');
            } else {
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
            destroyOnHidden={true} // Tự động reset khi đóng
        >
            {/* Truyền form instance xuống VendorFormContent */}
            <VendorFormContent form={form} isEditing={isEditing} />
        </Modal>
    );
};

export default VendorModal;