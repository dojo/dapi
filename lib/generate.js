/** @module lib/generate */
var fs = require('fs'),
    parsedDetailsCache = {}, // temp - static hash cache of details {versionname :details}
    _pages = {}; // another cache

/**
 * Get the 'moduleObject' object, this is the module object from the details.json located by the version and modulename
 * @private 
 * @param {String} detailsfile - the file and path name to TODO (commonality with version and path)
 * @param {String} modulename - 
 * @returns {Function} callback with the..........   
 */
function getDetails(detailsfile, modulename, version, cb) {
    var detailsCache = null;
    if (parsedDetailsCache[version]) {
        detailsCache = parsedDetailsCache[version];
    }

    if (detailsCache !== null) {
        var moduleObject = _getModuleObject(modulename, detailsCache);
        process.nextTick(function () {
            cb(null, moduleObject);
        });
    } else {
        console.warn("\t==> Initialise details version=" + version + " at " + new Date().toTimeString());
        console.log("\t==> detailsfile = " + detailsfile);
        loadDetails(detailsfile, version, function (err, result) {
            process.nextTick(function () {
                if (err) {
                    cb(err, null);
                } else {
                    var moduleObject = _getModuleObject(modulename, result);
                    cb(null, moduleObject);
                }
            });
        });
    }
}

/**
 * Get get the page object json from the whole api json - simple helper query really - maybe change
 * @param {String} moduleName - name of the module to lookup
 * @param {Object} result - the cache to lookup from (TODO - change)  
 * @returns {Object} the module object
 */
// private get the page object json from the whole api json - simple helper query really - maybe change
function _getModuleObject(moduleName, result) {
    //console.log("length of objects = " +result.javascript.object.length);
    var pageresult = Object.keys(result).filter(function (element, index, array) {
        //console.log(element.$.location);
        return result[element].location === moduleName;
    });
    return result[pageresult[0]];
}

function __getMethodItemFromName(name, objectitem) {
    var methoditem = null;
    if (objectitem.methods) {
        var results = objectitem.methods.filter(function (element, index, array) {
            return element.name === name;
        });
        methoditem = results[0];
    }
    return methoditem;
}

// public
function loadDetails(detailsfile, version, cb) {
    fs.readFile(detailsfile, function (err, data) {
        if (err) {
            cb(err, null);
        } else {
            var json = JSON.parse(data);
            parsedDetailsCache[version] = json;
            _pages = json;
            cb(null, json);
        }

    });
}


/**
 * Get the normalised object for this module
 * @param {String} detailsfile - a file path to the details.json file
 * @param {String} modulename - the name of the module to lookup
 * @param {String} version - the version of the module to lookup (1.7/1.8/1.9rc2 etc)  
 * @returns {Object} object.location, object.mixins, object.summary, object.description, retObjectItem.usage.from
 */
function generate(detailsfile /* file to details.xml*/, modulename /*module object called*/, version, cb) {
    getDetails(detailsfile, modulename, version, function (err, pageObject) {
        process.nextTick(function () {
            if (err || !pageObject) {
                cb(err ? err : new Error("Module page object not defined") , null);
            } else {
                // flatten/normalise the object then return
                var retObjectItem = {};
                retObjectItem.version = version;
                retObjectItem.location = pageObject.location; // all dijit.robot.* and dijit.robotx.* objects breaks here
                retObjectItem.type = pageObject.type;
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

                // generate properties
                // todo:
                var shortSummary, inherited;
                if (pageObject.properties) {
                    var lclProps = [];
                    pageObject.properties.forEach(function (item) {
                        shortSummary = "";
                        if (item.summary) {
                            shortSummary = trimSummary(item.summary, true);
                        }
                        if (item.from !== pageObject.location && item.extensionModule !== true) {
                            inherited = true;
                        }
                        // TODO: description missing from json
                        lclProps.push({name: item.name, scope: item.scope, types: item.types,
                            from: item.from, summary: item.summary, shortSummary: shortSummary,
                            private: item.private, tags: item.tags, inherited: inherited,
                            description: item.description, extensionModule: item.extensionModule});
                    });
                    retObjectItem.properties = lclProps.sort(compareItemsNames); // allow empty
                }
                // end generate properties


                // generate methods & events
                // todo:
                if (pageObject.methods && pageObject.methods.length > 0) {
                    //retObjectItem.methods = getMethodOrEventObjects(methods).sort(compareItemsNames); // will be null??
                    retObjectItem.methods = getMethodOrEventObjects(pageObject.methods, pageObject); // allow null
                }
                if (pageObject.events && pageObject.events.length) {
                    //retObjectItem.events = getMethodOrEventObjects(events).sort(compareItemsNames); // will be null??
                    retObjectItem.events = getMethodOrEventObjects(pageObject.events, pageObject); // allow null
                }

                cb(null, retObjectItem);
            }
        });
    });
}
/// end generate


