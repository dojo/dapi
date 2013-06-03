/** @module spider */
var stylus = require('stylus'),
    fs = require('fs'),
    nib = require('nib'),
    jade = require('jade'),
    mkdirp = require("mkdirp"),
    generate = require('./lib/generate'),
    envConfig = require('./appConfig'),
    refdoc = require('./lib/refdoc'),
    tree = require('./lib/tree'),
    config = envConfig.appConfig;

var details = __dirname + '/public/scripts/' + config.apiDataPath + '/' + config.defaultVersion + '/details.json'; // latest doc parse with all packs

// macro calls
// fails with static generation - todo: FOR SOME REASON I NEED TO USE A GLOBAL so it works???
convertType = generate.convertType;
autoHyperlink = generate.autoHyperlink;
hasRefDoc = refdoc.hasRefDoc;
getRefDoc = refdoc.getRefDoc;

function compile(str, path) {
    return stylus(str)
    .set('filename', path)
    .use(nib());
}
console.log("REMEMBER TO SET THE CORRECT CONTEXT PATH CONFIGURATION FOR YOUR GENERATED DOCS");
console.log("==========================================================");
console.log("Static API viewer generation started");
// generate index  config.version config.staticfolder
var indexjade = __dirname + "/" + config.viewsDirectory + "/index.jade";
var data = fs.readFileSync(indexjade, "utf8");
var fn = jade.compile(data, {filename: indexjade, pretty: true});
var indexhtml = fn({ title : 'DOJO API Viewer', config: config, module : null});
// generate tree.html
var treeitems = tree.getTree(config.defaultVersion, config);
var treejade = __dirname + "/" + config.viewsDirectory + "/tree.jade";
var treedata = fs.readFileSync(treejade, "utf8");
var fntree = jade.compile(treedata, {filename: treejade, pretty: true});
var treehtml = fntree({ title : 'DOJO API Viewer', config: config, version: config.defaultVersion, tree : treeitems});

// generate modules
//var staticFolder = process.cwd() + config.staticFolder;
var staticFolder = process.cwd() + "/public/" + config.apiDataPath + "/";
mkdirp.sync(staticFolder);
//fs.writeFileSync(staticFolder + "/index.html", indexhtml);
fs.writeFileSync("public/staticapi.html", indexhtml); // FTM make sure it's a different name from index.html, express static will load generated spider index.html first (before template)
var starttime = new Date().getTime();
// get details json (so it can iterate over the objects, generate html and so it's also cached)
var detailsFile = "./public/" + config.apiDataPath + "/" + config.defaultVersion + "/details.json";
generate.loadDetails(detailsFile,  config.defaultVersion, function (err, details) {
    var versionfolder = staticFolder + config.defaultVersion + "/";
    fs.writeFileSync(versionfolder + "/tree.html", treehtml);
    if (err) {
        console.error(err);
    }
    Object.keys(details).forEach(function (item) {
        var itemlcl = details[item];
        var modulefile = itemlcl.location;
        generate.generate(detailsFile, modulefile, config.defaultVersion, function (err, retObjectItem) {
            // modulefile.match(/[^/]* /); // move to regex
            var patharr = modulefile.split("/");

            var modname =  patharr.pop();
            if (patharr.length > 0) { // means a path - do this better
                if (!fs.existsSync(versionfolder + patharr.join("/"))) {
                    mkdirp.sync(versionfolder + patharr.join("/"));
                }
            }
            var modulejade = __dirname + "/" + config.viewsDirectory + "/module.jade";
            var data = fs.readFileSync(modulejade, "utf8");
            var fn = jade.compile(data, {filename: modulejade, pretty: true, autoHyperlink: autoHyperlink, convertType: convertType});
            var html = fn({ module : retObjectItem, config: config, autoHyperLink: autoHyperlink});
            fs.writeFileSync(versionfolder + patharr.join("/") + "/" + modname + ".html", html);
            console.log("wrote file " + versionfolder + modulefile);
        });
    });
});

process.on('exit', function () {
    console.log("elapsed time = " + (new Date().getTime() - starttime) + " ms");
});
// end generate modules