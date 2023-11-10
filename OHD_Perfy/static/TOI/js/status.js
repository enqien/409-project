results_visited = {}
min = -1;

var fn_get_next_id_ = function() {
	return min--;
}

function init_read_only_user_action_handlers() {
    $('.r-td').find('a').live('click',function(e){
		$this = $(this);
        e.preventDefault();
        id = $(this).closest('tr[kind=entry]').attr('id');
	div = $('tr[id=summary-tr][resultid='+id+']').find('#summary');
		if(!div.is(":visible")) {
			get_results(id);
		}

		div.slideToggle(200,function() {
			if(div.is(":visible")) {
				autoResizeMe(id);
			}else{
				div.find('textarea').each(function(){
					$(this).val("");
				});
				div.find('#results-title').find('.r-value').val($this.attr('orig'));
				$this.html($this.attr('orig'));
			}
		});
		summary_readjust_id(id);
		//summary_readjust();
	    return false;
    });
}

function init_limited_user_action_handlers() {
	// ADD: Append result to existing status(es)
	$('#status_div').find('#add').show();
	$('#status_div').find('#add').live({
		click: function(e){
			tr = $('#status_div_template').find('tr[kind=entry]').clone();	
			tr_summary = $('#status_div_template').find('tr[kind=summary]').clone();
	
			$(tr).insertAfter($('#status_div > table').find('tr[subkind=status-entry]:last'));
			$(tr_summary).insertAfter($('#status_div > table').find('tr[subkind=status-entry]:last'));
		
			format_new_result_row(tr,tr_summary);
		}
	});

	// DELETE: Append result to existing status(es)
	$('#status_div').find('#delete').show();
	$('#status_div').find('#delete').live({
		click: function(e){
			if(!confirm("Are you sure you want to delete this result?"))
				return;
			delete_count = 0;
			delete_arr = [];
			$('#status_div').find('#check:checked').each(function(){
				resultid=$(this).closest('tr[kind=entry]').attr('id');

				result_owner = $('#status_div').find('tr[kind=entry][id='+resultid+'] .r-td:eq(3)').text();
				result_title = $('#status_div').find('tr[kind=entry][id='+resultid+'] .r-td:eq(1)').text();
				// TTD 1524     Access denied to "System" results -- Add "System" to all access list.
				if(result_owner.indexOf("Anonymous") < 0 && result_owner.indexOf("System") && !superuser && user.indexOf(result_owner) < 0) {
					alert("Access Denied: Not owner of test result \""+result_title+"\"");
					return;
				}

				statusid=$('#status_div').find('tr[kind=summary][resultid='+resultid+']').attr('statusid');
				data = '{ "resultid": \"'+resultid+'\",'+
					     '"statusid": \"'+statusid+'\" }';
				delete_arr.push(data);
				delete_count++;
			});
			if(delete_count > 0) {
				var $csrf_token = $('#csrf_token').attr('value');
    				$.post(
					"/results_delete",
					{
						"data": '['+delete_arr.join()+']',
						"csrfmiddlewaretoken": $csrf_token
					},
					function(json) {
						window.opener.document.location.reload();
						window.location.reload();
					},
					"json"
				);
			}
		}
	});

	// ADD(new): Add result to EMPTY status
	$('#button-div-new').find('#add_new').show();
	$('#button-div-new').find('#add_new').click(function(){
		status_div = $('#status_div_template').clone();
		$('#status_div').remove();
		$('#button-div-new').remove();
		$(status_div).insertAfter($('#atr'));
		status_div.show();

		status_div.attr('id','status_div');

		tr = status_div.find('tr[kind=entry]:last');
		tr_summary = status_div.find('tr[kind=summary]:last');
		
		format_new_result_row(tr,tr_summary);
	});

	// Optional keyup stuff
	$('#status_div').find('#results-title').find('textarea').live({
		keyup: function() {
			resultid = $(this).closest('tr[id=summary-tr]').attr('resultid');
			title = $(this).val();
			$('#status_div').find('tr[id='+resultid+']').find('a').html(title);
		}
	});

	
	// ##########  STATUS DIV - Result handling
	//
	
	// "Save":
	$('#status_div').find('#r-save').show()
	$('#status_div').find('#r-save').live({
			click: function(){
				var $csrf_token = $('#csrf_token').attr('value');
				summary_tr = $(this).closest('#summary-tr');
				if(summary_tr.find('#results-bugid').find('textarea').val().length > 80) {
					alert("Bug ID field exceeds 80 characters. Please try again.");
					return;
				}
    			$.post(
					"/results_save",
					{
						"statusid" : summary_tr.attr('statusid'),
						"resultid" : summary_tr.attr('resultid'),
						"testmatrixid"	: $('#testmatrixid').attr('value'),
						"title": summary_tr.find('#results-title').find('textarea').val(),
						"results": summary_tr.find('#results-results').find('textarea').val(),
						"bugid": summary_tr.find('#results-bugid').find('textarea').val(),
						"systeminfo": summary_tr.find('#results-systeminfo').find('textarea').val(),
						"comments": summary_tr.find('#results-comments').find('textarea').val(),
						"status": summary_tr.find('#results-status').find('select').val(),
						"csrfmiddlewaretoken": $csrf_token
					},
					function(json) {
						window.opener.document.location.reload();
						window.location.reload();
					},
					"json"
				);
			}
	});

	// "Discard":
	$('#status_div').find('#r-discard').show()
	$('#status_div').find('#r-discard').live({
			click: function(){
				id = $(this).closest('#summary-tr').attr('resultid');
				status_div = $(this).closest('#status_div');
				status_div.find('tr[id='+id+']').find('a').click();
			}
	});
}

