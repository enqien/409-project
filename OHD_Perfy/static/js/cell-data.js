var load_data = function(ta) {
        li = ta.parent()
	var id = li.attr('id');
	$.post(
  	    "/perfy/cell_data_content",
	    {
		"id":	id,
	    },
	    function(json) {
                ta.val(json['data']);
	        //if(json['success']) {
		    //new_id = json['new_id'];
            	    //$('#testcasename').find('textarea').val(json['testcasename']);
                 //}
	    },
	    "json"
	);
}

$(document).ready(function(){
    $('li p').toggle(function(){
        ta = $(this).parent().find('textarea');
        dl = $(this).parent().find('a');
        if ( ta.val().trim().length == 0 ) {
            load_data(ta);
        }
        dl.show();
        ta.show();
    }, function() {
        ta.hide();
        dl.hide();
    })
});
