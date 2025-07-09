import { fileURLToPath } from 'url';
import type { Item } from '../types/types.js';

export function extractItems(chat: string): Item[] {
    return chat
        .split('\n')
        .map(line => line.trim())
        .filter(line => line)
        .map(line => {
            const match = line.match(/^(.+?)\s+(.*)$/);
            if (match) {
                return {
                    quantity: match[1].trim(),
                    name: match[2].trim()
                };
            }
            return null;
        })
        .filter(item => item !== null);
}

export function concatItems(existing: Item[], newItems: Item[]): Item[] {

    function isNumeric(str: string) {
    if (typeof str !== 'string') return false;
    return !isNaN(parseFloat(str)) && isFinite(Number(str));
    }

    const merged = structuredClone(existing);
    const existingItemNames: string[] = existing.map(item => item.name)

    for (const newItem of newItems) {
        const index = existingItemNames.indexOf(newItem.name)
        if (index != -1) {
            if (isNumeric(merged[index].quantity) && isNumeric(newItem.quantity)) {
                merged[index].quantity = (parseInt(merged[index].quantity) + parseInt(newItem.quantity)).toString()
            }
            else {
                merged[index].quantity = merged[index].quantity + " + " + newItem.quantity;
            }
        }
        else {
            merged.push(newItem);
        }
    }

    return merged
}

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {

    const chat1 = "3 tikki \n3 fries \n1 silver foil \n5kg sweet corn \n3 totila \n3 filler cheeze \n1 cs pasta 15kg"
    const chat2 = "3 ice creams \n2 fries \n3 breads \n10 sweet corn \n"
    const existing = extractItems(chat1);
    const newItems = extractItems(chat2);
    console.log(concatItems(existing, newItems))
}