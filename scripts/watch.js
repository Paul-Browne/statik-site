const fs = require('fs-extra');
const path = require('path');
const childProcess = require('child_process');
const chokidar = require('chokidar');
const mime = require('mime-types');
const mkdirp = require('mkdirp');
const env = require('dotenv');
env.config();

const jimp = require('jimp');
const sizeOf = require('image-size');
const svgo = require('svgo');

const uglifyJS = require("uglify-js");
const babel = require("@babel/core");

const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const cleanCSS = require('postcss-clean');

const sass = require('node-sass');
const less = require('less');

const publicDirectoryName = process.env.PUBLIC_DIR_NAME || 'public';
const sourceDirectoryName = process.env.SOURCE_DIR_NAME || 'src';
const contentDirectoryName = process.env.CONTENT_DIR_NAME || 'content';
const contentDirectoryPath = sourceDirectoryName + "/" + contentDirectoryName;

function runScript(scriptPath, callback) {
    var invoked = false;
    var process = childProcess.fork(scriptPath);
    process.on('error', function(err) {
        if (invoked) return;
        invoked = true;
        callback(err);
    });
    process.on('exit', function(code) {
        if (invoked) return;
        invoked = true;
        var err = code === 0 ? null : new Error('exit code ' + code);
        callback(err);
    });
}

function reformatImagesOutputDirectory(dirOut, width) {
    var out = dirOut.replace("images", "images/" + width);
    return out;
}

function imageMaker(obj) {
    if (obj.width && sizeOf(obj.dirIn).width >= obj.width) {
        jimp.read(obj.dirIn, (err, file) => {
            if (err) {
                console.log(err);
            } else {
                file
                    .resize(obj.width, jimp.AUTO)
                    .quality(obj.quality)
                    .write(reformatImagesOutputDirectory(obj.dirOut, obj.width));
                console.log(reformatImagesOutputDirectory(obj.dirOut, obj.width) + " generated in " + ((Date.now() - obj.startTime) / 1000).toFixed(2) + " seconds");
            }
        });
    } else if (!obj.width) {
        jimp.read(obj.dirIn, (err, file) => {
            if (err) {
                console.log(err);
            } else {
                file
                    .quality(obj.quality)
                    .write(obj.dirOut);
                console.log(reformatImagesOutputDirectory(obj.dirOut, obj.width) + " generated in " + ((Date.now() - obj.startTime) / 1000).toFixed(2) + " seconds");
            }
        });
    }
}

