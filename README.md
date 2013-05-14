dapi
====

Node.js JavaScript DOJO API viewer and API document generator

Why is this library special?
----------------------------
It's not, well not compared to the original code it was ported from. The original API viewer is [here](https://github.com/wkeese/api-viewer).
This respository is *just a port of the exisiting php code to node.js*, however it's main aims are to remove the php dependency for viewing API docs and leverage node.js instead (eat what you preach), make it simpler to change the UI (templating) and be able to generate a *static output* of the API documentation if needed.

You want to use this if:
----------------------------
* You want to host the DOJO API documentation yourself
* You want to host and display your own API documentation as well as the DOJO API docs
* You can't host a node.js app server to view API documentation
   * dapi can generate static html so you can host the API documentation through apache etc instead


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


Running:
--------
Running the node.js app server viewer

    node app.js

Generating HTML docs

    node spider.js


Editting/theming:
-----------------
Jade Views are constructed such like:


TODO:
------

1. module contentpane link loading
2. html extension handling for app/static server
3. Code cleanup & refactor
4. docs

