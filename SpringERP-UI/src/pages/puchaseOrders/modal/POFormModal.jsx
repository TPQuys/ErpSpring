import React, { useState } from 'react';
import { Modal, Form, Button } from 'antd';
import POForm from './POFormContent'; 
import { createPO, updatePO } from '../../../api/purchaseOrderApi';
import { notify } from '../../../components/notify';
import { useAuth } from '../../../context/AuthContext';
// import moment from 'moment'; 

const { useForm } = Form;

const POFormModal = ({ visible, onCancel, onSuccess, currentPO }) => {
    const { userId } = useAuth();
    const [form] = useForm();
    const [loading, setLoading] = useState(false);
    const isEditing = !!currentPO?.poId;
    const modalTitle = isEditing ? `Chỉnh Sửa Đơn Hàng: ${currentPO?.poNumber}` : "Tạo Mới Đơn Hàng Mua";

    const handleOk = async () => {
        try {
            const values = await form.validateFields(); 
            
            setLoading(true);
            const safeLines = values.lines || []; 
            
            const linesDto = safeLines.map(line => ({
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
                createdById: userId
            };

            if (isEditing) {
                await updatePO(currentPO.poId, dto);
                notify.success('Cập nhật PO thành công! ');
                onSuccess();
            } else {
                await createPO(dto);
                notify.success('Tạo PO thành công! ');
                onSuccess();
            }
            onCancel();
        } catch (error) {
            if (error.errorFields) {
                notify.error('Vui lòng điền đầy đủ và chính xác các trường bắt buộc.');
            } else {
                console.error('Submit PO error:', error);
                notify.error(error.message || 'Lỗi khi lưu đơn hàng.');
            }
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
                    {/* onClick gọi hàm handleOk đã sửa */}
                    {isEditing ? 'Lưu Thay Đổi' : 'Tạo Đơn Hàng'}
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