const http = require("http");
const debug = require("debug")("node-rest:server");

const app = require("../app/app");

const normalizePort = (val) => {
  const port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
};

const onError = (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? `Pipe ${port}` : `Port: ${port}`;

  switch (error.code) {
    case "EACCES":
      console.log(`${bind} requires elevated priveleges.`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.log(`${bind} is already in use.`);
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === "string" ? `Pipe ${addr}` : `Port: ${addr.port}`;
  debug(`Listening on ${bind}`);
};

const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);
const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Server listening on Port: ${port}`);
});
server.on("error", onError);
server.on("listening", onListening);
