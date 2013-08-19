require([
    "dojo/parser",
    "dojo/dom",
    "dojo/_base/lang",
    "dijit/layout/BorderContainer",
    "dijit/layout/TabContainer",
    "api/ModuleContentPane",
    "dijit/layout/AccordionContainer",
    "api/ModuleTreeModel",
    "api/ModuleTree",
    "dojo/_base/config",
    "dojo/query",
    "dijit/registry",
    "dijit/MenuItem",
    "dijit/Menu",
    "dojo/_base/array", // array.forEach
    "dijit/MenuSeparator",
    "dijit/form/FilteringSelect",
    "dijit/TooltipDialog",
    "dijit/form/DropDownButton",
    "dojo/on",
    "dijit/popup",
    "dojo/window", // djwindow
    "dojo/aspect", // aspect
    "dojo/domReady!"
], function (parser, dom, lang, BorderContainer, TabContainer, ContentPane, AccordionContainer,
        ModuleTreeModel, ModuleTree, config, query, registry, MenuItem, Menu, array, MenuSeparator, FilteringSelect, TooltipDialog, DropDownButton, on, popup, djwindow, aspect) {

    var moduleModel = null, moduleTree = null, currentVersion = null, apiSearchToolTipDialog = null, apiSearchWidget = null;

    function buildTree() {
        if (moduleModel !== null) {
            moduleTree.destroyRecursive();
        }
        // this is the default version - will need a global to check on when the selected version is changed
        var version = currentVersion ?  currentVersion : config.apiDefault,
            jsonfile = config.apiPath + "data/" + version + '/tree.json',
            tabContainer = null;
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
        tabContainer = registry.byId("content");
        tabContainer.watch("selectedChildWidget", function (attr, oldVal, selectedChildWidget) {
            // If we are still scrolling the Tree from a previous run, cancel that animation
            if (moduleTree.scrollAnim) {
                moduleTree.scrollAnim.stop();
            }

            if (!selectedChildWidget.page || moduleTree.version !== selectedChildWidget.version) {
                // This tab doesn't have a corresponding entry in the tree, it must be the welcome tab or it's a different version from the tree displayed
                moduleTree.set("path", []);
                return;
            }
            setTreePath(selectedChildWidget.page);
        }, true);
        //end selectedChildWidgets
    }

    function versionChange(e) {
        // summary:
        //    Change the version displayed.
        var v = this.options[this.selectedIndex].value;
        // if we reverted, bug out.
        if (currentVersion === v) { return; }
        currentVersion = v;
        buildTree();
    }

    function buildSearch(rootjson) {
        // TODO: maybe test if theres an existing widget and disconnect?
        apiSearchWidget = registry.byId("apiSearchWidget");
        apiSearchWidget.queryExpr = "*${0}*"; //contains
        apiSearchWidget.autoComplete = false;
        var store = treeToStore(rootjson, {identifier: 'id', items: []});
        apiSearchWidget.store.setData(store);

        apiSearchWidget.on("Change", function (data) {
            setTreePath(data);
        });
    }

    function treeToStore(jsonObj, store) {
        if (jsonObj.children) {
            array.forEach(jsonObj.children, function (item) {
                store.items.push({id: item.id, name: item.id});
                if (item.children) {
                    treeToStore(item, store);
                }
            });
        }
        return store;
    }

    function setTreePath(page) {
        // Select the TreeNode corresponding to this tab's object.   For dijit/form/Button the path must be
        // ["root", "dijit/", "dijit/form/", "dijit/form/Button"]
        var parts = page.match(/[^/\.]+[/\.]?/g), path = "";
        path = ["root"].concat(array.map(parts, function (part, idx) {
            return parts.slice(0, idx + 1).join("").replace(/\.$/, "");
        }));

        moduleTree.set("path", path).then(function () {
                var selectednode = moduleTree.selectedNode;
                djwindow.scrollIntoView(selectednode.domNode);
            },
            function (err) {
                console.log("tree: error setting path to " + path);
        });
    }

    // Initial setup code

    var parsed = parser.parse(),versionSelector = dom.byId("versionSelector");
    apiSearchToolTipDialog = registry.byId("apiSearchToolTipDialog");
    apiSearchToolTipDialog.closable = true;
    versionSelector.onchange = lang.hitch(versionSelector, versionChange);

    buildTree();

    // Handle URL argument for initial tab
    if(location.search){
        // The only formats we support are qs=dijit/Dialog or qs=1.9/dijit/Dialog#show
        var page = location.search.replace("?qs=", ""), version = null, anchor = null;
        if(/^[0-9]/.test(page)){
            currentVersion = page.replace(/\/.*/, "");
            buildTree();
            page = page.replace(/[^/]+\//, "");
        }
        version = currentVersion || config.apiDefault,
            pane = moduleTree.addTabPane(page, version);

        anchor = location.hash && location.hash.substring(1);
        if(anchor){
            anchor = (version + page).replace(/[/\.]/g, "_") + "_" + anchor;    // ex: 1_9dijit_Dialog_show
            pane.onLoadDeferred.then(function(){
                var target = query('a[name="' + anchor + '"]', pane.domNode);
                if(target[0]){
                    djwindow.scrollIntoView(target[0]);
                }
            });
        }
    }

    // selectAndClick setup the welcome page (selectAndClick is defined by buildTree)
    var welcomeTab = registry.byId("baseTab_welcomeTab");
    query(".dtk-object-title a", welcomeTab.domNode).forEach(function (node, index) {
        on(node, "click", function (e) {
            var targetpatharr = e.target.name.split("/"), treepatharr = [], tmp2 = null;
            // TODO : do this better, filter/map?
            // builds an array of paths for a tree (must be in this order) -> an ending slash (empty i.e. a folder) ->
            // a module path to but not the module i.e.charting in dojox/charting/Chart (idx < arr.length -1) ->
            // and the module name (the last item)
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

    var tabContainer = registry.byId("content");
    /* monkey patch to add close all option to the context menu popup (as well as each tab) - mainly helps with touch devices that can't use tablist right click */
    aspect.after(tabContainer.tablist._menuBtn, 'loadDropDown', function (data) {
        var menuItem = new MenuItem({
            label: "Close all",
            iconClass: "dijitInline dijitIcon dijitMenuItemIcon dijitIconDelete",
            onClick: function () {
                closeAllTabs();
            }
        });
        this.dropDown.addChild(menuItem, 0);
        this.dropDown.addChild(new MenuSeparator(), 1);

    });

    // found via layout/TabController.js - id: this.id + "_Menu" (another monkey patch)
    var contentTabListMenu = dijit.registry.byId("content_tablist_Menu");
    var closeMenu = new MenuItem({
        id: this.id + "_Menu_CloseAll",
        label: "Close All",
        onClick: function(evt){
            closeAllTabs();
        }
    });
    contentTabListMenu.addChild(closeMenu);

    function closeAllTabs() {
        tabContainer.getChildren().forEach(function (item) {
            if (item.closable) {
                tabContainer.removeChild(item);
                item.destroyRecursive();
            }
        });
    }
});

