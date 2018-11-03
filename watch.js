const path = require("path");
const fs = require('fs');
const os = require('os');
const env = require('dotenv');
const mkdirp = require('mkdirp');
const mustache = require('mustache');
const chokidar = require('chokidar');
const minify = require('html-minifier').minify;

env.config();
const publicRoot = process.env.PUBLIC_DIR_NAME || 'public';
const sourceRoot = process.env.SOURCE_DIR_NAME || 'src';

// var watcher = chokidar.watch([sourceRoot, "contentmap.json", "sitemap.json"], {
//   persistent: true
// });

// // Something to use when events are received.
// var log = console.log.bind(console);
// // Add event listeners.
// watcher
//   .on('add', path => log(`File ${path} has been added`))
//   .on('change', path => log(`File ${path} has been changed`))
//   .on('unlink', path => log(`File ${path} has been removed`));

function replacePlaceholders(filename, obj) {
    if (filename.match(/\[\w*\d+\]/g)) {
        filename.match(/\[\w*\d+\]/g).forEach(function(ph, index) {
            filename = filename.replace(ph, obj[index + 1]);
        }, this)
    }
    return filename;
}

function rep(string, path, index){
	var reg = new RegExp( "PH" + index, "g")
	string.match(reg)
}

function betty(arr) {
    var data = fs.readFileSync('contentmap.json', 'utf8');
    var json = JSON.parse(data);

    arr.forEach(array => {
    	array.forEach( (string, index) => {
    		if(index){ // not 0
    			console.log(string);
    			var qwe = terry( json[array[0]] );
    			qwe.forEach(function(path){
    				rep(string, path, index);
    			})
    		}
    	})
    	// for (var key in json[array[0]]){
    	// 	console.log(json[array[0]][key]);
    	// }
    })

    // for (var key in json) {
    //     if (key === obj[0]) {
    //         return buildPage(json[key], obj);
    //     }
    // }
}

function terry(obj){
	var arr = [];
	return jsonWalker2(obj, arr);
}

function jsonWalker(obj, arr) {
    for (var key in obj) {
        if (typeof obj[key] === 'object' && !(obj[key] instanceof Array) && !(obj[key] instanceof String)) {
            jsonWalker(obj[key], arr);
        } else if (obj[key] instanceof Array) {
        	arr.push(obj[key]);
        }
    }
}

function jsonWalker2(obj, arr) {
    for (var key in obj) {
        if (typeof obj[key] === 'object' && !(obj[key] instanceof Array) && !(obj[key] instanceof String)) {
            jsonWalker2(obj[key], arr);
        } else {
        	arr.push(obj[key]);
        }
    }
}

function bob(obj){
	var arr = [];
	jsonWalker(obj, arr);
	//console.log(arr);
	betty(arr);
}



fs.readFile('sitemap.json', 'utf8', function(err, data) {
    if (err) {
        console.error(err);
    } else {
        bob(JSON.parse(data));
    }
});