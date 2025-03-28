import React, { useState } from 'react';
import { ChevronDown, MessageSquare, Shapes, PenSquare, Eye, Lock, Unlock } from 'lucide-react';
import { FieldOption } from '../types/mapping';
import { XMLMapping } from '../types/xml';
import FieldSelectionDropdown from './FieldSelectionDropdown';
import CombineFieldsUI from './CombineFieldsUI';
import { useMappingField } from '../hooks/useMappingField';

interface MappingFieldProps {
  fieldName: string;
  fieldValue: string;
  fieldOptions: FieldOption[];
  helpText?: string;
  onFieldChange: (mapping: XMLMapping) => void;
  onPreviewClick: () => void;
  onCommentClick: () => void;
  onABTestClick: () => void;
  onEditClick: () => void;
  optional?: boolean;
}

const MappingField: React.FC<MappingFieldProps> = ({
  fieldName,
  fieldValue,
  fieldOptions,
  helpText,
  onFieldChange,
  onPreviewClick,
  onCommentClick,
  onABTestClick,
  onEditClick,
  optional,
}) => {
  const {
    state,
    dropdownState,
    actions,
    setDropdownState
  } = useMappingField(fieldValue, fieldName);

  const { isLocked, mappingType, selectedField, selectedFields, separator } = state;
  const { activeDropdown, isFieldDropdownOpen } = dropdownState;
  const {
    toggleDropdown,
    handleMappingTypeChange,
    handleFieldSelect,
    handleRemoveField,
    toggleLock,
    setSeparator,
  } = actions;

  const [staticValue, setStaticValue] = useState('');
  const [condition, setCondition] = useState<'all' | 'onlyIf'>('all');
  const [onlyIfField, setOnlyIfField] = useState<string | null>(null);
  const [onlyIfOperator, setOnlyIfOperator] = useState<string | null>(null);
  const [onlyIfValue, setOnlyIfValue] = useState<string>('');

  const mappingTypes = [
    { value: 'rename', label: 'Rename' },
    { value: 'static', label: 'Add static value' },
    { value: 'combine', label: 'Combine' },
    { value: 'empty', label: 'Leave empty' },
  ];

  const operators = [
    'is equal to',
    'is not equal to',
    'includes',
    'doesn\'t include',
  ];

  const handleStaticValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStaticValue(value);

    const baseMapping = {
      targetField: fieldName,
      type: 'static',
      value: value,
      condition: condition,
      ...(condition === 'onlyIf' && onlyIfField && onlyIfOperator && onlyIfValue
        ? {
          onlyIfField,
          onlyIfOperator,
          onlyIfValue
        }
        : {})
    };

    onFieldChange(baseMapping);
  };
  const handleFieldSelection = (field: FieldOption) => {
    if (!field) return;

    handleFieldSelect(field, () => {
      const baseMapping = {
        targetField: fieldName,
        condition: condition,
        ...(condition === 'onlyIf' && onlyIfField && onlyIfOperator && onlyIfValue
          ? {
            onlyIfField,
            onlyIfOperator,
            onlyIfValue
          }
          : {})
      };

      if (mappingType === 'rename') {
        onFieldChange({
          ...baseMapping,
          type: 'rename',
          sourceField: field.value
        });
      } else if (mappingType === 'combine') {
        onFieldChange({
          ...baseMapping,
          type: 'combine',
          fields: [...selectedFields, field],
          separator: separator
        });
      }
    });
  };

  const handleSeparatorChange = (newSeparator: string) => {
    setSeparator(newSeparator);
    if (mappingType === 'combine' && selectedFields.length > 0) {
      const baseMapping = {
        targetField: fieldName,
        type: 'combine',
        fields: selectedFields,
        separator: newSeparator,
        condition: condition,
        ...(condition === 'onlyIf' && onlyIfField && onlyIfOperator && onlyIfValue
          ? {
            onlyIfField,
            onlyIfOperator,
            onlyIfValue
          }
          : {})
      };
      onFieldChange(baseMapping);
    }
  };

  const handleMappingTypeSelect = (type: string) => {
    handleMappingTypeChange(type);

    const baseMapping = {
      targetField: fieldName,
      type: type as 'empty' | 'static',
      condition: condition,
      ...(condition === 'onlyIf' && onlyIfField && onlyIfOperator && onlyIfValue
        ? {
          onlyIfField,
          onlyIfOperator,
          onlyIfValue
        }
        : {})
    };

    if (type === 'empty') {
      onFieldChange(baseMapping);
    } else if (type === 'static') {
      setStaticValue('');
      onFieldChange({
        ...baseMapping,
        value: ''
      });
    }
  };

  const handleAddField = () => {
    if (!isLocked) {
      setDropdownState(prev => ({ ...prev, isFieldDropdownOpen: true }));
    }
  };

  const handleCloseDropdown = () => {
    setDropdownState(prev => ({ ...prev, isFieldDropdownOpen: false }));
  };

  const handleConditionChange = (newCondition: 'all' | 'onlyIf') => {
    setCondition(newCondition);
  };

  const handleOnlyIfFieldChange = (field: string) => {
    setOnlyIfField(field);
  };

  const handleOnlyIfOperatorChange = (operator: string) => {
    setOnlyIfOperator(operator);
  };

  const handleOnlyIfValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOnlyIfValue(e.target.value);
  };

  return (
    <div className="border-b border-gray-200">
      <div className="p-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6 border-b pb-4" >
          <div className="flex items-center gap-4">
            {/* Comments Button */}
            <button
              onClick={onCommentClick}
              disabled={isLocked}
              className={`btn-sm flex items-center gap-2 ${isLocked ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Comments</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Lock/Unlock Button */}
            <button
              onClick={toggleLock}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isLocked
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
            >
              {isLocked ? (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Unlock</span>
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4" />
                  <span>Lock</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mapping Controls */}
        <div className="grid grid-cols-12 gap-4">
          {/* Field Name */}
          <div className="col-span-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">{fieldName}</span>
              {helpText && (
                <div className="text-gray-400 cursor-help" title={helpText}>
                  <span className="text-xs">?</span>
                </div>
              )}
            </div>
          </div>

          {/* Mapping Type Dropdown */}
          <div className="col-span-2">
            <div className="relative">
              <button
                onClick={() => toggleDropdown('mapping-type')}
                disabled={isLocked}
                className={`w-full px-3 py-2 text-left text-sm border rounded-md flex items-center justify-between bg-white ${isLocked ? 'opacity-75 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
              >
                <span>{mappingTypes.find(t => t.value === mappingType)?.label || 'Rename'}</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {activeDropdown === 'mapping-type' && !isLocked && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                  {mappingTypes.map((type) => (
                    <button
                      key={type.value}
                      className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"
                      onClick={() => handleMappingTypeSelect(type.value)}
                    >
                      <span>{type.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Field Selection Area */}
          <div className="col-span-4">
            <div className="relative">
              {mappingType === 'combine' ? (
                <CombineFieldsUI
                  selectedFields={selectedFields}
                  onAddField={handleAddField}
                  onRemoveField={handleRemoveField}
                  onSeparatorChange={handleSeparatorChange}
                  separator={separator}
                  onFieldBoxClick={handleAddField}
                  isLocked={isLocked}
                />
              ) : mappingType === 'static' ? (
                <input
                  type="text"
                  value={staticValue}
                  onChange={handleStaticValueChange}
                  disabled={isLocked}
                  placeholder="Enter static value..."
                  className={`w-full px-3 py-2 text-sm border rounded-md ${isLocked ? 'bg-gray-50 cursor-not-allowed' : ''
                    }`}
                />
              ) : (
                <button
                  onClick={handleAddField}
                  disabled={isLocked}
                  className={`w-full px-3 py-2 text-left text-sm border rounded-md flex items-center justify-between bg-white ${isLocked ? 'opacity-75 cursor-not-allowed' : 'hover:bg-gray-50'
                    }`}
                >
                  <span>{selectedField || 'Select field'}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              )}

              {!isLocked && (
                <FieldSelectionDropdown
                  isOpen={isFieldDropdownOpen}
                  onClose={handleCloseDropdown}
                  onSelect={handleFieldSelection}
                  selectedValue={selectedField}
                  fieldOptions={fieldOptions}
                  mode={mappingType === 'combine' ? 'combine' : 'single'}
                  mappingType={mappingType}
                />
              )}
            </div>
          </div>

          <div className="col-span-2">
            <div className="flex rounded-md overflow-hidden border">
              <button
                onClick={() => {
                  handleConditionChange('all');
                  // Update mapping when switching to 'all'
                  if (mappingType === 'rename' && selectedField) {
                    onFieldChange({
                      targetField: fieldName,
                      type: 'rename',
                      sourceField: selectedField,
                      condition: 'all'
                    });
                  }
                  // Add similar updates for other mapping types
                }}
                disabled={isLocked}
                className={`flex-1 px-3 py-2 text-sm bg-white border-r ${isLocked ? 'opacity-75 cursor-not-allowed' : 'hover:bg-gray-50'} ${condition === 'all' ? 'bg-blue-100' : ''}`}
              >
                All Products
              </button>
              <button
                onClick={() => {
                  handleConditionChange('onlyIf');
                  // Update mapping when switching to 'onlyIf'
                  if (mappingType === 'rename' && selectedField) {
                    onFieldChange({
                      targetField: fieldName,
                      type: 'rename',
                      sourceField: selectedField,
                      condition: 'onlyIf',
                      onlyIfField: onlyIfField || '',
                      onlyIfOperator: onlyIfOperator || '',
                      onlyIfValue: onlyIfValue
                    });
                  }
                  // Add similar updates for other mapping types
                }}
                disabled={isLocked}
                className={`flex-1 px-3 py-2 text-sm bg-white ${isLocked ? 'opacity-75 cursor-not-allowed' : 'hover:bg-gray-50'} ${condition === 'onlyIf' ? 'bg-blue-100' : ''}`}
              >
                Only IF
              </button>
            </div>
          </div>
          {condition === 'onlyIf' && (
            <div className="col-span-12 mt-4">
              <div className="flex items-center gap-2">
                <select
                  value={onlyIfField || ''}
                  onChange={(e) => {
                    handleOnlyIfFieldChange(e.target.value);
                    // Trigger mapping update when condition changes
                    if (mappingType === 'rename' && selectedField) {
                      onFieldChange({
                        targetField: fieldName,
                        type: 'rename',
                        sourceField: selectedField,
                        condition: 'onlyIf',
                        onlyIfField: e.target.value,
                        onlyIfOperator,
                        onlyIfValue
                      });
                    } else if (mappingType === 'static' && staticValue) {
                      onFieldChange({
                        targetField: fieldName,
                        type: 'static',
                        value: staticValue,
                        condition: 'onlyIf',
                        onlyIfField: e.target.value,
                        onlyIfOperator,
                        onlyIfValue
                      });
                    } else if (mappingType === 'combine' && selectedFields.length > 0) {
                      onFieldChange({
                        targetField: fieldName,
                        type: 'combine',
                        fields: selectedFields,
                        separator: separator,
                        condition: 'onlyIf',
                        onlyIfField: e.target.value,
                        onlyIfOperator,
                        onlyIfValue
                      });
                    }
                  }}
                  className="p-2 border rounded-md"
                >
                  <option value="">Select Input Field</option>
                  {fieldOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={onlyIfOperator || ''}
                  onChange={(e) => {
                    handleOnlyIfOperatorChange(e.target.value);
                    // Similar update logic as above
                    if (mappingType === 'rename' && selectedField) {
                      onFieldChange({
                        targetField: fieldName,
                        type: 'rename',
                        sourceField: selectedField,
                        condition: 'onlyIf',
                        onlyIfField,
                        onlyIfOperator: e.target.value,
                        onlyIfValue
                      });
                    }
                    // Add similar updates for other mapping types
                  }}
                  className="p-2 border rounded-md"
                >
                  <option value="">Select Operator</option>
                  {operators.map((operator) => (
                    <option key={operator} value={operator}>
                      {operator}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={onlyIfValue}
                  onChange={(e) => {
                    setOnlyIfValue(e.target.value);
                    // Similar update logic as above
                    if (mappingType === 'rename' && selectedField) {
                      onFieldChange({
                        targetField: fieldName,
                        type: 'rename',
                        sourceField: selectedField,
                        condition: 'onlyIf',
                        onlyIfField,
                        onlyIfOperator,
                        onlyIfValue: e.target.value
                      });
                    }
                    // Add similar updates for other mapping types
                  }}
                  placeholder="Enter Text"
                  className="p-2 border rounded-md"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="col-span-2 flex justify-end gap-2">
            <button
              onClick={onEditClick}
              disabled={isLocked}
              className={`p-2 rounded-md ${isLocked
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              <PenSquare className="h-4 w-4" />
            </button>
            <button
              onClick={onPreviewClick}
              className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MappingField;