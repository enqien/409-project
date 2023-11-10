TIMEOUT=60000

function forgot_password() {
	$('.login-panel').dialog("close");
	$('.forgot-dialog').remove();
	$('body').append('<div class="forgot-dialog"></div>');
	$('.forgot-dialog').append('<label>Enter e-mail address:</label><p>'+
				   '<input class="forgot-input"/>'+
				   '<span class="forgot-submit">submit</span>'+
				   '<span class="forgot-cancel">cancel</span>');
	$('.forgot-dialog').dialog({
		create: function(e) {
			$(e.target).parent().css('position', 'fixed');
		},
		dialogClass: 'forgot-dialog',
		resizable: false,
		modal: true,
		show: {
			effect: "fade",
			direction: "right",
			duration: 300
		},
		hide: {
			effect: "fade",
			direction: "up",
			duration: 300
		},
	});
	$('.forgot-cancel').on({
		'click' : function(){
				$('.forgot-dialog').dialog("close");
			  }
	});
	$('.forgot-submit').on({
		'click' : function(){
				forgot_processing();
			  }
	});
	$('.forgot-input').on({
		'keydown': function(e){
				if(e.keyCode == 13) {
					forgot_processing();
				}
			  }
	});
}

function forgot_processing() {
	if($('.forgot-input').val().match(/Oracle/gi)==null){
		alert("Invalid e-mail address. Should be a valid xxx@oracle.com e-mail.");
		$('.forgot-input').focus();
	}else{
    		$.ajax({
       			type: "POST",
       			dataType: "json",
       			timeout: TIMEOUT,
       			error: function(req, s, err) {
         						if(s == "timeout") {
             						when_ajax_timeout();
         						}   
       			},  
       			url: "/password_reset",
       			data: {
				"email": $('.forgot-input').val(),
         						"csrfmiddlewaretoken": $('#csrf_token').attr('value')
       			},
       			success: function(json) {
				if(json['ret'] == "success") {
					$('.forgot-dialog').dialog("close");
					alert("e-mail sent to \""+$('.forgot-input').val()+
						"\" with further instructions");
				}else if(json['ret'] == "fail") {
					alert("Permission denied: e-mail not in user database.");
					$('.forgot-input').focus();
				}else if(json['ret'] == "error") {
					$('.forgot-dialog').dialog("close");
					alert("ERROR: Unexpected exception has occurred. Please contact administrator");
				}
       			}
    		});
	}
}

function login_setup() {
    $('.login').click(function(e){
        e.stopPropagation();
		$('.login-panel').find("input").css("color","#CCCCCC");
		$('.login-panel').find("#username").attr("value","username (first+last_initial)");
		$('.login-panel').find("#password").attr("value","password");
    	$('.login-panel').dialog({
		// Do this to position fix the login dialog window and prevent it from moving 
		// around during scrolling.
		create: function(e) {
			$(e.target).parent().css('position', 'fixed');
		},
        	dialogClass: 'login-menu',
        	resizable: false,
		modal: true,
		height: 150,
        	position: {
            		at: 'right',
			of: $('.title'),
        	},  
		show: {
			effect: "fade",
			direction: "right",
			duration: 300
		},
		hide: {
			effect: "fade",
			direction: "up",
			duration: 300
		},
    	}).css("padding","0px");
    }); 
}   

function login(username, password) {
    $.ajax({
        type: "POST",
        dataType: "json",
        timeout: TIMEOUT,
        error: function(req, s, err) {
            if(s == "timeout") {
                when_ajax_timeout();
            }   
        },  
        url: "/log_in",
        data: {
            "username": username,
            "password": password,
            "csrfmiddlewaretoken": $('#csrf_token').attr('value')
        },
        success: function(json) {
            if(json['ret'] == "success") {
				window.location.reload(true);
            }else if(json['ret'] == "fail") {
                alert("Incorrect username and/or password. Please try again");
		$('.login').click();
            }else if(json['ret'] == "disabled") {
                alert("User is disabled. Contact admin.");
            }
        }
    });
}

function logout() {
    $.ajax({
        type: "POST",
        dataType: "json",
        timeout: TIMEOUT,
        error: function(req, s, err) {
            if(s == "timeout") {
                when_ajax_timeout();
            }   
        },  
        url: "/log_out",
        data: {
            "csrfmiddlewaretoken": $('#csrf_token').attr('value')
        },
        success: function(json) {
			window.location.reload(true);
        }
    });
}

$(document).ready(function(){
	login_setup();
	$('.logout').on({
		'click': function(){
			if(confirm("Are you sure you want to logout?")) {
				logout();
			}
		}
	});
	$('.login-panel').find('#submit').click(function(){
		$('.login-panel').dialog("close");
		login($('.login-panel').find("#username").attr("value"), 
				$('.login-panel').find("#password").attr("value"));
	});
	$('.login-panel').find('#cancel').click(function(){
		$('.login-panel').dialog("close");
	});
	$('.login-panel').find('#forgot').click(function(){
		forgot_password();
	});
	$('.login-panel').find('input').on({
		'keydown': function(e){
			if($(this).val() == "username (first+last_initial)" ||$(this).val() == "password")
				$(this).val("");
			$(this).css('color','#000000');
			if(e.keyCode == 13 && $(this).val().trim() != "") {
				$('.login-panel').find('#submit').click();
			}
		},
		'click': function(){
			if($(this).val() == "username (first+last_initial)" ||$(this).val() == "password")
				$(this).val("");
			$(this).css('color','#000000');
		},

	});
});
