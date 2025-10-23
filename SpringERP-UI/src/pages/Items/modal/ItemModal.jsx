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
        try {
            const values = await form.validateFields();
            setLoading(true);

            if (isEditing) {
                await updateItem(itemToEdit.itemId, values); 
            } else {
                await addItem(values);
            }
            onCancel(); 

        } catch (error) {
            console.error('Save item error:', error);
        } finally {
            setLoading(false);
        }
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