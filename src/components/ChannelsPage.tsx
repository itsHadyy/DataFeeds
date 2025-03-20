// ChannelsPage.tsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useShops from '../hooks/useShops';

const ChannelsPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const shopId = searchParams.get('shopId');

    const { getShopById } = useShops();
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

    return (
        <div className="p-4">
            <ToastContainer />
            <h1 className="text-2xl font-bold mb-4">Channels for Shop: {shop.name}</h1>
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
                                        className="p-4 border border-gray-200 rounded-md bg-white shadow-sm"
                                    >
                                        {channel.name}
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
    );
};

export default ChannelsPage;