import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useShops from '../hooks/useShops';
import NavigationBar from '../components/NavigationBar'; // Import the NavigationBar component

const ChannelMappingPage = () => {
  const { shopId, channelId } = useParams<{ shopId: string; channelId: string }>();
  const { shops } = useShops();
  const navigate = useNavigate();

  const [showCommentsDialog, setShowCommentsDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const selectedShop = shops.find((shop) => shop.id === shopId);
  const selectedChannel = selectedShop?.channels?.find((channel) => channel.id === channelId);

  const handleBackClick = () => {
    navigate(-1); // Go back to the previous page
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
        <h1 className="text-2xl font-semibold mb-4">Channel Mapping</h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">
            Mapping Fields for Channel: {selectedChannel?.name}
          </h2>
          {/* Add mapping fields logic here */}
          <p className="text-gray-500">Mapping fields will be displayed here.</p>
        </div>
      </div>
    </div>
  );
};

export default ChannelMappingPage;