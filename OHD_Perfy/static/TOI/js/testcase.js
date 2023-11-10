var orig_id, new_id;
var auto_save_timer = null;
var repeat_interval = 10000; // milliseconds
var is_modified = false;
var bypass_close_confirmation = false;

var fnTestCaseDiscard = function(closing) {
	bypass_close_confirmation = true;
	var id = $('#testcaseid').attr('value');
	var $csrf_token = $('#csrf_token').attr('value');
	if(closing || confirm("Discard all changes and auto-saves permanently since last save?")) {
		$('.status-bar').text("Discarding...");
		$.post(
			"/discard_tc",
			{
				"testcaseid":	id,
           		"csrfmiddlewaretoken": $csrf_token
			},
			function(json) {
				//$('.status-bar').text("Discarded all uncommitted changes successfully");
				window.location.reload(true);
			},
			"json"
		);
	}
}

function auto_save() {
	var id = $('#testcaseid').attr('value');
	var $csrf_token = $('#csrf_token').attr('value');
	$('.status-bar').text("Auto saving...");
	$.post(
		"/auto_save_tc",
		{
           	"testcasename":	$('#testcasename').find('textarea').val(),
			"revcomments": 	$('#revcomments').find('textarea').val(),
			"testcaseid":	$('#testcaseid').attr('value'),
			"procedure":	$('#procedure').find('textarea').val(),
			"passfail":		$('#passfail').find('textarea').val(),
			"purpose": 		$('#purpose').find('textarea').val(),
			"setup": 		$('#setup').find('textarea').val(),
			"rev": 			$('#rev').find('select').val(),
			"setup_days":   $('#setuptime .days option:selected').val(),		
			"setup_hours":  $('#setuptime .hours option:selected').val(),		
			"setup_minutes": $('#setuptime .minutes option:selected').val(),		
			"run_days":   	$('#runtime .days option:selected').val(),		
			"run_hours":  	$('#runtime .hours option:selected').val(),		
			"run_minutes": 	$('#runtime .minutes option:selected').val(),		
           		"csrfmiddlewaretoken": $csrf_token
		},
		function(json) {
			is_modified = true;
			$('#updater .field-value-td > span').text(window.opener.user);
 			$('.status-bar').text("Auto saved on: "+json['modified']);
			$('.modified-bar').show().text("WARNING: Testcase has been modified on: "+json['modified']);
		},
		"json"
	);
}

function clear_modified() {
	$('.status-bar').text("");
}

$(document).ready(function(){
	readjust();
	$(window).resize(function() {
		readjust();
	});
	$('.field-value').autoResize();
	
	if(!user_active && !is_owner && !is_superuser) {
		$('#button-div').hide();
		$('select').attr('disabled','disabled');
		return;
	}
	$('.field-value').removeAttr('readOnly');
	$('.field-value')
		.focus(function(){
			$(this).closest('.field-value-td').addClass('edit');
			// Enable auto-saving;
			clearInterval(auto_save_timer);
			//auto_save();
			auto_save_timer = setInterval(function () {
				auto_save();
			},repeat_interval);
		})
		.blur(function(){ 
			// Disable auto-saving;
			$(this).closest('.field-value-td').removeClass('edit');
			clearInterval(auto_save_timer);
			auto_save();
			setTimeout(clear_modified ,repeat_interval);
		});
	$('#setuptime, #runtime').find('select').change(function(){
		auto_save();
	});
	$('#rev').find('select').change(function(){
		new_rev = $(this).val();
		fn_load_tc(new_rev);
	});
	orig_id = $('#testcaseid').attr('value');
	new_id = $('#testcaseid').attr('value');

	// Confirm uncommitted changes before window is closed
	$(window).bind('beforeunload', function(e) {
		if(is_modified && !bypass_close_confirmation) {
			if(confirm("WARNING: TestCase has been modified. Discard changes?"))	{
				fnTestCaseDiscard(true);
			}else{
				return 'WARNING: Leaving will discard changes.';
			}
		}
		fnTestCaseDiscard(true);
	});
});

