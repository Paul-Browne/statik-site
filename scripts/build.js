var timerStart = Date.now();

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

function reformatOutputDirectory(dirOut, width) {
    var out = dirOut.replace("images", "images/" + width);
    return out;
}

function imageMaker(obj) {
    if (obj.width && sizeOf(obj.dirIn + obj.fileName).width >= obj.width) {
        jimp.read(obj.dirIn + obj.fileName, (err, file) => {
            if (err) {
                console.log(err);
            } else {
                file
                    .resize(obj.width, jimp.AUTO)
                    .quality(obj.quality)
                    .write(reformatOutputDirectory(obj.dirOut, obj.width) + obj.fileName);
                console.log(reformatOutputDirectory(obj.dirOut, obj.width) + obj.fileName + " generated, total time elapsed " + ((Date.now() - timerStart) / 1000).toFixed(2) + " seconds");
            }
        });
    } else if (!obj.width) {
        jimp.read(obj.dirIn + obj.fileName, (err, file) => {
            if (err) {
                console.log(err);
            } else {
                file
                    .quality(obj.quality)
                    .write(obj.dirOut + obj.fileName);
                console.log(obj.dirOut + obj.fileName + " generated, total time elapsed " + ((Date.now() - timerStart) / 1000).toFixed(2) + " seconds");
            }
        });
    }
}

var builtHTML = false;

