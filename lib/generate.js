var xml2js = require('xml2js'),
    fs = require('fs'),
    util = require("util"),
    nib = require('nib'),
    generateObjectHtml = null;
    

generateObjectHtml = function(detailsfile /* file to details.xml*/, moduleobject /*module object called*/, callback){

    console.log('called generateObjectHtml()');
    console.log(detailsfile, moduleobject);
    getDetails(detailsfile, moduleobject, function(mydata){
            process.nextTick(function(){
                
                
                // the last callback - call getmethods etc before 
                callback(mydata);
            });            
    });
}

var getDetails = function(detailsfile, moduleobject, callback){
    var parser = new xml2js.Parser();
    fs.readFile(detailsfile, function(err, data) {
        //console.log(data, err);
        parser.parseString(data, function (err, result) {
            //console.dir(result);
            //getPageObject(moduleobject, result);
            process.nextTick(function(){
                //callback("<h1>a node js generated page</h1><p>"+ util.inspect(result, false, null)+"</p>" );
                callback("<h1>a node js generated page</h1><p>"+ util.inspect(getPageObject(moduleobject, result), false, null)+"</p>" );
            });            
        });
    });
}
var getPageObject = function(page, result){
        
        debugger;
        var pageresult = result.javascript.object.filter(function(element, index, array){
            return element.$.location === page;     
        }) ;
        console.log(pageresult[0]);
        return pageresult;
        //var lee = result.javascript.object.keys['dojo/AdapterRegistry'];
        //var lee = result.javascript.object.keys['dojo/AdapterRegistry'];
//   	$context = $xpath->query('//object[@location="' . $page . '"]');
//	return $context->length > 0 ? $context->item(0) : null;

    
}

var _getMethods = function (objectitem){
    debugger;
    // unsure why it needs methods[0] to get another propertynamed method which is actually an array
    console.warn("method length = " + objectitem.methods[0].method.length);
    console.log(JSON.stringify(objectitem.methods[0]));
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





//// PHP
///////////////////////////////////////////////////////////////////////////////////////////////
//	BEGIN HTML OUTPUT GENERATION
///////////////////////////////////////////////////////////////////////////////////////////////

var hyperlink = function (text, docs, base_url, suffix, label){
	// summary:
	//		Convert text to a hyperlink if it looks like a link to a module.
	//		Return text as-is if it's something like "Boolean".
	// $label: String
	//		If specified, use this as the hyperlink label, rather than $text

	var url = null;
	if(object_exists($text, $docs)){
		$url = $text;
	}else if(strpos($text, ".") && object_exists(preg_replace("/\..*/", "", $text), $docs)){
		// Text like dojo/on.emit where there is no separate page for emit(), so turn into a URL like dojo/on#emit
		$url = str_replace(".", "#", $text);
	}

	if($url){
		return '<a class="jsdoc-link" href="' + $base_url + $url + '">'
			+ (strlen($label) > 0 ? $label : $text)
			+ '</a>';
	}else{
		// Word like "Boolean"
		return $text;
	}
}







/// EXPORTS

exports.generateObjectHtml = generateObjectHtml;
