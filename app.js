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
// note I needed to add 'chmod -R +u *'  on 1.6 to set read permissions on all files (this was for the legacy exported spider.php html files)  
app.use(express.static(__dirname + '/public'));
/// do rendering
// index - / at the moment - change so it's more specific/configurable 
app.get('/', function (req, res) {
//res.render('your page', {pageData: {name : ['name 1', name 2]}});
    console.log("is xhr = " + req.xhr);
    res.render('index', { title : 'Home', config: config});
});

// apidata should be config - already used in dojoConfig // for module clicks
// also should be able to generate htlml from module urls (and version) e.g. this currently works http://localhost:3000/apidata/version/dijit/_TemplatedMixin
app.get('/' + config.apiDataPath + '/*', function (req, res) {
    //var returnstr = "<div>req.params : " + req.params.toString()+"</div>";
    // replace with regex
    console.log("is xhr = " + req.xhr);
    var requested =  req.params.toString().replace(/\/version\//, "");
    console.log("requested = " + requested);
    var idxslash = requested.indexOf("/");
    var version = requested.slice(0, idxslash);
    var modulefile = requested.slice(++idxslash);
    console.log("version = " + version + ", modulefile = " + modulefile);
    var detailsFile = "./public/" + config.apiDataPath + "/" + version + "/details.json";
    /// and a jade modulefile render
    generate.generate(detailsFile, modulefile, version, function (retObjectItem) {
        res.render('module', { module : retObjectItem, config: config});
    });
    // should do some error handling http responses    
});



app.listen(config.port);
console.error("REMEMBER TO DELETE ANY STATIC .HTML FILES WHICH EXPRESS STATIC WILL RENDER INSTEAD OF TEMPLATES");
console.log("API viewer started on port " + config.port);