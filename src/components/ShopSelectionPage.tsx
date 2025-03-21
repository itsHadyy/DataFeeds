import React from 'react';
import ShopDashboard from './ShopDashboard';

interface ShopSelectionPageProps {
    onSelectShop: (shopId: string) => void;
}

const ShopSelectionPage: React.FC<ShopSelectionPageProps> = ({ onSelectShop }) => {
    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-center">
            <div className="p-8">
                <ShopDashboard onSelectShop={onSelectShop} />
            </div>
        </div>
    );
};

export default ShopSelectionPage;