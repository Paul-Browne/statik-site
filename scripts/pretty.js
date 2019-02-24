const fs = require('fs-extra');
const path = require('path');
const env = require('dotenv');
env.config();

const sourceDirectoryName = process.env.SOURCE_DIR_NAME || 'src';

const utility = require('./utility.js');

function walkSyncPrettify(inDirectory) {
    if (fs.statSync(inDirectory).isDirectory()) {
        fs.readdirSync(inDirectory).map(subDirectory => walkSyncPrettify(path.join(inDirectory, subDirectory)))
    } else {
        if (utility.fileHasBeenChangedSinceLastBuild(inDirectory)) {
            utility.prettify(inDirectory);
        }
    }
}

walkSyncPrettify(sourceDirectoryName);