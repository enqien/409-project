var min = -1;
var permission = -1;

get_user = function() {
	return user;
}

function set_permissions() {
    if(user == "") {
        permission = -1; // Read only
    }else{
        permission = 0; // limited (add results etc)
    }    
}


var delay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();

jQuery.extend({
    mark: function (node, re, nodeName, className) {
        if (node.nodeType === 3) {
            var match = node.data.match(re);
            if (match) {
                var mark = document.createElement(nodeName || 'span');
                mark.className = className || 'mark';
                var wordNode = node.splitText(match.index);
                wordNode.splitText(match[0].length);
                var wordClone = wordNode.cloneNode(true);
                mark.appendChild(wordClone);
                wordNode.parentNode.replaceChild(mark, wordNode);
                return 1; //skip added node in parent
            }
        } else if ((node.nodeType === 1 && node.childNodes) && // only element nodes that have children
                !/(script|style)/i.test(node.tagName) && // ignore script and style nodes
                !(node.tagName === nodeName.toUpperCase() && node.className === className)) { // skip if already highlighted
            for (var i = 0; i < node.childNodes.length; i++) {
                i += jQuery.mark(node.childNodes[i], re, nodeName, className);
            }
        }
        return 0;
    }
});

jQuery.fn.unmark = function (options) {
    var settings = { className: 'mark', element: 'span' };
    jQuery.extend(settings, options);

    return this.find(settings.element + "." + settings.className).each(function () {
        var parent = this.parentNode;
        parent.replaceChild(this.firstChild, this);
        parent.normalize();
    }).end();
};

jQuery.fn.mark = function (words, options) {
    var settings = { className: 'mark', element: 'span', caseSensitive: false, wordsOnly: false };
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
        jQuery.mark(this, re, settings.element, settings.className);
    });
};

