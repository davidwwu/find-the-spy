class Game {
  constructor(room) {
    this.needPlayers = 4;
    this.room = room || null;
    this.gameInProgress = false;
    this.players = [];
    this.enableWhiteboard = false;
    this.gameSetup = {
      平民: 0,
      臥底: 0,
      白板: 0
    };
    this.answersList = [['老婆', '女朋友'], ['達美樂', '必勝客'], ['高跟鞋', '增高鞋'],
                        ['高血糖', '高血壓'], ['化妝', '整形'], ['梁山伯與祝英台', '羅密歐與茱麗葉'],
                        ['摩托車', '電動車'], ['口紅', '唇膏'], ['餃子', '包子'],
                        ['彼得', '約翰'], ['團契', '主日崇拜']];
  }
  
  setRoom(room) {
    this.room = room;
  }
  
  toggleWhiteboard() {
    this.enableWhiteboard = !this.enableWhiteboard;
    return this.enableWhiteboard;
  }
  
  checkWhtieboardstatus() {
    return this.enableWhiteboard;
  }

  startGame(playerList) {
    if (playerList.length < this.needPlayers) {
      return false;
    } else {
      this.players = [...playerList];
      if (playerList.length == 4) {
        this.gameSetup['平民'] = 3;
        this.gameSetup['臥底'] = 1;
      } else if (playerList.length >= 5 && playerList.length < 9) {
        this.gameSetup['平民'] = playerList.length - 2;
        this.gameSetup['臥底'] = 1;
        this.gameSetup['白板'] = 1;
      }
      this.gameInProgress = true;
    }
  }
  
  isGameInProgress() {
    return this.gameInProgress;
  }
  
  evaluateProgress() {
    if(this.gameSetup[''])
  }
  
  endGame() {
    this.gameInProgress = false;
    this.players = [];
    this.gameSetup = {
      平民: 0,
      臥底: 0,
      白板: 0
    };
  }

  add(id, name, room, status, role) {
    this.users.push({ id, name, room, status, role });
  }

  get(id) {
    return this.users.find(u => u.id === id);
  }

  update(newUserInfo) {
    this.get(newUserInfo.id).name = newUserInfo.name;
    this.get(newUserInfo.id).room = newUserInfo.room;
    this.get(newUserInfo.id).status = newUserInfo.status;
    this.get(newUserInfo.id).role = newUserInfo.role;
    console.log(`newUser: ${this.get(newUserInfo.id)}`);
  }

  remove(id) {
    const user = this.get(id);
    if (user) {
      this.users = this.users.filter(u => u.id !== user.id);
    }
    return user;
  }

  getUsersByRoom(room) {
    return this.users.filter(u => u.room === room);
  }

  getReadiedPlayersByRoom(room) {
    return this.users.filter(u => u.room === room && u.status === "已坐下");
  }
}

module.exports = function(room) {
  return new Game(room);
};
