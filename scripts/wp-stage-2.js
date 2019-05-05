const fs = require('fs-extra');
const mkdirp = require('mkdirp');
const env = require('dotenv');
env.config();

const sourceDirectoryName = process.env.SOURCE_DIR_NAME || 'src';
const contentDirectoryName = process.env.CONTENT_DIR_NAME || 'content';
const wordpressDirectoryName = process.env.WORDPRESS_JSON_DIR || 'data/wp-json';
const contentDirectoryPath = sourceDirectoryName + '/' + contentDirectoryName;
const wordpressJsonLocation = contentDirectoryPath + "/" + wordpressDirectoryName;

var comments = JSON.parse(fs.readFileSync(wordpressJsonLocation + "/comments.id.json", 'utf8'));
var tags = JSON.parse(fs.readFileSync(wordpressJsonLocation + "/tags.slug.json", 'utf8'));
var categories = JSON.parse(fs.readFileSync(wordpressJsonLocation + "/categories.slug.json", 'utf8'));
var users = JSON.parse(fs.readFileSync(wordpressJsonLocation + "/users.slug.json", 'utf8'));
var posts = JSON.parse(fs.readFileSync(wordpressJsonLocation + "/posts.slug.json", 'utf8'));
var pages = JSON.parse(fs.readFileSync(wordpressJsonLocation + "/pages.slug.json", 'utf8'));

//var media = JSON.parse(fs.readFileSync(wordpressJsonLocation + "/media.id.json", 'utf8'));

for (var key in pages) {
    fs.writeFile(wordpressJsonLocation + "/pages/" + pages[key].slug + ".json", JSON.stringify(pages[key]), function(err) {
        if (err) {
            console.error(err);
        }
    });
}
for (var key in tags) {
    fs.writeFile(wordpressJsonLocation + "/tags/" + tags[key].slug + ".json", JSON.stringify(tags[key]), function(err) {
        if (err) {
            console.error(err);
        }
    });
}
for (var key in categories) {
    fs.writeFile(wordpressJsonLocation + "/categories/" + categories[key].slug + ".json", JSON.stringify(categories[key]), function(err) {
        if (err) {
            console.error(err);
        }
    });
}
for (var key in users) {
    fs.writeFile(wordpressJsonLocation + "/users/" + users[key].slug + ".json", JSON.stringify(users[key]), function(err) {
        if (err) {
            console.error(err);
        }
    });
}

var sortedComments = {};
for (var key in comments) {
    sortedComments[comments[key].post] = sortedComments[comments[key].post] || [];
    sortedComments[comments[key].post].push(comments[key]);
}

for (var i in posts) {
    posts[i].ss = {};
    posts[i].ss.comments = [];
    for (var j in sortedComments) {
        if (j == posts[i].id) {
            posts[i].ss.comments = sortedComments[j];
        }
    }
    posts[i].ss.tags = [];
    for (var k in tags) {
        posts[i].tags.forEach(tag => {
            if (tags[k].id == tag) {
                posts[i].ss.tags.push(tags[k]);
            }
        });
    }
    posts[i].ss.categories = [];
    for (var l in categories) {
        posts[i].categories.forEach(category => {
            if (categories[l].id == category) {
                posts[i].ss.categories.push(categories[l]);
            }
        });
    }
    for (var m in users) {
        if (users[m].id == posts[i].author) {
            posts[i].ss.author = users[m];
        }
    }
}

for (var key in posts) {
    fs.writeFile(wordpressJsonLocation + "/posts/" + posts[key].slug + ".json", JSON.stringify(posts[key]), function(err) {
        if (err) {
            console.error(err);
        }
    });
};

fs.removeSync(wordpressJsonLocation + "/comments.id.json");
fs.removeSync(wordpressJsonLocation + "/tags.slug.json");
fs.removeSync(wordpressJsonLocation + "/categories.slug.json");
fs.removeSync(wordpressJsonLocation + "/users.slug.json");
fs.removeSync(wordpressJsonLocation + "/posts.slug.json");
fs.removeSync(wordpressJsonLocation + "/pages.slug.json");
fs.removeSync(wordpressJsonLocation + "/comments/");