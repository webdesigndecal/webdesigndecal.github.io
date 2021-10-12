function scheduleCallback(state) {
	var slide = state.targetSlideNumber;
	$('#window-content').addClass('window-schedule-'+slide);
	$('#window-content').removeClass('window-schedule-'+(slide+1));
	if (slide === 1) {
		$('#schedule-guide-left').addClass('schedule-guide-item-inactive');
	} else if (slide === 12) {
		$('#schedule-guide-right').addClass('schedule-guide-item-inactive');
	} else if (slide === 9) {
		$('#window').addClass('window-min');
	} else {
		$('#window').removeClass('window-min');
		$('.schedule-guide-item').removeClass('schedule-guide-item-inactive');
	}
}

$(document).ready(function(){

	setTimeout(function(){
		$('#content').addClass('content-active');
	}, 500);

	$('.schedule-slider-container').iosSlider({
		snapToChildren: true,
		desktopClickDrag: true,
		onSlideChange: scheduleCallback,
		scrollbar: true,
		scrollbarLocation: 'bottom',
		scrollbarBackground: '#FFFFFF',
		elasticPullResistance: 0.0, 
		elasticFrictionCoefficient: 0.3
	});

	$('#schedule-guide-left').click(function(){
		if (!$(this).hasClass('schedule-guide-item-inactive')) {
			$('.schedule-slider-container').iosSlider('prevSlide');
		}
	});

	$('#schedule-guide-right').click(function(){
		if (!$(this).hasClass('schedule-guide-item-inactive')) {
			$('.schedule-slider-container').iosSlider('nextSlide');
		}
	});

});