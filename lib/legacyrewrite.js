/** @module lib/legacyrewrite */
var _legacyReplacersCache = null;

/**
 * Rewrite legacy files which have objects with same name as constructors to *_ns.html
 * @param {Object} app - The express app machinery
 * @param {Object} config - {config} The dapi config object
 */
var handleLegacyRewrites = function (app, config) {
	app.use(function(req, res, next) {
		if (req.url.match(/^(\/api\/1.[3-7])/) === null) {
			next();
			return;
		};
		if (_legacyReplacersCache === null) {
			_configureReplacers(config);
		}
		_legacyReplacersCache.some(function(obj) {
			if (req.url.match(obj.matcher) !== null) {
				if (config.isDebug === true) {
					console.log("matched legacy url " + req.url + " and rewriting");
				}
				req.url = req.url.replace(obj.matcher, obj.replacer);
				return true;
			}
		});
		next();
	});
};
/**
 * This is needed to compile the RegEx's to include the config variables
 * @param {Object} config - {config} The dapi config object
 */
var _configureReplacers = function (config) {
	_legacyReplacersCache = [];
	var apiCtxRe = config.contextPath.replace('/', '\/');
	config.legacyNSReplacers.forEach(function (item) {
		var newmatcher = new RegExp('^\\' + apiCtxRe + item.matcher.source);
		_legacyReplacersCache.push({matcher : newmatcher, replacer: config.contextPath + item.replacer});
	});
}
exports.handleLegacyRewrites = handleLegacyRewrites;

