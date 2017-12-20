'use stirct';

module.exports = function(target) {
	var wrapper = document.createElement('div');
	wrapper.classList.add('embed-responsive');

	target.parentNode.insertBefore(wrapper, target);
	wrapper.appendChild(target);
};
