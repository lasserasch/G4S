'use stirct';

var Header = require('./modules/header');
var Menu = require('./modules/menu');
var Overlay = require('./modules/overlay');
var CountrySelector = require('./modules/country-selector');
var Slider = require('./modules/slider');
var YTPlayer = require('./modules/youtubeplayer');
var Video = require('./modules/video');
var Toggle = require('./modules/toggle');
var EmbedWrap = require('./modules/embed-wrap');


var init = function() {

	Overlay();

	var headerEl = document.querySelector('.js-header');
	if(headerEl) {
		Header(headerEl);
	}

	var menuEl = document.querySelector('.js-menu');
	if(menuEl) {
		Menu(menuEl);
	}

	var countryEl = document.querySelector('.js-nav-country');
	if(countryEl) {
		CountrySelector(countryEl);
	}

	var sliderEl = document.querySelectorAll('.js-slider');
	if(sliderEl.length > 0) {
		for (var s = 0; s < sliderEl.length; s++) {
			Slider(sliderEl[s]);
		}
	}

	var youtubeEl = document.querySelectorAll('.js-youtubeplayer');
	if(youtubeEl.length > 0) {
		for (var yt = 0; yt < youtubeEl.length; yt++) {
			YTPlayer(youtubeEl[yt]);
		}
	}

	var videoEl = document.querySelectorAll('.js-video');
	if(videoEl.length > 0) {
		for (var v = 0; v < videoEl.length; v++) {
			Video(videoEl[v]);
		}
	}

	var toggleEl = document.querySelectorAll('.js-toggle');
	if(toggleEl.length > 0) {
		for (var at = 0; at < toggleEl.length; at++) {
			Toggle(toggleEl[at]);
		}
	}

	var rteContent = document.querySelector('.js-rte-content');
	if(rteContent) {
		var embedEl = rteContent.querySelectorAll('iframe, embed');

		for (var ew = 0; ew < embedEl.length; ew++) {
			EmbedWrap(embedEl[ew])
		}
	}

	document.removeEventListener('DOMContentLoaded', init, false);
};

// function asideToggle(target) {
// 	var parent = target.closest('.item');
//
// 	function onClickToggle(){
// 		parent.classList.toggle('is-open');
// 	}
//
// 	target.addEventListener('click', onClickToggle);
// }

document.addEventListener('DOMContentLoaded', init, {once: true});
