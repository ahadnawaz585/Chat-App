import { io, Socket } from "socket.io-client";

class ChatApp {
  private socket: Socket;
  private form: HTMLFormElement;
  private input: HTMLInputElement;
  private messages: HTMLUListElement;
  private onlineUsersList: HTMLUListElement;
  private userName: string | null = null;

  constructor() {
    this.socket = io();
    this.form = document.getElementById('form') as HTMLFormElement;
    this.input = document.getElementById('input') as HTMLInputElement;
    this.messages = document.getElementById('messages') as HTMLUListElement;
    this.onlineUsersList = document.getElementById('online-users') as HTMLUListElement;

    this.form.addEventListener('submit', this.handleSubmit.bind(this));
    this.socket.on('chat message', this.handleMessage.bind(this));
    this.socket.on('request name', this.requestName.bind(this));
    this.socket.on('update users', this.updateOnlineUsers.bind(this));
  }

  private requestName(): void {
    const userName = prompt("Please enter your name:");
    if (userName) {
      this.userName = userName;
      this.socket.emit('set name', this.userName);
    } else {
      alert("Name cannot be empty. Please refresh the page and enter your name again.");
    }
  }

  private handleSubmit(e: Event): void {
    e.preventDefault();
    if (this.input.value) {
      this.socket.emit('chat message', this.input.value);
      this.addMessage('Me', this.input.value, true);
      this.input.value = '';
    }
  }

  private handleMessage(data: { name: string, message: string }): void {
    this.addMessage(data.name, data.message, false);
  }

  private addMessage(name: string, message: string, isMe: boolean): void {
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

  private updateOnlineUsers(users: string[]): void {
    this.onlineUsersList.innerHTML = '';
    users.forEach(user => {
      const listItem = document.createElement('li');
      listItem.textContent = user;
      this.onlineUsersList.appendChild(listItem);
    });
  }
}

new ChatApp();
