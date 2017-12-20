'use stirct';

var Swiper = require('swiper');

module.exports = function(target) {

	var SwiperOpts = {
		init: false,
		loop: true,
		preloadImages: true,
		lazy: {
			loadPrevNext: true,
		},
		loadOnTransitionStart : true,
		grabCursor: true,
		pagination: {
			el: '.js-slider-pagination',
			clickable: true
		},
		navigation : {
			nextEl: '.js-slider-button-next',
			prevEl: '.js-slider-button-prev',
		}
	};

	if(target.dataset.paginationLabel === 'true') {

		var slides = target.querySelectorAll('.js-slide');

		SwiperOpts.pagination.renderBullet = function (index, className) {
			return '<span class="' + className + '">' + slides[index].dataset.label + '</span>';
		};

		var sliderControls = target.querySelector('.js-slider-controls');
		sliderControls.classList.add('slider-controls--labels');

	}

	var options = {
		instance: new Swiper(target, SwiperOpts)
	};

	options.instance.init();
};
