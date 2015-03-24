define(["dojo/_base/declare",
    "dojo/_base/kernel", // kernel.deprecated
    "dojo/_base/lang", // lang.mixin lang.delegate lang.hitch lang.isFunction lang.isObject
    "dijit/layout/ContentPane",
    "dojo/query",
    "dojo/dom-construct",
    "dojo/_base/config",
    "dojo/on",
    "dojo/dom-class",
    "dojo/dom-style",
    "dijit/registry",
    "dijit/Dialog",
    "dijit/form/CheckBox"
], function (declare, kernel, lang, ContentPane, query, domConstruct, config, on, domClass, domStyle, registry, Dialog, CheckBox) {

    // module:
    //        api/ContentPane

    var helpDialog;

    return declare("api.ModuleContentPane", ContentPane, {
		moduleExtensionRegex : new RegExp(config.moduleExtension),  //from config
        version : "",
        extensionOn : true, //possibly move to the constructor though its not an object
        privateOn : false, //possibly move to the constructor though its not an object
        inheritedOn : true, //possibly move to the constructor though its not an object

        onLoad : function (data) {
            this.initModulePane();

        }, /// end onLoad

        adjustLists : function (context, obj) {
            // summary:
            //        Hide/show privates and inherited methods according to setting of private and inherited toggle buttons.
            //        Set/remove "odd" class on alternating rows.

            // The alternate approach is to do this through CSS: Toggle a jsdoc-hide-privates and jsdoc-hide-inherited
            // class on the pane's DOMNode, and use :nth-child(odd) to get the gray/white shading of table rows.   The
            // only problem (besides not working on IE6-8) is that the row shading won't account for hidden rows, so you
            // might get contiguous white rows or contiguous gray rows.
            // number of visible rows so far
            //var context = this.domNode;
            var cnt = 1;
            query(".jsdoc-property-list > *", context).forEach(function (li) {
                var hide =
                (!obj.extensionOn && domClass.contains(li, "extension-module")) ||
                (!obj.privateOn && domClass.contains(li, "private")) ||
                (!obj.inheritedOn && domClass.contains(li, "inherited"));
                domStyle.set(li, "display", hide ? "none" : "block");
                domClass.toggle(li, "odd", cnt % 2);
                if (!hide) {
                    cnt++;
                }
            });
        },
        initModulePane : function () {
            var context = this.domNode;
            this._setUpDocLinks(context);
            var link = query("div.jsdoc-permalink", context);
            if (link.length === 0) { // handle loading the intro screen - this is probably not needed now
                return;
            }
            link = link[0].innerHTML;
            var permalinkhtml = (link ? '<a class="jsdoc-link" href="' + link + '">Permalink</a>' : '');
            domConstruct.create("span", {
                className: "jsdoc-permalink",
                innerHTML: permalinkhtml
            }, this.domNode, "first");


            var toolbar = domConstruct.create("div", {
                className: "jsdoc-toolbar"
            }, this.domNode, "first");
            this._createCheckBoxes(toolbar, context);
            this.adjustLists(context, this);
            this._highlighter(context);
            //    make the summary sections collapsible.
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

                //    probably should replace this with next or something.
                var d = item.nextSibling;
                while (d.nodeType !== 1 && d.nextSibling) { d = d.nextSibling; }
                if (d) {
                    domStyle.set(d, "display", "none");
                }
            });
            // bugdb link
            if (config.bugdb) {
                this._bugDbReport(context, link);
            }
            // finally set the window title
        },
        _highlighter : function (context) {
            //    if SyntaxHighlighter is present, run it in the content
            if (SyntaxHighlighter) {
                // quick hack to convert <pre><code> --> <pre class="brush: js;" lang="javascript">,
                // as expected by the SyntaxHighlighter
                var children = query("pre code", context);
                children.forEach(function (child) {
                    var parent = child.parentNode,
                        isXML = lang.trim(child.innerText || child.textContent).charAt(0) === "<";
                    domConstruct.place("<pre class='brush: " + (isXML ? "xml" : "js") + ";'>" + child.innerHTML + "</pre>", parent, "after");
                    domConstruct.destroy(parent);
                });
                // run highlighter
                SyntaxHighlighter.highlight();
            }
        },
        _setUpDocLinks : function (context) {
            var _this = this;
            on(context, on.selector("a.jsdoc-link", "click"), function (evt) {
                // Don't do this code for the permalink button, that's handled in a different place
                if (domClass.contains(this.parentNode, "jsdoc-permalink")) {
                    return;
                }
                // Stop the browser from navigating to a new page
                evt.preventDefault();

                // Open tab for specified module
                var tmp = this.href
					.replace(/^[a-z]*:\/\//, "")                // remove http://
					.replace(/[^/]+/, "")                       // remove domain
					.replace(config.context, "")                // remove /api/
					.replace(/#.*/, "")                         // remove #foo
					.replace(_this.moduleExtensionRegex, "")    // remove .html
					.split("/");
                var version = tmp[0];
                var page = tmp.slice(1).join("/");
                var url = config.apiPath + version + "/" + page;
				var id = page.replace(/[\/.]/g, "_").replace(/[\//]/g, "_") + "_" + version;
                var existingPane = registry.byId(id);
                if (existingPane) {
                    _this.getParent().selectChild(existingPane);
                    return existingPane;
                } else {
                    var pane = new api.ModuleContentPane({
                        id: id,
                        page: page,        // save page because when we select a tab we locate the corresponding TreeNode
                        href: url + config.moduleExtension + "?xhr=true",
                        title: page + " (" + version + ")",
                        closable: true,
                        version: version,
                        parseOnLoad: false
                    });
                    pane.startup();
                    _this.getParent().addChild(pane);
                    _this.getParent().selectChild(pane);
                    pane.initModulePane();
                }
            });
        },
        _bugDbReport : function (context, link) {
            var reportlink = query("a.feedback", context)[0];
            on(reportlink, 'click', function (event) {
                event.preventDefault();
                if (!event.button && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
                    if (!helpDialog) {
                        helpDialog = new Dialog({ title: "Feedback" });
                        helpDialog.startup();
                    }
                    helpDialog.set("content", domConstruct.create("iframe", {
                        src: this.href,
                        frameborder: "0",
                        style: "width: 47em; height: 500px; border: 0 none"
                    }));
                    helpDialog.show();
                }
            });
        },
        _createCheckBoxes : function (toolbardiv, context) {
            var _this = this, position = "last";
            var inheritedCheckId = "checkBoxInherited_" + this.id, privateCheckId = "checkBoxPrivate_" + this.id,
                extensionCheckId = "checkBoxExtension_" + this.id,
                inputHtml = "<label for='" + extensionCheckId + "'>Extensions</label> <input id='" + extensionCheckId + "' type='checkbox'/>" +
                    "<label for='" + privateCheckId + "'>Privates</label> <input id='" + privateCheckId + "' type='checkbox'/>" +
                    "<label for='" + inheritedCheckId + "'>Inheriteds</label> <input id='" + inheritedCheckId + "' type='checkbox'/>";
            var check1 = domConstruct.create("div", {
                className: "viewOptions",
                innerHTML: inputHtml
            }, toolbardiv, position);

            var checkBoxExtension = new CheckBox({
                name: "checkBoxExtension",
                value: "Extension",
                checked: true,
                onChange: function (ev) {
                    _this.extensionOn = !_this.extensionOn;
                    _this.adjustLists(context, _this);
                }
            }, extensionCheckId).startup();

            var checkBoxPrivate = new CheckBox({
                name: "checkBoxPrivate",
                value: "Private",
                checked: false,
                onChange: function (ev) {
                    _this.privateOn = !_this.privateOn;
                    _this.adjustLists(context, _this);
                }
            }, privateCheckId).startup();

            var checkBoxInherited = new CheckBox({
                name: "checkBoxInherited",
                value: "Inherited",
                checked: true,
                onChange: function (ev) {
                    _this.inheritedOn = !_this.inheritedOn;
                    _this.adjustLists(context, _this);
                }
            }, inheritedCheckId).startup();

        }
    });
});
