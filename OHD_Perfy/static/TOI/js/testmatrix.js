var enableHover = true;
var max_id = -1;
var ajax = false;
var col_length = 14 //Text field max is 20
var list_tree_panel;
var isRightFloat=false;
var isLeftFloat=false;
var first=true;
var modifying = false;
var pie_data = null;
var automated_bar_data = null;
var TIMEOUT=300000;
var permission = -1;
var get_breakdown_in_progress = false;
var get_automated_in_progress = false;
var get_bugs_in_progress = false;
var bug_url = "https://bug.oraclecorp.com/pls/bug/webbug_print.show?c_rptno=";
var cr_url = "http://monaco.us.oracle.com/detail.jsf?cr=%09+";

function get_product_id(obj) {
	id = $('.product-label').attr('id');
	if(!obj){
		if(id == undefined){
			return []; // Most likely test case menu
		}else{
			ids = [];
			$('.col').each(function(){
				productid = $(this).attr('productid');
				found = false;
				for(i=0;i<ids.length;i++)
					if(ids[i] == productid)
						found=true;
				if(!found) {
					ids.push(productid);
				}
			});
			if(ids.length == 0) {
				return [id]
			}
			return ids;
		}
	}else{
		if(obj.hasClass('col') || obj.hasClass('sub-col') || obj.hasClass('col-product')) {
			return obj.attr('productid');
		}else if(obj.hasClass('cell')){
			return $('.sub-col:eq('+obj.index()+')').attr('productid');
		}else{
			return [];
		}
	}
}

function isMergeView() {
	if($('.col-product').length == 0)
		return false;
	else
		return true;
}

function fn_cell_popup_delete(cell) {   
	if(!confirm("Are you sure you want to delete this test matrix cell?"))
		return;
	if(cell.attr('id') > 0) {
                cell.text("");
                cell.removeClass('pass fail testing untested skipped').removeClass('dirty');
		commit_delete(cell);	
		cell.removeAttr('id');
	}
}

function fn_cell_popup_edit(cell) {   
	if(cell.attr('id') > 0) {
		var id = cell.attr('id');
		url = "/status/"+$('.sub-col:eq('+cell.index()+')').attr('productid')+"/"+id;
		window.open(url,'TestResult','width=800,height=750,scrollbars=1');
	}
}

function fn_li_leaf_popup_set_all(li) {   
	if(confirm("Are you sure you want to insert 'U' cells in all empty columns for \""+li.text().trim()+"\" ?"))
		commit_set_all(li);
}

//new feature for superuser to pass all columns
function fn_li_leaf_popup_set_all_pass(li) {
	if(confirm("Are you sure you want to insert 'P' cells in all 'U'cells for \""+li.text().trim()+"\" ?"))
		commit_set_pass(li);
}

function fn_li_leaf_popup_set_none(li) {   
	if(confirm("Are you sure you want to clear all 'U' cells from all columns for \""+li.text().trim()+"\" ?"))
		commit_set_none(li);
}

function fn_li_parent_popup_set_all(parent_label) {   
	if(confirm("Are you sure you want to insert 'U' cells in all empty columns for \""+parent_label.text().trim()+"\" ?"))
		commit_set_all(parent_label.parent());
}

function fn_li_parent_popup_set_none(parent_label) {   
	if(confirm("Are you sure you want to clear all 'U' cells from all columns for \""+parent_label.text().trim()+"\" ?"))
		commit_set_none(parent_label.parent());
}

function fn_sub_col_popup_set_all(sub_col) {   
	if(confirm("Are you sure you want to insert 'U' in all empty cells for \""+sub_col.text().trim()+"\" ?"))
		commit_set_all(sub_col);
}

//new feature for superuser to pass all columns
function fn_sub_col_popup_set_all_pass(li) {
	if(confirm("Are you sure you want to insert 'P' cells in all 'U' cells for \""+li.text().trim()+"\" ?"))
		commit_set_pass(li);
}

function fn_sub_col_popup_set_none(sub_col) {   
	if(confirm("Are you sure you want to clear all 'U' cells from \""+sub_col.text().trim()+"\" ?"))
		commit_set_none(sub_col);
}

function fn_col_popup_set_all(col) {   
	if(confirm("Are you sure you want to insert 'U' in all empty cells for \""+col.text().trim()+"\" ?"))
		commit_set_all(col);
}

function fn_col_popup_set_none(col) {   
	if(confirm("Are you sure you want to clear all 'U' cells from \""+col.text().trim()+"\" ?"))
		commit_set_none(col);
}

function fn_li_leaf_popup_clone(li, new_tc_id, new_tc_name) {
    var id = li.attr('id');
    var new_id = get_id(); // Get next unique ID to assign.
    	if(new_tc_id != undefined)
	    new_id = new_tc_id
    var tr = $('#cell-table').find('tr[id='+id+']');
    var li_clone = li.clone();
        li_clone.attr('orig-id',id);
        li_clone.attr('id',new_id);
    var new_name = li.find('a').text()+" clone";
    	if(new_tc_name != undefined)
	    new_name = new_tc_name;
        li_clone.find('a').text(new_name);
    var tr_clone = tr.clone();
	tr_clone.find('.cell').each(function(){
		var td = $(this);
		if(td.hasClass('pass') || td.hasClass('fail') || td.hasClass('testing') || td.hasClass('untested')) {
        	td.replaceWith($("<td id="+get_id()+" class=\"cell untested\"><a>U</a></td>"));
		}
        tr_clone.attr('id',new_id);
	});
    $(li_clone).insertAfter(li).highlight().addClass('dirty');
    $(tr_clone).insertAfter(tr).find('.cell').each(function(){
		if($(this).text().trim() != "")
			$(this).highlight().addClass('dirty');
		});
    // Trigger enable popup event
    $(li_clone).trigger('popup_event');
    // Trigger li-leaf dnd event    
    $(li_clone).trigger('leaf_dnd');
    // Editable
    //$(li_clone).find('a').editable();
	commit_clone(li_clone);
}

function fn_li_leaf_popup_delete(li) {
    var id = li.attr('id'); // LI to delete
    var tr = $('#cell-table').find('tr[id='+id+']'); // TR to delete
    if(confirm('Are you sure you want to delete "'+li.text().trim()+'" ?')) {
		commit_delete(li);
        li.remove();
        tr.remove();
    }
}

function fn_li_parent_popup_clone(parent_label) {
    var li = parent_label.parent();
    var li_clone = li.clone();
    var tr_ref = $('#cell-table') // Get the last leaf of parent 
                    .find('tr[id='+li // for ref after which you will 
                          .find('.li-leaf:last') // add the cloned
                              .attr('id')+']');  // rows.
	if(tr_ref.html() == null) {
    	tr_ref = $('#cell-table') // Get the last leaf of parent 
                    .find('tr[id='+li // for ref after which you will 
                          .attr('id')+']');  // rows.
	}
    $(li_clone).insertAfter(li);
    li_clone.find('.li-leaf, .li-parent-label').each(function() {
        var id = -1;
        var new_id = get_id();
        
        if($(this).hasClass('li-leaf')) {
            $(this).find('a').text($(this)
                                       .find('a').text());
            id = $(this).attr('id'); // For pulling up "tr" 
                                     // based on li-leaf
            $(this).attr('orig-id',id); 
            $(this).attr('id',new_id).highlight().addClass('dirty'); // Change ID of
                                                   // leaf li.
            // Trigger enable popup event
            $(this).trigger('popup_event');
            // Trigger li-leaf dnd event    
            $(this).trigger('leaf_dnd');
            // Editable
            //$(this).find('a').editable();
        } else if($(this).hasClass('li-parent-label')) {
            $(this).text($(this).text());
            id = $(this).parent().attr('id'); // For pulling up "tr" 
                                              // based on li-parent
            $(this).parent().attr('orig-id',id); 
            $(this).parent().attr('id',new_id).highlight().addClass('dirty'); // Change ID of 
                                                            // parent li.
            // Trigger enable popup event
            $(this).trigger('popup_event');
            // Trigger parent dnd event 
            $(this).parent().trigger('parent_drag');
            $(this).trigger('parent_drop'); 
            // Editable
            //$(this).editable();
        }    
        var tr = $('#cell-table').find('tr[id='+id+']');
    	var tr_clone = tr.clone();
		tr_clone.find('.cell').each(function(){
			var td = $(this);
			if(td.hasClass('pass') || td.hasClass('fail') || td.hasClass('testing') || td.hasClass('untested')) {
        		td.replaceWith($("<td id="+get_id()+" class=\"cell untested\"><a>U</a></td>"));
			}
        	tr_clone.attr('id',new_id);
		});
        tr_clone.attr('id',new_id); 
        $(tr_clone).insertAfter(tr_ref).find('.cell').each(function(){
			if($(this).text().trim() != "")
				$(this).highlight().addClass('dirty');
			});
        tr_ref = tr_clone; // Move reference row to latest cloned row.
    });
        var my_label = li_clone.find('.tc-parent-label:first').find('.tc-name');
        my_label.text(my_label.text()+" clone");
	commit_clone(li_clone);
}

function fn_li_parent_popup_delete(parent_label) {
    var li = parent_label.parent();
    if(confirm('Are you sure you want to delete "'
               +parent_label.text()+'" ?')) {
		commit_delete(li);
        li.find('.li-leaf, .li-parent-label').each(function() {
            var id = -1;
            if($(this).hasClass('li-leaf')) {
                id = $(this).attr('id'); // For pulling up "tr" 
                                         // based on li-leaf
            } else if($(this).hasClass('li-parent-label')) {
                id = $(this).parent().attr('id'); // For pulling up "tr" 
                                                  // based on li-parent
            }   
            var tr = $('#cell-table').find('tr[id='+id+']');
            tr.remove();
        });
        $('#cell-table').find('tr[id='+li.attr('id')+']').remove();
        li.remove();
    }
}

function fn_li_parent_popup_insert_leaf(parent_label) {
    var li = parent_label.parent();
    var id = li.attr('id');
    var new_id = get_id();
    var tr = $('#cell-table').find('tr[id='+id+']');
    var insert_li = $('.helper .li-parent-helper .li-leaf').clone();
        insert_li.find('a').text('leaf '+new_id);
        insert_li.attr('id',new_id);
	// If table has no columns, add some
	if($('#cell-table').length > 0 && $('.column-header-panel .sub-col').length == 0){
		fn_product_popup_insert_col(id);
	}
    var insert_tr =  "<tr class=\"row\" id='"+new_id+"'>";
        for(var i=0; i < $('.column-header-panel .sub-col').length; i++) {
            insert_tr += "<td id="+get_id()+" class=\"cell untested\"><a>U</a></td>";
        }
        insert_tr += "</tr>";
    var ul = li.find('.ul:first');
    if(ul.children('.li-leaf').length == 0) { // Adding to 'li=leaf
        ul.prepend(insert_li).highlight().addClass('dirty');    // 'less parent
    }else{ // Adding to parent with at least on li-leaf
        insert_li.insertBefore(ul.find('.li-leaf:first')).highlight().addClass('dirty');
    }   
    $(insert_tr).insertAfter(tr).find('.cell').each(function(){
			if($(this).text().trim() != "")
				$(this).highlight().addClass('dirty');
			});
    // Trigger enable popup event
    insert_li.trigger('popup_event');
    // Trigger li-leaf dnd event    
    insert_li.trigger('leaf_dnd');
    // Editable
    //insert_li.find('a').editable();
	commit_insert(parent_label, insert_li);
}

function fn_li_parent_popup_insert_parent(parent_label) {
    var li = parent_label.parent();
    var id = li.attr('id');
    var new_id = get_id();
    var tr = $('#cell-table').find('tr[id='+id+']');
    var insert_li = $('.helper .li-parent-helper .li-parent').clone();
        insert_li.find('.li-leaf').remove();
        insert_li.find('.li-parent-label').text('Parent '+new_id);
        insert_li.attr('id',new_id);
    var insert_tr =  "<tr class=\"row-filler\" id='"+new_id+"'></tr>";
    var ul = li.find('.ul:first');
    if(ul.children('.li-leaf').length == 0) { // Adding to 'li-leaf'
        ul.prepend(insert_li).highlight().addClass('dirty');    // 'less parent
    }else{ // Adding to parent with at least on li-leaf
        insert_li.insertBefore(ul.find('.li-leaf:first')).highlight().addClass('dirty');
    }   
    $(insert_tr).insertAfter(tr).find('.cell').each(function(){
			if($(this).text().trim() != "")
				$(this).highlight().addClass('dirty');
			});
    // Trigger enable popup event
    insert_li.find('.li-parent-label').trigger('popup_event');
    // Trigger li-parent dnd event    
    insert_li.trigger('parent_drag');
    insert_li.find('.li-parent-label').trigger('parent_drop'); 
    // Editable
    //insert_li.find('.li-parent-label').editable();
	commit_insert(parent_label, insert_li);
}

function fn_sub_col_popup_clone(sub_col) {   
    var sub_col_index = sub_col.index();
    var col_index     = getColIndex(sub_col);
    var col           = $('.col:eq('+col_index+')');
    var col_span      = col.attr('colspan');
    var sub_col_clone = sub_col.clone();
   	// col-product where sub_col is being cloned under (merge view)
    var mcol_index = getMColIndex(sub_col);
    var mcol = $('.col-product:eq('+mcol_index+')');
    // Increment colspan for col
    col.attr('colspan',Number(col_span)+1);
    // Increment colspan for col-product (merge view)
    mcol.attr('colspan',Number(mcol.attr('colspan'))+1);
    // Clone and insert sub-col
    sub_col_clone.insertAfter(sub_col).highlight().addClass('dirty');
    sub_col_clone.text(sub_col.text().substring(0,col_length-1)+" clone");
    // Clone and insert corresponding cells
    $('#cell-table').find('.row').each(function(){
        var td = $(this).find('td:eq('+sub_col_index+')');
        var td_clone = $("<td class=\"cell\"></td>");
		if(td.hasClass('pass') || td.hasClass('fail') || td.hasClass('testing') || td.hasClass('untested')) {
        	td_clone = $("<td id="+get_id()+" class=\"cell untested\"><a>U</a></td>");
		}
        td_clone.insertAfter(td).highlight();
		if(td_clone.text().trim() != "")
			td_clone.addClass('dirty');
    });
    // Trigger enable popup event
    sub_col_clone.trigger('popup_event'); 
    // Trigger sub-col dnd event    
    sub_col_clone.trigger('sub_col_dnd');
    // Editable
    sub_col_clone.editable();
	commit_clone(sub_col_clone);
    beautify();
}

function fn_sub_col_popup_delete(sub_col) {
    var sub_col_index = sub_col.index();
    var col_index     = getColIndex(sub_col);
    var col           = $('.col:eq('+col_index+')');
    var col_span      = col.attr('colspan');
	
   	// col-product where sub_col is being cloned under (merge view)
    var mcol_index = getMColIndex(sub_col);
    var mcol = $('.col-product:eq('+mcol_index+')');
    var mcol_span = mcol.attr('colspan');

    // col-product handling (merge view)
    if(mcol_span <= 1) {
		alert("Cannot delete products \""+mcol.html()+"\" in Merge View");
        return;
    }
    if(confirm("Delete "+sub_col.text()+"?")) {
		commit_delete(sub_col);
        // Col handling
        if(col_span > 1) {
            col.attr('colspan',Number(col_span)-1);
        }else{
            if(confirm("Delete "+col.html()+"?")) {
                col.remove();
            }else{
                return;
            }
        }
        // col-product handling (merge view)
        if(mcol_span > 1) {
            mcol.attr('colspan',Number(mcol_span)-1);
        }else{
            mcol.remove();
        }
        // Delete sub-col
        sub_col.remove();
        // Delete corresponding cells
        $('#cell-table').find('.row').each(function(){
            $(this).find('td:eq('+sub_col_index+')').remove();
        });
    beautify();
    }
}

function fn_col_popup_clone(col) {
    var col_index = col.index();
    var colspan = Number(col.attr('colspan'));
    var sub_col_index = getNonColspanIndex(col);
    // Clone col
    var col_clone = col.clone();
    col_clone.insertAfter(col).highlight().addClass('dirty');
    col_clone.text(col_clone.text().substring(0,col_length-1)+" clone");
   	// Col-product where col is being cloned under (merge view)
    var mcol_index = getMColIndex($('.sub-col:eq('+sub_col_index+')'));
    var mcol = $('.col-product:eq('+mcol_index+')');
    // Trigger enable popup event
    col_clone.trigger('popup_event'); 
    // Editable
    col_clone.editable();
    for(var i=0; i<colspan; i++) {
        var src = sub_col_index+i;
        var target = Number(sub_col_index+colspan+i-1);
        // Clone sub-col and insert at the end (sub_col_index+colspan)
        var sub_col = $('.sub-col:eq('+src+')');
        var sub_col_target = $('.sub-col:eq('+target+')');
        var sub_col_clone = sub_col.clone();
        sub_col_clone.insertAfter(sub_col_target).highlight().addClass('dirty');
        //sub_col_clone.text(sub_col_clone.text().substring(0,col_length-1)+" clone");
        // Add colspan to col-product (merge view)
        mcol.attr('colspan',
                     Number(mcol.attr('colspan'))+1);
        // Trigger enable popup event
        sub_col_clone.trigger('popup_event'); 
        // Trigger sub-col dnd event    
        sub_col_clone.trigger('sub_col_dnd');
        // Editable
        sub_col_clone.editable();
        // Clone corresponding cells and insert at the end
        $('#cell-table').find('.row').each(function(){
            var td = $(this).find('td:eq('+src+')');
            var td_target = $(this).find('td:eq('+target+')');
        	var td_clone = $("<td class=\"cell\"></td>");
			if(td.hasClass('pass') || td.hasClass('fail') || td.hasClass('testing') || td.hasClass('untested')) {
        		td_clone = $("<td id="+get_id()+" class=\"cell untested\"><a>U</a></td>");
			}
            td_clone.insertAfter(td_target).highlight();
			if(td_clone.text().trim() != "")
				td_clone.addClass('dirty');
        });
    }  
	commit_clone(col_clone);
    beautify();
}

function fn_col_popup_delete(col) {
    var col_index = col.index();
    var colspan = col.attr('colspan');
    var sub_col_index = getNonColspanIndex(col);
	
   	// col-product where col is being deleted from (merge view)
    var mcol_index = getMColIndex($('.sub-col:eq('+sub_col_index+')'));
    var mcol = $('.col-product:eq('+mcol_index+')');

 	// col-product handling (merge view)
   	if(Number(mcol.attr('colspan')) <= 1) {
		alert("Cannot delete products \""+mcol.html()+"\" in Merge View");
       	return;
    }
    if(confirm("Delete \""+col.text()+"\" and its sub columns?")) {
		commit_delete(col);
        // Remove col
        col.remove();
        for(var i=0; i<colspan; i++) {
			var sub_col = $('.sub-col:eq('+sub_col_index+')')
            // Remove sub-col
            sub_col.remove();
            // Remove corresponding cells
            $('#cell-table').find('.row').each(function(){
                $(this).find('td:eq('+sub_col_index+')').remove();
            });
        	// col-product handling (merge view)
        	if(Number(mcol.attr('colspan')) > 1) {
            	mcol.attr('colspan',Number(mcol.attr('colspan'))-1);
        	}else{
               	mcol.remove();
        	}
        }  
    beautify();
    }
}

function fn_col_popup_insert(col) {
    var col_index = col.index();
    var colspan = Number(col.attr('colspan'));
    var sub_col_index = getNonColspanIndex(col);
    var productid = col.attr('productid');
   	// col-product where col is being inserted under (merge view)
    var mcol_index = getMColIndex($('.sub-col:eq('+sub_col_index+')'));
    var mcol = $('.col-product:eq('+mcol_index+')');
    // Increase col colspan
    col.attr('colspan',colspan+1);
    // Increase mcol colspan
    mcol.attr('colspan',Number(mcol.attr('colspan'))+1);
    // Insert new sub-col at the beginning (sub_col_index)
    var sub_col = $("<td colspan=1 class=\"sub-col\" productid="+productid+">Untitled</td>");
    var sub_col_target = $('.sub-col:eq('+sub_col_index+')');
    sub_col.insertBefore(sub_col_target).highlight().addClass('dirty');
    // Trigger enable popup event
    sub_col.trigger('popup_event'); 
    // Trigger sub-col dnd event    
    sub_col.trigger('sub_col_dnd');
    // Editable
    sub_col.editable();
    // Clone corresponding cells and insert at the beginning
    $('#cell-table').find('.row').each(function(){
        var td = $("<td id="+get_id()+" class=\"cell untested\"><a>U</a></td>");
        var td_target = $(this).find('td:eq('+sub_col_index+')');
        td.insertBefore(td_target).highlight().addClass('dirty');
    });
	commit_insert(col, sub_col);
    beautify();
}

function fn_product_popup_insert_tc(arg) {
	$('.testcases').click();
}

function fn_product_popup_insert_parent(arg) {
    var new_id = get_id();
    var insert_li = $('.helper .li-parent-helper .li-parent').clone();
        insert_li.find('.li-leaf').remove();
        insert_li.find('.li-parent-label').text('Parent '+new_id);
        insert_li.attr('id',new_id);
    var insert_tr =  "<tr class=\"row-filler\" id='"+new_id+"'><td class=\"filler-td\"></td></tr>";
	var ul = $('.ul-main');
    if(ul.children('.li-leaf').length == 0) { // Adding to 'li-leaf'
        ul.prepend(insert_li).highlight().addClass('dirty');    // 'less parent
    }   
	$('#cell-table').prepend(insert_tr).highlight().addClass('dirty');
    $(insert_tr).find('.cell').each(function(){
			if($(this).text().trim() != "")
				$(this).highlight().addClass('dirty');
			});
    // Trigger enable popup event
    insert_li.find('.li-parent-label').trigger('popup_event');
    // Trigger li-parent dnd event    
    insert_li.trigger('parent_drag');
    insert_li.find('.li-parent-label').trigger('parent_drop'); 
    // Editable
    //insert_li.find('.li-parent-label').editable();
	commit_insert(undefined, insert_li);
}

function fn_product_popup_insert_col(arg) {
	var col = $("<td colspan=1 class=\"col\" productid="+$('.product-label').attr('id')+">col"+get_id()+"</td>");
	var sub_col = $("<td colspan=1 class=\"sub-col\" productid="+$('.product-label').attr('id')+">sub-col"+get_id()+"</td>");
	$('.col-row').prepend(col).addClass('dirty');
	$('.sub-col-row').prepend(sub_col).addClass('dirty');
    $('#cell-table').find('.row').each(function(){
        var td = $("<td id="+get_id()+" class=\"cell untested\"><a>U</a></td>");
        var td_target = $(this).find('td:eq(0)');
        td.insertBefore(td_target).highlight().addClass('dirty');
    });
    // Trigger enable popup event
    col.trigger('popup_event'); 
    // Editable
    col.editable();
    // Trigger enable popup event
    sub_col.trigger('popup_event'); 
    // Trigger sub-col dnd event    
    sub_col.trigger('sub_col_dnd');
    // Editable
    sub_col.editable();
	commit_insert(col, sub_col);
    beautify();
}

function init_cell_popup() {
    // Popup Menus
    var cell_popup = $("<div id=\"cell_popup\"><table>"+
                    "<tr><span id=\"edit\">View/Edit</span></tr>"+
                     "<tr><span id=\"delete\">Delete</span></tr>"+
                                               "</table></div>");
    
    // Handle Dialog (popup_events) for existing as well as future 
    // cell elements.
    $('#cell-table').on({
        'popup_event': function(){
            if($(this).text().trim().length > 0) {
                $(this).popup(cell_popup);
            }
        }
    },'.cell');
    
    // Setup Dialogs for existing cell elements
    $('#cell-table').find('.cell').each(function(){
        $(this).trigger('popup_event');
    });
    
}

function init_product_popup() {
    var product_popup = $("<div id=\"product_popup\"><table>"+
          "<tr><span id=\"insert_col\">Insert Column</span></tr>"+
    "<tr><span id=\"insert_tc\" >Add Existing Testcases</span></tr>"+
    //"<tr><span id=\"insert_parent\" >Create New Testcase</span></tr>"+
                                               "</table></div>");
	$('.product-label').popup(product_popup);
}

function init_tree_popup() {
    // Popup Menus
    var li_leaf_popup = $("<div id=\"li_leaf_popup\"><table>"+
                      //"<tr><span id=\"clone\" >Clone</span></tr>"+
                     "<tr><span id=\"delete\">Delete</span></tr>"+
                   "<tr><span id=\"set_all\">Set All</span></tr>"+
                 "<tr><span id=\"set_none\">Set None</span></tr>"+
                                               "</table></div>");
    
    var li_parent_popup = $("<div id=\"li_parent_popup\">"+
                                                           "<table>"+
 //"<tr><span id=\"insert_parent\">Insert Parent Testcase</span></tr>"+
     //"<tr><span id=\"insert_leaf\">Insert Leaf Testcase</span></tr>"+
                          //"<tr><span id=\"clone\">Clone</span></tr>"+
                        "<tr><span id=\"delete\">Delete</span></tr>"+
                 	  "<tr><span id=\"set_all\">Set All</span></tr>"+
                 	"<tr><span id=\"set_none\">Set None</span></tr>"+
                                                  "</table></div>");

    // Handle Dialog (popup_events) for existing as well as future 
    // tree elements.
    list_tree_panel.on({
        'popup_event': function(){
            if($(this).hasClass('li-leaf')) {
                $(this).popup(li_leaf_popup);
            }else if($(this).hasClass('li-parent-label')) {
                $(this).popup(li_parent_popup);
            }
        }
    },'.li-leaf, .li-parent-label');
    
    // Setup Dialogs for existing tree elements
    $('.li-leaf, .li-parent-label').each(function(){
        $(this).trigger('popup_event');
    });
    
}

function init_col_popup() {
    // Popup Menus
    //if user is superuser
    if (superuser){
    	var sub_col_popup = $("<div id=\"sub_col_popup\"><table>"+
            "<tr><span id=\"clone\" >Clone</span></tr>"+
            "<tr><span id=\"delete\">Delete</span></tr>"+
            "<tr><span id=\"set_all\">Set All</span></tr>"+
            "<tr><span id=\"set_none\">Set None</span></tr>"+
 	    "<tr><span id=\"set_all_pass\">Set All Pass</span></tr>"+
                                            "</table></div>");
    } else {
        var sub_col_popup = $("<div id=\"sub_col_popup\"><table>"+
            "<tr><span id=\"clone\" >Clone</span></tr>"+
            "<tr><span id=\"delete\">Delete</span></tr>"+
            "<tr><span id=\"set_all\">Set All</span></tr>"+
            "<tr><span id=\"set_none\">Set None</span></tr>"+
                                         "</table></div>");
	}
    var col_popup = $("<div id=\"col_popup\"><table>"+
              "<tr><span id=\"insert\">Insert Sub Col</span></tr>"+
                          "<tr><span id=\"clone\">Clone</span></tr>"+
                        "<tr><span id=\"delete\">Delete</span></tr>"+
                 	"<tr><span id=\"set_all\">Set All</span></tr>"+
                 	"<tr><span id=\"set_none\">Set None</span></tr>"+
                      "</table></div>");
    
    // Handle Dialog (popup_events) for existing as well as future 
    // sub-col and col elements.
    $('.column-header-panel').on({
        'popup_event': function(){
            if($(this).hasClass('sub-col')) {
                $(this).popup(sub_col_popup);
            }else if($(this).hasClass('col')) {
                $(this).popup(col_popup);
            }
        }
    },'.sub-col, .col');
    
    // Setup Dialogs
    $('.sub-col, .col').each(function(){
        $(this).trigger('popup_event');
    });
}

function init_col_dnd() {
    // Set "sub-col" items to draggable
    $('.sub-col-row').on({
        'sub_col_dnd': function() { 
            $(this).draggable({ 
                revert: true, 
                helper: function(e,ui) {
                    enableHover=true;
                    return $(this).clone();
                },
                cursorAt: { top: 5, left: 5 },
                opacity: 0.6,
                //containment: ".column-header-panel",
            });
            $(this).droppable({
                tolerance:'pointer',
                hoverClass: "drag",
                accept: function(d) { 
                    if(d.hasClass("sub-col")){ 
                        return true;
                    }
                },
                drop: function( e, ui ) {
                    e.stopPropagation();
                    var src = $(ui.draggable);
                    var dest = $(this);
                    var src_index  = src.index();
                    var dest_index = dest.index();
                    swap('.sub-col',src, dest); 
                    // Move corresponding cells from src col to dest col
                    $('#cell-table').find('.row').each(function(){
                        var src = $(this).find('.cell:eq('+src_index+')');
                        var dest = $(this).find('.cell:eq('+dest_index+')');
                        swap('.row[id='+$(this).attr('id')+'] .cell',
                             src,dest);             
                    });
					commit_drag(src,dest);
					sync_columns_cells();
    				fnAdjustSize();
                }
            });
        }
    },'.sub-col'); 
    $('.sub-col').trigger('sub_col_dnd');
    
    // "col" parent column droppable handling
    $('.col-row').on({
        'col_dnd': function() {
            $(this).droppable({
                tolerance:'pointer',
                hoverClass: "drag",
                accept: function(d) { 
                    if(d.hasClass("sub-col")){ 
                        return true;
                    }
                },
                drop: function( e, ui ) {
                    e.stopPropagation();

					// dest col to where sub_col is being dragged (this)
                    var $col_index = $(this).index();
                    var $col_colspan = $(this).attr('colspan');
                    var $sub_col_index = getNonColspanIndex($(this));
                    var productid_dest = $(this).attr('productid');
					
				   	// dest col-product to where sub_col is being dragged to (merge view)
                    var dest_mcol_index = getMColIndex($('.sub-col:eq('+$sub_col_index+')'));
                    var dest_mcol = $('.col-product:eq('+dest_mcol_index+')');
                    var dest_mcol_span = dest_mcol.attr('colspan');
                   
				   	// src col from where sub_col is being dragged
                    var src_col_index = getColIndex(ui.draggable);
                    var src_col = $('.col:eq('+src_col_index+')');
                    var src_col_span = src_col.attr('colspan');
                    
				   	// src col-product from where sub_col is being dragged (merge view)
                    var src_mcol_index = getMColIndex(ui.draggable);
                    var src_mcol = $('.col-product:eq('+src_mcol_index+')');
                    var src_mcol_span = src_mcol.attr('colspan');
                    
                    // for cell table column movement
                    var $src_index  = $(ui.draggable).index();
                    var $dest_index = $sub_col_index;
                    
                    //Don't do anything if dragging to own parent
                    if(src_col_index == $col_index) {
                        return;
                    }
                    
                    // Subtract colspan at src col
                    if(src_col_span > 1) {
                        src_col.attr('colspan',Number(src_col_span)-1);
                    }else{
                        if(confirm("Delete "+src_col.html()+"?")) {
                            src_col.remove();
                        }else{
                            return;
                        }
                    }
					
                    // Subtract colspan at src col-product (merge view)
					if(isMergeView()) {
                    	if(src_mcol_span > 1) {
                        	src_mcol.attr('colspan',Number(src_mcol_span)-1);
                    	}else{
							alert("Cannot delete products \""+src_mcol.html()+"\" in Merge View");
							return;
                        	/*if(confirm("Delete "+src_mcol.html()+"?")) {
                            	src_mcol.remove();
                        	}else{
                            	return;
                        	}*/
                    	}
					}
                    
                    // Add colspan at dest col
                    $(this).attr('colspan',
                                 Number($(this).attr('colspan'))+1);
					
                    // Add colspan at dest col-product (merge view)
                    dest_mcol.attr('colspan',
                                 Number(dest_mcol.attr('colspan'))+1);
                    
                    // Move sub-col from src col to dest col
                    $(ui.draggable)
                        .insertBefore($('.sub-col:eq('+$sub_col_index+')'))
                    $(ui.draggable).highlight().addClass('dirty');
                    $(this).highlight().addClass('dirty');
                    ui.draggable.attr('productid',productid_dest);
                    
                    // Move corresponding cells from src col to dest col
                    $('#cell-table').find('.row').each(function(){
                        var src_td = $(this).find('td:eq('+$src_index+')');
                        var dest_td = $(this).find('td:eq('+$dest_index+')');
                        src_td.insertBefore(dest_td);
                        src_td.highlight().addClass('dirty');
                    });
					commit_drag(ui.draggable,$(this));
					sync_columns_cells();
    				fnAdjustSize();
                }
            });
        }
    },'.col');
    $('.col').trigger('col_dnd');
}

function swap(class_name,src,dest) {
    var src_index  = src.index();
    var dest_index = dest.index();
    //Don't do anything if dragging to own parent
    if(src_index == dest_index) {
        return;
    }
    // Swap src and dest
    src.insertBefore(dest);
	productid_src = src.attr('productid');
	productid_dest = dest.attr('productid');
	src.attr('productid',productid_dest);
	dest.attr('productid',productid_src);
    if(src_index > dest_index) {
        dest.insertAfter($(class_name+':eq('+src_index+')'));
    }else{
        dest.insertBefore($(class_name+':eq('+src_index+')'));
    }
    src.highlight().addClass('dirty');
    dest.highlight().addClass('dirty');
}

function init_tree_dnd() {
    // "li" parent droppable handling
    list_tree_panel.on({
        'parent_drag': function() {
            $(this).draggable({ 
                helper: "clone", 
                opacity: 0.6,
                scroll: true,
                //containment: '.list-tree-panel'
            });
        }
    },'.li-parent');
    $('.li-parent').trigger('parent_drag');
    
    list_tree_panel.on({
        'parent_drop': function() {
            $(this).droppable({
                tolerance:'pointer',
                hoverClass: "drag",
                accept: function(d) { 
                    if(d.hasClass("li-leaf") || d.hasClass("li-parent")){ 
                        return true;
                    }
                },
                drop: function( e, ui ) {
                    // Target ID/row would be first LI item in the tree 
                    // closest from this li-parent. (since we're doing  
                    // prepend at the beginning).
                    var $target_id = $(this).parent()
                                         .find('li:first')
                                             .attr('id');
                    var $target_tr = $('#cell-table')
                                         .find('tr[id='+$target_id+']');
                    
                    var $ui_id = $(ui.draggable).attr('id');
                    var $ui_tr = $('#cell-table')
                                    .find('tr[id='+$ui_id+']');
                    e.stopPropagation();
                    
                    // Prepend draggable LI item to target UL container.
                    $(this).siblings('ul:first').prepend(ui.draggable);
                    ui.draggable.highlight().addClass('dirty');
                    ui.draggable
                        .find('.li-leaf,.li-parent-label')
                            .highlight().addClass('dirty');
                   
					if($target_id == $ui_id) {
						//Do nothing
						return;
					}

                    // Check if parent UL is empty, then target_id will be  
                    // filler row whose id = parent's id.
                    if($target_id == undefined) {
                        $target_id = $(this).parent().attr('id');
                        $target_tr = $('#cell-table')
                                        .find('tr[id='+$target_id+']');
                        $ui_tr.insertAfter($target_tr);
                        $ui_tr.find('.cell').each(function(){
								if($(this).text().trim() != "")
									$(this).highlight().addClass('dirty');
								});
                    }else{
                    	// Move row corresponding to self ID first before
                    	// proceeding to nested elements.
                    	$ui_tr.insertBefore($target_tr);
                        $ui_tr.find('.cell').each(function(){
								if($(this).text().trim() != "")
									$(this).highlight().addClass('dirty');
								});

                    	// Move row(s) corresponding to nested elements right 
                    	// after target_tr.
                    	$(ui.draggable)
                        	.find('.li-parent, .li-leaf').each(function(){
                        	var $ui_id = $(this).attr('id');
                        	var $ui_tr = $('#cell-table')
                                	.find('tr[id='+$ui_id+']') ;        
                        	$ui_tr.insertBefore($target_tr);
                        	$ui_tr.find('.cell').each(function(){
								if($(this).text().trim() != "")
									$(this).highlight().addClass('dirty');
								});
                    	});
					}
					commit_drag(ui.draggable, $(this));
                }
            });
        }
    },'.li-parent-label');
    $('.li-parent-label').trigger('parent_drop');

   list_tree_panel.add($('.product-name-panel')).droppable({
                tolerance:'pointer',
                hoverClass: "drag",
                activeClass: "drag2",
                accept: function(d) { 
                    if(d.hasClass("tc-leaf") || d.hasClass("tc-parent")){ 
                        return true;
                    }
                },
                drop: function( e, ui ) {
					function get_path(id) {
						if(id == undefined) {
							return [0];
						}else{
							pid = $('.tc-tree-panel').find('li[id='+id+']').parent().closest('.tc-parent').attr('id');
							path = get_path(pid);
							path.push(id);
							return path;
						}
					}
    				var li = $(ui.draggable);
					var items = li.find('.tc-leaf, .tc-parent-label').add(li);
					var items_length = Number(items.length);
					var isParent = false;
					if(li.hasClass('tc-leaf')){
						isParent = false;
					}else if(li.hasClass('tc-parent')){
						isParent = true;
					}
					$('#cell-table').css({opacity: 0.0});
					items.each(function(ind,e) {
						var item = $(this);
						if(item.html() == null) {
							items_length--;
							return;
						}
						busy = false;
						var processor = setInterval(function(){
							if(!busy) {
								busy=true;
								var li_id = null;
								var insert_li = null;
								var parent_id = null;
								var path = null;
								if(item.hasClass('tc-leaf')) {
									li_id = item.attr('id');
									if(item.closest('.tc-parent').attr('id') == undefined) {
										parent_id = 0;
									}else{
										parent_id = item.closest('.tc-parent').attr('id');
									}
								}else if(item.hasClass('tc-parent-label')) {
									li_id = item.parent().attr('id');
									if(item.parent().parent().closest('.tc-parent').attr('id') == undefined) {
										parent_id = 0;
									}else{
										parent_id = item.parent().parent().closest('.tc-parent').attr('id');
									}
								}else{
									clearInterval(processor);
									busy=false;
									items_length--;
									return;
								}
								path = get_path(li_id);
								var pid = null;
								while(path.length > 0) {	
									var id = path.shift();
									if(id == 0) {
										pid = 0;
										continue;
									}
									tc = $('.tc-tree-panel').find('li[id='+id+']');
									var parent_li = undefined;
									if(pid != 0) {
										parent_li = list_tree_panel.find('li[id='+pid+']');
									}
									li = list_tree_panel.find('li[id='+id+']');
									if(li.html() == null){ // If tc node is not already added, add it
										if(tc.hasClass('tc-leaf')) {
    										li = $('.helper .li-parent-helper .li-leaf').clone();
        									li.find('a').text(tc.text());
        									li.attr('id',id);
											// If table has no columns, add some
											if($('#cell-table').length > 0 && $('.column-header-panel .sub-col').length == 0){
												fn_product_popup_insert_col(id);
											}
											// Build corresponding cell table row
    										insert_tr =  "<tr class=\"row\" id='"+id+"'>";
        									for(var i=0; i < $('.column-header-panel .sub-col').length; i++) {
            									insert_tr += "<td id="+get_id()+" class=\"cell untested\"><a>U</a></td>";
        									}
        									insert_tr += "</tr>";
											// Add just instantiated artefacts
											if(pid == 0) {
												list_tree_panel.find('.ul-main').prepend(li);
												$('#cell-table').prepend($(insert_tr));
											}else{
												list_tree_panel.find('li[id='+pid+']').find('ul:first').prepend(li);
    											$(insert_tr).insertAfter($('#cell-table').find('tr[id='+pid+']')).find('.cell').each(function(){
													if($(this).text().trim() != "")
														$(this).highlight().addClass('dirty');
													});
											}
		
											li.highlight();
    										// Trigger enable popup event
    										li.trigger('popup_event');
    										// Trigger li-leaf dnd event    
    										li.trigger('leaf_dnd');
    										//var ul = li.find('.ul:first');
    										//if(ul.children('.li-leaf').length == 0) { // Adding to 'li=leaf
        										//ul.prepend(insert_li).highlight();    // 'less parent
    										//}else{ // Adding to parent with at least on li-leaf
        										//insert_li.insertBefore(ul.find('.li-leaf:first')).highlight();
    										//}   
										}else if(tc.hasClass('tc-parent')) {
    										li = $('.helper .li-parent-helper .li-parent').clone();
        									li.find('.li-leaf').remove();
        									li.find('.li-parent-label').text(tc.children('.tc-parent-label:first').text());
        									li.attr('id',id);
											// Build corresponding cell table row
    										insert_tr =  "<tr class=\"row-filler\" id='"+id+"'></tr>";
											// Add just instantiated artefacts
											if(pid == 0) {
												list_tree_panel.find('.ul-main').prepend(li);
												$('#cell-table').prepend($(insert_tr));
											}else{
												list_tree_panel.find('li[id='+pid+']').find('ul:first').prepend(li);
    											$(insert_tr).insertAfter($('#cell-table').find('tr[id='+pid+']')).find('.cell').each(function(){
													if($(this).text().trim() != "")
														$(this).highlight().addClass('dirty');
													});
											}
											li.highlight();
    										// Trigger enable popup event
    										li.find('.li-parent-label').trigger('popup_event');
    										// Trigger li-parent dnd event    
    										li.trigger('parent_drag');
    										li.find('.li-parent-label').trigger('parent_drop'); 
										}
										if(parent_li == undefined) {
											commit_insert(undefined, li);
										}else{
											commit_insert(parent_li.find('.li-parent-label:first'), li);
										}
									}
									pid = id;
								}
								if((isParent && ind == items_length) ||
									(!isParent && ind == items_length - 1)) {
									//console.log("Done!");
									beautify();
									$('#cell-table').css({opacity: 1.0});
								}
								clearInterval(processor);
								busy = false;
							}
						},10);
					}); 
                }
    });
    
    // "li" leaf droppable handling
    list_tree_panel.on({
        'leaf_dnd': function() {
            $(this).draggable({ 
                helper: "clone", 
                opacity: 0.6,
                scroll: true,
                //containment: '.list-tree-panel',
            });
            $(this).droppable({
                tolerance:'pointer',
                hoverClass: "drag",
                accept: function(d) { 
                    if(d.hasClass("li-leaf")){ 
                        return true;
                    }
                },
                drop: function( e, ui ) {
                    var $target_id = $(this).attr('id');
                    var $target_tr = $('#cell-table')
                                        .find('tr[id='+$target_id+']');
                    var $ui_id = $(ui.draggable).attr('id');
                    var $ui_tr = $('#cell-table')
                                        .find('tr[id='+$ui_id+']');           
                    $(ui.draggable).insertAfter($(this));
                    $ui_tr.insertAfter($target_tr).find('.cell').each(function(){
						if($(this).text().trim() != "")
							$(this).highlight().addClass('dirty');
						});
                    ui.draggable.highlight().addClass('dirty');
					commit_drag(ui.draggable, $(this));
                }
            });
        }
    },'.li-leaf');  
    $('.li-leaf').trigger('leaf_dnd');
}

function cell_click() {
    $('#cell-table').on({
        'click': function() {
            if($(this).hasClass('dirty') && $(this).hasClass('untested')) {
		if($(this).attr('id') > 0) {
			commit_delete($(this));	
		}
                $(this).text("");
                $(this).removeClass('untested').removeClass('dirty');
		$(this).removeAttr('id');
            }else if($(this).hasClass('pass')) {
            }else if($(this).hasClass('fail')) {
            }else if($(this).hasClass('testing')) {
            }else if($(this).hasClass('skipped')) {
  	    }else if($(this).text().trim().length == 0){ // Empty cell
		if(!confirm("Insert a \"U\" (untested) cell here?")) {
			return;
		}
		var id = $(this).attr('id');
                $(this).html("<a>U</a>");
                $(this).removeClass('highlight');
                $(this).addClass('untested').highlight().addClass('dirty');
		if(id == undefined) {
			$(this).attr('id',get_id());
			commit_insert(undefined,$(this));	
		}
            }
        }
    },'.cell');
}

function init_expander() {
    list_tree_panel.on({
        'click': function(e, ui) {
			e.stopPropagation();
            if($(this).text() == "[+]") { // Expand
                $(this).text("[-]");
                // Expand list (UL)
                $(this).nextUntil("ul").last().next().slideDown(200);
                // Expand corresponding cell-table rows
                $(this).nextUntil("ul").last().next()
                        .find('.li-parent, .li-leaf').each(function(){
                    var id = $(this).attr('id');
                    $('#cell-table').find('tr[id='+id+']').slideDown(200);
                });
            }else{  // Collapse
                $(this).text("[+]");
                // Collapse list (UL)
                $(this).nextUntil("ul").last().next().slideUp(200);
                // Collapse corresponding cell-table rows
                $(this).nextUntil("ul").last().next()
                        .find('.li-parent, .li-leaf').each(function(){
                    var id = $(this).attr('id');
                    $('#cell-table').find('tr[id='+id+']').slideUp(200);
                });
            }
            //beautify();
        }
    },'.expander');
}

function hover_li_leaf() {
    list_tree_panel.on({
        'mouseenter': function(){
            if(!enableHover) { return; }
		if(permission > 0)
			set_status("Right click for more options. Drag to move to different parent. Leaf Testcase (testcaseid="+
					$(this).attr('id')+", execution time="+$(this).attr('time')+"s )");
		//else
			//set_status("testcaseid="+$(this).attr('id'));
            $(this).addClass('highlight');
            $('#cell-table').find('tr[id='+$(this).attr('id')+']')
                .each(function(){
                $(this).addClass('highlight');
                $(this).find('.cell').addClass('highlight');
            });
        },
        'mouseleave': function(){
            if(!enableHover) { return; }
			set_status("");
            $(this).removeClass('highlight');
            $('#cell-table').find('tr[id='+$(this).attr('id')+']')
                .each(function(){
                $(this).removeClass('highlight');
                $(this).find('.cell').removeClass('highlight');
            });
        }
    },'.li-leaf');
}

function a_click() {
	list_tree_panel.on({
		'click': function(e, ui) {
            e.stopPropagation();
			var id = $(this).parent().attr('id');
			if($(this).parent().hasClass('li-leaf')) {
				window.open('/testcase/'+id,'TestCase Edit','width=800,height=500,scrollbars=1');
			}else if($(this).hasClass('li-parent-label')) {
				//$(this).siblings('.expander').click();
				window.open('/testcase/'+id,'TestCase Edit','width=800,height=500,scrollbars=1');
			}
		}
	},'a');
	$('#cell-table').on({
		'click': function(e, ui) {
            e.preventDefault();
			if(!$(this).parent().hasClass('dirty')) {
				var id = $(this).parent().attr('id');
				url = "/status/"+$('.sub-col:eq('+$(this).parent().index()+')').attr('productid')+"/"+id;
				window.open(url,'TestResult','width=800,height=750,scrollbars=1');
			}
		}
	},'.cell a');
	$('.product-label').click(function(e,ui){
			e.stopPropagation();
			var id = $(this).attr('id');
			window.open('/product_edit/'+id,'Product Edit','width=800,height=500,scrollbars=1');
	});
}


function hover_li_parent() {
    list_tree_panel.on({
        'mouseenter': function(){
            if(!enableHover) { return; }
		if(permission > 0)
			set_status("Right click for more options. Drag to move to different parent. "+
						"Parent Testcase (testcaseid="+$(this).parent().attr('id')+ ")");
		//else
			//set_status("Parent Testcase (testcaseid="+$(this).parent().attr('id')+ ")");
            $(this).addClass('highlight');
            $('#cell-table').find('tr[id='+
                    $(this).parent().attr('id')+']').each(function(){
                    $(this).addClass('highlight');
            });
            $(this).siblings('.ul').find('.li-leaf').each(function(){
                $(this).addClass('highlight');
                $('#cell-table')
                .find('tr[id='+$(this).attr('id')+']').each(function(){
                    $(this).addClass('highlight');
                    $(this).find('.cell').addClass('highlight');
                });
            });
            $(this).siblings('.ul')
                .find('.li-parent-label').each(function(){
                $(this).addClass('highlight');
                $('#cell-table').find('tr[id='+
                    $(this).parent().attr('id')+']').each(function(){
                    $(this).addClass('highlight');
                });
            });
        }, 
        'mouseleave': function(){
            if(!enableHover) { return; }
			set_status("");
            $(this).removeClass('highlight');
            $('#cell-table').find('tr[id='+
                    $(this).parent().attr('id')+']').each(function(){
                    $(this).removeClass('highlight');
            });
            $(this).siblings('.ul').find('.li-leaf').each(function(){
                $(this).removeClass('highlight');
                $('#cell-table')
                .find('tr[id='+$(this).attr('id')+']').each(function(){
                    $(this).removeClass('highlight');
                    $(this).find('.cell').removeClass('highlight');
                });
            });
            $(this).siblings('.ul')
            .find('.li-parent-label').each(function(){
                $(this).removeClass('highlight');
                $('#cell-table').find('tr[id='+
                    $(this).parent().attr('id')+']').each(function(){
                    $(this).removeClass('highlight');
                });
            });
        }
    },'.li-parent-label');
}

function hover_col_leaf() {
    $('.column-header').on({
        'mouseenter': function(){
            if(!enableHover) { return; }
		if(permission > 0)
			set_status("Right click for sub column options. Double click to rename. Drag to another column");
            $(this).addClass('highlight');
            var index = $(this).index();
            $('#cell-table')
                .find('tr')
                    .find('td:eq('+index+')').each(function(){
                        $(this).addClass('highlight');
            });
        }, 
        'mouseleave': function() {
            if(!enableHover) { return; }
			set_status("");
            $(this).removeClass('highlight');
            var index = $(this).index();
            $('#cell-table').find('tr').find('td:eq('+index+')').each(function(){
                $(this).removeClass('highlight');
            });
        }
    },'.sub-col');
}

function hover_col_parent() {
    $('.column-header').on({
        'mouseenter': function(){
            if(!enableHover) { return; }
		if(permission > 0)
			set_status("Right click for column options. Double click to rename");
            $(this).addClass('highlight');
            var index = getNonColspanIndex($(this));
            var colspan = $(this).attr('colspan');
            for(var i=0; i<colspan; i++) {
                var ind = Number(index) + Number(i);
                $('.sub-col:eq('+ind+')').addClass('highlight');
                $('#cell-table')
                            .find('tr')
                            .find('td:eq('+ind+')')
                            .each(function(){
                    $(this).addClass('highlight');
                });
            }
        }, 
        'mouseleave': function() {
            if(!enableHover) { return; }
			set_status("");
            $(this).removeClass('highlight');
            var index = getNonColspanIndex($(this));
            var colspan = $(this).attr('colspan');
            for(var i=0; i<colspan; i++) {
                var ind = Number(index) + Number(i);
                $('.sub-col:eq('+ind+')').removeClass('highlight');
                $('#cell-table')
                            .find('tr')
                            .find('td:eq('+ind+')')
                            .each(function(){
                    $(this).removeClass('highlight');
                });
            }
        }
    },'.col');
}

function getNonColspanIndex(col) {
    var index = 0;  
    //Iterate through all col (span) and compute relative index.
    for(var i=0; i<col.index(); i++) {
        var td = col.siblings('td:eq('+i+')');
		if(td.attr('orig_colspan')) {
        	index += Number(td.attr('orig_colspan') );
		}else{
        	index += Number(td.attr('colspan') );
		}
    }
    return index;
}

function getColIndex(sub_col) {
    var index = 0;
    //Iterate through all col (span) and compute relative index.
    for(var i=0; i<$('.col').size(); i++) {
        var col = $('.col:eq('+i+')');
		if(col.attr('orig_colspan')) {
        	index += Number(col.attr('orig_colspan'));
		}else{
        	index += Number(col.attr('colspan'));
		}
        if(index > sub_col.index()) {
            return i;
        }
    }
    return index;
}

function getMColIndex(sub_col) {
    var index = 0;
    //Iterate through all mcol (span) and compute relative index.
    for(var i=0; i<$('.col-product').size(); i++) {
        var mcol = $('.col-product:eq('+i+')');
		if(mcol.attr('orig_colspan')) {
        	index += Number(mcol.attr('orig_colspan'));
		}else{
        	index += Number(mcol.attr('colspan'));
		}
        if(index > sub_col.index()) {
            return i;
        }
    }
    return index;
}

function hover_cell() {
    $('#cell-table').on({
        'mouseenter': function(){
            if(!enableHover) { return; }
			if(permission > 0) {
				if($(this).hasClass('dirty')) {
					set_status("Click to delete newly inserted 'U' cell (testmatrixid="+$(this).attr('id')+")");
				}else if($(this).text().trim() == "") {
					set_status("Click to insert 'U' (untested) cell here");
				}else{
					set_status("Click link to view. Right click for more options. (testmatrixid="+$(this).attr('id')+")");
				}
			}else if($(this).text().length > 0) {
				set_status("Testmatrix cell (testmatrixid="+$(this).attr('id')+")");
			}
            var row_index = $(this).parent().attr('id');
            var col_index = $(this).index();
            //Highlight cell
            $(this).addClass('highlight');
            //Highlight cell's row header
            $('.li-leaf[id='+row_index+']').addClass('highlight');
            //Highlight cell's col header
            $('.sub-col:eq('+col_index+')').addClass('highlight');
        },
        'mouseleave': function(){
            if(!enableHover) { return; }
            //Remove all highlights added above ^
			set_status("");
            var row_index = $(this).parent().attr('id');
            var col_index = $(this).index();
            $(this).removeClass('highlight');
            $('.li-leaf[id='+row_index+']').removeClass('highlight');
            $('.sub-col:eq('+col_index+')').removeClass('highlight');
        }
    },'.cell');
}

function hover_product() {
    $('.product-label').on({
        'mouseenter': function(){
            if(!enableHover) { return; }
		if(permission > 0)
			set_status("Click to edit product. Right click for more options. (productid="+$(this).attr('id')+")");
        },
        'mouseleave': function(){
            if(!enableHover) { return; }
            //Remove all highlights added above ^
			set_status("");
        }
    });
}

function sync_columns_cells() {
	return;
	ht = 0;
	$('.li-leaf').each(function(){
		if($(this).innerHeight() > ht) {
			ht = $(this).innerHeight();
		}
	});
	$('#matrix-div').find('.cell').each(function(){
		$(this).css('height',ht-10+"px");
	});
	$('.li-leaf').each(function(){
		$(this).css('height',ht-10+"px");
	});
	progress("Calibrating testmatrix dimensions...");
       	//sub_col.css('min-width',$col_width+"px");
       	//sub_col.css('width',$col_width+"px");
       	$('#cell-table .row').each(function(){
           	var row_height = $('.li-leaf[id='+$(this).attr('id')+']').innerHeight();
   			for(var $m=0; $m < $('.sub-col').length; $m++) {
				var sub_col = $('.sub-col:eq('+$m+')');
       			var $col_width = sub_col.width(); // Need to get floor of value ence -1.
				if(sub_col.attr('w') != undefined && (sub_col.width() - Number(sub_col.attr('w')) == 1)) {
       				$col_width = sub_col.attr('w'); // Need to get floor of value ence -1.
				}else{
					sub_col.attr('w',$col_width);
				}
           		$(this).find('.cell:eq('+$m+')').each(function() {
					cell = $(this);
					//console.log($col_width+" "+cell.width());
               		cell.css('min-width',$col_width+"px");
               		cell.css('width',$col_width+"px");
               		cell.css('height',row_height-10+"px");
           		});
			}
       	}); 
	progress("Testmatrix re-calibration complete");
}

fnScroll = function(){
    $('.column-header-panel')
        .scrollLeft($('.cell-table-panel')
            .scrollLeft());
    list_tree_panel
        .scrollTop($('.cell-table-panel')
            .scrollTop());
}

fnAdjustSize = function() {
	// Set matrix width correctly (include matrix's 20+20+20 padding)
	$('#matrix-div').height($(window).height()-132);
	var left_w = 0;
	var right_w = 0;
	if($('.left-div').is(':visible')) {
		left_w = $('.left-div').width();
	}
	if($('.right-div').is(':visible')) {
		$('.right-div').height($(window).height()-10);
		$('.left-div').height($(window).height()-40);
		right_w = $('.right-div').width();
	}
	$('#matrix-div').width($(window).width()-left_w-right_w-80);

	// Adjust status bar width
	$('.status-bar').width($('#matrix-div').width()-$('.status-bar-label').width()-100);

	// Adjust floating panel
	$('.float-panel-left').width($('body').width()/3.3);
	$('.float-panel-left').height($(window).height());
	$('.float-panel-right').width($('body').width()/2.5);
	$('.float-panel-right').height($(window).height());

	// Special handling for columns with no cells
	if($('#cell-table').find('.cell').length == 0){
		$('.filler-td').each(function(){
			$(this).width($('.column-header').width());
		});
		return;
	}
	var container = $('#matrix-div');
	var $window_h = $(container).height();
	var $window_w = $(container).width();
	var $row_header_h = list_tree_panel.height(); 
	var $row_header_w = list_tree_panel.width(); 
	var $category_header_h = $('.column-header').height();
	var $category_header_w = $('.column-header').width();
	var $scroll = 15;
    var main_h = $category_header_h+Number($('#cell-table').height())-60;
    var main_w = $row_header_w+Number($('#cell-table').width())-60;
    if(main_w > $window_w && main_h > $window_h) {
        $('.column-header-panel').width($window_w-$row_header_w);
        $('.cell-table-panel').width($window_w-$row_header_w+$scroll); 
        $('.cell-table-panel').height($window_h-$category_header_h+4+$scroll);
        list_tree_panel.height($window_h-$category_header_h);
    }else if(main_w > $window_w && main_h < $window_h) {
        $('.column-header-panel').width($window_w-$row_header_w);
        $('.cell-table-panel').width($window_w-$row_header_w); 
        $('.cell-table-panel').height($('#cell-table').height()+$scroll);
        list_tree_panel.height($('#cell-table').height());
    }else if(main_w < $window_w && main_h > $window_h) {
        $('.column-header-panel').width($('#cell-table').width());
        $('.cell-table-panel').width($('#cell-table').width()+$scroll);
        $('.cell-table-panel').height($window_h-$category_header_h+4);
        list_tree_panel.height($window_h-$category_header_h);
    }else{
        $('.column-header-panel').width($('#cell-table').width());
        $('.cell-table-panel').width($('#cell-table').width());
        $('.cell-table-panel').height($('#cell-table').height());
        list_tree_panel.height($('#cell-table').height()+4);
    }
}

function get_id() {
    return max_id--;
}

// Call before every modifying testmatrix.
function commit_init() {
}


// AJAX functions
function when_ajax_timeout() {
	alert("ERROR: Could not establish network connection to server");
	//$('.modified-label').text("ERROR: Could not establish network connection to server");
}

function commit_save() {
	//AJAX handling - call "save_changes()"
	$.ajax({
            type: "POST",
            dataType: "json",
            timeout: TIMEOUT,
            error: function(req, s, err) {
                if(s == "timeout") {
                    when_ajax_timeout();
                }   
            },  
            url: "/save_changes",
			data: {
				"product_id": '['+get_product_id().join()+']',
				"csrfmiddlewaretoken": $('#csrf_token').attr('value')
			},
			success: function(json) {
				set_status("Saved all changes to database successfully. Reloading Testmatrix...");
				window.location.reload(true);
			}
	});
}

function commit_discard() {
	//console.log("Discard");
	//AJAX handling - call "discard_changes()"
	$.ajax({
            type: "POST",
            dataType: "json",
            timeout: TIMEOUT,
            error: function(req, s, err) {
                if(s == "timeout") {
                    when_ajax_timeout();
                }   
            },  
            url: "/discard_changes",
			data: {
				"product_id": '['+get_product_id().join()+']',
				"csrfmiddlewaretoken": $('#csrf_token').attr('value')
			},
			success: function(json) {
				set_status("Reverted testmatrix to its previous state successfully. Reloading Testmatrix...");
				window.location.reload(true);
			}
	});
}

function commit_clone_tc(old_id, new_tc_id, new_tc_name) {
	if(permission < 1) {
		alert("INFO: Cloned testcase successfully, but did not update tesrmatrix since \""+user+"\" is not member of this matrix");
		return;
	}
	li = list_tree_panel.find('li[id='+old_id+']');
        var id = li.attr('id');
        var new_id = get_id(); // Get next unique ID to assign.
    	    if(new_tc_id != undefined)
	        new_id = new_tc_id
        var tr = $('#cell-table').find('tr[id='+id+']');
        var li_clone = li.clone();
            li_clone.attr('orig-id',id);
            li_clone.attr('id',new_id);
        var new_name = li.find('a').text()+" clone";
    	    if(new_tc_name != undefined)
	        new_name = new_tc_name;
            li_clone.find('a').text(new_name);
        var tr_clone = tr.clone();
	    tr_clone.find('.cell').each(function(){
		    var td = $(this);
		    if(td.hasClass('pass') || td.hasClass('fail') || td.hasClass('testing') || td.hasClass('untested')) {
        	    td.replaceWith($("<td id="+get_id()+" class=\"cell untested\"><a>U</a></td>"));
		    }
            tr_clone.attr('id',new_id);
	    });
        $(li_clone).insertAfter(li).highlight().addClass('dirty');
        $(tr_clone).insertAfter(tr).find('.cell').each(function(){
		    if($(this).text().trim() != "")
			    $(this).highlight().addClass('dirty');
		    });
        // Trigger enable popup event
        $(li_clone).trigger('popup_event');
        // Trigger li-leaf dnd event    
        $(li_clone).trigger('leaf_dnd');
        // Editable
        //$(li_clone).find('a').editable();
	commit_clone(li_clone);
	beautify();
}

