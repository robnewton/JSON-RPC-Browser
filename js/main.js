jQuery(document).ready(function ($) {
	$('#tabs').tab();
	ConnectionHelper.init();
	Renderer.init();
	Renderer.initNavMenu();
	
    //TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST
    Renderer.loadSourceFromNewForm();
	$('#'+Renderer.tryitFormId).submit(function() {
        return FormBuilder.handleFormSubmit();
    });
    $('.bs-docs-container [href=#]').click(function (e) {
      e.preventDefault()
    });
    //TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST
});
