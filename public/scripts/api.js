require([
	"dojo/parser",
	"dojo/ready",
	"dijit/layout/BorderContainer",
	"dijit/layout/TabContainer",
	"dijit/layout/ContentPane",
	"dijit/layout/AccordionContainer"	
], function(parser, ready, BorderContainer, TabContainer, ContentPane, AccordionContainer){
    
    ready(function(){
        parser.parse();
    });
});