function commit_update_tc(old_id, new_id) {
	if(ajax) {	// Make sure AJAX flag is enabled
		commit_init();
		var tm_arr 	= [];
		var li = list_tree_panel.find('li[id='+new_id+']'); // Id should have been changed by now
	        var tr = $('#cell-table').find('tr[id='+old_id+']');
		tr.find('.cell').each(function(){
		    if($(this).attr('id') != undefined  && $(this).text().trim() != "") {
			cell = $(this);
       			var sub_col = $('.sub-col:eq('+cell.index()+')');
    			var col = $('.col:eq('+getColIndex(sub_col)+')');
			var product_id = col.attr('productid');
			tm_data = '{ "id": '+cell.attr('id')+','+
       				'"sub_col": \"'+sub_col.text()+'\",'+
              			'"col": \"'+col.text()+'\",'+
              			'"calcstatus": \"'+cell.text()+'\",'+
				'"product_id": '+product_id+','+
				'"tc_old_id": '+old_id+','+
           			'"tc_id": '+new_id+
			   '}';
			tm_arr.push(tm_data);
		    }
		});

		//AJAX handling 
		progress("Updating new testcaseid for testmatrix cells under testcase: \""+li.text()+"\"...");
		if(tm_arr.length > 0) {
			$.ajax({
            			type: "POST",
            			dataType: "json",
            			timeout: TIMEOUT,
            			error: function(req, s, err) {
                			if(s == "timeout") {
                    			    when_ajax_timeout();
                			}   
            			},  
            			url: "/update_cell",
				data: {
					"tm_data": '['+tm_arr.join()+']',	
					"product_id": '['+get_product_id().join()+']',
					"csrfmiddlewaretoken": $('#csrf_token').attr('value')
				},
				success: function(json) {
					if(json['ret'] == "fail") {
						alert("Failed to update testmatrix cells to latest rev since "+user+
							" is not member of this testmatrix");
						return;
					}
					when_modified(json);
					progress("Updated new testcaseid for testmatrix cells under testcase: \""+li.text()+"\" successfully");
					li.highlight();
					tr.find('.cell').each(function(){
		    		  	    if($(this).attr('id') != undefined  && $(this).text().trim() != "") {
					        $(this).addClass('dirty').highlight();
					    }
					});
				}
			});
		}
	}
}

function commit_set_pass(container) {
    if(ajax) {	// Make sure AJAX flag is enabled
        commit_init();
	if(container.hasClass('sub-col')) { 
        var sub_col = container;
    	var col = $('.col:eq('+getColIndex(sub_col)+')');
	    var product_id = col.attr('productid');
	    var tm_arr 	= [];
       	$('#cell-table')
          	.find('tr')
          	.find('td:eq('+sub_col.index()+')').each(function(){
		    cell = $(this);
		    if(cell.attr('id') != undefined && !$(this).hasClass('dirty') && $(this).hasClass('untested')) {
                cell.html("<a>P</a>");
                cell.removeClass('highlight');
           	    cell.addClass('pass').addClass('dirty');
		        tm_data = '{ "id": '+$(this).attr('id')+','+
                    '"sub_col": \"'+sub_col.text()+'\",'+
                    '"tc_id": '+cell.parent().attr('id')+','+
                    '"calcstatus": \"'+cell.text()+'\",'+
			        '"product_id": '+product_id+','+
                    '"col": \"'+col.text()+
			    '\"}';
			    tm_arr.push(tm_data);
	         }
           });
	    //AJAX handling - call "insert_sub_col()"
   	    progress("Setting all \""+sub_col.text()+ "\"...");
	    console.log(tm_arr);
	    if(tm_arr.length > 0) {
		$.ajax({
                    type: "POST",
            	    dataType: "json",
            	    timeout: TIMEOUT,
            	    error: function(req, s, err) {
                	if(s == "timeout") {
                    	    when_ajax_timeout();
                	}   
            	    },  
            	    url: "/modify_untested_cell_to_pass",
		    data: {
			"tm_data": '['+tm_arr.join()+']',	
			"product_id": '['+get_product_id().join()+']',
			"csrfmiddlewaretoken": $('#csrf_token').attr('value')
		    },
		    success: function(json) {
			when_modified(json);
			progress("Set all empty cells in \""+sub_col.text()+ "\" to 'U' successfully");
			sub_col.highlight();
       			$('#cell-table')
           		    .find('tr')
               		    .find('td:eq('+sub_col.index()+')').each(function(){
                   	    cell = $(this);
			    if(cell.attr('id') != undefined && cell.text().trim() != "" ) {
				cell.attr('id',json[cell.attr('id')]);
				cell.highlight();
			    }
			});
		    }
		});
	    }
	}
    }
}

function commit_set_all(container) {
	if(ajax) {	// Make sure AJAX flag is enabled
		commit_init();
		if(container.hasClass('li-parent')) { 
    		var li = container;
			var tm_arr 	= [];
			li.find('.li-leaf, .li-parent-label').each(function() {
        		var id = 0;
        		if($(this).hasClass('li-leaf')) {
            		id = $(this).attr('id'); // For pulling up "tr" based on li-leaf
        		} else if($(this).hasClass('li-parent-label')) {
            		id = $(this).parent().attr('id'); // For pulling up "tr" based on li-parent
        		}    
        		var tr = $('#cell-table').find('tr[id='+id+']');
				tr.find('.cell').each(function(){
					if($(this).attr('id') == undefined  && $(this).text().trim() == "") {
						cell = $(this);
               			cell.html("<a>U</a>");
               			cell.removeClass('highlight');
               			cell.addClass('untested').addClass('dirty');
						cell.attr('id',get_id());
           				var sub_col = $('.sub-col:eq('+cell.index()+')');
    					var col    	= $('.col:eq('+getColIndex(sub_col)+')');
						var product_id = col.attr('productid');
						tm_data = '{ "id": '+cell.attr('id')+','+
                   					'"sub_col": \"'+sub_col.text()+'\",'+
                   					'"col": \"'+col.text()+'\",'+
                   					'"calcstatus": \"'+cell.text()+'\",'+
                   					'"product_id": '+product_id+','+
              						'"tc_id": '+id+
								'}';
						tm_arr.push(tm_data);
					}
				});
    		});
			//console.log(tm_arr);
			progress("Setting All \""+li.children('.li-parent-label:first').text()+ "\"...");
			//AJAX handling - call "update_sub_col()"
			if(tm_arr.length > 0) {
				$.ajax({
            		type: "POST",
            		dataType: "json",
            		timeout: TIMEOUT,
            		error: function(req, s, err) {
                		if(s == "timeout") {
                    		when_ajax_timeout();
                		}   
            		},  
            		url: "/insert_cell",
					data: {
						"tm_data": '['+tm_arr.join()+']',	
						"product_id": '['+get_product_id().join()+']',
						"csrfmiddlewaretoken": $('#csrf_token').attr('value')
					},
					success: function(json) {
						when_modified(json);
						progress("Set all empty cells in \""+li.children('.li-parent-label:first').text()+ "\" to 'U' successfully");
    					li.find('.li-leaf, .li-parent-label').each(function() {
        					var id;
        					if($(this).hasClass('li-leaf')) {
            					id = $(this).attr('id'); // For pulling up "tr" 
                                     					// based on li-leaf
        					} else if($(this).hasClass('li-parent-label')) {
            					id = $(this).parent().attr('id'); // For pulling up "tr" 
                                              					// based on li-parent
        					}    
        					var tr = $('#cell-table').find('tr[id='+id+']');
							tr.find('.cell').each(function(){
								var cell = $(this);
								if(cell.attr('id') != undefined && cell.text().trim() != "") {
        							cell.attr('id',json[cell.attr('id')]);
									cell.highlight();
								}
							});
        					tr.attr('id',json[id]);
							tr.highlight(); 
    					});
					}
				});
			}
		}else if(container.hasClass('li-leaf')) { 
			var li_leaf = container;
			var li_leaf_id = li_leaf.attr('id');
    		var tr = $('#cell-table').find('tr[id='+li_leaf_id+']');
			var tm_arr 	= [];
			tr.find('.cell').each(function(){
				if($(this).attr('id') == undefined && $(this).text().trim() == "") {
					cell = $(this);
               		cell.html("<a>U</a>");
               		cell.removeClass('highlight');
               		cell.addClass('untested').addClass('dirty');
					cell.attr('id',get_id());
           			var sub_col = $('.sub-col:eq('+cell.index()+')');
    				var col    	= $('.col:eq('+getColIndex(sub_col)+')');
					var product_id = col.attr('productid');
					tm_data = '{ "id": '+cell.attr('id')+','+
                   				'"sub_col": \"'+sub_col.text()+'\",'+
                   				'"col": \"'+col.text()+'\",'+
                   				'"calcstatus": \"'+cell.text()+'\",'+
								'"product_id": '+product_id+','+
              					'"tc_id": '+li_leaf_id+
							'}';
					tm_arr.push(tm_data);
				}
			});
			progress("Setting all \""+li_leaf.text()+ "\"...");
			//console.log(tm_arr);
			//AJAX handling - call "update_sub_col()"
			if(tm_arr.length > 0) {
				$.ajax({
            		type: "POST",
            		dataType: "json",
            		timeout: TIMEOUT,
            		error: function(req, s, err) {
                		if(s == "timeout") {
                    		when_ajax_timeout();
                		}   
            		},  
            		url: "/insert_cell",
					data: {
						"tm_data": '['+tm_arr.join()+']',	
						"product_id": '['+get_product_id().join()+']',
						"csrfmiddlewaretoken": $('#csrf_token').attr('value')
					},
					success: function(json) {
						when_modified(json);
						progress("Set all empty cells in \""+li_leaf.text()+ "\" to 'U' successfully");
						li_leaf.highlight();
       					$('#cell-table')
           					.find('tr[id='+li_leaf_id+']').each(function(){
									$(this).attr('id',json[$(this).attr('id')]);
									$(this).find('.cell').each(function() {
               							cell = $(this);
										if(cell.attr('id') != undefined && cell.text().trim() != "") {
											cell.attr('id',json[cell.attr('id')]);
											cell.highlight();
										}
									});
									
						});
					}
				});
			}
		}else if(container.hasClass('col')) { 
			var col 	= container
			var product_id = col.attr('productid');
			var tm_arr 	= [];
            var index 	= getNonColspanIndex(col);
            var colspan = col.attr('colspan');
            for(var i=0; i<colspan; i++) {
                var ind = Number(index) + Number(i);
				var sub_col = $('.sub-col:eq('+ind+')');
                $('#cell-table')
                	.find('tr')
                    	.find('td:eq('+ind+')').each(function(){
                    		cell = $(this);
							if(cell.attr('id') == undefined  && $(this).text().trim() == "") {
                				cell.html("<a>U</a>");
                				cell.removeClass('highlight');
                				cell.addClass('untested').addClass('dirty');
								cell.attr('id',get_id());
								tm_data = '{ "id": '+$(this).attr('id')+','+
                       				'"sub_col": \"'+sub_col.text()+'\",'+
                       				'"tc_id": '+cell.parent().attr('id')+','+
                       				'"calcstatus": \"'+cell.text()+'\",'+
									'"product_id": '+product_id+','+
                       				'"col": \"'+col.text()+
								'\"}';
								tm_arr.push(tm_data);
							}
                });
            }
			//AJAX handling - call "insert_sub_col()"
			progress("Setting all \""+col.text()+ "\"...");
			//console.log(tm_arr);
			if(tm_arr.length > 0) {
				$.ajax({
            		type: "POST",
            		dataType: "json",
            		timeout: TIMEOUT,
            		error: function(req, s, err) {
                		if(s == "timeout") {
                    		when_ajax_timeout();
                		}   
            		},  
            		url: "/insert_cell",
							data: {
						"tm_data": '['+tm_arr.join()+']',	
						"product_id": '['+get_product_id().join()+']',
						"csrfmiddlewaretoken": $('#csrf_token').attr('value')
					},
					success: function(json) {
						when_modified(json);
						progress("Set all empty cells in \""+col.text()+ "\" to 'U' successfully");
						col.highlight();
            			for(var i=0; i<colspan; i++) {
                			var ind = Number(index) + Number(i);
							var sub_col = $('.sub-col:eq('+ind+')');
							sub_col.highlight();
                			$('#cell-table')
                				.find('tr')
                    				.find('td:eq('+ind+')').each(function(){
                    					cell = $(this);
										if(cell.attr('id') != undefined && cell.text().trim() != "") {
											cell.attr('id',json[cell.attr('id')]);
											cell.highlight();
										}
							});
						}
					}
				});
			}
		}else if(container.hasClass('sub-col')) { 
			var sub_col = container;
    		var col    	= $('.col:eq('+getColIndex(sub_col)+')');
			var product_id = col.attr('productid');
			var tm_arr 	= [];
       		$('#cell-table')
           		.find('tr')
               		.find('td:eq('+sub_col.index()+')').each(function(){
						cell = $(this);
						if(cell.attr('id') == undefined && $(this).text().trim() == "") {
                			cell.html("<a>U</a>");
                			cell.removeClass('highlight');
                			cell.addClass('untested').addClass('dirty');
							cell.attr('id',get_id());
							tm_data = '{ "id": '+$(this).attr('id')+','+
                       			'"sub_col": \"'+sub_col.text()+'\",'+
                       			'"tc_id": '+cell.parent().attr('id')+','+
                       			'"calcstatus": \"'+cell.text()+'\",'+
								'"product_id": '+product_id+','+
                       			'"col": \"'+col.text()+
							'\"}';
							tm_arr.push(tm_data);
						}
       		});
			//AJAX handling - call "insert_sub_col()"
			progress("Setting all \""+sub_col.text()+ "\"...");
			//console.log(tm_arr);
			if(tm_arr.length > 0) {
				$.ajax({
            		type: "POST",
            		dataType: "json",
            		timeout: TIMEOUT,
            		error: function(req, s, err) {
                		if(s == "timeout") {
                    		when_ajax_timeout();
                		}   
            		},  
            		url: "/insert_cell",
					data: {
						"tm_data": '['+tm_arr.join()+']',	
						"product_id": '['+get_product_id().join()+']',
						"csrfmiddlewaretoken": $('#csrf_token').attr('value')
					},
					success: function(json) {
						when_modified(json);
						progress("Set all empty cells in \""+sub_col.text()+ "\" to 'U' successfully");
						sub_col.highlight();
       					$('#cell-table')
           					.find('tr')
               					.find('td:eq('+sub_col.index()+')').each(function(){
                   					cell = $(this);
									if(cell.attr('id') != undefined && cell.text().trim() != "" ) {
										cell.attr('id',json[cell.attr('id')]);
										cell.highlight();
									}
						});
					}
				});
			}
		}
	}
}

function commit_set_none(container) {
	if(ajax) {	// Make sure AJAX flag is enabled
		commit_init();
		if(container.hasClass('li-parent')) { 
    		var li = container;
			var tm_arr 	= [];
			li.find('.li-leaf, .li-parent-label').each(function() {
        		var id = 0;
        		if($(this).hasClass('li-leaf')) {
            		id = $(this).attr('id'); // For pulling up "tr" based on li-leaf
        		} else if($(this).hasClass('li-parent-label')) {
            		id = $(this).parent().attr('id'); // For pulling up "tr" based on li-parent
        		}    
        		var tr = $('#cell-table').find('tr[id='+id+']');
				tr.find('.cell').each(function(){
					if($(this).attr('id') != undefined  && $(this).hasClass("untested") && $(this).hasClass("dirty")) {
						cell = $(this);
               			cell.html("");
               			cell.removeClass('highlight');
               			cell.removeClass('untested').removeClass('dirty');
						tm_data = '{ "id": '+cell.attr('id')+','+
									'"product_id": '+get_product_id(cell)+
								'}';
						tm_arr.push(tm_data);
						cell.removeAttr('id');
					}
				});
    		});
			//console.log(tm_arr);
			progress("Setting none \""+li.children('.li-parent-label:first').text()+ "\"...");
			//AJAX handling - call "update_sub_col()"
			if(tm_arr.length > 0) {
				$.ajax({
            		type: "POST",
            		dataType: "json",
            		timeout: TIMEOUT,
            		error: function(req, s, err) {
                		if(s == "timeout") {
                    		when_ajax_timeout();
                		}   
            		},  
            		url: "/delete_cell",
					data: {
						"tm_data": '['+tm_arr.join()+']',	
						"product_id": '['+get_product_id().join()+']',
						"csrfmiddlewaretoken": $('#csrf_token').attr('value')
					},
					success: function(json) {
						when_modified(json);
						progress("Cleared all dirty 'U' cells in \""+li.children('.li-parent-label:first').text()+ "\" successfully");
    					li.find('.li-leaf, .li-parent-label').each(function() {
        					var id;
							$(this).highlight();
        					if($(this).hasClass('li-leaf')) {
            					id = $(this).attr('id'); // For pulling up "tr" 
                                     					// based on li-leaf
        					} else if($(this).hasClass('li-parent-label')) {
            					id = $(this).parent().attr('id'); // For pulling up "tr" 
                                              					// based on li-parent
        					}    
        					var tr = $('#cell-table').find('tr[id='+id+']');
							tr.find('.cell').each(function(){
								var cell = $(this);
								if(cell.text().trim() == "") {
									cell.highlight();
								}
							});
    					});
					}
				});
			}
		}else if(container.hasClass('li-leaf')) { 
			var li_leaf = container;
			var li_leaf_id = li_leaf.attr('id');
    		var tr = $('#cell-table').find('tr[id='+li_leaf_id+']');
			var tm_arr 	= [];
			tr.find('.cell').each(function(){
				if($(this).attr('id') != undefined  && $(this).hasClass("untested") && $(this).hasClass("dirty")) {
					cell = $(this);
               		cell.html("");
               		cell.removeClass('highlight');
               		cell.removeClass('untested').removeClass('dirty');
					tm_data = '{ "id": '+cell.attr('id')+','+
							'"product_id": '+get_product_id(cell)+
							'}';
					tm_arr.push(tm_data);
					cell.removeAttr('id');
				}
			});
			progress("Setting none \""+li_leaf.text()+ "\"...");
			//console.log(tm_arr);
			//AJAX handling - call "update_sub_col()"
			if(tm_arr.length > 0) {
				$.ajax({
            		type: "POST",
            		dataType: "json",
            		timeout: TIMEOUT,
            		error: function(req, s, err) {
                		if(s == "timeout") {
                    		when_ajax_timeout();
                		}   
            		},  
            		url: "/delete_cell",
					data: {
						"tm_data": '['+tm_arr.join()+']',	
						"product_id": '['+get_product_id().join()+']',
						"csrfmiddlewaretoken": $('#csrf_token').attr('value')
					},
					success: function(json) {
						when_modified(json);
						progress("Cleared all dirty 'U' cells in \""+li_leaf.text()+ "\" successfully");
						li_leaf.highlight();
       					$('#cell-table')
           					.find('tr[id='+li_leaf_id+']').each(function(){
									$(this).find('.cell').each(function() {
               							cell = $(this);
										if(cell.text().trim() == "") {
											cell.highlight();
										}
									});
									
						});
					}
				});
			}
		}else if(container.hasClass('col')) { 
			var col 	= container
			var tm_arr 	= [];
            var index 	= getNonColspanIndex(col);
            var colspan = col.attr('colspan');
            for(var i=0; i<colspan; i++) {
                var ind = Number(index) + Number(i);
				var sub_col = $('.sub-col:eq('+ind+')');
                $('#cell-table')
                	.find('tr')
                    	.find('td:eq('+ind+')').each(function(){
                    		cell = $(this);
							if($(this).attr('id') != undefined  && $(this).hasClass("untested")  && $(this).hasClass("dirty")) {
                				cell.html("");
                				cell.removeClass('highlight');
                				cell.removeClass('untested').removeClass('dirty');
								tm_data = '{ "id": '+$(this).attr('id')+','+
										'"product_id": '+get_product_id(cell)+
								'}';
								tm_arr.push(tm_data);
								cell.removeAttr('id');
							}
                });
            }
			//AJAX handling - call "insert_sub_col()"
			progress("Setting none \""+col.text()+ "\"...");
			//console.log(tm_arr);
			if(tm_arr.length > 0) {
				$.ajax({
            		type: "POST",
            		dataType: "json",
            		timeout: TIMEOUT,
            		error: function(req, s, err) {
                		if(s == "timeout") {
                    		when_ajax_timeout();
                		}   
            		},  
            		url: "/delete_cell",
					data: {
						"tm_data": '['+tm_arr.join()+']',	
						"product_id": '['+get_product_id().join()+']',
						"csrfmiddlewaretoken": $('#csrf_token').attr('value')
					},
					success: function(json) {
						when_modified(json);
						progress("Cleared all dirty 'U' cells in \""+col.text()+ "\" successfully");
						col.highlight();
            			for(var i=0; i<colspan; i++) {
                			var ind = Number(index) + Number(i);
							var sub_col = $('.sub-col:eq('+ind+')');
							sub_col.highlight();
                			$('#cell-table')
                				.find('tr')
                    				.find('td:eq('+ind+')').each(function(){
                    					cell = $(this);
										if(cell.text().trim() == "") {
											cell.highlight();
										}
							});
						}
					}
				});
			}
		}else if(container.hasClass('sub-col')) { 
			var sub_col = container;
    		var col    	= $('.col:eq('+getColIndex(sub_col)+')');
			var tm_arr 	= [];
       		$('#cell-table')
           		.find('tr')
               		.find('td:eq('+sub_col.index()+')').each(function(){
						cell = $(this);
						if($(this).attr('id') != undefined  && $(this).hasClass("untested")  && $(this).hasClass("dirty")) {
                			cell.html("");
                			cell.removeClass('highlight');
                			cell.removeClass('untested').removeClass('dirty');
							tm_data = '{ "id": '+$(this).attr('id')+','+
								'"product_id": '+get_product_id(cell)+
							'}';
							tm_arr.push(tm_data);
							cell.removeAttr('id');
						}
       		});
			//AJAX handling - call "insert_sub_col()"
			progress("Setting none \""+sub_col.text()+ "\"...");
			//console.log(tm_arr);
			if(tm_arr.length > 0) {
				$.ajax({
            		type: "POST",
            		dataType: "json",
            		timeout: TIMEOUT,
            		error: function(req, s, err) {
                		if(s == "timeout") {
                    		when_ajax_timeout();
                		}   
            		},  
            		url: "/delete_cell",
					data: {
						"tm_data": '['+tm_arr.join()+']',	
						"product_id": '['+get_product_id().join()+']',
						"csrfmiddlewaretoken": $('#csrf_token').attr('value')
					},
					success: function(json) {
						when_modified(json);
						progress("Cleared all dirty 'U' cells in \""+sub_col.text()+"\" successfully");
						sub_col.highlight();
       					$('#cell-table')
           					.find('tr')
               					.find('td:eq('+sub_col.index()+')').each(function(){
                   					cell = $(this);
									if(cell.text().trim() == "" ) {
										cell.highlight();
									}
						});
					}
				});
			}
		}
	}
}

