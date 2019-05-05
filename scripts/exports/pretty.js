const prettier = require("prettier");
const mime = require('mime-types');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const env = require('dotenv');
env.config();

const sourceDirectoryName = process.env.SOURCE_DIR_NAME || 'src';
const utility = require('./utility.js');

function init(_path){
	var buildStamp = JSON.parse(fs.readFileSync(".buildStamp", 'utf8'));
	function fileHasBeenChangedSinceLastBuild(path, buildStamp){
	    var check = fs.statSync(path);
	    if ( check.mtimeMs > new Date(buildStamp.lastBuild) || check.ctimeMs > new Date(buildStamp.lastBuild) ) {
	        return true;
	    }else{
	        return false;
	    }
	}

	function prettify(path){
		var parser;
		if (mime.lookup(path) === 'text/html') {
		    parser = "html";
		} else if (mime.lookup(path) === 'text/css' || mime.lookup(path) === 'text/x-scss' || mime.lookup(path) === 'text/x-sass' || mime.lookup(path) === 'text/less') {
		    parser = "css";
		} else if (mime.lookup(path) === 'application/javascript') {
		    parser = "babel";
		} else if (mime.lookup(path) === 'application/json') {
		    parser = "json";
		}
		// only prettify for valid file types
		if(parser){
			var contents = fs.readFileSync(path, 'utf8');
			var checker = prettier.check(contents, {parser: parser});
			// only prettify when needed
			if(!checker){
				fs.writeFileSync(path, prettier.format(contents, {parser: parser }) );
				utility.consoleTimestampedMessage(chalk.magenta("prettified: ") + path);
			}
		}
	}

	function walkSyncPrettify(inDirectory) {
	    if (fs.statSync(inDirectory).isDirectory()) {
	        fs.readdirSync(inDirectory).map(subDirectory => walkSyncPrettify(path.join(inDirectory, subDirectory)))
	    } else {
	    	//if(!~path.dirname(inDirectory).indexOf("/data/wp-json") ){
	    		if (fileHasBeenChangedSinceLastBuild(inDirectory, buildStamp)) {
	    		    prettify(inDirectory);
	    		}
	    	//}
	    }
	}
	if(_path){
	    walkSyncPrettify(_path);
	}else{
	    walkSyncPrettify(sourceDirectoryName);
	}
}

module.exports = function(_path) {
    init(_path);
};