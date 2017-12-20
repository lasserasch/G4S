'use stirct';

var randomChars = 'abcdefghijklmnopqrstuvwxyz';

module.exports = function(length) {
	var rn;
	var rnd = 'js-';
	var len = length || 8;

	for (var charIndex = 1; charIndex <= len; charIndex++) {
		rnd += randomChars.substring(rn = Math.floor(Math.random() * randomChars.length), rn + 1);
	}

	return rnd;
};
