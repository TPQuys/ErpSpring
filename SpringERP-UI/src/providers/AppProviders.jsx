import { VendorProvider } from '../context/VendorContext';
import { ItemProvider } from '../context/ItemContext';
import { AuthProvider } from '../context/AuthContext';

const AppProviders = ({ children }) => {
    return (
        <AuthProvider>
            <VendorProvider>
                <ItemProvider>
                    {children}
                </ItemProvider>
            </VendorProvider>
        </AuthProvider>
    );
};

export default AppProviders;