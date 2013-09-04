jQuery(document).ready(function ($) {
	$('#tabs').tab();
	ConnectionHelper.init();
	Renderer.init();
	Renderer.initNavMenu();

    /** 
        Case insensative search
        Source: http://css-tricks.com/snippets/jquery/make-jquery-contains-case-insensitive/
     **/
    $.expr[":"].contains = $.expr.createPseudo(function(arg) {
        return function( elem ) {
            return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
        };
    });
	
    //TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST
    Renderer.loadSourceFromNewForm();
    //TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST
});
