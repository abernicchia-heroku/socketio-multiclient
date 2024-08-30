// code based on https://socket.io/docs/v4/load-testing/#manual-client-creation adapted to run locally and on Heroku

const { io } = require("socket.io-client");
const winston  = require("winston");

const URL = process.env.CLIENT_WSSERVERURL || "http://localhost:3000";
const MAX_CLIENTS = process.env.MAX_CLIENTS || 5;
const CLIENT_CREATION_INTERVAL_IN_MS = process.env.CLIENT_CREATION_INTERVAL_IN_MS || 250;
const EMIT_INTERVAL_IN_MS = process.env.EMIT_INTERVAL_IN_MS || 2000;

let clientCount = 0;
let lastReport = new Date().getTime();
let packetsSinceLastReport = 0;

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});


logger.info(`Connecting to Websocket server URL: ${URL}`);

const createClient = () => {
  logger.debug(`creating new socket.io client`);

  const transports = ["websocket"];

  const socket = io(URL, {
    transports,
  });

  clientCount++;

  setInterval(() => {
     socket.emit("c2s-event", Math.floor(Math.random() * 1000000));
  }, EMIT_INTERVAL_IN_MS);

  socket.on("seq-num", (data) => {
    logger.debug(`seq-num event data[${data}] clientID[${socket.id}]`);
    packetsSinceLastReport++;
  });

  socket.on("s2c-event", (data) => {
      logger.debug(`server2client event data[${data}] clientID[${socket.id}]`);
  });

  socket.on("disconnect", (reason) => {
    logger.info(`disconnect due to ${reason}`);
    clientCount--;
  });

  if (clientCount < MAX_CLIENTS) {
    setTimeout(createClient, CLIENT_CREATION_INTERVAL_IN_MS);
  }
};

createClient();

const printReport = () => {
  const now = new Date().getTime();
  const durationSinceLastReport = (now - lastReport) / 1000;
  const packetsPerSeconds = (
    packetsSinceLastReport / durationSinceLastReport
  ).toFixed(2);

  logger.info(`client count: ${clientCount} ; average packets received per second: ${packetsPerSeconds}`);

  packetsSinceLastReport = 0;
  lastReport = now;
};

setInterval(createClient, 10000);
setInterval(printReport, 5000);