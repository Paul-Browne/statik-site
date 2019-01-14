var timerStart = Date.now();

const path = require("path");
const fs = require('fs-extra');
const os = require('os');
const env = require('dotenv');
env.config();
const mkdirp = require('mkdirp');
const minify = require('html-minifier').minify;
const request = require('request');

// template engines 
const mustache = require('mustache');
const handlebars = require('handlebars');
const underscore = require('underscore');
const art = require('art-template');
const ejs = require('ejs');
const dot = require('dot');
const pug = require('pug');

const publicDirectoryName = process.env.PUBLIC_DIR_NAME || 'public';
const sourceDirectoryName = process.env.SOURCE_DIR_NAME || 'src';
const contentDirectoryName = process.env.CONTENT_DIR_NAME || 'content';
const contentDirectoryPath = sourceDirectoryName + "/" + contentDirectoryName;
const siteName = process.env.SITE_NAME;




function qwe(){
    console.log("\n" + "Total pages: " + pages + "\n");
	console.log("TEMPLATES USED");
    console.log("==============\n");
    for (var key in templatesObject){
        console.log(key);
        console.log("==========\n");
        templatesObject[key].forEach(page => {
            console.log(page);
        });
        console.log("\nTotal pages: " + templatesObject[key].length + "\n");
    }

    fs.readFile('contentmap.json', 'utf8', function(err, data) {
        if (err) {
            console.error(err);
        } else {
            var parsed = JSON.parse(data);  
            for (var key in parsed){
                if(!templatesObject[key]){
                    console.log("TEMPLATES UNUSED");
                    console.log("================\n");
                    console.log(key + "\n");
                }
            }
        }
    });
}

var pages = 0;
var templatesObject = {};
function jsonWalker(obj, lvl) {
    for (var key in obj) {
        if (typeof obj[key] === 'object' && !(obj[key] instanceof Array) && !(obj[key] instanceof String)) {
            if (lvl) {
                jsonWalker(obj[key], lvl + "/" + key);
            } else {
                jsonWalker(obj[key], key);
            }
        } else if (obj[key] instanceof Array) {
        	var url = lvl ? lvl + "/" + key : key
        	var fullUrl = (siteName + "/" + url).replace("/index", "");
            console.log(fullUrl);
            pages++;
            if(!templatesObject[obj[key][0]]){
                templatesObject[obj[key][0]] = [fullUrl];
            }else{
                templatesObject[obj[key][0]].push(fullUrl);
            }
        }
    }
}

function buildHtml() {
    fs.readFile('sitemap.json', 'utf8', function(err, data) {
        if (err) {
            console.error(err);
        } else {
            console.log("PAGES");
            console.log("=====\n");
            jsonWalker(JSON.parse(data));
            qwe();
        }
    });
}

buildHtml();