$(document).ready(function(){
	set_permissions();
	$('#title').find('#title-label').click(function(e){
		e.preventDefault();
		window.location.href = "/product/1";
	});
	$('#product-div').find('.pname > a').live('click',function(e){
		e.preventDefault();
		$this = $(this).closest('.pname');
		$this.find('.prev').each(function(){
			$(this).toggle();
		});
	});

	$('#product-div').find('.sort-a').click(function(e){
		e.preventDefault();
		$('#product-div').find('#div-sort-a').find('.popup').slideToggle(200);
		e.stopPropagation();
	});

	$('#div-sort-a').find('.popup').click(function(e){
		e.stopPropagation();
	})


	$('#div-sort-a').find('.check').hover(function(e){
		$(this).addClass('popup-hover');
	},function(){
		$(this).removeClass('popup-hover');
	})
	.click(function(){
		sort = $(this).attr('id');
		if(sort == "1" || sort == "2" || sort == "3"){
			$('#div-sort-a').find('.popup').hide();
			window.location.href='/product/'+sort;
		}
	});

	$('.tabs').find('a').click(function(e) {
		e.preventDefault();

		if($(this).hasClass('active')) {
			return;
		}

		$('.tabs').find('a').removeClass('active');

		$('#main-tab').hide();
		$('#testcase-div-panel').hide();
		$('#report-div').hide();

		if($(this).attr('id') == "products_tab") {
			$('#main-tab').show();
		}else if($(this).attr('id') == "testcases_tab") {
			$('.merge-panel').hide();
			$('#testcase-div-panel').show();
			fn_load_testcase_tab();
		}else if($(this).attr('id') == "reports_tab") {
			$('#report-div').slideToggle();
		}

		$(this).addClass('active');
	});

	$('#product-div').find('.search-input').focus();

	if(permission >= 0) {
		$('#product-div').find('.p-div').live({
			mouseover: function(){
				$(this).find('div[kind=pname]').show();
			},
			mouseout: function(){
				$(this).find('div[kind=pname]').hide();
			}
		});
	
		$('#product-div').find('.prev').live({
			mouseover: function(e){
				$(this).find('div[kind=prev]').show();
			},
			mouseout: function(e){
				$(this).find('div[kind=prev]').hide();
			}
		});
		$('#product-div').find('.addproduct-a').removeClass("link-disabled");
		$('#product-div').find('.addproduct-a').click(function(){
			pid = fn_get_next_id_();
			pname = "None";
			window.open('/product_add/'+pid+'/'+pname+'/','Product Add','width=800,height=750,scrollbars=1');
		});
	}


	$('#product-div').find('.options').live({
		
		mousedown: function(){
			//$(this).parent().addClass('active-button');
			if($(this).attr('id') == 'add') {
				pid = fn_get_next_id_();
				pname = $(this).closest('.p-div').find('.pname-a').attr('name');
				if($(this).closest('.p-div').find('.prev:visible').length == 0) {
					$(this).closest('.p-div').find('.pname-a').click();
				}
				window.open('/product_add/'+pid+'/'+pname,'Product Add','width=800,height=750,scrollbars=1');
			}else if($(this).attr('id') == 'delete-parent') {
				// Check for delete permissions
				var delete_permission = true;
				$(this).closest('.pname').find('.plead').each(function(){
					if(user.trim() == "root") {
						delete_permission = true;
						return false;
					}else if(user.trim() != $(this).text().trim()) {
						delete_permission = false;
						return false;
					}
				});
				if(!delete_permission) {
					alert("Access Denied: Not owner of all product revs");
					return;
				}

				li = $(this).closest('.pname');
				ul = li.find('.prev-ul');
				ret = confirm("Delete \""+li.find('.pname-a').attr('name')+"\" and all its children?");
				if(ret) {
					ul.find('.prev').each(function(){
						pid = $(this).attr('id');
						$.ajax("/product_delete/"+pid)
						.done(function() {
							li.remove();
						});
						rev_count = $(this).closest('.pname').find('.rev-count');
						count = rev_count.html().substring(2,rev_count.html().length-1);
						count = count - 1;
						rev_count.html(" ("+count+")");
					});
					li.remove();
				}
			}else if($(this).attr('id') == 'clone') {
				pid = $(this).closest('.prev').attr('id');
				li = $('.prev[id='+pid+']');
				var $csrf_token = $('#csrf_token').attr('value');
				$.post(
					"/product_clone",
					{
						"pid":	pid,
						"user": user,
						"csrfmiddlewaretoken": $csrf_token
					},
					function(json) {
						clone_li = li.clone()
						$(clone_li).insertAfter(li);

						new_pid = json['productid'];
						new_productname = json['productname'];
						new_productrev = json['productrev'];
						new_createdte = json['createdte'];
						new_tm_count = json['tm_count'];
						new_user = json['user'];

                    	$(clone_li).attr('id',new_pid);
                    	$(clone_li).show().find('.prev-a').attr('href','/testmatrix/'+new_pid).html(new_productname+' '+new_productrev);
                    	$(clone_li).find('#tm-count').removeClass('tm-count').addClass('tm-count').html('('+new_tm_count+')');
                    	$(clone_li).find('.plabel').html(new_createdte);
                    	$(clone_li).find('.plead').html(new_user);

                    	rev_count = clone_li.closest('.pname').find('.rev-count');
                    	count = rev_count.html().substring(2,rev_count.html().length-1);
                    	count = parseInt(count) + 1;
                    	rev_count.html(" ("+count+")");

						$(clone_li).effect("highlight", "#FFFF00", 1000);
					},
					"json"
				);
				
			}else if($(this).attr('id') == 'delete-leaf') {
				pid = $(this).closest('.prev').attr('id');
				li = $('.prev[id='+pid+']');
				
				// Check for delete permissions
				var delete_permission = true;
				li.find('.plead').each(function(){
					if(user.trim() == "root") {
						delete_permission = true;
						return false;
					}else if(user.trim() != $(this).text().trim()) {
						delete_permission = false;
						return false;
					}
				});
				if(!delete_permission) {
					alert("Access Denied: Only product owner \""+li.find('.plead').text()+"\" can perform this operation");
					$(this).mouseup();
					return;
				}

				ret = confirm("Delete \""+li.find('.prev-a').html()+"\"?");
				if(ret) {
					$.ajax("/product_delete/"+pid)
					.done(function() {
						li.remove();
					});
					rev_count = $(this).closest('.pname').find('.rev-count');
					count = rev_count.html().substring(2,rev_count.html().length-1);
					count = count - 1;
					rev_count.html(" ("+count+")");
				}
			}
			$(this).mouseup();
		}, 

		mouseup: function(){
				//$(this).removeClass('active-button');
		},
	});

	init_product_dnd();

	init_merge_list();

	//fn_load_testcase_tab();
});

