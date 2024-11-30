const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json());

const JWT_SECRET = "random123";

const users = [];

app.get("/", (req, res) => {
  res.send("Welcome to the Authentication API");
});

function logger(req, res, next) {
  console.log(req.method + " request came");
  next();
}

app.post("/signup", logger, function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  if (users.find((u) => u.username === username)) {
    res.json({
      message: "You are already signed-up",
    });
    return;
  }
  users.push({
    username: username,
    password: password,
  });

  res.json({
    message: "You are signed-up",
  });
  console.log(users);
});

app.post("/signin", logger, (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const user = users.find(
    (user) => user.username === username && user.password === password
  );

  if (user) {
    const token = jwt.sign(
      {
        username: user.username,
      },
      JWT_SECRET
    );

    user.token = token;
    res.send({
      token,
    });
    console.log(users);
  } else {
    res.status(403).send({
      message: "Invalid username or password",
    });
  }
});

// Method 1 = Through Middleware

function auth(req, res, next) {
  const token = req.headers.authorization;

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        res.status(401).send({
          message: "Unauthorized",
        });
      } else {
        req.user = decoded;
        next();
      }
    });
  } else {
    res.status(401).send({
      message: "Unauthorized",
    });
  }
}

app.get("/me", logger, auth, (req, res) => {
  const user = req.user;

  res.send({
    username: user.username,
  });
});

/* 
     method -2 Without Middleware

app.get("/me", (req, res) => {
  const token = req.headers.authorization;
  try {
    const userDetails = jwt.verify(token, JWT_SECRET);
    const username = userDetails.username;
    const user = users.find((user) => user.username === username);

    if (user) {
      res.send({
        username: user.username,
      });
    } else {
      res.status(401).send({
        message: "Unauthorized",
      });
    }
  } catch (error) {
    res.status(401).send({
      message: "Invalid token",
    });
  }
});

*/

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
