define(["dojo/_base/declare", "dojo/_base/lang", "dijit/Tree", "dijit/registry", "api/ModuleContentPane",
        "dojo/query", "dojo/dom-construct", "dojo/_base/config", "dojo/on", "dojo/dom-class", "dojo/dom-style"
    ], function (declare, lang, Tree, registry, ContentPane, query, domConstruct, config, on, domClass, domStyle) {

	return declare("ModuleTree", Tree, {
        version : "",
        tabContainerId : "",
		// summary:
		//		Variation on Tree to have icons and correct click behavior
		getIconClass: function (item, /*Boolean*/ opened) {
			var type = item.type.toLowerCase();
			if (type === "folder") {
				return opened ? "dijitFolderOpened" : "dijitFolderClosed";
			} else {
				// Lots of modules are marked as type undefined, for which we have no icon, so use object instead.
				// TODO: we also have no icon for instance, so use object icon.
				if (/undefined|instance/.test(type)) {
					type = "object";
				}
				return "icon16 " + type + "Icon16";
			}
		},

		onClick: function (item, nodeWidget) {
			var type = item.type;
			if (type === "folder") {
				// Since folders have no associated pages, expand the TreeNode instead, to hint the user
				// that they need to descendant on a child of this node.
				this._onExpandoClick({node: nodeWidget});
			} else {
				// Open the page for this module.
				this.addTabPane(item.fullname, this.version);
			}
		},

		selectAndClick: function (path) {
			// summary:
			//		Helper method used from welcome screen, ex: moduleTree.selectAndClick(["dojo/", "dojo/query"])

			this.set("path", ["root"].concat(path)).then(lang.hitch(this, function () {
				var node = this.get("selectedNode");
				this.onClick(node.item, node);
			}));
		},
        addTabPane : function (page, version) {
            var p = registry.byId("content");
            // Get the URL to get the tab content.
            // TODO - not great
            var fullName = page;
			var lexicalversion = version.split('.')[1];
			if (parseFloat(lexicalversion) < 8) {
				fullName = page.replace(/\./g, "/").trim();
			}
            // END TODO
            var url = config.apiPath + version + "/" + fullName;  // TODO fix this later, should pass in the context
			var id = page.replace(/[\/.]/g, "_") + "_" + version;
            var existingPane = registry.byId(id);
            if (existingPane) {
                p.selectChild(existingPane);
                return existingPane;
            }
            var pane = new ContentPane({
                id: id,
                page: page,		// save page because when we select a tab we locate the corresponding TreeNode
                href: url + config.moduleExtension + "?xhr=true",
                title: page + " (" + version + ")",
                closable: true,
                version : version,
                parseOnLoad: false
            });
            pane.startup();
            p.addChild(pane);
            p.selectChild(pane);

            return pane;
        }
	});
});
