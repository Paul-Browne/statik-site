var now = Date.now();

const fs = require('fs-extra');
const mkdirp = require('mkdirp');
const request = require('request');
const env = require('dotenv');
env.config();

const endpoint = process.env.SITE_NAME + "/" + ( process.env.WORDPRESS_API_ENDPOINT || "wp-json/wp/v2" );
const sourceDirectoryName = process.env.SOURCE_DIR_NAME || 'src';
const contentDirectoryName = process.env.CONTENT_DIR_NAME || 'content';
const wordpressDirectoryName = process.env.WORDPRESS_JSON_DIR || 'data/wp-json';
const contentDirectoryPath = sourceDirectoryName + '/' + contentDirectoryName;
const wordpressJsonLocation = contentDirectoryPath + "/" + wordpressDirectoryName;

function _request(url) {
    return new Promise((resolve, reject) => {
        request(url, (error, response, body) => {
            if (!error) {
                resolve({
                    body: body,
                    totalPages: response.headers['x-wp-totalpages'],
                    totalObj: response.headers['x-wp-total']
                });
            }
        })
    })
}

async function init(type) {
    var outputId = {};
    var outputSlug = {};
    var page = 1;
    var totalPages = page;
    while (page <= totalPages) {
        var data = await _request(endpoint + "/" + type + "?per_page=100&page=" + page);
        var parsed = JSON.parse(data.body);
        parsed.forEach(function(element, index) {
            outputId[element.id] = element;
            if (element.slug) {
                outputSlug[element.slug] = element;
            }
        });
        totalPages = data.totalPages;
        console.log(page + "/" + totalPages + " " + type + " processed (" + Object.keys(outputId).length + "/" + data.totalObj + ")");
        page++;
    }
    return [type, outputId, Object.keys(outputSlug).length && outputSlug];
}

var sitemapOut = {};

function writeOutAll(data) {
    mkdirp(wordpressJsonLocation + "/" + data[0] + "/", function(err) {
        if (err) {
            console.error(err);
        } else {
            if (data[2]) {
                fs.writeFile(wordpressJsonLocation + "/" + data[0] + ".slug.json", JSON.stringify(data[2]), function(err) {
                    if (err) {
                        console.error(err);
                    }
                });
                if (data[0] !== "media") {
                    sitemapOut[data[0]] = {};
                    for (var key in data[2]) {
                        sitemapOut[data[0]][key] = [data[0], key];
                    }
                    fs.writeFile("sitemap.json", JSON.stringify(sitemapOut), function(err) {
                        if (err) {
                            console.error(err);
                        }
                    });
                }
            } else {
                fs.writeFile(wordpressJsonLocation + "/" + data[0] + ".id.json", JSON.stringify(data[1]), function(err) {
                    if (err) {
                        console.error(err);
                    }
                });
            }

            var timeTaken = (Date.now() - now) / 1000 + " seconds";
            console.log("\n" + data[0] + " DONE " + timeTaken + "\n");

        }
    });
}

var types = [
    "pages",
    "posts",
    "categories",
    "tags",
    "users",
    "comments",
    // "media"
];

for (var type of types) {
    init(type).then(data => {
        writeOutAll(data);
    });
}