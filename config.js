/** @module appConfig */

module.exports = {

    /**
     * dojoBase //ajax.googleapis.com/ajax/libs/dojo/1.9.1   or   /scripts/dojo-release-1.9.1-src or '/dapi/staticoutput/scripts/dtk' '/api/scripts/dtk' etc
     * set to wherever you want the application to load dojo from (shouldn't really need changed unless you want to switch DOJO script inclusion to a different location).
     * Also sets the baseUrl config
     **/
    dojoBase: '//ajax.googleapis.com/ajax/libs/dojo/1.9.1',

    /**
     * theme is used to configure the dijit theme and body class name to use.
     **/
    theme: 'claro',

    /**
     * siteName is used in the title of the window
     **/
    siteName: ' - The Dojo Toolkit',

    /**
     * Change your contextPath to suit whatever environment you are using e.g. if generating static docs for www.yourhost/yourapipath/index.html,
     * change it to /yourapipath/ (or /dapi/staticoutput/ if you want to run from the node's app directory)
     *
     *  set to whatever environment you are running in. If you're generating static documentation this will be used as the context path for all API links
     *  i.e. if your website's context is http://yourhost/yourcontext, static links will be generated for /yourcontext/1.8/dojo/Animation etc.
     *  Running using your node app server the root context is /api
     **/
    contextPath: '/api/',

	/**
	 * Currently only used to write the <loc> url for the sitemap.xml
	 **/
	siteDomain: 'http://dojotoolkit.org',
    /**
     * port is used to configure what port the app.js server runs on (as per usual you'll need to use sudo if using ports less than 1024)
     **/
    port: 3000,

    /**
     * defaultVersion to load when app.js runs or when using spider.js, the static version of docs which will be generated
     **/
    defaultVersion: '1.10',

    /**
     * spiderVersions Array of versions to generate via spider.js
     **/
    spiderVersions : ['1.8', '1.9', "1.10"],

    /**
     * versions is used to make available versions loadable from app.js i.e. the list of versions in the version dropdown - these need to match the directory names
     * TODO: (maybe remove from tree.js, or if keeping, add a flag to enable this) Read and set the versions read from the available versions in the api directory
     **/
    versions: ['1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9', '1.10'],
    versionIgnores : /(\.git|\.md)/,


    /**
     * viewsDirectory used for extending/rebranding for your own UI needs. The default location is 'views', if you want to rebrand the application, copy the views directory to another and set the relevant name.
     **/
    viewsDirectory: 'views',

    /**
     * moduleExtension is used to append a suffix to the module file name; it's unlikely you'll need to change this.
     * This is used to ensure portability between app server and http server runtimes i.e. object/folder names won't clash with module names.
     **/
    moduleExtension: '.html',

    /**
     * bugdb link for reporting errors in the documentation, remove if this isn't necessary
     **/
    bugdb : 'https://docs.google.com/spreadsheet/viewform?hl=en_US&formkey=dFlDcHEyaHMwbEd4MFBObkNrX0E1MFE6MQ&entry_0=',

    refDocs: {
        enabled: true,

        /**
         * dir - set to a local directory to search for reference documentation. You can set to an absolute path or relative to the api directory itself e.g. 'reference-guide/'
         **/
        dir: '../website/reference-guide/',

        /**
         * url - set to a URL you want the reference document to point to. The version path will be added and module full path location e.g. '/reference-guide/1.9/dojo/_base/sniff'. You can also use an absolute URL path.
         **/
        url: '/reference-guide/',
        /**
         * suffix - set to the file extension of the reference docs you want to locally search for.
         **/
        suffix: '.html',

        /**
         * suffixToGenerate - This is used to append a file extension to the module reference document URL to link to.
         *      The only reason this is here, is if you want to generate static docs and output the ref guide links without actually exporting the ref guide to .html. The rst files a re 1-1 match with exported rst files, therefore just checking against the .rst files is enough
         **/
        suffixToGenerate: '.html'
    },
	/**
	 * rewrites for legacy HTML namespaced files which have objects with the same name as constructors
	 *      This is needed because some objects export their names with case insensitive/preserving issues
	 *      and this only works under the Linux OS. So these files need to be name-spaced out of the way.
	 *      This is likely never to be changed in future, it's a legacy issue, the generated document file names for legacy
	 *      were modified in https://github.com/wkeese/dojo-api-data which https://github.com/lbod/dojo-site-api uses.
	 *
	 *      Note that you do not specify a contextPath here, nor a carrot as it's configured in code.
	 *      Just specify the regex of the URL after the carrot and contextPath you expect.
	 */

	legacyNSReplacers : [{matcher:/(1.[3-7]\/dijit\/tree).html$/, replacer:'$1_ns.html'},
		{matcher:/(1.[3-7]\/dojox\/form\/)(manager|uploader).html$/, replacer:'$1$2_ns.html'},
		{matcher:/(1.[3-7]\/dojox\/form\/uploader)\/(.*)$/, replacer:'$1_ns/$2'},
		{matcher:/(1.[3-7]\/dojox\/gfx\/)(shape|path).html$/, replacer:'$1$2_ns.html'},
		{matcher:/(1.[3-7]\/dojox\/gfx\/)(shape|path)\/(.*)$/, replacer:'$1$2_ns/$3'},
		{matcher:/(1.[3-7]\/dojox\/grid).html$/, replacer:'$1_ns.html'},
		{matcher:/(1.[3-7]\/dojox\/grid\/selection).html$/, replacer:'$1_ns.html'},
		{matcher:/(1.[3-7]\/dojox\/grid\/enhanced\/plugins\/)(exporter|filter|pagination).html$/, replacer:'$1$2_ns.html'},
		{matcher:/(1.[3-7]\/dojox\/grid\/enhanced\/plugins\/)(exporter|pagination)\/(.*)$/, replacer:'$1$2_ns/$3'},
		{matcher:/(1.[3-7]\/dojox\/widget\/rotator).html$/, replacer:'$1_ns.html'}],

    /**
     * isDebug - set this to true to view any node.js express and application logging.
     **/
    isDebug: false
};
