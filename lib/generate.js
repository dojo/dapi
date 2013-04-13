var xml2js = require('xml2js'),
    fs = require('fs'),
    util = require("util"),
    nib = require('nib'),
    generate = null,
    loadDetails = null,
    parsedDetailsCache = {}; // temp - static hash cache of details {versionname :details}

// public get the page object json from the xml file 
var getDetails = function (detailsfile, modulename, version, cb) {
    var detailsCache = __getDetailsCache(version);
    if (detailsCache !==null ) {
        var pageObject = _getRootPageObject(modulename, detailsCache);
            process.nextTick(function(){
                cb(pageObject);
            });            
    } else {
        console.warn("========= Initialise details version="+ version +"  =========");
        loadDetails(detailsfile, version, function(result) {
            process.nextTick(function(){
                var pageObject = _getRootPageObject(modulename, result);
                cb(pageObject);
            });            
        });
    }
};

// private get the page object json from the whole api json - simple helper query really - maybe change
var _getRootPageObject = function (page, result) {
        //console.log("length of objects = " +result.javascript.object.length);
        var pageresult = Object.keys(result).filter(function(element, index, array){
            //console.log(element.$.location);
            return result[element].location === page;     
        }) ;
        return result[pageresult[0]];
};

var __parameterList = function (methoditem, objectitem) {
    // not implemented $types - its not used
    var params = [];
    if(methoditem.parameters && methoditem.parameters[0].parameter) {
        objectitem.parameters[0].parameter.forEach(function(item) {
             params.push(item.$.name);
        });
    }
    return "<span class='parameters'>(" + params.join(", ") + ")</span>";
};

var __getMethodItemFromName = function (name, objectitem) {
    var methoditem = null;
    debugger;
    // objectitem.methods[0]).method []
    if (objectitem.methods){
        var results = objectitem.methods.filter(function(element, index, array) {
            return element.name === name;
        }) ;
        //console.log(pageresult[0]);
        //methoditem = results[0];
        
        methoditem = results[0];
    }
    return methoditem;
};


// cache 
var __getDetailsCache = function (version) {
    var cache = null;
    if (parsedDetailsCache[version]){
        cache= parsedDetailsCache[version];
    }
    return cache;  
};
var __setDetailsCache = function(version, details) {
    parsedDetailsCache[version] = details;
};

// public
var loadDetails = function (detailsfile, version, cb) {
    //var parser = new xml2js.Parser();
    fs.readFile(detailsfile, function(err, data) {
        var json = JSON.parse(data);
        __setDetailsCache(version, json);
        cb(json);
        /*
        parser.parseString(data, function (err, result) {
            __setDetailsCache(version, result);
            process.nextTick(function(){
                cb(result);
            });            
        });
        */
    });
};



/// generate started - public - builds a normalised view of the object - meaning if the xml structure does change, or we choose to xpath it instead it won't effect templates
/**
 * Get the normalised object for this module 
 *
  
 * @return {object} object.location, object.mixins, object.summary, object.description, retObjectItem.usage.from   
 */
