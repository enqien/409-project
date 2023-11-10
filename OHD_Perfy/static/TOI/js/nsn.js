var user = 'rkraja';
var brow = 'mozilla';
var min = -1;

var $resizing = false;
var $matrix_h = 0;
var $matrix_w = 0;
var hasScroll=true;

var hasScroll = false;

var delete_tc_list = [];
var delete_tm_list = [];

var isHighlighted;
var noAdjust = false;

jQuery.each(jQuery.browser, function(i, val) {
	if(val == true){
 		brow = i.toString();
  	}
});

String.prototype.trim = function() { return this.replace(/^\s+|\s+$/g, ''); }

var get_user = function() {
	return user;
}

var flash = function() {
	$("#matrix-div").hide().fadeIn();
}

var get_category_data = function(td) {
	ind = td.closest('tr[kind=row-data]').find('td[kind=cell]').index(td);
	col = $('#category-header-div td[kind=category][subkind=leaf]:eq('+ind+')');
	pid = col.attr('pid');
	pcol = $('#category-header-div td[kind=category][subkind=parent][id='+pid+']');
	col_name = col.find('span').html();
	pcol_name = pcol.find('span').html();
	return {'col':col_name,'pcol':pcol_name, 'col_id':col.attr('id'), 'pcol_id':pcol.attr('id')};
}


jQuery.fn.center = function () {
	return this;
}

fnCheckDimensions = function() {
}


fn_tidy_up_ = function() {
	fn_popup_remove_();
}

get_ids = function(n) {
	$(n).each(function(index, obj) {
		var child_size = $('tr[pid='+obj.id+']').size()
		if(child_size == 0) {
			$("#row-header-tab").append("<div id=\"id-collection\" tid="+obj.id+">");
			return;
		}else{
			$("#row-header-tab").append("<div id=\"id-collection\" tid="+obj.id+">");
			var c = get_ids($('tr[pid='+obj.id+']'));
		}
	});
}


fnAdjustTitleWidth = function() {
	$('[name=firstTd]').css("width",$('#row-header-div').width()-2);
}

fnAdjustCellWidth = function(id){
	var colCount = $('.leafRow td[kind=category][subkind=leaf]').length; //get total number of column
  	var m = 0;

	for($m=0; $m< colCount; $m++) {
		var $col_width = $('.leafRow td[kind=category][subkind=leaf]:eq('+$m+')').width();
		$('.leafRow td[kind=category][subkind=leaf]:eq('+$m+')').each(function() {
			$(this).width($col_width);
			$(this).attr('min-wdith',$col_width);
			var $name = $(this).find('span').html();
		});
		$('#table_div tr[kind=row-data][id='+id+']').find('td[kind=cell]:eq('+$m+')').each(function() {
			$(this).css('min-width',$col_width);
		});
	}
}

fnAdjustTable = function(){
	fnAdjustTitleWidth();
	fnAdjustRowHeight();
	fnAdjustSize();
}

fnAdjustFirstRowCellWidth = function(id){
	var colCount = $('.leafRow td[kind=category][subkind=leaf]').length; //get total number of column
	col_width_arr = [colCount];
	for($m=0; $m< colCount; $m++) {
		col_width_arr[$m] = $('.leafRow td[kind=category][subkind=leaf]:eq('+$m+')').width();
	}
	$('#table_div tr[kind=row-data]:eq(0)').each(function() {
		$m = 0;
		$(this).find('td[kind=cell]').each(function() {
			$(this).css('min-width',col_width_arr[$m++]);
		});
	});
}

fnAdjustAllCells = function(){
	var colCount = $('.leafRow td[kind=category][subkind=leaf]').length; //get total number of column
	col_width_arr = [colCount];
	for($m=0; $m< colCount; $m++) {
		col_width_arr[$m] = $('.leafRow td[kind=category][subkind=leaf]:eq('+$m+')').width();
	}
	$('#table_div tr[kind=row-data]').each(function() {
		$m = 0;
		$(this).find('td[kind=cell]').each(function() {
			$(this).css('min-width',col_width_arr[$m++]);
		});
	});
	$("#matrix-div").css('opacity','1.0');
}

fnAdjustRowHeightById = function ($id) {
    var $this = $('#table_div tr[id='+$id+']');
	var $row_header = $('#row-header-div [kind=row-header-tr][id='+$id+']');
	$this.css('height', $row_header.css('height')); 
}

fnAdjustRowHeight = function () {
	$('#table_div tr').each(function() {
		var $id = $(this).attr('id');
		var $row_header = $('#row-header-div [kind=row-header-tr][id='+$id+']');
		var $my_row_header_height = $row_header.css('height');
		var $my_row_header_min_height = $row_header.css('min-height');
		$(this).css('height', $my_row_header_height); 
		$(this).css('min-height', $my_row_header_height); 
	});
}

fnAdjustSize = function() {
	if(noAdjust) {
		return;
	}
	var $window_h = $('#matrix-div').height();
	var $window_w = $('#matrix-div').width();

	var $row_header_h = $('#row-header-div').innerHeight(); 
	var $row_header_w = $('#row-header-div').innerWidth(); 

	var $category_header_h = $('.categoryHeaderTable').innerHeight();
	var $category_header_w = $('.categoryHeaderTable').innerWidth();

	var $table_div_height = $('#table_div').innerHeight();
	var $table_div_width = $('#table_div').innerWidth();

	var $scrollbar_width = 15;
	var $scrollbar_height = 15;

   	if (brow == 'mozilla'){
		$window_h = $('#matrix-div').height();
		$window_w = $('#matrix-div').width();
	
		$row_header_h = $('#row-header-div').height(); 
		$row_header_w = $('#row-header-div').width(); 

		$category_header_h = $('.categoryHeaderTable').height();
		$category_header_w = $('.categoryHeaderTable').width();

		$table_div_height = $('#table_div').height();
		$table_div_width = $('#table_div').width();
	}

	matrix_w = parseInt($('#table_div').get(0).scrollWidth) + parseInt($row_header_w);
	matrix_h = parseInt($('#table_div').get(0).scrollHeight) + parseInt($category_header_h);

	if(matrix_w < $window_w && matrix_h < $window_h) {
		$('#category-header-div').width($('#category-header-div > table').width());
		//$('#table_div').width($('#category-header-div').width());	
		$('#table_div').width($('#category-header-div').width()+2);	

		//$('#row-header-div').height($('#row-header-tab').height());
		$('#row-header-div').height($('#row-header-tab').get(0).scrollHeight);
		$('#table_div').height($('#table_div > table').height());
		//$('#table_div').height($('#table_div').get(0).scrollHeight);
	}
	if(matrix_w < $window_w && matrix_h > $window_h) {
		$('#table_div').width($category_header_w + $scrollbar_width + 2);	
		$('#category-header-div').width($('#category-header-div > table').width());

		$('#row-header-div').height($window_h - $category_header_h - $scrollbar_height - 20);
		$('#table_div').height($window_h - $category_header_h - $scrollbar_height - 20);	
	}
	if(matrix_w > $window_w && matrix_h < $window_h) {
		$('#category-header-div').width($window_w - $row_header_w - 50);
		$('#table_div').width($window_w - $row_header_w - 50);

		$('#table_div').height($('#table_div > table').height() + $scrollbar_width);
		$('#row-header-div').height($('#table_div > table').height());
	}
	if(matrix_w > $window_w && matrix_h > $window_h) {
		$('#category-header-div').width($window_w - $row_header_w - $scrollbar_width - 50);
		$('#table_div').width($window_w - $row_header_w - 50);

		$('#row-header-div').height($window_h - $category_header_h - $scrollbar_height - 50);
		$('#table_div').height($window_h - $category_header_h - 50);	
	}
		//$("#matrix-div").hide().fadeIn();
}
 				
//function to support scrolling of title and first column
fnScroll = function(){
	$('[name=divHeader]').scrollLeft($('#table_div').scrollLeft());
  	$('[name=firstcol]').scrollTop($('#table_div').scrollTop());
}	

$(document).ready(function(){
	$('#matrix-div').height($(window).height()*0.8);
	$(window).resize(function() {
		$('#matrix-div').height($(window).height()*0.8);
		fnAdjustSize();
	});

	$("#matrix").center();

	$(".expander").width("10px");
	$(".indent").width("10px");

	if($('#row-header-tab').find('tr').length == 0 && $('td[kind=category]').length == 0) {
		start_helper = "<td id=\"start-helper\"><label class=\"helper\" "+
						"id=\"helper1\">Start here -></label></td>";
		$(start_helper).insertBefore($('#product-name'));
		$("#matrix").css('margin-right','35%');
	}
});

var fnSave = function() {
	var new_id = 1;
	json_arr = [];
	var $csrf_token = $('#csrf_token').attr('value');
	var count = 0;
	var tm_ids = [];
	var tc_action, tm_action;
	var badInsert = false;
	var bad_tc_list = [];
	alert("debug");
	return;
	$("#row-header-div .dirty").each(function(){
		var $this = $(this);
		var td = $this.closest('td[kind=row-header-td]');
		var tr = td.closest('tr[kind=row-header-tr]');
		var id = td.attr('id');
		var action = td.attr('action');
		var subkind = td.attr('subkind');

		if(id > 0) {
			// Move TestCase
			if(action != 'insert') {
				var data = '{ "id": '+id+','+
							'"pid": '+td.attr('pid')+','+
							'"name": \"'+td.find('span').html()+'\" }';
				json_arr.push(data);
			}
		}else{
			// Clone/Insert TestCase

		    // Collect all TestMatrixIds to be cloned from this row
			var tm_arr = [];
			$("#table_div tr[kind=row-data][id="+td.attr('id')+"]").find('td[kind=cell]').each(function(){
				if($(this).hasClass('pass') || $(this).hasClass('fail') || $(this).hasClass('untested')) {
					cat_data = get_category_data($(this));
					col = cat_data['col'];
					pcol = cat_data['pcol'];
					priority=3;
					clone_id = $(this).attr('cloneid')
					if($(this).attr('cloneid') == undefined || $(this).attr('cloneid') < 0) {
						clone_id = "undefined";
					}
					tm_data = '{ "id": '+$(this).attr('id')+','+
						'"cloneid": \"'+clone_id+'\",'+
						'"owner": \"'+user+'\",'+
						'"product_id": \"'+$('#product-name').attr('product_id')+'\",'+
						'"priority": \"'+priority+'\",'+
						'"status": \"'+$(this).find('a').html()+'\",'+
						'"col": \"'+col+'\",'+
						'"pcol": \"'+pcol+'\" }';
					tm_arr.push(tm_data);
					tm_ids.push($(this).attr('id'));
				}
			});

			// Create composite JSON structure
			clone_id = td.attr('cloneid');
			if(td.attr('cloneid') == undefined){
				clone_id = "undefined";
			}

			if(get_valid_tc_leaf_count(td) == 0) {
				return;
			}

			var data = '{ "id": '+td.attr('id')+','+
					'"cloneid": \"'+clone_id+'\",'+
					'"pid": '+td.attr('pid')+','+
					'"action": \"'+action+'\",'+
					'"tm_data": '+'['+tm_arr.join()+']'+','+
					'"name": \"'+td.find('span').html()+'\" }';
			json_arr.push(data);
		}
		count++;
	});

	col_arr = [];
	$('#category-header-div .dirty').each(function(){
		old_name = $(this).find('#original-name').attr('value');
		new_name = $(this).find('span').html();
		subkind = $(this).attr('subkind');
		var pcol,pcol_orig;
		if(subkind == "leaf") {
			pcol = $('#category-header-div td[kind=category][subkind=parent][id='+
										$(this).attr('pid')+']').find('span').html();
			pcol_orig = $(this).find('#original-name').attr('pid');
		}else if(subkind == "parent") {
			pcol = new_name;
		}
		product_id = $('#product-name').attr('product_id');
		col_data = '{ "old_name": \"'+old_name+'\",'+
				'"new_name": \"'+new_name+'\",'+
				'"subkind": \"'+subkind+'\",'+
				'"pcol": \"'+pcol+'\",'+
				'"pcol_orig": \"'+pcol_orig+'\",'+
				'"product_id": \"'+product_id+'\" }';
		col_arr.push(col_data);
	});

	tm_body_arr = [];
	$("#table_div .dirty").each(function(){
		id = $(this).attr('id');
		if($(this).hasClass("cell")) {
			d = '{ "id": '+id+'}';
			if(id > 0) {
				delete_tm_list.push(d);
			}
		}else{
			cat_data = get_category_data($(this));
			tc_id = $(this).closest('tr[kind=row-data]').attr('id');
			priority=3;
			tm_data = '{ "id": '+id+','+
				'"tc_id": '+tc_id+','+
				'"product_id": \"'+$('#product-name').attr('product_id')+'\",'+
				'"priority": \"'+priority+'\",'+
				'"status": \"'+$(this).find('a').html()+'\",'+
				'"owner": \"'+user+'\",'+
				'"col": \"'+cat_data['col']+'\",'+
				'"pcol": \"'+cat_data['pcol']+'\" }';
			found = false;
			for($i=0;$i<tm_ids.length;$i++) {
				if(tm_ids[$i] == $(this).attr('id')) {
					found = true;
				}
			}
			if(!found) {
				tm_body_arr.push(tm_data);
			}
		}
		count++;
	});

	tc_data = '['+json_arr.join()+']';	
	delete_tc_data = '['+delete_tc_list.join()+']';
	tm_data = '['+tm_body_arr.join()+']';
	delete_tm_data = '['+delete_tm_list.join()+']';
	col_data = '['+col_arr.join()+']';

	$("#row-header-div td[kind=row-header-td]").each(function(){
		valid_count = get_valid_tc_leaf_count($(this));
		if(get_valid_tc_leaf_count($(this)) == 0) {
			badInsert = true;
			bad_tc_list.push($(this).find('span').html());
		}
	});

	if(badInsert) {
		str = "";
		for(i=0;i<bad_tc_list.length;i++) {
			str += ' \''+bad_tc_list[i]+'\'';
		}
		ret=confirm("The following testcases will be deleted from this test matrix: "+str
					+" since no test matrix cell(s) have been specified. Continue?");
		if(!ret) {
			return;
		}
	}

	// Commit to database
	if(count > 0 || delete_tc_list.length > 0 || delete_tm_list.length > 0 || col_arr.length > 0 || badInsert) {
		$.post(
			"/commit_tc", 
			{
				"tc_data": tc_data,
				"delete_tc_list": delete_tc_data,
				"tm_data": tm_data,
				"delete_tm_list": delete_tm_data,
				"col_data": col_data,
				"pid": $('#product-name').attr('product_id'),
				"csrfmiddlewaretoken": $csrf_token
			},
			function(json) {
				alert(json);			
				//refresh_ui(json,"tc");
			},
			"json"
		);
		//window.location.reload(true);
	}
	delete_tc_list.length = 0;
	delete_tm_list.length = 0;
	col_arr.length = 0;
}

var fnUpdateTcId = function(old_id,new_id) {
	alert(old_id+" "+new_id);
}

var get_valid_tc_leaf_count = function(td) {
	count = 0;
	id = td.attr('id');
	subkind = td.attr('subkind');
	if(subkind == 'parent') {
		$("#row-header-div td[kind=row-header-td][pid="+id+"]").each(function(){
			count += get_valid_tc_leaf_count($(this));
		});
	}else if(subkind == 'leaf') {
		valid_cell_count = 0;
		$("#table_div tr[kind=row-data][id="+id+"]").find('td[kind=cell]').each(function(){
			if($(this).hasClass('pass') || $(this).hasClass('fail') || $(this).hasClass('untested')) {
				valid_cell_count++;
			}
		});
		count = valid_cell_count;
	}
	return count;
}

var refresh_ui = function(json,prop) {
	if(prop == "tc") {
		list = json['list']
		type = json['type']

		for($i=0; $i<list.length; $i++) {
			id 		= list[$i]['id'];
			pid 	= list[$i]['pid'];
			name 	= list[$i]['name'];
			new_id 	= list[$i]['new_id'];
			new_pid = list[$i]['new_pid'];

			$("#row-header-div td[kind=row-header-td][id="+id+"]").each(function(){
				td = $(this);
				tr = td.closest('tr[kind=row-header-tr]');

				tr.attr('id',new_id);
				tr.find('td[kind=selektor]').attr('id',new_id);
				tr.find('td[kind=expand-icon]').attr('id',new_id);

				td.attr('id',new_id);
				td.find('#original-name').attr('value',name);
				td.removeClass('dirty');
				td.removeAttr('action');

				if(new_pid != undefined && new_pid != pid) {
					td.attr('pid',new_pid);
					tr.attr('pid',new_pid);
					td.find('#original-name').attr('pid',new_pid);
				}

				// Change IDs for TestMatrix bidy as well
				$('#table_div tr[id='+id+']').each(function() {
					$(this).attr('id',new_id);
					$(this).attr('pid',new_pid);
					$(this).removeAttr('cloneid');
				});
			});
		}
	}
}	
// JQUERY .................................................................

$(function() {

	$('#table_div tr[kind=row-filler]').click(function(){
		//fnAdjustRowHeight();
		fnAdjustTable();
	});

	$('#row-header-tab').resize(function() {
		alert("resized");
		fnAdjustSize();
	});

	// ***********  My Awesome jQuery Plugins  **************** //

	$('#row-header-div').mousewheel(function(e,delta,x,y) {

		fn_tidy_up_();

		var $y = $('#table_div').scrollTop();
		$('#table_div').scrollTop($y-delta*30);

		e.preventDefault();
	});

	(function( $ ) {
		// ----- adjust height between testmatrix body & testcase
		$.fn.highlight = function(c,t) {
			return $(this).each(function() {
				if(c == undefined) {
					c = "#FFFF00";
				}
				if(t == undefined) {
					t = 1000;
				}
				$(this).effect("highlight", {color:c}, t);
			});
		};

		$.fn.sync_height_row_header = function() {
			return $(this).each(function() {
				var $id = $(this).attr('id');
				var $row_header = $('#row-header-div [kind=row-header-tr][id='+$id+']');
				var $name = $row_header.children('span').val();
				var $my_row_header_height = $row_header.css('height');
				//console.log($name+" "+$id+" "+$my_row_header_height+" "+$(this).css('height'));
				$(this).css('height', $my_row_header_height);
			});
		};


		// ---- "hover_testcase": Handle hover events w/ highlight style. 
		$.fn.hover_testcase = function() {
			$(this.selector).live({
				mouseover: function() {
					$(this).find('[kind=selektor]').addClass('highlight');
				},
				mouseout: function() {
					$(this).find('[kind=selektor]').removeClass('highlight');
				}
			});
		};
	})(jQuery);


	// ---- "editable": Turn anything into an edit box. 
	var cache = {}, lastXhr;
	(function( $ ) {
		$.fn.editable = function(options) {
			return $(this).each(function() {
				var width = $(this).width();
				var $this = $(this);
				var $value = $this.find('span').html();
				var $pid = $(this).attr('pid');
				var $id = $(this).attr('id');
				var $text_len = $this.find('span').width();
				var $class = $(this).attr('class');
				var $orig = null;
				if(options) {
					$class = options['class'];
				}
				var $input = "<input readonly=readonly "+
							 " nowrap"+
							 " class="+$class+
							 " value=\""+$value+"\""+
							 //editable_input_extra_attr($this)+
							 " />";
				$this.find('span[class=editable-span]').hide();
				$this.append($input);
				$this.find('input').addClass('pointer');

				// Adjust text size: from 'span' tag calculate text size
				$this.find('input').width(width-4);

				editable_click_($this);
				//$this.off('hover');
				$this.find('input').addClass('editable');
				$this.find('input').removeAttr('onfocus');
				$this.find('input').removeAttr('readonly');
				$this.find('input').removeClass('pointer');
				editable_focus_($this);
				$orig = $this.find('input').val();
				$original_name = $this.find('#original-name').attr('value');

				$this.find('input').dblclick(function(e){
					e.stopPropagation();
				});

				$this.find('input').focus();

				// EDIT MODE
				//
				// AUTO COMPLETE >>>
				autocomplete = false
				if($this.attr('kind') == "row-header-td" ) {
					$this.find('input').autocomplete({
						source: function(request,response){
							var term = request.term;
							if(term in cache){
								response( $.map( cache[term], function (item) {
									return {
										label: item.label,
										value: {
											id: item.id,
											name: item.name,
											path_ids: item.path_ids
										}
									}
								}));
							}else{
								input_data = {
									term: request.term,
									id:	  $id
								};
								lastXhr = $.getJSON("/autocomplete_tc_testcasename", input_data, function(data,status,xhr) {
									cache[term] = data;
									if(xhr === lastXhr) {
										response( $.map( data, function (item) {
											return {
												label: item.label,
												value: {
													id: item.id,
													name: item.name,
													path_ids: item.path_ids
												}
											}
										}));
									}
								});
							}
						},
						minLength: 2,
						focus: function(e,ui){
							autocomplete=true;
							//return false;
						},
						select: function(e, ui) {
							//ret = confirm("Create TestCase tree for \""+ui.item.value.name+"\"?");
							//if(ret) {
								path_ids = ui.item.value.path_ids;
								fn_create_tc_tree_(path_ids);
							//}
							console.log("Selected: "+ui.item.value.name+" id:"+ui.item.value.id+" val:"+this.value);

							if($id < 0) {
								fn_tc_delete_($id);
								fnAdjustSize();
							}

							//autocomplete=false;
						},
						close: function(e, ui) {
							autocomplete=false;
							$this.find('span[class=editable-span]').val($orig);
							$this.find('input').val($orig);
							$this.find('input').blur();
						}
					});
				}

				// BLUR
				$this.find('input').blur(function() {
						if(!autocomplete) {
							if($(this).val().length == 0) {
								$(this).val($orig);
							}
							$this.find('input').removeClass('editable');
							$this.find('input').attr('onfocus','onfocus');
							$this.find('input').attr('readonly','readonly');

							// Trim white space
							$(this).val($(this).val().trim());

							//$this.children('input').addClass('pointer');
							editable_blur_($this);

							var $new_val = $this.find('input').val();

							if($original_name != $new_val) {
								$this.addClass('dirty');
								$this.attr('action','update');
							}else{
								if($this.hasClass('dirty')) {
									$this.removeClass('dirty');
									$this.removeAttr('action');
								}
							}

							// Check for duplicate name
							$('#row-header-tab td[kind=row-header-td]').each(function(){
								if($(this).find('span').html() == $new_val) {
									if($(this).attr('id') != $id) {
										//ret = confirm("Duplicate Test Case Alert. Continue?");
										//if(!ret) {
											//fn_tc_delete_($id);
										//}
									}
								}
							});

							// Adjust cell length to user input changes
							$('<span id=tmp class=hide>'+$new_val+'</span>').appendTo($this);
							$text_len = $this.find('span[id=tmp]').width();
							$this.css('min-width',$text_len);
							$this.find('span[id=tmp]').remove();

							$this.find('span[class=editable-span]').text($new_val);
							$this.find('span[class=editable-span]').show();

							// AJAX update 'TestCase' fields
							//editable_blur_ajax_($this,$orig);

							$this.find('input').remove();
						}
					fnAdjustSize();
					fnAdjustAllCells();
				});
			});
		};

		$(window).bind('load', function()
		{
			$("#matrix-div").css('opacity','0.3');
			fnAdjustTable();
			fnAdjustAllCells();
			$("#matrix-div").hide().fadeIn();
		});

	})(jQuery);

fn_create_tc_tree_ = function(path_ids) {
	for($i=0; $i<path_ids.length; $i++) {
		new_id = path_ids[$i].id;
		new_pid = path_ids[$i].pid;
		new_name = path_ids[$i].name;
		type = path_ids[$i].type;

		if(type == "parent") {
			fn_tc_insert_parent_(new_pid,new_name,new_id);
		}else if(type == "leaf") {
			fn_tc_insert_leaf_(new_pid,new_name,new_id);
		}
		//console.log(new_name+" "+new_id+" "+new_pid+" "+type);
	}
	fnAdjustSize();
};

// Field specific 'click' function handling for "editable" plugin
var editable_click_ = function($this) {
	if($this.attr('kind') == "row-header-td" ) {
		console.log("testcaseid="+$this.parent().attr('id')+" pid="+$this.parent().attr('pid'));
		if($this.attr('subkind') == "leaf") {
			//var $row = $this.attr('row');
			//$('[row='+$row+']').removeClass('highlight');
		}else{
			$this.find('input').removeClass('highlight');
		}
	}else if($this.attr('kind') == "category" ) {
		if($this.attr('subkind') == "leaf") {
			var $col = $this.attr('col');
			$('[col='+$col+']').removeClass('highlight');
		}else{
			$this.find('input').removeClass('highlight');
		}
	}
};

// Field specific 'focus' function handling for "editable" plugin
var editable_focus_ = function($this) {
	if($this.attr('class') == "product-name")	{
		//var h = parseInt($this.css('height'));
		//h = h + "px";
		$this.find('input').css('min-height',$this.css('height'));
	}
};

// Field specific 'blur' function handling for "editable" plugin
var editable_blur_ = function($this) {
	if($this.attr('kind') == "row-header-td" ) {
		//$this.hover_testcase();
	}
	if($this.attr('kind') == "category" ) {
		$('#row-header-tab td[kind=category][subkind=leaf]').unbind('hover');
		//category_hover_();
	}
};

// Hover function for Category table columns
function category_hover_() {
	$('#row-header-tab td[kind=category][subkind=leaf]').hover(function() {
		var $col = $(this).attr('col');
		$('#row-header-tab [col='+$col+']').addClass('highlight');
	}, function() {
		var $col = $(this).attr('col');
		$('#row-header-tab [col='+$col+']').removeClass('highlight');
	});
}

// *********** Handle mouse hover functions ************** //

function fn_hover_tc_() {
	$('#row-header-tab td[kind=row-header-td]').hover_testcase();
}

function fn_hover_tc_cancel_() {
	$('#row-header-tab td[kind=selektor]').removeClass('highlight');
	$('#row-header-tab td[kind=row-header-td]').unbind('hover');
}

fn_hover_tc_();

function fn_hover_cc_() {
	$('#category-header-div [kind=category]').hover_testcase();
}

function fn_hover_cc_cancel_() {
	$('#category-header-div [kind=category]').removeClass('highlight');
	$('#category-header-div [kind=category]').unbind('hover');
}

fn_hover_cc_();

// *********** Handle mouse click functions ************** //

// Cell click
var get_next_class = function(c) {
	//var classes = ['cell','untested','pass','fail'];
	var classes = ['cell','untested'];
	for(i=0;i<classes.length;i++) {
		val = classes.shift();
		classes.push(val);
		if(val == c) {
			val = classes.shift();
			classes.push(val);
			return val;
		}
	}
}

$('#table_div').find('td[kind=cell]').live('click',function(e){

	if($(this).hasClass('dirty') || $(this).hasClass('cell')) {
		old_class = undefined;
		if($(this).hasClass('cell')) {
			old_class = "cell";
		}else if($(this).hasClass('untested')) {
			old_class = "untested";
		}

		new_class = get_next_class(old_class);
		$(this).toggleClass(old_class+" "+new_class);

		$(this).find('a').remove();
		if(new_class == "untested") {
			$(this).append('<a href="">U</a>');
		}

		if($(this).attr('orig_class') == new_class) {
			$(this).removeClass('dirty');
		}else{
			$(this).addClass('dirty');
		}

		if($(this).attr('id') == 0) {
			$(this).attr('id', fn_get_next_cell_id_());
		}
	}

});

var isMouseDown = false; 
$(document).mouseup(function () {
	isMouseDown = false;
});

$('#table_div').find('td[kind=cell]')
	.mousedown(function(){
		isMouseDown = true;
		$(this).toggleClass("cell-highlight");
		isHighlighted = $(this).hasClass("cell-highlight");
		return false;
	})
	.mouseover(function(){
		if(isMouseDown) {
			$(this).toggleClass("cell-highlight", isHighlighted);
		}
	}).bind("selectstart", function() {
		return false;
	});

// Test Case Window handling
$('#row-header-div td[kind=row-header-td]').find('a').live('click',function(e){
	e.preventDefault();
	id = $(this).closest('td[kind=row-header-td]').attr('id');
	//if($id < 0 && $(this).closest('td[kind=row-header-td]').attr('cloneid') != undefined) {
	if(id > 0) {
		window.open('/testcase/'+id,'TestCase Edit','width=800,height=500,scrollbars=1');
	}else{
		//alert("Please save changes (hit 'save' button) before opening new test case to edit.");
	}
});

// Test Result Window handling
$('#table_div td[kind=cell]').find('a').live('click',function(e){
	e.preventDefault();
	id = $(this).closest('td[kind=cell]').attr('id');
	pid = $('#product-name').attr('product_id');
	if(id > 0) {
		window.open('/status/'+pid+'/'+id,'TestCase Edit','width=800,height=750,scrollbars=1');
	}else{
		//alert("Please save changes (hit 'save' button) before opening new test case to edit.");
	}
	return false;
});

// Product handling
$('#product-name').find('a').live('click',function(e){
	e.preventDefault();
	pid=$(this).closest('#product-name').attr('product_id');
	if(pid > 0) {
		window.open('/product_edit/'+pid,'Product Edit','width=800,height=750,scrollbars=1');
	}
	return false;
});


// *********************************************
// SELEKTOR -- Column Headers (Category Columns)
// *********************************************

$('#category-header-div [kind=selektor]').live('click',function(e){ 
	var $this = $(this).closest('.catcol');
	var $col_td = $this.closest('[kind=category]');
	var $id = $col_td.attr('id');
	var $pid = $col_td.attr('pid');
	var $subkind = $col_td.attr('subkind');

	fn_popup_remove_();
	$this.find('[kind=selektor]').removeClass('highlight');
	$this.append(
		$('<div class=popup>'+
			'<table class=popupTab>'+
				'<tr class=popupRow>'+
					'<td>'+	
						'<label class=insertLeaf>Insert Subcategory</label><br>'+
					'</td>'+	
				'</tr>'+
				'<tr class=popupRow>'+
					'<td>'+	
						'<label class=clone>Clone</label><br>'+
					'</td>'+	
				'</tr>'+
				'<tr class=popupRow>'+
					'<td>'+	
						'<label class=delete>Delete</label><br>'+
					'</td>'+	
				'</tr>'+
				'<tr class=popupRow>'+
					'<td>'+	
						'<label class=check-all>Select All</label><br>'+
					'</td>'+	
				'</tr>'+
				'<tr class=popupRow>'+
					'<td>'+	
						'<label class=check-none>Select None</label><br>'+
					'</td>'+	
				'</tr>'+
			'</table>'+
		'</div>'));

	if($subkind != "parent") {
		$this.find('.insertLeaf').closest('.popupRow').remove();
		$this.find('.insertParent').closest('.popupRow').remove();
	}

	$('#category-header-div .popup').slideToggle('fast');

	$('#category-header-div .popup').mouseover(function(e) {
		e.stopPropagation();
	});

	$('#category-header-div .popupRow').hover(function() {
		$(this).addClass('popupHover');
		$(this).removeClass('highlight');
		$(this).mouseover(function(e){
			e.stopPropagation();
		});
	}, function() {
		$(this).removeClass('popupHover');
		$(this).removeClass('highlight');
		$(this).mouseout(function(e){
			e.stopPropagation();
		});
	});


	$('#category-header-div .insertLeaf').closest('.popupRow').click(function(e) {
		fn_cc_insert_leaf_($col_td);
		e.stopPropagation();
		fn_popup_remove_();
		fnAdjustTitleWidth();
		fnAdjustAllCells();
		fnAdjustSize();
	});

	$('#category-header-div .delete').closest('.popupRow').click(function(e) {
		fn_popup_remove_();
		fn_cc_delete_($col_td);
		if($('#category-header-div td[kind=category]').length == 0) {
			$('#table_div tr').remove();
		}
		e.stopPropagation();
		fnAdjustTitleWidth();
		fnAdjustAllCells();
		fnAdjustSize();
	});

	$('#category-header-div .clone').closest('.popupRow').click(function(e) {
		fn_cc_clone_($col_td);
		e.stopPropagation();
		fn_popup_remove_();
		fnAdjustTitleWidth();
		fnAdjustAllCells();
		fnAdjustSize();
	});

	$('#category-header-div .check-all').closest('.popupRow').click(function(e) {
		fn_cc_check_all_($col_td);
		fn_popup_remove_();
		e.stopPropagation();
	});

	$('#category-header-div .check-none').closest('.popupRow').click(function(e) {
		fn_cc_check_none_($col_td);
		fn_popup_remove_();
		e.stopPropagation();
	});

	e.stopPropagation();

	$('.popup').click(function(e){
		e.stopPropagation();
	});

});

fn_cc_check_all_ = function($col) {
	id = $col.attr('id');
	if($col.attr('subkind') == 'parent') {
		$('#category-header-div td[kind=category][subkind=leaf][pid='+id+']').each(function(){
			$col = $(this);
			ind = $('#category-header-div td[kind=category][subkind=leaf]').index($col);
			$('#table_div tr[kind=row-data]').each(function() {
				cell = $(this).find('td[kind=cell]:eq('+ind+')');
				if(cell.hasClass('cell')) {
					cell.removeClass('cell');
					if(cell.find('a').length == 0) {
						cell.append('<a href="">U</a>');
					}
					cell.addClass('untested');
					cell.addClass('dirty');
					cell.find('a').html("U");
				}
			});
		});
	}else{
		id = $col.attr('id');
		ind = $('#category-header-div td[kind=category][subkind=leaf]').index($col);
		$('#table_div tr[kind=row-data]').each(function() {
			cell = $(this).find('td[kind=cell]:eq('+ind+')');
			if(cell.hasClass('cell')) {
				cell.removeClass('cell');
				if(cell.find('a').length == 0) {
					cell.append('<a href="">U</a>');
				}
				cell.addClass('untested');
				cell.addClass('dirty');
				cell.find('a').html("U");
			}
		});
	}
}

fn_cc_check_none_ = function($col) {
	id = $col.attr('id');
	if($col.attr('subkind') == 'parent') {
		$('#category-header-div td[kind=category][subkind=leaf][pid='+id+']').each(function(){
			$col = $(this);
			ind = $('#category-header-div td[kind=category][subkind=leaf]').index($col);
			$('#table_div tr[kind=row-data]').each(function() {
				cell = $(this).find('td[kind=cell]:eq('+ind+')');
				if(cell.hasClass('untested') && cell.hasClass('dirty')) {
					cell.removeClass('untested');
					cell.addClass('cell');
					if(cell.find('a').length > 0) {
						cell.find('a').remove();
					}
				}
			});
		});
	}else{
		id = $col.attr('id');
		ind = $('#category-header-div td[kind=category][subkind=leaf]').index($col);
		$('#table_div tr[kind=row-data]').each(function() {
			cell = $(this).find('td[kind=cell]:eq('+ind+')');
			if(cell.hasClass('untested') && cell.hasClass('dirty')) {
				cell.removeClass('untested');
				cell.addClass('cell');
				if(cell.find('a').length > 0) {
					cell.find('a').remove();
				}
			}
		});
	}
}

fn_cc_clone_ = function($col) {
	ind = -1;
	id = $col.attr('id');
	if($col.attr('subkind') == 'parent') { // PARENT COLUMN CLONE
		colspan = $col.attr('colspan');
		try{
			colspan = parseInt(colspan);
		}catch(e){p_col_span=undefined;}
		pid = fn_get_next_id_();
		p_col_clone = $col.clone();
		p_col_clone.find('span').html('clone'+pid);
		p_col_clone.find('#original-name').attr('value','clone'+pid);
		p_col_clone.attr('id',pid);
		p_col_clone.attr('cloneid',id);
		p_col_clone.insertAfter($col);
		$('#category-header-div td[kind=category][subkind=leaf][pid='+id+']').each(function(){
			fn_clone_leaf_($(this), "parent", colspan-1, pid);
		});
		p_col_clone.highlight();
		p_col_clone.addClass('dirty');
		//p_col_clone.attr('action','clone');
			
	}else{ // LEAF COLUMN CLONE
		pid = $col.attr('pid');
		fn_clone_leaf_($col, "leaf", 0, pid);
	}
	fnCheckDimensions();
	fnAdjustTable();
}

fn_clone_leaf_ = function($col, type, offset, pid) {
	ind = $('#category-header-div td[kind=category][subkind=leaf]').index($col);

	$col_target = $('#category-header-div td[kind=category][subkind=leaf]:eq('+(ind+offset)+')');

	col_prev_width = $col_target.width();
	col_prev_min_width = $col_target.attr('min-width');

	p_col = $('#category-header-div td[kind=category][subkind=parent][id='+pid+']');
	colspan = p_col.attr('colspan');
	try{
		colspan = parseInt(colspan);
	}catch(e){colspan=undefined;}


	if(colspan != undefined) {
		$new_id = fn_get_next_id_();
		$col_clone = $col.clone();
		$col_clone.attr('id',$new_id);
		$col_clone.attr('pid',pid);
		$col_clone.attr('cloneid',$col.attr('id'));

		new_name =  "clone "+$new_id;
		//if(type == "parent") {
			//new_name = $col.find('span').html()+"_clone";	
		//}

		$col_clone.find('span').html(new_name);
		$col_clone.find('#original-name').attr('value',new_name);

		$col_clone.insertAfter($col_target);
		$col_clone.highlight();
		$col_clone.addClass('dirty');
		//$col_clone.attr('action','clone');

		col_width = $col_clone.width();

		$('#table_div tr[kind=row-data]').each(function() {
			cell = $(this).find('td[kind=cell]:eq('+ind+')');
			cell_target = $(this).find('td[kind=cell]:eq('+(ind+offset)+')');
			cell_clone = cell.clone();
			if(cell_clone.hasClass('pass') || cell_clone.hasClass('fail') 
									|| cell_clone.hasClass('untested')) {
				cell_clone.removeClass('pass');
				cell_clone.removeClass('fail');
				cell_clone.removeClass('untested');
				cell_clone.addClass('untested');
				cell_clone.addClass('dirty');

				var new_id = fn_get_next_cell_id_();
				cell_clone.attr('id',new_id);
				cell_clone.find('a').attr('href',new_id);
				cell_clone.find('a').html("U");

			}
			cell_clone.insertAfter(cell_target);	
			cell_clone.css('min-width',col_width);
			cell_clone.css('width',col_width);
			cell_clone.highlight();
		});

		if(type == "leaf") {
			p_col.attr('colspan',colspan+1);
		}

		$('#max_len').attr('value',parseInt($('#max_len').attr('value'))+1);
	}

	$col_target.width(col_prev_width);
	$col_target.attr('min-width',col_prev_min_width);

	$('#table_div tr[kind=row-filler] > td[kind=row-filler-td]').each(function(){
		$(this).attr('colspan',parseInt($(this).attr('colspan'))+1);
	});
}

fn_cc_delete_ = function($col) {
	id = $col.attr('id');
	ind = -1;
	if($col.attr('subkind') == 'parent') {
		ret = confirm("Delete Category column "+$col.find('span').html()+" ?");
		if(!ret) {
			return;
		}
		$('#category-header-div td[kind=category][subkind=leaf][pid='+id+']').each(function(){
			ind = $('#category-header-div td[kind=category][subkind=leaf]').index($(this));
			$('#table_div tr[kind=row-data]').each(function() {
				cell = $(this).find('td[kind=cell]:eq('+ind+')');
				id = cell.attr('id');
				if(id > 0) {
					d = '{ "id": '+id+'}';
					delete_tm_list.push(d);
				}
				cell.remove();
			});
			$(this).remove();
			$('#max_len').attr('value',parseInt($('#max_len').attr('value'))-1);
			
		});
		$col.remove();
		//$('#category-header-div [kind=category][subkind=parent][id='+id+']').remove();
	}else{
		ind = $('#category-header-div td[kind=category][subkind=leaf]').index($col);
		pid = $col.attr('pid');
		p_col = $('#category-header-div td[kind=category][subkind=parent][id='+pid+']');
		ret = confirm("Delete Sub Category column "+p_col.find('span').html()+
													" --> "+$col.find('span').html()+" ?");
		if(!ret) {
			return;
		}
		p_col_span = p_col.attr('colspan');
		try{
			p_col_span = parseInt(p_col_span);
		}catch(e){p_col_span=undefined;}
		
		if(p_col_span == 1) {
			var ret = confirm("Remove Column Header \""+
							p_col.find('span').html()+"\"?");
			if(ret){
				fn_table_col_cell_delete_(ind);
				$col.remove();
				p_col.remove();
			}
		}else{
			if(p_col_span != undefined) {
				p_col.attr('colspan',p_col_span-1);
				fn_table_col_cell_delete_(ind);
				$col.remove();
			}
		}
		$('#max_len').attr('value',parseInt($('#max_len').attr('value'))-1);
	}
	fnCheckDimensions();
	fnAdjustTable();
}

fn_table_col_cell_delete_ = function(ind) {
	$('#table_div tr[kind=row-data]').each(function() {
		cell = $(this).find('td[kind=cell]:eq('+ind+')');
		id = cell.attr('id');
		if(id > 0) {
			d = '{ "id": '+id+'}';
			delete_tm_list.push(d);
		}
		cell.remove();
	});
}

fn_cc_insert_parent_ = function() {
	new_id = fn_get_next_id_();
	ind = -1;
	pclass = "even-plat";
	pname = "untitled"+new_id;
	colspan = 0;

	if($('#category-header-div td[kind=category][subkind=parent]').length % 2 == 0) {
		pclass = "odd-plat";
	}else{
		pclass = "even-plat";
	}

	pcol = '<td class=\"'+pclass+' dirty\"'+
						' action=insert'+
						' colspan='+colspan+
                            		' nowrap'+
                            		' kind=category'+
                            		' subkind=parent'+ 
                            		' id='+new_id+'>'+
						' <table class=\"catcol\" id=\"catcol\" cellspacing=0 cellpadding=0>'+
						'	<td class=\"pointer selektor\"'+
						'	kind=\"selektor\"'+
						'	subkind=\"parent\"'+
						'	id='+new_id+'></td>'+
						'   <td class=cc><span class=editable-span>'+pname+'</span><div class=hidden id=original-name value=\"'+pname+'\" /></td>'+
						' </table>'+
					' </td>';

	target_td = $('#category-header-div td[kind=category][subkind=parent]:last');

	if(target_td.length == 0) {
		target_td = $('#category-header-div td[kind=category-hidden][subkind=parent]');
	}

	$(pcol).insertAfter(target_td);

	pcol = $('#category-header-div td[kind=category][subkind=parent][id='+new_id+']');
	fn_cc_insert_leaf_(pcol);
}

fn_cc_insert_leaf_ = function($col) {
	pid = $col.attr('id');
	new_id = fn_get_next_id_();
	ind = -1;
	pname = $col.find('span').html();

	if($col.attr('subkind') == 'parent') {
		$leaf_col = '<td class=\"'+$col.attr('class')+' dirty\"'+
						' action=insert'+
                            		' nowrap'+
                            		' kind=category'+
                            		' subkind=leaf'+ 
                            		' id='+new_id+
                            		' pid='+pid+'>'+
                            		' <div class=tableHeader>'+
                                	' 	<table class=catcol'+
								 ' id=catcol'+
								 ' cellspacing=0'+
								 ' cellpadding=0>'+
                                    		 ' <td class=\"pointer selektor\"'+
                                        		 ' kind=selektor'+
                                        	     ' subkind=leaf'+
                                        		 ' id='+new_id+'></td>'+
                                    		 ' <td class=cc><span '+
											'class=editable-span>undefined '+new_id+
											'</span><div class=\"hidden\" id=original-name '+
											'value=\"undefined '+new_id+'\" pid=\"'+pname+'\" /></td>'+
                                	  ' </table>'+
                            		' </div>'+
                        		' </td>';

	}
	target_td = $('#category-header-div td[kind=category][subkind=leaf][pid='+pid+']');
	colspan = parseInt($col.attr('colspan'));
	ind = -1;
	if(target_td.length == 0) {
		target_td = $('#category-header-div td[kind=category][subkind=leaf]:last');
		if(target_td.length == 0) {
			target_td = $('#category-header-div td[kind=category-hidden][subkind=leaf]');
		}else{
			ind = $('#category-header-div td[kind=category][subkind=leaf]').index(target_td);
		}
		$($leaf_col).insertAfter(target_td);
	}else{
		ind = $('#category-header-div td[kind=category][subkind=leaf]').
														index(target_td)+colspan-1;
		$($leaf_col).insertAfter($('#category-header-div '+
									'td[kind=category][subkind=leaf]:eq('+ind+')'));
	}
	col_prev_width = $('.leafRow td[kind=category]:eq('+ind+')').width();
	col_prev_min_width = $('.leafRow td[kind=category]:eq('+ind+')').attr('min-width');
	col_prev = $('.leafRow td[kind=category]:eq('+ind+')');

	$('.leafRow td[kind=category]:eq('+(ind+1)+')').highlight();
	$col.attr('colspan',colspan+1);

	col_width = $('.leafRow td[kind=category]:eq('+(ind+1)+')').width();

	if(ind == -1) {
		if($('#category-header-div td[kind=category]').length == 0) {
			$('#table_div tr').remove();
		}
		$('#row-header-tab tr[kind=row-header-tr]').each(function(){
			id  = $(this).attr('id');
			pid = $(this).attr('pid');
			colspan = 1;
			tr = undefined;
			if($('#table_div tbody').length == 0) {
				$('#table_div > table').append('<tbody></tbody>');
			}
			if($(this).attr('subkind') == 'parent'){
				tr  =' <tr  kind=row-filler'+
					 '		subkind=parent'+
					 '		id='+id+
					 '		pid='+pid+' >'+
					 '		<td class=row-header'+
					 '			kind=row-filler-td'+
					 '			subkind=parent'+
					 '			nowrap'+
					 '			colspan='+colspan+
					 '		</td>'+
					 ' </tr>';
				$('#table_div tbody').append(tr);
			}else if($(this).attr('subkind') == 'leaf'){
				tr  =' <tr  kind=row-data'+
					 '		class=row-data'+
					 '		subkind=leaf'+
					 '		id='+id+
					 '		pid='+pid+' >'+
				  	 ' 		<td  class=\"untested dirty\"'+
                              	 ' 	 		id=0'+
                              	 ' 			kind=cell'+
                               	 ' 			orig=0'+
					 ' 			orig_class=cell'+
                                 ' 			subclass=empty-cell'+
                               	 ' 			nowrap>'+
                               	 ' 			<a href=\"javascript: void(0)\">U</a></td>';
					 ' </tr>';
				$('#table_div tbody').append(tr);
				new_cell=$(tr).find('.cell');
				new_cell.css('min-width',col_width);
				new_cell.css('width',col_width);
				new_cell.highlight();
			}
		});
		fnAdjustTable();
	}else{
		$('#table_div tr[kind=row-data]').each(function() {
			cell = $(this).find('td[kind=cell]:eq('+ind+')');
			new_cell =	'<td class=\"untested dirty\"'+
                              		' id=0'+
                              		' kind=cell'+
                              		' orig=0'+
						' orig_class=cell'+
                                	' subclass=empty-cell'+
                               		' nowrap>'+
                               		' <a href=\"javascript: void(0)\">U</a></td>';
			$(new_cell).insertAfter(cell);
			new_cell = $(this).find('td[kind=cell]:eq('+(ind+1)+')');
			new_cell.css('min-width',col_width);
			new_cell.css('width',col_width);
			new_cell.highlight();
		});
	}
	$('#max_len').attr('value',(parseInt($('#max_len').attr('value')))+1);
	$('#table_div tr[kind=row-filler] > td[kind=row-filler-td]').each(function(){
		$(this).attr('colspan',parseInt($(this).attr('colspan'))+1);
	});

	col_prev.width(col_prev_width);
	col_prev.attr('min-width',col_prev_min_width);
	fnCheckDimensions();
}


// ************************************
// SELEKTOR -- Row Headers (Test Cases)
// ************************************
				
$('#row-header-div [kind=selektor]').live('click',function(e){ 
	var $this = $(this).closest('.tcrow');
	var $row_td = $this.closest('td[kind=row-header-td]');
	var $id = $row_td.attr('id');
	var $pid = $row_td.attr('pid');
	var $subkind = $row_td.attr('subkind');

	fn_popup_remove_();
	$this.find('[kind=selektor]').removeClass('highlight');
	$this.append(
		$('<div class=popup>'+
			'<table class=popupTab>'+
				'<tr class=popupRow>'+
					'<td>'+	
						'<label class=insertLeaf>Insert Test Case Leaf</label><br>'+
					'</td>'+	
				'</tr>'+
				'<tr class=popupRow>'+
					'<td>'+	
						'<label class=insertParent>Insert Test Case Parent</label><br>'+
					'</td>'+	
				'</tr>'+
				'<tr class=popupRow>'+
					'<td>'+	
						'<label class=populateChildren>Spawn Children</label><br>'+
					'</td>'+	
				'</tr>'+
				'<tr class=popupRow>'+
					'<td>'+	
						'<label class=clone>Clone</label><br>'+
					'</td>'+	
				'</tr>'+
				'<tr class=popupRow>'+
					'<td>'+	
						'<label class=delete>Delete</label><br>'+
					'</td>'+	
				'</tr>'+
				'<tr class=popupRow>'+
					'<td>'+	
						'<label class=check-all>Select All</label><br>'+
					'</td>'+	
				'</tr>'+
				'<tr class=popupRow>'+
					'<td>'+	
						'<label class=check-none>Select None</label><br>'+
					'</td>'+	
				'</tr>'+
			'</table>'+
		'</div>'));

	if($subkind != "parent") {
		$this.find('.insertLeaf').closest('.popupRow').remove();
		$this.find('.insertParent').closest('.popupRow').remove();
		$this.find('.populateChildren').closest('.popupRow').remove();
	}

	//if($id < 0) {
		//$this.find('.clone').closest('.popupRow').remove();
	//}

	$('#row-header-div .popup').slideToggle('fast');

	$('#row-header-div .popup').mouseover(function(e) {
		e.stopPropagation();
	});

	$('#row-header-div .popupRow').hover(function() {
		$(this).addClass('popupHover');
		$(this).removeClass('highlight');
		$(this).mouseover(function(e){
			e.stopPropagation();
		});
	}, function() {
		$(this).removeClass('popupHover');
		$(this).removeClass('highlight');
		$(this).mouseout(function(e){
			e.stopPropagation();
		});
	});


	$('#row-header-div .insertLeaf').closest('.popupRow').click(function(e) {
		fn_tc_insert_leaf_($id);
		e.stopPropagation();
		fn_popup_remove_();
		//fnAdjustRowHeight();
		fnAdjustTitleWidth();
		fnAdjustSize();
	});

	$('#row-header-div .insertParent').closest('.popupRow').click(function(e) {
		fn_tc_insert_parent_($id);
		e.stopPropagation();
		fn_popup_remove_();
		//fnAdjustRowHeight();
		fnAdjustTitleWidth();
		fnAdjustSize();
	});

	$('#row-header-div .delete').closest('.popupRow').click(function(e) {
		fn_tc_delete_($id);
		e.stopPropagation();
		fn_popup_remove_();
		fnAdjustTitleWidth();
		fnAdjustSize();
	});

	$('#row-header-div .clone').closest('.popupRow').click(function(e) {
		fn_tc_clone_($id,$pid);
		e.stopPropagation();
		fn_popup_remove_();
		fnAdjustTitleWidth();
		fnAdjustSize();
	});

	$('#row-header-div .populateChildren').closest('.popupRow').click(function(e) {
		fn_populate_children_($id);
		e.stopPropagation();
		fn_popup_remove_();
		//fnAdjustTitleWidth();
		fnAdjustTitleWidth();
		fnAdjustTable();
		fnAdjustSize();
	});

	$('#row-header-div .check-all').closest('.popupRow').click(function(e) {
		fn_tc_check_all_($id);
		fn_popup_remove_();
		e.stopPropagation();
	});

	$('#row-header-div .check-none').closest('.popupRow').click(function(e) {
		fn_tc_check_none_($id);
		fn_popup_remove_();
		e.stopPropagation();
	});

	e.stopPropagation();

	$('.popup').click(function(e){
		e.stopPropagation();
	});

});

$(document).click(function() {
	fn_popup_remove_();
	$('#matrix td[id=product-name]').find('.tc-popup').slideToggle('fast',function() {
		$('#matrix td[id=product-name]').find('.tc-popup').remove();
	});
   	if($('#pane').is(':visible')) {
    				//$('#menu').find('#pane').hide();
        			$('#menu').find('#pane').slideToggle(200,function(){$(this).hide()});
   	}
});

$(document).keyup(function(e) {
	if (e.keyCode == 27) {
		fn_popup_remove_();
	}
});

fn_tc_check_all_ = function(id) {
	var my_tc_tr = $('#row-header-tab tr[kind=row-header-tr][id='+id+']');
	if(my_tc_tr.attr('subkind') == 'parent') {
		$('#table_div tr[pid='+id+']').each(function(){
			fn_tc_check_all_($(this).attr('id'));
		});
	}else if(my_tc_tr.attr('subkind') == 'leaf') {
		$('#table_div tr[id='+id+']').find('td[kind=cell]').each(function(){
			cell = $(this);
				if(cell.hasClass('cell')) {
					cell.removeClass('cell');
					if(cell.find('a').length == 0) {
						cell.append('<a href="">U</a>');
					}
					cell.addClass('untested');
					cell.addClass('dirty');
					cell.find('a').html("U");
				}
		});
	}
}

fn_tc_check_none_ = function(id) {
	var my_tc_tr = $('#row-header-tab tr[kind=row-header-tr][id='+id+']');
	if(my_tc_tr.attr('subkind') == 'parent') {
		$('#table_div tr[pid='+id+']').each(function(){
			fn_tc_check_none_($(this).attr('id'));
		});
	}else if(my_tc_tr.attr('subkind') == 'leaf') {
		$('#table_div tr[id='+id+']').find('td[kind=cell]').each(function(){
			cell = $(this);
			if(cell.hasClass('untested') && cell.hasClass('dirty')) {
				cell.removeClass('untested');
				cell.addClass('cell');
				if(cell.find('a').length > 0) {
					cell.find('a').remove();
				}
			}
		});
	}
}

fn_populate_children_ = function(id) {
	var $csrf_token = $('#csrf_token').attr('value');
	$.post(
		"/populate_children", 
		{
			"id": id,
			"csrfmiddlewaretoken": $csrf_token
		},
		function(json) {
			path_ids_arr = json['path_ids_arr'];
			for(i=0;i<path_ids_arr.length;i++){
				fn_create_tc_tree_(path_ids_arr[i]);
			}
		},
		"json"
	);
}

fn_popup_remove_ = function() {
	$('.popup').remove();
	$('.tc-popup').remove();
}

fn_tc_clone_ = function($id,$pid) {
	var $offset= get_child_count($id);
	recursive_clone($id,$pid,$offset);
	fnCheckDimensions();
}

recursive_clone = function($id,$pid,$offset) {
	var $pid = clone_row($id,$pid,$offset);
	$('#row-header-div td[pid='+$id+']').each(function() {
		var $id = $(this).attr('id');
		recursive_clone($id,$pid,$offset);
	});
}

clone_row = function($id,$pid,$offset) {
	var $my_tc_tr = $('#row-header-tab tr[kind=row-header-tr][id='+$id+']');
	var $my_body_tr = $('#table_div tr[id='+$id+']');

	var $my_pos = $('#row-header-tab tr[kind=row-header-tr]').index($my_tc_tr);
	var $tc_name = $my_tc_tr.find('span').html();

	var $ins_pos = $my_pos + $offset - 1;

	var $target_tc_tr =  $('#row-header-tab tr[kind=row-header-tr]:eq('+$ins_pos+')');
	var $target_body_tr =  $('#table_div tr:eq('+$ins_pos+')');

	var $clone_tc_tr = $my_tc_tr.clone();
	var $clone_body_tr = $my_body_tr.clone();

	fn_popup_remove_();

	var $new_id = fn_get_next_id_();

	// Test Case Row Clone modifications
	$clone_tc_tr.attr('id',$new_id);
	$clone_tc_tr.attr('pid',$pid);

	var clone_id = $my_tc_tr.find('td[kind=row-header-td]').attr('cloneid');

	$clone_tc_tr.find('td[kind=row-header-td]').attr('id',$new_id);

	// Handle clone of clone (inherit 'cloneid')
	$clone_tc_tr.find('td[kind=row-header-td]').attr('pid',$pid);
	if(clone_id == undefined) {
		$clone_tc_tr.find('td[kind=row-header-td]').attr('cloneid',$id);
	}else{
		$clone_tc_tr.find('td[kind=row-header-td]').attr('cloneid',clone_id);
	}
	$clone_tc_tr.find('td[kind=row-header-td]').addClass('dirty');
	$clone_tc_tr.find('td[kind=row-header-td]').attr('action','clone');;

	$clone_tc_tr.find('td[kind=selektor]').attr('id',$new_id);
	$clone_tc_tr.find('td[kind=expand-icon]').attr('id',$new_id);

	$clone_tc_tr.find('span').html($tc_name+"_clone");
	
	// Table Body Row Clone modifications
	$clone_body_tr.attr('id',$new_id);
	$clone_body_tr.attr('pid',$pid);

	// Insert clones in respective positions
	$($clone_tc_tr).insertAfter($target_tc_tr).find('td[kind=row-header-td]').highlight();
	$($clone_body_tr).insertAfter($target_body_tr).find('td[kind=cell],td[kind=row-filler-td]').highlight();

	$clone_body_tr.find('td[kind=cell]').each(function(){
		var $this = $(this);
		if($this.hasClass('pass') || $this.hasClass('fail') 
								|| $this.hasClass('untested')) {
			$this.removeClass('pass');
			$this.removeClass('fail');
			$this.removeClass('untested');
			$this.addClass('untested');
			$this.addClass('dirty');

			var $new_id = fn_get_next_cell_id_();
			$this.attr('cloneid',$this.attr('id'));
			$this.attr('id',$new_id);
			$this.find('a').attr('href',$new_id);
			$this.find('a').html("U");
		}
	});

	return $new_id;
}

get_child_count = function($id) {
	$count = 1;
	$('#row-header-div td[pid='+$id+']').each(function() {
		var $id = $(this).attr('id');
		$count += get_child_count($id);
	});
	return $count;
}

fn_tc_delete_ = function(id) {
	//TODO: create TC delete list and TMID delete list
	d = '{ "id": '+id+'}';
	if(id > 0) {
		delete_tc_list.push(d);
	}

	$('#row-header-tab tr[kind=row-header-tr][pid='+id+']').each(function(){
		fn_tc_delete_($(this).attr('id'));
		$(this).remove();
	});
	$('#table_div tr[pid='+id+']').each(function(){
		fn_tc_delete_($(this).attr('id'));
		$(this).remove();
	});
	$('#row-header-tab tr[kind=row-header-tr][id='+id+']').remove();
	$('#table_div tr[id='+id+']').remove();
	fnCheckDimensions();
}

fn_tc_insert_leaf_ = function(pid,name,id) {

	//magic();
	//magic();
	//magic();

	if($('#row-header-tab tr[kind=row-header-tr][id='+id+']').length > 0) {
		return;
	}

	var parent_row_header_tr = $('#row-header-tab tr[kind=row-header-tr][id='+pid+']');
	var parent_row_body_tr = $('#table_div tr[subkind=parent][id='+pid+']');

	var parent_level = parent_row_header_tr.attr('level');
	var new_level = parseInt(parent_level)+1;
	var max_len = parseInt($('#max_len').attr('value'));

	var new_id = fn_get_next_id_();
	var new_name = "undefined"+new_id;

	if(name != undefined) {
		new_name = name;
	}

	if(id != undefined && id > 0) {
		new_id = id;
	}

	if(pid == 0) {
		parent_row_header_tr = $('#row-header-tab tr[kind=row-header-tr]:eq(0)');
		parent_row_body_tr = $('#table_div tr[subkind=parent]:eq(0)');

		new_level = 0
	}

	var new_row_header='<tr kind=row-header-tr'+
                    			' subkind=leaf'+
                    			' class=row-header-tr-leaf'+ 
                    			' id='+new_id+
                    			' pid='+pid+
                    			' level='+new_level+'>';

					for(i=0; i<(new_level+1); i++) {
                        			new_row_header += '<td class=indent>    </td>';
					}
			
		new_row_header += '<td kind=row-header-td'+ 
                                 ' subkind=leaf'+
                    			' id='+new_id+
                    			' pid='+pid+
                                ' colspan=0'+
                                ' nowrap'+
					' action=insert'+
                                ' class=\"tc dirty\">'+
                                ' <table class=tcrow'+
					 		' id=tcrow'+
							' cellspacing=0'+
							' cellpadding=0>'+
                                		'<td class=\"pointer selektor\"'+
                                			' kind=selektor'+
                                			' id='+new_id+'></td>'+
                                			' <td>';
	if(new_id <= 0) {
		new_row_header += '<span class=editable-span>'+new_name+'</span>';
	}else{
		new_row_header += ' <a href=""><span class=editable-span>'+new_name+'</span></a>';
	}
	
	new_row_header += ' </td>'+
                               	'</table>'+
                            	'</td>'+
                				'</tr>';

	var new_row_data='<tr kind=row-data'+
            						' subkind=leaf'+
                    				' id='+new_id+
                    				' pid='+pid+'>';
					
						for(i=0; i<$('#category-header-div td[kind=category][subkind=leaf]').length; i++) {
                                		new_row_data +=	'<td class=\"untested dirty\"'+
                                    					' kind=cell'+
											' orig_class=cell'+
                              							' id=0'+
                              							' kind=cell'+
                              							' orig=0'+
                                    					' subclass=empty-cell'+
                                    					' nowrap>'+
                                    					' <a href=\"javascript: void(0)\">U</a></td>';
						}
		new_row_data += '</tr>';


	if(pid == 0) {
		$(new_row_header).insertBefore(parent_row_header_tr).find('td[kind=row-header-td]').highlight();
		$(new_row_data).insertBefore(parent_row_body_tr).find('td[kind=cell]').highlight();
	}else{
		$(new_row_header).insertAfter(parent_row_header_tr).find('td[kind=row-header-td]').highlight();
		$(new_row_data).insertAfter(parent_row_body_tr).find('td[kind=cell]').highlight();
	}

	fnAdjustCellWidth(new_id);

	fnAdjustRowHeightById(new_id);
	fnCheckDimensions();
	fnAdjustTitleWidth();
}

				fn_tc_insert_parent_ = function(pid,name,id) {

					//magic();
					//magic();
					//magic();

					if($('#row-header-tab tr[kind=row-header-tr][id='+id+']').length > 0) {
						return;
					}

					var parent_row_header_tr = $('#row-header-tab tr[kind=row-header-tr][id='+pid+']');
					var parent_row_body_tr = $('#table_div tr[subkind=parent][id='+pid+']');

					var parent_level = parent_row_header_tr.attr('level');
					var new_level = parseInt(parent_level)+1;
					var max_len = parseInt($('#max_len').attr('value'));

					var new_id = fn_get_next_id_();
					var new_name = "undefined"+new_id;

					if(name != undefined) {
						new_name = name;
					}

					if(id != undefined) {
						new_id = id;
					}

					if(pid == 0) {
						parent_row_header_tr = $('#row-header-tab tr[kind=row-header-tr]:eq(0)');
						parent_row_body_tr = $('#table_div tr[subkind=parent]:eq(0)');
						new_level = 0;
					}

					var new_row_header='<tr kind=row-header-tr'+
                       			' subkind=parent'+
                       			' class=row-header-tr-parent'+ 
                       			' id='+new_id+
                       			' pid='+pid+
                       			' level='+new_level+'>';

								for(i=0; i<(new_level); i++) {
                           			new_row_header += '<td class=indent>    </td>';
								}
						
						new_row_header += '<td class=pointer expander'+
                           				 ' kind=expand-icon'+
                           				 ' id='+new_id+'>-</td>'+
									  	 '<td class=\"row-header dirty\"'+
									  	 ' action=insert'+
										 ' kind=row-header-td'+ 
                                   	  	 ' subkind=parent'+
                       					 ' id='+new_id+
                       					 ' pid='+pid+
                                   		 ' colspan=0'+
                                   		 ' nowrap>'+
                                   		 ' <table class=tcrow'+
								 				 ' id=tcrow'+
												 ' cellspacing=0'+
												 ' cellpadding=0>'+
                                   				 '<td class=\"pointer selektor\"'+
                                   					 ' kind=selektor'+
                                   					 ' id='+new_id+'></td>'+
                                   					 ' <td>';
					if(new_id <= 0) {
						new_row_header += '<span class=editable-span>'+new_name+'</span>';
					}else{
						new_row_header += ' <a href=""><span class=editable-span>'+new_name+'</span></a>';
					}

					new_row_header +=	 ' </td>'+
                               			 '</table>'+
                               		'</td>'+
                   				'</tr>';

					var new_row_data='<tr kind=row-filler'+
               						' subkind=parent'+
                       				' id='+new_id+
                       				' pid='+pid+'>'+
                                   	' <td class=row-header'+
                                      		' kind=row-filler-td'+
                                       	' subkind=parent'+
                                       	' nowrap'+
										' colspan='+max_len+'>'+
                                     	' </td>'+
								  '</tr>';

					//$(new_row_header).insertAfter(parent_row_header_tr).find('td[kind=row-header-td]').highlight();
					//$(new_row_data).insertAfter(parent_row_body_tr).find('td[kind=row-filler-td]').highlight();
					//
					if($('#row-header-tab tr').length == 0) {
						$('#row-header-tab').append(new_row_header);
						if($('#category-header-div td[kind=category][subkind=leaf]').length > 0) {
							if($('#table_div tbody').length == 0) {
								$('#table_div > table').append('<tbody></tbody>');
							}
							$('#table_div tbody').append(new_row_data);
						}
						fnAdjustTable();
					}else{
						if(pid == 0) {
							$(new_row_header).insertBefore(parent_row_header_tr).find('td[kind=row-header-td]').highlight();
							$(new_row_data).insertBefore(parent_row_body_tr).find('td[kind=row-filler-td]').highlight();
						}else{
							$(new_row_header).insertAfter(parent_row_header_tr).find('td[kind=row-header-td]').highlight();
							$(new_row_data).insertAfter(parent_row_body_tr).find('td[kind=row-filler-td]').highlight();
						}
					}

					fnAdjustRowHeightById(new_id);
					fnCheckDimensions();
					fnAdjustTitleWidth();
				}

				fn_get_next_id_ = function() {
					/*
					min = -1;
					$('#row-header-tab tr[kind=row-header-tr]').each(function() {
						id = parseInt($(this).attr('id'));
						if(id < 0) {
							min = (id < min) ? id : min - 1
						}
					});
					*/
					return min--;
				}

				fn_get_next_cell_id_ = function() {
					/*min = -1;
					$('#table_div td[kind=cell]').each(function() {
						id = parseInt($(this).attr('id'));
						if(id < 0) {
							min = (id < min) ? id : min - 1
						}
					});
					*/
					return min--;
				}

				// Double Click to edit test case leaves
				$('#row-header-tab td[kind=row-header-td],'+
				  '#category-header-div [kind=category],'+
				  '#matrixx td[id=product-name]').
					live('dblclick',function() {
						$(this).editable();
					});

				$('#matrix td[id=product-name]').live({
							mouseover: function() {
								$(this).find('#p-selektor').addClass('p-selected');
							},
							mouseout: function() {
								$(this).find('#p-selektor').removeClass('p-selected');
							}
						});

				start_text = $('#start-helper .helper').html();
				$('#matrix td[id=product-name]').hover(function(){
					$('#helper1').html("Click on white 'selektor' ->");
				},function(){
					$('#helper1').html(start_text);
				});

				$('#matrix td[id=product-name]').find('#p-selektor').click(function(e){
					$('#start-helper .helper').addClass("helper-invisible");
					$this = $(this);
					$this.find('.tc-popup').remove();
					$this.append(
						$('<div class=tc-popup>'+
							'<table class=popupTab>'+
								'<tr class=popupRow>'+
									'<td>'+	
										'<label class=insert-tcp>Insert Test Case Parent</label><br>'+
									'</td>'+	
								'</tr>'+
								'<tr class=popupRow>'+
									'<td>'+	
										'<label class=insert-cc>Insert Column</label><br>'+
									'</td>'+	
								'</tr>'+
								'<tr class=popupRow style=\"display:none\">'+
									'<td>'+	
										'<label class=insert-tcl>Insert Leaf Test Case</label><br>'+
									'</td>'+	
								'</tr>'+
							'</table>'+
						'</div>'));

					$('#matrix td[id=product-name]').find('.tc-popup').slideToggle('fast');

					$('#matrix td[id=product-name] .popupRow').hover(function() {
						$(this).addClass('popupHover');
						$(this).removeClass('highlight');
						$(this).mouseover(function(e){
							e.stopPropagation();
						});
					}, function() {
						$(this).removeClass('popupHover');
						$(this).removeClass('highlight');
						$(this).mouseout(function(e){
							e.stopPropagation();
						});
					});

					$('#matrix td[id=product-name] .insert-tcp').closest('.popupRow').click(function(e) {
						new_id = fn_get_next_id_();
						new_name = "Untitled"+new_id;
						fn_tc_insert_parent_(0,new_name,new_id);

						e.stopPropagation();
						fn_popup_remove_();
						//fnAdjustRowHeight();
						fnAdjustTitleWidth();
						fnAdjustSize();
						$('#start-helper').remove();
						return false;
					});

					$('#matrix td[id=product-name] .insert-tcl').closest('.popupRow').click(function(e) {
						new_id = fn_get_next_id_();
						new_name = "Untitled"+new_id;
						fn_tc_insert_parent_(0,new_name,new_id);

						new_id_leaf = fn_get_next_id_();
						new_name_leaf = "Untitled"+new_id_leaf;
						fn_tc_insert_leaf_(new_id,new_name_leaf,new_id_leaf);

						e.stopPropagation();
						fn_popup_remove_();
						//fnAdjustRowHeight();
						fnAdjustTitleWidth();
						fnAdjustSize();
						$('#start-helper').remove();
						return false;
					});

					$('#matrix td[id=product-name] .insert-cc').closest('.popupRow').click(function(e) {
						fn_cc_insert_parent_();
						e.stopPropagation();
						fn_popup_remove_();
						fnAdjustTitleWidth();
						fnAdjustSize();
						fnAdjustAllCells();
						$('#start-helper').remove();
					});

					/*

					$('#category-header-div .delete').closest('.popupRow').click(function(e) {
						fn_cc_delete_($col_td);
						e.stopPropagation();
						fn_popup_remove_();
						fnAdjustTitleWidth();
					});

					$('#category-header-div .clone').closest('.popupRow').click(function(e) {
						fn_cc_clone_($col_td);
						e.stopPropagation();
						fn_popup_remove_();
						fnAdjustTitleWidth();
					});

					e.stopPropagation();

					$('.popup').click(function(e){
						e.stopPropagation();
					});
					*/
					return false;

				}).keyup(function(e) {
					if (e.keyCode == 27) {
						$('#matrix td[id=product-name]').find('.tc-popup').slideToggle(400,function() {
							$('#matrix td[id=product-name]').find('.tc-popup').remove();
						});
					}
				});

					/*				$('#matrix td[id=product-name]').hover(function(){
					cc = $(this).find('td[id=cc]');
					$('#matrix td[id=product-name]').find('.cc-popup').remove();
					cc.parent().append(
						$('<div class=cc-popup>'+
							'<label>+</label>'+
						'</div>'));
						$('#matrix td[id=product-name]').find('.cc-popup').animate({width: 'toggle'},100);
				},function(){
						$('#matrix td[id=product-name]').find('.cc-popup').animate({width: 'toggle'},200,function() {
							$('#matrix td[id=product-name]').find('.cc-popup').remove();
						});
				});
					*/


				// ********* DnD Table Row Headers ************************* //
				//
				//

				//$('#matrix').draggable();
				//

				$('#menu').find('#tracker-li').click(function(e){
					$this = $(this).find('#tracker');
					if($this.attr('value') == 'false') {
						$this.attr('value','true');
						$this.html('Turn Tracker Off');
						highlight_enabled = true;
					}else if($this.attr('value') == 'true') {
						$this.attr('value','false');
						$this.html('Turn Tracker On');
						highlight_enabled = false;
					}
				});

				$('#menu').find('#auto-adjust-li').click(function(e){

				});

				cc_click = false;
				tc_click = false;
				tm_click = false;

				highlight_enabled = false;

				$('#category-header-div td[kind=category][subkind=leaf]').live({
					mouseover: function() {
						if(!highlight_enabled) {
							return;
						}
						if(!cc_click) {
							ind = $('#category-header-div td[kind=category][subkind=leaf]').index($(this));
							$(this).addClass('hover');
							$('#table_div').find('tr[kind=row-data]').each(function(){
								$(this).find('td[kind=cell]:eq('+ind+')').addClass('hover');
							});
						}
					},
					/*
					click: function() {
						if(cc_click) {
							if($(this).hasClass('hover')) {
								cc_click = false;
								tm_click = false;
								tc_click = false;
							}
							ind = $('#category-header-div td[kind=category][subkind=leaf]').index($(this));
							$(this).toggleClass('hover');
							$('#table_div').find('tr[kind=row-data]').each(function(){
								$(this).find('td[kind=cell]:eq('+ind+')').toggleClass('hover');
							});
						}else{
							cc_click = true;
							tm_click = true;
							tc_click = true;
						}
					},
					*/

					mouseout: function() {
						if(!highlight_enabled) {
							return;
						}
						if(!cc_click) {
							ind = $('#category-header-div td[kind=category][subkind=leaf]').index($(this));
							$(this).removeClass('hover');
							$('#table_div').find('tr[kind=row-data]').each(function(){
								$(this).find('td[kind=cell]:eq('+ind+')').removeClass('hover');
							});
						}
					}
				});

				$('#row-header-tab').find('td[kind=row-header-td][subkind=leaf]').live({
					mouseover: function() {
						if(!highlight_enabled) {
							return;
						}
						if(!tc_click) {
							id = $(this).attr('id');
							$(this).addClass('hover');
							$('#table_div').find('tr[kind=row-data][id='+id+']').find('td[kind=cell]').each(function(){
								$(this).addClass('hover');
							});
						}
					},
					/*
					click: function() {
						if(tc_click) {
							if($(this).hasClass('hover')) {
								cc_click = false;
								tm_click = false;
								tc_click = false;
							}
							id = $(this).attr('id');
							$(this).toggleClass('hover');
							$('#table_div').find('tr[kind=row-data][id='+id+']').find('td[kind=cell]').each(function(){
								$(this).toggleClass('hover');
							});
						}else{
							cc_click = true;
							tm_click = true;
							tc_click = true;
						}
					},
					*/

					mouseout: function() {
						if(!highlight_enabled) {
							return;
						}
						if(!tc_click) {
							id = $(this).attr('id');
							$(this).removeClass('hover');
							$('#table_div').find('tr[kind=row-data][id='+id+']').find('td[kind=cell]').each(function(){
								$(this).removeClass('hover');
							});
						}
					}
				});

				$('#table_div').find('td[kind=cell]').live({
				
					mouseover: function() {
						if(!highlight_enabled) {
							return;
						}
						if(!tm_click) {
							id = $(this).closest('tr[kind=row-data]').attr('id');
							tr = $('#table_div').find('tr[kind=row-data][id='+id+']');
							ind = $('#table_div').find('tr[kind=row-data][id='+id+']').find('td[kind=cell]').index($(this));

							cat_data = get_category_data($(this));
							col_id = cat_data['col_id'];
							pcol_id = cat_data['pcol_id'];

							row = $('#row-header-tab').find('td[kind=row-header-td][subkind=leaf][id='+id+']');
							row_ind = $('#row-header-tab').find('td[kind=row-header-td][subkind=leaf]').index(row);

							row.addClass('hover');

							$(this).addClass('hover2');

				/*			tr = $('#table_div').find('tr[kind=row-data][id='+id+']');
							for(i=0; i<ind; i++) {
								tr.find('td[kind=cell]:eq('+i+')').addClass('hover');
							}
							for(i=0; i<row_ind; i++) {
								$('#table_div').find('tr[kind=row-data]:eq('+i+')').find('td[kind=cell]:eq('+ind+')').addClass('hover');
							}
							*/

							$('#category-header-div td[kind=category][subkind=leaf][id='+col_id+']').addClass('hover');
						}
					},

					mouseout: function() {
						if(!highlight_enabled) {
							return;
						}
						if(!tm_click) {
							id = $(this).closest('tr[kind=row-data]').attr('id');
							tr = $('#table_div').find('tr[kind=row-data][id='+id+']');
							ind = $('#table_div').find('tr[kind=row-data][id='+id+']').find('td[kind=cell]').index($(this));
	
							cat_data = get_category_data($(this));
							col_id = cat_data['col_id'];
							pcol_id = cat_data['pcol_id'];
	
							$(this).removeClass('hover2');

							$('#row-header-tab').find('td[kind=row-header-td][id='+id+']').removeClass('hover');
							
							$('#table_div').find('tr[kind=row-data][id='+id+']').find('td[kind=cell]').each(function(){
								$(this).removeClass('hover');
							});
							$('#table_div').find('tr[kind=row-data]').each(function(){
								$(this).find('td[kind=cell]:eq('+ind+')').removeClass('hover');
							});
	
							$('#category-header-div td[kind=category][subkind=leaf][id='+col_id+']').removeClass('hover');
						}
					}
				
				});


				function dnd_row_headers() {
					$('#row-header-tab td[kind=row-header-td]').live('mouseover',function(){
						$(this).draggable({ 
							helper: function(e,ui) {
								$this = $(this);
								var $h = $this.css('height');
								var $w = $this.css('width');
								var $clone = $this.clone()
													.css('max-width',$w)
													.css('max-height',$h)
													.css('border','solid')
													.css('z-index','100')
													//.css('background-color','#888888')
													//.css('color','#FFFFFF')
													.css('border-color','#669944')
													.css('border-width','1px');
								return $this;
							},
							distance: "30",
							containment: '#row-header-div',
							//opacity: 0.6,
							cursor: 'move',
							cursorAt: {left: 50, top: 25},
							delay:  0,
							grid: [1,1],
							start: function(e,ui) { 
								fn_hover_tc_cancel_();
							},
							stop: function(e,ui) {
								fn_hover_tc_();
								//$this.css('opacity','1.0');
							}
						});
					});
	
					function checkParent($drag_id, $drop_id) {
						$('#row-header-tab td[kind=row-header-td][pid='+$drag_id+']').each(function() {
							var $id = $(this).attr('id');
							if($id == $drop_id) {
								$('#row-header-tab [id=is-parent]').attr('value','true');
								return true;
							}else{
								return checkParent($id, $drop_id);
							}
						});
					}
	
					function isParent($drag_id, $drop_id) {
						$('#row-header-tab').append('<div id=is-parent value=false></div>');
						checkParent($drag_id, $drop_id);
						var $result = $('#row-header-tab [id=is-parent]').attr('value');
						$('#row-header-tab [id=is-parent]').remove();
						if($result == "true") {
							return true;
						}
					}

    			$('#menu').hover(function(){
        			$('.menu-label').addClass('menu-hover');
    			},function(){
        			$('.menu-label').removeClass('menu-hover');
    			});

    			$('#options').click(function(e){
        			e.stopPropagation();
        			if($('#pane').is(':visible')) {
            			$('#menu').find('#pane').slideToggle(200,function(){$(this).hide()});
        			}else{
            			$('#pane').slideDown(200);
        			}
    			});
			
    			$('.menu-li').hover(function(e){
        			$(this).addClass('menu-li-hover');
    			},function(e){
        			$(this).removeClass('menu-li-hover');
    			});

	
					$('#row-header-tab td[kind=row-header-td][subkind=parent]').live('mouseover', function(){
						$(this).droppable({ 
							hoverClass: "ui-state-highlight",
							drop: function(e, ui) {
								var $drag_pid = ui.draggable.attr('pid');
								var $drag_id = ui.draggable.attr('id');
								var $drag_tr = $('#row-header-div tr[id='+$drag_id+']');
		
								var $drop_id = $(this).attr('id');
								var $drop_tr = $('#row-header-div tr[id='+$drop_id+']');
								var $drop_subkind = $drop_tr.attr('subkind');
		
								if(isParent($drag_id, $drop_id)) {
									alert("ERROR: Cannot move parent category into own subcategories");
									return;
								}
		
								// DRAG & DROP HANDLING
								if($drag_id == $drop_id ||
									$drag_pid == $drop_id) { 
									// Do nothing
								}else{
									// DRAGGING:	LEAF/PARENT --> PARENT
									if($drop_subkind == "parent"){
										adjust_dragged_rows($drag_tr,$drop_tr);
										fnAdjustTitleWidth();
									}
								}
							}
						});
					});
	
					magic = function() {
                    	/*$('#row-header-tab td[kind=row-header-td][subkind=parent]').each(function(){
                        	var $col_span = parseInt($(this).attr('colspan'));
                        	$(this).attr('colspan',$col_span);    
                    	});*/
                    	var $col_span = parseInt($('#row-header-div div[id=level]').attr('max-level'));
                    	$('#row-header-div div[id=level]').attr('max-level',$col_span+1);
						$('#tab [id=product-name]').attr('colspan',$col_span+1);
                    	//$('#row-header-tab').attr('max-depth',$col_span+5);
                	}	
	
					function adjust_dragged_rows($drag_tr,$drop_tr) {
						var $drag_id = $drag_tr.attr('id');
						var $drop_id = $drop_tr.attr('id');
						adjust_row($drag_id,$drop_id);
						recursive_adjust($drag_id,$drop_id);
					}
	
					function recursive_adjust($pid,$drop_id) {
							magic();
						$('#row-header-div td[pid='+$pid+']').each(function() {
							var $id = $(this).attr('id');
							adjust_row($id,$pid);
							recursive_adjust($id,$pid);
						});
					}
	
					function adjust_row($drag_id,$drop_id) {
						var $drag_tr = $('#row-header-div tr[id='+$drag_id+']');
						var $drop_tr = $('#row-header-div tr[id='+$drop_id+']');

						var $drag_body_tr = $('#table_div tr[id='+$drag_id+']');
						var $drop_body_tr = $('#table_div tr[id='+$drop_id+']');
	
						var $drag_subkind = $drag_tr.attr('subkind');
						var $drag_indent = $drag_tr.find('[class=indent]').length;
	
						var $drop_level = $drop_tr.attr('level');
						var $drop_indent = $drop_tr.find('[class=indent]').length;
	
						var $max_depth = $('#row-header-tab').attr('max-depth');
						var $max_len = $('#max_len').attr('value');
	
						var $new_indent = $drop_indent + 1;
						var $new_level = parseInt($drop_level) + 1;

						// Move Header row
						$drag_tr.insertAfter($drop_tr).find('td[kind=row-header-td]').highlight();
						$drag_body_tr.insertAfter($drop_body_tr).find('td[kind=cell],td[kind=row-filler-td]').highlight();

						if($drag_subkind == "leaf") {
							$new_indent++; //compensate extra indent due to expander icon.
						}
	
						$drag_tr.find('[class=indent]').remove();
	
						var $col_span = $max_depth - $new_level;
	
						for($i=0; $i<$new_indent; $i++) {
							$drag_tr.prepend("<td class=indent>    </td>");
						}
	
						$col_span = $max_depth - $drop_level - 2;

						if($new_indent > $max_depth) {
							$('#row-header-tab').attr('max-depth',++$max_depth);
						}
	
						$drag_tr.attr('pid',$drop_tr.attr('id'))
								.attr('level',$new_level);

							//$drag_tr.find('td[kind=row-header-td]').attr('colspan',$col_span)
										  				//.attr('pid',$drop_tr.attr('id'));
						$drag_tr.find('td[kind=row-header-td]').attr('pid',$drop_tr.attr('id'));
						
						$drag_body_tr.attr('pid',$drop_body_tr.attr('id'));

						// Adjust height to match row header
						$drag_body_tr.sync_height_row_header();
						$drop_body_tr.sync_height_row_header();
						
						// Dirty
						pid_orig 	=  $drag_tr.find('#original-name').attr('pid');
						pid_new 	=  $drop_tr.attr('id');
						if(pid_orig != pid_new) {
							if(!$drag_tr.find('td[kind=row-header-td]').hasClass('dirty')) {
								$drag_tr.find('td[kind=row-header-td]').addClass('dirty');
								$drag_tr.find('td[kind=row-header-td]').attr('action','move');
							}
						}else{
							if($drag_tr.find('td[kind=row-header-td]').hasClass('dirty')) {
								$drag_tr.find('td[kind=row-header-td]').removeClass('dirty');
							}
							if($drag_tr.find('td[kind=row-header-td]').attr('action') != undefined) {
								$drag_tr.find('td[kind=row-header-td]').removeAttr('action');
							}
						}
	
					}
				}

				dnd_row_headers();

				// ********* DnD Table Column Headers ************************* //
				function dnd_column_headers() {
					$('#category-header-div td[kind=category][subkind=leaf]').live('mouseover',function(){
						$(this).draggable({ 
							helper: function(e,ui) {
								$this = $(this);
								var $h = $this.css('height');
								var $w = $this.css('width');
								var $clone = $this.clone()
													.css('max-width',$w)
													.css('max-height',$h)
													.css('border','solid')
													.css('z-index','1')
													.css('border-color','#669944')
													.css('border-width','1px');
								return $this;
							},
							distance: "30",
							//containment: '#row-header-div',
							opacity: 0.8,
							cursor: 'move',
							cursorAt: {left: 50, top: 25},
							delay:  0,
							grid: [1,1],
							start: function(e,ui) { 
								fn_hover_cc_cancel_();
							},
							stop: function(e,ui) {
								fn_hover_cc_();
							}
						});
					});
	
					$('#category-header-div td[kind=category][subkind=parent]').live('mouseover', function(){
						$(this).droppable({ 
							hoverClass: "ui-state-highlight",
							drop: function(e, ui) {
								var $drag_pid = ui.draggable.attr('pid');
								var $drag_id = ui.draggable.attr('id');
								var $drag_td = $('#category-header-div td[kind=category][subkind=leaf][pid='+$drag_pid+'][id='+$drag_id+']');
								var $drag_parent = $('#category-header-div td[kind=category][subkind=parent][id='+$drag_pid+']');
								var $drag_colspan = parseInt($drag_parent.attr('colspan'));
		
								var $drop_id = $(this).attr('id');
								var $drop_subkind = $(this).attr('subkind');
								var $drop_td = $('#category-header-div td[kind=category][pid='+$drop_id+']');
								var $drop_colspan = parseInt($(this).attr('colspan'));
								var $drop_parent = $(this);

								var $source_index = $('#category-header-div td[kind=category][subkind=leaf]').index($drag_td);
								var $target_index = $('#category-header-div td[kind=category][subkind=leaf]').index($drop_td)+$drop_colspan-1;

								// DRAG & DROP HANDLING
								if($drag_pid == $drop_id) { 
									// Do nothing
								}else{
									// DRAGGING:	LEAF/PARENT --> PARENT
									if($drop_subkind == "parent"){
										if($drag_parent.attr('colspan') <= 1) {
											var ret = confirm("Remove Column Header \""+
															$drag_parent.find('span').html()+"\"?");
											if(ret) {
												$drag_parent.remove();
											}else{
												return;
											}
										}
										$drag_td.attr('pid',$drop_id);
										if($drop_parent.hasClass('odd-plat')) {
											$drag_td.removeClass('even-plat');
											$drag_td.addClass('odd-plat');
										}else if($drop_parent.hasClass('even-plat')) {
											$drag_td.removeClass('odd-plat');
											$drag_td.addClass('even-plat');
										}

										pid_orig 	=  $drag_td.find('#original-name').attr('pid');
										pid_new 	=  $drop_parent.find('span').html();
										if(pid_orig != pid_new) {
											if(!$drag_td.hasClass('dirty')) {
												$drag_td.addClass('dirty');
											}
										}else{
											if($drag_td.hasClass('dirty')) {
												$drag_td.removeClass('dirty');
											}
										}
										//$drag_td.addClass('dirty');
										$drag_parent.attr('colspan',$drag_colspan-1);
										$drop_parent.attr('colspan',$drop_colspan+1);
										$('#category-header-div td[kind=category][subkind=leaf]').eq($target_index).after($drag_td);
										swap_data_columns($source_index, $target_index);
									}
										//remove_data_column($source_index);
								}
							}
						});
					});
	
					swap_data_columns = function($src_ind, $dst_ind) {
						$('#table_div tr[kind=row-data]').each(function() {
							var $src_td = $(this).find('td[kind=cell]:eq('+$src_ind+')');
							var $dst_td = $(this).find('td[kind=cell]:eq('+$dst_ind+')');
							$dst_td.after($src_td);
						});
					}

					remove_data_column = function($ind) {
						$('#table_div tr[kind=row-data]').each(function() {
							$(this).find('td[kind=cell]:eq('+$ind+')').remove();
						});
					}

				}

				dnd_column_headers();

				// ********** Handle test case column expand-collapse **** //

				// Add hand pointer to +/- expand/collapse icons.
				$('td[kind=expand-icon]').addClass('pointer');
				var parent_hidden = false;
				$('td[kind=expand-icon]').live('click',function()	{
					$(this).text($(this).text() == '-' ? '+' : '-'); 
					var tc_id = $(this).attr('id');
					if($('tr[pid='+tc_id+']').hasClass('hide')) {
						$('tr[pid='+tc_id+']').removeClass('hide');	
						parent_hidden = false;
					}else{
						$('tr[pid='+tc_id+']').addClass('hide');	
						parent_hidden = true;
					}

					get_ids($('tr[pid='+tc_id+']'));

					$('div[id=id-collection]').each(function(index, obj) {
						var tid = $(obj).attr('tid');
						if(parent_hidden) {
							if(!$('tr[pid='+tid+']').hasClass('hide')) {
								$('tr[pid='+tid+']').addClass('hide');
							}
						}else{
							if($('tr[pid='+tid+']').hasClass('hide')) {
								if($('td[kind=expand-icon][id='+tid+']').text() == '-') {
									$('tr[pid='+tid+']').removeClass('hide');
								}
							}
						}
					});
					$('div[id=id-collection]').remove();
					fnAdjustTitleWidth();
					fnAdjustSize();
				});
			});
