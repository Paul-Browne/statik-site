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

function _request(url) {
    return new Promise((resolve, reject) => {
        request(url, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                resolve(body);
            } else {
                reject(error);
            }
        })
    })
}

function replacePlaceholdersWithDefaults(html){
    if (html.match(/\[\[.*?\|\|.*?\]\]/g)) {
        html.match(/\[\[.*?\|\|.*?\]\]/g).forEach(function(ph) {
            var def = ph.match(/\|\|.*?\]\]/)[0].slice(2).replace("]]", "");
            html = html.replace(ph, def);
        }, this)
    }
    return html;
}


function removeUnusedPlaceholders(html) {
    if (html.match(/\[\[(\w|-|_)*?\]\]/g)) {
        html.match(/\[\[(\w|-|_)*?\]\]/g).forEach(function(ph) {
            html = html.replace(ph, "");
        }, this)
    }
    return html;
}

function replacePlaceholders(filename, obj) {
    if (filename.match(/\[\w*\d+\]/g)) {
        filename.match(/\[\w*\d+\]/g).forEach(function(ph, index) {
            filename = filename.replace(ph, obj[ph.replace(/\D/g, "")]);
        }, this)
    }
    return filename;
}

function isExternal(path) {
    if (/^https?:\/\//.test(path)) {
        return true;
    } else {
        return false;
    }
}

async function generateHTML(mapObj, obj) {
    var output;
    for (var key in mapObj) {
        var string = new RegExp("\\[\\[" + key + "(\\|\\|.*?\\]\\]\|\\]\\])");
        var fileContents;
        if (key === "html") {
            if (isExternal(mapObj[key])) {
                output = await _request(replacePlaceholders(mapObj[key], obj));
            } else {
                output = fs.readFileSync(contentDirectoryPath + "/" + replacePlaceholders(mapObj[key], obj) + ".html", 'utf8');
            }
        } else if (typeof mapObj[key] === 'object') {
            var template;
            if (isExternal(mapObj[key].template)) {
                template = await _request(replacePlaceholders(mapObj[key].template, obj));
            } else {
                template = fs.readFileSync(contentDirectoryPath + "/" + replacePlaceholders(mapObj[key].template, obj), 'utf8');
            }
            var data;
            if (isExternal(mapObj[key].data)) {
                data = await _request(replacePlaceholders(mapObj[key].data, obj));
            } else {
                data = fs.readFileSync(contentDirectoryPath + "/" + replacePlaceholders(mapObj[key].data, obj), 'utf8');
            }
            if (mapObj[key].object) {
                data = JSON.parse(data)[replacePlaceholders(mapObj[key].object, obj)];
            } else {
                data = JSON.parse(data);
            }
            if (mapObj[key].engine) {
                if (mapObj[key].engine === "mustache") {
                    fileContents = mustache.render(template, data);
                } else if (mapObj[key].engine === "ejs") {
                    fileContents = ejs.render(template, data);
                } else if (mapObj[key].engine === "handlebars") {
                    template = handlebars.compile(template);
                    fileContents = template(data);
                } else if (mapObj[key].engine === "underscore" || mapObj[key].engine === "_") {
                    template = underscore.template(template);
                    fileContents = template(data);
                } else if (mapObj[key].engine === "dot") {
                    template = dot.template(template);
                    fileContents = template(data);
                } else if (mapObj[key].engine === "pug") {
                    template = pug.compile(template);
                    fileContents = template(data);
                } else if (mapObj[key].engine === "art") {
                    fileContents = art.render(template, data);
                }
            } else {
                // default to mustache template engine if engine is undefined
                fileContents = mustache.render(template, data);
            }
        } else {
            try {
                if (isExternal(mapObj[key])) {
                    fileContents = await _request(replacePlaceholders(mapObj[key], obj));
                } else {
                    fileContents = fs.readFileSync(contentDirectoryPath + "/" + replacePlaceholders(mapObj[key], obj) + ".html", 'utf8');
                }
            } catch (err) {
                fileContents = replacePlaceholders(mapObj[key], obj);
            }
        }
        output = output.replace(string, fileContents);
    }
    return output;
}

function createFile(name, dir, obj) {
    var dirPath = dir ? "/" + dir : "";
    var data = fs.readFileSync('contentmap.json', 'utf8');
    var json = JSON.parse(data);
    var html;
    for (var key in json) {
        if (key === obj[0]) {
            var mapObj = json[key];
            generateHTML(mapObj, obj).then(out => {
                html = removeUnusedPlaceholders(out);
                html = replacePlaceholdersWithDefaults(html);
                html = minify(html, {
                    removeAttributeQuotes: false,
                    collapseWhitespace: true,
                    minifyCSS: true,
                    minifyJS: true,
                    removeComments: true,
                    decodeEntities: true
                });
                fs.writeFile(publicDirectoryName + dirPath + "/" + name + ".html", html, function(err) {
                    if (err) {
                        console.error(err);
                    }
                });
                //console.log("https://localhost:8888/" + dirPath + (dirPath ? "/" : "") + name);
                console.log(publicDirectoryName + dirPath + "/" + name + ".html generated, total time elapsed " + ( (Date.now() - timerStart) / 1000).toFixed(2) + " seconds");
            })
        }
    }
}

function jsonWalker(obj, lvl) {
    for (var key in obj) {
        if (typeof obj[key] === 'object' && !(obj[key] instanceof Array) && !(obj[key] instanceof String)) {
            if (lvl) {
                mkdirp(publicDirectoryName + "/" + lvl + "/" + key, function(err) {
                    if (err) {
                        console.error(err);
                    }
                });
                jsonWalker(obj[key], lvl + "/" + key);
            } else {
                mkdirp(publicDirectoryName + "/" + key, function(err) {
                    if (err) {
                        console.error(err);
                    }
                });
                jsonWalker(obj[key], key);
            }
        } else if (obj[key] instanceof Array) {
            // create file
            if (lvl) {
                createFile(key, lvl, obj[key]);
            } else {
                createFile(key, lvl, obj[key]);
            }
        }
    }
}

function buildHtml() {
    fs.readFile('sitemap.json', 'utf8', function(err, data) {
        if (err) {
            console.error(err);
        } else {
            mkdirp(publicDirectoryName, function(err) {
                if (err) {
                    console.error(err);
                } else {
                    jsonWalker(JSON.parse(data));
                }
            });
        }
    });
}


buildHtml();