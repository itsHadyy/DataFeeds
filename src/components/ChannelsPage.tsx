import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useShops from '../hooks/useShops';

const ChannelsPage = () => {
    const { shopId } = useParams<{ shopId: string }>();
    const { shops, addChannel } = useShops();
    const navigate = useNavigate();
    const [newChannelName, setNewChannelName] = useState('');

    const selectedShop = shops.find((shop) => shop.id === shopId);

    const handleCreateChannel = () => {
        if (newChannelName.trim() && shopId) {
            addChannel(shopId, newChannelName);
            setNewChannelName('');
        }
    };

    const handleSelectChannel = (channelId: string) => {
        navigate(`/channel-mapping/${shopId}/${channelId}`);
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-semibold mb-4">Channels</h1>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold mb-4">Create New Channel</h2>
                <input
                    type="text"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    placeholder="Enter channel name (e.g., Facebook Ads)"
                    className="w-full p-2 border border-gray-300 rounded-md mb-4"
                />
                <button
                    onClick={handleCreateChannel}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Create Channel
                </button>
            </div>

            {/* Dropdown to select existing channels */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold mb-4">Select a Channel</h2>
                <select
                    onChange={(e) => handleSelectChannel(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                >
                    <option value="">Select a channel</option>
                    {selectedShop?.channels?.map((channel) => (
                        <option key={channel.id} value={channel.id}>
                            {channel.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default ChannelsPage;