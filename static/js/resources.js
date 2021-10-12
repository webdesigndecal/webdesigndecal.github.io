function show_preview(id, directory, user, filename) {
	$('#assignment-preview-user').val(user);
	$('#assignment-preview-directory').val(directory);
	$('#assignment-preview-id').val(id);
	$('#assignment-preview-filename').val(filename);

	$('#assignment-preview-content').attr('src', '/media/submission/' + CURR_SEMESTER + '/' + directory + '/' + user + '/' + filename + '/index.html');
	$('.assignment-preview').show();
	setTimeout(function(){
		$('.assignment-preview').addClass('assignment-preview-active');
		$('#overlay').show('fade', 500);
	}, 200);
}

$(document).ready(function(){

	$('.row-edit').click(function(){
		$(this).parent().parent().parent().addClass('row-editable');
		$(this).siblings('.row-description').attr('contenteditable', 'true');
		$(this).hide();
	});

	$('.row-description').on('keydown', function(e){
		if (e.keyCode === 13) {

			var description = $(this).text();

			$(this).parent().parent().parent().removeClass('row-editable');
			$(this).attr('contenteditable', 'false');
			$(this).siblings('.row-edit').show();

			if ($(this).parent().parent().parent().hasClass('row-assignment')) {
				$.post('/resources/update_assignment_description/', {'id': $(this).attr('data-id'), 'description': description, 'csrfmiddlewaretoken': TOKEN}, function(data){
					console.log(data);
				});
			} else {
				$.post('/resources/update_lecture_description/', {'id': $(this).attr('data-id'), 'section': $(this).attr('data-section'), 'description': description, 'csrfmiddlewaretoken': TOKEN}, function(data){
					console.log(data);
				});
			}
			return false;
		}
	});

	$('.lecture-upload').each(function(){
		var form = $(this);
		var section = $(this).children('.lecture-upload-section').val();
		var week = $(this).children('.lecture-upload-week').val();
		form.fileupload({
			url: '/resources/update_lecture_file/',
			type: 'POST',
			datatype: 'xml',
			add: function (event, data) {
				if (data.files && data.files[0]) {
					var file_ext;
					if ($(this).children('.lecture-upload-file').val() === 'Handson') {
						file_ext = validate_file(data, 'ZIP');
					} else {
						file_ext = validate_file(data, $(this).children('.lecture-upload-file').val());
					}

					if (!file_ext) return false;
					data.submit();
				}
			},
			success: function(data) {
				var url = '/media/lecture/' + CURR_SEMESTER + '/' + section + '/week' + week + '/' + data;
				form.siblings('a').attr('href', url);
				form.siblings('a').children('.row-button-link').removeClass('row-button-link-inactive');
				success_notification('Successfully uploaded!');
			},
			failure: function(data) {
				failure_notification('Oops! Something when wrong :(');
			}
		});
	});

	$('.assignment-upload-student').each(function(){
		var form = $(this);
		form.fileupload({
			url: '/resources/submit_assignment/',
			type: 'POST',
			datatype: 'xml',
			add: function (event, data) {
				if (data.files && data.files[0]) {
					var file_ext = validate_file(data, 'zip');
					if (!file_ext){
						return false;
					}
					data.submit();
				}
			},
			success: function(data) {
				if (data === 'failure') {
					failure_notification('There seems to be an issue with your zip file. Click on the top right corner -> Submission Help for help.');
				} else {
					show_preview(form.children('.assignment-upload-id').val(), form.children('.assignment-upload-directory').val(), form.children('.assignment-upload-user').val(), data);
				}
			},
			failure: function(data) {
				failure_notification('Oops! Something when wrong :(');
			}
		});
	});

	$('.assignment-upload-admin').each(function(){
		var form = $(this);
		form.fileupload({
			url: '/resources/update_assignment_file/',
			type: 'POST',
			datatype: 'xml',
			add: function (event, data) {
				if (data.files && data.files[0]) {
					var file_ext = validate_file(data, 'zip');
					if (!file_ext){
						return false;
					}
					data.submit();
				}
			},
			success: function(data) {
				success_notification('Successfully uploaded!');
			},
			failure: function(data) {
				failure_notification('Oops! Something when wrong :(');
			}
		});
	});

	$('#assignment-preview-submit').click(function(){
		var id = $('#assignment-preview-id').val();
		var user = $('#assignment-preview-user').val();
		var directory = $('#assignment-preview-directory').val();
		var filename = $('#assignment-preview-filename').val();

		$.post(
			'/resources/submit_assignment_confirm/',
			{'id': id, 'user': user, 'filename': filename, 'csrfmiddlewaretoken': TOKEN});
		$('.assignment-preview').addClass('assignment-preview-hidden');
		setTimeout(function(){
			$('.assignment-preview').hide();
			setTimeout(function(){
				$(this).siblings('.row-button-link').text('Resubmit');
				$('#assignment-view-submission-'+id).attr('href',
					'/media/submission/' + CURR_SEMESTER + '/' + directory + '/' + user + '/' + filename + '/index.html').show();
				$('.assignment-preview').removeClass('assignment-preview-active assignment-preview-hidden');
				$('#overlay').hide('fade', 500);
			}, 0);
		}, 500);
	});

	$('#assignment-preview-cancel').click(function(){
		$('.assignment-preview').removeClass('assignment-preview-active');
		setTimeout(function(){
			$('#overlay').hide('fade', 500);
		}, 500);
	});

});
