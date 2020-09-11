const express = require("express");
const socket = require("socket.io");
const path = require("path");
const http = require("http");
const users = require("./user")();

const publicPath = path.join(__dirname, "./public");
const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socket(server);

const message = (name, text, id) => {
  return {
    name,
    text,
    id
  };
};

app.use(express.static(publicPath));

io.on("connection", sock => {
  sock.on("join", (user, cb) => {
    if (!user.name || !user.room) {
      return cb("Enter valid user data");
    } else {
      sock.join(user.room);

      users.remove(sock.id);
      let userStatus =
        users.getReadiedPlayersByRoom(user.room).length < 4 ? "已坐下" : "圍觀";
      users.add(sock.id, user.name, user.room, userStatus, "平民");
      cb({ userId: sock.id, userStatus, userRole: "平民" });

      io.to(user.room).emit("users:update", users.getUsersByRoom(user.room));
      sock.emit("message:new", message("主持", `歡迎, ${user.name}`));
      sock.broadcast
        .to(user.room)
        .emit("message:new", message("主持", `${user.name} 進入房間`));
    }
  });

  sock.on("message:create", (data, cb) => {
    if (!data) {
      cb("message cant be empty");
    } else {
      const user = users.get(sock.id);
      if (user) {
        const players = users.getReadiedPlayersByRoom(user.room).length;
        // handel system requests
        if (data.text == "!makeHost") {
          io.in(user.room)
            .emit("user:update", { id: data.id, role: "host" });
        } else if (data.text == "!start") {
          io.to(user.room).emit(
            "message:new",
            message(data.name, data.text, data.id)
          );
          if (players < 4) {
            io.to(user.room).emit(
              "message:new",
              message("主持", `玩家人數不足 4 人`)
            );
          } else {
            if (players == 4) {
              io.to(user.room).emit(
                "message:new",
                message("主持", `3 平民, 1 臥底`)
              );
            } else if (players >= 5 && players < 9) {
              io.to(user.room).emit(
                "message:new",
                message("主持", `${players - 2} 平民, 1 臥底, 1 白板`)
              );
            }
          }
        } else if (data.text == "!end") {
          io.to(user.room).emit(
            "message:new",
            message(data.name, data.text, data.id)
          );
        } else {
          io.to(user.room).emit(
            "message:new",
            message(data.name, data.text, data.id)
          );
        }
      }
      cb();
    }
  });

  sock.on("user:update", (user, cb) => {
    console.log("emit Called");
    users.update(user);
    io.to(user.room).emit("users:update", users.getUsersByRoom(user.room));

    cb();
  });

  sock.on("disconnect", () => {
    const user = users.remove(sock.id);
    if (user) {
      io.in(user.room).emit(
        "message:new",
        message("主持", `${user.name} 離開房間`)
      );
      io.in(user.room).emit("users:update", users.getUsersByRoom(user.room));
    }
  });
});

server.listen(port, () =>
  console.log(`Server has been started on ${port} port`)
);
