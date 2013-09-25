/** @module spider */
var fs = require('fs'),
    jade = require('jade'),
    mkdirp = require("mkdirp"),
    generate = require('./lib/generate'),
    config = require('./config'),
    refdoc = require('./lib/refdoc'),
    tree = require('./lib/tree'),
    staticFolder = 'staticoutput/';

// macro calls
// fails with static generation - todo: FOR SOME REASON I NEED TO USE A GLOBAL so it works???
convertType = generate.convertType;
autoHyperlink = generate.autoHyperlink;
hasRefDoc = refdoc.hasRefDoc;
getRefDoc = refdoc.getRefDoc;
// var versions = tree.getVersions(config, false);
console.log("REMEMBER TO SET THE CORRECT CONTEXT PATH CONFIGURATION FOR YOUR GENERATED DOCS");
console.log("==========================================================");
console.log("Static API viewer generation started");
// generate index  config.version config.staticfolder

var indexjade = __dirname + "/" + config.viewsDirectory + "/index.jade";
var data = fs.readFileSync(indexjade, "utf8");
var fn = jade.compile(data, {filename: indexjade, pretty: true});
var indexhtml = fn({ title : 'API Documentation' + config.siteName, config: config, module : null});
// generate tree.html

// var treeitems = tree.getTree(config.spiderVersion, config);
var treejade = __dirname + "/" + config.viewsDirectory + "/tree.jade";
var treedata = fs.readFileSync(treejade, "utf8");
var fntree = jade.compile(treedata, {filename: treejade, pretty: true});
// var treehtml = fntree({ title : 'API Documentation', config: config, version: config.spiderVersion, tree : treeitems});

fs.writeFileSync(staticFolder + "index.html", indexhtml);
var starttime = new Date().getTime();
// var detailsFile = "./public/data/" + config.spiderVersion + "/details.json";

// compile module
var modulejade = __dirname + "/" + config.viewsDirectory + "/module.jade";
var data = fs.readFileSync(modulejade, "utf8");
var fn = jade.compile(data, {filename: modulejade, pretty: true, autoHyperlink: autoHyperlink, convertType: convertType});
var now = null;

config.spiderVersions.forEach(function (version) {
    var treeitems = tree.getTree(version, config);
    var treehtml = fntree({ title : 'API Documentation', config: config, version: version, tree : treeitems});
    var detailsFile = "./public/data/" + version + "/details.json";
    var versionfolder = staticFolder  + version + "/";
    mkdirp.sync(versionfolder);
    fs.writeFileSync(versionfolder + "tree.html", treehtml);

    var dataFolder = staticFolder + 'data/' + version;
    mkdirp.sync(dataFolder);
    fs.writeFileSync(dataFolder + "/tree.json", JSON.stringify(treeitems));


// load details json (iterate over each version and generate html)
    generate.loadDetails(detailsFile,  version, function (err, details) {
        if (err) {
            console.error(err);
        }
        // generate modules
        Object.keys(details).forEach(function (item) {
            var itemlcl = details[item];
            var modulefile = itemlcl.location;
            generate.generate(detailsFile, modulefile, version, function (err, retObjectItem) {
                // modulefile.match(/[^/]* /); // move to regex
                var patharr = modulefile.split("/");
                var modname =  patharr.pop();
                if (patharr.length > 0) { // means a path - do this better
                    if (!fs.existsSync(versionfolder + patharr.join("/"))) {
                        mkdirp.sync(versionfolder + patharr.join("/"));
                    }
                }
                var html = fn({ module : retObjectItem, config: config, autoHyperLink: autoHyperlink});
                fs.writeFileSync(versionfolder + patharr.join("/") + "/" + modname + ".html", html);
                console.log('Wrote at ' + new Date().toISOString() + ' - ' + versionfolder + modulefile);
            });
        });
    });
});

process.on('exit', function () {
    console.log("elapsed time = " + (new Date().getTime() - starttime) + " ms");
});
