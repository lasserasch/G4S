'use stirct';

/* global Modernizr */
var Headroom = require('headroom.js');
var MediaQueries = require('../config').mediaQueries;

var mq = MediaQueries.sm;

module.exports = function(target) {

	var hrOptions = {};
	var options = {
		instance: new Headroom(target, hrOptions)
	};

	if(Modernizr.matchmedia) {
		if(mq.matches) {
			options.instance.init();
		}

		mq.addListener(function(e) {
			if(!options.instance) {
				options.instance = new Headroom(target, hrOptions);
			}

			if(e.matches) {
				options.instance.init();
			} else {
				options.instance.destroy();
				options.instance = null;
			}
		});
	}
};
