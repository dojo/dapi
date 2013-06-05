dapi
====

Node.js/JavaScript DOJO API viewer and static API viewer document generator

Why is this library special?
----------------------------
It's not, well not compared to the original code it was ported from.  
The original API viewer is [here](https://github.com/wkeese/api-viewer) (also, many thanks to [wkeese](https://github.com/wkeese) for writing the dapi exporter for js-doc-parse which makes loading and parsing a breeze compared to loading/parsing XML).  
  
This repository is *just a port of the existing PHP code to node.js*, however it's main aims are to remove the PHP dependency for viewing API docs and leverage node.js instead (eat what you preach), make it simpler to change the UI (templating, separating logical UI code from the data) and be able to generate a *static output* of the API documentation if needed.

You want to use this if:
----------------------------
* You want to host the DOJO API documentation yourself.
* You want to host and display your own API documentation as well as the DOJO API docs.
* You can't host a node.js app server to view API documentation.
   * dapi can generate static html so you can host the API documentation through apache etc instead  (without PHP).
* You want to *brand* the API viewer for your own needs, or even completely alter markup generation to something entirely different.

Tools you'll need:
------------------
* git 
* node (0.8 > 0.10 currently tested)
* npm
* exported versions of details.json and tree.json which dojo's [js-doc-parse](https://github.com/wkeese/js-doc-parse) application exports

####Windows users####
This is outside the scope of this repository but may be helpful to unfortunate __Windows__ users and those stuck in corporate environments:

1.   If you're using git you really should be using msysGit (https://github.com/msysgit/msysgit/wiki and http://code.google.com/p/msysgit/downloads/list?q=net+installer).
    *   If you're not using msysGit, you really, really should 
2.   If you use NTLM authentication for your firewalls and your corporates have issues with how GIT and npm authenticate, it's worth considering CNTLM (http://cntlm.sourceforge.net/)

Installation:
------
Clone the repository into a dapi directory, open a terminal/CMD(mysysGit shell)

    git clone --recursive https://github.com/lbod/dapi.git

cd into the *dapi* directory and install the dependencies  

    npm install --production

You need to create directories in `public/api/{version}` and copy the exported details.json and tree.json files from dojo's js-doc-parse for each version you want to view. 
The `version` name of the directory must match the configuration you provide (see below).


Running:
--------
There are two ways to run this application however it's likely you'll need to change configuration of the application to meet your needs (which is explained in the next section):

### app.js ###
Use __app.js__ when you want to run the API viewer using node and view over HTTP using Node.js express/jade. The application by default can be viewed in a browser at http://localhost:3000

You don't need to generate any static docs, only details.json and tree.json are needed which are exported by dojo's js-doc-parse application (however as explained, you will still need to include static HTML files for legacy doc versions if you want to also view 'legacy' docs)

Running the node.js app server API viewer

    node app.js

### spider.js ###
Use __spider.js__ when you want to generate static documentation HTML files (so you can view using any HTTP server). The files will be generated in the `public/api/{version}` directory where the specified details.json and tree.json are located

You copy the output HTML docs to whatever HTTP server you use.

Generating HTML docs for static viewing

    node spider.js


Configuration:
--------------
This configuration covers 2 uses (explained below), app server runtime and static generation.  
<pre>appConfig.json</pre> You should edit this for your own needs. A JSON object is exported and used by the application, comments on it's usage can also be found in the source. 

    {
       "contextPath" : "/",
       "theme" : "claro"
       "dojoBase" : "//ajax.googleapis.com/ajax/libs/dojo/1.8.3",
       "port" : 3000,
       "defaultVersion" : "1.8",
       "versions" : ["1.6", "1.7", "1.8", "1.9rc2"],
       "apiDataPath" : "api",
       "viewsDirectory" : "views",
       "moduleExtension" : ".html",
       "refDocs" : {
          "enabled" : true,
          "dir" : "reference-guide/",
          "url" : "/reference-guide/",
          "suffix" : ".rst"
       },
       "isDebug" : false
    }

* `contextPath` - set to whatever environment you are running in. If you're generating static documentation this will be used as the context path for all API links i.e. if your website's context is http://yourhost/yourcontext, static links will be generated for /yourcontext/1.8/dojo/Animation etc. Typically running using your node app server the context path will be / (the default is /).

* `theme` - set to whatever DIJIT theme you need (default is claro).

* `dojoBase` - set to wherever you want the application to load dojo from (shouldn't really need changed unless you want to switch DOJO script inclusion to a different location).

* `port` - set to whatever you choose (relevant only to the node.js app server, the default is 3000).

* `defaultVersion` - set to the version tree.json that should be loaded when the root API viewer page is loaded.

* `versions` - set to an array of API documents which exist as a path in public/api/ (only the details.json and tree.json files are needed, for legacy API versions the whole HTML tree is needed as well as tree.json, it is expected you will have generated static HTML docs for any legacy versions i.e. < 1.8).

* `viewsDirectory` - this is for extending/rebranding for your own UI needs. The default location is 'views', if you want to rebrand the application, copy the views directory to another and set the relevant name.

* `moduleExtension` - (this probably not needed) provide a file extenstion for HTTP requests for modules e.g. 1.8/dijit/_base.html. This allows easier HTTP server integration i.e. using apache - meaning folder object names don't clash with actual file names.

* __reference documents__
  * `refDocs.enabled` - set to false to switch off reference docs

  * `refDocs.dir` - set to a local directory to search for reference documentation. You can set to an absolute path or relative to the app directory itself e.g. *"reference-guide/"*

  * `refDocs.url` - set to a URL you want the reference document to point to. The version path will be added and module full path location e.g. *"/reference-guide/1.9/dojo/_base/sniff"*. You can also use an absolute URL path.

  * `refDocs.suffix` - set to the file extension of the reference docs you want to locally search for. This is also used to append a file extension to the module reference document URL to link to.

* `isDebug` - set this to true to view any express logging. 



Legacy API documentation:
-------------------------
The documentation parser for DOJO was redeveloped after version 1.7 and the previous API viewer relied on the legacy documentation parser's output. The PHP API viewer also contained a *spider* option; it's function was to create static API documentation for *offline* viewing e.g. no app server.
This application does not intend to support generating API documentation for legacy i.e. pre 1.8, versions of DOJO. It will however, support __viewing__ legacy versions of API documentation.  
There is therefore a caveat if you need to provide API docs for *legacy* versions, you must generate them with the legacy API viewer and manually copy them to API directory. This viewer (the node.js viewer) is configurable such that context paths can be configured according to your requirements, however if you need to use legacy API docs you will have to generate them first (using the PHP viewer) with the correct context path.


Editing/theming:
-----------------
Jade Views are constructed such like (give an example showing the structure of templates including any data dependencies):

Spider option:
--------------
When 'spidering', only the *defaultVersion* will be generated, so update this to whatever version you need (if users want to generate all versions at the same time, please request this as an enhancement)  
'Spidering' will create the default index HTML file as `/public/staticapi.html`. If it were named `/public/index.html` express would load this instead of index.jade.  I've therefore renamed it in case you are generating static docs and viewing them in the dapi repository whilst also needing to use the API viewer.

When you've created all the static HTML you need, simply copy ALL of the contents of the public directory to wherever you need.

Notes for reference guide document linking
------------------------------------------
The API viewer tries to automatically generate links from an API page to the corresponding reference page (if it exists), for example, a link from the API page for dijit/Dialog to the reference doc of dijit/Dialog.

Currently this application follows the same logic of the PHP API viewer i.e. it reads local directories to see if a reference document exists.
This means if you generate __static__ docs using `spider.js`, the reference docs must exist locally otherwise the reference doc links will not be generated.

Using `app.js`, the reference docs are searched for at runtime; again this means they need to exist on the local file system.

This application provides the same configuration to configure a root directory of ref docs to search, file extensions of docs to search for and a URL path to point links of the reference guide to.
> The logic behind this code is dealing with inconsistencies between reference documents and defined modules/objects in the API, ideally there would be a matching reference document for every module/object however that is not the current situation.  

The generated URL (if the refDoc exists) is of the form (generated in `views/module.jade`):

    #{config.refDocs.url + module.version + "/" + refDoc + config.refDocs.suffix}

Using `refDocs.url` configuration you can point reference guide doc links to where ever you choose e.g.

    refDocs.url : "//dojotoolkit.org/reference-guide/"

Which would render:

    http://dojotoolkit.org/reference-guide/#{module.version}/dijit/_Calendar#{refDocs.suffix}


Browser compatibility:
----------------------
This has been tested under the latest Chrome and Firefox browsers, it is expected browser support will not have changed from the PHP viewer.  
Limited IE testing has been performed with IE8/9 (but not IE10), however we all know MS browsers suck and *savvy* developers really shouldn't care about them either.  
  
If you find any IE UI bugs, please report them (though it's not guaranteed I'll give a ****).