function init_exclusive_user_action_handlers() {
	$('.summary').find('textarea').live({
		focus: function(e) {
        	e.preventDefault();
			$(this).addClass('edit');	
			$(this).removeAttr('readonly');
		},
		blur: function(e) {
        	e.preventDefault();
			$(this).removeClass('edit');	
		}
	});

	$('#priority .field-value, #owner .field-value, #calcstatus .field-value').addClass('editable');
	$('#duedate .field-value, #completedte .field-value').addClass('editable');
	// Priority, Owner, Status "list" fields
	$('#priority .field-value-td, #owner .field-value-td, #calcstatus .field-value-td').find('label').click(function(){
		$(this).closest('tr').find('select').show().focus();
		$(this).hide();
	});
	
	$('#priority, #owner, #calcstatus').find('select').blur(function(){
		$(this).hide();
		$(this).closest('tr').find('.field-value').show();
	});

	// Due Date, COmplete Date "date" fields
	$('#duedate .field-value-td, #completedte .field-value-td').find('label').click(function(){
		$(this).hide();
		$(this).closest('tr').find('input').show().focus();
	});

	$('#duedate, #completedte').find('input').blur(function(){
		label = $(this).closest('tr').find('.field-value');
		orig_val = label.attr('orig');
		if($(this).val() == "") {
			label.html(orig_val);
			tr = label.closest('tr[kind=ted-field]');
			if(tr.hasClass('dirty')) {
				tr.removeClass('dirty');
			}
		}
		$(this).hide();
		$(this).closest('tr').find('.field-value').show();
	});

	$('#statuscomments').find('textarea')
		.focus(function() {
			$(this).addClass('edit');	
			$(this).removeAttr('readonly');
		})
		.blur(function() {
			$(this).removeClass('edit');	
		});

	// TTD 1524 	Access denied to "System" results -- Also noticed non member 
	// is able to change status drop down since the following line was part of 
	// 'init_limited_user_action_handlers'. Hence moved this line to
	// 'init_exclusive_user_action_handlers' for member only permisson.
	$('#status_div').find('#results-status select').removeAttr('disabled');

	// ##########  TED editable field handling
	//
	
	// "priority:
	$('#ted_div').find('#priority').find('select').change(function(e){
		label = $(this).closest('#priority').find('#priority-label');

		new_val = $(this).val();
		orig_val = label.attr('orig');

		label.html($(this).val());
		tr = $(this).closest('tr[kind=ted-field]');
		if(label.html() != orig_val) {
			if(!tr.hasClass('dirty')) {
				tr.addClass('dirty');
			}
		}else{
			if(tr.hasClass('dirty')) {
				tr.removeClass('dirty');
			}
		}
		$(this).blur();
	});

	// "Owner":
	$('#ted_div').find('#owner').find('select').change(function(e){
		label = $(this).closest('#owner').find('#owner-label');
		new_val = $(this).val();
		orig_val = label.attr('orig');

		label.html($(this).val());
		tr = $(this).closest('tr[kind=ted-field]');
		if(label.html() != orig_val) {
			if(!tr.hasClass('dirty')) {
				tr.addClass('dirty');
			}
		}else{
			if(tr.hasClass('dirty')) {
				tr.removeClass('dirty');
			}
		}
		$(this).blur();
	});

	// "Due Date":
	$('#ted_div').find('#duedate').find('input').change(function(e){
		label = $(this).closest('#duedate').find('#duedate-label');

		new_val = $(this).datepicker("option","dateFormat","yy-mm-dd").val();
		orig_val = label.attr('orig');

		label.html($(this).val());
		tr = $(this).closest('tr[kind=ted-field]');
		if(label.html() != orig_val) {
			if(!tr.hasClass('dirty')) {
				tr.addClass('dirty');
			}
		}else{
			if(tr.hasClass('dirty')) {
				tr.removeClass('dirty');
			}
		}
		$(this).blur();
	});
	
	// "Complete Date":
	$('#ted_div').find('#completedte').find('input').change(function(e){
		label = $(this).closest('#completedte').find('#completedte-label');

		new_val = $(this).datepicker("option","dateFormat","yy-mm-dd").val();
		orig_val = label.attr('orig');

		label.html($(this).val());
		tr = $(this).closest('tr[kind=ted-field]');
		if(label.html() != orig_val) {
			if(!tr.hasClass('dirty')) {
				tr.addClass('dirty');
			}
		}else{
			if(tr.hasClass('dirty')) {
				tr.removeClass('dirty');
			}
		}
		$(this).blur();
	});
	
	// "Status":
	$('#ted_div').find('#calcstatus').find('select').change(function(e){
		label = $(this).closest('#calcstatus').find('#calcstatus-label');

		new_val = $(this).val();
		orig_val = label.attr('orig');

		label.html($(this).val());
		tr = $(this).closest('tr[kind=ted-field]');
		if(label.html() != orig_val) {
			if(!tr.hasClass('dirty')) {
				tr.addClass('dirty');
			}
		}else{
			if(tr.hasClass('dirty')) {
				tr.removeClass('dirty');
			}
		}
		$(this).blur();
	});

	// "Comments":
	$('#ted_div').find('#statuscomments .field-value-ta').change(function(e){
		tr = $(this).closest('tr[kind=ted-field]');

		new_val = $(this).val();
		orig_val = $(this).attr('orig');

		if(new_val != orig_val) {
			if(!tr.hasClass('dirty')) {
				tr.addClass('dirty');
				$(this).addClass('dirty');
			}
		}else{
			if(tr.hasClass('dirty')) {
				tr.removeClass('dirty');
				$(this).removeClass('dirty');
			}
		}
	});

	// ---- "Discard"
	$('#ted_div').find('#s-discard').show();
	$('#ted_div').find('#s-discard').click(function(){
		$('#ted_div').find('.dirty').each(function(){
			label = $(this).find('.field-value');
			orig_val = label.attr('orig');
			label.html(orig_val);
			$(this).removeClass('dirty');

			ta = $(this).find('textarea');
			ta.val(ta.attr('orig'));
			ta.removeClass('dirty');
		});
	});

	// ---- "Save"
	$('#ted_div').find('#s-save').show();
	$('#ted_div').find('#s-save').click(function(){

		if($('#ted_div').find('.dirty').length == 0)
			return;

		if(!confirm("Are you sure you want to save these changes permanently? You will not be able to revert them back."))
			return;

		data = {};
		$('#ted_div').find('.dirty').each(function(){
			$this = $(this);
			if($this.attr('id') == "priority") {
				data['priority'] = $this.find('#priority-label').html();
			}else if($this.attr('id') == "owner") {
				data['owner'] = $this.find('#owner-label').html();
			}else if($this.attr('id') == "duedate") {
				data['duedate'] = $this.find('#duedate-label').html();
			}else if($this.attr('id') == "completedte") {
				data['completedte'] = $this.find('#completedte-label').html();
			}else if($this.attr('id') == "calcstatus") {
				data['calcstatus'] = $this.find('#calcstatus-label').html();
			}else if($this.attr('id') == "statuscomments") {
				data['statuscomments'] = $this.find('.field-value-ta').val();
			}
		});
	
		var $csrf_token = $('#csrf_token').attr('value');
    	$.post(
			"/ted_save",
			{
				"testmatrixid"	: $('#testmatrixid').attr('value'),
				"priority"		: data['priority'],
				"owner"			: data['owner'],
				"duedate"		: data['duedate'],
				"completedte"	: data['completedte'],
				"calcstatus"	: data['calcstatus'],
				"statuscomments": data['statuscomments'],
				"csrfmiddlewaretoken": $csrf_token
			},
			function(json) {
				$this = $('#ted_div');

				$this.find('#priority-label').html(json['priority'])
				$this.find('#priority-label').attr('orig',json['priority'])

				//$this.find('#owner-label').html(json['owner'])
				//$this.find('#owner-label').attr('orig',json['owner'])

				$this.find('#duedate-label').html(json['duedate'])
				$this.find('#duedate-label').attr('orig',json['duedate'])

				$this.find('#completedte-label').html(json['completedte'])
				$this.find('#completedte-label').attr('orig',json['completedte'])

				$this.find('#calcstatus-label').html(json['calcstatus'])
				$this.find('#calcstatus-label').attr('orig',json['calcstatus'])

				$this.find('#statuscomments').find('.field-value-ta')
											 .val(json['statuscomments'])
											 .attr('orig',json['statuscomments'])

				$this.find('.dirty').each(function(){
					$(this).removeClass('dirty');
				});
			},
			"json"
		);
	
		if($this.find('#calcstatus-label').html() != 'X' && $this.find('#calcstatus-label').html() != null) {
			cell = $(window.opener.document).find('#cell-table .cell][id='+$('#testmatrixid').attr('value')+']');

			//if(cell.hasClass('pass') || cell.hasClass('fail') || cell.hasClass('testing') || cell.hasClass('skipped')
                                                //|| cell.hasClass('untested')) {
			if(cell.text() != "") {
            	cell.removeClass('pass');
                cell.removeClass('fail');
                cell.removeClass('untested');
                cell.removeClass('testing');
                cell.removeClass('skipped');
				
				if($this.find('#calcstatus-label').html() == 'P') {
                	cell.addClass('pass');
                	cell.find('a').text("P");
				}else if($this.find('#calcstatus-label').html() == 'F') {
                	cell.addClass('fail');
                	cell.find('a').text("F");
				}else if($this.find('#calcstatus-label').html() == 'T') {
                	cell.addClass('testing');
                	cell.find('a').text("T");
				}else if($this.find('#calcstatus-label').html() == 'S') {
                	cell.addClass('skipped');
                	cell.find('a').text("S");
				}else if($this.find('#calcstatus-label').html() == 'U') {
                	cell.addClass('untested');
                	cell.find('a').text("U");
				}
            }
			window.opener.get_breakdown();
		    window.opener.get_automated();
		    //window.opener.last_modified();
		}
	});

}


