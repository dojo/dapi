define(["dojo/_base/declare", "dojo/_base/lang", "dijit/Tree", "dijit/registry","dijit/layout/ContentPane"
    ], function(declare, lang, Tree, registry, ContentPane){

	return declare("ModuleTree", Tree, {
		// summary:
		//		Variation on Tree to have icons and correct click behavior

		getIconClass: function(item, /*Boolean*/ opened){

			var type = item.type.toLowerCase();

			if(type == "folder"){
				return opened ? "dijitFolderOpened" : "dijitFolderClosed";
			}else{
				// Lots of modules are marked as type undefined, for which we have no icon, so use object instead.
				// TODO: we also have no icon for instance, so use object icon.
				if(/undefined|instance/.test(type)){
					type = "object";
				}

				return "icon16 " + type + "Icon16";
			}
		},

		onClick: function(item, nodeWidget){
			var type = item.type;
			if(type == "folder"){
				// Since folders have no associated pages, expand the TreeNode instead, to hint the user
				// that they need to descendant on a child of this node.
				this._onExpandoClick({node: nodeWidget});
			}else{
				// Open the page for this module.
				this.addTabPane(item, item.fullname, this.version);
			}
		},

		selectAndClick: function(path){
			// summary:
			//		Helper method used from welcome screen, ex: moduleTree.selectAndClick(["dojo/", "dojo/query"])

			this.set("path", ["root"].concat(path)).then(lang.hitch(this, function(){
				var node = this.get("selectedNode");
				this.onClick(node.item, node);
			}));
		},
		
        addTabPane : function(item, page, version){
        	var p = registry.byId("content");
        	// Get the URL to get the tab content.
        	// versions[] lists what directory (lib or lib.old) contains the item.php script used to display this page
        	//var url = baseUrl + versions[version] + "/item.php?p=" + page + "&v=" + (version || currentVersion);
        	
        	// clean this, apidata moved to config, fullname - start docing jsstructures
        	var url = "/apidata/version/" + item.fullname; 
        	console.log(item);
        	

            var pane = new ContentPane({
                id: page.replace(/[\/.]/g, "_") + "_" + version,
                page: page,		// save page because when we select a tab we locate the corresponding TreeNode
                href: url,
                //content : {version: "version" , itemtid: item.id, namel: item.name, fullname : item.fullname, type: item.type},  
                //title: title,
                title: item.fullname,
                closable: true,
                parseOnLoad: false
//                onLoad: lang.hitch(pane, paneOnLoad)
            });
            p.addChild(pane);
            p.selectChild(pane);
            return pane;

            //console.log("url = ", url);
            // return null; 	
        }      

	});
});