import React, { useState, useEffect } from 'react';
import { Button, Modal, Space, Form } from 'antd';
import ItemFormContent from './ItemFormContent';

const ItemModal = ({ visible, onCancel, itemToEdit, addItem, updateItem }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const isEditing = !!itemToEdit && !!itemToEdit.itemId;

    useEffect(() => {
        if (visible) {
            form.resetFields();
            if (isEditing) {
                setLoading(true);
                form.setFieldsValue(itemToEdit);
                setLoading(false);
            }
        }
    }, [visible, isEditing, itemToEdit, form]);

    const handleOk = async () => {
        const values = await form.validateFields();
        let result;
        setLoading(true);
        if (isEditing) {
            result = await updateItem(itemToEdit.itemId, values);

        } else {
            result = await addItem(values);
        }
        if (!result) {
            setLoading(false);
            return;
        }
        onCancel();
        setLoading(false);
    };

    return (
        <Modal
            title={isEditing ? "Chỉnh Sửa Mặt Hàng" : "Tạo Mới Mặt Hàng"}
            open={visible}
            onCancel={onCancel}
            maskClosable={false}
            destroyOnHidden={true}
            width={800}
            footer={[
                <Button key="back" onClick={onCancel} disabled={loading}>
                    Hủy
                </Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleOk}>
                    {isEditing ? 'Lưu Thay Đổi' : 'Tạo Mặt Hàng'}
                </Button>,
            ]}
        >
            <ItemFormContent form={form} isEditing={isEditing} />
        </Modal>
    );
};

export default ItemModal;