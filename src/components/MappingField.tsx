import React, { useState, useEffect } from 'react';
import { ChevronDown, MessageSquare, Eye, Lock, Unlock } from 'lucide-react';
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
  // onABTestClick,
  // onEditClick,
  // optional,
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

  const [staticValue, setStaticValue] = useState(
    mappingType === 'static' && fieldValue ? fieldValue : ''
  );
  const [condition, setCondition] = useState<'all' | 'onlyIf'>('all');
  const [onlyIfField, setOnlyIfField] = useState<string | null>(null);
  const [onlyIfOperator, setOnlyIfOperator] = useState<string | null>(null);
  const [onlyIfValue, setOnlyIfValue] = useState<string>('');
  const [showConditionDropdown, setShowConditionDropdown] = useState(false);

  
  useEffect(() => {
    if (fieldName.toLowerCase() === 'id' && !isLocked) {
      toggleLock();
    }
  }, [fieldName, isLocked, toggleLock]);

  const mappingTypes = [
    { value: 'rename', label: 'Rename' },
    { value: 'static', label: 'Add static value' },
    { value: 'combine', label: 'Combine' },
    { value: 'empty', label: 'Leave empty' },
  ];

  const operators = [
    { value: 'is equal to', label: 'Is equal to' },
    { value: 'is not equal to', label: 'Is not equal to' },
    { value: 'includes', label: 'Includes' },
    { value: 'doesn\'t include', label: 'Doesn\'t include' },
  ];

  const buildMappingObject = (): XMLMapping => {
    const baseMapping: any = {
      targetField: fieldName,
      type: mappingType,
    };

    
    if (mappingType === 'rename') {
      baseMapping.sourceField = selectedField;
    } else if (mappingType === 'static') {
      baseMapping.value = staticValue;
    } else if (mappingType === 'combine') {
      baseMapping.fields = selectedFields;
      baseMapping.separator = separator;
    }

    
    if (condition === 'onlyIf') {
      baseMapping.condition = {
        field: onlyIfField || '',
        operator: onlyIfOperator || '',
        value: onlyIfValue
      };
    } else {
      baseMapping.condition = 'all';
    }

    return baseMapping;
  };

  const handleStaticValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStaticValue(e.target.value);
    onFieldChange(buildMappingObject());
  };

  const handleFieldSelection = (field: FieldOption) => {
    if (!field) return;

    handleFieldSelect(field, () => {
      onFieldChange(buildMappingObject());
    });
  };

  const handleSeparatorChange = (newSeparator: string) => {
    setSeparator(newSeparator);
    if (mappingType === 'combine' && selectedFields.length > 0) {
      onFieldChange(buildMappingObject());
    }
  };

  const handleMappingTypeSelect = (type: string) => {
    handleMappingTypeChange(type);
    if (type === 'static') setStaticValue('');
    onFieldChange(buildMappingObject());
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
    setShowConditionDropdown(false);
    onFieldChange(buildMappingObject());
  };

  const handleOnlyIfFieldChange = (field: string) => {
    setOnlyIfField(field);
    onFieldChange(buildMappingObject());
  };

  const handleOnlyIfOperatorChange = (operator: string) => {
    setOnlyIfOperator(operator);
    onFieldChange(buildMappingObject());
  };

  const handleOnlyIfValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOnlyIfValue(e.target.value);
    onFieldChange(buildMappingObject());
  };

  const toggleConditionDropdown = () => {
    if (!isLocked) {
      setShowConditionDropdown(!showConditionDropdown);
    }
  };

  return (
    <div className="border-b border-gray-200">
      <div className="p-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6 border-b pb-4">
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
            {/* Lock/Unlock Button - Hidden for 'id' field */}
            {fieldName.toLowerCase() !== 'id' && (
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
            )}
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
                  className={`w-full px-3 py-2 text-sm border rounded-md ${isLocked ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                  onBlur={() => onFieldChange(buildMappingObject())}
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

          {/* Condition Dropdown */}
          <div className="col-span-2">
            <div className="relative">
              <button
                onClick={toggleConditionDropdown}
                disabled={isLocked}
                className={`w-full px-3 py-2 text-left text-sm border rounded-md flex items-center justify-between bg-white ${isLocked ? 'opacity-75 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
              >
                <span>{condition === 'all' ? 'All Products' : 'Only If'}</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {showConditionDropdown && !isLocked && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                  <button
                    className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => handleConditionChange('all')}
                  >
                    <span>All Products</span>
                  </button>
                  <button
                    className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => handleConditionChange('onlyIf')}
                  >
                    <span>Only If</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {condition === 'onlyIf' && (
            <div className="col-span-12 mt-4">
              <div className="grid grid-cols-12 gap-4">
                {/* Field Dropdown */}
                <div className="col-span-4">
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown('only-if-field')}
                      disabled={isLocked}
                      className={`w-full px-3 py-2 text-left text-sm border rounded-md flex items-center justify-between bg-white ${isLocked ? 'opacity-75 cursor-not-allowed' : 'hover:bg-gray-50'
                        }`}
                    >
                      <span>{onlyIfField || 'Select field'}</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>

                    {activeDropdown === 'only-if-field' && !isLocked && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                        {fieldOptions.map((option) => (
                          <button
                            key={option.value}
                            className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"
                            onClick={() => {
                              handleOnlyIfFieldChange(option.value);
                              setDropdownState(prev => ({ ...prev, activeDropdown: null }));
                            }}
                          >
                            <span>{option.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Operator Dropdown */}
                <div className="col-span-4">
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown('only-if-operator')}
                      disabled={isLocked}
                      className={`w-full px-3 py-2 text-left text-sm border rounded-md flex items-center justify-between bg-white ${isLocked ? 'opacity-75 cursor-not-allowed' : 'hover:bg-gray-50'
                        }`}
                    >
                      <span>{onlyIfOperator || 'Select operator'}</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>

                    {activeDropdown === 'only-if-operator' && !isLocked && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                        {operators.map((operator) => (
                          <button
                            key={operator.value}
                            className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"
                            onClick={() => {
                              handleOnlyIfOperatorChange(operator.value);
                              setDropdownState(prev => ({ ...prev, activeDropdown: null }));
                            }}
                          >
                            <span>{operator.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Value Input */}
                <div className="col-span-4">
                  <input
                    type="text"
                    value={onlyIfValue}
                    onChange={handleOnlyIfValueChange}
                    disabled={isLocked}
                    placeholder="Enter value"
                    className={`w-full px-3 py-2 text-sm border rounded-md ${isLocked ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="col-span-2 flex justify-end gap-2">
            {/* <button
              onClick={onEditClick}
              disabled={isLocked}
              className={`p-2 rounded-md ${isLocked
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              <PenSquare className="h-4 w-4" />
            </button> */}
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