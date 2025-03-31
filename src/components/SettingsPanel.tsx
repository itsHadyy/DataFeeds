import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Settings, X, Save, Undo, Download } from 'lucide-react';
import useShops from '../hooks/useShops';
import XMLUploader from './XMLUploader';
import { toast } from 'react-toastify';

interface Shop {
    id: string;
    name: string;
    xmlContent?: string;
}

const SettingsPanel: React.FC = () => {
    const { shops, updateShop, deleteShop, uploadXMLToShop, loading } = useShops();
    const { shopId } = useParams<{ shopId: string }>();
    const navigate = useNavigate();

    const [shopName, setShopName] = useState('');
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [modifiedXMLString, setModifiedXMLString] = useState<string | null>(null);
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

    useEffect(() => {
        if (!loading && shopId) {
            const foundShop = shops.find(shop => shop.id === shopId);
            if (!foundShop) {
                toast.error('Shop not found');
                navigate('/');
            } else {
                setSelectedShop(foundShop);
                setShopName(foundShop.name);
                setModifiedXMLString(foundShop.xmlContent || null);
            }
        }
    }, [loading, shopId, shops, navigate]);

    if (loading) return <div>Loading shop data...</div>;
    if (!selectedShop) return <div>No shop selected</div>;

    const handleSave = () => {
        if (shopName.trim()) {
            updateShop(selectedShop.id, shopName);
            toast.success('Shop name updated successfully!');
            navigate(-1);
        }
    };

    const handleDeleteShop = () => {
        deleteShop(selectedShop.id);
        toast.success('Shop deleted successfully');
        navigate('/');
    };

    const handleDownloadXML = () => {
        if (!modifiedXMLString) return;
        const blob = new Blob([modifiedXMLString], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedShop.name}_export.xml`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    };

    const handleXMLUploadSuccess = () => {
        toast.success('XML uploaded successfully!');
        navigate(-1);
      };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b p-4 sticky top-0 bg-white z-10">
                    <div className="flex items-center space-x-2">
                        <Settings className="h-5 w-5" />
                        <h2 className="text-lg font-semibold">Settings</h2>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    <div>
                        <h3 className="font-medium text-lg mb-4">Shop Settings</h3>
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="shopName" className="block text-sm font-medium text-gray-700 mb-2">
                                    Shop Name
                                </label>
                                <input
                                    id="shopName"
                                    type="text"
                                    value={shopName}
                                    onChange={(e) => setShopName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <h4 className="text-md font-medium mb-2">Re-upload XML</h4>
                                <XMLUploader
                                    shopId={selectedShop.id}
                                    onFieldsExtracted={() => {}}
                                    onUploadSuccess={handleXMLUploadSuccess}
                                />
                            </div>
                        </div>
                    </div>

                    {modifiedXMLString && (
                        <div className="border-t pt-6">
                            <h3 className="font-medium text-lg mb-4">Export Options</h3>
                            <button
                                onClick={handleDownloadXML}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm transition-colors"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download Modified XML
                            </button>
                        </div>
                    )}

                    <div className="border-t pt-6">
                        <button
                            onClick={() => setShowDeleteConfirmation(true)}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm transition-colors"
                        >
                            Delete Shop
                        </button>
                        <p className="text-xs text-gray-500 mt-2">
                            This will permanently delete this shop and all its data.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 p-4 border-t sticky bottom-0 bg-white">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        <Undo className="h-4 w-4 mr-2" />
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!shopName.trim()}
                        className={`flex items-center px-4 py-2 text-white rounded-md transition-colors ${!shopName.trim()
                            ? 'bg-blue-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                    </button>
                </div>
            </div>

            {showDeleteConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Delete Shop</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete "{selectedShop.name}"? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowDeleteConfirmation(false)}
                                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteShop}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Delete Shop
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPanel;