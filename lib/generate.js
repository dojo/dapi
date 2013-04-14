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
    if (detailsCache !== null) {
        var pageObject = _getRootPageObject(modulename, detailsCache);
        process.nextTick(function () {
            cb(pageObject);
        });
    } else {
        console.warn("========= Initialise details version=" + version + "  =========");
        loadDetails(detailsfile, version, function (result) {
            process.nextTick(function () {
                var pageObject = _getRootPageObject(modulename, result);
                cb(pageObject);
            });
        });
    }
};

// private get the page object json from the whole api json - simple helper query really - maybe change
var _getRootPageObject = function (page, result) {
    //console.log("length of objects = " +result.javascript.object.length);
    var pageresult = Object.keys(result).filter(function (element, index, array) {
        //console.log(element.$.location);
        return result[element].location === page;
    });
    return result[pageresult[0]];
};

var __parameterList = function (methoditem, objectitem) {
    // not implemented $types - its not used
    var params = [];
    if (methoditem.parameters && methoditem.parameters[0].parameter) {
        objectitem.parameters[0].parameter.forEach(function (item) {
            params.push(item.$.name);
        });
    }
    return "<span class='parameters'>(" + params.join(", ") + ")</span>";
};

var __getMethodItemFromName = function (name, objectitem) {
    var methoditem = null;
    //debugger;
    // objectitem.methods[0]).method []
    if (objectitem.methods) {
        var results = objectitem.methods.filter(function (element, index, array) {
            return element.name === name;
        });
        //console.log(pageresult[0]);
        //methoditem = results[0];

        methoditem = results[0];
    }
    return methoditem;
};


// cache 
var __getDetailsCache = function (version) {
    var cache = null;
    if (parsedDetailsCache[version]) {
        cache = parsedDetailsCache[version];
    }
    return cache;
};
var __setDetailsCache = function (version, details) {
    parsedDetailsCache[version] = details;

    // setup global to be used by objectExists()
    _pages = details;
};

// public
var loadDetails = function (detailsfile, version, cb) {
    //var parser = new xml2js.Parser();
    fs.readFile(detailsfile, function (err, data) {
        var json = JSON.parse(data);
        __setDetailsCache(version, json);
        cb(json);
    });
};



/// generate started - public - builds a normalised view of the object - meaning if the xml structure does change, or we choose to xpath it instead it won't effect templates
/**
 * Get the normalised object for this module
 *
 * @return {object} object.location, object.mixins, object.summary, object.description, retObjectItem.usage.from
 */
