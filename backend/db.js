const express = require('express');
const PouchDB = require('pouchdb');
const pouchDBAllDbs = require('pouchdb-all-dbs');
const expressPouchDB = require('express-pouchdb');

pouchDBAllDbs(PouchDB);

const middleware = (app = express()) =>  {
    app.use('/db', expressPouchDB(PouchDB, {
        inMemoryConfig: true,
        mode: 'minimumForPouchDB',
        logPath: process.env['POUCHDB_LOGS'] || './pouchdb_log.txt',
        overrideMode: {
            include: ['routes/fauxton']
        }
    }));
    app.use('/all-dbs', async (req, res, next) => {
        const dbs = await PouchDB.allDbs();
        res.json(dbs);
    });

    return app;
};

module.exports = middleware;