var fn_load_tc = function(new_rev) {
	var id = $('#testcaseid').attr('value');
	var $csrf_token = $('#csrf_token').attr('value');
	$.post(
		"/get_tc_by_rev",
		{
			"testcaseid":		id,
			"new_rev":	new_rev,
			"csrfmiddlewaretoken": $csrf_token
		},
		function(json) {
			if(json['new_id'] > 0) {
				new_id = json['new_id'];
            			$('#testcasename').find('textarea').val(json['testcasename']);
				$('#revcomments').find('textarea').val(json['revcomments']);
				$('#procedure').find('textarea').val(json['procedure']);
				$('#passfail').find('textarea').val(json['passfail']);
				$('#purpose').find('textarea').val(json['purpose']);
				$('#setup').find('textarea').val(json['setup']);
				window.location.href='/testcase/'+json['new_id'];
			}
		},
		"json"
	);
}

var readjust = function() {
	$('.field-value').each(function() {
		$(this).keydown();
		$(this).width($(window).width() - $('.field-header-td').width() - 60);
	});
}

var fnTestCaseSave = function() {
	bypass_close_confirmation = true;
	if(orig_id != new_id) {
		pid = $(window.opener.document).find('#product-name').attr('product_id');
		var $csrf_token = $('#csrf_token').attr('value');
		$.post(
			"/update_pid_tc_rev",
			{
				"pid": pid,
				"old_id": orig_id,
				"new_id": new_id,
				"csrfmiddlewaretoken": $csrf_token
			},
			function(json){
			},
			"json"
		);
		window.opener.location.reload(true);
		window.close();
	}else{
		var $csrf_token = $('#csrf_token').attr('value');
		//auto_save();
		$.ajax({
			type: "POST",
			url: "/save_tc",
			dataType: "json",
			timeout: TIMEOUT,
			error: function(req, s, err) {
				if(s == "timeout") {
					when_ajax_timeout();
				}
			},
			data: {
            			"testcasename":	$('#testcasename').find('textarea').val(),
				"revcomments": 	$('#revcomments').find('textarea').val(),
				"testcaseid":	$('#testcaseid').attr('value'),
				"procedure":	$('#procedure').find('textarea').val(),
				"passfail":		$('#passfail').find('textarea').val(),
				"purpose": 		$('#purpose').find('textarea').val(),
				"setup": 		$('#setup').find('textarea').val(),
				"rev": 			$('#rev').find('select').val(),
            			"csrfmiddlewaretoken": $csrf_token
        	},
			success: function(data){
				// Update Testcase Panel tree if exists
				if($(window.opener.document).find('.tc-tree-panel').length > 0) {
					// Update testcasename (since now topmost rev)
					li_leaf = $(window.opener.document).find('.tc-tree-panel li[id='+
								$('#testcaseid').attr('value')+']');
					//li_leaf.find('a:first .tc-name').html($('#testcasename').find('textarea').val());
					new_name = $('#testcasename').find('textarea').val();
					if(li_leaf.find('a:first .tc-name').length > 0) {
						li_leaf.find('a:first .tc-name').html(new_name);
					}else{
						li_leaf.find('a:first').html(new_name);
					}
				}

				// Update Testmatrix if exists
				if(window.opener.permission == 1 && $(window.opener.document).find('.list-tree-panel').length > 0) {
					// Update testcasename (since now topmost rev)
					li_leaf = $(window.opener.document).find('.list-tree-panel li[id='+
								$('#testcaseid').attr('value')+']');
					new_name = $('#testcasename').find('textarea').val();
					if(li_leaf.find('a:first .tc-name').length > 0) {
						li_leaf.find('a:first .tc-name').html(new_name);
					}else{
						li_leaf.find('a:first').html(new_name);
					}
				}
				window.location.reload(true);
			}
		});
	}
}

