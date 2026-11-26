const http = require('node:http');

const server = http.createServer((req, res) => {
    console.info(`[${new Date()}] ${req.method} ${req.url}`);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8'});
    res.end('<h1>ダブルス スコアシート</h1>');
});

const port = 8000;
server.listen(port, () => {
    console.info(`http://localhost:${port}で起動しました`);
});