/** @module appConfig */

module.exports = {

	/**
	 * dojoBase //ajax.googleapis.com/ajax/libs/dojo/1.9.1   or   /scripts/dojo-release-1.9.1-src
	 * set to wherever you want the application to load dojo from (shouldn't really need changed unless you want to switch DOJO script inclusion to a different location).
	 **/
	dojoBase: "//ajax.googleapis.com/ajax/libs/dojo/1.9.1",

	/**
	 * theme is used to configure the dijit theme and body class name to use.
	 **/
	theme: "claro",

	/**
	 * Change your contextPath to suit whatever environment you are using e.g. if generating static docs for www.yourhost/yourapipath/index.html,
	 * change it to /yourapipath/ (or /dapi/public/ if you want to run from the node's app directory)
	 *
	 *  set to whatever environment you are running in. If you're generating static documentation this will be used as the context path for all API links
	 *  i.e. if your website's context is http://yourhost/yourcontext, static links will be generated for /yourcontext/1.8/dojo/Animation etc.
	 *  Running using your node app server the root context is /api
	 **/
	contextPath: "/api/",

	/**
	 * port is used to configure what port the app.js server runs on (as per usual you'll need to use sudo if using ports less than 1024)
	 **/
	port: 3000,

	/**
	 * defaultVersion to load when app.js runs or when using spider.js, the static version of docs which will be generated
	 **/
	defaultVersion: "1.9",

	/**
	 * versions is used to make available versions loadable for app.js i.e. the list of versions in the dropdown - these need to match the directory names
	 **/
	versions: ["1.3", "1.4", "1.5", "1.6", "1.7", "1.8", "1.9"],


	/**
	 * viewsDirectory used for extending/rebranding for your own UI needs. The default location is 'views', if you want to rebrand the application, copy the views directory to another and set the relevant name.
	 **/
	viewsDirectory: "views",

	/**
	 * moduleExtension is used to append a suffix to the module file name; it's unlikely you'll need to change this.
	 * This is used to ensure portability between app server and http server runtimes i.e. object/folder names won't clash with module names.
	 **/
	moduleExtension: ".html",

	refDocs: {
		enabled: true,

		/**
		 * dir - set to a local directory to search for reference documentation. You can set to an absolute path or relative to the api directory itself e.g. "reference-guide/"
		 **/
		dir: "../website/reference-guide/",

		/**
		 * url - set to a URL you want the reference document to point to. The version path will be added and module full path location e.g. "/reference-guide/1.9/dojo/_base/sniff". You can also use an absolute URL path.
		 **/
		url: "/reference-guide/",
		/**
		 * suffix - set to the file extension of the reference docs you want to locally search for.
		 **/
		suffix: ".html",

		/**
		 * suffixToGenerate - This is used to append a file extension to the module reference document URL to link to.
		 *      The only reason this is here, is if you want to generate static docs and output the ref guide links without actually exporting the ref guide to .html. The rst files a re 1-1 match with exported rst files, therefore just checking against the .rst files is enough
		 **/
		suffixToGenerate: ".html"
	},

	/**
	 * isDebug - set this to true to view any node.js express and application logging.
	 **/
	isDebug: true
};
