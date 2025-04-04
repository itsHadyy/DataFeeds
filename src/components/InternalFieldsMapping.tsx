import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MappingField from './MappingField';
import XMLUploader from './XMLUploader';
import NavigationBar from './NavigationBar';
import { FieldOption } from '../types/mapping';
import { XMLData, XMLField, XMLMapping } from '../types/xml';
import { XMLManager } from '../services/XMLManager';
import useShops from '../hooks/useShops';
import { useGlobalUI } from '../contexts/GlobalUI';
import { useNavigate } from 'react-router-dom';

const InternalFieldsMapping: React.FC = () => {
    const navigate = useNavigate();
    const { updateInternalMappings } = useShops();

    const { shopId } = useParams<{ shopId: string }>();
    const { setShowComments, setActiveCommentField } = useGlobalUI();
    const [xmlManager] = useState(() => new XMLManager());
    const { shops } = useShops();

    const [showPreviewDialog, setShowPreviewDialog] = useState(false);
    const [previewField, setPreviewField] = useState<XMLField | null>(null);
    const [originalState, setOriginalState] = useState<{
        mappings: XMLMapping[];
        mappingFields: XMLField[];
    }>({ mappings: [], mappingFields: [] });

    const [tempMappings, setTempMappings] = useState<XMLMapping[]>([]);
    const [tempMappingFields, setTempMappingFields] = useState<XMLField[]>([]);
    const [modifiedXMLString, setModifiedXMLString] = useState<string | null>(null);

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

    const selectedShop = shops.find((shop) => shop.id === shopId);

    useEffect(() => {
        if (shopId && selectedShop) {
            
            const savedMappings = selectedShop.internalMappings ? [...selectedShop.internalMappings] : [];
            setTempMappings(savedMappings);
            
            
            if (selectedShop.xmlContent) {
                parseAndInitializeXML(selectedShop.xmlContent, savedMappings);
            }
        }
    }, [shopId, selectedShop]);

    const parseAndInitializeXML = (xmlContent: string, savedMappings: XMLMapping[] = []) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
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

        const xmlData = { items: itemsData, schema: schemaArray };
        xmlManager.setData(xmlData);

        const uniqueFields = new Set(xmlData.items.flatMap((item) => Object.keys(item)));
        const newMappingFields = Array.from(uniqueFields).map((field) => ({
            name: field,
            value: '',
            required: xmlData.schema.find((s) => s.name === field)?.required || false,
            helpText: xmlData.schema.find((s) => s.name === field)?.helpText,
        }));

        
        if (savedMappings && savedMappings.length > 0) {
            savedMappings.forEach(mapping => {
                const fieldIndex = newMappingFields.findIndex(f => f.name === mapping.targetField);
                if (fieldIndex >= 0) {
                    newMappingFields[fieldIndex].value = mapping.value || '';
                }
            });
        }

        setTempMappingFields(newMappingFields);
        setOriginalState({ mappings: savedMappings || [], mappingFields: newMappingFields });
    };

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

        setTempMappingFields((prev) =>
            prev.map((field) =>
                field.name === fieldName
                    ? { ...field, value: mapping.value || field.value }
                    : field
            )
        );
    }, []);

    const handleDiscardChanges = useCallback(() => {
        
        setTempMappings(originalState.mappings);
        setTempMappingFields(originalState.mappingFields);

        toast.info('Changes discarded successfully!', {
            position: 'top-right',
            autoClose: 3000,
        });
    }, [originalState]);

    const handleFieldsExtracted = useCallback((data: XMLData) => {
        xmlManager.setData(data);
        const uniqueFields = new Set(data.items.flatMap((item) => Object.keys(item)));
        const newMappingFields = Array.from(uniqueFields).map((field) => ({
            name: field,
            value: '',
            required: data.schema.find((s) => s.name === field)?.required || false,
            helpText: data.schema.find((s) => s.name === field)?.helpText,
        }));

        setTempMappingFields(newMappingFields);
        setTempMappings([]);
        setOriginalState({ mappings: [], mappingFields: newMappingFields });
    }, [xmlManager]);

    const handleApplyChanges = useCallback(() => {
        const xmlData = xmlManager.getData();
        if (!xmlData) {
            toast.error('No XML data available.');
            return;
        }

        const updatedData = xmlManager.applyMappings(tempMappings);
        if (updatedData) {
            const xmlString = xmlManager.generateXML(updatedData.items);
            setModifiedXMLString(xmlString);

            
            if (shopId) {
                updateInternalMappings(shopId, tempMappings);
                
                setOriginalState({
                    mappings: tempMappings,
                    mappingFields: tempMappingFields
                });
            }

            toast.success('Changes applied and saved successfully!');
        } else {
            toast.error('Failed to apply mappings.');
        }
    }, [xmlManager, tempMappings, tempMappingFields, shopId, updateInternalMappings]);

    const handleNavigateToChannels = useCallback(() => {
        if (shopId) {
            navigate(`/channels?shopId=${shopId}`);
        }
    }, [navigate, shopId]);

    const handlePreviewClick = (field: XMLField) => {
        setPreviewField(field);
        const xmlData = xmlManager.getData();

        if (xmlData?.items) {
            try {
                const mappedData = xmlManager.applyMappings(tempMappings);

                const previewRows = xmlData.items.map((item, index) => {
                    const idField = Object.keys(item).find(key =>
                        key.toLowerCase().includes('id') ||
                        key.toLowerCase().includes('sku') ||
                        key.toLowerCase().includes('code')
                    );

                    const titleField = Object.keys(item).find(key =>
                        key.toLowerCase().includes('title') ||
                        key.toLowerCase().includes('name') ||
                        key.toLowerCase().includes('product')
                    );

                    return {
                        productId: idField ? item[idField] : `ITEM_${index + 1}`,
                        productTitle: titleField ? item[titleField] : 'Product',
                        fieldName: field.name,
                        originalValue: item[field.name] || 'N/A',
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

    const handleCommentClick = (fieldName?: string) => {
        const fieldToSet: string | null = fieldName ? fieldName : null;
        setActiveCommentField(fieldToSet);
        setShowComments(true);

        
        const fieldComments = selectedShop?.comments?.filter(c => c.field === fieldName) || [];
        if (fieldComments.length > 0) {
            toast.info(`${fieldComments.length} comments on ${fieldName}`, {
                autoClose: 2000
            });
        }
    };

    if (!selectedShop) {
        return <div className="p-8">Shop not found</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <NavigationBar
                selectedShopId={shopId}
                shops={shops}
            />

            <div className="flex-1 p-8 overflow-y-auto">
                <ToastContainer />

                {!selectedShop.xmlContent && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload XML File</h2>
                        <XMLUploader
                            shopId={shopId!}
                            onFieldsExtracted={handleFieldsExtracted}
                        />
                    </div>
                )}

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
                    <button
                        onClick={handleNavigateToChannels}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                        Go to Channel Mapping
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

                {tempMappingFields.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        {tempMappingFields.map((field) => (
                            <MappingField
                                key={field.name}
                                fieldName={field.name}
                                fieldValue={field.value}
                                fieldOptions={getFieldOptions(xmlManager.getData())}
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

export default InternalFieldsMapping;