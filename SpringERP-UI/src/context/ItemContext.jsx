import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { message } from 'antd';
import { addItem, deleteItem, getItemList, updateItem } from '../api/itemApi';
import { notify } from '../components/notify';

const ItemContext = createContext();


export const ItemProvider = ({ children }) => {
    const [allItems, setAllItems] = useState([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const didFetch = useRef(false);
    const loadItems = useCallback(async () => {
        setLoadingItems(true);
        try {
            const data = await getItemList();
            setAllItems(data);
        } catch (error) {
            console.error('Load items error:', error);
            notify.error('Lỗi khi tải dữ liệu Mặt Hàng.');
        }
        finally {
            setLoadingItems(false);
        }
    }, []);

    const addItems = useCallback(async (newItem) => {
        setLoadingItems(true);
        try {
            console.log('Adding item:', newItem);
            const data = await addItem(newItem);
            setAllItems(prev => [...prev, data]);
            message.success('Thêm Mặt Hàng thành công.');
        } catch (error) {
            console.error('Add item error:', error);
            notify.error('Lỗi khi thêm Mặt Hàng.');
            return new Error('Add item failed');
        } finally {
            setLoadingItems(false);
        }
    }, []);

    const updateItems = useCallback(async (id, updatedItem) => {
        setLoadingItems(true);
        console.log('Updating item:', updatedItem);
        try {
            const data = await updateItem(id, updatedItem);
            setAllItems(prev => prev.map(item =>
                item.itemId === data.itemId ? data : item
            ));
            message.success('Cập nhật Mặt Hàng thành công.');
        } catch (error) {
            console.error('Update item error:', error);
            notify.error('Lỗi khi cập nhật Mặt Hàng.');
            return new Error('Update item failed');
        } finally {
            setLoadingItems(false);
        }
    }, []);

    const deleteItems = useCallback(async (id) => {
        setLoadingItems(true);
        try {
            await deleteItem(id);
            setAllItems(prev => prev.filter(item => item.itemId !== id));
            message.success('Xóa Mặt Hàng thành công.');
        } catch (error) {
            console.error('Delete item error:', error);
            notify.error('Lỗi khi xóa Mặt Hàng.');
            return new Error('Delete item failed');
        } finally {
            setLoadingItems(false);
        }
    }, []);


    useEffect(() => {
        if (!didFetch.current) {
            loadItems();
            didFetch.current = true;
        }
    }, [loadItems]);

    const contextValue = {
        allItems,
        loadingItems,
        loadItems,
        updateItems,
        addItems,
        deleteItems
    };

    return (
        <ItemContext.Provider value={contextValue}>
            {children}
        </ItemContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useItemContext = () => {
    const context = useContext(ItemContext);
    if (!context) {
        throw new Error('useItemContext must be used within an ItemProvider');
    }
    return context;
};