/** @module lib/tree */
var fs = require('fs');
var _trees = {}; // cached hash of tree versions
/**
 * Get the tree json for the specified version. config object used to find the tree.json using config.apiDataPath
 * @param {String} version - version of the dojo API to lookup 
 * @param {Object} config - {config.apiDataPath} used to locate the API docs root folder  
 * @returns {Object} tree.json returned
 */
var getTree = function (version, config) {
    // summary:
    //      Get the tree json for the specified version. config object used to find the tree.json using config.apiDataPath 
    //
    //      returns
    //          Object
    var returnObj = null;
    var treeFile = "./public/" + config.contextPath + version + "/tree.json";
    if (_trees[version]) {
        return _trees[version];
    }
    try {
        var file = fs.readFileSync(treeFile);
        returnObj = JSON.parse(file);
        _trees[version] = returnObj;
    } catch (err) {
        console.error(err); // TODO error logging & levels
    }
    return returnObj;
};
exports.getTree = getTree;