function readDirRecursive(inDirectory, outDirectory) {
    fs.readdir(inDirectory, (err, filesOrDirectories) => {
        filesOrDirectories.forEach(filename => {
            if (fs.lstatSync(inDirectory + filename).isDirectory()) {
                readDirRecursive(inDirectory + filename + "/", outDirectory + filename + "/");
            } else {
                if (inDirectory.indexOf(contentDirectoryPath) === 0 && !builtHTML) {
                    builtHTML = true;
                    runScript("./scripts/html.js", function(err) {
                        if (err) {
                            console.error(err);
                        }
                    });
                } else if (inDirectory.indexOf(sourceDirectoryName + "/css") === 0) {
                    if (mime.lookup(filename) === "text/css") {
                        var source = fs.readFileSync(inDirectory + filename, 'utf8');
                        postcss([
                                autoprefixer({
                                    browsers: [
                                        "> 0.5%",
                                        "IE 10"
                                    ]
                                }),
                                cleanCSS()
                            ])
                            .process(source, { from: inDirectory + filename, to: outDirectory + filename })
                            .then(result => {
                                mkdirp(outDirectory, function(err) {
                                    if (err) {
                                        console.error(err);
                                    } else {
                                        fs.writeFile(outDirectory + filename, result.css, function(err) {
                                            if (err) {
                                                console.error(err);
                                            } else {
                                                console.log(outDirectory + filename + " generated, total time elapsed " + ((Date.now() - timerStart) / 1000).toFixed(2) + " seconds");
                                            }
                                        });
                                    }
                                });
                            })
                    }
                } else if (inDirectory.indexOf(sourceDirectoryName + "/scss") === 0 || inDirectory.indexOf(sourceDirectoryName + "/sass") === 0) {
                    if (mime.lookup(filename) === "text/x-scss" || mime.lookup(filename) === "text/x-sass") {
                        sass.render({
                            file: inDirectory + filename,
                        }, function(err, result) {
                            if (err) {
                                console.error(err);
                            } else {
                                postcss([
                                        autoprefixer({
                                            browsers: [
                                                "> 0.5%",
                                                "IE 10"
                                            ]
                                        }),
                                        cleanCSS()
                                    ])
                                    .process(result.css, { from: inDirectory + filename, to: outDirectory.replace(/\/s(a|c)ss/, "/css") + filename.replace(/\.s(a|c)ss/, ".css") })
                                    .then(res => {
                                        mkdirp(outDirectory.replace(/\/s(a|c)ss/, "/css"), function(err) {
                                            if (err) {
                                                console.error(err);
                                            } else {
                                                fs.writeFile(outDirectory.replace(/\/s(a|c)ss/, "/css") + filename.replace(/\.s(a|c)ss/, ".css"), res.css, function(err) {
                                                    if (err) {
                                                        console.error(err);
                                                    } else {
                                                        console.log(outDirectory.replace(/\/s(a|c)ss/, "/css") + filename.replace(/\.s(a|c)ss/, ".css") + " generated, total time elapsed " + ((Date.now() - timerStart) / 1000).toFixed(2) + " seconds");
                                                    }
                                                });
                                            }
                                        });
                                    })
                            }
                        });
                    }
                } else if (inDirectory.indexOf(sourceDirectoryName + "/less") === 0) {
                    if (mime.lookup(filename) === "text/less") {
                        less.render(fs.readFileSync(inDirectory + filename, 'utf8'), function(err, result) {
                            if (err) {
                                console.error(err);
                            } else {
                                postcss([
                                        autoprefixer({
                                            browsers: [
                                                "> 0.5%",
                                                "IE 10"
                                            ]
                                        }),
                                        cleanCSS()
                                    ])
                                    .process(result.css, { from: inDirectory + filename, to: outDirectory.replace("/less", "/css") + filename.replace(".less", ".css") })
                                    .then(res => {
                                        mkdirp(outDirectory.replace("/less", "/css"), function(err) {
                                            if (err) {
                                                console.error(err);
                                            } else {
                                                fs.writeFile(outDirectory.replace("/less", "/css") + filename.replace(".less", ".css"), res.css, function(err) {
                                                    if (err) {
                                                        console.error(err);
                                                    } else {
                                                        console.log(outDirectory.replace("/less", "/css") + filename.replace(".less", ".css") + " generated, total time elapsed " + ((Date.now() - timerStart) / 1000).toFixed(2) + " seconds");
                                                    }
                                                });
                                            }
                                        });
                                    })
                            }
                        })
                    }
                } else if (inDirectory.indexOf(sourceDirectoryName + "/js") === 0) {
                    if (mime.lookup(filename) === "application/javascript") {
                        var source = fs.readFileSync(inDirectory + filename, 'utf8');
                        var transform = babel.transformSync(source, { filename }).code;
                        var result = uglifyJS.minify(transform);
                        mkdirp(outDirectory, function(err) {
                            if (err) {
                                console.error(err);
                            } else {
                                fs.writeFile(outDirectory + filename, result.code, function(err) {
                                    if (err) {
                                        console.error(err);
                                    } else {
                                        console.log(outDirectory + filename + " generated, total time elapsed " + ((Date.now() - timerStart) / 1000).toFixed(2) + " seconds");
                                    }
                                });
                            }
                        });
                    }
                } else if (inDirectory.indexOf(sourceDirectoryName + "/images") === 0) {
                    if (mime.lookup(filename) === "image/jpeg" || mime.lookup(filename) === "image/png" || mime.lookup(filename) === "image/gif") { // todo check gif
                        imageMaker({
                            dirIn: inDirectory,
                            dirOut: outDirectory,
                            fileName: filename,
                            width: 40,
                            quality: 0
                        });
                        imageMaker({
                            dirIn: inDirectory,
                            dirOut: outDirectory,
                            fileName: filename,
                            width: 400,
                            quality: 75
                        });
                        imageMaker({
                            dirIn: inDirectory,
                            dirOut: outDirectory,
                            fileName: filename,
                            width: 800,
                            quality: 75
                        });
                        imageMaker({
                            dirIn: inDirectory,
                            dirOut: outDirectory,
                            fileName: filename,
                            width: 1200,
                            quality: 75
                        });
                        imageMaker({
                            dirIn: inDirectory,
                            dirOut: outDirectory,
                            fileName: filename,
                            width: 1600,
                            quality: 75
                        });
                        imageMaker({
                            dirIn: inDirectory,
                            dirOut: outDirectory,
                            fileName: filename,
                            width: 2000,
                            quality: 75
                        });
                        imageMaker({
                            dirIn: inDirectory,
                            dirOut: outDirectory,
                            fileName: filename,
                            quality: 75
                        });
                    } else if (mime.lookup(filename) === "image/svg+xml") {
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
                        svgoOpts.optimize(fs.readFileSync(inDirectory + filename, 'utf8')).then(result => {
                            mkdirp(outDirectory, function(err) {
                                if (err) {
                                    console.error(err);
                                } else {
                                    fs.writeFile(outDirectory + filename, result.data, function(err) {
                                        if (err) {
                                            console.error(err);
                                        } else {
                                            console.log(outDirectory + filename + " generated, total time elapsed " + ((Date.now() - timerStart) / 1000).toFixed(2) + " seconds");
                                        }
                                    });
                                }
                            });
                        });
                    }
                } else {
                    // copy everything else
                    if (inDirectory.indexOf(contentDirectoryPath) !== 0) {
                        fs.copy(inDirectory + filename, outDirectory + filename, err => {
                            if (err) {
                                console.error(err)
                            } else {
                                console.log(outDirectory + filename + " generated, total time elapsed " + ((Date.now() - timerStart) / 1000).toFixed(2) + " seconds");
                            }
                        })
                    }
                }
            }
        });
    })
}

readDirRecursive(sourceDirectoryName + "/", publicDirectoryName + "/");