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
    "dojo/dom-style",
    "dojox/mobile/bookmarkable",
    "dojo/has",
    "dojox/mobile/ContentPane",
    "dojox/mobile/Accordion"
], function (parser, dom, lang, ready, config, on, Heading, View, RoundRectList, RoundRect, ListItem, registry, request, ViewController, ScrollableView, domStyle, bookmarkable, has, ContentPane, Accordion) {
    var moduleModel = null, moduleTree = null, currentVersion = null, apiSearchToolTipDialog = null, apiSearchWidget = null, vc = ViewController.getInstance(), treesdataview = null, mainview = null;
    ready(function () {
        domStyle.set(document.body, "display", "block"); // naff but prevents the FOUC (body.display set to none in markup)
        //new Accordion();// TODO : test if it's specific to Accordion i.e. by loading an instance first - this works if you load another Accordion module xhr pane first
        var parsed = parser.parse();
        treesdataview = registry.byId("treesdataview");
        mainview = registry.byId("mainview");
        console.log("%cSee dojox/mobile/Accordion for the xhr and contentpane problem; this doesn't happen if you load any non listitem'd module pane first.  Also click on the childwidget  LI and that's loaded into the same pane.", "color:black; background-color:red; font-size:14px");
        console.warn("----> %cThis DOJO mobile API viewer is just a proof of concept and not fully functional", "color:black; background-color:red; font-size:14px");
        console.warn("----> %cIt's aim is to show extending the API viewer to show an alternate presentation. Configure the views directory to mobileviews to see it in action", "text-decoration:underline;");

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
                    versionlistlink.transitionTo("treesdataview_" + version);
                }, function (err) {
                    alert(err);
                });
                console.log(ev);
            });
        }

    });


    var buildTreeView = function (dataitem, path, objtype, version) {
        //var treedatalist = registry.byId("treedatalist"), treecontainernode = treedatalist.containerNode;
        var treeitem = null, children = dataitem.children;
        var viewsfromto = getTreeViewsToTransition(dataitem, path, dataitem, version);

        //treedatalist.destroyDescendants();
        //console.log(treesdataview);
        // we're not root and we've been sent a path that looks like folder/dijit/Tree  (folder|object|function etc) 
        if (!dataitem.children ||  dataitem.children &&  dataitem.children > 0) {
            return;
        }
        var roundlist = new RoundRectList();
        roundlist.startup();
        children.forEach(function (item, idx, arr) {
            //var id = dataitem.version + '/' + item.name;
            // TODO ignore objects which are expandable i.e. they likely have a item.type = 'object' (as compared to item.type = 'folder')
            var itemtype = item.type;
            //console.log(item.type, item.name);

            // object|constructor|folder all seem to be able to have children
            //console.log("name = " + item.fullname + ", type = " + item.type + ", hasChildren = " + (item.children && item.children.length > 0 ? "true" : "false"));

            // constructor|object|folder|function|instance|undefined(this isn't right "dijit/robot") 
            // only folder will have no associated view - also test for children to add a new list
            if (itemtype !== 'folder' && item.children && item.children.length > 0) {
                console.warn(itemtype + ", item name = " + item.name + ", children.length = " + item.children.length);
                //return;
            }
            var rightIcon2 = (item.type === "folder" ? "mblDomButtonSilverCircleDownArrow" : "mblDomButtonBlueCircleArrow"); // 
            var rightText = (item.type === "folder" ? "Expand" : "View"); //
            treeitem = new ListItem({label : item.name + (item.type === "folder" ? "    >" : ""), moveTo : '#', id : itemtype + "/" + item.fullname, noArrow: true, rightIcon2 : rightIcon2, rightText : rightText});
            treeitem.startup();
            roundlist.addChild(treeitem);
            //treeitem.placeAt(treecontainernode);
            //treeitem.placeAt(viewsfromto.to.containerNode);
            roundlist.placeAt(viewsfromto.to.containerNode);

            treeitem.on("click", function (ev) {
                var linkto = this.id;
                var viewsfromtoinner = getTreeViewsToTransition(item, linkto, dataitem, version);
                var pathsplit = linkto.split("/");
                //.replace(/[^\/]*./, '');
                var objtype = pathsplit[0];
                //var pathfolder = pathsplit.splice(1, pathsplit.length).join("/");

                console.log(linkto, this.type);
                //if (item.type === 'folder') { // 12/07 temp stub
                if (true) {
                    buildTreeView(item, linkto, objtype, version);
                    //viewsfromto.to.destroyDescendants();
                    viewsfromtoinner.from.performTransition(viewsfromtoinner.to.id, 1, "slide");
                    console.log(viewsfromtoinner);
                    //treeitem.transitionTo("treesdataview");
                } else {
                    //viewsfromtoinner.to    
                    createModulePane(item, linkto, objtype, version);
                }
                ev.preventDefault();
            });
            // end on


        });
    };

    // TODO : use this to get the from and to views to transition to, Return an object {from:view, to:view} so transitions can be performed, based on the level in the tree i.e. dijit (1), dijit/form (2)
    var getTreeViewsToTransition = function (item, path, data, version) {
        var scrollableParams = {fixed : "top"};
        var obj = {};
        obj.to = "";
        obj.from = "";
        var toview = null;
        //var versionformatted = version.replace(/\./, '_');
        var versionformatted = version;
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
                    // id, version, label, moveTo
                    toview = createView(item, toviewid, versionformatted, toviewid + " " + version, "treesdataview_" + versionformatted);
                }
                obj.to = toview;
            } else {
                toview = registry.byId(toviewid);
                pathsplit.pop(); // remove the last element i.e. this will be the parent of the object i.e. dijit/form/_FormSelectWidget will be dijit/form
                var fromviewid = pathsplit.join("/"), fromview =  registry.byId(fromviewid);

                if (!fromview) {
                    fromview = createView(item, fromview, versionformatted, fromview + " " + version);
                }
                if (!toview) {
                    toview = createView(item, toviewid, versionformatted, toviewid + " " + version, fromview.id);
                }
                obj.from = fromview;
                obj.to = toview;
            }
        }
        return obj;
    };


    // TODO: use this to get the object details from the id i.e. version/objecttype/modulepath 
    var getObjectId = function (path) {
        var pathsplit = path.split("/"), version = pathsplit.pop(), objectType = pathsplit.pop();
        return {version : version, objectType : objectType, module : pathsplit.join("/")};
    };

    // TODO:  encapsulate view creation
    var createView = function (item, id, version, label, moveTo) {
        var view = null, headingobj = null, heading = null, contentpane;
        //view = new ScrollableView({id: id, keepScrollPos: false, scrollType:2});
        view = new View({id: id, keepScrollPos: false, scrollType: 2});

        headingobj = {label : id + " " + version, fixed : "top", back : "back"};
        if (moveTo) {
            headingobj.moveTo = moveTo;
        }
        view.placeAt(document.body);
        heading = new Heading(headingobj);
        //view.addFixedBar(heading);
        view.addChild(heading);

        if (item.type !== 'folder') {
            contentpane = createModulePane(item, null, null, version);
            view.addChild(contentpane);
        }

        view.startup();
        return view;
    };

    // TODO: use to show a module i.e. xhr
    var createModulePane = function (item, linkto, objtype, version) {
        console.log(item, linkto, objtype);
        var href = "/api/" + version + "/" + item.fullname + ".html";
        //var contentpane = new ContentPane({href:href});
        var contentpane = new ContentPane();
        //contentpane.placeAt(document.body);
        on(contentpane, "load", function () {
            console.log("href=" + href + " loaded");
        });

        contentpane.set("href", href);
        return contentpane;

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

