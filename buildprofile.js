var profile = (function(){
    return {
        basePath: "/var/www/dojosrc/dojo-release-1.9.1-src",
        releaseDir: "./release",
        releaseName: "lib",
        action: "release",
        layerOptimize: "closure",
        optimize: "closure",
        cssOptimize: "comments",
        mini: true,
        stripConsole: "warn",
        selectorEngine: "lite",
 
        defaultConfig: {
            hasCache:{
                "dojo-built": 1,
                "dojo-loader": 1,
                "dom": 1,
                "host-browser": 1,
                "config-selectorEngine": "lite"
            },
            async: 1
        },
 
        staticHasFeatures: {
            "config-deferredInstrumentation": 0,
            "config-dojo-loader-catches": 0,
            "config-tlmSiblingOfDojo": 0,
            "dojo-amd-factory-scan": 0,
            "dojo-combo-api": 0,
            "dojo-config-api": 1,
            "dojo-config-require": 0,
            "dojo-debug-messages": 0,
            "dojo-dom-ready-api": 1,
            "dojo-firebug": 0,
            "dojo-guarantee-console": 1,
            "dojo-has-api": 1,
            "dojo-inject-api": 1,
            "dojo-loader": 1,
            "dojo-log-api": 0,
            "dojo-modulePaths": 0,
            "dojo-moduleUrl": 0,
            "dojo-publish-privates": 0,
            "dojo-requirejs-api": 0,
            "dojo-sniff": 0,
            "dojo-sync-loader": 0,
            "dojo-test-sniff": 0,
            "dojo-timeout-api": 0,
            "dojo-trace-api": 0,
            "dojo-undef-api": 0,
            "dojo-v1x-i18n-Api": 1,
            "dom": 1,
            "host-browser": 1,
            "extend-dojo": 1
        },
 
        packages:[{
            name: "dojo",
            location: "dojo"
        },{
            name: "dijit",
            location: "dijit"
        },{
            name: "dojox",
            location: "dojox"
        }],
 
        layers: {
            "dojo/dojo": {
                include: [ "dojo/parser",
                 
                "dojo/window",
                "dojo/cookie",
                "dojo/_base/url",
                "dojo/string",
                "dojo/html",
                "dojo/fx",
                "dojo/regexp",
                "dojo/Stateful",
                "dojo/uacss",
                "dojo/cache",
                "dojo/hccss",
                
                "dojo/dnd/Moveable",
                "dojo/dnd/TimedMoveable",
                "dojo/dnd/common",
                "dojo/dnd/Mover",
                "dojo/dnd/autoscroll",
                
                
                "dojo/selector/lite",
                
                "dojo/promise/all",
                
                "dojo/date/stamp",
                
                "dojo/store/util/QueryResults",
                "dojo/store/util/SimpleQueryEngine",
                "dojo/store/Memory",

                
                "dijit/_base/manager",
                
                "dijit/layout/_TabContainerBase",
                "dijit/layout/TabController",
                "dijit/layout/ScrollingTabController",
                "dijit/layout/_ContentPaneResizeMixin",
                "dijit/layout/StackController",
                
                "dijit/layout/ContentPane",
                "dijit/layout/BorderContainer",
                "dijit/layout/TabContainer",
                "dijit/layout/AccordionContainer",
                "dijit/layout/LayoutContainer",
                "dijit/layout/StackContainer",
                "dijit/layout/_LayoutWidget",
                
                "dijit/layout/utils",
                
                "dijit/_WidgetBase",
                "dijit/_Widget",
                "dijit/_TemplatedMixin",
                "dijit/_Container",
                "dijit/_CssStateMixin",
                "dijit/a11yclick",
                "dijit/_Contained",
                "dijit/DropDownMenu",
                "dijit/place",
                "dijit/BackgroundIframe",
                "dijit/Viewport",
                "dijit/Destroyable",
                "dijit/_FocusMixin",
                "dijit/hccss",
                "dijit/_AttachMixin",
                "dijit/a11y",
                "dijit/_WidgetsInTemplateMixin",
                "dijit/_KeyNavContainer",
                
                
                "dijit/_MenuBase",
                "dijit/_DialogMixin",
                "dijit/_KeyNavMixin",
                "dijit/DialogUnderlay",
                "dijit/registry",
                "dijit/focus",
                "dijit/popup",
                "dijit/MenuItem",
                "dijit/MenuSeparator",
                "dijit/Dialog",
                "dijit/Tree",
                "dijit/_HasDropDown",
                "dijit/Tooltip",
                
                "dijit/form/_FormMixin",                
                "dijit/form/FilteringSelect",
                "dijit/form/CheckBox",
                "dijit/form/MappedTextBox",
                "dijit/form/ComboBoxMixin",
                "dijit/form/ToggleButton",
                "dijit/form/_CheckBoxMixin",
                "dijit/form/ValidationTextBox",
                "dijit/form/Button",
                "dijit/form/_AutoCompleterMixin",
                "dijit/form/_ComboBoxMenu",
                "dijit/form/_ToggleButtonMixin",
                "dijit/form/TextBox",
                "dijit/form/_FormWidget",
                "dijit/form/_ButtonMixin",
                "dijit/form/DataList",
                "dijit/form/_TextBoxMixin",
                "dijit/form/_SearchMixin",
                "dijit/form/_ComboBoxMenuMixin",
                "dijit/form/_ListMouseMixin",
                "dijit/form/_FormValueWidget",
                "dijit/form/_FormWidgetMixin",
                "dijit/form/_ListBase",
                "dijit/form/_FormValueMixin",
                
                
                "dijit/tree/TreeStoreModel",
                "dijit/tree/ForestStoreModel",
                "dijit/tree/_dndSelector",
                "dijit/tree/_dndContainer",
                
                "dojo/i18n", "dojo/domReady" 
                    
                
                ],
                customBase: true,
                boot: true
            }
        }
    };
})();
