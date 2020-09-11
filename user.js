class Users {
  constructor() {
    this.users = [];
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
    return this.users.filter(u => u.room === room && u.status === '已坐下');
  }
}

module.exports = function() {
  return new Users();
};
