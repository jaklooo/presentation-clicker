const express = require('express');
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const { networkInterfaces } = require('os');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

function getLocalIp() {
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
}

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = express();
    const httpServer = createServer(server);
    const io = new Server(httpServer);
    const localIp = getLocalIp();

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        socket.on('join-session', (sessionId) => {
            socket.join(sessionId);
            console.log(`Socket ${socket.id} joined session ${sessionId}`);
        });

        socket.on('slide-change', ({ sessionId, slideIndex }) => {
            socket.to(sessionId).emit('slide-change', slideIndex);
            console.log(`Session ${sessionId}: Slide changed to ${slideIndex}`);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    // Expose local IP to frontend
    server.get('/api/config', (req, res) => {
        res.json({ ip: localIp, port });
    });

    // Handle all requests
    server.use((req, res) => {
        return handle(req, res);
    });

    httpServer.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://${hostname}:${port}`);
        console.log(`> LAN URL: http://${localIp}:${port}`);
    });
});
