// MappingFieldsPage.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import useShops from '../hooks/useShops';
import MappingField from './MappingField'; // Assuming you have MappingField component
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MappingFieldsPage: React.FC = () => {
    const { shopId } = useParams<{ shopId: string }>(); // Get shopId from URL params
    const { getShopById } = useShops();
    const shop = getShopById(shopId!);

    if (!shop) {
        return <div>Shop not found. Shop ID: {shopId}</div>;
    }

    // Assuming you have mappingFields and setMappingFields state/functions in App.tsx
    // You'll need to pass them as props or use context/hooks to manage them here.
    // For now, let's use dummy data:
    const mappingFields = [
        { fieldName: 'title', fieldValue: 'Product Title', fieldOptions: [] },
        { fieldName: 'description', fieldValue: 'Product Description', fieldOptions: [] },
        // ... other fields
    ];

    const handleFieldChange = (field: any) => {
        // Handle field change logic here
        console.log('Field changed:', field);
    };

    return (
        <div className="p-4">
            <ToastContainer />
            <h1 className="text-2xl font-bold mb-4">Mapping Fields for Shop: {shop.name}</h1>
            <h2 className="text-lg text-gray-600 mb-6">Shop ID: {shopId}</h2>

            {mappingFields.map((field) => (
                <MappingField
                    key={field.fieldName}
                    {...field}
                    onFieldChange={handleFieldChange}
                    onPreviewClick={() => { }}
                    onCommentClick={() => { }}
                    onABTestClick={() => { }}
                    onEditClick={() => { }}
                />
            ))}
        </div>
    );
};

export default MappingFieldsPage;