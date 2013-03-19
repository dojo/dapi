require([
	"dojo/parser",
	"dojo/ready",
	"dijit/layout/BorderContainer",
	"dijit/layout/TabContainer",
	"dijit/layout/ContentPane",
	"dijit/layout/AccordionContainer",
	"api/ModuleTreeModel",
	"api/ModuleTree",
	"dojo/_base/config"
], function(parser, ready, BorderContainer, TabContainer, ContentPane, AccordionContainer, ModuleTreeModel, ModuleTree, config){
    var moduleModel = null, moduleTree = null;
    ready(function(){
        var parsed = parser.parse();
        buildTree();
    });

    var buildTree = function(){
        if (moduleModel !== null) {
            moduleTree.destroyRecursive();
        }
        //moduleModel = new ModuleTreeModel(baseUrl + 'lib/tree.php?v=' + currentVersion);
        moduleModel = new ModuleTreeModel(config.apiPath + '/version/tree.json');
        moduleTree = new ModuleTree({
    		id: "moduleTree",
    		model: moduleModel,
    		showRoot: false,
    		persist: false
    	});
	   moduleTree.placeAt("moduleTreePane");
    };
/*    
    var addTabPane = function(page, version){
    	var p = registry.byId("content");
    	// Get the URL to get the tab content.
    	// versions[] lists what directory (lib or lib.old) contains the item.php script used to display this page
    	var url = baseUrl + versions[version] + "/item.php?p=" + page + "&v=" + (version || currentVersion);
        return null; 	
    };      
       
 */   
    
});

