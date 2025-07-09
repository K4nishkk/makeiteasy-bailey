import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { fileURLToPath } from 'url';

import { configDotenv } from 'dotenv';
configDotenv();

type ExcelEntry = {
  date: string,
  items: Array<{ date?: string, name: string, quantity: string }>
}

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL as string,
  key: (process.env.GOOGLE_PRIVATE_KEY as string).split(String.raw`\n`).join('\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID as string, serviceAccountAuth);

export async function insertInExcel(entry: ExcelEntry) {
  if (entry.items.length === 0) return

  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];

  await sheet.loadCells('Z2');
  const currDateCell = sheet.getCell(1, 25);
  const currDate = currDateCell.value;

  if (currDate !== entry.date) {
    currDateCell.value = entry.date;
    entry.items[0].date = entry.date;
  }

  await sheet.setHeaderRow(["date", "name", "quantity"]);
  await sheet.addRows(entry.items)

  await sheet.saveUpdatedCells();
}

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  const shoppingData = [
    {
      date: "2025-07-01",
      items: [
        { name: "Apples", quantity: "5" },
        { name: "Milk", quantity: "2" }
      ]
    },
    {
      date: "2025-07-02",
      items: [
        { name: "Bananas", quantity: "12" },
        { name: "Bread", quantity: "1" }
      ]
    },
    {
      date: "2025-07-03",
      items: [
        { name: "Tomatoes", quantity: "6" },
        { name: "Lettuce", quantity: "1" },
        { name: "Cereal", quantity: "2" },
        { name: "Milk", quantity: "1" }
      ]
    },
    {
      date: "2025-07-04",
      items: [
        { name: "Chicken", quantity: "1" }
      ]
    },
    {
      date: "2025-07-05",
      items: [
        { name: "Rice", quantity: "2" },
        { name: "Beans", quantity: "3" },
        { name: "Coffee", quantity: "1" },
        { name: "Cream", quantity: "1" },
        { name: "Pasta", quantity: "2" },
        { name: "Sauce", quantity: "1" }
      ]
    },
    {
      date: "2025-07-06",
      items: [
        { name: "Oranges", quantity: "10" },
        { name: "Cheese", quantity: "1" }
      ]
    }
  ];

  async function main() {
    for (const entry of shoppingData) {
      await insertInExcel(entry)
    }
  }
  main()
}