import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Card, Input, Layout } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { getVendorColumns } from './vendorListColumns';
import { useVendorContext } from '../../context/VendorContext';
import VendorModal from './modal/VendorModal';
import { notify } from '../../components/notify';
const { Content } = Layout;

const VendorListPage = () => {
    const { allVendors, loadingVendors, deleteExistingVendor, createNewVendor, updateExistingVendor } = useVendorContext();
    const [vendors, setVendors] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [editingVendor, setEditingVendor] = useState(null);

    useEffect(() => {
        setVendors(allVendors);
    }, [allVendors]);

    const handleSearch = (value) => {
        setSearchText(value);
        const lowerCaseValue = value.toLowerCase();

        const filteredData = allVendors.filter(vendor => {
            const code = vendor.vendorCode || '';
            const name = vendor.name || '';
            const taxCode = vendor.taxCode || '';

            return (
                code.toLowerCase().includes(lowerCaseValue) ||
                name.toLowerCase().includes(lowerCaseValue) ||
                taxCode.toLowerCase().includes(lowerCaseValue)
            );
        });

        setVendors(filteredData);
    };

    const handleOpenModal = () => {
        setEditingVendor(null);
        setModalVisible(true);
    };

    const handleEdit = (vendor) => {
        setEditingVendor(vendor);
        setModalVisible(true);
    };

    const handleDelete = async (vendorId) => {
        try {
            await deleteExistingVendor(vendorId);
        } catch (error) {
            console.error("Delete error: ", error);
        }
    };
    const handleOpenConfirm = (vendor) => {
        notify.modal.confirm({
            title: 'Xác nhận xóa',
            content: `Bạn có chắc chắn muốn xóa nhà cung cấp "${vendor.vendorCode}" không?`,
            onOk: () => handleDelete(vendor.vendorId),
        });
    }

    const columns = getVendorColumns(handleEdit, handleOpenConfirm);

    return (
        <Content style={{ padding: 20 }}>
            <Card
                title="Quản Lý Danh Mục Nhà Cung Cấp"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleOpenModal}
                    >
                        Thêm Nhà Cung Cấp
                    </Button>
                }
            >
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                    <Input
                        placeholder="Tìm kiếm theo Mã, Tên hoặc Mã số thuế"
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => handleSearch(e.target.value)}
                        style={{ width: 400 }}
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={vendors}
                    rowKey="vendorId"
                    loading={loadingVendors}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 'max-content' }}
                />
            </Card>
            <VendorModal
                visible={modalVisible}
                vendorToEdit={editingVendor}
                createVendor={createNewVendor}
                updateVendor={updateExistingVendor}
                onCancel={() => setModalVisible(false)}
            />
        </Content>
    );
};

export default VendorListPage;