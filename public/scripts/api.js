require([
	"dojo/parser",
	"dojo/dom",
	"dojo/_base/lang",
	"dojo/ready",
	"dijit/layout/BorderContainer",
	"dijit/layout/TabContainer",
	"dijit/layout/ContentPane",
	"dijit/layout/AccordionContainer",
	"api/ModuleTreeModel",
	"api/ModuleTree",
	"dojo/_base/config"
], function (parser, dom, lang, ready, BorderContainer, TabContainer, ContentPane, AccordionContainer, ModuleTreeModel, ModuleTree, config) {
    var moduleModel = null, moduleTree = null, currentVersion = null;
    ready(function () {
        var parsed = parser.parse();
        var s = dom.byId("versionSelector");
        s.onchange = lang.hitch(s, versionChange);
        buildTree();
    });

    var buildTree = function () {
        if (moduleModel !== null) {
            moduleTree.destroyRecursive();
        }
        //moduleModel = new ModuleTreeModel(baseUrl + 'lib/tree.php?v=' + currentVersion);
        // moduleModel = new ModuleTreeModel(config.apiPath + '/' + selectedVersion + '/tree.json'); // for loading different versions
        // this is the default version - will need a global to check on when the selected version is changed
        var version = currentVersion ?  currentVersion : config.apiDefault;
        moduleModel = new ModuleTreeModel(config.apiPath + '/' + version + '/tree.json');
        moduleTree = new ModuleTree({
            id: "moduleTree",
            model: moduleModel,
            showRoot: false,
            persist: false,
            version : version
        });
        moduleTree.placeAt("moduleTreePane");
    };
    var versionChange = function (e) {
        // summary:
        //		Change the version displayed.
        var v = this.options[this.selectedIndex].value;
        //	if we reverted, bug out.
        if (currentVersion === v) { return; }
        currentVersion = v;
        buildTree();
    };
});

