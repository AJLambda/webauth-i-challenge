const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
// const bcrypt = require("bcryptjs");

// const db = require("./database/dbConfig.js");
// const Users = require("./users/users-model.js");
// const protected = require("./auth/protected-middleware.js");

const server = express();
const parser = express.json();

server.use(helmet());
server.use(parser);
server.use(cors());

// sanity check
server.get("/", (req, res) => {
  res.status(200).json({ message: "hello" });
});

module.exports = server;
