const express = require("express");
const socket = require("socket.io");
const path = require("path");
const http = require("http");
const users = require("./user")();
const Game = require("./game");

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
  let game;
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
        const players = users.getReadiedPlayersByRoom(user.room);
        // handel system requests
        if (data.text == "!makeHost") {
          // TODO: not working
          io.to(user.room).emit("user:update", { id: data.id, role: "host" });
        } else if (data.text == "!start") {
          io.to(user.room).emit("message:new", message(data.name, data.text, data.id));
          if (players.length < 4) {
            io.to(user.room).emit("message:new", message("主持", `玩家人數不足 4 人`));
          } else {
            game = new Game(user.room);
            let gameSetup = game.startGame(players);
            
            io.to(user.room).emit(
              "message:new",
              message("主持", `${gameSetup['平民']} 平民, ${gameSetup['臥底']} 臥底, ${gameSetup['白板']} 白板`)
            );
          }
        } else if (data.text.indexOf("!vote") >= 0) {
          let playerNameToEliminate = data.text.split('-')[1].trim();
          let gameSetup = game.eliminate(playerNameToEliminate);
          
          io.to(user.room).emit("message:new", message(data.name, data.text, data.id));
          io.to(user.room).emit("message:new", message("主持", `${playerNameToEliminate} 出局`));
          
          for(let i = 0; i < players.length; i++) {
            if(players[i].name == playerNameToEliminate && players[i].status == '已坐下') {
              players[i].role = "出局"
              users.update(players[i]);
              break;
            }
          }
          
          io.to(user.room).emit("users:update", users.getUsersByRoom(user.room));
          io.to(user.room).emit(
            "message:new",
            message("主持", `${gameSetup['平民']} 平民, ${gameSetup['臥底']} 臥底, ${gameSetup['白板']} 白板`)
          );
          io.to(user.room).emit("message:new", message("主持", `${game.evaluate()}`));
          if (!game.isGameInProgress) {
            io.to(user.room).emit("message:new", message("主持", `平民的詞是 ${game.evaluate()}, 臥底的詞是`));
            io.to(user.room).emit("message:new", message("主持", `${game.evaluate()} 是臥底, 是白板`));
            io.to(user.room).emit("message:new", message("主持", `本輪遊戲結束`));
          }
        } else if (data.text == "!end") {
          game.endGame();
          io.to(user.room).emit("message:new", message(data.name, data.text, data.id));
        } else {
          io.to(user.room).emit("message:new", message(data.name, data.text, data.id));
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
      io.to(user.room).emit(
        "message:new",
        message("主持", `${user.name} 離開房間`)
      );
      io.to(user.room).emit("users:update", users.getUsersByRoom(user.room));
    }
  });
});

server.listen(port, () =>
  console.log(`Server has been started on ${port} port`)
);
