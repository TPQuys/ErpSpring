import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Card, Input, Tag, message, Layout } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { getItemList, deleteItem } from '../../api/itemApi';
import { getItemColumns } from './itemListColumns';
import ItemModal from './modal/ItemModal';
import { notify } from '../../components/notify';
const { Content } = Layout;


const ItemListPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [modalVisible, setModalVisible] = useState(false); 
    const [editingItem, setEditingItem] = useState(null);

    const loadItems = async () => {
        setLoading(true);
        try {
            const data = await getItemList();
            setItems(data);
        } catch (error) {
            console.log('Load items error:', error);
            message.error('Lỗi khi tải dữ liệu mặt hàng.');
        }
        setLoading(false);
    };

    useEffect(() => {
        loadItems();
    }, []);

    const handleSearch = (value) => {
        setSearchText(value);
        const filteredData = items.filter(item =>
            item.itemCode.toLowerCase().includes(value.toLowerCase()) ||
            item.itemName.toLowerCase().includes(value.toLowerCase())
        );
        setItems(filteredData);
    };

    const handleOpenModal = () => {
        setEditingItem(null); 
        setModalVisible(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item); 
        setModalVisible(true);
    };

    const handleDelete = async (itemId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa mặt hàng này?')) {
            try {
                await deleteItem(itemId);
                message.success('Xóa mặt hàng thành công.');
                loadItems(); 
            } catch (error) {
                console.error("Delete error: ", error)
                notify.error('Không thể xóa mặt hàng. Vui lòng thử lại.');
            }
            setItems(items.filter(item => item.itemId !== itemId));
            notify.success('Xóa mặt hàng thành công.');
        }
    };

    // Định nghĩa cột cho Ant Design Table
    const columns = getItemColumns(handleEdit, handleDelete);

    return (
        <Content style={{ padding: 24 }}>
            <Card
                title="Quản Lý Danh Mục Mặt Hàng"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleOpenModal}
                    >
                        Thêm Mặt Hàng Mới
                    </Button>
                }
            >
                <div style={{ marginBottom: 16 }}>
                    <Input
                        placeholder="Tìm kiếm theo Mã hoặc Tên mặt hàng"
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => handleSearch(e.target.value)}
                        style={{ width: 350 }}
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={items}
                    rowKey="itemId"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 'max-content' }}
                />
            </Card>
            <ItemModal
                visible={modalVisible}
                itemToEdit={editingItem}
                onCancel={() => setModalVisible(false)}
                onSuccess={loadItems}
            />
        </Content>
    );
};

export default ItemListPage;