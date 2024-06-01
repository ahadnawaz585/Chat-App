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
    let userName: string | null = null;
    while (!userName) {
      userName = prompt("Please enter your name:");
      if (!userName) {
        alert("Name cannot be empty. Please enter a valid name.");
      }
    }
    this.userName = userName;
    this.socket.emit('set name', this.userName);
  }

  private handleSubmit(e: Event): void {
    e.preventDefault();
    const message = this.input.value.trim();
    if (message) {
      this.socket.emit('chat message', message);
      this.addMessage('Me', message, true);
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

document.addEventListener('DOMContentLoaded', () => {
  new ChatApp();
});