function commit_delete(container) {
	if(ajax) {	// Make sure AJAX flag is enabled
		commit_init();
		if(container.hasClass('cell')) { 
			var cell = container;
       		var sub_col = $('.sub-col:eq('+cell.index()+')');
    		var col    	= $('.col:eq('+getColIndex(sub_col)+')');
			var tc_id   = cell.parent().attr('id');
			var tc		= list_tree_panel.find('.li-leaf[id='+tc_id+']');
			var tm_arr 	= [];
			tm_data = '{ "id": '+cell.attr('id')+','+
						'"product_id": '+get_product_id(cell)+
	   				   '}';
			tm_arr.push(tm_data);
			//console.log(tm_arr);
			//AJAX handling - call "insert_sub_col()"
			//console.log(tm_arr);
			progress("Deleting testmatrix cell for \""+tc.text()+ "\" & \""+col.text()+"/"+sub_col.text()+"\"...");
			if(tm_arr.length > 0) {
				$.ajax({
            		type: "POST",
            		dataType: "json",
            		timeout: TIMEOUT,
            		error: function(req, s, err) {
                		if(s == "timeout") {
                    		when_ajax_timeout();
                		}   
            		},  
            		url: "/delete_cell",
					data: {
						"tm_data": '['+tm_arr.join()+']',	
						"product_id": '['+get_product_id().join()+']',
						"csrfmiddlewaretoken": $('#csrf_token').attr('value')
					},
					success: function(json) {
						when_modified(json);
						progress("Deleted testmatrix cell for \""+tc.text()+ "\" & \""+col.text()+"/"+sub_col.text()+"\" successfully");
						cell.highlight();
						sub_col.highlight();
						tc.highlight();
					}
				});
			}
		}else if(container.hasClass('li-parent')) { 
			var li = container;
			var tc_arr = [];				    
			var tm_arr 	= [];
        	li.find('.li-leaf, .li-parent-label').each(function() {
            	var id = -1;
            	if($(this).hasClass('li-leaf')) {
                	id = $(this).attr('id'); // For pulling up "tr" 
                                         	// based on li-leaf
					tc_data = '{ "id": '+id+'}';
					//tc_arr.push(tc_data);
            	} else if($(this).hasClass('li-parent-label')) {
                	id = $(this).parent().attr('id'); // For pulling up "tr" 
                                                  	// based on li-parent
            	}   
            	var tr = $('#cell-table').find('tr[id='+id+']');
				tr.find('.cell').each(function(){
					if($(this).attr('id') != undefined && $(this).text().trim() != "") {
						tm_data = '{ "id": '+$(this).attr('id')+', "product_id": '+get_product_id($(this))+'}';
						tm_arr.push(tm_data);
					}
				});
        	});
			//console.log(tc_arr);
			//console.log(tm_arr);
			progress("Deleting parent testcase \""+li.children('.li-parent-label:first').text()+"\"...");
			//AJAX handling - call "update_sub_col()"
			if(tm_arr.length >= 0 && tc_arr.length >= 0) {
				$.ajax({
            		type: "POST",
            		dataType: "json",
            		timeout: TIMEOUT,
            		error: function(req, s, err) {
                		if(s == "timeout") {
                    		when_ajax_timeout();
                		}   
            		},  
            		url: "/delete_li",
					data: {
						"product_id": '['+get_product_id().join()+']',
						"tm_data": '['+tm_arr.join()+']',	
						"tc_data": '['+tc_arr.join()+']',	
						"csrfmiddlewaretoken": $('#csrf_token').attr('value')
					},
					success: function(json) {
						when_modified(json);
						progress("Deleted parent testcase \""+li.children('.li-parent-label:first').text()+"\" successfully");
					}
				});
			}
		}else if(container.hasClass('li-leaf')) { 
			var li_leaf = container;
   			var tr = $('#cell-table').find('tr[id='+li_leaf.attr('id')+']');
			var tc_arr = [];				    
			tc_data = '{ "id": '+li_leaf.attr('id')+'}';
			//tc_arr.push(tc_data);
			var tm_arr 	= [];
			tr.find('.cell').each(function(){
				if($(this).attr('id') != undefined && $(this).text().trim() != "") {
					tm_data = '{ "id": '+$(this).attr('id')+', "product_id": '+get_product_id($(this))+'}';
					tm_arr.push(tm_data);
				}
			});
			//console.log(tc_arr);
			//console.log(tm_arr);
			progress("Deleting leaf testcase \""+li_leaf.text()+"\"...");
			//AJAX handling - call "update_sub_col()"
			if(tm_arr.length >= 0 && tc_arr.length >= 0) {
				$.ajax({
            		type: "POST",
            		dataType: "json",
            		timeout: TIMEOUT,
            		error: function(req, s, err) {
                		if(s == "timeout") {
                    		when_ajax_timeout();
                		}   
            		},  
            		url: "/delete_li",
					data: {
						"product_id": '['+get_product_id().join()+']',
						"tm_data": '['+tm_arr.join()+']',	
						"tc_data": '['+tc_arr.join()+']',	
						"csrfmiddlewaretoken": $('#csrf_token').attr('value')
					},
					success: function(json) {
						when_modified(json);
						progress("Deleted leaf testcase \""+li_leaf.text()+"\" successfully");
					}
				});
			}
		}else if(container.hasClass('sub-col')) { // Commit sub-col updates
			var sub_col = container
			var product_id = sub_col.attr('productid');
			var tm_arr 	= [];
        	$('#cell-table')
            	.find('tr')
                	.find('td:eq('+sub_col.index()+')').each(function(){
                    	cell = $(this);
						if(cell.attr('id') != undefined && $(this).text().trim() != "") {
							// Update sub-col field for cell
							tm_data = '{ "id": '+$(this).attr('id')+','+
								'"product_id": '+product_id+','+
                        		'"sub_col": \"'+sub_col.text()+
							'\"}';
							tm_arr.push(tm_data);
						}
        	});
			//console.log("sub-col: "+tm_arr);
			progress("Deleting column \""+sub_col.text()+"\"...");
			//AJAX handling - call "update_sub_col()"
			if(tm_arr.length > 0) {
				$.ajax({
            		type: "POST",
            		dataType: "json",
            		timeout: TIMEOUT,
            		error: function(req, s, err) {
                		if(s == "timeout") {
                    		when_ajax_timeout();
                		}   
            		},  
            		url: "/delete_sub_col",
					data: {
						"product_id": '['+get_product_id().join()+']',
						"tm_data": '['+tm_arr.join()+']',	
						"csrfmiddlewaretoken": $('#csrf_token').attr('value')
					},
					success: function(json) {
						when_modified(json);
						progress("Deleted column \""+sub_col.text()+"\" successfully");
					}
				});
			}
		}else if(container.hasClass('col')) { // Commit sub-col updates
			var col 	= container
			var product_id = col.attr('productid');
			var tm_arr 	= [];
            var index 	= getNonColspanIndex(col);
            var colspan = col.attr('colspan');
            for(var i=0; i<colspan; i++) {
                var ind = Number(index) + Number(i);
                $('#cell-table')
                	.find('tr')
                    	.find('td:eq('+ind+')').each(function(){
                    		cell = $(this);
							if(cell.attr('id') != undefined && $(this).text().trim() != "") {
								// Update col field for cell
								tm_data = '{ "id": '+$(this).attr('id')+','+
									'"product_id": '+product_id+','+
                        			'"col": \"'+col.text()+
								'\"}';
								tm_arr.push(tm_data);
							}
                });
            }
			//console.log("col: "+tm_arr);
			progress("Deleting column \""+col.text()+"\"...");
			//AJAX handling - call "update_sub_col()"
			if(tm_arr.length > 0) {
				$.ajax({
            		type: "POST",
            		dataType: "json",
            		timeout: TIMEOUT,
            		error: function(req, s, err) {
                		if(s == "timeout") {
                    		when_ajax_timeout();
                		}   
            		},  
            		url: "/delete_sub_col",
					data: {
						"product_id": '['+get_product_id().join()+']',
						"tm_data": '['+tm_arr.join()+']',	
						"csrfmiddlewaretoken": $('#csrf_token').attr('value')
					},
					success: function(json) {
						when_modified(json);
						progress("Deleted column \""+col.text()+"\" successfully");
					}
				});
			}
		}
	}
}

function commit_update(container) {
	if(ajax) {
		if(container.hasClass('li-parent-label') || container.hasClass('li-leaf')) {
				var li_leaf = container;
				var li_leaf_id = li_leaf.attr('id');
				var li_parent_id = li_leaf.parent().parent().attr('id'); 
    			var tr = $('#cell-table').find('tr[id='+li_leaf_id+']');
				var tm_arr 	= [];
				tr.find('.cell').each(function(){
					if($(this).attr('id') != undefined) {
            			var sub_col = $('.sub-col:eq('+$(this).index()+')');
    					var col    	= $('.col:eq('+getColIndex(sub_col)+')');
						var product_id = col.attr('productid');
						tm_data = '{ "id": '+$(this).attr('id')+','+
                       				'"sub_col": \"'+sub_col.text()+'\",'+
                       				'"col": \"'+col.text()+'\",'+
                       				'"calcstatus": \"'+$(this).text()+'\",'+
									'"product_id": '+product_id+','+
                  					'"tc_id": '+li_leaf_id+
								'}';
						tm_arr.push(tm_data);
					}
				});
				//console.log(tc_arr);
				//console.log(tm_arr);
				progress("Updating leaf testcase \""+li_leaf.text()+"\"...");
				//AJAX handling - call "update_sub_col()"
				if(tm_arr.length > 0) {
					$.ajax({
            			type: "POST",
            			dataType: "json",
            			timeout: TIMEOUT,
            			error: function(req, s, err) {
                			if(s == "timeout") {
                    			when_ajax_timeout();
                			}   
            			},  
            			url: "/update_cell",
						data: {
							"product_id": '['+get_product_id().join()+']',
							"tm_data": '['+tm_arr.join()+']',	
							"csrfmiddlewaretoken": $('#csrf_token').attr('value')
						},
						success: function(json) {
							when_modified(json);
							progress("Updated leaf testcase \""+li_leaf.text()+"\" successfully");
							li_leaf.highlight();
							tr.highlight();
       						$('#cell-table')
           						.find('tr[id='+li_leaf_id+']').each(function(){
										$(this).attr('id',json[$(this).attr('id')]);
										$(this).find('.cell').each(function() {
                   							cell = $(this);
											if(cell.attr('id') != undefined && cell.text().trim() != "") {
												cell.highlight();
											}
										});
										$(this).highlight();			
							});
						}
					});
				}
		}
	}
}


function commit_insert(dest_container, container) {
	if(ajax) {	// Make sure AJAX flag is enabled
		commit_init();
		if(dest_container == undefined && container.hasClass('cell')) { 
				var cell = container;
          		var sub_col = $('.sub-col:eq('+cell.index()+')');
    			var col    	= $('.col:eq('+getColIndex(sub_col)+')');
				var product_id = col.attr('productid');
				var tc_id   = cell.parent().attr('id');
				var tc		= list_tree_panel.find('.li-leaf[id='+tc_id+']');
				var tm_arr 	= [];
				tm_data = '{ "id": '+cell.attr('id')+','+
               				'"sub_col": \"'+sub_col.text()+'\",'+
              				'"col": \"'+col.text()+'\",'+
              				'"calcstatus": \"'+cell.text()+'\",'+
							'"product_id": '+product_id+','+
           					'"tc_id": '+tc_id+
		   				   '}';
				tm_arr.push(tm_data);
				//console.log(tm_arr);
				//AJAX handling - call "insert_sub_col()"
				//console.log(tm_arr);
				progress("Inserting testmatrix cell for \""+tc.text()+ 
										"\" & \""+col.text()+"/"+sub_col.text()+"\"...");
				if(tm_arr.length > 0) {
					$.ajax({
            			type: "POST",
            			dataType: "json",
            			timeout: TIMEOUT,
            			error: function(req, s, err) {
                			if(s == "timeout") {
                    			when_ajax_timeout();
                			}   
            			},  
            			url: "/insert_cell",
						data: {
							"tm_data": '['+tm_arr.join()+']',	
							"product_id": '['+get_product_id().join()+']',
							"csrfmiddlewaretoken": $('#csrf_token').attr('value')
						},
						success: function(json) {
							when_modified(json);
							progress("Inserted testmatrix cell for \""+tc.text()+ 
										"\" & \""+col.text()+"/"+sub_col.text()+"\" successfully");
							sub_col.highlight();
							tc.highlight();
							if(cell.attr('id') != undefined && cell.text().trim() != "") {
								cell.attr('id',json[cell.attr('id')]);
							}
							cell.highlight();
						}
					});
				}
		}else if(dest_container == undefined || dest_container.hasClass('li-parent-label')) {
			if(container.hasClass('li-leaf')) { 
				var li_leaf = container;
				var li_leaf_id = li_leaf.attr('id');
				var li_parent_id = 0;
				if(dest_container != undefined) {
					li_parent_id = li_leaf.parent().parent().attr('id');
				}
    			var tr = $('#cell-table').find('tr[id='+li_leaf_id+']');
				var tc_arr = [];				    
				tc_data = '{ "id": '+li_leaf_id+','+
                		  '"name": \"'+li_leaf.text().trim()+'\",'+
                		  '"parent_id": '+li_parent_id+
				'}';
				tc_arr.push(tc_data);
				var tm_arr 	= [];
				tr.find('.cell').each(function(){
					if($(this).attr('id') != undefined) {
            			var sub_col = $('.sub-col:eq('+$(this).index()+')');
    					var col    	= $('.col:eq('+getColIndex(sub_col)+')');
						var product_id = col.attr('productid');
						tm_data = '{ "id": '+$(this).attr('id')+','+
                       				'"sub_col": \"'+sub_col.text()+'\",'+
                       				'"col": \"'+col.text()+'\",'+
                       				'"calcstatus": \"'+$(this).text()+'\",'+
									'"product_id": '+product_id+','+
                  					'"tc_id": '+li_leaf_id+
								'}';
						tm_arr.push(tm_data);
					}
				});
				//console.log(tc_arr);
				//console.log(tm_arr);
				progress("Inserting leaf testcase \""+li_leaf.text()+"\"...");
				//AJAX handling - call "update_sub_col()"
				if(tm_arr.length >= 0 && tc_arr.length > 0) {
					$.ajax({
            			type: "POST",
            			dataType: "json",
            			timeout: TIMEOUT,
            			error: function(req, s, err) {
                			if(s == "timeout") {
                    			when_ajax_timeout();
                			}   
            			},  
            			url: "/insert_li",
						data: {
							"product_id": '['+get_product_id().join()+']',
							"tm_data": '['+tm_arr.join()+']',	
							"tc_data": '['+tc_arr.join()+']',	
							"csrfmiddlewaretoken": $('#csrf_token').attr('value')
						},
						success: function(json) {
							when_modified(json);
							progress("Inserted leaf testcase \""+li_leaf.text()+"\" successfully");
							li_leaf.highlight();
							tr.highlight();
    						list_tree_panel
								.find('.li-leaf[id='+li_leaf_id+']')
									.each(function() {
										$(this).attr('id',json[$(this).attr('id')]);
							});
       						$('#cell-table')
           						.find('tr[id='+li_leaf_id+']').each(function(){
										$(this).attr('id',json[$(this).attr('id')]);
										$(this).find('.cell').each(function() {
                   							cell = $(this);
											if(cell.attr('id') != undefined && cell.text().trim() != "") {
												cell.attr('id',json[cell.attr('id')]);
												cell.highlight();
											}
										});
										$(this).highlight();			
							});
						}
					});
				}
			}else if(container.hasClass('li-parent')) { 
				var li = container;
				var li_id = li.attr('id');
				var li_parent_id = 0;
				if(dest_container != undefined) {
					li_parent_id = li.parent().parent().attr('id');
				}
    			var tr = $('#cell-table').find('tr[id='+li_id+']');
				var tc_arr = [];				    
				tc_data = '{ "id": '+li_id+','+
                		  '"name": \"'+li.find('.li-parent-label').text().trim()+'\",'+
                		  '"parent_id": '+li_parent_id+
				'}';
				tc_arr.push(tc_data);
				var tm_arr 	= [];
				//console.log(tc_arr);
				//AJAX handling - call "update_sub_col()"
				progress("Inserting parent testcase \""+li.children('.li-parent-label:first').text()+"\"...");
				if(tc_arr.length > 0) {
					$.ajax({
            			type: "POST",
            			dataType: "json",
            			timeout: TIMEOUT,
            			error: function(req, s, err) {
                			if(s == "timeout") {
                    			when_ajax_timeout();
                			}   
            			},  
            			url: "/insert_li",
						data: {
							"product_id": '['+get_product_id().join()+']',
							"tm_data": '['+tm_arr.join()+']',	
							"tc_data": '['+tc_arr.join()+']',	
							"csrfmiddlewaretoken": $('#csrf_token').attr('value')
						},
						success: function(json) {
							when_modified(json);
							progress("Inserted parent testcase \""+li.children('.li-parent-label:first').text()+"\" successfully");
							li.highlight();
							tr.highlight();
    						list_tree_panel
								.find('.li-parent[id='+li_id+']')
									.each(function() {
										$(this).attr('id',json[$(this).attr('id')]);
							});
       						$('#cell-table')
           						.find('tr[id='+li_id+']').each(function(){
										$(this).attr('id',json[$(this).attr('id')]);
										$(this).highlight();			
							});
						}
					});
				}
			}
		}else if(container.hasClass('sub-col') 
					&& dest_container.hasClass('col')) { // Commit sub-col insert
			var sub_col = container;
			var col 	= dest_container 
			var product_id = col.attr('productid');
			var tm_arr 	= [];
       		$('#cell-table')
           		.find('tr')
               		.find('td:eq('+sub_col.index()+')').each(function(){
                   		cell = $(this);
						if(cell.attr('id') != undefined && $(this).text().trim() != "") {
							// Update sub-col field for cell
							tm_data = '{ "id": '+$(this).attr('id')+','+
                       			'"sub_col": \"'+sub_col.text()+'\",'+
                       			'"tc_id": '+cell.parent().attr('id')+','+
                       			'"calcstatus": \"'+cell.text()+'\",'+
								'"product_id": '+product_id+','+
                       			'"col": \"'+col.text()+
							'\"}';
							tm_arr.push(tm_data);
						}
       		});
			//AJAX handling - call "insert_sub_col()"
			progress("Inserting sub column \""+sub_col.text()+"\"...");
			//console.log(tm_arr);
			if(tm_arr.length > 0) {
				$.ajax({
            		type: "POST",
            		dataType: "json",
            		timeout: TIMEOUT,
            		error: function(req, s, err) {
                		if(s == "timeout") {
                    		when_ajax_timeout();
                		}   
            		},  
            		url: "/insert_sub_col",
					data: {
						"tm_data": '['+tm_arr.join()+']',	
						"product_id": '['+get_product_id().join()+']',
						"csrfmiddlewaretoken": $('#csrf_token').attr('value')
					},
					success: function(json) {
						when_modified(json);
						progress("Inserted sub column \""+sub_col.text()+"\" successfully");
						sub_col.highlight();
						//console.log(json);
       					$('#cell-table')
           					.find('tr')
               					.find('td:eq('+sub_col.index()+')').each(function(){
                   					cell = $(this);
									if(cell.attr('id') != undefined && cell.text().trim() != "") {
										cell.attr('id',json[cell.attr('id')]);
										cell.highlight();
									}
						});
					}
				});
			}
		}
	}
}

