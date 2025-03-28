// App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Save, Undo, Settings, ArrowLeft, ChevronLeft, ChevronRight, MessageCircle, List } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import MappingField from './components/MappingField';
import XMLUploader from './components/XMLUploader';
import ShopDashboard from './components/ShopDashboard';
import ChannelsPage from './components/ChannelsPage';
import ChannelMappingPage from './components/ChannelMappingPage';
import NavigationBar from './components/NavigationBar'; // Import the NavigationBar component
import { FieldOption } from './types/mapping';
import { XMLData, XMLField, XMLMapping } from './types/xml';
import { XMLManager } from './services/XMLManager';
import useShops from './hooks/useShops';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/channels" element={<ChannelsPage />} />
        <Route path="/channel-mapping/:channelId" element={<ChannelMappingPage />} />
      </Routes>
    </Router>
  );
}

function MainApp() {
  const [xmlManager] = useState(() => new XMLManager());
  const [mappingFields, setMappingFields] = useState<XMLField[]>([]);
  const [mappings, setMappings] = useState<XMLMapping[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const { shops, addShop, deleteShop, updateShop, uploadXMLToShop, addComment, deleteComment } = useShops();
  const navigate = useNavigate();

  // State for comments dialog
  const [showCommentsDialog, setShowCommentsDialog] = useState(false);
  const [newComment, setNewComment] = useState('');

  // State for comments, preview, and unsaved changes
  const [comments, setComments] = useState<{ [fieldName: string]: string }>({});
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewField, setPreviewField] = useState<XMLField | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedState, setLastSavedState] = useState<{
    mappings: XMLMapping[];
    comments: { [fieldName: string]: string };
    mappingFields: XMLField[];
  }>({ mappings: [], comments: {}, mappingFields: [] });

  // Temporary state for unsaved changes
  const [tempMappings, setTempMappings] = useState<XMLMapping[]>([]);
  const [tempComments, setTempComments] = useState<{ [fieldName: string]: string }>({});
  const [tempMappingFields, setTempMappingFields] = useState<XMLField[]>([]);

  // State for settings view
  const [showSettings, setShowSettings] = useState(false);

  // State for feedback messages
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // State for preview data (table rows)
  const [previewData, setPreviewData] = useState<
    {
      productId: string;
      title: string;
      fieldsUsedInMapping: string;
      channelField: string;
    }[]
  >([]);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Calculate total pages
  const totalPages = Math.ceil(previewData.length / itemsPerPage);

  // Get current items for the current page
  const currentItems = previewData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Load comments from localStorage on component mount
  useEffect(() => {
    const savedComments: { [fieldName: string]: string } = {};
    mappingFields.forEach((field) => {
      const comment = localStorage.getItem(`comments-${field.name}`);
      if (comment) {
        savedComments[field.name] = comment;
      }
    });
    setComments(savedComments);
    setTempComments(savedComments);
  }, [mappingFields]);

  // Get available field options for mapping
  const getFieldOptions = useCallback((xmlData: XMLData | null): FieldOption[] => {
    if (!xmlData) return [];
    const uniqueKeys = new Set<string>();
    xmlData.items.forEach((item) => {
      Object.keys(item).forEach((key) => uniqueKeys.add(key));
    });
    return Array.from(uniqueKeys).map((key) => ({
      value: key,
      label: key,
      type: 'input',
    }));
  }, []);

  // Handle field mapping changes
  const handleFieldChange = useCallback((fieldName: string, mapping: XMLMapping) => {
    setTempMappings((prev) => {
      const existingIndex = prev.findIndex((m) => m.targetField === fieldName);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...mapping, targetField: fieldName };
        return updated;
      }
      return [...prev, { ...mapping, targetField: fieldName }];
    });
    setHasUnsavedChanges(true);
    setTempMappingFields((prev) =>
      prev.map((field) =>
        field.name === fieldName
          ? { ...field, value: mapping.value || field.value }
          : field
      )
    );
  }, []);

  const handleSaveAndProceed = useCallback(() => {
    console.log('Changes saved and proceeding to channels');
    setHasUnsavedChanges(false);
    setMappings(tempMappings); // Update mappings state
    setComments(tempComments);
    setMappingFields(tempMappingFields);
    setLastSavedState({ mappings: tempMappings, comments: tempComments, mappingFields: tempMappingFields });

    // Show a success toast notification
    toast.success('Changes saved successfully!', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });

    setFeedbackMessage('Changes saved successfully!');
    setTimeout(() => setFeedbackMessage(null), 3000);

    // Navigate to the channels page
    if (selectedShopId) {
      navigate(`/channels?shopId=${selectedShopId}`);
    } else {
      navigate('/channels');
    }
  }, [tempMappings, tempComments, tempMappingFields, navigate]);

  // Handle discard changes button click
  const handleDiscardChanges = useCallback(() => {
    console.log('Changes discarded');
    setHasUnsavedChanges(false);
    setTempMappings(lastSavedState.mappings);
    setTempComments(lastSavedState.comments);
    setTempMappingFields(lastSavedState.mappingFields);

    // Show an info toast notification
    toast.info('Changes discarded successfully!', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });

    setFeedbackMessage('Changes discarded successfully!');
    setTimeout(() => setFeedbackMessage(null), 3000);
  }, [lastSavedState]);

  // Handle navigation away without saving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Handle back button click
  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      const confirmNavigation = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      );
      if (!confirmNavigation) return;
    }
    setSelectedShopId(null);
    setShowSettings(false);
  };

  // Extract fields from uploaded XML
  const handleFieldsExtracted = useCallback((data: XMLData) => {
    xmlManager.setData(data); // Set XML data in xmlManager
    const uniqueFields = new Set(data.items.flatMap((item) => Object.keys(item)));
    const newMappingFields = Array.from(uniqueFields).map((field) => ({
      name: field,
      value: '',
      required: data.schema.find((s) => s.name === field)?.required || false,
      helpText: data.schema.find((s) => s.name === field)?.helpText,
    }));
    setMappingFields(newMappingFields);
    setTempMappingFields(newMappingFields);
    setMappings([]);
    setTempMappings([]);
    setLastSavedState({ mappings: [], comments: {}, mappingFields: newMappingFields });
  }, [xmlManager]);

  // Handle comment submission
  const handleAddComment = () => {
    if (newComment.trim() && selectedShopId) {
      addComment(selectedShopId, newComment);
      setNewComment('');
    }
  };

  // Handle comment deletion
  const handleDeleteComment = (commentIndex: number) => {
    if (selectedShopId) {
      deleteComment(selectedShopId, commentIndex);
    }
  };

  const [modifiedXMLString, setModifiedXMLString] = useState<string | null>(null);

  const handleApplyChanges = useCallback(() => {
    console.log('Applying changes...');
    const xmlData = xmlManager.getData();
    console.log('XML Data:', xmlData);
    if (!xmlData || tempMappings.length === 0) {
      console.error('No XML data or mappings found.');
      toast.error('No XML data or mappings available.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    console.log('Mappings:', tempMappings);
    const updatedData = xmlManager.applyMappings(tempMappings);
    console.log('Updated Data:', updatedData);
    if (updatedData) {
      const xmlString = xmlManager.generateXML(updatedData.items);
      console.log('Generated XML:', xmlString);

      // Save the modified XML string to state
      setModifiedXMLString(xmlString);

      // Show a success notification (without download)
      toast.success('Changes applied successfully!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } else {
      console.error('Failed to apply mappings.');
      toast.error('Failed to apply mappings.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  }, [xmlManager, tempMappings]);

  const handleDeleteShop = () => {
    console.log("Selected shop ID to delete:", selectedShopId); // Add this
    if (selectedShopId) {
      const confirmDelete = window.confirm(
        'Are you sure you want to delete this shop? This action cannot be undone.'
      );

      if (confirmDelete) {
        console.log("Shop IDs before deletion:", shops.map(s => s.id)); // Add this
        deleteShop(selectedShopId);
      }
    }
  };

  // Save to localStorage
  useEffect(() => {
    if (modifiedXMLString) {
      localStorage.setItem('modifiedXMLString', modifiedXMLString);
    }
  }, [modifiedXMLString]);

  // Load from localStorage on component mount
  useEffect(() => {
    const savedXMLString = localStorage.getItem('modifiedXMLString');
    if (savedXMLString) {
      setModifiedXMLString(savedXMLString);
    }
  }, []);

  // Load XML content for the selected shop
  useEffect(() => {
    if (selectedShopId) {
      const selectedShop = shops.find((shop) => shop.id === selectedShopId);
      if (selectedShop && selectedShop.xmlContent) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(selectedShop.xmlContent, 'text/xml');
        const items = xmlDoc.getElementsByTagName('item');
        const schema = new Map<string, { required?: boolean; helpText?: string }>();

        Array.from(items).forEach((item) => {
          Array.from(item.children).forEach((child) => {
            if (!schema.has(child.nodeName)) {
              schema.set(child.nodeName, {
                required: child.hasAttribute('required'),
                helpText: child.getAttribute('description') || undefined,
              });
            }
          });
        });

        const itemsData = Array.from(items).map((item) => {
          const itemData: { [key: string]: string } = {};
          Array.from(item.children).forEach((child) => {
            if (child.textContent) {
              itemData[child.nodeName] = child.textContent;
            }
          });
          return itemData;
        });

        const schemaArray = Array.from(schema.entries()).map(([name, props]) => ({
          name,
          ...props,
        })); // <-- Fixed: Added the missing parenthesis here

        handleFieldsExtracted({ items: itemsData, schema: schemaArray });
      }
    }
  }, [selectedShopId, shops, handleFieldsExtracted]);

  const [commentFieldName, setCommentFieldName] = useState<string>('');

  const handleCommentClick = (fieldName?: string) => {
    console.log('Comments button clicked for field:', fieldName);
    if (fieldName) {
      setCommentFieldName(fieldName);
      setNewComment(fieldName + '');
    } else {
      setCommentFieldName('');
      setNewComment('');
    }
    setShowCommentsDialog(true);
  };

  const handlePreviewClick = (field: XMLField) => {
    setPreviewField(field);
    const xmlData = xmlManager.getData();

    if (xmlData?.items) {
      try {
        const mappedData = xmlManager.applyMappings(tempMappings);

        const previewRows = xmlData.items.map((item, index) => {
          // 1. First try to find the actual ID field in your data
          const idField = Object.keys(item).find(key =>
            key.toLowerCase().includes('id') ||
            key.toLowerCase().includes('sku') ||
            key.toLowerCase().includes('code')
          );

          // 2. Then try to find the actual title field
          const titleField = Object.keys(item).find(key =>
            key.toLowerCase().includes('title') ||
            key.toLowerCase().includes('name') ||
            key.toLowerCase().includes('product')
          );

          return {
            productId: idField ? item[idField] : `ITEM_${index + 1}`,
            productTitle: titleField ? item[titleField] : 'Product',
            fieldName: field.name,
            mappedValue: mappedData.items[index]?.[field.name] || 'N/A'
          };
        });

        setPreviewData(previewRows);
      } catch (error) {
        console.error('Preview error:', error);
        toast.error('Failed to generate preview');
        setPreviewData([]);
      }
    } else {
      setPreviewData([]);
    }

    setShowPreviewDialog(true);
  };

  // Handle channel field change in preview dialog
  const handleChannelFieldChange = (index: number, value: string) => {
    setPreviewData((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, channelField: value } : row
      )
    );
  };

  const handleInternalFieldsClick = () => {
    const mappingFieldsSection = document.getElementById('mapping-fields-section');
    if (mappingFieldsSection) {
      mappingFieldsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const xmlData = xmlManager.getData();
  const selectedShop = shops.find((shop) => shop.id === selectedShopId);
  const commentsList = selectedShop?.comments || [];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {selectedShopId && (
        <NavigationBar
          selectedShopId={selectedShopId}
          shops={shops}
          setShowCommentsDialog={setShowCommentsDialog}
          setShowSettings={setShowSettings}
          handleBackClick={handleBackClick}
          showSettings={showSettings}
          onInternalFieldsClick={handleInternalFieldsClick}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <ToastContainer />

        {/* Shop Selection */}
        {!selectedShopId ? (
          <ShopDashboard onSelectShop={setSelectedShopId} />
        ) : (
          <>
            {/* Shop Name */}
            {/* <h2 className="text-2xl font-semibold mb-4">
              {shops.find((shop) => shop.id === selectedShopId)?.name}
              <h6 className="text-2xl font-semibold mt-4">Shop ID: {selectedShopId}</h6>
            </h2> */}

            {/* Comments Dialog */}
            {showCommentsDialog && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
                  <h2 className="text-lg font-semibold mb-4">Comments</h2>
                  <div className="space-y-4">
                    {/* Display Comments */}
                    {commentsList.map((comment, index) => (
                      <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                        <div>
                          <p className="text-gray-700">{comment.text}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(comment.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteComment(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Comment */}
                  <div className="mt-6">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <button
                      onClick={handleAddComment}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add Comment
                    </button>
                  </div>

                  {/* Close Dialog */}
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setShowCommentsDialog(false)}
                      className="px-4 py-2 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Settings View */}
            {showSettings ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Settings</h3>

                {/* Change Shop Name */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Change Shop Name
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shops.find((shop) => shop.id === selectedShopId)?.name || ''}
                      onChange={(e) => {
                        const newName = e.target.value;
                        updateShop(selectedShopId, newName);
                      }}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* {modifiedXMLString && (
                  <button
                    onClick={() => xmlManager.downloadXML(modifiedXMLString)}
                    className="px-4 py-2 mb-6 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 inline-block mr-2" />
                    Download Again
                  </button>
                )} */}

                {/* Re-upload XML */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold mb-2">Re-upload XML</h4>
                  <XMLUploader
                    shopId={selectedShopId}
                    onFieldsExtracted={handleFieldsExtracted}
                  />
                </div>

                {/* Delete Shop */}
                <div>
                  <button
                    onClick={handleDeleteShop}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete Shop
                  </button>
                </div>

                {/* Save and Discard Changes Buttons */}
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={handleDiscardChanges}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    <Undo className="h-4 w-4 inline-block mr-2" />
                    Discard Changes
                  </button>
                  <button
                    onClick={handleSaveAndProceed}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 inline-block mr-2" />
                    Save & Proceed
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* XML Upload Section (Visible only during shop creation) */}
                {!shops.find((shop) => shop.id === selectedShopId)?.xmlContent && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload XML File</h2>
                    <XMLUploader
                      shopId={selectedShopId}
                      onFieldsExtracted={handleFieldsExtracted}
                    />
                  </div>
                )}
                {/* Save and Discard Changes Buttons */}
                <div className="flex justify-end gap-4 mt-6 mb-6">
                  <button
                    onClick={handleDiscardChanges}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleApplyChanges}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save & Apply
                  </button>
                  {modifiedXMLString && (
                    <button
                      onClick={() => xmlManager.downloadXML(modifiedXMLString)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Save className="h-4 w-4 inline-block mr-2" />
                      Download
                    </button>
                  )}
                </div>

                {/* Field Mapping Section */}
                {tempMappingFields.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    {tempMappingFields.map((field) => (
                      <MappingField
                        key={field.name}
                        fieldName={field.name}
                        fieldValue={field.value}
                        fieldOptions={getFieldOptions(xmlData)}
                        helpText={field.helpText}
                        onFieldChange={(mapping) => handleFieldChange(field.name, mapping)}
                        onPreviewClick={() => handlePreviewClick(field)}
                        onCommentClick={() => handleCommentClick(field.name)}
                        onABTestClick={() => console.log('A/B Test clicked')}
                        onEditClick={() => console.log('Edit clicked')}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {showPreviewDialog && previewData.length > 0 && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg w-full max-w-6xl">
                  <h2 className="text-lg font-semibold mb-4">Preview - {previewField?.name}</h2>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      Showing mapped values for selected field
                    </p>
                  </div>
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2">Product ID</th>
                        <th className="border border-gray-300 p-2">Product Title</th>
                        <th className="border border-gray-300 p-2">Field</th>
                        <th className="border border-gray-300 p-2">Mapped Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-2 font-mono">{row.productId}</td>
                          <td className="border border-gray-300 p-2">{row.productTitle}</td>
                          <td className="border border-gray-300 p-2 text-gray-600">{row.fieldName}</td>
                          <td className="border border-gray-300 p-2">
                            {row.mappedValue === 'N/A' ? (
                              <span className="text-gray-400">N/A</span>
                            ) : (
                              row.mappedValue
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="mt-4 flex justify-between items-center">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4 inline-block mr-2" />
                      Previous
                    </button>
                    <span>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 inline-block ml-2" />
                    </button>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setShowPreviewDialog(false)}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {mappingFields.length === 0 && !selectedShopId && (
          <div className="text-center py-12">
            <p className="text-gray-500">Select a shop and upload an XML file to start mapping fields</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;