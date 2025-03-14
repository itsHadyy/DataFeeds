import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useShops from '../hooks/useShops';
import NavigationBar from '../components/NavigationBar';
import MappingField from '../components/MappingField'; // Import the MappingField component
import { XMLManager } from '../services/XMLManager';
import { XMLMapping } from '../types/xml';

const ChannelMappingPage = () => {
  const { shopId, channelId } = useParams<{ shopId: string; channelId: string }>();
  const { shops, updateShop } = useShops();
  const navigate = useNavigate();

  const [showCommentsDialog, setShowCommentsDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mappings, setMappings] = useState<XMLMapping[]>([]);

  const selectedShop = shops.find((shop) => shop.id === shopId);
  const selectedChannel = selectedShop?.channels?.find((channel) => channel.id === channelId);

  const [xmlManager] = useState(() => new XMLManager());

  // Load XML data for the selected shop
  const xmlData = selectedShop?.xmlContent ? xmlManager.parseXML(selectedShop.xmlContent) : null;

  // Handle field mapping changes
  const handleFieldChange = useCallback((fieldName: string, mapping: XMLMapping) => {
    setMappings((prev) => {
      const existingIndex = prev.findIndex((m) => m.targetField === fieldName);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...mapping, targetField: fieldName };
        return updated;
      }
      return [...prev, { ...mapping, targetField: fieldName }];
    });
  }, []);

  // Handle saving mappings
  const handleSaveMappings = () => {
    if (selectedShop && selectedChannel) {
      const updatedShop = {
        ...selectedShop,
        channels: selectedShop.channels?.map((channel) =>
          channel.id === channelId ? { ...channel, mappings } : channel
        ),
      };
      updateShop(updatedShop);
      toast.success('Mappings saved successfully!', {
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

          {/* Display Mapping Fields */}
          {xmlData ? (
            <div>
              {xmlData.items[0] && Object.keys(xmlData.items[0]).map((fieldName) => (
                <MappingField
                  key={fieldName}
                  fieldName={fieldName}
                  fieldValue={mappings.find((m) => m.targetField === fieldName)?.value || ''}
                  fieldOptions={[]} // Add field options if needed
                  helpText={xmlData.schema.find((s) => s.name === fieldName)?.helpText}
                  onFieldChange={(mapping) => handleFieldChange(fieldName, mapping)}
                  onPreviewClick={() => console.log('Preview clicked')}
                  onCommentClick={() => console.log('Comment clicked')}
                  onABTestClick={() => console.log('A/B Test clicked')}
                  onEditClick={() => console.log('Edit clicked')}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No XML data available for mapping.</p>
          )}

          {/* Save Mappings Button */}
          <button
            onClick={handleSaveMappings}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Save Mappings
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChannelMappingPage;