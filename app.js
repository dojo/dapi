var express = require('express'),
    stylus = require('stylus'),
    fs = require('fs'),
    nib = require('nib'),
    jade = require('jade'),
    mkdirp = require("mkdirp"),
    generate = require('./lib/generate'),
    envConfig = require('./lib/config'),
    config = envConfig.appConfig;

console.log("started at " + new Date());
// hardcoded config atm - move to configurable arguments object with these as defaults - mixins
//var details = __dirname +'/public/apidata/version/details.xml'; // only dojo exists
//var details = __dirname +'/public/apidata/version/details_dijit.xml'; // dijit/_WidgetBase good 1 to try
//var details = __dirn  ame +'/public/apidata/version/details_huge.xml'; // all mods
//var details = __dirname +'/public/apidata/version/details_all.xml'; // latest doc parse with all packs 
var details = __dirname + '/public/' + config.apiDataPath + '/' + config.defaultVersion + '/details.json'; // latest doc parse with all packs
var app = express();
// jade indenting
app.locals.pretty = true;

// fails with static generation - todo: FOR SOME REASON I NEED TO USE A GLOBAL so it works???
app.locals.convertType = generate.convertType;
app.locals.autoHyperlink = generate.autoHyperlink;


function compile(str, path) {
    return stylus(str)
    .set('filename', path)
    .use(nib());
}
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(stylus.middleware(
  { src: __dirname + '/public',
  compile: compile
  }
));
app.use(express.static(__dirname + '/public'));
// index - / at the moment - change so it's more specific/configurable 
app.get('/', function (req, res) {
    console.log("is xhr = " + req.xhr); // use this to determine if it's a permalink url or a module request url
    res.render('index', { title : 'DOJO API Viewer', config: config, module : null});
});

// apidata should be config - already used in dojoConfig // for module clicks
// also should be able to generate htlml from module urls (and version) e.g. this currently works http://localhost:3000/apidata/version/dijit/_TemplatedMixin
app.get(config.contextPath + config.apiDataPath + '/*', function (req, res) {
    // replace with regex
    console.log("is xhr = " + req.xhr); // use this to determine if it's a permalink url or a module request url
    console.log("requested = " + req.params.toString());
    var requested = req.params.toString().replace(/\/$/, ""); // TODO - replace(/\/$/, ""); added, no time to look at but for example loading 1.6/dojo/Animation adds a trailing slash whilst 1.6/dojo/AdapterRegistry doesnt, something browser related? 
    var idxslash = requested.indexOf("/");
    var requestedVersion = requested.substring(0, idxslash + 1);
    var modulefile = requested.slice(idxslash + 1);

    var version = req.params.toString().substring(0, 3); // should be done with regex? or is this the implied api?
    if (isNaN(version)) {
        throw new Error("Version not understood - " + version);
    }

    // not sure if this is bad - handle versions earlier than 1.8 i.e. static html generated docs
    if (parseFloat(version) < 1.8) { // currently expects a float i.e. no num
        // item.fullname.replace(/\./g, "/")
        var legacyfile = __dirname + '/public/api/' + version + '/' + modulefile.replace(/\./g, "/") + '.html';
        console.log("legacy file requested " + legacyfile);
        res.sendfile(legacyfile); // could be a security issue here
        return;
    }

    //if (parseFloat(version) < 1.8) 
    console.log("temp version = " + version + ", isNan = " + isNaN(version));
    //var version = requested.slice(0, idxslash);


    console.log("version = " + version + ", modulefile = " + modulefile);
    var detailsFile = "./public/" + config.apiDataPath + "/" + requestedVersion + "/details.json";
    /// and a jade modulefile render
    generate.generate(detailsFile, modulefile, requestedVersion, function (retObjectItem) {
        if (req.xhr) {
            res.render('module', { module : retObjectItem, config: config});
        } else { // permalink request
            res.render('index', { title : 'DOJO API Viewer', config: config, module: retObjectItem});
        }
    });
    // should do some error handling http responses    
});



app.listen(config.port);
console.error("REMEMBER TO DELETE ANY STATIC .HTML FILES WHICH EXPRESS STATIC WILL RENDER INSTEAD OF TEMPLATES");
console.log("==========================================================");
console.log("API viewer started on port " + config.port);

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.send(500, "Sorry there's been an error, please check the logs");
});