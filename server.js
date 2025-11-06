import express from "express";
import http from "http";
import { Server } from "socket.io";
import mqtt from "mqtt";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

// -----------------------------------------------------------------------------
// Parse command-line arguments

const argv = yargs(hideBin(process.argv))
      .option("host", { type: "string", default: "localhost", describe: "MQTT broker host" })
      .option("port", { type: "number", default: 1883, describe: "MQTT broker port" })
      .option("user", { type: "string", describe: "MQTT username" })
      .option("password", { type: "string", describe: "MQTT password" })
      .option("filter", { type: "string", describe: "Topic filter to subscribe to", default: "#" })
      .help()
      .argv;

const { host, port, user, password, filter } = argv;
console.log(`Connecting to ${host}:${port}...`);
console.log(`Subscribing to topics matching "${filter}"...`);

// -----------------------------------------------------------------------------
// Express server and Socket.IO setup
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

// -----------------------------------------------------------------------------
// Create and manage the topic tree

const broker = "broker";
let tree = { name: broker, children: [] };

function getOrCreateNode(root, name) {
  if (!root.children) root.children = [];
  let node = root.children.find(c => c.name === name);
  if (!node) {
    node = { name, children: [] };
    root.children.push(node);
  }
  return node;
}

// -----------------------------------------------------------------------------
// MQTT client
const mqttClient = mqtt.connect("mqtt://" + host + ":" + port, {
  username: user,
  password: password
});

mqttClient.on("connect", () => {
  mqttClient.subscribe(filter);
});

mqttClient.on("message", (topic, message) => {
  const parts = topic.split("/");
  let node = tree;
  for (const part of parts) {
    node = getOrCreateNode(node, part);
  }
  io.emit("treeUpdate", tree);
});

// -----------------------------------------------------------------------------
// WebSocket connection
io.on("connection", (socket) => {
  socket.emit("treeUpdate", tree);
});

// Start server
server.listen(3000, () => {
  console.log("Vis running! Check port 3000");
});
