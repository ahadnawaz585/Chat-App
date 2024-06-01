import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';

class ChatServer {
  private app: express.Application;
  private server: http.Server;
  private io: Server;
  private onlineUsers: Set<string>;
  private userNames: Map<string, string>; // Map to store socket.id and usernames

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new Server(this.server);
    this.onlineUsers = new Set();
    this.userNames = new Map(); // Initialize the Map
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
        this.userNames.set(socket.id, name); // Associate socket.id with username
        this.updateOnlineUsers();
        socket.broadcast.emit('chat message', { name: 'Server', message: `${name} joined the chat` });

        socket.on('chat message', (msg: string) => {
          console.log(`Received message from ${name}:`, msg);
          socket.broadcast.emit('chat message', { name, message: msg });
        });
      });

      socket.on('disconnect', () => {
        console.log('user disconnected');
        const name = this.userNames.get(socket.id); 
        if (name) {
          this.onlineUsers.delete(name);
          this.userNames.delete(socket.id); 
          this.updateOnlineUsers();
          socket.broadcast.emit('chat message', { name: 'Server', message: `${name} left the chat` });
        }
      });
    });
  }

  private updateOnlineUsers(): void {
    console.log('Updating online users');
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
