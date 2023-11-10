////////////////////////////////////////// 	Local Variables
var enableHoverTc = true;
var max_id = -1;
var tc_ajax = true;
var tc_tree_panel;
var loader_tc = "/static/images/loading_tc.gif";
var tc_tm_timeout = 500;


////////////////////////////////////////// 	Plugins
$.fn.popup = function(menu) {
    var element = $(this);
    //var x = element.position().left + element.width()/2;
    //var y = element.position().top;
    $(this).on({
        'contextmenu': function(e) {
            menu.dialog({
                dialogClass: 'popup-menu',
                autoOpen: false,
                modal: true,
                resizable: false,
                //position: [x, y],
                position: [e.pageX - $(window).scrollLeft(), e.pageY - $(window).scrollTop()],
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
                menu.dialog('close');
                eval("fn_"+menu.attr('id')+"_"+
                     $(this).attr('id'))(element);
            });
	    // Check if fnAdjustSize exists (for testmatrix view layout adjustments)
	    if(typeof fnAdjustSize == 'function') {
	    	fnAdjustSize();
	    }
            return false;
        }
    },element.tagName);
}

$.fn.highlight = function() {
    return $(this).each(function() {
        $(this).effect("highlight", {color:"#FFCC00"}, 600);
		compute_child_count();
    });
};
var typewatch = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();

jQuery.extend({
    tc_mark: function (node, re, nodeName, className) {
        if (node.nodeType === 3) {
            var match = node.data.match(re);
            if (match) {
                var tc_mark = document.createElement(nodeName || 'span');
                tc_mark.className = className || 'tc-mark';
                var wordNode = node.splitText(match.index);
                wordNode.splitText(match[0].length);
                var wordClone = wordNode.cloneNode(true);
                tc_mark.appendChild(wordClone);
                wordNode.parentNode.replaceChild(tc_mark, wordNode);
                return 1; //skip added node in parent
            }
        } else if ((node.nodeType === 1 && node.childNodes) && // only element nodes that have children
                !/(script|style)/i.test(node.tagName) && // ignore script and style nodes
                !(node.tagName === nodeName.toUpperCase() && node.className === className)) { // skip if already highlighted
            for (var i = 0; i < node.childNodes.length; i++) {
                i += jQuery.tc_mark(node.childNodes[i], re, nodeName, className);
            }
        }
        return 0;
    }
});

jQuery.fn.tc_unmark = function (options) {
    var settings = { className: 'tc-mark', element: 'span' };
    jQuery.extend(settings, options);

    return this.find(settings.element + "." + settings.className).each(function () {
        var parent = this.parentNode;
        parent.replaceChild(this.firstChild, this);
        parent.normalize();
    }).end();
};

jQuery.fn.tc_mark = function (words, options) {
    var settings = { className: 'tc-mark', element: 'span', caseSensitive: false, wordsOnly: false };
    jQuery.extend(settings, options);

    if (words.constructor === String) {
        words = [words];
    }
    words = jQuery.grep(words, function(word, i){
      return word != '';
    });
    words = jQuery.map(words, function(word, i) {
      return word.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    });
    if (words.length == 0) { return this; };

    var flag = settings.caseSensitive ? "" : "i";
    var pattern = "(" + words.join("|") + ")";
    if (settings.wordsOnly) {
        pattern = "\\b" + pattern + "\\b";
    }
    var re = new RegExp(pattern, flag);

    return this.each(function () {
        jQuery.tc_mark(this, re, settings.element, settings.className);
    });
};


///////////////////////////////////////// 	API methods

function get_product_id_tc() {
	return -1;
	id = $('.product-label').attr('id');
	if(id == undefined){
		return -1; // Most likely test case menu
	}else{
		return id;
	}
}

function add_tc_handlers(li) {
    // Trigger enable popup event
    $(li).trigger('popup_event');
    // Trigger tc-leaf dnd event    
    $(li).trigger('leaf_dnd');
}

function fn_li_leaf_popup_edit(li) {
	var id = li.attr('id');
	window.open('/testcase/'+id,'TestCase Edit','width=800,height=500,scrollbars=1');
}

function fn_li_parent_popup_edit(parent_label) {
	var id = parent_label.parent().attr('id');
	window.open('/testcase/'+id,'TestCase Edit','width=800,height=500,scrollbars=1')
}

function fn_li_leaf_popup_clone(li) {
    var id = li.attr('id');
    var new_id = get_id(); // Get next unique ID to assign.
    var li_clone = li.clone();
        li_clone.attr('orig-id',id);
        li_clone.attr('id',new_id);
        li_clone.find('a').text(li.find('a').text()+" clone");
		li_clone.find('a').addClass('tm-ref-0');
		li_clone.find('.tm-ref').text('(0)');
    $(li_clone).insertAfter(li).highlight();
    // Trigger enable popup event
    $(li_clone).trigger('popup_event');
    // Trigger tc-leaf dnd event    
    $(li_clone).trigger('leaf_dnd');
    // Editable
    //$(li_clone).find('a').editable();
	commit_tc_clone(li_clone);
}