function init_merge_list() {
	$('.merge-panel').on({
		'mouseenter': function() {
			$(this).find('.delete-item').show()
		},
		'mouseleave': function() {
			$(this).find('.delete-item').hide()
		}
	},'.merge-item');
	$('.merge-panel').on({
		'click': function() {
			//if(confirm("Remove \""+$(this).siblings('span').text()+"\" from merge list?")) {
			if(true) {
				$(this).parent().remove();
				if($('.merge-panel').find('.merge-item').length == 0) {
					$('.merge-panel').find('.merge-list-div').hide();
					$('.merge-panel').find('.merge-panel-span').show();	
				}
			}
		}
	},'.delete-item');
	$('.merge-panel').find('.generate-merge-span').click(function(){
		if($('.merge-panel').find('.merge-item').length < 2) {
			alert("Please add two or more products and try again");
		}else{
			var pid_url = "/testmatrix/";
			$('.merge-panel').find('.merge-item').each(function(){
				pid_url += $(this).attr('id')+"/";
			});
			window.location.href = pid_url;
		}
	});
}

function init_product_dnd() {
	$('#product-div').on({
        'p_drag': function() {
            $(this).draggable({
                helper: function(e,ui) {
					var clone = $(this).clone();
					clone.css('z-index','102');
					clone.find('.selektor').remove();
					clone.find('label').remove();
					clone.css('background-color','#EAEBDA');
					clone.css('border-radius','6px');
					clone.css('padding','10px');
					//$('#product-div').css({opacity: 0.4});
					return clone;
				},
				revert: function(valid) {
					//$('#product-div').css({opacity: 1.0});
				},
				zIndex: 200,
            }); 
        }   
    },'.prev, .pname-a');
    $('#product-div').find('.prev').trigger('p_drag');
    $('#product-div').find('.pname-a').trigger('p_drag');

	var merge_panel = $('.merge-panel');
	merge_panel.droppable({
        tolerance:'pointer',
        hoverClass: "merge-drag",
        accept: function(d) {
            if(d.hasClass("prev") || d.hasClass("pname-a")){
                return true;
            }   
        },  
        drop: function( e, ui ) {
			//$('#product-div').css({opacity: 1.0});
			if(ui.draggable.hasClass('prev')) {
				var id = ui.draggable.attr('id');
				var text = ui.draggable.find('.prev-a').text(); 
				li = "<li class=\"merge-item\" id="+id+"><span>"+text+
				 	"</span><label class=\"delete-item\" style=\"display:none\">delete<label></li>";
				
				merge_panel.find('.merge-panel-span').hide();	
				merge_panel.find('.merge-list-div').show();
	
				var found = false;
				merge_panel.find('.merge-item').each(function() {
					if($(this).attr('id') == id) {
						found = true;
					}	
				});
	
				if(found) {
					alert("\""+text+"\" already selected");
				}else{
					merge_panel.find('.merge-items').append($(li));
				}
			}else if(ui.draggable.hasClass('pname-a')) {
				$('#product-div').
					find('.pname-a[id='+ui.draggable.attr('id')+']').siblings('.prev-ul:eq(0)').
						find('.prev').each(function() {
							var id = $(this).attr('id');
							var text = $(this).find('.prev-a').text(); 
							li = "<li class=\"merge-item\" id="+id+"><span>"+text+
				 				"</span><label class=\"delete-item\" "+
								"style=\"display:none\">delete<label></li>";
							
							merge_panel.find('.merge-panel-span').hide();	
							merge_panel.find('.merge-list-div').show();

							var found = false;
							merge_panel.find('.merge-item').each(function() {
								if($(this).attr('id') == id) {
									found = true;
								}	
							});

							if(!found) {
								merge_panel.find('.merge-items').append($(li));
							}
						});
			}
        }   
    }); 
}


