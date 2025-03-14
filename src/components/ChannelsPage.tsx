import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NavigationBar from '../components/NavigationBar';
import useShops from '../hooks/useShops';

const ChannelsPage = () => {
    const { shopId } = useParams<{ shopId: string }>();
    const { shops, addChannel } = useShops();
    const navigate = useNavigate();
    const [newChannelName, setNewChannelName] = useState('');
    const [selectedChannelId, setSelectedChannelId] = useState('');
    const [showCommentsDialog, setShowCommentsDialog] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const selectedShop = shops.find((shop) => shop.id === shopId);

    // Predefined basic channels
    const basicChannels = [
        { id: 'facebook', name: 'Facebook Ads' },
        { id: 'google', name: 'Google Ads' },
        { id: 'snapchat', name: 'Snapchat' },
        { id: 'tiktok', name: 'TikTok' },
    ];

    // Combine basic channels and custom channels
    const allChannels = [
        ...basicChannels,
        ...(selectedShop?.channels || []),
    ];

    // Handle creating a new channel
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

    // Handle selecting a channel
    const handleSelectChannel = (channelId: string) => {
        setSelectedChannelId(channelId);
    };

    // Handle proceeding to the next step
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

    // Handle back navigation
    const handleBackClick = () => {
        navigate(-1);
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

                {/* Dropdown to select a channel */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Select a Channel</h2>
                    <select
                        value={selectedChannelId}
                        onChange={(e) => handleSelectChannel(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select a channel</option>
                        {allChannels.map((channel) => (
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
                        className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleCreateChannel}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Create Channel
                    </button>
                </div>

                {/* Proceed button */}
                <button
                    onClick={handleProceed}
                    disabled={!selectedChannelId}
                    className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        !selectedChannelId ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                    Proceed
                </button>
            </div>
        </div>
    );
};

export default ChannelsPage;