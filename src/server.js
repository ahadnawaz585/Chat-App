"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
class ChatServer {
    constructor() {
        this.app = (0, express_1.default)();
        this.server = http_1.default.createServer(this.app);
        this.io = new socket_io_1.Server(this.server);
        this.onlineUsers = new Set();
        this.configureRoutes();
        this.configureSocket();
        this.start();
    }
    configureRoutes() {
        this.app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
    }
    configureSocket() {
        this.io.on('connection', (socket) => {
            console.log('a user connected');
            socket.emit('request name');
            socket.on('set name', (name) => {
                console.log(`User "${name}" connected`);
                this.onlineUsers.add(name);
                this.updateOnlineUsers();
                socket.broadcast.emit('chat message', { name: 'Server', message: `${name} joined the chat` });
                socket.on('chat message', (msg) => {
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
    updateOnlineUsers() {
        this.io.emit('update users', Array.from(this.onlineUsers));
    }
    start() {
        const PORT = process.env.PORT || 3000;
        this.server.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    }
}
new ChatServer();