function fn_li_leaf_popup_delete(li) {
    var id = li.attr('id'); // LI to delete
    if(confirm('Are you sure you want to delete "'+li.text().trim()+'" ?')) {
		commit_tc_delete(li);
        li.remove();
    }
}

function fn_li_parent_popup_clone(parent_label) {
    var li = parent_label.parent();
    var li_clone = li.clone();
    $(li_clone).insertAfter(li);
    li_clone.find('.tc-leaf, .tc-parent-label').each(function() {
        var id = -1;
        var new_id = get_id();
        
        if($(this).hasClass('tc-leaf')) {
            $(this).find('a').text($(this)
                                       .find('a').text());
			$(this).find('a').addClass('tm-ref-0')
			$(this).find('.tm-ref').text('(0)');
            id = $(this).attr('id'); // For pulling up "tr" 
                                     // based on tc-leaf
            $(this).attr('orig-id',id); 
            $(this).attr('id',new_id).highlight(); // Change ID of
                                                   // leaf li.
            // Trigger enable popup event
            $(this).trigger('popup_event');
            // Trigger tc-leaf dnd event    
            $(this).trigger('leaf_dnd');
            // Editable
            //$(this).find('a').editable();
        } else if($(this).hasClass('tc-parent-label')) {
            $(this).find('.tc-name').text($(this).find('.tc-name').text());
            id = $(this).parent().attr('id'); // For pulling up "tr" 
                                              // based on tc-parent
            $(this).parent().attr('orig-id',id); 
            $(this).parent().attr('id',new_id).highlight(); // Change ID of 
                                                            // parent li.
            // Trigger enable popup event
            $(this).trigger('popup_event');
            // Trigger parent dnd event 
            $(this).parent().trigger('parent_drag');
            $(this).trigger('parent_drop'); 
            // Editable
            //$(this).editable();
        }    
    });
    	var my_label = li_clone.find('.tc-parent-label:first').find('.tc-name');
	my_label.text(my_label.text()+" clone");
	commit_tc_clone(li_clone);
}

function fn_li_parent_popup_delete(parent_label) {
    var li = parent_label.parent();
    if(confirm('Are you sure you want to delete "'
               +parent_label.text()+'" ?')) {
		commit_tc_delete(li);
        li.find('.tc-leaf, .tc-parent-label').each(function() {
            var id = -1;
            if($(this).hasClass('tc-leaf')) {
                id = $(this).attr('id'); // For pulling up "tr" 
                                         // based on tc-leaf
            } else if($(this).hasClass('tc-parent-label')) {
                id = $(this).parent().attr('id'); // For pulling up "tr" 
                                                  // based on tc-parent
            }   
        });
        li.remove();
    }
}

function fn_li_parent_popup_insert_leaf(parent_label) {
    var li = parent_label.parent();
    var id = li.attr('id');
    var new_id = get_id();
    var insert_li = $('.helper .tc-parent-helper .tc-leaf').clone();
        insert_li.find('a').text('leaf '+new_id);
        insert_li.attr('id',new_id);
    var ul = li.find('.ul:first');
    if(ul.children('.tc-leaf').length == 0) { // Adding to 'li=leaf
        ul.prepend(insert_li).highlight();    // 'less parent
    }else{ // Adding to parent with at least on tc-leaf
        insert_li.insertBefore(ul.find('.tc-leaf:first')).highlight();
    }   
    // Trigger enable popup event
    insert_li.trigger('popup_event');
    // Trigger tc-leaf dnd event    
    insert_li.trigger('leaf_dnd');
    // Editable
    //insert_li.find('a').editable();
	commit_tc_insert(parent_label, insert_li);
}

function fn_li_parent_popup_insert_parent(parent_label) {
    var id = 0;
	var ul = $('.tc-ul-main');
	if(parent_label != undefined) {
    	li = parent_label.parent();
		id = li.attr('id');
    	ul = li.find('.ul:first');
	}
    var new_id = get_id();
    var insert_li = $('.helper .tc-parent-helper .tc-parent').clone();
        insert_li.find('.tc-leaf').remove();
        insert_li.find('.tc-parent-label').text('Parent '+new_id);
        insert_li.attr('id',new_id);
    if(ul.children('.tc-leaf').length == 0) { // Adding to 'tc-leaf'
        ul.prepend(insert_li).highlight();    // 'less parent
    }else{ // Adding to parent with at least on tc-leaf
        insert_li.insertBefore(ul.find('.tc-leaf:first')).highlight();
    }   
    // Trigger enable popup event
    insert_li.find('.tc-parent-label').trigger('popup_event');
    // Trigger tc-parent dnd event    
    insert_li.trigger('parent_drag');
    insert_li.find('.tc-parent-label').trigger('parent_drop'); 
    // Editable
    //insert_li.find('.tc-parent-label').editable();
	commit_tc_insert(parent_label, insert_li);
	return insert_li;
}

