'use stirct';

var ClassName = require('../helpers/classNames');
var YTPlayer = require('yt-player');
var inView = require('in-view');

module.exports = function(target) {

	var VideoOpts = {
		fullscreen: false,
		modestBranding: true,
		related: false,
		info: false
	};

	// Elements
	var playButton = target.querySelector('.js-play-button');
	var className = ClassName();

	function initYoutube(){

		target.classList.add('is-loading');
		target.classList.add(className);

		playButton.removeEventListener('click', initYoutube);
		playButton.disabled = true;

		if(!playerEl) {
			var playerEl = document.createElement('div');
			playerEl.classList.add('video-player');
			target.appendChild(playerEl);
		}

		if(!player) {
			var player = new YTPlayer(playerEl, VideoOpts);
			player.load(target.dataset.videoId);
		}


		player.play();


		player.on('playing', function(){
			target.classList.add('is-playing');
			target.classList.remove('is-loading');
		});

		player.on('ended', function(){
			target.classList.remove(target.dataset.videoId);

			target.classList.remove('is-playing');
			playButton.addEventListener('click', initYoutube);
			playButton.disabled = false;
		});

		inView('.' + className).on('exit', function(){
			player.pause();
		});
	}

	playButton.addEventListener('click', initYoutube);
};
