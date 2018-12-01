const fs = require('fs-extra');
const env = require('dotenv');
const mime = require('mime-types');
const mkdirp = require('mkdirp');

const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const cleanCSS = require('postcss-clean');

env.config();
const publicDirectoryName = process.env.PUBLIC_DIR_NAME || 'public';
const sourceDirectoryName = process.env.SOURCE_DIR_NAME || 'src';
const contentDirectoryName = process.env.CONTENT_DIR_NAME || 'content';
const contentDirectoryPath = sourceDirectoryName + "/" + contentDirectoryName;

// todo recursively look in directories
// todo sass/less

fs.readdir(sourceDirectoryName + "/css", (err, files) => {
    files.forEach(filename => {
        if (mime.lookup(filename) === "text/css") {
            var source = fs.readFileSync(sourceDirectoryName + "/css/" + filename, 'utf8');
            postcss([
            	autoprefixer({
            		browsers: [
            			"> 0.5%",
            			"IE 10"
            		]
            	}),
				cleanCSS()
            ])
        	.process(source, { from: sourceDirectoryName + "/css/" + filename, to: publicDirectoryName + "/css/" + filename })
            .then(result => {
            	mkdirp(publicDirectoryName + "/css", function(err) {
            	    if (err) {
            	        console.error(err);
            	    }
            	});
                fs.writeFile(publicDirectoryName + "/css/" + filename, result.css, function(err) {
                    if (err) {
                        console.error(err);
                    }
                });
            })
        }
    });
})

