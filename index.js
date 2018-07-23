const express = require('express');
const PouchDB = require('pouchdb');
const expressPouchDB = require('express-pouchdb');
const history = require('connect-history-api-fallback');
const path = require('path');
const http = require('http');
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3000;
const root = __dirname;

const app = express();
app.use(function (req, res, next) { console.log(req.url); next(); });
app.use('/db', expressPouchDB(PouchDB, {
    inMemoryConfig: true,
    mode: 'minimumForPouchDB',
    logPath: process.env['POUCHDB_LOGS'] || './pouchdb_log.txt',
    overrideMode: {
        include: ['routes/fauxton']
    }
}));
app.use(history());
app.use(express.static(root + '/build'));

const server = http.createServer(app);
server.listen(port, host, serverStarted);

function serverStarted() {
    console.log('Server started', host, port);
    console.log('Root directory', root);
    console.log('Press Ctrl+C to exit...\n');
}