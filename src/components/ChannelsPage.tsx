import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useShops from '../hooks/useShops';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NavigationBar from '../components/NavigationBar';

const ChannelsPage = () => {
    const { shopId } = useParams<{ shopId: string }>();
    const { shops, addChannel } = useShops();
    const navigate = useNavigate();
    const [newChannelName, setNewChannelName] = useState('');
    const [selectedChannelId, setSelectedChannelId] = useState('');
    const [showCommentsDialog, setShowCommentsDialog] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    console.log('shopId:', shopId); // Debugging: Check if shopId is defined
    console.log('shops:', shops); // Debugging: Check if shops is populated

    const selectedShop = shops.find((shop) => shop.id === shopId);

    const handleCreateChannel = () => {
        if (newChannelName.trim() && shopId) {
            addChannel(shopId, newChannelName);
            setNewChannelName('');
            toast.success('Channel created successfully!', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } else {
            toast.error('Please enter a valid channel name.', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    };

    const handleSelectChannel = (channelId: string) => {
        setSelectedChannelId(channelId);
    };

    const handleProceed = () => {
        if (selectedChannelId) {
            navigate(`/channel-mapping/${shopId}/${selectedChannelId}`);
        } else {
            toast.error('Please select or create a channel before proceeding.', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    };

    const handleBackClick = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Navigation Bar */}
            {shopId && (
                <NavigationBar
                    selectedShopId={shopId}
                    shops={shops}
                    setShowCommentsDialog={setShowCommentsDialog}
                    setShowSettings={setShowSettings}
                    handleBackClick={handleBackClick}
                    showSettings={showSettings}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-y-auto">
                <h1 className="text-2xl font-semibold mb-4">Channels</h1>

                {/* Dropdown to select existing channels */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Select a Channel</h2>
                    <select
                        value={selectedChannelId}
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

                {/* Form to create a new channel */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
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

                {/* Proceed button */}
                <button
                    onClick={handleProceed}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                    Proceed
                </button>
            </div>
        </div>
    );
};

export default ChannelsPage;