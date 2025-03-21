// ChannelsPage.tsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useShops from '../hooks/useShops';
import { ArrowLeft } from 'lucide-react';
import NavigationBar from '../components/NavigationBar'; // Import NavigationBar

const ChannelsPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const shopId = searchParams.get('shopId');

    const { getShopById, shops } = useShops();
    const shop = getShopById(shopId!);

    if (!shop) {
        return <div>Shop not found. Shop ID: {shopId}</div>;
    }

    const predefinedChannels = [
        { id: 'facebook', name: 'Facebook Product Ads' },
        { id: 'google', name: 'Google' },
        { id: 'snapchat', name: 'Snapchat' },
        { id: 'tiktok', name: 'TikTok' },
    ];

    const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

    const handleChannelSelect = () => {
        if (selectedChannel) {
            navigate(`/channel-mapping/${selectedChannel}?shopId=${shopId}`);
        } else {
            toast.error("Please select a channel.");
        }
    };

    const handleRemap = (channelId: string) => {
        navigate(`/channel-mapping/${channelId}?shopId=${shopId}`);
    };

    const handleDownload = (channelId: string) => {
        toast.info(`Download XML for ${channelId}`);
    };

    const handleBackClick = () => {
        navigate('/');
    };

    // Dummy functions for NavigationBar props
    const setShowCommentsDialog = (show: boolean) => {
        console.log("setShowCommentsDialog:", show);
    };

    const setShowSettings = (show: boolean) => {
        console.log("setShowSettings:", show);
    };

    const onInternalFieldsClick = () => {
        console.log("onInternalFieldsClick");
        navigate('/');
    };

    return (
        <div className="flex min-h-screen min-w-screen">
            <NavigationBar
                selectedShopId={shopId}
                shops={shops}
                setShowCommentsDialog={setShowCommentsDialog}
                setShowSettings={setShowSettings}
                handleBackClick={handleBackClick}
                showSettings={false}
                onInternalFieldsClick={onInternalFieldsClick}
            />
            <div className="p-4">
                <ToastContainer />
                <button
                    onClick={handleBackClick}
                    className="flex items-center gap-2 px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Channels for Shop: {shop.name}</h1>
                </div>
                <h2 className="text-lg text-gray-600 mb-6">Shop ID: {shopId}</h2>

                <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4">Select a Channel</h3>
                    <select
                        value={selectedChannel || ''}
                        onChange={(e) => setSelectedChannel(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
                    >
                        <option value="">Select Channel</option>
                        {predefinedChannels.map((channel) => (
                            <option key={channel.id} value={channel.id}>
                                {channel.name}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={handleChannelSelect}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Map Channel
                    </button>
                </div>

                {shop.mappedChannels && shop.mappedChannels.length > 0 ? (
                    <div className="mt-8">
                        <h3 className="text-xl font-semibold mb-4">Previously Mapped Channels</h3>
                        <ul className="space-y-2">
                            {shop.mappedChannels.map((channelId) => {
                                const channel = predefinedChannels.find((c) => c.id === channelId);
                                return (
                                    channel && (
                                        <li
                                            key={channelId}
                                            className="p-4 border border-gray-200 rounded-md bg-white shadow-sm flex justify-between items-center"
                                        >
                                            <span>{channel.name}</span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleRemap(channelId)}
                                                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                                                >
                                                    Remap
                                                </button>
                                                <button
                                                    onClick={() => handleDownload(channelId)}
                                                    className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                                                >
                                                    Download
                                                </button>
                                            </div>
                                        </li>
                                    )
                                );
                            })}
                        </ul>
                    </div>
                ) : (
                    <div className="mt-8">
                        <p className="text-gray-500">No channels have been mapped yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChannelsPage;