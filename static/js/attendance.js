$(document).ready(function(){

	$('.attendance-item-inactive').live('click', function(){
			$('.attendance-item').not('.attendance-item-inactive').addClass('attendance-item-inactive');
			$(this).removeClass('attendance-item-inactive');
	});

	$('.attendance-checkin-form').live('submit', function(){

			var week = $(this).children('.attendance-item-week').val();
			var keyword = $(this).children('.attendance-word').val().toLowerCase();
	var overlay = $(this).parent().parent().siblings('.attendance-complete');

			// POST: CHECKIN

			$.post('/attendance/checkin/', {'week': week, 'keyword': keyword, 'csrfmiddlewaretoken': TOKEN}, function(status){
					if (status === 'SUCCESS') {
							success_notification('You are checked-in!<br>Enjoy this week\'s Lorem Ipsum adventure :)');

							// TODO: Reimplement the following
							// overlay.show('fade', 500);
							// $('.attendance-input').val('').blur();
							// $('#attendance-table-column-' + week).children('.attendance-table-status').html('<div class="attendance-table-status-icon attendance-table-status-attended"><img class="img-scaled" src="/static/icons/check_light.svg" /></div>');
					} else {
							failure_notification('The Lorem Ipsum Word of the Week you entered is wrong!');
					}
			});

			return false;

	});

	$('#attendance-carousel-left').click(function(){
		var $attendanceCarousel = $('#attendance-carousel');
		if ($attendanceCarousel.attr('data-state') === '0') {
			$attendanceCarousel.attr('data-state', '-1');
			$('.attendance-carousel-container').addClass('attendance-carousel-container-left');
			$(this).hide();
		} else if ($attendanceCarousel.attr('data-state') === '1') {
			$attendanceCarousel.attr('data-state', '0');
			$('.attendance-carousel-container').removeClass('attendance-carousel-container-right');
			$('#attendance-carousel-right').show();
		}

	});

	$('#attendance-carousel-right').click(function(){
		var $attendanceCarousel = $('#attendance-carousel');
		if ($attendanceCarousel.attr('data-state') === '0') {
			$attendanceCarousel.attr('data-state', '1');
			$('.attendance-carousel-container').addClass('attendance-carousel-container-right');
			$(this).hide();
			$('#attendance-carousel-left').show();
		} else if ($attendanceCarousel.attr('data-state') === '-1') {
			$attendanceCarousel.attr('data-state', '0');
			$('.attendance-carousel-container').removeClass('attendance-carousel-container-left');
			$('#attendance-carousel-left').show();
		}

	});

	$('.attendance-history-info').click(function(){
			if ($(this).hasClass('attendance-history-info-active')) {
				$('.attendance-history-info').removeClass('attendance-history-info-active');
				$('.attendance-history-content').slideUp();
				return false;
			} else {
				$('.attendance-history-info').removeClass('attendance-history-info-active');
				$(this).addClass('attendance-history-info-active');
				$('.attendance-history-content').slideUp();
			$(this).siblings('.attendance-history-content').slideDown();
			}
	});

});
