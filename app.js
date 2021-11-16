const express = require("express");

const app = express();

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log("Server is Started on", PORT);
});

const io = require("socket.io")(server);
let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  console.log("Connected Successfulley", socket.id);

  //take userId and socketId from user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    console.log(users);
  });

  //send and get message
  socket.on("sendMessage", ({ senderId, receiverId, message }) => {
    const user = getUser(receiverId);
    io.to(user.socketId).emit("getMessage", {
      senderId,
      message,
    });
  });
  //when disconnect
  socket.on("disconnect", () => {
    console.log("a user disconnected!");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
  socket.emit("sendMessage", "Hallo  from server");
});
