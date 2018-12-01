const childProcess = require('child_process');
const chokidar = require('chokidar');
const env = require('dotenv');
env.config();

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


var watcherFiles = chokidar.watch([contentDirectoryPath, "contentmap.json", "sitemap.json"], {
    persistent: true,
    ignoreInitial: true
});
runScript('./build.js', function(err) {
    if (err) {
        console.error(err);
    }
});
watcherFiles.on('all', (event, path) => {
    console.log(event, path);
    runScript('./build.js', function(err) {
        if (err) {
            console.error(err);
        }
        console.log("file: " + path);
    });
});


var watcherImages = chokidar.watch(sourceDirectoryName + "/images", {
    persistent: true,
    ignoreInitial: true
});
runScript('./images.js', function(err) {
    if (err) {
        console.error(err);
    }
});
watcherImages.on('all', (event, path) => {
    console.log(event, path);
    runScript('./images.js', function(err) {
        if (err) {
            console.error(err);
        }
        console.log("image: " + path);
    });
});


var watcherCss = chokidar.watch(sourceDirectoryName + "/css", {
    persistent: true,
    ignoreInitial: true
});
runScript('./css.js', function(err) {
    if (err) {
        console.error(err);
    }
});
watcherImages.on('all', (event, path) => {
    console.log(event, path);
    runScript('./css.js', function(err) {
        if (err) {
            console.error(err);
        }
        console.log("image: " + path);
    });
});


// var watcherJs = chokidar.watch(sourceDirectoryName + "/js", {
//     persistent: true,
//     ignoreInitial: true
// });
// runScript('./js.js', function(err) {
//     if (err) {
//         console.error(err);
//     }
// });
// watcherImages.on('all', (event, path) => {
//     console.log(event, path);
//     runScript('./js.js', function(err) {
//         if (err) {
//             console.error(err);
//         }
//         console.log("image: " + path);
//     });
// });


runScript('./serve.js', function(err) {
    if (err) {
        console.error(err);
    }
});

