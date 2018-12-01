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

// todo recursively look in directories
// todo babel

fs.readdir(sourceDirectoryName + "/js", (err, files) => {
    files.forEach(filename => {
        if (mime.lookup(filename) === "application/javascript") { 
            var source = fs.readFileSync(sourceDirectoryName + "/js/" + filename, 'utf8');
            var result = babel.transformSync(source).code;
            
            //result = UglifyJS.minify(source);
            console.log(result);
        }
    });
})


