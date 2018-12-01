const fs = require('fs-extra');
const env = require('dotenv');
const jimp = require('jimp');
const mime = require('mime-types');
const sizeOf = require('image-size');
env.config();
const publicDirectoryName = process.env.PUBLIC_DIR_NAME || 'public';
const sourceDirectoryName = process.env.SOURCE_DIR_NAME || 'src';
const contentDirectoryName = process.env.CONTENT_DIR_NAME || 'content';
const contentDirectoryPath = sourceDirectoryName + "/" + contentDirectoryName;

// todo recursively look in directories

fs.readdir(sourceDirectoryName + "/images", (err, files) => {
    files.forEach(filename => {
        if (mime.lookup(filename) === "image/jpeg" || mime.lookup(filename) === "image/png" || mime.lookup(filename) === "image/gif") { // todo check gif

            // make placeholder images (low quality)
            if(sizeOf(sourceDirectoryName + "/images/" + filename).width >= 40 ){
                jimp.read(sourceDirectoryName + "/images/" + filename, (err, file) => {
                    if (err) {
                        console.log(err);
                    } else {
                        file
                            .resize(40, jimp.AUTO)
                            .quality(0)
                            .write(publicDirectoryName + "/images/placeholders/" + filename);
                    }
                });
            }
            
            // make 400px width of images
            if(sizeOf(sourceDirectoryName + "/images/" + filename).width >= 400 ){
                jimp.read(sourceDirectoryName + "/images/" + filename, (err, file) => {
                    if (err) {
                        console.log(err);
                    } else {
                        file
                            .resize(400, jimp.AUTO)
                            .quality(80)
                            .write(publicDirectoryName + "/images/400/" + filename);
                    }
                });
            }

            // make 800px width of images
            if(sizeOf(sourceDirectoryName + "/images/" + filename).width >= 800 ){
                jimp.read(sourceDirectoryName + "/images/" + filename, (err, file) => {
                    if (err) {
                        console.log(err);
                    } else {
                        file
                            .resize(800, jimp.AUTO)
                            .quality(80)
                            .write(publicDirectoryName + "/images/800/" + filename);
                    }
                });
            }

            // make 1200px width of images
            if(sizeOf(sourceDirectoryName + "/images/" + filename).width >= 1200 ){
                jimp.read(sourceDirectoryName + "/images/" + filename, (err, file) => {
                    if (err) {
                        console.log(err);
                    } else {
                        file
                            .resize(1200, jimp.AUTO)
                            .quality(80)
                            .write(publicDirectoryName + "/images/1200/" + filename);
                    }
                });
            }

            // copy original image (with compression)
            jimp.read(sourceDirectoryName + "/images/" + filename, (err, file) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log(filename + " processed");
                    file
                        .quality(80)
                        .write(publicDirectoryName + "/images/" + filename);
                }
            });
        }
    });
})


