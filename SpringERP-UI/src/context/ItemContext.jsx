import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { addItem, deleteItem, getItemList, updateItem } from '../api/itemApi';
import { notify } from '../components/notify';
import { useAuth } from './AuthContext';
const ItemContext = createContext();


export const ItemProvider = ({ children }) => {
    const [allItems, setAllItems] = useState([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const didFetch = useRef(false);
    const { token } = useAuth();
    const loadItems = useCallback(async () => {
        try {
            const data = await getItemList();
            setAllItems(data);
        } catch (error) {
            console.error('Load items error:', error);
            const errorMessage = error.message || 'Lỗi không xác định khi tải Mặt Hàng.';
            notify.error(errorMessage);
        }
        finally {
            setLoadingItems(false);
        }
    }, []);
    useEffect(() => {
        if (token) {
            if (!didFetch.current) {
                loadItems();
                didFetch.current = true;
            }
        }
    }, [loadItems, token]);


    const addItems = useCallback(async (newItem) => {
        setLoadingItems(true);
        try {
            console.log('Adding item:', newItem);
            const data = await addItem(newItem);
            setAllItems(prev => [...prev, data]);
            notify.success('Thêm Mặt Hàng thành công.');
            return data;
        } catch (error) {
            console.error('Add item error:', error);
            const errorMessage = error.message || 'Lỗi không xác định khi thêm Mặt Hàng.';
            notify.error(errorMessage);
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
            notify.success('Cập nhật Mặt Hàng thành công.');
            return data;
        } catch (error) {
            console.error('Add item error:', error);
            const errorMessage = error.message || 'Lỗi không xác định khi cập nhật Mặt Hàng.';
            notify.error(errorMessage);
        } finally {
            setLoadingItems(false);
        }
    }, []);

    const deleteItems = useCallback(async (id) => {
        setLoadingItems(true);
        try {
            await deleteItem(id);
            setAllItems(prev => prev.filter(item => item.itemId !== id));
            notify.success('Xóa Mặt Hàng thành công.');
        } catch (error) {
            console.error('Add item error:', error);
            const errorMessage = error.message || 'Lỗi không xác định khi xóa Mặt Hàng.';
            notify.error(errorMessage);
        } finally {
            setLoadingItems(false);
        }
    }, []);



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