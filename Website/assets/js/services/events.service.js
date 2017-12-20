/**
 * Created by Dideriksen on 12/12/2017.
 */

var listeners = {
};

module.exports = {
	addListener: addListener,
	removeListener: removeListener,
	emit: emit
};

function removeListener(key, listener) {
	if(listeners[key] && listeners[key].length !== 0) {
		var index = listeners[key].findIndex(function (each) {
			return each === listener;
		});

		listeners[key].splice(index, 1);
	}
}

function addListener(key, listener){
	if(listeners[key]) {
		listeners[key].push(listener);
	} else {
		listeners[key] = [listener];
	}
}

function emit(key, eventData) {
	if(listeners[key] && listeners[key].length !== 0){
		listeners[key].forEach(function(listener){
			listener(eventData);
		});
	}
}

