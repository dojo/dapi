require([
    "dojox/mobile/parser",
    "dojo/dom",
    "dojo/_base/lang",
    "dojo/ready",
    "dojo/_base/config",
    "dojo/on",
    "dojox/mobile/Heading",
    "dojox/mobile/View",
    "dojox/mobile/RoundRectList",
    "dojox/mobile/RoundRect",
    "dojox/mobile/ListItem",
    "dijit/registry",
    "dojo/request",
    "dojox/mobile/ViewController",
    "dojox/mobile/ScrollableView",
    "dojo/dom-style"
], function (parser, dom, lang, ready, config, on, Heading, View, RoundRectList, RoundRect, ListItem, registry, request, ViewController, ScrollableView, domStyle) {
    var moduleModel = null, moduleTree = null, currentVersion = null, apiSearchToolTipDialog = null, apiSearchWidget = null, vc = ViewController.getInstance(), treesdataview = null, mainview = null;
    ready(function () {
        domStyle.set(document.body, "display", "block"); // naff but prevents the FOUC (body.display set to none in markup)
        var parsed = parser.parse();
        treesdataview = registry.byId("treesdataview");
        mainview = registry.byId("mainview");
        console.log("Will use all ECMA6 features like querySelectorAll/forEach etc therefore I won't work in browsers that don't support me and I won't be using the compat package");
        // don't use query
        // query vars: 
        var versionlistitems = document.querySelectorAll("#versionlist li");
        var idx = 0;
        for (idx; idx < versionlistitems.length; ++idx) {
            //console.log(versionlistitems[idx]);
            on(versionlistitems[idx], "click", function (ev) {
                var versionlistlink = registry.byId(ev.currentTarget.id);
                var version = versionlistlink.version;
                console.log(version);
                //debugger;
                var jsonfile = config.apiPath + '/' + version + '/tree.json';
                request(jsonfile, {handleAs : "json"}).then(function (data) {
                    console.log(data, vc);
                    data.version = version;
                    buildTreeView(data, "", "", version);
                    // mainview.performTransition(treesdataview);
                    var versionrenamed = data.version.replace(/\./, '_');
                    versionlistlink.transitionTo("treesdataview_" + versionrenamed);
                }, function (err) {
                    alert(err);
                });
                console.log(ev);
            });
        }
/*        
        apiSearchToolTipDialog = registry.byId("apiSearchToolTipDialog");
        apiSearchToolTipDialog.closable = true;
        s.onchange = lang.hitch(s, versionChange);
        buildTree();
// selectAndClick setup the welcome page (selectAndClick is defined by buildTree)
        var welcomeTab = registry.byId("baseTab_welcomeTab");
        query(".dtk-object-title a", welcomeTab.domNode).forEach(function (node, index) {
            on(node, "click", function (e) {
                console.log(e.target.innerHTML);
                var targetpatharr = e.target.name.split("/"), treepatharr = [], tmp2 = null;
                // TODO : do this better, filter/map?
                // builds an array of paths for a tree (must be in this order) -> an ending slash (empty i.e. a folder) -> a module path to but not the module i.e.charting in dojox/charting/Chart (idx < arr.length -1) -> and the module name (the last item)   
                array.forEach(targetpatharr, function (item, idx, arr) {
                    if (arr[idx] === "") {
                    } else if (idx < arr.length - 1) {
                        var tmp2 = (arr.slice(0, idx + 1).join("/")  + "/");
                        treepatharr.push(tmp2);
                    } else {
                        treepatharr.push(arr.slice(0, idx + 1).join("/"));
                    }
                });
                moduleTree.selectAndClick(treepatharr);
                e.preventDefault();
            });
        });
// end selectAndClick

        // TODO - syntax highlighter for premalinked loaded modules -- plus this should be reusable (mixin?) as its also used in moduletree.js
        // should do as i thought, create an extended ContentPane with these functions because the show/hide semantics needs to be captured too (for summaries)
        var content = dom.byId("content");
        var contentpane = registry.byId("baseTab"); // the default loaded module tab (even when there is a permalink and intro screen) will always be named baseTab - intro screen id changed
        if (contentpane) {
            contentpane.initModulePane();
        }
*/

/*
        var tabContainer = registry.byId("content");
        // temp - add a close all option - move to context menu on the tab label
        dojo.getObject("dijit.layout._ScrollingTabControllerMenuButton").prototype.loadDropDown = function (callback) {
            this.dropDown = new Menu({
                id: this.containerId + "_menu",
                ownerDocument: this.ownerDocument,
                dir: this.dir,
                lang: this.lang,
                textDir: this.textDir
            });
            var container = registry.byId(this.containerId);
            // add close all
            var menuItem = new MenuItem({
                label: "Close all",
                iconClass: "dijitInline dijitIcon dijitMenuItemIcon dijitIconDelete",
                onClick: function () {
                    var _this = this;
                    tabContainer.getChildren().forEach(function (item) {
                        console.log(item);
                        if (item.closable) {
                            tabContainer.removeChild(item);
                            item.destroyRecursive();
                        }
                    });
                }
            });
            this.dropDown.addChild(menuItem);
            this.dropDown.addChild(new MenuSeparator());
            // end close all            

            array.forEach(container.getChildren(), function (page) {
                var menuItem = new MenuItem({
                    id: page.id + "_stcMi",
                    label: page.title,
                    iconClass: page.iconClass,
                    disabled: page.disabled,
                    ownerDocument: this.ownerDocument,
                    dir: page.dir,
                    lang: page.lang,
                    textDir: page.textDir,
                    onClick: function () {
                        container.selectChild(page);
                    }
                });
                this.dropDown.addChild(menuItem);
            }, this);
            callback();
        };
        // end temp - add a close all option - move to context menu on the tab label
*/
    });


    var buildTreeView = function (data, path, objtype, version) {
        //var treedatalist = registry.byId("treedatalist"), treecontainernode = treedatalist.containerNode;
        var treeitem = null, children = data.children;
        var viewsfromto = getTreeViewsToTransition(path, data, version);

        //treedatalist.destroyDescendants();
        //console.log(treesdataview);
        // we're not root and we've been sent a path that looks like folder/dijit/Tree  (folder|object|function etc) 

/*
        if (path && path.length > 0 && djtype && djtype !== "object" && djtype !== "function") {
            var tmparr = data.children.filter(function (item) {
                var pathsplit = path.split("/");
                //.replace(/[^\/]*./, '');
                var objtype = pathsplit[0];
                var pathfolder = pathsplit.splice(1, pathsplit.length).join("/");
                console.log(objtype, pathfolder);

                return (item.fullname === pathfolder);
                //return (item.fullname == path.replace(\^/\\, "")) ;
            });
            children = tmparr[0] && tmparr[0].children ? tmparr[0].children : children;
        } else if (djtype === "object" || djtype === "function"){
            console.log(path, djtype);
        } else {
            // empty path is the root folder - change crap logic later
            children = data.children;
        }
*/
        children.forEach(function (item, idx, arr) {
            //var id = data.version + '/' + item.name;
            // TODO ignore objects which are expandable i.e. they likely have a item.type = 'object' (as compared to item.type = 'folder')
            var itemtype = item.type;
            //console.log(item.type, item.name);

            // object|constructor|folder all seem to be able to have children
            console.log("name = " + item.fullname + ", type = " + item.type + ", hasChildren = " + (item.children && item.children.length > 0 ? "true" : "false"));

            // constructor|object|folder|function|instance|undefined(this isn't right "dijit/robot") 
            // only folder will have no associated view - also test for children to add a new list
            if (itemtype === 'folder') {
                //return;
            }
            treeitem = new ListItem({label : item.name, moveTo : '#', id : itemtype + "/" + item.fullname});
            treeitem.startup();
            //treeitem.placeAt(treecontainernode);
            treeitem.placeAt(viewsfromto.to.containerNode);

            treeitem.on("click", function (ev) {
                var linkto = this.id;
                var viewsfromtoinner = getTreeViewsToTransition(linkto, data, version);
                var pathsplit = linkto.split("/");
                //.replace(/[^\/]*./, '');
                var objtype = pathsplit[0];
                //var pathfolder = pathsplit.splice(1, pathsplit.length).join("/");

                console.log(linkto, this.type);
                if (item.type === 'folder') {
                    buildTreeView(item, linkto, objtype, version);
                    //viewsfromto.to.destroyDescendants();
                    viewsfromtoinner.from.performTransition(viewsfromtoinner.to.id, 1, "slide");
                    console.log(viewsfromtoinner);
                    //treeitem.transitionTo("treesdataview");
                } else {
                    showModuleView(item, linkto, objtype);
                }
                ev.preventDefault();
            });
        });
    };

    // TODO : use this to get the from and to views to transition to, Return an object {from:view, to:view} so transitions can be performed, based on the level in the tree i.e. dijit (1), dijit/form (2)
    var getTreeViewsToTransition = function (path, data, version) {
        var scrollableParams = {fixed : "top"};
        var obj = {};
        obj.to = "";
        obj.from = "";
        var toview = null;
        var versionformatted = version.replace(/\./, '_');
        if (path === "") {
            obj.from = registry.byId("mainview");
            obj.to = registry.byId("treesdataview_" + versionformatted);
        } else {
            var pathsplit = path.split("/");
            //var objtype = pathsplit[0];
            var objectitem = pathsplit.shift();
            //var idxadd = pathsplit.length == 1 ? "" : pathsplit.length;
            var toviewid =  pathsplit.join("/");
            if (pathsplit.length === 1) { // i.e. we're at a root e.g. dijit, dojo, dojox etc
                obj.from = registry.byId("treesdataview_" + versionformatted);
                toview = registry.byId(toviewid);
                if (!toview) {
                    toview = new ScrollableView({id: toviewid, keepScrollPos: false});
                    toview.placeAt(document.body);
                    var heading = new Heading({
                        label: toviewid + " " + version,
                        back : "back",
                        fixed : "top",
                        moveTo : "treesdataview_" + versionformatted
                    });
                    toview.addFixedBar(heading);
                    toview.startup();
                }
                obj.to = toview;
            } else {
                toview = registry.byId(toviewid);
                pathsplit.pop(); // remove the last element i.e. this will be the parent of the object i.e. dijit/form/_FormSelectWidget will be dijit/form
                var fromviewid = pathsplit.join("/");
                var fromview =  registry.byId(fromviewid);

                if (!fromview) {
                    fromview = new ScrollableView({id: fromviewid, keepScrollPos: false});
                    fromview.placeAt(document.body);
                    var headingfrom = new Heading({
                        label: fromviewid + " " + version,
                        fixed : "top",
                        back : "back"
                    });
                    fromview.addFixedBar(headingfrom);

                    fromview.startup();
                }


                if (!toview) {
                    toview = new ScrollableView({id: toviewid, keepScrollPos: false});
                    toview.placeAt(document.body);
                    var headingto = new Heading({
                        label: toviewid + " " + version,
                        back : "back",
                        fixed : "top",
                        moveTo : fromview.id
                    });
                    toview.addFixedBar(headingto);
                    toview.startup();
                }
                obj.from = fromview;
                obj.to = toview;
            }
//            obj.from = registry.byId("treesdataview" + pathsplit.length);
//            obj.to = registry.byId("treesdataview" + (pathsplit.length + 1));
            //console.log(obj);
        }
        return obj;
    };

    var showModuleView = function (item, linkto, objtype) {
        console.log(item, linkto, objtype);
    };

    var buildModuleView = function (data) {

    };













/////// old stuff >

    var buildTree = function () {
        if (moduleModel !== null) {
            moduleTree.destroyRecursive();
        }
        //moduleModel = new ModuleTreeModel(baseUrl + 'lib/tree.php?v=' + currentVersion);
        // moduleModel = new ModuleTreeModel(config.apiPath + '/' + selectedVersion + '/tree.json'); // for loading different versions
        // this is the default version - will need a global to check on when the selected version is changed
        var version = currentVersion ?  currentVersion : config.apiDefault;
        var jsonfile = config.apiPath + '/' + version + '/tree.json';
        moduleModel = new ModuleTreeModel(jsonfile);
        moduleTree = new ModuleTree({
            id: "moduleTree",
            model: moduleModel,
            showRoot: false,
            persist: false,
            version : version
        });
        moduleTree.placeAt("moduleTreePane");
        moduleTree.startup();

// started selectedChildWidget
        moduleModel.getRoot(function (data) {
            buildSearch(data);
        });
        var tabContainer = registry.byId("content");
		tabContainer.watch("selectedChildWidget", function (attr, oldVal, selectedChildWidget) {
			// If we are still scrolling the Tree from a previous run, cancel that animation
			if (moduleTree.scrollAnim) {
				moduleTree.scrollAnim.stop();
			}

			if (!selectedChildWidget.page) {
				// This tab doesn't have a corresponding entry in the tree.   It must be the welcome tab.
				return;
			}
			setTreePath(selectedChildWidget.page);
		}, true);
//end selectedChildWidgets        
    };
    var versionChange = function (e) {
        // summary:
        //    Change the version displayed.
        var v = this.options[this.selectedIndex].value;
        // if we reverted, bug out.
        if (currentVersion === v) { return; }
        currentVersion = v;
        buildTree();
    };
    var buildSearch = function (rootjson) {
        // TODO: maybe test if theres an existing widget and disconnect?
        apiSearchWidget = registry.byId("apiSearchWidget");
        apiSearchWidget.queryExpr = "*${0}*"; //contains
        apiSearchWidget.autoComplete = false;
        var store = treeToStore(rootjson, {identifier: 'id', items: []});
        apiSearchWidget.store.setData(store);

        apiSearchWidget.on("Change", function (data) {
            //var path = ["root"].concat(data.split("/"));
            setTreePath(data);
        });
    };
    var treeToStore = function (jsonObj, store) {
        if (jsonObj.children) {
            array.forEach(jsonObj.children, function (item) {
                store.items.push({id: item.id, name: item.id});
                if (item.children) {
                    treeToStore(item, store);
                }
            });
        }
        return store;
    };

    var setTreePath = function (page) {
        // Select the TreeNode corresponding to this tab's object.   For dijit/form/Button the path must be
        // ["root", "dijit/", "dijit/form/", "dijit/form/Button"]
		var parts = page.match(/[^/\.]+[/\.]?/g), path = "";
        path = ["root"].concat(array.map(parts, function (part, idx) {
			return parts.slice(0, idx + 1).join("").replace(/\.$/, "");
		}));

		moduleTree.set("path", path).then(function () {
            var selectednode = moduleTree.selectedNode;
            //var top = selectednode.domNode.offsetTop;
            //var left = selectednode.domNode.offsetLeft;

            selectednode.domNode.scrollIntoView();
            popup.close(apiSearchToolTipDialog);
            //apiSearchWidget.setValue("");
        },
		function (err) {
			console.log("tree: error setting path to " + path);
		});
    };
});

