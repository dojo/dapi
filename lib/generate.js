var xml2js = require('xml2js'),
    fs = require('fs'),
    util = require("util"),
    nib = require('nib'),
    generateObjectHtml = null,
    parsedDetailsCache = {}; // temp - static hash cache of details {versionname :details}

// main entry point, get the html for the module
generateObjectHtml = function(detailsfile /* file to details.xml*/, moduleobject /*module object called*/, config, cb){

    console.log('called generateObjectHtml()');
    console.log(detailsfile, moduleobject);
    getDetails(detailsfile, moduleobject, config.version, function(pageObject){
            process.nextTick(function(){
                var html = "<div>"+ util.inspect(pageObject, false, null)+"</div>";
                // the last callback - call getmethods etc before 
                var modhtml = _getModule(pageObject, config);
                //console.log(_getMethods(pageObject));
                cb(modhtml+html);
            }); 
    });
}

// private get the page object json from the xml file
var getDetails = function(detailsfile, moduleobject, version, cb){
    var parser = new xml2js.Parser();
    var detailsCache = __getDetailsCache(version);
    if (detailsCache !=null) {
        var pageObject = _getRootPageObject(moduleobject, detailsCache);
            process.nextTick(function(){
                cb(pageObject);
            });            
    } else {
        console.warn("========= Initialise details version="+ version +"  =========");
        fs.readFile(detailsfile, function(err, data) {
            parser.parseString(data, function (err, result) {
                __setDetailsCache(version, result);
                process.nextTick(function(){
                    var pageObject = _getRootPageObject(moduleobject, result);
                    cb(pageObject);
                });            
            });
        });
    }
}

// private get the page object json from the whole api json - simple helper query really - maybe change
var _getRootPageObject = function(page, result){
        var pageresult = result.javascript.object.filter(function(element, index, array){
            //console.log(element.$.location);
            return element.$.location === page;     
        }) ;
        //console.log(pageresult[0]);
        return pageresult[0];
}
// get module html
var _getModule = function (objectitem, config){
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
    debugger;
    if (objectitem.examples){
        retstr += __getExamples(objectitem.examples);
    }
    // end examples    

    // get rest of page
    retstr +=  __getRestOfPage();
    // end get rest of page    
        
    // tmp
    retstr+="<hr style='height:20px; background-color:black;'></hr>";
    return retstr;  
};



var _getMethods = function (objectitem){
    
    var methodhtml = "";
    // unsure why it needs methods[0] to get another propertynamed method which is actually an array
    console.warn("method length = " + objectitem.methods[0]);
    console.log(JSON.stringify(objectitem.methods[0]));
    
    return methodhtml;
    
}

var _getProperties = function (objectitem){
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
}

var __getExamples = function(examples){
    var retstr = "";
    if (examples[0].example){
        retstr +="<div class'jsdoc-examples'><h2>Examples</h2>"; 
        
        examples[0].example.forEach(function(item, idx){
            retstr += "<div class='jsdoc-example'><h3>Example " + ++idx + "</h3>";
            retstr += item +"</div>";
        });
        retstr+="</div>";
    }
    return retstr;
}


var __getRestOfPage = function(objectitem){
    var retstr = "";
    
    return retstr;    
}

var __getDetailsCache = function (version){
    var cache = null;
    if (parsedDetailsCache[version]){
        cache= parsedDetailsCache[version];
    }
    return cache;  
}
var __setDetailsCache = function(version, details){
    parsedDetailsCache[version] = details;
}

//// PHP
///////////////////////////////////////////////////////////////////////////////////////////////
//    BEGIN HTML OUTPUT GENERATION
///////////////////////////////////////////////////////////////////////////////////////////////




/// EXPORTS

exports.generateObjectHtml = generateObjectHtml;