function watching() {
    var watched = chokidar.watch([sourceDirectoryName, 'contentmap.json', 'sitemap.json'], {
        persistent: true,
        ignoreInitial: true
    });
    watched.on('all', (event, pathname) => {
        if (event !== "unlink" && event !== "unlinkDir") {
            var timerStart = Date.now();
            var filename = path.basename(pathname);
            if (pathname.indexOf(contentDirectoryPath) === 0 || pathname.indexOf('contentmap.json') === 0 || pathname.indexOf('sitemap.json') === 0) {
                // src/content
                // contentmap.json
                // sitemap.json
                runScript("./scripts/html.js", function(err) {
                    if (err) {
                        console.error(err);
                    }
                });
            } else if (pathname.indexOf(sourceDirectoryName + "/css") === 0) {
                // src/css
                if (mime.lookup(filename) === "text/css") {
                    // .css
                    var source = fs.readFileSync(pathname, 'utf8');
                    postcss([
                        autoprefixer(),
                        cleanCSS()
                    ])
                    .process(source, { from: pathname, to: pathname.replace(sourceDirectoryName, publicDirectoryName) })
                    .then(result => {
                        mkdirp(path.dirname(pathname.replace(sourceDirectoryName, publicDirectoryName)), function(err) {
                            if (err) {
                                console.error(err);
                            } else {
                                fs.writeFile(pathname.replace(sourceDirectoryName, publicDirectoryName), result.css, function(err) {
                                    if (err) {
                                        console.error(err);
                                    } else {
                                        console.log(pathname.replace(sourceDirectoryName, publicDirectoryName) + " generated in " + ((Date.now() - timerStart) / 1000).toFixed(2) + " seconds");
                                    }
                                });
                            }
                        });
                    })
                }
            } else if (pathname.indexOf(sourceDirectoryName + "/scss") === 0 || pathname.indexOf(sourceDirectoryName + "/sass") === 0) {
                // scss/sass
                if (mime.lookup(filename) === "text/x-scss" || mime.lookup(filename) === "text/x-sass") {
                    sass.render({
                        file: pathname,
                    }, function(err, result) {
                        if(err){
                            console.error(err);
                        }else{
                            postcss([
                                autoprefixer(),
                                cleanCSS()
                            ])
                            .process(result.css, { from: pathname, to: pathname.replace(/\/s(a|c)ss\//, "/css/").replace(/\.s(a|c)ss/, ".css").replace(sourceDirectoryName, publicDirectoryName) })
                            .then(res => {
                                mkdirp(path.dirname(pathname.replace(/\/s(a|c)ss\//, "/css/").replace(/\.s(a|c)ss/, ".css").replace(sourceDirectoryName, publicDirectoryName)), function(err) {
                                    if (err) {
                                        console.error(err);
                                    } else {
                                        fs.writeFile(pathname.replace(/\/s(a|c)ss\//, "/css/").replace(/\.s(a|c)ss/, ".css").replace(sourceDirectoryName, publicDirectoryName), res.css, function(err) {
                                            if (err) {
                                                console.error(err);
                                            } else {
                                                console.log(pathname.replace(/\/s(a|c)ss\//, "/css/").replace(/\.s(a|c)ss/, ".css").replace(sourceDirectoryName, publicDirectoryName) + " generated in " + ((Date.now() - timerStart) / 1000).toFixed(2) + " seconds");
                                            }
                                        });
                                    }
                                });
                            })                       
                        }
                    });
                }
            } else if (pathname.indexOf(sourceDirectoryName + "/less") === 0) {
                // less
                if (mime.lookup(filename) === "text/less") {
                    less.render(fs.readFileSync(pathname, 'utf8'), function(err, result) {
                        if(err){
                            console.error(err);
                        }else{
                            postcss([
                                autoprefixer(),
                                cleanCSS()
                            ])
                            .process(result.css, { from: pathname, to: pathname.replace("/less/", "/css/").replace(".less", ".css").replace(sourceDirectoryName, publicDirectoryName) })
                            .then(res => {
                                mkdirp(path.dirname(pathname.replace("/less/", "/css/").replace(".less", ".css").replace(sourceDirectoryName, publicDirectoryName)), function(err) {
                                    if (err) {
                                        console.error(err);
                                    } else {
                                        fs.writeFile(pathname.replace("/less/", "/css/").replace(".less", ".css").replace(sourceDirectoryName, publicDirectoryName), res.css, function(err) {
                                            if (err) {
                                                console.error(err);
                                            } else {
                                                console.log(pathname.replace("/less/", "/css/").replace(".less", ".css").replace(sourceDirectoryName, publicDirectoryName) + " generated in " + ((Date.now() - timerStart) / 1000).toFixed(2) + " seconds");
                                            }
                                        });
                                    }
                                });
                            })                         
                        }
                    })
                }
            } else if (pathname.indexOf(sourceDirectoryName + "/js") === 0) {
                // src/js
                if (mime.lookup(filename) === "application/javascript") {
                    // .js
                    var transform = babel.transformSync(fs.readFileSync(pathname, 'utf8'), { filename }).code;
                    var result = uglifyJS.minify(transform);
                    mkdirp(path.dirname(pathname.replace(sourceDirectoryName, publicDirectoryName)), function(err) {
                        if (err) {
                            console.error(err);
                        } else {
                            fs.writeFile(pathname.replace(sourceDirectoryName, publicDirectoryName), result.code, function(err) {
                                if (err) {
                                    console.error(err);
                                } else {
                                    console.log(pathname.replace(sourceDirectoryName, publicDirectoryName) + " generated in " + ((Date.now() - timerStart) / 1000).toFixed(2) + " seconds");
                                }
                            });
                        }
                    });
                }
            } else if (pathname.indexOf(sourceDirectoryName + "/images") === 0) {
                // src/images
                if (mime.lookup(filename) === "image/jpeg" || mime.lookup(filename) === "image/png" || mime.lookup(filename) === "image/gif") {
                    // .jpg, .png, .gif
                    imageMaker({
                        startTime: timerStart,
                        dirIn: pathname,
                        dirOut: pathname.replace(sourceDirectoryName, publicDirectoryName),
                        width: 40,
                        quality: 0
                    });
                    imageMaker({
                        startTime: timerStart,
                        dirIn: pathname,
                        dirOut: pathname.replace(sourceDirectoryName, publicDirectoryName),
                        width: 400,
                        quality: 75
                    });
                    imageMaker({
                        startTime: timerStart,
                        dirIn: pathname,
                        dirOut: pathname.replace(sourceDirectoryName, publicDirectoryName),
                        width: 800,
                        quality: 75
                    });
                    imageMaker({
                        startTime: timerStart,
                        dirIn: pathname,
                        dirOut: pathname.replace(sourceDirectoryName, publicDirectoryName),
                        width: 1200,
                        quality: 75
                    });
                    imageMaker({
                        startTime: timerStart,
                        dirIn: pathname,
                        dirOut: pathname.replace(sourceDirectoryName, publicDirectoryName),
                        width: 1600,
                        quality: 75
                    });
                    imageMaker({
                        startTime: timerStart,
                        dirIn: pathname,
                        dirOut: pathname.replace(sourceDirectoryName, publicDirectoryName),
                        width: 2000,
                        quality: 75
                    });
                    imageMaker({
                        startTime: timerStart,
                        dirIn: pathname,
                        dirOut: pathname.replace(sourceDirectoryName, publicDirectoryName),
                        quality: 75
                    });
                } else if (mime.lookup(filename) === "image/svg+xml") {
                    // .svg
                    var svgoOpts = new svgo({
                        plugins: [{
                            cleanupAttrs: true
                        }, {
                            removeDoctype: true
                        }, {
                            removeXMLProcInst: true
                        }, {
                            removeComments: true
                        }, {
                            removeMetadata: true
                        }, {
                            removeTitle: true
                        }, {
                            removeDesc: true
                        }, {
                            removeUselessDefs: true
                        }, {
                            removeEditorsNSData: true
                        }, {
                            removeEmptyAttrs: true
                        }, {
                            removeHiddenElems: true
                        }, {
                            removeEmptyText: true
                        }, {
                            removeEmptyContainers: true
                        }, {
                            removeViewBox: false
                        }, {
                            cleanupEnableBackground: true
                        }, {
                            convertStyleToAttrs: true
                        }, {
                            convertColors: true
                        }, {
                            convertPathData: true
                        }, {
                            convertTransform: true
                        }, {
                            removeUnknownsAndDefaults: true
                        }, {
                            removeNonInheritableGroupAttrs: true
                        }, {
                            removeUselessStrokeAndFill: true
                        }, {
                            removeUnusedNS: true
                        }, {
                            cleanupIDs: true
                        }, {
                            cleanupNumericValues: true
                        }, {
                            moveElemsAttrsToGroup: true
                        }, {
                            moveGroupAttrsToElems: true
                        }, {
                            collapseGroups: true
                        }, {
                            removeRasterImages: false
                        }, {
                            mergePaths: true
                        }, {
                            convertShapeToPath: true
                        }, {
                            sortAttrs: true
                        }, {
                            removeDimensions: true
                        }]
                    });
                    svgoOpts.optimize(fs.readFileSync(pathname, 'utf8')).then(result => {
                        mkdirp(path.dirname(pathname.replace(sourceDirectoryName, publicDirectoryName)), function(err) {
                            if (err) {
                                console.error(err);
                            } else {
                                fs.writeFile(pathname.replace(sourceDirectoryName, publicDirectoryName), result.data, function(err) {
                                    if (err) {
                                        console.error(err);
                                    } else {
                                        console.log(pathname.replace(sourceDirectoryName, publicDirectoryName) + " generated, total time elapsed " + ((Date.now() - timerStart) / 1000).toFixed(2) + " seconds");
                                    }
                                });
                            }
                        });
                    });
                }
            } else {
                fs.copy(pathname, pathname.replace(sourceDirectoryName, publicDirectoryName), err => {
                    if (err) {
                        console.error(err)
                    } else {
                        console.log(pathname.replace(sourceDirectoryName, publicDirectoryName) + " generated in " + ((Date.now() - timerStart) / 1000).toFixed(2) + " seconds");
                    }
                })
            }
        }
    });
}

watching();