function fn_li_parent_popup_expand_all(parent_label) {
    var id = 0;
	var ul = $('.tc-ul-main');
	if(parent_label != undefined) {
    	li = parent_label.parent();
		id = li.attr('id');
		expander = li.find(".expander:first");
		li.append("<img class='loader' src='"+loader_tc+"' alt='loading...' />");
		//if(!expander.attr('loaded')) {
			$.post(
   				"/get_tc_descendants",
   				{
   					"tc_id": id,
   					"csrfmiddlewaretoken": $('#csrf_token').attr('value')
   				},
   				function(json) {
					//console.log(json['ret']);
					li.find(".loader").remove();
					add_testcases(json['ret']);
					// toggle flag indicating that data is loaded. Doing it in callback
					// the case where loading will not resume after unsuccessful 
	 				// connection attempts.
					
					// li is not the same anymore!! Need to debug what happened.
					// Until then re-init li to expander's parent
					li = expander.parent();
					li.find('.expander').each(function(){
						$(this).attr('loaded','loaded');
						$(this).text("[-]");
					});
   				},
       			"json"
   			);
		//}
	}
}

function init_tree_popup() {
    // Popup Menus
    var li_leaf_popup = $("<div id=\"li_leaf_popup\"><table>"+
                      "<tr><span id=\"edit\" >Edit</span></tr>"+
                      "<tr><span id=\"clone\" >Clone</span></tr>"+
                     "<tr><span id=\"delete\">Delete</span></tr>"+
                                               "</table></div>");
    
    var li_parent_popup = $("<div id=\"li_parent_popup\">"+
                                                           "<table>"+
 "<tr><span id=\"expand_all\">Expand All</span></tr>"+
 "<tr><span id=\"insert_parent\">Insert Parent Testcase</span></tr>"+
     "<tr><span id=\"insert_leaf\">Insert Leaf Testcase</span></tr>"+
                      	   "<tr><span id=\"edit\" >Edit</span></tr>"+
                          "<tr><span id=\"clone\">Clone</span></tr>"+
                        "<tr><span id=\"delete\">Delete</span></tr>"+
                                                  "</table></div>");

    // Handle Dialog (popup_events) for existing as well as future 
    // tree elements.
    tc_tree_panel.on({
        'popup_event': function(){
            if($(this).hasClass('tc-leaf')) {
                $(this).popup(li_leaf_popup);
            }else if($(this).hasClass('tc-parent-label')) {
                $(this).popup(li_parent_popup);
            }
        }
    },'.tc-leaf, .tc-parent-label');
    
    // Setup Dialogs for existing tree elements
    $('.tc-leaf, .tc-parent-label').each(function(){
        $(this).trigger('popup_event');
    });
    
}

function init_tree_dnd() {
    // "li" parent droppable handling
    tc_tree_panel.on({
        'parent_drag': function() {
            $(this).draggable({ 
                helper: "clone", 
                opacity: 0.8,
                scroll: true,
				zIndex: 3000,
				appendTo: 'body',
            });
        }
    },'.tc-parent');
    $('.tc-parent').trigger('parent_drag');
    
    tc_tree_panel.on({
        'parent_drop': function() {
            $(this).droppable({
                tolerance:'pointer',
                hoverClass: "drag",
                accept: function(d) { 
                    if(d.hasClass("tc-leaf") || d.hasClass("tc-parent")){ 
                        return true;
                    }
                },
                drop: function( e, ui ) {
                    // Target ID/row would be first LI item in the tree 
                    // closest from this tc-parent. (since we're doing  
                    // prepend at the beginning).
					var tc_name = $(ui.draggable).text();
					if($(ui.draggable).find('.tc-name').length > 0) {
						tc_name = $(ui.draggable).find('.tc-name:first').text().trim();
					}
					if(!confirm("Are you sure you want to move the testcase \""+tc_name.trim()+"\"?"))
						return;
                    var $target_id = $(this).parent()
                                         .find('li:first')
                                             .attr('id');
                    var $ui_id = $(ui.draggable).attr('id');
                    e.stopPropagation();
                    // Prepend draggable LI item to target UL container.
                    $(this).siblings('ul:first').prepend(ui.draggable);
                    ui.draggable.highlight();
                    ui.draggable
                        .find('.tc-leaf,.tc-parent-label')
                            .highlight();
					if($target_id == $ui_id) {
						//Do nothing
						return;
					}
					commit_tc_drag(ui.draggable, $(this));
                }
            });
        }
    },'.tc-parent-label');
    $('.tc-parent-label').trigger('parent_drop');
    
    // "li" leaf droppable handling
    tc_tree_panel.on({
        'leaf_dnd': function() {
            $(this).draggable({ 
                helper: "clone", 
                opacity: 0.8,
                scroll: true,
				zIndex: 3000,
				appendTo: 'body',
            });
            $(this).droppable({
                tolerance:'pointer',
                hoverClass: "drag",
                accept: function(d) { 
                    if(d.hasClass("tc-leaf")){ 
                        return true;
                    }
                },
                drop: function( e, ui ) {
					var tc_name = $(ui.draggable).text().trim();
					if($(ui.draggable).find('.tc-name').length > 0) {
						tc_name = $(ui.draggable).find('.tc-name:first').text();
					}
					if(!confirm("Are you sure you want to move the testcase \""+tc_name.trim()+"\"?"))
						return;
                    var $target_id = $(this).attr('id');
                    var $ui_id = $(ui.draggable).attr('id');
                    $(ui.draggable).insertAfter($(this));
                    ui.draggable.highlight();
                }
            });
        }
    },'.tc-leaf');  
    $('.tc-leaf').trigger('leaf_dnd');
}

