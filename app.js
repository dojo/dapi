var express = require('express'), 
    stylus = require('stylus'),
//    jade = require('jade'),
    nib = require('nib');

// static config - move to configurable arguments object

var config = {dojobase:'scripts/dojo-release-1.8.3', theme:'claro'};

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


app.get('/', function (req, res) {
//res.render('your page', {pageData: {name : ['name 1', name 2]}});
  res.render('index', { title : 'Home', config:config})
});
app.listen(3000);
