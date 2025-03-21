// XMLBuilder.ts
import { XMLMapping } from '../types/xml';

export class XMLBuilder {
    buildXML(
        items: { [key: string]: string }[],
        mappings: XMLMapping[],
        channelSchema: { name: string; optional?: boolean }[]
    ): string {
        const xmlDoc = document.implementation.createDocument(null, 'items', null);
        const itemsElement = xmlDoc.documentElement;

        items.forEach((item) => {
            const itemElement = xmlDoc.createElement('item');

            channelSchema.forEach((field) => {
                const mapping = mappings.find((m) => m.targetField === field.name);

                if (mapping && mapping.value) { // Check if mapping exists and has a value
                    const sourceField = mapping.value;
                    const sourceValue = item[sourceField];

                    if (sourceValue !== undefined && sourceValue !== null && sourceValue !== '') { // Check if value is valid
                        const fieldElement = xmlDoc.createElement(field.name);
                        fieldElement.textContent = sourceValue;
                        itemElement.appendChild(fieldElement);
                    }
                }
            });

            itemsElement.appendChild(itemElement);
        });

        const serializer = new XMLSerializer();
        return serializer.serializeToString(xmlDoc);
    }
}