var orig_id, new_id;
var auto_save_timer = null;
var repeat_interval = 10000; // milliseconds

function submit_password(old_password, new_password) {
	var $csrf_token = $('#csrf_token').attr('value');
	$.post(
		"/change_password",
		{
			"old_password": old_password,
			"new_password": new_password,
           		"csrfmiddlewaretoken": $csrf_token
		},
		function(json) {
			if(json['ret'] == "success") {
				alert("Password changed successfully!");
				$('.password-panel input').each(function(){
					$(this).val("--------").css("color","#CCCCCC");
				});
				$('.password-panel').fadeToggle(300);
			}else if(json['ret'] == "fail") {
				alert("ERROR: Password verification failed. Please try again.");
			}else{
				alert("ERROR: Failed to change password. Please try again.");
			}
		},
		"json"
	);
}

$(document).ready(function(){
	if(user_valid) {
		$('.change-password').show()
		$('.change-password').click(function(){
			$('.password-panel').fadeToggle(300);	
		});
		$('.password-panel input').focus(function(){
			$(this).next('.password-error').remove();
			if($(this).val() == "--------") {
				$(this).val("").css("color","black");
			}
		}).blur(function(){
			if($(this).val() == "") {
				$(this).val("--------").css("color","#CCCCCC");
			}else if($(this).val().length < 8){
				str = "ERROR: password needs to be atleast 8 characters long";
				$('<div class="password-error"><label>'+str+'</label></div>').insertAfter($(this));
			}
		}).keyup(function(e,ui){
			if(e.keyCode == 27) {
				$(this).val("").css("color","black");
			}else if(e.keyCode == 13) {
				$('.password-panel .password-submit').click();
			}
		});
		$('.password-panel .password-submit').click(function(){
			old_password = $('.password-panel input[id=old-password]').val();
			new_password = $('.password-panel input[id=new-password]').val();
			confirm_password = $('.password-panel input[id=new-password-confirm]').val();
			if(new_password != "--------" && new_password != confirm_password) {
				alert("ERROR: New passwords do not match. Please try again.");
			}else if(old_password == "--------" || new_password == "--------" || confirm_password =="--------") {
				alert("ERROR: Enter valid password");
			}else if(new_password == confirm_password && new_password.length>=8) {
				submit_password(old_password, confirm_password);
			}
		});
		$('.password-panel .password-cancel').click(function(){
			$('.password-panel input').each(function(){
				$(this).val("--------").css("color","#CCCCCC");
			});
			$('.password-panel').fadeToggle(300);
		});
	}
});
