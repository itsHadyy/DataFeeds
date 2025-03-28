import { FieldOption } from './mapping';

export interface XMLItem {
  [key: string]: string;
}

export interface XMLData {
  items: XMLItem[];
  schema: {
    name: string;
    required?: boolean;
    helpText?: string;
    optional?: boolean; 
  }[];
}

export interface XMLField {
  name: string;
  value: string;
  helpText?: string;
  required?: boolean;
  optional?: boolean; 
}

// types/xml.ts
export interface XMLMapping {
  targetField: string;
  type: 'rename' | 'static' | 'combine' | 'empty';
  sourceField?: string;
  value?: string;
  fields?: FieldOption[];
  separator?: string;
  condition?: 'all' | 'onlyIf'; 
  onlyIfField?: string | null;
  onlyIfOperator?: string | null;
  onlyIfValue?: string;
}