var format_new_result_row = function(tr,tr_summary) {
	new_id = fn_get_next_id_();
	tr.attr('id',new_id);
	tr_summary.attr('resultid',new_id);
	tr_summary.attr('statusid',new_id);

	summary_readjust();
	autoResizeMe(tr.attr('id'));
	//tr.closest('.status-tab').find('#results-title').find('textarea').focus();

	title_ta = $('#status_div').find('tr[resultid='+new_id+']').find('#results-title').find('textarea');
	title = title_ta.val();
	title_ta.val(title+new_id);
	$('#status_div').find('tr[id='+new_id+']').find('a').html(title_ta.val());
	$('#status_div').find('tr[id='+new_id+']').find('a').attr('orig',title_ta.val());
}

var autoResizeMe = function(id) {
	div = $('tr[id=summary-tr][resultid='+id+']').find('#summary');
	if(results_visited[id] == undefined) {
		div.find('textarea').each(function(){
			$(this).autoResize();
		});
		results_visited[id]=true;
	}
	div.find('textarea').each(function(){
		$(this).keydown();
	});
}

var get_results = function(id) {
    if(id>0) {
		results_data = {
			"title": "N/A",
			"results": "N/A",
			"bugid": "N/A",
			"systeminfo": "N/A",
			"comments": "N/A"
		}
		var $csrf_token = $('#csrf_token').attr('value');
           $.post(
			"/results_view",
			{
				"resultid": id,
				"csrfmiddlewaretoken": $csrf_token
			},
			function(json) {
				div = $('tr[id=summary-tr][resultid='+id+']').find('#summary');
				div.find('#results-title')
										 .find('textarea')
										 .val($('tr[id='+id+']').find('.r-td > a').html());
				div.find('#results-results')
										 .find('textarea')
										 .val(json['results']);
				div.find('#results-bugid')
										 .find('textarea')
										 .val(json['bugid']);
				div.find('#results-systeminfo')
									     .find('textarea')
										 .val(json['systeminfo']);
				div.find('#results-comments')
										 .find('textarea')
										 .val(json['comments']);
				summary_readjust_id();
				autoResizeMe(id);
			},
			"json"
		);
	}
}

