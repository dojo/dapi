var xml2js = require('xml2js'),
    fs = require('fs'),
    util = require("util"),
    nib = require('nib'),
    jade = require('jade'),
    generateObjectHtml = null,
    loadDetails = null,
    parsedDetailsCache = {}, // temp - static hash cache of details {versionname :details}
    templateCache = {}; // todo - cache all read jade templates so you don't have to readFile - however this should be configurable so you can change templates at runtime

// main entry point, get the html for the module
generateObjectHtml = function(detailsfile /* file to details.xml*/, modulename /*module object called*/, config, cb){

    //console.log('called generateObjectHtml()');
    //console.log(detailsfile, modulename);
    getDetails(detailsfile, modulename, config.version, function(pageObject){
            process.nextTick(function(){
                // remove this and finish methods/properties/events description - work out best way to template the markup
                var html = "<div>\n"+ util.inspect(pageObject, false, null)+"</div>";
                // the last callback - call getmethods etc before 
                var modhtml = _getModule(pageObject, modulename, config);
                //console.log(_getMethods(pageObject));
                cb(modhtml+html);
            }); 
    });
}

// public get the page object json from the xml file 
var getDetails = function(detailsfile, modulename, version, cb){
    var detailsCache = __getDetailsCache(version);
    if (detailsCache !=null) {
        var pageObject = _getRootPageObject(modulename, detailsCache);
            process.nextTick(function(){
                cb(pageObject);
            });            
    } else {
        console.warn("========= Initialise details version="+ version +"  =========");
        loadDetails(detailsfile, version, function(result){
            process.nextTick(function(){
                var pageObject = _getRootPageObject(modulename, result);
                cb(pageObject);
            });            
        });
    }
}

// private get the page object json from the whole api json - simple helper query really - maybe change
var _getRootPageObject = function(page, result){
        //console.log("length of objects = " +result.javascript.object.length);
        var pageresult = result.javascript.object.filter(function(element, index, array){
            //console.log(element.$.location);
            return element.$.location === page;     
        }) ;
        //console.log(pageresult[0]);
        return pageresult[0];
}
// get module html
var _getModule = function (objectitem, modulename, config){
    //    page heading.
    var retstr = "<h1 class='jsdoc-title'>" + objectitem.$.location + " <span class='djversion1'>"+objectitem.$.type + " (version "+config.version +")</span></h1>";

    // mixins
    if (objectitem.mixins){
        retstr += "<div class='jsdoc-mixins'>Extends ";
        // again stupid extra array[0] needed
        objectitem.mixins[0].mixin.forEach(function(item){
            retstr += "<a class='jsdoc-link' href='/"+config.version +"/"+item.$.location+"'>" + item.$.location +"</a>,";
        });
        retstr += "</div>";
    }
    // end mixins
        
    //    summary
    if(objectitem.summary){
        //console.log(objectitem.summary);
        retstr+= "<div class='jsdoc-full-summary'>" + objectitem.summary +"</div>";
/*        
        $s .= '<div class="jsdoc-full-summary">'
            . auto_hyperlink($obj["summary"], $docs, $base_url, $suffix)
            . "</div>";
*/
    }
    //    end summary    
    //    description
    if(objectitem.description){
        retstr+= "<div class='jsdoc-full-summary'>" + objectitem.description +"</div>";
/*
        $s .= '<div class="jsdoc-full-summary">'
            . auto_hyperlink($obj["description"], $docs, $base_url, $suffix)
            . "</div>";
*/        
    }
    //    end description


    //    usage
    if(objectitem.$.type =="constructor" && objectitem.methods){
        var methoditem = __getMethodItemFromName("constructor", objectitem);
        if (methoditem) { // LEEB check with php later, doing this to stop errors
            retstr+="<div class='jsdoc-function-information'><h3>Usage:</h3><div class='function-signature'>" + objectitem.$.location;
            retstr+=__parameterList(methoditem, objectitem);
            retstr +="</div></div>";
            retstr +="<div class=''jsdoc-inheritance>Defined by " + methoditem.$.from +"</div>" ;
            if (methoditem.description){
                retstr +="<div class='jsdoc-summary'>" + methoditem.description +"</div>";
            } else if (methoditem.summary){
                retstr +="<div class='jsdoc-summary'>" + methoditem.summary +"</div>";
            }
        }
    }
    //    end usage

    // parameters
    if (objectitem.parameters){
        retstr += __generateParameterTable(objectitem.parameters[0].parameter);
    }
    // end parameters

    // examples
    if (objectitem.examples){
        retstr += __getExamples(objectitem.examples);
    }
    // end examples    
    // todo: get kwargs pseudo classes
// if(preg_match("/^(.*\\.|)__/", $object)){
    if (modulename.match(/^(.*\\.|)__/)){
        console.log("modulename matched");    
    }
    // end get kwargs pseudo classes    
    
    // todo: //	hyperlink to relevant reference doc page, if one exists
        retstr += "<p>See the <a href='#" +modulename +"' target='_blank'>"+ modulename + " reference documentation</a> for more information.</p>";    
    
    // generate properties
    // todo: 
    if (objectitem.properties){
        retstr +=_getProperties(objectitem.properties[0].property) 
    }    
    // end generate properties
        
    // generate methods & events
    // todo: 
    var methods=[], events=[];
    if (objectitem.methods[0].method){
        events = objectitem.methods[0].method.filter(function(element, index, array){
            return element.$.name.match(/^_?on[A-Z]/);
        });
        methods = objectitem.methods[0].method.filter(function(element, index, array){
            return !element.$.name.match(/^_?on[A-Z]/);
        });
    }
    
    
    if (methods.length>0){
        retstr +=_getMethods(methods) 
    }    
    // end generate properties

    // generate events
    // todo: 
    if (events.length>0 ){
        retstr +=_getEvents(events); 
    }    
    // end generate events



        
    // tmp
    retstr+="<hr style='height:20px; background-color:black;'></hr>";
    return retstr;  
};



