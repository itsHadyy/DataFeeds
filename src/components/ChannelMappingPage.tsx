// ChannelMappingPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useShops from '../hooks/useShops';
import { XMLManager } from '../services/XMLManager';
import MappingField from './MappingField';
import { XMLField, XMLData, XMLMapping } from '../types/xml';
import { FieldOption } from '../types/mapping';
import { Save, Undo } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import { XMLBuilder } from '../services/XMLBuilder';

const channelSchemas: { [key: string]: { name: string; optional?: boolean }[] } = {
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
    { name: 'brand, gtin, or mpn' },
    { name: 'brand, gtin, or mpn', optional: true },
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
const ChannelMappingPage: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const shopId = searchParams.get('shopId');
  const navigate = useNavigate();

  const { getShopById, updateMappedChannels } = useShops();
  const shop = getShopById(shopId!);
  const [xmlManager] = useState(() => new XMLManager());
  const [mappingFields, setMappingFields] = useState<XMLField[]>([]);
  const [tempMappingFields, setTempMappingFields] = useState<XMLField[]>([]);
  const [tempMappings, setTempMappings] = useState<XMLMapping[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedState, setLastSavedState] = useState<{
    mappings: XMLMapping[];
    mappingFields: XMLField[];
  }>({ mappings: [], mappingFields: [] });

  useEffect(() => {
    if (shop && shop.xmlContent) {
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
      if (channelSchema) {
        const newMappingFields = channelSchema.map((field) => ({
          name: field.name,
          value: '',
          required: !field.optional,
          helpText: '',
          optional: field.optional,
        }));
        setMappingFields(newMappingFields);
        setTempMappingFields(newMappingFields);
        setTempMappings([]);
        setLastSavedState({ mappings: [], mappingFields: newMappingFields });
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

  const xmlData = xmlManager.getData();

  if (!shop) {
    return <div>Shop not found. Shop ID: {shopId}</div>;
  }


  const handleSaveAndProceed = useCallback(() => {
    console.log("Mappings saved:", tempMappings);
    setHasUnsavedChanges(false);
    setMappingFields(tempMappingFields);
    setLastSavedState({ mappings: tempMappings, mappingFields: tempMappingFields });

    toast.success("Mappings saved successfully!");

    // Update mapped channels in the shop
    if (shopId && channelId) {
      updateMappedChannels(shopId, channelId); // Update mapped channels
    }

    navigate(`/channels?shopId=${shopId}`);
  }, [tempMappings, tempMappingFields, navigate, shopId, channelId, updateMappedChannels]);

  const handleDiscardChanges = useCallback(() => {
    setHasUnsavedChanges(false);
    setTempMappings(lastSavedState.mappings);
    setTempMappingFields(lastSavedState.mappingFields);

    toast.info("Changes discarded.");
  }, [lastSavedState]);

  const xmlBuilder = new XMLBuilder();

  const handleDownload = useCallback(() => {
    if (shop && xmlManager && channelId) {
      const items = xmlManager.getData().items;
      const channelSchema = channelSchemas[channelId];

      // Generate XML using XMLBuilder
      const xmlString = xmlBuilder.buildXML(items, tempMappings, channelSchema);

      // Parse the generated XML string using XMLManager
      const parsedXML = xmlManager.parseXMLString(xmlString);

      // Apply mappings using XMLManager
      const mappedXML = xmlManager.applyMappings(tempMappings);

      // Generate the final XML using XMLManager's generateXML
      const finalXMLString = xmlManager.generateXML(mappedXML.items);

      // Download the final XML
      const blob = new Blob([finalXMLString], { type: 'text/xml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${shop.name}-${channelId}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else {
      toast.error("Could not generate XML.");
    }
  }, [xmlManager, tempMappings, shop, channelId, xmlBuilder]);

  const handleRemap = (channelId: string) => {
    navigate(`/channels?shopId=${shopId}`);
  };

  return (
    <div className="p-4">
      <ToastContainer />
      <button
        onClick={handleRemap}
        className="flex items-center gap-2 px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>
      <h1 className="text-2xl font-bold mb-4">Mapping for {channelId} - Shop: {shop.name}</h1>
      <h2 className="text-lg text-gray-600 mb-6">Shop ID: {shopId}</h2>


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
                onFieldChange={(mapping) => handleFieldChange(field.name, mapping)}
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
                onFieldChange={(mapping) => handleFieldChange(field.name, mapping)}
              />
            ))}
        </div>

      )}

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
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Download XML
        </button>
      </div>
    </div>
  );
};

export default ChannelMappingPage;