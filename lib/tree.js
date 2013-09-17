/** @module lib/tree */
var fs = require('fs');
var _trees = {}; // cached hash of tree versions
var path = './public/data/'; // TODO: move back later to config
/**
 * Get the tree json for the specified version. config object used to find the tree.json using config.apiDataPath
 * @param {String} version - version of the dojo API to lookup 
 * @param {Object} config - {config.apiDataPath} used to locate the API docs root folder  
 * @returns {Object} tree.json returned
 */
var getTree = function (version, config) {
    var returnObj = null;
    var treeFile = path + version + "/tree.json";
    if (_trees[version]) {
        return _trees[version];
    }
    try {
        var file = fs.readFileSync(treeFile);
        returnObj = JSON.parse(file);
        _trees[version] = returnObj;
    } catch (err) {
        console.error(err);
    }
    return returnObj;
};
var versionignores = ["git"];
/**
 * Get a list of version names from the api directory
 * @param {Object} config - {config.apiDataPath} used to locate the API docs root folder
 * @param {boolean} write - If set to truthy config.apiDataPath = versions
 * @returns {Array} Array of strings listing the current versions in the api directory
 */
var getVersions = function (config, write) {
    var versions = null, dirs = null;
    dirs = fs.readdirSync(path);
    versions = dirs.filter(function (item) { //TODO : not sure why still here?
        return !item.match(config.versionIgnores);
    });
    if (write) {
        config.versions = versions;
    }
    return versions;

};
exports.getTree = getTree;
exports.getVersions = getVersions;