var generate = function (detailsfile /* file to details.xml*/, modulename /*module object called*/, config, cb) {
    getDetails(detailsfile, modulename, config.version, function (pageObject) {
        process.nextTick(function () {
            // build an object following the code used in _getModule
            // var modhtml = _getModule(pageObject, modulename, config);

            // flatten/normalise the object then return
            var retObjectItem = {}, methods = [], events = [];
            retObjectItem.location = pageObject.location;
            //debugger;
            if (pageObject.mixins) { // allow null property
                var mixins = [];
                pageObject.mixins.forEach(function (item) {
                    mixins.push({location: item});
                });
                retObjectItem.mixins = mixins;
            }

            if (pageObject.summary) { // allow null property
                retObjectItem.summary = pageObject.summary;
            }
            if (pageObject.description) { // allow null property
                retObjectItem.description = pageObject.description;
            }

            // usage - needs to be jade
            if (pageObject.type === "constructor" && pageObject.methods) {
                var methodItem = __getMethodItemFromName("constructor", pageObject);
                if (methodItem !== null && (typeof methodItem !== 'undefined')) {
                    retObjectItem.usage = {}; // allow null
                    retObjectItem.usage.from =  methodItem.from;
                    var params = [];
                    if (methodItem.parameters) {
                        pageObject.parameters.forEach(function (item) {
                            params.push(item.name);
                        });
                    }
                    retObjectItem.usage.parameterList = params; // allow empty array - may need to change

                    if (methodItem.description) {
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
                pageObject.parameters.forEach(function (item) {
                    lclParameters.push({name: item.name, type: item.type, types: item.types, usage: item.usage, summary: item.summary}); // types new - array
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
            if (modulename.match(/^(.*\\.|)__/)) {
                console.log("modulename matched");
            }
            // end kwargs

            // todo: //	hyperlink to relevant reference doc page, if one exists
            //retstr += "<p>See the <a href='#" +modulename +"' target='_blank'>"+ modulename + " reference documentation</a> for more information.</p>";

            // generate properties
            // todo:
            var shortSummary;
            if (pageObject.properties) {
                var lclProps = [];
                pageObject.properties.forEach(function (item) {
                    shortSummary = "";
                    if (item.summary) {
                        shortSummary = trimSummary(item.summary, true);
                    }
//                        if (item.$.name == "containerNode"){
//                            debugger;
//                            shortSummary = trimSummary(item.summary[0], true);
//                        }
                    lclProps.push({name: item.name, scope: item.scope, types: item.types, from: item.from, summary: item.summary, shortSummary: shortSummary});
                });
                retObjectItem.properties = lclProps.sort(compareItemsNames); // allow empty
            }
            // end generate properties


            // generate methods & events
            // todo:
            if (pageObject.methods) {
                events = pageObject.methods.filter(function (element, index, array) {
                    return element.name.match(/^_?on[A-Z]/);
                });
                methods = pageObject.methods.filter(function (element, index, array) {
                    return !element.name.match(/^_?on[A-Z]/);
                });
            }

            if (methods.length > 0) { //this is long, make reusable for events?
                retObjectItem.methods = getMethodOrEventObjects(methods).sort(compareItemsNames); // will be null??
            }
            if (events.length > 0) {
                retObjectItem.events = getMethodOrEventObjects(events).sort(compareItemsNames); // will be null??
            }

            cb(retObjectItem);
        });
    });
};


/// end generate


var getMethodOrEventObjects = function (methods) {
    var obj, lclMethods = [], lclParms = [], usage = null;
    methods.forEach(function (item) {
        obj = {name: item.name, scope: item.scope, type: item.type, from: item.from, summary: item.summary};
        var shortSummary = "";
        if (item.summary) {
            shortSummary = trimSummary(item.summary, true);
        }
        obj.shortSummary = shortSummary;

        if (item.private) {
            obj.private = item.private;
        }
        if (item.parameters) {
            lclParms = [];
            item.parameters.forEach(function (lclitem) {
                lclParms.push({name: lclitem.name, type: lclitem.type, usage: item.usage || "", summary: item.summary}); // usage is optional?
            });
            obj.parameters = lclParms; // allow null 
        }
        obj.returntypes = item.returnTypes;
        lclMethods.push(obj);
    });
    return lclMethods; // allow empty
};

// Root URL used to construct hyperlinks
// temporary: this should come for a config file... or something
var baseUrl = "/";

var _pages = {};
var objectExists = function (page) {
    // Function to look up if specified page exists
    return _pages[page];
};

function hyperlink(text, label) {
    // summary:
    //      Convert text to a hyperlink if it looks like a link to a module.
    //      Return text as-is if it's something like "Boolean".
    //      Assumes that details{} global has been setup with hash of pages of documentation.
    // text: String
    //      String to convert to hyperlink
    // label: String
    //      If specified, use this as the hyperlink label, rather than text

    var url = null;
    if (objectExists(text)) {
        url = text;
    } else if (/\./.test(text) && objectExists(text.replace(/\..*/, ""))) {
        // Text like dojo/on.emit where there is no separate page for emit(), so turn into a URL like dojo/on#emit
        url = text.replace(".", "#");
    }

    if (url) {
        return '<a class="jsdoc-link" href="' + baseUrl + url + '">'
            + (label || text)
            + '</a>';
    } else {
        // Word like "Boolean"
        return text;
    }
}

var trimSummary = function (summary, firstSentence) {
    // summary:
    //      Strip tags and returns the first sentence of specified string

    var summaryLcl = strip_tags(summary);

    if (firstSentence) {
        // Look for a period followed by a space or newline, and then a capital letter.
        summaryLcl = summaryLcl.replace(/(\.|!|\?)[\s]+[A-Z].*/, "$1");
    }

    return summaryLcl.trim();
};



function autoHyperlink(text) {
    // summary:
    //      Search summary/description for patterns like dojo/hccss, dijit/Tree.TreeNode, or acme/myfunc(a, b, c),
    //      and convert to hyperlinks

    // Split text into code examples and segments of free text, and then insert hyperlinks in free text segments
    var inExample = false;
    return text.split(/(<pre><code>|<\/code><\/pre>)/).map(function (part) {
        if (part === "<pre><code>") {
            inExample = true;
            return "<pre><code>";
        } else if (part === "</code></pre>") {
            inExample = false;
            return "</pre></code>";
        } else if (inExample) {
            // Don't try to stick hyperlinks into code examples
            return part;
        } else {
            // Find likely module references, ex:
            //      dijit/Tree
            //      dijit/Tree.TreeNode
            //      dojo/dom-style.set(a, b)
            // .. or any of the above surrounded by <code>...</code>
            //
            // Regex designed to not include the period ending a sentence, ex:
            //      For more info, see dijit/Tree.
            return part.replace(
                /(<code>|)([a-zA-Z0-9]+\/[-a-zA-Z0-9_]+([\.\/][-a-zA-Z0-9_]+)*)(\([^(]*\)|)(<\/code>|)/,
                function (wholeString, codeStart, path, linkSuffix, parameters, codeEnd) {
                    // parameters:
                    //      wholeString: the whole string
                    //      codeStart: "<code>" or ""
                    //      path: the link, ex: dijit/form/Button.set
                    //      linkSuffix: .set (ignore this)
                    //      parameters:    parameter string like "(a, b)", or ""
                    //      codeEnd: "</code>" or ""

                    // the label for the hyperlink should be the original text, but without the <code> wrapper
                    var label = path + parameters;

                    // try to convert matched string to a hyperlink to another module
                    var link = hyperlink(path, label);

                    if (link !== path) {
                        // replaced <code>foo/bar</code> with <a ...>foo/bar<a>
                        return link;
                    } else {
                        // hyperlink() didn't do a conversion, so this is probably something else, so don't change it, leave <code>
                        return wholeString;
                    }
                });
        }
    });
}

var strip_tags = function (str, allow) {
    // making sure the allow arg is a string containing only tags in lowercase (<a><b><c>)
    allow = (((allow || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
    var commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
    var str1 = str.replace(commentsAndPhpTags, "");
    var str2 = str1.replace(tags, "");
    return str2;
};
// this probably not needed now after latest doc-parser changes
var compareItemsNames = function (item1, item2) {
    var name1 = item1.name.toLowerCase(), name2 = item2.name.toLowerCase();
    return (name1 < name2) ? -1 : (name1 > name2) ? 1 : 0;
};

var convertType = function (type) {
    var base = 'object';
    switch (type.toLowerCase()) {
    case 'namespace':
        base = 'namespace';
        break;
    case 'constructor':
        base = 'constructor';
        break;
    case 'node':
    case 'domnode':
        base = 'domnode';
        break;
    case 'array':
        base = 'array';
        break;
    case 'boolean':
        base = 'boolean';
        break;
    case 'date':
        base = 'date';
        break;
    case 'error':
        base = 'error';
        break;
    case 'function':
        base = 'function';
        break;
    case 'integer':
    case 'float':
    case 'int':
    case 'double':
    case 'integer':
    case 'number':
        base = 'number';
        break;
    case 'regexp':
        base = 'regexp';
        break;
    case 'string':
        base = 'string';
        break;
    }
    return base;
};




/// EXPORTS

exports.generate = generate;
exports.loadDetails = loadDetails;
exports.convertType = convertType;
