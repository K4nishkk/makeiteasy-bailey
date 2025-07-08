import express from 'express';
import cors from 'cors'
import logger from '../utils/logger.js';
import { getItems, modifyItems } from './mongodb.js';

import { fileURLToPath } from 'url';

export default function startServer() {
    const app = express();
    app.use(cors())
    app.use(express.json());

    app.get('/items', async (req, res) => {
        const items = await getItems();
        res.send(items);
    });

    app.post('/items', async (req, res) => {
        try {
            const items = req.body;

            if (!Array.isArray(items) || items.length === 0) {
                res.status(400).json({ error: 'Invalid items format' });
                return
            }

            await modifyItems(items, true);

            res.status(200).json({ message: 'Items saved successfully' });
        } catch (err) {
            console.error('Error saving items:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    const PORT = process.env.PORT || 3001;

    app.listen(PORT, () => {
        logger.info(`Server listening on port ${PORT}`);
    });

    return app;
}

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  startServer();
}