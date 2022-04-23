const { User } = require("./users/users.controllers");
const { Room } = require("./room/room.controllers");
const { Application } = require("./application/application.controllers");

module.exports = {
  User,
  Room,
  Application
};