import startServer from './config/server.js';
import startSock from './config/baileySocket.js';
import logger from './utils/logger.js';

const app = startServer();
const getSocketStatus = await startSock();

app.get("/ping", (req, res) => {
    logger.info("ping received")
    res.status(200).json({ isConnected: getSocketStatus() })
    return
})