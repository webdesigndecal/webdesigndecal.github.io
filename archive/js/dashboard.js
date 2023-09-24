var feedback_popover_active = false;

$(document).ready(function(){

	$('#dashboard-attendance-form').live('submit', function(){

		var week = $('#dashboard-attendance-input').attr('data-week');
		var keyword = $('#dashboard-attendance-input').val();

		// POST: CHECKIN
		$.post('/dashboard/checkin/', {'week': week, 'keyword': keyword, 'username': USERNAME, 'csrfmiddlewaretoken': TOKEN}, function(status){
			if (status === 'SUCCESS') {
				success_notification('You are checked-in!<br>Enjoy this week\'s Lorem Ipsum adventure :)');

				$('#attendance-complete').show('fade', 500);
				$('.attendance-input').val('').blur();
				$('.dashboard-attendance-complete').show();
			} else {
				failure_notification('The Lorem Ipsum Word of the Week you entered is wrong!');
			}
		});
		return false;

	});

	$('#dashboard-latest-feedback-button').click(function(){

		var target = $(this);

		if (target.parent().hasClass('dashboard-latest-feedback-active')) {

			target.parent().removeClass('dashboard-latest-feedback-active');
			setTimeout(function(){
				target.siblings('.gradebook-item-assignment-feedback-popover').hide();
			}, 500);
			$('body').unbind();
			feedback_popover_active = false;

		} else {
			$('#dashboard-latest-feedback-button').siblings('.gradebook-item-assignment-feedback-popover').show();
			setTimeout(function () {
				target.parent().addClass('dashboard-latest-feedback-active');
			}, 0);

			if (!feedback_popover_active) {
				$('body').click(function (e) {
					if ($(e.target).closest('.gradebook-item-assignment-feedback').length > 0 || $(e.target).closest('#dashboard-latest-feedback').length > 0) {
						return false;
					} else {
						$('.gradebook-item-assignment-feedback').removeClass('gradebook-item-assignment-feedback-active');
						$('#dashboard-latest-feedback').removeClass('dashboard-latest-feedback-active');
						setTimeout(function () {
							$('.gradebook-item-assignment-feedback-popover').hide();
						}, 500);
					}
				});
				feedback_popover_active = true;
			}
		}

	});

	$('.gradebook-item-assignment-feedback-icon').click(function(){

		var target = $(this);

		if (target.parent().hasClass('gradebook-item-assignment-feedback-inactive')) {
			return false;
		}

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
				target.parent().addClass('gradebook-item-assignment-feedback-active');
			}, 0);

			if (!feedback_popover_active) {
				$('body').click(function(e){
					if ($(e.target).closest('.gradebook-item-assignment-feedback').length > 0 || $(e.target).closest('#dashboard-latest-feedback').length > 0) {
						return false;
					} else {
						$('.gradebook-item-assignment-feedback').removeClass('gradebook-item-assignment-feedback-active');
						$('#dashboard-latest-feedback').removeClass('dashboard-latest-feedback-active');
						setTimeout(function(){
							$('.gradebook-item-assignment-feedback-popover').hide();
						}, 500);
					}
				});
				feedback_popover_active = true;
			}

		}

	});

});