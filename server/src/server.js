import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { initSockets } from './sockets/index.js';
import { startJobs } from './jobs/index.js';

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: env.CLIENT_URL, credentials: true } });

initSockets(io);

const start = async () => {
  await connectDB();
  startJobs();
  httpServer.listen(env.PORT, () => console.log(`Server running on port ${env.PORT}`));
};

start().catch(console.error);