function init_expander() {
    tc_tree_panel.on({
        'click': function(e, ui) {
	    	e.stopPropagation();
            if($(this).text() == "[+]") { // Expand
                $(this).text("[-]");
				if(!$(this).attr('loaded')) {
					var expander = $(this);
					// Lazy load child data here via AJAX
					var parent_label = $(this).siblings('.tc-parent-label');
					// Remove any existing ul and correspopnding loader gif before adding
					parent_label.siblings("ul").remove();
					parent_label.after("<ul class=\"ul\"></ul>");
					var ul = parent_label.siblings("ul:first");
					var p_id = $(this).parent().attr('id');
					ul.append("<img class='loader' src='"+loader_tc+"' alt='loading...' />");
					// AJAX get immediate children
					$.post(
              			"/get_tc_children",
               			{
              				"tc_id": p_id,
              				"csrfmiddlewaretoken": $('#csrf_token').attr('value')
               			},
               			function(json) {
               				ul.find(".loader").remove();
							//console.log(json['ret']);
							add_testcases(json['ret']);
							// toggle flag indicating that data is loaded. Doing it in callback
							// the case where loading will not resume after unsuccessful 
				 			// connection attempts.
							expander.attr('loaded','loaded');
               			},
                		"json"
            		);
				}
        		// Expand list (UL)
				$(this).parent().find('li').show();	
				$(this).siblings("ul").slideDown(200);
                		//$(this).nextUntil("ul").last().next().slideDown(200);
       		}else{  // Collapse
           		$(this).text("[+]");
           		// Collapse list (UL)
				$(this).siblings("ul").slideUp(200);
           		//$(this).nextUntil("ul").last().next().slideUp(200);
       		}
        }
    },'.expander');
}

function hover_li_leaf() {
    tc_tree_panel.on({
        'mouseenter': function(){
	    if($(this).find('.tm-popup').length == 0) {
		$('.tm-popup').remove();
	    }
            if(!enableHoverTc) { return; }
            $(this).addClass('highlight');
        },
        'mouseleave': function(){
            if(!enableHoverTc) { return; }
            $(this).removeClass('highlight');
        }
    },'.tc-leaf');
}

function a_click() {
	tc_tree_panel.on({
		'click': function(e, ui) {
			e.preventDefault();
            e.stopPropagation();
			var id = $(this).parent().attr('id');
			if($(this).parent().hasClass('tc-leaf')) {
				window.open('/testcase/'+id,'TestCase Edit','width=800,height=500,scrollbars=1');
			}else if($(this).hasClass('tc-parent-label')) {
				//$(this).siblings('.expander').click();
				$(this).siblings('.expander').click();
				//window.open('/testcase/'+id,'TestCase Edit','width=800,height=500,scrollbars=1');
			}
		}
	},'a');
}


function hover_li_parent() {
    tc_tree_panel.on({
        'mouseenter': function(){
            if(!enableHoverTc) { return; }
            $(this).addClass('highlight');
            $(this).siblings('.ul').find('.tc-leaf').each(function(){
                $(this).addClass('highlight');
            });
            $(this).siblings('.ul')
                .find('.tc-parent-label').each(function(){
                $(this).addClass('highlight');
            });
        }, 
        'mouseleave': function(){
            if(!enableHoverTc) { return; }
            $(this).removeClass('highlight');
            $(this).siblings('.ul').find('.tc-leaf').each(function(){
                $(this).removeClass('highlight');
            });
            $(this).siblings('.ul')
            .find('.tc-parent-label').each(function(){
                $(this).removeClass('highlight');
            });
        }
    },'.tc-parent-label');
}

function get_id() {
    return max_id--;
}


