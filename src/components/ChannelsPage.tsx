import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NavigationBar from '../components/NavigationBar';
import useShops from '../hooks/useShops';

// Define types for channel schemas
interface ChannelSchemaField {
    id: string;
    name: string;
    required: boolean;
}

interface ChannelSchemas {
    [key: string]: ChannelSchemaField[];
}

// Define channel-specific schemas
const channelSchemas: ChannelSchemas = {
    facebook: [
        { id: 'title', name: 'Title', required: true },
        { id: 'description', name: 'Description', required: true },
        { id: 'price', name: 'Price', required: true },
        { id: 'image_link', name: 'Image Link', required: true },
    ],
    google: [
        { id: 'id', name: 'ID', required: true },
        { id: 'title', name: 'Title', required: true },
        { id: 'price', name: 'Price', required: true },
        { id: 'availability', name: 'Availability', required: true },
    ],
    snapchat: [
        { id: 'item_name', name: 'Item Name', required: true },
        { id: 'item_price', name: 'Item Price', required: true },
        { id: 'item_image_url', name: 'Item Image URL', required: true },
    ],
    tiktok: [
        { id: 'product_id', name: 'Product ID', required: true },
        { id: 'product_name', name: 'Product Name', required: true },
        { id: 'product_price', name: 'Product Price', required: true },
        { id: 'product_image', name: 'Product Image', required: true },
    ],
};

const ChannelsPage = () => {
    const { shopId } = useParams<{ shopId: string }>();
    const { shops, addChannel, updateShop } = useShops();
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
    const allChannels = [...basicChannels, ...(selectedShop?.channels || [])];

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
        if (selectedShop) {
            const updatedShop = {
                ...selectedShop,
                selectedChannelId: channelId, // Save the selected channel ID to the shop
            };
            updateShop(updatedShop); // Update the shop in the state
            setSelectedChannelId(channelId); // Update local state
        }
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

    // Get the schema for the selected channel
    const selectedChannelSchema: ChannelSchemaField[] = selectedChannelId
        ? channelSchemas[selectedChannelId as keyof typeof channelSchemas]
        : [];

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

                {/* Display Channel Schema */}
                {selectedChannelSchema.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <h2 className="text-lg font-semibold mb-4">Channel Schema</h2>
                        <div className="space-y-4">
                            {selectedChannelSchema.map((field) => (
                                <div key={field.id} className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">
                                        {field.name} {field.required && <span className="text-red-500">*</span>}
                                    </span>
                                    <button
                                        onClick={() => console.log('Add mapping for:', field.id)}
                                        className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                                    >
                                        Add Mapping
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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
                    className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 ${!selectedChannelId ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                >
                    Proceed
                </button>
            </div>
        </div>
    );
};

export default ChannelsPage;