function commit_clone(container) {
	if(ajax) {	// Make sure AJAX flag is enabled
		commit_init();
		if(container.hasClass('li-leaf')) { 
			var li_leaf = container;
			var li_leaf_id = li_leaf.attr('id');
			var li_parent = li_leaf.parent().parent();
    		var tr = $('#cell-table').find('tr[id='+li_leaf_id+']');
			var tc_arr = [];				    
			var li_orig_id = li_leaf.attr('orig-id');
			if(li_orig_id == undefined) {
				li_orig_id=0;
			}
			tc_data = '{ "id": '+li_leaf_id+','+
					  	'"orig_id": '+li_orig_id+','+
               		  	'"name": \"'+li_leaf.text().trim()+'\",'+
               		  	'"parent_id": '+li_parent.attr('id')+
			'}';
			tc_arr.push(tc_data);
			var tm_arr 	= [];
			tr.find('.cell').each(function(){
				if($(this).attr('id') != undefined && $(this).text().trim() != "") {
           			var sub_col = $('.sub-col:eq('+$(this).index()+')');
    				var col    	= $('.col:eq('+getColIndex(sub_col)+')');
					var product_id = col.attr('productid');
					tm_data = '{ "id": '+$(this).attr('id')+','+
                   				'"sub_col": \"'+sub_col.text()+'\",'+
                   				'"col": \"'+col.text()+'\",'+
                   				'"calcstatus": \"'+$(this).text()+'\",'+
								'"product_id": '+product_id+','+
              					'"tc_id": '+li_leaf_id+
							'}';
					tm_arr.push(tm_data);
				}
			});
			//AJAX handling - call "update_sub_col()"
			progress("Cloning leaf testcase \""+li_leaf.text()+"\"...");
			if(tm_arr.length >= 0 && tc_arr.length > 0) {
				$.ajax({
            		type: "POST",
            		dataType: "json",
            		timeout: TIMEOUT,
            		error: function(req, s, err) {
                		if(s == "timeout") {
                    		when_ajax_timeout();
                		}   
            		},  
            		url: "/insert_li",
					data: {
						"product_id": '['+get_product_id().join()+']',
						"tm_data": '['+tm_arr.join()+']',	
						"tc_data": '['+tc_arr.join()+']',	
						"csrfmiddlewaretoken": $('#csrf_token').attr('value')
					},
					success: function(json) {
						if(json['ret'] == "fail") {
							alert("Failed to update testmatrix cells to latest rev since "+user+
								" is not member of this testmatrix");
							window.location.reload(true);
						}
						when_modified(json);
						progress("Cloned leaf testcase \""+li_leaf.text()+"\" successfully");
						li_leaf.highlight();
						tr.highlight();
    					list_tree_panel
							.find('.li-leaf[id='+li_leaf_id+']')
								.each(function() {
									$(this).attr('id',json[$(this).attr('id')]);
						});
       					$('#cell-table')
           					.find('tr[id='+li_leaf_id+']').each(function(){
									$(this).attr('id',json[$(this).attr('id')]);
									$(this).find('.cell').each(function() {
               							cell = $(this);
										if(cell.attr('id') != undefined && cell.text().trim() != "") {
											cell.attr('id',json[cell.attr('id')]);
											cell.highlight();
										}
									});
									
						});
					}
				});
			}
		}else if(container.hasClass('li-parent')) { // Commit sub-col clone
    		var li_clone = container;
			var tc_arr = [];				    
			var tm_arr 	= [];
			li_clone.find('.li-leaf, .li-parent-label').each(function() {
				var li_orig_id;
        		var id = 0;
				var li_parent;
        		if($(this).hasClass('li-leaf')) {
            		id = $(this).attr('id'); // For pulling up "tr" based on li-leaf
					li_parent = $(this).parent().parent();
					li_orig_id = $(this).attr('orig-id');
        		} else if($(this).hasClass('li-parent-label')) {
            		id = $(this).parent().attr('id'); // For pulling up "tr" based on li-parent
					li_parent = $(this).parent().parent().parent();
					li_orig_id = $(this).parent().attr('orig-id');
        		}    
				var li_parent_id = li_parent.attr('id');
				if(li_parent.attr('id') == undefined) {
					li_parent_id = 0;
				}
				if(li_orig_id == undefined) {
					li_orig_id=0;
				}
				tc_data = '{ "id": '+id+','+
               		  	'"orig_id": '+li_orig_id+','+
               		  	'"name": \"'+$(this).text().trim()+'\",'+
               		  	'"parent_id": '+li_parent_id+
				'}';
				tc_arr.push(tc_data);
        		var tr_clone = $('#cell-table').find('tr[id='+id+']');
				tr_clone.find('.cell').each(function(){
					if($(this).attr('id') != undefined  && $(this).text().trim() != "") {
           				var sub_col = $('.sub-col:eq('+$(this).index()+')');
    					var col    	= $('.col:eq('+getColIndex(sub_col)+')');
						var product_id = col.attr('productid');
						tm_data = '{ "id": '+$(this).attr('id')+','+
                   					'"sub_col": \"'+sub_col.text()+'\",'+
                   					'"col": \"'+col.text()+'\",'+
                   					'"calcstatus": \"'+$(this).text()+'\",'+
									'"product_id": '+product_id+','+
              						'"tc_id": '+id+
								'}';
						tm_arr.push(tm_data);
					}
				});
    		});
			//console.log(tc_arr);
			//console.log(tm_arr);
			//AJAX handling - call "update_sub_col()"
			progress("Cloning parent testcase \""+li_clone.children('.li-parent-label:first').text()+"\"...");
			if(tm_arr.length >= 0 && tc_arr.length > 0) {
				$.ajax({
            		type: "POST",
            		dataType: "json",
            		timeout: TIMEOUT,
            		error: function(req, s, err) {
                		if(s == "timeout") {
                    		when_ajax_timeout();
                		}   
            		},  
            		url: "/insert_li",
					data: {
						"product_id": '['+get_product_id().join()+']',
						"tm_data": '['+tm_arr.join()+']',	
						"tc_data": '['+tc_arr.join()+']',	
						"csrfmiddlewaretoken": $('#csrf_token').attr('value')
					},
					success: function(json) {
						when_modified(json);
						progress("Cloned parent testcase \""+li_clone.children('.li-parent-label:first').text()+"\" successfully");
    					li_clone.find('.li-leaf, .li-parent-label').each(function() {
        					var id;
        					if($(this).hasClass('li-leaf')) {
            					id = $(this).attr('id'); // For pulling up "tr" 
                                     					// based on li-leaf
            					$(this).attr('id',json[id]).highlight(); // Change ID of
                                                   					// leaf li.
        					} else if($(this).hasClass('li-parent-label')) {
            					id = $(this).parent().attr('id'); // For pulling up "tr" 
                                              					// based on li-parent
            					$(this).parent().attr('id',json[id]).highlight(); // Change ID of 
                                                            					// parent li.
        					}    
        					var tr_clone = $('#cell-table').find('tr[id='+id+']');
							tr_clone.find('.cell').each(function(){
								var td = $(this);
								if(td.attr('id') != undefined && $(this).text().trim() != "") {
        							td.attr('id',json[td.attr('id')]);
									td.highlight();
								}
							});
        					tr_clone.attr('id',json[id]);
							tr_clone.highlight(); 
    					});
					}
				});
			}
		}else if(container.hasClass('sub-col')) { // Commit sub-col clone
			var sub_col = container;
    		var col    	= $('.col:eq('+getColIndex(sub_col)+')');
			var product_id = col.attr('productid');
			var tm_arr 	= [];
       		$('#cell-table')
           		.find('tr')
               		.find('td:eq('+sub_col.index()+')').each(function(){
                   		cell = $(this);
						if(cell.attr('id') != undefined  && $(this).text().trim() != "") {
							// Update sub-col field for cell
							tm_data = '{ "id": '+$(this).attr('id')+','+
                       			'"sub_col": \"'+sub_col.text()+'\",'+
                       			'"tc_id": '+cell.parent().attr('id')+','+
                       			'"calcstatus": \"'+cell.text()+'\",'+
								'"product_id": '+product_id+','+
                       			'"col": \"'+col.text()+
							'\"}';
							tm_arr.push(tm_data);
						}
       		});
			//AJAX handling - call "insert_sub_col()"
			progress("Cloning sub column \""+sub_col.text()+"\"...");
			//console.log(tm_arr);
			if(tm_arr.length > 0) {
				$.ajax({
            		type: "POST",
            		dataType: "json",
            		timeout: TIMEOUT,
            		error: function(req, s, err) {
                		if(s == "timeout") {
                    		when_ajax_timeout();
                		}   
            		},  
            		url: "/insert_sub_col",
					data: {
						"tm_data": '['+tm_arr.join()+']',	
						"product_id": '['+get_product_id().join()+']',
						"csrfmiddlewaretoken": $('#csrf_token').attr('value')
					},
					success: function(json) {
						when_modified(json);
						progress("Cloned sub column \""+sub_col.text()+"\" successfully");
						sub_col.highlight();
						//console.log(json);
       					$('#cell-table')
           					.find('tr')
               					.find('td:eq('+sub_col.index()+')').each(function(){
                   					cell = $(this);
									if(cell.attr('id') != undefined && cell.text().trim() != "") {
										cell.attr('id',json[cell.attr('id')]);
										cell.highlight();
									}
						});
					}
				});
			}
		}else if(container.hasClass('col')) { // Commit col clone
			var col 	= container
			var tm_arr 	= [];
            var index 	= getNonColspanIndex(col);
            var colspan = col.attr('colspan');
			var product_id = col.attr('productid');
            for(var i=0; i<colspan; i++) {
                var ind = Number(index) + Number(i);
				var sub_col = $('.sub-col:eq('+ind+')');
                $('#cell-table')
                	.find('tr')
                    	.find('td:eq('+ind+')').each(function(){
                    		cell = $(this);
							if(cell.attr('id') != undefined  && $(this).text().trim() != "") {
								// Update sub-col field for cell
								tm_data = '{ "id": '+$(this).attr('id')+','+
                       				'"sub_col": \"'+sub_col.text()+'\",'+
                       				'"tc_id": '+cell.parent().attr('id')+','+
                       				'"calcstatus": \"'+cell.text()+'\",'+
									'"product_id": '+product_id+','+
                       				'"col": \"'+col.text()+
								'\"}';
								tm_arr.push(tm_data);
							}
                });
            }
			//AJAX handling - call "insert_sub_col()"
			progress("Cloning column \""+col.text()+"\"...");
			//console.log(tm_arr);
			if(tm_arr.length > 0) {
				$.ajax({
            		type: "POST",
            		dataType: "json",
            		timeout: TIMEOUT,
            		error: function(req, s, err) {
                		if(s == "timeout") {
                    		when_ajax_timeout();
                		}   
            		},  
            		url: "/insert_sub_col",
					data: {
						"tm_data": '['+tm_arr.join()+']',	
						"product_id": '['+get_product_id().join()+']',
						"csrfmiddlewaretoken": $('#csrf_token').attr('value')
					},
					success: function(json) {
						when_modified(json);
						progress("Cloned column \""+col.text()+"\" successfully");
						col.highlight();
						//console.log(json);
            			for(var i=0; i<colspan; i++) {
                			var ind = Number(index) + Number(i);
							var sub_col = $('.sub-col:eq('+ind+')');
                			$('#cell-table')
                				.find('tr')
                    				.find('td:eq('+ind+')').each(function(){
                    					cell = $(this);
										if(cell.attr('id') != undefined && cell.text().trim() != "") {
											cell.attr('id',json[cell.attr('id')]);
											cell.highlight();
										}
							});
						}
					}
				});
			}
		}
	}
}

function commit_drag(src_container, dest_container) {
	if(ajax) {	// Make sure AJAX flag is enabled
		commit_init();
		if(dest_container.hasClass('li-parent-label') || dest_container.hasClass('li-leaf')) { // Commit li tree drag changes
			if(src_container.hasClass('li-leaf') || 
				src_container.hasClass('li-parent')) { // Move li-leaf or li-parent 
					var tc_arr = [];				   // to a different li-parent
					tc_data = '{ "id": '+src_container.attr('id')+','+
                 			'"parent_id": \"'+dest_container.parent().attr('id')+
					'\"}';
					tc_arr.push(tc_data);
					//console.log(tc_arr);
				//AJAX handling - call "update_col()"
				progress("Moving leaf testcase \""+src_container.find('a:first').text()+"\" to \""+
							dest_container.text()+"\"...");
				if(tc_arr.length > 0) {
					$.ajax({
            			type: "POST",
            			dataType: "json",
            			timeout: TIMEOUT,
            			error: function(req, s, err) {
                			if(s == "timeout") {
                    			when_ajax_timeout();
                			}   
            			},  
            			url: "/update_li",
						data: {
							"product_id": '['+get_product_id().join()+']',
							"tc_data": '['+tc_arr.join()+']',	
							"csrfmiddlewaretoken": $('#csrf_token').attr('value')
						},
						success: function(json) {
							when_modified(json);
							progress("Moved testcase \""+src_container.find('a:first').text()+"\" to \""+
										dest_container.text()+"\" successfully");
							src_container.highlight();
						}
					});
				}
			}
		}else if(src_container.hasClass('sub-col')) { // Commit sub-col drag changes
			if(dest_container.hasClass('sub-col')) { // swap sub-col 
				var sub_col_src  = src_container
				var sub_col_dest = dest_container
    			var col_dest   	= $('.col:eq('+getColIndex(sub_col_src)+')');
    			var col_src   	= $('.col:eq('+getColIndex(sub_col_dest)+')');
								// ^ Because src and destination have swapped cols
								// already.
				var product_id_dest = col_dest.attr('productid');
				var product_id_src = col_src.attr('productid');
				var tm_arr 	= [];
        		$('#cell-table')
            		.find('tr')
                		.find('td:eq('+sub_col_src.index()+')').each(function(){
                    		cell = $(this);
							if(cell.attr('id') != undefined  && $(this).text().trim() != "") {
								// Update col field for cell
								tm_data = '{ "id": '+$(this).attr('id')+','+
									'"product_id": '+product_id_dest+','+
                        			'"col": \"'+col_dest.text()+
								'\"}';
								tm_arr.push(tm_data);
							}
        		});
				//console.log("sub-col-src: "+tm_arr);
        		$('#cell-table')
            		.find('tr')
                		.find('td:eq('+sub_col_dest.index()+')').each(function(){
                    		cell = $(this);
							if(cell.attr('id') != undefined  && $(this).text().trim() != "") {
								// Update col field for cell
								tm_data = '{ "id": '+$(this).attr('id')+','+
									'"product_id": '+product_id_src+','+
                        			'"col": \"'+col_src.text()+
								'\"}';
								tm_arr.push(tm_data);
							}
        		});
				//console.log("+sub-col-dest: "+tm_arr);
				//AJAX handling - call "update_col()"
				//progress("Moving sub column \""+sub_col_src.text()+"\" from \""+col_src.text()+"\" to \""+col_dest.text()+"\""+
						//" and moving sub column \""+sub_col_dest.text()+"\" from \""+col_dest.text()+"\" to \""+col_src.text()+"\"...";
				progress("Swapping sub columns \""+sub_col_src.text()+"\" and \""+sub_col_dest.text()+"\"...");
				if(tm_arr.length > 0) {
					$.ajax({
            			type: "POST",
            			dataType: "json",
            			timeout: TIMEOUT,
            			error: function(req, s, err) {
                			if(s == "timeout") {
                    			when_ajax_timeout();
                			}   
            			},  
            			url: "/update_col",
						data: {
							"product_id": '['+get_product_id().join()+']',
							"tm_data": '['+tm_arr.join()+']',	
							"csrfmiddlewaretoken": $('#csrf_token').attr('value')
						},
						success: function(json) {
							when_modified(json);
							progress("Swapped sub columns \""+sub_col_src.text()+"\" and \""+sub_col_dest.text()+"\" successfully");
							col_src.highlight();
							col_dest.highlight();
						}
					});
				}
			}else if(dest_container.hasClass('col')) { // move to another col
				var sub_col  = src_container
    			var col   	 = $('.col:eq('+getColIndex(sub_col)+')');
								// ^ Because sub-col has already moved to desired col.
				var product_id = col.attr('productid');
				var tm_arr 	= [];
        		$('#cell-table')
            		.find('tr')
                		.find('td:eq('+sub_col.index()+')').each(function(){
                    		cell = $(this);
							if(cell.attr('id') != undefined  && $(this).text().trim() != "") {
								// Update col field for cell
								tm_data = '{ "id": '+$(this).attr('id')+','+
									'"product_id": '+product_id+','+
                        			'"col": \"'+col.text()+
								'\"}';
								tm_arr.push(tm_data);
							}
        		});
				//console.log("sub-col: "+tm_arr);
				//AJAX handling - call "update_sub_col()"
				progress("Moving sub column \""+sub_col.text()+"\" to \""+col.text()+"\"...");
				if(tm_arr.length > 0) {
					$.ajax({
            			type: "POST",
            			dataType: "json",
            			timeout: TIMEOUT,
            			error: function(req, s, err) {
                			if(s == "timeout") {
                    			when_ajax_timeout();
                			}   
            			},  
            			url: "/update_col",
						data: {
							"product_id": '['+get_product_id().join()+']',
							"tm_data": '['+tm_arr.join()+']',	
							"csrfmiddlewaretoken": $('#csrf_token').attr('value')
						},
						success: function(json) {
							when_modified(json);
							progress("Moved sub column \""+sub_col.text()+"\" to \""+col.text()+"\" succesfully");
							col.highlight();
							sub_col.highlight();
						}
					});
				}
			}
		}
	}
}

