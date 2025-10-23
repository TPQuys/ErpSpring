import React, { useState } from 'react';
import { Modal, Form, Button } from 'antd';
import POForm from './POFormContent'; 
import { createPO, updatePO } from '../../../api/purchaseOrderApi';
import { notify } from '../../../components/notify';

const { useForm } = Form;

const POFormModal = ({ visible, onCancel, onSuccess, currentPO }) => {
    const [form] = useForm();
    const [loading, setLoading] = useState(false);
    const isEditing = !!currentPO?.poId;
    const modalTitle = isEditing ? `Chỉnh Sửa Đơn Hàng: ${currentPO?.poNumber}` : "Tạo Mới Đơn Hàng Mua";


    const handleOk = async (values) => {
        setLoading(true);
        try {
            const linesDto = values.lines.map(line => ({
                itemId: line.itemId,
                quantity: line.quantity,
                unitPrice: line.unitPrice,
                discountRate: line.discountRate,
                expectedDate: line.expectedDate ? line.expectedDate.format('YYYY-MM-DD') : null,
            }));

            const dto = {
                ...values,
                vendorId: values.vendorId,
                orderDate: values.orderDate.format('YYYY-MM-DD'),
                requiredDate: values.requiredDate ? values.requiredDate.format('YYYY-MM-DD') : null,
                lines: linesDto,
                createdById: 1,
            };

            if (isEditing) {
                await updatePO(currentPO.poId, dto);
                notify.success('Cập nhật PO thành công!');
                onSuccess();
            } else {
                await createPO(dto);
                notify.success('Tạo PO thành công!');
                onSuccess();
            }
        } catch (error) {
            console.error('Submit PO error:', error);
            notify.error(error.message || 'Lỗi khi lưu đơn hàng.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={modalTitle}
            open={visible}
            onCancel={onCancel}
            width={1200}
            destroyOnHidden={true}
            footer={[
                <Button key="back" onClick={onCancel} disabled={loading}>
                    Hủy
                </Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleOk}>
                    {isEditing ? 'Lưu Thay Đổi' : 'Tạo Mặt Hàng'}
                </Button>,
            ]}
        >
            <POForm
                form={form}
                currentPO={currentPO}
            />
        </Modal>
    );
};

export default POFormModal;