function getRandomInt(max, min) {
  if (min === undefined) min = 0;
  return Math.floor(Math.random() * max) + min;
}

module.exports = class Game {
  constructor(room) {
    this.needPlayers = 4;
    this.room = room || null;
    this.gameInProgress = false;
    this.players = [];
    this.enableWhiteboard = false;
    this.wordOfTheRound = [];
    this.gameSetup = {
      平民: 0,
      臥底: 0,
      白板: 0
    };
    this.wordsList = [['老婆', '女朋友'], ['達美樂', '必勝客'], ['高跟鞋', '增高鞋'],
                        ['高血糖', '高血壓'], ['化妝', '整形'], ['梁山伯與祝英台', '羅密歐與茱麗葉'],
                        ['摩托車', '電動車'], ['口紅', '唇膏'], ['餃子', '包子'],
                        ['彼得', '約翰'], ['團契聚會', '主日崇拜']];
    
    console.log(`game initialized for ${this.room}.`);
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
        this.gameSetup['臥底'] = this.enableWhiteboard ? 1 : 2;
        this.gameSetup['白板'] = this.enableWhiteboard ? 1 : 0;
      }
      this.shufflePlayers();
      this.assignRoles();
      this.assignWord();
      this.gameInProgress = true;
    }
    console.log(JSON.stringify(this.players, null))
    return this.gameSetup;
  }
  
  isGameInProgress() {
    return this.gameInProgress;
  }
  
  shufflePlayers() {
    for (let i = this.players.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [this.players[i], this.players[j]] = [this.players[j], this.players[i]];
    }
  }
  
  assignRoles() {
    let i = 0;
    for (let role in this.gameSetup) {
      let j = this.gameSetup[role];
      while (j > 0) {
        console.log(`i: ${i}, j: ${j}`);
        this.players[i].role = role;
        i++;
        j--;
      }
      console.log(JSON.stringify(this.players));
    }
  }
  
  assignWord() {
    this.wordOfTheRound = this.wordsList[Math.floor(Math.random() * (this.wordsList.length))];
    for (let player in this.players) {
      if (player.role == '平民') player.word = this.wordOfTheRound[0];
      else if (player.role == '臥底') player.word = this.wordOfTheRound[1];
    }
  }
  
  evaluate() {
    if(this.gameSetup['臥底'] == 0 && this.gameSetup['白板'] == 0) {
      this.endGame();
      return '平民獲勝';
    } else if(this.gameSetup['臥底'] == 0 && this.gameSetup['白板'] != 0) {
      this.endGame();
      return '白板獲勝';
    } else if(this.gameSetup['臥底'] > 0 && this.gameSetup['臥底'] == this.gameSetup['平民']) {
      this.endGame();
      return '臥底獲勝';
    }
    return '遊戲繼續';
  }
  
  eliminate(playerName) {
    for(let i = 0; i < this.players.length; i++) {
      if(this.players[i].name == playerName && this.players[i].status == '已坐下') {
        this.gameSetup[this.players[i].role] -= 1;
        return this.gameSetup;
      }
    }
    return false;
  }
  
  getWordOfTheRound() {
    return this.wordOfTheRound;
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
}
