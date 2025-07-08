import { MongoClient } from "mongodb";
import logger from "../utils/logger.js";

import { BufferJSON } from '@whiskeysockets/baileys';
import pkg from 'lodash';
const { merge } = pkg;

import { configDotenv } from 'dotenv';
configDotenv();

const uri = process.env.MONGO_URI;
let client;

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
  const collection = client.db(process.env.DB_NAME).collection(process.env.ITEMS_COLLECTION);
  return collection
}

export async function saveItems(items) {
  const collection = await getItemsCollection();
  const existing = await getItems() || {};
  const merged = merge([], existing, items);

  await collection.updateOne(
    { _id: process.env.ITEMS_DOC_ID },
    { $set: { items: merged } },
    { upsert: true }
  );

  logger.info(`${items.length} items saved to database`)
};

export async function getItems() {
  const collection = await getItemsCollection();

  const itemsDoc = await collection.findOne({ _id: process.env.ITEMS_DOC_ID })
  return itemsDoc.items
}

async function getAuthCollection() {
  const client = await connectClient();
  const collection = client.db(process.env.DB_NAME).collection(process.env.AUTH_COLLECTION)
  return collection;
}

export async function readAuthData(id) {
  const collection = await getAuthCollection()
  const doc = await collection.findOne({ _id: id })
  if (!doc) return null
  return JSON.parse(JSON.stringify(doc.data), BufferJSON.reviver)
}

export async function writeAuthData(id, value) {
  const collection = await getAuthCollection()
  const existing = await readAuthData(id) || {}
  const merged = merge({}, existing, value)
  const serialized = JSON.parse(JSON.stringify(merged, BufferJSON.replacer))
  await collection.updateOne({ _id: id }, { $set: { data: serialized } }, { upsert: true })
}

export async function removeAuthData(id) {
  const collection = await getAuthCollection()
  await collection.deleteOne({ _id: id });
}