class Users {
  constructor() {
    this.users = [];
  }

  add(id, name, room, role) {
    this.users.push({ id, name, room, role });
  }

  get(id) {
    return this.users.find(u => u.id === id);
  }
  
  update(id) {
    
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
}

module.exports = function() {
  return new Users();
};
