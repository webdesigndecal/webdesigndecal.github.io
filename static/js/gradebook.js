var feedback_popover_active = false;

function update_project_grade(project_id, rubric_item, score) {

	// The following calculations update the DOM on the fly as the user updates the project grade. This does NOT change the data in backend. 
	var ui_score = 0;
	var ux_score = 0;

	var ui_graders = 0;
	var ux_graders = 0;

	$('.gradebook-item-project-detail-grade-score-ui[data-project='+project_id+']').each(function(){
		var individual_ui_score = parseFloat($(this).text());

		if (individual_ui_score >= 0 && individual_ui_score <= 10) {
			ui_score += individual_ui_score;
			ui_graders++;
		}

	});

	$('.gradebook-item-project-detail-grade-score-ux[data-project='+project_id+']').each(function(){
		var individual_ux_score = parseFloat($(this).text());
		if (individual_ux_score >= 0 && individual_ux_score <= 11) {
			ux_score += individual_ux_score;
			ux_graders++;
		}
	});

	if (ui_graders > 0) {
		ui_score = parseFloat(ui_score / ui_graders);
	}

	if (ux_graders > 0) {
		ux_score = parseFloat(ux_score / ux_graders);
	}

	var feedback_score = parseFloat($('.gradebook-item-project-detail-grade-score-checkin[data-project='+project_id+']').text());
	var writeup_score = parseFloat($('.gradebook-item-project-detail-grade-score-writeup[data-project='+project_id+']').text());

	var total_score = Math.round(ui_score + ux_score + feedback_score + writeup_score);
	$('.gradebook-item-project-detail-grade-total-received[data-project='+project_id+']').text(total_score);

	$('.gradebook-item-project-detail-individual-grade-received[data-project='+project_id+']').each(function(){
		var eval_modifier = parseFloat($(this).attr('data-eval')) / 100;
		$(this).text(Math.round(parseFloat(total_score * eval_modifier)));
	});


	/* LIST OF RUBRIC ITEMS
		staff_1_ui (if staff id is 1)
		staff_1_ux (if staff id is 1)
		checkin
		writeup
	*/

	// POST: UPDATE_PROJECT_GRADE

	$.post('/gradebook/update_project_grade/', {'project_id': project_id, 'rubric_item': rubric_item, 'score': score, 'csrfmiddlewaretoken': TOKEN});

}

function update_grade(submission_id, score) {

	// POST: UPDATE_GRADE

	$.post('/gradebook/update_grade/', {'submission_id': submission_id, 'score': score, 'csrfmiddlewaretoken': TOKEN});

}

