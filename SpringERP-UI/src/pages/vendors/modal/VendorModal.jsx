import React, { useEffect } from 'react';
import { Modal, Form } from 'antd';
import VendorFormContent from './VendorFormContent';

const VendorModal = ({ visible, onCancel, vendorToEdit, createVendor, updateVendor }) => {
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
            let response;
            if (isEditing) {
                response = await updateVendor(vendorToEdit.vendorId, values);
            } else {
                response = await createVendor(values);
            }
            if (response) {
                onCancel();
            }
        } catch (errorInfo) {
            console.log('Validation Failed or API Error:', errorInfo);
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