// AJAX functions
function commit_tc_delete(container) {
	if(tc_ajax) {	// Make sure AJAX flag is enabled
		if(container.hasClass('tc-parent')) { 
			var li = container;
			var tc_arr = [];				    
			var tm_arr 	= [];
        	li.find('.tc-leaf, .tc-parent-label').each(function() {
            	var id = -1;
            	if($(this).hasClass('tc-leaf')) {
                	id = $(this).attr('id'); // For pulling up "tr" 
                                         	// based on tc-leaf
            	} else if($(this).hasClass('tc-parent-label')) {
                	id = $(this).parent().attr('id'); // For pulling up "tr" 
                                                  	// based on tc-parent
            	}   
				tc_data = '{ "id": '+id+'}';
				tc_arr.push(tc_data);
        	});
			//console.log(tc_arr);
			//AJAX handling - call "update_sub_col()"
			if(tm_arr.length >= 0 && tc_arr.length > 0) {
				$.post(
					"/delete_li",
					{
						"product_id": get_product_id_tc(),
						"tm_data": '['+tm_arr.join()+']',	
						"tc_data": '['+tc_arr.join()+']',	
						"user": user,
						"csrfmiddlewaretoken": $('#csrf_token').attr('value')
					},
					function(json) {
							compute_child_count();
					},
					"json"
				);
			}
		}else if(container.hasClass('tc-leaf')) { 
			var li_leaf = container;
			var tc_arr = [];				    
			tc_data = '{ "id": '+li_leaf.attr('id')+'}';
			tc_arr.push(tc_data);
			var tm_arr 	= [];
			//console.log(tc_arr);
			//AJAX handling - call "update_sub_col()"
			if(tc_arr.length > 0) {
				$.post(
					"/delete_li",
					{
						"product_id": get_product_id_tc(),
						"tm_data": '['+tm_arr.join()+']',	
						"tc_data": '['+tc_arr.join()+']',	
						"user": user,
						"csrfmiddlewaretoken": $('#csrf_token').attr('value')
					},
					function(json) {
							compute_child_count();
					},
					"json"
				);
			}
		}
	}
}

function commit_tc_insert(dest_container, container) {
	if(tc_ajax) {	// Make sure AJAX flag is enabled
		if(dest_container == undefined || dest_container.hasClass('tc-parent-label')) {
			if(container.hasClass('tc-leaf')) { 
				var li_leaf = container;
				var li_leaf_id = li_leaf.attr('id');
				var li_parent = dest_container.parent();
				var tc_arr = [];				    
				tc_data = '{ "id": '+li_leaf_id+','+
                		  '"name": '+JSON.stringify(li_leaf.find('a').text().trim())+','+
                		  '"parent_id": '+li_parent.attr('id')+
				'}';
				tc_arr.push(tc_data);
				var tm_arr 	= [];
				//AJAX handling - call "update_sub_col()"
				if(tc_arr.length > 0) {
					$.post(
						"/insert_li",
						{
							"product_id": get_product_id_tc(),
							"tm_data": '['+tm_arr.join()+']',	
							"tc_data": '['+tc_arr.join()+']',	
							"user": user,
							"csrfmiddlewaretoken": $('#csrf_token').attr('value')
						},
						function(json) {
							li_leaf.highlight();
    						tc_tree_panel
								.find('.tc-leaf[id='+li_leaf_id+']')
									.each(function() {
										$(this).attr('id',json[$(this).attr('id')]);
							});
						},
						"json"
					);
				}
			}else if(container.hasClass('tc-parent')) { 
				var li = container;
				var li_id = li.attr('id');
				var li_parent_id = 0;
				if(dest_container != undefined) {
					li_parent_id = li.parent().parent().attr('id');
				}
				var tc_arr = [];				    
				tc_data = '{ "id": '+li_id+','+
                		  '"name": '+JSON.stringify(li.find('.tc-parent-label').text().trim())+','+
                		  '"parent_id": '+li_parent_id+
				'}';
				tc_arr.push(tc_data);
				var tm_arr 	= [];
				//console.log(tc_arr);
				//AJAX handling - call "update_sub_col()"
				if(tc_arr.length > 0) {
					$.post(
						"/insert_li",
						{
							"product_id": get_product_id_tc(),
							"tm_data": '['+tm_arr.join()+']',	
							"tc_data": '['+tc_arr.join()+']',	
							"user": user,
							"csrfmiddlewaretoken": $('#csrf_token').attr('value')
						},
						function(json) {
							li.highlight();
    						tc_tree_panel
								.find('.tc-parent[id='+li_id+']')
									.each(function() {
										$(this).attr('id',json[$(this).attr('id')]);
							});
							if(dest_container == undefined) {	// For add-a new testcase						
								fn_li_parent_popup_insert_leaf(li.find('.tc-parent-label:first'));
							}
						},
						"json"
					);
				}
			}
		}
	}
}