generate = function(detailsfile /* file to details.xml*/, modulename /*module object called*/, config, cb){
    getDetails(detailsfile, modulename, config.version, function(pageObject){
            process.nextTick(function(){
                // build an object following the code used in _getModule 
                // var modhtml = _getModule(pageObject, modulename, config);
                
                // flatten/normalise the object then return
                var retObjectItem = {}, methods=[], events=[];
                retObjectItem.location = pageObject.location;
                debugger;
                if (pageObject.mixins) { // allow null property
                    var mixins = [];
                    pageObject.mixins.forEach(function(item){
                        mixins.push({location: item});
                    });
                    retObjectItem.mixins = mixins;
                }
                
                if (pageObject.summary){ // allow null property
                    retObjectItem.summary = pageObject.summary;
                }
                if (pageObject.description){ // allow null property
                    retObjectItem.description = pageObject.description;
                }
                
                // usage - needs to be jade
                if(pageObject.type =="constructor" && pageObject.methods){
                    var methodItem = __getMethodItemFromName("constructor", pageObject);
                    if (methodItem !== null && (typeof methodItem !== 'undefined')) {
                        retObjectItem.usage = {}; // allow null
                        retObjectItem.usage.from =  methodItem.from;
                        var params = [];
                        if(methodItem.parameters){
                            pageObject.parameters.forEach(function(item){
                                 params.push(item.name);
                            });
                        }
                        retObjectItem.usage.parameterList = params; // allow empty array - may need to change 
                        
                        if (methodItem.description){
                            retObjectItem.usage.description = methodItem.description; // allow null 
                        } else if (methodItem.summary) {
                            retObjectItem.usage.description = methodItem.summary; // allow null
                        }
                    }
                }
                // end usage
                
                // parameters
                if (pageObject.parameters) {
                    var lclParameters = [];                    
                    pageObject.parameters.forEach(function(item){
                        lclParameters.push({name:item.name, type:item.type, types:item.types, usage:item.usage, summary:item.summary}); // types new - array
                    });
                    retObjectItem.parameters = lclParameters; // allow empty
                }
                // end parameters

                // examples
                if (pageObject.examples) {
                    retObjectItem.examples = pageObject.examples; // allow empty
                }
                // end examples

                // todo: get kwargs pseudo classes
                // if(preg_match("/^(.*\\.|)__/", $object)){
                if (modulename.match(/^(.*\\.|)__/)){
                    console.log("modulename matched");    
                }
                // end kwargs

                // todo: //	hyperlink to relevant reference doc page, if one exists                 
                //retstr += "<p>See the <a href='#" +modulename +"' target='_blank'>"+ modulename + " reference documentation</a> for more information.</p>";

                // generate properties
                // todo: 
                var shortSummary;
                if (pageObject.properties){
                    
                    var lclProps = [];
                    pageObject.properties.forEach(function(item){
                        shortSummary = "";
                        if (item.summary && item.summary[0]){
                            shortSummary = trimSummary(item.summary[0], true);
                        }
//                        if (item.$.name == "containerNode"){
//                            debugger;
//                            shortSummary = trimSummary(item.summary[0], true);
//                        }
                        lclProps.push({name:item.name, scope:item.scope, type:item.type, from:item.from, summary:item.summary, shortSummary:shortSummary});
                    });
                    retObjectItem.properties = lclProps.sort(compareItemsNames); // allow empty
                }
                // end generate properties


                // generate methods & events
                // todo:
                if (pageObject.methods) {
                    events = pageObject.methods.filter(function(element, index, array){
                        return element.name.match(/^_?on[A-Z]/);
                    });
                    methods = pageObject.methods.filter(function(element, index, array){
                        return !element.name.match(/^_?on[A-Z]/);
                    });
                } 
                
                if (methods.length > 0){ //this is long, make reusable for events?
                    retObjectItem.methods = getMethodOrEventObjects(methods).sort(compareItemsNames); // will be null??
                }
                if (events.length > 0){
                    retObjectItem.events = getMethodOrEventObjects(events).sort(compareItemsNames); // will be null??
                }

                cb(retObjectItem);                
            }); 
    });
};


/// end generate


var getMethodOrEventObjects = function(methods){
    
    var obj, lclMethods = [], lclParms = [], usage=null;        
    methods.forEach(function(item){
        if (item.name == "buildRendering"){
            debugger;
        }
        obj = {name:item.name, scope:item.scope, type:item.type, from:item.from, summary:item.summary};
        var shortSummary = "";
        if (item.summary && item.summary[0]){
            shortSummary = trimSummary(item.summary[0], true);
        }
         obj.shortSummary=shortSummary;
        
        if (item.name.private){
            obj.private = item.$.name.private;
        }
        if (item.parameters){
            lclParms = [];
            
            item.parameters.forEach(function(lclitem){
            lclParms.push({name:lclitem.name, type:lclitem.type, usage:item.usage || "", summary:item.summary}); // usage is optional?
            });
            obj.parameters = lclParms; // allow null 
        }
        // todo: handle the 'return-types' property - need to do a key lookup and convert to valid json
        
        if (item["return-types"] && item["return-types"][0]){
            var returntypes = [];
            var retypes = item["return-types"][0];
            if (retypes && retypes["return-type"]){
                retypes["return-type"].forEach(function(item){
                    //console.log(item.$.type);
                    returntypes.push(item.$.type);
                });
           }
           obj.returntypes = returntypes;
        }
        lclMethods.push(obj);
    });
    return lclMethods; // allow empty
};

var trimSummary = function(summary, firstSentence){
	// summary:
	//		Strip tags and returns the first sentence of specified string

	// Looking for a period followed by a space or newline, and then a capital letter.
	// But since $summary matches the formatting of the original HTML, maybe we should just
	// look for a newline... not sure.

	var summaryLcl = strip_tags(summary);

	if(firstSentence === true){
		//$summary = preg_replace("/(\\.|!|\\?)[\s]+[A-Z].*/s", "\\1", summaryLcl);
		//summaryLcl = summaryLcl.replace(/(\\.|!|\\?)[\s]+[A-Z].*/s, "");
		//summaryLcl.replace(/^(.*?)[.?!]\s/, "");
		summaryLcl = summaryLcl.match(/^.*$/m)[0]; // this is really naff and the wrong regex, it'll do for now but needs to be fixed - also why repeat part of the summary twice?
	}

	return summaryLcl.trim();
};

var strip_tags = function (str, allow) {
  // making sure the allow arg is a string containing only tags in lowercase (<a><b><c>)
  allow = (((allow || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');

  var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  var commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
  var str1 = str.replace(commentsAndPhpTags, "");
  var str2 = str1.replace(tags, "");
  return str2; 
/*
  return str.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
    return allow.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
  });
*/  

};
var compareItemsNames = function(item1, item2){
     var name1 = item1.name.toLowerCase(),name2= item2.name.toLowerCase();
     return (name1 < name2) ? -1 : (name1 > name2) ? 1 : 0;
};

/// EXPORTS

exports.generate = generate;
exports.loadDetails = loadDetails; 
