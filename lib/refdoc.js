/** @module lib/refdoc */
var fs = require('fs');
var _refDocs = {}; // cached hash of version : refdocs 
var _readDir = function (directory, refDocVersion, version, config) {
    //var objectArr = [];
    var baseDir = config.refDocs.dir + version;
    var dir = directory || baseDir;
    var dirs = fs.readdirSync(dir);
    dirs.forEach(function (elem, idx, arr) {
        var stat = fs.statSync(dir + "/" + elem);
        if (stat.isDirectory()) {
            _readDir(dir + "/" + elem, refDocVersion, version, config);
        } else {
            if (elem.lastIndexOf(config.refDocs.suffix) > -1) {
                var module = (directory ? directory.replace(baseDir + "/", "")  : "") + "/" + elem.substr(0, elem.length - config.refDocs.suffix.length);
                refDocVersion[module] = module;
            }
        }
    });
    return refDocVersion;
};
var _getRefDocs = function (version, config) {
    // create a version dir name e.g. config.version + version
    var returnObj = null;
    //var objectArr = [], refDocs = _refDocs[version];
    if (_refDocs[version]) {
        return _refDocs[version];
    }
    try {
        var refDocVersion = _refDocs[version] = {}; // populate this first, if an error then it's already been created as an empty object and will be returned.
        _refDocs[version] = _readDir(null, refDocVersion, version, config);
        //_refDocs[version] = objectArr;
    } catch (err) {
        //console.error(err); TODO error logging & levels
    }
    return _refDocs[version];
};
var hasRefDoc = function (name, version, config) {
    // summary:
    //      Test if a reference doc exists using the modules name, version and config object for config.refDocs.suffix and config.refDocs.dir 
    //
    //      returns
    //          boolean

    // test if doc exists via dijit/_Templated  refDocs["dijit"]!=null && refDocs["dijit"]["_Templated"] !=null
    // maybe still work TODO here
    var refDocs = _getRefDocs(version, config);
    var hasDoc = false;
    if (refDocs && refDocs[version]) {
        var parentfolder = name.replace(/\/[^\/]+$/, "");
        hasDoc = refDocs[version][name] || refDocs[version][parentfolder];
    }
    return hasDoc;
};
var getRefDoc = function (name, version, config) {
    // summary:
    //      Get the ref doc (if it exists) using the modules name, version and config object for config.refDocs.suffix and config.refDocs.dir 
    //
    //      returns
    //          String - the correct doc location
    // test if doc exists via dijit/_Templated  refDocs["dijit"]!=null && refDocs["dijit"]["_Templated"] !=null
    var refDocs = _getRefDocs(version, config), refDoc = null;
    var parentfolder = name.replace(/\/[^\/]+$/, "");
    if (refDocs[name]) {
        return refDocs[name];
    } else if (refDocs[parentfolder]) {
        return refDocs[parentfolder];
    } else {
        return null;
    }
};
exports.hasRefDoc = hasRefDoc;
exports.getRefDoc = getRefDoc;