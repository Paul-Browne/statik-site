var timerStart = Date.now();

const path = require("path");
const fs = require('fs');
const os = require('os');
const env = require('dotenv');
const mkdirp = require('mkdirp');
const mustache = require('mustache');

const minify = require('html-minifier').minify;

env.config();
const publicRoot = process.env.PUBLIC_DIR_NAME || 'public';
const sourceRoot = process.env.SOURCE_DIR_NAME || 'src';

function removeUnusedPlaceholders(html) {
    if (html.match(/\[\[(\w|-)*\]\]/g)) {
        html.match(/\[\[(\w|-)*\]\]/g).forEach(function(ph) {
            //console.error(ph + " found but not replaces");
            html = html.replace(ph, "");
        }, this)
    }
    return html;
}


function replacePlaceholders(filename, obj) {
    if (filename.match(/\[\w*\d+\]/g)) {
        filename.match(/\[\w*\d+\]/g).forEach(function(ph, index) {
            filename = filename.replace(ph, obj[index + 1]);
        }, this)
    }
    return filename;
}


function buildPage(mapObj, obj) {
    console.log('buildPage', mapObj, obj);
    // add watcher to each file
    // and somehow map back to the
    // template so that only
    // templates that use that file are updated...
    var html;
    for (var key in mapObj) {
        var string = "[[" + key + "]]";
        var fileContents;
        if (key === "html") {
            html = fs.readFileSync(sourceRoot + "/" + mapObj[key] + ".html", 'utf8');
        } else if (typeof mapObj[key] === 'object') {
            var mustacheTemplate = fs.readFileSync(sourceRoot + "/" + replacePlaceholders(mapObj[key].template, obj), 'utf8');
            var mustacheData = fs.readFileSync(sourceRoot + "/" + replacePlaceholders(mapObj[key].data, obj), 'utf8');
            fileContents = mustache.render(mustacheTemplate, JSON.parse(mustacheData));
        } else {
            try {
                fileContents = fs.readFileSync(sourceRoot + "/" + replacePlaceholders(mapObj[key], obj) + ".html", 'utf8');
            } catch (err) {
                fileContents = replacePlaceholders(mapObj[key], obj);
            }
        }
        html = html.replace(string, fileContents);
    }
    html = removeUnusedPlaceholders(html);
    html = minify(html, {
        removeAttributeQuotes: true,
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
        removeComments: true,
        decodeEntities: true
    });
    return html;
}


function buildHTML(obj) {
    console.log("buildHTML", obj);
    var data = fs.readFileSync('contentmap.json', 'utf8');
    var json = JSON.parse(data);
    for (var key in json) {
        if (key === obj[0]) {
            return buildPage(json[key], obj);
        }
    }
}


function createFile(name, dir, obj) {
    console.log('createFile', name, obj);
    // remember which page uses what template
    var dirPath = dir ? "/" + dir : "";
    var contents = buildHTML(obj);
    fs.writeFile(publicRoot + dirPath + "/" + name + ".html", contents, function(err) {
        if (err) {
            console.error(err);
        }
    });
    newTime = Date.now() - timerStart;
    console.log(publicRoot + dirPath + "/" + name + ".html generated, total time elapsed " + (newTime/1000).toFixed(1) + " s");
}


function makeDir(path) {
    mkdirp(publicRoot + "/" + path, function(err) {
        if (err) {
            console.error(err);
        }
    });
}

function jsonWalker(obj, lvl) {
    for (var key in obj) {
        if (typeof obj[key] === 'object' && !(obj[key] instanceof Array) && !(obj[key] instanceof String)) {
            // create directory
            if (lvl) {
                makeDir(lvl + "/" + key);
                jsonWalker(obj[key], lvl + "/" + key);
            } else {
                makeDir(key);
                jsonWalker(obj[key], key);
            }
        } else if (obj[key] instanceof Array) {
            // create file
            if (lvl) {
                createFile(key, lvl, obj[key]);
            } else {
                createFile(key, undefined, obj[key]);
            }
        }
    }
}

fs.readFile('sitemap.json', 'utf8', function(err, data) {
    if (err) {
        console.error(err);
    } else {
        mkdirp(publicRoot, function(err) {
            if (err) {
                console.error(err);
            }
        });
        jsonWalker(JSON.parse(data));
    }
});