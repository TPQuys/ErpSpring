import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Card, Input, message, Layout } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { getVendorList, deleteVendor } from '../../api/vendorApi'; 
import { getVendorColumns } from './vendorListColumns';
import VendorModal from './modal/VendorModal';
import { notify } from '../../components/notify';
const { Content } = Layout;

const VendorListPage = () => {
    const [vendors, setVendors] = useState([]);
    const [allVendors, setAllVendors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [modalVisible, setModalVisible] = useState(false); 
    const [editingVendor, setEditingVendor] = useState(null);

    const loadVendors = async () => {
        setLoading(true);
        try {
            const data = await getVendorList();
            setVendors(data);
            setAllVendors(data);
        } catch (error) {
            console.error('Load vendors error:', error);
            message.error('Lỗi khi tải dữ liệu nhà cung cấp.');
        }
        setLoading(false);
    };

    useEffect(() => {
        loadVendors();
    }, []);

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
        if (window.confirm('Bạn có chắc chắn muốn xóa nhà cung cấp này?')) {
            try {
                await deleteVendor(vendorId);
                notify.success('Xóa nhà cung cấp thành công.');
                loadVendors(); 
            } catch (error) {
                console.error("Delete error: ", error);
                notify.error('Không thể xóa nhà cung cấp. Vui lòng thử lại.');
            }
        }
    };

    const columns = getVendorColumns(handleEdit, handleDelete);

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
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 'max-content' }}
                />
            </Card>
            <VendorModal
                visible={modalVisible}
                vendorToEdit={editingVendor}
                onCancel={() => setModalVisible(false)}
                onSuccess={() => {
                    setModalVisible(false);
                    loadVendors();
                }}
            />
        </Content>
    );
};

export default VendorListPage;