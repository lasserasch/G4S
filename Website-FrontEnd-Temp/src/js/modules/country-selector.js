'use stirct';

/* global Modernizr */
var MediaQueries = require('../config').mediaQueries;
var Events = require('../config').events;

var mq = MediaQueries.sm;
var eventsService = require('../services/events.service');


module.exports = function(target) {
	var openers = Array.prototype.slice.call( document.getElementsByClassName('js-btn-lang'));
	var tabs = Array.prototype.slice.call( target.getElementsByClassName('js-btn-opener') );

	var langOpen = false;
	var listenersAdded = false;
	var activeTab;


	function addListeners(){
		if(!listenersAdded){

			openers.forEach(function(btn){
				btn.addEventListener('click', toggleLang);
			});

			tabs.forEach(function(btn){
				btn.addEventListener('click', activateTab);
			});

			eventsService.addListener(Events.menuOpen, menuEventListener);
			listenersAdded = true;
		}
	}

	function toggleLang(){
		if(langOpen){
			closeMenu();
		}else{
			openMenu();
		}
		return false;
	}

	function openMenu(){
		document.body.classList.add('show-menu-lang');
		target.classList.add('active');
		langOpen = true;
		eventsService.emit(Events.langOpen, true);
	}

	function closeMenu(){
		document.body.classList.remove('show-menu-lang');
		target.classList.remove('active');
		langOpen = false;
		eventsService.emit(Events.langOpen, false);
	}

	function menuEventListener(menuOpen){
		if(menuOpen && langOpen){
			closeMenu();
		}
	}


	function activateTab(event){
		var btn = event.currentTarget;
		var tab = btn.parentElement;

		if(!tab.classList.contains('active')){

			if(activeTab){
				activeTab.classList.remove('active');
			}
			tab.classList.add('active');
			activeTab = tab;

		}else if(tab.classList.contains('active') && Modernizr.matchmedia && !mq.matches){
			activeTab.classList.remove('active');
			activeTab = null;
		}
		return false;
	}


	function setActiveTab() {
		var firstTab = tabs[0].parentElement;
		firstTab.classList.add('active');
		activeTab = firstTab;
	}

	function removeActiveTab(){
		if(activeTab){
			activeTab.classList.remove('active');
		}
		activeTab = null;
	}

	if(Modernizr.matchmedia) {
		if(mq.matches) {
			setActiveTab();
		}

		mq.addListener(function(e) {
			if(e.matches) {
				setActiveTab();
			}else{
				removeActiveTab();
			}
		});
	}

	addListeners();

};
