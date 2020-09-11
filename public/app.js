const socket = io();

Vue.component("chat-message", {
  props: ["message", "user"],
  template: `
        <div 
            class="message" 
            :class="{'owner': message.id == user.id}"
        >
            <div class="message-content z-depth-1">
                {{ message.name }} : {{ message.text }}
            </div>
        </div>
    `
});

new Vue({
  el: "#app",
  data: {
    message: "",
    messages: [],
    user: {
      name: "",
      room: "",
      status: "",
      role: ""
    },
    users: []
  },
  methods: {
    initializeConnection() {
      socket.on("users:update", users => {
        this.users = [...users];
      });

      socket.on("message:new", message => {
        this.messages.push(message);
        scrollToBottom(this.$refs.messages);
      });
      scrollToBottom(this.$refs.messages);
    },
    sendMessage() {
      const message = {
        text: this.message,
        name: this.user.name,
        id: this.user.id
      };
      socket.emit("message:create", message, err => {
        if (err) {
          console.error(err);
        } else {
          this.message = "";
        }
      });
    },
    updateUser(event) {
      this.user.status = event.target.innerText === '站起' ? '圍觀' : '已坐下';
      socket.emit("user:update", this.user, err => {
        if (err) {
          console.error(err);
        } else {
          
        }
      });
    }
  },
  created() {
    const params = window.location.search.split("&");
    const name = decodeURIComponent(params[0].split("=")[1].replace("+", " "));
    const room = params[1].split("=")[1];

    this.user = { name, room };
  },
  mounted() {
    // init materialize component
    M.AutoInit();
    socket.emit("join", this.user, data => {
      if (data.status === "error") {
        console.error(data);
      } else {
        this.user.id = data.userId;
        this.initializeConnection();
      }
    });
  }
});

function scrollToBottom(node) {
  setTimeout(() => {
    node.scrollTop = node.scrollHeight;
  });
}
