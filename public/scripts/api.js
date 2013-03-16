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
    
    
});

