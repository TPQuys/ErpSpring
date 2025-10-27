import React, { useState, useRef, useEffect } from 'react';
import { Table, Button, Space, Card, Input, Tag, Layout } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { getItemColumns } from './itemListColumns';
import ItemModal from './modal/ItemModal';
import { notify } from '../../components/notify';
import { useItemContext } from '../../context/ItemContext';
const { Content } = Layout;
const ItemListPage = () => {
    const { allItems, loadingItems, updateItems, addItems, deleteItems } = useItemContext();
    const [items, setItems] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const debounceTimeout = useRef(null);

    useEffect(() => {
        setItems(allItems);
    }, [allItems]);

    const handleSearch = (value) => {
        setSearchText(value);

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(() => {
            if (value === '') {
                setItems(allItems);
            } else {
                const filteredData = allItems.filter(item =>
                    item.itemCode.toLowerCase().includes(value.toLowerCase()) ||
                    item.name.toLowerCase().includes(value.toLowerCase())
                );
                setItems(filteredData);
            }
        }, 150);
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
        try {
            await deleteItems(itemId);
            notify.success('Xóa mặt hàng thành công.');
        } catch (error) {
            console.error("Delete error: ", error)
        }
    }

    const handleOpenConfirm = async (item) => {
        notify.modal.confirm({
            title: 'Xác nhận xóa?',
            content: `Bạn có chắc chắn muốn xóa mặt hàng "${item.itemCode}" không?`,
            onOk: () => handleDelete(item.itemId),
        });
    }
    const columns = getItemColumns(handleEdit, handleOpenConfirm);
    return (
        <Content style={{ padding: 20 }}>
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
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
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
                    loading={loadingItems}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 'max-content' }}
                />
            </Card>
            <ItemModal
                visible={modalVisible}
                itemToEdit={editingItem}
                onCancel={() => setModalVisible(false)}
                addItem={addItems}
                updateItem={updateItems}
            />
        </Content>
    );
};

export default ItemListPage;