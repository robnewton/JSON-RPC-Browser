var conn = null;

jQuery(document).ready(function ($) {
	$('#tabs').tab();
	ConnectionHelper.init();
	Renderer.init();
	Renderer.initNavMenu();
	Renderer.loadSourceFromNewForm();
});


function filterMethods(element,what) {
    var value = $(element).val();
    value = value.toLowerCase().replace(/\b[a-z]/g, function(letter) {
        return letter.toUpperCase();
    });
    if(value == '') {
        $('#'+what+' > a').show();
		$("#method-count").html($('#'+what+' > a').length);
    }else{
        $('#'+what+' > a:not(:contains(' + value + '))').hide();
        $('#'+what+' > a:contains(' + value + ')').show();
		$("#method-count").html($('#'+what+' > a:contains(' + value + ')').length);
    }
};
