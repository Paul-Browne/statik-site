const fs = require('fs-extra');
const os = require('os');
const http = require('http');
const http2 = require('spdy');
const serveStatic = require('serve-static');
const compression = require('compression');
const express = require('express');
const env = require('dotenv');
const chokidar = require('chokidar');
const chalk = require('chalk');
env.config();

const sourceDirectoryName = process.env.SOURCE_DIR_NAME || 'src';
const publicDirectoryName = process.env.PUBLIC_DIR_NAME || 'public';

const utility = require('./utility.js');
const build = require('./build.js');

function serverSetup(protocal) {
    var app = express();
    app.use(compression())
    app.use(serveStatic(publicDirectoryName, {
        'extensions': ['html'],
        'maxAge': 3600000   // 1 hour
    }))
    if (protocal === "https") {
        http2.createServer({
            key: fs.readFileSync(os.homedir() + process.env.SSL_KEY_PATH, 'utf8'),
            cert: fs.readFileSync(os.homedir() + process.env.SSL_CRT_PATH, 'utf8')
        }, app).listen(8888);
    } else {
        http.createServer(app).listen(8888);
    }
    utility.consoleTimestampedMessage(chalk.magenta("serving: ") + publicDirectoryName + "/ at " + protocal + "://localhost:8888");
}
function startServer(){
    fs.open('./.env', 'r', (err) => {
        if (err) {
            if (err.code === 'ENOENT') {
                utility.consoleTimestampedMessage(chalk.yellow("warning: ") + "no .env file found");
                serverSetup("http");
                watching();
            }
        } else {
            fs.readFile('./.env', 'utf8', (err, data) => {
                if (data.indexOf('SSL_CRT_PATH') < 0 || data.indexOf('SSL_KEY_PATH') < 0 || data.indexOf('#SSL_CRT_PATH') > 0 || data.indexOf('# SSL_CRT_PATH') > 0 || data.indexOf('#SSL_KEY_PATH') > 0 || data.indexOf('# SSL_KEY_PATH') > 0) {
                    utility.consoleTimestampedMessage(chalk.yellow("warning: ") + "no SSL_CRT_PATH and/or SSL_KEY_PATH found in .env file");
                    serverSetup("http");
                    watching();
                } else {
                    serverSetup("https");
                    watching();
                }
            })
        }
    })
}


function watching() {
    var watcher = chokidar.watch([sourceDirectoryName, 'contentmap.json', 'sitemap.json'], {
        persistent: true,
        ignoreInitial: true
    });
    var time = Date.now();
    watcher.on('all', (event, path) => {
        if (event !== "unlink" && event !== "unlinkDir") {
            utility.prettify(path);
        }
        if(Date.now() > (time + 1000) ){
            time = Date.now();
            build(0);
        }
    })
    utility.consoleTimestampedMessage(chalk.magenta("watching: ") + sourceDirectoryName + " directory, contentmap.json and sitemap.json");
}

startServer();