/**
 * Get a normalised view of the method or event objects. This is used to "colour" in the inherited and shortSummary properties
 * @private 
 * @param {Object} methods - the method or event object for the specified module found in details.json
 * @param {Object} pageObject - the object for the specified module found in details.json
 * @returns {Object} object.name, object.scope, object.type, object.types, object.from, object.summary, object.description, object.private, object.returnDescription, object.returnTypes, object.parameters, object.extensionModule, object.examples, object.shortSummary, object.inherited 
 */
function getMethodOrEventObjects(methods, pageObject) {
    var obj, lclMethods = [], lclParms = [], usage = null;
    methods.forEach(function (item) {
        obj = {name: item.name, scope: item.scope, type: item.type, types: item.types,
            from: item.from, summary: item.summary, description: item.description,
            private: item.private, returnDescription: item.returnDescription,
            returnTypes: item.returnTypes, parameters: item.parameters,
            extensionModule: item.extensionModule, examples: item.examples};
        var shortSummary = "";
        if (item.summary) {
            shortSummary = trimSummary(item.summary, true);
        }
        if (item.from !== pageObject.location && item.extensionModule !== true) {
            obj.inherited = true;
        }
        obj.shortSummary = shortSummary;
        lclMethods.push(obj);
    });
    return lclMethods; // allow empty
}

function objectExists(page) {
    // Function to look up if specified page exists
    return _pages[page];
}

function hyperlink(text, label, config, moduleversion) {
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
        return '<a class="jsdoc-link" href="' + config.contextPath + moduleversion + '/' + url + '">'
            + (label || text)
            + '</a>';
    } else {
        // Word like "Boolean"
        return text;
    }
}

function trimSummary(summary, firstSentence) {
    // summary:
    //      Strip tags and returns the first sentence of specified string

    var summaryLcl = stripTags(summary);

    if (firstSentence) {
        // Look for a period followed by a space or newline, and then a capital letter.
		// [\s\S] is used to match any character *including newlines*.
        summaryLcl = summaryLcl.replace(/(\.|!|\?)[\s]+[A-Z][\s\S]*$/, "$1");
    }

    return summaryLcl.trim();
}

/**
 * Parse any text to convert any module type paths to links which the api parser can link to. This is intended to be used by templates and therefore exported
 *      This could probably be removed from template calls and used at loadDetails time to parse the JSON once only i.e. it should improve request time performance for modules
 *      However I don't like the markup being generated in the code itself.  
 * @param {String} text - the the text to be scanned and parsed
 * @param {Object} config - the config object for the application. config.contextPath & config.apiDataPath are used
 * @param {String} moduleversion - the version of the module to use. 
 * @returns {String} Returns the parsed text with appropriate links included 
 */
function autoHyperlink(text, config, moduleversion) {
    // summary:
    //      Search summary/description for patterns like dojo/hccss, dijit/Tree.TreeNode, or acme/myfunc(a, b, c),
    //      and convert to hyperlinks

    // Split text into code examples and segments of free text, and then insert hyperlinks in free text segments
    var inExample = false;
    var splitTextArr = text.split(/(<pre><code>|<\/code><\/pre>)/);
    var updatedSplitTextArr = splitTextArr.map(function (part) {
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
                /(<code>|)([a-zA-Z0-9]+\/[-a-zA-Z0-9_]+([\.\/][-a-zA-Z0-9_]+)*)(\([^(]*\)|)(<\/code>|)/g,
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
                    var link = hyperlink(path, label, config, moduleversion);
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
    return updatedSplitTextArr.join("");
}

function stripTags(str, allow) {
    // making sure the allow arg is a string containing only tags in lowercase (<a><b><c>)
    allow = (((allow || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
    var commentsAndTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
    var str1 = str.replace(commentsAndTags, "");
    var str2 = str1.replace(tags, "");
    return str2;
}
function compareItemsNames(item1, item2) {
    var name1 = item1.name.toLowerCase(), name2 = item2.name.toLowerCase();
    return (name1 < name2) ? -1 : (name1 > name2) ? 1 : 0;
}

/**
 * Get an icon name to be used for a property type. This is intended to be used by templates and therefore exported
 * @public 
 * @param {String} type The type of the property (which was described in details.json). 
 * @returns {String} 'object'|'namespace'|'constructor'|'node'|'domNode'|'array'|'boolean'|'date'|'error'|'function'|'number'|'regexp'|'string' 
 */
function convertType(type) {
	// TODO: use a hash instead of switch?
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
}


/// EXPORTS

exports.generate = generate;
exports.loadDetails = loadDetails;
exports.convertType = convertType;
exports.autoHyperlink = autoHyperlink;