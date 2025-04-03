import React from 'react';
import { ArrowLeft, List, MessageCircle, Settings } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
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
    const location = useLocation();
    const { shopId } = useParams<{ shopId: string }>();
    const {
        showComments,
        setShowComments,
        activeCommentField,
        setActiveCommentField
    } = useGlobalUI();

    const isActiveTab = (path: string) => {
        if (path === 'channels') {
            return location.pathname.includes('channels') ||
                location.pathname.includes('channel-mapping');
        }
        if (path === 'mapping') {
            return location.pathname === `/shops/${shopId}/mapping`;
        }
        return location.pathname.includes(path);
    };


    const handleBackClick = () => {
        navigate('/');
    };

    const handleInternalFieldsClick = () => {
        if (selectedShopId) {
            navigate(`/shops/${selectedShopId}/mapping`);
        }
    };

    const handleSettingsClick = () => {
        if (selectedShopId) {
            navigate(`/shops/${selectedShopId}/settings`);
        }
    };

    const handleCommentsClick = () => {

        if (!showComments && activeCommentField) {
            setActiveCommentField(null);
        }
        setShowComments(!showComments);
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
                    className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 rounded-md hover:bg-[#D7D3E0] transition-colors mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Shops
                </button>

                {selectedShopId && (
                    <button
                        onClick={handleInternalFieldsClick}
                        className={`w-full flex items-center gap-2 px-4 py-2 rounded-md transition-colors mb-4 ${isActiveTab('mapping')
                            ? 'bg-[#301D56] text-white hover:bg-[#3a2468]'
                            : 'text-gray-700 hover:bg-[#D7D3E0]'
                            }`}
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
                    className={`w-full flex items-center gap-2 px-4 py-2 rounded-md transition-colors mb-4 ${isActiveTab('channels')
                        ? 'bg-[#301D56] text-white hover:bg-[#3a2468]'
                        : 'text-gray-700 hover:bg-[#D7D3E0]'
                        }`}
                >
                    <List className="h-4 w-4" />
                    Channels
                </button>
                <button
                    onClick={handleSettingsClick}
                    className={`w-full flex items-center gap-2 px-4 py-2 rounded-md mb-2 ${isActiveTab('settings')
                        ? 'bg-[#301D56]/10 text-[#301D56] hover:bg-[#301D56]/20'
                        : 'text-gray-700 hover:bg-[#D7D3E0]'
                        }`}
                >
                    <Settings className="h-5 w-5" />
                    Settings
                </button>
                <button
                    onClick={handleCommentsClick}
                    className={`w-full flex items-center gap-2 px-4 py-2 rounded-md ${showComments && !activeCommentField
                        ? 'bg-[#301D56]/10 text-[#301D56] hover:bg-[#301D56]/20'
                        : 'text-gray-700 hover:bg-[#D7D3E0]'
                        }`}
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