var xml2js = require('xml2js'),
    fs = require('fs'),
    util = require("util"),
    nib = require('nib'),
    jade = require('jade'),
    generateObjectHtml = null,
    generate = null,
    loadDetails = null,
    parsedDetailsCache = {}, // temp - static hash cache of details {versionname :details}
    templateCache = {}; // todo - cache all read jade templates so you don't have to readFile - however this should be configurable so you can change templates at runtime

// main entry point, get the html for the module
/**
 * Get the HTML output from this module 
 *
 * @deprecated stop using this, it was a fixed, procedural output of markup. Use generate() to return a normalised object and template it 
 * @return {string} string html of output 
 */
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


    //    usage -- needs to be jade
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
                retObjectItem.location = pageObject.$.location;
                if (pageObject.mixins) { // allow null property
                    var mixins = [];
                    pageObject.mixins[0].mixin.forEach(function(item){
                        mixins.push({location: item.$.location});
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
                if(pageObject.$.type =="constructor" && pageObject.methods){
                    var methodItem = __getMethodItemFromName("constructor", pageObject);
                    if (methodItem !== null && (typeof methodItem !== 'undefined')) {
                        retObjectItem.usage = {}; // allow null
                        retObjectItem.usage.from =  methodItem.$.from;
                        var params = [];
                        if(methodItem.parameters && methodItem.parameters[0].parameter){
                            pageObject.parameters[0].parameter.forEach(function(item){
                                 params.push(item.$.name);
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
                if (pageObject.parameters && pageObject.parameters[0].parameter) {
                    var lclParameters = [];                    
                    pageObject.parameters[0].parameter.forEach(function(item){
                        lclParameters.push({name:item.$.name, type:item.$.type, usage:item.$.usage, summary:item.summary});
                    });
                    retObjectItem.parameters = lclParameters; // allow empty
                }
                // end parameters

                // examples
                if (pageObject.examples && pageObject.examples[0].example) {
                    retObjectItem.examples = pageObject.examples[0].example; // allow empty
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
                if (pageObject.properties && pageObject.properties[0].property){
                    
                    var lclProps = [];
                    pageObject.properties[0].property.forEach(function(item){
                        shortSummary = "";
                        if (item.summary && item.summary[0]){
                            shortSummary = trimSummary(item.summary[0], true);
                        }
//                        if (item.$.name == "containerNode"){
//                            debugger;
//                            shortSummary = trimSummary(item.summary[0], true);
//                        }
                        lclProps.push({name:item.$.name, scope:item.$.scope, type:item.$.type, from:item.$.from, summary:item.summary, shortSummary:shortSummary});
                    });
                    retObjectItem.properties = lclProps.sort(compareItemsNames); // allow empty
                }
                // end generate properties


                // generate methods & events
                // todo:
                if (pageObject.methods[0].method) {
                    events = pageObject.methods[0].method.filter(function(element, index, array){
                        return element.$.name.match(/^_?on[A-Z]/);
                    });
                    methods = pageObject.methods[0].method.filter(function(element, index, array){
                        return !element.$.name.match(/^_?on[A-Z]/);
                    });
                } 
                
                if (methods.length > 0){ //this is long, make reusable for events?
                    retObjectItem.methods = getMethodOrEventObjects(methods).sort(compareItemsNames); // will be null??
                }
                if (events.length > 0){
                    retObjectItem.events = getMethodOrEventObjects(events).sort(compareItemsNames); // will be null??
                }

                cb(retObjectItem);                
    
/*

*/

            }); 
    });
}


/// end generate


var getMethodOrEventObjects = function(methods){
    
    var obj, lclMethods = [], lclParms = [], usage=null;        
    methods.forEach(function(item){
        if (item.$.name == "buildRendering"){
            debugger;
        }
        obj = {name:item.$.name, scope:item.$.scope, type:item.$.type, from:item.$.from, summary:item.summary};
        var shortSummary = "";
        if (item.summary && item.summary[0]){
            shortSummary = trimSummary(item.summary[0], true);
        }
         obj.shortSummary=shortSummary;
        
        if (item.$.name.private){
            obj.private = item.$.name.private;
        }
        if (item.parameters[0].parameter && item.parameters[0].parameter.length >0){
            lclParms = [];
            
            item.parameters[0].parameter.forEach(function(lclitem){
            lclParms.push({name:lclitem.$.name, type:lclitem.$.type, usage:item.$.usage || "", summary:item.summary}); // usage is optional?
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
}

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
}

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

}
var compareItemsNames = function(item1, item2){
     var name1 = item1.name.toLowerCase(),name2= item2.name.toLowerCase();
     return (name1 < name2) ? -1 : (name1 > name2) ? 1 : 0;
}

/// EXPORTS

exports.generateObjectHtml = generateObjectHtml;
exports.generate = generate;
exports.loadDetails = loadDetails; 
