const http = require('http');
const https = require('https')
const net = require('net');
const url = require('url');

const proxyServer = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('This is a simple HTTP CONNECT proxy\n');
});

proxyServer.on('connect', (req, clientSocket, head) => {
    const { port, hostname } = url.parse(`//${req.url}`, true, true);
    console.log(`Connecting to ${hostname}:${port}`);
    
    const targetSocket = net.connect(port || 80, hostname, () => {
        clientSocket.write('HTTP/1.1 200 Connection Established\r\n' +
                           'Proxy-agent: Node.js-Proxy\r\n' +
                           '\r\n');

        if (head && head.length) {
            targetSocket.write(head);
        }

        clientSocket.pipe(targetSocket);
        targetSocket.pipe(clientSocket);
    });

    clientSocket.on('error', (err) => {
        console.error('Client Socket Error:', err);
        targetSocket.end();
    });
    targetSocket.on('error', (err) => {
        console.error('Target Socket Error:', err);
        clientSocket.end();
    });
    clientSocket.on('end', () => {
        targetSocket.end();
    });
    targetSocket.on('end', () => {
        clientSocket.end();
    });
});

const PORT = 8888;

proxyServer.listen(PORT, () => {
    console.log(`Proxy server listening on port ${PORT}`);
});
