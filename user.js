class User {
  constructor(id, name, room, status, isHost) {
    this.id = id;
    this.name = name;
    this.room = room;
    this.status = status;
    this.isHost = isHost || false;
  }
  
  toggleSitStand() {
    if (this.status == '已坐下') this.status = '圍觀';
    else this.status = '已坐下';
  }
}

class Users {
  constructor() {
    this.users = [];
  }

  add(id, name, room, status, isHost) {
    this.users.push(new User(id, name, room, status, isHost));
  }

  get(id) {
    return this.users.find(u => u.id == id);
  }
  
  update(newUserInfo) {
    let user = this.get(newUserInfo.id);
    user.name = newUserInfo.name;
    user.room = newUserInfo.room;
    user.status = newUserInfo.status;
    user.isHost = newUserInfo.isHost;
  }
  
  makeHost(id) {
    this.get(id).isHost = true;
  }
  
  toggleSitStand(id) {
    this.get(id).toggleSitStand();
  }

  remove(id) {
    const user = this.get(id);
    if (user) {
      this.users = this.users.filter(u => u.id != user.id);
    }
  }

  getUsersByRoom(room) {
    return this.users.filter(u => u.room == room);
  }
  
  getReadiedPlayersByRoom(room) {
    return this.users.filter(u => u.room == room && u.status == '已坐下');
  }
}

module.exports = function() {
  return new Users();
};
