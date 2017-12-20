module.exports = {
	mediaQueries : {
		sm: window.matchMedia('(min-width: 400px)'),
		md: window.matchMedia('(min-width: 680px)'),
		lg: window.matchMedia('(min-width: 960px)'),
		xl: window.matchMedia('(min-width: 1200px)')
	},
	events: {
		menuOpen: 'MENU OPEN',
		langOpen: 'LANG OPEN'
	}
};
