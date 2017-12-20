'use stirct';

var ClassName = require('../helpers/classNames');
var inView = require('in-view');

module.exports = function(target) {

	var player;
	var className = ClassName();

	target.classList.add(className);

	function onCanPlay () {
		player.removeEventListener('canplay', onCanPlay);
		player.play();
		target.classList.add('is-playing');
		target.classList.remove('is-loading');
	}

	function inViewEnter () {
		if(!player) {
			target.classList.add('is-loading');
			player = document.createElement('video');

			player.classList.add('video-player');
			player.setAttribute('playsinline', true);
			player.setAttribute('muted', true);
			player.setAttribute('autoplay', true);
			player.setAttribute('loop', true);
			player.setAttribute('src', target.dataset.videoUrl);
			target.appendChild(player);

			player.addEventListener('canplay', onCanPlay);
		} else {
			onCanPlay();
		}



	}

	function inViewExit () {
		if(player) {
			player.pause();
		}
	}

	inView('.' + className).on('enter', inViewEnter).on('exit', inViewExit);

};
