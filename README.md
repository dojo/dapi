dapi
====

Node.js JavaScript DOJO API viewer and API document generator

Why is this library special?
----------------------------
It's not, well not compared to the original code it was ported from.  
The original API viewer is [here](https://github.com/wkeese/api-viewer) (also, many thanks to [wkeese](https://github.com/wkeese) for writing the dapi exporter for js-doc-parse which makes loading and parsing a breeze compared to loading/parsing XML).  
  
This respository is *just a port of the exisiting php code to node.js*, however it's main aims are to remove the php dependency for viewing API docs and leverage node.js instead (eat what you preach), make it simpler to change the UI (templating, seperating logical UI code from the data) and be able to generate a *static output* of the API documentation if needed.

You want to use this if:
----------------------------
* You want to host the DOJO API documentation yourself
* You want to host and display your own API documentation as well as the DOJO API docs
* You can't host a node.js app server to view API documentation
   * dapi can generate static html so you can host the API documentation through apache etc instead  (without php)


Installation:
------

    git clone --recursive https://github.com/lbod/dapi.git
  

Configuration:
--------------
    {"contextPath" : "/",
       "port" : 3000,
       "defaultVersion" : "1.8",
        "versions" : ["1.6", "1.7", "1.8", "1.9rc2"],
        "apiDataPath" : "api"
    }

* set the contextPath to whatever environment you are running in. If you're generating static documenation this will be burned into the path for all links i.e. if your websites context is http://yourhost/yourcontext, static links will be generated for /yourcontext/1.8/dojo/Animation etc. Typically running using your node app server the context path will be /

* set the port to whatever you choose (relevant only to the node.js app server)

* set the defaultVersion to the version tree.json that should be loaded when the root API viewer page is loaded

* set versions to an array of API documents which exist as a path in public/api/ (only the details.json and tree.json files are needed, for legacy API versions the whole HTML tree is needed as well as tree.json, it is expected you will have generated static HTML docs for any legacy versions i.e. < 1.8)

Legacy API documentation:
-------------------------
This viewer is intended to replace the php API viewer, however the documentation parser for DOJO was redeveloped after version 1.7 and the previous API viewer relied on the legacy documentation parser output. The php API viewer also contained a *spider* option, it's function was to create static API documentation for *offline* viewing e.g. no app server.  
This application does not intend to support generating API documentation for legacy i.e. pre 1.8, versions of DOJO. It will however, support viewing legacy versions of API documentation.  
There is therefore a caveat if you need to provide API docs for *legacy* versions, you must generate them with the legacy API viewer and manually copy them to API directory. This viewier (the node.js viewer) is configurable such that context paths can be configured according to your requirements, however if you need to use legacy API docs you will have to generate them (using the php viewer) with the correct context path. 


Running:
--------
Running the node.js app server API viewer

    node app.js

Generating HTML docs for static viewing

    node spider.js


Editting/theming:
-----------------
Jade Views are constructed such like (give an example showing the structure of templates including any data dependencies):

Browser compatability:
----------------------
This has been tested under the latest Chrome and Firefox browsers, it is expected browser support will not have changed from the PHP viewer.  
Limited IE testing has been performed with IE8/9 (but not IE10), however we all know MS browsers suck and *savvy* developers really shouldn't care about them either.  
  
If you find any IE UI bugs, please report them (though it's not guaranteed I'll give a ****).

TODO:
------

1. module contentpane link loading
2. html extension handling for app/static server
3. Code cleanup & refactor
4. Add configuration to extend/replace existing JADE templates
5. docs


