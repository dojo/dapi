var express = require('express'),
    stylus = require('stylus'),
    xml2js = require('xml2js'),
    fs = require('fs'),
    util = require("util"),
    nib = require('nib'),
    jade = require('jade'),
    mkdirp = require("mkdirp");
generate = require('./lib/generate');

// hardcoded config atm - move to configurable arguments object with these as defaults - mixins
//var details = __dirname +'/public/scripts/apidata/version/details.xml'; // only dojo exists
//var details = __dirname +'/public/scripts/apidata/version/details_dijit.xml'; // dijit/_WidgetBase good 1 to try
//var details = __dirn  ame +'/public/scripts/apidata/version/details_huge.xml'; // all mods
//var details = __dirname +'/public/scripts/apidata/version/details_all.xml'; // latest doc parse with all packs 
var details = __dirname +'/public/scripts/apidata/version/details.json'; // latest doc parse with all packs
var config = {dojobase:'scripts/dojo-release-1.8.3', 
                        theme:'claro', 
                        version:'1.8_not_implemented_yet', 
                        detailsFile:details, 
                        generate:'static',
                        staticfolder :__dirname + '/staticoutput/'
                     };
/* config.generate='live' (default), config.generate='static' static html, maybe add template config e.g. mobile or flat structure e.g. non tab container */  

var app = express();
// jade indenting
app.locals.pretty = true;

// testing macro calls
// fails with static generation - todo: FOR SOME REASON I NEED TO USE A GLOBAL so it works??? 
autoHyperlink = function(args){
    var obj = {};
    //obj.location = args.location;
    obj.classes = "";
    obj.text = "some other text we'll generate from a function call";
    obj.anchor = "<a href='" + args.location + "'>"+ args.location + "</a>";  
    return obj;    
};
app.locals.autoHyperlink = autoHyperlink;


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

if (config.generate==='live') {
    // index - / at the moment - change so it's more specific/configurable 
    app.get('/', function (req, res) {
    //res.render('your page', {pageData: {name : ['name 1', name 2]}});
        res.render('index', { title : 'Home', config:config});
    });
    
    // apidata should be config - already used in dojoConfig // for module clicks
    // also should be able to generate htlml from module urls (and version) e.g. this currently works http://localhost:3000/apidata/version/dijit/_TemplatedMixin 
    app.get('/apidata*', function (req, res) {
        //var returnstr = "<div>req.params : " + req.params.toString()+"</div>";

        var modulefile =  req.params.toString().replace(/\/version\//, "");
        /// and a jade modulefile render
        generate.generate(config.detailsFile, modulefile, config, function(retObjectItem) {
            res.render('module', { module : retObjectItem, config:config});
        });
        // should do some error handling http responses    
    });
    app.listen(3000);
    console.log("API viewer started");
}

/// todo: static generation -- move to seperate module 
if (config.generate==='static') {
    console.log("Static API viewer generation started");
    // generate index  config.version config.staticfolder
    var indexjade = __dirname + "/views/index.jade";
    var data = fs.readFileSync(indexjade, "utf8");
    
    var fn = jade.compile(data, {filename: indexjade, pretty:true});
    var indexhtml = fn({ title : 'Home', config:config});
    //console.log(indexhtml);
    // mkdir the dir first - should probably delete all dirs first
    mkdirp.sync(config.staticfolder + config.version);
    // wont work unless the dir is already created - need to search if the dir exists and if not create it
    fs.writeFileSync(config.staticfolder + config.version+ "/index.html", indexhtml); 
    // end generate index
    
    // generate modules
    var modulefile = "dijit/_Templated"; // hardcode test for now
    // get details json (so it can be iterate over the objects and generate html and so it's also cached)
    
    var starttime = new Date().getTime();
    generate.loadDetails(config.detailsFile,  config.version, function(details){
        mkdirp.sync(config.staticfolder + config.version);
        var modulefile = null;
        debugger;
            
        Object.keys(details).forEach(function(item){
            var item = details[item]; 
            var leemodulefile = item.location;
            generate.generate(config.detailsFile, leemodulefile, config, function(retObjectItem) {
                // modulefile.match(/[^/]* /); // move to regex
                var patharr = leemodulefile.split("/");

                var modname =  patharr.pop();
                if (patharr.length >0){ // means a path - do this better
                    if (!fs.existsSync(config.staticfolder + config.version+"/" + patharr.join("/"))) {
                        mkdirp.sync(config.staticfolder + config.version+"/" + patharr.join("/"));
                    }
                }
                var modulejade = __dirname + "/views/module.jade";
                var data = fs.readFileSync(modulejade, "utf8");
                var fn = jade.compile(data, {filename: modulejade, pretty:true, autoHyperlink: autoHyperlink});
                var html = fn({ module : retObjectItem, config:config, autoHyperLink: autoHyperlink});
                fs.writeFileSync(config.staticfolder + config.version+ "/"+patharr.join("/") + "/"+ modname+".html", html);
                console.log("wrote file " + leemodulefile);
                
            });            
        });
    });

    process.on('exit', function() {
        console.log("elapsed time = "+ (new Date().getTime() - starttime) +" ms");
    });


    
    // end generate modules
}


