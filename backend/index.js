const express = require('express');
const PouchDB = require('pouchdb');
const pouchDBAllDbs = require('pouchdb-all-dbs');
const expressPouchDB = require('express-pouchdb');
const history = require('connect-history-api-fallback');
const path = require('path');
const http = require('http');
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3000;
const root = __dirname;
const dbMiddleware = require('./db');

const app = dbMiddleware(express());
app.use(history());
app.use(express.static(root + '/build'));

const server = http.createServer(app);
server.listen(port, host, serverStarted);

function serverStarted() {
    console.log('Server started', host, port);
    console.log('Root directory', root);
    console.log('Press Ctrl+C to exit...\n');
}