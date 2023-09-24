$(document).ready(function(){

	$('.gallery').masonry({
		columnWidth: 360,
		itemSelector: '.item',
		gutter: 30,
		isFitWidth: true
	});

	$('.item').click(function(){
		$('body').css('overflow', 'hidden');
		$('.gallery').addClass('gallery-hidden');
		$('.viewer').show();
		$('.panel').show();
		setTimeout(function(){
			$('body').addClass('viewer-active');
		}, 250);
		setTimeout(function(){
			$('.gallery').hide();
		}, 500);
	});

	$('#header-back').click(function(){
		$('.gallery').show();
		$('body').removeClass('viewer-active');
		setTimeout(function(){
			$('.gallery').removeClass('gallery-hidden');
		}, 250);
		setTimeout(function(){
			$('.viewer').hide();
			$('.panel').hide();
			$('body').css('overflow', 'auto');
		}, 500);
	});

});