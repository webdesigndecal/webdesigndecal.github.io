var design_lecture = [];
var programming_lecture = [];
var all_lecture = [];

$(document).ready(function(){
	/*
	cd = countdown(new Date(2014, 8, 9, 19, 0, 0), function(ts){
		$('#cover-countdown-day').text(ts.days);
		$('#cover-countdown-minute').text(ts.minutes);
		$('#cover-countdown-hour').text(ts.hours);
		$('#cover-countdown-second').text(ts.seconds);
	}, countdown.DAYS|countdown.HOURS|countdown.MINUTES|countdown.SECONDS);
	*/

	$('#content-gallery').masonry({
		columnWidth: 310,
		itemSelector: '.video-item',
		gutter: 15
	});

	$('.video-item-design').each(function(){
		if ($(this).parent().attr('id') != 'cover-video') {
			design_lecture.push($(this));
		}
	});

	$('.video-item-programming').each(function(){
		if ($(this).parent().attr('id') != 'cover-video') {
			programming_lecture.push($(this));
		}
	});

	$('.video-item').each(function(){
		all_lecture.push($(this));
	});

	$('.content-filter-all').click(function(){
		$('.content-filter-active').removeClass('content-filter-active');
		$(this).addClass('content-filter-active');
		$('.video-item').show();
		$('#content-gallery').masonry('layout');
	});

	$('.content-filter-design').click(function(){
		$('.content-filter-active').removeClass('content-filter-active');
		$(this).addClass('content-filter-active');
		$('#content-gallery').masonry('hide', programming_lecture);
		$('.video-item-design').show();
		$('#content-gallery').masonry('layout');
	});

	$('.content-filter-programming').click(function(){
		$('.content-filter-active').removeClass('content-filter-active');
		$(this).addClass('content-filter-active');
		$('#content-gallery').masonry('hide', design_lecture);
		$('.video-item-programming').show();
		$('#content-gallery').masonry('layout');
	});

	$('#theater-backdrop').click(function(){
		$('#theater').removeClass('theater-active');
		$('#theater').hide('fade', 500);
	});

});