import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ShopManager from "./ShopManager";
import useShops from "../hooks/useShops";
import XMLUploader from "./XMLUploader";
import { XMLManager } from "../services/XMLManager";
import { Search, MoreVertical } from "lucide-react";
import { useRef, useEffect } from "react";

interface ShopDashboardProps {
    onSelectShop: (shopId: string) => void;
}

const ShopDashboard: React.FC<ShopDashboardProps> = ({ onSelectShop }) => {
    const navigate = useNavigate();
    const { shops, addShop, deleteShop, updateShop } = useShops();
    const [editingShopId, setEditingShopId] = useState<string | null>(null);
    const [editedName, setEditedName] = useState<string>("");
    const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showOptionsMenu, setShowOptionsMenu] = useState<string | null>(null);

    // Filter shops based on search term
    const filteredShops = shops.filter(shop =>
        shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Helper function to count products in XML
    const countProductsInXML = (xmlContent: string): number => {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
            const items = xmlDoc.getElementsByTagName("item");
            return items.length;
        } catch (err) {
            console.error("Error parsing XML:", err);
            return 0;
        }
    };

    const getXMLDownloadLink = (xmlContent: string): string => {
        const xmlManager = new XMLManager();
        const parsedData = xmlManager.parseXMLString(xmlContent);
        xmlManager.setData(parsedData);
        const modifiedXML = xmlManager.generateXML();
        return xmlManager.generateDownloadLink(modifiedXML);
    };

    const handleSelectShop = (shopId: string) => {
        setSelectedShopId(shopId);
        onSelectShop(shopId);
    };

    const handleDeleteShop = (shopId: string) => {
        deleteShop(shopId);
        setShowDeleteModal(null);
    };

    const handleNavigateToChannels = (shopId: string) => {
        navigate(`/channels?shopId=${shopId}`);
    };


    const [menuPosition, setMenuPosition] = useState<{ top: number, left: number } | null>(null);
    const menuButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

    const toggleOptionsMenu = (shopId: string) => {
        const button = menuButtonRefs.current[shopId];
        if (button) {
            const rect = button.getBoundingClientRect();
            setMenuPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX
            });
            setShowOptionsMenu(shopId);
        } else {
            setShowOptionsMenu(null);
        }
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setShowOptionsMenu(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Add Shop Section */}
                <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Add New Shop</h3>
                    <ShopManager onAddShop={addShop} />
                </div>

                {/* Header Section */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Shops</h1>
                        <p className="text-sm text-gray-500">Manage your connected shops and product feeds</p>
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
                            <Search size={18} />
                        </div>
                    </div>
                </div>

                {/* Shop List Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shop Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source Link</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Update</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Options</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredShops.length > 0 ? (
                                filteredShops.map((shop) => (
                                    <tr
                                        key={shop.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shop.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {editingShopId === shop.id ? (
                                                <input
                                                    type="text"
                                                    value={editedName}
                                                    onChange={(e) => setEditedName(e.target.value)}
                                                    className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
                                                />
                                            ) : (
                                                shop.name
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {shop.xmlContent ? (
                                                <span className="text-green-500">✔</span>
                                            ) : (
                                                <span className="text-gray-400">✖</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">XML</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {shop.xmlContent ? countProductsInXML(shop.xmlContent) : "N/A"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1h hours ago</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                ● Shop OK
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                ref={el => menuButtonRefs.current[shop.id] = el}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleOptionsMenu(shop.id);
                                                }}
                                                className="text-gray-500 hover:text-gray-700"
                                            >
                                                <MoreVertical size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">
                                        No shops found. Create your first shop.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {showOptionsMenu && menuPosition && (
                    <div
                        className="fixed z-50 mt-1 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200"
                        style={{
                            top: `${menuPosition.top}px`,
                            left: `${menuPosition.left}px`,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleNavigateToChannels(showOptionsMenu);
                                setShowOptionsMenu(null);
                            }}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                            Channels
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSelectShop(showOptionsMenu);
                                setShowOptionsMenu(null);
                            }}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                            Internal Fields
                        </button>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                        <h3 className="text-lg font-semibold mb-4">Are you sure?</h3>
                        <p className="text-gray-600 mb-6">This action cannot be undone.</p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowDeleteModal(null)}
                                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteShop(showDeleteModal)}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* XML Uploader for Selected Shop */}
            {selectedShopId && (
                <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold mb-4">Upload XML for {shops.find(shop => shop.id === selectedShopId)?.name}</h3>
                    <XMLUploader shopId={selectedShopId} onFieldsExtracted={(data) => console.log(data)} />
                </div>
            )}
        </div>
    );
};

export default ShopDashboard;