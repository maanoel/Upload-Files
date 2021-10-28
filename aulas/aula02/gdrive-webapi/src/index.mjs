import https from "https";
import fs from "fs";
import { logger } from "./logger.mjs";
import Routes from "./routes.mjs";
import { Server } from "socket.io";

const PORT = process.env.PORT || 3000;

const localHostSSL = {
  key: fs.readFileSync("./certificates/key.pem"),
  cert: fs.readFileSync("./certificates/cert.pem"),
};

const routes = new Routes();

const server = https.createServer(localHostSSL, routes.handler.bind(routes));

const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: false,
  },
});

routes.setSocketInstance(io);

io.on("connection", (sokect) => logger.info(`someone connected: ${sokect.id}`));

const startServer = () => {
  const { address, port } = server.address();
  logger.info(`app running at https://${address}:${port}`);
};

server.listen(PORT, startServer);
