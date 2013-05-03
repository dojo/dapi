define(["dojo/_base/declare", "dojo/_base/lang", "dijit/Tree", "dijit/registry", "dijit/layout/ContentPane",
        "dojo/query", "dojo/dom-construct", "dojo/_base/config", "dojo/on", "dojo/dom-class", "dojo/dom-style"
    ], function (declare, lang, Tree, registry, ContentPane, query, domConstruct, config, on, domClass, domStyle) {

	return declare("ModuleTree", Tree, {
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
				this.addTabPane(item, item.fullname, this.version);
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
        addTabPane : function (item, page, version) {
            var p = registry.byId("content");
            // Get the URL to get the tab content.
            // versions[] lists what directory (lib or lib.old) contains the item.php script used to display this page
            //var url = baseUrl + versions[version] + "/item.php?p=" + page + "&v=" + (version || currentVersion);
            // clean this, apidata moved to config, fullname - start docing jsstructures
            console.log(item.fullname);
            // TODO - this is shit and need to change - probably push node side -
            var fullName = item.fullname;
            if (parseFloat(version.match(/[0-9]../)) < 1.8) {
                fullName = item.fullname.replace(/\./g, "/") + ".html";
            }
            // END TODO

            var url = config.apiPath + "/" + version + "/" + fullName;  // TODO fix this later, should pass in the context

            var pane = new ContentPane({
                id: page.replace(/[\/.]/g, "_") + "_" + version,
                page: page,		// save page because when we select a tab we locate the corresponding TreeNode
                href: url,
                //content : {version: "version" , itemtid: item.id, namel: item.name, fullname : item.fullname, type: item.type},  
                //title: title,
                title: item.fullname + " (" + version + ")",
                closable: true,
                parseOnLoad: false,
                onLoad: lang.hitch(pane, this.paneOnLoad)
            });
            pane.startup();
            p.addChild(pane);
            p.selectChild(pane);
            return pane;
        },
        paneOnLoad : function (data) {
            var context = this.domNode;
            console.log(this.domNode);

            this.extensionOn = true; //possibly move to the contructor though its not an object
            this.privateOn = false; //possibly move to the contructor though its not an object
            this.inheritedOn = true; //possibly move to the contructor though its not an object



///////////////// TODO: IN PROGRESS

            var link = query("div.jsdoc-permalink", context)[0].innerHTML;
            // TODO baseUrl ??
            var baseUrl = "/";
            var tbc = (link ? '<span class="jsdoc-permalink"><a class="jsdoc-link" href="' + link + '">Permalink</a></span>' : '')
                + '<label>View options: </label>'
                + '<span class="trans-icon jsdoc-extension"><img src="css/icons/24x24/extension.png" align="middle" border="0" alt="Toggle extension module members" title="Toggle extension module members" /></span>'
                + '<span class="trans-icon jsdoc-private"><img src="css/icons/24x24/private.png" align="middle" border="0" alt="Toggle private members" title="Toggle private members" /></span>'
                + '<span class="trans-icon jsdoc-inherited"><img src="css/icons/24x24/inherited.png" align="middle" border="0" alt="Toggle inherited members" title="Toggle inherited members" /></span>';
            var toolbar = domConstruct.create("div", {
                className: "jsdoc-toolbar",
                innerHTML: tbc
            }, this.domNode, "first");
            //this.adjustLists(this.domNode);



            var extensionBtn = query(".jsdoc-extension", toolbar)[0];
            on(extensionBtn, "click", lang.hitch(this, function (e) {
                this.extensionOn = !this.extensionOn;
                var _this = this;
                domClass.toggle(extensionBtn, "off", !this.extensionOn);
                adjustLists(context, _this);
            }));

            var privateBtn = query(".jsdoc-private", toolbar)[0];
            domClass.add(privateBtn, "off");	// initially off
            on(privateBtn, "click", lang.hitch(this, function (e) {
                this.privateOn = !this.privateOn;
                var _this = this;
                domClass.toggle(privateBtn, "off", !this.privateOn);
                adjustLists(context, _this);
            }));

            var inheritedBtn =  query(".jsdoc-inherited", toolbar)[0];
            on(inheritedBtn, "click", lang.hitch(this, function (e) {
                this.inheritedOn = !this.inheritedOn;
                var _this = this;
                domClass.toggle(inheritedBtn, "off", !this.inheritedOn);
                adjustLists(context, _this);
            }));


            function adjustLists(context, obj) {
                // summary:
                //		Hide/show privates and inherited methods according to setting of private and inherited toggle buttons.
                //		Set/remove "odd" class on alternating rows.

                // The alternate approach is to do this through CSS: Toggle a jsdoc-hide-privates and jsdoc-hide-inherited
                // class on the pane's DOMNode, and use :nth-child(odd) to get the gray/white shading of table rows.   The
                // only problem (besides not working on IE6-8) is that the row shading won't account for hidden rows, so you
                // might get contiguous white rows or contiguous gray rows.
                // number of visible rows so far
                //var context = this.domNode;
                console.log("obj");
                console.log(obj);
                var cnt = 1;
                query(".jsdoc-property-list > *", context).forEach(function (li) {
                    var hide =
                    (!obj.extensionOn && domClass.contains(li, "extension-module")) ||
                    (!obj.privateOn && domClass.contains(li, "private")) ||
                    (!obj.inheritedOn && domClass.contains(li, "inherited"));
                    if (hide === true) {
                        console.log(li);
                    }
                    domStyle.set(li, "display", hide ? "none" : "block");
                    domClass.toggle(li, "odd", cnt % 2);
                    if (!hide) {
                        cnt++;
                    }
                });
            }
            adjustLists(context, this);


            //	make the summary sections collapsible.
            query("h2.jsdoc-summary-heading", this.domNode).forEach(function (item) {
                on(item, "click", function (e) {
                    var d = e.target.nextSibling;
                    while (d.nodeType !== 1 && d.nextSibling) { d = d.nextSibling; }
                    if (d) {
                        var dsp = domStyle.get(d, "display");
                        domStyle.set(d, "display", (dsp === "none" ? "": "none"));
                        query("span.jsdoc-summary-toggle", e.target).forEach(function (item) {
                            domClass.toggle(item, "closed", dsp === "none");
                        });
                    }
                });

                query("span.jsdoc-summary-toggle", item).addClass("closed");

                //	probably should replace this with next or something.
                var d = item.nextSibling;
                while (d.nodeType !== 1 && d.nextSibling) { d = d.nextSibling; }
                if (d) {
                    domStyle.set(d, "display", "none");
                }
            });






///////////////// TODO: END IN PROGRESS

        } /// end paneOnLoad

	});
});