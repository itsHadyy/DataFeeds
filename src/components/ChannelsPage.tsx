import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useShops from '../hooks/useShops';

import NavigationBar from '../components/NavigationBar';

const ChannelsPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const shopId = searchParams.get('shopId');

    const { getShopById, shops, removeChannel } = useShops();
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
    const [isDeleting, setIsDeleting] = useState(false);
    const [channelToDelete, setChannelToDelete] = useState<string | null>(null);

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

    const handleDeleteChannel = (channelId: string) => {
        setChannelToDelete(channelId);
    };

    const confirmDeleteChannel = async () => {
        if (!channelToDelete || !shopId) return;

        setIsDeleting(true);
        try {

            removeChannel(shopId, channelToDelete);
            toast.success(`Channel ${channelToDelete} deleted successfully`);
        } catch (error) {
            toast.error(`Failed to delete channel: ${error}`);
        } finally {
            setIsDeleting(false);
            setChannelToDelete(null);
        }
    };

    const cancelDeleteChannel = () => {
        setChannelToDelete(null);
    };


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
            />
            <div className="p-6 w-full">
                <ToastContainer />

                {/* Delete Confirmation Modal */}
                {channelToDelete && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg max-w-md w-full">
                            <h3 className="text-lg font-semibold mb-4">Delete Channel</h3>
                            <p className="mb-6">
                                Are you sure you want to delete the {channelToDelete} channel?
                                This will remove all mapping configurations for this channel.
                            </p>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={cancelDeleteChannel}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDeleteChannel}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add New Channel Section */}
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Add New Channel</h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {predefinedChannels.length} options
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <select
                                value={selectedChannel || ''}
                                onChange={(e) => setSelectedChannel(e.target.value)}
                                className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                            >
                                <option value="" disabled>Select a channel...</option>
                                {predefinedChannels.map((channel) => (
                                    <option key={channel.id} value={channel.id} className="py-2">
                                        {channel.name} ({channel.type})
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>

                        <button
                            onClick={handleChannelSelect}
                            disabled={!selectedChannel}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Create Channel
                        </button>
                    </div>

                    {selectedChannel && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700 flex items-start gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span>You've selected: <span className="font-medium">{predefinedChannels.find(c => c.id === selectedChannel)?.name}</span></span>
                        </div>
                    )}
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
                                        <tr
                                            key={channelId}
                                            className="hover:bg-gray-50 group relative"
                                            onClick={(e) => {

                                                if (!(e.target instanceof HTMLButtonElement)) {
                                                    handleRemap(channelId);
                                                }
                                            }}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer">
                                                {channelId}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer">
                                                {channel.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 cursor-pointer">
                                                {channel.type}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 cursor-pointer">
                                                10 hours ago
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap cursor-pointer">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    Active
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                {/* <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemap(channelId);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-900 relative z-10"
                                                >
                                                    Edit
                                                </button> */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteChannel(channelId);
                                                    }}
                                                    className="text-red-600 hover:text-red-900 relative z-10"
                                                >
                                                    Delete
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