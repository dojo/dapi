var express = require('express'), 
    stylus = require('stylus'),
    xml2js = require('xml2js'),
    fs = require('fs'),
    util = require("util"),
    nib = require('nib'),
    generate = require('./lib/generate');

// static config - move to configurable arguments object
//var details = __dirname +'/public/scripts/apidata/version/details.xml'; // only dojo exists
var details = __dirname +'/public/scripts/apidata/version/details_dijit.xml'; // dijit/_WidgetBase good 1 to try

var config = {dojobase:'scripts/dojo-release-1.8.3', theme:'claro', version:'1.8_not_implemented_yet', detailsFile:details};

var app = express();
// jade indenting
app.locals.pretty = true;


function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib())
}
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(stylus.middleware(
  { src: __dirname + '/public'
  , compile: compile
  }
));
app.use(express.static(__dirname + '/public'));

// index - / at the moment - change so it's more specific/configurable 
app.get('/', function (req, res) {
//res.render('your page', {pageData: {name : ['name 1', name 2]}});
    res.render('index', { title : 'Home', config:config})
});

// apidata should be config - already used in dojoConfig // for module clicks
app.get('/apidata*', function (req, res) {
    //res.jsonp(500, { error: 'not implemented yet' });
    
    console.log(__dirname);
    var returnstr = "<div>req.params : " + req.params.toString()+"</div>";
    // again replace properly
    var modulefile =  req.params.toString().replace(/\/version\//, "");
    
    generate.generateObjectHtml(config.detailsFile, modulefile, config, function(mydata){
        res.send(returnstr + mydata);    
    });    
});


app.listen(3000);
