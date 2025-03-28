import { XMLMapping } from '../types/xml';

export class XMLBuilder {
    buildXML(
        items: Record<string, string>[],
        mappings: XMLMapping[],
        channelSchema: { name: string; optional?: boolean }[]
    ): string {
        // Create XML document with proper declaration
        const xmlDoc = document.implementation.createDocument(null, 'items', null);
        const itemsElement = xmlDoc.documentElement;

        // Add XML declaration manually since createDocument doesn't include it
        const xmlDeclaration = '<?xml version="1.0" encoding="UTF-8"?>\n';

        items.forEach((item) => {
            const itemElement = xmlDoc.createElement('item');

            channelSchema.forEach((field) => {
                const mapping = mappings.find((m) => m.targetField === field.name);
                let fieldValue = '';

                // Handle different mapping types
                if (mapping) {
                    switch (mapping.type) {
                        case 'rename':
                            if (mapping.sourceField) {
                                fieldValue = item[mapping.sourceField] || '';
                            }
                            break;
                        case 'static':
                            fieldValue = mapping.value || '';
                            break;
                        case 'combine':
                            if (mapping.fields) {
                                fieldValue = mapping.fields
                                    .map(field => item[field.value] || '')
                                    .join(mapping.separator || ' ');
                            }
                            break;
                        case 'empty':
                            fieldValue = '';
                            break;
                        default:
                            fieldValue = '';
                    }
                } else {
                    // If no mapping, try to get value directly from item
                    fieldValue = item[field.name] || '';
                }

                // Only create element if we have a value or field is required
                if (fieldValue || !field.optional) {
                    const fieldElement = xmlDoc.createElement(field.name);
                    fieldElement.textContent = this.escapeXml(fieldValue);
                    itemElement.appendChild(fieldElement);
                }
            });

            if (itemElement.hasChildNodes()) {
                itemsElement.appendChild(itemElement);
            }
        });

        const serializer = new XMLSerializer();
        return xmlDeclaration + serializer.serializeToString(xmlDoc);
    }

    private escapeXml(unsafe: string): string {
        return unsafe.replace(/[<>&'"]/g, (c) => {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
                default: return c;
            }
        });
    }
}