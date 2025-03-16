import useShops from '../hooks/useShops'; // Import the hook
import React, { useState, useEffect } from "react";

const ChannelsPage: React.FC<{ shopId: string }> = ({ shopId }) => {
    const { shops, getShopById, addChannel, updateChannel, deleteChannel } = useShops();
    const shop = getShopById(shopId!);

    useEffect(() => {
        console.log("Shops:", shops); // Debugging
        console.log("Shop found:", shop); // Debugging
    }, [shops, shop]);

    if (!shop) {
        return <div>Shop not found. Shop ID: {shopId}</div>;
    }

    // State for adding/editing channels
    const [newChannelName, setNewChannelName] = useState("");
    const [editingChannelId, setEditingChannelId] = useState<string | null>(null);
    const [editingChannelName, setEditingChannelName] = useState("");

    // Handle adding a new channel
    const handleAddChannel = () => {
        if (newChannelName.trim()) {
            addChannel(shopId, newChannelName);
            setNewChannelName(""); // Clear input after adding
        }
    };

    // Handle starting to edit a channel
    const startEditingChannel = (channelId: string, channelName: string) => {
        setEditingChannelId(channelId);
        setEditingChannelName(channelName);
    };

    // Handle saving an edited channel
    const handleSaveEditedChannel = () => {
        if (editingChannelId && editingChannelName.trim()) {
            updateChannel(shopId, editingChannelId, editingChannelName);
            setEditingChannelId(null); // Exit edit mode
            setEditingChannelName(""); // Clear input
        }
    };

    // Handle deleting a channel
    const handleDeleteChannel = (channelId: string) => {
        if (window.confirm("Are you sure you want to delete this channel?")) {
            deleteChannel(shopId, channelId);
        }
    };

    return (
        <div>
            <h1>Channels for Shop: {shop.name}</h1>
            <h2>Shop ID: {shopId}</h2>

            {/* Add Channel Section */}
            <div>
                <h3>Add New Channel</h3>
                <input
                    type="text"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    placeholder="Enter channel name"
                />
                <button onClick={handleAddChannel}>Add Channel</button>
            </div>

            {/* List of Channels */}
            <div>
                <h3>Existing Channels</h3>
                {shop.channels?.length ? (
                    <ul>
                        {shop.channels.map((channel) => (
                            <li key={channel.id}>
                                {editingChannelId === channel.id ? (
                                    // Edit Mode
                                    <div>
                                        <input
                                            type="text"
                                            value={editingChannelName}
                                            onChange={(e) => setEditingChannelName(e.target.value)}
                                        />
                                        <button onClick={handleSaveEditedChannel}>Save</button>
                                        <button onClick={() => setEditingChannelId(null)}>Cancel</button>
                                    </div>
                                ) : (
                                    // View Mode
                                    <div>
                                        <span>{channel.name}</span>
                                        <button onClick={() => startEditingChannel(channel.id, channel.name)}>
                                            Edit
                                        </button>
                                        <button onClick={() => handleDeleteChannel(channel.id)}>Delete</button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No channels found.</p>
                )}
            </div>
        </div>
    );
};

export default ChannelsPage;