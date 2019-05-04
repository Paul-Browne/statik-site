const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const mime = require('mime-types');
const env = require('dotenv');
env.config();

const publicDirectoryName = process.env.PUBLIC_DIR_NAME || 'public';
const sourceDirectoryName = process.env.SOURCE_DIR_NAME || 'src';
const contentDirectoryName = process.env.CONTENT_DIR_NAME || 'content';
const contentDirectoryPath = sourceDirectoryName + '/' + contentDirectoryName;

const utility = require('./utility.js');
const cssFunc = require('./css.js');
const sassFunc = require('./sass.js');
const lessFunc = require('./less.js');
const jsFunc = require('./javascript.js');
const imgFunc = require('./images.js');
const svgFunc = require('./svg.js');
const htmlFunc = require('./html.js');

function init(_path){
    var buildStamp = fs.readFileSync(".buildStamp", 'utf8');
    function fileHasBeenChangedSinceLastBuild(path, buildStamp){
        var check = fs.statSync(path);
        if ( check.mtimeMs > buildStamp || check.ctimeMs > buildStamp ) {
            return true;
        }else{
            return false;
        }
    }
    var htmlFuncCalled = false;
    function jsons() {
        var arr = ["sitemap.json", "contentmap.json"];
        arr.forEach(function(element, index) {
            if (!htmlFuncCalled && fileHasBeenChangedSinceLastBuild(element, buildStamp)) {
                utility.consoleTimestampedMessage(chalk.cyan("processed: ") + element + " " + chalk.yellow(utility.humanReadableFilesize(element)));
                htmlFuncCalled = true;
                htmlFunc();
            }
        });
    }

    function walkSync(inDirectory, outDirectory) {
        if (fs.statSync(inDirectory).isDirectory()) {
            fs.readdirSync(inDirectory).map(subDirectory => walkSync(path.join(inDirectory, subDirectory), path.join(outDirectory, subDirectory)))
        } else {
            if (inDirectory.indexOf(contentDirectoryPath) === 0) {
                if (!htmlFuncCalled && fileHasBeenChangedSinceLastBuild(inDirectory, buildStamp)) {
                    utility.consoleTimestampedMessage(chalk.cyan("processed: ") + inDirectory + " " + chalk.yellow(utility.humanReadableFilesize(inDirectory)));
                    htmlFuncCalled = true;
                    htmlFunc();
                }
            } else if (inDirectory.indexOf(sourceDirectoryName + '/css') === 0 && fileHasBeenChangedSinceLastBuild(inDirectory, buildStamp) ) {
                if (mime.lookup(inDirectory) === 'text/css') {
                    utility.consoleTimestampedMessage(chalk.cyan("processed: ") + inDirectory + " " + chalk.yellow(utility.humanReadableFilesize(inDirectory)));
                    cssFunc(fs.readFileSync(inDirectory, 'utf8'), inDirectory, outDirectory);
                }
            } else if ( (inDirectory.indexOf(sourceDirectoryName + '/scss') === 0 || inDirectory.indexOf(sourceDirectoryName + '/sass') === 0) && fileHasBeenChangedSinceLastBuild(inDirectory, buildStamp) ) {
                if (mime.lookup(inDirectory) === 'text/x-scss' || mime.lookup(inDirectory) === 'text/x-sass') {
                    utility.consoleTimestampedMessage(chalk.cyan("processed: ") + inDirectory + " " + chalk.yellow(utility.humanReadableFilesize(inDirectory)));
                    sassFunc(inDirectory, outDirectory);
                }
            } else if (inDirectory.indexOf(sourceDirectoryName + '/less') === 0 && fileHasBeenChangedSinceLastBuild(inDirectory, buildStamp) ) {
                if (mime.lookup(inDirectory) === 'text/less') {
                    utility.consoleTimestampedMessage(chalk.cyan("processed: ") + inDirectory + " " + chalk.yellow(utility.humanReadableFilesize(inDirectory)));
                    lessFunc(fs.readFileSync(inDirectory, 'utf8'), inDirectory, outDirectory);
                }
            } else if (inDirectory.indexOf(sourceDirectoryName + '/js') === 0 && fileHasBeenChangedSinceLastBuild(inDirectory, buildStamp) ) {
                if (mime.lookup(inDirectory) === 'application/javascript') {
                    utility.consoleTimestampedMessage(chalk.cyan("processed: ") + inDirectory + " " + chalk.yellow(utility.humanReadableFilesize(inDirectory)));
                    jsFunc(fs.readFileSync(inDirectory, 'utf8'), inDirectory, outDirectory)
                }
            } else if (inDirectory.indexOf(sourceDirectoryName + '/images') === 0 && fileHasBeenChangedSinceLastBuild(inDirectory, buildStamp) ) {
                if (mime.lookup(inDirectory) === 'image/jpeg' || mime.lookup(inDirectory) === 'image/png' || mime.lookup(inDirectory) === 'image/gif') { // todo check gif
                    utility.consoleTimestampedMessage(chalk.cyan("processed: ") + inDirectory + " " + chalk.yellow(utility.humanReadableFilesize(inDirectory)));
                    imgFunc(inDirectory, outDirectory);
                } else if (mime.lookup(inDirectory) === 'image/svg+xml') {
                    utility.consoleTimestampedMessage(chalk.cyan("processed: ") + inDirectory + " " + chalk.yellow(utility.humanReadableFilesize(inDirectory)));
                    // TODO: check if svg can be prettified
                    svgFunc(fs.readFileSync(inDirectory, 'utf8'), inDirectory, outDirectory);
                }
            } else if (inDirectory.indexOf(contentDirectoryPath) !== 0 && fileHasBeenChangedSinceLastBuild(inDirectory, buildStamp) ) {
                utility.consoleTimestampedMessage(chalk.cyan("processed: ") + inDirectory + " " + chalk.yellow(utility.humanReadableFilesize(inDirectory)));
                utility.writeOut(fs.readFileSync(inDirectory, 'utf8'), inDirectory, outDirectory);
            }
        }
    }
    jsons();
    if(_path){
        walkSync(_path, _path.replace(sourceDirectoryName, publicDirectoryName));
    }else{
        walkSync(sourceDirectoryName, publicDirectoryName);
    }
    fs.writeFileSync(".buildStamp",  Date.now());
}

module.exports = function(_path) {
    init(_path);
};