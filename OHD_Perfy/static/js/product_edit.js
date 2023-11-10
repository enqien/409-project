var name;
$(document).ready(function(){
	readjust();

	permission = -1; // Read only
        if(new_product || superuser || (owner.trim() != "" && user == owner) || owner.indexOf("Anonymous") >= 0) {
            permission = 1; // full
        }

	$(window).resize(function() {
		readjust();
	});

	$('.field-value').autoResize();
	if(permission == 1) {
		$('.field-value').removeAttr('readonly');
		$('.field-value')
	    	    .focus(function(){
			$(this).closest('.field-value-td').addClass('edit');
		    })
		    .blur(function(){ 
			$(this).closest('.field-value-td').removeClass('edit');
		    });
		$('.field-value-td select').removeAttr('disabled');
		$("#button-div").show();
	}
	
	name = $('#productname').find('textarea').val();

});

var readjust = function() {
	$('.field-value').each(function() {
		$(this).keydown();
		$(this).width($(window).width() - $('.field-header-td').width() - 60);
	});
}

var fnProductSave = function() {
	var $csrf_token = $('#csrf_token').attr('value');
	var ret = undefined;
        if($('#product_div').find('#productname').find('textarea').val().length > 120) {
            alert("Product Name cannot exceed 120 characters");
            return;
	} 
        if($('#product_div').find('#productrev').find('textarea').val().length > 120) {
            alert("Product Revision cannot exceed 120 characters");
            return;
	} 
   	$.post(
       	"/product_save",
       	{
           	"productname":	$('#productname').find('textarea').val(),
			"productrev": 	$('#productrev').find('textarea').val(),
			"productid":	$('#productid').attr('value'),
			"identifier":	$('#identifier').find('textarea').val(),
			"productdesc":	$('#productdesc').find('textarea').val(),
			"productlead":	$('#productlead').find('select').val(),
           	"csrfmiddlewaretoken": $csrf_token
       	},
       	function(json) {
			if(json == undefined) {
				alert("Product Create: Error occurred");
				return;
			}

			new_pid = json['productid'];
			create_date = json['createdte'];
			user = json['user'];
			pname = json['productname'];
			prev = json['productrev'];

			if($('#productid').attr('value') < 0) {
				name_exists = $(window.opener.document).find('.pname [name="'+pname+'"]').length;
				if(name_exists == 0) {
					first_pdiv = $(window.opener.document).find('#product-div').find('.p-div').first();

					li = $(window.opener.document).find('li .prev:eq(0)').clone();

					pdiv = first_pdiv.clone();
					$(pdiv).show();
					pdiv.find('.prev').remove();
					pdiv.find('.prev-ul').append(li);

					$(pdiv).insertBefore(first_pdiv);

					pdiv.find('.pname-a').attr('id',new_pid);
					pdiv.find('.pname-a').attr('name',pname);
					pdiv.find('.pname-a').html(pname+'<label id="rev-count" class="rev-count">'+
													' (0)</label>');

					$(li).attr('id',new_pid);
					$(li).show().find('.prev-a').attr('href','/testmatrix/'+new_pid).html(pname+' '+prev);
					$(li).find('#tm-count').removeClass('tm-count').addClass('tm-count-zero').html(' (0)');
					$(li).find('.plabel').html(create_date);
					$(li).find('.plead').html(user);
	
                	rev_count = li.closest('.pname').find('.rev-count');
					if(rev_count.html() == null) {
						count = 0;
					}else{
                		count = rev_count.html().substring(2,rev_count.html().length-1);
					}
	            	count = parseInt(count) + 1;
                	rev_count.html(" ("+count+")");

					//$(pdiv).effect("highlight", "#FFFF00", 1000);

					window.close();
					//window.location='/product_edit/'+new_pid;
				}else{
					ul = $(window.opener.document)
										.find('.pname [name="'+pname+'"]')
										.closest('.p-div')
										.find('.prev-ul')
					ul.find('.prev').each(function(){
						if($(this).is(':visible') == false) {
							$(this).show();
						}
					});
					li = $(window.opener.document).find('li .prev:eq(0)').clone();
			
					$(li).insertBefore(ul.find('.prev').first());
					$(li).attr('id',new_pid);
					$(li).show().find('.prev-a').attr('href','/testmatrix/'+new_pid).html(pname+' '+prev);
					$(li).find('#tm-count').removeClass('tm-count').addClass('tm-count-zero').html('(0)');
					$(li).find('.plabel').html(create_date);
					$(li).find('.plead').html(user);
	
                	rev_count = li.closest('.pname').find('.rev-count');
                	count = rev_count.html().substring(2,rev_count.html().length-1);
	            	count = parseInt(count) + 1;
                	rev_count.html(" ("+count+")");

					//$(li).effect("highlight", "#FFFF00", 1000);

					window.location='/product_edit/'+new_pid;
				}
			}else{
				$(window.opener.document).find('.product-label').text(pname+" "+prev);
				window.location.reload(true);
				window.opener.document.location.reload();
			}
       	},
       	"json"
   	);

	// Update parent Window
	/*$(window.opener.document).find('#row-header-div td[kind=row-header-td][id='+
								$('#testcaseid').attr('value')+']').
								find('span').html($('#testcasename').
								find('textarea').val());
								*/
}



var fnProductDiscard = function() {
	window.close();
}