var fnTestCaseFork = function() {
		if(!confirm("This will save a new revision to the current test case. Continue?"))
			return;
		bypass_close_confirmation = true;
		var $csrf_token = $('#csrf_token').attr('value');
		$.ajax({
			type: "POST",
			url: "/fork_tc_rev",
			dataType: "json",
			timeout: TIMEOUT,
			error: function(req, s, err) {
				if(s == "timeout") {
					when_ajax_timeout();
				}
			},
			data: {
            			"testcasename":	$('#testcasename').find('textarea').val(),
				"revcomments": 	$('#revcomments').find('textarea').val(),
				"testcaseid":	$('#testcaseid').attr('value'),
				"procedure":	$('#procedure').find('textarea').val(),
				"passfail":		$('#passfail').find('textarea').val(),
				"purpose": 		$('#purpose').find('textarea').val(),
				"setup": 		$('#setup').find('textarea').val(),
				"rev": 			$('#rev').find('select').val(),
            			"csrfmiddlewaretoken": $csrf_token
        		},
			success: function(data){
				// Update Testcase Panel tree if exists
				if($(window.opener.document).find('.tc-tree-panel').length > 0) {
					// Update testcasename (since now topmost rev)
					li_leaf = $(window.opener.document).find('.tc-tree-panel li[id='+
								$('#testcaseid').attr('value')+']');
					li_leaf.attr('id',data['new_id']);

					new_name = $('#testcasename').find('textarea').val();
					if(li_leaf.find('a:first .tc-name').length > 0) {
						li_leaf.find('a:first .tc-name').html(new_name);
					}else{
						li_leaf.find('a:first').html(new_name);
					}
				}

				// Update Testmatrix if exists
				if(window.opener.permission == 1 && $(window.opener.document).find('.list-tree-panel').length > 0) {
					// Update testcasename (since now topmost rev)
					li_leaf = $(window.opener.document).find('.list-tree-panel li[id='+
								$('#testcaseid').attr('value')+']');
					li_leaf.attr('id',data['new_id']);
					//li_leaf.find('a:first .tc-name').html($('#testcasename').find('textarea').val());

					new_name = $('#testcasename').find('textarea').val();
					if(li_leaf.find('a:first .tc-name').length > 0) {
						li_leaf.find('a:first .tc-name').html(new_name);
					}else{
						li_leaf.find('a:first').html(new_name);
					}

					// Update all Testmatrix cells corresponding to this testcase
					window.opener.commit_update_tc($('#testcaseid').attr('value'),data['new_id']);	
				}
				
				window.location.href="/testcase/"+data['new_id'];
			}
		});
}

var fnTestCaseClone = function() {
		if(!confirm("This will create a *new* test case based on data provided. Continue?"))
			return;
		bypass_close_confirmation = true;
		var $csrf_token = $('#csrf_token').attr('value');
		$.ajax({
			type: "POST",
			url: "/clone_tc_rev",
			dataType: "json",
			timeout: TIMEOUT,
			error: function(req, s, err) {
				if(s == "timeout") {
					when_ajax_timeout();
				}
			},
			data: {
            			"testcasename":	$('#testcasename').find('textarea').val(),
				"revcomments": 	$('#revcomments').find('textarea').val(),
				"testcaseid":	$('#testcaseid').attr('value'),
				"procedure":	$('#procedure').find('textarea').val(),
				"passfail":		$('#passfail').find('textarea').val(),
				"purpose": 		$('#purpose').find('textarea').val(),
				"setup": 		$('#setup').find('textarea').val(),
				"rev": 			$('#rev').find('select').val(),
            			"csrfmiddlewaretoken": $csrf_token
        	},
			success: function(data){
				// Update Testcase Panel tree if exists
				if($(window.opener.document).find('.tc-tree-panel').length > 0) {
					// Update testcasename (since now topmost rev)
					li_leaf = $(window.opener.document).find('.tc-tree-panel li[id='+
								$('#testcaseid').attr('value')+']');
					li_leaf_clone = li_leaf.clone();
					li_leaf_clone.attr('id',data['new_id']);

					new_name = $('#testcasename').find('textarea').val();
					if(li_leaf_clone.find('a:first .tc-name').length > 0) {
						li_leaf_clone.find('a:first .tc-name').html(new_name);
					}else{
						li_leaf_clone.find('a:first').html(new_name);
					}
					
					$(li_leaf_clone).find('.tm-ref').text("(0)");
					li_leaf_clone.find('a:first').addClass('tm-ref-0');
					$(li_leaf_clone).insertAfter(li_leaf);
					window.opener.add_tc_handlers(li_leaf_clone);
				}

				// Update Testmatrix if exists
				if(window.opener.permission == 1 && $(window.opener.document).find('.list-tree-panel').length > 0) {
					// Clone new testcase in Testmatrix cells corresponding to this testcase
					window.opener.commit_clone_tc($('#testcaseid').attr('value'),data['new_id'],
										$('#testcasename').find('textarea').val());	
				}
				
				window.location.href="/testcase/"+data['new_id'];
			}
		});
}

