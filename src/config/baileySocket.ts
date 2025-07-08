import { makeWASocket, DisconnectReason } from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import { useMongoAuthState } from '../utils/useMongoAuthState.js';
import { extractItems } from '../utils/extractItems.js';
import { modifyItems } from './mongodb.js';
import { Boom } from '@hapi/boom'
import logger from '../utils/logger.js';

export default async function startSock() {
    const { state, saveCreds } = await useMongoAuthState('auth');

    const sock = makeWASocket({
        auth: await state()
    });

    sock.ev.on('creds.update', () => saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, qr, lastDisconnect } = update;

        if (qr) {
            logger.info("Scan this QR code with your phone:");
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'open') {
            logger.info('Connected to WhatsApp!');
        } else if (connection === 'close') {
            logger.info('Connection closed.');
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            logger.info('connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect)
            if (shouldReconnect) {
                startSock();
            }
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
                await modifyItems(items);
            }
        }
    });

    function getSocketStatus() {
        const isConnected = sock.ws.isOpen
        return { isConnected }
    }
    
    return getSocketStatus
};