import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useShops from '../hooks/useShops';
import { ArrowLeft, Settings, Plus } from 'lucide-react';
import NavigationBar from '../components/NavigationBar';

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
        { id: 'facebook', name: 'Facebook Product Ads', type: 'Facebook Product Ads' },
        { id: 'google', name: 'Google Shopping', type: 'Google Shopping' },
        { id: 'snapchat', name: 'Snapchat', type: 'Snapchat' },
        { id: 'tiktok', name: 'TikTok', type: 'TikTok' },
    ];

    const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

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

    // Filter channels based on search term
    const filteredChannels = shop.mappedChannels?.filter(channelId => {
        const channel = predefinedChannels.find(c => c.id === channelId);
        return channel?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            channel?.type.toLowerCase().includes(searchTerm.toLowerCase());
    }) || [];

    return (
        <div className="flex min-h-screen min-w-screen bg-gray-50">
            <NavigationBar
                selectedShopId={shopId}
                shops={shops}
                setShowCommentsDialog={setShowCommentsDialog}
                setShowSettings={setShowSettings}
                handleBackClick={handleBackClick}
                showSettings={false}
                onInternalFieldsClick={onInternalFieldsClick}
            />
            <div className="p-6 w-full">
                <ToastContainer />

                {/* Add New Channel Section */}
                <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Add New Channel</h3>
                    <div className="flex gap-4 items-center">
                        <select
                            value={selectedChannel || ''}
                            onChange={(e) => setSelectedChannel(e.target.value)}
                            className="flex-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
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
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Create Channel
                        </button>
                    </div>
                </div>

                {/* Header Section */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Channels</h1>
                        <p className="text-sm text-gray-500">Manage your product feeds for different channels</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name or ID"
                            className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute left-3 top-2.5 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Channels Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel Type</th>

                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Update</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Options</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredChannels.length > 0 ? (
                                filteredChannels.map((channelId) => {
                                    const channel = predefinedChannels.find(c => c.id === channelId);
                                    return channel ? (
                                        <tr key={channelId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{channelId}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {channel.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{channel.type}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">10 hours ago</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    @ Channel OK
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleRemap(channelId)}
                                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                                >
                                                    Edit Channel
                                                </button>
                                            </td>
                                        </tr>
                                    ) : null;
                                })
                            ) : (
                                <tr>
                                    <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">
                                        No channels found. Create your first channel.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ChannelsPage;