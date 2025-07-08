import startServer from './config/server.js';
import startSock from './config/baileySocket.js';

const app = startServer();
const getSocketStatus = await startSock();

app.get("/ping", (req, res) => {
    res.status(200).json({ isConnected: getSocketStatus() })
    return
})