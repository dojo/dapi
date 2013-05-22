define(["dojo/_base/declare",
    "dojo/_base/kernel", // kernel.deprecated
    "dojo/_base/lang", // lang.mixin lang.delegate lang.hitch lang.isFunction lang.isObject
    "dijit/layout/ContentPane",
    "dojo/query",
    "dojo/dom-construct",
    "dojo/_base/config",
    "dojo/on",
    "dojo/dom-class",
    "dojo/dom-style"
], function (declare, kernel, lang, ContentPane, query, domConstruct, config, on, domClass, domStyle) {

// module:
//        api/ContentPane


    return declare("api.ModuleContentPane", [ContentPane], {
        version : "",
        extensionOn : true, //possibly move to the contructor though its not an object
        privateOn : false, //possibly move to the contructor though its not an object
        inheritedOn : true, //possibly move to the contructor though its not an object

        onLoad : function (data) {
            console.log("api.ContentPane version = " + this.version);
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
            //console.log(this.domNode);

///////////////// TODO: IN PROGRESS

            var link = query("div.jsdoc-permalink", context);
            if (link.length === 0) { // handle loading the intro screen - this is probably not needed now
                return;
            }
            link = link[0].innerHTML;
            // TODO baseUrl ??
            var baseUrl = "/";
            // img should be moved to classes - im having to include the context path in order this works
            var tbc = (link ? '<span class="jsdoc-permalink"><a class="jsdoc-link" href="' + link + '">Permalink</a></span>' : '')
                + '<label>View options: </label>'
                + '<span class="trans-icon jsdoc-extension"><img src="' + config.context + 'css/icons/24x24/extension.png" align="middle" border="0" alt="Toggle extension module members" title="Toggle extension module members" /></span>'
                + '<span class="trans-icon jsdoc-private"><img src="' + config.context + 'css/icons/24x24/private.png" align="middle" border="0" alt="Toggle private members" title="Toggle private members" /></span>'
                + '<span class="trans-icon jsdoc-inherited"><img src="' + config.context + 'css/icons/24x24/inherited.png" align="middle" border="0" alt="Toggle inherited members" title="Toggle inherited members" /></span>';
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
                this.adjustLists(context, _this);
            }));

            var privateBtn = query(".jsdoc-private", toolbar)[0];
            domClass.add(privateBtn, "off");    // initially off
            on(privateBtn, "click", lang.hitch(this, function (e) {
                this.privateOn = !this.privateOn;
                var _this = this;
                domClass.toggle(privateBtn, "off", !this.privateOn);
                this.adjustLists(context, _this);
            }));

            var inheritedBtn =  query(".jsdoc-inherited", toolbar)[0];
            on(inheritedBtn, "click", lang.hitch(this, function (e) {
                this.inheritedOn = !this.inheritedOn;
                var _this = this;
                domClass.toggle(inheritedBtn, "off", !this.inheritedOn);
                this.adjustLists(context, _this);
            }));


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

///////////////// TODO: END IN PROGRESS

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
                var tmp = this.href.replace(/^[a-z]*:/, "").replace(config.baseUrl, "").replace(/#.*/, "").split("/");
                var version = tmp[0];
                var page = tmp.slice(1).join("/");
                var url = config.apiPath + "/" + version + "/" + page;  // TODO fix this later, should pass in the context
                console.log("parent ==== " + _this.getParent());
                console.log("api.ContentPane page ====" + page);
                //var pane = addTabPane(page, version);
                var pane = new api.ModuleContentPane({
                    id: page.replace(/[\/.]/g, "_") + "_" + version,
                    page: page,		// save page because when we select a tab we locate the corresponding TreeNode
                    href: url,
                    //content : {version: "version" , itemtid: item.id, namel: item.name, fullname : item.fullname, type: item.type},  
                    //title: title,
                    title: page + " (" + version + ")",
                    closable: true,
                    version : version,
                    parseOnLoad: false
                });
                pane.startup();
                _this.getParent().addChild(pane);
                _this.getParent().selectChild(pane);
                pane.initModulePane();
            });

/*

            on(context, on.selector("a.jsdoc-link", "click"), lang.hitch(this, function(evt) {
                // Don't do this code for the permalink button, that's handled in a different place
                if(domClass.contains(_this.parentNode, "jsdoc-permalink")) {
                    return;
                }
                // Stop the browser from navigating to a new page
                evt.preventDefault();
                
                // Open tab for specified module
                
                var version = tmp[0];
                var page = tmp.slice(1).join("/");
                console.log("parent ==== " + this.getParent());
                console.log("api.ContentPane page ====" + page);
                //var pane = addTabPane(page, version);
            }));


*/

        }

    });
});
