'use stirct';

/* global Modernizr */
var MediaQueries = require('../config').mediaQueries;
var Events = require('../config').events;
var mq = MediaQueries.sm;
var eventsService = require('../services/events.service');

module.exports = function(target) {

	var btnMenu = target.querySelector('.js-btn-menu');

	var menuOpen = false;
	var listenersAdded = false;

	if(Modernizr.matchmedia) {
		if(!mq.matches) {
			addListeners();
		}

		mq.addListener(function(e) {
			if(e.matches) {
				removeListeners();
			} else {
				addListeners();
			}
		});
	}


	function addListeners(){
		if(!listenersAdded){
			btnMenu.addEventListener('click', toggleMenu);

			eventsService.addListener(Events.langOpen, langEventListener);
			listenersAdded = true;
		}
	}

	function removeListeners(){
		btnMenu.removeEventListener('click', toggleMenu);

		eventsService.removeListener(Events.langOpen, langEventListener);
		listenersAdded = false;
	}

	function toggleMenu(){
		if(menuOpen){
			closeMenu();

		}else{
			openMenu();
		}
		return false;
	}

	function closeMenu(){
		document.body.classList.remove('show-menu-nav');
		menuOpen = false;
		eventsService.emit(Events.menuOpen, false);
	}

	function openMenu(){
		document.body.classList.add('show-menu-nav');
		menuOpen = true;
		eventsService.emit(Events.menuOpen, true);
	}


	function langEventListener(langOpen){
		if(langOpen && menuOpen){
			closeMenu();
		}
	}
};
