import { makeWASocket } from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import { useMongoAuthState } from '../utils/useMongoAuthState.js';
import { extractItems } from '../utils/extractItems.js';
import { saveItems } from './mongodb.js';

export default async function startSock() {
    const { state, saveCreds } = await useMongoAuthState('auth');

    const sock = makeWASocket({
        auth: await state()
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, qr } = update;

        if (qr) {
            console.log("Scan this QR code with your phone:");
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'open') {
            console.log('Connected to WhatsApp!');
        } else if (connection === 'close') {
            console.log('Connection closed. Reconnecting...');
            startSock();
        }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        const message = messages[0]?.message
        const chat = message?.conversation || message?.extendedTextMessage?.text
        if (type === 'notify' && chat) {
            const remoteJid = messages[0]?.key?.remoteJid
            const fromMe = messages[0]?.key?.fromMe
            if (remoteJid == process.env.JID && !fromMe) {
                const items = extractItems(chat)
                await saveItems(items);
            }
        }
    });
};