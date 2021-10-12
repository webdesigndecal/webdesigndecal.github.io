var lightGrey = '#ecf0f1';
var darkGrey = '#818892';
var green = '#78c272';
var red = '#de6868';
var itemColor = 'rgb(76, 87, 101)';
var TOKEN;
var USERNAME;

function validate_file(input, type){
	var file = input.files[0];
	var file_ext;

	file_ext = file.name.split('.');
	file_ext = file_ext[file_ext.length -1].toLowerCase();

	if (file_ext !== type.toLowerCase()){
		alert("The file you are trying to upload is not valid");
		return false;
	} else {
		return file_ext;
	}
}

function validate_img(input) {
	var file = input.files[0];
	var file_ext;

	// Validate the File Type
	file_ext = file.name.split('.');
	file_ext = file_ext[file_ext.length -1].toLowerCase();
	var ACCEPTED_EXTENSIONS = ['gif','jpg','jpeg','png'];
	for(i = 0; i < ACCEPTED_EXTENSIONS.length; i++){
		if (file_ext === ACCEPTED_EXTENSIONS[i]){
			break;
		}
		if (i === ACCEPTED_EXTENSIONS.length-1){
			alert("The file you are trying to upload is not valid");
			return false;
		}
	}

	// Validate the File Size
	if(file.size > 2000000){
		alert("The file you are trying to upload is too large");
		return false;
	}

	return file_ext;
}

function success_notification(content){
	$('#overlay').show('fade', 500);
	$('#notification-success').show();
	$('#notification-success').children('.notification-box').children('.notification-caption').html(content);
	setTimeout(function(){
		$('#notification-success').addClass('notification-active');
		setTimeout(function(){
			$('#notification-success').addClass('notification-hidden');
			$('#overlay').hide('fade', 500);
			setTimeout(function(){
				$('#notification-success').hide();
				$('#notification-success').removeClass('notification-active notification-hidden');
			}, 500);
		}, 3000);
	}, 0);
}

function failure_notification(content){
	$('#overlay').show('fade', 500);
	$('#notification-failure').show();
	$('#notification-failure').children('.notification-box').children('.notification-caption').html(content);
	setTimeout(function(){
		$('#notification-failure').addClass('notification-active');
		setTimeout(function(){
			$('#notification-failure').addClass('notification-hidden');
			$('#overlay').hide('fade', 500);
			setTimeout(function(){
				$('#notification-failure').hide();
				$('#notification-failure').removeClass('notification-active notification-hidden');
			}, 500);
		}, 3000);
	}, 0);
}

