"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
class ChatApp {
    constructor() {
        this.userName = null;
        this.socket = (0, socket_io_client_1.io)();
        this.form = document.getElementById('form');
        this.input = document.getElementById('input');
        this.messages = document.getElementById('messages');
        this.onlineUsersList = document.getElementById('online-users');
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        this.socket.on('chat message', this.handleMessage.bind(this));
        this.socket.on('request name', this.requestName.bind(this));
        this.socket.on('update users', this.updateOnlineUsers.bind(this));
    }
    requestName() {
        const userName = prompt("Please enter your name:");
        if (userName) {
            this.userName = userName;
            this.socket.emit('set name', this.userName);
        }
        else {
            alert("Name cannot be empty. Please refresh the page and enter your name again.");
        }
    }
    handleSubmit(e) {
        e.preventDefault();
        if (this.input.value) {
            this.socket.emit('chat message', this.input.value);
            this.addMessage('Me', this.input.value, true);
            this.input.value = '';
        }
    }
    handleMessage(data) {
        this.addMessage(data.name, data.message, false);
    }
    addMessage(name, message, isMe) {
        const item = document.createElement('li');
        const className = isMe ? 'my-message' : 'other-user-message';
        item.classList.add('chat-message', className);
        item.innerHTML = `
      <span>${name} ${new Date().toLocaleTimeString()}</span>
      <p>${message}</p>
    `;
        this.messages.appendChild(item);
        this.messages.scrollTop = this.messages.scrollHeight;
    }
    updateOnlineUsers(users) {
        this.onlineUsersList.innerHTML = '';
        users.forEach(user => {
            const listItem = document.createElement('li');
            listItem.textContent = user;
            this.onlineUsersList.appendChild(listItem);
        });
    }
}
new ChatApp();
