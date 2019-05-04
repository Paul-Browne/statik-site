const fs = require('fs-extra');
const chalk = require('chalk');
const env = require('dotenv');
const utility = require('./exports/utility.js');

env.config();

const publicDirectoryName = process.env.PUBLIC_DIR_NAME || 'public';

function purge(){
    fs.writeFileSync(".buildStamp", "0" );
	fs.removeSync(publicDirectoryName);
	utility.consoleTimestampedMessage(chalk.red("deleted: " ) + publicDirectoryName + "/");
	utility.consoleTimestampedMessage(chalk.red("reset: " ) + ".buildStamp\n");
}

purge();