$(document).ready(function() {

	TOKEN = $('#data-csrf').text();
	USERNAME = $('#data-user').text();
	CURR_SEMESTER = $('#data-curr-semester').text();

	$('#login-year-selector').click(function(){
	 $('#login-year-selector').focus();
	});

	$('#login-year-selector').focus(function(){
		$('#login-selector').addClass('login-selector-active');
	});

	$('#login-year-selector').blur(function(){
		$('#login-selector').removeClass('login-selector-active');
	});

	$('.login-selector-item').click(function(){
		$('#login-year').val($(this).children('.login-selector-item-index').text());
		$('#login-year-selector').val($(this).children('.login-selector-item-caption').text());
		$('#login-selector').removeClass('login-selector-active');
	});

	$('#reg-item-enrolled-no').click(function(){
		$('.reg-item-enrolled-action-active').removeClass('reg-item-enrolled-action-active');
		$(this).addClass('reg-item-enrolled-action-active');
		$('#reg-item-enrolled').val('0');
	});

	$('#reg-item-enrolled-yes').click(function(){
		$('.reg-item-enrolled-action-active').removeClass('reg-item-enrolled-action-active');
		$(this).addClass('reg-item-enrolled-action-active');
		$('.reg-item-ccn').show();
		setTimeout(function(){
			$('.reg-item-ccn').addClass('reg-item-ccn-active');
		}, 0);
		$('#reg-item-enrolled').val('1');
	});

	$('#reg-item-ccn-cancel').click(function(){
		$('.reg-item-ccn').removeClass('reg-item-ccn-active');
		$('.reg-item-enrolled-action-active').removeClass('reg-item-enrolled-action-active');
		$('#reg-item-enrolled-no').addClass('reg-item-enrolled-action-active');
		$('#reg-item-ccn-input').val('');
		$('#reg-item-enrolled').val('');
		setTimeout(function(){
			$('.reg-item-ccn').hide();
		}, 500);
	});

	$('#profile-picture-form').each(function(){
		var form = $(this);
		form.fileupload({
			url: '/authentication/changepic/',
			type: 'POST',
			datatype: 'xml',
			add: function (event, data) {
				if (data.files && data.files[0]) {

					var file_ext = validate_img(data);
					if (!file_ext){
						return false;
					}

					var reader = new FileReader();
					reader.onload = function(e) {
						$('#profile-picture-thumbnail').children('img').attr('src', e.target.result);
						$('#profile-picture').addClass('profile-picture-active');
					};
					reader.readAsDataURL(data.files[0]);

					data.submit();

				}
			},
			success: function(data) {
				$('#profile-picture-finish').show('fade', 500);
			},
			failure: function(data) {
				failure_notification('Oops! Something went wrong :(');
			}
		});
	});

	$('#topbar-user').click(function(){
		if ($(this).hasClass('topbar-user-active')) {
			$(this).removeClass('topbar-user-active');
			setTimeout(function(){
				$('#topbar-user-popover').hide();
			}, 500);
		} else {
			$('#topbar-user-popover').show();
			setTimeout(function(){
				$('#topbar-user').addClass('topbar-user-active');
			}, 0);
		}
	});

	$('#change-password-form').submit(function(){

	 if ($('#login-new-password').val() !== $('#login-confirm-password').val()) {

	failure_notification("Password you've entered does not match'");

	 } else {

		$(this).submit();

	 }

	 return false;

	});

	$('#register-form').submit(function(){

		$('input').removeClass('login-input-error');

		if ($('#login-password').val() !== $('#login-password-confirm').val()) {
			$('#login-password').addClass('login-input-error');
		$('#login-password-confirm').addClass('login-input-error');
			failure_notification("Password you've entered does not match");
		}

	 var params = $(this).serialize();
	 $.post('/authentication/register/', params, function(data){
		// If the server provides a URL to redirect to (means that the data validated),
		// redirect to the URL
		if (data.hasOwnProperty('email')){
			$('#login-username').addClass('login-input-error');
			failure_notification('User with this email already exists.');
		} else if (data.hasOwnProperty('first_name')){
			$('#login-firstname').addClass('login-input-error');
			failure_notification('Enter your first name');
		} else if (data.hasOwnProperty('last_name')){
			$('#login-lastname').addClass('login-input-error');
			failure_notification('Enter your last name');
		} else if (data.hasOwnProperty('enrolled')){
			alert('enrolled')
		} else if (data.hasOwnProperty('year_in_school')){
			$('#login-year').addClass('login-input-error');
			failure_notification('Enter your year in school');
		} else if (data.hasOwnProperty('password')){
			$('#login-password').addClass('login-input-error');
			failure_notification('Enter your password');
		} else if (data.hasOwnProperty('password_confirm')){
			$('#login-password').addClass('login-input-error');
			$('#login-password-confirm').addClass('login-input-error');
			failure_notification('Enter your password one more time.');
		} else if(data.hasOwnProperty('redirectURL')) {
			window.location = data['redirectURL'];
		} else {
			failure_notification('Oops! Something went wrong :(');
		}
	 });

	 return false;

	});

	$('#login-form').submit(function(){
		var params = $(this).serialize();
		$.post('/authentication/login/', params, function(data){
			if (data.hasOwnProperty('redirectURL')) {
				window.location = data['redirectURL'];
			} else {
				failure_notification('Your login credentials are incorrect!');
			}
		});
		return false;
	});

});

//fill: #818892;
//background: #78c272;
//background: #de6868;