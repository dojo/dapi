/** @module lib/tree */
var fs = require('fs');
var _trees = {}; // cached hash of tree versions  
var getTree = function (version, config) {
    // summary:
    //      Get the tree json for the specified version. config object used to find the tree.json using config.apiDataPath 
    //
    //      returns
    //          Object
    var returnObj = null;
    var treeFile = "./public/" + config.apiDataPath + "/" + version + "/tree.json";
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