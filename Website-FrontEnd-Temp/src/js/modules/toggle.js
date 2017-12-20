'use stirct';

module.exports = function(target) {
	var parent = target.closest('.item');

	function onClickToggle(){
		parent.classList.toggle('is-open');
	}

	target.addEventListener('click', onClickToggle);
};