var _getMethods = function (methods){
    var retstr = "";
    // template working now
    var data = fs.readFileSync(__dirname + '/../views/blocks/methodssummary.jade', 'utf8');
    var fn = jade.compile(data, {pretty:true});
    var html = fn({methods:methods});
    //console.log(html);
    retstr = html;
    
    return retstr;        
/*    
    var methodhtml = "";
    // unsure why it needs methods[0] to get another propertynamed method which is actually an array
    console.warn("method length = " + objectitem.methods[0]);
    console.log(JSON.stringify(objectitem.methods[0]));
    
    return methodhtml;
*/    
    
}
// started
var _getProperties = function (properties){
    var retstr = "";
    // template working now
    var data = fs.readFileSync(__dirname + '/../views/blocks/propertiessummary.jade', 'utf8');
    var fn = jade.compile(data, {pretty:true});
    var html = fn({properties:properties});
    //console.log(html);
    retstr = html;
    
    return retstr;    
};

// started 
var _getEvents = function (events){
    var retstr = "";
    // template working now
    var data = fs.readFileSync(__dirname + '/../views/blocks/eventssummary.jade', 'utf8');
    var fn = jade.compile(data, {pretty:true});
    var html = fn({events:events});
    //console.log(html);
    retstr = html;
    
    return retstr;       
};




var _getMixins = function (objectitem){
};
var _getParameters = function (objectitem){
};
var _getReturnTypes = function (objectitem){
};
var _getReturnDescription = function (objectitem){
};
var _getSummary = function (objectitem){
};
var _getDescription = function (objectitem){
};



var __parameterList = function(methoditem, objectitem){
    // not implemented $types - its not used
    var params = [];
    if(methoditem.parameters && methoditem.parameters[0].parameter){
        objectitem.parameters[0].parameter.forEach(function(item){
             params.push(item.$.name);
        });
    }
    return "<span class='parameters'>(" + params.join(", ") + ")</span>";
}

var __getMethodItemFromName = function (name, objectitem){
    var methoditem = null;
    // objectitem.methods[0]).method []
    if (objectitem.methods[0] && objectitem.methods[0].method){
        var results = objectitem.methods[0].method.filter(function(element, index, array){
            return element.$.name === name;
        }) ;
        //console.log(pageresult[0]);
        methoditem = results[0];
    }
    return methoditem;
} 

var __generateParameterTable = function (parameters){
    // temporary jade -  as sync - move template blocks loading to startup so no need to read many files async
    var retstr = "";
    // template working now
    var data = fs.readFileSync(__dirname + '/../views/blocks/parametertable.jade', 'utf8');
    var fn = jade.compile(data, {pretty:true});
    var html = fn({parameters:parameters});
    //console.log(html);
    retstr = html;
    
    return retstr;
/*
    var retstr = "";
    if (parameters){
        retstr = "<table class='jsdoc-parameters'><tr><th>Parameter</th><th>Type</th><th>Description</th></tr>";
        parameters.forEach(function(item){
            retstr+="<tr><td class='jsdoc-param-name'>" + item.$.name +"</td>";
            retstr+="<td class='jsdoc-param-type'>"+ item.$.type +"</td>";
            var summary  = item.summary ? item.summary[0]  : "";
            retstr+="<td class='jsdoc-param-description'>" + summary + "</td>";
            retstr+="</tr>";
        });
        retstr += "</table>"
    }
    return retstr;
*/
}

var __getExamples = function(examples){
    var retstr = "";
    if (examples[0].example){
        var data = fs.readFileSync(__dirname + '/../views/blocks/examples.jade', 'utf8');
        var fn = jade.compile(data, {pretty:true});
        var html = fn({examples:examples[0].example});
        //console.log(html);
        retstr = html;
    }
    return retstr;
}

// cache 
var __getDetailsCache = function (version) {
    var cache = null;
    if (parsedDetailsCache[version]){
        cache= parsedDetailsCache[version];
    }
    return cache;  
}
var __setDetailsCache = function(version, details){
    parsedDetailsCache[version] = details;
}

// public
var loadDetails = function (detailsfile, version, cb) {
    var parser = new xml2js.Parser();
    fs.readFile(detailsfile, function(err, data) {
        parser.parseString(data, function (err, result) {
            __setDetailsCache(version, result);
            process.nextTick(function(){
                cb(result);
            });            
        });
    });
}


/// EXPORTS

exports.generateObjectHtml = generateObjectHtml;
exports.loadDetails = loadDetails; 
