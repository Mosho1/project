/**
 * Webpack Dev Server
 * This file is used to run our local enviroment
 */
const webpack = require('webpack');
const express = require('express');
const WebpackDevMiddleware = require('webpack-dev-middleware');
const WebpackHotMiddleware = require('webpack-hot-middleware');
const history = require('connect-history-api-fallback');
const path = require('path');
const webpackConfig = require('./webpack.config');
const opn = require('opn');
const { spawn } = require('child_process');
const dbMiddleware = require('../backend/db');


/**
 * Always dev enviroment when running webpack dev server
 * There are other ways to do this, so feel free to do
 * whatever you find suites your taste
 */

const port = process.env.PORT || 3000;

const env = {
  dev: process.env.NODE_ENV === 'development',
  port
};

const devServerConfig = {};

const cssWatch = spawn('npm', ['run', 'css:watch']);
const log = data => console.log(`[tcm] ${data}`);
cssWatch.stdout.on('data', log);
cssWatch.stderr.on('data', log);

const app = dbMiddleware(express());
const compiler = webpack(webpackConfig(env));
const devMiddleware = WebpackDevMiddleware(compiler, devServerConfig);
const hotMiddleware = WebpackHotMiddleware(compiler);
app.use(history());
app.use(devMiddleware);
app.use(hotMiddleware);
app.listen(port, 'localhost', err => {
  if (err) {
    console.error(err);
  }
  console.log(`Server listening to port ${port}`);
  opn(`http://localhost:${port}`);
});

require('./websocket');
