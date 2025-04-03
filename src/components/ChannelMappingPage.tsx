import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useShops from '../hooks/useShops';
import { XMLManager } from '../services/XMLManager';
import MappingField from './MappingField';
import { XMLField, XMLData, XMLMapping } from '../types/xml';
import { FieldOption } from '../types/mapping';
import { Save, Undo, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { XMLBuilder } from '../services/XMLBuilder';
import NavigationBar from '../components/NavigationBar';

interface ChannelField {
  name: string;
  optional?: boolean;
  helpText?: string;
}

interface ChannelSchemas {
  [key: string]: ChannelField[];
}

const channelSchemas: ChannelSchemas = {
  facebook: [
    { name: 'id' },
    { name: 'title' },
    { name: 'description' },
    { name: 'availability' },
    { name: 'condition' },
    { name: 'price' },
    { name: 'link' },
    { name: 'image_link' },
    { name: 'brand' },
  ],
  google: [
    { name: 'g_id' },
    { name: 'g_title' },
    { name: 'g_description' },
    { name: 'g_availability' },
    { name: 'g_price' },
    { name: 'g_link' },
    { name: 'g_image_link' },
  ],
  snapchat: [
    { name: 'id' },
    { name: 'title' },
    { name: 'description' },
    { name: 'link' },
    { name: 'image_link' },
    { name: 'availability' },
    { name: 'price' },
    { name: 'brand_gtin_or_mpn', optional: true },
  ],
  tiktok: [
    { name: 'sku_id' },
    { name: 'title' },
    { name: 'description' },
    { name: 'availability' },
    { name: 'condition' },
    { name: 'price' },
    { name: 'link' },
    { name: 'image_link' },
    { name: 'brand' },
    { name: 'google_product_category', optional: true },
    { name: 'video_link', optional: true },
    { name: 'additional_image_link', optional: true },
    { name: 'age_group' },
    { name: 'color', optional: true },
    { name: 'gender', optional: true },
    { name: 'item_group_id', optional: true },
    { name: 'material', optional: true },
    { name: 'pattern', optional: true },
    { name: 'product_type', optional: true },
    { name: 'sale_price', optional: true },
    { name: 'sale_price_effective_date', optional: true },
    { name: 'shipping', optional: true },
    { name: 'shipping_weight', optional: true },
    { name: 'gtin', optional: true },
    { name: 'mpn', optional: true },
    { name: 'size', optional: true },
    { name: 'tax', optional: true },
    { name: 'ios_url', optional: true },
    { name: 'android_url', optional: true },
    { name: 'custom_label_0', optional: true },
    { name: 'custom_label_1', optional: true },
    { name: 'custom_label_2', optional: true },
    { name: 'custom_label_3', optional: true },
    { name: 'custom_label_4', optional: true },
    { name: 'merchant_brand', optional: true },
    { name: 'productHisEval', optional: true },
  ],
};

interface PreviewRow {
  productId: string;
  productTitle: string;
  fieldName: string;
  mappedValue: string;
}

const ChannelMappingPage: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const shopId = searchParams.get('shopId');
  const navigate = useNavigate();

  const { getShopById, updateMappedChannels, shops, updateShopMappings } = useShops();
  const shop = getShopById(shopId || '');
  const [xmlManager] = useState(() => new XMLManager());
  const [mappingFields, setMappingFields] = useState<XMLField[]>([]);
  const [tempMappingFields, setTempMappingFields] = useState<XMLField[]>([]);
  const [tempMappings, setTempMappings] = useState<XMLMapping[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedState, setLastSavedState] = useState<{
    mappings: XMLMapping[];
    mappingFields: XMLField[];
  }>({ mappings: [], mappingFields: [] });

  // Preview dialog state
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewField, setPreviewField] = useState<XMLField | null>(null);
  const [previewData, setPreviewData] = useState<
    {
      productId: string;
      productTitle: string;
      fieldName: string;
      originalValue: string;
      mappedValue: string;
    }[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(previewData.length / itemsPerPage);
  const currentItems = previewData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleBackClick = () => {
    navigate(`/channels?shopId=${shopId}`);
  };

  if (!channelId || !channelSchemas[channelId]) {
    return (
      <div className="flex min-h-screen min-w-screen">
        <NavigationBar
          selectedShopId={shopId}
          shops={shops}
        />
        <div className="p-4">
          <div>Invalid channel ID: {channelId}</div>
        </div>
      </div>
    );
  }

  if (!shopId) {
    return (
      <div className="flex min-h-screen min-w-screen">
        <NavigationBar
          selectedShopId={shopId}
          shops={shops}
        />
        <div className="p-4">
          <div>Shop ID is required</div>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="flex min-h-screen min-w-screen">
        <NavigationBar
          selectedShopId={shopId}
          shops={shops}
        />
        <div className="p-4">
          <div>Shop not found. Shop ID: {shopId}</div>
        </div>
      </div>
    );
  }

  const { getInternalMappings } = useShops();

  useEffect(() => {
    if (shop && shop.xmlContent) {
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(shop.xmlContent, 'text/xml');
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
        }));

        xmlManager.setData({ items: itemsData, schema: schemaArray });

        const channelSchema = channelSchemas[channelId];
        const savedMappings = shop.channelMappings?.[channelId] || [];
        const internalMappings = getInternalMappings(shop.id);

        const newMappingFields = channelSchema.map((field) => {
          const savedMapping = savedMappings.find(m => m.targetField === field.name) ||
            internalMappings.find(m => m.targetField === field.name);

          return {
            name: field.name,
            value: savedMapping?.value || '',
            required: !field.optional,
            helpText: field.helpText || '',
            optional: field.optional || false,
          };
        });

        setMappingFields(newMappingFields);
        setTempMappingFields(newMappingFields);
        setTempMappings(savedMappings.length ? savedMappings : internalMappings);
        setLastSavedState({
          mappings: savedMappings.length ? savedMappings : internalMappings,
          mappingFields: newMappingFields
        });
      } catch (error) {
        toast.error('Error parsing XML content');
        console.error('XML parsing error:', error);
      }
    }
  }, [shop, xmlManager, channelId]);

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
            originalValue: item[field.name] || 'N/A', // Add original value
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


  const xmlData = xmlManager.getData();

  const handleSaveAndProceed = useCallback(() => {
    console.log("Mappings saved:", tempMappings);
    setHasUnsavedChanges(false);
    setMappingFields(tempMappingFields);
    setLastSavedState({ mappings: tempMappings, mappingFields: tempMappingFields });

    toast.success("Mappings saved successfully!");

    if (shopId && channelId) {
      updateMappedChannels(shopId, channelId);
      updateShopMappings(shopId, channelId, tempMappings); // Save the actual mappings
    }

    navigate(`/channels?shopId=${shopId}`);
  }, [tempMappings, tempMappingFields, navigate, shopId, channelId, updateMappedChannels, updateShopMappings]);

  const handleDiscardChanges = useCallback(() => {
    setHasUnsavedChanges(false);
    setTempMappings(lastSavedState.mappings);
    setTempMappingFields(lastSavedState.mappingFields);
    toast.info("Changes discarded.");
  }, [lastSavedState]);

  const handleCommentClick = useCallback(() => {
    toast.info("Comment functionality not yet implemented");
  }, []);

  const handleABTestClick = useCallback(() => {
    toast.info("A/B Test functionality not yet implemented");
  }, []);

  const handleEditClick = useCallback(() => {
    toast.info("Edit functionality not yet implemented");
  }, []);

  const xmlBuilder = new XMLBuilder();

  const handleDownload = useCallback(() => {
    if (!shop || !xmlManager || !channelId) {
      toast.error("Could not generate XML.");
      return;
    }

    try {
      const items = xmlManager.getData().items;
      const channelSchema = channelSchemas[channelId];

      const xmlString = xmlBuilder.buildXML(items, tempMappings, channelSchema);
      const parsedXML = xmlManager.parseXMLString(xmlString);
      const mappedXML = xmlManager.applyMappings(tempMappings);
      const finalXMLString = xmlManager.generateXML(mappedXML.items);

      const blob = new Blob([finalXMLString], { type: 'text/xml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${shop.name}-${channelId}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Error generating XML file");
      console.error("XML generation error:", error);
    }
  }, [xmlManager, tempMappings, shop, channelId, xmlBuilder]);

  return (
    <div className="flex min-h-screen min-w-screen">
      <NavigationBar
        selectedShopId={shopId}
        shops={shops}
      />
      <div className="p-4 flex-1">
        <ToastContainer />
        <button
          onClick={handleBackClick}
          className="flex items-center gap-2 px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Mapping for {channelId} - Shop: {shop.name}</h1>
        </div>
        <h2 className="text-lg text-gray-600 mb-6">Shop ID: {shopId}</h2>

        <div className="flex justify-end gap-4 mt-6 mb-6">
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
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Download XML
          </button>
        </div>

        {tempMappingFields.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold p-4">Required Fields</h3>
            {tempMappingFields
              .filter((field) => !field.optional)
              .map((field) => (
                <MappingField
                  key={field.name}
                  fieldName={field.name}
                  fieldValue={field.value}
                  fieldOptions={getFieldOptions(xmlData)}
                  helpText={field.helpText}
                  onFieldChange={(mapping) => handleFieldChange(field.name, mapping)}
                  onPreviewClick={() => handlePreviewClick(field)}
                  onCommentClick={handleCommentClick}
                  onABTestClick={handleABTestClick}
                  onEditClick={handleEditClick}
                  optional={field.optional}
                />
              ))}

            <h3 className="text-lg font-semibold p-4 mt-4">Optional Fields</h3>
            {tempMappingFields
              .filter((field) => field.optional)
              .map((field) => (
                <MappingField
                  key={field.name}
                  fieldName={field.name}
                  fieldValue={field.value}
                  fieldOptions={getFieldOptions(xmlData)}
                  helpText={field.helpText}
                  onFieldChange={(mapping) => handleFieldChange(field.name, mapping)}
                  onPreviewClick={() => handlePreviewClick(field)}
                  onCommentClick={handleCommentClick}
                  onABTestClick={handleABTestClick}
                  onEditClick={handleEditClick}
                  optional={field.optional}
                />
              ))}
          </div>
        )}

        {/* Preview Dialog */}
        {showPreviewDialog && previewField && previewData.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-6xl">
              <h2 className="text-lg font-semibold mb-4">Preview - {previewField.name}</h2>
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
                    <th className="border border-gray-300 p-2">Original Value</th>
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
                        {row.originalValue === 'N/A' ? (
                          <span className="text-gray-400">N/A</span>
                        ) : (
                          row.originalValue
                        )}
                      </td>
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
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
      </div>
    </div>
  );
};

export default ChannelMappingPage;