function commit_edit(container) {
	if(ajax) {	// Make sure AJAX flag is enabled
		commit_init();
		if(container.hasClass('sub-col')) { // Commit sub-col updates
			var sub_col = container
			var tm_arr 	= [];
    		var col    	= $('.col:eq('+getColIndex(sub_col)+')');
			var product_id = col.attr('productid');
        	$('#cell-table')
            	.find('tr')
                	.find('td:eq('+sub_col.index()+')').each(function(){
                    	cell = $(this);
						if(cell.attr('id') != undefined  && $(this).text().trim() != "") {
							// Update sub-col field for cell
							tm_data = '{ "id": '+$(this).attr('id')+','+
								'"product_id": '+product_id+','+
                        		'"sub_col": \"'+sub_col.text()+
							'\"}';
							tm_arr.push(tm_data);
						}
        	});
			//console.log("sub-col: "+tm_arr);
			progress("Updating sub column name to \""+sub_col.text()+"\"...");
			//AJAX handling - call "update_sub_col()"
			if(tm_arr.length > 0) {
				$.ajax({
            		type: "POST",
            		dataType: "json",
            		timeout: TIMEOUT,
            		error: function(req, s, err) {
                		if(s == "timeout") {
                    		when_ajax_timeout();
                		}   
            		},  
            		url: "/update_sub_col",
					data: {
						"product_id": '['+get_product_id().join()+']',
						"tm_data": '['+tm_arr.join()+']',	
						"csrfmiddlewaretoken": $('#csrf_token').attr('value')
					},
					success: function(json) {
						when_modified(json);
						progress("Updated sub column name to \""+sub_col.text()+"\" successfully");
						sub_col.highlight().addClass('dirty');
        				$('#cell-table')
            				.find('tr')
                				.find('td:eq('+sub_col.index()+')').each(function(){
									if($(this).text().trim() != "") {
                    					$(this).highlight().addClass('dirty');
									}
						});
					}
				});
			}
		} else if(container.hasClass('col')) { // Commit col updates
			var col 	= container
			var product_id = col.attr('productid');
			var tm_arr 	= [];
            var index 	= getNonColspanIndex(col);
            var colspan = col.attr('colspan');
            for(var i=0; i<colspan; i++) {
                var ind = Number(index) + Number(i);
                $('#cell-table')
                	.find('tr')
                    	.find('td:eq('+ind+')').each(function(){
                    		cell = $(this);
							if(cell.attr('id') != undefined  && $(this).text().trim() != "") {
								// Update col field for cell
								tm_data = '{ "id": '+$(this).attr('id')+','+
									'"product_id": '+product_id+','+
                        			'"col": \"'+col.text()+
								'\"}';
								tm_arr.push(tm_data);
							}
                });
            }
			//console.log("col: "+tm_arr);
			progress("Updating column name to \""+col.text()+"\"...");
			//AJAX handling - call "update_col()"
			if(tm_arr.length > 0) {
				$.ajax({
            		type: "POST",
            		dataType: "json",
            		timeout: TIMEOUT,
            		error: function(req, s, err) {
                		if(s == "timeout") {
                    		when_ajax_timeout();
                		}   
            		},  
            		url: "/update_col",
					data: {
						"product_id": '['+get_product_id().join()+']',
						"tm_data": '['+tm_arr.join()+']',	
						"csrfmiddlewaretoken": $('#csrf_token').attr('value')
					},
					success: function(json) {
						when_modified(json);
						progress("Updated column name to \""+col.text()+"\" successfully");
						col.highlight().addClass('dirty');
            			for(var i=0; i<colspan; i++) {
                			var ind = Number(index) + Number(i);
                			$('#cell-table')
                				.find('tr')
                    				.find('td:eq('+ind+')').each(function(){
										if($(this).text().trim() != "") {
                    						$(this).highlight().addClass('dirty');
										}
							});
						}
					}
				});
			}
		}
	}
}

function init_save_discard() {
	$('.save').click(function(){
		if(confirm("Are you sure you want to Save all changes permanently? You will not be able to revert any changes.")) {
			enableHover=false; // Just because..
			$('#matrix-div').css({opacity: 0.5});
			set_status("Saving  all changes to database persistently...");
			commit_save();
		}
	});
	$('.discard').click(function(){
		if(confirm("Are you sure you want to Discard all changes permanently? You will lose all progress since last save.")) {
			enableHover=false; // Just because..
			$('#matrix-div').css({opacity: 0.5});
			set_status("Reverting testmatrix to its previous state...");
			commit_discard();
		}
	});
}

// Plugins
$.fn.editable = function() {  
    $(this).on({
            'dblclick': function(e) {
                if($(this).find('.editable').length != 0 )
                    return;
                e.preventDefault();
                e.stopPropagation();
                var width = $(this).width();
                var text = $(this).text();
                $(this).attr('text', text);
                var input = $("<input class=\"editable\"/>");
                $(this).text("");
                $(this).append(input);
                input.width(width);
                input.val(text);
                input.focus();
            },
            'click': function(e) {
                e.preventDefault();
                e.stopPropagation();
            }
        },this).on({
            'click': function(e) {
                e.preventDefault();
                e.stopPropagation();
            },
            'blur': function(e) {
                e.preventDefault();
                e.stopPropagation();
                var container = $(this).parent();
				if($(this).val().trim() != "" && $(this).val().trim() != container.attr('text') &&
					confirm("Are you sure you want to rename to \""+$(this).val()+"\"?")) { 
                    container.html($(this).val());
					if(container.attr('text') != $(this).val()) {
						commit_edit(container);
					}
				}else{
					container.html(container.attr('text'));
				}
                $(this).remove();
                beautify();
            },
            'keydown': function(e) {
                if (e.keyCode == 27) {
                    $(this).val("").blur();
                }else if(e.keyCode == 13) {
                    $(this).blur();
                }
            }
        },'.editable');
}

$.fn.popup = function(menu) {
    var element = $(this);
    var x = element.position().left + element.width()/2;
    var y = element.position().top;
    $(this).on({
        'contextmenu': function(e) {
            menu.dialog({
                dialogClass: 'popup-menu',
                autoOpen: false,
                modal: true,
                resizable: false,
                //position: [x, y],
                position: [e.pageX, e.pageY],
                /*show: {
                    effect: "none",
                    duration: 300
                },
                hide: {
                    effect: "none",
                    duration: 300
                }
				*/
            })
            .css('overflow','hidden')
            .css('padding','0')
            .unbind('dialogopen')
            .bind('dialogopen', function(event, ui) {
                $('.ui-dialog-content').css('min-height',0);
                $('.ui-dialog-titlebar').hide();
                $('.ui-widget-overlay').unbind('click');
                $('.ui-widget-overlay').css('opacity', 0);
                $('.ui-widget-overlay').click(function() {
                    menu.dialog('close');
                });
            })
            .dialog('open');
            menu.find('span').unbind('click');
            menu.find('span').click(function(){
				if(permission < 1) {
					alert("Access Denied: You do not have permission to modify this martix");
					return;
				}
                menu.dialog('close');
                eval("fn_"+menu.attr('id')+"_"+
                     $(this).attr('id'))(element);
                beautify();
            });
	    fnAdjustSize();
            return false;
        }
    },element.tagName);
}

$.fn.highlight = function() {
    return $(this).each(function() {
        $(this).effect("highlight", {color:"#FFCC00"}, 600);
        //enableHover=false;
        //setInterval(function(){enableHover=true;},1000);
    });
};

// Main
function beautify() {
	return;
	$('ul-main').css('width','200px');
	$('.cell').each(function(){
		$(this).css('height','0px');
	});
	$('.li-leaf').each(function(){
		$(this).css('height','0px');
	});
	list_tree_panel.find('.li-leaf').each(function(){
		c1 = $(this);
		c2 = $('#cell-table').find('.row[id='+c1.attr('id')+']');
		h1 = c1.outerHeight();
		h2 = c2.outerHeight();
		if(h1 > h2){
			c2.outerHeight(h1);
		}else{
			c1.outerHeight(h2);
		}
	});
	list_tree_panel.find('.li-parent-label').each(function(){
		c1 = $(this);
		c2 = $('#cell-table').find('.row-filler[id='+c1.parent().attr('id')+']');
		h1 = c1.outerHeight();
		h2 = c2.outerHeight();
		if(h1 > h2){
			c2.outerHeight(h1);
		}else{
			c1.outerHeight(h2);
		}
	});
    sync_columns_cells();
    fnAdjustSize();
}

function make_editable() {
    $('.col, .sub-col')
        .editable();
}

var timeout;
function progress(str){
	clearTimeout(timeout);
	$('.status-bar').fadeTo(0,1);
	$('.status-bar').text(str)
	timeout=setTimeout(function(){$('.status-bar').fadeTo(500,0)},5000);
}

function set_status(str){
	clearTimeout(timeout);
	$('.status-bar').fadeTo(0,1).text(str)
}

function last_modified() {
	modifying = true;
	$('.modified-label').text("Checking for any unsaved modifications...");
	$.ajax({
       	type: "POST",
        dataType: "json",
        timeout: TIMEOUT,
        error: function(req, s, err) {
            if(s == "timeout") {
                when_ajax_timeout();
            }   
        },  
        url: "/last_modified",
		data: {
			"product_id": '['+get_product_id().join()+']',
			"csrfmiddlewaretoken": $('#csrf_token').attr('value')
		},
		success: function(json) {
			when_modified(json);
			modifying = false;
		}
	});
}

function legendLabelFormatter(label, series) {
	//return "<div class=\"pie-label\">" + label + "<br/>" + Math.round(series.percent) + "%</div>";
	return "<div class=\"pie-legend-label\">"+ label + "%</div>";
}

function labelFormatter(label, series) {
	//return "<div class=\"pie-label\">" + label + "<br/>" + Math.round(series.percent) + "%</div>";
	return "<div class=\"pie-label\">"+ Math.round(series.percent) + "%</div>";
}

function get_automated() {
	if(!get_automated_in_progress) {
		get_automated_in_progress = true;
		modifying = true;
		$.ajax({
        	type: "POST",
        	dataType: "json",
        	timeout: TIMEOUT,
        	error: function(req, s, err) {
            	if(s == "timeout") {
                	when_ajax_timeout();
            	}   
        	},  
        	url: "/get_automated",
			data: {
				"product_id": '['+get_product_id().join()+']',
				"csrfmiddlewaretoken": $('#csrf_token').attr('value')
			},
			success: function(json) {
				$('.automated-graph-panel').show();
				automated_bar_data = JSON.parse(json['time']);
				total = 1;
				if(automated_bar_data['total'] > 0){
					total = automated_bar_data['total'];
				}
				automated_p = Math.floor((automated_bar_data['automated']/total)*100);
				automated_p_float = (automated_bar_data['automated']/total)*100;
				if(automated_p > 10){
					$('.automated-bar > span').text("");
					$('.automated-section').width(automated_p+"%");
					$('.automated-section').text(automated_p+"%");
				}else{
					if(automated_p_float > 0 && automated_p_float < 1) {
						$('.automated-section').width(automated_p+"%");
						$('.automated-section').text("");
						$('.automated-bar > span').text("< 1%");
					}else{
						$('.automated-section').width(automated_p+"%");
						$('.automated-section').text("");
						$('.automated-bar > span').text(automated_p+"%");
					}
				}
				if(automated_p_float > 0){ // Only then makes sense to breakdown
					$('.automated-breakdown-div').show();
					pass_p = Math.floor((automated_bar_data['P']/automated_bar_data['automated'])*100);
					pass_f = Math.floor((automated_bar_data['F']/automated_bar_data['automated'])*100);
					pass_u = Math.floor((automated_bar_data['U']/automated_bar_data['automated'])*100);
					pass_t = Math.floor((automated_bar_data['T']/automated_bar_data['automated'])*100);
					pass_s = Math.floor((automated_bar_data['S']/automated_bar_data['automated'])*100);

					// Hack to add margin of error from Math.floor
					arr = [pass_p, pass_f, pass_u, pass_t, pass_s]	
					sum = arr.reduce(function(a, b) { return a + b; }, 0);
					if(sum < 100){
						arr[arr.indexOf(Math.max.apply(Math, arr))] += 100-sum;
					}
					pass_p = arr[0];
					pass_f = arr[1];
					pass_u = arr[2];
					pass_t = arr[3];
					pass_s = arr[4];
					// End hack

					$('.automated-pass').width(pass_p+"%");
					$('.automated-fail').width(pass_f+"%");
					$('.automated-untested').width(pass_u+"%");
					$('.automated-testing').width(pass_t+"%");
					$('.automated-skipped').width(pass_s+"%");

					if(pass_p > 10) 
						$('.automated-pass').text(pass_p+"%");
					if(pass_f > 10) 
						$('.automated-fail').text(pass_f+"%");
					if(pass_u > 10) 
						$('.automated-untested').text(pass_u+"%");
					if(pass_t > 10) 
						$('.automated-testing').text(pass_t+"%");
					if(pass_s > 10) 
						$('.automated-skipped').text(pass_s+"%");
				}
				//$.plot('.automated-graph-panel > .automated-bar', get_automated_bar_data() , automated_bar_options);
				modifying = false;
				get_automated_in_progress = false;
			}
		});
	}
}

var plot_options = {
   	series: { 
       	pie: {
           	show: true,
			radius: 1,
           	label: {
               	show: true,
               	radius: 2/3,
				formatter: labelFormatter,
				threshold: 0.05,
				background: {
                	   opacity: 0.0 
               	}
           	},
       	},
	},
	grid: {
    	//hoverable: true
	    clickable: true
	},
	legend: {
       	show: true,
		radius: 1/2,
       	label: {
           	show: true,
			formatter: legendLabelFormatter,
       	},
   	}	
};

function get_breakdown() {
	if(!get_breakdown_in_progress) {
		get_breakdown_in_progress = true;
		modifying = true;
		$.ajax({
        	type: "POST",
        	dataType: "json",
        	timeout: TIMEOUT,
        	error: function(req, s, err) {
            	if(s == "timeout") {
                	when_ajax_timeout();
            	}   
        	},  
        	url: "/get_breakdown",
			data: {
				"product_id": '['+get_product_id().join()+']',
				"csrfmiddlewaretoken": $('#csrf_token').attr('value')
			},
			success: function(json) {
				$('.completion-panel').show();
				$('.progress-graph-panel').show();
				pie_data = JSON.parse(json['time']);
				sum = pie_data['P'] + pie_data['F'] + pie_data['S']; 
				total = 1;
				if(pie_data['total'] > 0){
					total = pie_data['total'];
				}
				$('.completion-summary').html("");
				if(pie_data['exec_summary'].trim() != "") {
					$('.completion-summary').append("<span>Ran: "+pie_data['exec_summary']+"</span><br>");
				}
				if(pie_data['total_summary'].trim() != "") {
					$('.completion-summary').append("<span>Total: "+pie_data['total_summary']+"</span>");
				}
				completion_p = Math.floor((sum/total)*100);
				completion_p_float = (sum/total)*100;
				if(completion_p > 10){
					$('.completion-bar > span').text("");
					$('.completion').width(completion_p+"%");
					$('.completion').text(completion_p+"%");
				}else{
					if(completion_p_float > 0 && completion_p_float < 1) {
						$('.completion').width(completion_p+"%");
						$('.completion').text("");
						$('.completion-bar > span').text("< 1%");
					}else{
						$('.completion').width(completion_p+"%");
						$('.completion').text("");
						$('.completion-bar > span').text(completion_p+"%");
					}
				}
				$.plot('.progress-graph-panel > .pie', get_breakdown_pie_data() , plot_options);
				modifying = false;
				get_breakdown_in_progress = false;
			}
		});
	}
}

function get_breakdown_pie_data() {
	data= [];
	var empty = true;
	for (key in pie_data) { 
		if(pie_data[key] > 0) 
			empty=false; 
	}
	/*if(empty) {
		pie_data['U'] = 1;
		pie_data['total'] = 1;
	}*/
	if(empty || !empty && pie_data['total'] == 0) {
		data = [
			{
				label: "Nothing",
				data: Math.floor(100),
				color: "#EEEEEE"
			}
		]
	}else{
		data = [
			{
				label: "Pass",
				data: Math.floor((pie_data['P']/pie_data['total'])*100),
				color: "#83D466"
			},
			{
				label: "Fail",
				data: Math.floor((pie_data['F']/pie_data['total'])*100),
				color: "#FF0000"
			},
			{
				label: "Untested",
				data: Math.floor((pie_data['U']/pie_data['total'])*100),
				color: "#CAD5E0"
			},
			{
				label: "Testing",
				data: Math.floor((pie_data['T']/pie_data['total'])*100),
				color: "#F5F553"
			},
			{
				label: "Skipped",
				data: Math.floor((pie_data['S']/pie_data['total'])*100),
				color: "#E0F2B3"
			},
			/*{
				label: "Automated",
				data: Math.floor((pie_data['A']/pie_data['total'])*100),
				color: "#C595DB"
			},*/
		];
	}
	//console.log(pie_data);
	return data;
}

function get_bugs() {
	if(!get_bugs_in_progress) {
		get_bugs_in_progress = true;
		modifying = true;
		$('.bug-none').text("loading...");
		$.ajax({
        	type: "POST",
        	dataType: "json",
        	timeout: TIMEOUT,
        	error: function(req, s, err) {
            	if(s == "timeout") {
                	when_ajax_timeout();
            	}   
        	},  
        	url: "/get_bugs",
			data: {
				"product_id": '['+get_product_id().join()+']',
				"csrfmiddlewaretoken": $('#csrf_token').attr('value')
			},
			success: function(json) {
				bug_arr = json['bug_arr'];
				cr_arr = json['cr_arr'];

				if(cr_arr.length == 0 && bug_arr.length == 0) {
					$('.bug-none').text("None");
				}

				if(cr_arr.length > 0) {
					$('.bug-none').hide();
					$('.cr-list').show();
					$('.cr-list > span').text("CR List ("+cr_arr.length+")");
					for (cr in cr_arr) { 
						$('.cr-list ul').append("<li class=\"cr-item\"><a href="+cr_url+cr_arr[cr]+" target=\"_blank\">CR "+cr_arr[cr]+"</a></li>");
					}
				}
				if(bug_arr.length > 0) {
					$('.bug-none').hide();
					$('.bugdb-list').show();
					$('.bugdb-list > span').text("BugDB List ("+bug_arr.length+")");
					for (b in bug_arr) { 
						$('.bugdb-list > ul').append("<li class=\"bug-item\"><a href="+bug_url+bug_arr[b]+" target=\"_blank\">Bug "+bug_arr[b]+"</a></li>");
					}
				}
			}
		});
	}
}


function when_modified(json) {
	if(json['ret'] == "fail") {
		alert("Access Denied: Not Owner");
		window.location.reload(true);
	}
	// Date modified calculation
	date_modified = json['modified']
	if(date_modified != null) {
		$('.modified-label').html("WARNING: Test Matrix has been modified last on: <i>"+date_modified+"</i>");
		$('.modified-label').addClass('modified-label-active');
		$('.save, .discard').removeAttr('disabled');
	}else{
		$('.modified-label').text("");
		$('.modified-label').removeClass('modified-label-active');
		$('.save, .discard').attr('disabled','disabled');
	}
	get_breakdown();
	get_automated();
	get_bugs();
}

