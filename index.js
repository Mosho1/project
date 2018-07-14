let app, server,
    express = require('express'),
    PouchDB = require('pouchdb'),
    expressPouchDB = require('express-pouchdb'),
    path = require('path'),
    http = require('http'),
    host = process.env.HOST || '0.0.0.0',
    port = process.env.PORT || 3000,
    root = __dirname;

app = express();
app.use(function (req, res, next) { console.log(req.url); next(); });
app.use(express.static(root + '/build'));
app.use('/db', expressPouchDB(PouchDB, {
    // inMemoryConfig: true,
    mode: 'minimumForPouchDB',
    logPath: process.env['POUCHDB_LOGS'] || './pouchdb_log.txt'
}))
server = http.createServer(app);
server.listen(port, host, serverStarted);

function serverStarted() {
    console.log('Server started', host, port);
    console.log('Root directory', root);
    console.log('Press Ctrl+C to exit...\n');
}