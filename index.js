// Modules + Setup
const fs = require('fs');
const readline = require('readline');
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const path = require("path");
const app = express();
const httpserver = http.Server(app);
const io = socketio(httpserver);
const gamedirectory = path.join(__dirname, "html");
app.use(express.static(gamedirectory));
httpserver.listen(3000);

// Variables
const kaylaPass = process.env['kayla_password'];
const tylerPass = process.env['tyler_password'];
const tylerAltPass = process.env['tylerAlt_password'];
var rooms = [];
var usernames = [];
var userNames = ['KaylaIsGreat', 'TylerTheGoat', 'Tyler_On_Alt_Account'];
var passwords = [kaylaPass, tylerPass, tylerAltPass];
var preferredNames = [];
var sendUsers = [];

// Read File Lines
async function processLineByLine(fileName = 'data/dummyFile.txt', type = "getPreferredNames", userCheck = 'none') {
  const fileStream = fs.createReadStream(fileName);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  if (type = "getPreferredNames") {
    preferredNames = [];
  }
  for await (const line of rl) {
    if (type == "getPreferredNames") {
      preferredNames.push(line);
    }
    else if (type == 'checkLogin') {
      if (line.contains('loggedIn') == true) {
        let loginCheck = line.split('|');
        let loggedInCheck = loginCheck[1];
        if (loggedInCheck == 'true' || loggedInCheck == true) {
          return true;
        }
        else {
          return false;
        }
      }
    }
    else {
      console.log(`Line from file: ${line}`);
    }
  }
}

// Server Communication
io.on('connection', function(socket) {
  socket.on('disconnecting', () => {
    const rooms = Object.keys(socket.rooms);
    rooms.forEach(room => {
      if (room != socket.id) {
        socket.to(room).emit("recieve", "Server|" + socket.user + " has left the chat.");
        socket.to(room).emit("notTyping", socket.user);
      }
    });

  });
  socket.on("join", function(room, username) {
    if (username != "") {
      if (userNames.indexOf(username) == -1) {
        socket.emit('invalidUsername');
      }
      else {
        socket.user = username;
        rooms[socket.id] = room;
        usernames[socket.id] = username;
        socket.leaveAll();
        socket.join(room);
        io.in(room).emit("recieve", "Server|" + username + " has entered the chat.");
        socket.emit("join", room);
      }
    }
  })
  socket.on("send", function(message) {
    io.in(rooms[socket.id]).emit("recieve", usernames[socket.id] +"|" + message);
  })
  socket.on("recieve", function(message) {
    socket.emit("recieve", message);
  })
  socket.on('attemptLogin', function(username, password) {
    console.log('Attempted login with username "' + username + '"');
    if (userNames.includes(username)) {
      let index = userNames.indexOf(username);
      if (index != -1 && passwords[index] == password) {
        socket.emit('loginSuccess');
      }
      else {
        socket.emit('loginFail');
      }
    }
    else {
      socket.emit('loginFail');
    }
  })
  socket.on("typing", function(typing, username) {
    if (typing == "yes") {
      io.in(rooms[socket.id]).emit("typing", username);
    }
    else {
      io.in(rooms[socket.id]).emit("notTyping", username);
    }
  })
  socket.on("getUsers", function() {
    try {
      let usersInfo = 'Online Users: ';
      sendUsers = [];
      const clients = io.sockets.adapter.rooms['room'].sockets;
      for (const clientId in clients) {
        const clientSocket = io.sockets.connected[clientId];
        usersInfo = usersInfo + clientSocket.user + ", ";
      }
      socket.emit('sendUsers', usersInfo);
    }
    catch (err) {
      console.log(`Failed to Fetch Online Users. Server Error: ${err}`);
      socket.emit('error', 'Failed to Fetch Online Users.');
      throw err;
    }
  })
})