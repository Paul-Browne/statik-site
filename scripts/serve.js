const fs = require('fs');
const os = require('os');
const http2 = require('spdy');
const serveStatic = require('serve-static');
const compression = require('compression');
const express = require('express');
const env = require('dotenv');
env.config();

const options = {
    key: fs.readFileSync(os.homedir() + process.env.SSL_KEY_PATH, 'utf8'),
    cert: fs.readFileSync(os.homedir() + process.env.SSL_CRT_PATH, 'utf8')
};

const serverRoot = process.env.PUBLIC_DIR_NAME || 'public';

function serverSetup(protocal) {
    var app = express();
    app.use(compression())
    app.use(serveStatic(serverRoot, {
        'extensions': ['html'],
        'maxAge': 3600000	// 1 hour
    }))
    if (protocal === "https") {
        http2.createServer(options, app).listen(8888);
    } else {
        http.createServer(app).listen(8888);
    }
    console.log(protocal + "://localhost:8888");
}

fs.open('./.env', 'r', (err) => {
    if (err) {
        if (err.code === 'ENOENT') {
            console.log("no .env file found");
            serverSetup("http");
        }
    } else {
        fs.readFile('./.env', 'utf8', (err, data) => {
            if (data.indexOf('SSL_CRT_PATH') < 0 || data.indexOf('SSL_KEY_PATH') < 0) {
                console.log("no SSL_CRT_PATH and/or SSL_KEY_PATH found in .env file");
                serverSetup("http");
            } else {
                serverSetup("https");
            }
        })
    }
})