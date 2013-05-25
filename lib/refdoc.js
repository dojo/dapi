var fs = require('fs');
/*
*   In progress, may be needed for different environments
*     _readDir(directory, fileArr, version, config)
*       private
*           directory - pass in null for the first base search
*           fileArr - pass in the array to be returned, should be an empty array on first search
*           version
*           config - config.refDocs.dir is the base directory where ref docs are located, config.refDocs.suffix is the extension to filter for docs 
*
*/
var _refDocs = {};
var _readDir = function (directory, fileArr, version, config) {
    //var objectArr = [];
    var baseDir = config.refDocs.dir + version;
    var dir = directory || baseDir;
    var dirs = fs.readdirSync(dir);
    dirs.forEach(function (elem, idx, arr) {
        var stat = fs.statSync(dir + "/" + elem);
        if (stat.isDirectory()) {
            _readDir(dir + "/" + elem, fileArr, version, config);
        } else {
            if (elem.lastIndexOf(config.refDocs.suffix) > -1) {
                fileArr.push((directory ? directory.replace(baseDir + "/", "")  : "") + "/" + elem);
            }
        }
    });
    return fileArr;
};
var _getRefDocs = function (version, config) {
    // create a version dir name e.g. config.version + version
    var objectArr = [], refDocs = _refDocs[version];
    if (refDocs) {
        return refDocs;
    }
    try {
        objectArr = _readDir(null, [], version, config);
        _refDocs[version] = objectArr;
    } catch (err) {
        //console.error(err); TODO error logging & levels
    }
    return objectArr;
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
    if (refDocs && refDocs.length > 0) {
        var parentfolder = name.replace(/\/[^\/]+$/, ""); // not sure this is warranted not, well not from the 1.8 rst docs
        hasDoc = refDocs.indexOf(name + config.refDocs.suffix) > -1 || refDocs.indexOf(parentfolder + config.refDocs.suffix) > -1;
    }
    return hasDoc;
};
exports.hasRefDoc = hasRefDoc;