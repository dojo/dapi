/** @module app */
var express = require('express'),
    fs = require('fs'),
    jade = require('jade'),
    mkdirp = require("mkdirp"),
    generate = require('./lib/generate'),
    config = require('./config'),
    refdoc = require('./lib/refdoc'),
    tree = require('./lib/tree');

console.log("started at " + new Date());
var versions = tree.getVersions(config, false);
var app = express();
app.use(express.compress());
// jade indenting
app.locals.pretty = true;

// macro calls
// fails with static generation - TODO: FOR SOME REASON I NEED TO USE A GLOBAL so it works???
app.locals.convertType = generate.convertType;
app.locals.autoHyperlink = generate.autoHyperlink;
app.locals.hasRefDoc = refdoc.hasRefDoc;
app.locals.getRefDoc = refdoc.getRefDoc;

app.set('views', __dirname + '/' + config.viewsDirectory);
app.set('view engine', 'jade');
config.runner = "app"; // set a flag to determine if we're running from the app server
if (config.isDebug === true) {
    app.use(express.logger('dev'));
}

// handle legacy API file requests
var apiCtxReStr = config.contextPath.replace(/\//g, '\\/');
// only /\/api\/1.[3-7]/ is wanted i.e. only the contextPath followed by the version 1.[3-7] signifies legacy API HTML requests
// excludes JSON data for legacy e.g. /api/data/1.7/tree.json
var apiCtxRe = new RegExp('^' + apiCtxReStr + '1.[3-7]');
app.use(function (req, res, next) {
	if (!apiCtxRe.test(req.url)) { // not a legacy HTML request, so pass on to the next handler
		next();
		return;
	}
	config.legacyNSReplacers.some(function (obj) {
		if (obj.matcher.test(req.url)) {
			if (config.isDebug === true) {
				console.log("matched legacy url " + req.url + " and rewriting");
			}
			req.url = req.url.replace(obj.matcher, obj.replacer);
			return true;
		}
	});
	next();// send the request to the next handler (if rewritten or not)
});
// end handle legacy API file requests

app.use(config.contextPath, express.static(__dirname + '/public'));

app.get(config.contextPath, function (req, res) {
    if (config.isDebug === true) {
        console.log(new Date().toTimeString() + ", is xhr = " + req.xhr); // use this to determine if it's a permalink url or a module request url
    }
    res.render('index', { title : 'API Documentation' + config.siteName, config: config, module : null});
});

var re = new RegExp(config.moduleExtension + "$");

// apidata should be config - already used in dojoConfig // for module clicks
app.get(config.contextPath + '*', function (req, res, next) {
    // replace with regex
    if (config.isDebug === true) {
        console.log(new Date().toTimeString() + ", is xhr = " + req.xhr + ", requested = " + req.params.toString()); // use this to determine if it's a permalink url or a module request url
    }
    var requested = req.params.toString().replace(/\/$/, ""); // TODO - replace(/\/$/, ""); added, no time to look at but for example loading 1.6/dojo/Animation adds a trailing slash whilst 1.6/dojo/AdapterRegistry doesnt, something browser related? 
    var idxslash = requested.indexOf("/");
    var requestedVersion = requested.substring(0, idxslash);
    var modulefile = requested.slice(idxslash + 1);

    if (isNaN(requestedVersion)) {
        throw new Error("Version not understood - " + requestedVersion + ", " + new Date());
    }
    if (modulefile === "tree.html") {
        var treeitems = tree.getTree(requestedVersion, config);
        res.render('tree', { title : 'DOJO API Viewer', config: config, tree : treeitems, version: requestedVersion});
        return;
    }
    modulefile = modulefile.replace(re, ""); // replace the file extension
    // not sure if this is bad - handle versions earlier than 1.8 i.e. static html generated docs
	// TODO: see the bug with 23:16:04 GMT+0100 (BST), is xhr = true, requested = 1.10/dijit/CalendarLite/_MonthWidget.html
	// i.e. load the tree module for dijit/CalendarLite/_MonthWidget
    var lexicalVersions = requestedVersion.split('.');
    if (parseFloat(lexicalVersions[1]) < 8) { // not great but more than unlikely we'll use 3 dot separated versions
		var legacyfilelocation = __dirname + '/public/api/' + requestedVersion + '/' + modulefile.replace(/\./g, "/") + '.html';
		if (req.xhr === true) { // it's a module xhr
			res.sendfile(legacyfilelocation); // could be a security issue here
			return;
		} else { // it's a permalink for legacy
			// rewite the url to the ?qs= parm, meaning all legacy permalinked docs are still loaded via XHR.
			// the only other option is dynamically including the html in the template which wouldn't be good for performance
			// TODO: the .html extension is an issue, here im stripping it (compared to legacyfilelocation), this is also mirrored in the client JS (and FWIW apache)
			res.redirect(301, config.contextPath + '?qs=' + requestedVersion + '/' + modulefile.replace(/\./g, "/"));
			return;
		}
        // item.fullname.replace(/\./g, "/")
    }
    var detailsFile = "./public/data/" + requestedVersion + "/details.json";
    generate.generate(detailsFile, modulefile, requestedVersion, function (err, retObjectItem) {
        if (err) {
            console.error(err);
            next();
        }
        else if (req.xhr) {
            res.render('module', { module : retObjectItem, config: config});
        } else { // permalink request
            res.render('index', {title : retObjectItem.location + config.siteName, config: config, module: retObjectItem});
        }
    });
});

app.listen(config.port);
console.log("API viewer started on port " + config.port);

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.send(500, "Sorry there's been an error, please check the logs");
});