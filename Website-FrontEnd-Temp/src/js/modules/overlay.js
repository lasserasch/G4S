'use stirct';

var EventsService = require('../services/events.service');
var Events = require('../config').events;

module.exports = function() {
	var events = {};

	EventsService.addListener(Events.menuOpen, menuListener);
	EventsService.addListener(Events.langOpen, langListener);


	function menuListener(e){
		events[Events.menuOpen] = e;
		checkOverlay();
	}

	function langListener(e){
		events[Events.langOpen] = e;
		checkOverlay();
	}

	function checkOverlay(){
		var show = Object.keys(events).some(function(key){ return events[key] === true; });
		//console.log('show: ', events, show);

		if(show){
			showOverlay();
		}
		else{
			hideOverlay();
		}
	}


	function showOverlay(){
		document.body.classList.add('show-overlay');
	}

	function hideOverlay(){
		document.body.classList.remove('show-overlay');
	}
};
