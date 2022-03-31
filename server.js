const args = require("minimist")(process.argv.slice(2));
console.log(args);

if (args.help) {
  console.log("server.js [options]");

  console.log(
    "--port	Set the port number for the server to listen on. Must be an integer between 1 and 65535."
  );

  console.log(
    "--debug	If set to `true`, creates endlpoints /app/log/access/ which returns a JSON access log from the database and /app/error which throws an error with the message `Error test successful.` Defaults to `false`."
  );

  console.log(
    "--log		If set to false, no log files are written. Defaults to true. Logs are always written to database."
  );

  console.log("--help	Return this message and exit.");
}

const express = require("express");
const morgan = require("morgan");
const db = require("./database.js");

const app = express();
app.use(morgan("tiny"));

const port = args.port || process.env.PORT || 5000;

function coinFlip() {
  var result;
  var rand_num = Math.random();

  if (rand_num < 0.5) {
    result = "heads";
  } else {
    result = "tails";
  }
  return result;
}

function coinFlips(flips) {
  let flip_list = [];
  let i = 0;
  while (i < flips) {
    flip_list.push(coinFlip());
    i++;
  }
  return flip_list;
}

function countFlips(array) {
  var counter;
  var heads = 0;
  var tails = 0;
  var i = 0;
  while (i < array.length) {
    if (array[i] === "tails") {
      tails = tails + 1;
    } else {
      heads = heads + 1;
    }
    i++;
  }
  if (heads == 0) {
    counter = { tails };
  } else if (tails == 0) {
    counter = { heads };
  } else {
    counter = { tails, heads };
  }
  return counter;
}

function flipACoin(call) {
  var return_statement = {
    call,
    flip: coinFlip(),
    result: "",
  };

  if (return_statement.call === return_statement.flip) {
    return_statement.result = "win";
  } else {
    return_statement.result = "lose";
  }
  return return_statement;
}

// MIDDLEWARE
app.use((req, res, next) => {
  // res.status(200).send("Hello, World");
  // res.setHeader("text/plain");
  let logdata = {
    remoteaddr: req.body.ip,
    remoteuser: req.body.user,
    time: Date.now(),
    method: req.body.method,
    url: req.body.url,
    protocol: req.body.protocol,
    httpversion: req.body.httpVersion,
    secure: req.body.secure,
    status: res.body.statusCode,
    referer: req.body.headers["referer"],
    useragent: req.body.headers["user-agent"],
  };

  const stmt = db.prepare(
    "INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, secure, status, referer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  const info = stmt.run(
    logdata.remoteaddr,
    logdata.remoteuser,
    logdata.time,
    logdata.method,
    logdata.url,
    logdata.protocol,
    logdata.httpversion,
    logdata.secure,
    logdata.status,
    logdata.referer,
    logdata.useragent
  );
  res.status(200).json(logdata);
  next();
});

const server = app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});

app.get("/app", (req, res) => {
  res.status(200).end("OK");
  res.type("text/plain");
});

app.get("/app/echo/:number", (req, res) => {
  res.status(200).json({ message: req.params.number });
  res.type("text/plain");
});
// Put listen at the end
app.get("/app/flip", (req, res) => {
  var flip = coinFlip();
  res.status(200).json({ flip: flip });
  res.type("text/plain");
});

app.get("/app/flips/:number", (req, res) => {
  var flip = coinFlips(req.params.number);
  var summary = countFlips(flip);
  res.status(200).json({ raw: flip, summary: summary });
  res.type("text/plain");
});

app.get("/app/flip/call/heads", (req, res) => {
  var result = flipACoin("heads");
  res.status(200).json({ result: result });
  res.type("text/plain");
});

app.get("/app/flip/call/tails", (req, res) => {
  var result = flipACoin("tails");
  res.status(200).json({ result: result });
  res.type("text/plain");
});

app.get("/app/log/access", (req, res) => {});

app.use(function (req, res) {
  res.status(404).end("404 NOT FOUND");
  res.type("text/plain");
});
