const fs = require('fs-extra');
const chalk = require('chalk');
const env = require('dotenv');
const utility = require('./utility.js');

env.config();

const publicDirectoryName = process.env.PUBLIC_DIR_NAME || 'public';

function purge(){
    fs.writeFileSync(".build.json", "{}" );
	fs.removeSync(publicDirectoryName);
	utility.consoleTimestampedMessage(chalk.red("deleted: " ) + publicDirectoryName + "/");
	utility.consoleTimestampedMessage(chalk.red("reset: " ) + ".build.json\n");
}

purge();