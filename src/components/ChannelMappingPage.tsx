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

const channelSchemas: { [key: string]: string[] } = {
  facebook: ['id', 'title', 'description', 'availability', 'condition', 'price', 'link', 'image_link', 'brand'],
  google: ['g_id', 'g_title', 'g_description', 'g_availability', 'g_price', 'g_link', 'g_image_link'],
  snapchat: ['s_id', 's_title', 's_description', 's_price', 's_image_link'],
  tiktok: ['t_id', 't_title', 't_description', 't_price', 't_image_link'],
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
          name: field,
          value: '',
          required: false,
          helpText: '',
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

  return (
    <div className="p-4">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">Mapping for {channelId} - Shop: {shop.name}</h1>
      <h2 className="text-lg text-gray-600 mb-6">Shop ID: {shopId}</h2>

      {tempMappingFields.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {tempMappingFields.map((field) => (
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
      </div>
    </div>
  );
};

export default ChannelMappingPage;