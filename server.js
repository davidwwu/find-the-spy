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

let game;

io.on("connection", sock => {
  sock.on("join", (user, cb) => {
    if (!user.name || !user.room) {
      return cb("Enter valid user data");
    } else {
      sock.join(user.room);

      users.remove(sock.id);
      let userStatus = users.getReadiedPlayersByRoom(user.room).length < 4 ? "已坐下" : "圍觀";
      let newUser = users.add(sock.id, user.name, user.room, userStatus);
      cb({ userId: newUser.id, userStatus: newUser.status, isUserHost: newUser.isHost });

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
          users.makeHost(user.id);
          
          io.to(user.room).emit("users:update", users.getUsersByRoom(user.room));
          io.to(user.room).emit("message:new", message("主持", `${user.name} 已成為遊戲主持`));
        } else if (data.text == "!start") {
          if (game !== undefined && game.isGameInProgress()) {
            io.to(user.room).emit("message:new", message("主持", '本輪遊戲尚未結束'));
          } else {
            io.to(user.room).emit("message:new", message(data.name, data.text, data.id));
            if (players.length < 4) {
              io.to(user.room).emit("message:new", message("主持", '玩家人數不足 4 人'));
            } else {
              game = new Game(user.room);
              let gameSetup = game.startGame(players);
              io.to(user.room).emit("users:update", users.getUsersByRoom(user.room));
              io.to(user.room).emit("message:new", message("主持", '新遊戲已開始'));
              io.to(user.room).emit(
                "message:new",
                message("主持", `${gameSetup['平民']} 平民, ${gameSetup['臥底']} 臥底, ${gameSetup['白板']} 白板`)
              );
            }
          }
        } else if (data.text.indexOf("!vote") >= 0) {
          if (game.isGameInProgress()) {
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
            if (!game.isGameInProgress()) {
              io.to(user.room).emit("message:new", message("主持", `平民的詞是 ${game.getWordOfTheRound()[0]}, 臥底的詞是 ${game.getWordOfTheRound()[1]}`));
              io.to(user.room).emit("message:new", message("主持", '本輪遊戲結束'));
            }
          } else {
            io.to(user.room).emit("message:new", message("主持", '沒有正在進行的遊戲'));
          }
        } else if (data.text == "!end") {
          game.endGame();
          io.to(user.room).emit("message:new", message(data.name, data.text, data.id));
          io.to(user.room).emit("message:new", message("主持", '本輪遊戲結束'));
        } else {
          io.to(user.room).emit("message:new", message(data.name, data.text, data.id));
        }
      }
      cb();
    }
  });
  
  sock.on("user:toggleSitStand", (user, cb) => {
    users.toggleSitStand(user.id);
    io.to(user.room).emit("users:update", users.getUsersByRoom(user.room));
    cb();
  });

  sock.on("user:update", (user, cb) => {
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
