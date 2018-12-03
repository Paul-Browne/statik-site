const fs = require('fs-extra');
const env = require('dotenv');
const mime = require('mime-types');
const mkdirp = require('mkdirp');
const UglifyJS = require("uglify-js");
const babel = require("@babel/core");
env.config();
const publicDirectoryName = process.env.PUBLIC_DIR_NAME || 'public';
const sourceDirectoryName = process.env.SOURCE_DIR_NAME || 'src';
const contentDirectoryName = process.env.CONTENT_DIR_NAME || 'content';
const contentDirectoryPath = sourceDirectoryName + "/" + contentDirectoryName;

function readDirRecursive(inDirectory, outDirectory){
	fs.readdir(inDirectory, (err, filesOrDirectories) => {
	    filesOrDirectories.forEach(name => {
	    	if(fs.lstatSync(inDirectory + name).isDirectory()){
	    		readDirRecursive(inDirectory + name + "/", outDirectory + name + "/");
	    	}
			else{
				if (mime.lookup(name) === "application/javascript") { 
					var filename = name;
				    var source = fs.readFileSync(inDirectory + name, 'utf8');
				    var transform = babel.transformSync(source, {filename}).code;
				    var result = UglifyJS.minify(transform);
					mkdirp(outDirectory, function(err) {
					    if (err) {
					        console.error(err);
					    }else{
					    	fs.writeFile(outDirectory + name, result.code, function(err) {
					    	    if (err) {
					    	        console.error(err);
					    	    }
					    	});
					    }
					});
				}
			}
	    });
	})
}

readDirRecursive(sourceDirectoryName + "/js/", publicDirectoryName + "/js/");