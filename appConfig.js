/** @module apConfig.*/
var configobject = {};
/**
 * dojoBase //ajax.googleapis.com/ajax/libs/dojo/1.8.3   or   /scripts/dojo-release-1.8.3-src
 * set to wherever you want the application to load dojo from (shouldn't really need changed unless you want to switch DOJO script inclusion to a different location). 
**/
configobject.dojoBase = "//ajax.googleapis.com/ajax/libs/dojo/1.8.3";

// dijit theme to use to style the app
configobject.theme = "claro";

// details.json file to use
configobject.detailsFile = "./public/scripts/version/details.json";

/**
 * Change your contextPath to suit whatever environment you are using e.g. if generating static docs for www.yourhost/yourapipath/index.html,  
 * change it to /yourapipath/ (or /dapi/public/ if you want to run from the node's app directory)
 *
 *  set to whatever environment you are running in. If you're generating static documentation this will be used as the context path for all API links 
 *  i.e. if your website's context is http://yourhost/yourcontext, static links will be generated for /yourcontext/1.8/dojo/Animation etc. 
 *  Typically running using your node app server the context path will be / (the default is /).
**/
configobject.contextPath = "/";

configobject.port = 3000;

/**
 * defaultVersion to load when app.js runs or when using spider.js, the version which will be generated 
**/
configobject.defaultVersion = "1.8";

/**
 * versions to make available to load for app.js i.e. the list of versions in the dropdown - these need to match the directory names
**/
configobject.versions = ["1.6", "1.7", "1.8", "1.9rc2"];

configobject.apiDataPath = "api";


/**
 * this is for extending/rebranding for your own UI needs. The default location is 'views', if you want to rebrand the application, copy the views directory to another and set the relevant name. 
**/
configobject.viewsDirectory = "views";

configobject.moduleExtension = ".html";

/**
 * refDocs.dir - set to a local directory to search for reference documentation. You can set to an absolute path or relative to the app directory itself e.g. "reference-guide/"
 * refDocs.url - set to a URL you want the reference document to point to. The version path will be added and module full path location e.g. "/reference-guide/1.9/dojo/_base/sniff". You can also use an absolute URL path.
 * refDocs.suffix - set to the file extension of the reference docs you want to locally search for. This is also used to append a file extension to the module reference document URL to link to     
**/
configobject.refDocs = {};
configobject.refDocs.enabled = true;
configobject.refDocs.dir = "reference-guide/";
configobject.refDocs.url = "/reference-guide/";
configobject.refDocs.suffix = ".rst";

/**
 * isDebug - set this to true to view any express logging. 
**/
configobject.isDebug =  false;


exports.appConfig = configobject;