var xml2js = require('xml2js'),
    fs = require('fs'),
    util = require("util"),
    nib = require('nib'),
    generateObjectHtml = null;
    
// main entry point, get the html for the module
generateObjectHtml = function(detailsfile /* file to details.xml*/, moduleobject /*module object called*/, config, cb){

    console.log('called generateObjectHtml()');
    console.log(detailsfile, moduleobject);
    getDetails(detailsfile, moduleobject, function(pageObject){
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
var getDetails = function(detailsfile, moduleobject, cb){
    var parser = new xml2js.Parser();
    fs.readFile(detailsfile, function(err, data) {
        parser.parseString(data, function (err, result) {
            process.nextTick(function(){
                var pageObject = _getRootPageObject(moduleobject, result);
                cb(pageObject);
            });            
        });
    });
}

// private get the page object json from the whole api json - simple helper query really - maybe change
var _getRootPageObject = function(page, result){
        var pageresult = result.javascript.object.filter(function(element, index, array){
            return element.$.location === page;     
        }) ;
        //console.log(pageresult[0]);
        return pageresult[0];
}
// get module html
var _getModule = function (objectitem, config){
    //	page heading.
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
        
	//	summary
	if(objectitem.summary){
	    //console.log(objectitem.summary);
	    retstr+= "<div class='jsdoc-full-summary'>" + objectitem.summary +"</div>";
/*	    
		$s .= '<div class="jsdoc-full-summary">'
			. auto_hyperlink($obj["summary"], $docs, $base_url, $suffix)
			. "</div>";
*/
	}
	//	end summary	
	//	description
	if(objectitem.description){
	    retstr+= "<div class='jsdoc-full-summary'>" + objectitem.description +"</div>";
/*
		$s .= '<div class="jsdoc-full-summary">'
			. auto_hyperlink($obj["description"], $docs, $base_url, $suffix)
			. "</div>";
*/	    
    }
	//	end description


    //	usage
    if(objectitem.$.type =="constructor" && objectitem.methods){
        var methoditem = __getMethodItemFromName("constructor", objectitem);
        
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

      
    //	end usage

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
	if(methoditem.parameters){
	    debugger;
	    objectitem.parameters[0].parameter.forEach(function(item){
	         params.push(item.$.name);
	    });
    }
    return "<span class='parameters'>(" + params.join(", ") + ")</span>";
}

var __getMethodItemFromName = function (name, objectitem){
    debugger;
    // objectitem.methods[0]).method []
    var results = objectitem.methods[0].method.filter(function(element, index, array){
        return element.$.name === name;
    }) ;
    //console.log(pageresult[0]);
    return results[0];
} 

//// PHP
///////////////////////////////////////////////////////////////////////////////////////////////
//	BEGIN HTML OUTPUT GENERATION
///////////////////////////////////////////////////////////////////////////////////////////////




/// EXPORTS

exports.generateObjectHtml = generateObjectHtml;
