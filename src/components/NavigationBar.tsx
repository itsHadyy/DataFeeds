import React from 'react';
import { ArrowLeft, List, MessageCircle, Settings } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGlobalUI } from '../contexts/GlobalUI';
import CommentsPanel from './CommentsPanel';

interface NavigationBarProps {
    selectedShopId?: string | null;
    shops: { id: string; name: string }[];
}

const NavigationBar: React.FC<NavigationBarProps> = ({
    selectedShopId,
    shops,
}) => {
    const navigate = useNavigate();
    const { shopId } = useParams<{ shopId: string }>();
    const { showComments, setShowComments } = useGlobalUI();

    const handleBackClick = () => {
        navigate('/');
    };

    const handleInternalFieldsClick = () => {
        if (selectedShopId) {
            navigate(`/shops/${selectedShopId}/mapping`);
        }
    };

    // Changed this function to use navigation instead of context
    const handleSettingsClick = () => {
        if (selectedShopId) {
            navigate(`/shops/${selectedShopId}/settings`);
        }
    };

    return (
        <>
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
                        onClick={handleInternalFieldsClick}
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
                    onClick={handleSettingsClick}  // Changed to use the new handler
                    className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md mb-2"
                >
                    <Settings className="h-5 w-5" />
                    Settings
                </button>
                <button
                    onClick={() => setShowComments(true)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                    <MessageCircle className="h-5 w-5" />
                    Comments
                </button>
            </div>

            {showComments && selectedShopId && (
                <CommentsPanel shopId={selectedShopId} />
            )}
        </>
    );
};

export default NavigationBar;