const fs = require('fs-extra');
const mkdirp = require('mkdirp');

var comments = JSON.parse(fs.readFileSync("src/content/data/wp-json/comments.id.json", 'utf8'));

var tags = JSON.parse(fs.readFileSync("src/content/data/wp-json/tags.slug.json", 'utf8'));
var categories = JSON.parse(fs.readFileSync("src/content/data/wp-json/categories.slug.json", 'utf8'));
var users = JSON.parse(fs.readFileSync("src/content/data/wp-json/users.slug.json", 'utf8'));
var posts = JSON.parse(fs.readFileSync("src/content/data/wp-json/posts.slug.json", 'utf8'));
var pages = JSON.parse(fs.readFileSync("src/content/data/wp-json/pages.slug.json", 'utf8'));

//var media = JSON.parse(fs.readFileSync("src/content/data/wp-json/media.id.json", 'utf8'));

for (var key in pages){
    fs.writeFile("src/content/data/wp-json/pages/" + pages[key].slug + ".json", JSON.stringify(pages[key]), function(err) {
        if (err) {
            console.error(err);
        }
    }); 
}
for (var key in tags){
    fs.writeFile("src/content/data/wp-json/tags/" + tags[key].slug + ".json", JSON.stringify(tags[key]), function(err) {
        if (err) {
            console.error(err);
        }
    }); 
}
for (var key in categories){
    fs.writeFile("src/content/data/wp-json/categories/" + categories[key].slug + ".json", JSON.stringify(categories[key]), function(err) {
        if (err) {
            console.error(err);
        }
    }); 
}
for (var key in users){
    fs.writeFile("src/content/data/wp-json/users/" + users[key].slug + ".json", JSON.stringify(users[key]), function(err) {
        if (err) {
            console.error(err);
        }
    }); 
}

var sortedComments = {};
for (var key in comments){
    sortedComments[comments[key].post] = sortedComments[comments[key].post] || [];
    sortedComments[comments[key].post].push(comments[key]);
}

for (var i in posts){    
    posts[i].ss = {};
    posts[i].ss.comments = [];
    for(var j in sortedComments){
        if(j == posts[i].id){
            posts[i].ss.comments = sortedComments[j];
        }
    }
    posts[i].ss.tags = [];
    for(var k in tags){
        posts[i].tags.forEach( tag => {
            if(tags[k].id == tag){
                posts[i].ss.tags.push(tags[k]);
            }
        });
    }
    posts[i].ss.categories = [];
    for(var l in categories){
        posts[i].categories.forEach( category => {
            if(categories[l].id == category){
                posts[i].ss.categories.push(categories[l]);
            }
        });
    }
    for(var m in users){
        if(users[m].id == posts[i].author){
            posts[i].ss.author = users[m];
        }
    }
}

for(var key in posts){
    fs.writeFile("src/content/data/wp-json/posts/" + posts[key].slug + ".json", JSON.stringify(posts[key]), function(err) {
        if (err) {
            console.error(err);
        }
    });    
};

fs.removeSync("src/content/data/wp-json/comments.id.json");
fs.removeSync("src/content/data/wp-json/tags.slug.json");
fs.removeSync("src/content/data/wp-json/categories.slug.json");
fs.removeSync("src/content/data/wp-json/users.slug.json");
fs.removeSync("src/content/data/wp-json/posts.slug.json");
fs.removeSync("src/content/data/wp-json/pages.slug.json");