$(document).ready(function(){

	$('.gradebook-item-project-action-grade').click(function(){
		if ($(this).attr('data-state') === '0') {
			$(this).parent().parent().siblings('.gradebook-item-project-detail').slideDown();
			$(this).text('Hide').attr('data-state', '1');
		} else {
			$(this).parent().parent().siblings('.gradebook-item-project-detail').slideUp();
			$(this).text('Grade').attr('data-state', '0');
		}
	});

	$('.gradebook-header-option-item').click(function(){
		$('.gradebook-header-option-item-active').removeClass('gradebook-header-option-item-active');
		$(this).addClass('gradebook-header-option-item-active');
		if ($(this).attr('id') === "gradebook-header-option-assigned") {
			$('#assigned-submissions-panel').show();
			$('#enrolled-students-panel').hide();
			$('#project-submissions-panel').hide();
		} else if ($(this).attr('id') === "gradebook-header-option-enrolled") {
			$('#assigned-submissions-panel').hide();
			$('#enrolled-students-panel').show();
			$('#project-submissions-panel').hide();
		} else {
			$('#assigned-submissions-panel').hide();
			$('#enrolled-students-panel').hide();
			$('#project-submissions-panel').show();
		}
	});

	var gradebookHeaderSearchInput = $('#gradebook-header-search-input');

	gradebookHeaderSearchInput.focus(function(){
		$(this).siblings('.gradebook-header-search-guide').addClass('gradebook-header-search-guide-active');
	});

	gradebookHeaderSearchInput.blur(function(){
		$(this).siblings('.gradebook-header-search-guide').removeClass('gradebook-header-search-guide-active');
	});

	gradebookHeaderSearchInput.keyup(function() {
		$.ajax({
				type: "POST",
				url: "/gradebook/search/",
				data: {
						'search_text' : $('#gradebook-header-search-input').val(),
						'csrfmiddlewaretoken' : $("input[name=csrfmiddlewaretoken]").val()
				},
				success: function searchSuccess(data, textStatus, jqXHR) {

						var searchResult = $('#search-result');

						if ($('#gradebook-header-search-input').val() === "") {
								searchResult.hide();
								$('#search-result-header').hide();
						} else {
								searchResult.show();
								$('#search-result-header').show();
						}

						searchResult.html(data);

				},
				dataType: 'html'
		});
	});

	$('.gradebook-item-content').live('click', function() {
		if ($(this).hasClass('gradebook-item-content-active')) {
			$('.gradebook-item-content-active').removeClass('gradebook-item-content-active');
			$('.gradebook-item-detail').slideUp();
			return;
		} else {
			$('.gradebook-item-active').removeClass('gradebook-item-content-active');
			$(this).addClass('gradebook-item-content-active');
			$('.gradebook-item-detail').slideUp();
			$(this).siblings('.gradebook-item-detail').slideDown();
		}
	});

	$('.gradebook-item-assignment-score-input').live('click', function() {
		$(this).parent().addClass('gradebook-item-assignment-score-active');
	});

	$(document).on('blur', '.gradebook-item-assignment-score-input', function() {
		$(this).parent().removeClass('gradebook-item-assignment-score-active'); 
	});

	$(document).on('keydown', '.gradebook-item-assignment-score-input', function(e){
		if (e.keyCode === 13 || e.keyCode === 32) {
			return false;
		}
	});

	$(document).on('blur', '.gradebook-item-assignment-score-input', function(e){

		var rawInput = $(this).text().trim(), input;
		if (rawInput === '') {
			input = -1;
		} else {
			input = parseFloat(rawInput);
		}

		var possible = parseFloat($(this).siblings('.gradebook-item-assignment-score-possible').text());

		if (input < -1 || input > possible || isNaN(input)) {
			$(this).text($(this).attr('data-original'));
		} else if (input === -1 || input === $(this).attr('data-original')) {
			return false;
		} else {
			$(this).attr('data-original', input);
			update_grade($(this).attr('data-submission'), input);
		}

	});

	$(document).on('keydown', '.gradebook-item-project-detail-grade-score-input', function(e){
		if (e.keyCode === 13 || e.keyCode === 32) {
			return false;
		}
	});

	$(document).on('blur', '.gradebook-item-project-detail-grade-score-input', function(e){

		var raw_input = $(this).text(),
			input;
		if (raw_input === '') {
			input = -1;
		} else {
			input = Math.round(raw_input);
		}

		var possible = Math.round($(this).siblings('.gradebook-item-project-detail-grade-score-possible').text());

		if (input < -1 || input > possible || isNaN(input)) {
			$(this).text($(this).attr('data-original'));
		} else if (input === -1 || input === $(this).attr('data-original')) {
			return false;
		} else {
			$(this).text(input);
			$(this).attr('data-original', input);
			update_project_grade($(this).attr('data-project'), $(this).attr('data-item'), input);
		}

	});


	$(document).on('click', '.gradebook-item-assignment-feedback-icon', function(){

		var target = $(this);

		if (target.parent().hasClass('gradebook-item-assignment-feedback-active')) {

			target.parent().removeClass('gradebook-item-assignment-feedback-active');
			setTimeout(function(){
				target.siblings('.gradebook-item-assignment-feedback-popover').hide();
			}, 500);
			$('body').unbind();
			feedback_popover_active = false;

		} else {

			$('.gradebook-item-assignment-feedback-icon').not(this).each(function(){
				var $this = $(this);
				$this.parent().removeClass('gradebook-item-assignment-feedback-active');
				setTimeout(function(){
					$this.siblings('.gradebook-item-assignment-feedback-popover').hide();
				}, 500);
			});

			target.siblings('.gradebook-item-assignment-feedback-popover').show();
			setTimeout(function(){
				if (target.parent().hasClass('gradebook-item-assignment-feedback-inactive')) {
					target.siblings('.gradebook-item-assignment-feedback-popover').children('.gradebook-item-assignment-feedback-popover-content').focus();
				}
				target.parent().addClass('gradebook-item-assignment-feedback-active');
			}, 0);

			if (!feedback_popover_active) {
				$('body').click(function(e){
					if ($(e.target).closest('.gradebook-item-assignment-feedback').length > 0) {
						return false;
					} else {
						$('.gradebook-item-assignment-feedback').removeClass('gradebook-item-assignment-feedback-active');
						setTimeout(function(){
							$('.gradebook-item-assignment-feedback-popover').hide();
						}, 500);
						$('body').unbind();
					feedback_popover_active = false;
					}
				});
				feedback_popover_active = true;
			}

		}

	});

	$('.gradebook-item-assignment-feedback-popover-edit').on('click', function(){
		var target = $(this);
		$(this).parent().addClass('gradebook-item-assignment-feedback-popover-editable');
		$(this).siblings('.gradebook-item-assignment-feedback-popover-content').attr('contenteditable', 'true');
		setTimeout(function(){
			target.hide();
			target.siblings('.gradebook-item-assignment-feedback-popover-content').focus();
		}, 500);
	});

	$('.gradebook-item-assignment-feedback-popover-content').on('keydown', function(e){
		if (e.keyCode === 13) {

			var target = $(this);
			var id = $(this).parent().attr('data-id');
			var feedback = $(this).text();
			var project = parseFloat($(this).attr('data-project'));

			target.siblings('.gradebook-item-assignment-feedback-popover-edit').show();
			setTimeout(function(){
				target.parent().parent().removeClass('gradebook-item-assignment-feedback-inactive');
				target.parent().removeClass('gradebook-item-assignment-feedback-popover-editable');
				target.attr('contenteditable', 'false');
				if (project) {

					// POST CALL: UPDATE_PROJECT_FEEDBACK
					$.post('/gradebook/update_project_feedback/', {'project_id': id, 'feedback': feedback, 'csrfmiddlewaretoken': TOKEN});

				} else {

					$.post('/gradebook/update_feedback/', {'submission_id': id, 'feedback': feedback, 'csrfmiddlewaretoken': TOKEN});

				}
			}, 0);

			return false;

		}
	});

});