function commit_tc_clone(container) {
	if(tc_ajax) {	// Make sure AJAX flag is enabled
		if(container.hasClass('tc-leaf')) { 
			var li_leaf = container;
			var li_leaf_id = li_leaf.attr('id');
			var li_parent = li_leaf.parent().parent();
			var tc_arr = [];				    
			var li_orig_id = li_leaf.attr('orig-id');
			if(li_orig_id == undefined) {
				li_orig_id=0;
			}
			tc_data = '{ "id": '+li_leaf_id+','+
					  	'"orig_id": '+li_orig_id+','+
               		  	'"name": '+JSON.stringify(li_leaf.find('a').text().trim())+','+
               		  	'"parent_id": '+li_parent.attr('id')+
			'}';
			tc_arr.push(tc_data);
			var tm_arr 	= [];
			//console.log("Cloning leaf "+tc_arr);
			//AJAX handling - call "update_sub_col()"
			if(tc_arr.length > 0) {
				$.post(
					"/insert_li",
					{
						"product_id": get_product_id_tc(),
						"tm_data": '['+tm_arr.join()+']',	
						"tc_data": '['+tc_arr.join()+']',	
						"user": user,
						"csrfmiddlewaretoken": $('#csrf_token').attr('value')
					},
					function(json) {
						li_leaf.highlight();
    					tc_tree_panel
							.find('.tc-leaf[id='+li_leaf_id+']')
								.each(function() {
									$(this).attr('id',json[$(this).attr('id')]);
						});
					},
					"json"
				);
			}
		}else if(container.hasClass('tc-parent')) { // Commit sub-col clone
    		var li_clone = container;
			var tc_arr = [];				    
			var tm_arr 	= [];
			li_clone.find('.tc-leaf, .tc-parent-label').each(function() {
				var li_orig_id;
        		var id = 0;
				var li_parent;
			var new_name = "";
        		if($(this).hasClass('tc-leaf')) {
            		id = $(this).attr('id'); // For pulling up "tr" based on tc-leaf
					li_parent = $(this).parent().parent();
					li_orig_id = $(this).attr('orig-id');
					new_name = $(this).find('a').text().trim();
        		} else if($(this).hasClass('tc-parent-label')) {
            		id = $(this).parent().attr('id'); // For pulling up "tr" based on tc-parent
					li_parent = $(this).parent().parent().parent();
					li_orig_id = $(this).parent().attr('orig-id');
					new_name = $(this).find('.tc-name').text().trim();
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
               		  	'"name": '+JSON.stringify(new_name)+','+
               		  	'"parent_id": '+li_parent_id+
				'}';
				tc_arr.push(tc_data);
    		});
			//AJAX handling - call "update_sub_col()"
			if(tc_arr.length > 0) {
				$.post(
					"/insert_li",
					{
						"product_id": get_product_id_tc(),
						"tm_data": '['+tm_arr.join()+']',	
						"tc_data": '['+tc_arr.join()+']',	
						"user": user,
						"csrfmiddlewaretoken": $('#csrf_token').attr('value')
					},
					function(json) {
    					li_clone.find('.tc-leaf, .tc-parent-label').each(function() {
        					var id;
        					if($(this).hasClass('tc-leaf')) {
            					id = $(this).attr('id'); // For pulling up "tr" 
                                     					// based on tc-leaf
            					$(this).attr('id',json[id]).highlight(); // Change ID of
                                                   					// leaf li.
        					} else if($(this).hasClass('tc-parent-label')) {
            					id = $(this).parent().attr('id'); // For pulling up "tr" 
                                              					// based on tc-parent
            					$(this).parent().attr('id',json[id]).highlight(); // Change ID of 
                                                            					// parent li.
        					}    
    					});
					},
					"json"
				);
			}
		}
	}
}

function commit_tc_drag(src_container, dest_container) {
	if(tc_ajax) {	// Make sure AJAX flag is enabled
		if(dest_container.hasClass('tc-parent-label')) { // Commit li tree drag changes
			if(src_container.hasClass('tc-leaf') || 
				src_container.hasClass('tc-parent')) { // Move tc-leaf or tc-parent 
					var tc_arr = [];				   // to a different tc-parent
					tc_data = '{ "id": '+src_container.attr('id')+','+
                 			'"parent_id": \"'+dest_container.parent().attr('id')+
					'\"}';
					tc_arr.push(tc_data);
				//console.log("DEBUG ME"+tc_arr);
				//AJAX handling - call "update_col()"
				if(tc_arr.length > 0) {
					$.post(
						"/update_li",
						{
							"product_id": get_product_id_tc(),
							"tc_data": '['+tc_arr.join()+']',	
							"user": user,
							"csrfmiddlewaretoken": $('#csrf_token').attr('value')
						},
						function(json) {
							src_container.highlight();
							compute_child_count();
						},
						"json"
					);
				}
			}
		}
	}
}

function add_testcases(set) { 
	if(set.length>=0) {
   		for(i=0; i<set.length; i++) {
			if(set[i]['type'] == 'parent') {
				ul = $(".tc-ul-main").find(".tc-parent[id="+set[i]['id']+"]");
				if(ul.length > 0) {
					ul.show();
					ul.children('.ul').show();
				}else{
					ul = $("<li class=\"tc-parent\" id="+set[i]['id']+"></li>");
					ul.append("<label class=\"expander\">[+]</label>");
					ul.append("<a class=\"tc-parent-label\" "+
						"href='/testcase/"+set[i]['id']+"'"+
						" title='"+set[i]['id']+"'><div class=\"tc-name\">"+
						set[i]['name']+"</div>"+
						"<label class=\"child-count\" id='"+set[i]['id']
						+"'>(<span>"+set[i]['count']+"</span>)</label></a>");
					var p_li = null;
					if(set[i]['pid'] > 0) {
						p_li = $(".tc-ul-main").find(".tc-parent[id="+set[i]['pid']+"]");
						if(p_li.children("ul").length == 0) {
							p_li.append("<ul class=\"ul\"></ul>");
						}
						p_li.children(".ul:first").append(ul);
					}
					// Trigger enable popup event
   					ul.find('.tc-parent-label').trigger('popup_event');
   					// Trigger tc-parent dnd event    
   					ul.trigger('parent_drag');
   					ul.find('.tc-parent-label').trigger('parent_drop');
				}
			}else if(set[i]['type'] == 'leaf') {
				li = $(".tc-ul-main").find(".tc-leaf[id="+set[i]['id']+"]");
				if(li.length > 0) {
					li.show()
				}else{
					li = $("<li class=\"tc-leaf\" id="+set[i]['id']+"></li>");
					if(set[i]['count'] > 0) {
						li.append("<a href='/testcase/"+set[i]['id']+"'"+
							" title='"+set[i]['id']+"'>"+
							set[i]['name']+"</a>"+
							"<label class=\"tm-ref\">("+set[i]['count']+")</label>");
					}else{
						li.append("<a class=\"tm-ref-0\" href='/testcase/"+set[i]['id']+"'"+
							" title='"+set[i]['id']+"'>"+
							set[i]['name']+"</a>"+
							"<label class=\"tm-ref\">("+set[i]['count']+")</label>");
					}
					var p_li = null;
					if(set[i]['pid'] == 0) {
						p_li = $(".tc-ul-main");
						p_li.append(li);
					}else{
						p_li = $(".tc-ul-main").find(".tc-parent[id="+set[i]['pid']+"]");
						if(p_li.children("ul").length == 0) {
							p_li.append("<ul class=\"ul\"></ul>");
						}
						p_li.children(".ul:first").append(li);
					}
					// Trigger enable popup event
   					li.trigger('popup_event');
   					// Trigger tc-leaf dnd event    
   					li.trigger('leaf_dnd');
				}
			}
		}
	}
}


function init_search() {
	$('.tc-panel').find('.search-input').keyup(function(e) {
		var e = e;
		var input = $(this);
		typewatch(function(){
			if (e.keyCode == 27 || input.val() == '') {
				input.val('');  
				if($('.tc-panel').find('.expand-a').attr('expand') == "0") {
            	}
				tc_tree_panel.find('a').tc_unmark();
				tc_tree_panel.find('li').show();
				tc_tree_panel.find('.ul').hide();
				tc_tree_panel.find('.expander').text('[+]');
				$('.tc-ul-main').find(".tc-parent").hide();
				$('.tc-ul-main').children(".tc-parent").show();
				tc_tree_panel.find('.tc-ul-main').show();
				if($('.tc-panel').find('.expand-a').attr('expand') == "1") {
					$('.tc-panel').find('.expand-a').attr('expand','0');
					$('.tc-panel').find('.expand-a').html('expand-all');
				}   
			}else { 
				tc_tree_panel.find('ul').show();
				$.post(
              		"/tc_search",
               		{
              			"search_key": input.val(),
              			"csrfmiddlewaretoken": $('#csrf_token').attr('value')
               		},
               		function(json) {
               			$(".tc-ul-main").find(".loader").remove();
						add_testcases(json['ret']);
						show_ids = [];
						for(i=0; i<json['ret'].length; i++) {
							show_ids.push(json['ret'][i]['id'].toString());	
						}
						//console.log("SHOW: "+show_ids);
						// toggle flag indicating that data is loaded. Doing it in callback
						// the case where loading will not resume after unsuccessful 
				 		// connection attempts.
						//expander.attr('loaded','loaded');
						filter_tc(tc_tree_panel.find('a'), input.val(),'li',show_ids);
						if($('.tc-panel').find('.expand-a').attr('expand') == "0") {
							$('.tc-panel').find('.expand-a').attr('expand','1');
							$('.tc-panel').find('.expand-a').html('collapse-all');
						}   
               		},
                	"json"
            	);
			}   
		},400); 
	}); 
	function filter_tc(selector, query, target, show_ids) {   
		query = $.trim(query); //trim white space  
		query = query.replace(/ /gi, '|'); //add OR for regex query  

		$(selector).tc_unmark();    
		$(selector).each(function() {   
			li = $(this).parent();
			//console.log(li.attr('id')+" "+show_ids+" "+$.inArray(li.attr('id'),show_ids));
			if(show_ids.indexOf(li.attr('id')) > -1) {
			console.log("JINGAL"+query);
        		li.addClass('match');
        		li.children('a').tc_mark(query);
        		li.show();
    		}else{
				li.removeClass('match');
				li.children('a').tc_unmark();
        		li.hide();
    		}   
  		});  
  		$(selector).each(function() {   
    		li = $(this).parent();
        	if(li.find('.match').length > 0){ 
            	if(!li.hasClass('match')){
                	li.addClass('match');
                	li.children('a').tc_mark(query);
                	li.show();
            	}   
            	li.find('.expander').html("[-]");
        	}else{
           		li.find('.expander').html("[+]");
				li.find('.ul').hide();
        	}   
  		});  
	}
}

function add_testcase_handler() {
	$('.tc-panel').find('.add-a').removeClass('link-disabled');
	$('.tc-panel').find('.add-a').click(function(e){
        	e.preventDefault();
		fn_li_parent_popup_insert_parent();
        });
}

function add_expand_all_handler() {
	$('.tc-panel').find('.expand-a').click(function(e){
        	e.preventDefault();
        	if($('.tc-panel').find('.expand-a').attr('expand') == "0") {
            		$('.tc-panel').find('li').show();
            		$('.tc-panel').find('.ul').show();
            		$('.tc-panel').find('.expander').html("[-]");
            		$('.tc-panel').find('.expand-a').attr('expand','1');
            		$('.tc-panel').find('.expand-a').html('collapse-all');
        	}else{
            		$('.tc-panel').find('li').hide();
            		$('.tc-panel').find('li').each(function(){
                		if($(this).parent().parent().attr('id') == undefined) {
                    			$(this).show();
                    			$(this).find('.expander').html("[+]");
                		}
            		});
            		$('.tc-panel').find('.ul').hide();
            		$('.tc-panel').find('.tc-ul-main').show();
            		$('.tc-panel').find('.expand-a').attr('expand','0');
            		$('.tc-panel').find('.expand-a').html('expand-all');
        	}
    	});
}

function compute_child_count() {
	return;
	$('.tc-panel').find('.tc-parent .child-count').each(function(){
		var leafCount = $(this).parent().siblings('.ul').find('.tc-leaf').length;
		$(this).find('span').text(leafCount);
	});
}

function tm_popup_init() {
	$("<img class='loader' src='"+loader_tc+"' alt='loading...' />").appendTo($('body')).hide();
    tc_tree_panel.on({
        'mouseenter': function(e){
			var t = $(this);
			e.stopPropagation();
			t.attr('selected','selected');
			setTimeout(function() {
				if(t.attr('selected') != undefined) {
					if(t.find('.tm-popup').length > 0)
						return;
            		$('.tm-popup').remove();
					var tc_id = t.parent().attr('id');
					var tm_popup = $("<div class=\"tm-popup\"></div>");
					tm_popup.append("<img class='loader' src='"+loader_tc+"' alt='loading...' />");
            		t.append(tm_popup);
					$.post(
						"/get_tc_tm_ref",
						{
							"tc_id": tc_id,
							"csrfmiddlewaretoken": $('#csrf_token').attr('value')
						},
						function(json) {
							tm_popup.find(".loader").remove();
							tm_popup.append("<span class=\"tm-title\">Test Matrix References:</span><br>");
							if(json['ret'].length<=0) {
								tm_popup.append("<span class=\"no-tm\">No matrix references found</span>");
								//alert("ERROR: Could not retrieve test matrix references for this testcase");
							}else{
								tm_popup.append("<ul>");
								for(i=0; i<json['ret'].length; i++) {
									tm_popup.append("<li><a href=\"/testmatrix/"+json['ret'][i]['pid']+"\">"+json['ret'][i]['name']+" "+json['ret'][i]['rev']+"</a></li>");
								}
								tm_popup.append("</ul>");
							}
						},
						"json"
					);
				}
			}, tc_tm_timeout);
		},
		'click': function(e) {
			e.stopPropagation();
			$(this).find('.tm-popup').remove();
		},
		'mouseleave': function(e) {
			var t = $(this);
			t.removeAttr('selected');
		},
		'keyup': function(e) {
			if (e.keyCode == 27) {
				$('.tm-popup').remove();
			}
		}
    },'.tm-ref'); 
	tc_tree_panel.on({
		'click': function(e) {
			e.stopPropagation();
		}
	},'.tm-popup');
	tc_tree_panel.on({
		'click': function(e) {
			// Why the Fuchsia am I having to do this??
			window.location.href = $(this).attr('href');
			e.stopPropagation();
		}
	},'.tm-popup a');
}


///////////////////////////////////////////// 	Main

$(document).ready(function(){  
	// Init element references
	$('.tc-panel').hide();
	tc_tree_panel = $('.tc-tree-panel');

    tc_tree_panel.contextmenu(function(e){
        return false;
    });
    
    init_expander();
    hover_li_leaf();
    a_click();
    add_expand_all_handler();
	compute_child_count();

    if(permission >= 0) {
	add_testcase_handler();        
    	init_tree_dnd();
    	init_tree_popup();
    }

    tc_tree_panel.find('ul:first').addClass("tc-ul-main");
    tc_tree_panel.find('.tc-ul-main').show();
    init_search();

	tm_popup_init();
	/*tc_tree_panel.on({
		'keyup': function(e) {
			if (e.keyCode == 27) {
				$('.tm-popup').remove();
			}
		}
	},'.tc-tree-panel');
	*/
	$('body, #testcase-div-panel').click(function(){
        $('.tm-popup').remove();
    });
    tc_tree_panel.on({
        'keyup': function(e) {
            if (e.keyCode == 27) {
                $('.tm-popup').remove();
            }
        }
    },'.tc-tree-panel');

    $('.tc-panel').show();
});
