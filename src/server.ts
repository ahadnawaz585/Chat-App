import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';

class ChatServer {
  private app: express.Application;
  private server: http.Server;
  private io: Server;
  private onlineUsers: Set<string>;
    userName: any;

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new Server(this.server);
    this.onlineUsers = new Set();
    this.configureRoutes();
    this.configureSocket();
    this.start();
  }

  private configureRoutes(): void {
    this.app.use(express.static(path.join(__dirname, '../public')));
  }

  private configureSocket(): void {
    this.io.on('connection', (socket) => {
      console.log('a user connected');

      socket.emit('request name');

      socket.on('set name', (name: string) => {
        console.log(`User "${name}" connected`);
        this.onlineUsers.add(name);
        this.updateOnlineUsers();
        socket.broadcast.emit('chat message', { name: 'Server', message: `${name} joined the chat` });

        socket.on('chat message', (msg: string) => {
          socket.broadcast.emit('chat message', { name, message: msg });
        });
      });

      socket.on('disconnect', () => {
        console.log('user disconnected');
        if (this.userName) {
          this.onlineUsers.delete(this.userName);
          this.updateOnlineUsers();
          socket.broadcast.emit('chat message', { name: 'Server', message: `${this.userName} left the chat` });
        }
      });
    });
  }

  private updateOnlineUsers(): void {
    this.io.emit('update users', Array.from(this.onlineUsers));
  }

  private start(): void {
    const PORT = process.env.PORT || 3000;
    this.server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  }
}

new ChatServer();
