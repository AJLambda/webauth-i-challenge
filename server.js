const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const session = require("express-session");

const Users = require("./users/users-model.js");
const protected = require("./auth/protected-middleware.js");
const restricted = require("./auth/restricted-middleware.js");

const server = express();
const parser = express.json();

const sessionConfig = {
  name: "session", // by default would be sid
  secret: "i have a secret for you",
  cookie: {
    httpOnly: true, // true means prevent access from JavaScript code
    maxAge: 1000 * 60 * 2, // in milliseconds
    secure: false // true means only send the cookie over https
  },
  resave: false, // resave session even if it didn't change?
  saveUninitialized: true // create new sessions automatically, make sure to comply with law
};

server.use(session(sessionConfig));
server.use(helmet());
server.use(parser);
server.use(cors());

// sanity check
server.get("/", (req, res) => {
  console.log(req.session);
  const username = req.session.username || "stranger";
  res.status(200).json(`Hello, ${username}`);
});

// GET	/api/users	If the user is logged in, respond with an array of all the users contained in the database. If the user is not logged in respond with the correct status code and the message: 'You shall not pass!'.
server.get("/api/users", restricted, (req, res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

// POST	/api/register	Creates a user using the information sent inside the body of the request. Hash the password before saving the user to the database.
server.post("/api/register", (req, res) => {
  let user = req.body; // check for username and password

  const hash = bcrypt.hashSync(user.password, 8);

  user.password = hash;

  Users.add(user)
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

// POST	/api/login	Use the credentials sent inside the body to authenticate the user. On successful login, create a new session for the user and send back a 'Logged in' message and a cookie that contains the user id. If login fails, respond with the correct status code and the message: 'You shall not pass!'

server.post("/api/login", (req, res) => {
  let { username, password } = req.body;

  // we compare the password guess against the database hash
  Users.findBy({ username })
    .first()
    .then(user => {
      console.log(user);
      console.log(req.session);
      if (user && bcrypt.compareSync(password, user.password)) {
        req.session.username = user.username;
        console.log(req.session);

        res.status(200).json({ message: `${user.username} Logged in` });
      } else {
        res.status(401).json({ message: `You shall not pass!` });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

// Logout and end session
server.get("/api/logout", (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        res.send("error logging out");
      } else {
        res.send("successful log out");
      }
    });
  } else {
    res.send("already logged out");
  }
});

module.exports = server;