function init_filters() {
	$('.filters').click(function(e){
		e.stopPropagation();
		if(!isLeftFloat){
			enableHover=false;
			$('.float-panel-left').show("slide", { direction: "left" }, 200);
			$('.float-panel-left').html('<label class=loading>Loading...</label>');

			// TC tree
			function gen_tc(li_list) {
				li_list.each(function(){
					li = $(this);
					checked = ""
					if(li.is(':visible')){
						checked = "checked";
					}
					if(li.children('ul').length == 0) {
						tc_str += "<li class=\"leaf\" id="+
									li.attr('id')+"><span>"+
									li.children('a:first').text()+
									"</span><input type=\"checkbox\" "+
									checked+"/></li>";
					}else{
						tc_str += "<li class=\"parent\" id="+
									li.attr('id')+"><div><span>"+
									li.children('a:first').text()+
									"</span><input type=\"checkbox\" "+
									checked+"/></div><ul>";
						gen_tc(li.children('ul').children('li'));
						tc_str += "</ul></li>";
					}
				});
			}
			tc_str = "<ul class=\"selector\">";
			gen_tc($('.ul-main').children('li'));
			tc_str += "</ul>";

			// Col tree
			col_obj = {};
			s = "";
			$('.column-header-panel').find('.sub-col').each(function(){
				sub_col = $(this);
				sub_col.attr('id',sub_col.index());
				if(!sub_col.attr('orig_colspan'))
					sub_col.attr('orig_colspan',sub_col.attr('colspan'));

				col = $('.column-header-panel').find('.col:eq('+
												getColIndex(sub_col)+')');
				col.attr('id',col.index());
				if(!col.attr('orig_colspan'))
					col.attr('orig_colspan',col.attr('colspan'));

				mcol = 0;
				if($('.column-header-panel').find('.col-product').length > 0) {
					mcol = $('.column-header-panel').find('.col-product:eq('+
													getMColIndex(sub_col)+')');
					mcol.attr('id',mcol.index());
					if(!mcol.attr('orig_colspan'))
						mcol.attr('orig_colspan',mcol.attr('colspan'));

					if(!(mcol.index() in col_obj)) {
						col_obj[mcol.index()] = {};
					}	
					if(!(col.index() in col_obj[mcol.index()])) {
						col_obj[mcol.index()][col.index()] = {};
					}
					if(!(sub_col.index() in col_obj[mcol.index()][col.index()])) {
						col_obj[mcol.index()][col.index()][sub_col.index()] = 
																sub_col.index();
					}
				}else{
					if(!(col.index() in col_obj)) {
						col_obj[col.index()] = {};
					}
					if(!(sub_col.index() in col_obj[col.index()])) {
						col_obj[col.index()][sub_col.index()] = null;
					}
				}
			});
			col_str = "<ul class=\"selector\">";
			if($('.column-header-panel').find('.col-product').length > 0) {
				for(i in col_obj) {
					mcol = $('.column-header-panel').find('.col-product[id='+i+']');
					checked = ""
					if(mcol.is(':visible')){
						checked = "checked";
					}
					col_str += "<li class=\"parent\" type=\"col-product\" id="+i+
								"><div><span>"+mcol.text()+
								"</span><input type=\"checkbox\" "+checked+
								"/></div><ul>";
					for(j in col_obj[i]) {
						col = $('.column-header-panel').find('.col[id='+j+']');
						checked = ""
						if(col.is(':visible')){
							checked = "checked";
						}
						col_str += "<li class=\"parent\" type=\"col\" id="+
									j+"><div><span>"+col.text()+
									"</span><input type=\"checkbox\" "+
									checked+"/></div><ul>";
						for(k in col_obj[i][j]) {
							sub_col = $('.column-header-panel').find('.sub-col[id='+
																			k+']');
							checked = ""
							if(sub_col.is(':visible')){
								checked = "checked";
							}
							col_str += "<li class=\"leaf\" type=\"sub-col\" id="+
										k+"><span>"+sub_col.text()+
										"</span><input type=\"checkbox\" "+checked+
										"/></li>";
						}
						col_str += "</ul></li>";
					}
					col_str += "</ul></li>";
		    	}	
			}else{
				for(i in col_obj) {
					col = $('.column-header-panel').find('.col[id='+i+']');
					checked = ""
					if(col.is(':visible')){
						checked = "checked";
					}
					col_str += "<li class=\"parent\" type=\"col\" id="+i+
								"><div><span>"+col.text()+
								"</span><input type=\"checkbox\" "+checked+
								"/></div><ul>";
					for(j in col_obj[i]) {
						sub_col = $('.column-header-panel').find('.sub-col[id='+
																			j+']');
						checked = ""
						if(sub_col.is(':visible')){
							checked = "checked";
						}
						col_str += "<li class=\"leaf\" type=\"sub-col\" id="+
									j+"><span>"+sub_col.text()+
									"</span><input type=\"checkbox\" "+
									checked+"/></li>";
					}
					col_str += "</ul></li>";
		    	}	
			}
			col_str += "</ul>";

			// Attach TC tree & col tree
			tc_filter = $("<div class=\"tc-filter\"><span>Testcase Filters</span></div>");
			col_filter = $("<div class=\"col-filter\"><span>Column Filters</span></div>");
                        cell_filter = $("<div class=\"col-filter\"><span>Cell Filters</span></div>");
                        //$(document).find('.row').each(function() { if(!$(this).find('.cell.pass') { $(this).hide(); } });
			tc_filter.append($(tc_str));
			col_filter.append($(col_str));
			//cell_filter.append($(col_str));
			$('.float-panel-left').html("")
								  .append(tc_filter)
								  .append(col_filter);

			tc_filter.add(col_filter).on({
				click: function(){
					$(this).siblings('.selector').slideToggle(100);
				}
			},'span');

			tc_filter.on({
				click: function(){
					id = $(this).closest('li').attr('id');
					if($(this).is(':checked')) {
						list_tree_panel.find('li[id='+id+']').fadeIn(100);
    					$('#cell-table').find('tr[id='+id+']').fadeIn(100);
						$(this).closest('div').siblings('ul').find('input').each(function(){
							id = $(this).closest('li').attr('id');
							$(this).attr('checked','true');
							list_tree_panel.find('li[id='+id+']').fadeIn(100);
    						$('#cell-table').find('tr[id='+id+']').fadeIn(100);
						});
						$(this).parents('.parent').children('div').find('input').each(function(){
							id = $(this).closest('li').attr('id');
							$(this).attr('checked','true');
							list_tree_panel.find('li[id='+id+']').fadeIn(100);
    						$('#cell-table').find('tr[id='+id+']').fadeIn(100);
						});
					}else{
						list_tree_panel.find('li[id='+id+']').fadeOut(100);
    					$('#cell-table').find('tr[id='+id+']').fadeOut(100);
						$(this).closest('div').siblings('ul').find('input').each(function(){
							id = $(this).closest('li').attr('id');
							$(this).removeAttr('checked');
							list_tree_panel.find('li[id='+id+']').fadeOut(100);
    						$('#cell-table').find('tr[id='+id+']').hide(100);
						});
					}
				}
			},'input');

			col_filter.on({
				click: function(){
					if($(this).is(':checked')) {
						c = $(this).closest('li').attr('type');
						id = $(this).closest('li').attr('id');
						td = $('.column-header-panel').find('.'+c+'[id='+id+']');
						if(c == 'sub-col' && !(td.is(':visible'))) {
							td.show();
							return;
							ind = td.index();
							$('#cell-table').find('.row').find('td:eq('+ind+')').each(function(){
								$(this).show();
							});
							col_li = $(this).closest('li').closest('li[type=\"col\"]');
							col_ind = col_li.attr('id');
							col = $('.column-header-panel').find('.col[id='+col_ind+']');
							if(col != undefined){
								colspan = Number(col.attr('colspan'));
								if(!(col.is(':visible'))) {
									col.show();
									col_li.children('div').find('input').attr('checked', 'true');
								}
                    			col.attr('colspan',
                       					Number(col.attr('colspan'))+1);
							}
							mcol_li = $(this).closest('li').closest('li[type=\"col-product\"]');
							mcol_ind = mcol_li.attr('id');
							mcol = $('.column-header-panel').find('.col-product[id='+mcol_ind+']');
							if(mcol != undefined){
								mcolspan = Number(mcol.attr('colspan'));
								if(!(mcol.is(':visible'))) {
									mcol.show();
									mcol_li.children('div').find('input').attr('checked', 'true');
								}
                    			mcol.attr('colspan',
                       				Number(mcol.attr('colspan'))+1);
							}
						}else if(c == 'col' && !(td.is(':visible'))) {
							td.show();
							ind = td.index();
            				var sub_ind	= getNonColspanIndex(td);
            				var colspan = td.attr('orig_colspan');
            				for(var i=0; i<colspan; i++) {
                    			td.attr('colspan',
                       				Number(td.attr('colspan'))+1);
                				var index = Number(sub_ind) + Number(i);
								sub_col = $('.column-header-panel').find('.sub-col[id='+index+']');
								sub_col.show();
								sub_col_li = $(this).closest('li').find('li[type=\"sub-col\"][id='+
																			sub_col.attr('id')+']');
								sub_col_li.children('input').attr('checked', 'true');
								$('#cell-table').find('.row').find('td:eq('+index+')').each(function(){
									$(this).show();
								});
								mcol_li = sub_col_li.closest('li').closest('li[type=\"col-product\"]');
								mcol_ind = mcol_li.attr('id');
								mcol = $('.column-header-panel').find('.col-product[id='+mcol_ind+']');
								if(mcol != undefined){
									mcolspan = Number(mcol.attr('colspan'));
									if(!(mcol.is(':visible'))) {
										mcol.show();
										mcol_li.children('div').find('input').attr('checked', 'true');
									}
                    				mcol.attr('colspan',
                       					Number(mcol.attr('colspan'))+1);
								}
							}
						}else if(c == 'col-product' && !(td.is(':visible'))) {
							td.show();
            				var colspan = td.attr('orig_colspan');
							td.attr('colspan',colspan);
            				var sub_ind	= getNonColspanIndex(td);
							$(this).closest('li').find('input').each(function(){;
								$(this).attr('checked','true');
								c = $(this).closest('li').attr('type');
								id = $(this).closest('li').attr('id');
								td = $('.column-header-panel').find('.'+c+'[id='+id+']');
								td.show();
							});
            				for(var i=0; i<colspan; i++) {
                				var index = Number(sub_ind) + Number(i);
								$('#cell-table').find('.row').find('td:eq('+index+')').each(function(){
									$(this).show();
								});
							}
						}
					}else{
						c = $(this).closest('li').attr('type');
						id = $(this).closest('li').attr('id');
						td = $('.column-header-panel').find('.'+c+'[id='+id+']');
						if(c == 'sub-col' && td.is(':visible')) {
							td.hide();
							ind = td.index();
							$('#cell-table').find('.row').find('td:eq('+ind+')').each(function(){
								$(this).hide();
							});
							col_li = $(this).closest('li').closest('li[type=\"col\"]');
							col_ind = col_li.attr('id');
							col = $('.column-header-panel').find('.col[id='+col_ind+']');
							if(col != undefined){
								colspan = Number(col.attr('colspan'));
								if(colspan == 1) {
									col.hide();
									col_li.children('div').find('input').removeAttr('checked');
								}
                    			col.attr('colspan',
                       				Number(col.attr('colspan'))-1);
							}
							mcol_li = $(this).closest('li').closest('li[type=\"col-product\"]');
							mcol_ind = mcol_li.attr('id');
							mcol = $('.column-header-panel').find('.col-product[id='+mcol_ind+']');
							if(mcol != undefined){
								mcolspan = Number(mcol.attr('colspan'));
								if(mcolspan == 1) {
									mcol.hide();
									mcol_li.children('div').find('input').removeAttr('checked');
								}
                    			mcol.attr('colspan',
                       				Number(mcol.attr('colspan'))-1);
							}
						}else if(c == 'col' && td.is(':visible')) {
							td.hide();
							ind = td.index();
            				var colspan = td.attr('orig_colspan');
							td.attr('colspan','0');
            				var sub_ind	= getNonColspanIndex(td);
            				for(var i=0; i<colspan; i++) {
                				var index = Number(sub_ind) + Number(i);
								sub_col = $('.column-header-panel').find('.sub-col[id='+index+']');
								sub_col.hide();
								sub_col_li = $(this).closest('li').find('li[type=\"sub-col\"][id='+
																			sub_col.attr('id')+']');
								sub_col_li.children('input').removeAttr('checked');
								$('#cell-table').find('.row').find('td:eq('+index+')').each(function(){
									$(this).hide();
								});
								mcol_li = sub_col_li.closest('li').closest('li[type=\"col-product\"]');
								mcol_ind = mcol_li.attr('id');
								mcol = $('.column-header-panel').find('.col-product[id='+mcol_ind+']');
								if(mcol != undefined){
									mcolspan = Number(mcol.attr('colspan'));
									if(mcolspan == 1) {
										mcol.hide();
										mcol_li.children('div').find('input').removeAttr('checked');
									}
                    				mcol.attr('colspan',
                       					Number(mcol.attr('colspan'))-1);
								}
							}
						}else if(c == 'col-product' && td.is(':visible')) {
							td.hide();
							td.attr('colspan','0');
            				var colspan = td.attr('orig_colspan');
            				var sub_ind	= getNonColspanIndex(td);
							$(this).closest('li').find('input').each(function(){;
								$(this).removeAttr('checked');
								c = $(this).closest('li').attr('type');
								id = $(this).closest('li').attr('id');
								td = $('.column-header-panel').find('.'+c+'[id='+id+']');
								td.hide();
							});
            				for(var i=0; i<colspan; i++) {
                				var index = Number(sub_ind) + Number(i);
								$('#cell-table').find('.row').find('td:eq('+index+')').each(function(){
									$(this).hide();
								});
							}
						}
					}
        			sync_columns_cells();
					fnAdjustSize();
				}
			},'input');

			isLeftFloat=true;
		}
	});
}

function init_floating_panels() {
	var tc_first_click = true;

	$('.tm-summary').click(function(e){
		if($(this).text() == "Hide Summary") {
			$('body').css('overflow', 'hidden');
			$('.left-div').hide("slide", { direction: "left" }, 300, function(){fnAdjustSize(); $('body').css('overflow', 'auto');});
			$(this).text("Show Summary");
		}else{
			$('body').css('overflow', 'hidden');
			$('.left-div').show("slide", { direction: "left" }, 1, function(){fnAdjustSize(); $('body').css('overflow', 'auto');});
			$(this).text("Hide Summary");
		}
	});

	$('.testcases').click(function(e){
		e.stopPropagation();
		if(!isRightFloat){
			enableHover=false;
			//$('.left-div').hide("slide", { direction: "left" }, 300);
			//$('.right-div').hide("slide", { direction: "right" }, 300, function(){fnAdjustSize();});
			$('.float-panel-right').show("slide", { direction: "right" }, 200);
			if(tc_first_click) {
				$('.float-panel-right').html('<label class=loading>Loading...</label>');
				$('.float-panel-right').load('/tc_tab_load');
				tc_first_click = false;
			}
			isRightFloat=true;
		}
	});

	$('.bottom-panel').click(function(){
		if(isRightFloat){
			$('.float-panel-right').hide("slide", { direction: "right" }, 300);
			enableHover=true;
			isRightFloat=false;
		}
		if(isLeftFloat){
			$('.float-panel-left').hide("slide", { direction: "left" }, 300);
			enableHover=true;
			isLeftFloat=false;
		}
	});
}

function init_loading_icon() {
	$('.loading-div')
		.prepend('<img src="/static/images/loading.gif" />')
   			.hide()  // hide it initially
    			.ajaxStart(function() {
					if(!modifying) {
						$('.bottom-panel').css({opacity: 0.7});
        				$(this).show();
					}
    			})
    			.ajaxStop(function() {
					if(!modifying) {
						$('.bottom-panel').css({opacity: 1.0});
        				$(this).hide();
					}
    			});
}

function apply_merge_col_colors() {
	$('.col-product').each(function(){
		color = Array.apply(0, Array(6)).map(function() {
			    	return (function(charset){
					        return charset.charAt(Math.floor(Math.random() * charset.length))
							    }('ADEF'));
				}).join('');
		$(this).css('background-color','#'+color);
	});
}

function color_automated_rows() {
	$('#cell-table').find('.row[automated=yes]').each(function(){
		$(this).addClass('automated-row');
		$(this).find('.cell[automated=yes]').each(function(){
			$(this).addClass('automated-cell');
		});
		list_tree_panel.find('li[id='+$(this).attr('id')+']').addClass('automated');
	});
}

function init_resize() {
	// Set matrix div width correctly (include matrix's 20+20+20 padding)
	$('#matrix-div').height($(window).height()-100);
	$('#matrix-div').width($(window).width()-$('.left-div').width()-$('.right-div').width()-60);

    fnAdjustSize();
	setTimeout(function(){fnAdjustSize();},1000);
    $(window).resize(function(){
        sync_columns_cells();
        fnAdjustSize();
    });
	list_tree_panel.find('ul:first').addClass("ul-main");
		$('.ul-main').width($('.product-label').width());
    beautify();
}

function set_permissions() {
	if(user == "") {
		permission = -1; // Read only
		ajax = false;
		$('.save, .discard').hide();
		$('.permission-panel span').text("You have \"read only\" permission for this matrix. Log in for more privileges.");
	}else if($.inArray(user, usergroup) >= 0 || superuser || owner == "Anonymous User") {
		permission = 1; // full
		ajax = true;
		$('.permission-panel span').text("You have unrestricted permission to \"view\" and \"modify\" this matrix.");
	}else{
		permission = 0; // limited (add results etc)
		ajax = false;
		$('.save, .discard').hide();
		$('.permission-panel span').text("You have limited permission to \"view\" and \"add results\" to this matrix.");
	}
}

var is_exists;
function add_member_click() {
	$('.add-member').show();
	$('.add-member').click(function(){
		$('.add-member-panel').toggle();
	});
	$('.cancel-member-button').click(function(){
		$('.add-member-panel').hide();
	});
	$('.add-member-button').click(function(){
		var new_users = [];
		$('.add-member-panel option:selected').each(function(){
			if(!is_exists($(this).val())) {
				$('.user-panel > ul').append("<li><span><a href=\"/user/"+$(this).val()+"\">"+$(this).val()+"</a></span><div class=\"del\" style=\"display:none\">x</div></li>");
				new_users.push("\""+$(this).val().trim()+"\"");
			}else{
				alert("User \""+$(this).val()+"\" is already a member of this product group, skipping.");
			}
		});
		$('.add-member-panel').hide();
		commit_add_users(new_users);
	});
	function commit_add_users(new_users) {
		modifying = true;
		$.ajax({
   			type: "POST",
   			dataType: "json",
   			timeout: TIMEOUT,
   			error: function(req, s, err) {
   				if(s == "timeout") {
       				when_ajax_timeout();
       			}   
   			},  
        	url: "/add_users",
			data: {
				"product_id": '['+get_product_id().join()+']',
				"new_users": '['+new_users.join()+']',
				"csrfmiddlewaretoken": $('#csrf_token').attr('value')
			},
			success: function(json) {
				modifying = false;
				new_users = json['new_users'];
				for (u in new_users) {
					$('.user-panel li:contains('+new_users[u]+')').highlight();
				}
			}
		});
	}
	is_exists = function(str) {
		match = false;
		$('.user-panel li span').each(function(){
			if($(this).text().trim().indexOf(str.trim()) >= 0) {
				match = true;
				return false;
			}
		});
		return match;
	}
	$('.user-panel').on({
		'mouseenter': function() {
			$(this).find('.del').show();
		},
		'mouseleave': function() {
			$(this).find('.del').hide();
		}
	},'li');
	$('.user-panel').on({
		'click': function() {
			del_user = $(this).prev().text();
			if(del_user.indexOf(owner) >= 0) {
				alert("Cannot delete owner. To change owner, click on product label to edit.");
				return;
			}
			if(!confirm("Are you sure you want to remove \""+del_user+"\" from the member list for this product?")) {
				return;
			}
			$(this).parent().remove();
			commit_del_users(["\""+del_user+"\""]);
		}
	},'.del');
	function commit_del_users(del_users) {
		modifying = true;
		$.ajax({
   			type: "POST",
   			dataType: "json",
   			timeout: TIMEOUT,
   			error: function(req, s, err) {
   				if(s == "timeout") {
       				when_ajax_timeout();
       			}   
   			},  
        	url: "/del_users",
			data: {
				"product_id": '['+get_product_id().join()+']',
				"del_users": '['+del_users.join()+']',
				"csrfmiddlewaretoken": $('#csrf_token').attr('value')
			},
			success: function(json) {
				del_users = json['del_users'];
				var self_deleted = false;
				for (u in del_users) {
					progress("Removed \""+del_users[u]+"\" from member list");
					if(del_users[u].trim() == user.trim()) {
						self_deleted = true;
					}
				}
				modifying = false;
				if(self_deleted) 
					window.location.reload(true);
			}
		});
	}
}

function init_global_handlers() {
    $('.main').on('contextmenu',function(e){
        return false;
    });
}

$(document).ready(function(){  
	$('body').css('overflow', 'hidden');
	$('.bottom-panel').css('opacity','0.0');
	set_permissions();

	progress("Initializing matrix...");
	list_tree_panel = $('.list-tree-panel');
	get_breakdown();
	get_automated();
	get_bugs();
	init_resize();
   	init_global_handlers(); 
    
	if(permission == 1){
		init_loading_icon();
    	init_tree_dnd();
    	init_col_dnd();
		init_save_discard();
    
    
    	init_tree_popup();
    	init_col_popup();
    	init_product_popup();
		init_cell_popup();
    	
    	make_editable(); 
    	cell_click();
	
		add_member_click();
	}

    	hover_li_leaf();
    	hover_li_parent();
    	hover_col_leaf();
    	hover_col_parent();
    	hover_cell();
    	hover_product();

    init_expander();
	a_click();

	color_automated_rows();
	apply_merge_col_colors();
	init_floating_panels();
	init_filters();

	last_modified();

	progress("Testmatrix loaded successfully!");
});

jQuery(window).load(function (){
	$('.bottom-panel').css({ opacity: 1.0 }).hide().fadeIn(800);
});

