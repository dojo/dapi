require([
	"dojo/parser",
	"dojo/dom",
	"dojo/_base/lang",
	"dojo/ready",
	"dijit/layout/BorderContainer",
	"dijit/layout/TabContainer",
	"dijit/layout/ContentPane",
	"dijit/layout/AccordionContainer",
	"api/ModuleTreeModel",
	"api/ModuleTree",
	"dojo/_base/config",
	"dojo/query",
	"dojo/dom-construct"
], function (parser, dom, lang, ready, BorderContainer, TabContainer, ContentPane, AccordionContainer, ModuleTreeModel, ModuleTree, config, query, domConstruct) {
    var moduleModel = null, moduleTree = null, currentVersion = null;
    ready(function () {
        var parsed = parser.parse();
        var s = dom.byId("versionSelector");
        s.onchange = lang.hitch(s, versionChange);
        buildTree();

        // TODO - syntax highlighter for premalinked loaded modules -- plus this should be reusable (mixin?) as its also used in moduletree.js
        // should do as i thought, create an extended ContentPane with these functions because the show/hide semantics needs to be captured too (for summaries)
        var content = dom.byId("content");
        if (content) {
            //	if SyntaxHighlighter is present, run it in the content
            if (SyntaxHighlighter) {
                // quick hack to convert <pre><code> --> <pre class="brush: js;" lang="javascript">,
                // as expected by the SyntaxHighlighter
                var children = query("pre code", content);
                children.forEach(function (child) {
                    var parent = child.parentNode,
                        isXML = lang.trim(child.innerText || child.textContent).charAt(0) === "<";
                    domConstruct.place("<pre class='brush: " + (isXML ? "xml" : "js") + ";'>" + child.innerHTML + "</pre>", parent, "after");
                    domConstruct.destroy(parent);
                });
            // run highlighter
                SyntaxHighlighter.highlight();
            }
        }
        // END TODO

    });

    var buildTree = function () {
        if (moduleModel !== null) {
            moduleTree.destroyRecursive();
        }
        //moduleModel = new ModuleTreeModel(baseUrl + 'lib/tree.php?v=' + currentVersion);
        // moduleModel = new ModuleTreeModel(config.apiPath + '/' + selectedVersion + '/tree.json'); // for loading different versions
        // this is the default version - will need a global to check on when the selected version is changed
        var version = currentVersion ?  currentVersion : config.apiDefault;
        moduleModel = new ModuleTreeModel(config.apiPath + '/' + version + '/tree.json');
        moduleTree = new ModuleTree({
            id: "moduleTree",
            model: moduleModel,
            showRoot: false,
            persist: false,
            version : version
        });
        moduleTree.placeAt("moduleTreePane");
        moduleTree.startup();
    };
    var versionChange = function (e) {
        // summary:
        //		Change the version displayed.
        var v = this.options[this.selectedIndex].value;
        //	if we reverted, bug out.
        if (currentVersion === v) { return; }
        currentVersion = v;
        buildTree();
    };



});

