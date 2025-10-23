import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getVendorList, createVendor, updateVendor, deleteVendor } from '../api/vendorApi';
import { notify } from '../components/notify';

const VendorContext = createContext();

export const VendorProvider = ({ children }) => {
    const [allVendors, setAllVendors] = useState([]);
    const [loadingVendors, setLoadingVendors] = useState(false);
    const didFetch = useRef(false);
    const loadVendors = useCallback(async () => {
        setLoadingVendors(true);
        try {
            const data = await getVendorList();
            setAllVendors(data);
        } catch (error) {
            console.error('Load vendors error:', error);
            notify.error('Lỗi khi tải dữ liệu Nhà Cung Cấp.');
        }
        setLoadingVendors(false);
    }, []);

    useEffect(() => {
        if (!didFetch.current) {
            loadVendors();
            didFetch.current = true;
        }
    }, [loadVendors]);

    const createNewVendor = async (vendorData) => {
        try {
            const newVendor = await createVendor(vendorData); 

            setAllVendors(prevVendors => [...prevVendors, newVendor]);
            notify.success(`Thêm Nhà Cung Cấp thành công!`);
            return newVendor;
        } catch (error) {
            notify.error('Lỗi khi thêm Nhà Cung Cấp.');
            throw error;
        }
    };

    const updateExistingVendor = async (vendorId, vendorData) => {
        try {
            const updatedVendor = await updateVendor(vendorId, vendorData); // 1. Gọi API sửa

            setAllVendors(prevVendors =>
                prevVendors.map(vendor =>
                    (vendor.vendorId === vendorId ? updatedVendor : vendor)
                )
            );
            notify.success(`Cập nhật Nhà Cung Cấp thành công!`);
            return updatedVendor;
        } catch (error) {
            notify.error('Lỗi khi cập nhật Nhà Cung Cấp.');
            throw error;
        }
    };

    const deleteExistingVendor = async (vendorId) => {
        try {
            await deleteVendor(vendorId);

            setAllVendors(prevVendors =>
                prevVendors.filter(vendor => vendor.vendorId !== vendorId)
            );
            notify.success('Xóa Nhà Cung Cấp thành công.');
        } catch (error) {
            notify.error('Lỗi khi xóa Nhà Cung Cấp. Vui lòng kiểm tra ràng buộc dữ liệu.');
            throw error;
        }
    };

    const contextValue = {
        allVendors,
        loadingVendors,
        loadVendors,
        createNewVendor,
        updateExistingVendor,
        deleteExistingVendor
    };

    return (
        <VendorContext.Provider value={contextValue}>
            {children}
        </VendorContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useVendorContext = () => {
    const context = useContext(VendorContext);
    if (!context) {
        throw new Error('useVendorContext must be used within a VendorProvider');
    }
    return context;
};