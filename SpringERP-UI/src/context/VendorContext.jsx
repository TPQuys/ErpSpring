import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getVendorList, createVendor, updateVendor, deleteVendor } from '../api/vendorApi';
import { notify } from '../components/notify';
import { useAuth } from './AuthContext';
const VendorContext = createContext();

export const VendorProvider = ({ children }) => {
    const [allVendors, setAllVendors] = useState([]);
    const [loadingVendors, setLoadingVendors] = useState(false);
    const { token } = useAuth();
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
        if (token) {
            if (!didFetch.current) {
                loadVendors();
                didFetch.current = true;
            }
        }
    }, [loadVendors, token]);

    const createNewVendor = async (vendorData) => {
        setLoadingVendors(true);
        try {
            const newVendor = await createVendor(vendorData);
            setAllVendors(prevVendors => [...prevVendors, newVendor]);
            notify.success(`Thêm Nhà Cung Cấp thành công!`);
            return newVendor;
        } catch (error) {
            console.error('Lỗi thêm nhà cung cấp:', error);
            const errorMessage = error.message || 'Lỗi không xác định khi thêm nhà cung cấp.';
            notify.error(errorMessage);
        }
        finally {
            setLoadingVendors(false);
        }
    };

    const updateExistingVendor = async (vendorId, vendorData) => {
        setLoadingVendors(true);
        try {
            const updatedVendor = await updateVendor(vendorId, vendorData);

            setAllVendors(prevVendors =>
                prevVendors.map(vendor =>
                    (vendor.vendorId === vendorId ? updatedVendor : vendor)
                )
            );
            notify.success(`Cập nhật Nhà Cung Cấp thành công!`);
            return updatedVendor;
        } catch (error) {
            console.error('Lỗi cập nhập nhà cung cấp:', error);
            const errorMessage = error.message || 'Lỗi không xác định khi cập nhập nhà cung cấp.';
            notify.error(errorMessage);
        }
        finally {
            setLoadingVendors(false);
        }
    };

    const deleteExistingVendor = async (vendorId) => {
        setLoadingVendors(true);
        try {
            await deleteVendor(vendorId);

            setAllVendors(prevVendors =>
                prevVendors.filter(vendor => vendor.vendorId !== vendorId)
            );
            notify.success('Xóa Nhà Cung Cấp thành công.');
        } catch (error) {
            console.error('Lỗi xóa nhà cung cấp:', error);
            const errorMessage = error.message || 'Lỗi không xác định khi xóa nhà cung cấp.';
            notify.error(errorMessage);
        }
        finally {
            setLoadingVendors(false);
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