fn_get_next_id_ = function() {
	return min--;
}

$(document).click(function() {
	if($('#div-sort-a').find('.popup').is(':visible')){
		$('#div-sort-a').find('.popup').slideToggle(200);
	}
});


fn_load_testcase_tab = function() {
	if($('#testcase-div').attr('loaded') != "true") {
		$('#testcase-div').html('<label class=loading>Loading...</label>');
		var $csrf_token = $('#csrf_token').attr('value');
		$('#testcase-div').load('/tc_tab_load');
		$('#testcase-div').attr('loaded','true');
	}
}


$(window).bind('load', function(){
	/*$('#product-div').find('.pname > a').each(function(){
		$(this).click();
	});
	*/
	
	$('#product-div').find('.expand-a').click(function(e){
		e.preventDefault();
		if($('#product-div').find('.expand-a').attr('expand') == "0") {
			$('#product-div').find('.prev').each(function(){
				$(this).show();
			});
			$('#product-div').find('.expand-a').attr('expand','1');
			$('#product-div').find('.expand-a').html('collapse-all');
		}else{
			$('#product-div').find('.prev').each(function(){
				$(this).hide();
			});
			$('#product-div').find('.expand-a').attr('expand','0');
			$('#product-div').find('.expand-a').html('expand-all');

			$('#product-div').find('.search-input').val('');
			$('#product-div').find('.search-input').keyup();
		}
	});

	$('#product-div').find('.merge-a').click(function(e){
		$('.merge-panel').fadeToggle(500);
	});

	$('#product-div').find('.search-a').click(function(e){
		e.preventDefault();
		$('#product-div').find('.search-input').fadeToggle('fast').focus();
	});

	$('#product-div').find('.search-input').keyup(function(e) {  
	   //if esc is pressed or nothing is entered  
	   var e = e;
	   var input = $(this);
	   delay(function(){
	   		if (e.keyCode == 27 || input.val() == '') {  
	        	//if esc is pressed we want to clear the value of search box  
	        	input.val('');  
			
				//we want each row to be visible because if nothing  
				//is entered then all rows are matched.  
				$('#product-div').find('.prev').unmark();
				$('#product-div').find('.prev').removeClass('visible').show().addClass('visible');  
				$('#product-div').find('.p-div').show();
				$('#product-div').find('.prev').hide();
				if($('#product-div').find('.expand-a').attr('expand') == "1") {
					$('#product-div').find('.expand-a').attr('expand','0');
					$('#product-div').find('.expand-a').html('expand-all');
				}
			}  
	    	//if there is text, lets filter  
	    	else {  
				$('#product-div').find('.p-div').hide();
				filter($('#product-div').find('.prev'), input.val(), '.p-div');  
				if($('#product-div').find('.expand-a').attr('expand') == "0") {
					$('#product-div').find('.expand-a').attr('expand','1');
					$('#product-div').find('.expand-a').html('collapse-all');
				}
        	}  
		},200);
	});
});

function filter(selector, query, target) {  
  query = $.trim(query); //trim white space  
  query = query.replace(/ /gi, '|'); //add OR for regex query  
  $(selector).unmark();		  
  $(selector).each(function() {  
	if($(this).text().search(new RegExp(query, "i")) < 0) {
		$(this).unmark();
		$(this).hide().removeClass('visible');
	}else{
		$(this).show().addClass('visible').closest(target).show();
		$(this).mark(query);
	}
  });  
}  
