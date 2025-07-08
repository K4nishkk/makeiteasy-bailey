import { MongoClient } from "mongodb";
import logger from "../utils/logger.js";
import type { Item } from "../types/types.ts"

import { BufferJSON } from '@whiskeysockets/baileys';
import pkg from 'lodash';
const { merge } = pkg;

import { concatItems } from "../utils/extractItems.js";
import { AUTH_COLLECTION, DB_NAME, ITEMS_COLLECTION, ITEMS_DOC_ID } from "../constants/constants.js";

import { configDotenv } from 'dotenv';
configDotenv();

type MongoDoc = {
  _id: string;
  data: any;
};

const uri = process.env.MONGO_URI as string;
let client: MongoClient | null = null;

export const connectClient = async () => {
  if (!client) {
    client = new MongoClient(uri);
    try {
      await client.connect();
      logger.info("Connected to MongoDB");
    } catch (error) {
      logger.error("Failed to connect to MongoDB");
      throw error;
    }
  }
  return client;
};

const getItemsCollection = async () => {
  const client = await connectClient();
  const collection = client.db(DB_NAME).collection<MongoDoc>(ITEMS_COLLECTION);
  return collection
}

export async function modifyItems(items: Item[], replace: boolean = false): Promise<void> {
  const collection = await getItemsCollection();
  const existing = await getItems() || {};
  const merged = replace ? items : concatItems(existing, items);

  await collection.updateOne(
    { _id: ITEMS_DOC_ID},
    { $set: { items: merged } },
    { upsert: true }
  );

  logger.info(`${items.length} items saved to database`)
};

export async function getItems(): Promise<Item[]> {
  const collection = await getItemsCollection();

  const itemsDoc: any = await collection.findOne({ _id: ITEMS_DOC_ID })
  if (itemsDoc) return itemsDoc.items
  else return []
}

async function getAuthCollection() {
  const client = await connectClient();
  const collection = client.db(DB_NAME).collection<MongoDoc>(AUTH_COLLECTION)
  return collection;
}

export async function readAuthData(id: string) {
  const collection = await getAuthCollection()
  const doc = await collection.findOne({ _id: id })
  if (!doc) return null
  return JSON.parse(JSON.stringify(doc.data), BufferJSON.reviver)
}

export async function writeAuthData(id: string, value: any) {
  const collection = await getAuthCollection()
  const existing = await readAuthData(id) || {}
  const merged = merge({}, existing, value)
  const serialized = JSON.parse(JSON.stringify(merged, BufferJSON.replacer))
  await collection.updateOne({ _id: id }, { $set: { data: serialized } }, { upsert: true })
}

export async function removeAuthData(id: string) {
  const collection = await getAuthCollection()
  await collection.deleteOne({ _id: id });
}