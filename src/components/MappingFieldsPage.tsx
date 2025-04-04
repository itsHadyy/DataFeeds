
import React from 'react';
import { useParams } from 'react-router-dom';
import useShops from '../hooks/useShops';
import MappingField from './MappingField'; 
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MappingFieldsPage: React.FC = () => {
    const { shopId } = useParams<{ shopId: string }>(); 
    const { getShopById } = useShops();
    const shop = getShopById(shopId!);

    if (!shop) {
        return <div>Shop not found. Shop ID: {shopId}</div>;
    }

    
    
    
    const mappingFields = [
        { fieldName: 'title', fieldValue: 'Product Title', fieldOptions: [] },
        { fieldName: 'description', fieldValue: 'Product Description', fieldOptions: [] },
        
    ];

    const handleFieldChange = (field: any) => {
        
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