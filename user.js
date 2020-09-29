// User is private
class User {
  constructor(name, room, status, role) {
    this.name = name;
    this.room = room;
    this.status = status;
    this.role = role;
  }
  
  toggleSitStand() {
    if (this.status == '已坐下') this.status = '圍觀';
    else this.status = '已坐下';
  }
}

class Users {
  constructor() {
    this.users = {};
  }

  add(id, name, room, status, role) {
    this.users[id] = new User(name, room, status, role);
  }

  get(id) {
    return this.users[id];
  }
  
  update(newUserInfo) {
    this.users(newUserInfo.id).name = newUserInfo.name;
    this.users(newUserInfo.id).room = newUserInfo.room;
    this.users(newUserInfo.id).status = newUserInfo.status;
    this.users(newUserInfo.id).role = newUserInfo.role;
  }

  remove(id) {
    delete this.users[id];
  }

  getUsersByRoom(room) {
    return this.users.filter(u => u.room === room);
  }
  
  getReadiedPlayersByRoom(room) {
    return this.users.filter(u => u.room === room && u.status === '已坐下');
  }
}

module.exports = function() {
  return new Users();
};
