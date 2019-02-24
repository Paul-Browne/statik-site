const fs = require('fs-extra');
const env = require('dotenv');
env.config();

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

