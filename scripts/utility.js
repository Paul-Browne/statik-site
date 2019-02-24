const chalk = require('chalk');
const pathJS = require('path');
const fs = require('fs-extra');
const mkdirp = require('mkdirp');
const prettier = require("prettier");
const mime = require('mime-types');

function humanReadableFilesize(path){
	if(fs.statSync(path).size > 999999){
		return (fs.statSync(path).size / 1000000).toFixed(1) + " Mb";
	}else if (fs.statSync(path).size > 999) {
		return (fs.statSync(path).size / 1000).toFixed(0) + " Kb";
	}else {
		return fs.statSync(path).size + " bytes";
	}
}

function consoleTimestampedMessage(message){
	var now = new Date();
	console.log(chalk.gray(('0'+now.getHours()).slice(-2) + ":" + ('0'+now.getMinutes()).slice(-2) + ":" + ('0'+now.getSeconds()).slice(-2)) + " " + message);
}
function addTimeStamp(path){
    var ts = JSON.parse(fs.readFileSync(".build.json", 'utf8'));
    ts[path] = ts[path] ? ts[path] : {};
    ts[path].date = {
        ms: Date.now(),
        hr: new Date()
    };
    ts[path].size = {
        bytes: fs.statSync(path).size,
        hr: humanReadableFilesize(path)
    };
    //fs.writeFileSync("build.json", prettier.format(JSON.stringify(ts), {parser: "json"}) );
    fs.writeFileSync(".build.json", JSON.stringify(ts) );
}
module.exports = {
	consoleTimestampedMessage: function(message){
		consoleTimestampedMessage(message);
	},
	humanReadableFilesize: function(path){
		return humanReadableFilesize(path);
	},
	addTimeStamp: function(path){
		addTimeStamp(path);
	},
	fileHasBeenChangedSinceLastBuild: function(path){
	    var ts = JSON.parse(fs.readFileSync(".build.json", 'utf8'));
	    if(!ts[path]){
	        return true;
	    }else if ( fs.statSync(path).mtimeMs > ts[path].date.ms || fs.statSync(path).ctimeMs > ts[path].date.ms ) {
	        return true;
	    }else{
	        return false;
	    }
	},
	prettify: function(path){
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
			var checker = prettier.check(fs.readFileSync(path, 'utf8'), {parser: parser});
			// only prettify when needed
			if(!checker){
				fs.writeFileSync(path, prettier.format(fs.readFileSync(path, 'utf8'), {parser: parser }) );
				addTimeStamp(path);
				consoleTimestampedMessage(chalk.magenta("prettified: ") + path);
			}
		}
	},
	writeOut: function(output, inPath, outPath){
		mkdirp(pathJS.dirname(outPath), function(err) {
	        if (err) {
	            console.error(err);
	        } else {
	            fs.writeFile(outPath, output, function(err) {
	                if (err) {
	                    console.error(err);
	                } else {
	                    consoleTimestampedMessage(chalk.green("built: ") + outPath + " " + chalk.yellow(humanReadableFilesize(outPath)));
	                    addTimeStamp(inPath);
	                }
	            });
	        }
	    });
	}
};