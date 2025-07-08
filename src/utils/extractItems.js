import { fileURLToPath } from 'url';

export function extractItems(chat) {
    return chat
        .split('\n')
        .map(line => line.trim())
        .filter(line => line)
        .map(line => {
            const match = line.match(/^(.+?)\s+(.*)$/);
            if (match) {
                return {
                    itemValue: match[1].trim(),
                    itemName: match[2].trim()
                };
            }
            return null;
        })
        .filter(item => item !== null);
}

export function concatItems(existingItems, newItems) {
    const merged = []

}

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
    const chat1 = "3 tikki \n3 fries \n1 silver foil \n5 sweet corn \n3 totila \n3 filler cheeze \n1 cs pasta 15kg"
    const chat2 = "3 ice creams \n2 fries \n3 breads \n10 sweet corn \n"
    const existing = extractItems(chat1);
    const newItems = extractItems(chat2);

    const merged = structuredClone(existing);

    const existingItemNames = existing.map(item => item.itemName)

    for (const newItem of newItems) {
        const index = existingItemNames.find(newItem.itemName)
        if (index != -1) {
            merged[index].itemValue += newItem.itemValue;
        }
        else {
            merged.push(newItem);
        }
    }

    console.log(merged)
}