import React from 'react';
import { useParams } from 'react-router-dom';
import useShops from '../hooks/useShops';

const ChannelMappingPage = () => {
    const { shopId, channelId } = useParams<{ shopId: string; channelId: string }>();
    const { shops } = useShops();

    const selectedShop = shops.find((shop) => shop.id === shopId);
    const selectedChannel = selectedShop?.channels?.find((channel) => channel.id === channelId);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-semibold mb-4">Channel Mapping</h1>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold mb-4">
                    Mapping Fields for Channel: {selectedChannel?.name}
                </h2>
                {/* Add mapping fields logic here */}
                <p className="text-gray-500">Mapping fields will be displayed here.</p>
            </div>
        </div>
    );
};

export default ChannelMappingPage;