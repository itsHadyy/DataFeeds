// NavigationBar.tsx
import React from 'react';
import { ArrowLeft, List, MessageCircle, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NavigationBarProps {
    selectedShopId: string | null;
    shops: { id: string; name: string }[];
    setShowCommentsDialog: (show: boolean) => void;
    setShowSettings: (show: boolean) => void;
    handleBackClick: () => void;
    showSettings: boolean;
    onInternalFieldsClick: () => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
    selectedShopId,
    shops,
    setShowCommentsDialog,
    setShowSettings,
    handleBackClick,
    showSettings,
    onInternalFieldsClick,
}) => {
    const navigate = useNavigate();

    return (
        <div className="w-64 bg-white shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4">
                {shops.find((shop) => shop.id === selectedShopId)?.name}
                <p className="text-sm text-gray-500 font-light">Shop ID: <b>{selectedShopId}</b></p>
            </h2>
            <button
                onClick={handleBackClick}
                className="w-full flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors mb-4"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Shops
            </button>

            {selectedShopId && (
                <button
                    onClick={onInternalFieldsClick} // Call the callback function
                    className="w-full flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors mb-4"
                >
                    <List className="h-4 w-4" />
                    Internal Fields
                </button>
            )}
            <button
                onClick={() => {
                    if (selectedShopId) {
                        navigate(`/channels?shopId=${selectedShopId}`);
                    } else {
                        navigate('/channels');
                    }
                }}
                className="w-full flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors mb-4"
            >
                <List className="h-4 w-4" />
                Channels
            </button>
            <button
                onClick={() => setShowCommentsDialog(true)}
                className="w-full flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors mb-4"
            >
                <MessageCircle className="h-4 w-4" />
                Comments
            </button>
            <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-full flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mb-4"
            >
                <Settings className="h-4 w-4" />
                Shop Settings
            </button>
        </div>
    );
};

export default NavigationBar;