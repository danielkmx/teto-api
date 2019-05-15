const http = require('http');
const port =  process.env.PORT || 7000;
const app = require('./app');

const server = http.createServer(app);

server.listen(port);