var readjust = function() {
	$('.field-value-ta').each(function() {
		$(this).keydown();
		$(this).width($(window).width() - $('.field-header').width() - 130);
	});
}

var summary_readjust_id = function(id) {
	div = $('tr[id=summary-tr][resultid='+id+']').find('#summary');
	div.width($(window).width() - 45);
	div.find('textarea').each(function() {
		$(this).attr('readonly','readonly');
		header = $(this).closest('tr[kind=tc-field]').find('.r-header-td');
		$(this).keydown();
		$(this).width(div.width() - header.width() - 35);
	});
}

var summary_readjust = function() {
	$('.summary').each(function(){
		id = $(this).closest('tr[id=summary-tr]').attr('resultid');
		summary_readjust_id(id);
	});
}

var color_result_status = function() {
	$('#status_div').find('tr[kind=entry]').each(function(){
	 	s = $(this).find('.r-td:eq(2)');	
		s.removeClass("pass fail untested testing skipped");
		if(s.text().trim() == "P") {
			s.addClass('pass');
		}else if(s.text().trim() == "F") {
			s.addClass('fail');
		}else if(s.text().trim() == "U") {
			s.addClass('untested');
		}else if(s.text().trim() == "T") {
			s.addClass('testing');
		}else if(s.text().trim() == "S") {
			s.addClass('skipped');
		}
	});
}

$(document).ready(function(){
	readjust();
	$(window).resize(function() {
		readjust();
		summary_readjust();
	});
	$('.field-value-ta').autoResize();
	$('#duedate-input').datepicker({
		changeMonth: true,
		changeYear: true
	});
	$('#completedte-input').datepicker({
		changeMonth: true,
		changeYear: true
	});

	permission = -1;
    	if(user == "") {
            permission = -1; // Read only
        }else if($.inArray(user, usergroup) >= 0 || superuser) {
            permission = 1; // full
        }else{
            permission = 0; // limited (add results etc)
        }

	if(permission == -1) {
		init_read_only_user_action_handlers();
		$('.r-td checkbox').attr('disabled','disabled');
	}else if(permission == 0) {
		init_read_only_user_action_handlers();
		init_limited_user_action_handlers();
	}else if(permission == 1) {
		init_read_only_user_action_handlers();
		init_limited_user_action_handlers();
		init_exclusive_user_action_handlers();
	}

	color_result_status();

});

