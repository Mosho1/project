let app, server,
    express = require('express'),
    path = require('path'),
    http = require('http'),
    host = process.env.HOST || 'localhost',
    port = process.env.PORT || 7770,
    root = __dirname;

app = express();
app.use(function (req, res, next) { console.log(req.url); next(); });
app.use(express.static(root + '/build'));
server = http.createServer(app);
server.listen(port, host, serverStarted);

function serverStarted() {
    console.log('Server started', host, port);
    console.log('Root directory', root);
    console.log('Press Ctrl+C to exit...\n');
}