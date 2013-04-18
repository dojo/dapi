var express = require('express'),
    stylus = require('stylus'),
    fs = require('fs'),
    nib = require('nib'),
    jade = require('jade'),
    mkdirp = require("mkdirp"),
    generate = require('./lib/generate'),
    envConfig = require('./lib/config'),
    config = envConfig.appConfig;

// hardcoded config atm - move to configurable arguments object with these as defaults - mixins
//var details = __dirname +'/public/scripts/apidata/version/details.xml'; // only dojo exists
//var details = __dirname +'/public/scripts/apidata/version/details_dijit.xml'; // dijit/_WidgetBase good 1 to try
//var details = __dirn  ame +'/public/scripts/apidata/version/details_huge.xml'; // all mods
//var details = __dirname +'/public/scripts/apidata/version/details_all.xml'; // latest doc parse with all packs 
var details = __dirname + '/public/scripts/apidata/version/details.json'; // latest doc parse with all packs
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

/// do rendering
// index - / at the moment - change so it's more specific/configurable 
app.get('/', function (req, res) {
//res.render('your page', {pageData: {name : ['name 1', name 2]}});
    res.render('index', { title : 'Home', config: config});
});

// apidata should be config - already used in dojoConfig // for module clicks
// also should be able to generate htlml from module urls (and version) e.g. this currently works http://localhost:3000/apidata/version/dijit/_TemplatedMixin 
app.get('/apidata*', function (req, res) {
    //var returnstr = "<div>req.params : " + req.params.toString()+"</div>";

    var modulefile =  req.params.toString().replace(/\/version\//, "");
    /// and a jade modulefile render
    generate.generate(config.detailsFile, modulefile, config, function (retObjectItem) {
        res.render('module', { module : retObjectItem, config: config});
    });
    // should do some error handling http responses    
});
app.listen(3000);
console.log("API viewer started");