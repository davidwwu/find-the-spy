module.exports = class Game {
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
      this.gameInProgress = true;
    }
    return this.gameSetup;
  }
  
  isGameInProgress() {
    return this.gameInProgress;
  }
  
  evaluate() {
    if(this.gameSetup['臥底'] == 0 && this.gameSetup['白板'] == 0) {
      // 平民獲勝
    } else if(this.gameSetup['臥底'] == 0 && this.gameSetup['白板'] != 0) {
      // 白板獲勝
    } else if(this.gameSetup['平民'] == this.gameSetup['臥底'] + 1) {
      // 臥底獲勝
    }
    this.endGame();
  }
  
  eliminate(player) {
    this.gameSetup[player.role] -= 1;
    return this.gameSetup;
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
