function resizeDom(windowHeight) {
	$('.schedule-item').css('padding-top', (($(window).height() - windowHeight) / 2) + 'px');
	$('.schedule-item:nth-child(12)').css('padding-bottom', (($(window).height() - windowHeight) / 2) + 'px');
	$('#apply-header').css('height', $(window).height() - 180 + 'px');

	setTimeout(function(){
		scheduleOffsetDict = {};
		$('.schedule-item').each(function(i){
			scheduleOffsetDict[$(this).position().top - 120] = i;
		});
	}, 100);
}

function setCover() {
	var offsetY = $(window).height() * 0.7 - 340;
	$('.window-container').css('top', offsetY);
}

function hideBanner() {
  let hidden = $('#banner').hasClass('banner-hidden');

  if (!hidden) {
    $('#banner').addClass('banner-hidden');
    window.localStorage.setItem('banner-hidden', true);
    let expiration = calculateExpiry();
    window.localStorage.setItem('expiration-time', expiration);
  }
}

function calculateExpiry() {
  const HOUR = 1000 * 60 * 60;
  const TIME = 12 * HOUR;
  let date = new Date();
  let currTime = date.getTime();
  let expirationTime = currTime + TIME;

  return expirationTime;
}

function getBanner() {
  let date = new Date();
  let currTime = date.getTime();

  let isClosed = window.localStorage.getItem('banner-hidden');
  let isExpired = currTime >= window.localStorage.getItem('expiration-time') ? true : false;

  if (isClosed && !isExpired) {
    $('#banner').addClass('banner-hidden');
  } else {
    $('#banner-btn').on('click', hideBanner);
  }
}

$(document).ready(function(){

	setCover();

  getBanner();

	setTimeout(function(){
		$('.window-container').removeClass('window-container-inactive');
	}, 0);

	$('#about').waypoint(function(direction){

		if (direction === 'down') {
			$('.window-container').removeClass('window-container-scaled').removeAttr('style');
			setTimeout(function(){
				$('.window').addClass('window-active-about');
			}, 0);
			$('#nav').attr('class', 'nav-active-about');
		} else {
			$('.window').removeClass('window-active-about');
			setTimeout(function(){
				$('.window-container').addClass('window-container-scaled');
				setCover();
			}, 0);
			$('#nav').attr('class', 'nav-active-cover');
		}

	}, {'offset': '50%'});

	$('#curriculum').waypoint(function(direction){

		if (direction === 'down') {
			$('.window').addClass('window-active-curriculum');
			$('#nav').attr('class', 'nav-active-curriculum');
		} else {
			$('.window').removeClass('window-active-curriculum');
			$('#nav').attr('class', 'nav-active-about');
		}

	}, {'offset': '50%'});

	$('#schedule').waypoint(function(direction){

		if (direction === 'down') {
			$('.window-container').addClass('window-container-scaled');
			setTimeout(function(){
				$('.window').addClass('window-active-schedule');
				$('#nav').attr('class', 'nav-active-schedule');
			}, 0);
		} else {
			$('.window').removeClass('window-active-schedule');
			setTimeout(function(){
				$('.window-container').removeClass('window-container-scaled');
				$('#nav').attr('class', 'nav-active-curriculum');
			}, 0);
		}

	}, {'offset': '50%'});

	$('.schedule-item').waypoint(function(direction){

		var week = parseInt($(this).attr('data-week'));

		if (direction === 'down') {
			$('#window-schedule').addClass('window-schedule-'+week);
		} else {
			if (week !== 1) {
				$('#window-schedule').removeClass('window-schedule-'+week);
			}
		}

		if (week === 10) {
			$('.window-container').addClass('window-min');
		} else {
			$('.window-container').removeClass('window-min');
		}

	}, {'offset': '60px'});

	$('#instructor').waypoint(function(direction){

		if (direction === 'down') {
			$('.window-container').removeClass('window-container-scaled');
			setTimeout(function(){
				$('.window').addClass('window-active-instructor');
				$('#nav').attr('class', 'nav-active-instructor');
			}, 0);
		} else {
			$('.window').removeClass('window-active-instructor');
			$('#nav').attr('class', 'nav-active-schedule');
			setTimeout(function(){
				$('.window-container').addClass('window-container-scaled');
			}, 0);
		}

	}, {'offset': '50%'});

	$('#faq').waypoint(function(direction){

		if (direction === 'down') {
			$('.window-container').addClass('window-container-hidden');
			$(this).addClass('faq-active');
			$('#nav').attr('class', 'nav-active-faq');
		} else {
			$('.window-container').removeClass('window-container-hidden');
			$('#nav').attr('class', 'nav-active-faq');
			$(this).removeClass('faq-active');
		}

	}, {'offset': '50%'});

	$('#apply').waypoint(function(direction){

		if (direction === 'down') {
			$('#apply-container').show();
			setTimeout(function(){
				$('#apply-container').addClass('apply-active');
			}, 50);
			$('#guide').hide();
		} else {
			$('#apply-container').removeClass('apply-active');
			setTimeout(function(){
				$('#apply-container').hide();
			}, 500);
			$('#guide').show();
		}

	}, {'offset': '60%'});

	$('#faq-content').masonry({
		itemSelector : '.faq-item',
		columnWidth: 310,
		gutter: 15,
		isFitWidth: false,
		isResizable: true,
		isAnimated: true
	});

	$('.nav-item').click(function(){
		var target = $(this).attr('id').substring(9);
		var offsetY = $('#'+target).offset().top;
		$('html, body').animate({ scrollTop: offsetY }, 400);
	});

	$('#learn-more').click(function() {
		$('html, body').animate({ 
			scrollTop: $('#about').offset().top 
		}, 400);
	})

});
