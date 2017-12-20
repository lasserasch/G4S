(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/node_modules/events/events.js":[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/node_modules/headroom.js/dist/headroom.js":[function(require,module,exports){
/*!
 * headroom.js v0.9.4 - Give your page some headroom. Hide your header until you need it
 * Copyright (c) 2017 Nick Williams - http://wicky.nillia.ms/headroom.js
 * License: MIT
 */

(function(root, factory) {
  'use strict';

  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  }
  else if (typeof exports === 'object') {
    // COMMONJS
    module.exports = factory();
  }
  else {
    // BROWSER
    root.Headroom = factory();
  }
}(this, function() {
  'use strict';

  /* exported features */
  
  var features = {
    bind : !!(function(){}.bind),
    classList : 'classList' in document.documentElement,
    rAF : !!(window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame)
  };
  window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
  
  /**
   * Handles debouncing of events via requestAnimationFrame
   * @see http://www.html5rocks.com/en/tutorials/speed/animations/
   * @param {Function} callback The callback to handle whichever event
   */
  function Debouncer (callback) {
    this.callback = callback;
    this.ticking = false;
  }
  Debouncer.prototype = {
    constructor : Debouncer,
  
    /**
     * dispatches the event to the supplied callback
     * @private
     */
    update : function() {
      this.callback && this.callback();
      this.ticking = false;
    },
  
    /**
     * ensures events don't get stacked
     * @private
     */
    requestTick : function() {
      if(!this.ticking) {
        requestAnimationFrame(this.rafCallback || (this.rafCallback = this.update.bind(this)));
        this.ticking = true;
      }
    },
  
    /**
     * Attach this as the event listeners
     */
    handleEvent : function() {
      this.requestTick();
    }
  };
  /**
   * Check if object is part of the DOM
   * @constructor
   * @param {Object} obj element to check
   */
  function isDOMElement(obj) {
    return obj && typeof window !== 'undefined' && (obj === window || obj.nodeType);
  }
  
  /**
   * Helper function for extending objects
   */
  function extend (object /*, objectN ... */) {
    if(arguments.length <= 0) {
      throw new Error('Missing arguments in extend function');
    }
  
    var result = object || {},
        key,
        i;
  
    for (i = 1; i < arguments.length; i++) {
      var replacement = arguments[i] || {};
  
      for (key in replacement) {
        // Recurse into object except if the object is a DOM element
        if(typeof result[key] === 'object' && ! isDOMElement(result[key])) {
          result[key] = extend(result[key], replacement[key]);
        }
        else {
          result[key] = result[key] || replacement[key];
        }
      }
    }
  
    return result;
  }
  
  /**
   * Helper function for normalizing tolerance option to object format
   */
  function normalizeTolerance (t) {
    return t === Object(t) ? t : { down : t, up : t };
  }
  
  /**
   * UI enhancement for fixed headers.
   * Hides header when scrolling down
   * Shows header when scrolling up
   * @constructor
   * @param {DOMElement} elem the header element
   * @param {Object} options options for the widget
   */
  function Headroom (elem, options) {
    options = extend(options, Headroom.options);
  
    this.lastKnownScrollY = 0;
    this.elem             = elem;
    this.tolerance        = normalizeTolerance(options.tolerance);
    this.classes          = options.classes;
    this.offset           = options.offset;
    this.scroller         = options.scroller;
    this.initialised      = false;
    this.onPin            = options.onPin;
    this.onUnpin          = options.onUnpin;
    this.onTop            = options.onTop;
    this.onNotTop         = options.onNotTop;
    this.onBottom         = options.onBottom;
    this.onNotBottom      = options.onNotBottom;
  }
  Headroom.prototype = {
    constructor : Headroom,
  
    /**
     * Initialises the widget
     */
    init : function() {
      if(!Headroom.cutsTheMustard) {
        return;
      }
  
      this.debouncer = new Debouncer(this.update.bind(this));
      this.elem.classList.add(this.classes.initial);
  
      // defer event registration to handle browser
      // potentially restoring previous scroll position
      setTimeout(this.attachEvent.bind(this), 100);
  
      return this;
    },
  
    /**
     * Unattaches events and removes any classes that were added
     */
    destroy : function() {
      var classes = this.classes;
  
      this.initialised = false;
  
      for (var key in classes) {
        if(classes.hasOwnProperty(key)) {
          this.elem.classList.remove(classes[key]);
        }
      }
  
      this.scroller.removeEventListener('scroll', this.debouncer, false);
    },
  
    /**
     * Attaches the scroll event
     * @private
     */
    attachEvent : function() {
      if(!this.initialised){
        this.lastKnownScrollY = this.getScrollY();
        this.initialised = true;
        this.scroller.addEventListener('scroll', this.debouncer, false);
  
        this.debouncer.handleEvent();
      }
    },
  
    /**
     * Unpins the header if it's currently pinned
     */
    unpin : function() {
      var classList = this.elem.classList,
        classes = this.classes;
  
      if(classList.contains(classes.pinned) || !classList.contains(classes.unpinned)) {
        classList.add(classes.unpinned);
        classList.remove(classes.pinned);
        this.onUnpin && this.onUnpin.call(this);
      }
    },
  
    /**
     * Pins the header if it's currently unpinned
     */
    pin : function() {
      var classList = this.elem.classList,
        classes = this.classes;
  
      if(classList.contains(classes.unpinned)) {
        classList.remove(classes.unpinned);
        classList.add(classes.pinned);
        this.onPin && this.onPin.call(this);
      }
    },
  
    /**
     * Handles the top states
     */
    top : function() {
      var classList = this.elem.classList,
        classes = this.classes;
  
      if(!classList.contains(classes.top)) {
        classList.add(classes.top);
        classList.remove(classes.notTop);
        this.onTop && this.onTop.call(this);
      }
    },
  
    /**
     * Handles the not top state
     */
    notTop : function() {
      var classList = this.elem.classList,
        classes = this.classes;
  
      if(!classList.contains(classes.notTop)) {
        classList.add(classes.notTop);
        classList.remove(classes.top);
        this.onNotTop && this.onNotTop.call(this);
      }
    },
  
    bottom : function() {
      var classList = this.elem.classList,
        classes = this.classes;
  
      if(!classList.contains(classes.bottom)) {
        classList.add(classes.bottom);
        classList.remove(classes.notBottom);
        this.onBottom && this.onBottom.call(this);
      }
    },
  
    /**
     * Handles the not top state
     */
    notBottom : function() {
      var classList = this.elem.classList,
        classes = this.classes;
  
      if(!classList.contains(classes.notBottom)) {
        classList.add(classes.notBottom);
        classList.remove(classes.bottom);
        this.onNotBottom && this.onNotBottom.call(this);
      }
    },
  
    /**
     * Gets the Y scroll position
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Window.scrollY
     * @return {Number} pixels the page has scrolled along the Y-axis
     */
    getScrollY : function() {
      return (this.scroller.pageYOffset !== undefined)
        ? this.scroller.pageYOffset
        : (this.scroller.scrollTop !== undefined)
          ? this.scroller.scrollTop
          : (document.documentElement || document.body.parentNode || document.body).scrollTop;
    },
  
    /**
     * Gets the height of the viewport
     * @see http://andylangton.co.uk/blog/development/get-viewport-size-width-and-height-javascript
     * @return {int} the height of the viewport in pixels
     */
    getViewportHeight : function () {
      return window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight;
    },
  
    /**
     * Gets the physical height of the DOM element
     * @param  {Object}  elm the element to calculate the physical height of which
     * @return {int}     the physical height of the element in pixels
     */
    getElementPhysicalHeight : function (elm) {
      return Math.max(
        elm.offsetHeight,
        elm.clientHeight
      );
    },
  
    /**
     * Gets the physical height of the scroller element
     * @return {int} the physical height of the scroller element in pixels
     */
    getScrollerPhysicalHeight : function () {
      return (this.scroller === window || this.scroller === document.body)
        ? this.getViewportHeight()
        : this.getElementPhysicalHeight(this.scroller);
    },
  
    /**
     * Gets the height of the document
     * @see http://james.padolsey.com/javascript/get-document-height-cross-browser/
     * @return {int} the height of the document in pixels
     */
    getDocumentHeight : function () {
      var body = document.body,
        documentElement = document.documentElement;
  
      return Math.max(
        body.scrollHeight, documentElement.scrollHeight,
        body.offsetHeight, documentElement.offsetHeight,
        body.clientHeight, documentElement.clientHeight
      );
    },
  
    /**
     * Gets the height of the DOM element
     * @param  {Object}  elm the element to calculate the height of which
     * @return {int}     the height of the element in pixels
     */
    getElementHeight : function (elm) {
      return Math.max(
        elm.scrollHeight,
        elm.offsetHeight,
        elm.clientHeight
      );
    },
  
    /**
     * Gets the height of the scroller element
     * @return {int} the height of the scroller element in pixels
     */
    getScrollerHeight : function () {
      return (this.scroller === window || this.scroller === document.body)
        ? this.getDocumentHeight()
        : this.getElementHeight(this.scroller);
    },
  
    /**
     * determines if the scroll position is outside of document boundaries
     * @param  {int}  currentScrollY the current y scroll position
     * @return {bool} true if out of bounds, false otherwise
     */
    isOutOfBounds : function (currentScrollY) {
      var pastTop  = currentScrollY < 0,
        pastBottom = currentScrollY + this.getScrollerPhysicalHeight() > this.getScrollerHeight();
  
      return pastTop || pastBottom;
    },
  
    /**
     * determines if the tolerance has been exceeded
     * @param  {int} currentScrollY the current scroll y position
     * @return {bool} true if tolerance exceeded, false otherwise
     */
    toleranceExceeded : function (currentScrollY, direction) {
      return Math.abs(currentScrollY-this.lastKnownScrollY) >= this.tolerance[direction];
    },
  
    /**
     * determine if it is appropriate to unpin
     * @param  {int} currentScrollY the current y scroll position
     * @param  {bool} toleranceExceeded has the tolerance been exceeded?
     * @return {bool} true if should unpin, false otherwise
     */
    shouldUnpin : function (currentScrollY, toleranceExceeded) {
      var scrollingDown = currentScrollY > this.lastKnownScrollY,
        pastOffset = currentScrollY >= this.offset;
  
      return scrollingDown && pastOffset && toleranceExceeded;
    },
  
    /**
     * determine if it is appropriate to pin
     * @param  {int} currentScrollY the current y scroll position
     * @param  {bool} toleranceExceeded has the tolerance been exceeded?
     * @return {bool} true if should pin, false otherwise
     */
    shouldPin : function (currentScrollY, toleranceExceeded) {
      var scrollingUp  = currentScrollY < this.lastKnownScrollY,
        pastOffset = currentScrollY <= this.offset;
  
      return (scrollingUp && toleranceExceeded) || pastOffset;
    },
  
    /**
     * Handles updating the state of the widget
     */
    update : function() {
      var currentScrollY  = this.getScrollY(),
        scrollDirection = currentScrollY > this.lastKnownScrollY ? 'down' : 'up',
        toleranceExceeded = this.toleranceExceeded(currentScrollY, scrollDirection);
  
      if(this.isOutOfBounds(currentScrollY)) { // Ignore bouncy scrolling in OSX
        return;
      }
  
      if (currentScrollY <= this.offset ) {
        this.top();
      } else {
        this.notTop();
      }
  
      if(currentScrollY + this.getViewportHeight() >= this.getScrollerHeight()) {
        this.bottom();
      }
      else {
        this.notBottom();
      }
  
      if(this.shouldUnpin(currentScrollY, toleranceExceeded)) {
        this.unpin();
      }
      else if(this.shouldPin(currentScrollY, toleranceExceeded)) {
        this.pin();
      }
  
      this.lastKnownScrollY = currentScrollY;
    }
  };
  /**
   * Default options
   * @type {Object}
   */
  Headroom.options = {
    tolerance : {
      up : 0,
      down : 0
    },
    offset : 0,
    scroller: window,
    classes : {
      pinned : 'headroom--pinned',
      unpinned : 'headroom--unpinned',
      top : 'headroom--top',
      notTop : 'headroom--not-top',
      bottom : 'headroom--bottom',
      notBottom : 'headroom--not-bottom',
      initial : 'headroom'
    }
  };
  Headroom.cutsTheMustard = typeof features !== 'undefined' && features.rAF && features.bind && features.classList;

  return Headroom;
}));
},{}],"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/node_modules/in-view/dist/in-view.min.js":[function(require,module,exports){
/*!
 * in-view 0.6.1 - Get notified when a DOM element enters or exits the viewport.
 * Copyright (c) 2016 Cam Wiegert <cam@camwiegert.com> - https://camwiegert.github.io/in-view
 * License: MIT
 */
!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.inView=e():t.inView=e()}(this,function(){return function(t){function e(r){if(n[r])return n[r].exports;var i=n[r]={exports:{},id:r,loaded:!1};return t[r].call(i.exports,i,i.exports,e),i.loaded=!0,i.exports}var n={};return e.m=t,e.c=n,e.p="",e(0)}([function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{"default":t}}var i=n(2),o=r(i);t.exports=o["default"]},function(t,e){function n(t){var e=typeof t;return null!=t&&("object"==e||"function"==e)}t.exports=n},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var i=n(9),o=r(i),u=n(3),f=r(u),s=n(4),c=function(){if("undefined"!=typeof window){var t=100,e=["scroll","resize","load"],n={history:[]},r={offset:{},threshold:0,test:s.inViewport},i=(0,o["default"])(function(){n.history.forEach(function(t){n[t].check()})},t);e.forEach(function(t){return addEventListener(t,i)}),window.MutationObserver&&addEventListener("DOMContentLoaded",function(){new MutationObserver(i).observe(document.body,{attributes:!0,childList:!0,subtree:!0})});var u=function(t){if("string"==typeof t){var e=[].slice.call(document.querySelectorAll(t));return n.history.indexOf(t)>-1?n[t].elements=e:(n[t]=(0,f["default"])(e,r),n.history.push(t)),n[t]}};return u.offset=function(t){if(void 0===t)return r.offset;var e=function(t){return"number"==typeof t};return["top","right","bottom","left"].forEach(e(t)?function(e){return r.offset[e]=t}:function(n){return e(t[n])?r.offset[n]=t[n]:null}),r.offset},u.threshold=function(t){return"number"==typeof t&&t>=0&&t<=1?r.threshold=t:r.threshold},u.test=function(t){return"function"==typeof t?r.test=t:r.test},u.is=function(t){return r.test(t,r)},u.offset(0),u}};e["default"]=c()},function(t,e){"use strict";function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(e,"__esModule",{value:!0});var r=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),i=function(){function t(e,r){n(this,t),this.options=r,this.elements=e,this.current=[],this.handlers={enter:[],exit:[]},this.singles={enter:[],exit:[]}}return r(t,[{key:"check",value:function(){var t=this;return this.elements.forEach(function(e){var n=t.options.test(e,t.options),r=t.current.indexOf(e),i=r>-1,o=n&&!i,u=!n&&i;o&&(t.current.push(e),t.emit("enter",e)),u&&(t.current.splice(r,1),t.emit("exit",e))}),this}},{key:"on",value:function(t,e){return this.handlers[t].push(e),this}},{key:"once",value:function(t,e){return this.singles[t].unshift(e),this}},{key:"emit",value:function(t,e){for(;this.singles[t].length;)this.singles[t].pop()(e);for(var n=this.handlers[t].length;--n>-1;)this.handlers[t][n](e);return this}}]),t}();e["default"]=function(t,e){return new i(t,e)}},function(t,e){"use strict";function n(t,e){var n=t.getBoundingClientRect(),r=n.top,i=n.right,o=n.bottom,u=n.left,f=n.width,s=n.height,c={t:o,r:window.innerWidth-u,b:window.innerHeight-r,l:i},a={x:e.threshold*f,y:e.threshold*s};return c.t>e.offset.top+a.y&&c.r>e.offset.right+a.x&&c.b>e.offset.bottom+a.y&&c.l>e.offset.left+a.x}Object.defineProperty(e,"__esModule",{value:!0}),e.inViewport=n},function(t,e){(function(e){var n="object"==typeof e&&e&&e.Object===Object&&e;t.exports=n}).call(e,function(){return this}())},function(t,e,n){var r=n(5),i="object"==typeof self&&self&&self.Object===Object&&self,o=r||i||Function("return this")();t.exports=o},function(t,e,n){function r(t,e,n){function r(e){var n=x,r=m;return x=m=void 0,E=e,w=t.apply(r,n)}function a(t){return E=t,j=setTimeout(h,e),M?r(t):w}function l(t){var n=t-O,r=t-E,i=e-n;return _?c(i,g-r):i}function d(t){var n=t-O,r=t-E;return void 0===O||n>=e||n<0||_&&r>=g}function h(){var t=o();return d(t)?p(t):void(j=setTimeout(h,l(t)))}function p(t){return j=void 0,T&&x?r(t):(x=m=void 0,w)}function v(){void 0!==j&&clearTimeout(j),E=0,x=O=m=j=void 0}function y(){return void 0===j?w:p(o())}function b(){var t=o(),n=d(t);if(x=arguments,m=this,O=t,n){if(void 0===j)return a(O);if(_)return j=setTimeout(h,e),r(O)}return void 0===j&&(j=setTimeout(h,e)),w}var x,m,g,w,j,O,E=0,M=!1,_=!1,T=!0;if("function"!=typeof t)throw new TypeError(f);return e=u(e)||0,i(n)&&(M=!!n.leading,_="maxWait"in n,g=_?s(u(n.maxWait)||0,e):g,T="trailing"in n?!!n.trailing:T),b.cancel=v,b.flush=y,b}var i=n(1),o=n(8),u=n(10),f="Expected a function",s=Math.max,c=Math.min;t.exports=r},function(t,e,n){var r=n(6),i=function(){return r.Date.now()};t.exports=i},function(t,e,n){function r(t,e,n){var r=!0,f=!0;if("function"!=typeof t)throw new TypeError(u);return o(n)&&(r="leading"in n?!!n.leading:r,f="trailing"in n?!!n.trailing:f),i(t,e,{leading:r,maxWait:e,trailing:f})}var i=n(7),o=n(1),u="Expected a function";t.exports=r},function(t,e){function n(t){return t}t.exports=n}])});
},{}],"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/node_modules/load-script2/index.js":[function(require,module,exports){
module.exports = load

function load (src, cb) {
  var head = document.head || document.getElementsByTagName('head')[0]
  var script = document.createElement('script')

  script.type = 'text/javascript'
  script.async = true
  script.src = src

  if (cb) {
    script.onload = function () {
      script.onerror = script.onload = null
      cb(null, script)
    }
    script.onerror = function () {
      script.onerror = script.onload = null
      cb(new Error('Failed to load ' + src), script)
    }
  }

  head.appendChild(script)
}

},{}],"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/node_modules/swiper/dist/js/swiper.js":[function(require,module,exports){
/**
 * Swiper 4.0.7
 * Most modern mobile touch slider and framework with hardware accelerated transitions
 * http://www.idangero.us/swiper/
 *
 * Copyright 2014-2017 Vladimir Kharlampidi
 *
 * Released under the MIT License
 *
 * Released on: November 28, 2017
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Swiper = factory());
}(this, (function () { 'use strict';

var w;
if (typeof window === 'undefined') {
  w = {
    navigator: {
      userAgent: '',
    },
    location: {},
    history: {},
    addEventListener: function addEventListener() {},
    removeEventListener: function removeEventListener() {},
    getComputedStyle: function getComputedStyle() {
      return {};
    },
    Image: function Image() {},
    Date: function Date() {},
    screen: {},
  };
} else {
  w = window;
}

var win = w;

/**
 * Dom7 2.0.1
 * Minimalistic JavaScript library for DOM manipulation, with a jQuery-compatible API
 * http://framework7.io/docs/dom.html
 *
 * Copyright 2017, Vladimir Kharlampidi
 * The iDangero.us
 * http://www.idangero.us/
 *
 * Licensed under MIT
 *
 * Released on: October 2, 2017
 */
var Dom7 = function Dom7(arr) {
  var self = this;
  // Create array-like object
  for (var i = 0; i < arr.length; i += 1) {
    self[i] = arr[i];
  }
  self.length = arr.length;
  // Return collection with methods
  return this;
};

function $$1(selector, context) {
  var arr = [];
  var i = 0;
  if (selector && !context) {
    if (selector instanceof Dom7) {
      return selector;
    }
  }
  if (selector) {
      // String
    if (typeof selector === 'string') {
      var els;
      var tempParent;
      var html = selector.trim();
      if (html.indexOf('<') >= 0 && html.indexOf('>') >= 0) {
        var toCreate = 'div';
        if (html.indexOf('<li') === 0) { toCreate = 'ul'; }
        if (html.indexOf('<tr') === 0) { toCreate = 'tbody'; }
        if (html.indexOf('<td') === 0 || html.indexOf('<th') === 0) { toCreate = 'tr'; }
        if (html.indexOf('<tbody') === 0) { toCreate = 'table'; }
        if (html.indexOf('<option') === 0) { toCreate = 'select'; }
        tempParent = document.createElement(toCreate);
        tempParent.innerHTML = html;
        for (i = 0; i < tempParent.childNodes.length; i += 1) {
          arr.push(tempParent.childNodes[i]);
        }
      } else {
        if (!context && selector[0] === '#' && !selector.match(/[ .<>:~]/)) {
          // Pure ID selector
          els = [document.getElementById(selector.trim().split('#')[1])];
        } else {
          // Other selectors
          els = (context || document).querySelectorAll(selector.trim());
        }
        for (i = 0; i < els.length; i += 1) {
          if (els[i]) { arr.push(els[i]); }
        }
      }
    } else if (selector.nodeType || selector === window || selector === document) {
      // Node/element
      arr.push(selector);
    } else if (selector.length > 0 && selector[0].nodeType) {
      // Array of elements or instance of Dom
      for (i = 0; i < selector.length; i += 1) {
        arr.push(selector[i]);
      }
    }
  }
  return new Dom7(arr);
}

$$1.fn = Dom7.prototype;
$$1.Class = Dom7;
$$1.Dom7 = Dom7;

function unique(arr) {
  var uniqueArray = [];
  for (var i = 0; i < arr.length; i += 1) {
    if (uniqueArray.indexOf(arr[i]) === -1) { uniqueArray.push(arr[i]); }
  }
  return uniqueArray;
}
// Classes and attributes
function addClass(className) {
  var this$1 = this;

  if (typeof className === 'undefined') {
    return this;
  }
  var classes = className.split(' ');
  for (var i = 0; i < classes.length; i += 1) {
    for (var j = 0; j < this.length; j += 1) {
      if (typeof this$1[j].classList !== 'undefined') { this$1[j].classList.add(classes[i]); }
    }
  }
  return this;
}
function removeClass(className) {
  var this$1 = this;

  var classes = className.split(' ');
  for (var i = 0; i < classes.length; i += 1) {
    for (var j = 0; j < this.length; j += 1) {
      if (typeof this$1[j].classList !== 'undefined') { this$1[j].classList.remove(classes[i]); }
    }
  }
  return this;
}
function hasClass(className) {
  if (!this[0]) { return false; }
  return this[0].classList.contains(className);
}
function toggleClass(className) {
  var this$1 = this;

  var classes = className.split(' ');
  for (var i = 0; i < classes.length; i += 1) {
    for (var j = 0; j < this.length; j += 1) {
      if (typeof this$1[j].classList !== 'undefined') { this$1[j].classList.toggle(classes[i]); }
    }
  }
  return this;
}
function attr(attrs, value) {
  var arguments$1 = arguments;
  var this$1 = this;

  if (arguments.length === 1 && typeof attrs === 'string') {
    // Get attr
    if (this[0]) { return this[0].getAttribute(attrs); }
    return undefined;
  }

  // Set attrs
  for (var i = 0; i < this.length; i += 1) {
    if (arguments$1.length === 2) {
      // String
      this$1[i].setAttribute(attrs, value);
    } else {
      // Object
      // eslint-disable-next-line
      for (var attrName in attrs) {
        this$1[i][attrName] = attrs[attrName];
        this$1[i].setAttribute(attrName, attrs[attrName]);
      }
    }
  }
  return this;
}
// eslint-disable-next-line
function removeAttr(attr) {
  var this$1 = this;

  for (var i = 0; i < this.length; i += 1) {
    this$1[i].removeAttribute(attr);
  }
  return this;
}
function data(key, value) {
  var this$1 = this;

  var el;
  if (typeof value === 'undefined') {
    el = this[0];
    // Get value
    if (el) {
      if (el.dom7ElementDataStorage && (key in el.dom7ElementDataStorage)) {
        return el.dom7ElementDataStorage[key];
      }

      var dataKey = el.getAttribute(("data-" + key));
      if (dataKey) {
        return dataKey;
      }
      return undefined;
    }
    return undefined;
  }

  // Set value
  for (var i = 0; i < this.length; i += 1) {
    el = this$1[i];
    if (!el.dom7ElementDataStorage) { el.dom7ElementDataStorage = {}; }
    el.dom7ElementDataStorage[key] = value;
  }
  return this;
}
// Transforms
// eslint-disable-next-line
function transform(transform) {
  var this$1 = this;

  for (var i = 0; i < this.length; i += 1) {
    var elStyle = this$1[i].style;
    elStyle.webkitTransform = transform;
    elStyle.transform = transform;
  }
  return this;
}
function transition(duration) {
  var this$1 = this;

  if (typeof duration !== 'string') {
    duration = duration + "ms"; // eslint-disable-line
  }
  for (var i = 0; i < this.length; i += 1) {
    var elStyle = this$1[i].style;
    elStyle.webkitTransitionDuration = duration;
    elStyle.transitionDuration = duration;
  }
  return this;
}
// Events
function on() {
  var this$1 = this;
  var args = [], len = arguments.length;
  while ( len-- ) args[ len ] = arguments[ len ];

  var eventType = args[0];
  var targetSelector = args[1];
  var listener = args[2];
  var capture = args[3];
  if (typeof args[1] === 'function') {
    var assign;
    (assign = args, eventType = assign[0], listener = assign[1], capture = assign[2]);
    targetSelector = undefined;
  }
  if (!capture) { capture = false; }

  function handleLiveEvent(e) {
    var target = e.target;
    if (!target) { return; }
    var eventData = e.target.dom7EventData || [];
    eventData.unshift(e);
    if ($$1(target).is(targetSelector)) { listener.apply(target, eventData); }
    else {
      var parents = $$1(target).parents(); // eslint-disable-line
      for (var k = 0; k < parents.length; k += 1) {
        if ($$1(parents[k]).is(targetSelector)) { listener.apply(parents[k], eventData); }
      }
    }
  }
  function handleEvent(e) {
    var eventData = e && e.target ? e.target.dom7EventData || [] : [];
    eventData.unshift(e);
    listener.apply(this, eventData);
  }
  var events = eventType.split(' ');
  var j;
  for (var i = 0; i < this.length; i += 1) {
    var el = this$1[i];
    if (!targetSelector) {
      for (j = 0; j < events.length; j += 1) {
        if (!el.dom7Listeners) { el.dom7Listeners = []; }
        el.dom7Listeners.push({
          type: eventType,
          listener: listener,
          proxyListener: handleEvent,
        });
        el.addEventListener(events[j], handleEvent, capture);
      }
    } else {
      // Live events
      for (j = 0; j < events.length; j += 1) {
        if (!el.dom7LiveListeners) { el.dom7LiveListeners = []; }
        el.dom7LiveListeners.push({
          type: eventType,
          listener: listener,
          proxyListener: handleLiveEvent,
        });
        el.addEventListener(events[j], handleLiveEvent, capture);
      }
    }
  }
  return this;
}
function off() {
  var this$1 = this;
  var args = [], len = arguments.length;
  while ( len-- ) args[ len ] = arguments[ len ];

  var eventType = args[0];
  var targetSelector = args[1];
  var listener = args[2];
  var capture = args[3];
  if (typeof args[1] === 'function') {
    var assign;
    (assign = args, eventType = assign[0], listener = assign[1], capture = assign[2]);
    targetSelector = undefined;
  }
  if (!capture) { capture = false; }

  var events = eventType.split(' ');
  for (var i = 0; i < events.length; i += 1) {
    for (var j = 0; j < this.length; j += 1) {
      var el = this$1[j];
      if (!targetSelector) {
        if (el.dom7Listeners) {
          for (var k = 0; k < el.dom7Listeners.length; k += 1) {
            if (listener) {
              if (el.dom7Listeners[k].listener === listener) {
                el.removeEventListener(events[i], el.dom7Listeners[k].proxyListener, capture);
              }
            } else if (el.dom7Listeners[k].type === events[i]) {
              el.removeEventListener(events[i], el.dom7Listeners[k].proxyListener, capture);
            }
          }
        }
      } else if (el.dom7LiveListeners) {
        for (var k$1 = 0; k$1 < el.dom7LiveListeners.length; k$1 += 1) {
          if (listener) {
            if (el.dom7LiveListeners[k$1].listener === listener) {
              el.removeEventListener(events[i], el.dom7LiveListeners[k$1].proxyListener, capture);
            }
          } else if (el.dom7LiveListeners[k$1].type === events[i]) {
            el.removeEventListener(events[i], el.dom7LiveListeners[k$1].proxyListener, capture);
          }
        }
      }
    }
  }
  return this;
}
function trigger() {
  var this$1 = this;
  var args = [], len = arguments.length;
  while ( len-- ) args[ len ] = arguments[ len ];

  var events = args[0].split(' ');
  var eventData = args[1];
  for (var i = 0; i < events.length; i += 1) {
    for (var j = 0; j < this.length; j += 1) {
      var evt = (void 0);
      try {
        evt = new window.CustomEvent(events[i], {
          detail: eventData,
          bubbles: true,
          cancelable: true,
        });
      } catch (e) {
        evt = document.createEvent('Event');
        evt.initEvent(events[i], true, true);
        evt.detail = eventData;
      }
      // eslint-disable-next-line
      this$1[j].dom7EventData = args.filter(function (data, dataIndex) { return dataIndex > 0; });
      this$1[j].dispatchEvent(evt);
      this$1[j].dom7EventData = [];
      delete this$1[j].dom7EventData;
    }
  }
  return this;
}
function transitionEnd(callback) {
  var events = ['webkitTransitionEnd', 'transitionend'];
  var dom = this;
  var i;
  function fireCallBack(e) {
    /* jshint validthis:true */
    if (e.target !== this) { return; }
    callback.call(this, e);
    for (i = 0; i < events.length; i += 1) {
      dom.off(events[i], fireCallBack);
    }
  }
  if (callback) {
    for (i = 0; i < events.length; i += 1) {
      dom.on(events[i], fireCallBack);
    }
  }
  return this;
}
function outerWidth(includeMargins) {
  if (this.length > 0) {
    if (includeMargins) {
      // eslint-disable-next-line
      var styles = this.styles();
      return this[0].offsetWidth + parseFloat(styles.getPropertyValue('margin-right')) + parseFloat(styles.getPropertyValue('margin-left'));
    }
    return this[0].offsetWidth;
  }
  return null;
}
function outerHeight(includeMargins) {
  if (this.length > 0) {
    if (includeMargins) {
      // eslint-disable-next-line
      var styles = this.styles();
      return this[0].offsetHeight + parseFloat(styles.getPropertyValue('margin-top')) + parseFloat(styles.getPropertyValue('margin-bottom'));
    }
    return this[0].offsetHeight;
  }
  return null;
}
function offset() {
  if (this.length > 0) {
    var el = this[0];
    var box = el.getBoundingClientRect();
    var body = document.body;
    var clientTop = el.clientTop || body.clientTop || 0;
    var clientLeft = el.clientLeft || body.clientLeft || 0;
    var scrollTop = el === window ? window.scrollY : el.scrollTop;
    var scrollLeft = el === window ? window.scrollX : el.scrollLeft;
    return {
      top: (box.top + scrollTop) - clientTop,
      left: (box.left + scrollLeft) - clientLeft,
    };
  }

  return null;
}
function styles() {
  if (this[0]) { return window.getComputedStyle(this[0], null); }
  return {};
}
function css(props, value) {
  var this$1 = this;

  var i;
  if (arguments.length === 1) {
    if (typeof props === 'string') {
      if (this[0]) { return window.getComputedStyle(this[0], null).getPropertyValue(props); }
    } else {
      for (i = 0; i < this.length; i += 1) {
        // eslint-disable-next-line
        for (var prop in props) {
          this$1[i].style[prop] = props[prop];
        }
      }
      return this;
    }
  }
  if (arguments.length === 2 && typeof props === 'string') {
    for (i = 0; i < this.length; i += 1) {
      this$1[i].style[props] = value;
    }
    return this;
  }
  return this;
}

// Iterate over the collection passing elements to `callback`
function each(callback) {
  var this$1 = this;

  // Don't bother continuing without a callback
  if (!callback) { return this; }
  // Iterate over the current collection
  for (var i = 0; i < this.length; i += 1) {
    // If the callback returns false
    if (callback.call(this$1[i], i, this$1[i]) === false) {
      // End the loop early
      return this$1;
    }
  }
  // Return `this` to allow chained DOM operations
  return this;
}
// eslint-disable-next-line
function html(html) {
  var this$1 = this;

  if (typeof html === 'undefined') {
    return this[0] ? this[0].innerHTML : undefined;
  }

  for (var i = 0; i < this.length; i += 1) {
    this$1[i].innerHTML = html;
  }
  return this;
}
// eslint-disable-next-line
function text(text) {
  var this$1 = this;

  if (typeof text === 'undefined') {
    if (this[0]) {
      return this[0].textContent.trim();
    }
    return null;
  }

  for (var i = 0; i < this.length; i += 1) {
    this$1[i].textContent = text;
  }
  return this;
}
function is(selector) {
  var el = this[0];
  var compareWith;
  var i;
  if (!el || typeof selector === 'undefined') { return false; }
  if (typeof selector === 'string') {
    if (el.matches) { return el.matches(selector); }
    else if (el.webkitMatchesSelector) { return el.webkitMatchesSelector(selector); }
    else if (el.msMatchesSelector) { return el.msMatchesSelector(selector); }

    compareWith = $$1(selector);
    for (i = 0; i < compareWith.length; i += 1) {
      if (compareWith[i] === el) { return true; }
    }
    return false;
  } else if (selector === document) { return el === document; }
  else if (selector === window) { return el === window; }

  if (selector.nodeType || selector instanceof Dom7) {
    compareWith = selector.nodeType ? [selector] : selector;
    for (i = 0; i < compareWith.length; i += 1) {
      if (compareWith[i] === el) { return true; }
    }
    return false;
  }
  return false;
}
function index() {
  var child = this[0];
  var i;
  if (child) {
    i = 0;
    // eslint-disable-next-line
    while ((child = child.previousSibling) !== null) {
      if (child.nodeType === 1) { i += 1; }
    }
    return i;
  }
  return undefined;
}
// eslint-disable-next-line
function eq(index) {
  if (typeof index === 'undefined') { return this; }
  var length = this.length;
  var returnIndex;
  if (index > length - 1) {
    return new Dom7([]);
  }
  if (index < 0) {
    returnIndex = length + index;
    if (returnIndex < 0) { return new Dom7([]); }
    return new Dom7([this[returnIndex]]);
  }
  return new Dom7([this[index]]);
}
function append() {
  var this$1 = this;
  var args = [], len = arguments.length;
  while ( len-- ) args[ len ] = arguments[ len ];

  var newChild;

  for (var k = 0; k < args.length; k += 1) {
    newChild = args[k];
    for (var i = 0; i < this.length; i += 1) {
      if (typeof newChild === 'string') {
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = newChild;
        while (tempDiv.firstChild) {
          this$1[i].appendChild(tempDiv.firstChild);
        }
      } else if (newChild instanceof Dom7) {
        for (var j = 0; j < newChild.length; j += 1) {
          this$1[i].appendChild(newChild[j]);
        }
      } else {
        this$1[i].appendChild(newChild);
      }
    }
  }

  return this;
}
 function prepend(newChild) {
  var this$1 = this;

  var i;
  var j;
  for (i = 0; i < this.length; i += 1) {
    if (typeof newChild === 'string') {
      var tempDiv = document.createElement('div');
      tempDiv.innerHTML = newChild;
      for (j = tempDiv.childNodes.length - 1; j >= 0; j -= 1) {
        this$1[i].insertBefore(tempDiv.childNodes[j], this$1[i].childNodes[0]);
      }
    } else if (newChild instanceof Dom7) {
      for (j = 0; j < newChild.length; j += 1) {
        this$1[i].insertBefore(newChild[j], this$1[i].childNodes[0]);
      }
    } else {
      this$1[i].insertBefore(newChild, this$1[i].childNodes[0]);
    }
  }
  return this;
}
 function next(selector) {
  if (this.length > 0) {
    if (selector) {
      if (this[0].nextElementSibling && $$1(this[0].nextElementSibling).is(selector)) {
        return new Dom7([this[0].nextElementSibling]);
      }
      return new Dom7([]);
    }

    if (this[0].nextElementSibling) { return new Dom7([this[0].nextElementSibling]); }
    return new Dom7([]);
  }
  return new Dom7([]);
}
function nextAll(selector) {
  var nextEls = [];
  var el = this[0];
  if (!el) { return new Dom7([]); }
  while (el.nextElementSibling) {
    var next = el.nextElementSibling; // eslint-disable-line
    if (selector) {
      if ($$1(next).is(selector)) { nextEls.push(next); }
    } else { nextEls.push(next); }
    el = next;
  }
  return new Dom7(nextEls);
}
function prev(selector) {
  if (this.length > 0) {
    var el = this[0];
    if (selector) {
      if (el.previousElementSibling && $$1(el.previousElementSibling).is(selector)) {
        return new Dom7([el.previousElementSibling]);
      }
      return new Dom7([]);
    }

    if (el.previousElementSibling) { return new Dom7([el.previousElementSibling]); }
    return new Dom7([]);
  }
  return new Dom7([]);
}
function prevAll(selector) {
  var prevEls = [];
  var el = this[0];
  if (!el) { return new Dom7([]); }
  while (el.previousElementSibling) {
    var prev = el.previousElementSibling; // eslint-disable-line
    if (selector) {
      if ($$1(prev).is(selector)) { prevEls.push(prev); }
    } else { prevEls.push(prev); }
    el = prev;
  }
  return new Dom7(prevEls);
}
function parent(selector) {
  var this$1 = this;

  var parents = []; // eslint-disable-line
  for (var i = 0; i < this.length; i += 1) {
    if (this$1[i].parentNode !== null) {
      if (selector) {
        if ($$1(this$1[i].parentNode).is(selector)) { parents.push(this$1[i].parentNode); }
      } else {
        parents.push(this$1[i].parentNode);
      }
    }
  }
  return $$1(unique(parents));
}
function parents(selector) {
  var this$1 = this;

  var parents = []; // eslint-disable-line
  for (var i = 0; i < this.length; i += 1) {
    var parent = this$1[i].parentNode; // eslint-disable-line
    while (parent) {
      if (selector) {
        if ($$1(parent).is(selector)) { parents.push(parent); }
      } else {
        parents.push(parent);
      }
      parent = parent.parentNode;
    }
  }
  return $$1(unique(parents));
}
function closest(selector) {
  var closest = this; // eslint-disable-line
  if (typeof selector === 'undefined') {
    return new Dom7([]);
  }
  if (!closest.is(selector)) {
    closest = closest.parents(selector).eq(0);
  }
  return closest;
}
function find(selector) {
  var this$1 = this;

  var foundElements = [];
  for (var i = 0; i < this.length; i += 1) {
    var found = this$1[i].querySelectorAll(selector);
    for (var j = 0; j < found.length; j += 1) {
      foundElements.push(found[j]);
    }
  }
  return new Dom7(foundElements);
}
function children(selector) {
  var this$1 = this;

  var children = []; // eslint-disable-line
  for (var i = 0; i < this.length; i += 1) {
    var childNodes = this$1[i].childNodes;

    for (var j = 0; j < childNodes.length; j += 1) {
      if (!selector) {
        if (childNodes[j].nodeType === 1) { children.push(childNodes[j]); }
      } else if (childNodes[j].nodeType === 1 && $$1(childNodes[j]).is(selector)) {
        children.push(childNodes[j]);
      }
    }
  }
  return new Dom7(unique(children));
}
function remove() {
  var this$1 = this;

  for (var i = 0; i < this.length; i += 1) {
    if (this$1[i].parentNode) { this$1[i].parentNode.removeChild(this$1[i]); }
  }
  return this;
}
function add() {
  var args = [], len = arguments.length;
  while ( len-- ) args[ len ] = arguments[ len ];

  var dom = this;
  var i;
  var j;
  for (i = 0; i < args.length; i += 1) {
    var toAdd = $$1(args[i]);
    for (j = 0; j < toAdd.length; j += 1) {
      dom[dom.length] = toAdd[j];
      dom.length += 1;
    }
  }
  return dom;
}
var noTrigger = ('resize scroll').split(' ');

var Methods = {
  addClass: addClass,
  removeClass: removeClass,
  hasClass: hasClass,
  toggleClass: toggleClass,
  attr: attr,
  removeAttr: removeAttr,
  data: data,
  transform: transform,
  transition: transition,
  on: on,
  off: off,
  trigger: trigger,
  transitionEnd: transitionEnd,
  outerWidth: outerWidth,
  outerHeight: outerHeight,
  offset: offset,
  css: css,
  each: each,
  html: html,
  text: text,
  is: is,
  index: index,
  eq: eq,
  append: append,
  prepend: prepend,
  next: next,
  nextAll: nextAll,
  prev: prev,
  prevAll: prevAll,
  parent: parent,
  parents: parents,
  closest: closest,
  find: find,
  children: children,
  remove: remove,
  add: add,
  styles: styles,
};

Object.keys(Methods).forEach(function (methodName) {
  $$1.fn[methodName] = Methods[methodName];
});

var Utils = {
  deleteProps: function deleteProps(obj) {
    var object = obj;
    Object.keys(object).forEach(function (key) {
      try {
        object[key] = null;
      } catch (e) {
        // no getter for object
      }
      try {
        delete object[key];
      } catch (e) {
        // something got wrong
      }
    });
  },
  nextTick: function nextTick(callback, delay) {
    if ( delay === void 0 ) delay = 0;

    return setTimeout(callback, delay);
  },
  now: function now() {
    return Date.now();
  },
  getTranslate: function getTranslate(el, axis) {
    if ( axis === void 0 ) axis = 'x';

    var matrix;
    var curTransform;
    var transformMatrix;

    var curStyle = win.getComputedStyle(el, null);

    if (win.WebKitCSSMatrix) {
      curTransform = curStyle.transform || curStyle.webkitTransform;
      if (curTransform.split(',').length > 6) {
        curTransform = curTransform.split(', ').map(function (a) { return a.replace(',', '.'); }).join(', ');
      }
      // Some old versions of Webkit choke when 'none' is passed; pass
      // empty string instead in this case
      transformMatrix = new win.WebKitCSSMatrix(curTransform === 'none' ? '' : curTransform);
    } else {
      transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
      matrix = transformMatrix.toString().split(',');
    }

    if (axis === 'x') {
      // Latest Chrome and webkits Fix
      if (win.WebKitCSSMatrix) { curTransform = transformMatrix.m41; }
      // Crazy IE10 Matrix
      else if (matrix.length === 16) { curTransform = parseFloat(matrix[12]); }
      // Normal Browsers
      else { curTransform = parseFloat(matrix[4]); }
    }
    if (axis === 'y') {
      // Latest Chrome and webkits Fix
      if (win.WebKitCSSMatrix) { curTransform = transformMatrix.m42; }
      // Crazy IE10 Matrix
      else if (matrix.length === 16) { curTransform = parseFloat(matrix[13]); }
      // Normal Browsers
      else { curTransform = parseFloat(matrix[5]); }
    }
    return curTransform || 0;
  },
  parseUrlQuery: function parseUrlQuery(url) {
    var query = {};
    var urlToParse = url || win.location.href;
    var i;
    var params;
    var param;
    var length;
    if (typeof urlToParse === 'string' && urlToParse.length) {
      urlToParse = urlToParse.indexOf('?') > -1 ? urlToParse.replace(/\S*\?/, '') : '';
      params = urlToParse.split('&').filter(function (paramsPart) { return paramsPart !== ''; });
      length = params.length;

      for (i = 0; i < length; i += 1) {
        param = params[i].replace(/#\S+/g, '').split('=');
        query[decodeURIComponent(param[0])] = typeof param[1] === 'undefined' ? undefined : decodeURIComponent(param[1]) || '';
      }
    }
    return query;
  },
  isObject: function isObject(o) {
    return typeof o === 'object' && o !== null && o.constructor && o.constructor === Object;
  },
  extend: function extend() {
    var args = [], len$1 = arguments.length;
    while ( len$1-- ) args[ len$1 ] = arguments[ len$1 ];

    var to = Object(args[0]);
    for (var i = 1; i < args.length; i += 1) {
      var nextSource = args[i];
      if (nextSource !== undefined && nextSource !== null) {
        var keysArray = Object.keys(Object(nextSource));
        for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex += 1) {
          var nextKey = keysArray[nextIndex];
          var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
          if (desc !== undefined && desc.enumerable) {
            if (Utils.isObject(to[nextKey]) && Utils.isObject(nextSource[nextKey])) {
              Utils.extend(to[nextKey], nextSource[nextKey]);
            } else if (!Utils.isObject(to[nextKey]) && Utils.isObject(nextSource[nextKey])) {
              to[nextKey] = {};
              Utils.extend(to[nextKey], nextSource[nextKey]);
            } else {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
    }
    return to;
  },
};

var d;
if (typeof document === 'undefined') {
  d = {
    addEventListener: function addEventListener() {},
    removeEventListener: function removeEventListener() {},
    activeElement: {
      blur: function blur() {},
      nodeName: '',
    },
    querySelector: function querySelector() {
      return {};
    },
    querySelectorAll: function querySelectorAll() {
      return [];
    },
    createElement: function createElement() {
      return {
        style: {},
        setAttribute: function setAttribute() {},
        getElementsByTagName: function getElementsByTagName() {
          return [];
        },
      };
    },
    location: { hash: '' },
  };
} else {
  d = document;
}

var doc = d;

var Support = (function Support() {
  return {
    touch: (win.Modernizr && win.Modernizr.touch === true) || (function checkTouch() {
      return !!(('ontouchstart' in win) || (win.DocumentTouch && doc instanceof win.DocumentTouch));
    }()),

    transforms3d: (win.Modernizr && win.Modernizr.csstransforms3d === true) || (function checkTransforms3d() {
      var div = doc.createElement('div').style;
      return ('webkitPerspective' in div || 'MozPerspective' in div || 'OPerspective' in div || 'MsPerspective' in div || 'perspective' in div);
    }()),

    flexbox: (function checkFlexbox() {
      var div = doc.createElement('div').style;
      var styles = ('alignItems webkitAlignItems webkitBoxAlign msFlexAlign mozBoxAlign webkitFlexDirection msFlexDirection mozBoxDirection mozBoxOrient webkitBoxDirection webkitBoxOrient').split(' ');
      for (var i = 0; i < styles.length; i += 1) {
        if (styles[i] in div) { return true; }
      }
      return false;
    }()),

    observer: (function checkObserver() {
      return ('MutationObserver' in win || 'WebkitMutationObserver' in win);
    }()),

    passiveListener: (function checkPassiveListener() {
      var supportsPassive = false;
      try {
        var opts = Object.defineProperty({}, 'passive', {
          get: function get() {
            supportsPassive = true;
          },
        });
        win.addEventListener('testPassiveListener', null, opts);
      } catch (e) {
        // No support
      }
      return supportsPassive;
    }()),

    gestures: (function checkGestures() {
      return 'ongesturestart' in win;
    }()),
  };
}());

var SwiperClass = function SwiperClass(params) {
  if ( params === void 0 ) params = {};

  var self = this;
  self.params = params;

  // Events
  self.eventsListeners = {};

  if (self.params && self.params.on) {
    Object.keys(self.params.on).forEach(function (eventName) {
      self.on(eventName, self.params.on[eventName]);
    });
  }
};

var staticAccessors = { components: {} };
SwiperClass.prototype.on = function on (events, handler) {
  var self = this;
  if (typeof handler !== 'function') { return self; }
  events.split(' ').forEach(function (event) {
    if (!self.eventsListeners[event]) { self.eventsListeners[event] = []; }
    self.eventsListeners[event].push(handler);
  });
  return self;
};
SwiperClass.prototype.once = function once (events, handler) {
  var self = this;
  if (typeof handler !== 'function') { return self; }
  function onceHandler() {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

    handler.apply(self, args);
    self.off(events, onceHandler);
  }
  return self.on(events, onceHandler);
};
SwiperClass.prototype.off = function off (events, handler) {
  var self = this;
  events.split(' ').forEach(function (event) {
    if (typeof handler === 'undefined') {
      self.eventsListeners[event] = [];
    } else {
      self.eventsListeners[event].forEach(function (eventHandler, index) {
        if (eventHandler === handler) {
          self.eventsListeners[event].splice(index, 1);
        }
      });
    }
  });
  return self;
};
SwiperClass.prototype.emit = function emit () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

  var self = this;
  if (!self.eventsListeners) { return self; }
  var events;
  var data;
  var context;
  if (typeof args[0] === 'string' || Array.isArray(args[0])) {
    events = args[0];
    data = args.slice(1, args.length);
    context = self;
  } else {
    events = args[0].events;
    data = args[0].data;
    context = args[0].context || self;
  }
  var eventsArray = Array.isArray(events) ? events : events.split(' ');
  eventsArray.forEach(function (event) {
    if (self.eventsListeners[event]) {
      var handlers = [];
      self.eventsListeners[event].forEach(function (eventHandler) {
        handlers.push(eventHandler);
      });
      handlers.forEach(function (eventHandler) {
        eventHandler.apply(context, data);
      });
    }
  });
  return self;
};
SwiperClass.prototype.useModulesParams = function useModulesParams (instanceParams) {
  var instance = this;
  if (!instance.modules) { return; }
  Object.keys(instance.modules).forEach(function (moduleName) {
    var module = instance.modules[moduleName];
    // Extend params
    if (module.params) {
      Utils.extend(instanceParams, module.params);
    }
  });
};
SwiperClass.prototype.useModules = function useModules (modulesParams) {
    if ( modulesParams === void 0 ) modulesParams = {};

  var instance = this;
  if (!instance.modules) { return; }
  Object.keys(instance.modules).forEach(function (moduleName) {
    var module = instance.modules[moduleName];
    var moduleParams = modulesParams[moduleName] || {};
    // Extend instance methods and props
    if (module.instance) {
      Object.keys(module.instance).forEach(function (modulePropName) {
        var moduleProp = module.instance[modulePropName];
        if (typeof moduleProp === 'function') {
          instance[modulePropName] = moduleProp.bind(instance);
        } else {
          instance[modulePropName] = moduleProp;
        }
      });
    }
    // Add event listeners
    if (module.on && instance.on) {
      Object.keys(module.on).forEach(function (moduleEventName) {
        instance.on(moduleEventName, module.on[moduleEventName]);
      });
    }

    // Module create callback
    if (module.create) {
      module.create.bind(instance)(moduleParams);
    }
  });
};
staticAccessors.components.set = function (components) {
  var Class = this;
  if (!Class.use) { return; }
  Class.use(components);
};
SwiperClass.installModule = function installModule (module) {
    var params = [], len = arguments.length - 1;
    while ( len-- > 0 ) params[ len ] = arguments[ len + 1 ];

  var Class = this;
  if (!Class.prototype.modules) { Class.prototype.modules = {}; }
  var name = module.name || (((Object.keys(Class.prototype.modules).length) + "_" + (Utils.now())));
  Class.prototype.modules[name] = module;
  // Prototype
  if (module.proto) {
    Object.keys(module.proto).forEach(function (key) {
      Class.prototype[key] = module.proto[key];
    });
  }
  // Class
  if (module.static) {
    Object.keys(module.static).forEach(function (key) {
      Class[key] = module.static[key];
    });
  }
  // Callback
  if (module.install) {
    module.install.apply(Class, params);
  }
  return Class;
};
SwiperClass.use = function use (module) {
    var params = [], len = arguments.length - 1;
    while ( len-- > 0 ) params[ len ] = arguments[ len + 1 ];

  var Class = this;
  if (Array.isArray(module)) {
    module.forEach(function (m) { return Class.installModule(m); });
    return Class;
  }
  return Class.installModule.apply(Class, [ module ].concat( params ));
};

Object.defineProperties( SwiperClass, staticAccessors );

var updateSize = function () {
  var swiper = this;
  var width;
  var height;
  var $el = swiper.$el;
  if (typeof swiper.params.width !== 'undefined') {
    width = swiper.params.width;
  } else {
    width = $el[0].clientWidth;
  }
  if (typeof swiper.params.height !== 'undefined') {
    height = swiper.params.height;
  } else {
    height = $el[0].clientHeight;
  }
  if ((width === 0 && swiper.isHorizontal()) || (height === 0 && swiper.isVertical())) {
    return;
  }

  // Subtract paddings
  width = width - parseInt($el.css('padding-left'), 10) - parseInt($el.css('padding-right'), 10);
  height = height - parseInt($el.css('padding-top'), 10) - parseInt($el.css('padding-bottom'), 10);

  Utils.extend(swiper, {
    width: width,
    height: height,
    size: swiper.isHorizontal() ? width : height,
  });
};

var updateSlides = function () {
  var swiper = this;
  var params = swiper.params;

  var $wrapperEl = swiper.$wrapperEl;
  var swiperSize = swiper.size;
  var rtl = swiper.rtl;
  var wrongRTL = swiper.wrongRTL;
  var slides = $wrapperEl.children(("." + (swiper.params.slideClass)));
  var isVirtual = swiper.virtual && params.virtual.enabled;
  var slidesLength = isVirtual ? swiper.virtual.slides.length : slides.length;
  var snapGrid = [];
  var slidesGrid = [];
  var slidesSizesGrid = [];

  var offsetBefore = params.slidesOffsetBefore;
  if (typeof offsetBefore === 'function') {
    offsetBefore = params.slidesOffsetBefore.call(swiper);
  }

  var offsetAfter = params.slidesOffsetAfter;
  if (typeof offsetAfter === 'function') {
    offsetAfter = params.slidesOffsetAfter.call(swiper);
  }

  var previousSlidesLength = slidesLength;
  var previousSnapGridLength = swiper.snapGrid.length;
  var previousSlidesGridLength = swiper.snapGrid.length;

  var spaceBetween = params.spaceBetween;
  var slidePosition = -offsetBefore;
  var prevSlideSize = 0;
  var index = 0;
  if (typeof swiperSize === 'undefined') {
    return;
  }
  if (typeof spaceBetween === 'string' && spaceBetween.indexOf('%') >= 0) {
    spaceBetween = (parseFloat(spaceBetween.replace('%', '')) / 100) * swiperSize;
  }

  swiper.virtualSize = -spaceBetween;

  // reset margins
  if (rtl) { slides.css({ marginLeft: '', marginTop: '' }); }
  else { slides.css({ marginRight: '', marginBottom: '' }); }

  var slidesNumberEvenToRows;
  if (params.slidesPerColumn > 1) {
    if (Math.floor(slidesLength / params.slidesPerColumn) === slidesLength / swiper.params.slidesPerColumn) {
      slidesNumberEvenToRows = slidesLength;
    } else {
      slidesNumberEvenToRows = Math.ceil(slidesLength / params.slidesPerColumn) * params.slidesPerColumn;
    }
    if (params.slidesPerView !== 'auto' && params.slidesPerColumnFill === 'row') {
      slidesNumberEvenToRows = Math.max(slidesNumberEvenToRows, params.slidesPerView * params.slidesPerColumn);
    }
  }

  // Calc slides
  var slideSize;
  var slidesPerColumn = params.slidesPerColumn;
  var slidesPerRow = slidesNumberEvenToRows / slidesPerColumn;
  var numFullColumns = slidesPerRow - ((params.slidesPerColumn * slidesPerRow) - slidesLength);
  for (var i = 0; i < slidesLength; i += 1) {
    slideSize = 0;
    var slide = slides.eq(i);
    if (params.slidesPerColumn > 1) {
      // Set slides order
      var newSlideOrderIndex = (void 0);
      var column = (void 0);
      var row = (void 0);
      if (params.slidesPerColumnFill === 'column') {
        column = Math.floor(i / slidesPerColumn);
        row = i - (column * slidesPerColumn);
        if (column > numFullColumns || (column === numFullColumns && row === slidesPerColumn - 1)) {
          row += 1;
          if (row >= slidesPerColumn) {
            row = 0;
            column += 1;
          }
        }
        newSlideOrderIndex = column + ((row * slidesNumberEvenToRows) / slidesPerColumn);
        slide
          .css({
            '-webkit-box-ordinal-group': newSlideOrderIndex,
            '-moz-box-ordinal-group': newSlideOrderIndex,
            '-ms-flex-order': newSlideOrderIndex,
            '-webkit-order': newSlideOrderIndex,
            order: newSlideOrderIndex,
          });
      } else {
        row = Math.floor(i / slidesPerRow);
        column = i - (row * slidesPerRow);
      }
      slide
        .css(
          ("margin-" + (swiper.isHorizontal() ? 'top' : 'left')),
          (row !== 0 && params.spaceBetween) && (((params.spaceBetween) + "px"))
        )
        .attr('data-swiper-column', column)
        .attr('data-swiper-row', row);
    }
    if (slide.css('display') === 'none') { continue; } // eslint-disable-line
    if (params.slidesPerView === 'auto') {
      slideSize = swiper.isHorizontal() ? slide.outerWidth(true) : slide.outerHeight(true);
      if (params.roundLengths) { slideSize = Math.floor(slideSize); }
    } else {
      slideSize = (swiperSize - ((params.slidesPerView - 1) * spaceBetween)) / params.slidesPerView;
      if (params.roundLengths) { slideSize = Math.floor(slideSize); }

      if (slides[i]) {
        if (swiper.isHorizontal()) {
          slides[i].style.width = slideSize + "px";
        } else {
          slides[i].style.height = slideSize + "px";
        }
      }
    }
    if (slides[i]) {
      slides[i].swiperSlideSize = slideSize;
    }
    slidesSizesGrid.push(slideSize);


    if (params.centeredSlides) {
      slidePosition = slidePosition + (slideSize / 2) + (prevSlideSize / 2) + spaceBetween;
      if (prevSlideSize === 0 && i !== 0) { slidePosition = slidePosition - (swiperSize / 2) - spaceBetween; }
      if (i === 0) { slidePosition = slidePosition - (swiperSize / 2) - spaceBetween; }
      if (Math.abs(slidePosition) < 1 / 1000) { slidePosition = 0; }
      if ((index) % params.slidesPerGroup === 0) { snapGrid.push(slidePosition); }
      slidesGrid.push(slidePosition);
    } else {
      if ((index) % params.slidesPerGroup === 0) { snapGrid.push(slidePosition); }
      slidesGrid.push(slidePosition);
      slidePosition = slidePosition + slideSize + spaceBetween;
    }

    swiper.virtualSize += slideSize + spaceBetween;

    prevSlideSize = slideSize;

    index += 1;
  }
  swiper.virtualSize = Math.max(swiper.virtualSize, swiperSize) + offsetAfter;
  var newSlidesGrid;

  if (
    rtl && wrongRTL && (params.effect === 'slide' || params.effect === 'coverflow')) {
    $wrapperEl.css({ width: ((swiper.virtualSize + params.spaceBetween) + "px") });
  }
  if (!Support.flexbox || params.setWrapperSize) {
    if (swiper.isHorizontal()) { $wrapperEl.css({ width: ((swiper.virtualSize + params.spaceBetween) + "px") }); }
    else { $wrapperEl.css({ height: ((swiper.virtualSize + params.spaceBetween) + "px") }); }
  }

  if (params.slidesPerColumn > 1) {
    swiper.virtualSize = (slideSize + params.spaceBetween) * slidesNumberEvenToRows;
    swiper.virtualSize = Math.ceil(swiper.virtualSize / params.slidesPerColumn) - params.spaceBetween;
    if (swiper.isHorizontal()) { $wrapperEl.css({ width: ((swiper.virtualSize + params.spaceBetween) + "px") }); }
    else { $wrapperEl.css({ height: ((swiper.virtualSize + params.spaceBetween) + "px") }); }
    if (params.centeredSlides) {
      newSlidesGrid = [];
      for (var i$1 = 0; i$1 < snapGrid.length; i$1 += 1) {
        if (snapGrid[i$1] < swiper.virtualSize + snapGrid[0]) { newSlidesGrid.push(snapGrid[i$1]); }
      }
      snapGrid = newSlidesGrid;
    }
  }

  // Remove last grid elements depending on width
  if (!params.centeredSlides) {
    newSlidesGrid = [];
    for (var i$2 = 0; i$2 < snapGrid.length; i$2 += 1) {
      if (snapGrid[i$2] <= swiper.virtualSize - swiperSize) {
        newSlidesGrid.push(snapGrid[i$2]);
      }
    }
    snapGrid = newSlidesGrid;
    if (Math.floor(swiper.virtualSize - swiperSize) - Math.floor(snapGrid[snapGrid.length - 1]) > 1) {
      snapGrid.push(swiper.virtualSize - swiperSize);
    }
  }
  if (snapGrid.length === 0) { snapGrid = [0]; }

  if (params.spaceBetween !== 0) {
    if (swiper.isHorizontal()) {
      if (rtl) { slides.css({ marginLeft: (spaceBetween + "px") }); }
      else { slides.css({ marginRight: (spaceBetween + "px") }); }
    } else { slides.css({ marginBottom: (spaceBetween + "px") }); }
  }

  Utils.extend(swiper, {
    slides: slides,
    snapGrid: snapGrid,
    slidesGrid: slidesGrid,
    slidesSizesGrid: slidesSizesGrid,
  });

  if (slidesLength !== previousSlidesLength) {
    swiper.emit('slidesLengthChange');
  }
  if (snapGrid.length !== previousSnapGridLength) {
    swiper.emit('snapGridLengthChange');
  }
  if (slidesGrid.length !== previousSlidesGridLength) {
    swiper.emit('slidesGridLengthChange');
  }

  if (params.watchSlidesProgress || params.watchSlidesVisibility) {
    swiper.updateSlidesOffset();
  }
};

var updateAutoHeight = function () {
  var swiper = this;
  var activeSlides = [];
  var newHeight = 0;
  var i;

  // Find slides currently in view
  if (swiper.params.slidesPerView !== 'auto' && swiper.params.slidesPerView > 1) {
    for (i = 0; i < Math.ceil(swiper.params.slidesPerView); i += 1) {
      var index = swiper.activeIndex + i;
      if (index > swiper.slides.length) { break; }
      activeSlides.push(swiper.slides.eq(index)[0]);
    }
  } else {
    activeSlides.push(swiper.slides.eq(swiper.activeIndex)[0]);
  }

  // Find new height from highest slide in view
  for (i = 0; i < activeSlides.length; i += 1) {
    if (typeof activeSlides[i] !== 'undefined') {
      var height = activeSlides[i].offsetHeight;
      newHeight = height > newHeight ? height : newHeight;
    }
  }

  // Update Height
  if (newHeight) { swiper.$wrapperEl.css('height', (newHeight + "px")); }
};

var updateSlidesOffset = function () {
  var swiper = this;
  var slides = swiper.slides;
  for (var i = 0; i < slides.length; i += 1) {
    slides[i].swiperSlideOffset = swiper.isHorizontal() ? slides[i].offsetLeft : slides[i].offsetTop;
  }
};

var updateSlidesProgress = function (translate) {
  if ( translate === void 0 ) translate = this.translate || 0;

  var swiper = this;
  var params = swiper.params;

  var slides = swiper.slides;
  var rtl = swiper.rtl;

  if (slides.length === 0) { return; }
  if (typeof slides[0].swiperSlideOffset === 'undefined') { swiper.updateSlidesOffset(); }

  var offsetCenter = -translate;
  if (rtl) { offsetCenter = translate; }

  // Visible Slides
  slides.removeClass(params.slideVisibleClass);

  for (var i = 0; i < slides.length; i += 1) {
    var slide = slides[i];
    var slideProgress =
      (
        (offsetCenter + (params.centeredSlides ? swiper.minTranslate() : 0)) - slide.swiperSlideOffset
      ) / (slide.swiperSlideSize + params.spaceBetween);
    if (params.watchSlidesVisibility) {
      var slideBefore = -(offsetCenter - slide.swiperSlideOffset);
      var slideAfter = slideBefore + swiper.slidesSizesGrid[i];
      var isVisible =
                (slideBefore >= 0 && slideBefore < swiper.size) ||
                (slideAfter > 0 && slideAfter <= swiper.size) ||
                (slideBefore <= 0 && slideAfter >= swiper.size);
      if (isVisible) {
        slides.eq(i).addClass(params.slideVisibleClass);
      }
    }
    slide.progress = rtl ? -slideProgress : slideProgress;
  }
};

var updateProgress = function (translate) {
  if ( translate === void 0 ) translate = this.translate || 0;

  var swiper = this;
  var params = swiper.params;

  var translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
  var progress = swiper.progress;
  var isBeginning = swiper.isBeginning;
  var isEnd = swiper.isEnd;
  var wasBeginning = isBeginning;
  var wasEnd = isEnd;
  if (translatesDiff === 0) {
    progress = 0;
    isBeginning = true;
    isEnd = true;
  } else {
    progress = (translate - swiper.minTranslate()) / (translatesDiff);
    isBeginning = progress <= 0;
    isEnd = progress >= 1;
  }
  Utils.extend(swiper, {
    progress: progress,
    isBeginning: isBeginning,
    isEnd: isEnd,
  });

  if (params.watchSlidesProgress || params.watchSlidesVisibility) { swiper.updateSlidesProgress(translate); }

  if (isBeginning && !wasBeginning) {
    swiper.emit('reachBeginning toEdge');
  }
  if (isEnd && !wasEnd) {
    swiper.emit('reachEnd toEdge');
  }
  if ((wasBeginning && !isBeginning) || (wasEnd && !isEnd)) {
    swiper.emit('fromEdge');
  }

  swiper.emit('progress', progress);
};

var updateSlidesClasses = function () {
  var swiper = this;

  var slides = swiper.slides;
  var params = swiper.params;
  var $wrapperEl = swiper.$wrapperEl;
  var activeIndex = swiper.activeIndex;
  var realIndex = swiper.realIndex;
  var isVirtual = swiper.virtual && params.virtual.enabled;

  slides.removeClass(((params.slideActiveClass) + " " + (params.slideNextClass) + " " + (params.slidePrevClass) + " " + (params.slideDuplicateActiveClass) + " " + (params.slideDuplicateNextClass) + " " + (params.slideDuplicatePrevClass)));

  var activeSlide;
  if (isVirtual) {
    activeSlide = swiper.$wrapperEl.find(("." + (params.slideClass) + "[data-swiper-slide-index=\"" + activeIndex + "\"]"));
  } else {
    activeSlide = slides.eq(activeIndex);
  }

  // Active classes
  activeSlide.addClass(params.slideActiveClass);

  if (params.loop) {
    // Duplicate to all looped slides
    if (activeSlide.hasClass(params.slideDuplicateClass)) {
      $wrapperEl
        .children(("." + (params.slideClass) + ":not(." + (params.slideDuplicateClass) + ")[data-swiper-slide-index=\"" + realIndex + "\"]"))
        .addClass(params.slideDuplicateActiveClass);
    } else {
      $wrapperEl
        .children(("." + (params.slideClass) + "." + (params.slideDuplicateClass) + "[data-swiper-slide-index=\"" + realIndex + "\"]"))
        .addClass(params.slideDuplicateActiveClass);
    }
  }
  // Next Slide
  var nextSlide = activeSlide.nextAll(("." + (params.slideClass))).eq(0).addClass(params.slideNextClass);
  if (params.loop && nextSlide.length === 0) {
    nextSlide = slides.eq(0);
    nextSlide.addClass(params.slideNextClass);
  }
  // Prev Slide
  var prevSlide = activeSlide.prevAll(("." + (params.slideClass))).eq(0).addClass(params.slidePrevClass);
  if (params.loop && prevSlide.length === 0) {
    prevSlide = slides.eq(-1);
    prevSlide.addClass(params.slidePrevClass);
  }
  if (params.loop) {
    // Duplicate to all looped slides
    if (nextSlide.hasClass(params.slideDuplicateClass)) {
      $wrapperEl
        .children(("." + (params.slideClass) + ":not(." + (params.slideDuplicateClass) + ")[data-swiper-slide-index=\"" + (nextSlide.attr('data-swiper-slide-index')) + "\"]"))
        .addClass(params.slideDuplicateNextClass);
    } else {
      $wrapperEl
        .children(("." + (params.slideClass) + "." + (params.slideDuplicateClass) + "[data-swiper-slide-index=\"" + (nextSlide.attr('data-swiper-slide-index')) + "\"]"))
        .addClass(params.slideDuplicateNextClass);
    }
    if (prevSlide.hasClass(params.slideDuplicateClass)) {
      $wrapperEl
        .children(("." + (params.slideClass) + ":not(." + (params.slideDuplicateClass) + ")[data-swiper-slide-index=\"" + (prevSlide.attr('data-swiper-slide-index')) + "\"]"))
        .addClass(params.slideDuplicatePrevClass);
    } else {
      $wrapperEl
        .children(("." + (params.slideClass) + "." + (params.slideDuplicateClass) + "[data-swiper-slide-index=\"" + (prevSlide.attr('data-swiper-slide-index')) + "\"]"))
        .addClass(params.slideDuplicatePrevClass);
    }
  }
};

var updateActiveIndex = function (newActiveIndex) {
  var swiper = this;
  var translate = swiper.rtl ? swiper.translate : -swiper.translate;
  var slidesGrid = swiper.slidesGrid;
  var snapGrid = swiper.snapGrid;
  var params = swiper.params;
  var previousIndex = swiper.activeIndex;
  var previousRealIndex = swiper.realIndex;
  var previousSnapIndex = swiper.snapIndex;
  var activeIndex = newActiveIndex;
  var snapIndex;
  if (typeof activeIndex === 'undefined') {
    for (var i = 0; i < slidesGrid.length; i += 1) {
      if (typeof slidesGrid[i + 1] !== 'undefined') {
        if (translate >= slidesGrid[i] && translate < slidesGrid[i + 1] - ((slidesGrid[i + 1] - slidesGrid[i]) / 2)) {
          activeIndex = i;
        } else if (translate >= slidesGrid[i] && translate < slidesGrid[i + 1]) {
          activeIndex = i + 1;
        }
      } else if (translate >= slidesGrid[i]) {
        activeIndex = i;
      }
    }
    // Normalize slideIndex
    if (params.normalizeSlideIndex) {
      if (activeIndex < 0 || typeof activeIndex === 'undefined') { activeIndex = 0; }
    }
  }
  if (snapGrid.indexOf(translate) >= 0) {
    snapIndex = snapGrid.indexOf(translate);
  } else {
    snapIndex = Math.floor(activeIndex / params.slidesPerGroup);
  }
  if (snapIndex >= snapGrid.length) { snapIndex = snapGrid.length - 1; }
  if (activeIndex === previousIndex) {
    if (snapIndex !== previousSnapIndex) {
      swiper.snapIndex = snapIndex;
      swiper.emit('snapIndexChange');
    }
    return;
  }

  // Get real index
  var realIndex = parseInt(swiper.slides.eq(activeIndex).attr('data-swiper-slide-index') || activeIndex, 10);

  Utils.extend(swiper, {
    snapIndex: snapIndex,
    realIndex: realIndex,
    previousIndex: previousIndex,
    activeIndex: activeIndex,
  });
  swiper.emit('activeIndexChange');
  swiper.emit('snapIndexChange');
  if (previousRealIndex !== realIndex) {
    swiper.emit('realIndexChange');
  }
  swiper.emit('slideChange');
};

var updateClickedSlide = function (e) {
  var swiper = this;
  var params = swiper.params;
  var slide = $$1(e.target).closest(("." + (params.slideClass)))[0];
  var slideFound = false;
  if (slide) {
    for (var i = 0; i < swiper.slides.length; i += 1) {
      if (swiper.slides[i] === slide) { slideFound = true; }
    }
  }

  if (slide && slideFound) {
    swiper.clickedSlide = slide;
    if (swiper.virtual && swiper.params.virtual.enabled) {
      swiper.clickedIndex = parseInt($$1(slide).attr('data-swiper-slide-index'), 10);
    } else {
      swiper.clickedIndex = $$1(slide).index();
    }
  } else {
    swiper.clickedSlide = undefined;
    swiper.clickedIndex = undefined;
    return;
  }
  if (params.slideToClickedSlide && swiper.clickedIndex !== undefined && swiper.clickedIndex !== swiper.activeIndex) {
    swiper.slideToClickedSlide();
  }
};

var update = {
  updateSize: updateSize,
  updateSlides: updateSlides,
  updateAutoHeight: updateAutoHeight,
  updateSlidesOffset: updateSlidesOffset,
  updateSlidesProgress: updateSlidesProgress,
  updateProgress: updateProgress,
  updateSlidesClasses: updateSlidesClasses,
  updateActiveIndex: updateActiveIndex,
  updateClickedSlide: updateClickedSlide,
};

var getTranslate = function (axis) {
  if ( axis === void 0 ) axis = this.isHorizontal() ? 'x' : 'y';

  var swiper = this;

  var params = swiper.params;
  var rtl = swiper.rtl;
  var translate = swiper.translate;
  var $wrapperEl = swiper.$wrapperEl;

  if (params.virtualTranslate) {
    return rtl ? -translate : translate;
  }

  var currentTranslate = Utils.getTranslate($wrapperEl[0], axis);
  if (rtl) { currentTranslate = -currentTranslate; }

  return currentTranslate || 0;
};

var setTranslate = function (translate, byController) {
  var swiper = this;
  var rtl = swiper.rtl;
  var params = swiper.params;
  var $wrapperEl = swiper.$wrapperEl;
  var progress = swiper.progress;
  var x = 0;
  var y = 0;
  var z = 0;

  if (swiper.isHorizontal()) {
    x = rtl ? -translate : translate;
  } else {
    y = translate;
  }

  if (params.roundLengths) {
    x = Math.floor(x);
    y = Math.floor(y);
  }

  if (!params.virtualTranslate) {
    if (Support.transforms3d) { $wrapperEl.transform(("translate3d(" + x + "px, " + y + "px, " + z + "px)")); }
    else { $wrapperEl.transform(("translate(" + x + "px, " + y + "px)")); }
  }

  swiper.translate = swiper.isHorizontal() ? x : y;

  // Check if we need to update progress
  var newProgress;
  var translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
  if (translatesDiff === 0) {
    newProgress = 0;
  } else {
    newProgress = (translate - swiper.minTranslate()) / (translatesDiff);
  }
  if (newProgress !== progress) {
    swiper.updateProgress(translate);
  }

  swiper.emit('setTranslate', swiper.translate, byController);
};

var minTranslate = function () {
  return (-this.snapGrid[0]);
};

var maxTranslate = function () {
  return (-this.snapGrid[this.snapGrid.length - 1]);
};

var translate = {
  getTranslate: getTranslate,
  setTranslate: setTranslate,
  minTranslate: minTranslate,
  maxTranslate: maxTranslate,
};

var setTransition = function (duration, byController) {
  var swiper = this;

  swiper.$wrapperEl.transition(duration);

  swiper.emit('setTransition', duration, byController);
};

var transitionStart = function (runCallbacks) {
  if ( runCallbacks === void 0 ) runCallbacks = true;

  var swiper = this;
  var activeIndex = swiper.activeIndex;
  var params = swiper.params;
  var previousIndex = swiper.previousIndex;
  if (params.autoHeight) {
    swiper.updateAutoHeight();
  }
  swiper.emit('transitionStart');

  if (!runCallbacks) { return; }
  if (activeIndex !== previousIndex) {
    swiper.emit('slideChangeTransitionStart');
    if (activeIndex > previousIndex) {
      swiper.emit('slideNextTransitionStart');
    } else {
      swiper.emit('slidePrevTransitionStart');
    }
  }
};

var transitionEnd$1 = function (runCallbacks) {
  if ( runCallbacks === void 0 ) runCallbacks = true;

  var swiper = this;
  var activeIndex = swiper.activeIndex;
  var previousIndex = swiper.previousIndex;
  swiper.animating = false;
  swiper.setTransition(0);

  swiper.emit('transitionEnd');
  if (runCallbacks) {
    if (activeIndex !== previousIndex) {
      swiper.emit('slideChangeTransitionEnd');
      if (activeIndex > previousIndex) {
        swiper.emit('slideNextTransitionEnd');
      } else {
        swiper.emit('slidePrevTransitionEnd');
      }
    }
  }
};

var transition$1 = {
  setTransition: setTransition,
  transitionStart: transitionStart,
  transitionEnd: transitionEnd$1,
};

var Browser = (function Browser() {
  function isIE9() {
    // create temporary DIV
    var div = doc.createElement('div');
    // add content to tmp DIV which is wrapped into the IE HTML conditional statement
    div.innerHTML = '<!--[if lte IE 9]><i></i><![endif]-->';
    // return true / false value based on what will browser render
    return div.getElementsByTagName('i').length === 1;
  }
  function isSafari() {
    var ua = win.navigator.userAgent.toLowerCase();
    return (ua.indexOf('safari') >= 0 && ua.indexOf('chrome') < 0 && ua.indexOf('android') < 0);
  }
  return {
    isSafari: isSafari(),
    isUiWebView: /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(win.navigator.userAgent),
    ie: win.navigator.pointerEnabled || win.navigator.msPointerEnabled,
    ieTouch: (win.navigator.msPointerEnabled && win.navigator.msMaxTouchPoints > 1) ||
             (win.navigator.pointerEnabled && win.navigator.maxTouchPoints > 1),
    lteIE9: isIE9(),
  };
}());

var slideTo = function (index, speed, runCallbacks, internal) {
  if ( index === void 0 ) index = 0;
  if ( speed === void 0 ) speed = this.params.speed;
  if ( runCallbacks === void 0 ) runCallbacks = true;

  var swiper = this;
  var slideIndex = index;
  if (slideIndex < 0) { slideIndex = 0; }

  var params = swiper.params;
  var snapGrid = swiper.snapGrid;
  var slidesGrid = swiper.slidesGrid;
  var previousIndex = swiper.previousIndex;
  var activeIndex = swiper.activeIndex;
  var rtl = swiper.rtl;
  var $wrapperEl = swiper.$wrapperEl;

  var snapIndex = Math.floor(slideIndex / params.slidesPerGroup);
  if (snapIndex >= snapGrid.length) { snapIndex = snapGrid.length - 1; }

  if ((activeIndex || params.initialSlide || 0) === (previousIndex || 0) && runCallbacks) {
    swiper.emit('beforeSlideChangeStart');
  }

  var translate = -snapGrid[snapIndex];

  // Update progress
  swiper.updateProgress(translate);

  // Normalize slideIndex
  if (params.normalizeSlideIndex) {
    for (var i = 0; i < slidesGrid.length; i += 1) {
      if (-Math.floor(translate * 100) >= Math.floor(slidesGrid[i] * 100)) {
        slideIndex = i;
      }
    }
  }

  // Directions locks
  if (!swiper.allowSlideNext && translate < swiper.translate && translate < swiper.minTranslate()) {
    return false;
  }
  if (!swiper.allowSlidePrev && translate > swiper.translate && translate > swiper.maxTranslate()) {
    if ((activeIndex || 0) !== slideIndex) { return false; }
  }

  // Update Index
  if ((rtl && -translate === swiper.translate) || (!rtl && translate === swiper.translate)) {
    swiper.updateActiveIndex(slideIndex);
    // Update Height
    if (params.autoHeight) {
      swiper.updateAutoHeight();
    }
    swiper.updateSlidesClasses();
    if (params.effect !== 'slide') {
      swiper.setTranslate(translate);
    }
    return false;
  }

  if (speed === 0 || Browser.lteIE9) {
    swiper.setTransition(0);
    swiper.setTranslate(translate);
    swiper.updateActiveIndex(slideIndex);
    swiper.updateSlidesClasses();
    swiper.emit('beforeTransitionStart', speed, internal);
    swiper.transitionStart(runCallbacks);
    swiper.transitionEnd(runCallbacks);
  } else {
    swiper.setTransition(speed);
    swiper.setTranslate(translate);
    swiper.updateActiveIndex(slideIndex);
    swiper.updateSlidesClasses();
    swiper.emit('beforeTransitionStart', speed, internal);
    swiper.transitionStart(runCallbacks);
    if (!swiper.animating) {
      swiper.animating = true;
      $wrapperEl.transitionEnd(function () {
        if (!swiper || swiper.destroyed) { return; }
        swiper.transitionEnd(runCallbacks);
      });
    }
  }

  return true;
};

/* eslint no-unused-vars: "off" */
var slideNext = function (speed, runCallbacks, internal) {
  if ( speed === void 0 ) speed = this.params.speed;
  if ( runCallbacks === void 0 ) runCallbacks = true;

  var swiper = this;
  var params = swiper.params;
  var animating = swiper.animating;
  if (params.loop) {
    if (animating) { return false; }
    swiper.loopFix();
    // eslint-disable-next-line
    swiper._clientLeft = swiper.$wrapperEl[0].clientLeft;
    return swiper.slideTo(swiper.activeIndex + params.slidesPerGroup, speed, runCallbacks, internal);
  }
  return swiper.slideTo(swiper.activeIndex + params.slidesPerGroup, speed, runCallbacks, internal);
};

/* eslint no-unused-vars: "off" */
var slidePrev = function (speed, runCallbacks, internal) {
  if ( speed === void 0 ) speed = this.params.speed;
  if ( runCallbacks === void 0 ) runCallbacks = true;

  var swiper = this;
  var params = swiper.params;
  var animating = swiper.animating;

  if (params.loop) {
    if (animating) { return false; }
    swiper.loopFix();
    // eslint-disable-next-line
    swiper._clientLeft = swiper.$wrapperEl[0].clientLeft;
    return swiper.slideTo(swiper.activeIndex - 1, speed, runCallbacks, internal);
  }
  return swiper.slideTo(swiper.activeIndex - 1, speed, runCallbacks, internal);
};

/* eslint no-unused-vars: "off" */
var slideReset = function (speed, runCallbacks, internal) {
  if ( speed === void 0 ) speed = this.params.speed;
  if ( runCallbacks === void 0 ) runCallbacks = true;

  var swiper = this;
  return swiper.slideTo(swiper.activeIndex, speed, runCallbacks, internal);
};

var slideToClickedSlide = function () {
  var swiper = this;
  var params = swiper.params;
  var $wrapperEl = swiper.$wrapperEl;

  var slidesPerView = params.slidesPerView === 'auto' ? swiper.slidesPerViewDynamic() : params.slidesPerView;
  var slideToIndex = swiper.clickedIndex;
  var realIndex;
  if (params.loop) {
    if (swiper.animating) { return; }
    realIndex = parseInt($$1(swiper.clickedSlide).attr('data-swiper-slide-index'), 10);
    if (params.centeredSlides) {
      if (
        (slideToIndex < swiper.loopedSlides - (slidesPerView / 2)) ||
        (slideToIndex > (swiper.slides.length - swiper.loopedSlides) + (slidesPerView / 2))
      ) {
        swiper.loopFix();
        slideToIndex = $wrapperEl
          .children(("." + (params.slideClass) + "[data-swiper-slide-index=\"" + realIndex + "\"]:not(." + (params.slideDuplicateClass) + ")"))
          .eq(0)
          .index();

        Utils.nextTick(function () {
          swiper.slideTo(slideToIndex);
        });
      } else {
        swiper.slideTo(slideToIndex);
      }
    } else if (slideToIndex > swiper.slides.length - slidesPerView) {
      swiper.loopFix();
      slideToIndex = $wrapperEl
        .children(("." + (params.slideClass) + "[data-swiper-slide-index=\"" + realIndex + "\"]:not(." + (params.slideDuplicateClass) + ")"))
        .eq(0)
        .index();

      Utils.nextTick(function () {
        swiper.slideTo(slideToIndex);
      });
    } else {
      swiper.slideTo(slideToIndex);
    }
  } else {
    swiper.slideTo(slideToIndex);
  }
};

var slide = {
  slideTo: slideTo,
  slideNext: slideNext,
  slidePrev: slidePrev,
  slideReset: slideReset,
  slideToClickedSlide: slideToClickedSlide,
};

var loopCreate = function () {
  var swiper = this;
  var params = swiper.params;
  var $wrapperEl = swiper.$wrapperEl;
  // Remove duplicated slides
  $wrapperEl.children(("." + (params.slideClass) + "." + (params.slideDuplicateClass))).remove();

  var slides = $wrapperEl.children(("." + (params.slideClass)));

  if (params.loopFillGroupWithBlank) {
    var blankSlidesNum = params.slidesPerGroup - (slides.length % params.slidesPerGroup);
    if (blankSlidesNum !== params.slidesPerGroup) {
      for (var i = 0; i < blankSlidesNum; i += 1) {
        var blankNode = $$1(doc.createElement('div')).addClass(((params.slideClass) + " " + (params.slideBlankClass)));
        $wrapperEl.append(blankNode);
      }
      slides = $wrapperEl.children(("." + (params.slideClass)));
    }
  }

  if (params.slidesPerView === 'auto' && !params.loopedSlides) { params.loopedSlides = slides.length; }

  swiper.loopedSlides = parseInt(params.loopedSlides || params.slidesPerView, 10);
  swiper.loopedSlides += params.loopAdditionalSlides;
  if (swiper.loopedSlides > slides.length) {
    swiper.loopedSlides = slides.length;
  }

  var prependSlides = [];
  var appendSlides = [];
  slides.each(function (index, el) {
    var slide = $$1(el);
    if (index < swiper.loopedSlides) { appendSlides.push(el); }
    if (index < slides.length && index >= slides.length - swiper.loopedSlides) { prependSlides.push(el); }
    slide.attr('data-swiper-slide-index', index);
  });
  for (var i$1 = 0; i$1 < appendSlides.length; i$1 += 1) {
    $wrapperEl.append($$1(appendSlides[i$1].cloneNode(true)).addClass(params.slideDuplicateClass));
  }
  for (var i$2 = prependSlides.length - 1; i$2 >= 0; i$2 -= 1) {
    $wrapperEl.prepend($$1(prependSlides[i$2].cloneNode(true)).addClass(params.slideDuplicateClass));
  }
};

var loopFix = function () {
  var swiper = this;
  var params = swiper.params;
  var activeIndex = swiper.activeIndex;
  var slides = swiper.slides;
  var loopedSlides = swiper.loopedSlides;
  var allowSlidePrev = swiper.allowSlidePrev;
  var allowSlideNext = swiper.allowSlideNext;
  var newIndex;
  swiper.allowSlidePrev = true;
  swiper.allowSlideNext = true;
  // Fix For Negative Oversliding
  if (activeIndex < loopedSlides) {
    newIndex = (slides.length - (loopedSlides * 3)) + activeIndex;
    newIndex += loopedSlides;
    swiper.slideTo(newIndex, 0, false, true);
  } else if ((params.slidesPerView === 'auto' && activeIndex >= loopedSlides * 2) || (activeIndex > slides.length - (params.slidesPerView * 2))) {
    // Fix For Positive Oversliding
    newIndex = -slides.length + activeIndex + loopedSlides;
    newIndex += loopedSlides;
    swiper.slideTo(newIndex, 0, false, true);
  }
  swiper.allowSlidePrev = allowSlidePrev;
  swiper.allowSlideNext = allowSlideNext;
};

var loopDestroy = function () {
  var swiper = this;
  var $wrapperEl = swiper.$wrapperEl;
  var params = swiper.params;
  var slides = swiper.slides;
  $wrapperEl.children(("." + (params.slideClass) + "." + (params.slideDuplicateClass))).remove();
  slides.removeAttr('data-swiper-slide-index');
};

var loop = {
  loopCreate: loopCreate,
  loopFix: loopFix,
  loopDestroy: loopDestroy,
};

var setGrabCursor = function (moving) {
  var swiper = this;
  if (Support.touch || !swiper.params.simulateTouch) { return; }
  var el = swiper.el;
  el.style.cursor = 'move';
  el.style.cursor = moving ? '-webkit-grabbing' : '-webkit-grab';
  el.style.cursor = moving ? '-moz-grabbin' : '-moz-grab';
  el.style.cursor = moving ? 'grabbing' : 'grab';
};

var unsetGrabCursor = function () {
  var swiper = this;
  if (Support.touch) { return; }
  swiper.el.style.cursor = '';
};

var grabCursor = {
  setGrabCursor: setGrabCursor,
  unsetGrabCursor: unsetGrabCursor,
};

var appendSlide = function (slides) {
  var swiper = this;
  var $wrapperEl = swiper.$wrapperEl;
  var params = swiper.params;
  if (params.loop) {
    swiper.loopDestroy();
  }
  if (typeof slides === 'object' && 'length' in slides) {
    for (var i = 0; i < slides.length; i += 1) {
      if (slides[i]) { $wrapperEl.append(slides[i]); }
    }
  } else {
    $wrapperEl.append(slides);
  }
  if (params.loop) {
    swiper.loopCreate();
  }
  if (!(params.observer && Support.observer)) {
    swiper.update();
  }
};

var prependSlide = function (slides) {
  var swiper = this;
  var params = swiper.params;
  var $wrapperEl = swiper.$wrapperEl;
  var activeIndex = swiper.activeIndex;

  if (params.loop) {
    swiper.loopDestroy();
  }
  var newActiveIndex = activeIndex + 1;
  if (typeof slides === 'object' && 'length' in slides) {
    for (var i = 0; i < slides.length; i += 1) {
      if (slides[i]) { $wrapperEl.prepend(slides[i]); }
    }
    newActiveIndex = activeIndex + slides.length;
  } else {
    $wrapperEl.prepend(slides);
  }
  if (params.loop) {
    swiper.loopCreate();
  }
  if (!(params.observer && Support.observer)) {
    swiper.update();
  }
  swiper.slideTo(newActiveIndex, 0, false);
};

var removeSlide = function (slidesIndexes) {
  var swiper = this;
  var params = swiper.params;
  var $wrapperEl = swiper.$wrapperEl;
  var activeIndex = swiper.activeIndex;

  if (params.loop) {
    swiper.loopDestroy();
    swiper.slides = $wrapperEl.children(("." + (params.slideClass)));
  }
  var newActiveIndex = activeIndex;
  var indexToRemove;

  if (typeof slidesIndexes === 'object' && 'length' in slidesIndexes) {
    for (var i = 0; i < slidesIndexes.length; i += 1) {
      indexToRemove = slidesIndexes[i];
      if (swiper.slides[indexToRemove]) { swiper.slides.eq(indexToRemove).remove(); }
      if (indexToRemove < newActiveIndex) { newActiveIndex -= 1; }
    }
    newActiveIndex = Math.max(newActiveIndex, 0);
  } else {
    indexToRemove = slidesIndexes;
    if (swiper.slides[indexToRemove]) { swiper.slides.eq(indexToRemove).remove(); }
    if (indexToRemove < newActiveIndex) { newActiveIndex -= 1; }
    newActiveIndex = Math.max(newActiveIndex, 0);
  }

  if (params.loop) {
    swiper.loopCreate();
  }

  if (!(params.observer && Support.observer)) {
    swiper.update();
  }
  if (params.loop) {
    swiper.slideTo(newActiveIndex + swiper.loopedSlides, 0, false);
  } else {
    swiper.slideTo(newActiveIndex, 0, false);
  }
};

var removeAllSlides = function () {
  var swiper = this;

  var slidesIndexes = [];
  for (var i = 0; i < swiper.slides.length; i += 1) {
    slidesIndexes.push(i);
  }
  swiper.removeSlide(slidesIndexes);
};

var manipulation = {
  appendSlide: appendSlide,
  prependSlide: prependSlide,
  removeSlide: removeSlide,
  removeAllSlides: removeAllSlides,
};

var Device = (function Device() {
  var ua = win.navigator.userAgent;

  var device = {
    ios: false,
    android: false,
    androidChrome: false,
    desktop: false,
    windows: false,
    iphone: false,
    ipod: false,
    ipad: false,
    cordova: win.cordova || win.phonegap,
    phonegap: win.cordova || win.phonegap,
  };

  var windows = ua.match(/(Windows Phone);?[\s\/]+([\d.]+)?/); // eslint-disable-line
  var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/); // eslint-disable-line
  var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
  var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
  var iphone = !ipad && ua.match(/(iPhone\sOS|iOS)\s([\d_]+)/);


  // Windows
  if (windows) {
    device.os = 'windows';
    device.osVersion = windows[2];
    device.windows = true;
  }
  // Android
  if (android && !windows) {
    device.os = 'android';
    device.osVersion = android[2];
    device.android = true;
    device.androidChrome = ua.toLowerCase().indexOf('chrome') >= 0;
  }
  if (ipad || iphone || ipod) {
    device.os = 'ios';
    device.ios = true;
  }
  // iOS
  if (iphone && !ipod) {
    device.osVersion = iphone[2].replace(/_/g, '.');
    device.iphone = true;
  }
  if (ipad) {
    device.osVersion = ipad[2].replace(/_/g, '.');
    device.ipad = true;
  }
  if (ipod) {
    device.osVersion = ipod[3] ? ipod[3].replace(/_/g, '.') : null;
    device.iphone = true;
  }
  // iOS 8+ changed UA
  if (device.ios && device.osVersion && ua.indexOf('Version/') >= 0) {
    if (device.osVersion.split('.')[0] === '10') {
      device.osVersion = ua.toLowerCase().split('version/')[1].split(' ')[0];
    }
  }

  // Desktop
  device.desktop = !(device.os || device.android || device.webView);

  // Webview
  device.webView = (iphone || ipad || ipod) && ua.match(/.*AppleWebKit(?!.*Safari)/i);

  // Minimal UI
  if (device.os && device.os === 'ios') {
    var osVersionArr = device.osVersion.split('.');
    var metaViewport = doc.querySelector('meta[name="viewport"]');
    device.minimalUi =
      !device.webView &&
      (ipod || iphone) &&
      (osVersionArr[0] * 1 === 7 ? osVersionArr[1] * 1 >= 1 : osVersionArr[0] * 1 > 7) &&
      metaViewport && metaViewport.getAttribute('content').indexOf('minimal-ui') >= 0;
  }

  // Pixel Ratio
  device.pixelRatio = win.devicePixelRatio || 1;

  // Export object
  return device;
}());

var onTouchStart = function (event) {
  var swiper = this;
  var data = swiper.touchEventsData;
  var params = swiper.params;
  var touches = swiper.touches;
  var e = event;
  if (e.originalEvent) { e = e.originalEvent; }
  data.isTouchEvent = e.type === 'touchstart';
  if (!data.isTouchEvent && 'which' in e && e.which === 3) { return; }
  if (data.isTouched && data.isMoved) { return; }
  if (params.noSwiping && $$1(e.target).closest(("." + (params.noSwipingClass)))[0]) {
    swiper.allowClick = true;
    return;
  }
  if (params.swipeHandler) {
    if (!$$1(e).closest(params.swipeHandler)[0]) { return; }
  }

  touches.currentX = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
  touches.currentY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
  var startX = touches.currentX;
  var startY = touches.currentY;

  // Do NOT start if iOS edge swipe is detected. Otherwise iOS app (UIWebView) cannot swipe-to-go-back anymore

  if (
    Device.ios &&
    !Device.cordova &&
    params.iOSEdgeSwipeDetection &&
    (startX <= params.iOSEdgeSwipeThreshold) &&
    (startX >= window.screen.width - params.iOSEdgeSwipeThreshold)
  ) {
    return;
  }

  Utils.extend(data, {
    isTouched: true,
    isMoved: false,
    allowTouchCallbacks: true,
    isScrolling: undefined,
    startMoving: undefined,
  });

  touches.startX = startX;
  touches.startY = startY;
  data.touchStartTime = Utils.now();
  swiper.allowClick = true;
  swiper.updateSize();
  swiper.swipeDirection = undefined;
  if (params.threshold > 0) { data.allowThresholdMove = false; }
  if (e.type !== 'touchstart') {
    var preventDefault = true;
    if ($$1(e.target).is(data.formElements)) { preventDefault = false; }
    if (doc.activeElement && $$1(doc.activeElement).is(data.formElements)) {
      doc.activeElement.blur();
    }
    if (preventDefault && swiper.allowTouchMove) {
      e.preventDefault();
    }
  }
  swiper.emit('touchStart', e);
};

var onTouchMove = function (event) {
  var swiper = this;
  var data = swiper.touchEventsData;
  var params = swiper.params;
  var touches = swiper.touches;
  var rtl = swiper.rtl;
  var e = event;
  if (e.originalEvent) { e = e.originalEvent; }
  if (data.isTouchEvent && e.type === 'mousemove') { return; }
  var pageX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
  var pageY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;
  if (e.preventedByNestedSwiper) {
    touches.startX = pageX;
    touches.startY = pageY;
    return;
  }
  if (!swiper.allowTouchMove) {
    // isMoved = true;
    swiper.allowClick = false;
    if (data.isTouched) {
      Utils.extend(touches, {
        startX: pageX,
        startY: pageY,
        currentX: pageX,
        currentY: pageY,
      });
      data.touchStartTime = Utils.now();
    }
    return;
  }
  if (data.isTouchEvent && params.touchReleaseOnEdges && !params.loop) {
    if (swiper.isVertical()) {
      // Vertical
      if (
        (pageY < touches.startY && swiper.translate <= swiper.maxTranslate()) ||
        (pageY > touches.startY && swiper.translate >= swiper.minTranslate())
      ) {
        data.isTouched = false;
        data.isMoved = false;
        return;
      }
    } else if (
      (pageX < touches.startX && swiper.translate <= swiper.maxTranslate()) ||
      (pageX > touches.startX && swiper.translate >= swiper.minTranslate())
    ) {
      return;
    }
  }
  if (data.isTouchEvent && doc.activeElement) {
    if (e.target === doc.activeElement && $$1(e.target).is(data.formElements)) {
      data.isMoved = true;
      swiper.allowClick = false;
      return;
    }
  }
  if (data.allowTouchCallbacks) {
    swiper.emit('touchMove', e);
  }
  if (e.targetTouches && e.targetTouches.length > 1) { return; }

  touches.currentX = pageX;
  touches.currentY = pageY;

  var diffX = touches.currentX - touches.startX;
  var diffY = touches.currentY - touches.startY;

  if (typeof data.isScrolling === 'undefined') {
    var touchAngle;
    if ((swiper.isHorizontal() && touches.currentY === touches.startY) || (swiper.isVertical() && touches.currentX === touches.startX)) {
      data.isScrolling = false;
    } else {
      // eslint-disable-next-line
      if ((diffX * diffX) + (diffY * diffY) >= 25) {
        touchAngle = (Math.atan2(Math.abs(diffY), Math.abs(diffX)) * 180) / Math.PI;
        data.isScrolling = swiper.isHorizontal() ? touchAngle > params.touchAngle : (90 - touchAngle > params.touchAngle);
      }
    }
  }
  if (data.isScrolling) {
    swiper.emit('touchMoveOpposite', e);
  }
  if (typeof startMoving === 'undefined') {
    if (touches.currentX !== touches.startX || touches.currentY !== touches.startY) {
      data.startMoving = true;
    }
  }
  if (!data.isTouched) { return; }
  if (data.isScrolling) {
    data.isTouched = false;
    return;
  }
  if (!data.startMoving) {
    return;
  }
  swiper.allowClick = false;
  e.preventDefault();
  if (params.touchMoveStopPropagation && !params.nested) {
    e.stopPropagation();
  }

  if (!data.isMoved) {
    if (params.loop) {
      swiper.loopFix();
    }
    data.startTranslate = swiper.getTranslate();
    swiper.setTransition(0);
    if (swiper.animating) {
      swiper.$wrapperEl.trigger('webkitTransitionEnd transitionend');
    }
    data.allowMomentumBounce = false;
    // Grab Cursor
    if (params.grabCursor && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) {
      swiper.setGrabCursor(true);
    }
    swiper.emit('sliderFirstMove', e);
  }
  swiper.emit('sliderMove', e);
  data.isMoved = true;

  var diff = swiper.isHorizontal() ? diffX : diffY;
  touches.diff = diff;

  diff *= params.touchRatio;
  if (rtl) { diff = -diff; }

  swiper.swipeDirection = diff > 0 ? 'prev' : 'next';
  data.currentTranslate = diff + data.startTranslate;

  var disableParentSwiper = true;
  var resistanceRatio = params.resistanceRatio;
  if (params.touchReleaseOnEdges) {
    resistanceRatio = 0;
  }
  if ((diff > 0 && data.currentTranslate > swiper.minTranslate())) {
    disableParentSwiper = false;
    if (params.resistance) { data.currentTranslate = (swiper.minTranslate() - 1) + (Math.pow( (-swiper.minTranslate() + data.startTranslate + diff), resistanceRatio )); }
  } else if (diff < 0 && data.currentTranslate < swiper.maxTranslate()) {
    disableParentSwiper = false;
    if (params.resistance) { data.currentTranslate = (swiper.maxTranslate() + 1) - (Math.pow( (swiper.maxTranslate() - data.startTranslate - diff), resistanceRatio )); }
  }

  if (disableParentSwiper) {
    e.preventedByNestedSwiper = true;
  }

  // Directions locks
  if (!swiper.allowSlideNext && swiper.swipeDirection === 'next' && data.currentTranslate < data.startTranslate) {
    data.currentTranslate = data.startTranslate;
  }
  if (!swiper.allowSlidePrev && swiper.swipeDirection === 'prev' && data.currentTranslate > data.startTranslate) {
    data.currentTranslate = data.startTranslate;
  }


  // Threshold
  if (params.threshold > 0) {
    if (Math.abs(diff) > params.threshold || data.allowThresholdMove) {
      if (!data.allowThresholdMove) {
        data.allowThresholdMove = true;
        touches.startX = touches.currentX;
        touches.startY = touches.currentY;
        data.currentTranslate = data.startTranslate;
        touches.diff = swiper.isHorizontal() ? touches.currentX - touches.startX : touches.currentY - touches.startY;
        return;
      }
    } else {
      data.currentTranslate = data.startTranslate;
      return;
    }
  }

  if (!params.followFinger) { return; }

  // Update active index in free mode
  if (params.freeMode || params.watchSlidesProgress || params.watchSlidesVisibility) {
    swiper.updateActiveIndex();
    swiper.updateSlidesClasses();
  }
  if (params.freeMode) {
    // Velocity
    if (data.velocities.length === 0) {
      data.velocities.push({
        position: touches[swiper.isHorizontal() ? 'startX' : 'startY'],
        time: data.touchStartTime,
      });
    }
    data.velocities.push({
      position: touches[swiper.isHorizontal() ? 'currentX' : 'currentY'],
      time: Utils.now(),
    });
  }
  // Update progress
  swiper.updateProgress(data.currentTranslate);
  // Update translate
  swiper.setTranslate(data.currentTranslate);
};

var onTouchEnd = function (event) {
  var swiper = this;
  var data = swiper.touchEventsData;

  var params = swiper.params;
  var touches = swiper.touches;
  var rtl = swiper.rtl;
  var $wrapperEl = swiper.$wrapperEl;
  var slidesGrid = swiper.slidesGrid;
  var snapGrid = swiper.snapGrid;
  var e = event;
  if (e.originalEvent) { e = e.originalEvent; }
  if (data.allowTouchCallbacks) {
    swiper.emit('touchEnd', e);
  }
  data.allowTouchCallbacks = false;
  if (!data.isTouched) { return; }
  // Return Grab Cursor
  if (params.grabCursor && data.isMoved && data.isTouched && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) {
    swiper.setGrabCursor(false);
  }

  // Time diff
  var touchEndTime = Utils.now();
  var timeDiff = touchEndTime - data.touchStartTime;

  // Tap, doubleTap, Click
  if (swiper.allowClick) {
    swiper.updateClickedSlide(e);
    swiper.emit('tap', e);
    if (timeDiff < 300 && (touchEndTime - data.lastClickTime) > 300) {
      if (data.clickTimeout) { clearTimeout(data.clickTimeout); }
      data.clickTimeout = Utils.nextTick(function () {
        if (!swiper || swiper.destroyed) { return; }
        swiper.emit('click', e);
      }, 300);
    }
    if (timeDiff < 300 && (touchEndTime - data.lastClickTime) < 300) {
      if (data.clickTimeout) { clearTimeout(data.clickTimeout); }
      swiper.emit('doubleTap', e);
    }
  }

  data.lastClickTime = Utils.now();
  Utils.nextTick(function () {
    if (!swiper.destroyed) { swiper.allowClick = true; }
  });

  if (!data.isTouched || !data.isMoved || !swiper.swipeDirection || touches.diff === 0 || data.currentTranslate === data.startTranslate) {
    data.isTouched = false;
    data.isMoved = false;
    return;
  }
  data.isTouched = false;
  data.isMoved = false;

  var currentPos;
  if (params.followFinger) {
    currentPos = rtl ? swiper.translate : -swiper.translate;
  } else {
    currentPos = -data.currentTranslate;
  }
  if (params.freeMode) {
    if (currentPos < -swiper.minTranslate()) {
      swiper.slideTo(swiper.activeIndex);
      return;
    } else if (currentPos > -swiper.maxTranslate()) {
      if (swiper.slides.length < snapGrid.length) {
        swiper.slideTo(snapGrid.length - 1);
      } else {
        swiper.slideTo(swiper.slides.length - 1);
      }
      return;
    }

    if (params.freeModeMomentum) {
      if (data.velocities.length > 1) {
        var lastMoveEvent = data.velocities.pop();
        var velocityEvent = data.velocities.pop();

        var distance = lastMoveEvent.position - velocityEvent.position;
        var time = lastMoveEvent.time - velocityEvent.time;
        swiper.velocity = distance / time;
        swiper.velocity /= 2;
        if (Math.abs(swiper.velocity) < params.freeModeMinimumVelocity) {
          swiper.velocity = 0;
        }
        // this implies that the user stopped moving a finger then released.
        // There would be no events with distance zero, so the last event is stale.
        if (time > 150 || (Utils.now() - lastMoveEvent.time) > 300) {
          swiper.velocity = 0;
        }
      } else {
        swiper.velocity = 0;
      }
      swiper.velocity *= params.freeModeMomentumVelocityRatio;

      data.velocities.length = 0;
      var momentumDuration = 1000 * params.freeModeMomentumRatio;
      var momentumDistance = swiper.velocity * momentumDuration;

      var newPosition = swiper.translate + momentumDistance;
      if (rtl) { newPosition = -newPosition; }
      var doBounce = false;
      var afterBouncePosition;
      var bounceAmount = Math.abs(swiper.velocity) * 20 * params.freeModeMomentumBounceRatio;
      if (newPosition < swiper.maxTranslate()) {
        if (params.freeModeMomentumBounce) {
          if (newPosition + swiper.maxTranslate() < -bounceAmount) {
            newPosition = swiper.maxTranslate() - bounceAmount;
          }
          afterBouncePosition = swiper.maxTranslate();
          doBounce = true;
          data.allowMomentumBounce = true;
        } else {
          newPosition = swiper.maxTranslate();
        }
      } else if (newPosition > swiper.minTranslate()) {
        if (params.freeModeMomentumBounce) {
          if (newPosition - swiper.minTranslate() > bounceAmount) {
            newPosition = swiper.minTranslate() + bounceAmount;
          }
          afterBouncePosition = swiper.minTranslate();
          doBounce = true;
          data.allowMomentumBounce = true;
        } else {
          newPosition = swiper.minTranslate();
        }
      } else if (params.freeModeSticky) {
        var nextSlide;
        for (var j = 0; j < snapGrid.length; j += 1) {
          if (snapGrid[j] > -newPosition) {
            nextSlide = j;
            break;
          }
        }
        if (Math.abs(snapGrid[nextSlide] - newPosition) < Math.abs(snapGrid[nextSlide - 1] - newPosition) || swiper.swipeDirection === 'next') {
          newPosition = snapGrid[nextSlide];
        } else {
          newPosition = snapGrid[nextSlide - 1];
        }
        newPosition = -newPosition;
      }
      // Fix duration
      if (swiper.velocity !== 0) {
        if (rtl) {
          momentumDuration = Math.abs((-newPosition - swiper.translate) / swiper.velocity);
        } else {
          momentumDuration = Math.abs((newPosition - swiper.translate) / swiper.velocity);
        }
      } else if (params.freeModeSticky) {
        swiper.slideReset();
        return;
      }

      if (params.freeModeMomentumBounce && doBounce) {
        swiper.updateProgress(afterBouncePosition);
        swiper.setTransition(momentumDuration);
        swiper.setTranslate(newPosition);
        swiper.transitionStart();
        swiper.animating = true;
        $wrapperEl.transitionEnd(function () {
          if (!swiper || swiper.destroyed || !data.allowMomentumBounce) { return; }
          swiper.emit('momentumBounce');

          swiper.setTransition(params.speed);
          swiper.setTranslate(afterBouncePosition);
          $wrapperEl.transitionEnd(function () {
            if (!swiper || swiper.destroyed) { return; }
            swiper.transitionEnd();
          });
        });
      } else if (swiper.velocity) {
        swiper.updateProgress(newPosition);
        swiper.setTransition(momentumDuration);
        swiper.setTranslate(newPosition);
        swiper.transitionStart();
        if (!swiper.animating) {
          swiper.animating = true;
          $wrapperEl.transitionEnd(function () {
            if (!swiper || swiper.destroyed) { return; }
            swiper.transitionEnd();
          });
        }
      } else {
        swiper.updateProgress(newPosition);
      }

      swiper.updateActiveIndex();
      swiper.updateSlidesClasses();
    }
    if (!params.freeModeMomentum || timeDiff >= params.longSwipesMs) {
      swiper.updateProgress();
      swiper.updateActiveIndex();
      swiper.updateSlidesClasses();
    }
    return;
  }

  // Find current slide
  var stopIndex = 0;
  var groupSize = swiper.slidesSizesGrid[0];
  for (var i = 0; i < slidesGrid.length; i += params.slidesPerGroup) {
    if (typeof slidesGrid[i + params.slidesPerGroup] !== 'undefined') {
      if (currentPos >= slidesGrid[i] && currentPos < slidesGrid[i + params.slidesPerGroup]) {
        stopIndex = i;
        groupSize = slidesGrid[i + params.slidesPerGroup] - slidesGrid[i];
      }
    } else if (currentPos >= slidesGrid[i]) {
      stopIndex = i;
      groupSize = slidesGrid[slidesGrid.length - 1] - slidesGrid[slidesGrid.length - 2];
    }
  }

  // Find current slide size
  var ratio = (currentPos - slidesGrid[stopIndex]) / groupSize;

  if (timeDiff > params.longSwipesMs) {
    // Long touches
    if (!params.longSwipes) {
      swiper.slideTo(swiper.activeIndex);
      return;
    }
    if (swiper.swipeDirection === 'next') {
      if (ratio >= params.longSwipesRatio) { swiper.slideTo(stopIndex + params.slidesPerGroup); }
      else { swiper.slideTo(stopIndex); }
    }
    if (swiper.swipeDirection === 'prev') {
      if (ratio > (1 - params.longSwipesRatio)) { swiper.slideTo(stopIndex + params.slidesPerGroup); }
      else { swiper.slideTo(stopIndex); }
    }
  } else {
    // Short swipes
    if (!params.shortSwipes) {
      swiper.slideTo(swiper.activeIndex);
      return;
    }
    if (swiper.swipeDirection === 'next') {
      swiper.slideTo(stopIndex + params.slidesPerGroup);
    }
    if (swiper.swipeDirection === 'prev') {
      swiper.slideTo(stopIndex);
    }
  }
};

var onResize = function () {
  var swiper = this;

  var params = swiper.params;
  var el = swiper.el;

  if (el && el.offsetWidth === 0) { return; }

  // Breakpoints
  if (params.breakpoints) {
    swiper.setBreakpoint();
  }

  // Save locks
  var allowSlideNext = swiper.allowSlideNext;
  var allowSlidePrev = swiper.allowSlidePrev;

  // Disable locks on resize
  swiper.allowSlideNext = true;
  swiper.allowSlidePrev = true;

  swiper.updateSize();
  swiper.updateSlides();

  if (params.freeMode) {
    var newTranslate = Math.min(Math.max(swiper.translate, swiper.maxTranslate()), swiper.minTranslate());
    swiper.setTranslate(newTranslate);
    swiper.updateActiveIndex();
    swiper.updateSlidesClasses();

    if (params.autoHeight) {
      swiper.updateAutoHeight();
    }
  } else {
    swiper.updateSlidesClasses();
    if ((params.slidesPerView === 'auto' || params.slidesPerView > 1) && swiper.isEnd && !swiper.params.centeredSlides) {
      swiper.slideTo(swiper.slides.length - 1, 0, false, true);
    } else {
      swiper.slideTo(swiper.activeIndex, 0, false, true);
    }
  }
  // Return locks after resize
  swiper.allowSlidePrev = allowSlidePrev;
  swiper.allowSlideNext = allowSlideNext;
};

var onClick = function (e) {
  var swiper = this;
  if (!swiper.allowClick) {
    if (swiper.params.preventClicks) { e.preventDefault(); }
    if (swiper.params.preventClicksPropagation && swiper.animating) {
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }
};

function attachEvents() {
  var swiper = this;

  var params = swiper.params;
  var touchEvents = swiper.touchEvents;
  var el = swiper.el;
  var wrapperEl = swiper.wrapperEl;

  {
    swiper.onTouchStart = onTouchStart.bind(swiper);
    swiper.onTouchMove = onTouchMove.bind(swiper);
    swiper.onTouchEnd = onTouchEnd.bind(swiper);
  }

  swiper.onClick = onClick.bind(swiper);

  var target = params.touchEventsTarget === 'container' ? el : wrapperEl;
  var capture = !!params.nested;

  // Touch Events
  {
    if (Browser.ie) {
      target.addEventListener(touchEvents.start, swiper.onTouchStart, false);
      (Support.touch ? target : doc).addEventListener(touchEvents.move, swiper.onTouchMove, capture);
      (Support.touch ? target : doc).addEventListener(touchEvents.end, swiper.onTouchEnd, false);
    } else {
      if (Support.touch) {
        var passiveListener = touchEvents.start === 'touchstart' && Support.passiveListener && params.passiveListeners ? { passive: true, capture: false } : false;
        target.addEventListener(touchEvents.start, swiper.onTouchStart, passiveListener);
        target.addEventListener(touchEvents.move, swiper.onTouchMove, Support.passiveListener ? { passive: false, capture: capture } : capture);
        target.addEventListener(touchEvents.end, swiper.onTouchEnd, passiveListener);
      }
      if ((params.simulateTouch && !Device.ios && !Device.android) || (params.simulateTouch && !Support.touch && Device.ios)) {
        target.addEventListener('mousedown', swiper.onTouchStart, false);
        doc.addEventListener('mousemove', swiper.onTouchMove, capture);
        doc.addEventListener('mouseup', swiper.onTouchEnd, false);
      }
    }
    // Prevent Links Clicks
    if (params.preventClicks || params.preventClicksPropagation) {
      target.addEventListener('click', swiper.onClick, true);
    }
  }

  // Resize handler
  swiper.on('resize observerUpdate', onResize);
}

function detachEvents() {
  var swiper = this;

  var params = swiper.params;
  var touchEvents = swiper.touchEvents;
  var el = swiper.el;
  var wrapperEl = swiper.wrapperEl;

  var target = params.touchEventsTarget === 'container' ? el : wrapperEl;
  var capture = !!params.nested;

  // Touch Events
  {
    if (Browser.ie) {
      target.removeEventListener(touchEvents.start, swiper.onTouchStart, false);
      (Support.touch ? target : doc).removeEventListener(touchEvents.move, swiper.onTouchMove, capture);
      (Support.touch ? target : doc).removeEventListener(touchEvents.end, swiper.onTouchEnd, false);
    } else {
      if (Support.touch) {
        var passiveListener = touchEvents.start === 'onTouchStart' && Support.passiveListener && params.passiveListeners ? { passive: true, capture: false } : false;
        target.removeEventListener(touchEvents.start, swiper.onTouchStart, passiveListener);
        target.removeEventListener(touchEvents.move, swiper.onTouchMove, capture);
        target.removeEventListener(touchEvents.end, swiper.onTouchEnd, passiveListener);
      }
      if ((params.simulateTouch && !Device.ios && !Device.android) || (params.simulateTouch && !Support.touch && Device.ios)) {
        target.removeEventListener('mousedown', swiper.onTouchStart, false);
        doc.removeEventListener('mousemove', swiper.onTouchMove, capture);
        doc.removeEventListener('mouseup', swiper.onTouchEnd, false);
      }
    }
    // Prevent Links Clicks
    if (params.preventClicks || params.preventClicksPropagation) {
      target.removeEventListener('click', swiper.onClick, true);
    }
  }

  // Resize handler
  swiper.off('resize observerUpdate', onResize);
}

var events = {
  attachEvents: attachEvents,
  detachEvents: detachEvents,
};

var setBreakpoint = function () {
  var swiper = this;
  var activeIndex = swiper.activeIndex;
  var loopedSlides = swiper.loopedSlides; if ( loopedSlides === void 0 ) loopedSlides = 0;
  var params = swiper.params;
  var breakpoints = params.breakpoints;
  if (!breakpoints || (breakpoints && Object.keys(breakpoints).length === 0)) { return; }
  // Set breakpoint for window width and update parameters
  var breakpoint = swiper.getBreakpoint(breakpoints);
  if (breakpoint && swiper.currentBreakpoint !== breakpoint) {
    var breakPointsParams = breakpoint in breakpoints ? breakpoints[breakpoint] : swiper.originalParams;
    var needsReLoop = params.loop && (breakPointsParams.slidesPerView !== params.slidesPerView);

    Utils.extend(swiper.params, breakPointsParams);

    Utils.extend(swiper, {
      allowTouchMove: swiper.params.allowTouchMove,
      allowSlideNext: swiper.params.allowSlideNext,
      allowSlidePrev: swiper.params.allowSlidePrev,
    });

    swiper.currentBreakpoint = breakpoint;

    if (needsReLoop) {
      swiper.loopDestroy();
      swiper.loopCreate();
      swiper.updateSlides();
      swiper.slideTo((activeIndex - loopedSlides) + swiper.loopedSlides, 0, false);
    }
    swiper.emit('breakpoint', breakPointsParams);
  }
};

var getBreakpoint = function (breakpoints) {
  // Get breakpoint for window width
  if (!breakpoints) { return undefined; }
  var breakpoint = false;
  var points = [];
  Object.keys(breakpoints).forEach(function (point) {
    points.push(point);
  });
  points.sort(function (a, b) { return parseInt(a, 10) - parseInt(b, 10); });
  for (var i = 0; i < points.length; i += 1) {
    var point = points[i];
    if (point >= win.innerWidth && !breakpoint) {
      breakpoint = point;
    }
  }
  return breakpoint || 'max';
};

var breakpoints = { setBreakpoint: setBreakpoint, getBreakpoint: getBreakpoint };

var addClasses = function () {
  var swiper = this;
  var classNames = swiper.classNames;
  var params = swiper.params;
  var rtl = swiper.rtl;
  var $el = swiper.$el;
  var suffixes = [];

  suffixes.push(params.direction);

  if (params.freeMode) {
    suffixes.push('free-mode');
  }
  if (!Support.flexbox) {
    suffixes.push('no-flexbox');
  }
  if (params.autoHeight) {
    suffixes.push('autoheight');
  }
  if (rtl) {
    suffixes.push('rtl');
  }
  if (params.slidesPerColumn > 1) {
    suffixes.push('multirow');
  }
  if (Device.android) {
    suffixes.push('android');
  }
  if (Device.ios) {
    suffixes.push('ios');
  }
  // WP8 Touch Events Fix
  if (win.navigator.pointerEnabled || win.navigator.msPointerEnabled) {
    suffixes.push(("wp8-" + (params.direction)));
  }

  suffixes.forEach(function (suffix) {
    classNames.push(params.containerModifierClass + suffix);
  });

  $el.addClass(classNames.join(' '));
};

var removeClasses = function () {
  var swiper = this;
  var $el = swiper.$el;
  var classNames = swiper.classNames;

  $el.removeClass(classNames.join(' '));
};

var classes = { addClasses: addClasses, removeClasses: removeClasses };

var loadImage = function (imageEl, src, srcset, sizes, checkForComplete, callback) {
  var image;
  function onReady() {
    if (callback) { callback(); }
  }
  if (!imageEl.complete || !checkForComplete) {
    if (src) {
      image = new win.Image();
      image.onload = onReady;
      image.onerror = onReady;
      if (sizes) {
        image.sizes = sizes;
      }
      if (srcset) {
        image.srcset = srcset;
      }
      if (src) {
        image.src = src;
      }
    } else {
      onReady();
    }
  } else {
    // image already loaded...
    onReady();
  }
};

var preloadImages = function () {
  var swiper = this;
  swiper.imagesToLoad = swiper.$el.find('img');
  function onReady() {
    if (typeof swiper === 'undefined' || swiper === null || !swiper || swiper.destroyed) { return; }
    if (swiper.imagesLoaded !== undefined) { swiper.imagesLoaded += 1; }
    if (swiper.imagesLoaded === swiper.imagesToLoad.length) {
      if (swiper.params.updateOnImagesReady) { swiper.update(); }
      swiper.emit('imagesReady');
    }
  }
  for (var i = 0; i < swiper.imagesToLoad.length; i += 1) {
    var imageEl = swiper.imagesToLoad[i];
    swiper.loadImage(
      imageEl,
      imageEl.currentSrc || imageEl.getAttribute('src'),
      imageEl.srcset || imageEl.getAttribute('srcset'),
      imageEl.sizes || imageEl.getAttribute('sizes'),
      true,
      onReady
    );
  }
};

var images = {
  loadImage: loadImage,
  preloadImages: preloadImages,
};

var defaults = {
  init: true,
  direction: 'horizontal',
  touchEventsTarget: 'container',
  initialSlide: 0,
  speed: 300,

  // To support iOS's swipe-to-go-back gesture (when being used in-app, with UIWebView).
  iOSEdgeSwipeDetection: false,
  iOSEdgeSwipeThreshold: 20,

  // Free mode
  freeMode: false,
  freeModeMomentum: true,
  freeModeMomentumRatio: 1,
  freeModeMomentumBounce: true,
  freeModeMomentumBounceRatio: 1,
  freeModeMomentumVelocityRatio: 1,
  freeModeSticky: false,
  freeModeMinimumVelocity: 0.02,

  // Autoheight
  autoHeight: false,

  // Set wrapper width
  setWrapperSize: false,

  // Virtual Translate
  virtualTranslate: false,

  // Effects
  effect: 'slide', // 'slide' or 'fade' or 'cube' or 'coverflow' or 'flip'

  // Breakpoints
  breakpoints: undefined,

  // Slides grid
  spaceBetween: 0,
  slidesPerView: 1,
  slidesPerColumn: 1,
  slidesPerColumnFill: 'column',
  slidesPerGroup: 1,
  centeredSlides: false,
  slidesOffsetBefore: 0, // in px
  slidesOffsetAfter: 0, // in px
  normalizeSlideIndex: true,

  // Round length
  roundLengths: false,

  // Touches
  touchRatio: 1,
  touchAngle: 45,
  simulateTouch: true,
  shortSwipes: true,
  longSwipes: true,
  longSwipesRatio: 0.5,
  longSwipesMs: 300,
  followFinger: true,
  allowTouchMove: true,
  threshold: 0,
  touchMoveStopPropagation: true,
  touchReleaseOnEdges: false,

  // Unique Navigation Elements
  uniqueNavElements: true,

  // Resistance
  resistance: true,
  resistanceRatio: 0.85,

  // Progress
  watchSlidesProgress: false,
  watchSlidesVisibility: false,

  // Cursor
  grabCursor: false,

  // Clicks
  preventClicks: true,
  preventClicksPropagation: true,
  slideToClickedSlide: false,

  // Images
  preloadImages: true,
  updateOnImagesReady: true,

  // loop
  loop: false,
  loopAdditionalSlides: 0,
  loopedSlides: null,
  loopFillGroupWithBlank: false,

  // Swiping/no swiping
  allowSlidePrev: true,
  allowSlideNext: true,
  swipeHandler: null, // '.swipe-handler',
  noSwiping: true,
  noSwipingClass: 'swiper-no-swiping',

  // Passive Listeners
  passiveListeners: true,

  // NS
  containerModifierClass: 'swiper-container-', // NEW
  slideClass: 'swiper-slide',
  slideBlankClass: 'swiper-slide-invisible-blank',
  slideActiveClass: 'swiper-slide-active',
  slideDuplicateActiveClass: 'swiper-slide-duplicate-active',
  slideVisibleClass: 'swiper-slide-visible',
  slideDuplicateClass: 'swiper-slide-duplicate',
  slideNextClass: 'swiper-slide-next',
  slideDuplicateNextClass: 'swiper-slide-duplicate-next',
  slidePrevClass: 'swiper-slide-prev',
  slideDuplicatePrevClass: 'swiper-slide-duplicate-prev',
  wrapperClass: 'swiper-wrapper',

  // Callbacks
  runCallbacksOnInit: true,
};

var prototypes = {
  update: update,
  translate: translate,
  transition: transition$1,
  slide: slide,
  loop: loop,
  grabCursor: grabCursor,
  manipulation: manipulation,
  events: events,
  breakpoints: breakpoints,
  classes: classes,
  images: images,
};

var extendedDefaults = {};

var Swiper$1 = (function (SwiperClass$$1) {
  function Swiper() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    var el;
    var params;
    if (args.length === 1 && args[0].constructor && args[0].constructor === Object) {
      params = args[0];
    } else {
      var assign;
      (assign = args, el = assign[0], params = assign[1]);
    }
    if (!params) { params = {}; }

    params = Utils.extend({}, params);
    if (el && !params.el) { params.el = el; }

    SwiperClass$$1.call(this, params);

    Object.keys(prototypes).forEach(function (prototypeGroup) {
      Object.keys(prototypes[prototypeGroup]).forEach(function (protoMethod) {
        if (!Swiper.prototype[protoMethod]) {
          Swiper.prototype[protoMethod] = prototypes[prototypeGroup][protoMethod];
        }
      });
    });

    // Swiper Instance
    var swiper = this;
    if (typeof swiper.modules === 'undefined') {
      swiper.modules = {};
    }
    Object.keys(swiper.modules).forEach(function (moduleName) {
      var module = swiper.modules[moduleName];
      if (module.params) {
        var moduleParamName = Object.keys(module.params)[0];
        var moduleParams = module.params[moduleParamName];
        if (typeof moduleParams !== 'object') { return; }
        if (!(moduleParamName in params && 'enabled' in moduleParams)) { return; }
        if (params[moduleParamName] === true) {
          params[moduleParamName] = { enabled: true };
        }
        if (
          typeof params[moduleParamName] === 'object' &&
          !('enabled' in params[moduleParamName])
        ) {
          params[moduleParamName].enabled = true;
        }
        if (!params[moduleParamName]) { params[moduleParamName] = { enabled: false }; }
      }
    });

    // Extend defaults with modules params
    var swiperParams = Utils.extend({}, defaults);
    swiper.useModulesParams(swiperParams);

    // Extend defaults with passed params
    swiper.params = Utils.extend({}, swiperParams, extendedDefaults, params);
    swiper.originalParams = Utils.extend({}, swiper.params);
    swiper.passedParams = Utils.extend({}, params);

    // Find el
    var $el = $$1(swiper.params.el);
    el = $el[0];

    if (!el) {
      return undefined;
    }

    if ($el.length > 1) {
      var swipers = [];
      $el.each(function (index, containerEl) {
        var newParams = Utils.extend({}, params, { el: containerEl });
        swipers.push(new Swiper(newParams));
      });
      return swipers;
    }

    el.swiper = swiper;
    $el.data('swiper', swiper);

    // Find Wrapper
    var $wrapperEl = $el.children(("." + (swiper.params.wrapperClass)));

    // Extend Swiper
    Utils.extend(swiper, {
      $el: $el,
      el: el,
      $wrapperEl: $wrapperEl,
      wrapperEl: $wrapperEl[0],

      // Classes
      classNames: [],

      // Slides
      slides: $$1(),
      slidesGrid: [],
      snapGrid: [],
      slidesSizesGrid: [],

      // isDirection
      isHorizontal: function isHorizontal() {
        return swiper.params.direction === 'horizontal';
      },
      isVertical: function isVertical() {
        return swiper.params.direction === 'vertical';
      },
      // RTL
      rtl: swiper.params.direction === 'horizontal' && (el.dir.toLowerCase() === 'rtl' || $el.css('direction') === 'rtl'),
      wrongRTL: $wrapperEl.css('display') === '-webkit-box',

      // Indexes
      activeIndex: 0,
      realIndex: 0,

      //
      isBeginning: true,
      isEnd: false,

      // Props
      translate: 0,
      progress: 0,
      velocity: 0,
      animating: false,

      // Locks
      allowSlideNext: swiper.params.allowSlideNext,
      allowSlidePrev: swiper.params.allowSlidePrev,

      // Touch Events
      touchEvents: (function touchEvents() {
        var touch = ['touchstart', 'touchmove', 'touchend'];
        var desktop = ['mousedown', 'mousemove', 'mouseup'];
        if (win.navigator.pointerEnabled) {
          desktop = ['pointerdown', 'pointermove', 'pointerup'];
        } else if (win.navigator.msPointerEnabled) {
          desktop = ['MSPointerDown', 'MsPointerMove', 'MsPointerUp'];
        }

        return {
          start: Support.touch || !swiper.params.simulateTouch ? touch[0] : desktop[0],
          move: Support.touch || !swiper.params.simulateTouch ? touch[1] : desktop[1],
          end: Support.touch || !swiper.params.simulateTouch ? touch[2] : desktop[2],
        };
      }()),
      touchEventsData: {
        isTouched: undefined,
        isMoved: undefined,
        allowTouchCallbacks: undefined,
        touchStartTime: undefined,
        isScrolling: undefined,
        currentTranslate: undefined,
        startTranslate: undefined,
        allowThresholdMove: undefined,
        // Form elements to match
        formElements: 'input, select, option, textarea, button, video',
        // Last click time
        lastClickTime: Utils.now(),
        clickTimeout: undefined,
        // Velocities
        velocities: [],
        allowMomentumBounce: undefined,
        isTouchEvent: undefined,
        startMoving: undefined,
      },

      // Clicks
      allowClick: true,

      // Touches
      allowTouchMove: swiper.params.allowTouchMove,

      touches: {
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        diff: 0,
      },

      // Images
      imagesToLoad: [],
      imagesLoaded: 0,

    });

    // Install Modules
    swiper.useModules();

    // Init
    if (swiper.params.init) {
      swiper.init();
    }

    // Return app instance
    return swiper;
  }

  if ( SwiperClass$$1 ) Swiper.__proto__ = SwiperClass$$1;
  Swiper.prototype = Object.create( SwiperClass$$1 && SwiperClass$$1.prototype );
  Swiper.prototype.constructor = Swiper;

  var staticAccessors = { extendedDefaults: {},defaults: {},Class: {},$: {} };
  Swiper.prototype.slidesPerViewDynamic = function slidesPerViewDynamic () {
    var swiper = this;
    var params = swiper.params;
    var slides = swiper.slides;
    var slidesGrid = swiper.slidesGrid;
    var swiperSize = swiper.size;
    var activeIndex = swiper.activeIndex;
    var spv = 1;
    if (params.centeredSlides) {
      var slideSize = slides[activeIndex].swiperSlideSize;
      var breakLoop;
      for (var i = activeIndex + 1; i < slides.length; i += 1) {
        if (slides[i] && !breakLoop) {
          slideSize += slides[i].swiperSlideSize;
          spv += 1;
          if (slideSize > swiperSize) { breakLoop = true; }
        }
      }
      for (var i$1 = activeIndex - 1; i$1 >= 0; i$1 -= 1) {
        if (slides[i$1] && !breakLoop) {
          slideSize += slides[i$1].swiperSlideSize;
          spv += 1;
          if (slideSize > swiperSize) { breakLoop = true; }
        }
      }
    } else {
      for (var i$2 = activeIndex + 1; i$2 < slides.length; i$2 += 1) {
        if (slidesGrid[i$2] - slidesGrid[activeIndex] < swiperSize) {
          spv += 1;
        }
      }
    }
    return spv;
  };
  Swiper.prototype.update = function update$$1 () {
    var swiper = this;
    if (!swiper || swiper.destroyed) { return; }
    swiper.updateSize();
    swiper.updateSlides();
    swiper.updateProgress();
    swiper.updateSlidesClasses();

    var newTranslate;
    function setTranslate() {
      newTranslate = Math.min(Math.max(swiper.translate, swiper.maxTranslate()), swiper.minTranslate());
      swiper.setTranslate(newTranslate);
      swiper.updateActiveIndex();
      swiper.updateSlidesClasses();
    }
    var translated;
    if (swiper.params.freeMode) {
      setTranslate();
      if (swiper.params.autoHeight) {
        swiper.updateAutoHeight();
      }
    } else {
      if ((swiper.params.slidesPerView === 'auto' || swiper.params.slidesPerView > 1) && swiper.isEnd && !swiper.params.centeredSlides) {
        translated = swiper.slideTo(swiper.slides.length - 1, 0, false, true);
      } else {
        translated = swiper.slideTo(swiper.activeIndex, 0, false, true);
      }
      if (!translated) {
        setTranslate();
      }
    }
    swiper.emit('update');
  };
  Swiper.prototype.init = function init () {
    var swiper = this;
    if (swiper.initialized) { return; }

    swiper.emit('beforeInit');

    // Set breakpoint
    if (swiper.params.breakpoints) {
      swiper.setBreakpoint();
    }

    // Add Classes
    swiper.addClasses();

    // Create loop
    if (swiper.params.loop) {
      swiper.loopCreate();
    }

    // Update size
    swiper.updateSize();

    // Update slides
    swiper.updateSlides();

    // Set Grab Cursor
    if (swiper.params.grabCursor) {
      swiper.setGrabCursor();
    }

    if (swiper.params.preloadImages) {
      swiper.preloadImages();
    }

    // Slide To Initial Slide
    if (swiper.params.loop) {
      swiper.slideTo(swiper.params.initialSlide + swiper.loopedSlides, 0, swiper.params.runCallbacksOnInit);
    } else {
      swiper.slideTo(swiper.params.initialSlide, 0, swiper.params.runCallbacksOnInit);
    }

    // Attach events
    swiper.attachEvents();

    // Init Flag
    swiper.initialized = true;

    // Emit
    swiper.emit('init');
  };
  Swiper.prototype.destroy = function destroy (deleteInstance, cleanStyles) {
    if ( deleteInstance === void 0 ) deleteInstance = true;
    if ( cleanStyles === void 0 ) cleanStyles = true;

    var swiper = this;
    var params = swiper.params;
    var $el = swiper.$el;
    var $wrapperEl = swiper.$wrapperEl;
    var slides = swiper.slides;
    swiper.emit('beforeDestroy');

    // Init Flag
    swiper.initialized = false;

    // Detach events
    swiper.detachEvents();

    // Destroy loop
    if (params.loop) {
      swiper.loopDestroy();
    }

    // Cleanup styles
    if (cleanStyles) {
      swiper.removeClasses();
      $el.removeAttr('style');
      $wrapperEl.removeAttr('style');
      if (slides && slides.length) {
        slides
          .removeClass([
            params.slideVisibleClass,
            params.slideActiveClass,
            params.slideNextClass,
            params.slidePrevClass ].join(' '))
          .removeAttr('style')
          .removeAttr('data-swiper-slide-index')
          .removeAttr('data-swiper-column')
          .removeAttr('data-swiper-row');
      }
    }

    swiper.emit('destroy');

    // Detach emitter events
    Object.keys(swiper.eventsListeners).forEach(function (eventName) {
      swiper.off(eventName);
    });

    if (deleteInstance !== false) {
      swiper.$el[0].swiper = null;
      swiper.$el.data('swiper', null);
      Utils.deleteProps(swiper);
    }
    swiper.destroyed = true;
  };
  Swiper.extendDefaults = function extendDefaults (newDefaults) {
    Utils.extend(extendedDefaults, newDefaults);
  };
  staticAccessors.extendedDefaults.get = function () {
    return extendedDefaults;
  };
  staticAccessors.defaults.get = function () {
    return defaults;
  };
  staticAccessors.Class.get = function () {
    return SwiperClass$$1;
  };
  staticAccessors.$.get = function () {
    return $$1;
  };

  Object.defineProperties( Swiper, staticAccessors );

  return Swiper;
}(SwiperClass));

var Device$2 = {
  name: 'device',
  proto: {
    device: Device,
  },
  static: {
    device: Device,
  },
};

var Support$2 = {
  name: 'support',
  proto: {
    support: Support,
  },
  static: {
    support: Support,
  },
};

var Browser$2 = {
  name: 'browser',
  proto: {
    browser: Browser,
  },
  static: {
    browser: Browser,
  },
};

var Resize = {
  name: 'resize',
  create: function create() {
    var swiper = this;
    Utils.extend(swiper, {
      resize: {
        resizeHandler: function resizeHandler() {
          if (!swiper || swiper.destroyed || !swiper.initialized) { return; }
          swiper.emit('beforeResize');
          swiper.emit('resize');
        },
        orientationChangeHandler: function orientationChangeHandler() {
          if (!swiper || swiper.destroyed || !swiper.initialized) { return; }
          swiper.emit('orientationchange');
        },
      },
    });
  },
  on: {
    init: function init() {
      var swiper = this;
      // Emit resize
      win.addEventListener('resize', swiper.resize.resizeHandler);

      // Emit orientationchange
      win.addEventListener('orientationchange', swiper.resize.orientationChangeHandler);
    },
    destroy: function destroy() {
      var swiper = this;
      win.removeEventListener('resize', swiper.resize.resizeHandler);
      win.removeEventListener('orientationchange', swiper.resize.orientationChangeHandler);
    },
  },
};

var Observer = {
  func: win.MutationObserver || win.WebkitMutationObserver,
  attach: function attach(target, options) {
    if ( options === void 0 ) options = {};

    var swiper = this;

    var ObserverFunc = Observer.func;
    var observer = new ObserverFunc(function (mutations) {
      mutations.forEach(function (mutation) {
        swiper.emit('observerUpdate', mutation);
      });
    });

    observer.observe(target, {
      attributes: typeof options.attributes === 'undefined' ? true : options.attributes,
      childList: typeof options.childList === 'undefined' ? true : options.childList,
      characterData: typeof options.characterData === 'undefined' ? true : options.characterData,
    });

    swiper.observer.observers.push(observer);
  },
  init: function init() {
    var swiper = this;
    if (!Support.observer || !swiper.params.observer) { return; }
    if (swiper.params.observeParents) {
      var containerParents = swiper.$el.parents();
      for (var i = 0; i < containerParents.length; i += 1) {
        swiper.observer.attach(containerParents[i]);
      }
    }
    // Observe container
    swiper.observer.attach(swiper.$el[0], { childList: false });

    // Observe wrapper
    swiper.observer.attach(swiper.$wrapperEl[0], { attributes: false });
  },
  destroy: function destroy() {
    var swiper = this;
    swiper.observer.observers.forEach(function (observer) {
      observer.disconnect();
    });
    swiper.observer.observers = [];
  },
};

var Observer$1 = {
  name: 'observer',
  params: {
    observer: false,
    observeParents: false,
  },
  create: function create() {
    var swiper = this;
    Utils.extend(swiper, {
      observer: {
        init: Observer.init.bind(swiper),
        attach: Observer.attach.bind(swiper),
        destroy: Observer.destroy.bind(swiper),
        observers: [],
      },
    });
  },
  on: {
    init: function init() {
      var swiper = this;
      swiper.observer.init();
    },
    destroy: function destroy() {
      var swiper = this;
      swiper.observer.destroy();
    },
  },
};

var Virtual = {
  update: function update(force) {
    var swiper = this;
    var ref = swiper.params;
    var slidesPerView = ref.slidesPerView;
    var slidesPerGroup = ref.slidesPerGroup;
    var centeredSlides = ref.centeredSlides;
    var ref$1 = swiper.virtual;
    var previousFrom = ref$1.from;
    var previousTo = ref$1.to;
    var slides = ref$1.slides;
    var previousSlidesGrid = ref$1.slidesGrid;
    var renderSlide = ref$1.renderSlide;
    var previousOffset = ref$1.offset;
    swiper.updateActiveIndex();
    var activeIndex = swiper.activeIndex || 0;

    var offsetProp;
    if (swiper.rtl && swiper.isHorizontal()) { offsetProp = 'right'; }
    else { offsetProp = swiper.isHorizontal() ? 'left' : 'top'; }

    var slidesAfter;
    var slidesBefore;
    if (centeredSlides) {
      slidesAfter = Math.floor(slidesPerView / 2) + slidesPerGroup;
      slidesBefore = Math.floor(slidesPerView / 2) + slidesPerGroup;
    } else {
      slidesAfter = slidesPerView + (slidesPerGroup - 1);
      slidesBefore = slidesPerGroup;
    }
    var from = Math.max((activeIndex || 0) - slidesBefore, 0);
    var to = Math.min((activeIndex || 0) + slidesAfter, slides.length - 1);
    var offset = (swiper.slidesGrid[from] || 0) - (swiper.slidesGrid[0] || 0);

    Utils.extend(swiper.virtual, {
      from: from,
      to: to,
      offset: offset,
      slidesGrid: swiper.slidesGrid,
    });

    function onRendered() {
      swiper.updateSlides();
      swiper.updateProgress();
      swiper.updateSlidesClasses();
      if (swiper.lazy && swiper.params.lazy.enabled) {
        swiper.lazy.load();
      }
    }

    if (previousFrom === from && previousTo === to && !force) {
      if (swiper.slidesGrid !== previousSlidesGrid && offset !== previousOffset) {
        swiper.slides.css(offsetProp, (offset + "px"));
      }
      swiper.updateProgress();
      return;
    }
    if (swiper.params.virtual.renderExternal) {
      swiper.params.virtual.renderExternal.call(swiper, {
        offset: offset,
        from: from,
        to: to,
        slides: (function getSlides() {
          var slidesToRender = [];
          for (var i = from; i <= to; i += 1) {
            slidesToRender.push(slides[i]);
          }
          return slidesToRender;
        }()),
      });
      onRendered();
      return;
    }
    var prependIndexes = [];
    var appendIndexes = [];
    if (force) {
      swiper.$wrapperEl.find(("." + (swiper.params.slideClass))).remove();
    } else {
      for (var i = previousFrom; i <= previousTo; i += 1) {
        if (i < from || i > to) {
          swiper.$wrapperEl.find(("." + (swiper.params.slideClass) + "[data-swiper-slide-index=\"" + i + "\"]")).remove();
        }
      }
    }
    for (var i$1 = 0; i$1 < slides.length; i$1 += 1) {
      if (i$1 >= from && i$1 <= to) {
        if (typeof previousTo === 'undefined' || force) {
          appendIndexes.push(i$1);
        } else {
          if (i$1 > previousTo) { appendIndexes.push(i$1); }
          if (i$1 < previousFrom) { prependIndexes.push(i$1); }
        }
      }
    }
    appendIndexes.forEach(function (index) {
      swiper.$wrapperEl.append(renderSlide(slides[index], index));
    });
    prependIndexes.sort(function (a, b) { return a < b; }).forEach(function (index) {
      swiper.$wrapperEl.prepend(renderSlide(slides[index], index));
    });
    swiper.$wrapperEl.children('.swiper-slide').css(offsetProp, (offset + "px"));
    onRendered();
  },
  renderSlide: function renderSlide(slide, index) {
    var swiper = this;
    var params = swiper.params.virtual;
    if (params.cache && swiper.virtual.cache[index]) {
      return swiper.virtual.cache[index];
    }
    var $slideEl = params.renderSlide
      ? $$1(params.renderSlide.call(swiper, slide, index))
      : $$1(("<div class=\"" + (swiper.params.slideClass) + "\" data-swiper-slide-index=\"" + index + "\">" + slide + "</div>"));
    if (!$slideEl.attr('data-swiper-slide-index')) { $slideEl.attr('data-swiper-slide-index', index); }
    if (params.cache) { swiper.virtual.cache[index] = $slideEl; }
    return $slideEl;
  },
  appendSlide: function appendSlide(slide) {
    var swiper = this;
    swiper.virtual.slides.push(slide);
    swiper.virtual.update(true);
  },
  prependSlide: function prependSlide(slide) {
    var swiper = this;
    swiper.virtual.slides.unshift(slide);
    if (swiper.params.virtual.cache) {
      var cache = swiper.virtual.cache;
      var newCache = {};
      Object.keys(cache).forEach(function (cachedIndex) {
        newCache[cachedIndex + 1] = cache[cachedIndex];
      });
      swiper.virtual.cache = newCache;
    }
    swiper.virtual.update(true);
    swiper.slideNext(0);
  },
};

var Virtual$1 = {
  name: 'virtual',
  params: {
    virtual: {
      enabled: false,
      slides: [],
      cache: true,
      renderSlide: null,
      renderExternal: null,
    },
  },
  create: function create() {
    var swiper = this;
    Utils.extend(swiper, {
      virtual: {
        update: Virtual.update.bind(swiper),
        appendSlide: Virtual.appendSlide.bind(swiper),
        prependSlide: Virtual.prependSlide.bind(swiper),
        renderSlide: Virtual.renderSlide.bind(swiper),
        slides: swiper.params.virtual.slides,
        cache: {},
      },
    });
  },
  on: {
    beforeInit: function beforeInit() {
      var swiper = this;
      if (!swiper.params.virtual.enabled) { return; }
      swiper.classNames.push(((swiper.params.containerModifierClass) + "virtual"));
      var overwriteParams = {
        watchSlidesProgress: true,
      };
      Utils.extend(swiper.params, overwriteParams);
      Utils.extend(swiper.originalParams, overwriteParams);

      swiper.virtual.update();
    },
    setTranslate: function setTranslate() {
      var swiper = this;
      if (!swiper.params.virtual.enabled) { return; }
      swiper.virtual.update();
    },
  },
};

var Keyboard = {
  handle: function handle(event) {
    var swiper = this;
    var e = event;
    if (e.originalEvent) { e = e.originalEvent; } // jquery fix
    var kc = e.keyCode || e.charCode;
    // Directions locks
    if (!swiper.allowSlideNext && ((swiper.isHorizontal() && kc === 39) || (swiper.isVertical() && kc === 40))) {
      return false;
    }
    if (!swiper.allowSlidePrev && ((swiper.isHorizontal() && kc === 37) || (swiper.isVertical() && kc === 38))) {
      return false;
    }
    if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) {
      return undefined;
    }
    if (doc.activeElement && doc.activeElement.nodeName && (doc.activeElement.nodeName.toLowerCase() === 'input' || doc.activeElement.nodeName.toLowerCase() === 'textarea')) {
      return undefined;
    }
    if (kc === 37 || kc === 39 || kc === 38 || kc === 40) {
      var inView = false;
      // Check that swiper should be inside of visible area of window
      if (swiper.$el.parents(("." + (swiper.params.slideClass))).length > 0 && swiper.$el.parents(("." + (swiper.params.slideActiveClass))).length === 0) {
        return undefined;
      }
      var windowScroll = {
        left: win.pageXOffset,
        top: win.pageYOffset,
      };
      var windowWidth = win.innerWidth;
      var windowHeight = win.innerHeight;
      var swiperOffset = swiper.$el.offset();
      if (swiper.rtl) { swiperOffset.left -= swiper.$el[0].scrollLeft; }
      var swiperCoord = [
        [swiperOffset.left, swiperOffset.top],
        [swiperOffset.left + swiper.width, swiperOffset.top],
        [swiperOffset.left, swiperOffset.top + swiper.height],
        [swiperOffset.left + swiper.width, swiperOffset.top + swiper.height] ];
      for (var i = 0; i < swiperCoord.length; i += 1) {
        var point = swiperCoord[i];
        if (
          point[0] >= windowScroll.left && point[0] <= windowScroll.left + windowWidth &&
            point[1] >= windowScroll.top && point[1] <= windowScroll.top + windowHeight
        ) {
          inView = true;
        }
      }
      if (!inView) { return undefined; }
    }
    if (swiper.isHorizontal()) {
      if (kc === 37 || kc === 39) {
        if (e.preventDefault) { e.preventDefault(); }
        else { e.returnValue = false; }
      }
      if ((kc === 39 && !swiper.rtl) || (kc === 37 && swiper.rtl)) { swiper.slideNext(); }
      if ((kc === 37 && !swiper.rtl) || (kc === 39 && swiper.rtl)) { swiper.slidePrev(); }
    } else {
      if (kc === 38 || kc === 40) {
        if (e.preventDefault) { e.preventDefault(); }
        else { e.returnValue = false; }
      }
      if (kc === 40) { swiper.slideNext(); }
      if (kc === 38) { swiper.slidePrev(); }
    }
    swiper.emit('keyPress', kc);
    return undefined;
  },
  enable: function enable() {
    var swiper = this;
    if (swiper.keyboard.enabled) { return; }
    $$1(doc).on('keydown', swiper.keyboard.handle);
    swiper.keyboard.enabled = true;
  },
  disable: function disable() {
    var swiper = this;
    if (!swiper.keyboard.enabled) { return; }
    $$1(doc).off('keydown', swiper.keyboard.handle);
    swiper.keyboard.enabled = false;
  },
};

var Keyboard$1 = {
  name: 'keyboard',
  params: {
    keyboard: {
      enabled: false,
    },
  },
  create: function create() {
    var swiper = this;
    Utils.extend(swiper, {
      keyboard: {
        enabled: false,
        enable: Keyboard.enable.bind(swiper),
        disable: Keyboard.disable.bind(swiper),
        handle: Keyboard.handle.bind(swiper),
      },
    });
  },
  on: {
    init: function init() {
      var swiper = this;
      if (swiper.params.keyboard.enabled) {
        swiper.keyboard.enable();
      }
    },
    destroy: function destroy() {
      var swiper = this;
      if (swiper.keyboard.enabled) {
        swiper.keyboard.disable();
      }
    },
  },
};

function isEventSupported() {
  var eventName = 'onwheel';
  var isSupported = eventName in doc;

  if (!isSupported) {
    var element = doc.createElement('div');
    element.setAttribute(eventName, 'return;');
    isSupported = typeof element[eventName] === 'function';
  }

  if (!isSupported &&
    doc.implementation &&
    doc.implementation.hasFeature &&
    // always returns true in newer browsers as per the standard.
    // @see http://dom.spec.whatwg.org/#dom-domimplementation-hasfeature
    doc.implementation.hasFeature('', '') !== true
  ) {
    // This is the only way to test support for the `wheel` event in IE9+.
    isSupported = doc.implementation.hasFeature('Events.wheel', '3.0');
  }

  return isSupported;
}
var Mousewheel = {
  lastScrollTime: Utils.now(),
  event: (function getEvent() {
    if (win.navigator.userAgent.indexOf('firefox') > -1) { return 'DOMMouseScroll'; }
    return isEventSupported() ? 'wheel' : 'mousewheel';
  }()),
  normalize: function normalize(e) {
    // Reasonable defaults
    var PIXEL_STEP = 10;
    var LINE_HEIGHT = 40;
    var PAGE_HEIGHT = 800;

    var sX = 0;
    var sY = 0; // spinX, spinY
    var pX = 0;
    var pY = 0; // pixelX, pixelY

    // Legacy
    if ('detail' in e) {
      sY = e.detail;
    }
    if ('wheelDelta' in e) {
      sY = -e.wheelDelta / 120;
    }
    if ('wheelDeltaY' in e) {
      sY = -e.wheelDeltaY / 120;
    }
    if ('wheelDeltaX' in e) {
      sX = -e.wheelDeltaX / 120;
    }

    // side scrolling on FF with DOMMouseScroll
    if ('axis' in e && e.axis === e.HORIZONTAL_AXIS) {
      sX = sY;
      sY = 0;
    }

    pX = sX * PIXEL_STEP;
    pY = sY * PIXEL_STEP;

    if ('deltaY' in e) {
      pY = e.deltaY;
    }
    if ('deltaX' in e) {
      pX = e.deltaX;
    }

    if ((pX || pY) && e.deltaMode) {
      if (e.deltaMode === 1) { // delta in LINE units
        pX *= LINE_HEIGHT;
        pY *= LINE_HEIGHT;
      } else { // delta in PAGE units
        pX *= PAGE_HEIGHT;
        pY *= PAGE_HEIGHT;
      }
    }

    // Fall-back if spin cannot be determined
    if (pX && !sX) {
      sX = (pX < 1) ? -1 : 1;
    }
    if (pY && !sY) {
      sY = (pY < 1) ? -1 : 1;
    }

    return {
      spinX: sX,
      spinY: sY,
      pixelX: pX,
      pixelY: pY,
    };
  },
  handle: function handle(event) {
    var e = event;
    var swiper = this;
    var params = swiper.params.mousewheel;
    if (e.originalEvent) { e = e.originalEvent; } // jquery fix
    var delta = 0;
    var rtlFactor = swiper.rtl ? -1 : 1;

    var data = Mousewheel.normalize(e);

    if (params.forceToAxis) {
      if (swiper.isHorizontal()) {
        if (Math.abs(data.pixelX) > Math.abs(data.pixelY)) { delta = data.pixelX * rtlFactor; }
        else { return true; }
      } else if (Math.abs(data.pixelY) > Math.abs(data.pixelX)) { delta = data.pixelY; }
      else { return true; }
    } else {
      delta = Math.abs(data.pixelX) > Math.abs(data.pixelY) ? -data.pixelX * rtlFactor : -data.pixelY;
    }

    if (delta === 0) { return true; }

    if (params.invert) { delta = -delta; }

    if (!swiper.params.freeMode) {
      if (Utils.now() - swiper.mousewheel.lastScrollTime > 60) {
        if (delta < 0) {
          if ((!swiper.isEnd || swiper.params.loop) && !swiper.animating) {
            swiper.slideNext();
            swiper.emit('scroll', e);
          } else if (params.releaseOnEdges) { return true; }
        } else if ((!swiper.isBeginning || swiper.params.loop) && !swiper.animating) {
          swiper.slidePrev();
          swiper.emit('scroll', e);
        } else if (params.releaseOnEdges) { return true; }
      }
      swiper.mousewheel.lastScrollTime = (new win.Date()).getTime();
    } else {
      // Freemode or scrollContainer:
      var position = swiper.getTranslate() + (delta * params.sensitivity);
      var wasBeginning = swiper.isBeginning;
      var wasEnd = swiper.isEnd;

      if (position >= swiper.minTranslate()) { position = swiper.minTranslate(); }
      if (position <= swiper.maxTranslate()) { position = swiper.maxTranslate(); }

      swiper.setTransition(0);
      swiper.setTranslate(position);
      swiper.updateProgress();
      swiper.updateActiveIndex();
      swiper.updateSlidesClasses();

      if ((!wasBeginning && swiper.isBeginning) || (!wasEnd && swiper.isEnd)) {
        swiper.updateSlidesClasses();
      }

      if (swiper.params.freeModeSticky) {
        clearTimeout(swiper.mousewheel.timeout);
        swiper.mousewheel.timeout = Utils.nextTick(function () {
          swiper.slideReset();
        }, 300);
      }
      // Emit event
      swiper.emit('scroll', e);

      // Stop autoplay
      if (swiper.params.autoplay && swiper.params.autoplayDisableOnInteraction) { swiper.stopAutoplay(); }

      // Return page scroll on edge positions
      if (position === 0 || position === swiper.maxTranslate()) { return true; }
    }

    if (e.preventDefault) { e.preventDefault(); }
    else { e.returnValue = false; }
    return false;
  },
  enable: function enable() {
    var swiper = this;
    if (!Mousewheel.event) { return false; }
    if (swiper.mousewheel.enabled) { return false; }
    var target = swiper.$el;
    if (swiper.params.mousewheel.eventsTarged !== 'container') {
      target = $$1(swiper.params.mousewheel.eventsTarged);
    }
    target.on(Mousewheel.event, swiper.mousewheel.handle);
    swiper.mousewheel.enabled = true;
    return true;
  },
  disable: function disable() {
    var swiper = this;
    if (!Mousewheel.event) { return false; }
    if (!swiper.mousewheel.enabled) { return false; }
    var target = swiper.$el;
    if (swiper.params.mousewheel.eventsTarged !== 'container') {
      target = $$1(swiper.params.mousewheel.eventsTarged);
    }
    target.off(Mousewheel.event, swiper.mousewheel.handle);
    swiper.mousewheel.enabled = false;
    return true;
  },
};

var Mousewheel$1 = {
  name: 'mousewheel',
  params: {
    mousewheel: {
      enabled: false,
      releaseOnEdges: false,
      invert: false,
      forceToAxis: false,
      sensitivity: 1,
      eventsTarged: 'container',
    },
  },
  create: function create() {
    var swiper = this;
    Utils.extend(swiper, {
      mousewheel: {
        enabled: false,
        enable: Mousewheel.enable.bind(swiper),
        disable: Mousewheel.disable.bind(swiper),
        handle: Mousewheel.handle.bind(swiper),
        lastScrollTime: Utils.now(),
      },
    });
  },
  on: {
    init: function init() {
      var swiper = this;
      if (swiper.params.mousewheel.enabled) { swiper.mousewheel.enable(); }
    },
    destroy: function destroy() {
      var swiper = this;
      if (swiper.mousewheel.enabled) { swiper.mousewheel.disable(); }
    },
  },
};

var Navigation = {
  update: function update() {
    // Update Navigation Buttons
    var swiper = this;
    var params = swiper.params.navigation;

    if (swiper.params.loop) { return; }
    var ref = swiper.navigation;
    var $nextEl = ref.$nextEl;
    var $prevEl = ref.$prevEl;

    if ($prevEl && $prevEl.length > 0) {
      if (swiper.isBeginning) {
        $prevEl.addClass(params.disabledClass);
      } else {
        $prevEl.removeClass(params.disabledClass);
      }
    }
    if ($nextEl && $nextEl.length > 0) {
      if (swiper.isEnd) {
        $nextEl.addClass(params.disabledClass);
      } else {
        $nextEl.removeClass(params.disabledClass);
      }
    }
  },
  init: function init() {
    var swiper = this;
    var params = swiper.params.navigation;
    if (!(params.nextEl || params.prevEl)) { return; }

    var $nextEl;
    var $prevEl;
    if (params.nextEl) {
      $nextEl = $$1(params.nextEl);
      if (
        swiper.params.uniqueNavElements &&
        typeof params.nextEl === 'string' &&
        $nextEl.length > 1 &&
        swiper.$el.find(params.nextEl).length === 1
      ) {
        $nextEl = swiper.$el.find(params.nextEl);
      }
    }
    if (params.prevEl) {
      $prevEl = $$1(params.prevEl);
      if (
        swiper.params.uniqueNavElements &&
        typeof params.prevEl === 'string' &&
        $prevEl.length > 1 &&
        swiper.$el.find(params.prevEl).length === 1
      ) {
        $prevEl = swiper.$el.find(params.prevEl);
      }
    }

    if ($nextEl && $nextEl.length > 0) {
      $nextEl.on('click', function (e) {
        e.preventDefault();
        if (swiper.isEnd && !swiper.params.loop) { return; }
        swiper.slideNext();
      });
    }
    if ($prevEl && $prevEl.length > 0) {
      $prevEl.on('click', function (e) {
        e.preventDefault();
        if (swiper.isBeginning && !swiper.params.loop) { return; }
        swiper.slidePrev();
      });
    }

    Utils.extend(swiper.navigation, {
      $nextEl: $nextEl,
      nextEl: $nextEl && $nextEl[0],
      $prevEl: $prevEl,
      prevEl: $prevEl && $prevEl[0],
    });
  },
  destroy: function destroy() {
    var swiper = this;
    var ref = swiper.navigation;
    var $nextEl = ref.$nextEl;
    var $prevEl = ref.$prevEl;
    if ($nextEl && $nextEl.length) {
      $nextEl.off('click');
      $nextEl.removeClass(swiper.params.navigation.disabledClass);
    }
    if ($prevEl && $prevEl.length) {
      $prevEl.off('click');
      $prevEl.removeClass(swiper.params.navigation.disabledClass);
    }
  },
};

var Navigation$1 = {
  name: 'navigation',
  params: {
    navigation: {
      nextEl: null,
      prevEl: null,

      hideOnClick: false,
      disabledClass: 'swiper-button-disabled',
      hiddenClass: 'swiper-button-hidden',
    },
  },
  create: function create() {
    var swiper = this;
    Utils.extend(swiper, {
      navigation: {
        init: Navigation.init.bind(swiper),
        update: Navigation.update.bind(swiper),
        destroy: Navigation.destroy.bind(swiper),
      },
    });
  },
  on: {
    init: function init() {
      var swiper = this;
      swiper.navigation.init();
      swiper.navigation.update();
    },
    toEdge: function toEdge() {
      var swiper = this;
      swiper.navigation.update();
    },
    fromEdge: function fromEdge() {
      var swiper = this;
      swiper.navigation.update();
    },
    destroy: function destroy() {
      var swiper = this;
      swiper.navigation.destroy();
    },
    click: function click(e) {
      var swiper = this;
      var ref = swiper.navigation;
      var $nextEl = ref.$nextEl;
      var $prevEl = ref.$prevEl;
      if (
        swiper.params.navigation.hideOnClick &&
        !$$1(e.target).is($prevEl) &&
        !$$1(e.target).is($nextEl)
      ) {
        if ($nextEl) { $nextEl.toggleClass(swiper.params.navigation.hiddenClass); }
        if ($prevEl) { $prevEl.toggleClass(swiper.params.navigation.hiddenClass); }
      }
    },
  },
};

var Pagination = {
  update: function update() {
    // Render || Update Pagination bullets/items
    var swiper = this;
    var rtl = swiper.rtl;
    var params = swiper.params.pagination;
    if (!params.el || !swiper.pagination.el || !swiper.pagination.$el || swiper.pagination.$el.length === 0) { return; }
    var slidesLength = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.slides.length : swiper.slides.length;
    var $el = swiper.pagination.$el;
    // Current/Total
    var current;
    var total = swiper.params.loop ? Math.ceil((slidesLength - (swiper.loopedSlides * 2)) / swiper.params.slidesPerGroup) : swiper.snapGrid.length;
    if (swiper.params.loop) {
      current = Math.ceil((swiper.activeIndex - swiper.loopedSlides) / swiper.params.slidesPerGroup);
      if (current > slidesLength - 1 - (swiper.loopedSlides * 2)) {
        current -= (slidesLength - (swiper.loopedSlides * 2));
      }
      if (current > total - 1) { current -= total; }
      if (current < 0 && swiper.params.paginationType !== 'bullets') { current = total + current; }
    } else if (typeof swiper.snapIndex !== 'undefined') {
      current = swiper.snapIndex;
    } else {
      current = swiper.activeIndex || 0;
    }
    // Types
    if (params.type === 'bullets' && swiper.pagination.bullets && swiper.pagination.bullets.length > 0) {
      var bullets = swiper.pagination.bullets;
      if (params.dynamicBullets) {
        swiper.pagination.bulletSize = bullets.eq(0)[swiper.isHorizontal() ? 'outerWidth' : 'outerHeight'](true);
        $el.css(swiper.isHorizontal() ? 'width' : 'height', ((swiper.pagination.bulletSize * 5) + "px"));
      }
      bullets.removeClass(((params.bulletActiveClass) + " " + (params.bulletActiveClass) + "-next " + (params.bulletActiveClass) + "-next-next " + (params.bulletActiveClass) + "-prev " + (params.bulletActiveClass) + "-prev-prev"));
      if ($el.length > 1) {
        bullets.each(function (index, bullet) {
          var $bullet = $$1(bullet);
          if ($bullet.index() === current) {
            $bullet.addClass(params.bulletActiveClass);
            if (params.dynamicBullets) {
              $bullet
                .prev()
                .addClass(((params.bulletActiveClass) + "-prev"))
                .prev()
                .addClass(((params.bulletActiveClass) + "-prev-prev"));
              $bullet
                .next()
                .addClass(((params.bulletActiveClass) + "-next"))
                .next()
                .addClass(((params.bulletActiveClass) + "-next-next"));
            }
          }
        });
      } else {
        var $bullet = bullets.eq(current);
        $bullet.addClass(params.bulletActiveClass);
        if (params.dynamicBullets) {
          $bullet
            .prev()
            .addClass(((params.bulletActiveClass) + "-prev"))
            .prev()
            .addClass(((params.bulletActiveClass) + "-prev-prev"));
          $bullet
            .next()
            .addClass(((params.bulletActiveClass) + "-next"))
            .next()
            .addClass(((params.bulletActiveClass) + "-next-next"));
        }
      }
      if (params.dynamicBullets) {
        var dynamicBulletsLength = Math.min(bullets.length, 5);
        var bulletsOffset = (((swiper.pagination.bulletSize * dynamicBulletsLength) - (swiper.pagination.bulletSize)) / 2) - (current * swiper.pagination.bulletSize);
        var offsetProp = rtl ? 'right' : 'left';
        bullets.css(swiper.isHorizontal() ? offsetProp : 'top', (bulletsOffset + "px"));
      }
    }
    if (params.type === 'fraction') {
      $el.find(("." + (params.currentClass))).text(current + 1);
      $el.find(("." + (params.totalClass))).text(total);
    }
    if (params.type === 'progressbar') {
      var scale = (current + 1) / total;
      var scaleX = scale;
      var scaleY = 1;
      if (!swiper.isHorizontal()) {
        scaleY = scale;
        scaleX = 1;
      }
      $el.find(("." + (params.progressbarFillClass))).transform(("translate3d(0,0,0) scaleX(" + scaleX + ") scaleY(" + scaleY + ")")).transition(swiper.params.speed);
    }
    if (params.type === 'custom' && params.renderCustom) {
      $el.html(params.renderCustom(swiper, current + 1, total));
      swiper.emit('paginationRender', swiper, $el[0]);
    } else {
      swiper.emit('paginationUpdate', swiper, $el[0]);
    }
  },
  render: function render() {
    // Render Container
    var swiper = this;
    var params = swiper.params.pagination;
    if (!params.el || !swiper.pagination.el || !swiper.pagination.$el || swiper.pagination.$el.length === 0) { return; }
    var slidesLength = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.slides.length : swiper.slides.length;

    var $el = swiper.pagination.$el;
    var paginationHTML = '';
    if (params.type === 'bullets') {
      var numberOfBullets = swiper.params.loop ? Math.ceil((slidesLength - (swiper.loopedSlides * 2)) / swiper.params.slidesPerGroup) : swiper.snapGrid.length;
      for (var i = 0; i < numberOfBullets; i += 1) {
        if (params.renderBullet) {
          paginationHTML += params.renderBullet.call(swiper, i, params.bulletClass);
        } else {
          paginationHTML += "<" + (params.bulletElement) + " class=\"" + (params.bulletClass) + "\"></" + (params.bulletElement) + ">";
        }
      }
      $el.html(paginationHTML);
      swiper.pagination.bullets = $el.find(("." + (params.bulletClass)));
    }
    if (params.type === 'fraction') {
      if (params.renderFraction) {
        paginationHTML = params.renderFraction.call(swiper, params.currentClass, params.totalClass);
      } else {
        paginationHTML =
        "<span class=\"" + (params.currentClass) + "\"></span>" +
        ' / ' +
        "<span class=\"" + (params.totalClass) + "\"></span>";
      }
      $el.html(paginationHTML);
    }
    if (params.type === 'progressbar') {
      if (params.renderProgressbar) {
        paginationHTML = params.renderProgressbar.call(swiper, params.progressbarFillClass);
      } else {
        paginationHTML = "<span class=\"" + (params.progressbarFillClass) + "\"></span>";
      }
      $el.html(paginationHTML);
    }
    if (params.type !== 'custom') {
      swiper.emit('paginationRender', swiper.pagination.$el[0]);
    }
  },
  init: function init() {
    var swiper = this;
    var params = swiper.params.pagination;
    if (!params.el) { return; }

    var $el = $$1(params.el);
    if ($el.length === 0) { return; }

    if (
      swiper.params.uniqueNavElements &&
      typeof params.el === 'string' &&
      $el.length > 1 &&
      swiper.$el.find(params.el).length === 1
    ) {
      $el = swiper.$el.find(params.el);
    }

    if (params.type === 'bullets' && params.clickable) {
      $el.addClass(params.clickableClass);
    }

    $el.addClass(params.modifierClass + params.type);

    if (params.type === 'bullets' && params.dynamicBullets) {
      $el.addClass(("" + (params.modifierClass) + (params.type) + "-dynamic"));
    }

    if (params.clickable) {
      $el.on('click', ("." + (params.bulletClass)), function onClick(e) {
        e.preventDefault();
        var index = $$1(this).index() * swiper.params.slidesPerGroup;
        if (swiper.params.loop) { index += swiper.loopedSlides; }
        swiper.slideTo(index);
      });
    }

    Utils.extend(swiper.pagination, {
      $el: $el,
      el: $el[0],
    });
  },
  destroy: function destroy() {
    var swiper = this;
    var params = swiper.params.pagination;
    if (!params.el || !swiper.pagination.el || !swiper.pagination.$el || swiper.pagination.$el.length === 0) { return; }
    var $el = swiper.pagination.$el;

    $el.removeClass(params.hiddenClass);
    $el.removeClass(params.modifierClass + params.type);
    if (swiper.pagination.bullets) { swiper.pagination.bullets.removeClass(params.bulletActiveClass); }
    if (params.clickable) {
      $el.off('click', ("." + (params.bulletClass)));
    }
  },
};

var Pagination$1 = {
  name: 'pagination',
  params: {
    pagination: {
      el: null,
      bulletElement: 'span',
      clickable: false,
      hideOnClick: false,
      renderBullet: null,
      renderProgressbar: null,
      renderFraction: null,
      renderCustom: null,
      type: 'bullets', // 'bullets' or 'progressbar' or 'fraction' or 'custom'
      dynamicBullets: false,

      bulletClass: 'swiper-pagination-bullet',
      bulletActiveClass: 'swiper-pagination-bullet-active',
      modifierClass: 'swiper-pagination-', // NEW
      currentClass: 'swiper-pagination-current',
      totalClass: 'swiper-pagination-total',
      hiddenClass: 'swiper-pagination-hidden',
      progressbarFillClass: 'swiper-pagination-progressbar-fill',
      clickableClass: 'swiper-pagination-clickable', // NEW
    },
  },
  create: function create() {
    var swiper = this;
    Utils.extend(swiper, {
      pagination: {
        init: Pagination.init.bind(swiper),
        render: Pagination.render.bind(swiper),
        update: Pagination.update.bind(swiper),
        destroy: Pagination.destroy.bind(swiper),
      },
    });
  },
  on: {
    init: function init() {
      var swiper = this;
      swiper.pagination.init();
      swiper.pagination.render();
      swiper.pagination.update();
    },
    activeIndexChange: function activeIndexChange() {
      var swiper = this;
      if (swiper.params.loop) {
        swiper.pagination.update();
      } else if (typeof swiper.snapIndex === 'undefined') {
        swiper.pagination.update();
      }
    },
    snapIndexChange: function snapIndexChange() {
      var swiper = this;
      if (!swiper.params.loop) {
        swiper.pagination.update();
      }
    },
    slidesLengthChange: function slidesLengthChange() {
      var swiper = this;
      if (swiper.params.loop) {
        swiper.pagination.render();
        swiper.pagination.update();
      }
    },
    snapGridLengthChange: function snapGridLengthChange() {
      var swiper = this;
      if (!swiper.params.loop) {
        swiper.pagination.render();
        swiper.pagination.update();
      }
    },
    destroy: function destroy() {
      var swiper = this;
      swiper.pagination.destroy();
    },
    click: function click(e) {
      var swiper = this;
      if (
        swiper.params.pagination.el &&
        swiper.params.pagination.hideOnClick &&
        swiper.pagination.$el.length > 0 &&
        !$$1(e.target).hasClass(swiper.params.pagination.bulletClass)
      ) {
        swiper.pagination.$el.toggleClass(swiper.params.pagination.hiddenClass);
      }
    },
  },
};

var Scrollbar = {
  setTranslate: function setTranslate() {
    var swiper = this;
    if (!swiper.params.scrollbar.el || !swiper.scrollbar.el) { return; }
    var scrollbar = swiper.scrollbar;
    var rtl = swiper.rtl;
    var progress = swiper.progress;
    var dragSize = scrollbar.dragSize;
    var trackSize = scrollbar.trackSize;
    var $dragEl = scrollbar.$dragEl;
    var $el = scrollbar.$el;
    var params = swiper.params.scrollbar;

    var newSize = dragSize;
    var newPos = (trackSize - dragSize) * progress;
    if (rtl && swiper.isHorizontal()) {
      newPos = -newPos;
      if (newPos > 0) {
        newSize = dragSize - newPos;
        newPos = 0;
      } else if (-newPos + dragSize > trackSize) {
        newSize = trackSize + newPos;
      }
    } else if (newPos < 0) {
      newSize = dragSize + newPos;
      newPos = 0;
    } else if (newPos + dragSize > trackSize) {
      newSize = trackSize - newPos;
    }
    if (swiper.isHorizontal()) {
      if (Support.transforms3d) {
        $dragEl.transform(("translate3d(" + newPos + "px, 0, 0)"));
      } else {
        $dragEl.transform(("translateX(" + newPos + "px)"));
      }
      $dragEl[0].style.width = newSize + "px";
    } else {
      if (Support.transforms3d) {
        $dragEl.transform(("translate3d(0px, " + newPos + "px, 0)"));
      } else {
        $dragEl.transform(("translateY(" + newPos + "px)"));
      }
      $dragEl[0].style.height = newSize + "px";
    }
    if (params.hide) {
      clearTimeout(swiper.scrollbar.timeout);
      $el[0].style.opacity = 1;
      swiper.scrollbar.timeout = setTimeout(function () {
        $el[0].style.opacity = 0;
        $el.transition(400);
      }, 1000);
    }
  },
  setTransition: function setTransition(duration) {
    var swiper = this;
    if (!swiper.params.scrollbar.el || !swiper.scrollbar.el) { return; }
    swiper.scrollbar.$dragEl.transition(duration);
  },
  updateSize: function updateSize() {
    var swiper = this;
    if (!swiper.params.scrollbar.el || !swiper.scrollbar.el) { return; }

    var scrollbar = swiper.scrollbar;
    var $dragEl = scrollbar.$dragEl;
    var $el = scrollbar.$el;

    $dragEl[0].style.width = '';
    $dragEl[0].style.height = '';
    var trackSize = swiper.isHorizontal() ? $el[0].offsetWidth : $el[0].offsetHeight;

    var divider = swiper.size / swiper.virtualSize;
    var moveDivider = divider * (trackSize / swiper.size);
    var dragSize;
    if (swiper.params.scrollbar.dragSize === 'auto') {
      dragSize = trackSize * divider;
    } else {
      dragSize = parseInt(swiper.params.scrollbar.dragSize, 10);
    }

    if (swiper.isHorizontal()) {
      $dragEl[0].style.width = dragSize + "px";
    } else {
      $dragEl[0].style.height = dragSize + "px";
    }

    if (divider >= 1) {
      $el[0].style.display = 'none';
    } else {
      $el[0].style.display = '';
    }
    if (swiper.params.scrollbarHide) {
      $el[0].style.opacity = 0;
    }
    Utils.extend(scrollbar, {
      trackSize: trackSize,
      divider: divider,
      moveDivider: moveDivider,
      dragSize: dragSize,
    });
  },
  setDragPosition: function setDragPosition(e) {
    var swiper = this;
    var scrollbar = swiper.scrollbar;
    var $el = scrollbar.$el;
    var dragSize = scrollbar.dragSize;
    var trackSize = scrollbar.trackSize;

    var pointerPosition;
    if (swiper.isHorizontal()) {
      pointerPosition = ((e.type === 'touchstart' || e.type === 'touchmove') ? e.targetTouches[0].pageX : e.pageX || e.clientX);
    } else {
      pointerPosition = ((e.type === 'touchstart' || e.type === 'touchmove') ? e.targetTouches[0].pageY : e.pageY || e.clientY);
    }
    var positionRatio;
    positionRatio = ((pointerPosition) - $el.offset()[swiper.isHorizontal() ? 'left' : 'top'] - (dragSize / 2)) / (trackSize - dragSize);
    positionRatio = Math.max(Math.min(positionRatio, 1), 0);
    if (swiper.rtl) {
      positionRatio = 1 - positionRatio;
    }

    var position = swiper.minTranslate() + ((swiper.maxTranslate() - swiper.minTranslate()) * positionRatio);

    swiper.updateProgress(position);
    swiper.setTranslate(position);
    swiper.updateActiveIndex();
    swiper.updateSlidesClasses();
  },
  onDragStart: function onDragStart(e) {
    var swiper = this;
    var params = swiper.params.scrollbar;
    var scrollbar = swiper.scrollbar;
    var $wrapperEl = swiper.$wrapperEl;
    var $el = scrollbar.$el;
    var $dragEl = scrollbar.$dragEl;
    swiper.scrollbar.isTouched = true;
    e.preventDefault();
    e.stopPropagation();

    $wrapperEl.transition(100);
    $dragEl.transition(100);
    scrollbar.setDragPosition(e);

    clearTimeout(swiper.scrollbar.dragTimeout);

    $el.transition(0);
    if (params.hide) {
      $el.css('opacity', 1);
    }
    swiper.emit('scrollbarDragStart', e);
  },
  onDragMove: function onDragMove(e) {
    var swiper = this;
    var scrollbar = swiper.scrollbar;
    var $wrapperEl = swiper.$wrapperEl;
    var $el = scrollbar.$el;
    var $dragEl = scrollbar.$dragEl;

    if (!swiper.scrollbar.isTouched) { return; }
    if (e.preventDefault) { e.preventDefault(); }
    else { e.returnValue = false; }
    scrollbar.setDragPosition(e);
    $wrapperEl.transition(0);
    $el.transition(0);
    $dragEl.transition(0);
    swiper.emit('scrollbarDragMove', e);
  },
  onDragEnd: function onDragEnd(e) {
    var swiper = this;

    var params = swiper.params.scrollbar;
    var scrollbar = swiper.scrollbar;
    var $el = scrollbar.$el;

    if (!swiper.scrollbar.isTouched) { return; }
    swiper.scrollbar.isTouched = false;
    if (params.hide) {
      clearTimeout(swiper.scrollbar.dragTimeout);
      swiper.scrollbar.dragTimeout = Utils.nextTick(function () {
        $el.css('opacity', 0);
        $el.transition(400);
      }, 1000);
    }
    swiper.emit('scrollbarDragEnd', e);
    if (params.snapOnRelease) {
      swiper.slideReset();
    }
  },
  enableDraggable: function enableDraggable() {
    var swiper = this;
    if (!swiper.params.scrollbar.el) { return; }
    var scrollbar = swiper.scrollbar;
    var $el = scrollbar.$el;
    var target = Support.touch ? $el[0] : document;
    $el.on(swiper.scrollbar.dragEvents.start, swiper.scrollbar.onDragStart);
    $$1(target).on(swiper.scrollbar.dragEvents.move, swiper.scrollbar.onDragMove);
    $$1(target).on(swiper.scrollbar.dragEvents.end, swiper.scrollbar.onDragEnd);
  },
  disableDraggable: function disableDraggable() {
    var swiper = this;
    if (!swiper.params.scrollbar.el) { return; }
    var scrollbar = swiper.scrollbar;
    var $el = scrollbar.$el;
    var target = Support.touch ? $el[0] : document;
    $el.off(swiper.scrollbar.dragEvents.start);
    $$1(target).off(swiper.scrollbar.dragEvents.move);
    $$1(target).off(swiper.scrollbar.dragEvents.end);
  },
  init: function init() {
    var swiper = this;
    if (!swiper.params.scrollbar.el) { return; }
    var scrollbar = swiper.scrollbar;
    var $swiperEl = swiper.$el;
    var touchEvents = swiper.touchEvents;
    var params = swiper.params.scrollbar;

    var $el = $$1(params.el);
    if (swiper.params.uniqueNavElements && typeof params.el === 'string' && $el.length > 1 && $swiperEl.find(params.el).length === 1) {
      $el = $swiperEl.find(params.el);
    }

    var $dragEl = $el.find('.swiper-scrollbar-drag');
    if ($dragEl.length === 0) {
      $dragEl = $$1('<div class="swiper-scrollbar-drag"></div>');
      $el.append($dragEl);
    }

    swiper.scrollbar.dragEvents = (function dragEvents() {
      if ((swiper.params.simulateTouch === false && !Support.touch)) {
        return {
          start: 'mousedown',
          move: 'mousemove',
          end: 'mouseup',
        };
      }
      return touchEvents;
    }());

    Utils.extend(scrollbar, {
      $el: $el,
      el: $el[0],
      $dragEl: $dragEl,
      dragEl: $dragEl[0],
    });

    if (params.draggable) {
      scrollbar.enableDraggable();
    }
  },
  destroy: function destroy() {
    var swiper = this;
    swiper.scrollbar.disableDraggable();
  },
};

var Scrollbar$1 = {
  name: 'scrollbar',
  params: {
    scrollbar: {
      el: null,
      dragSize: 'auto',
      hide: false,
      draggable: false,
      snapOnRelease: true,
    },
  },
  create: function create() {
    var swiper = this;
    Utils.extend(swiper, {
      scrollbar: {
        init: Scrollbar.init.bind(swiper),
        destroy: Scrollbar.destroy.bind(swiper),
        updateSize: Scrollbar.updateSize.bind(swiper),
        setTranslate: Scrollbar.setTranslate.bind(swiper),
        setTransition: Scrollbar.setTransition.bind(swiper),
        enableDraggable: Scrollbar.enableDraggable.bind(swiper),
        disableDraggable: Scrollbar.disableDraggable.bind(swiper),
        setDragPosition: Scrollbar.setDragPosition.bind(swiper),
        onDragStart: Scrollbar.onDragStart.bind(swiper),
        onDragMove: Scrollbar.onDragMove.bind(swiper),
        onDragEnd: Scrollbar.onDragEnd.bind(swiper),
        isTouched: false,
        timeout: null,
        dragTimeout: null,
      },
    });
  },
  on: {
    init: function init() {
      var swiper = this;
      swiper.scrollbar.init();
      swiper.scrollbar.updateSize();
      swiper.scrollbar.setTranslate();
    },
    update: function update() {
      var swiper = this;
      swiper.scrollbar.updateSize();
    },
    resize: function resize() {
      var swiper = this;
      swiper.scrollbar.updateSize();
    },
    observerUpdate: function observerUpdate() {
      var swiper = this;
      swiper.scrollbar.updateSize();
    },
    setTranslate: function setTranslate() {
      var swiper = this;
      swiper.scrollbar.setTranslate();
    },
    setTransition: function setTransition(duration) {
      var swiper = this;
      swiper.scrollbar.setTransition(duration);
    },
    destroy: function destroy() {
      var swiper = this;
      swiper.scrollbar.destroy();
    },
  },
};

var Parallax = {
  setTransform: function setTransform(el, progress) {
    var swiper = this;
    var rtl = swiper.rtl;

    var $el = $$1(el);
    var rtlFactor = rtl ? -1 : 1;

    var p = $el.attr('data-swiper-parallax') || '0';
    var x = $el.attr('data-swiper-parallax-x');
    var y = $el.attr('data-swiper-parallax-y');
    var scale = $el.attr('data-swiper-parallax-scale');
    var opacity = $el.attr('data-swiper-parallax-opacity');

    if (x || y) {
      x = x || '0';
      y = y || '0';
    } else if (swiper.isHorizontal()) {
      x = p;
      y = '0';
    } else {
      y = p;
      x = '0';
    }

    if ((x).indexOf('%') >= 0) {
      x = (parseInt(x, 10) * progress * rtlFactor) + "%";
    } else {
      x = (x * progress * rtlFactor) + "px";
    }
    if ((y).indexOf('%') >= 0) {
      y = (parseInt(y, 10) * progress) + "%";
    } else {
      y = (y * progress) + "px";
    }

    if (typeof opacity !== 'undefined' && opacity !== null) {
      var currentOpacity = opacity - ((opacity - 1) * (1 - Math.abs(progress)));
      $el[0].style.opacity = currentOpacity;
    }
    if (typeof scale === 'undefined' || scale === null) {
      $el.transform(("translate3d(" + x + ", " + y + ", 0px)"));
    } else {
      var currentScale = scale - ((scale - 1) * (1 - Math.abs(progress)));
      $el.transform(("translate3d(" + x + ", " + y + ", 0px) scale(" + currentScale + ")"));
    }
  },
  setTranslate: function setTranslate() {
    var swiper = this;
    var $el = swiper.$el;
    var slides = swiper.slides;
    var progress = swiper.progress;
    var snapGrid = swiper.snapGrid;
    $el.children('[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]')
      .each(function (index, el) {
        swiper.parallax.setTransform(el, progress);
      });
    slides.each(function (slideIndex, slideEl) {
      var slideProgress = slideEl.progress;
      if (swiper.params.slidesPerGroup > 1 && swiper.params.slidesPerView !== 'auto') {
        slideProgress += Math.ceil(slideIndex / 2) - (progress * (snapGrid.length - 1));
      }
      slideProgress = Math.min(Math.max(slideProgress, -1), 1);
      $$1(slideEl).find('[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]')
        .each(function (index, el) {
          swiper.parallax.setTransform(el, slideProgress);
        });
    });
  },
  setTransition: function setTransition(duration) {
    if ( duration === void 0 ) duration = this.params.speed;

    var swiper = this;
    var $el = swiper.$el;
    $el.find('[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]')
      .each(function (index, parallaxEl) {
        var $parallaxEl = $$1(parallaxEl);
        var parallaxDuration = parseInt($parallaxEl.attr('data-swiper-parallax-duration'), 10) || duration;
        if (duration === 0) { parallaxDuration = 0; }
        $parallaxEl.transition(parallaxDuration);
      });
  },
};

var Parallax$1 = {
  name: 'parallax',
  params: {
    parallax: {
      enabled: false,
    },
  },
  create: function create() {
    var swiper = this;
    Utils.extend(swiper, {
      parallax: {
        setTransform: Parallax.setTransform.bind(swiper),
        setTranslate: Parallax.setTranslate.bind(swiper),
        setTransition: Parallax.setTransition.bind(swiper),
      },
    });
  },
  on: {
    beforeInit: function beforeInit() {
      var swiper = this;
      swiper.params.watchSlidesProgress = true;
    },
    init: function init() {
      var swiper = this;
      if (!swiper.params.parallax) { return; }
      swiper.parallax.setTranslate();
    },
    setTranslate: function setTranslate() {
      var swiper = this;
      if (!swiper.params.parallax) { return; }
      swiper.parallax.setTranslate();
    },
    setTransition: function setTransition(duration) {
      var swiper = this;
      if (!swiper.params.parallax) { return; }
      swiper.parallax.setTransition(duration);
    },
  },
};

var Zoom = {
  // Calc Scale From Multi-touches
  getDistanceBetweenTouches: function getDistanceBetweenTouches(e) {
    if (e.targetTouches.length < 2) { return 1; }
    var x1 = e.targetTouches[0].pageX;
    var y1 = e.targetTouches[0].pageY;
    var x2 = e.targetTouches[1].pageX;
    var y2 = e.targetTouches[1].pageY;
    var distance = Math.sqrt((Math.pow( (x2 - x1), 2 )) + (Math.pow( (y2 - y1), 2 )));
    return distance;
  },
  // Events
  onGestureStart: function onGestureStart(e) {
    var swiper = this;
    var params = swiper.params.zoom;
    var zoom = swiper.zoom;
    var gesture = zoom.gesture;
    zoom.fakeGestureTouched = false;
    zoom.fakeGestureMoved = false;
    if (!Support.gestures) {
      if (e.type !== 'touchstart' || (e.type === 'touchstart' && e.targetTouches.length < 2)) {
        return;
      }
      zoom.fakeGestureTouched = true;
      gesture.scaleStart = Zoom.getDistanceBetweenTouches(e);
    }
    if (!gesture.$slideEl || !gesture.$slideEl.length) {
      gesture.$slideEl = $$1(this);
      if (gesture.$slideEl.length === 0) { gesture.$slideEl = swiper.slides.eq(swiper.activeIndex); }
      gesture.$imageEl = gesture.$slideEl.find('img, svg, canvas');
      gesture.$imageWrapEl = gesture.$imageEl.parent(("." + (params.containerClass)));
      gesture.maxRatio = gesture.$imageWrapEl.attr('data-swiper-zoom') || params.maxRatio;
      if (gesture.$imageWrapEl.length === 0) {
        gesture.$imageEl = undefined;
        return;
      }
    }
    gesture.$imageEl.transition(0);
    swiper.zoom.isScaling = true;
  },
  onGestureChange: function onGestureChange(e) {
    var swiper = this;
    var params = swiper.params.zoom;
    var zoom = swiper.zoom;
    var gesture = zoom.gesture;
    if (!Support.gestures) {
      if (e.type !== 'touchmove' || (e.type === 'touchmove' && e.targetTouches.length < 2)) {
        return;
      }
      zoom.fakeGestureMoved = true;
      gesture.scaleMove = Zoom.getDistanceBetweenTouches(e);
    }
    if (!gesture.$imageEl || gesture.$imageEl.length === 0) { return; }
    if (Support.gestures) {
      swiper.zoom.scale = e.scale * zoom.currentScale;
    } else {
      zoom.scale = (gesture.scaleMove / gesture.scaleStart) * zoom.currentScale;
    }
    if (zoom.scale > gesture.maxRatio) {
      zoom.scale = (gesture.maxRatio - 1) + (Math.pow( ((zoom.scale - gesture.maxRatio) + 1), 0.5 ));
    }
    if (zoom.scale < params.minRatio) {
      zoom.scale = (params.minRatio + 1) - (Math.pow( ((params.minRatio - zoom.scale) + 1), 0.5 ));
    }
    gesture.$imageEl.transform(("translate3d(0,0,0) scale(" + (zoom.scale) + ")"));
  },
  onGestureEnd: function onGestureEnd(e) {
    var swiper = this;
    var params = swiper.params.zoom;
    var zoom = swiper.zoom;
    var gesture = zoom.gesture;
    if (!Support.gestures) {
      if (!zoom.fakeGestureTouched || !zoom.fakeGestureMoved) {
        return;
      }
      if (e.type !== 'touchend' || (e.type === 'touchend' && e.changedTouches.length < 2 && !Device.android)) {
        return;
      }
      zoom.fakeGestureTouched = false;
      zoom.fakeGestureMoved = false;
    }
    if (!gesture.$imageEl || gesture.$imageEl.length === 0) { return; }
    zoom.scale = Math.max(Math.min(zoom.scale, gesture.maxRatio), params.minRatio);
    gesture.$imageEl.transition(swiper.params.speed).transform(("translate3d(0,0,0) scale(" + (zoom.scale) + ")"));
    zoom.currentScale = zoom.scale;
    zoom.isScaling = false;
    if (zoom.scale === 1) { gesture.$slideEl = undefined; }
  },
  onTouchStart: function onTouchStart(e) {
    var swiper = this;
    var zoom = swiper.zoom;
    var gesture = zoom.gesture;
    var image = zoom.image;
    if (!gesture.$imageEl || gesture.$imageEl.length === 0) { return; }
    if (image.isTouched) { return; }
    if (Device.android) { e.preventDefault(); }
    image.isTouched = true;
    image.touchesStart.x = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
    image.touchesStart.y = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
  },
  onTouchMove: function onTouchMove(e) {
    var swiper = this;
    var zoom = swiper.zoom;
    var gesture = zoom.gesture;
    var image = zoom.image;
    var velocity = zoom.velocity;
    if (!gesture.$imageEl || gesture.$imageEl.length === 0) { return; }
    swiper.allowClick = false;
    if (!image.isTouched || !gesture.$slideEl) { return; }

    if (!image.isMoved) {
      image.width = gesture.$imageEl[0].offsetWidth;
      image.height = gesture.$imageEl[0].offsetHeight;
      image.startX = Utils.getTranslate(gesture.$imageWrapEl[0], 'x') || 0;
      image.startY = Utils.getTranslate(gesture.$imageWrapEl[0], 'y') || 0;
      gesture.slideWidth = gesture.$slideEl[0].offsetWidth;
      gesture.slideHeight = gesture.$slideEl[0].offsetHeight;
      gesture.$imageWrapEl.transition(0);
      if (swiper.rtl) { image.startX = -image.startX; }
      if (swiper.rtl) { image.startY = -image.startY; }
    }
    // Define if we need image drag
    var scaledWidth = image.width * zoom.scale;
    var scaledHeight = image.height * zoom.scale;

    if (scaledWidth < gesture.slideWidth && scaledHeight < gesture.slideHeight) { return; }

    image.minX = Math.min(((gesture.slideWidth / 2) - (scaledWidth / 2)), 0);
    image.maxX = -image.minX;
    image.minY = Math.min(((gesture.slideHeight / 2) - (scaledHeight / 2)), 0);
    image.maxY = -image.minY;

    image.touchesCurrent.x = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
    image.touchesCurrent.y = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;

    if (!image.isMoved && !zoom.isScaling) {
      if (
        swiper.isHorizontal() &&
        (
          (Math.floor(image.minX) === Math.floor(image.startX) && image.touchesCurrent.x < image.touchesStart.x) ||
          (Math.floor(image.maxX) === Math.floor(image.startX) && image.touchesCurrent.x > image.touchesStart.x)
        )
      ) {
        image.isTouched = false;
        return;
      } else if (
        !swiper.isHorizontal() &&
        (
          (Math.floor(image.minY) === Math.floor(image.startY) && image.touchesCurrent.y < image.touchesStart.y) ||
          (Math.floor(image.maxY) === Math.floor(image.startY) && image.touchesCurrent.y > image.touchesStart.y)
        )
      ) {
        image.isTouched = false;
        return;
      }
    }
    e.preventDefault();
    e.stopPropagation();

    image.isMoved = true;
    image.currentX = (image.touchesCurrent.x - image.touchesStart.x) + image.startX;
    image.currentY = (image.touchesCurrent.y - image.touchesStart.y) + image.startY;

    if (image.currentX < image.minX) {
      image.currentX = (image.minX + 1) - (Math.pow( ((image.minX - image.currentX) + 1), 0.8 ));
    }
    if (image.currentX > image.maxX) {
      image.currentX = (image.maxX - 1) + (Math.pow( ((image.currentX - image.maxX) + 1), 0.8 ));
    }

    if (image.currentY < image.minY) {
      image.currentY = (image.minY + 1) - (Math.pow( ((image.minY - image.currentY) + 1), 0.8 ));
    }
    if (image.currentY > image.maxY) {
      image.currentY = (image.maxY - 1) + (Math.pow( ((image.currentY - image.maxY) + 1), 0.8 ));
    }

    // Velocity
    if (!velocity.prevPositionX) { velocity.prevPositionX = image.touchesCurrent.x; }
    if (!velocity.prevPositionY) { velocity.prevPositionY = image.touchesCurrent.y; }
    if (!velocity.prevTime) { velocity.prevTime = Date.now(); }
    velocity.x = (image.touchesCurrent.x - velocity.prevPositionX) / (Date.now() - velocity.prevTime) / 2;
    velocity.y = (image.touchesCurrent.y - velocity.prevPositionY) / (Date.now() - velocity.prevTime) / 2;
    if (Math.abs(image.touchesCurrent.x - velocity.prevPositionX) < 2) { velocity.x = 0; }
    if (Math.abs(image.touchesCurrent.y - velocity.prevPositionY) < 2) { velocity.y = 0; }
    velocity.prevPositionX = image.touchesCurrent.x;
    velocity.prevPositionY = image.touchesCurrent.y;
    velocity.prevTime = Date.now();

    gesture.$imageWrapEl.transform(("translate3d(" + (image.currentX) + "px, " + (image.currentY) + "px,0)"));
  },
  onTouchEnd: function onTouchEnd() {
    var swiper = this;
    var zoom = swiper.zoom;
    var gesture = zoom.gesture;
    var image = zoom.image;
    var velocity = zoom.velocity;
    if (!gesture.$imageEl || gesture.$imageEl.length === 0) { return; }
    if (!image.isTouched || !image.isMoved) {
      image.isTouched = false;
      image.isMoved = false;
      return;
    }
    image.isTouched = false;
    image.isMoved = false;
    var momentumDurationX = 300;
    var momentumDurationY = 300;
    var momentumDistanceX = velocity.x * momentumDurationX;
    var newPositionX = image.currentX + momentumDistanceX;
    var momentumDistanceY = velocity.y * momentumDurationY;
    var newPositionY = image.currentY + momentumDistanceY;

    // Fix duration
    if (velocity.x !== 0) { momentumDurationX = Math.abs((newPositionX - image.currentX) / velocity.x); }
    if (velocity.y !== 0) { momentumDurationY = Math.abs((newPositionY - image.currentY) / velocity.y); }
    var momentumDuration = Math.max(momentumDurationX, momentumDurationY);

    image.currentX = newPositionX;
    image.currentY = newPositionY;

    // Define if we need image drag
    var scaledWidth = image.width * zoom.scale;
    var scaledHeight = image.height * zoom.scale;
    image.minX = Math.min(((gesture.slideWidth / 2) - (scaledWidth / 2)), 0);
    image.maxX = -image.minX;
    image.minY = Math.min(((gesture.slideHeight / 2) - (scaledHeight / 2)), 0);
    image.maxY = -image.minY;
    image.currentX = Math.max(Math.min(image.currentX, image.maxX), image.minX);
    image.currentY = Math.max(Math.min(image.currentY, image.maxY), image.minY);

    gesture.$imageWrapEl.transition(momentumDuration).transform(("translate3d(" + (image.currentX) + "px, " + (image.currentY) + "px,0)"));
  },
  onTransitionEnd: function onTransitionEnd() {
    var swiper = this;
    var zoom = swiper.zoom;
    var gesture = zoom.gesture;
    if (gesture.$slideEl && swiper.previousIndex !== swiper.activeIndex) {
      gesture.$imageEl.transform('translate3d(0,0,0) scale(1)');
      gesture.$imageWrapEl.transform('translate3d(0,0,0)');
      gesture.$slideEl = undefined;
      gesture.$imageEl = undefined;
      gesture.$imageWrapEl = undefined;

      zoom.scale = 1;
      zoom.currentScale = 1;
    }
  },
  // Toggle Zoom
  toggle: function toggle(e) {
    var swiper = this;
    var zoom = swiper.zoom;

    if (zoom.scale && zoom.scale !== 1) {
      // Zoom Out
      zoom.out();
    } else {
      // Zoom In
      zoom.in(e);
    }
  },
  in: function in$1(e) {
    var swiper = this;

    var zoom = swiper.zoom;
    var params = swiper.params.zoom;
    var gesture = zoom.gesture;
    var image = zoom.image;

    if (!gesture.$slideEl) {
      gesture.$slideEl = swiper.clickedSlide ? $$1(swiper.clickedSlide) : swiper.slides.eq(swiper.activeIndex);
      gesture.$imageEl = gesture.$slideEl.find('img, svg, canvas');
      gesture.$imageWrapEl = gesture.$imageEl.parent(("." + (params.containerClass)));
    }
    if (!gesture.$imageEl || gesture.$imageEl.length === 0) { return; }

    gesture.$slideEl.addClass(("" + (params.zoomedSlideClass)));

    var touchX;
    var touchY;
    var offsetX;
    var offsetY;
    var diffX;
    var diffY;
    var translateX;
    var translateY;
    var imageWidth;
    var imageHeight;
    var scaledWidth;
    var scaledHeight;
    var translateMinX;
    var translateMinY;
    var translateMaxX;
    var translateMaxY;
    var slideWidth;
    var slideHeight;

    if (typeof image.touchesStart.x === 'undefined' && e) {
      touchX = e.type === 'touchend' ? e.changedTouches[0].pageX : e.pageX;
      touchY = e.type === 'touchend' ? e.changedTouches[0].pageY : e.pageY;
    } else {
      touchX = image.touchesStart.x;
      touchY = image.touchesStart.y;
    }

    zoom.scale = gesture.$imageWrapEl.attr('data-swiper-zoom') || params.maxRatio;
    zoom.currentScale = gesture.$imageWrapEl.attr('data-swiper-zoom') || params.maxRatio;
    if (e) {
      slideWidth = gesture.$slideEl[0].offsetWidth;
      slideHeight = gesture.$slideEl[0].offsetHeight;
      offsetX = gesture.$slideEl.offset().left;
      offsetY = gesture.$slideEl.offset().top;
      diffX = (offsetX + (slideWidth / 2)) - touchX;
      diffY = (offsetY + (slideHeight / 2)) - touchY;

      imageWidth = gesture.$imageEl[0].offsetWidth;
      imageHeight = gesture.$imageEl[0].offsetHeight;
      scaledWidth = imageWidth * zoom.scale;
      scaledHeight = imageHeight * zoom.scale;

      translateMinX = Math.min(((slideWidth / 2) - (scaledWidth / 2)), 0);
      translateMinY = Math.min(((slideHeight / 2) - (scaledHeight / 2)), 0);
      translateMaxX = -translateMinX;
      translateMaxY = -translateMinY;

      translateX = diffX * zoom.scale;
      translateY = diffY * zoom.scale;

      if (translateX < translateMinX) {
        translateX = translateMinX;
      }
      if (translateX > translateMaxX) {
        translateX = translateMaxX;
      }

      if (translateY < translateMinY) {
        translateY = translateMinY;
      }
      if (translateY > translateMaxY) {
        translateY = translateMaxY;
      }
    } else {
      translateX = 0;
      translateY = 0;
    }
    gesture.$imageWrapEl.transition(300).transform(("translate3d(" + translateX + "px, " + translateY + "px,0)"));
    gesture.$imageEl.transition(300).transform(("translate3d(0,0,0) scale(" + (zoom.scale) + ")"));
  },
  out: function out() {
    var swiper = this;

    var zoom = swiper.zoom;
    var params = swiper.params.zoom;
    var gesture = zoom.gesture;

    if (!gesture.$slideEl) {
      gesture.$slideEl = swiper.clickedSlide ? $$1(swiper.clickedSlide) : swiper.slides.eq(swiper.activeIndex);
      gesture.$imageEl = gesture.$slideEl.find('img, svg, canvas');
      gesture.$imageWrapEl = gesture.$imageEl.parent(("." + (params.containerClass)));
    }
    if (!gesture.$imageEl || gesture.$imageEl.length === 0) { return; }

    zoom.scale = 1;
    zoom.currentScale = 1;
    gesture.$imageWrapEl.transition(300).transform('translate3d(0,0,0)');
    gesture.$imageEl.transition(300).transform('translate3d(0,0,0) scale(1)');
    gesture.$slideEl.removeClass(("" + (params.zoomedSlideClass)));
    gesture.$slideEl = undefined;
  },
  // Attach/Detach Events
  enable: function enable() {
    var swiper = this;
    var zoom = swiper.zoom;
    if (zoom.enabled) { return; }
    zoom.enabled = true;

    var slides = swiper.slides;

    var passiveListener = swiper.touchEvents.start === 'touchstart' && Support.passiveListener && swiper.params.passiveListeners ? { passive: true, capture: false } : false;

    // Scale image
    if (Support.gestures) {
      slides.on('gesturestart', zoom.onGestureStart, passiveListener);
      slides.on('gesturechange', zoom.onGestureChange, passiveListener);
      slides.on('gestureend', zoom.onGestureEnd, passiveListener);
    } else if (swiper.touchEvents.start === 'touchstart') {
      slides.on(swiper.touchEvents.start, zoom.onGestureStart, passiveListener);
      slides.on(swiper.touchEvents.move, zoom.onGestureChange, passiveListener);
      slides.on(swiper.touchEvents.end, zoom.onGestureEnd, passiveListener);
    }

    // Move image
    swiper.slides.each(function (index, slideEl) {
      var $slideEl = $$1(slideEl);
      if ($slideEl.find(("." + (swiper.params.zoom.containerClass))).length > 0) {
        $slideEl.on(swiper.touchEvents.move, zoom.onTouchMove);
      }
    });
  },
  disable: function disable() {
    var swiper = this;
    var zoom = swiper.zoom;
    if (!zoom.enabled) { return; }

    swiper.zoom.enabled = false;

    var slides = swiper.slides;

    var passiveListener = swiper.touchEvents.start === 'touchstart' && Support.passiveListener && swiper.params.passiveListeners ? { passive: true, capture: false } : false;

    // Scale image
    if (Support.gestures) {
      slides.off('gesturestart', zoom.onGestureStart, passiveListener);
      slides.off('gesturechange', zoom.onGestureChange, passiveListener);
      slides.off('gestureend', zoom.onGestureEnd, passiveListener);
    } else if (swiper.touchEvents.start === 'touchstart') {
      slides.off(swiper.touchEvents.start, zoom.onGestureStart, passiveListener);
      slides.off(swiper.touchEvents.move, zoom.onGestureChange, passiveListener);
      slides.off(swiper.touchEvents.end, zoom.onGestureEnd, passiveListener);
    }

    // Move image
    swiper.slides.each(function (index, slideEl) {
      var $slideEl = $$1(slideEl);
      if ($slideEl.find(("." + (swiper.params.zoom.containerClass))).length > 0) {
        $slideEl.off(swiper.touchEvents.move, zoom.onTouchMove);
      }
    });
  },
};

var Zoom$1 = {
  name: 'zoom',
  params: {
    zoom: {
      enabled: false,
      maxRatio: 3,
      minRatio: 1,
      toggle: true,
      containerClass: 'swiper-zoom-container',
      zoomedSlideClass: 'swiper-slide-zoomed',
    },
  },
  create: function create() {
    var swiper = this;
    var zoom = {
      enabled: false,
      scale: 1,
      currentScale: 1,
      isScaling: false,
      gesture: {
        $slideEl: undefined,
        slideWidth: undefined,
        slideHeight: undefined,
        $imageEl: undefined,
        $imageWrapEl: undefined,
        maxRatio: 3,
      },
      image: {
        isTouched: undefined,
        isMoved: undefined,
        currentX: undefined,
        currentY: undefined,
        minX: undefined,
        minY: undefined,
        maxX: undefined,
        maxY: undefined,
        width: undefined,
        height: undefined,
        startX: undefined,
        startY: undefined,
        touchesStart: {},
        touchesCurrent: {},
      },
      velocity: {
        x: undefined,
        y: undefined,
        prevPositionX: undefined,
        prevPositionY: undefined,
        prevTime: undefined,
      },
    };
    ('onGestureStart onGestureChange onGestureEnd onTouchStart onTouchMove onTouchEnd onTransitionEnd toggle enable disable in out').split(' ').forEach(function (methodName) {
      zoom[methodName] = Zoom[methodName].bind(swiper);
    });
    Utils.extend(swiper, {
      zoom: zoom,
    });
  },
  on: {
    init: function init() {
      var swiper = this;
      if (swiper.params.zoom.enabled) {
        swiper.zoom.enable();
      }
    },
    destroy: function destroy() {
      var swiper = this;
      swiper.zoom.disable();
    },
    touchStart: function touchStart(e) {
      var swiper = this;
      if (!swiper.zoom.enabled) { return; }
      swiper.zoom.onTouchStart(e);
    },
    touchEnd: function touchEnd(e) {
      var swiper = this;
      if (!swiper.zoom.enabled) { return; }
      swiper.zoom.onTouchEnd(e);
    },
    doubleTap: function doubleTap(e) {
      var swiper = this;
      if (swiper.params.zoom.enabled && swiper.zoom.enabled && swiper.params.zoom.toggle) {
        swiper.zoom.toggle(e);
      }
    },
    transitionEnd: function transitionEnd() {
      var swiper = this;
      if (swiper.zoom.enabled && swiper.params.zoom.enabled) {
        swiper.zoom.onTransitionEnd();
      }
    },
  },
};

var Lazy = {
  loadInSlide: function loadInSlide(index, loadInDuplicate) {
    if ( loadInDuplicate === void 0 ) loadInDuplicate = true;

    var swiper = this;
    var params = swiper.params.lazy;
    if (typeof index === 'undefined') { return; }
    if (swiper.slides.length === 0) { return; }
    var isVirtual = swiper.virtual && swiper.params.virtual.enabled;

    var $slideEl = isVirtual
      ? swiper.$wrapperEl.children(("." + (swiper.params.slideClass) + "[data-swiper-slide-index=\"" + index + "\"]"))
      : swiper.slides.eq(index);

    var $images = $slideEl.find(("." + (params.elementClass) + ":not(." + (params.loadedClass) + "):not(." + (params.loadingClass) + ")"));
    if ($slideEl.hasClass(params.elementClass) && !$slideEl.hasClass(params.loadedClass) && !$slideEl.hasClass(params.loadingClass)) {
      $images = $images.add($slideEl[0]);
    }
    if ($images.length === 0) { return; }

    $images.each(function (imageIndex, imageEl) {
      var $imageEl = $$1(imageEl);
      $imageEl.addClass(params.loadingClass);

      var background = $imageEl.attr('data-background');
      var src = $imageEl.attr('data-src');
      var srcset = $imageEl.attr('data-srcset');
      var sizes = $imageEl.attr('data-sizes');

      swiper.loadImage($imageEl[0], (src || background), srcset, sizes, false, function () {
        if (typeof swiper === 'undefined' || swiper === null || !swiper || (swiper && !swiper.params) || swiper.destroyed) { return; }
        if (background) {
          $imageEl.css('background-image', ("url(\"" + background + "\")"));
          $imageEl.removeAttr('data-background');
        } else {
          if (srcset) {
            $imageEl.attr('srcset', srcset);
            $imageEl.removeAttr('data-srcset');
          }
          if (sizes) {
            $imageEl.attr('sizes', sizes);
            $imageEl.removeAttr('data-sizes');
          }
          if (src) {
            $imageEl.attr('src', src);
            $imageEl.removeAttr('data-src');
          }
        }

        $imageEl.addClass(params.loadedClass).removeClass(params.loadingClass);
        $slideEl.find(("." + (params.preloaderClass))).remove();
        if (swiper.params.loop && loadInDuplicate) {
          var slideOriginalIndex = $slideEl.attr('data-swiper-slide-index');
          if ($slideEl.hasClass(swiper.params.slideDuplicateClass)) {
            var originalSlide = swiper.$wrapperEl.children(("[data-swiper-slide-index=\"" + slideOriginalIndex + "\"]:not(." + (swiper.params.slideDuplicateClass) + ")"));
            swiper.lazy.loadInSlide(originalSlide.index(), false);
          } else {
            var duplicatedSlide = swiper.$wrapperEl.children(("." + (swiper.params.slideDuplicateClass) + "[data-swiper-slide-index=\"" + slideOriginalIndex + "\"]"));
            swiper.lazy.loadInSlide(duplicatedSlide.index(), false);
          }
        }
        swiper.emit('lazyImageReady', $slideEl[0], $imageEl[0]);
      });

      swiper.emit('lazyImageLoad', $slideEl[0], $imageEl[0]);
    });
  },
  load: function load() {
    var swiper = this;
    var $wrapperEl = swiper.$wrapperEl;
    var swiperParams = swiper.params;
    var slides = swiper.slides;
    var activeIndex = swiper.activeIndex;
    var isVirtual = swiper.virtual && swiperParams.virtual.enabled;
    var params = swiperParams.lazy;

    var slidesPerView = swiperParams.slidesPerView;
    if (slidesPerView === 'auto') {
      slidesPerView = 0;
    }

    function slideExist(index) {
      if (isVirtual) {
        if ($wrapperEl.children(("." + (swiperParams.slideClass) + "[data-swiper-slide-index=\"" + index + "\"]")).length) {
          return true;
        }
      } else if (slides[index]) { return true; }
      return false;
    }
    function slideIndex(slideEl) {
      if (isVirtual) {
        return $$1(slideEl).attr('data-swiper-slide-index');
      }
      return $$1(slideEl).index();
    }

    if (!swiper.lazy.initialImageLoaded) { swiper.lazy.initialImageLoaded = true; }
    if (swiper.params.watchSlidesVisibility) {
      $wrapperEl.children(("." + (swiperParams.slideVisibleClass))).each(function (elIndex, slideEl) {
        var index = isVirtual ? $$1(slideEl).attr('data-swiper-slide-index') : $$1(slideEl).index();
        swiper.lazy.loadInSlide(index);
      });
    } else if (slidesPerView > 1) {
      for (var i = activeIndex; i < activeIndex + slidesPerView; i += 1) {
        if (slideExist(i)) { swiper.lazy.loadInSlide(i); }
      }
    } else {
      swiper.lazy.loadInSlide(activeIndex);
    }
    if (params.loadPrevNext) {
      if (slidesPerView > 1 || (params.loadPrevNextAmount && params.loadPrevNextAmount > 1)) {
        var amount = params.loadPrevNextAmount;
        var spv = slidesPerView;
        var maxIndex = Math.min(activeIndex + spv + Math.max(amount, spv), slides.length);
        var minIndex = Math.max(activeIndex - Math.max(spv, amount), 0);
        // Next Slides
        for (var i$1 = activeIndex + slidesPerView; i$1 < maxIndex; i$1 += 1) {
          if (slideExist(i$1)) { swiper.lazy.loadInSlide(i$1); }
        }
        // Prev Slides
        for (var i$2 = minIndex; i$2 < activeIndex; i$2 += 1) {
          if (slideExist(i$2)) { swiper.lazy.loadInSlide(i$2); }
        }
      } else {
        var nextSlide = $wrapperEl.children(("." + (swiperParams.slideNextClass)));
        if (nextSlide.length > 0) { swiper.lazy.loadInSlide(slideIndex(nextSlide)); }

        var prevSlide = $wrapperEl.children(("." + (swiperParams.slidePrevClass)));
        if (prevSlide.length > 0) { swiper.lazy.loadInSlide(slideIndex(prevSlide)); }
      }
    }
  },
};

var Lazy$1 = {
  name: 'lazy',
  params: {
    lazy: {
      enabled: false,
      loadPrevNext: false,
      loadPrevNextAmount: 1,
      loadOnTransitionStart: false,

      elementClass: 'swiper-lazy',
      loadingClass: 'swiper-lazy-loading',
      loadedClass: 'swiper-lazy-loaded',
      preloaderClass: 'swiper-lazy-preloader',
    },
  },
  create: function create() {
    var swiper = this;
    Utils.extend(swiper, {
      lazy: {
        initialImageLoaded: false,
        load: Lazy.load.bind(swiper),
        loadInSlide: Lazy.loadInSlide.bind(swiper),
      },
    });
  },
  on: {
    beforeInit: function beforeInit() {
      var swiper = this;
      if (swiper.params.lazy.enabled && swiper.params.preloadImages) {
        swiper.params.preloadImages = false;
      }
    },
    init: function init() {
      var swiper = this;
      if (swiper.params.lazy.enabled && !swiper.params.loop && swiper.params.initialSlide === 0) {
        swiper.lazy.load();
      }
    },
    scroll: function scroll() {
      var swiper = this;
      if (swiper.params.freeMode && !swiper.params.freeModeSticky) {
        swiper.lazy.load();
      }
    },
    resize: function resize() {
      var swiper = this;
      if (swiper.params.lazy.enabled) {
        swiper.lazy.load();
      }
    },
    scrollbarDragMove: function scrollbarDragMove() {
      var swiper = this;
      if (swiper.params.lazy.enabled) {
        swiper.lazy.load();
      }
    },
    transitionStart: function transitionStart() {
      var swiper = this;
      if (swiper.params.lazy.enabled) {
        if (swiper.params.lazy.loadOnTransitionStart || (!swiper.params.lazy.loadOnTransitionStart && !swiper.lazy.initialImageLoaded)) {
          swiper.lazy.load();
        }
      }
    },
    transitionEnd: function transitionEnd() {
      var swiper = this;
      if (swiper.params.lazy.enabled && !swiper.params.lazy.loadOnTransitionStart) {
        swiper.lazy.load();
      }
    },
  },
};

/* eslint no-bitwise: ["error", { "allow": [">>"] }] */
var Controller = {
  LinearSpline: function LinearSpline(x, y) {
    var binarySearch = (function search() {
      var maxIndex;
      var minIndex;
      var guess;
      return function (array, val) {
        minIndex = -1;
        maxIndex = array.length;
        while (maxIndex - minIndex > 1) {
          guess = maxIndex + minIndex >> 1;
          if (array[guess] <= val) {
            minIndex = guess;
          } else {
            maxIndex = guess;
          }
        }
        return maxIndex;
      };
    }());
    this.x = x;
    this.y = y;
    this.lastIndex = x.length - 1;
    // Given an x value (x2), return the expected y2 value:
    // (x1,y1) is the known point before given value,
    // (x3,y3) is the known point after given value.
    var i1;
    var i3;

    this.interpolate = function interpolate(x2) {
      if (!x2) { return 0; }

      // Get the indexes of x1 and x3 (the array indexes before and after given x2):
      i3 = binarySearch(this.x, x2);
      i1 = i3 - 1;

      // We have our indexes i1 & i3, so we can calculate already:
      // y2 := ((x2−x1) × (y3−y1)) ÷ (x3−x1) + y1
      return (((x2 - this.x[i1]) * (this.y[i3] - this.y[i1])) / (this.x[i3] - this.x[i1])) + this.y[i1];
    };
    return this;
  },
  // xxx: for now i will just save one spline function to to
  getInterpolateFunction: function getInterpolateFunction(c) {
    var swiper = this;
    if (!swiper.controller.spline) {
      swiper.controller.spline = swiper.params.loop ?
        new Controller.LinearSpline(swiper.slidesGrid, c.slidesGrid) :
        new Controller.LinearSpline(swiper.snapGrid, c.snapGrid);
    }
  },
  setTranslate: function setTranslate(setTranslate$1, byController) {
    var swiper = this;
    var controlled = swiper.controller.control;
    var multiplier;
    var controlledTranslate;
    function setControlledTranslate(c) {
      // this will create an Interpolate function based on the snapGrids
      // x is the Grid of the scrolled scroller and y will be the controlled scroller
      // it makes sense to create this only once and recall it for the interpolation
      // the function does a lot of value caching for performance
      var translate = c.rtl && c.params.direction === 'horizontal' ? -swiper.translate : swiper.translate;
      if (swiper.params.controller.by === 'slide') {
        swiper.controller.getInterpolateFunction(c);
        // i am not sure why the values have to be multiplicated this way, tried to invert the snapGrid
        // but it did not work out
        controlledTranslate = -swiper.controller.spline.interpolate(-translate);
      }

      if (!controlledTranslate || swiper.params.controller.by === 'container') {
        multiplier = (c.maxTranslate() - c.minTranslate()) / (swiper.maxTranslate() - swiper.minTranslate());
        controlledTranslate = ((translate - swiper.minTranslate()) * multiplier) + c.minTranslate();
      }

      if (swiper.params.controller.inverse) {
        controlledTranslate = c.maxTranslate() - controlledTranslate;
      }
      c.updateProgress(controlledTranslate);
      c.setTranslate(controlledTranslate, swiper);
      c.updateActiveIndex();
      c.updateSlidesClasses();
    }
    if (Array.isArray(controlled)) {
      for (var i = 0; i < controlled.length; i += 1) {
        if (controlled[i] !== byController && controlled[i] instanceof Swiper$1) {
          setControlledTranslate(controlled[i]);
        }
      }
    } else if (controlled instanceof Swiper$1 && byController !== controlled) {
      setControlledTranslate(controlled);
    }
  },
  setTransition: function setTransition(duration, byController) {
    var swiper = this;
    var controlled = swiper.controller.control;
    var i;
    function setControlledTransition(c) {
      c.setTransition(duration, swiper);
      if (duration !== 0) {
        c.transitionStart();
        c.$wrapperEl.transitionEnd(function () {
          if (!controlled) { return; }
          if (c.params.loop && swiper.params.controller.by === 'slide') {
            c.loopFix();
          }
          c.transitionEnd();
        });
      }
    }
    if (Array.isArray(controlled)) {
      for (i = 0; i < controlled.length; i += 1) {
        if (controlled[i] !== byController && controlled[i] instanceof Swiper$1) {
          setControlledTransition(controlled[i]);
        }
      }
    } else if (controlled instanceof Swiper$1 && byController !== controlled) {
      setControlledTransition(controlled);
    }
  },
};
var Controller$1 = {
  name: 'controller',
  params: {
    controller: {
      control: undefined,
      inverse: false,
      by: 'slide', // or 'container'
    },
  },
  create: function create() {
    var swiper = this;
    Utils.extend(swiper, {
      controller: {
        control: swiper.params.controller.control,
        getInterpolateFunction: Controller.getInterpolateFunction.bind(swiper),
        setTranslate: Controller.setTranslate.bind(swiper),
        setTransition: Controller.setTransition.bind(swiper),
      },
    });
  },
  on: {
    update: function update() {
      var swiper = this;
      if (!swiper.controller.control) { return; }
      if (swiper.controller.spline) {
        swiper.controller.spline = undefined;
        delete swiper.controller.spline;
      }
    },
    resize: function resize() {
      var swiper = this;
      if (!swiper.controller.control) { return; }
      if (swiper.controller.spline) {
        swiper.controller.spline = undefined;
        delete swiper.controller.spline;
      }
    },
    observerUpdate: function observerUpdate() {
      var swiper = this;
      if (!swiper.controller.control) { return; }
      if (swiper.controller.spline) {
        swiper.controller.spline = undefined;
        delete swiper.controller.spline;
      }
    },
    setTranslate: function setTranslate(translate, byController) {
      var swiper = this;
      if (!swiper.controller.control) { return; }
      swiper.controller.setTranslate(translate, byController);
    },
    setTransition: function setTransition(duration, byController) {
      var swiper = this;
      if (!swiper.controller.control) { return; }
      swiper.controller.setTransition(duration, byController);
    },
  },
};

var a11y = {
  makeElFocusable: function makeElFocusable($el) {
    $el.attr('tabIndex', '0');
    return $el;
  },
  addElRole: function addElRole($el, role) {
    $el.attr('role', role);
    return $el;
  },
  addElLabel: function addElLabel($el, label) {
    $el.attr('aria-label', label);
    return $el;
  },
  disableEl: function disableEl($el) {
    $el.attr('aria-disabled', true);
    return $el;
  },
  enableEl: function enableEl($el) {
    $el.attr('aria-disabled', false);
    return $el;
  },
  onEnterKey: function onEnterKey(e) {
    var swiper = this;
    var params = swiper.params.a11y;
    if (e.keyCode !== 13) { return; }
    var $targetEl = $$1(e.target);
    if (swiper.navigation && swiper.navigation.$nextEl && $targetEl.is(swiper.navigation.$nextEl)) {
      if (!(swiper.isEnd && !swiper.params.loop)) {
        swiper.slideNext();
      }
      if (swiper.isEnd) {
        swiper.a11y.notify(params.lastSlideMessage);
      } else {
        swiper.a11y.notify(params.nextSlideMessage);
      }
    }
    if (swiper.navigation && swiper.navigation.$prevEl && $targetEl.is(swiper.navigation.$prevEl)) {
      if (!(swiper.isBeginning && !swiper.params.loop)) {
        swiper.slidePrev();
      }
      if (swiper.isBeginning) {
        swiper.a11y.notify(params.firstSlideMessage);
      } else {
        swiper.a11y.notify(params.prevSlideMessage);
      }
    }
    if (swiper.pagination && $targetEl.is(("." + (swiper.params.pagination.bulletClass)))) {
      $targetEl[0].click();
    }
  },
  notify: function notify(message) {
    var swiper = this;
    var notification = swiper.a11y.liveRegion;
    if (notification.length === 0) { return; }
    notification.html('');
    notification.html(message);
  },
  updateNavigation: function updateNavigation() {
    var swiper = this;

    if (swiper.params.loop) { return; }
    var ref = swiper.navigation;
    var $nextEl = ref.$nextEl;
    var $prevEl = ref.$prevEl;

    if ($prevEl && $prevEl.length > 0) {
      if (swiper.isBeginning) {
        swiper.a11y.disableEl($prevEl);
      } else {
        swiper.a11y.enableEl($prevEl);
      }
    }
    if ($nextEl && $nextEl.length > 0) {
      if (swiper.isEnd) {
        swiper.a11y.disableEl($nextEl);
      } else {
        swiper.a11y.enableEl($nextEl);
      }
    }
  },
  updatePagination: function updatePagination() {
    var swiper = this;
    var params = swiper.params.a11y;
    if (swiper.pagination && swiper.params.pagination.clickable && swiper.pagination.bullets && swiper.pagination.bullets.length) {
      swiper.pagination.bullets.each(function (bulletIndex, bulletEl) {
        var $bulletEl = $$1(bulletEl);
        swiper.a11y.makeElFocusable($bulletEl);
        swiper.a11y.addElRole($bulletEl, 'button');
        swiper.a11y.addElLabel($bulletEl, params.paginationBulletMessage.replace(/{{index}}/, $bulletEl.index() + 1));
      });
    }
  },
  init: function init() {
    var swiper = this;

    swiper.$el.append(swiper.a11y.liveRegion);

    // Navigation
    var params = swiper.params.a11y;
    var $nextEl;
    var $prevEl;
    if (swiper.navigation && swiper.navigation.$nextEl) {
      $nextEl = swiper.navigation.$nextEl;
    }
    if (swiper.navigation && swiper.navigation.$prevEl) {
      $prevEl = swiper.navigation.$prevEl;
    }
    if ($nextEl) {
      swiper.a11y.makeElFocusable($nextEl);
      swiper.a11y.addElRole($nextEl, 'button');
      swiper.a11y.addElLabel($nextEl, params.nextSlideMessage);
      $nextEl.on('keydown', swiper.a11y.onEnterKey);
    }
    if ($prevEl) {
      swiper.a11y.makeElFocusable($prevEl);
      swiper.a11y.addElRole($prevEl, 'button');
      swiper.a11y.addElLabel($prevEl, params.prevSlideMessage);
      $prevEl.on('keydown', swiper.a11y.onEnterKey);
    }

    // Pagination
    if (swiper.pagination && swiper.params.pagination.clickable && swiper.pagination.bullets && swiper.pagination.bullets.length) {
      swiper.pagination.$el.on('keydown', ("." + (swiper.params.pagination.bulletClass)), swiper.a11y.onEnterKey);
    }
  },
  destroy: function destroy() {
    var swiper = this;
    if (swiper.a11y.liveRegion && swiper.a11y.liveRegion.length > 0) { swiper.a11y.liveRegion.remove(); }

    var $nextEl;
    var $prevEl;
    if (swiper.navigation && swiper.navigation.$nextEl) {
      $nextEl = swiper.navigation.$nextEl;
    }
    if (swiper.navigation && swiper.navigation.$prevEl) {
      $prevEl = swiper.navigation.$prevEl;
    }
    if ($nextEl) {
      $nextEl.off('keydown', swiper.a11y.onEnterKey);
    }
    if ($prevEl) {
      $prevEl.off('keydown', swiper.a11y.onEnterKey);
    }

    // Pagination
    if (swiper.pagination && swiper.params.pagination.clickable && swiper.pagination.bullets && swiper.pagination.bullets.length) {
      swiper.pagination.$el.off('keydown', ("." + (swiper.params.pagination.bulletClass)), swiper.a11y.onEnterKey);
    }
  },
};
var A11y = {
  name: 'a11y',
  params: {
    a11y: {
      enabled: false,
      notificationClass: 'swiper-notification',
      prevSlideMessage: 'Previous slide',
      nextSlideMessage: 'Next slide',
      firstSlideMessage: 'This is the first slide',
      lastSlideMessage: 'This is the last slide',
      paginationBulletMessage: 'Go to slide {{index}}',
    },
  },
  create: function create() {
    var swiper = this;
    Utils.extend(swiper, {
      a11y: {
        liveRegion: $$1(("<span class=\"" + (swiper.params.a11y.notificationClass) + "\" aria-live=\"assertive\" aria-atomic=\"true\"></span>")),
      },
    });
    Object.keys(a11y).forEach(function (methodName) {
      swiper.a11y[methodName] = a11y[methodName].bind(swiper);
    });
  },
  on: {
    init: function init() {
      var swiper = this;
      if (!swiper.params.a11y.enabled) { return; }
      swiper.a11y.init();
      swiper.a11y.updateNavigation();
    },
    toEdge: function toEdge() {
      var swiper = this;
      if (!swiper.params.a11y.enabled) { return; }
      swiper.a11y.updateNavigation();
    },
    fromEdge: function fromEdge() {
      var swiper = this;
      if (!swiper.params.a11y.enabled) { return; }
      swiper.a11y.updateNavigation();
    },
    paginationUpdate: function paginationUpdate() {
      var swiper = this;
      if (!swiper.params.a11y.enabled) { return; }
      swiper.a11y.updatePagination();
    },
    destroy: function destroy() {
      var swiper = this;
      if (!swiper.params.a11y.enabled) { return; }
      swiper.a11y.destroy();
    },
  },
};

var History = {
  init: function init() {
    var swiper = this;
    if (!swiper.params.history) { return; }
    if (!win.history || !win.history.pushState) {
      swiper.params.history.enabled = false;
      swiper.params.hashNavigation.enabled = true;
      return;
    }
    var history = swiper.history;
    history.initialized = true;
    history.paths = History.getPathValues();
    if (!history.paths.key && !history.paths.value) { return; }
    history.scrollToSlide(0, history.paths.value, swiper.params.runCallbacksOnInit);
    if (!swiper.params.history.replaceState) {
      win.addEventListener('popstate', swiper.history.setHistoryPopState);
    }
  },
  destroy: function destroy() {
    var swiper = this;
    if (!swiper.params.history.replaceState) {
      win.removeEventListener('popstate', swiper.history.setHistoryPopState);
    }
  },
  setHistoryPopState: function setHistoryPopState() {
    var swiper = this;
    swiper.history.paths = History.getPathValues();
    swiper.history.scrollToSlide(swiper.params.speed, swiper.history.paths.value, false);
  },
  getPathValues: function getPathValues() {
    var pathArray = win.location.pathname.slice(1).split('/').filter(function (part) { return part !== ''; });
    var total = pathArray.length;
    var key = pathArray[total - 2];
    var value = pathArray[total - 1];
    return { key: key, value: value };
  },
  setHistory: function setHistory(key, index) {
    var swiper = this;
    if (!swiper.history.initialized || !swiper.params.history.enabled) { return; }
    var slide = swiper.slides.eq(index);
    var value = History.slugify(slide.attr('data-history'));
    if (!win.location.pathname.includes(key)) {
      value = key + "/" + value;
    }
    var currentState = win.history.state;
    if (currentState && currentState.value === value) {
      return;
    }
    if (swiper.params.history.replaceState) {
      win.history.replaceState({ value: value }, null, value);
    } else {
      win.history.pushState({ value: value }, null, value);
    }
  },
  slugify: function slugify(text) {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  },
  scrollToSlide: function scrollToSlide(speed, value, runCallbacks) {
    var swiper = this;
    if (value) {
      for (var i = 0, length = swiper.slides.length; i < length; i += 1) {
        var slide = swiper.slides.eq(i);
        var slideHistory = History.slugify(slide.attr('data-history'));
        if (slideHistory === value && !slide.hasClass(swiper.params.slideDuplicateClass)) {
          var index = slide.index();
          swiper.slideTo(index, speed, runCallbacks);
        }
      }
    } else {
      swiper.slideTo(0, speed, runCallbacks);
    }
  },
};

var History$1 = {
  name: 'history',
  params: {
    history: {
      enabled: false,
      replaceState: false,
      key: 'slides',
    },
  },
  create: function create() {
    var swiper = this;
    Utils.extend(swiper, {
      history: {
        init: History.init.bind(swiper),
        setHistory: History.setHistory.bind(swiper),
        setHistoryPopState: History.setHistoryPopState.bind(swiper),
        scrollToSlide: History.scrollToSlide.bind(swiper),
        destroy: History.destroy.bind(swiper),
      },
    });
  },
  on: {
    init: function init() {
      var swiper = this;
      if (swiper.params.history.enabled) {
        swiper.history.init();
      }
    },
    destroy: function destroy() {
      var swiper = this;
      if (swiper.params.history.enabled) {
        swiper.history.destroy();
      }
    },
    transitionEnd: function transitionEnd() {
      var swiper = this;
      if (swiper.history.initialized) {
        swiper.history.setHistory(swiper.params.history.key, swiper.activeIndex);
      }
    },
  },
};

var HashNavigation = {
  onHashCange: function onHashCange() {
    var swiper = this;
    var newHash = doc.location.hash.replace('#', '');
    var activeSlideHash = swiper.slides.eq(swiper.activeIndex).attr('data-hash');
    if (newHash !== activeSlideHash) {
      swiper.slideTo(swiper.$wrapperEl.children(("." + (swiper.params.slideClass) + "[data-hash=\"" + newHash + "\"]")).index());
    }
  },
  setHash: function setHash() {
    var swiper = this;
    if (!swiper.hashNavigation.initialized || !swiper.params.hashNavigation.enabled) { return; }
    if (swiper.params.hashNavigation.replaceState && win.history && win.history.replaceState) {
      win.history.replaceState(null, null, (("#" + (swiper.slides.eq(swiper.activeIndex).attr('data-hash'))) || ''));
    } else {
      var slide = swiper.slides.eq(swiper.activeIndex);
      var hash = slide.attr('data-hash') || slide.attr('data-history');
      doc.location.hash = hash || '';
    }
  },
  init: function init() {
    var swiper = this;
    if (!swiper.params.hashNavigation.enabled || (swiper.params.history && swiper.params.history.enabled)) { return; }
    swiper.hashNavigation.initialized = true;
    var hash = doc.location.hash.replace('#', '');
    if (hash) {
      var speed = 0;
      for (var i = 0, length = swiper.slides.length; i < length; i += 1) {
        var slide = swiper.slides.eq(i);
        var slideHash = slide.attr('data-hash') || slide.attr('data-history');
        if (slideHash === hash && !slide.hasClass(swiper.params.slideDuplicateClass)) {
          var index = slide.index();
          swiper.slideTo(index, speed, swiper.params.runCallbacksOnInit, true);
        }
      }
    }
    if (swiper.params.hashNavigation.watchState) {
      $$1(win).on('hashchange', swiper.hashNavigation.onHashCange);
    }
  },
  destroy: function destroy() {
    var swiper = this;
    if (swiper.params.hashNavigation.watchState) {
      $$1(win).off('hashchange', swiper.hashNavigation.onHashCange);
    }
  },
};
var HashNavigation$1 = {
  name: 'hash-navigation',
  params: {
    hashNavigation: {
      enabled: false,
      replaceState: false,
      watchState: false,
    },
  },
  create: function create() {
    var swiper = this;
    Utils.extend(swiper, {
      hashNavigation: {
        initialized: false,
        init: HashNavigation.init.bind(swiper),
        destroy: HashNavigation.destroy.bind(swiper),
        setHash: HashNavigation.setHash.bind(swiper),
        onHashCange: HashNavigation.onHashCange.bind(swiper),
      },
    });
  },
  on: {
    init: function init() {
      var swiper = this;
      if (swiper.params.hashNavigation.enabled) {
        swiper.hashNavigation.init();
      }
    },
    destroy: function destroy() {
      var swiper = this;
      if (swiper.params.hashNavigation.enabled) {
        swiper.hashNavigation.destroy();
      }
    },
    transitionEnd: function transitionEnd() {
      var swiper = this;
      if (swiper.hashNavigation.initialized) {
        swiper.hashNavigation.setHash();
      }
    },
  },
};

var Autoplay = {
  run: function run() {
    var swiper = this;
    var $activeSlideEl = swiper.slides.eq(swiper.activeIndex);
    var delay = swiper.params.autoplay.delay;
    if ($activeSlideEl.attr('data-swiper-autoplay')) {
      delay = $activeSlideEl.attr('data-swiper-autoplay') || swiper.params.autoplay.delay;
    }
    swiper.autoplay.timeout = Utils.nextTick(function () {
      if (swiper.params.loop) {
        swiper.loopFix();
        swiper.slideNext(swiper.params.speed, true, true);
        swiper.emit('autoplay');
      } else if (!swiper.isEnd) {
        swiper.slideNext(swiper.params.speed, true, true);
        swiper.emit('autoplay');
      } else if (!swiper.params.autoplay.stopOnLastSlide) {
        swiper.slideTo(0, swiper.params.speed, true, true);
        swiper.emit('autoplay');
      } else {
        swiper.autoplay.stop();
      }
    }, delay);
  },
  start: function start() {
    var swiper = this;
    if (typeof swiper.autoplay.timeout !== 'undefined') { return false; }
    if (swiper.autoplay.running) { return false; }
    swiper.autoplay.running = true;
    swiper.emit('autoplayStart');
    swiper.autoplay.run();
    return true;
  },
  stop: function stop() {
    var swiper = this;
    if (!swiper.autoplay.running) { return false; }
    if (typeof swiper.autoplay.timeout === 'undefined') { return false; }

    if (swiper.autoplay.timeout) {
      clearTimeout(swiper.autoplay.timeout);
      swiper.autoplay.timeout = undefined;
    }
    swiper.autoplay.running = false;
    swiper.emit('autoplayStop');
    return true;
  },
  pause: function pause(speed) {
    var swiper = this;
    if (!swiper.autoplay.running) { return; }
    if (swiper.autoplay.paused) { return; }
    if (swiper.autoplay.timeout) { clearTimeout(swiper.autoplay.timeout); }
    swiper.autoplay.paused = true;
    if (speed === 0) {
      swiper.autoplay.paused = false;
      swiper.autoplay.run();
    } else {
      swiper.$wrapperEl.transitionEnd(function () {
        if (!swiper || swiper.destroyed) { return; }
        swiper.autoplay.paused = false;
        if (!swiper.autoplay.running) {
          swiper.autoplay.stop();
        } else {
          swiper.autoplay.run();
        }
      });
    }
  },
};

var Autoplay$1 = {
  name: 'autoplay',
  params: {
    autoplay: {
      enabled: false,
      delay: 3000,
      disableOnInteraction: true,
      stopOnLastSlide: false,
    },
  },
  create: function create() {
    var swiper = this;
    Utils.extend(swiper, {
      autoplay: {
        running: false,
        paused: false,
        run: Autoplay.run.bind(swiper),
        start: Autoplay.start.bind(swiper),
        stop: Autoplay.stop.bind(swiper),
        pause: Autoplay.pause.bind(swiper),
      },
    });
  },
  on: {
    init: function init() {
      var swiper = this;
      if (swiper.params.autoplay.enabled) {
        swiper.autoplay.start();
      }
    },
    beforeTransitionStart: function beforeTransitionStart(speed, internal) {
      var swiper = this;
      if (swiper.autoplay.running) {
        if (internal || !swiper.params.autoplay.disableOnInteraction) {
          swiper.autoplay.pause(speed);
        } else {
          swiper.autoplay.stop();
        }
      }
    },
    sliderFirstMove: function sliderFirstMove() {
      var swiper = this;
      if (swiper.autoplay.running) {
        if (swiper.params.autoplay.disableOnInteraction) {
          swiper.autoplay.stop();
        } else {
          swiper.autoplay.pause();
        }
      }
    },
    destroy: function destroy() {
      var swiper = this;
      if (swiper.autoplay.running) {
        swiper.autoplay.stop();
      }
    },
  },
};

var Fade = {
  setTranslate: function setTranslate() {
    var swiper = this;
    var slides = swiper.slides;
    for (var i = 0; i < slides.length; i += 1) {
      var $slideEl = swiper.slides.eq(i);
      var offset = $slideEl[0].swiperSlideOffset;
      var tx = -offset;
      if (!swiper.params.virtualTranslate) { tx -= swiper.translate; }
      var ty = 0;
      if (!swiper.isHorizontal()) {
        ty = tx;
        tx = 0;
      }
      var slideOpacity = swiper.params.fadeEffect.crossFade ?
        Math.max(1 - Math.abs($slideEl[0].progress), 0) :
        1 + Math.min(Math.max($slideEl[0].progress, -1), 0);
      $slideEl
        .css({
          opacity: slideOpacity,
        })
        .transform(("translate3d(" + tx + "px, " + ty + "px, 0px)"));
    }
  },
  setTransition: function setTransition(duration) {
    var swiper = this;
    var slides = swiper.slides;
    var $wrapperEl = swiper.$wrapperEl;
    slides.transition(duration);
    if (swiper.params.virtualTranslate && duration !== 0) {
      var eventTriggered = false;
      slides.transitionEnd(function () {
        if (eventTriggered) { return; }
        if (!swiper || swiper.destroyed) { return; }
        eventTriggered = true;
        swiper.animating = false;
        var triggerEvents = ['webkitTransitionEnd', 'transitionend'];
        for (var i = 0; i < triggerEvents.length; i += 1) {
          $wrapperEl.trigger(triggerEvents[i]);
        }
      });
    }
  },
};

var EffectFade = {
  name: 'effect-fade',
  params: {
    fadeEffect: {
      crossFade: false,
    },
  },
  create: function create() {
    var swiper = this;
    Utils.extend(swiper, {
      fadeEffect: {
        setTranslate: Fade.setTranslate.bind(swiper),
        setTransition: Fade.setTransition.bind(swiper),
      },
    });
  },
  on: {
    beforeInit: function beforeInit() {
      var swiper = this;
      if (swiper.params.effect !== 'fade') { return; }
      swiper.classNames.push(((swiper.params.containerModifierClass) + "fade"));
      var overwriteParams = {
        slidesPerView: 1,
        slidesPerColumn: 1,
        slidesPerGroup: 1,
        watchSlidesProgress: true,
        spaceBetween: 0,
        virtualTranslate: true,
      };
      Utils.extend(swiper.params, overwriteParams);
      Utils.extend(swiper.originalParams, overwriteParams);
    },
    setTranslate: function setTranslate() {
      var swiper = this;
      if (swiper.params.effect !== 'fade') { return; }
      swiper.fadeEffect.setTranslate();
    },
    setTransition: function setTransition(duration) {
      var swiper = this;
      if (swiper.params.effect !== 'fade') { return; }
      swiper.fadeEffect.setTransition(duration);
    },
  },
};

var Cube = {
  setTranslate: function setTranslate() {
    var swiper = this;
    var $el = swiper.$el;
    var $wrapperEl = swiper.$wrapperEl;
    var slides = swiper.slides;
    var swiperWidth = swiper.width;
    var swiperHeight = swiper.height;
    var rtl = swiper.rtl;
    var swiperSize = swiper.size;
    var params = swiper.params.cubeEffect;
    var isHorizontal = swiper.isHorizontal();
    var isVirtual = swiper.virtual && swiper.params.virtual.enabled;
    var wrapperRotate = 0;
    var $cubeShadowEl;
    if (params.shadow) {
      if (isHorizontal) {
        $cubeShadowEl = $wrapperEl.find('.swiper-cube-shadow');
        if ($cubeShadowEl.length === 0) {
          $cubeShadowEl = $$1('<div class="swiper-cube-shadow"></div>');
          $wrapperEl.append($cubeShadowEl);
        }
        $cubeShadowEl.css({ height: (swiperWidth + "px") });
      } else {
        $cubeShadowEl = $el.find('.swiper-cube-shadow');
        if ($cubeShadowEl.length === 0) {
          $cubeShadowEl = $$1('<div class="swiper-cube-shadow"></div>');
          $el.append($cubeShadowEl);
        }
      }
    }
    for (var i = 0; i < slides.length; i += 1) {
      var $slideEl = slides.eq(i);
      var slideIndex = i;
      if (isVirtual) {
        slideIndex = parseInt($slideEl.attr('data-swiper-slide-index'), 10);
      }
      var slideAngle = slideIndex * 90;
      var round = Math.floor(slideAngle / 360);
      if (rtl) {
        slideAngle = -slideAngle;
        round = Math.floor(-slideAngle / 360);
      }
      var progress = Math.max(Math.min($slideEl[0].progress, 1), -1);
      var tx = 0;
      var ty = 0;
      var tz = 0;
      if (slideIndex % 4 === 0) {
        tx = -round * 4 * swiperSize;
        tz = 0;
      } else if ((slideIndex - 1) % 4 === 0) {
        tx = 0;
        tz = -round * 4 * swiperSize;
      } else if ((slideIndex - 2) % 4 === 0) {
        tx = swiperSize + (round * 4 * swiperSize);
        tz = swiperSize;
      } else if ((slideIndex - 3) % 4 === 0) {
        tx = -swiperSize;
        tz = (3 * swiperSize) + (swiperSize * 4 * round);
      }
      if (rtl) {
        tx = -tx;
      }

      if (!isHorizontal) {
        ty = tx;
        tx = 0;
      }

      var transform = "rotateX(" + (isHorizontal ? 0 : -slideAngle) + "deg) rotateY(" + (isHorizontal ? slideAngle : 0) + "deg) translate3d(" + tx + "px, " + ty + "px, " + tz + "px)";
      if (progress <= 1 && progress > -1) {
        wrapperRotate = (slideIndex * 90) + (progress * 90);
        if (rtl) { wrapperRotate = (-slideIndex * 90) - (progress * 90); }
      }
      $slideEl.transform(transform);
      if (params.slideShadows) {
        // Set shadows
        var shadowBefore = isHorizontal ? $slideEl.find('.swiper-slide-shadow-left') : $slideEl.find('.swiper-slide-shadow-top');
        var shadowAfter = isHorizontal ? $slideEl.find('.swiper-slide-shadow-right') : $slideEl.find('.swiper-slide-shadow-bottom');
        if (shadowBefore.length === 0) {
          shadowBefore = $$1(("<div class=\"swiper-slide-shadow-" + (isHorizontal ? 'left' : 'top') + "\"></div>"));
          $slideEl.append(shadowBefore);
        }
        if (shadowAfter.length === 0) {
          shadowAfter = $$1(("<div class=\"swiper-slide-shadow-" + (isHorizontal ? 'right' : 'bottom') + "\"></div>"));
          $slideEl.append(shadowAfter);
        }
        if (shadowBefore.length) { shadowBefore[0].style.opacity = Math.max(-progress, 0); }
        if (shadowAfter.length) { shadowAfter[0].style.opacity = Math.max(progress, 0); }
      }
    }
    $wrapperEl.css({
      '-webkit-transform-origin': ("50% 50% -" + (swiperSize / 2) + "px"),
      '-moz-transform-origin': ("50% 50% -" + (swiperSize / 2) + "px"),
      '-ms-transform-origin': ("50% 50% -" + (swiperSize / 2) + "px"),
      'transform-origin': ("50% 50% -" + (swiperSize / 2) + "px"),
    });

    if (params.shadow) {
      if (isHorizontal) {
        $cubeShadowEl.transform(("translate3d(0px, " + ((swiperWidth / 2) + params.shadowOffset) + "px, " + (-swiperWidth / 2) + "px) rotateX(90deg) rotateZ(0deg) scale(" + (params.shadowScale) + ")"));
      } else {
        var shadowAngle = Math.abs(wrapperRotate) - (Math.floor(Math.abs(wrapperRotate) / 90) * 90);
        var multiplier = 1.5 - (
          (Math.sin((shadowAngle * 2 * Math.PI) / 360) / 2) +
          (Math.cos((shadowAngle * 2 * Math.PI) / 360) / 2)
        );
        var scale1 = params.shadowScale;
        var scale2 = params.shadowScale / multiplier;
        var offset = params.shadowOffset;
        $cubeShadowEl.transform(("scale3d(" + scale1 + ", 1, " + scale2 + ") translate3d(0px, " + ((swiperHeight / 2) + offset) + "px, " + (-swiperHeight / 2 / scale2) + "px) rotateX(-90deg)"));
      }
    }
    var zFactor = (Browser.isSafari || Browser.isUiWebView) ? (-swiperSize / 2) : 0;
    $wrapperEl
      .transform(("translate3d(0px,0," + zFactor + "px) rotateX(" + (swiper.isHorizontal() ? 0 : wrapperRotate) + "deg) rotateY(" + (swiper.isHorizontal() ? -wrapperRotate : 0) + "deg)"));
  },
  setTransition: function setTransition(duration) {
    var swiper = this;
    var $el = swiper.$el;
    var slides = swiper.slides;
    slides
      .transition(duration)
      .find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left')
      .transition(duration);
    if (swiper.params.cubeEffect.shadow && !swiper.isHorizontal()) {
      $el.find('.swiper-cube-shadow').transition(duration);
    }
  },
};

var EffectCube = {
  name: 'effect-cube',
  params: {
    cubeEffect: {
      slideShadows: true,
      shadow: true,
      shadowOffset: 20,
      shadowScale: 0.94,
    },
  },
  create: function create() {
    var swiper = this;
    Utils.extend(swiper, {
      cubeEffect: {
        setTranslate: Cube.setTranslate.bind(swiper),
        setTransition: Cube.setTransition.bind(swiper),
      },
    });
  },
  on: {
    beforeInit: function beforeInit() {
      var swiper = this;
      if (swiper.params.effect !== 'cube') { return; }
      swiper.classNames.push(((swiper.params.containerModifierClass) + "cube"));
      swiper.classNames.push(((swiper.params.containerModifierClass) + "3d"));
      var overwriteParams = {
        slidesPerView: 1,
        slidesPerColumn: 1,
        slidesPerGroup: 1,
        watchSlidesProgress: true,
        resistanceRatio: 0,
        spaceBetween: 0,
        centeredSlides: false,
        virtualTranslate: true,
      };
      Utils.extend(swiper.params, overwriteParams);
      Utils.extend(swiper.originalParams, overwriteParams);
    },
    setTranslate: function setTranslate() {
      var swiper = this;
      if (swiper.params.effect !== 'cube') { return; }
      swiper.cubeEffect.setTranslate();
    },
    setTransition: function setTransition(duration) {
      var swiper = this;
      if (swiper.params.effect !== 'cube') { return; }
      swiper.cubeEffect.setTransition(duration);
    },
  },
};

var Flip = {
  setTranslate: function setTranslate() {
    var swiper = this;
    var slides = swiper.slides;
    for (var i = 0; i < slides.length; i += 1) {
      var $slideEl = slides.eq(i);
      var progress = $slideEl[0].progress;
      if (swiper.params.flipEffect.limitRotation) {
        progress = Math.max(Math.min($slideEl[0].progress, 1), -1);
      }
      var offset = $slideEl[0].swiperSlideOffset;
      var rotate = -180 * progress;
      var rotateY = rotate;
      var rotateX = 0;
      var tx = -offset;
      var ty = 0;
      if (!swiper.isHorizontal()) {
        ty = tx;
        tx = 0;
        rotateX = -rotateY;
        rotateY = 0;
      } else if (swiper.rtl) {
        rotateY = -rotateY;
      }

      $slideEl[0].style.zIndex = -Math.abs(Math.round(progress)) + slides.length;

      if (swiper.params.flipEffect.slideShadows) {
        // Set shadows
        var shadowBefore = swiper.isHorizontal() ? $slideEl.find('.swiper-slide-shadow-left') : $slideEl.find('.swiper-slide-shadow-top');
        var shadowAfter = swiper.isHorizontal() ? $slideEl.find('.swiper-slide-shadow-right') : $slideEl.find('.swiper-slide-shadow-bottom');
        if (shadowBefore.length === 0) {
          shadowBefore = $$1(("<div class=\"swiper-slide-shadow-" + (swiper.isHorizontal() ? 'left' : 'top') + "\"></div>"));
          $slideEl.append(shadowBefore);
        }
        if (shadowAfter.length === 0) {
          shadowAfter = $$1(("<div class=\"swiper-slide-shadow-" + (swiper.isHorizontal() ? 'right' : 'bottom') + "\"></div>"));
          $slideEl.append(shadowAfter);
        }
        if (shadowBefore.length) { shadowBefore[0].style.opacity = Math.max(-progress, 0); }
        if (shadowAfter.length) { shadowAfter[0].style.opacity = Math.max(progress, 0); }
      }
      $slideEl
        .transform(("translate3d(" + tx + "px, " + ty + "px, 0px) rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg)"));
    }
  },
  setTransition: function setTransition(duration) {
    var swiper = this;
    var slides = swiper.slides;
    var activeIndex = swiper.activeIndex;
    var $wrapperEl = swiper.$wrapperEl;
    slides
      .transition(duration)
      .find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left')
      .transition(duration);
    if (swiper.params.virtualTranslate && duration !== 0) {
      var eventTriggered = false;
      // eslint-disable-next-line
      slides.eq(activeIndex).transitionEnd(function onTransitionEnd() {
        if (eventTriggered) { return; }
        if (!swiper || swiper.destroyed) { return; }
        // if (!$(this).hasClass(swiper.params.slideActiveClass)) return;
        eventTriggered = true;
        swiper.animating = false;
        var triggerEvents = ['webkitTransitionEnd', 'transitionend'];
        for (var i = 0; i < triggerEvents.length; i += 1) {
          $wrapperEl.trigger(triggerEvents[i]);
        }
      });
    }
  },
};

var EffectFlip = {
  name: 'effect-flip',
  params: {
    flipEffect: {
      slideShadows: true,
      limitRotation: true,
    },
  },
  create: function create() {
    var swiper = this;
    Utils.extend(swiper, {
      flipEffect: {
        setTranslate: Flip.setTranslate.bind(swiper),
        setTransition: Flip.setTransition.bind(swiper),
      },
    });
  },
  on: {
    beforeInit: function beforeInit() {
      var swiper = this;
      if (swiper.params.effect !== 'flip') { return; }
      swiper.classNames.push(((swiper.params.containerModifierClass) + "flip"));
      swiper.classNames.push(((swiper.params.containerModifierClass) + "3d"));
      var overwriteParams = {
        slidesPerView: 1,
        slidesPerColumn: 1,
        slidesPerGroup: 1,
        watchSlidesProgress: true,
        spaceBetween: 0,
        virtualTranslate: true,
      };
      Utils.extend(swiper.params, overwriteParams);
      Utils.extend(swiper.originalParams, overwriteParams);
    },
    setTranslate: function setTranslate() {
      var swiper = this;
      if (swiper.params.effect !== 'flip') { return; }
      swiper.flipEffect.setTranslate();
    },
    setTransition: function setTransition(duration) {
      var swiper = this;
      if (swiper.params.effect !== 'flip') { return; }
      swiper.flipEffect.setTransition(duration);
    },
  },
};

var Coverflow = {
  setTranslate: function setTranslate() {
    var swiper = this;
    var swiperWidth = swiper.width;
    var swiperHeight = swiper.height;
    var slides = swiper.slides;
    var $wrapperEl = swiper.$wrapperEl;
    var slidesSizesGrid = swiper.slidesSizesGrid;
    var params = swiper.params.coverflowEffect;
    var isHorizontal = swiper.isHorizontal();
    var transform = swiper.translate;
    var center = isHorizontal ? -transform + (swiperWidth / 2) : -transform + (swiperHeight / 2);
    var rotate = isHorizontal ? params.rotate : -params.rotate;
    var translate = params.depth;
    // Each slide offset from center
    for (var i = 0, length = slides.length; i < length; i += 1) {
      var $slideEl = slides.eq(i);
      var slideSize = slidesSizesGrid[i];
      var slideOffset = $slideEl[0].swiperSlideOffset;
      var offsetMultiplier = ((center - slideOffset - (slideSize / 2)) / slideSize) * params.modifier;

      var rotateY = isHorizontal ? rotate * offsetMultiplier : 0;
      var rotateX = isHorizontal ? 0 : rotate * offsetMultiplier;
      // var rotateZ = 0
      var translateZ = -translate * Math.abs(offsetMultiplier);

      var translateY = isHorizontal ? 0 : params.stretch * (offsetMultiplier);
      var translateX = isHorizontal ? params.stretch * (offsetMultiplier) : 0;

      // Fix for ultra small values
      if (Math.abs(translateX) < 0.001) { translateX = 0; }
      if (Math.abs(translateY) < 0.001) { translateY = 0; }
      if (Math.abs(translateZ) < 0.001) { translateZ = 0; }
      if (Math.abs(rotateY) < 0.001) { rotateY = 0; }
      if (Math.abs(rotateX) < 0.001) { rotateX = 0; }

      var slideTransform = "translate3d(" + translateX + "px," + translateY + "px," + translateZ + "px)  rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg)";

      $slideEl.transform(slideTransform);
      $slideEl[0].style.zIndex = -Math.abs(Math.round(offsetMultiplier)) + 1;
      if (params.slideShadows) {
        // Set shadows
        var $shadowBeforeEl = isHorizontal ? $slideEl.find('.swiper-slide-shadow-left') : $slideEl.find('.swiper-slide-shadow-top');
        var $shadowAfterEl = isHorizontal ? $slideEl.find('.swiper-slide-shadow-right') : $slideEl.find('.swiper-slide-shadow-bottom');
        if ($shadowBeforeEl.length === 0) {
          $shadowBeforeEl = $$1(("<div class=\"swiper-slide-shadow-" + (isHorizontal ? 'left' : 'top') + "\"></div>"));
          $slideEl.append($shadowBeforeEl);
        }
        if ($shadowAfterEl.length === 0) {
          $shadowAfterEl = $$1(("<div class=\"swiper-slide-shadow-" + (isHorizontal ? 'right' : 'bottom') + "\"></div>"));
          $slideEl.append($shadowAfterEl);
        }
        if ($shadowBeforeEl.length) { $shadowBeforeEl[0].style.opacity = offsetMultiplier > 0 ? offsetMultiplier : 0; }
        if ($shadowAfterEl.length) { $shadowAfterEl[0].style.opacity = (-offsetMultiplier) > 0 ? -offsetMultiplier : 0; }
      }
    }

    // Set correct perspective for IE10
    if (Browser.ie) {
      var ws = $wrapperEl[0].style;
      ws.perspectiveOrigin = center + "px 50%";
    }
  },
  setTransition: function setTransition(duration) {
    var swiper = this;
    swiper.slides
      .transition(duration)
      .find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left')
      .transition(duration);
  },
};

var EffectCoverflow = {
  name: 'effect-coverflow',
  params: {
    coverflowEffect: {
      rotate: 50,
      stretch: 0,
      depth: 100,
      modifier: 1,
      slideShadows: true,
    },
  },
  create: function create() {
    var swiper = this;
    Utils.extend(swiper, {
      coverflowEffect: {
        setTranslate: Coverflow.setTranslate.bind(swiper),
        setTransition: Coverflow.setTransition.bind(swiper),
      },
    });
  },
  on: {
    beforeInit: function beforeInit() {
      var swiper = this;
      if (swiper.params.effect !== 'coverflow') { return; }

      swiper.classNames.push(((swiper.params.containerModifierClass) + "coverflow"));
      swiper.classNames.push(((swiper.params.containerModifierClass) + "3d"));

      swiper.params.watchSlidesProgress = true;
      swiper.originalParams.watchSlidesProgress = true;
    },
    setTranslate: function setTranslate() {
      var swiper = this;
      if (swiper.params.effect !== 'coverflow') { return; }
      swiper.coverflowEffect.setTranslate();
    },
    setTransition: function setTransition(duration) {
      var swiper = this;
      if (swiper.params.effect !== 'coverflow') { return; }
      swiper.coverflowEffect.setTransition(duration);
    },
  },
};

// Swiper Class
// Core Modules
Swiper$1.use([
  Device$2,
  Support$2,
  Browser$2,
  Resize,
  Observer$1,
  Virtual$1,
  Keyboard$1,
  Mousewheel$1,
  Navigation$1,
  Pagination$1,
  Scrollbar$1,
  Parallax$1,
  Zoom$1,
  Lazy$1,
  Controller$1,
  A11y,
  History$1,
  HashNavigation$1,
  Autoplay$1,
  EffectFade,
  EffectCube,
  EffectFlip,
  EffectCoverflow
]);

return Swiper$1;

})));

},{}],"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/node_modules/yt-player/index.js":[function(require,module,exports){
const EventEmitter = require('events').EventEmitter
const loadScript = require('load-script2')

const YOUTUBE_IFRAME_API_SRC = 'https://www.youtube.com/iframe_api'

const YOUTUBE_STATES = {
  '-1': 'unstarted',
  '0': 'ended',
  '1': 'playing',
  '2': 'paused',
  '3': 'buffering',
  '5': 'cued'
}

const YOUTUBE_ERROR = {
  // The request contains an invalid parameter value. For example, this error
  // occurs if you specify a videoId that does not have 11 characters, or if the
  // videoId contains invalid characters, such as exclamation points or asterisks.
  INVALID_PARAM: 2,

  // The requested content cannot be played in an HTML5 player or another error
  // related to the HTML5 player has occurred.
  HTML5_ERROR: 5,

  // The video requested was not found. This error occurs when a video has been
  // removed (for any reason) or has been marked as private.
  NOT_FOUND: 100,

  // The owner of the requested video does not allow it to be played in embedded
  // players.
  UNPLAYABLE_1: 101,

  // This error is the same as 101. It's just a 101 error in disguise!
  UNPLAYABLE_2: 150
}

const loadIframeAPICallbacks = []

/**
 * YouTube Player. Exposes a better API, with nicer events.
 * @param {HTMLElement|selector} element
 */
class YouTubePlayer extends EventEmitter {
  constructor (element, opts) {
    super()

    const elem = typeof element === 'string'
      ? document.querySelector(element)
      : element

    if (elem.id) {
      this._id = elem.id // use existing element id
    } else {
      this._id = elem.id = 'ytplayer-' + Math.random().toString(16).slice(2, 8)
    }

    this._opts = Object.assign({
      width: 640,
      height: 360,
      autoplay: false,
      captions: undefined,
      controls: true,
      keyboard: true,
      fullscreen: true,
      annotations: true,
      modestBranding: false,
      related: true,
      info: true,
      timeupdateFrequency: 1000
    }, opts)

    this.videoId = null
    this.destroyed = false

    this._api = null
    this._player = null
    this._ready = false // is player ready?
    this._queue = []

    this._interval = null

    // Setup listeners for 'timeupdate' events. The YouTube Player does not fire
    // 'timeupdate' events, so they are simulated using a setInterval().
    this._startInterval = this._startInterval.bind(this)
    this._stopInterval = this._stopInterval.bind(this)

    this.on('unstarted', this._stopInterval)
    this.on('ended', this._stopInterval)
    this.on('playing', this._startInterval)
    this.on('paused', this._stopInterval)
    this.on('buffering', this._stopInterval)

    this._loadIframeAPI((err, api) => {
      if (err) return this._destroy(new Error('YouTube Iframe API failed to load'))
      this._api = api

      // If load(videoId) was called before Iframe API loaded, ensure it gets
      // called again now
      if (this.videoId) this.load(this.videoId)
    })
  }

  load (videoId, autoplay) {
    if (this.destroyed) return
    if (autoplay == null) autoplay = true

    this.videoId = videoId

    // If the Iframe API is not ready yet, do nothing. Once the Iframe API is
    // ready, `load(this.videoId)` will be called.
    if (!this._api) return

    // If there is no player instance, create one.
    if (!this._player) {
      this._createPlayer(videoId)
      this.emit('unstarted')
      this.emit('buffering')
      return
    }

    // If the player instance is not ready yet, do nothing. Once the player
    // instance is ready, `load(this.videoId)` will be called. This ensures that
    // the last call to `load()` is the one that takes effect.
    if (!this._ready) return

    // If the player instance is ready, load the given `videoId`.
    if (autoplay) {
      this._player.loadVideoById(videoId)
    } else {
      this._player.cueVideoById(videoId)
    }
  }

  play () {
    if (this._ready) this._player.playVideo()
    else this._queueCommand('play')
  }

  pause () {
    if (this._ready) this._player.pauseVideo()
    else this._queueCommand('pause')
  }

  stop () {
    if (this._ready) this._player.stopVideo()
    else this._queueCommand('stop')
  }

  seek (seconds) {
    if (this._ready) this._player.seekTo(seconds, true)
    else this._queueCommand('seek', seconds)
  }

  setVolume (volume) {
    if (this._ready) this._player.setVolume(volume)
    else this._queueCommand('setVolume', volume)
  }

  setPlaybackRate (rate) {
    if (this._ready) this._player.setPlaybackRate(rate)
    else this._queueCommand('setPlaybackRate', rate)
  }

  getVolume () {
    return (this._ready && this._player.getVolume()) || 0
  }

  getPlaybackRate () {
    return (this._ready && this._player.getPlaybackRate()) || 1
  }

  getAvailablePlaybackRates () {
    return (this._ready && this._player.getAvailablePlaybackRates()) || [ 1 ]
  }

  getDuration () {
    return (this._ready && this._player.getDuration()) || 0
  }

  getProgress () {
    return (this._ready && this._player.getVideoLoadedFraction()) || 0
  }

  getState () {
    return (this._ready && YOUTUBE_STATES[this._player.getPlayerState()]) || 'unstarted'
  }

  getCurrentTime () {
    return (this._ready && this._player.getCurrentTime()) || 0
  }

  destroy () {
    this._destroy()
  }

  _destroy (err) {
    if (this.destroyed) return
    this.destroyed = true

    if (this._player) {
      this._player.stopVideo()
      this._player.destroy()
    }

    this.videoId = null

    this._id = null
    this._opts = null
    this._api = null
    this._player = null
    this._ready = false
    this._queue = null

    this._stopInterval()
    this._interval = false

    this.removeListener('playing', this._startInterval)
    this.removeListener('paused', this._stopInterval)
    this.removeListener('buffering', this._stopInterval)
    this.removeListener('unstarted', this._stopInterval)
    this.removeListener('ended', this._stopInterval)

    if (err) this.emit('error', err)
  }

  _queueCommand (command, ...args) {
    if (this.destroyed) return
    this._queue.push([command, args])
  }

  _flushQueue () {
    while (this._queue.length) {
      const command = this._queue.shift()
      this[command[0]].apply(this, command[1])
    }
  }

  _loadIframeAPI (cb) {
    // If API is loaded, there is nothing else to do
    if (window.YT && typeof window.YT.Player === 'function') {
      return cb(null, window.YT)
    }

    // Otherwise, queue callback until API is loaded
    loadIframeAPICallbacks.push(cb)

    const scripts = Array.from(document.getElementsByTagName('script'))
    const isLoading = scripts.some(script => script.src === YOUTUBE_IFRAME_API_SRC)

    // If API <script> tag is not present in the page, inject it. Ensures that
    // if user includes a hardcoded <script> tag in HTML for performance, another
    // one will not be added
    if (!isLoading) {
      loadScript(YOUTUBE_IFRAME_API_SRC, (err) => {
        if (err) {
          while (loadIframeAPICallbacks.length) {
            const loadCb = loadIframeAPICallbacks.shift()
            loadCb(err)
          }
        }
      })
    }

    // If ready function is not present, create it
    if (typeof window.onYouTubeIframeAPIReady !== 'function') {
      window.onYouTubeIframeAPIReady = () => {
        while (loadIframeAPICallbacks.length) {
          const loadCb = loadIframeAPICallbacks.shift()
          loadCb(null, window.YT)
        }
      }
    }
  }

  _createPlayer (videoId) {
    if (this.destroyed) return

    const opts = this._opts

    this._player = new this._api.Player(this._id, {
      width: opts.width,
      height: opts.height,
      videoId: videoId,
      playerVars: {
        // This parameter specifies whether the initial video will automatically
        // start to play when the player loads. Supported values are 0 or 1. The
        // default value is 0.
        autoplay: opts.autoplay ? 1 : 0,

        // Setting the parameter's value to 1 causes closed captions to be shown
        // by default, even if the user has turned captions off. The default
        // behavior is based on user preference.
        cc_load_policy: opts.captions != null
          ? opts.captions ? 1 : 0
          : undefined, // default to not setting this option

        // This parameter indicates whether the video player controls are
        // displayed. For IFrame embeds that load a Flash player, it also defines
        // when the controls display in the player as well as when the player
        // will load. Supported values are:
        //   - controls=0 – Player controls do not display in the player. For
        //                  IFrame embeds, the Flash player loads immediately.
        //   - controls=1 – (default) Player controls display in the player. For
        //                  IFrame embeds, the controls display immediately and
        //                  the Flash player also loads immediately.
        //   - controls=2 – Player controls display in the player. For IFrame
        //                  embeds, the controls display and the Flash player
        //                  loads after the user initiates the video playback.
        controls: opts.controls ? 2 : 0,

        // Setting the parameter's value to 1 causes the player to not respond to
        // keyboard controls. The default value is 0, which means that keyboard
        // controls are enabled.
        disablekb: opts.keyboard ? 0 : 1,

        //  Setting the parameter's value to 1 enables the player to be
        //  controlled via IFrame or JavaScript Player API calls. The default
        //  value is 0, which means that the player cannot be controlled using
        //  those APIs.
        enablejsapi: 1,

        // Setting this parameter to 0 prevents the fullscreen button from
        // displaying in the player. The default value is 1, which causes the
        // fullscreen button to display.
        fs: opts.fullscreen ? 1 : 0,

        // Setting the parameter's value to 1 causes video annotations to be
        // shown by default, whereas setting to 3 causes video annotations to not
        // be shown by default. The default value is 1.
        iv_load_policy: opts.annotations ? 1 : 3,

        // This parameter lets you use a YouTube player that does not show a
        // YouTube logo. Set the parameter value to 1 to prevent the YouTube logo
        // from displaying in the control bar. Note that a small YouTube text
        // label will still display in the upper-right corner of a paused video
        // when the user's mouse pointer hovers over the player.
        modestbranding: 1,

        // This parameter provides an extra security measure for the IFrame API
        // and is only supported for IFrame embeds. If you are using the IFrame
        // API, which means you are setting the enablejsapi parameter value to 1,
        // you should always specify your domain as the origin parameter value.
        origin: window.location.origin,

        // This parameter controls whether videos play inline or fullscreen in an
        // HTML5 player on iOS. Valid values are:
        //   - 0: This value causes fullscreen playback. This is currently the
        //        default value, though the default is subject to change.
        //   - 1: This value causes inline playback for UIWebViews created with
        //        the allowsInlineMediaPlayback property set to TRUE.
        playsinline: 1,

        // This parameter indicates whether the player should show related videos
        // when playback of the initial video ends. Supported values are 0 and 1.
        // The default value is 1.
        rel: opts.related ? 1 : 0,

        // Supported values are 0 and 1. Setting the parameter's value to 0
        // causes the player to not display information like the video title and
        // uploader before the video starts playing. If the player is loading a
        // playlist, and you explicitly set the parameter value to 1, then, upon
        // loading, the player will also display thumbnail images for the videos
        // in the playlist. Note that this functionality is only supported for
        // the AS3 player.
        showinfo: opts.info ? 1 : 0,

        // (Not part of documented API) Allow html elements with higher z-index
        // to be shown on top of the YouTube player.
        wmode: 'opaque'
      },
      events: {
        onReady: () => this._onReady(videoId),
        onStateChange: (data) => this._onStateChange(data),
        onPlaybackQualityChange: (data) => this._onPlaybackQualityChange(data),
        onPlaybackRateChange: (data) => this._onPlaybackRateChange(data),
        onError: (data) => this._onError(data)
      }
    })
  }

  /**
   * This event fires when the player has finished loading and is ready to begin
   * receiving API calls.
   */
  _onReady (videoId) {
    if (this.destroyed) return

    this._ready = true

    // If the videoId that was loaded is not the same as `this.videoId`, then
    // `load()` was called twice before `onReady` fired. Just call
    // `load(this.videoId)` to load the right videoId.
    if (videoId !== this.videoId) {
      this.load(this.videoId)
    }

    this._flushQueue()
  }

  /**
   * Called when the player's state changes. We emit friendly events so the user
   * doesn't need to use YouTube's YT.PlayerState.* event constants.
   */
  _onStateChange (data) {
    if (this.destroyed) return

    const state = YOUTUBE_STATES[data.data]

    if (state) {
      // Send a 'timeupdate' anytime the state changes. Note: It's important that 'playing'
      // gets emitted before the first 'timeupdate', and that no 'timeupdate' events are
      // emitted after 'pause', 'ended', or 'buffering'.
      if (['paused'].includes(state)) this._onTimeupdate()
      this.emit(state)
      if (state === 'playing') this._onTimeupdate()
    } else {
      throw new Error('Unrecognized state change: ' + data)
    }
  }

  /**
   * This event fires whenever the video playback quality changes. Possible
   * values are: 'small', 'medium', 'large', 'hd720', 'hd1080', 'highres'.
   */
  _onPlaybackQualityChange (data) {
    if (this.destroyed) return
    this.emit('playbackQualityChange', data.data)
  }

  /**
   * This event fires whenever the video playback rate changes.
   */
  _onPlaybackRateChange (data) {
    if (this.destroyed) return
    this.emit('playbackRateChange', data.data)
  }

  /**
   * This event fires if an error occurs in the player.
   */
  _onError (data) {
    if (this.destroyed) return

    const code = data.data

    // The HTML5_ERROR error occurs when the YouTube player needs to switch from
    // HTML5 to Flash to show an ad. Ignore it.
    if (code === YOUTUBE_ERROR.HTML5_ERROR) return

    // The remaining error types occur when the YouTube player cannot play the
    // given video. This is not a fatal error. Report it as unplayable so the user
    // has an opportunity to play another video.
    if (code === YOUTUBE_ERROR.UNPLAYABLE_1 ||
        code === YOUTUBE_ERROR.UNPLAYABLE_2 ||
        code === YOUTUBE_ERROR.NOT_FOUND ||
        code === YOUTUBE_ERROR.INVALID_PARAM) {
      return this.emit('unplayable', this.videoId)
    }

    // Unexpected error, does not match any known type
    this._destroy(new Error('YouTube Player Error. Unknown error code: ' + code))
  }

  /**
   * This event fires when the time indicated by the `getCurrentTime()` method
   * has been updated.
   */
  _onTimeupdate () {
    this.emit('timeupdate', this.getCurrentTime())
  }

  _startInterval () {
    this._interval = setInterval(() => this._onTimeupdate(), this._opts.timeupdateFrequency)
  }

  _stopInterval () {
    clearInterval(this._interval)
    this._interval = null
  }
}

module.exports = YouTubePlayer

},{"events":"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/node_modules/events/events.js","load-script2":"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/node_modules/load-script2/index.js"}],"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/src/js/config/index.js":[function(require,module,exports){
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

},{}],"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/src/js/helpers/classNames.js":[function(require,module,exports){
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

},{}],"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/src/js/main.js":[function(require,module,exports){
'use stirct';

var Header = require('./modules/header');
var Menu = require('./modules/menu');
var Overlay = require('./modules/overlay');
var CountrySelector = require('./modules/country-selector');
var Slider = require('./modules/slider');
var YTPlayer = require('./modules/youtubeplayer');
var Video = require('./modules/video');
var Toggle = require('./modules/toggle');
var EmbedWrap = require('./modules/embed-wrap');


var init = function() {

	Overlay();

	var headerEl = document.querySelector('.js-header');
	if(headerEl) {
		Header(headerEl);
	}

	var menuEl = document.querySelector('.js-menu');
	if(menuEl) {
		Menu(menuEl);
	}

	var countryEl = document.querySelector('.js-nav-country');
	if(countryEl) {
		CountrySelector(countryEl);
	}

	var sliderEl = document.querySelectorAll('.js-slider');
	if(sliderEl.length > 0) {
		for (var s = 0; s < sliderEl.length; s++) {
			Slider(sliderEl[s]);
		}
	}

	var youtubeEl = document.querySelectorAll('.js-youtubeplayer');
	if(youtubeEl.length > 0) {
		for (var yt = 0; yt < youtubeEl.length; yt++) {
			YTPlayer(youtubeEl[yt]);
		}
	}

	var videoEl = document.querySelectorAll('.js-video');
	if(videoEl.length > 0) {
		for (var v = 0; v < videoEl.length; v++) {
			Video(videoEl[v]);
		}
	}

	var toggleEl = document.querySelectorAll('.js-toggle');
	if(toggleEl.length > 0) {
		for (var at = 0; at < toggleEl.length; at++) {
			Toggle(toggleEl[at]);
		}
	}

	var rteContent = document.querySelector('.js-rte-content');
	if(rteContent) {
		var embedEl = rteContent.querySelectorAll('iframe, embed');

		for (var ew = 0; ew < embedEl.length; ew++) {
			EmbedWrap(embedEl[ew]);
		}
	}

	document.removeEventListener('DOMContentLoaded', init, false);
};


document.addEventListener('DOMContentLoaded', init, {once: true});

},{"./modules/country-selector":"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/src/js/modules/country-selector.js","./modules/embed-wrap":"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/src/js/modules/embed-wrap.js","./modules/header":"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/src/js/modules/header.js","./modules/menu":"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/src/js/modules/menu.js","./modules/overlay":"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/src/js/modules/overlay.js","./modules/slider":"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/src/js/modules/slider.js","./modules/toggle":"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/src/js/modules/toggle.js","./modules/video":"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/src/js/modules/video.js","./modules/youtubeplayer":"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/src/js/modules/youtubeplayer.js"}],"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/src/js/modules/country-selector.js":[function(require,module,exports){
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

},{"../config":"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/src/js/config/index.js","../services/events.service":"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/src/js/services/events.service.js"}],"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/src/js/modules/embed-wrap.js":[function(require,module,exports){
'use stirct';

module.exports = function(target) {
	var wrapper = document.createElement('div');
	wrapper.classList.add('embed-responsive');

	target.parentNode.insertBefore(wrapper, target);
	wrapper.appendChild(target);
};

},{}],"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/src/js/modules/header.js":[function(require,module,exports){
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

},{"../config":"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/src/js/config/index.js","headroom.js":"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/node_modules/headroom.js/dist/headroom.js"}],"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/src/js/modules/menu.js":[function(require,module,exports){
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

},{"../config":"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/src/js/config/index.js","../services/events.service":"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/src/js/services/events.service.js"}],"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/src/js/modules/overlay.js":[function(require,module,exports){
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

},{"../config":"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/src/js/config/index.js","../services/events.service":"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/src/js/services/events.service.js"}],"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/src/js/modules/slider.js":[function(require,module,exports){
'use stirct';

var Swiper = require('swiper');

module.exports = function(target) {

	var SwiperOpts = {
		init: false,
		loop: true,
		preloadImages: true,
		lazy: {
			loadPrevNext: true,
		},
		loadOnTransitionStart : true,
		grabCursor: true,
		pagination: {
			el: '.js-slider-pagination',
			clickable: true
		},
		navigation : {
			nextEl: '.js-slider-button-next',
			prevEl: '.js-slider-button-prev',
		}
	};

	if(target.dataset.paginationLabel === 'true') {

		var slides = target.querySelectorAll('.js-slide');

		SwiperOpts.pagination.renderBullet = function (index, className) {
			return '<span class="' + className + '">' + slides[index].dataset.label + '</span>';
		};

		var sliderControls = target.querySelector('.js-slider-controls');
		sliderControls.classList.add('slider-controls--labels');

	}

	var options = {
		instance: new Swiper(target, SwiperOpts)
	};

	options.instance.init();
};

},{"swiper":"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/node_modules/swiper/dist/js/swiper.js"}],"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/src/js/modules/toggle.js":[function(require,module,exports){
'use stirct';

module.exports = function(target) {
	var parent = target.closest('.item');

	function onClickToggle(){
		parent.classList.toggle('is-open');
	}

	target.addEventListener('click', onClickToggle);
};

},{}],"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/src/js/modules/video.js":[function(require,module,exports){
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

},{"../helpers/classNames":"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/src/js/helpers/classNames.js","in-view":"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/node_modules/in-view/dist/in-view.min.js"}],"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/src/js/modules/youtubeplayer.js":[function(require,module,exports){
'use stirct';

var ClassName = require('../helpers/classNames');
var YTPlayer = require('yt-player');
var inView = require('in-view');

module.exports = function(target) {

	var VideoOpts = {
		fullscreen: false,
		modestBranding: true,
		related: false,
		info: false
	};

	// Elements
	var playButton = target.querySelector('.js-play-button');
	var className = ClassName();

	function initYoutube(){

		target.classList.add('is-loading');
		target.classList.add(className);

		playButton.removeEventListener('click', initYoutube);
		playButton.disabled = true;

		if(!playerEl) {
			var playerEl = document.createElement('div');
			playerEl.classList.add('video-player');
			target.appendChild(playerEl);
		}

		if(!player) {
			var player = new YTPlayer(playerEl, VideoOpts);
			player.load(target.dataset.videoId);
		}


		player.play();


		player.on('playing', function(){
			target.classList.add('is-playing');
			target.classList.remove('is-loading');
		});

		player.on('ended', function(){
			target.classList.remove(target.dataset.videoId);

			target.classList.remove('is-playing');
			playButton.addEventListener('click', initYoutube);
			playButton.disabled = false;
		});

		inView('.' + className).on('exit', function(){
			player.pause();
		});
	}

	playButton.addEventListener('click', initYoutube);
};

},{"../helpers/classNames":"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/src/js/helpers/classNames.js","in-view":"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/node_modules/in-view/dist/in-view.min.js","yt-player":"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/node_modules/yt-player/index.js"}],"/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/src/js/services/events.service.js":[function(require,module,exports){
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

},{}]},{},["/Users/sannedidriksen/Desktop/CURRENT/g4s-website-frontend/src/js/main.js"])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9oZWFkcm9vbS5qcy9kaXN0L2hlYWRyb29tLmpzIiwibm9kZV9tb2R1bGVzL2luLXZpZXcvZGlzdC9pbi12aWV3Lm1pbi5qcyIsIm5vZGVfbW9kdWxlcy9sb2FkLXNjcmlwdDIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvc3dpcGVyL2Rpc3QvanMvc3dpcGVyLmpzIiwibm9kZV9tb2R1bGVzL3l0LXBsYXllci9pbmRleC5qcyIsIi9Vc2Vycy9zYW5uZWRpZHJpa3Nlbi9EZXNrdG9wL0NVUlJFTlQvZzRzLXdlYnNpdGUtZnJvbnRlbmQvc3JjL2pzL2NvbmZpZy9pbmRleC5qcyIsIi9Vc2Vycy9zYW5uZWRpZHJpa3Nlbi9EZXNrdG9wL0NVUlJFTlQvZzRzLXdlYnNpdGUtZnJvbnRlbmQvc3JjL2pzL2hlbHBlcnMvY2xhc3NOYW1lcy5qcyIsIi9Vc2Vycy9zYW5uZWRpZHJpa3Nlbi9EZXNrdG9wL0NVUlJFTlQvZzRzLXdlYnNpdGUtZnJvbnRlbmQvc3JjL2pzL21haW4uanMiLCIvVXNlcnMvc2FubmVkaWRyaWtzZW4vRGVza3RvcC9DVVJSRU5UL2c0cy13ZWJzaXRlLWZyb250ZW5kL3NyYy9qcy9tb2R1bGVzL2NvdW50cnktc2VsZWN0b3IuanMiLCIvVXNlcnMvc2FubmVkaWRyaWtzZW4vRGVza3RvcC9DVVJSRU5UL2c0cy13ZWJzaXRlLWZyb250ZW5kL3NyYy9qcy9tb2R1bGVzL2VtYmVkLXdyYXAuanMiLCIvVXNlcnMvc2FubmVkaWRyaWtzZW4vRGVza3RvcC9DVVJSRU5UL2c0cy13ZWJzaXRlLWZyb250ZW5kL3NyYy9qcy9tb2R1bGVzL2hlYWRlci5qcyIsIi9Vc2Vycy9zYW5uZWRpZHJpa3Nlbi9EZXNrdG9wL0NVUlJFTlQvZzRzLXdlYnNpdGUtZnJvbnRlbmQvc3JjL2pzL21vZHVsZXMvbWVudS5qcyIsIi9Vc2Vycy9zYW5uZWRpZHJpa3Nlbi9EZXNrdG9wL0NVUlJFTlQvZzRzLXdlYnNpdGUtZnJvbnRlbmQvc3JjL2pzL21vZHVsZXMvb3ZlcmxheS5qcyIsIi9Vc2Vycy9zYW5uZWRpZHJpa3Nlbi9EZXNrdG9wL0NVUlJFTlQvZzRzLXdlYnNpdGUtZnJvbnRlbmQvc3JjL2pzL21vZHVsZXMvc2xpZGVyLmpzIiwiL1VzZXJzL3Nhbm5lZGlkcmlrc2VuL0Rlc2t0b3AvQ1VSUkVOVC9nNHMtd2Vic2l0ZS1mcm9udGVuZC9zcmMvanMvbW9kdWxlcy90b2dnbGUuanMiLCIvVXNlcnMvc2FubmVkaWRyaWtzZW4vRGVza3RvcC9DVVJSRU5UL2c0cy13ZWJzaXRlLWZyb250ZW5kL3NyYy9qcy9tb2R1bGVzL3ZpZGVvLmpzIiwiL1VzZXJzL3Nhbm5lZGlkcmlrc2VuL0Rlc2t0b3AvQ1VSUkVOVC9nNHMtd2Vic2l0ZS1mcm9udGVuZC9zcmMvanMvbW9kdWxlcy95b3V0dWJlcGxheWVyLmpzIiwiL1VzZXJzL3Nhbm5lZGlkcmlrc2VuL0Rlc2t0b3AvQ1VSUkVOVC9nNHMtd2Vic2l0ZS1mcm9udGVuZC9zcmMvanMvc2VydmljZXMvZXZlbnRzLnNlcnZpY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbGRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xtT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xlQSxPQUFPLFVBQVU7Q0FDaEIsZUFBZTtFQUNkLElBQUksT0FBTyxXQUFXO0VBQ3RCLElBQUksT0FBTyxXQUFXO0VBQ3RCLElBQUksT0FBTyxXQUFXO0VBQ3RCLElBQUksT0FBTyxXQUFXOztDQUV2QixRQUFRO0VBQ1AsVUFBVTtFQUNWLFVBQVU7OztBQUdaOztBQ1pBOztBQUVBLElBQUksY0FBYzs7QUFFbEIsT0FBTyxVQUFVLFNBQVMsUUFBUTtDQUNqQyxJQUFJO0NBQ0osSUFBSSxNQUFNO0NBQ1YsSUFBSSxNQUFNLFVBQVU7O0NBRXBCLEtBQUssSUFBSSxZQUFZLEdBQUcsYUFBYSxLQUFLLGFBQWE7RUFDdEQsT0FBTyxZQUFZLFVBQVUsS0FBSyxLQUFLLE1BQU0sS0FBSyxXQUFXLFlBQVksU0FBUyxLQUFLOzs7Q0FHeEYsT0FBTzs7QUFFUjs7QUNmQTs7QUFFQSxJQUFJLFNBQVMsUUFBUTtBQUNyQixJQUFJLE9BQU8sUUFBUTtBQUNuQixJQUFJLFVBQVUsUUFBUTtBQUN0QixJQUFJLGtCQUFrQixRQUFRO0FBQzlCLElBQUksU0FBUyxRQUFRO0FBQ3JCLElBQUksV0FBVyxRQUFRO0FBQ3ZCLElBQUksUUFBUSxRQUFRO0FBQ3BCLElBQUksU0FBUyxRQUFRO0FBQ3JCLElBQUksWUFBWSxRQUFROzs7QUFHeEIsSUFBSSxPQUFPLFdBQVc7O0NBRXJCOztDQUVBLElBQUksV0FBVyxTQUFTLGNBQWM7Q0FDdEMsR0FBRyxVQUFVO0VBQ1osT0FBTzs7O0NBR1IsSUFBSSxTQUFTLFNBQVMsY0FBYztDQUNwQyxHQUFHLFFBQVE7RUFDVixLQUFLOzs7Q0FHTixJQUFJLFlBQVksU0FBUyxjQUFjO0NBQ3ZDLEdBQUcsV0FBVztFQUNiLGdCQUFnQjs7O0NBR2pCLElBQUksV0FBVyxTQUFTLGlCQUFpQjtDQUN6QyxHQUFHLFNBQVMsU0FBUyxHQUFHO0VBQ3ZCLEtBQUssSUFBSSxJQUFJLEdBQUcsSUFBSSxTQUFTLFFBQVEsS0FBSztHQUN6QyxPQUFPLFNBQVM7Ozs7Q0FJbEIsSUFBSSxZQUFZLFNBQVMsaUJBQWlCO0NBQzFDLEdBQUcsVUFBVSxTQUFTLEdBQUc7RUFDeEIsS0FBSyxJQUFJLEtBQUssR0FBRyxLQUFLLFVBQVUsUUFBUSxNQUFNO0dBQzdDLFNBQVMsVUFBVTs7OztDQUlyQixJQUFJLFVBQVUsU0FBUyxpQkFBaUI7Q0FDeEMsR0FBRyxRQUFRLFNBQVMsR0FBRztFQUN0QixLQUFLLElBQUksSUFBSSxHQUFHLElBQUksUUFBUSxRQUFRLEtBQUs7R0FDeEMsTUFBTSxRQUFROzs7O0NBSWhCLElBQUksV0FBVyxTQUFTLGlCQUFpQjtDQUN6QyxHQUFHLFNBQVMsU0FBUyxHQUFHO0VBQ3ZCLEtBQUssSUFBSSxLQUFLLEdBQUcsS0FBSyxTQUFTLFFBQVEsTUFBTTtHQUM1QyxPQUFPLFNBQVM7Ozs7Q0FJbEIsSUFBSSxhQUFhLFNBQVMsY0FBYztDQUN4QyxHQUFHLFlBQVk7RUFDZCxJQUFJLFVBQVUsV0FBVyxpQkFBaUI7O0VBRTFDLEtBQUssSUFBSSxLQUFLLEdBQUcsS0FBSyxRQUFRLFFBQVEsTUFBTTtHQUMzQyxVQUFVLFFBQVE7Ozs7Q0FJcEIsU0FBUyxvQkFBb0Isb0JBQW9CLE1BQU07Ozs7QUFJeEQsU0FBUyxpQkFBaUIsb0JBQW9CLE1BQU0sQ0FBQyxNQUFNO0FBQzNEOztBQzFFQTs7O0FBR0EsSUFBSSxlQUFlLFFBQVEsYUFBYTtBQUN4QyxJQUFJLFNBQVMsUUFBUSxhQUFhOztBQUVsQyxJQUFJLEtBQUssYUFBYTtBQUN0QixJQUFJLGdCQUFnQixRQUFROzs7QUFHNUIsT0FBTyxVQUFVLFNBQVMsUUFBUTtDQUNqQyxJQUFJLFVBQVUsTUFBTSxVQUFVLE1BQU0sTUFBTSxTQUFTLHVCQUF1QjtDQUMxRSxJQUFJLE9BQU8sTUFBTSxVQUFVLE1BQU0sTUFBTSxPQUFPLHVCQUF1Qjs7Q0FFckUsSUFBSSxXQUFXO0NBQ2YsSUFBSSxpQkFBaUI7Q0FDckIsSUFBSTs7O0NBR0osU0FBUyxjQUFjO0VBQ3RCLEdBQUcsQ0FBQyxlQUFlOztHQUVsQixRQUFRLFFBQVEsU0FBUyxJQUFJO0lBQzVCLElBQUksaUJBQWlCLFNBQVM7OztHQUcvQixLQUFLLFFBQVEsU0FBUyxJQUFJO0lBQ3pCLElBQUksaUJBQWlCLFNBQVM7OztHQUcvQixjQUFjLFlBQVksT0FBTyxVQUFVO0dBQzNDLGlCQUFpQjs7OztDQUluQixTQUFTLFlBQVk7RUFDcEIsR0FBRyxTQUFTO0dBQ1g7T0FDSTtHQUNKOztFQUVELE9BQU87OztDQUdSLFNBQVMsVUFBVTtFQUNsQixTQUFTLEtBQUssVUFBVSxJQUFJO0VBQzVCLE9BQU8sVUFBVSxJQUFJO0VBQ3JCLFdBQVc7RUFDWCxjQUFjLEtBQUssT0FBTyxVQUFVOzs7Q0FHckMsU0FBUyxXQUFXO0VBQ25CLFNBQVMsS0FBSyxVQUFVLE9BQU87RUFDL0IsT0FBTyxVQUFVLE9BQU87RUFDeEIsV0FBVztFQUNYLGNBQWMsS0FBSyxPQUFPLFVBQVU7OztDQUdyQyxTQUFTLGtCQUFrQixTQUFTO0VBQ25DLEdBQUcsWUFBWSxTQUFTO0dBQ3ZCOzs7OztDQUtGLFNBQVMsWUFBWSxNQUFNO0VBQzFCLElBQUksTUFBTSxNQUFNO0VBQ2hCLElBQUksTUFBTSxJQUFJOztFQUVkLEdBQUcsQ0FBQyxJQUFJLFVBQVUsU0FBUyxVQUFVOztHQUVwQyxHQUFHLFVBQVU7SUFDWixVQUFVLFVBQVUsT0FBTzs7R0FFNUIsSUFBSSxVQUFVLElBQUk7R0FDbEIsWUFBWTs7UUFFUCxHQUFHLElBQUksVUFBVSxTQUFTLGFBQWEsVUFBVSxjQUFjLENBQUMsR0FBRyxRQUFRO0dBQ2hGLFVBQVUsVUFBVSxPQUFPO0dBQzNCLFlBQVk7O0VBRWIsT0FBTzs7OztDQUlSLFNBQVMsZUFBZTtFQUN2QixJQUFJLFdBQVcsS0FBSyxHQUFHO0VBQ3ZCLFNBQVMsVUFBVSxJQUFJO0VBQ3ZCLFlBQVk7OztDQUdiLFNBQVMsaUJBQWlCO0VBQ3pCLEdBQUcsVUFBVTtHQUNaLFVBQVUsVUFBVSxPQUFPOztFQUU1QixZQUFZOzs7Q0FHYixHQUFHLFVBQVUsWUFBWTtFQUN4QixHQUFHLEdBQUcsU0FBUztHQUNkOzs7RUFHRCxHQUFHLFlBQVksU0FBUyxHQUFHO0dBQzFCLEdBQUcsRUFBRSxTQUFTO0lBQ2I7UUFDSTtJQUNKOzs7OztDQUtIOzs7QUFHRDs7QUNuSEE7O0FBRUEsT0FBTyxVQUFVLFNBQVMsUUFBUTtDQUNqQyxJQUFJLFVBQVUsU0FBUyxjQUFjO0NBQ3JDLFFBQVEsVUFBVSxJQUFJOztDQUV0QixPQUFPLFdBQVcsYUFBYSxTQUFTO0NBQ3hDLFFBQVEsWUFBWTs7QUFFckI7O0FDVEE7OztBQUdBLElBQUksV0FBVyxRQUFRO0FBQ3ZCLElBQUksZUFBZSxRQUFRLGFBQWE7O0FBRXhDLElBQUksS0FBSyxhQUFhOztBQUV0QixPQUFPLFVBQVUsU0FBUyxRQUFROztDQUVqQyxJQUFJLFlBQVk7Q0FDaEIsSUFBSSxVQUFVO0VBQ2IsVUFBVSxJQUFJLFNBQVMsUUFBUTs7O0NBR2hDLEdBQUcsVUFBVSxZQUFZO0VBQ3hCLEdBQUcsR0FBRyxTQUFTO0dBQ2QsUUFBUSxTQUFTOzs7RUFHbEIsR0FBRyxZQUFZLFNBQVMsR0FBRztHQUMxQixHQUFHLENBQUMsUUFBUSxVQUFVO0lBQ3JCLFFBQVEsV0FBVyxJQUFJLFNBQVMsUUFBUTs7O0dBR3pDLEdBQUcsRUFBRSxTQUFTO0lBQ2IsUUFBUSxTQUFTO1VBQ1g7SUFDTixRQUFRLFNBQVM7SUFDakIsUUFBUSxXQUFXOzs7OztBQUt2Qjs7QUNsQ0E7OztBQUdBLElBQUksZUFBZSxRQUFRLGFBQWE7QUFDeEMsSUFBSSxTQUFTLFFBQVEsYUFBYTtBQUNsQyxJQUFJLEtBQUssYUFBYTtBQUN0QixJQUFJLGdCQUFnQixRQUFROztBQUU1QixPQUFPLFVBQVUsU0FBUyxRQUFROztDQUVqQyxJQUFJLFVBQVUsT0FBTyxjQUFjOztDQUVuQyxJQUFJLFdBQVc7Q0FDZixJQUFJLGlCQUFpQjs7Q0FFckIsR0FBRyxVQUFVLFlBQVk7RUFDeEIsR0FBRyxDQUFDLEdBQUcsU0FBUztHQUNmOzs7RUFHRCxHQUFHLFlBQVksU0FBUyxHQUFHO0dBQzFCLEdBQUcsRUFBRSxTQUFTO0lBQ2I7VUFDTTtJQUNOOzs7Ozs7Q0FNSCxTQUFTLGNBQWM7RUFDdEIsR0FBRyxDQUFDLGVBQWU7R0FDbEIsUUFBUSxpQkFBaUIsU0FBUzs7R0FFbEMsY0FBYyxZQUFZLE9BQU8sVUFBVTtHQUMzQyxpQkFBaUI7Ozs7Q0FJbkIsU0FBUyxpQkFBaUI7RUFDekIsUUFBUSxvQkFBb0IsU0FBUzs7RUFFckMsY0FBYyxlQUFlLE9BQU8sVUFBVTtFQUM5QyxpQkFBaUI7OztDQUdsQixTQUFTLFlBQVk7RUFDcEIsR0FBRyxTQUFTO0dBQ1g7O09BRUk7R0FDSjs7RUFFRCxPQUFPOzs7Q0FHUixTQUFTLFdBQVc7RUFDbkIsU0FBUyxLQUFLLFVBQVUsT0FBTztFQUMvQixXQUFXO0VBQ1gsY0FBYyxLQUFLLE9BQU8sVUFBVTs7O0NBR3JDLFNBQVMsVUFBVTtFQUNsQixTQUFTLEtBQUssVUFBVSxJQUFJO0VBQzVCLFdBQVc7RUFDWCxjQUFjLEtBQUssT0FBTyxVQUFVOzs7O0NBSXJDLFNBQVMsa0JBQWtCLFNBQVM7RUFDbkMsR0FBRyxZQUFZLFNBQVM7R0FDdkI7Ozs7QUFJSDs7QUMzRUE7O0FBRUEsSUFBSSxnQkFBZ0IsUUFBUTtBQUM1QixJQUFJLFNBQVMsUUFBUSxhQUFhOztBQUVsQyxPQUFPLFVBQVUsV0FBVztDQUMzQixJQUFJLFNBQVM7O0NBRWIsY0FBYyxZQUFZLE9BQU8sVUFBVTtDQUMzQyxjQUFjLFlBQVksT0FBTyxVQUFVOzs7Q0FHM0MsU0FBUyxhQUFhLEVBQUU7RUFDdkIsT0FBTyxPQUFPLFlBQVk7RUFDMUI7OztDQUdELFNBQVMsYUFBYSxFQUFFO0VBQ3ZCLE9BQU8sT0FBTyxZQUFZO0VBQzFCOzs7Q0FHRCxTQUFTLGNBQWM7RUFDdEIsSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLEtBQUssU0FBUyxJQUFJLEVBQUUsT0FBTyxPQUFPLFNBQVM7OztFQUcxRSxHQUFHLEtBQUs7R0FDUDs7TUFFRztHQUNIOzs7OztDQUtGLFNBQVMsYUFBYTtFQUNyQixTQUFTLEtBQUssVUFBVSxJQUFJOzs7Q0FHN0IsU0FBUyxhQUFhO0VBQ3JCLFNBQVMsS0FBSyxVQUFVLE9BQU87OztBQUdqQzs7QUMzQ0E7O0FBRUEsSUFBSSxTQUFTLFFBQVE7O0FBRXJCLE9BQU8sVUFBVSxTQUFTLFFBQVE7O0NBRWpDLElBQUksYUFBYTtFQUNoQixNQUFNO0VBQ04sTUFBTTtFQUNOLGVBQWU7RUFDZixNQUFNO0dBQ0wsY0FBYzs7RUFFZix3QkFBd0I7RUFDeEIsWUFBWTtFQUNaLFlBQVk7R0FDWCxJQUFJO0dBQ0osV0FBVzs7RUFFWixhQUFhO0dBQ1osUUFBUTtHQUNSLFFBQVE7Ozs7Q0FJVixHQUFHLE9BQU8sUUFBUSxvQkFBb0IsUUFBUTs7RUFFN0MsSUFBSSxTQUFTLE9BQU8saUJBQWlCOztFQUVyQyxXQUFXLFdBQVcsZUFBZSxVQUFVLE9BQU8sV0FBVztHQUNoRSxPQUFPLGtCQUFrQixZQUFZLE9BQU8sT0FBTyxPQUFPLFFBQVEsUUFBUTs7O0VBRzNFLElBQUksaUJBQWlCLE9BQU8sY0FBYztFQUMxQyxlQUFlLFVBQVUsSUFBSTs7OztDQUk5QixJQUFJLFVBQVU7RUFDYixVQUFVLElBQUksT0FBTyxRQUFROzs7Q0FHOUIsUUFBUSxTQUFTOztBQUVsQjs7QUM1Q0E7O0FBRUEsT0FBTyxVQUFVLFNBQVMsUUFBUTtDQUNqQyxJQUFJLFNBQVMsT0FBTyxRQUFROztDQUU1QixTQUFTLGVBQWU7RUFDdkIsT0FBTyxVQUFVLE9BQU87OztDQUd6QixPQUFPLGlCQUFpQixTQUFTOztBQUVsQzs7QUNYQTs7QUFFQSxJQUFJLFlBQVksUUFBUTtBQUN4QixJQUFJLFNBQVMsUUFBUTs7QUFFckIsT0FBTyxVQUFVLFNBQVMsUUFBUTs7Q0FFakMsSUFBSTtDQUNKLElBQUksWUFBWTs7Q0FFaEIsT0FBTyxVQUFVLElBQUk7O0NBRXJCLFNBQVMsYUFBYTtFQUNyQixPQUFPLG9CQUFvQixXQUFXO0VBQ3RDLE9BQU87RUFDUCxPQUFPLFVBQVUsSUFBSTtFQUNyQixPQUFPLFVBQVUsT0FBTzs7O0NBR3pCLFNBQVMsZUFBZTtFQUN2QixHQUFHLENBQUMsUUFBUTtHQUNYLE9BQU8sVUFBVSxJQUFJO0dBQ3JCLFNBQVMsU0FBUyxjQUFjOztHQUVoQyxPQUFPLFVBQVUsSUFBSTtHQUNyQixPQUFPLGFBQWEsZUFBZTtHQUNuQyxPQUFPLGFBQWEsU0FBUztHQUM3QixPQUFPLGFBQWEsWUFBWTtHQUNoQyxPQUFPLGFBQWEsUUFBUTtHQUM1QixPQUFPLGFBQWEsT0FBTyxPQUFPLFFBQVE7R0FDMUMsT0FBTyxZQUFZOztHQUVuQixPQUFPLGlCQUFpQixXQUFXO1NBQzdCO0dBQ047Ozs7Ozs7Q0FPRixTQUFTLGNBQWM7RUFDdEIsR0FBRyxRQUFRO0dBQ1YsT0FBTzs7OztDQUlULE9BQU8sTUFBTSxXQUFXLEdBQUcsU0FBUyxhQUFhLEdBQUcsUUFBUTs7O0FBRzdEOztBQ2xEQTs7QUFFQSxJQUFJLFlBQVksUUFBUTtBQUN4QixJQUFJLFdBQVcsUUFBUTtBQUN2QixJQUFJLFNBQVMsUUFBUTs7QUFFckIsT0FBTyxVQUFVLFNBQVMsUUFBUTs7Q0FFakMsSUFBSSxZQUFZO0VBQ2YsWUFBWTtFQUNaLGdCQUFnQjtFQUNoQixTQUFTO0VBQ1QsTUFBTTs7OztDQUlQLElBQUksYUFBYSxPQUFPLGNBQWM7Q0FDdEMsSUFBSSxZQUFZOztDQUVoQixTQUFTLGFBQWE7O0VBRXJCLE9BQU8sVUFBVSxJQUFJO0VBQ3JCLE9BQU8sVUFBVSxJQUFJOztFQUVyQixXQUFXLG9CQUFvQixTQUFTO0VBQ3hDLFdBQVcsV0FBVzs7RUFFdEIsR0FBRyxDQUFDLFVBQVU7R0FDYixJQUFJLFdBQVcsU0FBUyxjQUFjO0dBQ3RDLFNBQVMsVUFBVSxJQUFJO0dBQ3ZCLE9BQU8sWUFBWTs7O0VBR3BCLEdBQUcsQ0FBQyxRQUFRO0dBQ1gsSUFBSSxTQUFTLElBQUksU0FBUyxVQUFVO0dBQ3BDLE9BQU8sS0FBSyxPQUFPLFFBQVE7Ozs7RUFJNUIsT0FBTzs7O0VBR1AsT0FBTyxHQUFHLFdBQVcsVUFBVTtHQUM5QixPQUFPLFVBQVUsSUFBSTtHQUNyQixPQUFPLFVBQVUsT0FBTzs7O0VBR3pCLE9BQU8sR0FBRyxTQUFTLFVBQVU7R0FDNUIsT0FBTyxVQUFVLE9BQU8sT0FBTyxRQUFROztHQUV2QyxPQUFPLFVBQVUsT0FBTztHQUN4QixXQUFXLGlCQUFpQixTQUFTO0dBQ3JDLFdBQVcsV0FBVzs7O0VBR3ZCLE9BQU8sTUFBTSxXQUFXLEdBQUcsUUFBUSxVQUFVO0dBQzVDLE9BQU87Ozs7Q0FJVCxXQUFXLGlCQUFpQixTQUFTOztBQUV0Qzs7QUM5REE7Ozs7QUFJQSxJQUFJLFlBQVk7OztBQUdoQixPQUFPLFVBQVU7Q0FDaEIsYUFBYTtDQUNiLGdCQUFnQjtDQUNoQixNQUFNOzs7QUFHUCxTQUFTLGVBQWUsS0FBSyxVQUFVO0NBQ3RDLEdBQUcsVUFBVSxRQUFRLFVBQVUsS0FBSyxXQUFXLEdBQUc7RUFDakQsSUFBSSxRQUFRLFVBQVUsS0FBSyxVQUFVLFVBQVUsTUFBTTtHQUNwRCxPQUFPLFNBQVM7OztFQUdqQixVQUFVLEtBQUssT0FBTyxPQUFPOzs7O0FBSS9CLFNBQVMsWUFBWSxLQUFLLFNBQVM7Q0FDbEMsR0FBRyxVQUFVLE1BQU07RUFDbEIsVUFBVSxLQUFLLEtBQUs7UUFDZDtFQUNOLFVBQVUsT0FBTyxDQUFDOzs7O0FBSXBCLFNBQVMsS0FBSyxLQUFLLFdBQVc7Q0FDN0IsR0FBRyxVQUFVLFFBQVEsVUFBVSxLQUFLLFdBQVcsRUFBRTtFQUNoRCxVQUFVLEtBQUssUUFBUSxTQUFTLFNBQVM7R0FDeEMsU0FBUzs7Ozs7QUFLWiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCFpc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzT2JqZWN0KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKSB7XG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQXQgbGVhc3QgZ2l2ZSBzb21lIGtpbmQgb2YgY29udGV4dCB0byB0aGUgdXNlclxuICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LiAoJyArIGVyICsgJyknKTtcbiAgICAgICAgZXJyLmNvbnRleHQgPSBlcjtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAoaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2UgaWYgKGxpc3RlbmVycykge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgaWYgKHRoaXMuX2V2ZW50cykge1xuICAgIHZhciBldmxpc3RlbmVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gICAgaWYgKGlzRnVuY3Rpb24oZXZsaXN0ZW5lcikpXG4gICAgICByZXR1cm4gMTtcbiAgICBlbHNlIGlmIChldmxpc3RlbmVyKVxuICAgICAgcmV0dXJuIGV2bGlzdGVuZXIubGVuZ3RoO1xuICB9XG4gIHJldHVybiAwO1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHJldHVybiBlbWl0dGVyLmxpc3RlbmVyQ291bnQodHlwZSk7XG59O1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG4iLCIvKiFcbiAqIGhlYWRyb29tLmpzIHYwLjkuNCAtIEdpdmUgeW91ciBwYWdlIHNvbWUgaGVhZHJvb20uIEhpZGUgeW91ciBoZWFkZXIgdW50aWwgeW91IG5lZWQgaXRcbiAqIENvcHlyaWdodCAoYykgMjAxNyBOaWNrIFdpbGxpYW1zIC0gaHR0cDovL3dpY2t5Lm5pbGxpYS5tcy9oZWFkcm9vbS5qc1xuICogTGljZW5zZTogTUlUXG4gKi9cblxuKGZ1bmN0aW9uKHJvb3QsIGZhY3RvcnkpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgZGVmaW5lKFtdLCBmYWN0b3J5KTtcbiAgfVxuICBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAvLyBDT01NT05KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICB9XG4gIGVsc2Uge1xuICAgIC8vIEJST1dTRVJcbiAgICByb290LkhlYWRyb29tID0gZmFjdG9yeSgpO1xuICB9XG59KHRoaXMsIGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLyogZXhwb3J0ZWQgZmVhdHVyZXMgKi9cbiAgXG4gIHZhciBmZWF0dXJlcyA9IHtcbiAgICBiaW5kIDogISEoZnVuY3Rpb24oKXt9LmJpbmQpLFxuICAgIGNsYXNzTGlzdCA6ICdjbGFzc0xpc3QnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCxcbiAgICByQUYgOiAhISh3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSlcbiAgfTtcbiAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuICBcbiAgLyoqXG4gICAqIEhhbmRsZXMgZGVib3VuY2luZyBvZiBldmVudHMgdmlhIHJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgKiBAc2VlIGh0dHA6Ly93d3cuaHRtbDVyb2Nrcy5jb20vZW4vdHV0b3JpYWxzL3NwZWVkL2FuaW1hdGlvbnMvXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBjYWxsYmFjayB0byBoYW5kbGUgd2hpY2hldmVyIGV2ZW50XG4gICAqL1xuICBmdW5jdGlvbiBEZWJvdW5jZXIgKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIHRoaXMudGlja2luZyA9IGZhbHNlO1xuICB9XG4gIERlYm91bmNlci5wcm90b3R5cGUgPSB7XG4gICAgY29uc3RydWN0b3IgOiBEZWJvdW5jZXIsXG4gIFxuICAgIC8qKlxuICAgICAqIGRpc3BhdGNoZXMgdGhlIGV2ZW50IHRvIHRoZSBzdXBwbGllZCBjYWxsYmFja1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdXBkYXRlIDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmNhbGxiYWNrICYmIHRoaXMuY2FsbGJhY2soKTtcbiAgICAgIHRoaXMudGlja2luZyA9IGZhbHNlO1xuICAgIH0sXG4gIFxuICAgIC8qKlxuICAgICAqIGVuc3VyZXMgZXZlbnRzIGRvbid0IGdldCBzdGFja2VkXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICByZXF1ZXN0VGljayA6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYoIXRoaXMudGlja2luZykge1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5yYWZDYWxsYmFjayB8fCAodGhpcy5yYWZDYWxsYmFjayA9IHRoaXMudXBkYXRlLmJpbmQodGhpcykpKTtcbiAgICAgICAgdGhpcy50aWNraW5nID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9LFxuICBcbiAgICAvKipcbiAgICAgKiBBdHRhY2ggdGhpcyBhcyB0aGUgZXZlbnQgbGlzdGVuZXJzXG4gICAgICovXG4gICAgaGFuZGxlRXZlbnQgOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMucmVxdWVzdFRpY2soKTtcbiAgICB9XG4gIH07XG4gIC8qKlxuICAgKiBDaGVjayBpZiBvYmplY3QgaXMgcGFydCBvZiB0aGUgRE9NXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0ge09iamVjdH0gb2JqIGVsZW1lbnQgdG8gY2hlY2tcbiAgICovXG4gIGZ1bmN0aW9uIGlzRE9NRWxlbWVudChvYmopIHtcbiAgICByZXR1cm4gb2JqICYmIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIChvYmogPT09IHdpbmRvdyB8fCBvYmoubm9kZVR5cGUpO1xuICB9XG4gIFxuICAvKipcbiAgICogSGVscGVyIGZ1bmN0aW9uIGZvciBleHRlbmRpbmcgb2JqZWN0c1xuICAgKi9cbiAgZnVuY3Rpb24gZXh0ZW5kIChvYmplY3QgLyosIG9iamVjdE4gLi4uICovKSB7XG4gICAgaWYoYXJndW1lbnRzLmxlbmd0aCA8PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgYXJndW1lbnRzIGluIGV4dGVuZCBmdW5jdGlvbicpO1xuICAgIH1cbiAgXG4gICAgdmFyIHJlc3VsdCA9IG9iamVjdCB8fCB7fSxcbiAgICAgICAga2V5LFxuICAgICAgICBpO1xuICBcbiAgICBmb3IgKGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgcmVwbGFjZW1lbnQgPSBhcmd1bWVudHNbaV0gfHwge307XG4gIFxuICAgICAgZm9yIChrZXkgaW4gcmVwbGFjZW1lbnQpIHtcbiAgICAgICAgLy8gUmVjdXJzZSBpbnRvIG9iamVjdCBleGNlcHQgaWYgdGhlIG9iamVjdCBpcyBhIERPTSBlbGVtZW50XG4gICAgICAgIGlmKHR5cGVvZiByZXN1bHRba2V5XSA9PT0gJ29iamVjdCcgJiYgISBpc0RPTUVsZW1lbnQocmVzdWx0W2tleV0pKSB7XG4gICAgICAgICAgcmVzdWx0W2tleV0gPSBleHRlbmQocmVzdWx0W2tleV0sIHJlcGxhY2VtZW50W2tleV0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHJlc3VsdFtrZXldID0gcmVzdWx0W2tleV0gfHwgcmVwbGFjZW1lbnRba2V5XTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICBcbiAgLyoqXG4gICAqIEhlbHBlciBmdW5jdGlvbiBmb3Igbm9ybWFsaXppbmcgdG9sZXJhbmNlIG9wdGlvbiB0byBvYmplY3QgZm9ybWF0XG4gICAqL1xuICBmdW5jdGlvbiBub3JtYWxpemVUb2xlcmFuY2UgKHQpIHtcbiAgICByZXR1cm4gdCA9PT0gT2JqZWN0KHQpID8gdCA6IHsgZG93biA6IHQsIHVwIDogdCB9O1xuICB9XG4gIFxuICAvKipcbiAgICogVUkgZW5oYW5jZW1lbnQgZm9yIGZpeGVkIGhlYWRlcnMuXG4gICAqIEhpZGVzIGhlYWRlciB3aGVuIHNjcm9sbGluZyBkb3duXG4gICAqIFNob3dzIGhlYWRlciB3aGVuIHNjcm9sbGluZyB1cFxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHtET01FbGVtZW50fSBlbGVtIHRoZSBoZWFkZXIgZWxlbWVudFxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBvcHRpb25zIGZvciB0aGUgd2lkZ2V0XG4gICAqL1xuICBmdW5jdGlvbiBIZWFkcm9vbSAoZWxlbSwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBleHRlbmQob3B0aW9ucywgSGVhZHJvb20ub3B0aW9ucyk7XG4gIFxuICAgIHRoaXMubGFzdEtub3duU2Nyb2xsWSA9IDA7XG4gICAgdGhpcy5lbGVtICAgICAgICAgICAgID0gZWxlbTtcbiAgICB0aGlzLnRvbGVyYW5jZSAgICAgICAgPSBub3JtYWxpemVUb2xlcmFuY2Uob3B0aW9ucy50b2xlcmFuY2UpO1xuICAgIHRoaXMuY2xhc3NlcyAgICAgICAgICA9IG9wdGlvbnMuY2xhc3NlcztcbiAgICB0aGlzLm9mZnNldCAgICAgICAgICAgPSBvcHRpb25zLm9mZnNldDtcbiAgICB0aGlzLnNjcm9sbGVyICAgICAgICAgPSBvcHRpb25zLnNjcm9sbGVyO1xuICAgIHRoaXMuaW5pdGlhbGlzZWQgICAgICA9IGZhbHNlO1xuICAgIHRoaXMub25QaW4gICAgICAgICAgICA9IG9wdGlvbnMub25QaW47XG4gICAgdGhpcy5vblVucGluICAgICAgICAgID0gb3B0aW9ucy5vblVucGluO1xuICAgIHRoaXMub25Ub3AgICAgICAgICAgICA9IG9wdGlvbnMub25Ub3A7XG4gICAgdGhpcy5vbk5vdFRvcCAgICAgICAgID0gb3B0aW9ucy5vbk5vdFRvcDtcbiAgICB0aGlzLm9uQm90dG9tICAgICAgICAgPSBvcHRpb25zLm9uQm90dG9tO1xuICAgIHRoaXMub25Ob3RCb3R0b20gICAgICA9IG9wdGlvbnMub25Ob3RCb3R0b207XG4gIH1cbiAgSGVhZHJvb20ucHJvdG90eXBlID0ge1xuICAgIGNvbnN0cnVjdG9yIDogSGVhZHJvb20sXG4gIFxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpc2VzIHRoZSB3aWRnZXRcbiAgICAgKi9cbiAgICBpbml0IDogZnVuY3Rpb24oKSB7XG4gICAgICBpZighSGVhZHJvb20uY3V0c1RoZU11c3RhcmQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICBcbiAgICAgIHRoaXMuZGVib3VuY2VyID0gbmV3IERlYm91bmNlcih0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpKTtcbiAgICAgIHRoaXMuZWxlbS5jbGFzc0xpc3QuYWRkKHRoaXMuY2xhc3Nlcy5pbml0aWFsKTtcbiAgXG4gICAgICAvLyBkZWZlciBldmVudCByZWdpc3RyYXRpb24gdG8gaGFuZGxlIGJyb3dzZXJcbiAgICAgIC8vIHBvdGVudGlhbGx5IHJlc3RvcmluZyBwcmV2aW91cyBzY3JvbGwgcG9zaXRpb25cbiAgICAgIHNldFRpbWVvdXQodGhpcy5hdHRhY2hFdmVudC5iaW5kKHRoaXMpLCAxMDApO1xuICBcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gIFxuICAgIC8qKlxuICAgICAqIFVuYXR0YWNoZXMgZXZlbnRzIGFuZCByZW1vdmVzIGFueSBjbGFzc2VzIHRoYXQgd2VyZSBhZGRlZFxuICAgICAqL1xuICAgIGRlc3Ryb3kgOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjbGFzc2VzID0gdGhpcy5jbGFzc2VzO1xuICBcbiAgICAgIHRoaXMuaW5pdGlhbGlzZWQgPSBmYWxzZTtcbiAgXG4gICAgICBmb3IgKHZhciBrZXkgaW4gY2xhc3Nlcykge1xuICAgICAgICBpZihjbGFzc2VzLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICB0aGlzLmVsZW0uY2xhc3NMaXN0LnJlbW92ZShjbGFzc2VzW2tleV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gIFxuICAgICAgdGhpcy5zY3JvbGxlci5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCB0aGlzLmRlYm91bmNlciwgZmFsc2UpO1xuICAgIH0sXG4gIFxuICAgIC8qKlxuICAgICAqIEF0dGFjaGVzIHRoZSBzY3JvbGwgZXZlbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGF0dGFjaEV2ZW50IDogZnVuY3Rpb24oKSB7XG4gICAgICBpZighdGhpcy5pbml0aWFsaXNlZCl7XG4gICAgICAgIHRoaXMubGFzdEtub3duU2Nyb2xsWSA9IHRoaXMuZ2V0U2Nyb2xsWSgpO1xuICAgICAgICB0aGlzLmluaXRpYWxpc2VkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zY3JvbGxlci5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCB0aGlzLmRlYm91bmNlciwgZmFsc2UpO1xuICBcbiAgICAgICAgdGhpcy5kZWJvdW5jZXIuaGFuZGxlRXZlbnQoKTtcbiAgICAgIH1cbiAgICB9LFxuICBcbiAgICAvKipcbiAgICAgKiBVbnBpbnMgdGhlIGhlYWRlciBpZiBpdCdzIGN1cnJlbnRseSBwaW5uZWRcbiAgICAgKi9cbiAgICB1bnBpbiA6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGNsYXNzTGlzdCA9IHRoaXMuZWxlbS5jbGFzc0xpc3QsXG4gICAgICAgIGNsYXNzZXMgPSB0aGlzLmNsYXNzZXM7XG4gIFxuICAgICAgaWYoY2xhc3NMaXN0LmNvbnRhaW5zKGNsYXNzZXMucGlubmVkKSB8fCAhY2xhc3NMaXN0LmNvbnRhaW5zKGNsYXNzZXMudW5waW5uZWQpKSB7XG4gICAgICAgIGNsYXNzTGlzdC5hZGQoY2xhc3Nlcy51bnBpbm5lZCk7XG4gICAgICAgIGNsYXNzTGlzdC5yZW1vdmUoY2xhc3Nlcy5waW5uZWQpO1xuICAgICAgICB0aGlzLm9uVW5waW4gJiYgdGhpcy5vblVucGluLmNhbGwodGhpcyk7XG4gICAgICB9XG4gICAgfSxcbiAgXG4gICAgLyoqXG4gICAgICogUGlucyB0aGUgaGVhZGVyIGlmIGl0J3MgY3VycmVudGx5IHVucGlubmVkXG4gICAgICovXG4gICAgcGluIDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY2xhc3NMaXN0ID0gdGhpcy5lbGVtLmNsYXNzTGlzdCxcbiAgICAgICAgY2xhc3NlcyA9IHRoaXMuY2xhc3NlcztcbiAgXG4gICAgICBpZihjbGFzc0xpc3QuY29udGFpbnMoY2xhc3Nlcy51bnBpbm5lZCkpIHtcbiAgICAgICAgY2xhc3NMaXN0LnJlbW92ZShjbGFzc2VzLnVucGlubmVkKTtcbiAgICAgICAgY2xhc3NMaXN0LmFkZChjbGFzc2VzLnBpbm5lZCk7XG4gICAgICAgIHRoaXMub25QaW4gJiYgdGhpcy5vblBpbi5jYWxsKHRoaXMpO1xuICAgICAgfVxuICAgIH0sXG4gIFxuICAgIC8qKlxuICAgICAqIEhhbmRsZXMgdGhlIHRvcCBzdGF0ZXNcbiAgICAgKi9cbiAgICB0b3AgOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjbGFzc0xpc3QgPSB0aGlzLmVsZW0uY2xhc3NMaXN0LFxuICAgICAgICBjbGFzc2VzID0gdGhpcy5jbGFzc2VzO1xuICBcbiAgICAgIGlmKCFjbGFzc0xpc3QuY29udGFpbnMoY2xhc3Nlcy50b3ApKSB7XG4gICAgICAgIGNsYXNzTGlzdC5hZGQoY2xhc3Nlcy50b3ApO1xuICAgICAgICBjbGFzc0xpc3QucmVtb3ZlKGNsYXNzZXMubm90VG9wKTtcbiAgICAgICAgdGhpcy5vblRvcCAmJiB0aGlzLm9uVG9wLmNhbGwodGhpcyk7XG4gICAgICB9XG4gICAgfSxcbiAgXG4gICAgLyoqXG4gICAgICogSGFuZGxlcyB0aGUgbm90IHRvcCBzdGF0ZVxuICAgICAqL1xuICAgIG5vdFRvcCA6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGNsYXNzTGlzdCA9IHRoaXMuZWxlbS5jbGFzc0xpc3QsXG4gICAgICAgIGNsYXNzZXMgPSB0aGlzLmNsYXNzZXM7XG4gIFxuICAgICAgaWYoIWNsYXNzTGlzdC5jb250YWlucyhjbGFzc2VzLm5vdFRvcCkpIHtcbiAgICAgICAgY2xhc3NMaXN0LmFkZChjbGFzc2VzLm5vdFRvcCk7XG4gICAgICAgIGNsYXNzTGlzdC5yZW1vdmUoY2xhc3Nlcy50b3ApO1xuICAgICAgICB0aGlzLm9uTm90VG9wICYmIHRoaXMub25Ob3RUb3AuY2FsbCh0aGlzKTtcbiAgICAgIH1cbiAgICB9LFxuICBcbiAgICBib3R0b20gOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjbGFzc0xpc3QgPSB0aGlzLmVsZW0uY2xhc3NMaXN0LFxuICAgICAgICBjbGFzc2VzID0gdGhpcy5jbGFzc2VzO1xuICBcbiAgICAgIGlmKCFjbGFzc0xpc3QuY29udGFpbnMoY2xhc3Nlcy5ib3R0b20pKSB7XG4gICAgICAgIGNsYXNzTGlzdC5hZGQoY2xhc3Nlcy5ib3R0b20pO1xuICAgICAgICBjbGFzc0xpc3QucmVtb3ZlKGNsYXNzZXMubm90Qm90dG9tKTtcbiAgICAgICAgdGhpcy5vbkJvdHRvbSAmJiB0aGlzLm9uQm90dG9tLmNhbGwodGhpcyk7XG4gICAgICB9XG4gICAgfSxcbiAgXG4gICAgLyoqXG4gICAgICogSGFuZGxlcyB0aGUgbm90IHRvcCBzdGF0ZVxuICAgICAqL1xuICAgIG5vdEJvdHRvbSA6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGNsYXNzTGlzdCA9IHRoaXMuZWxlbS5jbGFzc0xpc3QsXG4gICAgICAgIGNsYXNzZXMgPSB0aGlzLmNsYXNzZXM7XG4gIFxuICAgICAgaWYoIWNsYXNzTGlzdC5jb250YWlucyhjbGFzc2VzLm5vdEJvdHRvbSkpIHtcbiAgICAgICAgY2xhc3NMaXN0LmFkZChjbGFzc2VzLm5vdEJvdHRvbSk7XG4gICAgICAgIGNsYXNzTGlzdC5yZW1vdmUoY2xhc3Nlcy5ib3R0b20pO1xuICAgICAgICB0aGlzLm9uTm90Qm90dG9tICYmIHRoaXMub25Ob3RCb3R0b20uY2FsbCh0aGlzKTtcbiAgICAgIH1cbiAgICB9LFxuICBcbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBZIHNjcm9sbCBwb3NpdGlvblxuICAgICAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1dpbmRvdy5zY3JvbGxZXG4gICAgICogQHJldHVybiB7TnVtYmVyfSBwaXhlbHMgdGhlIHBhZ2UgaGFzIHNjcm9sbGVkIGFsb25nIHRoZSBZLWF4aXNcbiAgICAgKi9cbiAgICBnZXRTY3JvbGxZIDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKHRoaXMuc2Nyb2xsZXIucGFnZVlPZmZzZXQgIT09IHVuZGVmaW5lZClcbiAgICAgICAgPyB0aGlzLnNjcm9sbGVyLnBhZ2VZT2Zmc2V0XG4gICAgICAgIDogKHRoaXMuc2Nyb2xsZXIuc2Nyb2xsVG9wICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgPyB0aGlzLnNjcm9sbGVyLnNjcm9sbFRvcFxuICAgICAgICAgIDogKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCB8fCBkb2N1bWVudC5ib2R5LnBhcmVudE5vZGUgfHwgZG9jdW1lbnQuYm9keSkuc2Nyb2xsVG9wO1xuICAgIH0sXG4gIFxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGhlaWdodCBvZiB0aGUgdmlld3BvcnRcbiAgICAgKiBAc2VlIGh0dHA6Ly9hbmR5bGFuZ3Rvbi5jby51ay9ibG9nL2RldmVsb3BtZW50L2dldC12aWV3cG9ydC1zaXplLXdpZHRoLWFuZC1oZWlnaHQtamF2YXNjcmlwdFxuICAgICAqIEByZXR1cm4ge2ludH0gdGhlIGhlaWdodCBvZiB0aGUgdmlld3BvcnQgaW4gcGl4ZWxzXG4gICAgICovXG4gICAgZ2V0Vmlld3BvcnRIZWlnaHQgOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gd2luZG93LmlubmVySGVpZ2h0XG4gICAgICAgIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHRcbiAgICAgICAgfHwgZG9jdW1lbnQuYm9keS5jbGllbnRIZWlnaHQ7XG4gICAgfSxcbiAgXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgcGh5c2ljYWwgaGVpZ2h0IG9mIHRoZSBET00gZWxlbWVudFxuICAgICAqIEBwYXJhbSAge09iamVjdH0gIGVsbSB0aGUgZWxlbWVudCB0byBjYWxjdWxhdGUgdGhlIHBoeXNpY2FsIGhlaWdodCBvZiB3aGljaFxuICAgICAqIEByZXR1cm4ge2ludH0gICAgIHRoZSBwaHlzaWNhbCBoZWlnaHQgb2YgdGhlIGVsZW1lbnQgaW4gcGl4ZWxzXG4gICAgICovXG4gICAgZ2V0RWxlbWVudFBoeXNpY2FsSGVpZ2h0IDogZnVuY3Rpb24gKGVsbSkge1xuICAgICAgcmV0dXJuIE1hdGgubWF4KFxuICAgICAgICBlbG0ub2Zmc2V0SGVpZ2h0LFxuICAgICAgICBlbG0uY2xpZW50SGVpZ2h0XG4gICAgICApO1xuICAgIH0sXG4gIFxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIHBoeXNpY2FsIGhlaWdodCBvZiB0aGUgc2Nyb2xsZXIgZWxlbWVudFxuICAgICAqIEByZXR1cm4ge2ludH0gdGhlIHBoeXNpY2FsIGhlaWdodCBvZiB0aGUgc2Nyb2xsZXIgZWxlbWVudCBpbiBwaXhlbHNcbiAgICAgKi9cbiAgICBnZXRTY3JvbGxlclBoeXNpY2FsSGVpZ2h0IDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuICh0aGlzLnNjcm9sbGVyID09PSB3aW5kb3cgfHwgdGhpcy5zY3JvbGxlciA9PT0gZG9jdW1lbnQuYm9keSlcbiAgICAgICAgPyB0aGlzLmdldFZpZXdwb3J0SGVpZ2h0KClcbiAgICAgICAgOiB0aGlzLmdldEVsZW1lbnRQaHlzaWNhbEhlaWdodCh0aGlzLnNjcm9sbGVyKTtcbiAgICB9LFxuICBcbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBoZWlnaHQgb2YgdGhlIGRvY3VtZW50XG4gICAgICogQHNlZSBodHRwOi8vamFtZXMucGFkb2xzZXkuY29tL2phdmFzY3JpcHQvZ2V0LWRvY3VtZW50LWhlaWdodC1jcm9zcy1icm93c2VyL1xuICAgICAqIEByZXR1cm4ge2ludH0gdGhlIGhlaWdodCBvZiB0aGUgZG9jdW1lbnQgaW4gcGl4ZWxzXG4gICAgICovXG4gICAgZ2V0RG9jdW1lbnRIZWlnaHQgOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgYm9keSA9IGRvY3VtZW50LmJvZHksXG4gICAgICAgIGRvY3VtZW50RWxlbWVudCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbiAgXG4gICAgICByZXR1cm4gTWF0aC5tYXgoXG4gICAgICAgIGJvZHkuc2Nyb2xsSGVpZ2h0LCBkb2N1bWVudEVsZW1lbnQuc2Nyb2xsSGVpZ2h0LFxuICAgICAgICBib2R5Lm9mZnNldEhlaWdodCwgZG9jdW1lbnRFbGVtZW50Lm9mZnNldEhlaWdodCxcbiAgICAgICAgYm9keS5jbGllbnRIZWlnaHQsIGRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHRcbiAgICAgICk7XG4gICAgfSxcbiAgXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgaGVpZ2h0IG9mIHRoZSBET00gZWxlbWVudFxuICAgICAqIEBwYXJhbSAge09iamVjdH0gIGVsbSB0aGUgZWxlbWVudCB0byBjYWxjdWxhdGUgdGhlIGhlaWdodCBvZiB3aGljaFxuICAgICAqIEByZXR1cm4ge2ludH0gICAgIHRoZSBoZWlnaHQgb2YgdGhlIGVsZW1lbnQgaW4gcGl4ZWxzXG4gICAgICovXG4gICAgZ2V0RWxlbWVudEhlaWdodCA6IGZ1bmN0aW9uIChlbG0pIHtcbiAgICAgIHJldHVybiBNYXRoLm1heChcbiAgICAgICAgZWxtLnNjcm9sbEhlaWdodCxcbiAgICAgICAgZWxtLm9mZnNldEhlaWdodCxcbiAgICAgICAgZWxtLmNsaWVudEhlaWdodFxuICAgICAgKTtcbiAgICB9LFxuICBcbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBoZWlnaHQgb2YgdGhlIHNjcm9sbGVyIGVsZW1lbnRcbiAgICAgKiBAcmV0dXJuIHtpbnR9IHRoZSBoZWlnaHQgb2YgdGhlIHNjcm9sbGVyIGVsZW1lbnQgaW4gcGl4ZWxzXG4gICAgICovXG4gICAgZ2V0U2Nyb2xsZXJIZWlnaHQgOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gKHRoaXMuc2Nyb2xsZXIgPT09IHdpbmRvdyB8fCB0aGlzLnNjcm9sbGVyID09PSBkb2N1bWVudC5ib2R5KVxuICAgICAgICA/IHRoaXMuZ2V0RG9jdW1lbnRIZWlnaHQoKVxuICAgICAgICA6IHRoaXMuZ2V0RWxlbWVudEhlaWdodCh0aGlzLnNjcm9sbGVyKTtcbiAgICB9LFxuICBcbiAgICAvKipcbiAgICAgKiBkZXRlcm1pbmVzIGlmIHRoZSBzY3JvbGwgcG9zaXRpb24gaXMgb3V0c2lkZSBvZiBkb2N1bWVudCBib3VuZGFyaWVzXG4gICAgICogQHBhcmFtICB7aW50fSAgY3VycmVudFNjcm9sbFkgdGhlIGN1cnJlbnQgeSBzY3JvbGwgcG9zaXRpb25cbiAgICAgKiBAcmV0dXJuIHtib29sfSB0cnVlIGlmIG91dCBvZiBib3VuZHMsIGZhbHNlIG90aGVyd2lzZVxuICAgICAqL1xuICAgIGlzT3V0T2ZCb3VuZHMgOiBmdW5jdGlvbiAoY3VycmVudFNjcm9sbFkpIHtcbiAgICAgIHZhciBwYXN0VG9wICA9IGN1cnJlbnRTY3JvbGxZIDwgMCxcbiAgICAgICAgcGFzdEJvdHRvbSA9IGN1cnJlbnRTY3JvbGxZICsgdGhpcy5nZXRTY3JvbGxlclBoeXNpY2FsSGVpZ2h0KCkgPiB0aGlzLmdldFNjcm9sbGVySGVpZ2h0KCk7XG4gIFxuICAgICAgcmV0dXJuIHBhc3RUb3AgfHwgcGFzdEJvdHRvbTtcbiAgICB9LFxuICBcbiAgICAvKipcbiAgICAgKiBkZXRlcm1pbmVzIGlmIHRoZSB0b2xlcmFuY2UgaGFzIGJlZW4gZXhjZWVkZWRcbiAgICAgKiBAcGFyYW0gIHtpbnR9IGN1cnJlbnRTY3JvbGxZIHRoZSBjdXJyZW50IHNjcm9sbCB5IHBvc2l0aW9uXG4gICAgICogQHJldHVybiB7Ym9vbH0gdHJ1ZSBpZiB0b2xlcmFuY2UgZXhjZWVkZWQsIGZhbHNlIG90aGVyd2lzZVxuICAgICAqL1xuICAgIHRvbGVyYW5jZUV4Y2VlZGVkIDogZnVuY3Rpb24gKGN1cnJlbnRTY3JvbGxZLCBkaXJlY3Rpb24pIHtcbiAgICAgIHJldHVybiBNYXRoLmFicyhjdXJyZW50U2Nyb2xsWS10aGlzLmxhc3RLbm93blNjcm9sbFkpID49IHRoaXMudG9sZXJhbmNlW2RpcmVjdGlvbl07XG4gICAgfSxcbiAgXG4gICAgLyoqXG4gICAgICogZGV0ZXJtaW5lIGlmIGl0IGlzIGFwcHJvcHJpYXRlIHRvIHVucGluXG4gICAgICogQHBhcmFtICB7aW50fSBjdXJyZW50U2Nyb2xsWSB0aGUgY3VycmVudCB5IHNjcm9sbCBwb3NpdGlvblxuICAgICAqIEBwYXJhbSAge2Jvb2x9IHRvbGVyYW5jZUV4Y2VlZGVkIGhhcyB0aGUgdG9sZXJhbmNlIGJlZW4gZXhjZWVkZWQ/XG4gICAgICogQHJldHVybiB7Ym9vbH0gdHJ1ZSBpZiBzaG91bGQgdW5waW4sIGZhbHNlIG90aGVyd2lzZVxuICAgICAqL1xuICAgIHNob3VsZFVucGluIDogZnVuY3Rpb24gKGN1cnJlbnRTY3JvbGxZLCB0b2xlcmFuY2VFeGNlZWRlZCkge1xuICAgICAgdmFyIHNjcm9sbGluZ0Rvd24gPSBjdXJyZW50U2Nyb2xsWSA+IHRoaXMubGFzdEtub3duU2Nyb2xsWSxcbiAgICAgICAgcGFzdE9mZnNldCA9IGN1cnJlbnRTY3JvbGxZID49IHRoaXMub2Zmc2V0O1xuICBcbiAgICAgIHJldHVybiBzY3JvbGxpbmdEb3duICYmIHBhc3RPZmZzZXQgJiYgdG9sZXJhbmNlRXhjZWVkZWQ7XG4gICAgfSxcbiAgXG4gICAgLyoqXG4gICAgICogZGV0ZXJtaW5lIGlmIGl0IGlzIGFwcHJvcHJpYXRlIHRvIHBpblxuICAgICAqIEBwYXJhbSAge2ludH0gY3VycmVudFNjcm9sbFkgdGhlIGN1cnJlbnQgeSBzY3JvbGwgcG9zaXRpb25cbiAgICAgKiBAcGFyYW0gIHtib29sfSB0b2xlcmFuY2VFeGNlZWRlZCBoYXMgdGhlIHRvbGVyYW5jZSBiZWVuIGV4Y2VlZGVkP1xuICAgICAqIEByZXR1cm4ge2Jvb2x9IHRydWUgaWYgc2hvdWxkIHBpbiwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgICovXG4gICAgc2hvdWxkUGluIDogZnVuY3Rpb24gKGN1cnJlbnRTY3JvbGxZLCB0b2xlcmFuY2VFeGNlZWRlZCkge1xuICAgICAgdmFyIHNjcm9sbGluZ1VwICA9IGN1cnJlbnRTY3JvbGxZIDwgdGhpcy5sYXN0S25vd25TY3JvbGxZLFxuICAgICAgICBwYXN0T2Zmc2V0ID0gY3VycmVudFNjcm9sbFkgPD0gdGhpcy5vZmZzZXQ7XG4gIFxuICAgICAgcmV0dXJuIChzY3JvbGxpbmdVcCAmJiB0b2xlcmFuY2VFeGNlZWRlZCkgfHwgcGFzdE9mZnNldDtcbiAgICB9LFxuICBcbiAgICAvKipcbiAgICAgKiBIYW5kbGVzIHVwZGF0aW5nIHRoZSBzdGF0ZSBvZiB0aGUgd2lkZ2V0XG4gICAgICovXG4gICAgdXBkYXRlIDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY3VycmVudFNjcm9sbFkgID0gdGhpcy5nZXRTY3JvbGxZKCksXG4gICAgICAgIHNjcm9sbERpcmVjdGlvbiA9IGN1cnJlbnRTY3JvbGxZID4gdGhpcy5sYXN0S25vd25TY3JvbGxZID8gJ2Rvd24nIDogJ3VwJyxcbiAgICAgICAgdG9sZXJhbmNlRXhjZWVkZWQgPSB0aGlzLnRvbGVyYW5jZUV4Y2VlZGVkKGN1cnJlbnRTY3JvbGxZLCBzY3JvbGxEaXJlY3Rpb24pO1xuICBcbiAgICAgIGlmKHRoaXMuaXNPdXRPZkJvdW5kcyhjdXJyZW50U2Nyb2xsWSkpIHsgLy8gSWdub3JlIGJvdW5jeSBzY3JvbGxpbmcgaW4gT1NYXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgXG4gICAgICBpZiAoY3VycmVudFNjcm9sbFkgPD0gdGhpcy5vZmZzZXQgKSB7XG4gICAgICAgIHRoaXMudG9wKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm5vdFRvcCgpO1xuICAgICAgfVxuICBcbiAgICAgIGlmKGN1cnJlbnRTY3JvbGxZICsgdGhpcy5nZXRWaWV3cG9ydEhlaWdodCgpID49IHRoaXMuZ2V0U2Nyb2xsZXJIZWlnaHQoKSkge1xuICAgICAgICB0aGlzLmJvdHRvbSgpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMubm90Qm90dG9tKCk7XG4gICAgICB9XG4gIFxuICAgICAgaWYodGhpcy5zaG91bGRVbnBpbihjdXJyZW50U2Nyb2xsWSwgdG9sZXJhbmNlRXhjZWVkZWQpKSB7XG4gICAgICAgIHRoaXMudW5waW4oKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYodGhpcy5zaG91bGRQaW4oY3VycmVudFNjcm9sbFksIHRvbGVyYW5jZUV4Y2VlZGVkKSkge1xuICAgICAgICB0aGlzLnBpbigpO1xuICAgICAgfVxuICBcbiAgICAgIHRoaXMubGFzdEtub3duU2Nyb2xsWSA9IGN1cnJlbnRTY3JvbGxZO1xuICAgIH1cbiAgfTtcbiAgLyoqXG4gICAqIERlZmF1bHQgb3B0aW9uc1xuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgSGVhZHJvb20ub3B0aW9ucyA9IHtcbiAgICB0b2xlcmFuY2UgOiB7XG4gICAgICB1cCA6IDAsXG4gICAgICBkb3duIDogMFxuICAgIH0sXG4gICAgb2Zmc2V0IDogMCxcbiAgICBzY3JvbGxlcjogd2luZG93LFxuICAgIGNsYXNzZXMgOiB7XG4gICAgICBwaW5uZWQgOiAnaGVhZHJvb20tLXBpbm5lZCcsXG4gICAgICB1bnBpbm5lZCA6ICdoZWFkcm9vbS0tdW5waW5uZWQnLFxuICAgICAgdG9wIDogJ2hlYWRyb29tLS10b3AnLFxuICAgICAgbm90VG9wIDogJ2hlYWRyb29tLS1ub3QtdG9wJyxcbiAgICAgIGJvdHRvbSA6ICdoZWFkcm9vbS0tYm90dG9tJyxcbiAgICAgIG5vdEJvdHRvbSA6ICdoZWFkcm9vbS0tbm90LWJvdHRvbScsXG4gICAgICBpbml0aWFsIDogJ2hlYWRyb29tJ1xuICAgIH1cbiAgfTtcbiAgSGVhZHJvb20uY3V0c1RoZU11c3RhcmQgPSB0eXBlb2YgZmVhdHVyZXMgIT09ICd1bmRlZmluZWQnICYmIGZlYXR1cmVzLnJBRiAmJiBmZWF0dXJlcy5iaW5kICYmIGZlYXR1cmVzLmNsYXNzTGlzdDtcblxuICByZXR1cm4gSGVhZHJvb207XG59KSk7IiwiLyohXG4gKiBpbi12aWV3IDAuNi4xIC0gR2V0IG5vdGlmaWVkIHdoZW4gYSBET00gZWxlbWVudCBlbnRlcnMgb3IgZXhpdHMgdGhlIHZpZXdwb3J0LlxuICogQ29weXJpZ2h0IChjKSAyMDE2IENhbSBXaWVnZXJ0IDxjYW1AY2Ftd2llZ2VydC5jb20+IC0gaHR0cHM6Ly9jYW13aWVnZXJ0LmdpdGh1Yi5pby9pbi12aWV3XG4gKiBMaWNlbnNlOiBNSVRcbiAqL1xuIWZ1bmN0aW9uKHQsZSl7XCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHMmJlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGU/bW9kdWxlLmV4cG9ydHM9ZSgpOlwiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoW10sZSk6XCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHM/ZXhwb3J0cy5pblZpZXc9ZSgpOnQuaW5WaWV3PWUoKX0odGhpcyxmdW5jdGlvbigpe3JldHVybiBmdW5jdGlvbih0KXtmdW5jdGlvbiBlKHIpe2lmKG5bcl0pcmV0dXJuIG5bcl0uZXhwb3J0czt2YXIgaT1uW3JdPXtleHBvcnRzOnt9LGlkOnIsbG9hZGVkOiExfTtyZXR1cm4gdFtyXS5jYWxsKGkuZXhwb3J0cyxpLGkuZXhwb3J0cyxlKSxpLmxvYWRlZD0hMCxpLmV4cG9ydHN9dmFyIG49e307cmV0dXJuIGUubT10LGUuYz1uLGUucD1cIlwiLGUoMCl9KFtmdW5jdGlvbih0LGUsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcih0KXtyZXR1cm4gdCYmdC5fX2VzTW9kdWxlP3Q6e1wiZGVmYXVsdFwiOnR9fXZhciBpPW4oMiksbz1yKGkpO3QuZXhwb3J0cz1vW1wiZGVmYXVsdFwiXX0sZnVuY3Rpb24odCxlKXtmdW5jdGlvbiBuKHQpe3ZhciBlPXR5cGVvZiB0O3JldHVybiBudWxsIT10JiYoXCJvYmplY3RcIj09ZXx8XCJmdW5jdGlvblwiPT1lKX10LmV4cG9ydHM9bn0sZnVuY3Rpb24odCxlLG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIodCl7cmV0dXJuIHQmJnQuX19lc01vZHVsZT90OntcImRlZmF1bHRcIjp0fX1PYmplY3QuZGVmaW5lUHJvcGVydHkoZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgaT1uKDkpLG89cihpKSx1PW4oMyksZj1yKHUpLHM9big0KSxjPWZ1bmN0aW9uKCl7aWYoXCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdyl7dmFyIHQ9MTAwLGU9W1wic2Nyb2xsXCIsXCJyZXNpemVcIixcImxvYWRcIl0sbj17aGlzdG9yeTpbXX0scj17b2Zmc2V0Ont9LHRocmVzaG9sZDowLHRlc3Q6cy5pblZpZXdwb3J0fSxpPSgwLG9bXCJkZWZhdWx0XCJdKShmdW5jdGlvbigpe24uaGlzdG9yeS5mb3JFYWNoKGZ1bmN0aW9uKHQpe25bdF0uY2hlY2soKX0pfSx0KTtlLmZvckVhY2goZnVuY3Rpb24odCl7cmV0dXJuIGFkZEV2ZW50TGlzdGVuZXIodCxpKX0pLHdpbmRvdy5NdXRhdGlvbk9ic2VydmVyJiZhZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLGZ1bmN0aW9uKCl7bmV3IE11dGF0aW9uT2JzZXJ2ZXIoaSkub2JzZXJ2ZShkb2N1bWVudC5ib2R5LHthdHRyaWJ1dGVzOiEwLGNoaWxkTGlzdDohMCxzdWJ0cmVlOiEwfSl9KTt2YXIgdT1mdW5jdGlvbih0KXtpZihcInN0cmluZ1wiPT10eXBlb2YgdCl7dmFyIGU9W10uc2xpY2UuY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHQpKTtyZXR1cm4gbi5oaXN0b3J5LmluZGV4T2YodCk+LTE/blt0XS5lbGVtZW50cz1lOihuW3RdPSgwLGZbXCJkZWZhdWx0XCJdKShlLHIpLG4uaGlzdG9yeS5wdXNoKHQpKSxuW3RdfX07cmV0dXJuIHUub2Zmc2V0PWZ1bmN0aW9uKHQpe2lmKHZvaWQgMD09PXQpcmV0dXJuIHIub2Zmc2V0O3ZhciBlPWZ1bmN0aW9uKHQpe3JldHVyblwibnVtYmVyXCI9PXR5cGVvZiB0fTtyZXR1cm5bXCJ0b3BcIixcInJpZ2h0XCIsXCJib3R0b21cIixcImxlZnRcIl0uZm9yRWFjaChlKHQpP2Z1bmN0aW9uKGUpe3JldHVybiByLm9mZnNldFtlXT10fTpmdW5jdGlvbihuKXtyZXR1cm4gZSh0W25dKT9yLm9mZnNldFtuXT10W25dOm51bGx9KSxyLm9mZnNldH0sdS50aHJlc2hvbGQ9ZnVuY3Rpb24odCl7cmV0dXJuXCJudW1iZXJcIj09dHlwZW9mIHQmJnQ+PTAmJnQ8PTE/ci50aHJlc2hvbGQ9dDpyLnRocmVzaG9sZH0sdS50ZXN0PWZ1bmN0aW9uKHQpe3JldHVyblwiZnVuY3Rpb25cIj09dHlwZW9mIHQ/ci50ZXN0PXQ6ci50ZXN0fSx1LmlzPWZ1bmN0aW9uKHQpe3JldHVybiByLnRlc3QodCxyKX0sdS5vZmZzZXQoMCksdX19O2VbXCJkZWZhdWx0XCJdPWMoKX0sZnVuY3Rpb24odCxlKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBuKHQsZSl7aWYoISh0IGluc3RhbmNlb2YgZSkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX1PYmplY3QuZGVmaW5lUHJvcGVydHkoZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgcj1mdW5jdGlvbigpe2Z1bmN0aW9uIHQodCxlKXtmb3IodmFyIG49MDtuPGUubGVuZ3RoO24rKyl7dmFyIHI9ZVtuXTtyLmVudW1lcmFibGU9ci5lbnVtZXJhYmxlfHwhMSxyLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiByJiYoci53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KHQsci5rZXkscil9fXJldHVybiBmdW5jdGlvbihlLG4scil7cmV0dXJuIG4mJnQoZS5wcm90b3R5cGUsbiksciYmdChlLHIpLGV9fSgpLGk9ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KGUscil7bih0aGlzLHQpLHRoaXMub3B0aW9ucz1yLHRoaXMuZWxlbWVudHM9ZSx0aGlzLmN1cnJlbnQ9W10sdGhpcy5oYW5kbGVycz17ZW50ZXI6W10sZXhpdDpbXX0sdGhpcy5zaW5nbGVzPXtlbnRlcjpbXSxleGl0OltdfX1yZXR1cm4gcih0LFt7a2V5OlwiY2hlY2tcIix2YWx1ZTpmdW5jdGlvbigpe3ZhciB0PXRoaXM7cmV0dXJuIHRoaXMuZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlKXt2YXIgbj10Lm9wdGlvbnMudGVzdChlLHQub3B0aW9ucykscj10LmN1cnJlbnQuaW5kZXhPZihlKSxpPXI+LTEsbz1uJiYhaSx1PSFuJiZpO28mJih0LmN1cnJlbnQucHVzaChlKSx0LmVtaXQoXCJlbnRlclwiLGUpKSx1JiYodC5jdXJyZW50LnNwbGljZShyLDEpLHQuZW1pdChcImV4aXRcIixlKSl9KSx0aGlzfX0se2tleTpcIm9uXCIsdmFsdWU6ZnVuY3Rpb24odCxlKXtyZXR1cm4gdGhpcy5oYW5kbGVyc1t0XS5wdXNoKGUpLHRoaXN9fSx7a2V5Olwib25jZVwiLHZhbHVlOmZ1bmN0aW9uKHQsZSl7cmV0dXJuIHRoaXMuc2luZ2xlc1t0XS51bnNoaWZ0KGUpLHRoaXN9fSx7a2V5OlwiZW1pdFwiLHZhbHVlOmZ1bmN0aW9uKHQsZSl7Zm9yKDt0aGlzLnNpbmdsZXNbdF0ubGVuZ3RoOyl0aGlzLnNpbmdsZXNbdF0ucG9wKCkoZSk7Zm9yKHZhciBuPXRoaXMuaGFuZGxlcnNbdF0ubGVuZ3RoOy0tbj4tMTspdGhpcy5oYW5kbGVyc1t0XVtuXShlKTtyZXR1cm4gdGhpc319XSksdH0oKTtlW1wiZGVmYXVsdFwiXT1mdW5jdGlvbih0LGUpe3JldHVybiBuZXcgaSh0LGUpfX0sZnVuY3Rpb24odCxlKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBuKHQsZSl7dmFyIG49dC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxyPW4udG9wLGk9bi5yaWdodCxvPW4uYm90dG9tLHU9bi5sZWZ0LGY9bi53aWR0aCxzPW4uaGVpZ2h0LGM9e3Q6byxyOndpbmRvdy5pbm5lcldpZHRoLXUsYjp3aW5kb3cuaW5uZXJIZWlnaHQtcixsOml9LGE9e3g6ZS50aHJlc2hvbGQqZix5OmUudGhyZXNob2xkKnN9O3JldHVybiBjLnQ+ZS5vZmZzZXQudG9wK2EueSYmYy5yPmUub2Zmc2V0LnJpZ2h0K2EueCYmYy5iPmUub2Zmc2V0LmJvdHRvbSthLnkmJmMubD5lLm9mZnNldC5sZWZ0K2EueH1PYmplY3QuZGVmaW5lUHJvcGVydHkoZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxlLmluVmlld3BvcnQ9bn0sZnVuY3Rpb24odCxlKXsoZnVuY3Rpb24oZSl7dmFyIG49XCJvYmplY3RcIj09dHlwZW9mIGUmJmUmJmUuT2JqZWN0PT09T2JqZWN0JiZlO3QuZXhwb3J0cz1ufSkuY2FsbChlLGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXN9KCkpfSxmdW5jdGlvbih0LGUsbil7dmFyIHI9big1KSxpPVwib2JqZWN0XCI9PXR5cGVvZiBzZWxmJiZzZWxmJiZzZWxmLk9iamVjdD09PU9iamVjdCYmc2VsZixvPXJ8fGl8fEZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKTt0LmV4cG9ydHM9b30sZnVuY3Rpb24odCxlLG4pe2Z1bmN0aW9uIHIodCxlLG4pe2Z1bmN0aW9uIHIoZSl7dmFyIG49eCxyPW07cmV0dXJuIHg9bT12b2lkIDAsRT1lLHc9dC5hcHBseShyLG4pfWZ1bmN0aW9uIGEodCl7cmV0dXJuIEU9dCxqPXNldFRpbWVvdXQoaCxlKSxNP3IodCk6d31mdW5jdGlvbiBsKHQpe3ZhciBuPXQtTyxyPXQtRSxpPWUtbjtyZXR1cm4gXz9jKGksZy1yKTppfWZ1bmN0aW9uIGQodCl7dmFyIG49dC1PLHI9dC1FO3JldHVybiB2b2lkIDA9PT1PfHxuPj1lfHxuPDB8fF8mJnI+PWd9ZnVuY3Rpb24gaCgpe3ZhciB0PW8oKTtyZXR1cm4gZCh0KT9wKHQpOnZvaWQoaj1zZXRUaW1lb3V0KGgsbCh0KSkpfWZ1bmN0aW9uIHAodCl7cmV0dXJuIGo9dm9pZCAwLFQmJng/cih0KTooeD1tPXZvaWQgMCx3KX1mdW5jdGlvbiB2KCl7dm9pZCAwIT09aiYmY2xlYXJUaW1lb3V0KGopLEU9MCx4PU89bT1qPXZvaWQgMH1mdW5jdGlvbiB5KCl7cmV0dXJuIHZvaWQgMD09PWo/dzpwKG8oKSl9ZnVuY3Rpb24gYigpe3ZhciB0PW8oKSxuPWQodCk7aWYoeD1hcmd1bWVudHMsbT10aGlzLE89dCxuKXtpZih2b2lkIDA9PT1qKXJldHVybiBhKE8pO2lmKF8pcmV0dXJuIGo9c2V0VGltZW91dChoLGUpLHIoTyl9cmV0dXJuIHZvaWQgMD09PWomJihqPXNldFRpbWVvdXQoaCxlKSksd312YXIgeCxtLGcsdyxqLE8sRT0wLE09ITEsXz0hMSxUPSEwO2lmKFwiZnVuY3Rpb25cIiE9dHlwZW9mIHQpdGhyb3cgbmV3IFR5cGVFcnJvcihmKTtyZXR1cm4gZT11KGUpfHwwLGkobikmJihNPSEhbi5sZWFkaW5nLF89XCJtYXhXYWl0XCJpbiBuLGc9Xz9zKHUobi5tYXhXYWl0KXx8MCxlKTpnLFQ9XCJ0cmFpbGluZ1wiaW4gbj8hIW4udHJhaWxpbmc6VCksYi5jYW5jZWw9dixiLmZsdXNoPXksYn12YXIgaT1uKDEpLG89big4KSx1PW4oMTApLGY9XCJFeHBlY3RlZCBhIGZ1bmN0aW9uXCIscz1NYXRoLm1heCxjPU1hdGgubWluO3QuZXhwb3J0cz1yfSxmdW5jdGlvbih0LGUsbil7dmFyIHI9big2KSxpPWZ1bmN0aW9uKCl7cmV0dXJuIHIuRGF0ZS5ub3coKX07dC5leHBvcnRzPWl9LGZ1bmN0aW9uKHQsZSxuKXtmdW5jdGlvbiByKHQsZSxuKXt2YXIgcj0hMCxmPSEwO2lmKFwiZnVuY3Rpb25cIiE9dHlwZW9mIHQpdGhyb3cgbmV3IFR5cGVFcnJvcih1KTtyZXR1cm4gbyhuKSYmKHI9XCJsZWFkaW5nXCJpbiBuPyEhbi5sZWFkaW5nOnIsZj1cInRyYWlsaW5nXCJpbiBuPyEhbi50cmFpbGluZzpmKSxpKHQsZSx7bGVhZGluZzpyLG1heFdhaXQ6ZSx0cmFpbGluZzpmfSl9dmFyIGk9big3KSxvPW4oMSksdT1cIkV4cGVjdGVkIGEgZnVuY3Rpb25cIjt0LmV4cG9ydHM9cn0sZnVuY3Rpb24odCxlKXtmdW5jdGlvbiBuKHQpe3JldHVybiB0fXQuZXhwb3J0cz1ufV0pfSk7IiwibW9kdWxlLmV4cG9ydHMgPSBsb2FkXG5cbmZ1bmN0aW9uIGxvYWQgKHNyYywgY2IpIHtcbiAgdmFyIGhlYWQgPSBkb2N1bWVudC5oZWFkIHx8IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF1cbiAgdmFyIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpXG5cbiAgc2NyaXB0LnR5cGUgPSAndGV4dC9qYXZhc2NyaXB0J1xuICBzY3JpcHQuYXN5bmMgPSB0cnVlXG4gIHNjcmlwdC5zcmMgPSBzcmNcblxuICBpZiAoY2IpIHtcbiAgICBzY3JpcHQub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgc2NyaXB0Lm9uZXJyb3IgPSBzY3JpcHQub25sb2FkID0gbnVsbFxuICAgICAgY2IobnVsbCwgc2NyaXB0KVxuICAgIH1cbiAgICBzY3JpcHQub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHNjcmlwdC5vbmVycm9yID0gc2NyaXB0Lm9ubG9hZCA9IG51bGxcbiAgICAgIGNiKG5ldyBFcnJvcignRmFpbGVkIHRvIGxvYWQgJyArIHNyYyksIHNjcmlwdClcbiAgICB9XG4gIH1cblxuICBoZWFkLmFwcGVuZENoaWxkKHNjcmlwdClcbn1cbiIsIi8qKlxuICogU3dpcGVyIDQuMC43XG4gKiBNb3N0IG1vZGVybiBtb2JpbGUgdG91Y2ggc2xpZGVyIGFuZCBmcmFtZXdvcmsgd2l0aCBoYXJkd2FyZSBhY2NlbGVyYXRlZCB0cmFuc2l0aW9uc1xuICogaHR0cDovL3d3dy5pZGFuZ2Vyby51cy9zd2lwZXIvXG4gKlxuICogQ29weXJpZ2h0IDIwMTQtMjAxNyBWbGFkaW1pciBLaGFybGFtcGlkaVxuICpcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZVxuICpcbiAqIFJlbGVhc2VkIG9uOiBOb3ZlbWJlciAyOCwgMjAxN1xuICovXG5cbihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG5cdHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpIDpcblx0dHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKGZhY3RvcnkpIDpcblx0KGdsb2JhbC5Td2lwZXIgPSBmYWN0b3J5KCkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKCkgeyAndXNlIHN0cmljdCc7XG5cbnZhciB3O1xuaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSB7XG4gIHcgPSB7XG4gICAgbmF2aWdhdG9yOiB7XG4gICAgICB1c2VyQWdlbnQ6ICcnLFxuICAgIH0sXG4gICAgbG9jYXRpb246IHt9LFxuICAgIGhpc3Rvcnk6IHt9LFxuICAgIGFkZEV2ZW50TGlzdGVuZXI6IGZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXIoKSB7fSxcbiAgICByZW1vdmVFdmVudExpc3RlbmVyOiBmdW5jdGlvbiByZW1vdmVFdmVudExpc3RlbmVyKCkge30sXG4gICAgZ2V0Q29tcHV0ZWRTdHlsZTogZnVuY3Rpb24gZ2V0Q29tcHV0ZWRTdHlsZSgpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9LFxuICAgIEltYWdlOiBmdW5jdGlvbiBJbWFnZSgpIHt9LFxuICAgIERhdGU6IGZ1bmN0aW9uIERhdGUoKSB7fSxcbiAgICBzY3JlZW46IHt9LFxuICB9O1xufSBlbHNlIHtcbiAgdyA9IHdpbmRvdztcbn1cblxudmFyIHdpbiA9IHc7XG5cbi8qKlxuICogRG9tNyAyLjAuMVxuICogTWluaW1hbGlzdGljIEphdmFTY3JpcHQgbGlicmFyeSBmb3IgRE9NIG1hbmlwdWxhdGlvbiwgd2l0aCBhIGpRdWVyeS1jb21wYXRpYmxlIEFQSVxuICogaHR0cDovL2ZyYW1ld29yazcuaW8vZG9jcy9kb20uaHRtbFxuICpcbiAqIENvcHlyaWdodCAyMDE3LCBWbGFkaW1pciBLaGFybGFtcGlkaVxuICogVGhlIGlEYW5nZXJvLnVzXG4gKiBodHRwOi8vd3d3LmlkYW5nZXJvLnVzL1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIE1JVFxuICpcbiAqIFJlbGVhc2VkIG9uOiBPY3RvYmVyIDIsIDIwMTdcbiAqL1xudmFyIERvbTcgPSBmdW5jdGlvbiBEb203KGFycikge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIC8vIENyZWF0ZSBhcnJheS1saWtlIG9iamVjdFxuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkgKz0gMSkge1xuICAgIHNlbGZbaV0gPSBhcnJbaV07XG4gIH1cbiAgc2VsZi5sZW5ndGggPSBhcnIubGVuZ3RoO1xuICAvLyBSZXR1cm4gY29sbGVjdGlvbiB3aXRoIG1ldGhvZHNcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5mdW5jdGlvbiAkJDEoc2VsZWN0b3IsIGNvbnRleHQpIHtcbiAgdmFyIGFyciA9IFtdO1xuICB2YXIgaSA9IDA7XG4gIGlmIChzZWxlY3RvciAmJiAhY29udGV4dCkge1xuICAgIGlmIChzZWxlY3RvciBpbnN0YW5jZW9mIERvbTcpIHtcbiAgICAgIHJldHVybiBzZWxlY3RvcjtcbiAgICB9XG4gIH1cbiAgaWYgKHNlbGVjdG9yKSB7XG4gICAgICAvLyBTdHJpbmdcbiAgICBpZiAodHlwZW9mIHNlbGVjdG9yID09PSAnc3RyaW5nJykge1xuICAgICAgdmFyIGVscztcbiAgICAgIHZhciB0ZW1wUGFyZW50O1xuICAgICAgdmFyIGh0bWwgPSBzZWxlY3Rvci50cmltKCk7XG4gICAgICBpZiAoaHRtbC5pbmRleE9mKCc8JykgPj0gMCAmJiBodG1sLmluZGV4T2YoJz4nKSA+PSAwKSB7XG4gICAgICAgIHZhciB0b0NyZWF0ZSA9ICdkaXYnO1xuICAgICAgICBpZiAoaHRtbC5pbmRleE9mKCc8bGknKSA9PT0gMCkgeyB0b0NyZWF0ZSA9ICd1bCc7IH1cbiAgICAgICAgaWYgKGh0bWwuaW5kZXhPZignPHRyJykgPT09IDApIHsgdG9DcmVhdGUgPSAndGJvZHknOyB9XG4gICAgICAgIGlmIChodG1sLmluZGV4T2YoJzx0ZCcpID09PSAwIHx8IGh0bWwuaW5kZXhPZignPHRoJykgPT09IDApIHsgdG9DcmVhdGUgPSAndHInOyB9XG4gICAgICAgIGlmIChodG1sLmluZGV4T2YoJzx0Ym9keScpID09PSAwKSB7IHRvQ3JlYXRlID0gJ3RhYmxlJzsgfVxuICAgICAgICBpZiAoaHRtbC5pbmRleE9mKCc8b3B0aW9uJykgPT09IDApIHsgdG9DcmVhdGUgPSAnc2VsZWN0JzsgfVxuICAgICAgICB0ZW1wUGFyZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0b0NyZWF0ZSk7XG4gICAgICAgIHRlbXBQYXJlbnQuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHRlbXBQYXJlbnQuY2hpbGROb2Rlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgIGFyci5wdXNoKHRlbXBQYXJlbnQuY2hpbGROb2Rlc1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghY29udGV4dCAmJiBzZWxlY3RvclswXSA9PT0gJyMnICYmICFzZWxlY3Rvci5tYXRjaCgvWyAuPD46fl0vKSkge1xuICAgICAgICAgIC8vIFB1cmUgSUQgc2VsZWN0b3JcbiAgICAgICAgICBlbHMgPSBbZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc2VsZWN0b3IudHJpbSgpLnNwbGl0KCcjJylbMV0pXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBPdGhlciBzZWxlY3RvcnNcbiAgICAgICAgICBlbHMgPSAoY29udGV4dCB8fCBkb2N1bWVudCkucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvci50cmltKCkpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBlbHMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICBpZiAoZWxzW2ldKSB7IGFyci5wdXNoKGVsc1tpXSk7IH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoc2VsZWN0b3Iubm9kZVR5cGUgfHwgc2VsZWN0b3IgPT09IHdpbmRvdyB8fCBzZWxlY3RvciA9PT0gZG9jdW1lbnQpIHtcbiAgICAgIC8vIE5vZGUvZWxlbWVudFxuICAgICAgYXJyLnB1c2goc2VsZWN0b3IpO1xuICAgIH0gZWxzZSBpZiAoc2VsZWN0b3IubGVuZ3RoID4gMCAmJiBzZWxlY3RvclswXS5ub2RlVHlwZSkge1xuICAgICAgLy8gQXJyYXkgb2YgZWxlbWVudHMgb3IgaW5zdGFuY2Ugb2YgRG9tXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgc2VsZWN0b3IubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgYXJyLnB1c2goc2VsZWN0b3JbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gbmV3IERvbTcoYXJyKTtcbn1cblxuJCQxLmZuID0gRG9tNy5wcm90b3R5cGU7XG4kJDEuQ2xhc3MgPSBEb203O1xuJCQxLkRvbTcgPSBEb203O1xuXG5mdW5jdGlvbiB1bmlxdWUoYXJyKSB7XG4gIHZhciB1bmlxdWVBcnJheSA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkgKz0gMSkge1xuICAgIGlmICh1bmlxdWVBcnJheS5pbmRleE9mKGFycltpXSkgPT09IC0xKSB7IHVuaXF1ZUFycmF5LnB1c2goYXJyW2ldKTsgfVxuICB9XG4gIHJldHVybiB1bmlxdWVBcnJheTtcbn1cbi8vIENsYXNzZXMgYW5kIGF0dHJpYnV0ZXNcbmZ1bmN0aW9uIGFkZENsYXNzKGNsYXNzTmFtZSkge1xuICB2YXIgdGhpcyQxID0gdGhpcztcblxuICBpZiAodHlwZW9mIGNsYXNzTmFtZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICB2YXIgY2xhc3NlcyA9IGNsYXNzTmFtZS5zcGxpdCgnICcpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNsYXNzZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRoaXMubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpcyQxW2pdLmNsYXNzTGlzdCAhPT0gJ3VuZGVmaW5lZCcpIHsgdGhpcyQxW2pdLmNsYXNzTGlzdC5hZGQoY2xhc3Nlc1tpXSk7IH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59XG5mdW5jdGlvbiByZW1vdmVDbGFzcyhjbGFzc05hbWUpIHtcbiAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgdmFyIGNsYXNzZXMgPSBjbGFzc05hbWUuc3BsaXQoJyAnKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbGFzc2VzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICBpZiAodHlwZW9mIHRoaXMkMVtqXS5jbGFzc0xpc3QgIT09ICd1bmRlZmluZWQnKSB7IHRoaXMkMVtqXS5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzZXNbaV0pOyB9XG4gICAgfVxuICB9XG4gIHJldHVybiB0aGlzO1xufVxuZnVuY3Rpb24gaGFzQ2xhc3MoY2xhc3NOYW1lKSB7XG4gIGlmICghdGhpc1swXSkgeyByZXR1cm4gZmFsc2U7IH1cbiAgcmV0dXJuIHRoaXNbMF0uY2xhc3NMaXN0LmNvbnRhaW5zKGNsYXNzTmFtZSk7XG59XG5mdW5jdGlvbiB0b2dnbGVDbGFzcyhjbGFzc05hbWUpIHtcbiAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgdmFyIGNsYXNzZXMgPSBjbGFzc05hbWUuc3BsaXQoJyAnKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbGFzc2VzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICBpZiAodHlwZW9mIHRoaXMkMVtqXS5jbGFzc0xpc3QgIT09ICd1bmRlZmluZWQnKSB7IHRoaXMkMVtqXS5jbGFzc0xpc3QudG9nZ2xlKGNsYXNzZXNbaV0pOyB9XG4gICAgfVxuICB9XG4gIHJldHVybiB0aGlzO1xufVxuZnVuY3Rpb24gYXR0cihhdHRycywgdmFsdWUpIHtcbiAgdmFyIGFyZ3VtZW50cyQxID0gYXJndW1lbnRzO1xuICB2YXIgdGhpcyQxID0gdGhpcztcblxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSAmJiB0eXBlb2YgYXR0cnMgPT09ICdzdHJpbmcnKSB7XG4gICAgLy8gR2V0IGF0dHJcbiAgICBpZiAodGhpc1swXSkgeyByZXR1cm4gdGhpc1swXS5nZXRBdHRyaWJ1dGUoYXR0cnMpOyB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8vIFNldCBhdHRyc1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICBpZiAoYXJndW1lbnRzJDEubGVuZ3RoID09PSAyKSB7XG4gICAgICAvLyBTdHJpbmdcbiAgICAgIHRoaXMkMVtpXS5zZXRBdHRyaWJ1dGUoYXR0cnMsIHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gT2JqZWN0XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmVcbiAgICAgIGZvciAodmFyIGF0dHJOYW1lIGluIGF0dHJzKSB7XG4gICAgICAgIHRoaXMkMVtpXVthdHRyTmFtZV0gPSBhdHRyc1thdHRyTmFtZV07XG4gICAgICAgIHRoaXMkMVtpXS5zZXRBdHRyaWJ1dGUoYXR0ck5hbWUsIGF0dHJzW2F0dHJOYW1lXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiB0aGlzO1xufVxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXG5mdW5jdGlvbiByZW1vdmVBdHRyKGF0dHIpIHtcbiAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgdGhpcyQxW2ldLnJlbW92ZUF0dHJpYnV0ZShhdHRyKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn1cbmZ1bmN0aW9uIGRhdGEoa2V5LCB2YWx1ZSkge1xuICB2YXIgdGhpcyQxID0gdGhpcztcblxuICB2YXIgZWw7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgZWwgPSB0aGlzWzBdO1xuICAgIC8vIEdldCB2YWx1ZVxuICAgIGlmIChlbCkge1xuICAgICAgaWYgKGVsLmRvbTdFbGVtZW50RGF0YVN0b3JhZ2UgJiYgKGtleSBpbiBlbC5kb203RWxlbWVudERhdGFTdG9yYWdlKSkge1xuICAgICAgICByZXR1cm4gZWwuZG9tN0VsZW1lbnREYXRhU3RvcmFnZVtrZXldO1xuICAgICAgfVxuXG4gICAgICB2YXIgZGF0YUtleSA9IGVsLmdldEF0dHJpYnV0ZSgoXCJkYXRhLVwiICsga2V5KSk7XG4gICAgICBpZiAoZGF0YUtleSkge1xuICAgICAgICByZXR1cm4gZGF0YUtleTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICAvLyBTZXQgdmFsdWVcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgZWwgPSB0aGlzJDFbaV07XG4gICAgaWYgKCFlbC5kb203RWxlbWVudERhdGFTdG9yYWdlKSB7IGVsLmRvbTdFbGVtZW50RGF0YVN0b3JhZ2UgPSB7fTsgfVxuICAgIGVsLmRvbTdFbGVtZW50RGF0YVN0b3JhZ2Vba2V5XSA9IHZhbHVlO1xuICB9XG4gIHJldHVybiB0aGlzO1xufVxuLy8gVHJhbnNmb3Jtc1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXG5mdW5jdGlvbiB0cmFuc2Zvcm0odHJhbnNmb3JtKSB7XG4gIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIHZhciBlbFN0eWxlID0gdGhpcyQxW2ldLnN0eWxlO1xuICAgIGVsU3R5bGUud2Via2l0VHJhbnNmb3JtID0gdHJhbnNmb3JtO1xuICAgIGVsU3R5bGUudHJhbnNmb3JtID0gdHJhbnNmb3JtO1xuICB9XG4gIHJldHVybiB0aGlzO1xufVxuZnVuY3Rpb24gdHJhbnNpdGlvbihkdXJhdGlvbikge1xuICB2YXIgdGhpcyQxID0gdGhpcztcblxuICBpZiAodHlwZW9mIGR1cmF0aW9uICE9PSAnc3RyaW5nJykge1xuICAgIGR1cmF0aW9uID0gZHVyYXRpb24gKyBcIm1zXCI7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICB2YXIgZWxTdHlsZSA9IHRoaXMkMVtpXS5zdHlsZTtcbiAgICBlbFN0eWxlLndlYmtpdFRyYW5zaXRpb25EdXJhdGlvbiA9IGR1cmF0aW9uO1xuICAgIGVsU3R5bGUudHJhbnNpdGlvbkR1cmF0aW9uID0gZHVyYXRpb247XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59XG4vLyBFdmVudHNcbmZ1bmN0aW9uIG9uKCkge1xuICB2YXIgdGhpcyQxID0gdGhpcztcbiAgdmFyIGFyZ3MgPSBbXSwgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgd2hpbGUgKCBsZW4tLSApIGFyZ3NbIGxlbiBdID0gYXJndW1lbnRzWyBsZW4gXTtcblxuICB2YXIgZXZlbnRUeXBlID0gYXJnc1swXTtcbiAgdmFyIHRhcmdldFNlbGVjdG9yID0gYXJnc1sxXTtcbiAgdmFyIGxpc3RlbmVyID0gYXJnc1syXTtcbiAgdmFyIGNhcHR1cmUgPSBhcmdzWzNdO1xuICBpZiAodHlwZW9mIGFyZ3NbMV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICB2YXIgYXNzaWduO1xuICAgIChhc3NpZ24gPSBhcmdzLCBldmVudFR5cGUgPSBhc3NpZ25bMF0sIGxpc3RlbmVyID0gYXNzaWduWzFdLCBjYXB0dXJlID0gYXNzaWduWzJdKTtcbiAgICB0YXJnZXRTZWxlY3RvciA9IHVuZGVmaW5lZDtcbiAgfVxuICBpZiAoIWNhcHR1cmUpIHsgY2FwdHVyZSA9IGZhbHNlOyB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlTGl2ZUV2ZW50KGUpIHtcbiAgICB2YXIgdGFyZ2V0ID0gZS50YXJnZXQ7XG4gICAgaWYgKCF0YXJnZXQpIHsgcmV0dXJuOyB9XG4gICAgdmFyIGV2ZW50RGF0YSA9IGUudGFyZ2V0LmRvbTdFdmVudERhdGEgfHwgW107XG4gICAgZXZlbnREYXRhLnVuc2hpZnQoZSk7XG4gICAgaWYgKCQkMSh0YXJnZXQpLmlzKHRhcmdldFNlbGVjdG9yKSkgeyBsaXN0ZW5lci5hcHBseSh0YXJnZXQsIGV2ZW50RGF0YSk7IH1cbiAgICBlbHNlIHtcbiAgICAgIHZhciBwYXJlbnRzID0gJCQxKHRhcmdldCkucGFyZW50cygpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgICBmb3IgKHZhciBrID0gMDsgayA8IHBhcmVudHMubGVuZ3RoOyBrICs9IDEpIHtcbiAgICAgICAgaWYgKCQkMShwYXJlbnRzW2tdKS5pcyh0YXJnZXRTZWxlY3RvcikpIHsgbGlzdGVuZXIuYXBwbHkocGFyZW50c1trXSwgZXZlbnREYXRhKTsgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBoYW5kbGVFdmVudChlKSB7XG4gICAgdmFyIGV2ZW50RGF0YSA9IGUgJiYgZS50YXJnZXQgPyBlLnRhcmdldC5kb203RXZlbnREYXRhIHx8IFtdIDogW107XG4gICAgZXZlbnREYXRhLnVuc2hpZnQoZSk7XG4gICAgbGlzdGVuZXIuYXBwbHkodGhpcywgZXZlbnREYXRhKTtcbiAgfVxuICB2YXIgZXZlbnRzID0gZXZlbnRUeXBlLnNwbGl0KCcgJyk7XG4gIHZhciBqO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICB2YXIgZWwgPSB0aGlzJDFbaV07XG4gICAgaWYgKCF0YXJnZXRTZWxlY3Rvcikge1xuICAgICAgZm9yIChqID0gMDsgaiA8IGV2ZW50cy5sZW5ndGg7IGogKz0gMSkge1xuICAgICAgICBpZiAoIWVsLmRvbTdMaXN0ZW5lcnMpIHsgZWwuZG9tN0xpc3RlbmVycyA9IFtdOyB9XG4gICAgICAgIGVsLmRvbTdMaXN0ZW5lcnMucHVzaCh7XG4gICAgICAgICAgdHlwZTogZXZlbnRUeXBlLFxuICAgICAgICAgIGxpc3RlbmVyOiBsaXN0ZW5lcixcbiAgICAgICAgICBwcm94eUxpc3RlbmVyOiBoYW5kbGVFdmVudCxcbiAgICAgICAgfSk7XG4gICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRzW2pdLCBoYW5kbGVFdmVudCwgY2FwdHVyZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIExpdmUgZXZlbnRzXG4gICAgICBmb3IgKGogPSAwOyBqIDwgZXZlbnRzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgIGlmICghZWwuZG9tN0xpdmVMaXN0ZW5lcnMpIHsgZWwuZG9tN0xpdmVMaXN0ZW5lcnMgPSBbXTsgfVxuICAgICAgICBlbC5kb203TGl2ZUxpc3RlbmVycy5wdXNoKHtcbiAgICAgICAgICB0eXBlOiBldmVudFR5cGUsXG4gICAgICAgICAgbGlzdGVuZXI6IGxpc3RlbmVyLFxuICAgICAgICAgIHByb3h5TGlzdGVuZXI6IGhhbmRsZUxpdmVFdmVudCxcbiAgICAgICAgfSk7XG4gICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRzW2pdLCBoYW5kbGVMaXZlRXZlbnQsIGNhcHR1cmUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gdGhpcztcbn1cbmZ1bmN0aW9uIG9mZigpIHtcbiAgdmFyIHRoaXMkMSA9IHRoaXM7XG4gIHZhciBhcmdzID0gW10sIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gIHdoaWxlICggbGVuLS0gKSBhcmdzWyBsZW4gXSA9IGFyZ3VtZW50c1sgbGVuIF07XG5cbiAgdmFyIGV2ZW50VHlwZSA9IGFyZ3NbMF07XG4gIHZhciB0YXJnZXRTZWxlY3RvciA9IGFyZ3NbMV07XG4gIHZhciBsaXN0ZW5lciA9IGFyZ3NbMl07XG4gIHZhciBjYXB0dXJlID0gYXJnc1szXTtcbiAgaWYgKHR5cGVvZiBhcmdzWzFdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgdmFyIGFzc2lnbjtcbiAgICAoYXNzaWduID0gYXJncywgZXZlbnRUeXBlID0gYXNzaWduWzBdLCBsaXN0ZW5lciA9IGFzc2lnblsxXSwgY2FwdHVyZSA9IGFzc2lnblsyXSk7XG4gICAgdGFyZ2V0U2VsZWN0b3IgPSB1bmRlZmluZWQ7XG4gIH1cbiAgaWYgKCFjYXB0dXJlKSB7IGNhcHR1cmUgPSBmYWxzZTsgfVxuXG4gIHZhciBldmVudHMgPSBldmVudFR5cGUuc3BsaXQoJyAnKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBldmVudHMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRoaXMubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgIHZhciBlbCA9IHRoaXMkMVtqXTtcbiAgICAgIGlmICghdGFyZ2V0U2VsZWN0b3IpIHtcbiAgICAgICAgaWYgKGVsLmRvbTdMaXN0ZW5lcnMpIHtcbiAgICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IGVsLmRvbTdMaXN0ZW5lcnMubGVuZ3RoOyBrICs9IDEpIHtcbiAgICAgICAgICAgIGlmIChsaXN0ZW5lcikge1xuICAgICAgICAgICAgICBpZiAoZWwuZG9tN0xpc3RlbmVyc1trXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpIHtcbiAgICAgICAgICAgICAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50c1tpXSwgZWwuZG9tN0xpc3RlbmVyc1trXS5wcm94eUxpc3RlbmVyLCBjYXB0dXJlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChlbC5kb203TGlzdGVuZXJzW2tdLnR5cGUgPT09IGV2ZW50c1tpXSkge1xuICAgICAgICAgICAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50c1tpXSwgZWwuZG9tN0xpc3RlbmVyc1trXS5wcm94eUxpc3RlbmVyLCBjYXB0dXJlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoZWwuZG9tN0xpdmVMaXN0ZW5lcnMpIHtcbiAgICAgICAgZm9yICh2YXIgayQxID0gMDsgayQxIDwgZWwuZG9tN0xpdmVMaXN0ZW5lcnMubGVuZ3RoOyBrJDEgKz0gMSkge1xuICAgICAgICAgIGlmIChsaXN0ZW5lcikge1xuICAgICAgICAgICAgaWYgKGVsLmRvbTdMaXZlTGlzdGVuZXJzW2skMV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSB7XG4gICAgICAgICAgICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnRzW2ldLCBlbC5kb203TGl2ZUxpc3RlbmVyc1trJDFdLnByb3h5TGlzdGVuZXIsIGNhcHR1cmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAoZWwuZG9tN0xpdmVMaXN0ZW5lcnNbayQxXS50eXBlID09PSBldmVudHNbaV0pIHtcbiAgICAgICAgICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnRzW2ldLCBlbC5kb203TGl2ZUxpc3RlbmVyc1trJDFdLnByb3h5TGlzdGVuZXIsIGNhcHR1cmUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gdGhpcztcbn1cbmZ1bmN0aW9uIHRyaWdnZXIoKSB7XG4gIHZhciB0aGlzJDEgPSB0aGlzO1xuICB2YXIgYXJncyA9IFtdLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICB3aGlsZSAoIGxlbi0tICkgYXJnc1sgbGVuIF0gPSBhcmd1bWVudHNbIGxlbiBdO1xuXG4gIHZhciBldmVudHMgPSBhcmdzWzBdLnNwbGl0KCcgJyk7XG4gIHZhciBldmVudERhdGEgPSBhcmdzWzFdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGV2ZW50cy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5sZW5ndGg7IGogKz0gMSkge1xuICAgICAgdmFyIGV2dCA9ICh2b2lkIDApO1xuICAgICAgdHJ5IHtcbiAgICAgICAgZXZ0ID0gbmV3IHdpbmRvdy5DdXN0b21FdmVudChldmVudHNbaV0sIHtcbiAgICAgICAgICBkZXRhaWw6IGV2ZW50RGF0YSxcbiAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBldnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnRXZlbnQnKTtcbiAgICAgICAgZXZ0LmluaXRFdmVudChldmVudHNbaV0sIHRydWUsIHRydWUpO1xuICAgICAgICBldnQuZGV0YWlsID0gZXZlbnREYXRhO1xuICAgICAgfVxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXG4gICAgICB0aGlzJDFbal0uZG9tN0V2ZW50RGF0YSA9IGFyZ3MuZmlsdGVyKGZ1bmN0aW9uIChkYXRhLCBkYXRhSW5kZXgpIHsgcmV0dXJuIGRhdGFJbmRleCA+IDA7IH0pO1xuICAgICAgdGhpcyQxW2pdLmRpc3BhdGNoRXZlbnQoZXZ0KTtcbiAgICAgIHRoaXMkMVtqXS5kb203RXZlbnREYXRhID0gW107XG4gICAgICBkZWxldGUgdGhpcyQxW2pdLmRvbTdFdmVudERhdGE7XG4gICAgfVxuICB9XG4gIHJldHVybiB0aGlzO1xufVxuZnVuY3Rpb24gdHJhbnNpdGlvbkVuZChjYWxsYmFjaykge1xuICB2YXIgZXZlbnRzID0gWyd3ZWJraXRUcmFuc2l0aW9uRW5kJywgJ3RyYW5zaXRpb25lbmQnXTtcbiAgdmFyIGRvbSA9IHRoaXM7XG4gIHZhciBpO1xuICBmdW5jdGlvbiBmaXJlQ2FsbEJhY2soZSkge1xuICAgIC8qIGpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICAgIGlmIChlLnRhcmdldCAhPT0gdGhpcykgeyByZXR1cm47IH1cbiAgICBjYWxsYmFjay5jYWxsKHRoaXMsIGUpO1xuICAgIGZvciAoaSA9IDA7IGkgPCBldmVudHMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIGRvbS5vZmYoZXZlbnRzW2ldLCBmaXJlQ2FsbEJhY2spO1xuICAgIH1cbiAgfVxuICBpZiAoY2FsbGJhY2spIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgZXZlbnRzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBkb20ub24oZXZlbnRzW2ldLCBmaXJlQ2FsbEJhY2spO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdGhpcztcbn1cbmZ1bmN0aW9uIG91dGVyV2lkdGgoaW5jbHVkZU1hcmdpbnMpIHtcbiAgaWYgKHRoaXMubGVuZ3RoID4gMCkge1xuICAgIGlmIChpbmNsdWRlTWFyZ2lucykge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXG4gICAgICB2YXIgc3R5bGVzID0gdGhpcy5zdHlsZXMoKTtcbiAgICAgIHJldHVybiB0aGlzWzBdLm9mZnNldFdpZHRoICsgcGFyc2VGbG9hdChzdHlsZXMuZ2V0UHJvcGVydHlWYWx1ZSgnbWFyZ2luLXJpZ2h0JykpICsgcGFyc2VGbG9hdChzdHlsZXMuZ2V0UHJvcGVydHlWYWx1ZSgnbWFyZ2luLWxlZnQnKSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzWzBdLm9mZnNldFdpZHRoO1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuZnVuY3Rpb24gb3V0ZXJIZWlnaHQoaW5jbHVkZU1hcmdpbnMpIHtcbiAgaWYgKHRoaXMubGVuZ3RoID4gMCkge1xuICAgIGlmIChpbmNsdWRlTWFyZ2lucykge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXG4gICAgICB2YXIgc3R5bGVzID0gdGhpcy5zdHlsZXMoKTtcbiAgICAgIHJldHVybiB0aGlzWzBdLm9mZnNldEhlaWdodCArIHBhcnNlRmxvYXQoc3R5bGVzLmdldFByb3BlcnR5VmFsdWUoJ21hcmdpbi10b3AnKSkgKyBwYXJzZUZsb2F0KHN0eWxlcy5nZXRQcm9wZXJ0eVZhbHVlKCdtYXJnaW4tYm90dG9tJykpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpc1swXS5vZmZzZXRIZWlnaHQ7XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5mdW5jdGlvbiBvZmZzZXQoKSB7XG4gIGlmICh0aGlzLmxlbmd0aCA+IDApIHtcbiAgICB2YXIgZWwgPSB0aGlzWzBdO1xuICAgIHZhciBib3ggPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICB2YXIgYm9keSA9IGRvY3VtZW50LmJvZHk7XG4gICAgdmFyIGNsaWVudFRvcCA9IGVsLmNsaWVudFRvcCB8fCBib2R5LmNsaWVudFRvcCB8fCAwO1xuICAgIHZhciBjbGllbnRMZWZ0ID0gZWwuY2xpZW50TGVmdCB8fCBib2R5LmNsaWVudExlZnQgfHwgMDtcbiAgICB2YXIgc2Nyb2xsVG9wID0gZWwgPT09IHdpbmRvdyA/IHdpbmRvdy5zY3JvbGxZIDogZWwuc2Nyb2xsVG9wO1xuICAgIHZhciBzY3JvbGxMZWZ0ID0gZWwgPT09IHdpbmRvdyA/IHdpbmRvdy5zY3JvbGxYIDogZWwuc2Nyb2xsTGVmdDtcbiAgICByZXR1cm4ge1xuICAgICAgdG9wOiAoYm94LnRvcCArIHNjcm9sbFRvcCkgLSBjbGllbnRUb3AsXG4gICAgICBsZWZ0OiAoYm94LmxlZnQgKyBzY3JvbGxMZWZ0KSAtIGNsaWVudExlZnQsXG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuZnVuY3Rpb24gc3R5bGVzKCkge1xuICBpZiAodGhpc1swXSkgeyByZXR1cm4gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpc1swXSwgbnVsbCk7IH1cbiAgcmV0dXJuIHt9O1xufVxuZnVuY3Rpb24gY3NzKHByb3BzLCB2YWx1ZSkge1xuICB2YXIgdGhpcyQxID0gdGhpcztcblxuICB2YXIgaTtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICBpZiAodHlwZW9mIHByb3BzID09PSAnc3RyaW5nJykge1xuICAgICAgaWYgKHRoaXNbMF0pIHsgcmV0dXJuIHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXNbMF0sIG51bGwpLmdldFByb3BlcnR5VmFsdWUocHJvcHMpOyB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxuICAgICAgICBmb3IgKHZhciBwcm9wIGluIHByb3BzKSB7XG4gICAgICAgICAgdGhpcyQxW2ldLnN0eWxlW3Byb3BdID0gcHJvcHNbcHJvcF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfVxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMiAmJiB0eXBlb2YgcHJvcHMgPT09ICdzdHJpbmcnKSB7XG4gICAgZm9yIChpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIHRoaXMkMVtpXS5zdHlsZVtwcm9wc10gPSB2YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59XG5cbi8vIEl0ZXJhdGUgb3ZlciB0aGUgY29sbGVjdGlvbiBwYXNzaW5nIGVsZW1lbnRzIHRvIGBjYWxsYmFja2BcbmZ1bmN0aW9uIGVhY2goY2FsbGJhY2spIHtcbiAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgLy8gRG9uJ3QgYm90aGVyIGNvbnRpbnVpbmcgd2l0aG91dCBhIGNhbGxiYWNrXG4gIGlmICghY2FsbGJhY2spIHsgcmV0dXJuIHRoaXM7IH1cbiAgLy8gSXRlcmF0ZSBvdmVyIHRoZSBjdXJyZW50IGNvbGxlY3Rpb25cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgLy8gSWYgdGhlIGNhbGxiYWNrIHJldHVybnMgZmFsc2VcbiAgICBpZiAoY2FsbGJhY2suY2FsbCh0aGlzJDFbaV0sIGksIHRoaXMkMVtpXSkgPT09IGZhbHNlKSB7XG4gICAgICAvLyBFbmQgdGhlIGxvb3AgZWFybHlcbiAgICAgIHJldHVybiB0aGlzJDE7XG4gICAgfVxuICB9XG4gIC8vIFJldHVybiBgdGhpc2AgdG8gYWxsb3cgY2hhaW5lZCBET00gb3BlcmF0aW9uc1xuICByZXR1cm4gdGhpcztcbn1cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxuZnVuY3Rpb24gaHRtbChodG1sKSB7XG4gIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gIGlmICh0eXBlb2YgaHRtbCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gdGhpc1swXSA/IHRoaXNbMF0uaW5uZXJIVE1MIDogdW5kZWZpbmVkO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgdGhpcyQxW2ldLmlubmVySFRNTCA9IGh0bWw7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59XG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmVcbmZ1bmN0aW9uIHRleHQodGV4dCkge1xuICB2YXIgdGhpcyQxID0gdGhpcztcblxuICBpZiAodHlwZW9mIHRleHQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKHRoaXNbMF0pIHtcbiAgICAgIHJldHVybiB0aGlzWzBdLnRleHRDb250ZW50LnRyaW0oKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICB0aGlzJDFbaV0udGV4dENvbnRlbnQgPSB0ZXh0O1xuICB9XG4gIHJldHVybiB0aGlzO1xufVxuZnVuY3Rpb24gaXMoc2VsZWN0b3IpIHtcbiAgdmFyIGVsID0gdGhpc1swXTtcbiAgdmFyIGNvbXBhcmVXaXRoO1xuICB2YXIgaTtcbiAgaWYgKCFlbCB8fCB0eXBlb2Ygc2VsZWN0b3IgPT09ICd1bmRlZmluZWQnKSB7IHJldHVybiBmYWxzZTsgfVxuICBpZiAodHlwZW9mIHNlbGVjdG9yID09PSAnc3RyaW5nJykge1xuICAgIGlmIChlbC5tYXRjaGVzKSB7IHJldHVybiBlbC5tYXRjaGVzKHNlbGVjdG9yKTsgfVxuICAgIGVsc2UgaWYgKGVsLndlYmtpdE1hdGNoZXNTZWxlY3RvcikgeyByZXR1cm4gZWwud2Via2l0TWF0Y2hlc1NlbGVjdG9yKHNlbGVjdG9yKTsgfVxuICAgIGVsc2UgaWYgKGVsLm1zTWF0Y2hlc1NlbGVjdG9yKSB7IHJldHVybiBlbC5tc01hdGNoZXNTZWxlY3RvcihzZWxlY3Rvcik7IH1cblxuICAgIGNvbXBhcmVXaXRoID0gJCQxKHNlbGVjdG9yKTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgY29tcGFyZVdpdGgubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIGlmIChjb21wYXJlV2l0aFtpXSA9PT0gZWwpIHsgcmV0dXJuIHRydWU7IH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9IGVsc2UgaWYgKHNlbGVjdG9yID09PSBkb2N1bWVudCkgeyByZXR1cm4gZWwgPT09IGRvY3VtZW50OyB9XG4gIGVsc2UgaWYgKHNlbGVjdG9yID09PSB3aW5kb3cpIHsgcmV0dXJuIGVsID09PSB3aW5kb3c7IH1cblxuICBpZiAoc2VsZWN0b3Iubm9kZVR5cGUgfHwgc2VsZWN0b3IgaW5zdGFuY2VvZiBEb203KSB7XG4gICAgY29tcGFyZVdpdGggPSBzZWxlY3Rvci5ub2RlVHlwZSA/IFtzZWxlY3Rvcl0gOiBzZWxlY3RvcjtcbiAgICBmb3IgKGkgPSAwOyBpIDwgY29tcGFyZVdpdGgubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIGlmIChjb21wYXJlV2l0aFtpXSA9PT0gZWwpIHsgcmV0dXJuIHRydWU7IH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cbmZ1bmN0aW9uIGluZGV4KCkge1xuICB2YXIgY2hpbGQgPSB0aGlzWzBdO1xuICB2YXIgaTtcbiAgaWYgKGNoaWxkKSB7XG4gICAgaSA9IDA7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXG4gICAgd2hpbGUgKChjaGlsZCA9IGNoaWxkLnByZXZpb3VzU2libGluZykgIT09IG51bGwpIHtcbiAgICAgIGlmIChjaGlsZC5ub2RlVHlwZSA9PT0gMSkgeyBpICs9IDE7IH1cbiAgICB9XG4gICAgcmV0dXJuIGk7XG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxuZnVuY3Rpb24gZXEoaW5kZXgpIHtcbiAgaWYgKHR5cGVvZiBpbmRleCA9PT0gJ3VuZGVmaW5lZCcpIHsgcmV0dXJuIHRoaXM7IH1cbiAgdmFyIGxlbmd0aCA9IHRoaXMubGVuZ3RoO1xuICB2YXIgcmV0dXJuSW5kZXg7XG4gIGlmIChpbmRleCA+IGxlbmd0aCAtIDEpIHtcbiAgICByZXR1cm4gbmV3IERvbTcoW10pO1xuICB9XG4gIGlmIChpbmRleCA8IDApIHtcbiAgICByZXR1cm5JbmRleCA9IGxlbmd0aCArIGluZGV4O1xuICAgIGlmIChyZXR1cm5JbmRleCA8IDApIHsgcmV0dXJuIG5ldyBEb203KFtdKTsgfVxuICAgIHJldHVybiBuZXcgRG9tNyhbdGhpc1tyZXR1cm5JbmRleF1dKTtcbiAgfVxuICByZXR1cm4gbmV3IERvbTcoW3RoaXNbaW5kZXhdXSk7XG59XG5mdW5jdGlvbiBhcHBlbmQoKSB7XG4gIHZhciB0aGlzJDEgPSB0aGlzO1xuICB2YXIgYXJncyA9IFtdLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICB3aGlsZSAoIGxlbi0tICkgYXJnc1sgbGVuIF0gPSBhcmd1bWVudHNbIGxlbiBdO1xuXG4gIHZhciBuZXdDaGlsZDtcblxuICBmb3IgKHZhciBrID0gMDsgayA8IGFyZ3MubGVuZ3RoOyBrICs9IDEpIHtcbiAgICBuZXdDaGlsZCA9IGFyZ3Nba107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBpZiAodHlwZW9mIG5ld0NoaWxkID09PSAnc3RyaW5nJykge1xuICAgICAgICB2YXIgdGVtcERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0ZW1wRGl2LmlubmVySFRNTCA9IG5ld0NoaWxkO1xuICAgICAgICB3aGlsZSAodGVtcERpdi5maXJzdENoaWxkKSB7XG4gICAgICAgICAgdGhpcyQxW2ldLmFwcGVuZENoaWxkKHRlbXBEaXYuZmlyc3RDaGlsZCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAobmV3Q2hpbGQgaW5zdGFuY2VvZiBEb203KSB7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbmV3Q2hpbGQubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgICAgICB0aGlzJDFbaV0uYXBwZW5kQ2hpbGQobmV3Q2hpbGRbal0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzJDFbaV0uYXBwZW5kQ2hpbGQobmV3Q2hpbGQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufVxuIGZ1bmN0aW9uIHByZXBlbmQobmV3Q2hpbGQpIHtcbiAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgdmFyIGk7XG4gIHZhciBqO1xuICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIGlmICh0eXBlb2YgbmV3Q2hpbGQgPT09ICdzdHJpbmcnKSB7XG4gICAgICB2YXIgdGVtcERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgdGVtcERpdi5pbm5lckhUTUwgPSBuZXdDaGlsZDtcbiAgICAgIGZvciAoaiA9IHRlbXBEaXYuY2hpbGROb2Rlcy5sZW5ndGggLSAxOyBqID49IDA7IGogLT0gMSkge1xuICAgICAgICB0aGlzJDFbaV0uaW5zZXJ0QmVmb3JlKHRlbXBEaXYuY2hpbGROb2Rlc1tqXSwgdGhpcyQxW2ldLmNoaWxkTm9kZXNbMF0pO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAobmV3Q2hpbGQgaW5zdGFuY2VvZiBEb203KSB7XG4gICAgICBmb3IgKGogPSAwOyBqIDwgbmV3Q2hpbGQubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgICAgdGhpcyQxW2ldLmluc2VydEJlZm9yZShuZXdDaGlsZFtqXSwgdGhpcyQxW2ldLmNoaWxkTm9kZXNbMF0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzJDFbaV0uaW5zZXJ0QmVmb3JlKG5ld0NoaWxkLCB0aGlzJDFbaV0uY2hpbGROb2Rlc1swXSk7XG4gICAgfVxuICB9XG4gIHJldHVybiB0aGlzO1xufVxuIGZ1bmN0aW9uIG5leHQoc2VsZWN0b3IpIHtcbiAgaWYgKHRoaXMubGVuZ3RoID4gMCkge1xuICAgIGlmIChzZWxlY3Rvcikge1xuICAgICAgaWYgKHRoaXNbMF0ubmV4dEVsZW1lbnRTaWJsaW5nICYmICQkMSh0aGlzWzBdLm5leHRFbGVtZW50U2libGluZykuaXMoc2VsZWN0b3IpKSB7XG4gICAgICAgIHJldHVybiBuZXcgRG9tNyhbdGhpc1swXS5uZXh0RWxlbWVudFNpYmxpbmddKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgRG9tNyhbXSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXNbMF0ubmV4dEVsZW1lbnRTaWJsaW5nKSB7IHJldHVybiBuZXcgRG9tNyhbdGhpc1swXS5uZXh0RWxlbWVudFNpYmxpbmddKTsgfVxuICAgIHJldHVybiBuZXcgRG9tNyhbXSk7XG4gIH1cbiAgcmV0dXJuIG5ldyBEb203KFtdKTtcbn1cbmZ1bmN0aW9uIG5leHRBbGwoc2VsZWN0b3IpIHtcbiAgdmFyIG5leHRFbHMgPSBbXTtcbiAgdmFyIGVsID0gdGhpc1swXTtcbiAgaWYgKCFlbCkgeyByZXR1cm4gbmV3IERvbTcoW10pOyB9XG4gIHdoaWxlIChlbC5uZXh0RWxlbWVudFNpYmxpbmcpIHtcbiAgICB2YXIgbmV4dCA9IGVsLm5leHRFbGVtZW50U2libGluZzsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgIGlmIChzZWxlY3Rvcikge1xuICAgICAgaWYgKCQkMShuZXh0KS5pcyhzZWxlY3RvcikpIHsgbmV4dEVscy5wdXNoKG5leHQpOyB9XG4gICAgfSBlbHNlIHsgbmV4dEVscy5wdXNoKG5leHQpOyB9XG4gICAgZWwgPSBuZXh0O1xuICB9XG4gIHJldHVybiBuZXcgRG9tNyhuZXh0RWxzKTtcbn1cbmZ1bmN0aW9uIHByZXYoc2VsZWN0b3IpIHtcbiAgaWYgKHRoaXMubGVuZ3RoID4gMCkge1xuICAgIHZhciBlbCA9IHRoaXNbMF07XG4gICAgaWYgKHNlbGVjdG9yKSB7XG4gICAgICBpZiAoZWwucHJldmlvdXNFbGVtZW50U2libGluZyAmJiAkJDEoZWwucHJldmlvdXNFbGVtZW50U2libGluZykuaXMoc2VsZWN0b3IpKSB7XG4gICAgICAgIHJldHVybiBuZXcgRG9tNyhbZWwucHJldmlvdXNFbGVtZW50U2libGluZ10pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBEb203KFtdKTtcbiAgICB9XG5cbiAgICBpZiAoZWwucHJldmlvdXNFbGVtZW50U2libGluZykgeyByZXR1cm4gbmV3IERvbTcoW2VsLnByZXZpb3VzRWxlbWVudFNpYmxpbmddKTsgfVxuICAgIHJldHVybiBuZXcgRG9tNyhbXSk7XG4gIH1cbiAgcmV0dXJuIG5ldyBEb203KFtdKTtcbn1cbmZ1bmN0aW9uIHByZXZBbGwoc2VsZWN0b3IpIHtcbiAgdmFyIHByZXZFbHMgPSBbXTtcbiAgdmFyIGVsID0gdGhpc1swXTtcbiAgaWYgKCFlbCkgeyByZXR1cm4gbmV3IERvbTcoW10pOyB9XG4gIHdoaWxlIChlbC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nKSB7XG4gICAgdmFyIHByZXYgPSBlbC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgaWYgKHNlbGVjdG9yKSB7XG4gICAgICBpZiAoJCQxKHByZXYpLmlzKHNlbGVjdG9yKSkgeyBwcmV2RWxzLnB1c2gocHJldik7IH1cbiAgICB9IGVsc2UgeyBwcmV2RWxzLnB1c2gocHJldik7IH1cbiAgICBlbCA9IHByZXY7XG4gIH1cbiAgcmV0dXJuIG5ldyBEb203KHByZXZFbHMpO1xufVxuZnVuY3Rpb24gcGFyZW50KHNlbGVjdG9yKSB7XG4gIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gIHZhciBwYXJlbnRzID0gW107IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgaWYgKHRoaXMkMVtpXS5wYXJlbnROb2RlICE9PSBudWxsKSB7XG4gICAgICBpZiAoc2VsZWN0b3IpIHtcbiAgICAgICAgaWYgKCQkMSh0aGlzJDFbaV0ucGFyZW50Tm9kZSkuaXMoc2VsZWN0b3IpKSB7IHBhcmVudHMucHVzaCh0aGlzJDFbaV0ucGFyZW50Tm9kZSk7IH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcmVudHMucHVzaCh0aGlzJDFbaV0ucGFyZW50Tm9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiAkJDEodW5pcXVlKHBhcmVudHMpKTtcbn1cbmZ1bmN0aW9uIHBhcmVudHMoc2VsZWN0b3IpIHtcbiAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgdmFyIHBhcmVudHMgPSBbXTsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICB2YXIgcGFyZW50ID0gdGhpcyQxW2ldLnBhcmVudE5vZGU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICB3aGlsZSAocGFyZW50KSB7XG4gICAgICBpZiAoc2VsZWN0b3IpIHtcbiAgICAgICAgaWYgKCQkMShwYXJlbnQpLmlzKHNlbGVjdG9yKSkgeyBwYXJlbnRzLnB1c2gocGFyZW50KTsgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFyZW50cy5wdXNoKHBhcmVudCk7XG4gICAgICB9XG4gICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50Tm9kZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuICQkMSh1bmlxdWUocGFyZW50cykpO1xufVxuZnVuY3Rpb24gY2xvc2VzdChzZWxlY3Rvcikge1xuICB2YXIgY2xvc2VzdCA9IHRoaXM7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgaWYgKHR5cGVvZiBzZWxlY3RvciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gbmV3IERvbTcoW10pO1xuICB9XG4gIGlmICghY2xvc2VzdC5pcyhzZWxlY3RvcikpIHtcbiAgICBjbG9zZXN0ID0gY2xvc2VzdC5wYXJlbnRzKHNlbGVjdG9yKS5lcSgwKTtcbiAgfVxuICByZXR1cm4gY2xvc2VzdDtcbn1cbmZ1bmN0aW9uIGZpbmQoc2VsZWN0b3IpIHtcbiAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgdmFyIGZvdW5kRWxlbWVudHMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgdmFyIGZvdW5kID0gdGhpcyQxW2ldLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgZm91bmQubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgIGZvdW5kRWxlbWVudHMucHVzaChmb3VuZFtqXSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBuZXcgRG9tNyhmb3VuZEVsZW1lbnRzKTtcbn1cbmZ1bmN0aW9uIGNoaWxkcmVuKHNlbGVjdG9yKSB7XG4gIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gIHZhciBjaGlsZHJlbiA9IFtdOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIHZhciBjaGlsZE5vZGVzID0gdGhpcyQxW2ldLmNoaWxkTm9kZXM7XG5cbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IGNoaWxkTm9kZXMubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgIGlmICghc2VsZWN0b3IpIHtcbiAgICAgICAgaWYgKGNoaWxkTm9kZXNbal0ubm9kZVR5cGUgPT09IDEpIHsgY2hpbGRyZW4ucHVzaChjaGlsZE5vZGVzW2pdKTsgfVxuICAgICAgfSBlbHNlIGlmIChjaGlsZE5vZGVzW2pdLm5vZGVUeXBlID09PSAxICYmICQkMShjaGlsZE5vZGVzW2pdKS5pcyhzZWxlY3RvcikpIHtcbiAgICAgICAgY2hpbGRyZW4ucHVzaChjaGlsZE5vZGVzW2pdKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG5ldyBEb203KHVuaXF1ZShjaGlsZHJlbikpO1xufVxuZnVuY3Rpb24gcmVtb3ZlKCkge1xuICB2YXIgdGhpcyQxID0gdGhpcztcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICBpZiAodGhpcyQxW2ldLnBhcmVudE5vZGUpIHsgdGhpcyQxW2ldLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcyQxW2ldKTsgfVxuICB9XG4gIHJldHVybiB0aGlzO1xufVxuZnVuY3Rpb24gYWRkKCkge1xuICB2YXIgYXJncyA9IFtdLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICB3aGlsZSAoIGxlbi0tICkgYXJnc1sgbGVuIF0gPSBhcmd1bWVudHNbIGxlbiBdO1xuXG4gIHZhciBkb20gPSB0aGlzO1xuICB2YXIgaTtcbiAgdmFyIGo7XG4gIGZvciAoaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgdmFyIHRvQWRkID0gJCQxKGFyZ3NbaV0pO1xuICAgIGZvciAoaiA9IDA7IGogPCB0b0FkZC5sZW5ndGg7IGogKz0gMSkge1xuICAgICAgZG9tW2RvbS5sZW5ndGhdID0gdG9BZGRbal07XG4gICAgICBkb20ubGVuZ3RoICs9IDE7XG4gICAgfVxuICB9XG4gIHJldHVybiBkb207XG59XG52YXIgbm9UcmlnZ2VyID0gKCdyZXNpemUgc2Nyb2xsJykuc3BsaXQoJyAnKTtcblxudmFyIE1ldGhvZHMgPSB7XG4gIGFkZENsYXNzOiBhZGRDbGFzcyxcbiAgcmVtb3ZlQ2xhc3M6IHJlbW92ZUNsYXNzLFxuICBoYXNDbGFzczogaGFzQ2xhc3MsXG4gIHRvZ2dsZUNsYXNzOiB0b2dnbGVDbGFzcyxcbiAgYXR0cjogYXR0cixcbiAgcmVtb3ZlQXR0cjogcmVtb3ZlQXR0cixcbiAgZGF0YTogZGF0YSxcbiAgdHJhbnNmb3JtOiB0cmFuc2Zvcm0sXG4gIHRyYW5zaXRpb246IHRyYW5zaXRpb24sXG4gIG9uOiBvbixcbiAgb2ZmOiBvZmYsXG4gIHRyaWdnZXI6IHRyaWdnZXIsXG4gIHRyYW5zaXRpb25FbmQ6IHRyYW5zaXRpb25FbmQsXG4gIG91dGVyV2lkdGg6IG91dGVyV2lkdGgsXG4gIG91dGVySGVpZ2h0OiBvdXRlckhlaWdodCxcbiAgb2Zmc2V0OiBvZmZzZXQsXG4gIGNzczogY3NzLFxuICBlYWNoOiBlYWNoLFxuICBodG1sOiBodG1sLFxuICB0ZXh0OiB0ZXh0LFxuICBpczogaXMsXG4gIGluZGV4OiBpbmRleCxcbiAgZXE6IGVxLFxuICBhcHBlbmQ6IGFwcGVuZCxcbiAgcHJlcGVuZDogcHJlcGVuZCxcbiAgbmV4dDogbmV4dCxcbiAgbmV4dEFsbDogbmV4dEFsbCxcbiAgcHJldjogcHJldixcbiAgcHJldkFsbDogcHJldkFsbCxcbiAgcGFyZW50OiBwYXJlbnQsXG4gIHBhcmVudHM6IHBhcmVudHMsXG4gIGNsb3Nlc3Q6IGNsb3Nlc3QsXG4gIGZpbmQ6IGZpbmQsXG4gIGNoaWxkcmVuOiBjaGlsZHJlbixcbiAgcmVtb3ZlOiByZW1vdmUsXG4gIGFkZDogYWRkLFxuICBzdHlsZXM6IHN0eWxlcyxcbn07XG5cbk9iamVjdC5rZXlzKE1ldGhvZHMpLmZvckVhY2goZnVuY3Rpb24gKG1ldGhvZE5hbWUpIHtcbiAgJCQxLmZuW21ldGhvZE5hbWVdID0gTWV0aG9kc1ttZXRob2ROYW1lXTtcbn0pO1xuXG52YXIgVXRpbHMgPSB7XG4gIGRlbGV0ZVByb3BzOiBmdW5jdGlvbiBkZWxldGVQcm9wcyhvYmopIHtcbiAgICB2YXIgb2JqZWN0ID0gb2JqO1xuICAgIE9iamVjdC5rZXlzKG9iamVjdCkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICB0cnkge1xuICAgICAgICBvYmplY3Rba2V5XSA9IG51bGw7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIG5vIGdldHRlciBmb3Igb2JqZWN0XG4gICAgICB9XG4gICAgICB0cnkge1xuICAgICAgICBkZWxldGUgb2JqZWN0W2tleV07XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIHNvbWV0aGluZyBnb3Qgd3JvbmdcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgbmV4dFRpY2s6IGZ1bmN0aW9uIG5leHRUaWNrKGNhbGxiYWNrLCBkZWxheSkge1xuICAgIGlmICggZGVsYXkgPT09IHZvaWQgMCApIGRlbGF5ID0gMDtcblxuICAgIHJldHVybiBzZXRUaW1lb3V0KGNhbGxiYWNrLCBkZWxheSk7XG4gIH0sXG4gIG5vdzogZnVuY3Rpb24gbm93KCkge1xuICAgIHJldHVybiBEYXRlLm5vdygpO1xuICB9LFxuICBnZXRUcmFuc2xhdGU6IGZ1bmN0aW9uIGdldFRyYW5zbGF0ZShlbCwgYXhpcykge1xuICAgIGlmICggYXhpcyA9PT0gdm9pZCAwICkgYXhpcyA9ICd4JztcblxuICAgIHZhciBtYXRyaXg7XG4gICAgdmFyIGN1clRyYW5zZm9ybTtcbiAgICB2YXIgdHJhbnNmb3JtTWF0cml4O1xuXG4gICAgdmFyIGN1clN0eWxlID0gd2luLmdldENvbXB1dGVkU3R5bGUoZWwsIG51bGwpO1xuXG4gICAgaWYgKHdpbi5XZWJLaXRDU1NNYXRyaXgpIHtcbiAgICAgIGN1clRyYW5zZm9ybSA9IGN1clN0eWxlLnRyYW5zZm9ybSB8fCBjdXJTdHlsZS53ZWJraXRUcmFuc2Zvcm07XG4gICAgICBpZiAoY3VyVHJhbnNmb3JtLnNwbGl0KCcsJykubGVuZ3RoID4gNikge1xuICAgICAgICBjdXJUcmFuc2Zvcm0gPSBjdXJUcmFuc2Zvcm0uc3BsaXQoJywgJykubWFwKGZ1bmN0aW9uIChhKSB7IHJldHVybiBhLnJlcGxhY2UoJywnLCAnLicpOyB9KS5qb2luKCcsICcpO1xuICAgICAgfVxuICAgICAgLy8gU29tZSBvbGQgdmVyc2lvbnMgb2YgV2Via2l0IGNob2tlIHdoZW4gJ25vbmUnIGlzIHBhc3NlZDsgcGFzc1xuICAgICAgLy8gZW1wdHkgc3RyaW5nIGluc3RlYWQgaW4gdGhpcyBjYXNlXG4gICAgICB0cmFuc2Zvcm1NYXRyaXggPSBuZXcgd2luLldlYktpdENTU01hdHJpeChjdXJUcmFuc2Zvcm0gPT09ICdub25lJyA/ICcnIDogY3VyVHJhbnNmb3JtKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdHJhbnNmb3JtTWF0cml4ID0gY3VyU3R5bGUuTW96VHJhbnNmb3JtIHx8IGN1clN0eWxlLk9UcmFuc2Zvcm0gfHwgY3VyU3R5bGUuTXNUcmFuc2Zvcm0gfHwgY3VyU3R5bGUubXNUcmFuc2Zvcm0gfHwgY3VyU3R5bGUudHJhbnNmb3JtIHx8IGN1clN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ3RyYW5zZm9ybScpLnJlcGxhY2UoJ3RyYW5zbGF0ZSgnLCAnbWF0cml4KDEsIDAsIDAsIDEsJyk7XG4gICAgICBtYXRyaXggPSB0cmFuc2Zvcm1NYXRyaXgudG9TdHJpbmcoKS5zcGxpdCgnLCcpO1xuICAgIH1cblxuICAgIGlmIChheGlzID09PSAneCcpIHtcbiAgICAgIC8vIExhdGVzdCBDaHJvbWUgYW5kIHdlYmtpdHMgRml4XG4gICAgICBpZiAod2luLldlYktpdENTU01hdHJpeCkgeyBjdXJUcmFuc2Zvcm0gPSB0cmFuc2Zvcm1NYXRyaXgubTQxOyB9XG4gICAgICAvLyBDcmF6eSBJRTEwIE1hdHJpeFxuICAgICAgZWxzZSBpZiAobWF0cml4Lmxlbmd0aCA9PT0gMTYpIHsgY3VyVHJhbnNmb3JtID0gcGFyc2VGbG9hdChtYXRyaXhbMTJdKTsgfVxuICAgICAgLy8gTm9ybWFsIEJyb3dzZXJzXG4gICAgICBlbHNlIHsgY3VyVHJhbnNmb3JtID0gcGFyc2VGbG9hdChtYXRyaXhbNF0pOyB9XG4gICAgfVxuICAgIGlmIChheGlzID09PSAneScpIHtcbiAgICAgIC8vIExhdGVzdCBDaHJvbWUgYW5kIHdlYmtpdHMgRml4XG4gICAgICBpZiAod2luLldlYktpdENTU01hdHJpeCkgeyBjdXJUcmFuc2Zvcm0gPSB0cmFuc2Zvcm1NYXRyaXgubTQyOyB9XG4gICAgICAvLyBDcmF6eSBJRTEwIE1hdHJpeFxuICAgICAgZWxzZSBpZiAobWF0cml4Lmxlbmd0aCA9PT0gMTYpIHsgY3VyVHJhbnNmb3JtID0gcGFyc2VGbG9hdChtYXRyaXhbMTNdKTsgfVxuICAgICAgLy8gTm9ybWFsIEJyb3dzZXJzXG4gICAgICBlbHNlIHsgY3VyVHJhbnNmb3JtID0gcGFyc2VGbG9hdChtYXRyaXhbNV0pOyB9XG4gICAgfVxuICAgIHJldHVybiBjdXJUcmFuc2Zvcm0gfHwgMDtcbiAgfSxcbiAgcGFyc2VVcmxRdWVyeTogZnVuY3Rpb24gcGFyc2VVcmxRdWVyeSh1cmwpIHtcbiAgICB2YXIgcXVlcnkgPSB7fTtcbiAgICB2YXIgdXJsVG9QYXJzZSA9IHVybCB8fCB3aW4ubG9jYXRpb24uaHJlZjtcbiAgICB2YXIgaTtcbiAgICB2YXIgcGFyYW1zO1xuICAgIHZhciBwYXJhbTtcbiAgICB2YXIgbGVuZ3RoO1xuICAgIGlmICh0eXBlb2YgdXJsVG9QYXJzZSA9PT0gJ3N0cmluZycgJiYgdXJsVG9QYXJzZS5sZW5ndGgpIHtcbiAgICAgIHVybFRvUGFyc2UgPSB1cmxUb1BhcnNlLmluZGV4T2YoJz8nKSA+IC0xID8gdXJsVG9QYXJzZS5yZXBsYWNlKC9cXFMqXFw/LywgJycpIDogJyc7XG4gICAgICBwYXJhbXMgPSB1cmxUb1BhcnNlLnNwbGl0KCcmJykuZmlsdGVyKGZ1bmN0aW9uIChwYXJhbXNQYXJ0KSB7IHJldHVybiBwYXJhbXNQYXJ0ICE9PSAnJzsgfSk7XG4gICAgICBsZW5ndGggPSBwYXJhbXMubGVuZ3RoO1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgcGFyYW0gPSBwYXJhbXNbaV0ucmVwbGFjZSgvI1xcUysvZywgJycpLnNwbGl0KCc9Jyk7XG4gICAgICAgIHF1ZXJ5W2RlY29kZVVSSUNvbXBvbmVudChwYXJhbVswXSldID0gdHlwZW9mIHBhcmFtWzFdID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IGRlY29kZVVSSUNvbXBvbmVudChwYXJhbVsxXSkgfHwgJyc7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBxdWVyeTtcbiAgfSxcbiAgaXNPYmplY3Q6IGZ1bmN0aW9uIGlzT2JqZWN0KG8pIHtcbiAgICByZXR1cm4gdHlwZW9mIG8gPT09ICdvYmplY3QnICYmIG8gIT09IG51bGwgJiYgby5jb25zdHJ1Y3RvciAmJiBvLmNvbnN0cnVjdG9yID09PSBPYmplY3Q7XG4gIH0sXG4gIGV4dGVuZDogZnVuY3Rpb24gZXh0ZW5kKCkge1xuICAgIHZhciBhcmdzID0gW10sIGxlbiQxID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICB3aGlsZSAoIGxlbiQxLS0gKSBhcmdzWyBsZW4kMSBdID0gYXJndW1lbnRzWyBsZW4kMSBdO1xuXG4gICAgdmFyIHRvID0gT2JqZWN0KGFyZ3NbMF0pO1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJncy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgdmFyIG5leHRTb3VyY2UgPSBhcmdzW2ldO1xuICAgICAgaWYgKG5leHRTb3VyY2UgIT09IHVuZGVmaW5lZCAmJiBuZXh0U291cmNlICE9PSBudWxsKSB7XG4gICAgICAgIHZhciBrZXlzQXJyYXkgPSBPYmplY3Qua2V5cyhPYmplY3QobmV4dFNvdXJjZSkpO1xuICAgICAgICBmb3IgKHZhciBuZXh0SW5kZXggPSAwLCBsZW4gPSBrZXlzQXJyYXkubGVuZ3RoOyBuZXh0SW5kZXggPCBsZW47IG5leHRJbmRleCArPSAxKSB7XG4gICAgICAgICAgdmFyIG5leHRLZXkgPSBrZXlzQXJyYXlbbmV4dEluZGV4XTtcbiAgICAgICAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobmV4dFNvdXJjZSwgbmV4dEtleSk7XG4gICAgICAgICAgaWYgKGRlc2MgIT09IHVuZGVmaW5lZCAmJiBkZXNjLmVudW1lcmFibGUpIHtcbiAgICAgICAgICAgIGlmIChVdGlscy5pc09iamVjdCh0b1tuZXh0S2V5XSkgJiYgVXRpbHMuaXNPYmplY3QobmV4dFNvdXJjZVtuZXh0S2V5XSkpIHtcbiAgICAgICAgICAgICAgVXRpbHMuZXh0ZW5kKHRvW25leHRLZXldLCBuZXh0U291cmNlW25leHRLZXldKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIVV0aWxzLmlzT2JqZWN0KHRvW25leHRLZXldKSAmJiBVdGlscy5pc09iamVjdChuZXh0U291cmNlW25leHRLZXldKSkge1xuICAgICAgICAgICAgICB0b1tuZXh0S2V5XSA9IHt9O1xuICAgICAgICAgICAgICBVdGlscy5leHRlbmQodG9bbmV4dEtleV0sIG5leHRTb3VyY2VbbmV4dEtleV0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdG9bbmV4dEtleV0gPSBuZXh0U291cmNlW25leHRLZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdG87XG4gIH0sXG59O1xuXG52YXIgZDtcbmlmICh0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnKSB7XG4gIGQgPSB7XG4gICAgYWRkRXZlbnRMaXN0ZW5lcjogZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcigpIHt9LFxuICAgIHJlbW92ZUV2ZW50TGlzdGVuZXI6IGZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXIoKSB7fSxcbiAgICBhY3RpdmVFbGVtZW50OiB7XG4gICAgICBibHVyOiBmdW5jdGlvbiBibHVyKCkge30sXG4gICAgICBub2RlTmFtZTogJycsXG4gICAgfSxcbiAgICBxdWVyeVNlbGVjdG9yOiBmdW5jdGlvbiBxdWVyeVNlbGVjdG9yKCkge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH0sXG4gICAgcXVlcnlTZWxlY3RvckFsbDogZnVuY3Rpb24gcXVlcnlTZWxlY3RvckFsbCgpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9LFxuICAgIGNyZWF0ZUVsZW1lbnQ6IGZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdHlsZToge30sXG4gICAgICAgIHNldEF0dHJpYnV0ZTogZnVuY3Rpb24gc2V0QXR0cmlidXRlKCkge30sXG4gICAgICAgIGdldEVsZW1lbnRzQnlUYWdOYW1lOiBmdW5jdGlvbiBnZXRFbGVtZW50c0J5VGFnTmFtZSgpIHtcbiAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgIH0sXG4gICAgbG9jYXRpb246IHsgaGFzaDogJycgfSxcbiAgfTtcbn0gZWxzZSB7XG4gIGQgPSBkb2N1bWVudDtcbn1cblxudmFyIGRvYyA9IGQ7XG5cbnZhciBTdXBwb3J0ID0gKGZ1bmN0aW9uIFN1cHBvcnQoKSB7XG4gIHJldHVybiB7XG4gICAgdG91Y2g6ICh3aW4uTW9kZXJuaXpyICYmIHdpbi5Nb2Rlcm5penIudG91Y2ggPT09IHRydWUpIHx8IChmdW5jdGlvbiBjaGVja1RvdWNoKCkge1xuICAgICAgcmV0dXJuICEhKCgnb250b3VjaHN0YXJ0JyBpbiB3aW4pIHx8ICh3aW4uRG9jdW1lbnRUb3VjaCAmJiBkb2MgaW5zdGFuY2VvZiB3aW4uRG9jdW1lbnRUb3VjaCkpO1xuICAgIH0oKSksXG5cbiAgICB0cmFuc2Zvcm1zM2Q6ICh3aW4uTW9kZXJuaXpyICYmIHdpbi5Nb2Rlcm5penIuY3NzdHJhbnNmb3JtczNkID09PSB0cnVlKSB8fCAoZnVuY3Rpb24gY2hlY2tUcmFuc2Zvcm1zM2QoKSB7XG4gICAgICB2YXIgZGl2ID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpLnN0eWxlO1xuICAgICAgcmV0dXJuICgnd2Via2l0UGVyc3BlY3RpdmUnIGluIGRpdiB8fCAnTW96UGVyc3BlY3RpdmUnIGluIGRpdiB8fCAnT1BlcnNwZWN0aXZlJyBpbiBkaXYgfHwgJ01zUGVyc3BlY3RpdmUnIGluIGRpdiB8fCAncGVyc3BlY3RpdmUnIGluIGRpdik7XG4gICAgfSgpKSxcblxuICAgIGZsZXhib3g6IChmdW5jdGlvbiBjaGVja0ZsZXhib3goKSB7XG4gICAgICB2YXIgZGl2ID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpLnN0eWxlO1xuICAgICAgdmFyIHN0eWxlcyA9ICgnYWxpZ25JdGVtcyB3ZWJraXRBbGlnbkl0ZW1zIHdlYmtpdEJveEFsaWduIG1zRmxleEFsaWduIG1vekJveEFsaWduIHdlYmtpdEZsZXhEaXJlY3Rpb24gbXNGbGV4RGlyZWN0aW9uIG1vekJveERpcmVjdGlvbiBtb3pCb3hPcmllbnQgd2Via2l0Qm94RGlyZWN0aW9uIHdlYmtpdEJveE9yaWVudCcpLnNwbGl0KCcgJyk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0eWxlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBpZiAoc3R5bGVzW2ldIGluIGRpdikgeyByZXR1cm4gdHJ1ZTsgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0oKSksXG5cbiAgICBvYnNlcnZlcjogKGZ1bmN0aW9uIGNoZWNrT2JzZXJ2ZXIoKSB7XG4gICAgICByZXR1cm4gKCdNdXRhdGlvbk9ic2VydmVyJyBpbiB3aW4gfHwgJ1dlYmtpdE11dGF0aW9uT2JzZXJ2ZXInIGluIHdpbik7XG4gICAgfSgpKSxcblxuICAgIHBhc3NpdmVMaXN0ZW5lcjogKGZ1bmN0aW9uIGNoZWNrUGFzc2l2ZUxpc3RlbmVyKCkge1xuICAgICAgdmFyIHN1cHBvcnRzUGFzc2l2ZSA9IGZhbHNlO1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIG9wdHMgPSBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICdwYXNzaXZlJywge1xuICAgICAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICAgICAgc3VwcG9ydHNQYXNzaXZlID0gdHJ1ZTtcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgICAgd2luLmFkZEV2ZW50TGlzdGVuZXIoJ3Rlc3RQYXNzaXZlTGlzdGVuZXInLCBudWxsLCBvcHRzKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gTm8gc3VwcG9ydFxuICAgICAgfVxuICAgICAgcmV0dXJuIHN1cHBvcnRzUGFzc2l2ZTtcbiAgICB9KCkpLFxuXG4gICAgZ2VzdHVyZXM6IChmdW5jdGlvbiBjaGVja0dlc3R1cmVzKCkge1xuICAgICAgcmV0dXJuICdvbmdlc3R1cmVzdGFydCcgaW4gd2luO1xuICAgIH0oKSksXG4gIH07XG59KCkpO1xuXG52YXIgU3dpcGVyQ2xhc3MgPSBmdW5jdGlvbiBTd2lwZXJDbGFzcyhwYXJhbXMpIHtcbiAgaWYgKCBwYXJhbXMgPT09IHZvaWQgMCApIHBhcmFtcyA9IHt9O1xuXG4gIHZhciBzZWxmID0gdGhpcztcbiAgc2VsZi5wYXJhbXMgPSBwYXJhbXM7XG5cbiAgLy8gRXZlbnRzXG4gIHNlbGYuZXZlbnRzTGlzdGVuZXJzID0ge307XG5cbiAgaWYgKHNlbGYucGFyYW1zICYmIHNlbGYucGFyYW1zLm9uKSB7XG4gICAgT2JqZWN0LmtleXMoc2VsZi5wYXJhbXMub24pLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuICAgICAgc2VsZi5vbihldmVudE5hbWUsIHNlbGYucGFyYW1zLm9uW2V2ZW50TmFtZV0pO1xuICAgIH0pO1xuICB9XG59O1xuXG52YXIgc3RhdGljQWNjZXNzb3JzID0geyBjb21wb25lbnRzOiB7fSB9O1xuU3dpcGVyQ2xhc3MucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gb24gKGV2ZW50cywgaGFuZGxlcikge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIGlmICh0eXBlb2YgaGFuZGxlciAhPT0gJ2Z1bmN0aW9uJykgeyByZXR1cm4gc2VsZjsgfVxuICBldmVudHMuc3BsaXQoJyAnKS5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCkge1xuICAgIGlmICghc2VsZi5ldmVudHNMaXN0ZW5lcnNbZXZlbnRdKSB7IHNlbGYuZXZlbnRzTGlzdGVuZXJzW2V2ZW50XSA9IFtdOyB9XG4gICAgc2VsZi5ldmVudHNMaXN0ZW5lcnNbZXZlbnRdLnB1c2goaGFuZGxlcik7XG4gIH0pO1xuICByZXR1cm4gc2VsZjtcbn07XG5Td2lwZXJDbGFzcy5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uIG9uY2UgKGV2ZW50cywgaGFuZGxlcikge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIGlmICh0eXBlb2YgaGFuZGxlciAhPT0gJ2Z1bmN0aW9uJykgeyByZXR1cm4gc2VsZjsgfVxuICBmdW5jdGlvbiBvbmNlSGFuZGxlcigpIHtcbiAgICAgIHZhciBhcmdzID0gW10sIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICB3aGlsZSAoIGxlbi0tICkgYXJnc1sgbGVuIF0gPSBhcmd1bWVudHNbIGxlbiBdO1xuXG4gICAgaGFuZGxlci5hcHBseShzZWxmLCBhcmdzKTtcbiAgICBzZWxmLm9mZihldmVudHMsIG9uY2VIYW5kbGVyKTtcbiAgfVxuICByZXR1cm4gc2VsZi5vbihldmVudHMsIG9uY2VIYW5kbGVyKTtcbn07XG5Td2lwZXJDbGFzcy5wcm90b3R5cGUub2ZmID0gZnVuY3Rpb24gb2ZmIChldmVudHMsIGhhbmRsZXIpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBldmVudHMuc3BsaXQoJyAnKS5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCkge1xuICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHNlbGYuZXZlbnRzTGlzdGVuZXJzW2V2ZW50XSA9IFtdO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZWxmLmV2ZW50c0xpc3RlbmVyc1tldmVudF0uZm9yRWFjaChmdW5jdGlvbiAoZXZlbnRIYW5kbGVyLCBpbmRleCkge1xuICAgICAgICBpZiAoZXZlbnRIYW5kbGVyID09PSBoYW5kbGVyKSB7XG4gICAgICAgICAgc2VsZi5ldmVudHNMaXN0ZW5lcnNbZXZlbnRdLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBzZWxmO1xufTtcblN3aXBlckNsYXNzLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gZW1pdCAoKSB7XG4gICAgdmFyIGFyZ3MgPSBbXSwgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICB3aGlsZSAoIGxlbi0tICkgYXJnc1sgbGVuIF0gPSBhcmd1bWVudHNbIGxlbiBdO1xuXG4gIHZhciBzZWxmID0gdGhpcztcbiAgaWYgKCFzZWxmLmV2ZW50c0xpc3RlbmVycykgeyByZXR1cm4gc2VsZjsgfVxuICB2YXIgZXZlbnRzO1xuICB2YXIgZGF0YTtcbiAgdmFyIGNvbnRleHQ7XG4gIGlmICh0eXBlb2YgYXJnc1swXSA9PT0gJ3N0cmluZycgfHwgQXJyYXkuaXNBcnJheShhcmdzWzBdKSkge1xuICAgIGV2ZW50cyA9IGFyZ3NbMF07XG4gICAgZGF0YSA9IGFyZ3Muc2xpY2UoMSwgYXJncy5sZW5ndGgpO1xuICAgIGNvbnRleHQgPSBzZWxmO1xuICB9IGVsc2Uge1xuICAgIGV2ZW50cyA9IGFyZ3NbMF0uZXZlbnRzO1xuICAgIGRhdGEgPSBhcmdzWzBdLmRhdGE7XG4gICAgY29udGV4dCA9IGFyZ3NbMF0uY29udGV4dCB8fCBzZWxmO1xuICB9XG4gIHZhciBldmVudHNBcnJheSA9IEFycmF5LmlzQXJyYXkoZXZlbnRzKSA/IGV2ZW50cyA6IGV2ZW50cy5zcGxpdCgnICcpO1xuICBldmVudHNBcnJheS5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCkge1xuICAgIGlmIChzZWxmLmV2ZW50c0xpc3RlbmVyc1tldmVudF0pIHtcbiAgICAgIHZhciBoYW5kbGVycyA9IFtdO1xuICAgICAgc2VsZi5ldmVudHNMaXN0ZW5lcnNbZXZlbnRdLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50SGFuZGxlcikge1xuICAgICAgICBoYW5kbGVycy5wdXNoKGV2ZW50SGFuZGxlcik7XG4gICAgICB9KTtcbiAgICAgIGhhbmRsZXJzLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50SGFuZGxlcikge1xuICAgICAgICBldmVudEhhbmRsZXIuYXBwbHkoY29udGV4dCwgZGF0YSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gc2VsZjtcbn07XG5Td2lwZXJDbGFzcy5wcm90b3R5cGUudXNlTW9kdWxlc1BhcmFtcyA9IGZ1bmN0aW9uIHVzZU1vZHVsZXNQYXJhbXMgKGluc3RhbmNlUGFyYW1zKSB7XG4gIHZhciBpbnN0YW5jZSA9IHRoaXM7XG4gIGlmICghaW5zdGFuY2UubW9kdWxlcykgeyByZXR1cm47IH1cbiAgT2JqZWN0LmtleXMoaW5zdGFuY2UubW9kdWxlcykuZm9yRWFjaChmdW5jdGlvbiAobW9kdWxlTmFtZSkge1xuICAgIHZhciBtb2R1bGUgPSBpbnN0YW5jZS5tb2R1bGVzW21vZHVsZU5hbWVdO1xuICAgIC8vIEV4dGVuZCBwYXJhbXNcbiAgICBpZiAobW9kdWxlLnBhcmFtcykge1xuICAgICAgVXRpbHMuZXh0ZW5kKGluc3RhbmNlUGFyYW1zLCBtb2R1bGUucGFyYW1zKTtcbiAgICB9XG4gIH0pO1xufTtcblN3aXBlckNsYXNzLnByb3RvdHlwZS51c2VNb2R1bGVzID0gZnVuY3Rpb24gdXNlTW9kdWxlcyAobW9kdWxlc1BhcmFtcykge1xuICAgIGlmICggbW9kdWxlc1BhcmFtcyA9PT0gdm9pZCAwICkgbW9kdWxlc1BhcmFtcyA9IHt9O1xuXG4gIHZhciBpbnN0YW5jZSA9IHRoaXM7XG4gIGlmICghaW5zdGFuY2UubW9kdWxlcykgeyByZXR1cm47IH1cbiAgT2JqZWN0LmtleXMoaW5zdGFuY2UubW9kdWxlcykuZm9yRWFjaChmdW5jdGlvbiAobW9kdWxlTmFtZSkge1xuICAgIHZhciBtb2R1bGUgPSBpbnN0YW5jZS5tb2R1bGVzW21vZHVsZU5hbWVdO1xuICAgIHZhciBtb2R1bGVQYXJhbXMgPSBtb2R1bGVzUGFyYW1zW21vZHVsZU5hbWVdIHx8IHt9O1xuICAgIC8vIEV4dGVuZCBpbnN0YW5jZSBtZXRob2RzIGFuZCBwcm9wc1xuICAgIGlmIChtb2R1bGUuaW5zdGFuY2UpIHtcbiAgICAgIE9iamVjdC5rZXlzKG1vZHVsZS5pbnN0YW5jZSkuZm9yRWFjaChmdW5jdGlvbiAobW9kdWxlUHJvcE5hbWUpIHtcbiAgICAgICAgdmFyIG1vZHVsZVByb3AgPSBtb2R1bGUuaW5zdGFuY2VbbW9kdWxlUHJvcE5hbWVdO1xuICAgICAgICBpZiAodHlwZW9mIG1vZHVsZVByb3AgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBpbnN0YW5jZVttb2R1bGVQcm9wTmFtZV0gPSBtb2R1bGVQcm9wLmJpbmQoaW5zdGFuY2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGluc3RhbmNlW21vZHVsZVByb3BOYW1lXSA9IG1vZHVsZVByb3A7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBBZGQgZXZlbnQgbGlzdGVuZXJzXG4gICAgaWYgKG1vZHVsZS5vbiAmJiBpbnN0YW5jZS5vbikge1xuICAgICAgT2JqZWN0LmtleXMobW9kdWxlLm9uKS5mb3JFYWNoKGZ1bmN0aW9uIChtb2R1bGVFdmVudE5hbWUpIHtcbiAgICAgICAgaW5zdGFuY2Uub24obW9kdWxlRXZlbnROYW1lLCBtb2R1bGUub25bbW9kdWxlRXZlbnROYW1lXSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBNb2R1bGUgY3JlYXRlIGNhbGxiYWNrXG4gICAgaWYgKG1vZHVsZS5jcmVhdGUpIHtcbiAgICAgIG1vZHVsZS5jcmVhdGUuYmluZChpbnN0YW5jZSkobW9kdWxlUGFyYW1zKTtcbiAgICB9XG4gIH0pO1xufTtcbnN0YXRpY0FjY2Vzc29ycy5jb21wb25lbnRzLnNldCA9IGZ1bmN0aW9uIChjb21wb25lbnRzKSB7XG4gIHZhciBDbGFzcyA9IHRoaXM7XG4gIGlmICghQ2xhc3MudXNlKSB7IHJldHVybjsgfVxuICBDbGFzcy51c2UoY29tcG9uZW50cyk7XG59O1xuU3dpcGVyQ2xhc3MuaW5zdGFsbE1vZHVsZSA9IGZ1bmN0aW9uIGluc3RhbGxNb2R1bGUgKG1vZHVsZSkge1xuICAgIHZhciBwYXJhbXMgPSBbXSwgbGVuID0gYXJndW1lbnRzLmxlbmd0aCAtIDE7XG4gICAgd2hpbGUgKCBsZW4tLSA+IDAgKSBwYXJhbXNbIGxlbiBdID0gYXJndW1lbnRzWyBsZW4gKyAxIF07XG5cbiAgdmFyIENsYXNzID0gdGhpcztcbiAgaWYgKCFDbGFzcy5wcm90b3R5cGUubW9kdWxlcykgeyBDbGFzcy5wcm90b3R5cGUubW9kdWxlcyA9IHt9OyB9XG4gIHZhciBuYW1lID0gbW9kdWxlLm5hbWUgfHwgKCgoT2JqZWN0LmtleXMoQ2xhc3MucHJvdG90eXBlLm1vZHVsZXMpLmxlbmd0aCkgKyBcIl9cIiArIChVdGlscy5ub3coKSkpKTtcbiAgQ2xhc3MucHJvdG90eXBlLm1vZHVsZXNbbmFtZV0gPSBtb2R1bGU7XG4gIC8vIFByb3RvdHlwZVxuICBpZiAobW9kdWxlLnByb3RvKSB7XG4gICAgT2JqZWN0LmtleXMobW9kdWxlLnByb3RvKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIENsYXNzLnByb3RvdHlwZVtrZXldID0gbW9kdWxlLnByb3RvW2tleV07XG4gICAgfSk7XG4gIH1cbiAgLy8gQ2xhc3NcbiAgaWYgKG1vZHVsZS5zdGF0aWMpIHtcbiAgICBPYmplY3Qua2V5cyhtb2R1bGUuc3RhdGljKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIENsYXNzW2tleV0gPSBtb2R1bGUuc3RhdGljW2tleV07XG4gICAgfSk7XG4gIH1cbiAgLy8gQ2FsbGJhY2tcbiAgaWYgKG1vZHVsZS5pbnN0YWxsKSB7XG4gICAgbW9kdWxlLmluc3RhbGwuYXBwbHkoQ2xhc3MsIHBhcmFtcyk7XG4gIH1cbiAgcmV0dXJuIENsYXNzO1xufTtcblN3aXBlckNsYXNzLnVzZSA9IGZ1bmN0aW9uIHVzZSAobW9kdWxlKSB7XG4gICAgdmFyIHBhcmFtcyA9IFtdLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoIC0gMTtcbiAgICB3aGlsZSAoIGxlbi0tID4gMCApIHBhcmFtc1sgbGVuIF0gPSBhcmd1bWVudHNbIGxlbiArIDEgXTtcblxuICB2YXIgQ2xhc3MgPSB0aGlzO1xuICBpZiAoQXJyYXkuaXNBcnJheShtb2R1bGUpKSB7XG4gICAgbW9kdWxlLmZvckVhY2goZnVuY3Rpb24gKG0pIHsgcmV0dXJuIENsYXNzLmluc3RhbGxNb2R1bGUobSk7IH0pO1xuICAgIHJldHVybiBDbGFzcztcbiAgfVxuICByZXR1cm4gQ2xhc3MuaW5zdGFsbE1vZHVsZS5hcHBseShDbGFzcywgWyBtb2R1bGUgXS5jb25jYXQoIHBhcmFtcyApKTtcbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKCBTd2lwZXJDbGFzcywgc3RhdGljQWNjZXNzb3JzICk7XG5cbnZhciB1cGRhdGVTaXplID0gZnVuY3Rpb24gKCkge1xuICB2YXIgc3dpcGVyID0gdGhpcztcbiAgdmFyIHdpZHRoO1xuICB2YXIgaGVpZ2h0O1xuICB2YXIgJGVsID0gc3dpcGVyLiRlbDtcbiAgaWYgKHR5cGVvZiBzd2lwZXIucGFyYW1zLndpZHRoICE9PSAndW5kZWZpbmVkJykge1xuICAgIHdpZHRoID0gc3dpcGVyLnBhcmFtcy53aWR0aDtcbiAgfSBlbHNlIHtcbiAgICB3aWR0aCA9ICRlbFswXS5jbGllbnRXaWR0aDtcbiAgfVxuICBpZiAodHlwZW9mIHN3aXBlci5wYXJhbXMuaGVpZ2h0ICE9PSAndW5kZWZpbmVkJykge1xuICAgIGhlaWdodCA9IHN3aXBlci5wYXJhbXMuaGVpZ2h0O1xuICB9IGVsc2Uge1xuICAgIGhlaWdodCA9ICRlbFswXS5jbGllbnRIZWlnaHQ7XG4gIH1cbiAgaWYgKCh3aWR0aCA9PT0gMCAmJiBzd2lwZXIuaXNIb3Jpem9udGFsKCkpIHx8IChoZWlnaHQgPT09IDAgJiYgc3dpcGVyLmlzVmVydGljYWwoKSkpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBTdWJ0cmFjdCBwYWRkaW5nc1xuICB3aWR0aCA9IHdpZHRoIC0gcGFyc2VJbnQoJGVsLmNzcygncGFkZGluZy1sZWZ0JyksIDEwKSAtIHBhcnNlSW50KCRlbC5jc3MoJ3BhZGRpbmctcmlnaHQnKSwgMTApO1xuICBoZWlnaHQgPSBoZWlnaHQgLSBwYXJzZUludCgkZWwuY3NzKCdwYWRkaW5nLXRvcCcpLCAxMCkgLSBwYXJzZUludCgkZWwuY3NzKCdwYWRkaW5nLWJvdHRvbScpLCAxMCk7XG5cbiAgVXRpbHMuZXh0ZW5kKHN3aXBlciwge1xuICAgIHdpZHRoOiB3aWR0aCxcbiAgICBoZWlnaHQ6IGhlaWdodCxcbiAgICBzaXplOiBzd2lwZXIuaXNIb3Jpem9udGFsKCkgPyB3aWR0aCA6IGhlaWdodCxcbiAgfSk7XG59O1xuXG52YXIgdXBkYXRlU2xpZGVzID0gZnVuY3Rpb24gKCkge1xuICB2YXIgc3dpcGVyID0gdGhpcztcbiAgdmFyIHBhcmFtcyA9IHN3aXBlci5wYXJhbXM7XG5cbiAgdmFyICR3cmFwcGVyRWwgPSBzd2lwZXIuJHdyYXBwZXJFbDtcbiAgdmFyIHN3aXBlclNpemUgPSBzd2lwZXIuc2l6ZTtcbiAgdmFyIHJ0bCA9IHN3aXBlci5ydGw7XG4gIHZhciB3cm9uZ1JUTCA9IHN3aXBlci53cm9uZ1JUTDtcbiAgdmFyIHNsaWRlcyA9ICR3cmFwcGVyRWwuY2hpbGRyZW4oKFwiLlwiICsgKHN3aXBlci5wYXJhbXMuc2xpZGVDbGFzcykpKTtcbiAgdmFyIGlzVmlydHVhbCA9IHN3aXBlci52aXJ0dWFsICYmIHBhcmFtcy52aXJ0dWFsLmVuYWJsZWQ7XG4gIHZhciBzbGlkZXNMZW5ndGggPSBpc1ZpcnR1YWwgPyBzd2lwZXIudmlydHVhbC5zbGlkZXMubGVuZ3RoIDogc2xpZGVzLmxlbmd0aDtcbiAgdmFyIHNuYXBHcmlkID0gW107XG4gIHZhciBzbGlkZXNHcmlkID0gW107XG4gIHZhciBzbGlkZXNTaXplc0dyaWQgPSBbXTtcblxuICB2YXIgb2Zmc2V0QmVmb3JlID0gcGFyYW1zLnNsaWRlc09mZnNldEJlZm9yZTtcbiAgaWYgKHR5cGVvZiBvZmZzZXRCZWZvcmUgPT09ICdmdW5jdGlvbicpIHtcbiAgICBvZmZzZXRCZWZvcmUgPSBwYXJhbXMuc2xpZGVzT2Zmc2V0QmVmb3JlLmNhbGwoc3dpcGVyKTtcbiAgfVxuXG4gIHZhciBvZmZzZXRBZnRlciA9IHBhcmFtcy5zbGlkZXNPZmZzZXRBZnRlcjtcbiAgaWYgKHR5cGVvZiBvZmZzZXRBZnRlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIG9mZnNldEFmdGVyID0gcGFyYW1zLnNsaWRlc09mZnNldEFmdGVyLmNhbGwoc3dpcGVyKTtcbiAgfVxuXG4gIHZhciBwcmV2aW91c1NsaWRlc0xlbmd0aCA9IHNsaWRlc0xlbmd0aDtcbiAgdmFyIHByZXZpb3VzU25hcEdyaWRMZW5ndGggPSBzd2lwZXIuc25hcEdyaWQubGVuZ3RoO1xuICB2YXIgcHJldmlvdXNTbGlkZXNHcmlkTGVuZ3RoID0gc3dpcGVyLnNuYXBHcmlkLmxlbmd0aDtcblxuICB2YXIgc3BhY2VCZXR3ZWVuID0gcGFyYW1zLnNwYWNlQmV0d2VlbjtcbiAgdmFyIHNsaWRlUG9zaXRpb24gPSAtb2Zmc2V0QmVmb3JlO1xuICB2YXIgcHJldlNsaWRlU2l6ZSA9IDA7XG4gIHZhciBpbmRleCA9IDA7XG4gIGlmICh0eXBlb2Ygc3dpcGVyU2l6ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKHR5cGVvZiBzcGFjZUJldHdlZW4gPT09ICdzdHJpbmcnICYmIHNwYWNlQmV0d2Vlbi5pbmRleE9mKCclJykgPj0gMCkge1xuICAgIHNwYWNlQmV0d2VlbiA9IChwYXJzZUZsb2F0KHNwYWNlQmV0d2Vlbi5yZXBsYWNlKCclJywgJycpKSAvIDEwMCkgKiBzd2lwZXJTaXplO1xuICB9XG5cbiAgc3dpcGVyLnZpcnR1YWxTaXplID0gLXNwYWNlQmV0d2VlbjtcblxuICAvLyByZXNldCBtYXJnaW5zXG4gIGlmIChydGwpIHsgc2xpZGVzLmNzcyh7IG1hcmdpbkxlZnQ6ICcnLCBtYXJnaW5Ub3A6ICcnIH0pOyB9XG4gIGVsc2UgeyBzbGlkZXMuY3NzKHsgbWFyZ2luUmlnaHQ6ICcnLCBtYXJnaW5Cb3R0b206ICcnIH0pOyB9XG5cbiAgdmFyIHNsaWRlc051bWJlckV2ZW5Ub1Jvd3M7XG4gIGlmIChwYXJhbXMuc2xpZGVzUGVyQ29sdW1uID4gMSkge1xuICAgIGlmIChNYXRoLmZsb29yKHNsaWRlc0xlbmd0aCAvIHBhcmFtcy5zbGlkZXNQZXJDb2x1bW4pID09PSBzbGlkZXNMZW5ndGggLyBzd2lwZXIucGFyYW1zLnNsaWRlc1BlckNvbHVtbikge1xuICAgICAgc2xpZGVzTnVtYmVyRXZlblRvUm93cyA9IHNsaWRlc0xlbmd0aDtcbiAgICB9IGVsc2Uge1xuICAgICAgc2xpZGVzTnVtYmVyRXZlblRvUm93cyA9IE1hdGguY2VpbChzbGlkZXNMZW5ndGggLyBwYXJhbXMuc2xpZGVzUGVyQ29sdW1uKSAqIHBhcmFtcy5zbGlkZXNQZXJDb2x1bW47XG4gICAgfVxuICAgIGlmIChwYXJhbXMuc2xpZGVzUGVyVmlldyAhPT0gJ2F1dG8nICYmIHBhcmFtcy5zbGlkZXNQZXJDb2x1bW5GaWxsID09PSAncm93Jykge1xuICAgICAgc2xpZGVzTnVtYmVyRXZlblRvUm93cyA9IE1hdGgubWF4KHNsaWRlc051bWJlckV2ZW5Ub1Jvd3MsIHBhcmFtcy5zbGlkZXNQZXJWaWV3ICogcGFyYW1zLnNsaWRlc1BlckNvbHVtbik7XG4gICAgfVxuICB9XG5cbiAgLy8gQ2FsYyBzbGlkZXNcbiAgdmFyIHNsaWRlU2l6ZTtcbiAgdmFyIHNsaWRlc1BlckNvbHVtbiA9IHBhcmFtcy5zbGlkZXNQZXJDb2x1bW47XG4gIHZhciBzbGlkZXNQZXJSb3cgPSBzbGlkZXNOdW1iZXJFdmVuVG9Sb3dzIC8gc2xpZGVzUGVyQ29sdW1uO1xuICB2YXIgbnVtRnVsbENvbHVtbnMgPSBzbGlkZXNQZXJSb3cgLSAoKHBhcmFtcy5zbGlkZXNQZXJDb2x1bW4gKiBzbGlkZXNQZXJSb3cpIC0gc2xpZGVzTGVuZ3RoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGlkZXNMZW5ndGg7IGkgKz0gMSkge1xuICAgIHNsaWRlU2l6ZSA9IDA7XG4gICAgdmFyIHNsaWRlID0gc2xpZGVzLmVxKGkpO1xuICAgIGlmIChwYXJhbXMuc2xpZGVzUGVyQ29sdW1uID4gMSkge1xuICAgICAgLy8gU2V0IHNsaWRlcyBvcmRlclxuICAgICAgdmFyIG5ld1NsaWRlT3JkZXJJbmRleCA9ICh2b2lkIDApO1xuICAgICAgdmFyIGNvbHVtbiA9ICh2b2lkIDApO1xuICAgICAgdmFyIHJvdyA9ICh2b2lkIDApO1xuICAgICAgaWYgKHBhcmFtcy5zbGlkZXNQZXJDb2x1bW5GaWxsID09PSAnY29sdW1uJykge1xuICAgICAgICBjb2x1bW4gPSBNYXRoLmZsb29yKGkgLyBzbGlkZXNQZXJDb2x1bW4pO1xuICAgICAgICByb3cgPSBpIC0gKGNvbHVtbiAqIHNsaWRlc1BlckNvbHVtbik7XG4gICAgICAgIGlmIChjb2x1bW4gPiBudW1GdWxsQ29sdW1ucyB8fCAoY29sdW1uID09PSBudW1GdWxsQ29sdW1ucyAmJiByb3cgPT09IHNsaWRlc1BlckNvbHVtbiAtIDEpKSB7XG4gICAgICAgICAgcm93ICs9IDE7XG4gICAgICAgICAgaWYgKHJvdyA+PSBzbGlkZXNQZXJDb2x1bW4pIHtcbiAgICAgICAgICAgIHJvdyA9IDA7XG4gICAgICAgICAgICBjb2x1bW4gKz0gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbmV3U2xpZGVPcmRlckluZGV4ID0gY29sdW1uICsgKChyb3cgKiBzbGlkZXNOdW1iZXJFdmVuVG9Sb3dzKSAvIHNsaWRlc1BlckNvbHVtbik7XG4gICAgICAgIHNsaWRlXG4gICAgICAgICAgLmNzcyh7XG4gICAgICAgICAgICAnLXdlYmtpdC1ib3gtb3JkaW5hbC1ncm91cCc6IG5ld1NsaWRlT3JkZXJJbmRleCxcbiAgICAgICAgICAgICctbW96LWJveC1vcmRpbmFsLWdyb3VwJzogbmV3U2xpZGVPcmRlckluZGV4LFxuICAgICAgICAgICAgJy1tcy1mbGV4LW9yZGVyJzogbmV3U2xpZGVPcmRlckluZGV4LFxuICAgICAgICAgICAgJy13ZWJraXQtb3JkZXInOiBuZXdTbGlkZU9yZGVySW5kZXgsXG4gICAgICAgICAgICBvcmRlcjogbmV3U2xpZGVPcmRlckluZGV4LFxuICAgICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcm93ID0gTWF0aC5mbG9vcihpIC8gc2xpZGVzUGVyUm93KTtcbiAgICAgICAgY29sdW1uID0gaSAtIChyb3cgKiBzbGlkZXNQZXJSb3cpO1xuICAgICAgfVxuICAgICAgc2xpZGVcbiAgICAgICAgLmNzcyhcbiAgICAgICAgICAoXCJtYXJnaW4tXCIgKyAoc3dpcGVyLmlzSG9yaXpvbnRhbCgpID8gJ3RvcCcgOiAnbGVmdCcpKSxcbiAgICAgICAgICAocm93ICE9PSAwICYmIHBhcmFtcy5zcGFjZUJldHdlZW4pICYmICgoKHBhcmFtcy5zcGFjZUJldHdlZW4pICsgXCJweFwiKSlcbiAgICAgICAgKVxuICAgICAgICAuYXR0cignZGF0YS1zd2lwZXItY29sdW1uJywgY29sdW1uKVxuICAgICAgICAuYXR0cignZGF0YS1zd2lwZXItcm93Jywgcm93KTtcbiAgICB9XG4gICAgaWYgKHNsaWRlLmNzcygnZGlzcGxheScpID09PSAnbm9uZScpIHsgY29udGludWU7IH0gLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgIGlmIChwYXJhbXMuc2xpZGVzUGVyVmlldyA9PT0gJ2F1dG8nKSB7XG4gICAgICBzbGlkZVNpemUgPSBzd2lwZXIuaXNIb3Jpem9udGFsKCkgPyBzbGlkZS5vdXRlcldpZHRoKHRydWUpIDogc2xpZGUub3V0ZXJIZWlnaHQodHJ1ZSk7XG4gICAgICBpZiAocGFyYW1zLnJvdW5kTGVuZ3RocykgeyBzbGlkZVNpemUgPSBNYXRoLmZsb29yKHNsaWRlU2l6ZSk7IH1cbiAgICB9IGVsc2Uge1xuICAgICAgc2xpZGVTaXplID0gKHN3aXBlclNpemUgLSAoKHBhcmFtcy5zbGlkZXNQZXJWaWV3IC0gMSkgKiBzcGFjZUJldHdlZW4pKSAvIHBhcmFtcy5zbGlkZXNQZXJWaWV3O1xuICAgICAgaWYgKHBhcmFtcy5yb3VuZExlbmd0aHMpIHsgc2xpZGVTaXplID0gTWF0aC5mbG9vcihzbGlkZVNpemUpOyB9XG5cbiAgICAgIGlmIChzbGlkZXNbaV0pIHtcbiAgICAgICAgaWYgKHN3aXBlci5pc0hvcml6b250YWwoKSkge1xuICAgICAgICAgIHNsaWRlc1tpXS5zdHlsZS53aWR0aCA9IHNsaWRlU2l6ZSArIFwicHhcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzbGlkZXNbaV0uc3R5bGUuaGVpZ2h0ID0gc2xpZGVTaXplICsgXCJweFwiO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChzbGlkZXNbaV0pIHtcbiAgICAgIHNsaWRlc1tpXS5zd2lwZXJTbGlkZVNpemUgPSBzbGlkZVNpemU7XG4gICAgfVxuICAgIHNsaWRlc1NpemVzR3JpZC5wdXNoKHNsaWRlU2l6ZSk7XG5cblxuICAgIGlmIChwYXJhbXMuY2VudGVyZWRTbGlkZXMpIHtcbiAgICAgIHNsaWRlUG9zaXRpb24gPSBzbGlkZVBvc2l0aW9uICsgKHNsaWRlU2l6ZSAvIDIpICsgKHByZXZTbGlkZVNpemUgLyAyKSArIHNwYWNlQmV0d2VlbjtcbiAgICAgIGlmIChwcmV2U2xpZGVTaXplID09PSAwICYmIGkgIT09IDApIHsgc2xpZGVQb3NpdGlvbiA9IHNsaWRlUG9zaXRpb24gLSAoc3dpcGVyU2l6ZSAvIDIpIC0gc3BhY2VCZXR3ZWVuOyB9XG4gICAgICBpZiAoaSA9PT0gMCkgeyBzbGlkZVBvc2l0aW9uID0gc2xpZGVQb3NpdGlvbiAtIChzd2lwZXJTaXplIC8gMikgLSBzcGFjZUJldHdlZW47IH1cbiAgICAgIGlmIChNYXRoLmFicyhzbGlkZVBvc2l0aW9uKSA8IDEgLyAxMDAwKSB7IHNsaWRlUG9zaXRpb24gPSAwOyB9XG4gICAgICBpZiAoKGluZGV4KSAlIHBhcmFtcy5zbGlkZXNQZXJHcm91cCA9PT0gMCkgeyBzbmFwR3JpZC5wdXNoKHNsaWRlUG9zaXRpb24pOyB9XG4gICAgICBzbGlkZXNHcmlkLnB1c2goc2xpZGVQb3NpdGlvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICgoaW5kZXgpICUgcGFyYW1zLnNsaWRlc1Blckdyb3VwID09PSAwKSB7IHNuYXBHcmlkLnB1c2goc2xpZGVQb3NpdGlvbik7IH1cbiAgICAgIHNsaWRlc0dyaWQucHVzaChzbGlkZVBvc2l0aW9uKTtcbiAgICAgIHNsaWRlUG9zaXRpb24gPSBzbGlkZVBvc2l0aW9uICsgc2xpZGVTaXplICsgc3BhY2VCZXR3ZWVuO1xuICAgIH1cblxuICAgIHN3aXBlci52aXJ0dWFsU2l6ZSArPSBzbGlkZVNpemUgKyBzcGFjZUJldHdlZW47XG5cbiAgICBwcmV2U2xpZGVTaXplID0gc2xpZGVTaXplO1xuXG4gICAgaW5kZXggKz0gMTtcbiAgfVxuICBzd2lwZXIudmlydHVhbFNpemUgPSBNYXRoLm1heChzd2lwZXIudmlydHVhbFNpemUsIHN3aXBlclNpemUpICsgb2Zmc2V0QWZ0ZXI7XG4gIHZhciBuZXdTbGlkZXNHcmlkO1xuXG4gIGlmIChcbiAgICBydGwgJiYgd3JvbmdSVEwgJiYgKHBhcmFtcy5lZmZlY3QgPT09ICdzbGlkZScgfHwgcGFyYW1zLmVmZmVjdCA9PT0gJ2NvdmVyZmxvdycpKSB7XG4gICAgJHdyYXBwZXJFbC5jc3MoeyB3aWR0aDogKChzd2lwZXIudmlydHVhbFNpemUgKyBwYXJhbXMuc3BhY2VCZXR3ZWVuKSArIFwicHhcIikgfSk7XG4gIH1cbiAgaWYgKCFTdXBwb3J0LmZsZXhib3ggfHwgcGFyYW1zLnNldFdyYXBwZXJTaXplKSB7XG4gICAgaWYgKHN3aXBlci5pc0hvcml6b250YWwoKSkgeyAkd3JhcHBlckVsLmNzcyh7IHdpZHRoOiAoKHN3aXBlci52aXJ0dWFsU2l6ZSArIHBhcmFtcy5zcGFjZUJldHdlZW4pICsgXCJweFwiKSB9KTsgfVxuICAgIGVsc2UgeyAkd3JhcHBlckVsLmNzcyh7IGhlaWdodDogKChzd2lwZXIudmlydHVhbFNpemUgKyBwYXJhbXMuc3BhY2VCZXR3ZWVuKSArIFwicHhcIikgfSk7IH1cbiAgfVxuXG4gIGlmIChwYXJhbXMuc2xpZGVzUGVyQ29sdW1uID4gMSkge1xuICAgIHN3aXBlci52aXJ0dWFsU2l6ZSA9IChzbGlkZVNpemUgKyBwYXJhbXMuc3BhY2VCZXR3ZWVuKSAqIHNsaWRlc051bWJlckV2ZW5Ub1Jvd3M7XG4gICAgc3dpcGVyLnZpcnR1YWxTaXplID0gTWF0aC5jZWlsKHN3aXBlci52aXJ0dWFsU2l6ZSAvIHBhcmFtcy5zbGlkZXNQZXJDb2x1bW4pIC0gcGFyYW1zLnNwYWNlQmV0d2VlbjtcbiAgICBpZiAoc3dpcGVyLmlzSG9yaXpvbnRhbCgpKSB7ICR3cmFwcGVyRWwuY3NzKHsgd2lkdGg6ICgoc3dpcGVyLnZpcnR1YWxTaXplICsgcGFyYW1zLnNwYWNlQmV0d2VlbikgKyBcInB4XCIpIH0pOyB9XG4gICAgZWxzZSB7ICR3cmFwcGVyRWwuY3NzKHsgaGVpZ2h0OiAoKHN3aXBlci52aXJ0dWFsU2l6ZSArIHBhcmFtcy5zcGFjZUJldHdlZW4pICsgXCJweFwiKSB9KTsgfVxuICAgIGlmIChwYXJhbXMuY2VudGVyZWRTbGlkZXMpIHtcbiAgICAgIG5ld1NsaWRlc0dyaWQgPSBbXTtcbiAgICAgIGZvciAodmFyIGkkMSA9IDA7IGkkMSA8IHNuYXBHcmlkLmxlbmd0aDsgaSQxICs9IDEpIHtcbiAgICAgICAgaWYgKHNuYXBHcmlkW2kkMV0gPCBzd2lwZXIudmlydHVhbFNpemUgKyBzbmFwR3JpZFswXSkgeyBuZXdTbGlkZXNHcmlkLnB1c2goc25hcEdyaWRbaSQxXSk7IH1cbiAgICAgIH1cbiAgICAgIHNuYXBHcmlkID0gbmV3U2xpZGVzR3JpZDtcbiAgICB9XG4gIH1cblxuICAvLyBSZW1vdmUgbGFzdCBncmlkIGVsZW1lbnRzIGRlcGVuZGluZyBvbiB3aWR0aFxuICBpZiAoIXBhcmFtcy5jZW50ZXJlZFNsaWRlcykge1xuICAgIG5ld1NsaWRlc0dyaWQgPSBbXTtcbiAgICBmb3IgKHZhciBpJDIgPSAwOyBpJDIgPCBzbmFwR3JpZC5sZW5ndGg7IGkkMiArPSAxKSB7XG4gICAgICBpZiAoc25hcEdyaWRbaSQyXSA8PSBzd2lwZXIudmlydHVhbFNpemUgLSBzd2lwZXJTaXplKSB7XG4gICAgICAgIG5ld1NsaWRlc0dyaWQucHVzaChzbmFwR3JpZFtpJDJdKTtcbiAgICAgIH1cbiAgICB9XG4gICAgc25hcEdyaWQgPSBuZXdTbGlkZXNHcmlkO1xuICAgIGlmIChNYXRoLmZsb29yKHN3aXBlci52aXJ0dWFsU2l6ZSAtIHN3aXBlclNpemUpIC0gTWF0aC5mbG9vcihzbmFwR3JpZFtzbmFwR3JpZC5sZW5ndGggLSAxXSkgPiAxKSB7XG4gICAgICBzbmFwR3JpZC5wdXNoKHN3aXBlci52aXJ0dWFsU2l6ZSAtIHN3aXBlclNpemUpO1xuICAgIH1cbiAgfVxuICBpZiAoc25hcEdyaWQubGVuZ3RoID09PSAwKSB7IHNuYXBHcmlkID0gWzBdOyB9XG5cbiAgaWYgKHBhcmFtcy5zcGFjZUJldHdlZW4gIT09IDApIHtcbiAgICBpZiAoc3dpcGVyLmlzSG9yaXpvbnRhbCgpKSB7XG4gICAgICBpZiAocnRsKSB7IHNsaWRlcy5jc3MoeyBtYXJnaW5MZWZ0OiAoc3BhY2VCZXR3ZWVuICsgXCJweFwiKSB9KTsgfVxuICAgICAgZWxzZSB7IHNsaWRlcy5jc3MoeyBtYXJnaW5SaWdodDogKHNwYWNlQmV0d2VlbiArIFwicHhcIikgfSk7IH1cbiAgICB9IGVsc2UgeyBzbGlkZXMuY3NzKHsgbWFyZ2luQm90dG9tOiAoc3BhY2VCZXR3ZWVuICsgXCJweFwiKSB9KTsgfVxuICB9XG5cbiAgVXRpbHMuZXh0ZW5kKHN3aXBlciwge1xuICAgIHNsaWRlczogc2xpZGVzLFxuICAgIHNuYXBHcmlkOiBzbmFwR3JpZCxcbiAgICBzbGlkZXNHcmlkOiBzbGlkZXNHcmlkLFxuICAgIHNsaWRlc1NpemVzR3JpZDogc2xpZGVzU2l6ZXNHcmlkLFxuICB9KTtcblxuICBpZiAoc2xpZGVzTGVuZ3RoICE9PSBwcmV2aW91c1NsaWRlc0xlbmd0aCkge1xuICAgIHN3aXBlci5lbWl0KCdzbGlkZXNMZW5ndGhDaGFuZ2UnKTtcbiAgfVxuICBpZiAoc25hcEdyaWQubGVuZ3RoICE9PSBwcmV2aW91c1NuYXBHcmlkTGVuZ3RoKSB7XG4gICAgc3dpcGVyLmVtaXQoJ3NuYXBHcmlkTGVuZ3RoQ2hhbmdlJyk7XG4gIH1cbiAgaWYgKHNsaWRlc0dyaWQubGVuZ3RoICE9PSBwcmV2aW91c1NsaWRlc0dyaWRMZW5ndGgpIHtcbiAgICBzd2lwZXIuZW1pdCgnc2xpZGVzR3JpZExlbmd0aENoYW5nZScpO1xuICB9XG5cbiAgaWYgKHBhcmFtcy53YXRjaFNsaWRlc1Byb2dyZXNzIHx8IHBhcmFtcy53YXRjaFNsaWRlc1Zpc2liaWxpdHkpIHtcbiAgICBzd2lwZXIudXBkYXRlU2xpZGVzT2Zmc2V0KCk7XG4gIH1cbn07XG5cbnZhciB1cGRhdGVBdXRvSGVpZ2h0ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgc3dpcGVyID0gdGhpcztcbiAgdmFyIGFjdGl2ZVNsaWRlcyA9IFtdO1xuICB2YXIgbmV3SGVpZ2h0ID0gMDtcbiAgdmFyIGk7XG5cbiAgLy8gRmluZCBzbGlkZXMgY3VycmVudGx5IGluIHZpZXdcbiAgaWYgKHN3aXBlci5wYXJhbXMuc2xpZGVzUGVyVmlldyAhPT0gJ2F1dG8nICYmIHN3aXBlci5wYXJhbXMuc2xpZGVzUGVyVmlldyA+IDEpIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgTWF0aC5jZWlsKHN3aXBlci5wYXJhbXMuc2xpZGVzUGVyVmlldyk7IGkgKz0gMSkge1xuICAgICAgdmFyIGluZGV4ID0gc3dpcGVyLmFjdGl2ZUluZGV4ICsgaTtcbiAgICAgIGlmIChpbmRleCA+IHN3aXBlci5zbGlkZXMubGVuZ3RoKSB7IGJyZWFrOyB9XG4gICAgICBhY3RpdmVTbGlkZXMucHVzaChzd2lwZXIuc2xpZGVzLmVxKGluZGV4KVswXSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGFjdGl2ZVNsaWRlcy5wdXNoKHN3aXBlci5zbGlkZXMuZXEoc3dpcGVyLmFjdGl2ZUluZGV4KVswXSk7XG4gIH1cblxuICAvLyBGaW5kIG5ldyBoZWlnaHQgZnJvbSBoaWdoZXN0IHNsaWRlIGluIHZpZXdcbiAgZm9yIChpID0gMDsgaSA8IGFjdGl2ZVNsaWRlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIGlmICh0eXBlb2YgYWN0aXZlU2xpZGVzW2ldICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdmFyIGhlaWdodCA9IGFjdGl2ZVNsaWRlc1tpXS5vZmZzZXRIZWlnaHQ7XG4gICAgICBuZXdIZWlnaHQgPSBoZWlnaHQgPiBuZXdIZWlnaHQgPyBoZWlnaHQgOiBuZXdIZWlnaHQ7XG4gICAgfVxuICB9XG5cbiAgLy8gVXBkYXRlIEhlaWdodFxuICBpZiAobmV3SGVpZ2h0KSB7IHN3aXBlci4kd3JhcHBlckVsLmNzcygnaGVpZ2h0JywgKG5ld0hlaWdodCArIFwicHhcIikpOyB9XG59O1xuXG52YXIgdXBkYXRlU2xpZGVzT2Zmc2V0ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgc3dpcGVyID0gdGhpcztcbiAgdmFyIHNsaWRlcyA9IHN3aXBlci5zbGlkZXM7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpZGVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgc2xpZGVzW2ldLnN3aXBlclNsaWRlT2Zmc2V0ID0gc3dpcGVyLmlzSG9yaXpvbnRhbCgpID8gc2xpZGVzW2ldLm9mZnNldExlZnQgOiBzbGlkZXNbaV0ub2Zmc2V0VG9wO1xuICB9XG59O1xuXG52YXIgdXBkYXRlU2xpZGVzUHJvZ3Jlc3MgPSBmdW5jdGlvbiAodHJhbnNsYXRlKSB7XG4gIGlmICggdHJhbnNsYXRlID09PSB2b2lkIDAgKSB0cmFuc2xhdGUgPSB0aGlzLnRyYW5zbGF0ZSB8fCAwO1xuXG4gIHZhciBzd2lwZXIgPSB0aGlzO1xuICB2YXIgcGFyYW1zID0gc3dpcGVyLnBhcmFtcztcblxuICB2YXIgc2xpZGVzID0gc3dpcGVyLnNsaWRlcztcbiAgdmFyIHJ0bCA9IHN3aXBlci5ydGw7XG5cbiAgaWYgKHNsaWRlcy5sZW5ndGggPT09IDApIHsgcmV0dXJuOyB9XG4gIGlmICh0eXBlb2Ygc2xpZGVzWzBdLnN3aXBlclNsaWRlT2Zmc2V0ID09PSAndW5kZWZpbmVkJykgeyBzd2lwZXIudXBkYXRlU2xpZGVzT2Zmc2V0KCk7IH1cblxuICB2YXIgb2Zmc2V0Q2VudGVyID0gLXRyYW5zbGF0ZTtcbiAgaWYgKHJ0bCkgeyBvZmZzZXRDZW50ZXIgPSB0cmFuc2xhdGU7IH1cblxuICAvLyBWaXNpYmxlIFNsaWRlc1xuICBzbGlkZXMucmVtb3ZlQ2xhc3MocGFyYW1zLnNsaWRlVmlzaWJsZUNsYXNzKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHNsaWRlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIHZhciBzbGlkZSA9IHNsaWRlc1tpXTtcbiAgICB2YXIgc2xpZGVQcm9ncmVzcyA9XG4gICAgICAoXG4gICAgICAgIChvZmZzZXRDZW50ZXIgKyAocGFyYW1zLmNlbnRlcmVkU2xpZGVzID8gc3dpcGVyLm1pblRyYW5zbGF0ZSgpIDogMCkpIC0gc2xpZGUuc3dpcGVyU2xpZGVPZmZzZXRcbiAgICAgICkgLyAoc2xpZGUuc3dpcGVyU2xpZGVTaXplICsgcGFyYW1zLnNwYWNlQmV0d2Vlbik7XG4gICAgaWYgKHBhcmFtcy53YXRjaFNsaWRlc1Zpc2liaWxpdHkpIHtcbiAgICAgIHZhciBzbGlkZUJlZm9yZSA9IC0ob2Zmc2V0Q2VudGVyIC0gc2xpZGUuc3dpcGVyU2xpZGVPZmZzZXQpO1xuICAgICAgdmFyIHNsaWRlQWZ0ZXIgPSBzbGlkZUJlZm9yZSArIHN3aXBlci5zbGlkZXNTaXplc0dyaWRbaV07XG4gICAgICB2YXIgaXNWaXNpYmxlID1cbiAgICAgICAgICAgICAgICAoc2xpZGVCZWZvcmUgPj0gMCAmJiBzbGlkZUJlZm9yZSA8IHN3aXBlci5zaXplKSB8fFxuICAgICAgICAgICAgICAgIChzbGlkZUFmdGVyID4gMCAmJiBzbGlkZUFmdGVyIDw9IHN3aXBlci5zaXplKSB8fFxuICAgICAgICAgICAgICAgIChzbGlkZUJlZm9yZSA8PSAwICYmIHNsaWRlQWZ0ZXIgPj0gc3dpcGVyLnNpemUpO1xuICAgICAgaWYgKGlzVmlzaWJsZSkge1xuICAgICAgICBzbGlkZXMuZXEoaSkuYWRkQ2xhc3MocGFyYW1zLnNsaWRlVmlzaWJsZUNsYXNzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgc2xpZGUucHJvZ3Jlc3MgPSBydGwgPyAtc2xpZGVQcm9ncmVzcyA6IHNsaWRlUHJvZ3Jlc3M7XG4gIH1cbn07XG5cbnZhciB1cGRhdGVQcm9ncmVzcyA9IGZ1bmN0aW9uICh0cmFuc2xhdGUpIHtcbiAgaWYgKCB0cmFuc2xhdGUgPT09IHZvaWQgMCApIHRyYW5zbGF0ZSA9IHRoaXMudHJhbnNsYXRlIHx8IDA7XG5cbiAgdmFyIHN3aXBlciA9IHRoaXM7XG4gIHZhciBwYXJhbXMgPSBzd2lwZXIucGFyYW1zO1xuXG4gIHZhciB0cmFuc2xhdGVzRGlmZiA9IHN3aXBlci5tYXhUcmFuc2xhdGUoKSAtIHN3aXBlci5taW5UcmFuc2xhdGUoKTtcbiAgdmFyIHByb2dyZXNzID0gc3dpcGVyLnByb2dyZXNzO1xuICB2YXIgaXNCZWdpbm5pbmcgPSBzd2lwZXIuaXNCZWdpbm5pbmc7XG4gIHZhciBpc0VuZCA9IHN3aXBlci5pc0VuZDtcbiAgdmFyIHdhc0JlZ2lubmluZyA9IGlzQmVnaW5uaW5nO1xuICB2YXIgd2FzRW5kID0gaXNFbmQ7XG4gIGlmICh0cmFuc2xhdGVzRGlmZiA9PT0gMCkge1xuICAgIHByb2dyZXNzID0gMDtcbiAgICBpc0JlZ2lubmluZyA9IHRydWU7XG4gICAgaXNFbmQgPSB0cnVlO1xuICB9IGVsc2Uge1xuICAgIHByb2dyZXNzID0gKHRyYW5zbGF0ZSAtIHN3aXBlci5taW5UcmFuc2xhdGUoKSkgLyAodHJhbnNsYXRlc0RpZmYpO1xuICAgIGlzQmVnaW5uaW5nID0gcHJvZ3Jlc3MgPD0gMDtcbiAgICBpc0VuZCA9IHByb2dyZXNzID49IDE7XG4gIH1cbiAgVXRpbHMuZXh0ZW5kKHN3aXBlciwge1xuICAgIHByb2dyZXNzOiBwcm9ncmVzcyxcbiAgICBpc0JlZ2lubmluZzogaXNCZWdpbm5pbmcsXG4gICAgaXNFbmQ6IGlzRW5kLFxuICB9KTtcblxuICBpZiAocGFyYW1zLndhdGNoU2xpZGVzUHJvZ3Jlc3MgfHwgcGFyYW1zLndhdGNoU2xpZGVzVmlzaWJpbGl0eSkgeyBzd2lwZXIudXBkYXRlU2xpZGVzUHJvZ3Jlc3ModHJhbnNsYXRlKTsgfVxuXG4gIGlmIChpc0JlZ2lubmluZyAmJiAhd2FzQmVnaW5uaW5nKSB7XG4gICAgc3dpcGVyLmVtaXQoJ3JlYWNoQmVnaW5uaW5nIHRvRWRnZScpO1xuICB9XG4gIGlmIChpc0VuZCAmJiAhd2FzRW5kKSB7XG4gICAgc3dpcGVyLmVtaXQoJ3JlYWNoRW5kIHRvRWRnZScpO1xuICB9XG4gIGlmICgod2FzQmVnaW5uaW5nICYmICFpc0JlZ2lubmluZykgfHwgKHdhc0VuZCAmJiAhaXNFbmQpKSB7XG4gICAgc3dpcGVyLmVtaXQoJ2Zyb21FZGdlJyk7XG4gIH1cblxuICBzd2lwZXIuZW1pdCgncHJvZ3Jlc3MnLCBwcm9ncmVzcyk7XG59O1xuXG52YXIgdXBkYXRlU2xpZGVzQ2xhc3NlcyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHN3aXBlciA9IHRoaXM7XG5cbiAgdmFyIHNsaWRlcyA9IHN3aXBlci5zbGlkZXM7XG4gIHZhciBwYXJhbXMgPSBzd2lwZXIucGFyYW1zO1xuICB2YXIgJHdyYXBwZXJFbCA9IHN3aXBlci4kd3JhcHBlckVsO1xuICB2YXIgYWN0aXZlSW5kZXggPSBzd2lwZXIuYWN0aXZlSW5kZXg7XG4gIHZhciByZWFsSW5kZXggPSBzd2lwZXIucmVhbEluZGV4O1xuICB2YXIgaXNWaXJ0dWFsID0gc3dpcGVyLnZpcnR1YWwgJiYgcGFyYW1zLnZpcnR1YWwuZW5hYmxlZDtcblxuICBzbGlkZXMucmVtb3ZlQ2xhc3MoKChwYXJhbXMuc2xpZGVBY3RpdmVDbGFzcykgKyBcIiBcIiArIChwYXJhbXMuc2xpZGVOZXh0Q2xhc3MpICsgXCIgXCIgKyAocGFyYW1zLnNsaWRlUHJldkNsYXNzKSArIFwiIFwiICsgKHBhcmFtcy5zbGlkZUR1cGxpY2F0ZUFjdGl2ZUNsYXNzKSArIFwiIFwiICsgKHBhcmFtcy5zbGlkZUR1cGxpY2F0ZU5leHRDbGFzcykgKyBcIiBcIiArIChwYXJhbXMuc2xpZGVEdXBsaWNhdGVQcmV2Q2xhc3MpKSk7XG5cbiAgdmFyIGFjdGl2ZVNsaWRlO1xuICBpZiAoaXNWaXJ0dWFsKSB7XG4gICAgYWN0aXZlU2xpZGUgPSBzd2lwZXIuJHdyYXBwZXJFbC5maW5kKChcIi5cIiArIChwYXJhbXMuc2xpZGVDbGFzcykgKyBcIltkYXRhLXN3aXBlci1zbGlkZS1pbmRleD1cXFwiXCIgKyBhY3RpdmVJbmRleCArIFwiXFxcIl1cIikpO1xuICB9IGVsc2Uge1xuICAgIGFjdGl2ZVNsaWRlID0gc2xpZGVzLmVxKGFjdGl2ZUluZGV4KTtcbiAgfVxuXG4gIC8vIEFjdGl2ZSBjbGFzc2VzXG4gIGFjdGl2ZVNsaWRlLmFkZENsYXNzKHBhcmFtcy5zbGlkZUFjdGl2ZUNsYXNzKTtcblxuICBpZiAocGFyYW1zLmxvb3ApIHtcbiAgICAvLyBEdXBsaWNhdGUgdG8gYWxsIGxvb3BlZCBzbGlkZXNcbiAgICBpZiAoYWN0aXZlU2xpZGUuaGFzQ2xhc3MocGFyYW1zLnNsaWRlRHVwbGljYXRlQ2xhc3MpKSB7XG4gICAgICAkd3JhcHBlckVsXG4gICAgICAgIC5jaGlsZHJlbigoXCIuXCIgKyAocGFyYW1zLnNsaWRlQ2xhc3MpICsgXCI6bm90KC5cIiArIChwYXJhbXMuc2xpZGVEdXBsaWNhdGVDbGFzcykgKyBcIilbZGF0YS1zd2lwZXItc2xpZGUtaW5kZXg9XFxcIlwiICsgcmVhbEluZGV4ICsgXCJcXFwiXVwiKSlcbiAgICAgICAgLmFkZENsYXNzKHBhcmFtcy5zbGlkZUR1cGxpY2F0ZUFjdGl2ZUNsYXNzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJHdyYXBwZXJFbFxuICAgICAgICAuY2hpbGRyZW4oKFwiLlwiICsgKHBhcmFtcy5zbGlkZUNsYXNzKSArIFwiLlwiICsgKHBhcmFtcy5zbGlkZUR1cGxpY2F0ZUNsYXNzKSArIFwiW2RhdGEtc3dpcGVyLXNsaWRlLWluZGV4PVxcXCJcIiArIHJlYWxJbmRleCArIFwiXFxcIl1cIikpXG4gICAgICAgIC5hZGRDbGFzcyhwYXJhbXMuc2xpZGVEdXBsaWNhdGVBY3RpdmVDbGFzcyk7XG4gICAgfVxuICB9XG4gIC8vIE5leHQgU2xpZGVcbiAgdmFyIG5leHRTbGlkZSA9IGFjdGl2ZVNsaWRlLm5leHRBbGwoKFwiLlwiICsgKHBhcmFtcy5zbGlkZUNsYXNzKSkpLmVxKDApLmFkZENsYXNzKHBhcmFtcy5zbGlkZU5leHRDbGFzcyk7XG4gIGlmIChwYXJhbXMubG9vcCAmJiBuZXh0U2xpZGUubGVuZ3RoID09PSAwKSB7XG4gICAgbmV4dFNsaWRlID0gc2xpZGVzLmVxKDApO1xuICAgIG5leHRTbGlkZS5hZGRDbGFzcyhwYXJhbXMuc2xpZGVOZXh0Q2xhc3MpO1xuICB9XG4gIC8vIFByZXYgU2xpZGVcbiAgdmFyIHByZXZTbGlkZSA9IGFjdGl2ZVNsaWRlLnByZXZBbGwoKFwiLlwiICsgKHBhcmFtcy5zbGlkZUNsYXNzKSkpLmVxKDApLmFkZENsYXNzKHBhcmFtcy5zbGlkZVByZXZDbGFzcyk7XG4gIGlmIChwYXJhbXMubG9vcCAmJiBwcmV2U2xpZGUubGVuZ3RoID09PSAwKSB7XG4gICAgcHJldlNsaWRlID0gc2xpZGVzLmVxKC0xKTtcbiAgICBwcmV2U2xpZGUuYWRkQ2xhc3MocGFyYW1zLnNsaWRlUHJldkNsYXNzKTtcbiAgfVxuICBpZiAocGFyYW1zLmxvb3ApIHtcbiAgICAvLyBEdXBsaWNhdGUgdG8gYWxsIGxvb3BlZCBzbGlkZXNcbiAgICBpZiAobmV4dFNsaWRlLmhhc0NsYXNzKHBhcmFtcy5zbGlkZUR1cGxpY2F0ZUNsYXNzKSkge1xuICAgICAgJHdyYXBwZXJFbFxuICAgICAgICAuY2hpbGRyZW4oKFwiLlwiICsgKHBhcmFtcy5zbGlkZUNsYXNzKSArIFwiOm5vdCguXCIgKyAocGFyYW1zLnNsaWRlRHVwbGljYXRlQ2xhc3MpICsgXCIpW2RhdGEtc3dpcGVyLXNsaWRlLWluZGV4PVxcXCJcIiArIChuZXh0U2xpZGUuYXR0cignZGF0YS1zd2lwZXItc2xpZGUtaW5kZXgnKSkgKyBcIlxcXCJdXCIpKVxuICAgICAgICAuYWRkQ2xhc3MocGFyYW1zLnNsaWRlRHVwbGljYXRlTmV4dENsYXNzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJHdyYXBwZXJFbFxuICAgICAgICAuY2hpbGRyZW4oKFwiLlwiICsgKHBhcmFtcy5zbGlkZUNsYXNzKSArIFwiLlwiICsgKHBhcmFtcy5zbGlkZUR1cGxpY2F0ZUNsYXNzKSArIFwiW2RhdGEtc3dpcGVyLXNsaWRlLWluZGV4PVxcXCJcIiArIChuZXh0U2xpZGUuYXR0cignZGF0YS1zd2lwZXItc2xpZGUtaW5kZXgnKSkgKyBcIlxcXCJdXCIpKVxuICAgICAgICAuYWRkQ2xhc3MocGFyYW1zLnNsaWRlRHVwbGljYXRlTmV4dENsYXNzKTtcbiAgICB9XG4gICAgaWYgKHByZXZTbGlkZS5oYXNDbGFzcyhwYXJhbXMuc2xpZGVEdXBsaWNhdGVDbGFzcykpIHtcbiAgICAgICR3cmFwcGVyRWxcbiAgICAgICAgLmNoaWxkcmVuKChcIi5cIiArIChwYXJhbXMuc2xpZGVDbGFzcykgKyBcIjpub3QoLlwiICsgKHBhcmFtcy5zbGlkZUR1cGxpY2F0ZUNsYXNzKSArIFwiKVtkYXRhLXN3aXBlci1zbGlkZS1pbmRleD1cXFwiXCIgKyAocHJldlNsaWRlLmF0dHIoJ2RhdGEtc3dpcGVyLXNsaWRlLWluZGV4JykpICsgXCJcXFwiXVwiKSlcbiAgICAgICAgLmFkZENsYXNzKHBhcmFtcy5zbGlkZUR1cGxpY2F0ZVByZXZDbGFzcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICR3cmFwcGVyRWxcbiAgICAgICAgLmNoaWxkcmVuKChcIi5cIiArIChwYXJhbXMuc2xpZGVDbGFzcykgKyBcIi5cIiArIChwYXJhbXMuc2xpZGVEdXBsaWNhdGVDbGFzcykgKyBcIltkYXRhLXN3aXBlci1zbGlkZS1pbmRleD1cXFwiXCIgKyAocHJldlNsaWRlLmF0dHIoJ2RhdGEtc3dpcGVyLXNsaWRlLWluZGV4JykpICsgXCJcXFwiXVwiKSlcbiAgICAgICAgLmFkZENsYXNzKHBhcmFtcy5zbGlkZUR1cGxpY2F0ZVByZXZDbGFzcyk7XG4gICAgfVxuICB9XG59O1xuXG52YXIgdXBkYXRlQWN0aXZlSW5kZXggPSBmdW5jdGlvbiAobmV3QWN0aXZlSW5kZXgpIHtcbiAgdmFyIHN3aXBlciA9IHRoaXM7XG4gIHZhciB0cmFuc2xhdGUgPSBzd2lwZXIucnRsID8gc3dpcGVyLnRyYW5zbGF0ZSA6IC1zd2lwZXIudHJhbnNsYXRlO1xuICB2YXIgc2xpZGVzR3JpZCA9IHN3aXBlci5zbGlkZXNHcmlkO1xuICB2YXIgc25hcEdyaWQgPSBzd2lwZXIuc25hcEdyaWQ7XG4gIHZhciBwYXJhbXMgPSBzd2lwZXIucGFyYW1zO1xuICB2YXIgcHJldmlvdXNJbmRleCA9IHN3aXBlci5hY3RpdmVJbmRleDtcbiAgdmFyIHByZXZpb3VzUmVhbEluZGV4ID0gc3dpcGVyLnJlYWxJbmRleDtcbiAgdmFyIHByZXZpb3VzU25hcEluZGV4ID0gc3dpcGVyLnNuYXBJbmRleDtcbiAgdmFyIGFjdGl2ZUluZGV4ID0gbmV3QWN0aXZlSW5kZXg7XG4gIHZhciBzbmFwSW5kZXg7XG4gIGlmICh0eXBlb2YgYWN0aXZlSW5kZXggPT09ICd1bmRlZmluZWQnKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGlkZXNHcmlkLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBpZiAodHlwZW9mIHNsaWRlc0dyaWRbaSArIDFdICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBpZiAodHJhbnNsYXRlID49IHNsaWRlc0dyaWRbaV0gJiYgdHJhbnNsYXRlIDwgc2xpZGVzR3JpZFtpICsgMV0gLSAoKHNsaWRlc0dyaWRbaSArIDFdIC0gc2xpZGVzR3JpZFtpXSkgLyAyKSkge1xuICAgICAgICAgIGFjdGl2ZUluZGV4ID0gaTtcbiAgICAgICAgfSBlbHNlIGlmICh0cmFuc2xhdGUgPj0gc2xpZGVzR3JpZFtpXSAmJiB0cmFuc2xhdGUgPCBzbGlkZXNHcmlkW2kgKyAxXSkge1xuICAgICAgICAgIGFjdGl2ZUluZGV4ID0gaSArIDE7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodHJhbnNsYXRlID49IHNsaWRlc0dyaWRbaV0pIHtcbiAgICAgICAgYWN0aXZlSW5kZXggPSBpO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBOb3JtYWxpemUgc2xpZGVJbmRleFxuICAgIGlmIChwYXJhbXMubm9ybWFsaXplU2xpZGVJbmRleCkge1xuICAgICAgaWYgKGFjdGl2ZUluZGV4IDwgMCB8fCB0eXBlb2YgYWN0aXZlSW5kZXggPT09ICd1bmRlZmluZWQnKSB7IGFjdGl2ZUluZGV4ID0gMDsgfVxuICAgIH1cbiAgfVxuICBpZiAoc25hcEdyaWQuaW5kZXhPZih0cmFuc2xhdGUpID49IDApIHtcbiAgICBzbmFwSW5kZXggPSBzbmFwR3JpZC5pbmRleE9mKHRyYW5zbGF0ZSk7XG4gIH0gZWxzZSB7XG4gICAgc25hcEluZGV4ID0gTWF0aC5mbG9vcihhY3RpdmVJbmRleCAvIHBhcmFtcy5zbGlkZXNQZXJHcm91cCk7XG4gIH1cbiAgaWYgKHNuYXBJbmRleCA+PSBzbmFwR3JpZC5sZW5ndGgpIHsgc25hcEluZGV4ID0gc25hcEdyaWQubGVuZ3RoIC0gMTsgfVxuICBpZiAoYWN0aXZlSW5kZXggPT09IHByZXZpb3VzSW5kZXgpIHtcbiAgICBpZiAoc25hcEluZGV4ICE9PSBwcmV2aW91c1NuYXBJbmRleCkge1xuICAgICAgc3dpcGVyLnNuYXBJbmRleCA9IHNuYXBJbmRleDtcbiAgICAgIHN3aXBlci5lbWl0KCdzbmFwSW5kZXhDaGFuZ2UnKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gR2V0IHJlYWwgaW5kZXhcbiAgdmFyIHJlYWxJbmRleCA9IHBhcnNlSW50KHN3aXBlci5zbGlkZXMuZXEoYWN0aXZlSW5kZXgpLmF0dHIoJ2RhdGEtc3dpcGVyLXNsaWRlLWluZGV4JykgfHwgYWN0aXZlSW5kZXgsIDEwKTtcblxuICBVdGlscy5leHRlbmQoc3dpcGVyLCB7XG4gICAgc25hcEluZGV4OiBzbmFwSW5kZXgsXG4gICAgcmVhbEluZGV4OiByZWFsSW5kZXgsXG4gICAgcHJldmlvdXNJbmRleDogcHJldmlvdXNJbmRleCxcbiAgICBhY3RpdmVJbmRleDogYWN0aXZlSW5kZXgsXG4gIH0pO1xuICBzd2lwZXIuZW1pdCgnYWN0aXZlSW5kZXhDaGFuZ2UnKTtcbiAgc3dpcGVyLmVtaXQoJ3NuYXBJbmRleENoYW5nZScpO1xuICBpZiAocHJldmlvdXNSZWFsSW5kZXggIT09IHJlYWxJbmRleCkge1xuICAgIHN3aXBlci5lbWl0KCdyZWFsSW5kZXhDaGFuZ2UnKTtcbiAgfVxuICBzd2lwZXIuZW1pdCgnc2xpZGVDaGFuZ2UnKTtcbn07XG5cbnZhciB1cGRhdGVDbGlja2VkU2xpZGUgPSBmdW5jdGlvbiAoZSkge1xuICB2YXIgc3dpcGVyID0gdGhpcztcbiAgdmFyIHBhcmFtcyA9IHN3aXBlci5wYXJhbXM7XG4gIHZhciBzbGlkZSA9ICQkMShlLnRhcmdldCkuY2xvc2VzdCgoXCIuXCIgKyAocGFyYW1zLnNsaWRlQ2xhc3MpKSlbMF07XG4gIHZhciBzbGlkZUZvdW5kID0gZmFsc2U7XG4gIGlmIChzbGlkZSkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3dpcGVyLnNsaWRlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgaWYgKHN3aXBlci5zbGlkZXNbaV0gPT09IHNsaWRlKSB7IHNsaWRlRm91bmQgPSB0cnVlOyB9XG4gICAgfVxuICB9XG5cbiAgaWYgKHNsaWRlICYmIHNsaWRlRm91bmQpIHtcbiAgICBzd2lwZXIuY2xpY2tlZFNsaWRlID0gc2xpZGU7XG4gICAgaWYgKHN3aXBlci52aXJ0dWFsICYmIHN3aXBlci5wYXJhbXMudmlydHVhbC5lbmFibGVkKSB7XG4gICAgICBzd2lwZXIuY2xpY2tlZEluZGV4ID0gcGFyc2VJbnQoJCQxKHNsaWRlKS5hdHRyKCdkYXRhLXN3aXBlci1zbGlkZS1pbmRleCcpLCAxMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN3aXBlci5jbGlja2VkSW5kZXggPSAkJDEoc2xpZGUpLmluZGV4KCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHN3aXBlci5jbGlja2VkU2xpZGUgPSB1bmRlZmluZWQ7XG4gICAgc3dpcGVyLmNsaWNrZWRJbmRleCA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKHBhcmFtcy5zbGlkZVRvQ2xpY2tlZFNsaWRlICYmIHN3aXBlci5jbGlja2VkSW5kZXggIT09IHVuZGVmaW5lZCAmJiBzd2lwZXIuY2xpY2tlZEluZGV4ICE9PSBzd2lwZXIuYWN0aXZlSW5kZXgpIHtcbiAgICBzd2lwZXIuc2xpZGVUb0NsaWNrZWRTbGlkZSgpO1xuICB9XG59O1xuXG52YXIgdXBkYXRlID0ge1xuICB1cGRhdGVTaXplOiB1cGRhdGVTaXplLFxuICB1cGRhdGVTbGlkZXM6IHVwZGF0ZVNsaWRlcyxcbiAgdXBkYXRlQXV0b0hlaWdodDogdXBkYXRlQXV0b0hlaWdodCxcbiAgdXBkYXRlU2xpZGVzT2Zmc2V0OiB1cGRhdGVTbGlkZXNPZmZzZXQsXG4gIHVwZGF0ZVNsaWRlc1Byb2dyZXNzOiB1cGRhdGVTbGlkZXNQcm9ncmVzcyxcbiAgdXBkYXRlUHJvZ3Jlc3M6IHVwZGF0ZVByb2dyZXNzLFxuICB1cGRhdGVTbGlkZXNDbGFzc2VzOiB1cGRhdGVTbGlkZXNDbGFzc2VzLFxuICB1cGRhdGVBY3RpdmVJbmRleDogdXBkYXRlQWN0aXZlSW5kZXgsXG4gIHVwZGF0ZUNsaWNrZWRTbGlkZTogdXBkYXRlQ2xpY2tlZFNsaWRlLFxufTtcblxudmFyIGdldFRyYW5zbGF0ZSA9IGZ1bmN0aW9uIChheGlzKSB7XG4gIGlmICggYXhpcyA9PT0gdm9pZCAwICkgYXhpcyA9IHRoaXMuaXNIb3Jpem9udGFsKCkgPyAneCcgOiAneSc7XG5cbiAgdmFyIHN3aXBlciA9IHRoaXM7XG5cbiAgdmFyIHBhcmFtcyA9IHN3aXBlci5wYXJhbXM7XG4gIHZhciBydGwgPSBzd2lwZXIucnRsO1xuICB2YXIgdHJhbnNsYXRlID0gc3dpcGVyLnRyYW5zbGF0ZTtcbiAgdmFyICR3cmFwcGVyRWwgPSBzd2lwZXIuJHdyYXBwZXJFbDtcblxuICBpZiAocGFyYW1zLnZpcnR1YWxUcmFuc2xhdGUpIHtcbiAgICByZXR1cm4gcnRsID8gLXRyYW5zbGF0ZSA6IHRyYW5zbGF0ZTtcbiAgfVxuXG4gIHZhciBjdXJyZW50VHJhbnNsYXRlID0gVXRpbHMuZ2V0VHJhbnNsYXRlKCR3cmFwcGVyRWxbMF0sIGF4aXMpO1xuICBpZiAocnRsKSB7IGN1cnJlbnRUcmFuc2xhdGUgPSAtY3VycmVudFRyYW5zbGF0ZTsgfVxuXG4gIHJldHVybiBjdXJyZW50VHJhbnNsYXRlIHx8IDA7XG59O1xuXG52YXIgc2V0VHJhbnNsYXRlID0gZnVuY3Rpb24gKHRyYW5zbGF0ZSwgYnlDb250cm9sbGVyKSB7XG4gIHZhciBzd2lwZXIgPSB0aGlzO1xuICB2YXIgcnRsID0gc3dpcGVyLnJ0bDtcbiAgdmFyIHBhcmFtcyA9IHN3aXBlci5wYXJhbXM7XG4gIHZhciAkd3JhcHBlckVsID0gc3dpcGVyLiR3cmFwcGVyRWw7XG4gIHZhciBwcm9ncmVzcyA9IHN3aXBlci5wcm9ncmVzcztcbiAgdmFyIHggPSAwO1xuICB2YXIgeSA9IDA7XG4gIHZhciB6ID0gMDtcblxuICBpZiAoc3dpcGVyLmlzSG9yaXpvbnRhbCgpKSB7XG4gICAgeCA9IHJ0bCA/IC10cmFuc2xhdGUgOiB0cmFuc2xhdGU7XG4gIH0gZWxzZSB7XG4gICAgeSA9IHRyYW5zbGF0ZTtcbiAgfVxuXG4gIGlmIChwYXJhbXMucm91bmRMZW5ndGhzKSB7XG4gICAgeCA9IE1hdGguZmxvb3IoeCk7XG4gICAgeSA9IE1hdGguZmxvb3IoeSk7XG4gIH1cblxuICBpZiAoIXBhcmFtcy52aXJ0dWFsVHJhbnNsYXRlKSB7XG4gICAgaWYgKFN1cHBvcnQudHJhbnNmb3JtczNkKSB7ICR3cmFwcGVyRWwudHJhbnNmb3JtKChcInRyYW5zbGF0ZTNkKFwiICsgeCArIFwicHgsIFwiICsgeSArIFwicHgsIFwiICsgeiArIFwicHgpXCIpKTsgfVxuICAgIGVsc2UgeyAkd3JhcHBlckVsLnRyYW5zZm9ybSgoXCJ0cmFuc2xhdGUoXCIgKyB4ICsgXCJweCwgXCIgKyB5ICsgXCJweClcIikpOyB9XG4gIH1cblxuICBzd2lwZXIudHJhbnNsYXRlID0gc3dpcGVyLmlzSG9yaXpvbnRhbCgpID8geCA6IHk7XG5cbiAgLy8gQ2hlY2sgaWYgd2UgbmVlZCB0byB1cGRhdGUgcHJvZ3Jlc3NcbiAgdmFyIG5ld1Byb2dyZXNzO1xuICB2YXIgdHJhbnNsYXRlc0RpZmYgPSBzd2lwZXIubWF4VHJhbnNsYXRlKCkgLSBzd2lwZXIubWluVHJhbnNsYXRlKCk7XG4gIGlmICh0cmFuc2xhdGVzRGlmZiA9PT0gMCkge1xuICAgIG5ld1Byb2dyZXNzID0gMDtcbiAgfSBlbHNlIHtcbiAgICBuZXdQcm9ncmVzcyA9ICh0cmFuc2xhdGUgLSBzd2lwZXIubWluVHJhbnNsYXRlKCkpIC8gKHRyYW5zbGF0ZXNEaWZmKTtcbiAgfVxuICBpZiAobmV3UHJvZ3Jlc3MgIT09IHByb2dyZXNzKSB7XG4gICAgc3dpcGVyLnVwZGF0ZVByb2dyZXNzKHRyYW5zbGF0ZSk7XG4gIH1cblxuICBzd2lwZXIuZW1pdCgnc2V0VHJhbnNsYXRlJywgc3dpcGVyLnRyYW5zbGF0ZSwgYnlDb250cm9sbGVyKTtcbn07XG5cbnZhciBtaW5UcmFuc2xhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiAoLXRoaXMuc25hcEdyaWRbMF0pO1xufTtcblxudmFyIG1heFRyYW5zbGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuICgtdGhpcy5zbmFwR3JpZFt0aGlzLnNuYXBHcmlkLmxlbmd0aCAtIDFdKTtcbn07XG5cbnZhciB0cmFuc2xhdGUgPSB7XG4gIGdldFRyYW5zbGF0ZTogZ2V0VHJhbnNsYXRlLFxuICBzZXRUcmFuc2xhdGU6IHNldFRyYW5zbGF0ZSxcbiAgbWluVHJhbnNsYXRlOiBtaW5UcmFuc2xhdGUsXG4gIG1heFRyYW5zbGF0ZTogbWF4VHJhbnNsYXRlLFxufTtcblxudmFyIHNldFRyYW5zaXRpb24gPSBmdW5jdGlvbiAoZHVyYXRpb24sIGJ5Q29udHJvbGxlcikge1xuICB2YXIgc3dpcGVyID0gdGhpcztcblxuICBzd2lwZXIuJHdyYXBwZXJFbC50cmFuc2l0aW9uKGR1cmF0aW9uKTtcblxuICBzd2lwZXIuZW1pdCgnc2V0VHJhbnNpdGlvbicsIGR1cmF0aW9uLCBieUNvbnRyb2xsZXIpO1xufTtcblxudmFyIHRyYW5zaXRpb25TdGFydCA9IGZ1bmN0aW9uIChydW5DYWxsYmFja3MpIHtcbiAgaWYgKCBydW5DYWxsYmFja3MgPT09IHZvaWQgMCApIHJ1bkNhbGxiYWNrcyA9IHRydWU7XG5cbiAgdmFyIHN3aXBlciA9IHRoaXM7XG4gIHZhciBhY3RpdmVJbmRleCA9IHN3aXBlci5hY3RpdmVJbmRleDtcbiAgdmFyIHBhcmFtcyA9IHN3aXBlci5wYXJhbXM7XG4gIHZhciBwcmV2aW91c0luZGV4ID0gc3dpcGVyLnByZXZpb3VzSW5kZXg7XG4gIGlmIChwYXJhbXMuYXV0b0hlaWdodCkge1xuICAgIHN3aXBlci51cGRhdGVBdXRvSGVpZ2h0KCk7XG4gIH1cbiAgc3dpcGVyLmVtaXQoJ3RyYW5zaXRpb25TdGFydCcpO1xuXG4gIGlmICghcnVuQ2FsbGJhY2tzKSB7IHJldHVybjsgfVxuICBpZiAoYWN0aXZlSW5kZXggIT09IHByZXZpb3VzSW5kZXgpIHtcbiAgICBzd2lwZXIuZW1pdCgnc2xpZGVDaGFuZ2VUcmFuc2l0aW9uU3RhcnQnKTtcbiAgICBpZiAoYWN0aXZlSW5kZXggPiBwcmV2aW91c0luZGV4KSB7XG4gICAgICBzd2lwZXIuZW1pdCgnc2xpZGVOZXh0VHJhbnNpdGlvblN0YXJ0Jyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN3aXBlci5lbWl0KCdzbGlkZVByZXZUcmFuc2l0aW9uU3RhcnQnKTtcbiAgICB9XG4gIH1cbn07XG5cbnZhciB0cmFuc2l0aW9uRW5kJDEgPSBmdW5jdGlvbiAocnVuQ2FsbGJhY2tzKSB7XG4gIGlmICggcnVuQ2FsbGJhY2tzID09PSB2b2lkIDAgKSBydW5DYWxsYmFja3MgPSB0cnVlO1xuXG4gIHZhciBzd2lwZXIgPSB0aGlzO1xuICB2YXIgYWN0aXZlSW5kZXggPSBzd2lwZXIuYWN0aXZlSW5kZXg7XG4gIHZhciBwcmV2aW91c0luZGV4ID0gc3dpcGVyLnByZXZpb3VzSW5kZXg7XG4gIHN3aXBlci5hbmltYXRpbmcgPSBmYWxzZTtcbiAgc3dpcGVyLnNldFRyYW5zaXRpb24oMCk7XG5cbiAgc3dpcGVyLmVtaXQoJ3RyYW5zaXRpb25FbmQnKTtcbiAgaWYgKHJ1bkNhbGxiYWNrcykge1xuICAgIGlmIChhY3RpdmVJbmRleCAhPT0gcHJldmlvdXNJbmRleCkge1xuICAgICAgc3dpcGVyLmVtaXQoJ3NsaWRlQ2hhbmdlVHJhbnNpdGlvbkVuZCcpO1xuICAgICAgaWYgKGFjdGl2ZUluZGV4ID4gcHJldmlvdXNJbmRleCkge1xuICAgICAgICBzd2lwZXIuZW1pdCgnc2xpZGVOZXh0VHJhbnNpdGlvbkVuZCcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3dpcGVyLmVtaXQoJ3NsaWRlUHJldlRyYW5zaXRpb25FbmQnKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbnZhciB0cmFuc2l0aW9uJDEgPSB7XG4gIHNldFRyYW5zaXRpb246IHNldFRyYW5zaXRpb24sXG4gIHRyYW5zaXRpb25TdGFydDogdHJhbnNpdGlvblN0YXJ0LFxuICB0cmFuc2l0aW9uRW5kOiB0cmFuc2l0aW9uRW5kJDEsXG59O1xuXG52YXIgQnJvd3NlciA9IChmdW5jdGlvbiBCcm93c2VyKCkge1xuICBmdW5jdGlvbiBpc0lFOSgpIHtcbiAgICAvLyBjcmVhdGUgdGVtcG9yYXJ5IERJVlxuICAgIHZhciBkaXYgPSBkb2MuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgLy8gYWRkIGNvbnRlbnQgdG8gdG1wIERJViB3aGljaCBpcyB3cmFwcGVkIGludG8gdGhlIElFIEhUTUwgY29uZGl0aW9uYWwgc3RhdGVtZW50XG4gICAgZGl2LmlubmVySFRNTCA9ICc8IS0tW2lmIGx0ZSBJRSA5XT48aT48L2k+PCFbZW5kaWZdLS0+JztcbiAgICAvLyByZXR1cm4gdHJ1ZSAvIGZhbHNlIHZhbHVlIGJhc2VkIG9uIHdoYXQgd2lsbCBicm93c2VyIHJlbmRlclxuICAgIHJldHVybiBkaXYuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2knKS5sZW5ndGggPT09IDE7XG4gIH1cbiAgZnVuY3Rpb24gaXNTYWZhcmkoKSB7XG4gICAgdmFyIHVhID0gd2luLm5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKTtcbiAgICByZXR1cm4gKHVhLmluZGV4T2YoJ3NhZmFyaScpID49IDAgJiYgdWEuaW5kZXhPZignY2hyb21lJykgPCAwICYmIHVhLmluZGV4T2YoJ2FuZHJvaWQnKSA8IDApO1xuICB9XG4gIHJldHVybiB7XG4gICAgaXNTYWZhcmk6IGlzU2FmYXJpKCksXG4gICAgaXNVaVdlYlZpZXc6IC8oaVBob25lfGlQb2R8aVBhZCkuKkFwcGxlV2ViS2l0KD8hLipTYWZhcmkpL2kudGVzdCh3aW4ubmF2aWdhdG9yLnVzZXJBZ2VudCksXG4gICAgaWU6IHdpbi5uYXZpZ2F0b3IucG9pbnRlckVuYWJsZWQgfHwgd2luLm5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkLFxuICAgIGllVG91Y2g6ICh3aW4ubmF2aWdhdG9yLm1zUG9pbnRlckVuYWJsZWQgJiYgd2luLm5hdmlnYXRvci5tc01heFRvdWNoUG9pbnRzID4gMSkgfHxcbiAgICAgICAgICAgICAod2luLm5hdmlnYXRvci5wb2ludGVyRW5hYmxlZCAmJiB3aW4ubmF2aWdhdG9yLm1heFRvdWNoUG9pbnRzID4gMSksXG4gICAgbHRlSUU5OiBpc0lFOSgpLFxuICB9O1xufSgpKTtcblxudmFyIHNsaWRlVG8gPSBmdW5jdGlvbiAoaW5kZXgsIHNwZWVkLCBydW5DYWxsYmFja3MsIGludGVybmFsKSB7XG4gIGlmICggaW5kZXggPT09IHZvaWQgMCApIGluZGV4ID0gMDtcbiAgaWYgKCBzcGVlZCA9PT0gdm9pZCAwICkgc3BlZWQgPSB0aGlzLnBhcmFtcy5zcGVlZDtcbiAgaWYgKCBydW5DYWxsYmFja3MgPT09IHZvaWQgMCApIHJ1bkNhbGxiYWNrcyA9IHRydWU7XG5cbiAgdmFyIHN3aXBlciA9IHRoaXM7XG4gIHZhciBzbGlkZUluZGV4ID0gaW5kZXg7XG4gIGlmIChzbGlkZUluZGV4IDwgMCkgeyBzbGlkZUluZGV4ID0gMDsgfVxuXG4gIHZhciBwYXJhbXMgPSBzd2lwZXIucGFyYW1zO1xuICB2YXIgc25hcEdyaWQgPSBzd2lwZXIuc25hcEdyaWQ7XG4gIHZhciBzbGlkZXNHcmlkID0gc3dpcGVyLnNsaWRlc0dyaWQ7XG4gIHZhciBwcmV2aW91c0luZGV4ID0gc3dpcGVyLnByZXZpb3VzSW5kZXg7XG4gIHZhciBhY3RpdmVJbmRleCA9IHN3aXBlci5hY3RpdmVJbmRleDtcbiAgdmFyIHJ0bCA9IHN3aXBlci5ydGw7XG4gIHZhciAkd3JhcHBlckVsID0gc3dpcGVyLiR3cmFwcGVyRWw7XG5cbiAgdmFyIHNuYXBJbmRleCA9IE1hdGguZmxvb3Ioc2xpZGVJbmRleCAvIHBhcmFtcy5zbGlkZXNQZXJHcm91cCk7XG4gIGlmIChzbmFwSW5kZXggPj0gc25hcEdyaWQubGVuZ3RoKSB7IHNuYXBJbmRleCA9IHNuYXBHcmlkLmxlbmd0aCAtIDE7IH1cblxuICBpZiAoKGFjdGl2ZUluZGV4IHx8IHBhcmFtcy5pbml0aWFsU2xpZGUgfHwgMCkgPT09IChwcmV2aW91c0luZGV4IHx8IDApICYmIHJ1bkNhbGxiYWNrcykge1xuICAgIHN3aXBlci5lbWl0KCdiZWZvcmVTbGlkZUNoYW5nZVN0YXJ0Jyk7XG4gIH1cblxuICB2YXIgdHJhbnNsYXRlID0gLXNuYXBHcmlkW3NuYXBJbmRleF07XG5cbiAgLy8gVXBkYXRlIHByb2dyZXNzXG4gIHN3aXBlci51cGRhdGVQcm9ncmVzcyh0cmFuc2xhdGUpO1xuXG4gIC8vIE5vcm1hbGl6ZSBzbGlkZUluZGV4XG4gIGlmIChwYXJhbXMubm9ybWFsaXplU2xpZGVJbmRleCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpZGVzR3JpZC5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgaWYgKC1NYXRoLmZsb29yKHRyYW5zbGF0ZSAqIDEwMCkgPj0gTWF0aC5mbG9vcihzbGlkZXNHcmlkW2ldICogMTAwKSkge1xuICAgICAgICBzbGlkZUluZGV4ID0gaTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBEaXJlY3Rpb25zIGxvY2tzXG4gIGlmICghc3dpcGVyLmFsbG93U2xpZGVOZXh0ICYmIHRyYW5zbGF0ZSA8IHN3aXBlci50cmFuc2xhdGUgJiYgdHJhbnNsYXRlIDwgc3dpcGVyLm1pblRyYW5zbGF0ZSgpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICghc3dpcGVyLmFsbG93U2xpZGVQcmV2ICYmIHRyYW5zbGF0ZSA+IHN3aXBlci50cmFuc2xhdGUgJiYgdHJhbnNsYXRlID4gc3dpcGVyLm1heFRyYW5zbGF0ZSgpKSB7XG4gICAgaWYgKChhY3RpdmVJbmRleCB8fCAwKSAhPT0gc2xpZGVJbmRleCkgeyByZXR1cm4gZmFsc2U7IH1cbiAgfVxuXG4gIC8vIFVwZGF0ZSBJbmRleFxuICBpZiAoKHJ0bCAmJiAtdHJhbnNsYXRlID09PSBzd2lwZXIudHJhbnNsYXRlKSB8fCAoIXJ0bCAmJiB0cmFuc2xhdGUgPT09IHN3aXBlci50cmFuc2xhdGUpKSB7XG4gICAgc3dpcGVyLnVwZGF0ZUFjdGl2ZUluZGV4KHNsaWRlSW5kZXgpO1xuICAgIC8vIFVwZGF0ZSBIZWlnaHRcbiAgICBpZiAocGFyYW1zLmF1dG9IZWlnaHQpIHtcbiAgICAgIHN3aXBlci51cGRhdGVBdXRvSGVpZ2h0KCk7XG4gICAgfVxuICAgIHN3aXBlci51cGRhdGVTbGlkZXNDbGFzc2VzKCk7XG4gICAgaWYgKHBhcmFtcy5lZmZlY3QgIT09ICdzbGlkZScpIHtcbiAgICAgIHN3aXBlci5zZXRUcmFuc2xhdGUodHJhbnNsYXRlKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKHNwZWVkID09PSAwIHx8IEJyb3dzZXIubHRlSUU5KSB7XG4gICAgc3dpcGVyLnNldFRyYW5zaXRpb24oMCk7XG4gICAgc3dpcGVyLnNldFRyYW5zbGF0ZSh0cmFuc2xhdGUpO1xuICAgIHN3aXBlci51cGRhdGVBY3RpdmVJbmRleChzbGlkZUluZGV4KTtcbiAgICBzd2lwZXIudXBkYXRlU2xpZGVzQ2xhc3NlcygpO1xuICAgIHN3aXBlci5lbWl0KCdiZWZvcmVUcmFuc2l0aW9uU3RhcnQnLCBzcGVlZCwgaW50ZXJuYWwpO1xuICAgIHN3aXBlci50cmFuc2l0aW9uU3RhcnQocnVuQ2FsbGJhY2tzKTtcbiAgICBzd2lwZXIudHJhbnNpdGlvbkVuZChydW5DYWxsYmFja3MpO1xuICB9IGVsc2Uge1xuICAgIHN3aXBlci5zZXRUcmFuc2l0aW9uKHNwZWVkKTtcbiAgICBzd2lwZXIuc2V0VHJhbnNsYXRlKHRyYW5zbGF0ZSk7XG4gICAgc3dpcGVyLnVwZGF0ZUFjdGl2ZUluZGV4KHNsaWRlSW5kZXgpO1xuICAgIHN3aXBlci51cGRhdGVTbGlkZXNDbGFzc2VzKCk7XG4gICAgc3dpcGVyLmVtaXQoJ2JlZm9yZVRyYW5zaXRpb25TdGFydCcsIHNwZWVkLCBpbnRlcm5hbCk7XG4gICAgc3dpcGVyLnRyYW5zaXRpb25TdGFydChydW5DYWxsYmFja3MpO1xuICAgIGlmICghc3dpcGVyLmFuaW1hdGluZykge1xuICAgICAgc3dpcGVyLmFuaW1hdGluZyA9IHRydWU7XG4gICAgICAkd3JhcHBlckVsLnRyYW5zaXRpb25FbmQoZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIXN3aXBlciB8fCBzd2lwZXIuZGVzdHJveWVkKSB7IHJldHVybjsgfVxuICAgICAgICBzd2lwZXIudHJhbnNpdGlvbkVuZChydW5DYWxsYmFja3MpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKiBlc2xpbnQgbm8tdW51c2VkLXZhcnM6IFwib2ZmXCIgKi9cbnZhciBzbGlkZU5leHQgPSBmdW5jdGlvbiAoc3BlZWQsIHJ1bkNhbGxiYWNrcywgaW50ZXJuYWwpIHtcbiAgaWYgKCBzcGVlZCA9PT0gdm9pZCAwICkgc3BlZWQgPSB0aGlzLnBhcmFtcy5zcGVlZDtcbiAgaWYgKCBydW5DYWxsYmFja3MgPT09IHZvaWQgMCApIHJ1bkNhbGxiYWNrcyA9IHRydWU7XG5cbiAgdmFyIHN3aXBlciA9IHRoaXM7XG4gIHZhciBwYXJhbXMgPSBzd2lwZXIucGFyYW1zO1xuICB2YXIgYW5pbWF0aW5nID0gc3dpcGVyLmFuaW1hdGluZztcbiAgaWYgKHBhcmFtcy5sb29wKSB7XG4gICAgaWYgKGFuaW1hdGluZykgeyByZXR1cm4gZmFsc2U7IH1cbiAgICBzd2lwZXIubG9vcEZpeCgpO1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxuICAgIHN3aXBlci5fY2xpZW50TGVmdCA9IHN3aXBlci4kd3JhcHBlckVsWzBdLmNsaWVudExlZnQ7XG4gICAgcmV0dXJuIHN3aXBlci5zbGlkZVRvKHN3aXBlci5hY3RpdmVJbmRleCArIHBhcmFtcy5zbGlkZXNQZXJHcm91cCwgc3BlZWQsIHJ1bkNhbGxiYWNrcywgaW50ZXJuYWwpO1xuICB9XG4gIHJldHVybiBzd2lwZXIuc2xpZGVUbyhzd2lwZXIuYWN0aXZlSW5kZXggKyBwYXJhbXMuc2xpZGVzUGVyR3JvdXAsIHNwZWVkLCBydW5DYWxsYmFja3MsIGludGVybmFsKTtcbn07XG5cbi8qIGVzbGludCBuby11bnVzZWQtdmFyczogXCJvZmZcIiAqL1xudmFyIHNsaWRlUHJldiA9IGZ1bmN0aW9uIChzcGVlZCwgcnVuQ2FsbGJhY2tzLCBpbnRlcm5hbCkge1xuICBpZiAoIHNwZWVkID09PSB2b2lkIDAgKSBzcGVlZCA9IHRoaXMucGFyYW1zLnNwZWVkO1xuICBpZiAoIHJ1bkNhbGxiYWNrcyA9PT0gdm9pZCAwICkgcnVuQ2FsbGJhY2tzID0gdHJ1ZTtcblxuICB2YXIgc3dpcGVyID0gdGhpcztcbiAgdmFyIHBhcmFtcyA9IHN3aXBlci5wYXJhbXM7XG4gIHZhciBhbmltYXRpbmcgPSBzd2lwZXIuYW5pbWF0aW5nO1xuXG4gIGlmIChwYXJhbXMubG9vcCkge1xuICAgIGlmIChhbmltYXRpbmcpIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgc3dpcGVyLmxvb3BGaXgoKTtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmVcbiAgICBzd2lwZXIuX2NsaWVudExlZnQgPSBzd2lwZXIuJHdyYXBwZXJFbFswXS5jbGllbnRMZWZ0O1xuICAgIHJldHVybiBzd2lwZXIuc2xpZGVUbyhzd2lwZXIuYWN0aXZlSW5kZXggLSAxLCBzcGVlZCwgcnVuQ2FsbGJhY2tzLCBpbnRlcm5hbCk7XG4gIH1cbiAgcmV0dXJuIHN3aXBlci5zbGlkZVRvKHN3aXBlci5hY3RpdmVJbmRleCAtIDEsIHNwZWVkLCBydW5DYWxsYmFja3MsIGludGVybmFsKTtcbn07XG5cbi8qIGVzbGludCBuby11bnVzZWQtdmFyczogXCJvZmZcIiAqL1xudmFyIHNsaWRlUmVzZXQgPSBmdW5jdGlvbiAoc3BlZWQsIHJ1bkNhbGxiYWNrcywgaW50ZXJuYWwpIHtcbiAgaWYgKCBzcGVlZCA9PT0gdm9pZCAwICkgc3BlZWQgPSB0aGlzLnBhcmFtcy5zcGVlZDtcbiAgaWYgKCBydW5DYWxsYmFja3MgPT09IHZvaWQgMCApIHJ1bkNhbGxiYWNrcyA9IHRydWU7XG5cbiAgdmFyIHN3aXBlciA9IHRoaXM7XG4gIHJldHVybiBzd2lwZXIuc2xpZGVUbyhzd2lwZXIuYWN0aXZlSW5kZXgsIHNwZWVkLCBydW5DYWxsYmFja3MsIGludGVybmFsKTtcbn07XG5cbnZhciBzbGlkZVRvQ2xpY2tlZFNsaWRlID0gZnVuY3Rpb24gKCkge1xuICB2YXIgc3dpcGVyID0gdGhpcztcbiAgdmFyIHBhcmFtcyA9IHN3aXBlci5wYXJhbXM7XG4gIHZhciAkd3JhcHBlckVsID0gc3dpcGVyLiR3cmFwcGVyRWw7XG5cbiAgdmFyIHNsaWRlc1BlclZpZXcgPSBwYXJhbXMuc2xpZGVzUGVyVmlldyA9PT0gJ2F1dG8nID8gc3dpcGVyLnNsaWRlc1BlclZpZXdEeW5hbWljKCkgOiBwYXJhbXMuc2xpZGVzUGVyVmlldztcbiAgdmFyIHNsaWRlVG9JbmRleCA9IHN3aXBlci5jbGlja2VkSW5kZXg7XG4gIHZhciByZWFsSW5kZXg7XG4gIGlmIChwYXJhbXMubG9vcCkge1xuICAgIGlmIChzd2lwZXIuYW5pbWF0aW5nKSB7IHJldHVybjsgfVxuICAgIHJlYWxJbmRleCA9IHBhcnNlSW50KCQkMShzd2lwZXIuY2xpY2tlZFNsaWRlKS5hdHRyKCdkYXRhLXN3aXBlci1zbGlkZS1pbmRleCcpLCAxMCk7XG4gICAgaWYgKHBhcmFtcy5jZW50ZXJlZFNsaWRlcykge1xuICAgICAgaWYgKFxuICAgICAgICAoc2xpZGVUb0luZGV4IDwgc3dpcGVyLmxvb3BlZFNsaWRlcyAtIChzbGlkZXNQZXJWaWV3IC8gMikpIHx8XG4gICAgICAgIChzbGlkZVRvSW5kZXggPiAoc3dpcGVyLnNsaWRlcy5sZW5ndGggLSBzd2lwZXIubG9vcGVkU2xpZGVzKSArIChzbGlkZXNQZXJWaWV3IC8gMikpXG4gICAgICApIHtcbiAgICAgICAgc3dpcGVyLmxvb3BGaXgoKTtcbiAgICAgICAgc2xpZGVUb0luZGV4ID0gJHdyYXBwZXJFbFxuICAgICAgICAgIC5jaGlsZHJlbigoXCIuXCIgKyAocGFyYW1zLnNsaWRlQ2xhc3MpICsgXCJbZGF0YS1zd2lwZXItc2xpZGUtaW5kZXg9XFxcIlwiICsgcmVhbEluZGV4ICsgXCJcXFwiXTpub3QoLlwiICsgKHBhcmFtcy5zbGlkZUR1cGxpY2F0ZUNsYXNzKSArIFwiKVwiKSlcbiAgICAgICAgICAuZXEoMClcbiAgICAgICAgICAuaW5kZXgoKTtcblxuICAgICAgICBVdGlscy5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgc3dpcGVyLnNsaWRlVG8oc2xpZGVUb0luZGV4KTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzd2lwZXIuc2xpZGVUbyhzbGlkZVRvSW5kZXgpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoc2xpZGVUb0luZGV4ID4gc3dpcGVyLnNsaWRlcy5sZW5ndGggLSBzbGlkZXNQZXJWaWV3KSB7XG4gICAgICBzd2lwZXIubG9vcEZpeCgpO1xuICAgICAgc2xpZGVUb0luZGV4ID0gJHdyYXBwZXJFbFxuICAgICAgICAuY2hpbGRyZW4oKFwiLlwiICsgKHBhcmFtcy5zbGlkZUNsYXNzKSArIFwiW2RhdGEtc3dpcGVyLXNsaWRlLWluZGV4PVxcXCJcIiArIHJlYWxJbmRleCArIFwiXFxcIl06bm90KC5cIiArIChwYXJhbXMuc2xpZGVEdXBsaWNhdGVDbGFzcykgKyBcIilcIikpXG4gICAgICAgIC5lcSgwKVxuICAgICAgICAuaW5kZXgoKTtcblxuICAgICAgVXRpbHMubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICBzd2lwZXIuc2xpZGVUbyhzbGlkZVRvSW5kZXgpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN3aXBlci5zbGlkZVRvKHNsaWRlVG9JbmRleCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHN3aXBlci5zbGlkZVRvKHNsaWRlVG9JbmRleCk7XG4gIH1cbn07XG5cbnZhciBzbGlkZSA9IHtcbiAgc2xpZGVUbzogc2xpZGVUbyxcbiAgc2xpZGVOZXh0OiBzbGlkZU5leHQsXG4gIHNsaWRlUHJldjogc2xpZGVQcmV2LFxuICBzbGlkZVJlc2V0OiBzbGlkZVJlc2V0LFxuICBzbGlkZVRvQ2xpY2tlZFNsaWRlOiBzbGlkZVRvQ2xpY2tlZFNsaWRlLFxufTtcblxudmFyIGxvb3BDcmVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBzd2lwZXIgPSB0aGlzO1xuICB2YXIgcGFyYW1zID0gc3dpcGVyLnBhcmFtcztcbiAgdmFyICR3cmFwcGVyRWwgPSBzd2lwZXIuJHdyYXBwZXJFbDtcbiAgLy8gUmVtb3ZlIGR1cGxpY2F0ZWQgc2xpZGVzXG4gICR3cmFwcGVyRWwuY2hpbGRyZW4oKFwiLlwiICsgKHBhcmFtcy5zbGlkZUNsYXNzKSArIFwiLlwiICsgKHBhcmFtcy5zbGlkZUR1cGxpY2F0ZUNsYXNzKSkpLnJlbW92ZSgpO1xuXG4gIHZhciBzbGlkZXMgPSAkd3JhcHBlckVsLmNoaWxkcmVuKChcIi5cIiArIChwYXJhbXMuc2xpZGVDbGFzcykpKTtcblxuICBpZiAocGFyYW1zLmxvb3BGaWxsR3JvdXBXaXRoQmxhbmspIHtcbiAgICB2YXIgYmxhbmtTbGlkZXNOdW0gPSBwYXJhbXMuc2xpZGVzUGVyR3JvdXAgLSAoc2xpZGVzLmxlbmd0aCAlIHBhcmFtcy5zbGlkZXNQZXJHcm91cCk7XG4gICAgaWYgKGJsYW5rU2xpZGVzTnVtICE9PSBwYXJhbXMuc2xpZGVzUGVyR3JvdXApIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYmxhbmtTbGlkZXNOdW07IGkgKz0gMSkge1xuICAgICAgICB2YXIgYmxhbmtOb2RlID0gJCQxKGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKSkuYWRkQ2xhc3MoKChwYXJhbXMuc2xpZGVDbGFzcykgKyBcIiBcIiArIChwYXJhbXMuc2xpZGVCbGFua0NsYXNzKSkpO1xuICAgICAgICAkd3JhcHBlckVsLmFwcGVuZChibGFua05vZGUpO1xuICAgICAgfVxuICAgICAgc2xpZGVzID0gJHdyYXBwZXJFbC5jaGlsZHJlbigoXCIuXCIgKyAocGFyYW1zLnNsaWRlQ2xhc3MpKSk7XG4gICAgfVxuICB9XG5cbiAgaWYgKHBhcmFtcy5zbGlkZXNQZXJWaWV3ID09PSAnYXV0bycgJiYgIXBhcmFtcy5sb29wZWRTbGlkZXMpIHsgcGFyYW1zLmxvb3BlZFNsaWRlcyA9IHNsaWRlcy5sZW5ndGg7IH1cblxuICBzd2lwZXIubG9vcGVkU2xpZGVzID0gcGFyc2VJbnQocGFyYW1zLmxvb3BlZFNsaWRlcyB8fCBwYXJhbXMuc2xpZGVzUGVyVmlldywgMTApO1xuICBzd2lwZXIubG9vcGVkU2xpZGVzICs9IHBhcmFtcy5sb29wQWRkaXRpb25hbFNsaWRlcztcbiAgaWYgKHN3aXBlci5sb29wZWRTbGlkZXMgPiBzbGlkZXMubGVuZ3RoKSB7XG4gICAgc3dpcGVyLmxvb3BlZFNsaWRlcyA9IHNsaWRlcy5sZW5ndGg7XG4gIH1cblxuICB2YXIgcHJlcGVuZFNsaWRlcyA9IFtdO1xuICB2YXIgYXBwZW5kU2xpZGVzID0gW107XG4gIHNsaWRlcy5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWwpIHtcbiAgICB2YXIgc2xpZGUgPSAkJDEoZWwpO1xuICAgIGlmIChpbmRleCA8IHN3aXBlci5sb29wZWRTbGlkZXMpIHsgYXBwZW5kU2xpZGVzLnB1c2goZWwpOyB9XG4gICAgaWYgKGluZGV4IDwgc2xpZGVzLmxlbmd0aCAmJiBpbmRleCA+PSBzbGlkZXMubGVuZ3RoIC0gc3dpcGVyLmxvb3BlZFNsaWRlcykgeyBwcmVwZW5kU2xpZGVzLnB1c2goZWwpOyB9XG4gICAgc2xpZGUuYXR0cignZGF0YS1zd2lwZXItc2xpZGUtaW5kZXgnLCBpbmRleCk7XG4gIH0pO1xuICBmb3IgKHZhciBpJDEgPSAwOyBpJDEgPCBhcHBlbmRTbGlkZXMubGVuZ3RoOyBpJDEgKz0gMSkge1xuICAgICR3cmFwcGVyRWwuYXBwZW5kKCQkMShhcHBlbmRTbGlkZXNbaSQxXS5jbG9uZU5vZGUodHJ1ZSkpLmFkZENsYXNzKHBhcmFtcy5zbGlkZUR1cGxpY2F0ZUNsYXNzKSk7XG4gIH1cbiAgZm9yICh2YXIgaSQyID0gcHJlcGVuZFNsaWRlcy5sZW5ndGggLSAxOyBpJDIgPj0gMDsgaSQyIC09IDEpIHtcbiAgICAkd3JhcHBlckVsLnByZXBlbmQoJCQxKHByZXBlbmRTbGlkZXNbaSQyXS5jbG9uZU5vZGUodHJ1ZSkpLmFkZENsYXNzKHBhcmFtcy5zbGlkZUR1cGxpY2F0ZUNsYXNzKSk7XG4gIH1cbn07XG5cbnZhciBsb29wRml4ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgc3dpcGVyID0gdGhpcztcbiAgdmFyIHBhcmFtcyA9IHN3aXBlci5wYXJhbXM7XG4gIHZhciBhY3RpdmVJbmRleCA9IHN3aXBlci5hY3RpdmVJbmRleDtcbiAgdmFyIHNsaWRlcyA9IHN3aXBlci5zbGlkZXM7XG4gIHZhciBsb29wZWRTbGlkZXMgPSBzd2lwZXIubG9vcGVkU2xpZGVzO1xuICB2YXIgYWxsb3dTbGlkZVByZXYgPSBzd2lwZXIuYWxsb3dTbGlkZVByZXY7XG4gIHZhciBhbGxvd1NsaWRlTmV4dCA9IHN3aXBlci5hbGxvd1NsaWRlTmV4dDtcbiAgdmFyIG5ld0luZGV4O1xuICBzd2lwZXIuYWxsb3dTbGlkZVByZXYgPSB0cnVlO1xuICBzd2lwZXIuYWxsb3dTbGlkZU5leHQgPSB0cnVlO1xuICAvLyBGaXggRm9yIE5lZ2F0aXZlIE92ZXJzbGlkaW5nXG4gIGlmIChhY3RpdmVJbmRleCA8IGxvb3BlZFNsaWRlcykge1xuICAgIG5ld0luZGV4ID0gKHNsaWRlcy5sZW5ndGggLSAobG9vcGVkU2xpZGVzICogMykpICsgYWN0aXZlSW5kZXg7XG4gICAgbmV3SW5kZXggKz0gbG9vcGVkU2xpZGVzO1xuICAgIHN3aXBlci5zbGlkZVRvKG5ld0luZGV4LCAwLCBmYWxzZSwgdHJ1ZSk7XG4gIH0gZWxzZSBpZiAoKHBhcmFtcy5zbGlkZXNQZXJWaWV3ID09PSAnYXV0bycgJiYgYWN0aXZlSW5kZXggPj0gbG9vcGVkU2xpZGVzICogMikgfHwgKGFjdGl2ZUluZGV4ID4gc2xpZGVzLmxlbmd0aCAtIChwYXJhbXMuc2xpZGVzUGVyVmlldyAqIDIpKSkge1xuICAgIC8vIEZpeCBGb3IgUG9zaXRpdmUgT3ZlcnNsaWRpbmdcbiAgICBuZXdJbmRleCA9IC1zbGlkZXMubGVuZ3RoICsgYWN0aXZlSW5kZXggKyBsb29wZWRTbGlkZXM7XG4gICAgbmV3SW5kZXggKz0gbG9vcGVkU2xpZGVzO1xuICAgIHN3aXBlci5zbGlkZVRvKG5ld0luZGV4LCAwLCBmYWxzZSwgdHJ1ZSk7XG4gIH1cbiAgc3dpcGVyLmFsbG93U2xpZGVQcmV2ID0gYWxsb3dTbGlkZVByZXY7XG4gIHN3aXBlci5hbGxvd1NsaWRlTmV4dCA9IGFsbG93U2xpZGVOZXh0O1xufTtcblxudmFyIGxvb3BEZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgc3dpcGVyID0gdGhpcztcbiAgdmFyICR3cmFwcGVyRWwgPSBzd2lwZXIuJHdyYXBwZXJFbDtcbiAgdmFyIHBhcmFtcyA9IHN3aXBlci5wYXJhbXM7XG4gIHZhciBzbGlkZXMgPSBzd2lwZXIuc2xpZGVzO1xuICAkd3JhcHBlckVsLmNoaWxkcmVuKChcIi5cIiArIChwYXJhbXMuc2xpZGVDbGFzcykgKyBcIi5cIiArIChwYXJhbXMuc2xpZGVEdXBsaWNhdGVDbGFzcykpKS5yZW1vdmUoKTtcbiAgc2xpZGVzLnJlbW92ZUF0dHIoJ2RhdGEtc3dpcGVyLXNsaWRlLWluZGV4Jyk7XG59O1xuXG52YXIgbG9vcCA9IHtcbiAgbG9vcENyZWF0ZTogbG9vcENyZWF0ZSxcbiAgbG9vcEZpeDogbG9vcEZpeCxcbiAgbG9vcERlc3Ryb3k6IGxvb3BEZXN0cm95LFxufTtcblxudmFyIHNldEdyYWJDdXJzb3IgPSBmdW5jdGlvbiAobW92aW5nKSB7XG4gIHZhciBzd2lwZXIgPSB0aGlzO1xuICBpZiAoU3VwcG9ydC50b3VjaCB8fCAhc3dpcGVyLnBhcmFtcy5zaW11bGF0ZVRvdWNoKSB7IHJldHVybjsgfVxuICB2YXIgZWwgPSBzd2lwZXIuZWw7XG4gIGVsLnN0eWxlLmN1cnNvciA9ICdtb3ZlJztcbiAgZWwuc3R5bGUuY3Vyc29yID0gbW92aW5nID8gJy13ZWJraXQtZ3JhYmJpbmcnIDogJy13ZWJraXQtZ3JhYic7XG4gIGVsLnN0eWxlLmN1cnNvciA9IG1vdmluZyA/ICctbW96LWdyYWJiaW4nIDogJy1tb3otZ3JhYic7XG4gIGVsLnN0eWxlLmN1cnNvciA9IG1vdmluZyA/ICdncmFiYmluZycgOiAnZ3JhYic7XG59O1xuXG52YXIgdW5zZXRHcmFiQ3Vyc29yID0gZnVuY3Rpb24gKCkge1xuICB2YXIgc3dpcGVyID0gdGhpcztcbiAgaWYgKFN1cHBvcnQudG91Y2gpIHsgcmV0dXJuOyB9XG4gIHN3aXBlci5lbC5zdHlsZS5jdXJzb3IgPSAnJztcbn07XG5cbnZhciBncmFiQ3Vyc29yID0ge1xuICBzZXRHcmFiQ3Vyc29yOiBzZXRHcmFiQ3Vyc29yLFxuICB1bnNldEdyYWJDdXJzb3I6IHVuc2V0R3JhYkN1cnNvcixcbn07XG5cbnZhciBhcHBlbmRTbGlkZSA9IGZ1bmN0aW9uIChzbGlkZXMpIHtcbiAgdmFyIHN3aXBlciA9IHRoaXM7XG4gIHZhciAkd3JhcHBlckVsID0gc3dpcGVyLiR3cmFwcGVyRWw7XG4gIHZhciBwYXJhbXMgPSBzd2lwZXIucGFyYW1zO1xuICBpZiAocGFyYW1zLmxvb3ApIHtcbiAgICBzd2lwZXIubG9vcERlc3Ryb3koKTtcbiAgfVxuICBpZiAodHlwZW9mIHNsaWRlcyA9PT0gJ29iamVjdCcgJiYgJ2xlbmd0aCcgaW4gc2xpZGVzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGlkZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIGlmIChzbGlkZXNbaV0pIHsgJHdyYXBwZXJFbC5hcHBlbmQoc2xpZGVzW2ldKTsgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAkd3JhcHBlckVsLmFwcGVuZChzbGlkZXMpO1xuICB9XG4gIGlmIChwYXJhbXMubG9vcCkge1xuICAgIHN3aXBlci5sb29wQ3JlYXRlKCk7XG4gIH1cbiAgaWYgKCEocGFyYW1zLm9ic2VydmVyICYmIFN1cHBvcnQub2JzZXJ2ZXIpKSB7XG4gICAgc3dpcGVyLnVwZGF0ZSgpO1xuICB9XG59O1xuXG52YXIgcHJlcGVuZFNsaWRlID0gZnVuY3Rpb24gKHNsaWRlcykge1xuICB2YXIgc3dpcGVyID0gdGhpcztcbiAgdmFyIHBhcmFtcyA9IHN3aXBlci5wYXJhbXM7XG4gIHZhciAkd3JhcHBlckVsID0gc3dpcGVyLiR3cmFwcGVyRWw7XG4gIHZhciBhY3RpdmVJbmRleCA9IHN3aXBlci5hY3RpdmVJbmRleDtcblxuICBpZiAocGFyYW1zLmxvb3ApIHtcbiAgICBzd2lwZXIubG9vcERlc3Ryb3koKTtcbiAgfVxuICB2YXIgbmV3QWN0aXZlSW5kZXggPSBhY3RpdmVJbmRleCArIDE7XG4gIGlmICh0eXBlb2Ygc2xpZGVzID09PSAnb2JqZWN0JyAmJiAnbGVuZ3RoJyBpbiBzbGlkZXMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsaWRlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgaWYgKHNsaWRlc1tpXSkgeyAkd3JhcHBlckVsLnByZXBlbmQoc2xpZGVzW2ldKTsgfVxuICAgIH1cbiAgICBuZXdBY3RpdmVJbmRleCA9IGFjdGl2ZUluZGV4ICsgc2xpZGVzLmxlbmd0aDtcbiAgfSBlbHNlIHtcbiAgICAkd3JhcHBlckVsLnByZXBlbmQoc2xpZGVzKTtcbiAgfVxuICBpZiAocGFyYW1zLmxvb3ApIHtcbiAgICBzd2lwZXIubG9vcENyZWF0ZSgpO1xuICB9XG4gIGlmICghKHBhcmFtcy5vYnNlcnZlciAmJiBTdXBwb3J0Lm9ic2VydmVyKSkge1xuICAgIHN3aXBlci51cGRhdGUoKTtcbiAgfVxuICBzd2lwZXIuc2xpZGVUbyhuZXdBY3RpdmVJbmRleCwgMCwgZmFsc2UpO1xufTtcblxudmFyIHJlbW92ZVNsaWRlID0gZnVuY3Rpb24gKHNsaWRlc0luZGV4ZXMpIHtcbiAgdmFyIHN3aXBlciA9IHRoaXM7XG4gIHZhciBwYXJhbXMgPSBzd2lwZXIucGFyYW1zO1xuICB2YXIgJHdyYXBwZXJFbCA9IHN3aXBlci4kd3JhcHBlckVsO1xuICB2YXIgYWN0aXZlSW5kZXggPSBzd2lwZXIuYWN0aXZlSW5kZXg7XG5cbiAgaWYgKHBhcmFtcy5sb29wKSB7XG4gICAgc3dpcGVyLmxvb3BEZXN0cm95KCk7XG4gICAgc3dpcGVyLnNsaWRlcyA9ICR3cmFwcGVyRWwuY2hpbGRyZW4oKFwiLlwiICsgKHBhcmFtcy5zbGlkZUNsYXNzKSkpO1xuICB9XG4gIHZhciBuZXdBY3RpdmVJbmRleCA9IGFjdGl2ZUluZGV4O1xuICB2YXIgaW5kZXhUb1JlbW92ZTtcblxuICBpZiAodHlwZW9mIHNsaWRlc0luZGV4ZXMgPT09ICdvYmplY3QnICYmICdsZW5ndGgnIGluIHNsaWRlc0luZGV4ZXMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsaWRlc0luZGV4ZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIGluZGV4VG9SZW1vdmUgPSBzbGlkZXNJbmRleGVzW2ldO1xuICAgICAgaWYgKHN3aXBlci5zbGlkZXNbaW5kZXhUb1JlbW92ZV0pIHsgc3dpcGVyLnNsaWRlcy5lcShpbmRleFRvUmVtb3ZlKS5yZW1vdmUoKTsgfVxuICAgICAgaWYgKGluZGV4VG9SZW1vdmUgPCBuZXdBY3RpdmVJbmRleCkgeyBuZXdBY3RpdmVJbmRleCAtPSAxOyB9XG4gICAgfVxuICAgIG5ld0FjdGl2ZUluZGV4ID0gTWF0aC5tYXgobmV3QWN0aXZlSW5kZXgsIDApO1xuICB9IGVsc2Uge1xuICAgIGluZGV4VG9SZW1vdmUgPSBzbGlkZXNJbmRleGVzO1xuICAgIGlmIChzd2lwZXIuc2xpZGVzW2luZGV4VG9SZW1vdmVdKSB7IHN3aXBlci5zbGlkZXMuZXEoaW5kZXhUb1JlbW92ZSkucmVtb3ZlKCk7IH1cbiAgICBpZiAoaW5kZXhUb1JlbW92ZSA8IG5ld0FjdGl2ZUluZGV4KSB7IG5ld0FjdGl2ZUluZGV4IC09IDE7IH1cbiAgICBuZXdBY3RpdmVJbmRleCA9IE1hdGgubWF4KG5ld0FjdGl2ZUluZGV4LCAwKTtcbiAgfVxuXG4gIGlmIChwYXJhbXMubG9vcCkge1xuICAgIHN3aXBlci5sb29wQ3JlYXRlKCk7XG4gIH1cblxuICBpZiAoIShwYXJhbXMub2JzZXJ2ZXIgJiYgU3VwcG9ydC5vYnNlcnZlcikpIHtcbiAgICBzd2lwZXIudXBkYXRlKCk7XG4gIH1cbiAgaWYgKHBhcmFtcy5sb29wKSB7XG4gICAgc3dpcGVyLnNsaWRlVG8obmV3QWN0aXZlSW5kZXggKyBzd2lwZXIubG9vcGVkU2xpZGVzLCAwLCBmYWxzZSk7XG4gIH0gZWxzZSB7XG4gICAgc3dpcGVyLnNsaWRlVG8obmV3QWN0aXZlSW5kZXgsIDAsIGZhbHNlKTtcbiAgfVxufTtcblxudmFyIHJlbW92ZUFsbFNsaWRlcyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHN3aXBlciA9IHRoaXM7XG5cbiAgdmFyIHNsaWRlc0luZGV4ZXMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzd2lwZXIuc2xpZGVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgc2xpZGVzSW5kZXhlcy5wdXNoKGkpO1xuICB9XG4gIHN3aXBlci5yZW1vdmVTbGlkZShzbGlkZXNJbmRleGVzKTtcbn07XG5cbnZhciBtYW5pcHVsYXRpb24gPSB7XG4gIGFwcGVuZFNsaWRlOiBhcHBlbmRTbGlkZSxcbiAgcHJlcGVuZFNsaWRlOiBwcmVwZW5kU2xpZGUsXG4gIHJlbW92ZVNsaWRlOiByZW1vdmVTbGlkZSxcbiAgcmVtb3ZlQWxsU2xpZGVzOiByZW1vdmVBbGxTbGlkZXMsXG59O1xuXG52YXIgRGV2aWNlID0gKGZ1bmN0aW9uIERldmljZSgpIHtcbiAgdmFyIHVhID0gd2luLm5hdmlnYXRvci51c2VyQWdlbnQ7XG5cbiAgdmFyIGRldmljZSA9IHtcbiAgICBpb3M6IGZhbHNlLFxuICAgIGFuZHJvaWQ6IGZhbHNlLFxuICAgIGFuZHJvaWRDaHJvbWU6IGZhbHNlLFxuICAgIGRlc2t0b3A6IGZhbHNlLFxuICAgIHdpbmRvd3M6IGZhbHNlLFxuICAgIGlwaG9uZTogZmFsc2UsXG4gICAgaXBvZDogZmFsc2UsXG4gICAgaXBhZDogZmFsc2UsXG4gICAgY29yZG92YTogd2luLmNvcmRvdmEgfHwgd2luLnBob25lZ2FwLFxuICAgIHBob25lZ2FwOiB3aW4uY29yZG92YSB8fCB3aW4ucGhvbmVnYXAsXG4gIH07XG5cbiAgdmFyIHdpbmRvd3MgPSB1YS5tYXRjaCgvKFdpbmRvd3MgUGhvbmUpOz9bXFxzXFwvXSsoW1xcZC5dKyk/Lyk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgdmFyIGFuZHJvaWQgPSB1YS5tYXRjaCgvKEFuZHJvaWQpOz9bXFxzXFwvXSsoW1xcZC5dKyk/Lyk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgdmFyIGlwYWQgPSB1YS5tYXRjaCgvKGlQYWQpLipPU1xccyhbXFxkX10rKS8pO1xuICB2YXIgaXBvZCA9IHVhLm1hdGNoKC8oaVBvZCkoLipPU1xccyhbXFxkX10rKSk/Lyk7XG4gIHZhciBpcGhvbmUgPSAhaXBhZCAmJiB1YS5tYXRjaCgvKGlQaG9uZVxcc09TfGlPUylcXHMoW1xcZF9dKykvKTtcblxuXG4gIC8vIFdpbmRvd3NcbiAgaWYgKHdpbmRvd3MpIHtcbiAgICBkZXZpY2Uub3MgPSAnd2luZG93cyc7XG4gICAgZGV2aWNlLm9zVmVyc2lvbiA9IHdpbmRvd3NbMl07XG4gICAgZGV2aWNlLndpbmRvd3MgPSB0cnVlO1xuICB9XG4gIC8vIEFuZHJvaWRcbiAgaWYgKGFuZHJvaWQgJiYgIXdpbmRvd3MpIHtcbiAgICBkZXZpY2Uub3MgPSAnYW5kcm9pZCc7XG4gICAgZGV2aWNlLm9zVmVyc2lvbiA9IGFuZHJvaWRbMl07XG4gICAgZGV2aWNlLmFuZHJvaWQgPSB0cnVlO1xuICAgIGRldmljZS5hbmRyb2lkQ2hyb21lID0gdWEudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdjaHJvbWUnKSA+PSAwO1xuICB9XG4gIGlmIChpcGFkIHx8IGlwaG9uZSB8fCBpcG9kKSB7XG4gICAgZGV2aWNlLm9zID0gJ2lvcyc7XG4gICAgZGV2aWNlLmlvcyA9IHRydWU7XG4gIH1cbiAgLy8gaU9TXG4gIGlmIChpcGhvbmUgJiYgIWlwb2QpIHtcbiAgICBkZXZpY2Uub3NWZXJzaW9uID0gaXBob25lWzJdLnJlcGxhY2UoL18vZywgJy4nKTtcbiAgICBkZXZpY2UuaXBob25lID0gdHJ1ZTtcbiAgfVxuICBpZiAoaXBhZCkge1xuICAgIGRldmljZS5vc1ZlcnNpb24gPSBpcGFkWzJdLnJlcGxhY2UoL18vZywgJy4nKTtcbiAgICBkZXZpY2UuaXBhZCA9IHRydWU7XG4gIH1cbiAgaWYgKGlwb2QpIHtcbiAgICBkZXZpY2Uub3NWZXJzaW9uID0gaXBvZFszXSA/IGlwb2RbM10ucmVwbGFjZSgvXy9nLCAnLicpIDogbnVsbDtcbiAgICBkZXZpY2UuaXBob25lID0gdHJ1ZTtcbiAgfVxuICAvLyBpT1MgOCsgY2hhbmdlZCBVQVxuICBpZiAoZGV2aWNlLmlvcyAmJiBkZXZpY2Uub3NWZXJzaW9uICYmIHVhLmluZGV4T2YoJ1ZlcnNpb24vJykgPj0gMCkge1xuICAgIGlmIChkZXZpY2Uub3NWZXJzaW9uLnNwbGl0KCcuJylbMF0gPT09ICcxMCcpIHtcbiAgICAgIGRldmljZS5vc1ZlcnNpb24gPSB1YS50b0xvd2VyQ2FzZSgpLnNwbGl0KCd2ZXJzaW9uLycpWzFdLnNwbGl0KCcgJylbMF07XG4gICAgfVxuICB9XG5cbiAgLy8gRGVza3RvcFxuICBkZXZpY2UuZGVza3RvcCA9ICEoZGV2aWNlLm9zIHx8IGRldmljZS5hbmRyb2lkIHx8IGRldmljZS53ZWJWaWV3KTtcblxuICAvLyBXZWJ2aWV3XG4gIGRldmljZS53ZWJWaWV3ID0gKGlwaG9uZSB8fCBpcGFkIHx8IGlwb2QpICYmIHVhLm1hdGNoKC8uKkFwcGxlV2ViS2l0KD8hLipTYWZhcmkpL2kpO1xuXG4gIC8vIE1pbmltYWwgVUlcbiAgaWYgKGRldmljZS5vcyAmJiBkZXZpY2Uub3MgPT09ICdpb3MnKSB7XG4gICAgdmFyIG9zVmVyc2lvbkFyciA9IGRldmljZS5vc1ZlcnNpb24uc3BsaXQoJy4nKTtcbiAgICB2YXIgbWV0YVZpZXdwb3J0ID0gZG9jLnF1ZXJ5U2VsZWN0b3IoJ21ldGFbbmFtZT1cInZpZXdwb3J0XCJdJyk7XG4gICAgZGV2aWNlLm1pbmltYWxVaSA9XG4gICAgICAhZGV2aWNlLndlYlZpZXcgJiZcbiAgICAgIChpcG9kIHx8IGlwaG9uZSkgJiZcbiAgICAgIChvc1ZlcnNpb25BcnJbMF0gKiAxID09PSA3ID8gb3NWZXJzaW9uQXJyWzFdICogMSA+PSAxIDogb3NWZXJzaW9uQXJyWzBdICogMSA+IDcpICYmXG4gICAgICBtZXRhVmlld3BvcnQgJiYgbWV0YVZpZXdwb3J0LmdldEF0dHJpYnV0ZSgnY29udGVudCcpLmluZGV4T2YoJ21pbmltYWwtdWknKSA+PSAwO1xuICB9XG5cbiAgLy8gUGl4ZWwgUmF0aW9cbiAgZGV2aWNlLnBpeGVsUmF0aW8gPSB3aW4uZGV2aWNlUGl4ZWxSYXRpbyB8fCAxO1xuXG4gIC8vIEV4cG9ydCBvYmplY3RcbiAgcmV0dXJuIGRldmljZTtcbn0oKSk7XG5cbnZhciBvblRvdWNoU3RhcnQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgdmFyIHN3aXBlciA9IHRoaXM7XG4gIHZhciBkYXRhID0gc3dpcGVyLnRvdWNoRXZlbnRzRGF0YTtcbiAgdmFyIHBhcmFtcyA9IHN3aXBlci5wYXJhbXM7XG4gIHZhciB0b3VjaGVzID0gc3dpcGVyLnRvdWNoZXM7XG4gIHZhciBlID0gZXZlbnQ7XG4gIGlmIChlLm9yaWdpbmFsRXZlbnQpIHsgZSA9IGUub3JpZ2luYWxFdmVudDsgfVxuICBkYXRhLmlzVG91Y2hFdmVudCA9IGUudHlwZSA9PT0gJ3RvdWNoc3RhcnQnO1xuICBpZiAoIWRhdGEuaXNUb3VjaEV2ZW50ICYmICd3aGljaCcgaW4gZSAmJiBlLndoaWNoID09PSAzKSB7IHJldHVybjsgfVxuICBpZiAoZGF0YS5pc1RvdWNoZWQgJiYgZGF0YS5pc01vdmVkKSB7IHJldHVybjsgfVxuICBpZiAocGFyYW1zLm5vU3dpcGluZyAmJiAkJDEoZS50YXJnZXQpLmNsb3Nlc3QoKFwiLlwiICsgKHBhcmFtcy5ub1N3aXBpbmdDbGFzcykpKVswXSkge1xuICAgIHN3aXBlci5hbGxvd0NsaWNrID0gdHJ1ZTtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKHBhcmFtcy5zd2lwZUhhbmRsZXIpIHtcbiAgICBpZiAoISQkMShlKS5jbG9zZXN0KHBhcmFtcy5zd2lwZUhhbmRsZXIpWzBdKSB7IHJldHVybjsgfVxuICB9XG5cbiAgdG91Y2hlcy5jdXJyZW50WCA9IGUudHlwZSA9PT0gJ3RvdWNoc3RhcnQnID8gZS50YXJnZXRUb3VjaGVzWzBdLnBhZ2VYIDogZS5wYWdlWDtcbiAgdG91Y2hlcy5jdXJyZW50WSA9IGUudHlwZSA9PT0gJ3RvdWNoc3RhcnQnID8gZS50YXJnZXRUb3VjaGVzWzBdLnBhZ2VZIDogZS5wYWdlWTtcbiAgdmFyIHN0YXJ0WCA9IHRvdWNoZXMuY3VycmVudFg7XG4gIHZhciBzdGFydFkgPSB0b3VjaGVzLmN1cnJlbnRZO1xuXG4gIC8vIERvIE5PVCBzdGFydCBpZiBpT1MgZWRnZSBzd2lwZSBpcyBkZXRlY3RlZC4gT3RoZXJ3aXNlIGlPUyBhcHAgKFVJV2ViVmlldykgY2Fubm90IHN3aXBlLXRvLWdvLWJhY2sgYW55bW9yZVxuXG4gIGlmIChcbiAgICBEZXZpY2UuaW9zICYmXG4gICAgIURldmljZS5jb3Jkb3ZhICYmXG4gICAgcGFyYW1zLmlPU0VkZ2VTd2lwZURldGVjdGlvbiAmJlxuICAgIChzdGFydFggPD0gcGFyYW1zLmlPU0VkZ2VTd2lwZVRocmVzaG9sZCkgJiZcbiAgICAoc3RhcnRYID49IHdpbmRvdy5zY3JlZW4ud2lkdGggLSBwYXJhbXMuaU9TRWRnZVN3aXBlVGhyZXNob2xkKVxuICApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBVdGlscy5leHRlbmQoZGF0YSwge1xuICAgIGlzVG91Y2hlZDogdHJ1ZSxcbiAgICBpc01vdmVkOiBmYWxzZSxcbiAgICBhbGxvd1RvdWNoQ2FsbGJhY2tzOiB0cnVlLFxuICAgIGlzU2Nyb2xsaW5nOiB1bmRlZmluZWQsXG4gICAgc3RhcnRNb3Zpbmc6IHVuZGVmaW5lZCxcbiAgfSk7XG5cbiAgdG91Y2hlcy5zdGFydFggPSBzdGFydFg7XG4gIHRvdWNoZXMuc3RhcnRZID0gc3RhcnRZO1xuICBkYXRhLnRvdWNoU3RhcnRUaW1lID0gVXRpbHMubm93KCk7XG4gIHN3aXBlci5hbGxvd0NsaWNrID0gdHJ1ZTtcbiAgc3dpcGVyLnVwZGF0ZVNpemUoKTtcbiAgc3dpcGVyLnN3aXBlRGlyZWN0aW9uID0gdW5kZWZpbmVkO1xuICBpZiAocGFyYW1zLnRocmVzaG9sZCA+IDApIHsgZGF0YS5hbGxvd1RocmVzaG9sZE1vdmUgPSBmYWxzZTsgfVxuICBpZiAoZS50eXBlICE9PSAndG91Y2hzdGFydCcpIHtcbiAgICB2YXIgcHJldmVudERlZmF1bHQgPSB0cnVlO1xuICAgIGlmICgkJDEoZS50YXJnZXQpLmlzKGRhdGEuZm9ybUVsZW1lbnRzKSkgeyBwcmV2ZW50RGVmYXVsdCA9IGZhbHNlOyB9XG4gICAgaWYgKGRvYy5hY3RpdmVFbGVtZW50ICYmICQkMShkb2MuYWN0aXZlRWxlbWVudCkuaXMoZGF0YS5mb3JtRWxlbWVudHMpKSB7XG4gICAgICBkb2MuYWN0aXZlRWxlbWVudC5ibHVyKCk7XG4gICAgfVxuICAgIGlmIChwcmV2ZW50RGVmYXVsdCAmJiBzd2lwZXIuYWxsb3dUb3VjaE1vdmUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG4gIH1cbiAgc3dpcGVyLmVtaXQoJ3RvdWNoU3RhcnQnLCBlKTtcbn07XG5cbnZhciBvblRvdWNoTW92ZSA9IGZ1bmN0aW9uIChldmVudCkge1xuICB2YXIgc3dpcGVyID0gdGhpcztcbiAgdmFyIGRhdGEgPSBzd2lwZXIudG91Y2hFdmVudHNEYXRhO1xuICB2YXIgcGFyYW1zID0gc3dpcGVyLnBhcmFtcztcbiAgdmFyIHRvdWNoZXMgPSBzd2lwZXIudG91Y2hlcztcbiAgdmFyIHJ0bCA9IHN3aXBlci5ydGw7XG4gIHZhciBlID0gZXZlbnQ7XG4gIGlmIChlLm9yaWdpbmFsRXZlbnQpIHsgZSA9IGUub3JpZ2luYWxFdmVudDsgfVxuICBpZiAoZGF0YS5pc1RvdWNoRXZlbnQgJiYgZS50eXBlID09PSAnbW91c2Vtb3ZlJykgeyByZXR1cm47IH1cbiAgdmFyIHBhZ2VYID0gZS50eXBlID09PSAndG91Y2htb3ZlJyA/IGUudGFyZ2V0VG91Y2hlc1swXS5wYWdlWCA6IGUucGFnZVg7XG4gIHZhciBwYWdlWSA9IGUudHlwZSA9PT0gJ3RvdWNobW92ZScgPyBlLnRhcmdldFRvdWNoZXNbMF0ucGFnZVkgOiBlLnBhZ2VZO1xuICBpZiAoZS5wcmV2ZW50ZWRCeU5lc3RlZFN3aXBlcikge1xuICAgIHRvdWNoZXMuc3RhcnRYID0gcGFnZVg7XG4gICAgdG91Y2hlcy5zdGFydFkgPSBwYWdlWTtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKCFzd2lwZXIuYWxsb3dUb3VjaE1vdmUpIHtcbiAgICAvLyBpc01vdmVkID0gdHJ1ZTtcbiAgICBzd2lwZXIuYWxsb3dDbGljayA9IGZhbHNlO1xuICAgIGlmIChkYXRhLmlzVG91Y2hlZCkge1xuICAgICAgVXRpbHMuZXh0ZW5kKHRvdWNoZXMsIHtcbiAgICAgICAgc3RhcnRYOiBwYWdlWCxcbiAgICAgICAgc3RhcnRZOiBwYWdlWSxcbiAgICAgICAgY3VycmVudFg6IHBhZ2VYLFxuICAgICAgICBjdXJyZW50WTogcGFnZVksXG4gICAgICB9KTtcbiAgICAgIGRhdGEudG91Y2hTdGFydFRpbWUgPSBVdGlscy5ub3coKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChkYXRhLmlzVG91Y2hFdmVudCAmJiBwYXJhbXMudG91Y2hSZWxlYXNlT25FZGdlcyAmJiAhcGFyYW1zLmxvb3ApIHtcbiAgICBpZiAoc3dpcGVyLmlzVmVydGljYWwoKSkge1xuICAgICAgLy8gVmVydGljYWxcbiAgICAgIGlmIChcbiAgICAgICAgKHBhZ2VZIDwgdG91Y2hlcy5zdGFydFkgJiYgc3dpcGVyLnRyYW5zbGF0ZSA8PSBzd2lwZXIubWF4VHJhbnNsYXRlKCkpIHx8XG4gICAgICAgIChwYWdlWSA+IHRvdWNoZXMuc3RhcnRZICYmIHN3aXBlci50cmFuc2xhdGUgPj0gc3dpcGVyLm1pblRyYW5zbGF0ZSgpKVxuICAgICAgKSB7XG4gICAgICAgIGRhdGEuaXNUb3VjaGVkID0gZmFsc2U7XG4gICAgICAgIGRhdGEuaXNNb3ZlZCA9IGZhbHNlO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChcbiAgICAgIChwYWdlWCA8IHRvdWNoZXMuc3RhcnRYICYmIHN3aXBlci50cmFuc2xhdGUgPD0gc3dpcGVyLm1heFRyYW5zbGF0ZSgpKSB8fFxuICAgICAgKHBhZ2VYID4gdG91Y2hlcy5zdGFydFggJiYgc3dpcGVyLnRyYW5zbGF0ZSA+PSBzd2lwZXIubWluVHJhbnNsYXRlKCkpXG4gICAgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG4gIGlmIChkYXRhLmlzVG91Y2hFdmVudCAmJiBkb2MuYWN0aXZlRWxlbWVudCkge1xuICAgIGlmIChlLnRhcmdldCA9PT0gZG9jLmFjdGl2ZUVsZW1lbnQgJiYgJCQxKGUudGFyZ2V0KS5pcyhkYXRhLmZvcm1FbGVtZW50cykpIHtcbiAgICAgIGRhdGEuaXNNb3ZlZCA9IHRydWU7XG4gICAgICBzd2lwZXIuYWxsb3dDbGljayA9IGZhbHNlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuICBpZiAoZGF0YS5hbGxvd1RvdWNoQ2FsbGJhY2tzKSB7XG4gICAgc3dpcGVyLmVtaXQoJ3RvdWNoTW92ZScsIGUpO1xuICB9XG4gIGlmIChlLnRhcmdldFRvdWNoZXMgJiYgZS50YXJnZXRUb3VjaGVzLmxlbmd0aCA+IDEpIHsgcmV0dXJuOyB9XG5cbiAgdG91Y2hlcy5jdXJyZW50WCA9IHBhZ2VYO1xuICB0b3VjaGVzLmN1cnJlbnRZID0gcGFnZVk7XG5cbiAgdmFyIGRpZmZYID0gdG91Y2hlcy5jdXJyZW50WCAtIHRvdWNoZXMuc3RhcnRYO1xuICB2YXIgZGlmZlkgPSB0b3VjaGVzLmN1cnJlbnRZIC0gdG91Y2hlcy5zdGFydFk7XG5cbiAgaWYgKHR5cGVvZiBkYXRhLmlzU2Nyb2xsaW5nID09PSAndW5kZWZpbmVkJykge1xuICAgIHZhciB0b3VjaEFuZ2xlO1xuICAgIGlmICgoc3dpcGVyLmlzSG9yaXpvbnRhbCgpICYmIHRvdWNoZXMuY3VycmVudFkgPT09IHRvdWNoZXMuc3RhcnRZKSB8fCAoc3dpcGVyLmlzVmVydGljYWwoKSAmJiB0b3VjaGVzLmN1cnJlbnRYID09PSB0b3VjaGVzLnN0YXJ0WCkpIHtcbiAgICAgIGRhdGEuaXNTY3JvbGxpbmcgPSBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXG4gICAgICBpZiAoKGRpZmZYICogZGlmZlgpICsgKGRpZmZZICogZGlmZlkpID49IDI1KSB7XG4gICAgICAgIHRvdWNoQW5nbGUgPSAoTWF0aC5hdGFuMihNYXRoLmFicyhkaWZmWSksIE1hdGguYWJzKGRpZmZYKSkgKiAxODApIC8gTWF0aC5QSTtcbiAgICAgICAgZGF0YS5pc1Njcm9sbGluZyA9IHN3aXBlci5pc0hvcml6b250YWwoKSA/IHRvdWNoQW5nbGUgPiBwYXJhbXMudG91Y2hBbmdsZSA6ICg5MCAtIHRvdWNoQW5nbGUgPiBwYXJhbXMudG91Y2hBbmdsZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGlmIChkYXRhLmlzU2Nyb2xsaW5nKSB7XG4gICAgc3dpcGVyLmVtaXQoJ3RvdWNoTW92ZU9wcG9zaXRlJywgZSk7XG4gIH1cbiAgaWYgKHR5cGVvZiBzdGFydE1vdmluZyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAodG91Y2hlcy5jdXJyZW50WCAhPT0gdG91Y2hlcy5zdGFydFggfHwgdG91Y2hlcy5jdXJyZW50WSAhPT0gdG91Y2hlcy5zdGFydFkpIHtcbiAgICAgIGRhdGEuc3RhcnRNb3ZpbmcgPSB0cnVlO1xuICAgIH1cbiAgfVxuICBpZiAoIWRhdGEuaXNUb3VjaGVkKSB7IHJldHVybjsgfVxuICBpZiAoZGF0YS5pc1Njcm9sbGluZykge1xuICAgIGRhdGEuaXNUb3VjaGVkID0gZmFsc2U7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmICghZGF0YS5zdGFydE1vdmluZykge1xuICAgIHJldHVybjtcbiAgfVxuICBzd2lwZXIuYWxsb3dDbGljayA9IGZhbHNlO1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIGlmIChwYXJhbXMudG91Y2hNb3ZlU3RvcFByb3BhZ2F0aW9uICYmICFwYXJhbXMubmVzdGVkKSB7XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfVxuXG4gIGlmICghZGF0YS5pc01vdmVkKSB7XG4gICAgaWYgKHBhcmFtcy5sb29wKSB7XG4gICAgICBzd2lwZXIubG9vcEZpeCgpO1xuICAgIH1cbiAgICBkYXRhLnN0YXJ0VHJhbnNsYXRlID0gc3dpcGVyLmdldFRyYW5zbGF0ZSgpO1xuICAgIHN3aXBlci5zZXRUcmFuc2l0aW9uKDApO1xuICAgIGlmIChzd2lwZXIuYW5pbWF0aW5nKSB7XG4gICAgICBzd2lwZXIuJHdyYXBwZXJFbC50cmlnZ2VyKCd3ZWJraXRUcmFuc2l0aW9uRW5kIHRyYW5zaXRpb25lbmQnKTtcbiAgICB9XG4gICAgZGF0YS5hbGxvd01vbWVudHVtQm91bmNlID0gZmFsc2U7XG4gICAgLy8gR3JhYiBDdXJzb3JcbiAgICBpZiAocGFyYW1zLmdyYWJDdXJzb3IgJiYgKHN3aXBlci5hbGxvd1NsaWRlTmV4dCA9PT0gdHJ1ZSB8fCBzd2lwZXIuYWxsb3dTbGlkZVByZXYgPT09IHRydWUpKSB7XG4gICAgICBzd2lwZXIuc2V0R3JhYkN1cnNvcih0cnVlKTtcbiAgICB9XG4gICAgc3dpcGVyLmVtaXQoJ3NsaWRlckZpcnN0TW92ZScsIGUpO1xuICB9XG4gIHN3aXBlci5lbWl0KCdzbGlkZXJNb3ZlJywgZSk7XG4gIGRhdGEuaXNNb3ZlZCA9IHRydWU7XG5cbiAgdmFyIGRpZmYgPSBzd2lwZXIuaXNIb3Jpem9udGFsKCkgPyBkaWZmWCA6IGRpZmZZO1xuICB0b3VjaGVzLmRpZmYgPSBkaWZmO1xuXG4gIGRpZmYgKj0gcGFyYW1zLnRvdWNoUmF0aW87XG4gIGlmIChydGwpIHsgZGlmZiA9IC1kaWZmOyB9XG5cbiAgc3dpcGVyLnN3aXBlRGlyZWN0aW9uID0gZGlmZiA+IDAgPyAncHJldicgOiAnbmV4dCc7XG4gIGRhdGEuY3VycmVudFRyYW5zbGF0ZSA9IGRpZmYgKyBkYXRhLnN0YXJ0VHJhbnNsYXRlO1xuXG4gIHZhciBkaXNhYmxlUGFyZW50U3dpcGVyID0gdHJ1ZTtcbiAgdmFyIHJlc2lzdGFuY2VSYXRpbyA9IHBhcmFtcy5yZXNpc3RhbmNlUmF0aW87XG4gIGlmIChwYXJhbXMudG91Y2hSZWxlYXNlT25FZGdlcykge1xuICAgIHJlc2lzdGFuY2VSYXRpbyA9IDA7XG4gIH1cbiAgaWYgKChkaWZmID4gMCAmJiBkYXRhLmN1cnJlbnRUcmFuc2xhdGUgPiBzd2lwZXIubWluVHJhbnNsYXRlKCkpKSB7XG4gICAgZGlzYWJsZVBhcmVudFN3aXBlciA9IGZhbHNlO1xuICAgIGlmIChwYXJhbXMucmVzaXN0YW5jZSkgeyBkYXRhLmN1cnJlbnRUcmFuc2xhdGUgPSAoc3dpcGVyLm1pblRyYW5zbGF0ZSgpIC0gMSkgKyAoTWF0aC5wb3coICgtc3dpcGVyLm1pblRyYW5zbGF0ZSgpICsgZGF0YS5zdGFydFRyYW5zbGF0ZSArIGRpZmYpLCByZXNpc3RhbmNlUmF0aW8gKSk7IH1cbiAgfSBlbHNlIGlmIChkaWZmIDwgMCAmJiBkYXRhLmN1cnJlbnRUcmFuc2xhdGUgPCBzd2lwZXIubWF4VHJhbnNsYXRlKCkpIHtcbiAgICBkaXNhYmxlUGFyZW50U3dpcGVyID0gZmFsc2U7XG4gICAgaWYgKHBhcmFtcy5yZXNpc3RhbmNlKSB7IGRhdGEuY3VycmVudFRyYW5zbGF0ZSA9IChzd2lwZXIubWF4VHJhbnNsYXRlKCkgKyAxKSAtIChNYXRoLnBvdyggKHN3aXBlci5tYXhUcmFuc2xhdGUoKSAtIGRhdGEuc3RhcnRUcmFuc2xhdGUgLSBkaWZmKSwgcmVzaXN0YW5jZVJhdGlvICkpOyB9XG4gIH1cblxuICBpZiAoZGlzYWJsZVBhcmVudFN3aXBlcikge1xuICAgIGUucHJldmVudGVkQnlOZXN0ZWRTd2lwZXIgPSB0cnVlO1xuICB9XG5cbiAgLy8gRGlyZWN0aW9ucyBsb2Nrc1xuICBpZiAoIXN3aXBlci5hbGxvd1NsaWRlTmV4dCAmJiBzd2lwZXIuc3dpcGVEaXJlY3Rpb24gPT09ICduZXh0JyAmJiBkYXRhLmN1cnJlbnRUcmFuc2xhdGUgPCBkYXRhLnN0YXJ0VHJhbnNsYXRlKSB7XG4gICAgZGF0YS5jdXJyZW50VHJhbnNsYXRlID0gZGF0YS5zdGFydFRyYW5zbGF0ZTtcbiAgfVxuICBpZiAoIXN3aXBlci5hbGxvd1NsaWRlUHJldiAmJiBzd2lwZXIuc3dpcGVEaXJlY3Rpb24gPT09ICdwcmV2JyAmJiBkYXRhLmN1cnJlbnRUcmFuc2xhdGUgPiBkYXRhLnN0YXJ0VHJhbnNsYXRlKSB7XG4gICAgZGF0YS5jdXJyZW50VHJhbnNsYXRlID0gZGF0YS5zdGFydFRyYW5zbGF0ZTtcbiAgfVxuXG5cbiAgLy8gVGhyZXNob2xkXG4gIGlmIChwYXJhbXMudGhyZXNob2xkID4gMCkge1xuICAgIGlmIChNYXRoLmFicyhkaWZmKSA+IHBhcmFtcy50aHJlc2hvbGQgfHwgZGF0YS5hbGxvd1RocmVzaG9sZE1vdmUpIHtcbiAgICAgIGlmICghZGF0YS5hbGxvd1RocmVzaG9sZE1vdmUpIHtcbiAgICAgICAgZGF0YS5hbGxvd1RocmVzaG9sZE1vdmUgPSB0cnVlO1xuICAgICAgICB0b3VjaGVzLnN0YXJ0WCA9IHRvdWNoZXMuY3VycmVudFg7XG4gICAgICAgIHRvdWNoZXMuc3RhcnRZID0gdG91Y2hlcy5jdXJyZW50WTtcbiAgICAgICAgZGF0YS5jdXJyZW50VHJhbnNsYXRlID0gZGF0YS5zdGFydFRyYW5zbGF0ZTtcbiAgICAgICAgdG91Y2hlcy5kaWZmID0gc3dpcGVyLmlzSG9yaXpvbnRhbCgpID8gdG91Y2hlcy5jdXJyZW50WCAtIHRvdWNoZXMuc3RhcnRYIDogdG91Y2hlcy5jdXJyZW50WSAtIHRvdWNoZXMuc3RhcnRZO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGRhdGEuY3VycmVudFRyYW5zbGF0ZSA9IGRhdGEuc3RhcnRUcmFuc2xhdGU7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG5cbiAgaWYgKCFwYXJhbXMuZm9sbG93RmluZ2VyKSB7IHJldHVybjsgfVxuXG4gIC8vIFVwZGF0ZSBhY3RpdmUgaW5kZXggaW4gZnJlZSBtb2RlXG4gIGlmIChwYXJhbXMuZnJlZU1vZGUgfHwgcGFyYW1zLndhdGNoU2xpZGVzUHJvZ3Jlc3MgfHwgcGFyYW1zLndhdGNoU2xpZGVzVmlzaWJpbGl0eSkge1xuICAgIHN3aXBlci51cGRhdGVBY3RpdmVJbmRleCgpO1xuICAgIHN3aXBlci51cGRhdGVTbGlkZXNDbGFzc2VzKCk7XG4gIH1cbiAgaWYgKHBhcmFtcy5mcmVlTW9kZSkge1xuICAgIC8vIFZlbG9jaXR5XG4gICAgaWYgKGRhdGEudmVsb2NpdGllcy5sZW5ndGggPT09IDApIHtcbiAgICAgIGRhdGEudmVsb2NpdGllcy5wdXNoKHtcbiAgICAgICAgcG9zaXRpb246IHRvdWNoZXNbc3dpcGVyLmlzSG9yaXpvbnRhbCgpID8gJ3N0YXJ0WCcgOiAnc3RhcnRZJ10sXG4gICAgICAgIHRpbWU6IGRhdGEudG91Y2hTdGFydFRpbWUsXG4gICAgICB9KTtcbiAgICB9XG4gICAgZGF0YS52ZWxvY2l0aWVzLnB1c2goe1xuICAgICAgcG9zaXRpb246IHRvdWNoZXNbc3dpcGVyLmlzSG9yaXpvbnRhbCgpID8gJ2N1cnJlbnRYJyA6ICdjdXJyZW50WSddLFxuICAgICAgdGltZTogVXRpbHMubm93KCksXG4gICAgfSk7XG4gIH1cbiAgLy8gVXBkYXRlIHByb2dyZXNzXG4gIHN3aXBlci51cGRhdGVQcm9ncmVzcyhkYXRhLmN1cnJlbnRUcmFuc2xhdGUpO1xuICAvLyBVcGRhdGUgdHJhbnNsYXRlXG4gIHN3aXBlci5zZXRUcmFuc2xhdGUoZGF0YS5jdXJyZW50VHJhbnNsYXRlKTtcbn07XG5cbnZhciBvblRvdWNoRW5kID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gIHZhciBzd2lwZXIgPSB0aGlzO1xuICB2YXIgZGF0YSA9IHN3aXBlci50b3VjaEV2ZW50c0RhdGE7XG5cbiAgdmFyIHBhcmFtcyA9IHN3aXBlci5wYXJhbXM7XG4gIHZhciB0b3VjaGVzID0gc3dpcGVyLnRvdWNoZXM7XG4gIHZhciBydGwgPSBzd2lwZXIucnRsO1xuICB2YXIgJHdyYXBwZXJFbCA9IHN3aXBlci4kd3JhcHBlckVsO1xuICB2YXIgc2xpZGVzR3JpZCA9IHN3aXBlci5zbGlkZXNHcmlkO1xuICB2YXIgc25hcEdyaWQgPSBzd2lwZXIuc25hcEdyaWQ7XG4gIHZhciBlID0gZXZlbnQ7XG4gIGlmIChlLm9yaWdpbmFsRXZlbnQpIHsgZSA9IGUub3JpZ2luYWxFdmVudDsgfVxuICBpZiAoZGF0YS5hbGxvd1RvdWNoQ2FsbGJhY2tzKSB7XG4gICAgc3dpcGVyLmVtaXQoJ3RvdWNoRW5kJywgZSk7XG4gIH1cbiAgZGF0YS5hbGxvd1RvdWNoQ2FsbGJhY2tzID0gZmFsc2U7XG4gIGlmICghZGF0YS5pc1RvdWNoZWQpIHsgcmV0dXJuOyB9XG4gIC8vIFJldHVybiBHcmFiIEN1cnNvclxuICBpZiAocGFyYW1zLmdyYWJDdXJzb3IgJiYgZGF0YS5pc01vdmVkICYmIGRhdGEuaXNUb3VjaGVkICYmIChzd2lwZXIuYWxsb3dTbGlkZU5leHQgPT09IHRydWUgfHwgc3dpcGVyLmFsbG93U2xpZGVQcmV2ID09PSB0cnVlKSkge1xuICAgIHN3aXBlci5zZXRHcmFiQ3Vyc29yKGZhbHNlKTtcbiAgfVxuXG4gIC8vIFRpbWUgZGlmZlxuICB2YXIgdG91Y2hFbmRUaW1lID0gVXRpbHMubm93KCk7XG4gIHZhciB0aW1lRGlmZiA9IHRvdWNoRW5kVGltZSAtIGRhdGEudG91Y2hTdGFydFRpbWU7XG5cbiAgLy8gVGFwLCBkb3VibGVUYXAsIENsaWNrXG4gIGlmIChzd2lwZXIuYWxsb3dDbGljaykge1xuICAgIHN3aXBlci51cGRhdGVDbGlja2VkU2xpZGUoZSk7XG4gICAgc3dpcGVyLmVtaXQoJ3RhcCcsIGUpO1xuICAgIGlmICh0aW1lRGlmZiA8IDMwMCAmJiAodG91Y2hFbmRUaW1lIC0gZGF0YS5sYXN0Q2xpY2tUaW1lKSA+IDMwMCkge1xuICAgICAgaWYgKGRhdGEuY2xpY2tUaW1lb3V0KSB7IGNsZWFyVGltZW91dChkYXRhLmNsaWNrVGltZW91dCk7IH1cbiAgICAgIGRhdGEuY2xpY2tUaW1lb3V0ID0gVXRpbHMubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIXN3aXBlciB8fCBzd2lwZXIuZGVzdHJveWVkKSB7IHJldHVybjsgfVxuICAgICAgICBzd2lwZXIuZW1pdCgnY2xpY2snLCBlKTtcbiAgICAgIH0sIDMwMCk7XG4gICAgfVxuICAgIGlmICh0aW1lRGlmZiA8IDMwMCAmJiAodG91Y2hFbmRUaW1lIC0gZGF0YS5sYXN0Q2xpY2tUaW1lKSA8IDMwMCkge1xuICAgICAgaWYgKGRhdGEuY2xpY2tUaW1lb3V0KSB7IGNsZWFyVGltZW91dChkYXRhLmNsaWNrVGltZW91dCk7IH1cbiAgICAgIHN3aXBlci5lbWl0KCdkb3VibGVUYXAnLCBlKTtcbiAgICB9XG4gIH1cblxuICBkYXRhLmxhc3RDbGlja1RpbWUgPSBVdGlscy5ub3coKTtcbiAgVXRpbHMubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgIGlmICghc3dpcGVyLmRlc3Ryb3llZCkgeyBzd2lwZXIuYWxsb3dDbGljayA9IHRydWU7IH1cbiAgfSk7XG5cbiAgaWYgKCFkYXRhLmlzVG91Y2hlZCB8fCAhZGF0YS5pc01vdmVkIHx8ICFzd2lwZXIuc3dpcGVEaXJlY3Rpb24gfHwgdG91Y2hlcy5kaWZmID09PSAwIHx8IGRhdGEuY3VycmVudFRyYW5zbGF0ZSA9PT0gZGF0YS5zdGFydFRyYW5zbGF0ZSkge1xuICAgIGRhdGEuaXNUb3VjaGVkID0gZmFsc2U7XG4gICAgZGF0YS5pc01vdmVkID0gZmFsc2U7XG4gICAgcmV0dXJuO1xuICB9XG4gIGRhdGEuaXNUb3VjaGVkID0gZmFsc2U7XG4gIGRhdGEuaXNNb3ZlZCA9IGZhbHNlO1xuXG4gIHZhciBjdXJyZW50UG9zO1xuICBpZiAocGFyYW1zLmZvbGxvd0Zpbmdlcikge1xuICAgIGN1cnJlbnRQb3MgPSBydGwgPyBzd2lwZXIudHJhbnNsYXRlIDogLXN3aXBlci50cmFuc2xhdGU7XG4gIH0gZWxzZSB7XG4gICAgY3VycmVudFBvcyA9IC1kYXRhLmN1cnJlbnRUcmFuc2xhdGU7XG4gIH1cbiAgaWYgKHBhcmFtcy5mcmVlTW9kZSkge1xuICAgIGlmIChjdXJyZW50UG9zIDwgLXN3aXBlci5taW5UcmFuc2xhdGUoKSkge1xuICAgICAgc3dpcGVyLnNsaWRlVG8oc3dpcGVyLmFjdGl2ZUluZGV4KTtcbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2UgaWYgKGN1cnJlbnRQb3MgPiAtc3dpcGVyLm1heFRyYW5zbGF0ZSgpKSB7XG4gICAgICBpZiAoc3dpcGVyLnNsaWRlcy5sZW5ndGggPCBzbmFwR3JpZC5sZW5ndGgpIHtcbiAgICAgICAgc3dpcGVyLnNsaWRlVG8oc25hcEdyaWQubGVuZ3RoIC0gMSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzd2lwZXIuc2xpZGVUbyhzd2lwZXIuc2xpZGVzLmxlbmd0aCAtIDEpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChwYXJhbXMuZnJlZU1vZGVNb21lbnR1bSkge1xuICAgICAgaWYgKGRhdGEudmVsb2NpdGllcy5sZW5ndGggPiAxKSB7XG4gICAgICAgIHZhciBsYXN0TW92ZUV2ZW50ID0gZGF0YS52ZWxvY2l0aWVzLnBvcCgpO1xuICAgICAgICB2YXIgdmVsb2NpdHlFdmVudCA9IGRhdGEudmVsb2NpdGllcy5wb3AoKTtcblxuICAgICAgICB2YXIgZGlzdGFuY2UgPSBsYXN0TW92ZUV2ZW50LnBvc2l0aW9uIC0gdmVsb2NpdHlFdmVudC5wb3NpdGlvbjtcbiAgICAgICAgdmFyIHRpbWUgPSBsYXN0TW92ZUV2ZW50LnRpbWUgLSB2ZWxvY2l0eUV2ZW50LnRpbWU7XG4gICAgICAgIHN3aXBlci52ZWxvY2l0eSA9IGRpc3RhbmNlIC8gdGltZTtcbiAgICAgICAgc3dpcGVyLnZlbG9jaXR5IC89IDI7XG4gICAgICAgIGlmIChNYXRoLmFicyhzd2lwZXIudmVsb2NpdHkpIDwgcGFyYW1zLmZyZWVNb2RlTWluaW11bVZlbG9jaXR5KSB7XG4gICAgICAgICAgc3dpcGVyLnZlbG9jaXR5ID0gMDtcbiAgICAgICAgfVxuICAgICAgICAvLyB0aGlzIGltcGxpZXMgdGhhdCB0aGUgdXNlciBzdG9wcGVkIG1vdmluZyBhIGZpbmdlciB0aGVuIHJlbGVhc2VkLlxuICAgICAgICAvLyBUaGVyZSB3b3VsZCBiZSBubyBldmVudHMgd2l0aCBkaXN0YW5jZSB6ZXJvLCBzbyB0aGUgbGFzdCBldmVudCBpcyBzdGFsZS5cbiAgICAgICAgaWYgKHRpbWUgPiAxNTAgfHwgKFV0aWxzLm5vdygpIC0gbGFzdE1vdmVFdmVudC50aW1lKSA+IDMwMCkge1xuICAgICAgICAgIHN3aXBlci52ZWxvY2l0eSA9IDA7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN3aXBlci52ZWxvY2l0eSA9IDA7XG4gICAgICB9XG4gICAgICBzd2lwZXIudmVsb2NpdHkgKj0gcGFyYW1zLmZyZWVNb2RlTW9tZW50dW1WZWxvY2l0eVJhdGlvO1xuXG4gICAgICBkYXRhLnZlbG9jaXRpZXMubGVuZ3RoID0gMDtcbiAgICAgIHZhciBtb21lbnR1bUR1cmF0aW9uID0gMTAwMCAqIHBhcmFtcy5mcmVlTW9kZU1vbWVudHVtUmF0aW87XG4gICAgICB2YXIgbW9tZW50dW1EaXN0YW5jZSA9IHN3aXBlci52ZWxvY2l0eSAqIG1vbWVudHVtRHVyYXRpb247XG5cbiAgICAgIHZhciBuZXdQb3NpdGlvbiA9IHN3aXBlci50cmFuc2xhdGUgKyBtb21lbnR1bURpc3RhbmNlO1xuICAgICAgaWYgKHJ0bCkgeyBuZXdQb3NpdGlvbiA9IC1uZXdQb3NpdGlvbjsgfVxuICAgICAgdmFyIGRvQm91bmNlID0gZmFsc2U7XG4gICAgICB2YXIgYWZ0ZXJCb3VuY2VQb3NpdGlvbjtcbiAgICAgIHZhciBib3VuY2VBbW91bnQgPSBNYXRoLmFicyhzd2lwZXIudmVsb2NpdHkpICogMjAgKiBwYXJhbXMuZnJlZU1vZGVNb21lbnR1bUJvdW5jZVJhdGlvO1xuICAgICAgaWYgKG5ld1Bvc2l0aW9uIDwgc3dpcGVyLm1heFRyYW5zbGF0ZSgpKSB7XG4gICAgICAgIGlmIChwYXJhbXMuZnJlZU1vZGVNb21lbnR1bUJvdW5jZSkge1xuICAgICAgICAgIGlmIChuZXdQb3NpdGlvbiArIHN3aXBlci5tYXhUcmFuc2xhdGUoKSA8IC1ib3VuY2VBbW91bnQpIHtcbiAgICAgICAgICAgIG5ld1Bvc2l0aW9uID0gc3dpcGVyLm1heFRyYW5zbGF0ZSgpIC0gYm91bmNlQW1vdW50O1xuICAgICAgICAgIH1cbiAgICAgICAgICBhZnRlckJvdW5jZVBvc2l0aW9uID0gc3dpcGVyLm1heFRyYW5zbGF0ZSgpO1xuICAgICAgICAgIGRvQm91bmNlID0gdHJ1ZTtcbiAgICAgICAgICBkYXRhLmFsbG93TW9tZW50dW1Cb3VuY2UgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5ld1Bvc2l0aW9uID0gc3dpcGVyLm1heFRyYW5zbGF0ZSgpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKG5ld1Bvc2l0aW9uID4gc3dpcGVyLm1pblRyYW5zbGF0ZSgpKSB7XG4gICAgICAgIGlmIChwYXJhbXMuZnJlZU1vZGVNb21lbnR1bUJvdW5jZSkge1xuICAgICAgICAgIGlmIChuZXdQb3NpdGlvbiAtIHN3aXBlci5taW5UcmFuc2xhdGUoKSA+IGJvdW5jZUFtb3VudCkge1xuICAgICAgICAgICAgbmV3UG9zaXRpb24gPSBzd2lwZXIubWluVHJhbnNsYXRlKCkgKyBib3VuY2VBbW91bnQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIGFmdGVyQm91bmNlUG9zaXRpb24gPSBzd2lwZXIubWluVHJhbnNsYXRlKCk7XG4gICAgICAgICAgZG9Cb3VuY2UgPSB0cnVlO1xuICAgICAgICAgIGRhdGEuYWxsb3dNb21lbnR1bUJvdW5jZSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV3UG9zaXRpb24gPSBzd2lwZXIubWluVHJhbnNsYXRlKCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAocGFyYW1zLmZyZWVNb2RlU3RpY2t5KSB7XG4gICAgICAgIHZhciBuZXh0U2xpZGU7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgc25hcEdyaWQubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgICAgICBpZiAoc25hcEdyaWRbal0gPiAtbmV3UG9zaXRpb24pIHtcbiAgICAgICAgICAgIG5leHRTbGlkZSA9IGo7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKE1hdGguYWJzKHNuYXBHcmlkW25leHRTbGlkZV0gLSBuZXdQb3NpdGlvbikgPCBNYXRoLmFicyhzbmFwR3JpZFtuZXh0U2xpZGUgLSAxXSAtIG5ld1Bvc2l0aW9uKSB8fCBzd2lwZXIuc3dpcGVEaXJlY3Rpb24gPT09ICduZXh0Jykge1xuICAgICAgICAgIG5ld1Bvc2l0aW9uID0gc25hcEdyaWRbbmV4dFNsaWRlXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuZXdQb3NpdGlvbiA9IHNuYXBHcmlkW25leHRTbGlkZSAtIDFdO1xuICAgICAgICB9XG4gICAgICAgIG5ld1Bvc2l0aW9uID0gLW5ld1Bvc2l0aW9uO1xuICAgICAgfVxuICAgICAgLy8gRml4IGR1cmF0aW9uXG4gICAgICBpZiAoc3dpcGVyLnZlbG9jaXR5ICE9PSAwKSB7XG4gICAgICAgIGlmIChydGwpIHtcbiAgICAgICAgICBtb21lbnR1bUR1cmF0aW9uID0gTWF0aC5hYnMoKC1uZXdQb3NpdGlvbiAtIHN3aXBlci50cmFuc2xhdGUpIC8gc3dpcGVyLnZlbG9jaXR5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtb21lbnR1bUR1cmF0aW9uID0gTWF0aC5hYnMoKG5ld1Bvc2l0aW9uIC0gc3dpcGVyLnRyYW5zbGF0ZSkgLyBzd2lwZXIudmVsb2NpdHkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHBhcmFtcy5mcmVlTW9kZVN0aWNreSkge1xuICAgICAgICBzd2lwZXIuc2xpZGVSZXNldCgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChwYXJhbXMuZnJlZU1vZGVNb21lbnR1bUJvdW5jZSAmJiBkb0JvdW5jZSkge1xuICAgICAgICBzd2lwZXIudXBkYXRlUHJvZ3Jlc3MoYWZ0ZXJCb3VuY2VQb3NpdGlvbik7XG4gICAgICAgIHN3aXBlci5zZXRUcmFuc2l0aW9uKG1vbWVudHVtRHVyYXRpb24pO1xuICAgICAgICBzd2lwZXIuc2V0VHJhbnNsYXRlKG5ld1Bvc2l0aW9uKTtcbiAgICAgICAgc3dpcGVyLnRyYW5zaXRpb25TdGFydCgpO1xuICAgICAgICBzd2lwZXIuYW5pbWF0aW5nID0gdHJ1ZTtcbiAgICAgICAgJHdyYXBwZXJFbC50cmFuc2l0aW9uRW5kKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBpZiAoIXN3aXBlciB8fCBzd2lwZXIuZGVzdHJveWVkIHx8ICFkYXRhLmFsbG93TW9tZW50dW1Cb3VuY2UpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgc3dpcGVyLmVtaXQoJ21vbWVudHVtQm91bmNlJyk7XG5cbiAgICAgICAgICBzd2lwZXIuc2V0VHJhbnNpdGlvbihwYXJhbXMuc3BlZWQpO1xuICAgICAgICAgIHN3aXBlci5zZXRUcmFuc2xhdGUoYWZ0ZXJCb3VuY2VQb3NpdGlvbik7XG4gICAgICAgICAgJHdyYXBwZXJFbC50cmFuc2l0aW9uRW5kKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghc3dpcGVyIHx8IHN3aXBlci5kZXN0cm95ZWQpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgICBzd2lwZXIudHJhbnNpdGlvbkVuZCgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSBpZiAoc3dpcGVyLnZlbG9jaXR5KSB7XG4gICAgICAgIHN3aXBlci51cGRhdGVQcm9ncmVzcyhuZXdQb3NpdGlvbik7XG4gICAgICAgIHN3aXBlci5zZXRUcmFuc2l0aW9uKG1vbWVudHVtRHVyYXRpb24pO1xuICAgICAgICBzd2lwZXIuc2V0VHJhbnNsYXRlKG5ld1Bvc2l0aW9uKTtcbiAgICAgICAgc3dpcGVyLnRyYW5zaXRpb25TdGFydCgpO1xuICAgICAgICBpZiAoIXN3aXBlci5hbmltYXRpbmcpIHtcbiAgICAgICAgICBzd2lwZXIuYW5pbWF0aW5nID0gdHJ1ZTtcbiAgICAgICAgICAkd3JhcHBlckVsLnRyYW5zaXRpb25FbmQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCFzd2lwZXIgfHwgc3dpcGVyLmRlc3Ryb3llZCkgeyByZXR1cm47IH1cbiAgICAgICAgICAgIHN3aXBlci50cmFuc2l0aW9uRW5kKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN3aXBlci51cGRhdGVQcm9ncmVzcyhuZXdQb3NpdGlvbik7XG4gICAgICB9XG5cbiAgICAgIHN3aXBlci51cGRhdGVBY3RpdmVJbmRleCgpO1xuICAgICAgc3dpcGVyLnVwZGF0ZVNsaWRlc0NsYXNzZXMoKTtcbiAgICB9XG4gICAgaWYgKCFwYXJhbXMuZnJlZU1vZGVNb21lbnR1bSB8fCB0aW1lRGlmZiA+PSBwYXJhbXMubG9uZ1N3aXBlc01zKSB7XG4gICAgICBzd2lwZXIudXBkYXRlUHJvZ3Jlc3MoKTtcbiAgICAgIHN3aXBlci51cGRhdGVBY3RpdmVJbmRleCgpO1xuICAgICAgc3dpcGVyLnVwZGF0ZVNsaWRlc0NsYXNzZXMoKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gRmluZCBjdXJyZW50IHNsaWRlXG4gIHZhciBzdG9wSW5kZXggPSAwO1xuICB2YXIgZ3JvdXBTaXplID0gc3dpcGVyLnNsaWRlc1NpemVzR3JpZFswXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGlkZXNHcmlkLmxlbmd0aDsgaSArPSBwYXJhbXMuc2xpZGVzUGVyR3JvdXApIHtcbiAgICBpZiAodHlwZW9mIHNsaWRlc0dyaWRbaSArIHBhcmFtcy5zbGlkZXNQZXJHcm91cF0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBpZiAoY3VycmVudFBvcyA+PSBzbGlkZXNHcmlkW2ldICYmIGN1cnJlbnRQb3MgPCBzbGlkZXNHcmlkW2kgKyBwYXJhbXMuc2xpZGVzUGVyR3JvdXBdKSB7XG4gICAgICAgIHN0b3BJbmRleCA9IGk7XG4gICAgICAgIGdyb3VwU2l6ZSA9IHNsaWRlc0dyaWRbaSArIHBhcmFtcy5zbGlkZXNQZXJHcm91cF0gLSBzbGlkZXNHcmlkW2ldO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoY3VycmVudFBvcyA+PSBzbGlkZXNHcmlkW2ldKSB7XG4gICAgICBzdG9wSW5kZXggPSBpO1xuICAgICAgZ3JvdXBTaXplID0gc2xpZGVzR3JpZFtzbGlkZXNHcmlkLmxlbmd0aCAtIDFdIC0gc2xpZGVzR3JpZFtzbGlkZXNHcmlkLmxlbmd0aCAtIDJdO1xuICAgIH1cbiAgfVxuXG4gIC8vIEZpbmQgY3VycmVudCBzbGlkZSBzaXplXG4gIHZhciByYXRpbyA9IChjdXJyZW50UG9zIC0gc2xpZGVzR3JpZFtzdG9wSW5kZXhdKSAvIGdyb3VwU2l6ZTtcblxuICBpZiAodGltZURpZmYgPiBwYXJhbXMubG9uZ1N3aXBlc01zKSB7XG4gICAgLy8gTG9uZyB0b3VjaGVzXG4gICAgaWYgKCFwYXJhbXMubG9uZ1N3aXBlcykge1xuICAgICAgc3dpcGVyLnNsaWRlVG8oc3dpcGVyLmFjdGl2ZUluZGV4KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHN3aXBlci5zd2lwZURpcmVjdGlvbiA9PT0gJ25leHQnKSB7XG4gICAgICBpZiAocmF0aW8gPj0gcGFyYW1zLmxvbmdTd2lwZXNSYXRpbykgeyBzd2lwZXIuc2xpZGVUbyhzdG9wSW5kZXggKyBwYXJhbXMuc2xpZGVzUGVyR3JvdXApOyB9XG4gICAgICBlbHNlIHsgc3dpcGVyLnNsaWRlVG8oc3RvcEluZGV4KTsgfVxuICAgIH1cbiAgICBpZiAoc3dpcGVyLnN3aXBlRGlyZWN0aW9uID09PSAncHJldicpIHtcbiAgICAgIGlmIChyYXRpbyA+ICgxIC0gcGFyYW1zLmxvbmdTd2lwZXNSYXRpbykpIHsgc3dpcGVyLnNsaWRlVG8oc3RvcEluZGV4ICsgcGFyYW1zLnNsaWRlc1Blckdyb3VwKTsgfVxuICAgICAgZWxzZSB7IHN3aXBlci5zbGlkZVRvKHN0b3BJbmRleCk7IH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gU2hvcnQgc3dpcGVzXG4gICAgaWYgKCFwYXJhbXMuc2hvcnRTd2lwZXMpIHtcbiAgICAgIHN3aXBlci5zbGlkZVRvKHN3aXBlci5hY3RpdmVJbmRleCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChzd2lwZXIuc3dpcGVEaXJlY3Rpb24gPT09ICduZXh0Jykge1xuICAgICAgc3dpcGVyLnNsaWRlVG8oc3RvcEluZGV4ICsgcGFyYW1zLnNsaWRlc1Blckdyb3VwKTtcbiAgICB9XG4gICAgaWYgKHN3aXBlci5zd2lwZURpcmVjdGlvbiA9PT0gJ3ByZXYnKSB7XG4gICAgICBzd2lwZXIuc2xpZGVUbyhzdG9wSW5kZXgpO1xuICAgIH1cbiAgfVxufTtcblxudmFyIG9uUmVzaXplID0gZnVuY3Rpb24gKCkge1xuICB2YXIgc3dpcGVyID0gdGhpcztcblxuICB2YXIgcGFyYW1zID0gc3dpcGVyLnBhcmFtcztcbiAgdmFyIGVsID0gc3dpcGVyLmVsO1xuXG4gIGlmIChlbCAmJiBlbC5vZmZzZXRXaWR0aCA9PT0gMCkgeyByZXR1cm47IH1cblxuICAvLyBCcmVha3BvaW50c1xuICBpZiAocGFyYW1zLmJyZWFrcG9pbnRzKSB7XG4gICAgc3dpcGVyLnNldEJyZWFrcG9pbnQoKTtcbiAgfVxuXG4gIC8vIFNhdmUgbG9ja3NcbiAgdmFyIGFsbG93U2xpZGVOZXh0ID0gc3dpcGVyLmFsbG93U2xpZGVOZXh0O1xuICB2YXIgYWxsb3dTbGlkZVByZXYgPSBzd2lwZXIuYWxsb3dTbGlkZVByZXY7XG5cbiAgLy8gRGlzYWJsZSBsb2NrcyBvbiByZXNpemVcbiAgc3dpcGVyLmFsbG93U2xpZGVOZXh0ID0gdHJ1ZTtcbiAgc3dpcGVyLmFsbG93U2xpZGVQcmV2ID0gdHJ1ZTtcblxuICBzd2lwZXIudXBkYXRlU2l6ZSgpO1xuICBzd2lwZXIudXBkYXRlU2xpZGVzKCk7XG5cbiAgaWYgKHBhcmFtcy5mcmVlTW9kZSkge1xuICAgIHZhciBuZXdUcmFuc2xhdGUgPSBNYXRoLm1pbihNYXRoLm1heChzd2lwZXIudHJhbnNsYXRlLCBzd2lwZXIubWF4VHJhbnNsYXRlKCkpLCBzd2lwZXIubWluVHJhbnNsYXRlKCkpO1xuICAgIHN3aXBlci5zZXRUcmFuc2xhdGUobmV3VHJhbnNsYXRlKTtcbiAgICBzd2lwZXIudXBkYXRlQWN0aXZlSW5kZXgoKTtcbiAgICBzd2lwZXIudXBkYXRlU2xpZGVzQ2xhc3NlcygpO1xuXG4gICAgaWYgKHBhcmFtcy5hdXRvSGVpZ2h0KSB7XG4gICAgICBzd2lwZXIudXBkYXRlQXV0b0hlaWdodCgpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBzd2lwZXIudXBkYXRlU2xpZGVzQ2xhc3NlcygpO1xuICAgIGlmICgocGFyYW1zLnNsaWRlc1BlclZpZXcgPT09ICdhdXRvJyB8fCBwYXJhbXMuc2xpZGVzUGVyVmlldyA+IDEpICYmIHN3aXBlci5pc0VuZCAmJiAhc3dpcGVyLnBhcmFtcy5jZW50ZXJlZFNsaWRlcykge1xuICAgICAgc3dpcGVyLnNsaWRlVG8oc3dpcGVyLnNsaWRlcy5sZW5ndGggLSAxLCAwLCBmYWxzZSwgdHJ1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN3aXBlci5zbGlkZVRvKHN3aXBlci5hY3RpdmVJbmRleCwgMCwgZmFsc2UsIHRydWUpO1xuICAgIH1cbiAgfVxuICAvLyBSZXR1cm4gbG9ja3MgYWZ0ZXIgcmVzaXplXG4gIHN3aXBlci5hbGxvd1NsaWRlUHJldiA9IGFsbG93U2xpZGVQcmV2O1xuICBzd2lwZXIuYWxsb3dTbGlkZU5leHQgPSBhbGxvd1NsaWRlTmV4dDtcbn07XG5cbnZhciBvbkNsaWNrID0gZnVuY3Rpb24gKGUpIHtcbiAgdmFyIHN3aXBlciA9IHRoaXM7XG4gIGlmICghc3dpcGVyLmFsbG93Q2xpY2spIHtcbiAgICBpZiAoc3dpcGVyLnBhcmFtcy5wcmV2ZW50Q2xpY2tzKSB7IGUucHJldmVudERlZmF1bHQoKTsgfVxuICAgIGlmIChzd2lwZXIucGFyYW1zLnByZXZlbnRDbGlja3NQcm9wYWdhdGlvbiAmJiBzd2lwZXIuYW5pbWF0aW5nKSB7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICB9XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGF0dGFjaEV2ZW50cygpIHtcbiAgdmFyIHN3aXBlciA9IHRoaXM7XG5cbiAgdmFyIHBhcmFtcyA9IHN3aXBlci5wYXJhbXM7XG4gIHZhciB0b3VjaEV2ZW50cyA9IHN3aXBlci50b3VjaEV2ZW50cztcbiAgdmFyIGVsID0gc3dpcGVyLmVsO1xuICB2YXIgd3JhcHBlckVsID0gc3dpcGVyLndyYXBwZXJFbDtcblxuICB7XG4gICAgc3dpcGVyLm9uVG91Y2hTdGFydCA9IG9uVG91Y2hTdGFydC5iaW5kKHN3aXBlcik7XG4gICAgc3dpcGVyLm9uVG91Y2hNb3ZlID0gb25Ub3VjaE1vdmUuYmluZChzd2lwZXIpO1xuICAgIHN3aXBlci5vblRvdWNoRW5kID0gb25Ub3VjaEVuZC5iaW5kKHN3aXBlcik7XG4gIH1cblxuICBzd2lwZXIub25DbGljayA9IG9uQ2xpY2suYmluZChzd2lwZXIpO1xuXG4gIHZhciB0YXJnZXQgPSBwYXJhbXMudG91Y2hFdmVudHNUYXJnZXQgPT09ICdjb250YWluZXInID8gZWwgOiB3cmFwcGVyRWw7XG4gIHZhciBjYXB0dXJlID0gISFwYXJhbXMubmVzdGVkO1xuXG4gIC8vIFRvdWNoIEV2ZW50c1xuICB7XG4gICAgaWYgKEJyb3dzZXIuaWUpIHtcbiAgICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKHRvdWNoRXZlbnRzLnN0YXJ0LCBzd2lwZXIub25Ub3VjaFN0YXJ0LCBmYWxzZSk7XG4gICAgICAoU3VwcG9ydC50b3VjaCA/IHRhcmdldCA6IGRvYykuYWRkRXZlbnRMaXN0ZW5lcih0b3VjaEV2ZW50cy5tb3ZlLCBzd2lwZXIub25Ub3VjaE1vdmUsIGNhcHR1cmUpO1xuICAgICAgKFN1cHBvcnQudG91Y2ggPyB0YXJnZXQgOiBkb2MpLmFkZEV2ZW50TGlzdGVuZXIodG91Y2hFdmVudHMuZW5kLCBzd2lwZXIub25Ub3VjaEVuZCwgZmFsc2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoU3VwcG9ydC50b3VjaCkge1xuICAgICAgICB2YXIgcGFzc2l2ZUxpc3RlbmVyID0gdG91Y2hFdmVudHMuc3RhcnQgPT09ICd0b3VjaHN0YXJ0JyAmJiBTdXBwb3J0LnBhc3NpdmVMaXN0ZW5lciAmJiBwYXJhbXMucGFzc2l2ZUxpc3RlbmVycyA/IHsgcGFzc2l2ZTogdHJ1ZSwgY2FwdHVyZTogZmFsc2UgfSA6IGZhbHNlO1xuICAgICAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcih0b3VjaEV2ZW50cy5zdGFydCwgc3dpcGVyLm9uVG91Y2hTdGFydCwgcGFzc2l2ZUxpc3RlbmVyKTtcbiAgICAgICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIodG91Y2hFdmVudHMubW92ZSwgc3dpcGVyLm9uVG91Y2hNb3ZlLCBTdXBwb3J0LnBhc3NpdmVMaXN0ZW5lciA/IHsgcGFzc2l2ZTogZmFsc2UsIGNhcHR1cmU6IGNhcHR1cmUgfSA6IGNhcHR1cmUpO1xuICAgICAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcih0b3VjaEV2ZW50cy5lbmQsIHN3aXBlci5vblRvdWNoRW5kLCBwYXNzaXZlTGlzdGVuZXIpO1xuICAgICAgfVxuICAgICAgaWYgKChwYXJhbXMuc2ltdWxhdGVUb3VjaCAmJiAhRGV2aWNlLmlvcyAmJiAhRGV2aWNlLmFuZHJvaWQpIHx8IChwYXJhbXMuc2ltdWxhdGVUb3VjaCAmJiAhU3VwcG9ydC50b3VjaCAmJiBEZXZpY2UuaW9zKSkge1xuICAgICAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgc3dpcGVyLm9uVG91Y2hTdGFydCwgZmFsc2UpO1xuICAgICAgICBkb2MuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgc3dpcGVyLm9uVG91Y2hNb3ZlLCBjYXB0dXJlKTtcbiAgICAgICAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBzd2lwZXIub25Ub3VjaEVuZCwgZmFsc2UpO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBQcmV2ZW50IExpbmtzIENsaWNrc1xuICAgIGlmIChwYXJhbXMucHJldmVudENsaWNrcyB8fCBwYXJhbXMucHJldmVudENsaWNrc1Byb3BhZ2F0aW9uKSB7XG4gICAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzd2lwZXIub25DbGljaywgdHJ1ZSk7XG4gICAgfVxuICB9XG5cbiAgLy8gUmVzaXplIGhhbmRsZXJcbiAgc3dpcGVyLm9uKCdyZXNpemUgb2JzZXJ2ZXJVcGRhdGUnLCBvblJlc2l6ZSk7XG59XG5cbmZ1bmN0aW9uIGRldGFjaEV2ZW50cygpIHtcbiAgdmFyIHN3aXBlciA9IHRoaXM7XG5cbiAgdmFyIHBhcmFtcyA9IHN3aXBlci5wYXJhbXM7XG4gIHZhciB0b3VjaEV2ZW50cyA9IHN3aXBlci50b3VjaEV2ZW50cztcbiAgdmFyIGVsID0gc3dpcGVyLmVsO1xuICB2YXIgd3JhcHBlckVsID0gc3dpcGVyLndyYXBwZXJFbDtcblxuICB2YXIgdGFyZ2V0ID0gcGFyYW1zLnRvdWNoRXZlbnRzVGFyZ2V0ID09PSAnY29udGFpbmVyJyA/IGVsIDogd3JhcHBlckVsO1xuICB2YXIgY2FwdHVyZSA9ICEhcGFyYW1zLm5lc3RlZDtcblxuICAvLyBUb3VjaCBFdmVudHNcbiAge1xuICAgIGlmIChCcm93c2VyLmllKSB7XG4gICAgICB0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0b3VjaEV2ZW50cy5zdGFydCwgc3dpcGVyLm9uVG91Y2hTdGFydCwgZmFsc2UpO1xuICAgICAgKFN1cHBvcnQudG91Y2ggPyB0YXJnZXQgOiBkb2MpLnJlbW92ZUV2ZW50TGlzdGVuZXIodG91Y2hFdmVudHMubW92ZSwgc3dpcGVyLm9uVG91Y2hNb3ZlLCBjYXB0dXJlKTtcbiAgICAgIChTdXBwb3J0LnRvdWNoID8gdGFyZ2V0IDogZG9jKS5yZW1vdmVFdmVudExpc3RlbmVyKHRvdWNoRXZlbnRzLmVuZCwgc3dpcGVyLm9uVG91Y2hFbmQsIGZhbHNlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKFN1cHBvcnQudG91Y2gpIHtcbiAgICAgICAgdmFyIHBhc3NpdmVMaXN0ZW5lciA9IHRvdWNoRXZlbnRzLnN0YXJ0ID09PSAnb25Ub3VjaFN0YXJ0JyAmJiBTdXBwb3J0LnBhc3NpdmVMaXN0ZW5lciAmJiBwYXJhbXMucGFzc2l2ZUxpc3RlbmVycyA/IHsgcGFzc2l2ZTogdHJ1ZSwgY2FwdHVyZTogZmFsc2UgfSA6IGZhbHNlO1xuICAgICAgICB0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0b3VjaEV2ZW50cy5zdGFydCwgc3dpcGVyLm9uVG91Y2hTdGFydCwgcGFzc2l2ZUxpc3RlbmVyKTtcbiAgICAgICAgdGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIodG91Y2hFdmVudHMubW92ZSwgc3dpcGVyLm9uVG91Y2hNb3ZlLCBjYXB0dXJlKTtcbiAgICAgICAgdGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIodG91Y2hFdmVudHMuZW5kLCBzd2lwZXIub25Ub3VjaEVuZCwgcGFzc2l2ZUxpc3RlbmVyKTtcbiAgICAgIH1cbiAgICAgIGlmICgocGFyYW1zLnNpbXVsYXRlVG91Y2ggJiYgIURldmljZS5pb3MgJiYgIURldmljZS5hbmRyb2lkKSB8fCAocGFyYW1zLnNpbXVsYXRlVG91Y2ggJiYgIVN1cHBvcnQudG91Y2ggJiYgRGV2aWNlLmlvcykpIHtcbiAgICAgICAgdGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHN3aXBlci5vblRvdWNoU3RhcnQsIGZhbHNlKTtcbiAgICAgICAgZG9jLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHN3aXBlci5vblRvdWNoTW92ZSwgY2FwdHVyZSk7XG4gICAgICAgIGRvYy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgc3dpcGVyLm9uVG91Y2hFbmQsIGZhbHNlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gUHJldmVudCBMaW5rcyBDbGlja3NcbiAgICBpZiAocGFyYW1zLnByZXZlbnRDbGlja3MgfHwgcGFyYW1zLnByZXZlbnRDbGlja3NQcm9wYWdhdGlvbikge1xuICAgICAgdGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc3dpcGVyLm9uQ2xpY2ssIHRydWUpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFJlc2l6ZSBoYW5kbGVyXG4gIHN3aXBlci5vZmYoJ3Jlc2l6ZSBvYnNlcnZlclVwZGF0ZScsIG9uUmVzaXplKTtcbn1cblxudmFyIGV2ZW50cyA9IHtcbiAgYXR0YWNoRXZlbnRzOiBhdHRhY2hFdmVudHMsXG4gIGRldGFjaEV2ZW50czogZGV0YWNoRXZlbnRzLFxufTtcblxudmFyIHNldEJyZWFrcG9pbnQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBzd2lwZXIgPSB0aGlzO1xuICB2YXIgYWN0aXZlSW5kZXggPSBzd2lwZXIuYWN0aXZlSW5kZXg7XG4gIHZhciBsb29wZWRTbGlkZXMgPSBzd2lwZXIubG9vcGVkU2xpZGVzOyBpZiAoIGxvb3BlZFNsaWRlcyA9PT0gdm9pZCAwICkgbG9vcGVkU2xpZGVzID0gMDtcbiAgdmFyIHBhcmFtcyA9IHN3aXBlci5wYXJhbXM7XG4gIHZhciBicmVha3BvaW50cyA9IHBhcmFtcy5icmVha3BvaW50cztcbiAgaWYgKCFicmVha3BvaW50cyB8fCAoYnJlYWtwb2ludHMgJiYgT2JqZWN0LmtleXMoYnJlYWtwb2ludHMpLmxlbmd0aCA9PT0gMCkpIHsgcmV0dXJuOyB9XG4gIC8vIFNldCBicmVha3BvaW50IGZvciB3aW5kb3cgd2lkdGggYW5kIHVwZGF0ZSBwYXJhbWV0ZXJzXG4gIHZhciBicmVha3BvaW50ID0gc3dpcGVyLmdldEJyZWFrcG9pbnQoYnJlYWtwb2ludHMpO1xuICBpZiAoYnJlYWtwb2ludCAmJiBzd2lwZXIuY3VycmVudEJyZWFrcG9pbnQgIT09IGJyZWFrcG9pbnQpIHtcbiAgICB2YXIgYnJlYWtQb2ludHNQYXJhbXMgPSBicmVha3BvaW50IGluIGJyZWFrcG9pbnRzID8gYnJlYWtwb2ludHNbYnJlYWtwb2ludF0gOiBzd2lwZXIub3JpZ2luYWxQYXJhbXM7XG4gICAgdmFyIG5lZWRzUmVMb29wID0gcGFyYW1zLmxvb3AgJiYgKGJyZWFrUG9pbnRzUGFyYW1zLnNsaWRlc1BlclZpZXcgIT09IHBhcmFtcy5zbGlkZXNQZXJWaWV3KTtcblxuICAgIFV0aWxzLmV4dGVuZChzd2lwZXIucGFyYW1zLCBicmVha1BvaW50c1BhcmFtcyk7XG5cbiAgICBVdGlscy5leHRlbmQoc3dpcGVyLCB7XG4gICAgICBhbGxvd1RvdWNoTW92ZTogc3dpcGVyLnBhcmFtcy5hbGxvd1RvdWNoTW92ZSxcbiAgICAgIGFsbG93U2xpZGVOZXh0OiBzd2lwZXIucGFyYW1zLmFsbG93U2xpZGVOZXh0LFxuICAgICAgYWxsb3dTbGlkZVByZXY6IHN3aXBlci5wYXJhbXMuYWxsb3dTbGlkZVByZXYsXG4gICAgfSk7XG5cbiAgICBzd2lwZXIuY3VycmVudEJyZWFrcG9pbnQgPSBicmVha3BvaW50O1xuXG4gICAgaWYgKG5lZWRzUmVMb29wKSB7XG4gICAgICBzd2lwZXIubG9vcERlc3Ryb3koKTtcbiAgICAgIHN3aXBlci5sb29wQ3JlYXRlKCk7XG4gICAgICBzd2lwZXIudXBkYXRlU2xpZGVzKCk7XG4gICAgICBzd2lwZXIuc2xpZGVUbygoYWN0aXZlSW5kZXggLSBsb29wZWRTbGlkZXMpICsgc3dpcGVyLmxvb3BlZFNsaWRlcywgMCwgZmFsc2UpO1xuICAgIH1cbiAgICBzd2lwZXIuZW1pdCgnYnJlYWtwb2ludCcsIGJyZWFrUG9pbnRzUGFyYW1zKTtcbiAgfVxufTtcblxudmFyIGdldEJyZWFrcG9pbnQgPSBmdW5jdGlvbiAoYnJlYWtwb2ludHMpIHtcbiAgLy8gR2V0IGJyZWFrcG9pbnQgZm9yIHdpbmRvdyB3aWR0aFxuICBpZiAoIWJyZWFrcG9pbnRzKSB7IHJldHVybiB1bmRlZmluZWQ7IH1cbiAgdmFyIGJyZWFrcG9pbnQgPSBmYWxzZTtcbiAgdmFyIHBvaW50cyA9IFtdO1xuICBPYmplY3Qua2V5cyhicmVha3BvaW50cykuZm9yRWFjaChmdW5jdGlvbiAocG9pbnQpIHtcbiAgICBwb2ludHMucHVzaChwb2ludCk7XG4gIH0pO1xuICBwb2ludHMuc29ydChmdW5jdGlvbiAoYSwgYikgeyByZXR1cm4gcGFyc2VJbnQoYSwgMTApIC0gcGFyc2VJbnQoYiwgMTApOyB9KTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwb2ludHMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICB2YXIgcG9pbnQgPSBwb2ludHNbaV07XG4gICAgaWYgKHBvaW50ID49IHdpbi5pbm5lcldpZHRoICYmICFicmVha3BvaW50KSB7XG4gICAgICBicmVha3BvaW50ID0gcG9pbnQ7XG4gICAgfVxuICB9XG4gIHJldHVybiBicmVha3BvaW50IHx8ICdtYXgnO1xufTtcblxudmFyIGJyZWFrcG9pbnRzID0geyBzZXRCcmVha3BvaW50OiBzZXRCcmVha3BvaW50LCBnZXRCcmVha3BvaW50OiBnZXRCcmVha3BvaW50IH07XG5cbnZhciBhZGRDbGFzc2VzID0gZnVuY3Rpb24gKCkge1xuICB2YXIgc3dpcGVyID0gdGhpcztcbiAgdmFyIGNsYXNzTmFtZXMgPSBzd2lwZXIuY2xhc3NOYW1lcztcbiAgdmFyIHBhcmFtcyA9IHN3aXBlci5wYXJhbXM7XG4gIHZhciBydGwgPSBzd2lwZXIucnRsO1xuICB2YXIgJGVsID0gc3dpcGVyLiRlbDtcbiAgdmFyIHN1ZmZpeGVzID0gW107XG5cbiAgc3VmZml4ZXMucHVzaChwYXJhbXMuZGlyZWN0aW9uKTtcblxuICBpZiAocGFyYW1zLmZyZWVNb2RlKSB7XG4gICAgc3VmZml4ZXMucHVzaCgnZnJlZS1tb2RlJyk7XG4gIH1cbiAgaWYgKCFTdXBwb3J0LmZsZXhib3gpIHtcbiAgICBzdWZmaXhlcy5wdXNoKCduby1mbGV4Ym94Jyk7XG4gIH1cbiAgaWYgKHBhcmFtcy5hdXRvSGVpZ2h0KSB7XG4gICAgc3VmZml4ZXMucHVzaCgnYXV0b2hlaWdodCcpO1xuICB9XG4gIGlmIChydGwpIHtcbiAgICBzdWZmaXhlcy5wdXNoKCdydGwnKTtcbiAgfVxuICBpZiAocGFyYW1zLnNsaWRlc1BlckNvbHVtbiA+IDEpIHtcbiAgICBzdWZmaXhlcy5wdXNoKCdtdWx0aXJvdycpO1xuICB9XG4gIGlmIChEZXZpY2UuYW5kcm9pZCkge1xuICAgIHN1ZmZpeGVzLnB1c2goJ2FuZHJvaWQnKTtcbiAgfVxuICBpZiAoRGV2aWNlLmlvcykge1xuICAgIHN1ZmZpeGVzLnB1c2goJ2lvcycpO1xuICB9XG4gIC8vIFdQOCBUb3VjaCBFdmVudHMgRml4XG4gIGlmICh3aW4ubmF2aWdhdG9yLnBvaW50ZXJFbmFibGVkIHx8IHdpbi5uYXZpZ2F0b3IubXNQb2ludGVyRW5hYmxlZCkge1xuICAgIHN1ZmZpeGVzLnB1c2goKFwid3A4LVwiICsgKHBhcmFtcy5kaXJlY3Rpb24pKSk7XG4gIH1cblxuICBzdWZmaXhlcy5mb3JFYWNoKGZ1bmN0aW9uIChzdWZmaXgpIHtcbiAgICBjbGFzc05hbWVzLnB1c2gocGFyYW1zLmNvbnRhaW5lck1vZGlmaWVyQ2xhc3MgKyBzdWZmaXgpO1xuICB9KTtcblxuICAkZWwuYWRkQ2xhc3MoY2xhc3NOYW1lcy5qb2luKCcgJykpO1xufTtcblxudmFyIHJlbW92ZUNsYXNzZXMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBzd2lwZXIgPSB0aGlzO1xuICB2YXIgJGVsID0gc3dpcGVyLiRlbDtcbiAgdmFyIGNsYXNzTmFtZXMgPSBzd2lwZXIuY2xhc3NOYW1lcztcblxuICAkZWwucmVtb3ZlQ2xhc3MoY2xhc3NOYW1lcy5qb2luKCcgJykpO1xufTtcblxudmFyIGNsYXNzZXMgPSB7IGFkZENsYXNzZXM6IGFkZENsYXNzZXMsIHJlbW92ZUNsYXNzZXM6IHJlbW92ZUNsYXNzZXMgfTtcblxudmFyIGxvYWRJbWFnZSA9IGZ1bmN0aW9uIChpbWFnZUVsLCBzcmMsIHNyY3NldCwgc2l6ZXMsIGNoZWNrRm9yQ29tcGxldGUsIGNhbGxiYWNrKSB7XG4gIHZhciBpbWFnZTtcbiAgZnVuY3Rpb24gb25SZWFkeSgpIHtcbiAgICBpZiAoY2FsbGJhY2spIHsgY2FsbGJhY2soKTsgfVxuICB9XG4gIGlmICghaW1hZ2VFbC5jb21wbGV0ZSB8fCAhY2hlY2tGb3JDb21wbGV0ZSkge1xuICAgIGlmIChzcmMpIHtcbiAgICAgIGltYWdlID0gbmV3IHdpbi5JbWFnZSgpO1xuICAgICAgaW1hZ2Uub25sb2FkID0gb25SZWFkeTtcbiAgICAgIGltYWdlLm9uZXJyb3IgPSBvblJlYWR5O1xuICAgICAgaWYgKHNpemVzKSB7XG4gICAgICAgIGltYWdlLnNpemVzID0gc2l6ZXM7XG4gICAgICB9XG4gICAgICBpZiAoc3Jjc2V0KSB7XG4gICAgICAgIGltYWdlLnNyY3NldCA9IHNyY3NldDtcbiAgICAgIH1cbiAgICAgIGlmIChzcmMpIHtcbiAgICAgICAgaW1hZ2Uuc3JjID0gc3JjO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBvblJlYWR5KCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIGltYWdlIGFscmVhZHkgbG9hZGVkLi4uXG4gICAgb25SZWFkeSgpO1xuICB9XG59O1xuXG52YXIgcHJlbG9hZEltYWdlcyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHN3aXBlciA9IHRoaXM7XG4gIHN3aXBlci5pbWFnZXNUb0xvYWQgPSBzd2lwZXIuJGVsLmZpbmQoJ2ltZycpO1xuICBmdW5jdGlvbiBvblJlYWR5KCkge1xuICAgIGlmICh0eXBlb2Ygc3dpcGVyID09PSAndW5kZWZpbmVkJyB8fCBzd2lwZXIgPT09IG51bGwgfHwgIXN3aXBlciB8fCBzd2lwZXIuZGVzdHJveWVkKSB7IHJldHVybjsgfVxuICAgIGlmIChzd2lwZXIuaW1hZ2VzTG9hZGVkICE9PSB1bmRlZmluZWQpIHsgc3dpcGVyLmltYWdlc0xvYWRlZCArPSAxOyB9XG4gICAgaWYgKHN3aXBlci5pbWFnZXNMb2FkZWQgPT09IHN3aXBlci5pbWFnZXNUb0xvYWQubGVuZ3RoKSB7XG4gICAgICBpZiAoc3dpcGVyLnBhcmFtcy51cGRhdGVPbkltYWdlc1JlYWR5KSB7IHN3aXBlci51cGRhdGUoKTsgfVxuICAgICAgc3dpcGVyLmVtaXQoJ2ltYWdlc1JlYWR5Jyk7XG4gICAgfVxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3dpcGVyLmltYWdlc1RvTG9hZC5sZW5ndGg7IGkgKz0gMSkge1xuICAgIHZhciBpbWFnZUVsID0gc3dpcGVyLmltYWdlc1RvTG9hZFtpXTtcbiAgICBzd2lwZXIubG9hZEltYWdlKFxuICAgICAgaW1hZ2VFbCxcbiAgICAgIGltYWdlRWwuY3VycmVudFNyYyB8fCBpbWFnZUVsLmdldEF0dHJpYnV0ZSgnc3JjJyksXG4gICAgICBpbWFnZUVsLnNyY3NldCB8fCBpbWFnZUVsLmdldEF0dHJpYnV0ZSgnc3Jjc2V0JyksXG4gICAgICBpbWFnZUVsLnNpemVzIHx8IGltYWdlRWwuZ2V0QXR0cmlidXRlKCdzaXplcycpLFxuICAgICAgdHJ1ZSxcbiAgICAgIG9uUmVhZHlcbiAgICApO1xuICB9XG59O1xuXG52YXIgaW1hZ2VzID0ge1xuICBsb2FkSW1hZ2U6IGxvYWRJbWFnZSxcbiAgcHJlbG9hZEltYWdlczogcHJlbG9hZEltYWdlcyxcbn07XG5cbnZhciBkZWZhdWx0cyA9IHtcbiAgaW5pdDogdHJ1ZSxcbiAgZGlyZWN0aW9uOiAnaG9yaXpvbnRhbCcsXG4gIHRvdWNoRXZlbnRzVGFyZ2V0OiAnY29udGFpbmVyJyxcbiAgaW5pdGlhbFNsaWRlOiAwLFxuICBzcGVlZDogMzAwLFxuXG4gIC8vIFRvIHN1cHBvcnQgaU9TJ3Mgc3dpcGUtdG8tZ28tYmFjayBnZXN0dXJlICh3aGVuIGJlaW5nIHVzZWQgaW4tYXBwLCB3aXRoIFVJV2ViVmlldykuXG4gIGlPU0VkZ2VTd2lwZURldGVjdGlvbjogZmFsc2UsXG4gIGlPU0VkZ2VTd2lwZVRocmVzaG9sZDogMjAsXG5cbiAgLy8gRnJlZSBtb2RlXG4gIGZyZWVNb2RlOiBmYWxzZSxcbiAgZnJlZU1vZGVNb21lbnR1bTogdHJ1ZSxcbiAgZnJlZU1vZGVNb21lbnR1bVJhdGlvOiAxLFxuICBmcmVlTW9kZU1vbWVudHVtQm91bmNlOiB0cnVlLFxuICBmcmVlTW9kZU1vbWVudHVtQm91bmNlUmF0aW86IDEsXG4gIGZyZWVNb2RlTW9tZW50dW1WZWxvY2l0eVJhdGlvOiAxLFxuICBmcmVlTW9kZVN0aWNreTogZmFsc2UsXG4gIGZyZWVNb2RlTWluaW11bVZlbG9jaXR5OiAwLjAyLFxuXG4gIC8vIEF1dG9oZWlnaHRcbiAgYXV0b0hlaWdodDogZmFsc2UsXG5cbiAgLy8gU2V0IHdyYXBwZXIgd2lkdGhcbiAgc2V0V3JhcHBlclNpemU6IGZhbHNlLFxuXG4gIC8vIFZpcnR1YWwgVHJhbnNsYXRlXG4gIHZpcnR1YWxUcmFuc2xhdGU6IGZhbHNlLFxuXG4gIC8vIEVmZmVjdHNcbiAgZWZmZWN0OiAnc2xpZGUnLCAvLyAnc2xpZGUnIG9yICdmYWRlJyBvciAnY3ViZScgb3IgJ2NvdmVyZmxvdycgb3IgJ2ZsaXAnXG5cbiAgLy8gQnJlYWtwb2ludHNcbiAgYnJlYWtwb2ludHM6IHVuZGVmaW5lZCxcblxuICAvLyBTbGlkZXMgZ3JpZFxuICBzcGFjZUJldHdlZW46IDAsXG4gIHNsaWRlc1BlclZpZXc6IDEsXG4gIHNsaWRlc1BlckNvbHVtbjogMSxcbiAgc2xpZGVzUGVyQ29sdW1uRmlsbDogJ2NvbHVtbicsXG4gIHNsaWRlc1Blckdyb3VwOiAxLFxuICBjZW50ZXJlZFNsaWRlczogZmFsc2UsXG4gIHNsaWRlc09mZnNldEJlZm9yZTogMCwgLy8gaW4gcHhcbiAgc2xpZGVzT2Zmc2V0QWZ0ZXI6IDAsIC8vIGluIHB4XG4gIG5vcm1hbGl6ZVNsaWRlSW5kZXg6IHRydWUsXG5cbiAgLy8gUm91bmQgbGVuZ3RoXG4gIHJvdW5kTGVuZ3RoczogZmFsc2UsXG5cbiAgLy8gVG91Y2hlc1xuICB0b3VjaFJhdGlvOiAxLFxuICB0b3VjaEFuZ2xlOiA0NSxcbiAgc2ltdWxhdGVUb3VjaDogdHJ1ZSxcbiAgc2hvcnRTd2lwZXM6IHRydWUsXG4gIGxvbmdTd2lwZXM6IHRydWUsXG4gIGxvbmdTd2lwZXNSYXRpbzogMC41LFxuICBsb25nU3dpcGVzTXM6IDMwMCxcbiAgZm9sbG93RmluZ2VyOiB0cnVlLFxuICBhbGxvd1RvdWNoTW92ZTogdHJ1ZSxcbiAgdGhyZXNob2xkOiAwLFxuICB0b3VjaE1vdmVTdG9wUHJvcGFnYXRpb246IHRydWUsXG4gIHRvdWNoUmVsZWFzZU9uRWRnZXM6IGZhbHNlLFxuXG4gIC8vIFVuaXF1ZSBOYXZpZ2F0aW9uIEVsZW1lbnRzXG4gIHVuaXF1ZU5hdkVsZW1lbnRzOiB0cnVlLFxuXG4gIC8vIFJlc2lzdGFuY2VcbiAgcmVzaXN0YW5jZTogdHJ1ZSxcbiAgcmVzaXN0YW5jZVJhdGlvOiAwLjg1LFxuXG4gIC8vIFByb2dyZXNzXG4gIHdhdGNoU2xpZGVzUHJvZ3Jlc3M6IGZhbHNlLFxuICB3YXRjaFNsaWRlc1Zpc2liaWxpdHk6IGZhbHNlLFxuXG4gIC8vIEN1cnNvclxuICBncmFiQ3Vyc29yOiBmYWxzZSxcblxuICAvLyBDbGlja3NcbiAgcHJldmVudENsaWNrczogdHJ1ZSxcbiAgcHJldmVudENsaWNrc1Byb3BhZ2F0aW9uOiB0cnVlLFxuICBzbGlkZVRvQ2xpY2tlZFNsaWRlOiBmYWxzZSxcblxuICAvLyBJbWFnZXNcbiAgcHJlbG9hZEltYWdlczogdHJ1ZSxcbiAgdXBkYXRlT25JbWFnZXNSZWFkeTogdHJ1ZSxcblxuICAvLyBsb29wXG4gIGxvb3A6IGZhbHNlLFxuICBsb29wQWRkaXRpb25hbFNsaWRlczogMCxcbiAgbG9vcGVkU2xpZGVzOiBudWxsLFxuICBsb29wRmlsbEdyb3VwV2l0aEJsYW5rOiBmYWxzZSxcblxuICAvLyBTd2lwaW5nL25vIHN3aXBpbmdcbiAgYWxsb3dTbGlkZVByZXY6IHRydWUsXG4gIGFsbG93U2xpZGVOZXh0OiB0cnVlLFxuICBzd2lwZUhhbmRsZXI6IG51bGwsIC8vICcuc3dpcGUtaGFuZGxlcicsXG4gIG5vU3dpcGluZzogdHJ1ZSxcbiAgbm9Td2lwaW5nQ2xhc3M6ICdzd2lwZXItbm8tc3dpcGluZycsXG5cbiAgLy8gUGFzc2l2ZSBMaXN0ZW5lcnNcbiAgcGFzc2l2ZUxpc3RlbmVyczogdHJ1ZSxcblxuICAvLyBOU1xuICBjb250YWluZXJNb2RpZmllckNsYXNzOiAnc3dpcGVyLWNvbnRhaW5lci0nLCAvLyBORVdcbiAgc2xpZGVDbGFzczogJ3N3aXBlci1zbGlkZScsXG4gIHNsaWRlQmxhbmtDbGFzczogJ3N3aXBlci1zbGlkZS1pbnZpc2libGUtYmxhbmsnLFxuICBzbGlkZUFjdGl2ZUNsYXNzOiAnc3dpcGVyLXNsaWRlLWFjdGl2ZScsXG4gIHNsaWRlRHVwbGljYXRlQWN0aXZlQ2xhc3M6ICdzd2lwZXItc2xpZGUtZHVwbGljYXRlLWFjdGl2ZScsXG4gIHNsaWRlVmlzaWJsZUNsYXNzOiAnc3dpcGVyLXNsaWRlLXZpc2libGUnLFxuICBzbGlkZUR1cGxpY2F0ZUNsYXNzOiAnc3dpcGVyLXNsaWRlLWR1cGxpY2F0ZScsXG4gIHNsaWRlTmV4dENsYXNzOiAnc3dpcGVyLXNsaWRlLW5leHQnLFxuICBzbGlkZUR1cGxpY2F0ZU5leHRDbGFzczogJ3N3aXBlci1zbGlkZS1kdXBsaWNhdGUtbmV4dCcsXG4gIHNsaWRlUHJldkNsYXNzOiAnc3dpcGVyLXNsaWRlLXByZXYnLFxuICBzbGlkZUR1cGxpY2F0ZVByZXZDbGFzczogJ3N3aXBlci1zbGlkZS1kdXBsaWNhdGUtcHJldicsXG4gIHdyYXBwZXJDbGFzczogJ3N3aXBlci13cmFwcGVyJyxcblxuICAvLyBDYWxsYmFja3NcbiAgcnVuQ2FsbGJhY2tzT25Jbml0OiB0cnVlLFxufTtcblxudmFyIHByb3RvdHlwZXMgPSB7XG4gIHVwZGF0ZTogdXBkYXRlLFxuICB0cmFuc2xhdGU6IHRyYW5zbGF0ZSxcbiAgdHJhbnNpdGlvbjogdHJhbnNpdGlvbiQxLFxuICBzbGlkZTogc2xpZGUsXG4gIGxvb3A6IGxvb3AsXG4gIGdyYWJDdXJzb3I6IGdyYWJDdXJzb3IsXG4gIG1hbmlwdWxhdGlvbjogbWFuaXB1bGF0aW9uLFxuICBldmVudHM6IGV2ZW50cyxcbiAgYnJlYWtwb2ludHM6IGJyZWFrcG9pbnRzLFxuICBjbGFzc2VzOiBjbGFzc2VzLFxuICBpbWFnZXM6IGltYWdlcyxcbn07XG5cbnZhciBleHRlbmRlZERlZmF1bHRzID0ge307XG5cbnZhciBTd2lwZXIkMSA9IChmdW5jdGlvbiAoU3dpcGVyQ2xhc3MkJDEpIHtcbiAgZnVuY3Rpb24gU3dpcGVyKCkge1xuICAgIHZhciBhcmdzID0gW10sIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgd2hpbGUgKCBsZW4tLSApIGFyZ3NbIGxlbiBdID0gYXJndW1lbnRzWyBsZW4gXTtcblxuICAgIHZhciBlbDtcbiAgICB2YXIgcGFyYW1zO1xuICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMSAmJiBhcmdzWzBdLmNvbnN0cnVjdG9yICYmIGFyZ3NbMF0uY29uc3RydWN0b3IgPT09IE9iamVjdCkge1xuICAgICAgcGFyYW1zID0gYXJnc1swXTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGFzc2lnbjtcbiAgICAgIChhc3NpZ24gPSBhcmdzLCBlbCA9IGFzc2lnblswXSwgcGFyYW1zID0gYXNzaWduWzFdKTtcbiAgICB9XG4gICAgaWYgKCFwYXJhbXMpIHsgcGFyYW1zID0ge307IH1cblxuICAgIHBhcmFtcyA9IFV0aWxzLmV4dGVuZCh7fSwgcGFyYW1zKTtcbiAgICBpZiAoZWwgJiYgIXBhcmFtcy5lbCkgeyBwYXJhbXMuZWwgPSBlbDsgfVxuXG4gICAgU3dpcGVyQ2xhc3MkJDEuY2FsbCh0aGlzLCBwYXJhbXMpO1xuXG4gICAgT2JqZWN0LmtleXMocHJvdG90eXBlcykuZm9yRWFjaChmdW5jdGlvbiAocHJvdG90eXBlR3JvdXApIHtcbiAgICAgIE9iamVjdC5rZXlzKHByb3RvdHlwZXNbcHJvdG90eXBlR3JvdXBdKS5mb3JFYWNoKGZ1bmN0aW9uIChwcm90b01ldGhvZCkge1xuICAgICAgICBpZiAoIVN3aXBlci5wcm90b3R5cGVbcHJvdG9NZXRob2RdKSB7XG4gICAgICAgICAgU3dpcGVyLnByb3RvdHlwZVtwcm90b01ldGhvZF0gPSBwcm90b3R5cGVzW3Byb3RvdHlwZUdyb3VwXVtwcm90b01ldGhvZF07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gU3dpcGVyIEluc3RhbmNlXG4gICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgaWYgKHR5cGVvZiBzd2lwZXIubW9kdWxlcyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHN3aXBlci5tb2R1bGVzID0ge307XG4gICAgfVxuICAgIE9iamVjdC5rZXlzKHN3aXBlci5tb2R1bGVzKS5mb3JFYWNoKGZ1bmN0aW9uIChtb2R1bGVOYW1lKSB7XG4gICAgICB2YXIgbW9kdWxlID0gc3dpcGVyLm1vZHVsZXNbbW9kdWxlTmFtZV07XG4gICAgICBpZiAobW9kdWxlLnBhcmFtcykge1xuICAgICAgICB2YXIgbW9kdWxlUGFyYW1OYW1lID0gT2JqZWN0LmtleXMobW9kdWxlLnBhcmFtcylbMF07XG4gICAgICAgIHZhciBtb2R1bGVQYXJhbXMgPSBtb2R1bGUucGFyYW1zW21vZHVsZVBhcmFtTmFtZV07XG4gICAgICAgIGlmICh0eXBlb2YgbW9kdWxlUGFyYW1zICE9PSAnb2JqZWN0JykgeyByZXR1cm47IH1cbiAgICAgICAgaWYgKCEobW9kdWxlUGFyYW1OYW1lIGluIHBhcmFtcyAmJiAnZW5hYmxlZCcgaW4gbW9kdWxlUGFyYW1zKSkgeyByZXR1cm47IH1cbiAgICAgICAgaWYgKHBhcmFtc1ttb2R1bGVQYXJhbU5hbWVdID09PSB0cnVlKSB7XG4gICAgICAgICAgcGFyYW1zW21vZHVsZVBhcmFtTmFtZV0gPSB7IGVuYWJsZWQ6IHRydWUgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoXG4gICAgICAgICAgdHlwZW9mIHBhcmFtc1ttb2R1bGVQYXJhbU5hbWVdID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAgICEoJ2VuYWJsZWQnIGluIHBhcmFtc1ttb2R1bGVQYXJhbU5hbWVdKVxuICAgICAgICApIHtcbiAgICAgICAgICBwYXJhbXNbbW9kdWxlUGFyYW1OYW1lXS5lbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXBhcmFtc1ttb2R1bGVQYXJhbU5hbWVdKSB7IHBhcmFtc1ttb2R1bGVQYXJhbU5hbWVdID0geyBlbmFibGVkOiBmYWxzZSB9OyB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBFeHRlbmQgZGVmYXVsdHMgd2l0aCBtb2R1bGVzIHBhcmFtc1xuICAgIHZhciBzd2lwZXJQYXJhbXMgPSBVdGlscy5leHRlbmQoe30sIGRlZmF1bHRzKTtcbiAgICBzd2lwZXIudXNlTW9kdWxlc1BhcmFtcyhzd2lwZXJQYXJhbXMpO1xuXG4gICAgLy8gRXh0ZW5kIGRlZmF1bHRzIHdpdGggcGFzc2VkIHBhcmFtc1xuICAgIHN3aXBlci5wYXJhbXMgPSBVdGlscy5leHRlbmQoe30sIHN3aXBlclBhcmFtcywgZXh0ZW5kZWREZWZhdWx0cywgcGFyYW1zKTtcbiAgICBzd2lwZXIub3JpZ2luYWxQYXJhbXMgPSBVdGlscy5leHRlbmQoe30sIHN3aXBlci5wYXJhbXMpO1xuICAgIHN3aXBlci5wYXNzZWRQYXJhbXMgPSBVdGlscy5leHRlbmQoe30sIHBhcmFtcyk7XG5cbiAgICAvLyBGaW5kIGVsXG4gICAgdmFyICRlbCA9ICQkMShzd2lwZXIucGFyYW1zLmVsKTtcbiAgICBlbCA9ICRlbFswXTtcblxuICAgIGlmICghZWwpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgaWYgKCRlbC5sZW5ndGggPiAxKSB7XG4gICAgICB2YXIgc3dpcGVycyA9IFtdO1xuICAgICAgJGVsLmVhY2goZnVuY3Rpb24gKGluZGV4LCBjb250YWluZXJFbCkge1xuICAgICAgICB2YXIgbmV3UGFyYW1zID0gVXRpbHMuZXh0ZW5kKHt9LCBwYXJhbXMsIHsgZWw6IGNvbnRhaW5lckVsIH0pO1xuICAgICAgICBzd2lwZXJzLnB1c2gobmV3IFN3aXBlcihuZXdQYXJhbXMpKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHN3aXBlcnM7XG4gICAgfVxuXG4gICAgZWwuc3dpcGVyID0gc3dpcGVyO1xuICAgICRlbC5kYXRhKCdzd2lwZXInLCBzd2lwZXIpO1xuXG4gICAgLy8gRmluZCBXcmFwcGVyXG4gICAgdmFyICR3cmFwcGVyRWwgPSAkZWwuY2hpbGRyZW4oKFwiLlwiICsgKHN3aXBlci5wYXJhbXMud3JhcHBlckNsYXNzKSkpO1xuXG4gICAgLy8gRXh0ZW5kIFN3aXBlclxuICAgIFV0aWxzLmV4dGVuZChzd2lwZXIsIHtcbiAgICAgICRlbDogJGVsLFxuICAgICAgZWw6IGVsLFxuICAgICAgJHdyYXBwZXJFbDogJHdyYXBwZXJFbCxcbiAgICAgIHdyYXBwZXJFbDogJHdyYXBwZXJFbFswXSxcblxuICAgICAgLy8gQ2xhc3Nlc1xuICAgICAgY2xhc3NOYW1lczogW10sXG5cbiAgICAgIC8vIFNsaWRlc1xuICAgICAgc2xpZGVzOiAkJDEoKSxcbiAgICAgIHNsaWRlc0dyaWQ6IFtdLFxuICAgICAgc25hcEdyaWQ6IFtdLFxuICAgICAgc2xpZGVzU2l6ZXNHcmlkOiBbXSxcblxuICAgICAgLy8gaXNEaXJlY3Rpb25cbiAgICAgIGlzSG9yaXpvbnRhbDogZnVuY3Rpb24gaXNIb3Jpem9udGFsKCkge1xuICAgICAgICByZXR1cm4gc3dpcGVyLnBhcmFtcy5kaXJlY3Rpb24gPT09ICdob3Jpem9udGFsJztcbiAgICAgIH0sXG4gICAgICBpc1ZlcnRpY2FsOiBmdW5jdGlvbiBpc1ZlcnRpY2FsKCkge1xuICAgICAgICByZXR1cm4gc3dpcGVyLnBhcmFtcy5kaXJlY3Rpb24gPT09ICd2ZXJ0aWNhbCc7XG4gICAgICB9LFxuICAgICAgLy8gUlRMXG4gICAgICBydGw6IHN3aXBlci5wYXJhbXMuZGlyZWN0aW9uID09PSAnaG9yaXpvbnRhbCcgJiYgKGVsLmRpci50b0xvd2VyQ2FzZSgpID09PSAncnRsJyB8fCAkZWwuY3NzKCdkaXJlY3Rpb24nKSA9PT0gJ3J0bCcpLFxuICAgICAgd3JvbmdSVEw6ICR3cmFwcGVyRWwuY3NzKCdkaXNwbGF5JykgPT09ICctd2Via2l0LWJveCcsXG5cbiAgICAgIC8vIEluZGV4ZXNcbiAgICAgIGFjdGl2ZUluZGV4OiAwLFxuICAgICAgcmVhbEluZGV4OiAwLFxuXG4gICAgICAvL1xuICAgICAgaXNCZWdpbm5pbmc6IHRydWUsXG4gICAgICBpc0VuZDogZmFsc2UsXG5cbiAgICAgIC8vIFByb3BzXG4gICAgICB0cmFuc2xhdGU6IDAsXG4gICAgICBwcm9ncmVzczogMCxcbiAgICAgIHZlbG9jaXR5OiAwLFxuICAgICAgYW5pbWF0aW5nOiBmYWxzZSxcblxuICAgICAgLy8gTG9ja3NcbiAgICAgIGFsbG93U2xpZGVOZXh0OiBzd2lwZXIucGFyYW1zLmFsbG93U2xpZGVOZXh0LFxuICAgICAgYWxsb3dTbGlkZVByZXY6IHN3aXBlci5wYXJhbXMuYWxsb3dTbGlkZVByZXYsXG5cbiAgICAgIC8vIFRvdWNoIEV2ZW50c1xuICAgICAgdG91Y2hFdmVudHM6IChmdW5jdGlvbiB0b3VjaEV2ZW50cygpIHtcbiAgICAgICAgdmFyIHRvdWNoID0gWyd0b3VjaHN0YXJ0JywgJ3RvdWNobW92ZScsICd0b3VjaGVuZCddO1xuICAgICAgICB2YXIgZGVza3RvcCA9IFsnbW91c2Vkb3duJywgJ21vdXNlbW92ZScsICdtb3VzZXVwJ107XG4gICAgICAgIGlmICh3aW4ubmF2aWdhdG9yLnBvaW50ZXJFbmFibGVkKSB7XG4gICAgICAgICAgZGVza3RvcCA9IFsncG9pbnRlcmRvd24nLCAncG9pbnRlcm1vdmUnLCAncG9pbnRlcnVwJ107XG4gICAgICAgIH0gZWxzZSBpZiAod2luLm5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkKSB7XG4gICAgICAgICAgZGVza3RvcCA9IFsnTVNQb2ludGVyRG93bicsICdNc1BvaW50ZXJNb3ZlJywgJ01zUG9pbnRlclVwJ107XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHN0YXJ0OiBTdXBwb3J0LnRvdWNoIHx8ICFzd2lwZXIucGFyYW1zLnNpbXVsYXRlVG91Y2ggPyB0b3VjaFswXSA6IGRlc2t0b3BbMF0sXG4gICAgICAgICAgbW92ZTogU3VwcG9ydC50b3VjaCB8fCAhc3dpcGVyLnBhcmFtcy5zaW11bGF0ZVRvdWNoID8gdG91Y2hbMV0gOiBkZXNrdG9wWzFdLFxuICAgICAgICAgIGVuZDogU3VwcG9ydC50b3VjaCB8fCAhc3dpcGVyLnBhcmFtcy5zaW11bGF0ZVRvdWNoID8gdG91Y2hbMl0gOiBkZXNrdG9wWzJdLFxuICAgICAgICB9O1xuICAgICAgfSgpKSxcbiAgICAgIHRvdWNoRXZlbnRzRGF0YToge1xuICAgICAgICBpc1RvdWNoZWQ6IHVuZGVmaW5lZCxcbiAgICAgICAgaXNNb3ZlZDogdW5kZWZpbmVkLFxuICAgICAgICBhbGxvd1RvdWNoQ2FsbGJhY2tzOiB1bmRlZmluZWQsXG4gICAgICAgIHRvdWNoU3RhcnRUaW1lOiB1bmRlZmluZWQsXG4gICAgICAgIGlzU2Nyb2xsaW5nOiB1bmRlZmluZWQsXG4gICAgICAgIGN1cnJlbnRUcmFuc2xhdGU6IHVuZGVmaW5lZCxcbiAgICAgICAgc3RhcnRUcmFuc2xhdGU6IHVuZGVmaW5lZCxcbiAgICAgICAgYWxsb3dUaHJlc2hvbGRNb3ZlOiB1bmRlZmluZWQsXG4gICAgICAgIC8vIEZvcm0gZWxlbWVudHMgdG8gbWF0Y2hcbiAgICAgICAgZm9ybUVsZW1lbnRzOiAnaW5wdXQsIHNlbGVjdCwgb3B0aW9uLCB0ZXh0YXJlYSwgYnV0dG9uLCB2aWRlbycsXG4gICAgICAgIC8vIExhc3QgY2xpY2sgdGltZVxuICAgICAgICBsYXN0Q2xpY2tUaW1lOiBVdGlscy5ub3coKSxcbiAgICAgICAgY2xpY2tUaW1lb3V0OiB1bmRlZmluZWQsXG4gICAgICAgIC8vIFZlbG9jaXRpZXNcbiAgICAgICAgdmVsb2NpdGllczogW10sXG4gICAgICAgIGFsbG93TW9tZW50dW1Cb3VuY2U6IHVuZGVmaW5lZCxcbiAgICAgICAgaXNUb3VjaEV2ZW50OiB1bmRlZmluZWQsXG4gICAgICAgIHN0YXJ0TW92aW5nOiB1bmRlZmluZWQsXG4gICAgICB9LFxuXG4gICAgICAvLyBDbGlja3NcbiAgICAgIGFsbG93Q2xpY2s6IHRydWUsXG5cbiAgICAgIC8vIFRvdWNoZXNcbiAgICAgIGFsbG93VG91Y2hNb3ZlOiBzd2lwZXIucGFyYW1zLmFsbG93VG91Y2hNb3ZlLFxuXG4gICAgICB0b3VjaGVzOiB7XG4gICAgICAgIHN0YXJ0WDogMCxcbiAgICAgICAgc3RhcnRZOiAwLFxuICAgICAgICBjdXJyZW50WDogMCxcbiAgICAgICAgY3VycmVudFk6IDAsXG4gICAgICAgIGRpZmY6IDAsXG4gICAgICB9LFxuXG4gICAgICAvLyBJbWFnZXNcbiAgICAgIGltYWdlc1RvTG9hZDogW10sXG4gICAgICBpbWFnZXNMb2FkZWQ6IDAsXG5cbiAgICB9KTtcblxuICAgIC8vIEluc3RhbGwgTW9kdWxlc1xuICAgIHN3aXBlci51c2VNb2R1bGVzKCk7XG5cbiAgICAvLyBJbml0XG4gICAgaWYgKHN3aXBlci5wYXJhbXMuaW5pdCkge1xuICAgICAgc3dpcGVyLmluaXQoKTtcbiAgICB9XG5cbiAgICAvLyBSZXR1cm4gYXBwIGluc3RhbmNlXG4gICAgcmV0dXJuIHN3aXBlcjtcbiAgfVxuXG4gIGlmICggU3dpcGVyQ2xhc3MkJDEgKSBTd2lwZXIuX19wcm90b19fID0gU3dpcGVyQ2xhc3MkJDE7XG4gIFN3aXBlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBTd2lwZXJDbGFzcyQkMSAmJiBTd2lwZXJDbGFzcyQkMS5wcm90b3R5cGUgKTtcbiAgU3dpcGVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFN3aXBlcjtcblxuICB2YXIgc3RhdGljQWNjZXNzb3JzID0geyBleHRlbmRlZERlZmF1bHRzOiB7fSxkZWZhdWx0czoge30sQ2xhc3M6IHt9LCQ6IHt9IH07XG4gIFN3aXBlci5wcm90b3R5cGUuc2xpZGVzUGVyVmlld0R5bmFtaWMgPSBmdW5jdGlvbiBzbGlkZXNQZXJWaWV3RHluYW1pYyAoKSB7XG4gICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgdmFyIHBhcmFtcyA9IHN3aXBlci5wYXJhbXM7XG4gICAgdmFyIHNsaWRlcyA9IHN3aXBlci5zbGlkZXM7XG4gICAgdmFyIHNsaWRlc0dyaWQgPSBzd2lwZXIuc2xpZGVzR3JpZDtcbiAgICB2YXIgc3dpcGVyU2l6ZSA9IHN3aXBlci5zaXplO1xuICAgIHZhciBhY3RpdmVJbmRleCA9IHN3aXBlci5hY3RpdmVJbmRleDtcbiAgICB2YXIgc3B2ID0gMTtcbiAgICBpZiAocGFyYW1zLmNlbnRlcmVkU2xpZGVzKSB7XG4gICAgICB2YXIgc2xpZGVTaXplID0gc2xpZGVzW2FjdGl2ZUluZGV4XS5zd2lwZXJTbGlkZVNpemU7XG4gICAgICB2YXIgYnJlYWtMb29wO1xuICAgICAgZm9yICh2YXIgaSA9IGFjdGl2ZUluZGV4ICsgMTsgaSA8IHNsaWRlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBpZiAoc2xpZGVzW2ldICYmICFicmVha0xvb3ApIHtcbiAgICAgICAgICBzbGlkZVNpemUgKz0gc2xpZGVzW2ldLnN3aXBlclNsaWRlU2l6ZTtcbiAgICAgICAgICBzcHYgKz0gMTtcbiAgICAgICAgICBpZiAoc2xpZGVTaXplID4gc3dpcGVyU2l6ZSkgeyBicmVha0xvb3AgPSB0cnVlOyB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGZvciAodmFyIGkkMSA9IGFjdGl2ZUluZGV4IC0gMTsgaSQxID49IDA7IGkkMSAtPSAxKSB7XG4gICAgICAgIGlmIChzbGlkZXNbaSQxXSAmJiAhYnJlYWtMb29wKSB7XG4gICAgICAgICAgc2xpZGVTaXplICs9IHNsaWRlc1tpJDFdLnN3aXBlclNsaWRlU2l6ZTtcbiAgICAgICAgICBzcHYgKz0gMTtcbiAgICAgICAgICBpZiAoc2xpZGVTaXplID4gc3dpcGVyU2l6ZSkgeyBicmVha0xvb3AgPSB0cnVlOyB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yICh2YXIgaSQyID0gYWN0aXZlSW5kZXggKyAxOyBpJDIgPCBzbGlkZXMubGVuZ3RoOyBpJDIgKz0gMSkge1xuICAgICAgICBpZiAoc2xpZGVzR3JpZFtpJDJdIC0gc2xpZGVzR3JpZFthY3RpdmVJbmRleF0gPCBzd2lwZXJTaXplKSB7XG4gICAgICAgICAgc3B2ICs9IDE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHNwdjtcbiAgfTtcbiAgU3dpcGVyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiB1cGRhdGUkJDEgKCkge1xuICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgIGlmICghc3dpcGVyIHx8IHN3aXBlci5kZXN0cm95ZWQpIHsgcmV0dXJuOyB9XG4gICAgc3dpcGVyLnVwZGF0ZVNpemUoKTtcbiAgICBzd2lwZXIudXBkYXRlU2xpZGVzKCk7XG4gICAgc3dpcGVyLnVwZGF0ZVByb2dyZXNzKCk7XG4gICAgc3dpcGVyLnVwZGF0ZVNsaWRlc0NsYXNzZXMoKTtcblxuICAgIHZhciBuZXdUcmFuc2xhdGU7XG4gICAgZnVuY3Rpb24gc2V0VHJhbnNsYXRlKCkge1xuICAgICAgbmV3VHJhbnNsYXRlID0gTWF0aC5taW4oTWF0aC5tYXgoc3dpcGVyLnRyYW5zbGF0ZSwgc3dpcGVyLm1heFRyYW5zbGF0ZSgpKSwgc3dpcGVyLm1pblRyYW5zbGF0ZSgpKTtcbiAgICAgIHN3aXBlci5zZXRUcmFuc2xhdGUobmV3VHJhbnNsYXRlKTtcbiAgICAgIHN3aXBlci51cGRhdGVBY3RpdmVJbmRleCgpO1xuICAgICAgc3dpcGVyLnVwZGF0ZVNsaWRlc0NsYXNzZXMoKTtcbiAgICB9XG4gICAgdmFyIHRyYW5zbGF0ZWQ7XG4gICAgaWYgKHN3aXBlci5wYXJhbXMuZnJlZU1vZGUpIHtcbiAgICAgIHNldFRyYW5zbGF0ZSgpO1xuICAgICAgaWYgKHN3aXBlci5wYXJhbXMuYXV0b0hlaWdodCkge1xuICAgICAgICBzd2lwZXIudXBkYXRlQXV0b0hlaWdodCgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoKHN3aXBlci5wYXJhbXMuc2xpZGVzUGVyVmlldyA9PT0gJ2F1dG8nIHx8IHN3aXBlci5wYXJhbXMuc2xpZGVzUGVyVmlldyA+IDEpICYmIHN3aXBlci5pc0VuZCAmJiAhc3dpcGVyLnBhcmFtcy5jZW50ZXJlZFNsaWRlcykge1xuICAgICAgICB0cmFuc2xhdGVkID0gc3dpcGVyLnNsaWRlVG8oc3dpcGVyLnNsaWRlcy5sZW5ndGggLSAxLCAwLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0cmFuc2xhdGVkID0gc3dpcGVyLnNsaWRlVG8oc3dpcGVyLmFjdGl2ZUluZGV4LCAwLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICB9XG4gICAgICBpZiAoIXRyYW5zbGF0ZWQpIHtcbiAgICAgICAgc2V0VHJhbnNsYXRlKCk7XG4gICAgICB9XG4gICAgfVxuICAgIHN3aXBlci5lbWl0KCd1cGRhdGUnKTtcbiAgfTtcbiAgU3dpcGVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gaW5pdCAoKSB7XG4gICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgaWYgKHN3aXBlci5pbml0aWFsaXplZCkgeyByZXR1cm47IH1cblxuICAgIHN3aXBlci5lbWl0KCdiZWZvcmVJbml0Jyk7XG5cbiAgICAvLyBTZXQgYnJlYWtwb2ludFxuICAgIGlmIChzd2lwZXIucGFyYW1zLmJyZWFrcG9pbnRzKSB7XG4gICAgICBzd2lwZXIuc2V0QnJlYWtwb2ludCgpO1xuICAgIH1cblxuICAgIC8vIEFkZCBDbGFzc2VzXG4gICAgc3dpcGVyLmFkZENsYXNzZXMoKTtcblxuICAgIC8vIENyZWF0ZSBsb29wXG4gICAgaWYgKHN3aXBlci5wYXJhbXMubG9vcCkge1xuICAgICAgc3dpcGVyLmxvb3BDcmVhdGUoKTtcbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgc2l6ZVxuICAgIHN3aXBlci51cGRhdGVTaXplKCk7XG5cbiAgICAvLyBVcGRhdGUgc2xpZGVzXG4gICAgc3dpcGVyLnVwZGF0ZVNsaWRlcygpO1xuXG4gICAgLy8gU2V0IEdyYWIgQ3Vyc29yXG4gICAgaWYgKHN3aXBlci5wYXJhbXMuZ3JhYkN1cnNvcikge1xuICAgICAgc3dpcGVyLnNldEdyYWJDdXJzb3IoKTtcbiAgICB9XG5cbiAgICBpZiAoc3dpcGVyLnBhcmFtcy5wcmVsb2FkSW1hZ2VzKSB7XG4gICAgICBzd2lwZXIucHJlbG9hZEltYWdlcygpO1xuICAgIH1cblxuICAgIC8vIFNsaWRlIFRvIEluaXRpYWwgU2xpZGVcbiAgICBpZiAoc3dpcGVyLnBhcmFtcy5sb29wKSB7XG4gICAgICBzd2lwZXIuc2xpZGVUbyhzd2lwZXIucGFyYW1zLmluaXRpYWxTbGlkZSArIHN3aXBlci5sb29wZWRTbGlkZXMsIDAsIHN3aXBlci5wYXJhbXMucnVuQ2FsbGJhY2tzT25Jbml0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3dpcGVyLnNsaWRlVG8oc3dpcGVyLnBhcmFtcy5pbml0aWFsU2xpZGUsIDAsIHN3aXBlci5wYXJhbXMucnVuQ2FsbGJhY2tzT25Jbml0KTtcbiAgICB9XG5cbiAgICAvLyBBdHRhY2ggZXZlbnRzXG4gICAgc3dpcGVyLmF0dGFjaEV2ZW50cygpO1xuXG4gICAgLy8gSW5pdCBGbGFnXG4gICAgc3dpcGVyLmluaXRpYWxpemVkID0gdHJ1ZTtcblxuICAgIC8vIEVtaXRcbiAgICBzd2lwZXIuZW1pdCgnaW5pdCcpO1xuICB9O1xuICBTd2lwZXIucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiBkZXN0cm95IChkZWxldGVJbnN0YW5jZSwgY2xlYW5TdHlsZXMpIHtcbiAgICBpZiAoIGRlbGV0ZUluc3RhbmNlID09PSB2b2lkIDAgKSBkZWxldGVJbnN0YW5jZSA9IHRydWU7XG4gICAgaWYgKCBjbGVhblN0eWxlcyA9PT0gdm9pZCAwICkgY2xlYW5TdHlsZXMgPSB0cnVlO1xuXG4gICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgdmFyIHBhcmFtcyA9IHN3aXBlci5wYXJhbXM7XG4gICAgdmFyICRlbCA9IHN3aXBlci4kZWw7XG4gICAgdmFyICR3cmFwcGVyRWwgPSBzd2lwZXIuJHdyYXBwZXJFbDtcbiAgICB2YXIgc2xpZGVzID0gc3dpcGVyLnNsaWRlcztcbiAgICBzd2lwZXIuZW1pdCgnYmVmb3JlRGVzdHJveScpO1xuXG4gICAgLy8gSW5pdCBGbGFnXG4gICAgc3dpcGVyLmluaXRpYWxpemVkID0gZmFsc2U7XG5cbiAgICAvLyBEZXRhY2ggZXZlbnRzXG4gICAgc3dpcGVyLmRldGFjaEV2ZW50cygpO1xuXG4gICAgLy8gRGVzdHJveSBsb29wXG4gICAgaWYgKHBhcmFtcy5sb29wKSB7XG4gICAgICBzd2lwZXIubG9vcERlc3Ryb3koKTtcbiAgICB9XG5cbiAgICAvLyBDbGVhbnVwIHN0eWxlc1xuICAgIGlmIChjbGVhblN0eWxlcykge1xuICAgICAgc3dpcGVyLnJlbW92ZUNsYXNzZXMoKTtcbiAgICAgICRlbC5yZW1vdmVBdHRyKCdzdHlsZScpO1xuICAgICAgJHdyYXBwZXJFbC5yZW1vdmVBdHRyKCdzdHlsZScpO1xuICAgICAgaWYgKHNsaWRlcyAmJiBzbGlkZXMubGVuZ3RoKSB7XG4gICAgICAgIHNsaWRlc1xuICAgICAgICAgIC5yZW1vdmVDbGFzcyhbXG4gICAgICAgICAgICBwYXJhbXMuc2xpZGVWaXNpYmxlQ2xhc3MsXG4gICAgICAgICAgICBwYXJhbXMuc2xpZGVBY3RpdmVDbGFzcyxcbiAgICAgICAgICAgIHBhcmFtcy5zbGlkZU5leHRDbGFzcyxcbiAgICAgICAgICAgIHBhcmFtcy5zbGlkZVByZXZDbGFzcyBdLmpvaW4oJyAnKSlcbiAgICAgICAgICAucmVtb3ZlQXR0cignc3R5bGUnKVxuICAgICAgICAgIC5yZW1vdmVBdHRyKCdkYXRhLXN3aXBlci1zbGlkZS1pbmRleCcpXG4gICAgICAgICAgLnJlbW92ZUF0dHIoJ2RhdGEtc3dpcGVyLWNvbHVtbicpXG4gICAgICAgICAgLnJlbW92ZUF0dHIoJ2RhdGEtc3dpcGVyLXJvdycpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN3aXBlci5lbWl0KCdkZXN0cm95Jyk7XG5cbiAgICAvLyBEZXRhY2ggZW1pdHRlciBldmVudHNcbiAgICBPYmplY3Qua2V5cyhzd2lwZXIuZXZlbnRzTGlzdGVuZXJzKS5mb3JFYWNoKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICAgIHN3aXBlci5vZmYoZXZlbnROYW1lKTtcbiAgICB9KTtcblxuICAgIGlmIChkZWxldGVJbnN0YW5jZSAhPT0gZmFsc2UpIHtcbiAgICAgIHN3aXBlci4kZWxbMF0uc3dpcGVyID0gbnVsbDtcbiAgICAgIHN3aXBlci4kZWwuZGF0YSgnc3dpcGVyJywgbnVsbCk7XG4gICAgICBVdGlscy5kZWxldGVQcm9wcyhzd2lwZXIpO1xuICAgIH1cbiAgICBzd2lwZXIuZGVzdHJveWVkID0gdHJ1ZTtcbiAgfTtcbiAgU3dpcGVyLmV4dGVuZERlZmF1bHRzID0gZnVuY3Rpb24gZXh0ZW5kRGVmYXVsdHMgKG5ld0RlZmF1bHRzKSB7XG4gICAgVXRpbHMuZXh0ZW5kKGV4dGVuZGVkRGVmYXVsdHMsIG5ld0RlZmF1bHRzKTtcbiAgfTtcbiAgc3RhdGljQWNjZXNzb3JzLmV4dGVuZGVkRGVmYXVsdHMuZ2V0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBleHRlbmRlZERlZmF1bHRzO1xuICB9O1xuICBzdGF0aWNBY2Nlc3NvcnMuZGVmYXVsdHMuZ2V0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBkZWZhdWx0cztcbiAgfTtcbiAgc3RhdGljQWNjZXNzb3JzLkNsYXNzLmdldCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gU3dpcGVyQ2xhc3MkJDE7XG4gIH07XG4gIHN0YXRpY0FjY2Vzc29ycy4kLmdldCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJCQxO1xuICB9O1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKCBTd2lwZXIsIHN0YXRpY0FjY2Vzc29ycyApO1xuXG4gIHJldHVybiBTd2lwZXI7XG59KFN3aXBlckNsYXNzKSk7XG5cbnZhciBEZXZpY2UkMiA9IHtcbiAgbmFtZTogJ2RldmljZScsXG4gIHByb3RvOiB7XG4gICAgZGV2aWNlOiBEZXZpY2UsXG4gIH0sXG4gIHN0YXRpYzoge1xuICAgIGRldmljZTogRGV2aWNlLFxuICB9LFxufTtcblxudmFyIFN1cHBvcnQkMiA9IHtcbiAgbmFtZTogJ3N1cHBvcnQnLFxuICBwcm90bzoge1xuICAgIHN1cHBvcnQ6IFN1cHBvcnQsXG4gIH0sXG4gIHN0YXRpYzoge1xuICAgIHN1cHBvcnQ6IFN1cHBvcnQsXG4gIH0sXG59O1xuXG52YXIgQnJvd3NlciQyID0ge1xuICBuYW1lOiAnYnJvd3NlcicsXG4gIHByb3RvOiB7XG4gICAgYnJvd3NlcjogQnJvd3NlcixcbiAgfSxcbiAgc3RhdGljOiB7XG4gICAgYnJvd3NlcjogQnJvd3NlcixcbiAgfSxcbn07XG5cbnZhciBSZXNpemUgPSB7XG4gIG5hbWU6ICdyZXNpemUnLFxuICBjcmVhdGU6IGZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICBVdGlscy5leHRlbmQoc3dpcGVyLCB7XG4gICAgICByZXNpemU6IHtcbiAgICAgICAgcmVzaXplSGFuZGxlcjogZnVuY3Rpb24gcmVzaXplSGFuZGxlcigpIHtcbiAgICAgICAgICBpZiAoIXN3aXBlciB8fCBzd2lwZXIuZGVzdHJveWVkIHx8ICFzd2lwZXIuaW5pdGlhbGl6ZWQpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgc3dpcGVyLmVtaXQoJ2JlZm9yZVJlc2l6ZScpO1xuICAgICAgICAgIHN3aXBlci5lbWl0KCdyZXNpemUnKTtcbiAgICAgICAgfSxcbiAgICAgICAgb3JpZW50YXRpb25DaGFuZ2VIYW5kbGVyOiBmdW5jdGlvbiBvcmllbnRhdGlvbkNoYW5nZUhhbmRsZXIoKSB7XG4gICAgICAgICAgaWYgKCFzd2lwZXIgfHwgc3dpcGVyLmRlc3Ryb3llZCB8fCAhc3dpcGVyLmluaXRpYWxpemVkKSB7IHJldHVybjsgfVxuICAgICAgICAgIHN3aXBlci5lbWl0KCdvcmllbnRhdGlvbmNoYW5nZScpO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9KTtcbiAgfSxcbiAgb246IHtcbiAgICBpbml0OiBmdW5jdGlvbiBpbml0KCkge1xuICAgICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgICAvLyBFbWl0IHJlc2l6ZVxuICAgICAgd2luLmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHN3aXBlci5yZXNpemUucmVzaXplSGFuZGxlcik7XG5cbiAgICAgIC8vIEVtaXQgb3JpZW50YXRpb25jaGFuZ2VcbiAgICAgIHdpbi5hZGRFdmVudExpc3RlbmVyKCdvcmllbnRhdGlvbmNoYW5nZScsIHN3aXBlci5yZXNpemUub3JpZW50YXRpb25DaGFuZ2VIYW5kbGVyKTtcbiAgICB9LFxuICAgIGRlc3Ryb3k6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICAgIHdpbi5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCBzd2lwZXIucmVzaXplLnJlc2l6ZUhhbmRsZXIpO1xuICAgICAgd2luLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ29yaWVudGF0aW9uY2hhbmdlJywgc3dpcGVyLnJlc2l6ZS5vcmllbnRhdGlvbkNoYW5nZUhhbmRsZXIpO1xuICAgIH0sXG4gIH0sXG59O1xuXG52YXIgT2JzZXJ2ZXIgPSB7XG4gIGZ1bmM6IHdpbi5NdXRhdGlvbk9ic2VydmVyIHx8IHdpbi5XZWJraXRNdXRhdGlvbk9ic2VydmVyLFxuICBhdHRhY2g6IGZ1bmN0aW9uIGF0dGFjaCh0YXJnZXQsIG9wdGlvbnMpIHtcbiAgICBpZiAoIG9wdGlvbnMgPT09IHZvaWQgMCApIG9wdGlvbnMgPSB7fTtcblxuICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuXG4gICAgdmFyIE9ic2VydmVyRnVuYyA9IE9ic2VydmVyLmZ1bmM7XG4gICAgdmFyIG9ic2VydmVyID0gbmV3IE9ic2VydmVyRnVuYyhmdW5jdGlvbiAobXV0YXRpb25zKSB7XG4gICAgICBtdXRhdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAobXV0YXRpb24pIHtcbiAgICAgICAgc3dpcGVyLmVtaXQoJ29ic2VydmVyVXBkYXRlJywgbXV0YXRpb24pO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBvYnNlcnZlci5vYnNlcnZlKHRhcmdldCwge1xuICAgICAgYXR0cmlidXRlczogdHlwZW9mIG9wdGlvbnMuYXR0cmlidXRlcyA9PT0gJ3VuZGVmaW5lZCcgPyB0cnVlIDogb3B0aW9ucy5hdHRyaWJ1dGVzLFxuICAgICAgY2hpbGRMaXN0OiB0eXBlb2Ygb3B0aW9ucy5jaGlsZExpc3QgPT09ICd1bmRlZmluZWQnID8gdHJ1ZSA6IG9wdGlvbnMuY2hpbGRMaXN0LFxuICAgICAgY2hhcmFjdGVyRGF0YTogdHlwZW9mIG9wdGlvbnMuY2hhcmFjdGVyRGF0YSA9PT0gJ3VuZGVmaW5lZCcgPyB0cnVlIDogb3B0aW9ucy5jaGFyYWN0ZXJEYXRhLFxuICAgIH0pO1xuXG4gICAgc3dpcGVyLm9ic2VydmVyLm9ic2VydmVycy5wdXNoKG9ic2VydmVyKTtcbiAgfSxcbiAgaW5pdDogZnVuY3Rpb24gaW5pdCgpIHtcbiAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICBpZiAoIVN1cHBvcnQub2JzZXJ2ZXIgfHwgIXN3aXBlci5wYXJhbXMub2JzZXJ2ZXIpIHsgcmV0dXJuOyB9XG4gICAgaWYgKHN3aXBlci5wYXJhbXMub2JzZXJ2ZVBhcmVudHMpIHtcbiAgICAgIHZhciBjb250YWluZXJQYXJlbnRzID0gc3dpcGVyLiRlbC5wYXJlbnRzKCk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbnRhaW5lclBhcmVudHMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgc3dpcGVyLm9ic2VydmVyLmF0dGFjaChjb250YWluZXJQYXJlbnRzW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gT2JzZXJ2ZSBjb250YWluZXJcbiAgICBzd2lwZXIub2JzZXJ2ZXIuYXR0YWNoKHN3aXBlci4kZWxbMF0sIHsgY2hpbGRMaXN0OiBmYWxzZSB9KTtcblxuICAgIC8vIE9ic2VydmUgd3JhcHBlclxuICAgIHN3aXBlci5vYnNlcnZlci5hdHRhY2goc3dpcGVyLiR3cmFwcGVyRWxbMF0sIHsgYXR0cmlidXRlczogZmFsc2UgfSk7XG4gIH0sXG4gIGRlc3Ryb3k6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgc3dpcGVyLm9ic2VydmVyLm9ic2VydmVycy5mb3JFYWNoKGZ1bmN0aW9uIChvYnNlcnZlcikge1xuICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgIH0pO1xuICAgIHN3aXBlci5vYnNlcnZlci5vYnNlcnZlcnMgPSBbXTtcbiAgfSxcbn07XG5cbnZhciBPYnNlcnZlciQxID0ge1xuICBuYW1lOiAnb2JzZXJ2ZXInLFxuICBwYXJhbXM6IHtcbiAgICBvYnNlcnZlcjogZmFsc2UsXG4gICAgb2JzZXJ2ZVBhcmVudHM6IGZhbHNlLFxuICB9LFxuICBjcmVhdGU6IGZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICBVdGlscy5leHRlbmQoc3dpcGVyLCB7XG4gICAgICBvYnNlcnZlcjoge1xuICAgICAgICBpbml0OiBPYnNlcnZlci5pbml0LmJpbmQoc3dpcGVyKSxcbiAgICAgICAgYXR0YWNoOiBPYnNlcnZlci5hdHRhY2guYmluZChzd2lwZXIpLFxuICAgICAgICBkZXN0cm95OiBPYnNlcnZlci5kZXN0cm95LmJpbmQoc3dpcGVyKSxcbiAgICAgICAgb2JzZXJ2ZXJzOiBbXSxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH0sXG4gIG9uOiB7XG4gICAgaW5pdDogZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgICAgc3dpcGVyLm9ic2VydmVyLmluaXQoKTtcbiAgICB9LFxuICAgIGRlc3Ryb3k6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICAgIHN3aXBlci5vYnNlcnZlci5kZXN0cm95KCk7XG4gICAgfSxcbiAgfSxcbn07XG5cbnZhciBWaXJ0dWFsID0ge1xuICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZShmb3JjZSkge1xuICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgIHZhciByZWYgPSBzd2lwZXIucGFyYW1zO1xuICAgIHZhciBzbGlkZXNQZXJWaWV3ID0gcmVmLnNsaWRlc1BlclZpZXc7XG4gICAgdmFyIHNsaWRlc1Blckdyb3VwID0gcmVmLnNsaWRlc1Blckdyb3VwO1xuICAgIHZhciBjZW50ZXJlZFNsaWRlcyA9IHJlZi5jZW50ZXJlZFNsaWRlcztcbiAgICB2YXIgcmVmJDEgPSBzd2lwZXIudmlydHVhbDtcbiAgICB2YXIgcHJldmlvdXNGcm9tID0gcmVmJDEuZnJvbTtcbiAgICB2YXIgcHJldmlvdXNUbyA9IHJlZiQxLnRvO1xuICAgIHZhciBzbGlkZXMgPSByZWYkMS5zbGlkZXM7XG4gICAgdmFyIHByZXZpb3VzU2xpZGVzR3JpZCA9IHJlZiQxLnNsaWRlc0dyaWQ7XG4gICAgdmFyIHJlbmRlclNsaWRlID0gcmVmJDEucmVuZGVyU2xpZGU7XG4gICAgdmFyIHByZXZpb3VzT2Zmc2V0ID0gcmVmJDEub2Zmc2V0O1xuICAgIHN3aXBlci51cGRhdGVBY3RpdmVJbmRleCgpO1xuICAgIHZhciBhY3RpdmVJbmRleCA9IHN3aXBlci5hY3RpdmVJbmRleCB8fCAwO1xuXG4gICAgdmFyIG9mZnNldFByb3A7XG4gICAgaWYgKHN3aXBlci5ydGwgJiYgc3dpcGVyLmlzSG9yaXpvbnRhbCgpKSB7IG9mZnNldFByb3AgPSAncmlnaHQnOyB9XG4gICAgZWxzZSB7IG9mZnNldFByb3AgPSBzd2lwZXIuaXNIb3Jpem9udGFsKCkgPyAnbGVmdCcgOiAndG9wJzsgfVxuXG4gICAgdmFyIHNsaWRlc0FmdGVyO1xuICAgIHZhciBzbGlkZXNCZWZvcmU7XG4gICAgaWYgKGNlbnRlcmVkU2xpZGVzKSB7XG4gICAgICBzbGlkZXNBZnRlciA9IE1hdGguZmxvb3Ioc2xpZGVzUGVyVmlldyAvIDIpICsgc2xpZGVzUGVyR3JvdXA7XG4gICAgICBzbGlkZXNCZWZvcmUgPSBNYXRoLmZsb29yKHNsaWRlc1BlclZpZXcgLyAyKSArIHNsaWRlc1Blckdyb3VwO1xuICAgIH0gZWxzZSB7XG4gICAgICBzbGlkZXNBZnRlciA9IHNsaWRlc1BlclZpZXcgKyAoc2xpZGVzUGVyR3JvdXAgLSAxKTtcbiAgICAgIHNsaWRlc0JlZm9yZSA9IHNsaWRlc1Blckdyb3VwO1xuICAgIH1cbiAgICB2YXIgZnJvbSA9IE1hdGgubWF4KChhY3RpdmVJbmRleCB8fCAwKSAtIHNsaWRlc0JlZm9yZSwgMCk7XG4gICAgdmFyIHRvID0gTWF0aC5taW4oKGFjdGl2ZUluZGV4IHx8IDApICsgc2xpZGVzQWZ0ZXIsIHNsaWRlcy5sZW5ndGggLSAxKTtcbiAgICB2YXIgb2Zmc2V0ID0gKHN3aXBlci5zbGlkZXNHcmlkW2Zyb21dIHx8IDApIC0gKHN3aXBlci5zbGlkZXNHcmlkWzBdIHx8IDApO1xuXG4gICAgVXRpbHMuZXh0ZW5kKHN3aXBlci52aXJ0dWFsLCB7XG4gICAgICBmcm9tOiBmcm9tLFxuICAgICAgdG86IHRvLFxuICAgICAgb2Zmc2V0OiBvZmZzZXQsXG4gICAgICBzbGlkZXNHcmlkOiBzd2lwZXIuc2xpZGVzR3JpZCxcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIG9uUmVuZGVyZWQoKSB7XG4gICAgICBzd2lwZXIudXBkYXRlU2xpZGVzKCk7XG4gICAgICBzd2lwZXIudXBkYXRlUHJvZ3Jlc3MoKTtcbiAgICAgIHN3aXBlci51cGRhdGVTbGlkZXNDbGFzc2VzKCk7XG4gICAgICBpZiAoc3dpcGVyLmxhenkgJiYgc3dpcGVyLnBhcmFtcy5sYXp5LmVuYWJsZWQpIHtcbiAgICAgICAgc3dpcGVyLmxhenkubG9hZCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwcmV2aW91c0Zyb20gPT09IGZyb20gJiYgcHJldmlvdXNUbyA9PT0gdG8gJiYgIWZvcmNlKSB7XG4gICAgICBpZiAoc3dpcGVyLnNsaWRlc0dyaWQgIT09IHByZXZpb3VzU2xpZGVzR3JpZCAmJiBvZmZzZXQgIT09IHByZXZpb3VzT2Zmc2V0KSB7XG4gICAgICAgIHN3aXBlci5zbGlkZXMuY3NzKG9mZnNldFByb3AsIChvZmZzZXQgKyBcInB4XCIpKTtcbiAgICAgIH1cbiAgICAgIHN3aXBlci51cGRhdGVQcm9ncmVzcygpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoc3dpcGVyLnBhcmFtcy52aXJ0dWFsLnJlbmRlckV4dGVybmFsKSB7XG4gICAgICBzd2lwZXIucGFyYW1zLnZpcnR1YWwucmVuZGVyRXh0ZXJuYWwuY2FsbChzd2lwZXIsIHtcbiAgICAgICAgb2Zmc2V0OiBvZmZzZXQsXG4gICAgICAgIGZyb206IGZyb20sXG4gICAgICAgIHRvOiB0byxcbiAgICAgICAgc2xpZGVzOiAoZnVuY3Rpb24gZ2V0U2xpZGVzKCkge1xuICAgICAgICAgIHZhciBzbGlkZXNUb1JlbmRlciA9IFtdO1xuICAgICAgICAgIGZvciAodmFyIGkgPSBmcm9tOyBpIDw9IHRvOyBpICs9IDEpIHtcbiAgICAgICAgICAgIHNsaWRlc1RvUmVuZGVyLnB1c2goc2xpZGVzW2ldKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHNsaWRlc1RvUmVuZGVyO1xuICAgICAgICB9KCkpLFxuICAgICAgfSk7XG4gICAgICBvblJlbmRlcmVkKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBwcmVwZW5kSW5kZXhlcyA9IFtdO1xuICAgIHZhciBhcHBlbmRJbmRleGVzID0gW107XG4gICAgaWYgKGZvcmNlKSB7XG4gICAgICBzd2lwZXIuJHdyYXBwZXJFbC5maW5kKChcIi5cIiArIChzd2lwZXIucGFyYW1zLnNsaWRlQ2xhc3MpKSkucmVtb3ZlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAodmFyIGkgPSBwcmV2aW91c0Zyb207IGkgPD0gcHJldmlvdXNUbzsgaSArPSAxKSB7XG4gICAgICAgIGlmIChpIDwgZnJvbSB8fCBpID4gdG8pIHtcbiAgICAgICAgICBzd2lwZXIuJHdyYXBwZXJFbC5maW5kKChcIi5cIiArIChzd2lwZXIucGFyYW1zLnNsaWRlQ2xhc3MpICsgXCJbZGF0YS1zd2lwZXItc2xpZGUtaW5kZXg9XFxcIlwiICsgaSArIFwiXFxcIl1cIikpLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAodmFyIGkkMSA9IDA7IGkkMSA8IHNsaWRlcy5sZW5ndGg7IGkkMSArPSAxKSB7XG4gICAgICBpZiAoaSQxID49IGZyb20gJiYgaSQxIDw9IHRvKSB7XG4gICAgICAgIGlmICh0eXBlb2YgcHJldmlvdXNUbyA9PT0gJ3VuZGVmaW5lZCcgfHwgZm9yY2UpIHtcbiAgICAgICAgICBhcHBlbmRJbmRleGVzLnB1c2goaSQxKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoaSQxID4gcHJldmlvdXNUbykgeyBhcHBlbmRJbmRleGVzLnB1c2goaSQxKTsgfVxuICAgICAgICAgIGlmIChpJDEgPCBwcmV2aW91c0Zyb20pIHsgcHJlcGVuZEluZGV4ZXMucHVzaChpJDEpOyB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgYXBwZW5kSW5kZXhlcy5mb3JFYWNoKGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgc3dpcGVyLiR3cmFwcGVyRWwuYXBwZW5kKHJlbmRlclNsaWRlKHNsaWRlc1tpbmRleF0sIGluZGV4KSk7XG4gICAgfSk7XG4gICAgcHJlcGVuZEluZGV4ZXMuc29ydChmdW5jdGlvbiAoYSwgYikgeyByZXR1cm4gYSA8IGI7IH0pLmZvckVhY2goZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICBzd2lwZXIuJHdyYXBwZXJFbC5wcmVwZW5kKHJlbmRlclNsaWRlKHNsaWRlc1tpbmRleF0sIGluZGV4KSk7XG4gICAgfSk7XG4gICAgc3dpcGVyLiR3cmFwcGVyRWwuY2hpbGRyZW4oJy5zd2lwZXItc2xpZGUnKS5jc3Mob2Zmc2V0UHJvcCwgKG9mZnNldCArIFwicHhcIikpO1xuICAgIG9uUmVuZGVyZWQoKTtcbiAgfSxcbiAgcmVuZGVyU2xpZGU6IGZ1bmN0aW9uIHJlbmRlclNsaWRlKHNsaWRlLCBpbmRleCkge1xuICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgIHZhciBwYXJhbXMgPSBzd2lwZXIucGFyYW1zLnZpcnR1YWw7XG4gICAgaWYgKHBhcmFtcy5jYWNoZSAmJiBzd2lwZXIudmlydHVhbC5jYWNoZVtpbmRleF0pIHtcbiAgICAgIHJldHVybiBzd2lwZXIudmlydHVhbC5jYWNoZVtpbmRleF07XG4gICAgfVxuICAgIHZhciAkc2xpZGVFbCA9IHBhcmFtcy5yZW5kZXJTbGlkZVxuICAgICAgPyAkJDEocGFyYW1zLnJlbmRlclNsaWRlLmNhbGwoc3dpcGVyLCBzbGlkZSwgaW5kZXgpKVxuICAgICAgOiAkJDEoKFwiPGRpdiBjbGFzcz1cXFwiXCIgKyAoc3dpcGVyLnBhcmFtcy5zbGlkZUNsYXNzKSArIFwiXFxcIiBkYXRhLXN3aXBlci1zbGlkZS1pbmRleD1cXFwiXCIgKyBpbmRleCArIFwiXFxcIj5cIiArIHNsaWRlICsgXCI8L2Rpdj5cIikpO1xuICAgIGlmICghJHNsaWRlRWwuYXR0cignZGF0YS1zd2lwZXItc2xpZGUtaW5kZXgnKSkgeyAkc2xpZGVFbC5hdHRyKCdkYXRhLXN3aXBlci1zbGlkZS1pbmRleCcsIGluZGV4KTsgfVxuICAgIGlmIChwYXJhbXMuY2FjaGUpIHsgc3dpcGVyLnZpcnR1YWwuY2FjaGVbaW5kZXhdID0gJHNsaWRlRWw7IH1cbiAgICByZXR1cm4gJHNsaWRlRWw7XG4gIH0sXG4gIGFwcGVuZFNsaWRlOiBmdW5jdGlvbiBhcHBlbmRTbGlkZShzbGlkZSkge1xuICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgIHN3aXBlci52aXJ0dWFsLnNsaWRlcy5wdXNoKHNsaWRlKTtcbiAgICBzd2lwZXIudmlydHVhbC51cGRhdGUodHJ1ZSk7XG4gIH0sXG4gIHByZXBlbmRTbGlkZTogZnVuY3Rpb24gcHJlcGVuZFNsaWRlKHNsaWRlKSB7XG4gICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgc3dpcGVyLnZpcnR1YWwuc2xpZGVzLnVuc2hpZnQoc2xpZGUpO1xuICAgIGlmIChzd2lwZXIucGFyYW1zLnZpcnR1YWwuY2FjaGUpIHtcbiAgICAgIHZhciBjYWNoZSA9IHN3aXBlci52aXJ0dWFsLmNhY2hlO1xuICAgICAgdmFyIG5ld0NhY2hlID0ge307XG4gICAgICBPYmplY3Qua2V5cyhjYWNoZSkuZm9yRWFjaChmdW5jdGlvbiAoY2FjaGVkSW5kZXgpIHtcbiAgICAgICAgbmV3Q2FjaGVbY2FjaGVkSW5kZXggKyAxXSA9IGNhY2hlW2NhY2hlZEluZGV4XTtcbiAgICAgIH0pO1xuICAgICAgc3dpcGVyLnZpcnR1YWwuY2FjaGUgPSBuZXdDYWNoZTtcbiAgICB9XG4gICAgc3dpcGVyLnZpcnR1YWwudXBkYXRlKHRydWUpO1xuICAgIHN3aXBlci5zbGlkZU5leHQoMCk7XG4gIH0sXG59O1xuXG52YXIgVmlydHVhbCQxID0ge1xuICBuYW1lOiAndmlydHVhbCcsXG4gIHBhcmFtczoge1xuICAgIHZpcnR1YWw6IHtcbiAgICAgIGVuYWJsZWQ6IGZhbHNlLFxuICAgICAgc2xpZGVzOiBbXSxcbiAgICAgIGNhY2hlOiB0cnVlLFxuICAgICAgcmVuZGVyU2xpZGU6IG51bGwsXG4gICAgICByZW5kZXJFeHRlcm5hbDogbnVsbCxcbiAgICB9LFxuICB9LFxuICBjcmVhdGU6IGZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICBVdGlscy5leHRlbmQoc3dpcGVyLCB7XG4gICAgICB2aXJ0dWFsOiB7XG4gICAgICAgIHVwZGF0ZTogVmlydHVhbC51cGRhdGUuYmluZChzd2lwZXIpLFxuICAgICAgICBhcHBlbmRTbGlkZTogVmlydHVhbC5hcHBlbmRTbGlkZS5iaW5kKHN3aXBlciksXG4gICAgICAgIHByZXBlbmRTbGlkZTogVmlydHVhbC5wcmVwZW5kU2xpZGUuYmluZChzd2lwZXIpLFxuICAgICAgICByZW5kZXJTbGlkZTogVmlydHVhbC5yZW5kZXJTbGlkZS5iaW5kKHN3aXBlciksXG4gICAgICAgIHNsaWRlczogc3dpcGVyLnBhcmFtcy52aXJ0dWFsLnNsaWRlcyxcbiAgICAgICAgY2FjaGU6IHt9LFxuICAgICAgfSxcbiAgICB9KTtcbiAgfSxcbiAgb246IHtcbiAgICBiZWZvcmVJbml0OiBmdW5jdGlvbiBiZWZvcmVJbml0KCkge1xuICAgICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgICBpZiAoIXN3aXBlci5wYXJhbXMudmlydHVhbC5lbmFibGVkKSB7IHJldHVybjsgfVxuICAgICAgc3dpcGVyLmNsYXNzTmFtZXMucHVzaCgoKHN3aXBlci5wYXJhbXMuY29udGFpbmVyTW9kaWZpZXJDbGFzcykgKyBcInZpcnR1YWxcIikpO1xuICAgICAgdmFyIG92ZXJ3cml0ZVBhcmFtcyA9IHtcbiAgICAgICAgd2F0Y2hTbGlkZXNQcm9ncmVzczogdHJ1ZSxcbiAgICAgIH07XG4gICAgICBVdGlscy5leHRlbmQoc3dpcGVyLnBhcmFtcywgb3ZlcndyaXRlUGFyYW1zKTtcbiAgICAgIFV0aWxzLmV4dGVuZChzd2lwZXIub3JpZ2luYWxQYXJhbXMsIG92ZXJ3cml0ZVBhcmFtcyk7XG5cbiAgICAgIHN3aXBlci52aXJ0dWFsLnVwZGF0ZSgpO1xuICAgIH0sXG4gICAgc2V0VHJhbnNsYXRlOiBmdW5jdGlvbiBzZXRUcmFuc2xhdGUoKSB7XG4gICAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICAgIGlmICghc3dpcGVyLnBhcmFtcy52aXJ0dWFsLmVuYWJsZWQpIHsgcmV0dXJuOyB9XG4gICAgICBzd2lwZXIudmlydHVhbC51cGRhdGUoKTtcbiAgICB9LFxuICB9LFxufTtcblxudmFyIEtleWJvYXJkID0ge1xuICBoYW5kbGU6IGZ1bmN0aW9uIGhhbmRsZShldmVudCkge1xuICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgIHZhciBlID0gZXZlbnQ7XG4gICAgaWYgKGUub3JpZ2luYWxFdmVudCkgeyBlID0gZS5vcmlnaW5hbEV2ZW50OyB9IC8vIGpxdWVyeSBmaXhcbiAgICB2YXIga2MgPSBlLmtleUNvZGUgfHwgZS5jaGFyQ29kZTtcbiAgICAvLyBEaXJlY3Rpb25zIGxvY2tzXG4gICAgaWYgKCFzd2lwZXIuYWxsb3dTbGlkZU5leHQgJiYgKChzd2lwZXIuaXNIb3Jpem9udGFsKCkgJiYga2MgPT09IDM5KSB8fCAoc3dpcGVyLmlzVmVydGljYWwoKSAmJiBrYyA9PT0gNDApKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoIXN3aXBlci5hbGxvd1NsaWRlUHJldiAmJiAoKHN3aXBlci5pc0hvcml6b250YWwoKSAmJiBrYyA9PT0gMzcpIHx8IChzd2lwZXIuaXNWZXJ0aWNhbCgpICYmIGtjID09PSAzOCkpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmIChlLnNoaWZ0S2V5IHx8IGUuYWx0S2V5IHx8IGUuY3RybEtleSB8fCBlLm1ldGFLZXkpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGlmIChkb2MuYWN0aXZlRWxlbWVudCAmJiBkb2MuYWN0aXZlRWxlbWVudC5ub2RlTmFtZSAmJiAoZG9jLmFjdGl2ZUVsZW1lbnQubm9kZU5hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ2lucHV0JyB8fCBkb2MuYWN0aXZlRWxlbWVudC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpID09PSAndGV4dGFyZWEnKSkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaWYgKGtjID09PSAzNyB8fCBrYyA9PT0gMzkgfHwga2MgPT09IDM4IHx8IGtjID09PSA0MCkge1xuICAgICAgdmFyIGluVmlldyA9IGZhbHNlO1xuICAgICAgLy8gQ2hlY2sgdGhhdCBzd2lwZXIgc2hvdWxkIGJlIGluc2lkZSBvZiB2aXNpYmxlIGFyZWEgb2Ygd2luZG93XG4gICAgICBpZiAoc3dpcGVyLiRlbC5wYXJlbnRzKChcIi5cIiArIChzd2lwZXIucGFyYW1zLnNsaWRlQ2xhc3MpKSkubGVuZ3RoID4gMCAmJiBzd2lwZXIuJGVsLnBhcmVudHMoKFwiLlwiICsgKHN3aXBlci5wYXJhbXMuc2xpZGVBY3RpdmVDbGFzcykpKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIHZhciB3aW5kb3dTY3JvbGwgPSB7XG4gICAgICAgIGxlZnQ6IHdpbi5wYWdlWE9mZnNldCxcbiAgICAgICAgdG9wOiB3aW4ucGFnZVlPZmZzZXQsXG4gICAgICB9O1xuICAgICAgdmFyIHdpbmRvd1dpZHRoID0gd2luLmlubmVyV2lkdGg7XG4gICAgICB2YXIgd2luZG93SGVpZ2h0ID0gd2luLmlubmVySGVpZ2h0O1xuICAgICAgdmFyIHN3aXBlck9mZnNldCA9IHN3aXBlci4kZWwub2Zmc2V0KCk7XG4gICAgICBpZiAoc3dpcGVyLnJ0bCkgeyBzd2lwZXJPZmZzZXQubGVmdCAtPSBzd2lwZXIuJGVsWzBdLnNjcm9sbExlZnQ7IH1cbiAgICAgIHZhciBzd2lwZXJDb29yZCA9IFtcbiAgICAgICAgW3N3aXBlck9mZnNldC5sZWZ0LCBzd2lwZXJPZmZzZXQudG9wXSxcbiAgICAgICAgW3N3aXBlck9mZnNldC5sZWZ0ICsgc3dpcGVyLndpZHRoLCBzd2lwZXJPZmZzZXQudG9wXSxcbiAgICAgICAgW3N3aXBlck9mZnNldC5sZWZ0LCBzd2lwZXJPZmZzZXQudG9wICsgc3dpcGVyLmhlaWdodF0sXG4gICAgICAgIFtzd2lwZXJPZmZzZXQubGVmdCArIHN3aXBlci53aWR0aCwgc3dpcGVyT2Zmc2V0LnRvcCArIHN3aXBlci5oZWlnaHRdIF07XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN3aXBlckNvb3JkLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHZhciBwb2ludCA9IHN3aXBlckNvb3JkW2ldO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgcG9pbnRbMF0gPj0gd2luZG93U2Nyb2xsLmxlZnQgJiYgcG9pbnRbMF0gPD0gd2luZG93U2Nyb2xsLmxlZnQgKyB3aW5kb3dXaWR0aCAmJlxuICAgICAgICAgICAgcG9pbnRbMV0gPj0gd2luZG93U2Nyb2xsLnRvcCAmJiBwb2ludFsxXSA8PSB3aW5kb3dTY3JvbGwudG9wICsgd2luZG93SGVpZ2h0XG4gICAgICAgICkge1xuICAgICAgICAgIGluVmlldyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICghaW5WaWV3KSB7IHJldHVybiB1bmRlZmluZWQ7IH1cbiAgICB9XG4gICAgaWYgKHN3aXBlci5pc0hvcml6b250YWwoKSkge1xuICAgICAgaWYgKGtjID09PSAzNyB8fCBrYyA9PT0gMzkpIHtcbiAgICAgICAgaWYgKGUucHJldmVudERlZmF1bHQpIHsgZS5wcmV2ZW50RGVmYXVsdCgpOyB9XG4gICAgICAgIGVsc2UgeyBlLnJldHVyblZhbHVlID0gZmFsc2U7IH1cbiAgICAgIH1cbiAgICAgIGlmICgoa2MgPT09IDM5ICYmICFzd2lwZXIucnRsKSB8fCAoa2MgPT09IDM3ICYmIHN3aXBlci5ydGwpKSB7IHN3aXBlci5zbGlkZU5leHQoKTsgfVxuICAgICAgaWYgKChrYyA9PT0gMzcgJiYgIXN3aXBlci5ydGwpIHx8IChrYyA9PT0gMzkgJiYgc3dpcGVyLnJ0bCkpIHsgc3dpcGVyLnNsaWRlUHJldigpOyB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChrYyA9PT0gMzggfHwga2MgPT09IDQwKSB7XG4gICAgICAgIGlmIChlLnByZXZlbnREZWZhdWx0KSB7IGUucHJldmVudERlZmF1bHQoKTsgfVxuICAgICAgICBlbHNlIHsgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlOyB9XG4gICAgICB9XG4gICAgICBpZiAoa2MgPT09IDQwKSB7IHN3aXBlci5zbGlkZU5leHQoKTsgfVxuICAgICAgaWYgKGtjID09PSAzOCkgeyBzd2lwZXIuc2xpZGVQcmV2KCk7IH1cbiAgICB9XG4gICAgc3dpcGVyLmVtaXQoJ2tleVByZXNzJywga2MpO1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH0sXG4gIGVuYWJsZTogZnVuY3Rpb24gZW5hYmxlKCkge1xuICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgIGlmIChzd2lwZXIua2V5Ym9hcmQuZW5hYmxlZCkgeyByZXR1cm47IH1cbiAgICAkJDEoZG9jKS5vbigna2V5ZG93bicsIHN3aXBlci5rZXlib2FyZC5oYW5kbGUpO1xuICAgIHN3aXBlci5rZXlib2FyZC5lbmFibGVkID0gdHJ1ZTtcbiAgfSxcbiAgZGlzYWJsZTogZnVuY3Rpb24gZGlzYWJsZSgpIHtcbiAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICBpZiAoIXN3aXBlci5rZXlib2FyZC5lbmFibGVkKSB7IHJldHVybjsgfVxuICAgICQkMShkb2MpLm9mZigna2V5ZG93bicsIHN3aXBlci5rZXlib2FyZC5oYW5kbGUpO1xuICAgIHN3aXBlci5rZXlib2FyZC5lbmFibGVkID0gZmFsc2U7XG4gIH0sXG59O1xuXG52YXIgS2V5Ym9hcmQkMSA9IHtcbiAgbmFtZTogJ2tleWJvYXJkJyxcbiAgcGFyYW1zOiB7XG4gICAga2V5Ym9hcmQ6IHtcbiAgICAgIGVuYWJsZWQ6IGZhbHNlLFxuICAgIH0sXG4gIH0sXG4gIGNyZWF0ZTogZnVuY3Rpb24gY3JlYXRlKCkge1xuICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgIFV0aWxzLmV4dGVuZChzd2lwZXIsIHtcbiAgICAgIGtleWJvYXJkOiB7XG4gICAgICAgIGVuYWJsZWQ6IGZhbHNlLFxuICAgICAgICBlbmFibGU6IEtleWJvYXJkLmVuYWJsZS5iaW5kKHN3aXBlciksXG4gICAgICAgIGRpc2FibGU6IEtleWJvYXJkLmRpc2FibGUuYmluZChzd2lwZXIpLFxuICAgICAgICBoYW5kbGU6IEtleWJvYXJkLmhhbmRsZS5iaW5kKHN3aXBlciksXG4gICAgICB9LFxuICAgIH0pO1xuICB9LFxuICBvbjoge1xuICAgIGluaXQ6IGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICAgIGlmIChzd2lwZXIucGFyYW1zLmtleWJvYXJkLmVuYWJsZWQpIHtcbiAgICAgICAgc3dpcGVyLmtleWJvYXJkLmVuYWJsZSgpO1xuICAgICAgfVxuICAgIH0sXG4gICAgZGVzdHJveTogZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgICAgaWYgKHN3aXBlci5rZXlib2FyZC5lbmFibGVkKSB7XG4gICAgICAgIHN3aXBlci5rZXlib2FyZC5kaXNhYmxlKCk7XG4gICAgICB9XG4gICAgfSxcbiAgfSxcbn07XG5cbmZ1bmN0aW9uIGlzRXZlbnRTdXBwb3J0ZWQoKSB7XG4gIHZhciBldmVudE5hbWUgPSAnb253aGVlbCc7XG4gIHZhciBpc1N1cHBvcnRlZCA9IGV2ZW50TmFtZSBpbiBkb2M7XG5cbiAgaWYgKCFpc1N1cHBvcnRlZCkge1xuICAgIHZhciBlbGVtZW50ID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKGV2ZW50TmFtZSwgJ3JldHVybjsnKTtcbiAgICBpc1N1cHBvcnRlZCA9IHR5cGVvZiBlbGVtZW50W2V2ZW50TmFtZV0gPT09ICdmdW5jdGlvbic7XG4gIH1cblxuICBpZiAoIWlzU3VwcG9ydGVkICYmXG4gICAgZG9jLmltcGxlbWVudGF0aW9uICYmXG4gICAgZG9jLmltcGxlbWVudGF0aW9uLmhhc0ZlYXR1cmUgJiZcbiAgICAvLyBhbHdheXMgcmV0dXJucyB0cnVlIGluIG5ld2VyIGJyb3dzZXJzIGFzIHBlciB0aGUgc3RhbmRhcmQuXG4gICAgLy8gQHNlZSBodHRwOi8vZG9tLnNwZWMud2hhdHdnLm9yZy8jZG9tLWRvbWltcGxlbWVudGF0aW9uLWhhc2ZlYXR1cmVcbiAgICBkb2MuaW1wbGVtZW50YXRpb24uaGFzRmVhdHVyZSgnJywgJycpICE9PSB0cnVlXG4gICkge1xuICAgIC8vIFRoaXMgaXMgdGhlIG9ubHkgd2F5IHRvIHRlc3Qgc3VwcG9ydCBmb3IgdGhlIGB3aGVlbGAgZXZlbnQgaW4gSUU5Ky5cbiAgICBpc1N1cHBvcnRlZCA9IGRvYy5pbXBsZW1lbnRhdGlvbi5oYXNGZWF0dXJlKCdFdmVudHMud2hlZWwnLCAnMy4wJyk7XG4gIH1cblxuICByZXR1cm4gaXNTdXBwb3J0ZWQ7XG59XG52YXIgTW91c2V3aGVlbCA9IHtcbiAgbGFzdFNjcm9sbFRpbWU6IFV0aWxzLm5vdygpLFxuICBldmVudDogKGZ1bmN0aW9uIGdldEV2ZW50KCkge1xuICAgIGlmICh3aW4ubmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCdmaXJlZm94JykgPiAtMSkgeyByZXR1cm4gJ0RPTU1vdXNlU2Nyb2xsJzsgfVxuICAgIHJldHVybiBpc0V2ZW50U3VwcG9ydGVkKCkgPyAnd2hlZWwnIDogJ21vdXNld2hlZWwnO1xuICB9KCkpLFxuICBub3JtYWxpemU6IGZ1bmN0aW9uIG5vcm1hbGl6ZShlKSB7XG4gICAgLy8gUmVhc29uYWJsZSBkZWZhdWx0c1xuICAgIHZhciBQSVhFTF9TVEVQID0gMTA7XG4gICAgdmFyIExJTkVfSEVJR0hUID0gNDA7XG4gICAgdmFyIFBBR0VfSEVJR0hUID0gODAwO1xuXG4gICAgdmFyIHNYID0gMDtcbiAgICB2YXIgc1kgPSAwOyAvLyBzcGluWCwgc3BpbllcbiAgICB2YXIgcFggPSAwO1xuICAgIHZhciBwWSA9IDA7IC8vIHBpeGVsWCwgcGl4ZWxZXG5cbiAgICAvLyBMZWdhY3lcbiAgICBpZiAoJ2RldGFpbCcgaW4gZSkge1xuICAgICAgc1kgPSBlLmRldGFpbDtcbiAgICB9XG4gICAgaWYgKCd3aGVlbERlbHRhJyBpbiBlKSB7XG4gICAgICBzWSA9IC1lLndoZWVsRGVsdGEgLyAxMjA7XG4gICAgfVxuICAgIGlmICgnd2hlZWxEZWx0YVknIGluIGUpIHtcbiAgICAgIHNZID0gLWUud2hlZWxEZWx0YVkgLyAxMjA7XG4gICAgfVxuICAgIGlmICgnd2hlZWxEZWx0YVgnIGluIGUpIHtcbiAgICAgIHNYID0gLWUud2hlZWxEZWx0YVggLyAxMjA7XG4gICAgfVxuXG4gICAgLy8gc2lkZSBzY3JvbGxpbmcgb24gRkYgd2l0aCBET01Nb3VzZVNjcm9sbFxuICAgIGlmICgnYXhpcycgaW4gZSAmJiBlLmF4aXMgPT09IGUuSE9SSVpPTlRBTF9BWElTKSB7XG4gICAgICBzWCA9IHNZO1xuICAgICAgc1kgPSAwO1xuICAgIH1cblxuICAgIHBYID0gc1ggKiBQSVhFTF9TVEVQO1xuICAgIHBZID0gc1kgKiBQSVhFTF9TVEVQO1xuXG4gICAgaWYgKCdkZWx0YVknIGluIGUpIHtcbiAgICAgIHBZID0gZS5kZWx0YVk7XG4gICAgfVxuICAgIGlmICgnZGVsdGFYJyBpbiBlKSB7XG4gICAgICBwWCA9IGUuZGVsdGFYO1xuICAgIH1cblxuICAgIGlmICgocFggfHwgcFkpICYmIGUuZGVsdGFNb2RlKSB7XG4gICAgICBpZiAoZS5kZWx0YU1vZGUgPT09IDEpIHsgLy8gZGVsdGEgaW4gTElORSB1bml0c1xuICAgICAgICBwWCAqPSBMSU5FX0hFSUdIVDtcbiAgICAgICAgcFkgKj0gTElORV9IRUlHSFQ7XG4gICAgICB9IGVsc2UgeyAvLyBkZWx0YSBpbiBQQUdFIHVuaXRzXG4gICAgICAgIHBYICo9IFBBR0VfSEVJR0hUO1xuICAgICAgICBwWSAqPSBQQUdFX0hFSUdIVDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBGYWxsLWJhY2sgaWYgc3BpbiBjYW5ub3QgYmUgZGV0ZXJtaW5lZFxuICAgIGlmIChwWCAmJiAhc1gpIHtcbiAgICAgIHNYID0gKHBYIDwgMSkgPyAtMSA6IDE7XG4gICAgfVxuICAgIGlmIChwWSAmJiAhc1kpIHtcbiAgICAgIHNZID0gKHBZIDwgMSkgPyAtMSA6IDE7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHNwaW5YOiBzWCxcbiAgICAgIHNwaW5ZOiBzWSxcbiAgICAgIHBpeGVsWDogcFgsXG4gICAgICBwaXhlbFk6IHBZLFxuICAgIH07XG4gIH0sXG4gIGhhbmRsZTogZnVuY3Rpb24gaGFuZGxlKGV2ZW50KSB7XG4gICAgdmFyIGUgPSBldmVudDtcbiAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICB2YXIgcGFyYW1zID0gc3dpcGVyLnBhcmFtcy5tb3VzZXdoZWVsO1xuICAgIGlmIChlLm9yaWdpbmFsRXZlbnQpIHsgZSA9IGUub3JpZ2luYWxFdmVudDsgfSAvLyBqcXVlcnkgZml4XG4gICAgdmFyIGRlbHRhID0gMDtcbiAgICB2YXIgcnRsRmFjdG9yID0gc3dpcGVyLnJ0bCA/IC0xIDogMTtcblxuICAgIHZhciBkYXRhID0gTW91c2V3aGVlbC5ub3JtYWxpemUoZSk7XG5cbiAgICBpZiAocGFyYW1zLmZvcmNlVG9BeGlzKSB7XG4gICAgICBpZiAoc3dpcGVyLmlzSG9yaXpvbnRhbCgpKSB7XG4gICAgICAgIGlmIChNYXRoLmFicyhkYXRhLnBpeGVsWCkgPiBNYXRoLmFicyhkYXRhLnBpeGVsWSkpIHsgZGVsdGEgPSBkYXRhLnBpeGVsWCAqIHJ0bEZhY3RvcjsgfVxuICAgICAgICBlbHNlIHsgcmV0dXJuIHRydWU7IH1cbiAgICAgIH0gZWxzZSBpZiAoTWF0aC5hYnMoZGF0YS5waXhlbFkpID4gTWF0aC5hYnMoZGF0YS5waXhlbFgpKSB7IGRlbHRhID0gZGF0YS5waXhlbFk7IH1cbiAgICAgIGVsc2UgeyByZXR1cm4gdHJ1ZTsgfVxuICAgIH0gZWxzZSB7XG4gICAgICBkZWx0YSA9IE1hdGguYWJzKGRhdGEucGl4ZWxYKSA+IE1hdGguYWJzKGRhdGEucGl4ZWxZKSA/IC1kYXRhLnBpeGVsWCAqIHJ0bEZhY3RvciA6IC1kYXRhLnBpeGVsWTtcbiAgICB9XG5cbiAgICBpZiAoZGVsdGEgPT09IDApIHsgcmV0dXJuIHRydWU7IH1cblxuICAgIGlmIChwYXJhbXMuaW52ZXJ0KSB7IGRlbHRhID0gLWRlbHRhOyB9XG5cbiAgICBpZiAoIXN3aXBlci5wYXJhbXMuZnJlZU1vZGUpIHtcbiAgICAgIGlmIChVdGlscy5ub3coKSAtIHN3aXBlci5tb3VzZXdoZWVsLmxhc3RTY3JvbGxUaW1lID4gNjApIHtcbiAgICAgICAgaWYgKGRlbHRhIDwgMCkge1xuICAgICAgICAgIGlmICgoIXN3aXBlci5pc0VuZCB8fCBzd2lwZXIucGFyYW1zLmxvb3ApICYmICFzd2lwZXIuYW5pbWF0aW5nKSB7XG4gICAgICAgICAgICBzd2lwZXIuc2xpZGVOZXh0KCk7XG4gICAgICAgICAgICBzd2lwZXIuZW1pdCgnc2Nyb2xsJywgZSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChwYXJhbXMucmVsZWFzZU9uRWRnZXMpIHsgcmV0dXJuIHRydWU7IH1cbiAgICAgICAgfSBlbHNlIGlmICgoIXN3aXBlci5pc0JlZ2lubmluZyB8fCBzd2lwZXIucGFyYW1zLmxvb3ApICYmICFzd2lwZXIuYW5pbWF0aW5nKSB7XG4gICAgICAgICAgc3dpcGVyLnNsaWRlUHJldigpO1xuICAgICAgICAgIHN3aXBlci5lbWl0KCdzY3JvbGwnLCBlKTtcbiAgICAgICAgfSBlbHNlIGlmIChwYXJhbXMucmVsZWFzZU9uRWRnZXMpIHsgcmV0dXJuIHRydWU7IH1cbiAgICAgIH1cbiAgICAgIHN3aXBlci5tb3VzZXdoZWVsLmxhc3RTY3JvbGxUaW1lID0gKG5ldyB3aW4uRGF0ZSgpKS5nZXRUaW1lKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEZyZWVtb2RlIG9yIHNjcm9sbENvbnRhaW5lcjpcbiAgICAgIHZhciBwb3NpdGlvbiA9IHN3aXBlci5nZXRUcmFuc2xhdGUoKSArIChkZWx0YSAqIHBhcmFtcy5zZW5zaXRpdml0eSk7XG4gICAgICB2YXIgd2FzQmVnaW5uaW5nID0gc3dpcGVyLmlzQmVnaW5uaW5nO1xuICAgICAgdmFyIHdhc0VuZCA9IHN3aXBlci5pc0VuZDtcblxuICAgICAgaWYgKHBvc2l0aW9uID49IHN3aXBlci5taW5UcmFuc2xhdGUoKSkgeyBwb3NpdGlvbiA9IHN3aXBlci5taW5UcmFuc2xhdGUoKTsgfVxuICAgICAgaWYgKHBvc2l0aW9uIDw9IHN3aXBlci5tYXhUcmFuc2xhdGUoKSkgeyBwb3NpdGlvbiA9IHN3aXBlci5tYXhUcmFuc2xhdGUoKTsgfVxuXG4gICAgICBzd2lwZXIuc2V0VHJhbnNpdGlvbigwKTtcbiAgICAgIHN3aXBlci5zZXRUcmFuc2xhdGUocG9zaXRpb24pO1xuICAgICAgc3dpcGVyLnVwZGF0ZVByb2dyZXNzKCk7XG4gICAgICBzd2lwZXIudXBkYXRlQWN0aXZlSW5kZXgoKTtcbiAgICAgIHN3aXBlci51cGRhdGVTbGlkZXNDbGFzc2VzKCk7XG5cbiAgICAgIGlmICgoIXdhc0JlZ2lubmluZyAmJiBzd2lwZXIuaXNCZWdpbm5pbmcpIHx8ICghd2FzRW5kICYmIHN3aXBlci5pc0VuZCkpIHtcbiAgICAgICAgc3dpcGVyLnVwZGF0ZVNsaWRlc0NsYXNzZXMoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHN3aXBlci5wYXJhbXMuZnJlZU1vZGVTdGlja3kpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHN3aXBlci5tb3VzZXdoZWVsLnRpbWVvdXQpO1xuICAgICAgICBzd2lwZXIubW91c2V3aGVlbC50aW1lb3V0ID0gVXRpbHMubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHN3aXBlci5zbGlkZVJlc2V0KCk7XG4gICAgICAgIH0sIDMwMCk7XG4gICAgICB9XG4gICAgICAvLyBFbWl0IGV2ZW50XG4gICAgICBzd2lwZXIuZW1pdCgnc2Nyb2xsJywgZSk7XG5cbiAgICAgIC8vIFN0b3AgYXV0b3BsYXlcbiAgICAgIGlmIChzd2lwZXIucGFyYW1zLmF1dG9wbGF5ICYmIHN3aXBlci5wYXJhbXMuYXV0b3BsYXlEaXNhYmxlT25JbnRlcmFjdGlvbikgeyBzd2lwZXIuc3RvcEF1dG9wbGF5KCk7IH1cblxuICAgICAgLy8gUmV0dXJuIHBhZ2Ugc2Nyb2xsIG9uIGVkZ2UgcG9zaXRpb25zXG4gICAgICBpZiAocG9zaXRpb24gPT09IDAgfHwgcG9zaXRpb24gPT09IHN3aXBlci5tYXhUcmFuc2xhdGUoKSkgeyByZXR1cm4gdHJ1ZTsgfVxuICAgIH1cblxuICAgIGlmIChlLnByZXZlbnREZWZhdWx0KSB7IGUucHJldmVudERlZmF1bHQoKTsgfVxuICAgIGVsc2UgeyBlLnJldHVyblZhbHVlID0gZmFsc2U7IH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG4gIGVuYWJsZTogZnVuY3Rpb24gZW5hYmxlKCkge1xuICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgIGlmICghTW91c2V3aGVlbC5ldmVudCkgeyByZXR1cm4gZmFsc2U7IH1cbiAgICBpZiAoc3dpcGVyLm1vdXNld2hlZWwuZW5hYmxlZCkgeyByZXR1cm4gZmFsc2U7IH1cbiAgICB2YXIgdGFyZ2V0ID0gc3dpcGVyLiRlbDtcbiAgICBpZiAoc3dpcGVyLnBhcmFtcy5tb3VzZXdoZWVsLmV2ZW50c1RhcmdlZCAhPT0gJ2NvbnRhaW5lcicpIHtcbiAgICAgIHRhcmdldCA9ICQkMShzd2lwZXIucGFyYW1zLm1vdXNld2hlZWwuZXZlbnRzVGFyZ2VkKTtcbiAgICB9XG4gICAgdGFyZ2V0Lm9uKE1vdXNld2hlZWwuZXZlbnQsIHN3aXBlci5tb3VzZXdoZWVsLmhhbmRsZSk7XG4gICAgc3dpcGVyLm1vdXNld2hlZWwuZW5hYmxlZCA9IHRydWU7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gIGRpc2FibGU6IGZ1bmN0aW9uIGRpc2FibGUoKSB7XG4gICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgaWYgKCFNb3VzZXdoZWVsLmV2ZW50KSB7IHJldHVybiBmYWxzZTsgfVxuICAgIGlmICghc3dpcGVyLm1vdXNld2hlZWwuZW5hYmxlZCkgeyByZXR1cm4gZmFsc2U7IH1cbiAgICB2YXIgdGFyZ2V0ID0gc3dpcGVyLiRlbDtcbiAgICBpZiAoc3dpcGVyLnBhcmFtcy5tb3VzZXdoZWVsLmV2ZW50c1RhcmdlZCAhPT0gJ2NvbnRhaW5lcicpIHtcbiAgICAgIHRhcmdldCA9ICQkMShzd2lwZXIucGFyYW1zLm1vdXNld2hlZWwuZXZlbnRzVGFyZ2VkKTtcbiAgICB9XG4gICAgdGFyZ2V0Lm9mZihNb3VzZXdoZWVsLmV2ZW50LCBzd2lwZXIubW91c2V3aGVlbC5oYW5kbGUpO1xuICAgIHN3aXBlci5tb3VzZXdoZWVsLmVuYWJsZWQgPSBmYWxzZTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbn07XG5cbnZhciBNb3VzZXdoZWVsJDEgPSB7XG4gIG5hbWU6ICdtb3VzZXdoZWVsJyxcbiAgcGFyYW1zOiB7XG4gICAgbW91c2V3aGVlbDoge1xuICAgICAgZW5hYmxlZDogZmFsc2UsXG4gICAgICByZWxlYXNlT25FZGdlczogZmFsc2UsXG4gICAgICBpbnZlcnQ6IGZhbHNlLFxuICAgICAgZm9yY2VUb0F4aXM6IGZhbHNlLFxuICAgICAgc2Vuc2l0aXZpdHk6IDEsXG4gICAgICBldmVudHNUYXJnZWQ6ICdjb250YWluZXInLFxuICAgIH0sXG4gIH0sXG4gIGNyZWF0ZTogZnVuY3Rpb24gY3JlYXRlKCkge1xuICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgIFV0aWxzLmV4dGVuZChzd2lwZXIsIHtcbiAgICAgIG1vdXNld2hlZWw6IHtcbiAgICAgICAgZW5hYmxlZDogZmFsc2UsXG4gICAgICAgIGVuYWJsZTogTW91c2V3aGVlbC5lbmFibGUuYmluZChzd2lwZXIpLFxuICAgICAgICBkaXNhYmxlOiBNb3VzZXdoZWVsLmRpc2FibGUuYmluZChzd2lwZXIpLFxuICAgICAgICBoYW5kbGU6IE1vdXNld2hlZWwuaGFuZGxlLmJpbmQoc3dpcGVyKSxcbiAgICAgICAgbGFzdFNjcm9sbFRpbWU6IFV0aWxzLm5vdygpLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfSxcbiAgb246IHtcbiAgICBpbml0OiBmdW5jdGlvbiBpbml0KCkge1xuICAgICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgICBpZiAoc3dpcGVyLnBhcmFtcy5tb3VzZXdoZWVsLmVuYWJsZWQpIHsgc3dpcGVyLm1vdXNld2hlZWwuZW5hYmxlKCk7IH1cbiAgICB9LFxuICAgIGRlc3Ryb3k6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICAgIGlmIChzd2lwZXIubW91c2V3aGVlbC5lbmFibGVkKSB7IHN3aXBlci5tb3VzZXdoZWVsLmRpc2FibGUoKTsgfVxuICAgIH0sXG4gIH0sXG59O1xuXG52YXIgTmF2aWdhdGlvbiA9IHtcbiAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgLy8gVXBkYXRlIE5hdmlnYXRpb24gQnV0dG9uc1xuICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgIHZhciBwYXJhbXMgPSBzd2lwZXIucGFyYW1zLm5hdmlnYXRpb247XG5cbiAgICBpZiAoc3dpcGVyLnBhcmFtcy5sb29wKSB7IHJldHVybjsgfVxuICAgIHZhciByZWYgPSBzd2lwZXIubmF2aWdhdGlvbjtcbiAgICB2YXIgJG5leHRFbCA9IHJlZi4kbmV4dEVsO1xuICAgIHZhciAkcHJldkVsID0gcmVmLiRwcmV2RWw7XG5cbiAgICBpZiAoJHByZXZFbCAmJiAkcHJldkVsLmxlbmd0aCA+IDApIHtcbiAgICAgIGlmIChzd2lwZXIuaXNCZWdpbm5pbmcpIHtcbiAgICAgICAgJHByZXZFbC5hZGRDbGFzcyhwYXJhbXMuZGlzYWJsZWRDbGFzcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkcHJldkVsLnJlbW92ZUNsYXNzKHBhcmFtcy5kaXNhYmxlZENsYXNzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCRuZXh0RWwgJiYgJG5leHRFbC5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAoc3dpcGVyLmlzRW5kKSB7XG4gICAgICAgICRuZXh0RWwuYWRkQ2xhc3MocGFyYW1zLmRpc2FibGVkQ2xhc3MpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJG5leHRFbC5yZW1vdmVDbGFzcyhwYXJhbXMuZGlzYWJsZWRDbGFzcyk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBpbml0OiBmdW5jdGlvbiBpbml0KCkge1xuICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgIHZhciBwYXJhbXMgPSBzd2lwZXIucGFyYW1zLm5hdmlnYXRpb247XG4gICAgaWYgKCEocGFyYW1zLm5leHRFbCB8fCBwYXJhbXMucHJldkVsKSkgeyByZXR1cm47IH1cblxuICAgIHZhciAkbmV4dEVsO1xuICAgIHZhciAkcHJldkVsO1xuICAgIGlmIChwYXJhbXMubmV4dEVsKSB7XG4gICAgICAkbmV4dEVsID0gJCQxKHBhcmFtcy5uZXh0RWwpO1xuICAgICAgaWYgKFxuICAgICAgICBzd2lwZXIucGFyYW1zLnVuaXF1ZU5hdkVsZW1lbnRzICYmXG4gICAgICAgIHR5cGVvZiBwYXJhbXMubmV4dEVsID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAkbmV4dEVsLmxlbmd0aCA+IDEgJiZcbiAgICAgICAgc3dpcGVyLiRlbC5maW5kKHBhcmFtcy5uZXh0RWwpLmxlbmd0aCA9PT0gMVxuICAgICAgKSB7XG4gICAgICAgICRuZXh0RWwgPSBzd2lwZXIuJGVsLmZpbmQocGFyYW1zLm5leHRFbCk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChwYXJhbXMucHJldkVsKSB7XG4gICAgICAkcHJldkVsID0gJCQxKHBhcmFtcy5wcmV2RWwpO1xuICAgICAgaWYgKFxuICAgICAgICBzd2lwZXIucGFyYW1zLnVuaXF1ZU5hdkVsZW1lbnRzICYmXG4gICAgICAgIHR5cGVvZiBwYXJhbXMucHJldkVsID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAkcHJldkVsLmxlbmd0aCA+IDEgJiZcbiAgICAgICAgc3dpcGVyLiRlbC5maW5kKHBhcmFtcy5wcmV2RWwpLmxlbmd0aCA9PT0gMVxuICAgICAgKSB7XG4gICAgICAgICRwcmV2RWwgPSBzd2lwZXIuJGVsLmZpbmQocGFyYW1zLnByZXZFbCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCRuZXh0RWwgJiYgJG5leHRFbC5sZW5ndGggPiAwKSB7XG4gICAgICAkbmV4dEVsLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaWYgKHN3aXBlci5pc0VuZCAmJiAhc3dpcGVyLnBhcmFtcy5sb29wKSB7IHJldHVybjsgfVxuICAgICAgICBzd2lwZXIuc2xpZGVOZXh0KCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKCRwcmV2RWwgJiYgJHByZXZFbC5sZW5ndGggPiAwKSB7XG4gICAgICAkcHJldkVsLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaWYgKHN3aXBlci5pc0JlZ2lubmluZyAmJiAhc3dpcGVyLnBhcmFtcy5sb29wKSB7IHJldHVybjsgfVxuICAgICAgICBzd2lwZXIuc2xpZGVQcmV2KCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBVdGlscy5leHRlbmQoc3dpcGVyLm5hdmlnYXRpb24sIHtcbiAgICAgICRuZXh0RWw6ICRuZXh0RWwsXG4gICAgICBuZXh0RWw6ICRuZXh0RWwgJiYgJG5leHRFbFswXSxcbiAgICAgICRwcmV2RWw6ICRwcmV2RWwsXG4gICAgICBwcmV2RWw6ICRwcmV2RWwgJiYgJHByZXZFbFswXSxcbiAgICB9KTtcbiAgfSxcbiAgZGVzdHJveTogZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICB2YXIgcmVmID0gc3dpcGVyLm5hdmlnYXRpb247XG4gICAgdmFyICRuZXh0RWwgPSByZWYuJG5leHRFbDtcbiAgICB2YXIgJHByZXZFbCA9IHJlZi4kcHJldkVsO1xuICAgIGlmICgkbmV4dEVsICYmICRuZXh0RWwubGVuZ3RoKSB7XG4gICAgICAkbmV4dEVsLm9mZignY2xpY2snKTtcbiAgICAgICRuZXh0RWwucmVtb3ZlQ2xhc3Moc3dpcGVyLnBhcmFtcy5uYXZpZ2F0aW9uLmRpc2FibGVkQ2xhc3MpO1xuICAgIH1cbiAgICBpZiAoJHByZXZFbCAmJiAkcHJldkVsLmxlbmd0aCkge1xuICAgICAgJHByZXZFbC5vZmYoJ2NsaWNrJyk7XG4gICAgICAkcHJldkVsLnJlbW92ZUNsYXNzKHN3aXBlci5wYXJhbXMubmF2aWdhdGlvbi5kaXNhYmxlZENsYXNzKTtcbiAgICB9XG4gIH0sXG59O1xuXG52YXIgTmF2aWdhdGlvbiQxID0ge1xuICBuYW1lOiAnbmF2aWdhdGlvbicsXG4gIHBhcmFtczoge1xuICAgIG5hdmlnYXRpb246IHtcbiAgICAgIG5leHRFbDogbnVsbCxcbiAgICAgIHByZXZFbDogbnVsbCxcblxuICAgICAgaGlkZU9uQ2xpY2s6IGZhbHNlLFxuICAgICAgZGlzYWJsZWRDbGFzczogJ3N3aXBlci1idXR0b24tZGlzYWJsZWQnLFxuICAgICAgaGlkZGVuQ2xhc3M6ICdzd2lwZXItYnV0dG9uLWhpZGRlbicsXG4gICAgfSxcbiAgfSxcbiAgY3JlYXRlOiBmdW5jdGlvbiBjcmVhdGUoKSB7XG4gICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgVXRpbHMuZXh0ZW5kKHN3aXBlciwge1xuICAgICAgbmF2aWdhdGlvbjoge1xuICAgICAgICBpbml0OiBOYXZpZ2F0aW9uLmluaXQuYmluZChzd2lwZXIpLFxuICAgICAgICB1cGRhdGU6IE5hdmlnYXRpb24udXBkYXRlLmJpbmQoc3dpcGVyKSxcbiAgICAgICAgZGVzdHJveTogTmF2aWdhdGlvbi5kZXN0cm95LmJpbmQoc3dpcGVyKSxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH0sXG4gIG9uOiB7XG4gICAgaW5pdDogZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgICAgc3dpcGVyLm5hdmlnYXRpb24uaW5pdCgpO1xuICAgICAgc3dpcGVyLm5hdmlnYXRpb24udXBkYXRlKCk7XG4gICAgfSxcbiAgICB0b0VkZ2U6IGZ1bmN0aW9uIHRvRWRnZSgpIHtcbiAgICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgICAgc3dpcGVyLm5hdmlnYXRpb24udXBkYXRlKCk7XG4gICAgfSxcbiAgICBmcm9tRWRnZTogZnVuY3Rpb24gZnJvbUVkZ2UoKSB7XG4gICAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICAgIHN3aXBlci5uYXZpZ2F0aW9uLnVwZGF0ZSgpO1xuICAgIH0sXG4gICAgZGVzdHJveTogZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgICAgc3dpcGVyLm5hdmlnYXRpb24uZGVzdHJveSgpO1xuICAgIH0sXG4gICAgY2xpY2s6IGZ1bmN0aW9uIGNsaWNrKGUpIHtcbiAgICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgICAgdmFyIHJlZiA9IHN3aXBlci5uYXZpZ2F0aW9uO1xuICAgICAgdmFyICRuZXh0RWwgPSByZWYuJG5leHRFbDtcbiAgICAgIHZhciAkcHJldkVsID0gcmVmLiRwcmV2RWw7XG4gICAgICBpZiAoXG4gICAgICAgIHN3aXBlci5wYXJhbXMubmF2aWdhdGlvbi5oaWRlT25DbGljayAmJlxuICAgICAgICAhJCQxKGUudGFyZ2V0KS5pcygkcHJldkVsKSAmJlxuICAgICAgICAhJCQxKGUudGFyZ2V0KS5pcygkbmV4dEVsKVxuICAgICAgKSB7XG4gICAgICAgIGlmICgkbmV4dEVsKSB7ICRuZXh0RWwudG9nZ2xlQ2xhc3Moc3dpcGVyLnBhcmFtcy5uYXZpZ2F0aW9uLmhpZGRlbkNsYXNzKTsgfVxuICAgICAgICBpZiAoJHByZXZFbCkgeyAkcHJldkVsLnRvZ2dsZUNsYXNzKHN3aXBlci5wYXJhbXMubmF2aWdhdGlvbi5oaWRkZW5DbGFzcyk7IH1cbiAgICAgIH1cbiAgICB9LFxuICB9LFxufTtcblxudmFyIFBhZ2luYXRpb24gPSB7XG4gIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgIC8vIFJlbmRlciB8fCBVcGRhdGUgUGFnaW5hdGlvbiBidWxsZXRzL2l0ZW1zXG4gICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgdmFyIHJ0bCA9IHN3aXBlci5ydGw7XG4gICAgdmFyIHBhcmFtcyA9IHN3aXBlci5wYXJhbXMucGFnaW5hdGlvbjtcbiAgICBpZiAoIXBhcmFtcy5lbCB8fCAhc3dpcGVyLnBhZ2luYXRpb24uZWwgfHwgIXN3aXBlci5wYWdpbmF0aW9uLiRlbCB8fCBzd2lwZXIucGFnaW5hdGlvbi4kZWwubGVuZ3RoID09PSAwKSB7IHJldHVybjsgfVxuICAgIHZhciBzbGlkZXNMZW5ndGggPSBzd2lwZXIudmlydHVhbCAmJiBzd2lwZXIucGFyYW1zLnZpcnR1YWwuZW5hYmxlZCA/IHN3aXBlci52aXJ0dWFsLnNsaWRlcy5sZW5ndGggOiBzd2lwZXIuc2xpZGVzLmxlbmd0aDtcbiAgICB2YXIgJGVsID0gc3dpcGVyLnBhZ2luYXRpb24uJGVsO1xuICAgIC8vIEN1cnJlbnQvVG90YWxcbiAgICB2YXIgY3VycmVudDtcbiAgICB2YXIgdG90YWwgPSBzd2lwZXIucGFyYW1zLmxvb3AgPyBNYXRoLmNlaWwoKHNsaWRlc0xlbmd0aCAtIChzd2lwZXIubG9vcGVkU2xpZGVzICogMikpIC8gc3dpcGVyLnBhcmFtcy5zbGlkZXNQZXJHcm91cCkgOiBzd2lwZXIuc25hcEdyaWQubGVuZ3RoO1xuICAgIGlmIChzd2lwZXIucGFyYW1zLmxvb3ApIHtcbiAgICAgIGN1cnJlbnQgPSBNYXRoLmNlaWwoKHN3aXBlci5hY3RpdmVJbmRleCAtIHN3aXBlci5sb29wZWRTbGlkZXMpIC8gc3dpcGVyLnBhcmFtcy5zbGlkZXNQZXJHcm91cCk7XG4gICAgICBpZiAoY3VycmVudCA+IHNsaWRlc0xlbmd0aCAtIDEgLSAoc3dpcGVyLmxvb3BlZFNsaWRlcyAqIDIpKSB7XG4gICAgICAgIGN1cnJlbnQgLT0gKHNsaWRlc0xlbmd0aCAtIChzd2lwZXIubG9vcGVkU2xpZGVzICogMikpO1xuICAgICAgfVxuICAgICAgaWYgKGN1cnJlbnQgPiB0b3RhbCAtIDEpIHsgY3VycmVudCAtPSB0b3RhbDsgfVxuICAgICAgaWYgKGN1cnJlbnQgPCAwICYmIHN3aXBlci5wYXJhbXMucGFnaW5hdGlvblR5cGUgIT09ICdidWxsZXRzJykgeyBjdXJyZW50ID0gdG90YWwgKyBjdXJyZW50OyB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygc3dpcGVyLnNuYXBJbmRleCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGN1cnJlbnQgPSBzd2lwZXIuc25hcEluZGV4O1xuICAgIH0gZWxzZSB7XG4gICAgICBjdXJyZW50ID0gc3dpcGVyLmFjdGl2ZUluZGV4IHx8IDA7XG4gICAgfVxuICAgIC8vIFR5cGVzXG4gICAgaWYgKHBhcmFtcy50eXBlID09PSAnYnVsbGV0cycgJiYgc3dpcGVyLnBhZ2luYXRpb24uYnVsbGV0cyAmJiBzd2lwZXIucGFnaW5hdGlvbi5idWxsZXRzLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBidWxsZXRzID0gc3dpcGVyLnBhZ2luYXRpb24uYnVsbGV0cztcbiAgICAgIGlmIChwYXJhbXMuZHluYW1pY0J1bGxldHMpIHtcbiAgICAgICAgc3dpcGVyLnBhZ2luYXRpb24uYnVsbGV0U2l6ZSA9IGJ1bGxldHMuZXEoMClbc3dpcGVyLmlzSG9yaXpvbnRhbCgpID8gJ291dGVyV2lkdGgnIDogJ291dGVySGVpZ2h0J10odHJ1ZSk7XG4gICAgICAgICRlbC5jc3Moc3dpcGVyLmlzSG9yaXpvbnRhbCgpID8gJ3dpZHRoJyA6ICdoZWlnaHQnLCAoKHN3aXBlci5wYWdpbmF0aW9uLmJ1bGxldFNpemUgKiA1KSArIFwicHhcIikpO1xuICAgICAgfVxuICAgICAgYnVsbGV0cy5yZW1vdmVDbGFzcygoKHBhcmFtcy5idWxsZXRBY3RpdmVDbGFzcykgKyBcIiBcIiArIChwYXJhbXMuYnVsbGV0QWN0aXZlQ2xhc3MpICsgXCItbmV4dCBcIiArIChwYXJhbXMuYnVsbGV0QWN0aXZlQ2xhc3MpICsgXCItbmV4dC1uZXh0IFwiICsgKHBhcmFtcy5idWxsZXRBY3RpdmVDbGFzcykgKyBcIi1wcmV2IFwiICsgKHBhcmFtcy5idWxsZXRBY3RpdmVDbGFzcykgKyBcIi1wcmV2LXByZXZcIikpO1xuICAgICAgaWYgKCRlbC5sZW5ndGggPiAxKSB7XG4gICAgICAgIGJ1bGxldHMuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGJ1bGxldCkge1xuICAgICAgICAgIHZhciAkYnVsbGV0ID0gJCQxKGJ1bGxldCk7XG4gICAgICAgICAgaWYgKCRidWxsZXQuaW5kZXgoKSA9PT0gY3VycmVudCkge1xuICAgICAgICAgICAgJGJ1bGxldC5hZGRDbGFzcyhwYXJhbXMuYnVsbGV0QWN0aXZlQ2xhc3MpO1xuICAgICAgICAgICAgaWYgKHBhcmFtcy5keW5hbWljQnVsbGV0cykge1xuICAgICAgICAgICAgICAkYnVsbGV0XG4gICAgICAgICAgICAgICAgLnByZXYoKVxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcygoKHBhcmFtcy5idWxsZXRBY3RpdmVDbGFzcykgKyBcIi1wcmV2XCIpKVxuICAgICAgICAgICAgICAgIC5wcmV2KClcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoKChwYXJhbXMuYnVsbGV0QWN0aXZlQ2xhc3MpICsgXCItcHJldi1wcmV2XCIpKTtcbiAgICAgICAgICAgICAgJGJ1bGxldFxuICAgICAgICAgICAgICAgIC5uZXh0KClcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoKChwYXJhbXMuYnVsbGV0QWN0aXZlQ2xhc3MpICsgXCItbmV4dFwiKSlcbiAgICAgICAgICAgICAgICAubmV4dCgpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKCgocGFyYW1zLmJ1bGxldEFjdGl2ZUNsYXNzKSArIFwiLW5leHQtbmV4dFwiKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciAkYnVsbGV0ID0gYnVsbGV0cy5lcShjdXJyZW50KTtcbiAgICAgICAgJGJ1bGxldC5hZGRDbGFzcyhwYXJhbXMuYnVsbGV0QWN0aXZlQ2xhc3MpO1xuICAgICAgICBpZiAocGFyYW1zLmR5bmFtaWNCdWxsZXRzKSB7XG4gICAgICAgICAgJGJ1bGxldFxuICAgICAgICAgICAgLnByZXYoKVxuICAgICAgICAgICAgLmFkZENsYXNzKCgocGFyYW1zLmJ1bGxldEFjdGl2ZUNsYXNzKSArIFwiLXByZXZcIikpXG4gICAgICAgICAgICAucHJldigpXG4gICAgICAgICAgICAuYWRkQ2xhc3MoKChwYXJhbXMuYnVsbGV0QWN0aXZlQ2xhc3MpICsgXCItcHJldi1wcmV2XCIpKTtcbiAgICAgICAgICAkYnVsbGV0XG4gICAgICAgICAgICAubmV4dCgpXG4gICAgICAgICAgICAuYWRkQ2xhc3MoKChwYXJhbXMuYnVsbGV0QWN0aXZlQ2xhc3MpICsgXCItbmV4dFwiKSlcbiAgICAgICAgICAgIC5uZXh0KClcbiAgICAgICAgICAgIC5hZGRDbGFzcygoKHBhcmFtcy5idWxsZXRBY3RpdmVDbGFzcykgKyBcIi1uZXh0LW5leHRcIikpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAocGFyYW1zLmR5bmFtaWNCdWxsZXRzKSB7XG4gICAgICAgIHZhciBkeW5hbWljQnVsbGV0c0xlbmd0aCA9IE1hdGgubWluKGJ1bGxldHMubGVuZ3RoLCA1KTtcbiAgICAgICAgdmFyIGJ1bGxldHNPZmZzZXQgPSAoKChzd2lwZXIucGFnaW5hdGlvbi5idWxsZXRTaXplICogZHluYW1pY0J1bGxldHNMZW5ndGgpIC0gKHN3aXBlci5wYWdpbmF0aW9uLmJ1bGxldFNpemUpKSAvIDIpIC0gKGN1cnJlbnQgKiBzd2lwZXIucGFnaW5hdGlvbi5idWxsZXRTaXplKTtcbiAgICAgICAgdmFyIG9mZnNldFByb3AgPSBydGwgPyAncmlnaHQnIDogJ2xlZnQnO1xuICAgICAgICBidWxsZXRzLmNzcyhzd2lwZXIuaXNIb3Jpem9udGFsKCkgPyBvZmZzZXRQcm9wIDogJ3RvcCcsIChidWxsZXRzT2Zmc2V0ICsgXCJweFwiKSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChwYXJhbXMudHlwZSA9PT0gJ2ZyYWN0aW9uJykge1xuICAgICAgJGVsLmZpbmQoKFwiLlwiICsgKHBhcmFtcy5jdXJyZW50Q2xhc3MpKSkudGV4dChjdXJyZW50ICsgMSk7XG4gICAgICAkZWwuZmluZCgoXCIuXCIgKyAocGFyYW1zLnRvdGFsQ2xhc3MpKSkudGV4dCh0b3RhbCk7XG4gICAgfVxuICAgIGlmIChwYXJhbXMudHlwZSA9PT0gJ3Byb2dyZXNzYmFyJykge1xuICAgICAgdmFyIHNjYWxlID0gKGN1cnJlbnQgKyAxKSAvIHRvdGFsO1xuICAgICAgdmFyIHNjYWxlWCA9IHNjYWxlO1xuICAgICAgdmFyIHNjYWxlWSA9IDE7XG4gICAgICBpZiAoIXN3aXBlci5pc0hvcml6b250YWwoKSkge1xuICAgICAgICBzY2FsZVkgPSBzY2FsZTtcbiAgICAgICAgc2NhbGVYID0gMTtcbiAgICAgIH1cbiAgICAgICRlbC5maW5kKChcIi5cIiArIChwYXJhbXMucHJvZ3Jlc3NiYXJGaWxsQ2xhc3MpKSkudHJhbnNmb3JtKChcInRyYW5zbGF0ZTNkKDAsMCwwKSBzY2FsZVgoXCIgKyBzY2FsZVggKyBcIikgc2NhbGVZKFwiICsgc2NhbGVZICsgXCIpXCIpKS50cmFuc2l0aW9uKHN3aXBlci5wYXJhbXMuc3BlZWQpO1xuICAgIH1cbiAgICBpZiAocGFyYW1zLnR5cGUgPT09ICdjdXN0b20nICYmIHBhcmFtcy5yZW5kZXJDdXN0b20pIHtcbiAgICAgICRlbC5odG1sKHBhcmFtcy5yZW5kZXJDdXN0b20oc3dpcGVyLCBjdXJyZW50ICsgMSwgdG90YWwpKTtcbiAgICAgIHN3aXBlci5lbWl0KCdwYWdpbmF0aW9uUmVuZGVyJywgc3dpcGVyLCAkZWxbMF0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBzd2lwZXIuZW1pdCgncGFnaW5hdGlvblVwZGF0ZScsIHN3aXBlciwgJGVsWzBdKTtcbiAgICB9XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIC8vIFJlbmRlciBDb250YWluZXJcbiAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICB2YXIgcGFyYW1zID0gc3dpcGVyLnBhcmFtcy5wYWdpbmF0aW9uO1xuICAgIGlmICghcGFyYW1zLmVsIHx8ICFzd2lwZXIucGFnaW5hdGlvbi5lbCB8fCAhc3dpcGVyLnBhZ2luYXRpb24uJGVsIHx8IHN3aXBlci5wYWdpbmF0aW9uLiRlbC5sZW5ndGggPT09IDApIHsgcmV0dXJuOyB9XG4gICAgdmFyIHNsaWRlc0xlbmd0aCA9IHN3aXBlci52aXJ0dWFsICYmIHN3aXBlci5wYXJhbXMudmlydHVhbC5lbmFibGVkID8gc3dpcGVyLnZpcnR1YWwuc2xpZGVzLmxlbmd0aCA6IHN3aXBlci5zbGlkZXMubGVuZ3RoO1xuXG4gICAgdmFyICRlbCA9IHN3aXBlci5wYWdpbmF0aW9uLiRlbDtcbiAgICB2YXIgcGFnaW5hdGlvbkhUTUwgPSAnJztcbiAgICBpZiAocGFyYW1zLnR5cGUgPT09ICdidWxsZXRzJykge1xuICAgICAgdmFyIG51bWJlck9mQnVsbGV0cyA9IHN3aXBlci5wYXJhbXMubG9vcCA/IE1hdGguY2VpbCgoc2xpZGVzTGVuZ3RoIC0gKHN3aXBlci5sb29wZWRTbGlkZXMgKiAyKSkgLyBzd2lwZXIucGFyYW1zLnNsaWRlc1Blckdyb3VwKSA6IHN3aXBlci5zbmFwR3JpZC5sZW5ndGg7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG51bWJlck9mQnVsbGV0czsgaSArPSAxKSB7XG4gICAgICAgIGlmIChwYXJhbXMucmVuZGVyQnVsbGV0KSB7XG4gICAgICAgICAgcGFnaW5hdGlvbkhUTUwgKz0gcGFyYW1zLnJlbmRlckJ1bGxldC5jYWxsKHN3aXBlciwgaSwgcGFyYW1zLmJ1bGxldENsYXNzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwYWdpbmF0aW9uSFRNTCArPSBcIjxcIiArIChwYXJhbXMuYnVsbGV0RWxlbWVudCkgKyBcIiBjbGFzcz1cXFwiXCIgKyAocGFyYW1zLmJ1bGxldENsYXNzKSArIFwiXFxcIj48L1wiICsgKHBhcmFtcy5idWxsZXRFbGVtZW50KSArIFwiPlwiO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAkZWwuaHRtbChwYWdpbmF0aW9uSFRNTCk7XG4gICAgICBzd2lwZXIucGFnaW5hdGlvbi5idWxsZXRzID0gJGVsLmZpbmQoKFwiLlwiICsgKHBhcmFtcy5idWxsZXRDbGFzcykpKTtcbiAgICB9XG4gICAgaWYgKHBhcmFtcy50eXBlID09PSAnZnJhY3Rpb24nKSB7XG4gICAgICBpZiAocGFyYW1zLnJlbmRlckZyYWN0aW9uKSB7XG4gICAgICAgIHBhZ2luYXRpb25IVE1MID0gcGFyYW1zLnJlbmRlckZyYWN0aW9uLmNhbGwoc3dpcGVyLCBwYXJhbXMuY3VycmVudENsYXNzLCBwYXJhbXMudG90YWxDbGFzcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYWdpbmF0aW9uSFRNTCA9XG4gICAgICAgIFwiPHNwYW4gY2xhc3M9XFxcIlwiICsgKHBhcmFtcy5jdXJyZW50Q2xhc3MpICsgXCJcXFwiPjwvc3Bhbj5cIiArXG4gICAgICAgICcgLyAnICtcbiAgICAgICAgXCI8c3BhbiBjbGFzcz1cXFwiXCIgKyAocGFyYW1zLnRvdGFsQ2xhc3MpICsgXCJcXFwiPjwvc3Bhbj5cIjtcbiAgICAgIH1cbiAgICAgICRlbC5odG1sKHBhZ2luYXRpb25IVE1MKTtcbiAgICB9XG4gICAgaWYgKHBhcmFtcy50eXBlID09PSAncHJvZ3Jlc3NiYXInKSB7XG4gICAgICBpZiAocGFyYW1zLnJlbmRlclByb2dyZXNzYmFyKSB7XG4gICAgICAgIHBhZ2luYXRpb25IVE1MID0gcGFyYW1zLnJlbmRlclByb2dyZXNzYmFyLmNhbGwoc3dpcGVyLCBwYXJhbXMucHJvZ3Jlc3NiYXJGaWxsQ2xhc3MpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFnaW5hdGlvbkhUTUwgPSBcIjxzcGFuIGNsYXNzPVxcXCJcIiArIChwYXJhbXMucHJvZ3Jlc3NiYXJGaWxsQ2xhc3MpICsgXCJcXFwiPjwvc3Bhbj5cIjtcbiAgICAgIH1cbiAgICAgICRlbC5odG1sKHBhZ2luYXRpb25IVE1MKTtcbiAgICB9XG4gICAgaWYgKHBhcmFtcy50eXBlICE9PSAnY3VzdG9tJykge1xuICAgICAgc3dpcGVyLmVtaXQoJ3BhZ2luYXRpb25SZW5kZXInLCBzd2lwZXIucGFnaW5hdGlvbi4kZWxbMF0pO1xuICAgIH1cbiAgfSxcbiAgaW5pdDogZnVuY3Rpb24gaW5pdCgpIHtcbiAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICB2YXIgcGFyYW1zID0gc3dpcGVyLnBhcmFtcy5wYWdpbmF0aW9uO1xuICAgIGlmICghcGFyYW1zLmVsKSB7IHJldHVybjsgfVxuXG4gICAgdmFyICRlbCA9ICQkMShwYXJhbXMuZWwpO1xuICAgIGlmICgkZWwubGVuZ3RoID09PSAwKSB7IHJldHVybjsgfVxuXG4gICAgaWYgKFxuICAgICAgc3dpcGVyLnBhcmFtcy51bmlxdWVOYXZFbGVtZW50cyAmJlxuICAgICAgdHlwZW9mIHBhcmFtcy5lbCA9PT0gJ3N0cmluZycgJiZcbiAgICAgICRlbC5sZW5ndGggPiAxICYmXG4gICAgICBzd2lwZXIuJGVsLmZpbmQocGFyYW1zLmVsKS5sZW5ndGggPT09IDFcbiAgICApIHtcbiAgICAgICRlbCA9IHN3aXBlci4kZWwuZmluZChwYXJhbXMuZWwpO1xuICAgIH1cblxuICAgIGlmIChwYXJhbXMudHlwZSA9PT0gJ2J1bGxldHMnICYmIHBhcmFtcy5jbGlja2FibGUpIHtcbiAgICAgICRlbC5hZGRDbGFzcyhwYXJhbXMuY2xpY2thYmxlQ2xhc3MpO1xuICAgIH1cblxuICAgICRlbC5hZGRDbGFzcyhwYXJhbXMubW9kaWZpZXJDbGFzcyArIHBhcmFtcy50eXBlKTtcblxuICAgIGlmIChwYXJhbXMudHlwZSA9PT0gJ2J1bGxldHMnICYmIHBhcmFtcy5keW5hbWljQnVsbGV0cykge1xuICAgICAgJGVsLmFkZENsYXNzKChcIlwiICsgKHBhcmFtcy5tb2RpZmllckNsYXNzKSArIChwYXJhbXMudHlwZSkgKyBcIi1keW5hbWljXCIpKTtcbiAgICB9XG5cbiAgICBpZiAocGFyYW1zLmNsaWNrYWJsZSkge1xuICAgICAgJGVsLm9uKCdjbGljaycsIChcIi5cIiArIChwYXJhbXMuYnVsbGV0Q2xhc3MpKSwgZnVuY3Rpb24gb25DbGljayhlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdmFyIGluZGV4ID0gJCQxKHRoaXMpLmluZGV4KCkgKiBzd2lwZXIucGFyYW1zLnNsaWRlc1Blckdyb3VwO1xuICAgICAgICBpZiAoc3dpcGVyLnBhcmFtcy5sb29wKSB7IGluZGV4ICs9IHN3aXBlci5sb29wZWRTbGlkZXM7IH1cbiAgICAgICAgc3dpcGVyLnNsaWRlVG8oaW5kZXgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgVXRpbHMuZXh0ZW5kKHN3aXBlci5wYWdpbmF0aW9uLCB7XG4gICAgICAkZWw6ICRlbCxcbiAgICAgIGVsOiAkZWxbMF0sXG4gICAgfSk7XG4gIH0sXG4gIGRlc3Ryb3k6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgdmFyIHBhcmFtcyA9IHN3aXBlci5wYXJhbXMucGFnaW5hdGlvbjtcbiAgICBpZiAoIXBhcmFtcy5lbCB8fCAhc3dpcGVyLnBhZ2luYXRpb24uZWwgfHwgIXN3aXBlci5wYWdpbmF0aW9uLiRlbCB8fCBzd2lwZXIucGFnaW5hdGlvbi4kZWwubGVuZ3RoID09PSAwKSB7IHJldHVybjsgfVxuICAgIHZhciAkZWwgPSBzd2lwZXIucGFnaW5hdGlvbi4kZWw7XG5cbiAgICAkZWwucmVtb3ZlQ2xhc3MocGFyYW1zLmhpZGRlbkNsYXNzKTtcbiAgICAkZWwucmVtb3ZlQ2xhc3MocGFyYW1zLm1vZGlmaWVyQ2xhc3MgKyBwYXJhbXMudHlwZSk7XG4gICAgaWYgKHN3aXBlci5wYWdpbmF0aW9uLmJ1bGxldHMpIHsgc3dpcGVyLnBhZ2luYXRpb24uYnVsbGV0cy5yZW1vdmVDbGFzcyhwYXJhbXMuYnVsbGV0QWN0aXZlQ2xhc3MpOyB9XG4gICAgaWYgKHBhcmFtcy5jbGlja2FibGUpIHtcbiAgICAgICRlbC5vZmYoJ2NsaWNrJywgKFwiLlwiICsgKHBhcmFtcy5idWxsZXRDbGFzcykpKTtcbiAgICB9XG4gIH0sXG59O1xuXG52YXIgUGFnaW5hdGlvbiQxID0ge1xuICBuYW1lOiAncGFnaW5hdGlvbicsXG4gIHBhcmFtczoge1xuICAgIHBhZ2luYXRpb246IHtcbiAgICAgIGVsOiBudWxsLFxuICAgICAgYnVsbGV0RWxlbWVudDogJ3NwYW4nLFxuICAgICAgY2xpY2thYmxlOiBmYWxzZSxcbiAgICAgIGhpZGVPbkNsaWNrOiBmYWxzZSxcbiAgICAgIHJlbmRlckJ1bGxldDogbnVsbCxcbiAgICAgIHJlbmRlclByb2dyZXNzYmFyOiBudWxsLFxuICAgICAgcmVuZGVyRnJhY3Rpb246IG51bGwsXG4gICAgICByZW5kZXJDdXN0b206IG51bGwsXG4gICAgICB0eXBlOiAnYnVsbGV0cycsIC8vICdidWxsZXRzJyBvciAncHJvZ3Jlc3NiYXInIG9yICdmcmFjdGlvbicgb3IgJ2N1c3RvbSdcbiAgICAgIGR5bmFtaWNCdWxsZXRzOiBmYWxzZSxcblxuICAgICAgYnVsbGV0Q2xhc3M6ICdzd2lwZXItcGFnaW5hdGlvbi1idWxsZXQnLFxuICAgICAgYnVsbGV0QWN0aXZlQ2xhc3M6ICdzd2lwZXItcGFnaW5hdGlvbi1idWxsZXQtYWN0aXZlJyxcbiAgICAgIG1vZGlmaWVyQ2xhc3M6ICdzd2lwZXItcGFnaW5hdGlvbi0nLCAvLyBORVdcbiAgICAgIGN1cnJlbnRDbGFzczogJ3N3aXBlci1wYWdpbmF0aW9uLWN1cnJlbnQnLFxuICAgICAgdG90YWxDbGFzczogJ3N3aXBlci1wYWdpbmF0aW9uLXRvdGFsJyxcbiAgICAgIGhpZGRlbkNsYXNzOiAnc3dpcGVyLXBhZ2luYXRpb24taGlkZGVuJyxcbiAgICAgIHByb2dyZXNzYmFyRmlsbENsYXNzOiAnc3dpcGVyLXBhZ2luYXRpb24tcHJvZ3Jlc3NiYXItZmlsbCcsXG4gICAgICBjbGlja2FibGVDbGFzczogJ3N3aXBlci1wYWdpbmF0aW9uLWNsaWNrYWJsZScsIC8vIE5FV1xuICAgIH0sXG4gIH0sXG4gIGNyZWF0ZTogZnVuY3Rpb24gY3JlYXRlKCkge1xuICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgIFV0aWxzLmV4dGVuZChzd2lwZXIsIHtcbiAgICAgIHBhZ2luYXRpb246IHtcbiAgICAgICAgaW5pdDogUGFnaW5hdGlvbi5pbml0LmJpbmQoc3dpcGVyKSxcbiAgICAgICAgcmVuZGVyOiBQYWdpbmF0aW9uLnJlbmRlci5iaW5kKHN3aXBlciksXG4gICAgICAgIHVwZGF0ZTogUGFnaW5hdGlvbi51cGRhdGUuYmluZChzd2lwZXIpLFxuICAgICAgICBkZXN0cm95OiBQYWdpbmF0aW9uLmRlc3Ryb3kuYmluZChzd2lwZXIpLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfSxcbiAgb246IHtcbiAgICBpbml0OiBmdW5jdGlvbiBpbml0KCkge1xuICAgICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgICBzd2lwZXIucGFnaW5hdGlvbi5pbml0KCk7XG4gICAgICBzd2lwZXIucGFnaW5hdGlvbi5yZW5kZXIoKTtcbiAgICAgIHN3aXBlci5wYWdpbmF0aW9uLnVwZGF0ZSgpO1xuICAgIH0sXG4gICAgYWN0aXZlSW5kZXhDaGFuZ2U6IGZ1bmN0aW9uIGFjdGl2ZUluZGV4Q2hhbmdlKCkge1xuICAgICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgICBpZiAoc3dpcGVyLnBhcmFtcy5sb29wKSB7XG4gICAgICAgIHN3aXBlci5wYWdpbmF0aW9uLnVwZGF0ZSgpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygc3dpcGVyLnNuYXBJbmRleCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgc3dpcGVyLnBhZ2luYXRpb24udXBkYXRlKCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBzbmFwSW5kZXhDaGFuZ2U6IGZ1bmN0aW9uIHNuYXBJbmRleENoYW5nZSgpIHtcbiAgICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgICAgaWYgKCFzd2lwZXIucGFyYW1zLmxvb3ApIHtcbiAgICAgICAgc3dpcGVyLnBhZ2luYXRpb24udXBkYXRlKCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBzbGlkZXNMZW5ndGhDaGFuZ2U6IGZ1bmN0aW9uIHNsaWRlc0xlbmd0aENoYW5nZSgpIHtcbiAgICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgICAgaWYgKHN3aXBlci5wYXJhbXMubG9vcCkge1xuICAgICAgICBzd2lwZXIucGFnaW5hdGlvbi5yZW5kZXIoKTtcbiAgICAgICAgc3dpcGVyLnBhZ2luYXRpb24udXBkYXRlKCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBzbmFwR3JpZExlbmd0aENoYW5nZTogZnVuY3Rpb24gc25hcEdyaWRMZW5ndGhDaGFuZ2UoKSB7XG4gICAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICAgIGlmICghc3dpcGVyLnBhcmFtcy5sb29wKSB7XG4gICAgICAgIHN3aXBlci5wYWdpbmF0aW9uLnJlbmRlcigpO1xuICAgICAgICBzd2lwZXIucGFnaW5hdGlvbi51cGRhdGUoKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGRlc3Ryb3k6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICAgIHN3aXBlci5wYWdpbmF0aW9uLmRlc3Ryb3koKTtcbiAgICB9LFxuICAgIGNsaWNrOiBmdW5jdGlvbiBjbGljayhlKSB7XG4gICAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICAgIGlmIChcbiAgICAgICAgc3dpcGVyLnBhcmFtcy5wYWdpbmF0aW9uLmVsICYmXG4gICAgICAgIHN3aXBlci5wYXJhbXMucGFnaW5hdGlvbi5oaWRlT25DbGljayAmJlxuICAgICAgICBzd2lwZXIucGFnaW5hdGlvbi4kZWwubGVuZ3RoID4gMCAmJlxuICAgICAgICAhJCQxKGUudGFyZ2V0KS5oYXNDbGFzcyhzd2lwZXIucGFyYW1zLnBhZ2luYXRpb24uYnVsbGV0Q2xhc3MpXG4gICAgICApIHtcbiAgICAgICAgc3dpcGVyLnBhZ2luYXRpb24uJGVsLnRvZ2dsZUNsYXNzKHN3aXBlci5wYXJhbXMucGFnaW5hdGlvbi5oaWRkZW5DbGFzcyk7XG4gICAgICB9XG4gICAgfSxcbiAgfSxcbn07XG5cbnZhciBTY3JvbGxiYXIgPSB7XG4gIHNldFRyYW5zbGF0ZTogZnVuY3Rpb24gc2V0VHJhbnNsYXRlKCkge1xuICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgIGlmICghc3dpcGVyLnBhcmFtcy5zY3JvbGxiYXIuZWwgfHwgIXN3aXBlci5zY3JvbGxiYXIuZWwpIHsgcmV0dXJuOyB9XG4gICAgdmFyIHNjcm9sbGJhciA9IHN3aXBlci5zY3JvbGxiYXI7XG4gICAgdmFyIHJ0bCA9IHN3aXBlci5ydGw7XG4gICAgdmFyIHByb2dyZXNzID0gc3dpcGVyLnByb2dyZXNzO1xuICAgIHZhciBkcmFnU2l6ZSA9IHNjcm9sbGJhci5kcmFnU2l6ZTtcbiAgICB2YXIgdHJhY2tTaXplID0gc2Nyb2xsYmFyLnRyYWNrU2l6ZTtcbiAgICB2YXIgJGRyYWdFbCA9IHNjcm9sbGJhci4kZHJhZ0VsO1xuICAgIHZhciAkZWwgPSBzY3JvbGxiYXIuJGVsO1xuICAgIHZhciBwYXJhbXMgPSBzd2lwZXIucGFyYW1zLnNjcm9sbGJhcjtcblxuICAgIHZhciBuZXdTaXplID0gZHJhZ1NpemU7XG4gICAgdmFyIG5ld1BvcyA9ICh0cmFja1NpemUgLSBkcmFnU2l6ZSkgKiBwcm9ncmVzcztcbiAgICBpZiAocnRsICYmIHN3aXBlci5pc0hvcml6b250YWwoKSkge1xuICAgICAgbmV3UG9zID0gLW5ld1BvcztcbiAgICAgIGlmIChuZXdQb3MgPiAwKSB7XG4gICAgICAgIG5ld1NpemUgPSBkcmFnU2l6ZSAtIG5ld1BvcztcbiAgICAgICAgbmV3UG9zID0gMDtcbiAgICAgIH0gZWxzZSBpZiAoLW5ld1BvcyArIGRyYWdTaXplID4gdHJhY2tTaXplKSB7XG4gICAgICAgIG5ld1NpemUgPSB0cmFja1NpemUgKyBuZXdQb3M7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChuZXdQb3MgPCAwKSB7XG4gICAgICBuZXdTaXplID0gZHJhZ1NpemUgKyBuZXdQb3M7XG4gICAgICBuZXdQb3MgPSAwO1xuICAgIH0gZWxzZSBpZiAobmV3UG9zICsgZHJhZ1NpemUgPiB0cmFja1NpemUpIHtcbiAgICAgIG5ld1NpemUgPSB0cmFja1NpemUgLSBuZXdQb3M7XG4gICAgfVxuICAgIGlmIChzd2lwZXIuaXNIb3Jpem9udGFsKCkpIHtcbiAgICAgIGlmIChTdXBwb3J0LnRyYW5zZm9ybXMzZCkge1xuICAgICAgICAkZHJhZ0VsLnRyYW5zZm9ybSgoXCJ0cmFuc2xhdGUzZChcIiArIG5ld1BvcyArIFwicHgsIDAsIDApXCIpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICRkcmFnRWwudHJhbnNmb3JtKChcInRyYW5zbGF0ZVgoXCIgKyBuZXdQb3MgKyBcInB4KVwiKSk7XG4gICAgICB9XG4gICAgICAkZHJhZ0VsWzBdLnN0eWxlLndpZHRoID0gbmV3U2l6ZSArIFwicHhcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKFN1cHBvcnQudHJhbnNmb3JtczNkKSB7XG4gICAgICAgICRkcmFnRWwudHJhbnNmb3JtKChcInRyYW5zbGF0ZTNkKDBweCwgXCIgKyBuZXdQb3MgKyBcInB4LCAwKVwiKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkZHJhZ0VsLnRyYW5zZm9ybSgoXCJ0cmFuc2xhdGVZKFwiICsgbmV3UG9zICsgXCJweClcIikpO1xuICAgICAgfVxuICAgICAgJGRyYWdFbFswXS5zdHlsZS5oZWlnaHQgPSBuZXdTaXplICsgXCJweFwiO1xuICAgIH1cbiAgICBpZiAocGFyYW1zLmhpZGUpIHtcbiAgICAgIGNsZWFyVGltZW91dChzd2lwZXIuc2Nyb2xsYmFyLnRpbWVvdXQpO1xuICAgICAgJGVsWzBdLnN0eWxlLm9wYWNpdHkgPSAxO1xuICAgICAgc3dpcGVyLnNjcm9sbGJhci50aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICRlbFswXS5zdHlsZS5vcGFjaXR5ID0gMDtcbiAgICAgICAgJGVsLnRyYW5zaXRpb24oNDAwKTtcbiAgICAgIH0sIDEwMDApO1xuICAgIH1cbiAgfSxcbiAgc2V0VHJhbnNpdGlvbjogZnVuY3Rpb24gc2V0VHJhbnNpdGlvbihkdXJhdGlvbikge1xuICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgIGlmICghc3dpcGVyLnBhcmFtcy5zY3JvbGxiYXIuZWwgfHwgIXN3aXBlci5zY3JvbGxiYXIuZWwpIHsgcmV0dXJuOyB9XG4gICAgc3dpcGVyLnNjcm9sbGJhci4kZHJhZ0VsLnRyYW5zaXRpb24oZHVyYXRpb24pO1xuICB9LFxuICB1cGRhdGVTaXplOiBmdW5jdGlvbiB1cGRhdGVTaXplKCkge1xuICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgIGlmICghc3dpcGVyLnBhcmFtcy5zY3JvbGxiYXIuZWwgfHwgIXN3aXBlci5zY3JvbGxiYXIuZWwpIHsgcmV0dXJuOyB9XG5cbiAgICB2YXIgc2Nyb2xsYmFyID0gc3dpcGVyLnNjcm9sbGJhcjtcbiAgICB2YXIgJGRyYWdFbCA9IHNjcm9sbGJhci4kZHJhZ0VsO1xuICAgIHZhciAkZWwgPSBzY3JvbGxiYXIuJGVsO1xuXG4gICAgJGRyYWdFbFswXS5zdHlsZS53aWR0aCA9ICcnO1xuICAgICRkcmFnRWxbMF0uc3R5bGUuaGVpZ2h0ID0gJyc7XG4gICAgdmFyIHRyYWNrU2l6ZSA9IHN3aXBlci5pc0hvcml6b250YWwoKSA/ICRlbFswXS5vZmZzZXRXaWR0aCA6ICRlbFswXS5vZmZzZXRIZWlnaHQ7XG5cbiAgICB2YXIgZGl2aWRlciA9IHN3aXBlci5zaXplIC8gc3dpcGVyLnZpcnR1YWxTaXplO1xuICAgIHZhciBtb3ZlRGl2aWRlciA9IGRpdmlkZXIgKiAodHJhY2tTaXplIC8gc3dpcGVyLnNpemUpO1xuICAgIHZhciBkcmFnU2l6ZTtcbiAgICBpZiAoc3dpcGVyLnBhcmFtcy5zY3JvbGxiYXIuZHJhZ1NpemUgPT09ICdhdXRvJykge1xuICAgICAgZHJhZ1NpemUgPSB0cmFja1NpemUgKiBkaXZpZGVyO1xuICAgIH0gZWxzZSB7XG4gICAgICBkcmFnU2l6ZSA9IHBhcnNlSW50KHN3aXBlci5wYXJhbXMuc2Nyb2xsYmFyLmRyYWdTaXplLCAxMCk7XG4gICAgfVxuXG4gICAgaWYgKHN3aXBlci5pc0hvcml6b250YWwoKSkge1xuICAgICAgJGRyYWdFbFswXS5zdHlsZS53aWR0aCA9IGRyYWdTaXplICsgXCJweFwiO1xuICAgIH0gZWxzZSB7XG4gICAgICAkZHJhZ0VsWzBdLnN0eWxlLmhlaWdodCA9IGRyYWdTaXplICsgXCJweFwiO1xuICAgIH1cblxuICAgIGlmIChkaXZpZGVyID49IDEpIHtcbiAgICAgICRlbFswXS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIH0gZWxzZSB7XG4gICAgICAkZWxbMF0uc3R5bGUuZGlzcGxheSA9ICcnO1xuICAgIH1cbiAgICBpZiAoc3dpcGVyLnBhcmFtcy5zY3JvbGxiYXJIaWRlKSB7XG4gICAgICAkZWxbMF0uc3R5bGUub3BhY2l0eSA9IDA7XG4gICAgfVxuICAgIFV0aWxzLmV4dGVuZChzY3JvbGxiYXIsIHtcbiAgICAgIHRyYWNrU2l6ZTogdHJhY2tTaXplLFxuICAgICAgZGl2aWRlcjogZGl2aWRlcixcbiAgICAgIG1vdmVEaXZpZGVyOiBtb3ZlRGl2aWRlcixcbiAgICAgIGRyYWdTaXplOiBkcmFnU2l6ZSxcbiAgICB9KTtcbiAgfSxcbiAgc2V0RHJhZ1Bvc2l0aW9uOiBmdW5jdGlvbiBzZXREcmFnUG9zaXRpb24oZSkge1xuICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgIHZhciBzY3JvbGxiYXIgPSBzd2lwZXIuc2Nyb2xsYmFyO1xuICAgIHZhciAkZWwgPSBzY3JvbGxiYXIuJGVsO1xuICAgIHZhciBkcmFnU2l6ZSA9IHNjcm9sbGJhci5kcmFnU2l6ZTtcbiAgICB2YXIgdHJhY2tTaXplID0gc2Nyb2xsYmFyLnRyYWNrU2l6ZTtcblxuICAgIHZhciBwb2ludGVyUG9zaXRpb247XG4gICAgaWYgKHN3aXBlci5pc0hvcml6b250YWwoKSkge1xuICAgICAgcG9pbnRlclBvc2l0aW9uID0gKChlLnR5cGUgPT09ICd0b3VjaHN0YXJ0JyB8fCBlLnR5cGUgPT09ICd0b3VjaG1vdmUnKSA/IGUudGFyZ2V0VG91Y2hlc1swXS5wYWdlWCA6IGUucGFnZVggfHwgZS5jbGllbnRYKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcG9pbnRlclBvc2l0aW9uID0gKChlLnR5cGUgPT09ICd0b3VjaHN0YXJ0JyB8fCBlLnR5cGUgPT09ICd0b3VjaG1vdmUnKSA/IGUudGFyZ2V0VG91Y2hlc1swXS5wYWdlWSA6IGUucGFnZVkgfHwgZS5jbGllbnRZKTtcbiAgICB9XG4gICAgdmFyIHBvc2l0aW9uUmF0aW87XG4gICAgcG9zaXRpb25SYXRpbyA9ICgocG9pbnRlclBvc2l0aW9uKSAtICRlbC5vZmZzZXQoKVtzd2lwZXIuaXNIb3Jpem9udGFsKCkgPyAnbGVmdCcgOiAndG9wJ10gLSAoZHJhZ1NpemUgLyAyKSkgLyAodHJhY2tTaXplIC0gZHJhZ1NpemUpO1xuICAgIHBvc2l0aW9uUmF0aW8gPSBNYXRoLm1heChNYXRoLm1pbihwb3NpdGlvblJhdGlvLCAxKSwgMCk7XG4gICAgaWYgKHN3aXBlci5ydGwpIHtcbiAgICAgIHBvc2l0aW9uUmF0aW8gPSAxIC0gcG9zaXRpb25SYXRpbztcbiAgICB9XG5cbiAgICB2YXIgcG9zaXRpb24gPSBzd2lwZXIubWluVHJhbnNsYXRlKCkgKyAoKHN3aXBlci5tYXhUcmFuc2xhdGUoKSAtIHN3aXBlci5taW5UcmFuc2xhdGUoKSkgKiBwb3NpdGlvblJhdGlvKTtcblxuICAgIHN3aXBlci51cGRhdGVQcm9ncmVzcyhwb3NpdGlvbik7XG4gICAgc3dpcGVyLnNldFRyYW5zbGF0ZShwb3NpdGlvbik7XG4gICAgc3dpcGVyLnVwZGF0ZUFjdGl2ZUluZGV4KCk7XG4gICAgc3dpcGVyLnVwZGF0ZVNsaWRlc0NsYXNzZXMoKTtcbiAgfSxcbiAgb25EcmFnU3RhcnQ6IGZ1bmN0aW9uIG9uRHJhZ1N0YXJ0KGUpIHtcbiAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICB2YXIgcGFyYW1zID0gc3dpcGVyLnBhcmFtcy5zY3JvbGxiYXI7XG4gICAgdmFyIHNjcm9sbGJhciA9IHN3aXBlci5zY3JvbGxiYXI7XG4gICAgdmFyICR3cmFwcGVyRWwgPSBzd2lwZXIuJHdyYXBwZXJFbDtcbiAgICB2YXIgJGVsID0gc2Nyb2xsYmFyLiRlbDtcbiAgICB2YXIgJGRyYWdFbCA9IHNjcm9sbGJhci4kZHJhZ0VsO1xuICAgIHN3aXBlci5zY3JvbGxiYXIuaXNUb3VjaGVkID0gdHJ1ZTtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICR3cmFwcGVyRWwudHJhbnNpdGlvbigxMDApO1xuICAgICRkcmFnRWwudHJhbnNpdGlvbigxMDApO1xuICAgIHNjcm9sbGJhci5zZXREcmFnUG9zaXRpb24oZSk7XG5cbiAgICBjbGVhclRpbWVvdXQoc3dpcGVyLnNjcm9sbGJhci5kcmFnVGltZW91dCk7XG5cbiAgICAkZWwudHJhbnNpdGlvbigwKTtcbiAgICBpZiAocGFyYW1zLmhpZGUpIHtcbiAgICAgICRlbC5jc3MoJ29wYWNpdHknLCAxKTtcbiAgICB9XG4gICAgc3dpcGVyLmVtaXQoJ3Njcm9sbGJhckRyYWdTdGFydCcsIGUpO1xuICB9LFxuICBvbkRyYWdNb3ZlOiBmdW5jdGlvbiBvbkRyYWdNb3ZlKGUpIHtcbiAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICB2YXIgc2Nyb2xsYmFyID0gc3dpcGVyLnNjcm9sbGJhcjtcbiAgICB2YXIgJHdyYXBwZXJFbCA9IHN3aXBlci4kd3JhcHBlckVsO1xuICAgIHZhciAkZWwgPSBzY3JvbGxiYXIuJGVsO1xuICAgIHZhciAkZHJhZ0VsID0gc2Nyb2xsYmFyLiRkcmFnRWw7XG5cbiAgICBpZiAoIXN3aXBlci5zY3JvbGxiYXIuaXNUb3VjaGVkKSB7IHJldHVybjsgfVxuICAgIGlmIChlLnByZXZlbnREZWZhdWx0KSB7IGUucHJldmVudERlZmF1bHQoKTsgfVxuICAgIGVsc2UgeyBlLnJldHVyblZhbHVlID0gZmFsc2U7IH1cbiAgICBzY3JvbGxiYXIuc2V0RHJhZ1Bvc2l0aW9uKGUpO1xuICAgICR3cmFwcGVyRWwudHJhbnNpdGlvbigwKTtcbiAgICAkZWwudHJhbnNpdGlvbigwKTtcbiAgICAkZHJhZ0VsLnRyYW5zaXRpb24oMCk7XG4gICAgc3dpcGVyLmVtaXQoJ3Njcm9sbGJhckRyYWdNb3ZlJywgZSk7XG4gIH0sXG4gIG9uRHJhZ0VuZDogZnVuY3Rpb24gb25EcmFnRW5kKGUpIHtcbiAgICB2YXIgc3dpcGVyID0gdGhpcztcblxuICAgIHZhciBwYXJhbXMgPSBzd2lwZXIucGFyYW1zLnNjcm9sbGJhcjtcbiAgICB2YXIgc2Nyb2xsYmFyID0gc3dpcGVyLnNjcm9sbGJhcjtcbiAgICB2YXIgJGVsID0gc2Nyb2xsYmFyLiRlbDtcblxuICAgIGlmICghc3dpcGVyLnNjcm9sbGJhci5pc1RvdWNoZWQpIHsgcmV0dXJuOyB9XG4gICAgc3dpcGVyLnNjcm9sbGJhci5pc1RvdWNoZWQgPSBmYWxzZTtcbiAgICBpZiAocGFyYW1zLmhpZGUpIHtcbiAgICAgIGNsZWFyVGltZW91dChzd2lwZXIuc2Nyb2xsYmFyLmRyYWdUaW1lb3V0KTtcbiAgICAgIHN3aXBlci5zY3JvbGxiYXIuZHJhZ1RpbWVvdXQgPSBVdGlscy5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICRlbC5jc3MoJ29wYWNpdHknLCAwKTtcbiAgICAgICAgJGVsLnRyYW5zaXRpb24oNDAwKTtcbiAgICAgIH0sIDEwMDApO1xuICAgIH1cbiAgICBzd2lwZXIuZW1pdCgnc2Nyb2xsYmFyRHJhZ0VuZCcsIGUpO1xuICAgIGlmIChwYXJhbXMuc25hcE9uUmVsZWFzZSkge1xuICAgICAgc3dpcGVyLnNsaWRlUmVzZXQoKTtcbiAgICB9XG4gIH0sXG4gIGVuYWJsZURyYWdnYWJsZTogZnVuY3Rpb24gZW5hYmxlRHJhZ2dhYmxlKCkge1xuICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgIGlmICghc3dpcGVyLnBhcmFtcy5zY3JvbGxiYXIuZWwpIHsgcmV0dXJuOyB9XG4gICAgdmFyIHNjcm9sbGJhciA9IHN3aXBlci5zY3JvbGxiYXI7XG4gICAgdmFyICRlbCA9IHNjcm9sbGJhci4kZWw7XG4gICAgdmFyIHRhcmdldCA9IFN1cHBvcnQudG91Y2ggPyAkZWxbMF0gOiBkb2N1bWVudDtcbiAgICAkZWwub24oc3dpcGVyLnNjcm9sbGJhci5kcmFnRXZlbnRzLnN0YXJ0LCBzd2lwZXIuc2Nyb2xsYmFyLm9uRHJhZ1N0YXJ0KTtcbiAgICAkJDEodGFyZ2V0KS5vbihzd2lwZXIuc2Nyb2xsYmFyLmRyYWdFdmVudHMubW92ZSwgc3dpcGVyLnNjcm9sbGJhci5vbkRyYWdNb3ZlKTtcbiAgICAkJDEodGFyZ2V0KS5vbihzd2lwZXIuc2Nyb2xsYmFyLmRyYWdFdmVudHMuZW5kLCBzd2lwZXIuc2Nyb2xsYmFyLm9uRHJhZ0VuZCk7XG4gIH0sXG4gIGRpc2FibGVEcmFnZ2FibGU6IGZ1bmN0aW9uIGRpc2FibGVEcmFnZ2FibGUoKSB7XG4gICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgaWYgKCFzd2lwZXIucGFyYW1zLnNjcm9sbGJhci5lbCkgeyByZXR1cm47IH1cbiAgICB2YXIgc2Nyb2xsYmFyID0gc3dpcGVyLnNjcm9sbGJhcjtcbiAgICB2YXIgJGVsID0gc2Nyb2xsYmFyLiRlbDtcbiAgICB2YXIgdGFyZ2V0ID0gU3VwcG9ydC50b3VjaCA/ICRlbFswXSA6IGRvY3VtZW50O1xuICAgICRlbC5vZmYoc3dpcGVyLnNjcm9sbGJhci5kcmFnRXZlbnRzLnN0YXJ0KTtcbiAgICAkJDEodGFyZ2V0KS5vZmYoc3dpcGVyLnNjcm9sbGJhci5kcmFnRXZlbnRzLm1vdmUpO1xuICAgICQkMSh0YXJnZXQpLm9mZihzd2lwZXIuc2Nyb2xsYmFyLmRyYWdFdmVudHMuZW5kKTtcbiAgfSxcbiAgaW5pdDogZnVuY3Rpb24gaW5pdCgpIHtcbiAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICBpZiAoIXN3aXBlci5wYXJhbXMuc2Nyb2xsYmFyLmVsKSB7IHJldHVybjsgfVxuICAgIHZhciBzY3JvbGxiYXIgPSBzd2lwZXIuc2Nyb2xsYmFyO1xuICAgIHZhciAkc3dpcGVyRWwgPSBzd2lwZXIuJGVsO1xuICAgIHZhciB0b3VjaEV2ZW50cyA9IHN3aXBlci50b3VjaEV2ZW50cztcbiAgICB2YXIgcGFyYW1zID0gc3dpcGVyLnBhcmFtcy5zY3JvbGxiYXI7XG5cbiAgICB2YXIgJGVsID0gJCQxKHBhcmFtcy5lbCk7XG4gICAgaWYgKHN3aXBlci5wYXJhbXMudW5pcXVlTmF2RWxlbWVudHMgJiYgdHlwZW9mIHBhcmFtcy5lbCA9PT0gJ3N0cmluZycgJiYgJGVsLmxlbmd0aCA+IDEgJiYgJHN3aXBlckVsLmZpbmQocGFyYW1zLmVsKS5sZW5ndGggPT09IDEpIHtcbiAgICAgICRlbCA9ICRzd2lwZXJFbC5maW5kKHBhcmFtcy5lbCk7XG4gICAgfVxuXG4gICAgdmFyICRkcmFnRWwgPSAkZWwuZmluZCgnLnN3aXBlci1zY3JvbGxiYXItZHJhZycpO1xuICAgIGlmICgkZHJhZ0VsLmxlbmd0aCA9PT0gMCkge1xuICAgICAgJGRyYWdFbCA9ICQkMSgnPGRpdiBjbGFzcz1cInN3aXBlci1zY3JvbGxiYXItZHJhZ1wiPjwvZGl2PicpO1xuICAgICAgJGVsLmFwcGVuZCgkZHJhZ0VsKTtcbiAgICB9XG5cbiAgICBzd2lwZXIuc2Nyb2xsYmFyLmRyYWdFdmVudHMgPSAoZnVuY3Rpb24gZHJhZ0V2ZW50cygpIHtcbiAgICAgIGlmICgoc3dpcGVyLnBhcmFtcy5zaW11bGF0ZVRvdWNoID09PSBmYWxzZSAmJiAhU3VwcG9ydC50b3VjaCkpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzdGFydDogJ21vdXNlZG93bicsXG4gICAgICAgICAgbW92ZTogJ21vdXNlbW92ZScsXG4gICAgICAgICAgZW5kOiAnbW91c2V1cCcsXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4gdG91Y2hFdmVudHM7XG4gICAgfSgpKTtcblxuICAgIFV0aWxzLmV4dGVuZChzY3JvbGxiYXIsIHtcbiAgICAgICRlbDogJGVsLFxuICAgICAgZWw6ICRlbFswXSxcbiAgICAgICRkcmFnRWw6ICRkcmFnRWwsXG4gICAgICBkcmFnRWw6ICRkcmFnRWxbMF0sXG4gICAgfSk7XG5cbiAgICBpZiAocGFyYW1zLmRyYWdnYWJsZSkge1xuICAgICAgc2Nyb2xsYmFyLmVuYWJsZURyYWdnYWJsZSgpO1xuICAgIH1cbiAgfSxcbiAgZGVzdHJveTogZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICBzd2lwZXIuc2Nyb2xsYmFyLmRpc2FibGVEcmFnZ2FibGUoKTtcbiAgfSxcbn07XG5cbnZhciBTY3JvbGxiYXIkMSA9IHtcbiAgbmFtZTogJ3Njcm9sbGJhcicsXG4gIHBhcmFtczoge1xuICAgIHNjcm9sbGJhcjoge1xuICAgICAgZWw6IG51bGwsXG4gICAgICBkcmFnU2l6ZTogJ2F1dG8nLFxuICAgICAgaGlkZTogZmFsc2UsXG4gICAgICBkcmFnZ2FibGU6IGZhbHNlLFxuICAgICAgc25hcE9uUmVsZWFzZTogdHJ1ZSxcbiAgICB9LFxuICB9LFxuICBjcmVhdGU6IGZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICBVdGlscy5leHRlbmQoc3dpcGVyLCB7XG4gICAgICBzY3JvbGxiYXI6IHtcbiAgICAgICAgaW5pdDogU2Nyb2xsYmFyLmluaXQuYmluZChzd2lwZXIpLFxuICAgICAgICBkZXN0cm95OiBTY3JvbGxiYXIuZGVzdHJveS5iaW5kKHN3aXBlciksXG4gICAgICAgIHVwZGF0ZVNpemU6IFNjcm9sbGJhci51cGRhdGVTaXplLmJpbmQoc3dpcGVyKSxcbiAgICAgICAgc2V0VHJhbnNsYXRlOiBTY3JvbGxiYXIuc2V0VHJhbnNsYXRlLmJpbmQoc3dpcGVyKSxcbiAgICAgICAgc2V0VHJhbnNpdGlvbjogU2Nyb2xsYmFyLnNldFRyYW5zaXRpb24uYmluZChzd2lwZXIpLFxuICAgICAgICBlbmFibGVEcmFnZ2FibGU6IFNjcm9sbGJhci5lbmFibGVEcmFnZ2FibGUuYmluZChzd2lwZXIpLFxuICAgICAgICBkaXNhYmxlRHJhZ2dhYmxlOiBTY3JvbGxiYXIuZGlzYWJsZURyYWdnYWJsZS5iaW5kKHN3aXBlciksXG4gICAgICAgIHNldERyYWdQb3NpdGlvbjogU2Nyb2xsYmFyLnNldERyYWdQb3NpdGlvbi5iaW5kKHN3aXBlciksXG4gICAgICAgIG9uRHJhZ1N0YXJ0OiBTY3JvbGxiYXIub25EcmFnU3RhcnQuYmluZChzd2lwZXIpLFxuICAgICAgICBvbkRyYWdNb3ZlOiBTY3JvbGxiYXIub25EcmFnTW92ZS5iaW5kKHN3aXBlciksXG4gICAgICAgIG9uRHJhZ0VuZDogU2Nyb2xsYmFyLm9uRHJhZ0VuZC5iaW5kKHN3aXBlciksXG4gICAgICAgIGlzVG91Y2hlZDogZmFsc2UsXG4gICAgICAgIHRpbWVvdXQ6IG51bGwsXG4gICAgICAgIGRyYWdUaW1lb3V0OiBudWxsLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfSxcbiAgb246IHtcbiAgICBpbml0OiBmdW5jdGlvbiBpbml0KCkge1xuICAgICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgICBzd2lwZXIuc2Nyb2xsYmFyLmluaXQoKTtcbiAgICAgIHN3aXBlci5zY3JvbGxiYXIudXBkYXRlU2l6ZSgpO1xuICAgICAgc3dpcGVyLnNjcm9sbGJhci5zZXRUcmFuc2xhdGUoKTtcbiAgICB9LFxuICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgICBzd2lwZXIuc2Nyb2xsYmFyLnVwZGF0ZVNpemUoKTtcbiAgICB9LFxuICAgIHJlc2l6ZTogZnVuY3Rpb24gcmVzaXplKCkge1xuICAgICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgICBzd2lwZXIuc2Nyb2xsYmFyLnVwZGF0ZVNpemUoKTtcbiAgICB9LFxuICAgIG9ic2VydmVyVXBkYXRlOiBmdW5jdGlvbiBvYnNlcnZlclVwZGF0ZSgpIHtcbiAgICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgICAgc3dpcGVyLnNjcm9sbGJhci51cGRhdGVTaXplKCk7XG4gICAgfSxcbiAgICBzZXRUcmFuc2xhdGU6IGZ1bmN0aW9uIHNldFRyYW5zbGF0ZSgpIHtcbiAgICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgICAgc3dpcGVyLnNjcm9sbGJhci5zZXRUcmFuc2xhdGUoKTtcbiAgICB9LFxuICAgIHNldFRyYW5zaXRpb246IGZ1bmN0aW9uIHNldFRyYW5zaXRpb24oZHVyYXRpb24pIHtcbiAgICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgICAgc3dpcGVyLnNjcm9sbGJhci5zZXRUcmFuc2l0aW9uKGR1cmF0aW9uKTtcbiAgICB9LFxuICAgIGRlc3Ryb3k6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICAgIHN3aXBlci5zY3JvbGxiYXIuZGVzdHJveSgpO1xuICAgIH0sXG4gIH0sXG59O1xuXG52YXIgUGFyYWxsYXggPSB7XG4gIHNldFRyYW5zZm9ybTogZnVuY3Rpb24gc2V0VHJhbnNmb3JtKGVsLCBwcm9ncmVzcykge1xuICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgIHZhciBydGwgPSBzd2lwZXIucnRsO1xuXG4gICAgdmFyICRlbCA9ICQkMShlbCk7XG4gICAgdmFyIHJ0bEZhY3RvciA9IHJ0bCA/IC0xIDogMTtcblxuICAgIHZhciBwID0gJGVsLmF0dHIoJ2RhdGEtc3dpcGVyLXBhcmFsbGF4JykgfHwgJzAnO1xuICAgIHZhciB4ID0gJGVsLmF0dHIoJ2RhdGEtc3dpcGVyLXBhcmFsbGF4LXgnKTtcbiAgICB2YXIgeSA9ICRlbC5hdHRyKCdkYXRhLXN3aXBlci1wYXJhbGxheC15Jyk7XG4gICAgdmFyIHNjYWxlID0gJGVsLmF0dHIoJ2RhdGEtc3dpcGVyLXBhcmFsbGF4LXNjYWxlJyk7XG4gICAgdmFyIG9wYWNpdHkgPSAkZWwuYXR0cignZGF0YS1zd2lwZXItcGFyYWxsYXgtb3BhY2l0eScpO1xuXG4gICAgaWYgKHggfHwgeSkge1xuICAgICAgeCA9IHggfHwgJzAnO1xuICAgICAgeSA9IHkgfHwgJzAnO1xuICAgIH0gZWxzZSBpZiAoc3dpcGVyLmlzSG9yaXpvbnRhbCgpKSB7XG4gICAgICB4ID0gcDtcbiAgICAgIHkgPSAnMCc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHkgPSBwO1xuICAgICAgeCA9ICcwJztcbiAgICB9XG5cbiAgICBpZiAoKHgpLmluZGV4T2YoJyUnKSA+PSAwKSB7XG4gICAgICB4ID0gKHBhcnNlSW50KHgsIDEwKSAqIHByb2dyZXNzICogcnRsRmFjdG9yKSArIFwiJVwiO1xuICAgIH0gZWxzZSB7XG4gICAgICB4ID0gKHggKiBwcm9ncmVzcyAqIHJ0bEZhY3RvcikgKyBcInB4XCI7XG4gICAgfVxuICAgIGlmICgoeSkuaW5kZXhPZignJScpID49IDApIHtcbiAgICAgIHkgPSAocGFyc2VJbnQoeSwgMTApICogcHJvZ3Jlc3MpICsgXCIlXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHkgPSAoeSAqIHByb2dyZXNzKSArIFwicHhcIjtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG9wYWNpdHkgIT09ICd1bmRlZmluZWQnICYmIG9wYWNpdHkgIT09IG51bGwpIHtcbiAgICAgIHZhciBjdXJyZW50T3BhY2l0eSA9IG9wYWNpdHkgLSAoKG9wYWNpdHkgLSAxKSAqICgxIC0gTWF0aC5hYnMocHJvZ3Jlc3MpKSk7XG4gICAgICAkZWxbMF0uc3R5bGUub3BhY2l0eSA9IGN1cnJlbnRPcGFjaXR5O1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHNjYWxlID09PSAndW5kZWZpbmVkJyB8fCBzY2FsZSA9PT0gbnVsbCkge1xuICAgICAgJGVsLnRyYW5zZm9ybSgoXCJ0cmFuc2xhdGUzZChcIiArIHggKyBcIiwgXCIgKyB5ICsgXCIsIDBweClcIikpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgY3VycmVudFNjYWxlID0gc2NhbGUgLSAoKHNjYWxlIC0gMSkgKiAoMSAtIE1hdGguYWJzKHByb2dyZXNzKSkpO1xuICAgICAgJGVsLnRyYW5zZm9ybSgoXCJ0cmFuc2xhdGUzZChcIiArIHggKyBcIiwgXCIgKyB5ICsgXCIsIDBweCkgc2NhbGUoXCIgKyBjdXJyZW50U2NhbGUgKyBcIilcIikpO1xuICAgIH1cbiAgfSxcbiAgc2V0VHJhbnNsYXRlOiBmdW5jdGlvbiBzZXRUcmFuc2xhdGUoKSB7XG4gICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgdmFyICRlbCA9IHN3aXBlci4kZWw7XG4gICAgdmFyIHNsaWRlcyA9IHN3aXBlci5zbGlkZXM7XG4gICAgdmFyIHByb2dyZXNzID0gc3dpcGVyLnByb2dyZXNzO1xuICAgIHZhciBzbmFwR3JpZCA9IHN3aXBlci5zbmFwR3JpZDtcbiAgICAkZWwuY2hpbGRyZW4oJ1tkYXRhLXN3aXBlci1wYXJhbGxheF0sIFtkYXRhLXN3aXBlci1wYXJhbGxheC14XSwgW2RhdGEtc3dpcGVyLXBhcmFsbGF4LXldJylcbiAgICAgIC5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWwpIHtcbiAgICAgICAgc3dpcGVyLnBhcmFsbGF4LnNldFRyYW5zZm9ybShlbCwgcHJvZ3Jlc3MpO1xuICAgICAgfSk7XG4gICAgc2xpZGVzLmVhY2goZnVuY3Rpb24gKHNsaWRlSW5kZXgsIHNsaWRlRWwpIHtcbiAgICAgIHZhciBzbGlkZVByb2dyZXNzID0gc2xpZGVFbC5wcm9ncmVzcztcbiAgICAgIGlmIChzd2lwZXIucGFyYW1zLnNsaWRlc1Blckdyb3VwID4gMSAmJiBzd2lwZXIucGFyYW1zLnNsaWRlc1BlclZpZXcgIT09ICdhdXRvJykge1xuICAgICAgICBzbGlkZVByb2dyZXNzICs9IE1hdGguY2VpbChzbGlkZUluZGV4IC8gMikgLSAocHJvZ3Jlc3MgKiAoc25hcEdyaWQubGVuZ3RoIC0gMSkpO1xuICAgICAgfVxuICAgICAgc2xpZGVQcm9ncmVzcyA9IE1hdGgubWluKE1hdGgubWF4KHNsaWRlUHJvZ3Jlc3MsIC0xKSwgMSk7XG4gICAgICAkJDEoc2xpZGVFbCkuZmluZCgnW2RhdGEtc3dpcGVyLXBhcmFsbGF4XSwgW2RhdGEtc3dpcGVyLXBhcmFsbGF4LXhdLCBbZGF0YS1zd2lwZXItcGFyYWxsYXgteV0nKVxuICAgICAgICAuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsKSB7XG4gICAgICAgICAgc3dpcGVyLnBhcmFsbGF4LnNldFRyYW5zZm9ybShlbCwgc2xpZGVQcm9ncmVzcyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICB9LFxuICBzZXRUcmFuc2l0aW9uOiBmdW5jdGlvbiBzZXRUcmFuc2l0aW9uKGR1cmF0aW9uKSB7XG4gICAgaWYgKCBkdXJhdGlvbiA9PT0gdm9pZCAwICkgZHVyYXRpb24gPSB0aGlzLnBhcmFtcy5zcGVlZDtcblxuICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgIHZhciAkZWwgPSBzd2lwZXIuJGVsO1xuICAgICRlbC5maW5kKCdbZGF0YS1zd2lwZXItcGFyYWxsYXhdLCBbZGF0YS1zd2lwZXItcGFyYWxsYXgteF0sIFtkYXRhLXN3aXBlci1wYXJhbGxheC15XScpXG4gICAgICAuZWFjaChmdW5jdGlvbiAoaW5kZXgsIHBhcmFsbGF4RWwpIHtcbiAgICAgICAgdmFyICRwYXJhbGxheEVsID0gJCQxKHBhcmFsbGF4RWwpO1xuICAgICAgICB2YXIgcGFyYWxsYXhEdXJhdGlvbiA9IHBhcnNlSW50KCRwYXJhbGxheEVsLmF0dHIoJ2RhdGEtc3dpcGVyLXBhcmFsbGF4LWR1cmF0aW9uJyksIDEwKSB8fCBkdXJhdGlvbjtcbiAgICAgICAgaWYgKGR1cmF0aW9uID09PSAwKSB7IHBhcmFsbGF4RHVyYXRpb24gPSAwOyB9XG4gICAgICAgICRwYXJhbGxheEVsLnRyYW5zaXRpb24ocGFyYWxsYXhEdXJhdGlvbik7XG4gICAgICB9KTtcbiAgfSxcbn07XG5cbnZhciBQYXJhbGxheCQxID0ge1xuICBuYW1lOiAncGFyYWxsYXgnLFxuICBwYXJhbXM6IHtcbiAgICBwYXJhbGxheDoge1xuICAgICAgZW5hYmxlZDogZmFsc2UsXG4gICAgfSxcbiAgfSxcbiAgY3JlYXRlOiBmdW5jdGlvbiBjcmVhdGUoKSB7XG4gICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgVXRpbHMuZXh0ZW5kKHN3aXBlciwge1xuICAgICAgcGFyYWxsYXg6IHtcbiAgICAgICAgc2V0VHJhbnNmb3JtOiBQYXJhbGxheC5zZXRUcmFuc2Zvcm0uYmluZChzd2lwZXIpLFxuICAgICAgICBzZXRUcmFuc2xhdGU6IFBhcmFsbGF4LnNldFRyYW5zbGF0ZS5iaW5kKHN3aXBlciksXG4gICAgICAgIHNldFRyYW5zaXRpb246IFBhcmFsbGF4LnNldFRyYW5zaXRpb24uYmluZChzd2lwZXIpLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfSxcbiAgb246IHtcbiAgICBiZWZvcmVJbml0OiBmdW5jdGlvbiBiZWZvcmVJbml0KCkge1xuICAgICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgICBzd2lwZXIucGFyYW1zLndhdGNoU2xpZGVzUHJvZ3Jlc3MgPSB0cnVlO1xuICAgIH0sXG4gICAgaW5pdDogZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgICAgaWYgKCFzd2lwZXIucGFyYW1zLnBhcmFsbGF4KSB7IHJldHVybjsgfVxuICAgICAgc3dpcGVyLnBhcmFsbGF4LnNldFRyYW5zbGF0ZSgpO1xuICAgIH0sXG4gICAgc2V0VHJhbnNsYXRlOiBmdW5jdGlvbiBzZXRUcmFuc2xhdGUoKSB7XG4gICAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICAgIGlmICghc3dpcGVyLnBhcmFtcy5wYXJhbGxheCkgeyByZXR1cm47IH1cbiAgICAgIHN3aXBlci5wYXJhbGxheC5zZXRUcmFuc2xhdGUoKTtcbiAgICB9LFxuICAgIHNldFRyYW5zaXRpb246IGZ1bmN0aW9uIHNldFRyYW5zaXRpb24oZHVyYXRpb24pIHtcbiAgICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgICAgaWYgKCFzd2lwZXIucGFyYW1zLnBhcmFsbGF4KSB7IHJldHVybjsgfVxuICAgICAgc3dpcGVyLnBhcmFsbGF4LnNldFRyYW5zaXRpb24oZHVyYXRpb24pO1xuICAgIH0sXG4gIH0sXG59O1xuXG52YXIgWm9vbSA9IHtcbiAgLy8gQ2FsYyBTY2FsZSBGcm9tIE11bHRpLXRvdWNoZXNcbiAgZ2V0RGlzdGFuY2VCZXR3ZWVuVG91Y2hlczogZnVuY3Rpb24gZ2V0RGlzdGFuY2VCZXR3ZWVuVG91Y2hlcyhlKSB7XG4gICAgaWYgKGUudGFyZ2V0VG91Y2hlcy5sZW5ndGggPCAyKSB7IHJldHVybiAxOyB9XG4gICAgdmFyIHgxID0gZS50YXJnZXRUb3VjaGVzWzBdLnBhZ2VYO1xuICAgIHZhciB5MSA9IGUudGFyZ2V0VG91Y2hlc1swXS5wYWdlWTtcbiAgICB2YXIgeDIgPSBlLnRhcmdldFRvdWNoZXNbMV0ucGFnZVg7XG4gICAgdmFyIHkyID0gZS50YXJnZXRUb3VjaGVzWzFdLnBhZ2VZO1xuICAgIHZhciBkaXN0YW5jZSA9IE1hdGguc3FydCgoTWF0aC5wb3coICh4MiAtIHgxKSwgMiApKSArIChNYXRoLnBvdyggKHkyIC0geTEpLCAyICkpKTtcbiAgICByZXR1cm4gZGlzdGFuY2U7XG4gIH0sXG4gIC8vIEV2ZW50c1xuICBvbkdlc3R1cmVTdGFydDogZnVuY3Rpb24gb25HZXN0dXJlU3RhcnQoZSkge1xuICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgIHZhciBwYXJhbXMgPSBzd2lwZXIucGFyYW1zLnpvb207XG4gICAgdmFyIHpvb20gPSBzd2lwZXIuem9vbTtcbiAgICB2YXIgZ2VzdHVyZSA9IHpvb20uZ2VzdHVyZTtcbiAgICB6b29tLmZha2VHZXN0dXJlVG91Y2hlZCA9IGZhbHNlO1xuICAgIHpvb20uZmFrZUdlc3R1cmVNb3ZlZCA9IGZhbHNlO1xuICAgIGlmICghU3VwcG9ydC5nZXN0dXJlcykge1xuICAgICAgaWYgKGUudHlwZSAhPT0gJ3RvdWNoc3RhcnQnIHx8IChlLnR5cGUgPT09ICd0b3VjaHN0YXJ0JyAmJiBlLnRhcmdldFRvdWNoZXMubGVuZ3RoIDwgMikpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgem9vbS5mYWtlR2VzdHVyZVRvdWNoZWQgPSB0cnVlO1xuICAgICAgZ2VzdHVyZS5zY2FsZVN0YXJ0ID0gWm9vbS5nZXREaXN0YW5jZUJldHdlZW5Ub3VjaGVzKGUpO1xuICAgIH1cbiAgICBpZiAoIWdlc3R1cmUuJHNsaWRlRWwgfHwgIWdlc3R1cmUuJHNsaWRlRWwubGVuZ3RoKSB7XG4gICAgICBnZXN0dXJlLiRzbGlkZUVsID0gJCQxKHRoaXMpO1xuICAgICAgaWYgKGdlc3R1cmUuJHNsaWRlRWwubGVuZ3RoID09PSAwKSB7IGdlc3R1cmUuJHNsaWRlRWwgPSBzd2lwZXIuc2xpZGVzLmVxKHN3aXBlci5hY3RpdmVJbmRleCk7IH1cbiAgICAgIGdlc3R1cmUuJGltYWdlRWwgPSBnZXN0dXJlLiRzbGlkZUVsLmZpbmQoJ2ltZywgc3ZnLCBjYW52YXMnKTtcbiAgICAgIGdlc3R1cmUuJGltYWdlV3JhcEVsID0gZ2VzdHVyZS4kaW1hZ2VFbC5wYXJlbnQoKFwiLlwiICsgKHBhcmFtcy5jb250YWluZXJDbGFzcykpKTtcbiAgICAgIGdlc3R1cmUubWF4UmF0aW8gPSBnZXN0dXJlLiRpbWFnZVdyYXBFbC5hdHRyKCdkYXRhLXN3aXBlci16b29tJykgfHwgcGFyYW1zLm1heFJhdGlvO1xuICAgICAgaWYgKGdlc3R1cmUuJGltYWdlV3JhcEVsLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBnZXN0dXJlLiRpbWFnZUVsID0gdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICAgIGdlc3R1cmUuJGltYWdlRWwudHJhbnNpdGlvbigwKTtcbiAgICBzd2lwZXIuem9vbS5pc1NjYWxpbmcgPSB0cnVlO1xuICB9LFxuICBvbkdlc3R1cmVDaGFuZ2U6IGZ1bmN0aW9uIG9uR2VzdHVyZUNoYW5nZShlKSB7XG4gICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgdmFyIHBhcmFtcyA9IHN3aXBlci5wYXJhbXMuem9vbTtcbiAgICB2YXIgem9vbSA9IHN3aXBlci56b29tO1xuICAgIHZhciBnZXN0dXJlID0gem9vbS5nZXN0dXJlO1xuICAgIGlmICghU3VwcG9ydC5nZXN0dXJlcykge1xuICAgICAgaWYgKGUudHlwZSAhPT0gJ3RvdWNobW92ZScgfHwgKGUudHlwZSA9PT0gJ3RvdWNobW92ZScgJiYgZS50YXJnZXRUb3VjaGVzLmxlbmd0aCA8IDIpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHpvb20uZmFrZUdlc3R1cmVNb3ZlZCA9IHRydWU7XG4gICAgICBnZXN0dXJlLnNjYWxlTW92ZSA9IFpvb20uZ2V0RGlzdGFuY2VCZXR3ZWVuVG91Y2hlcyhlKTtcbiAgICB9XG4gICAgaWYgKCFnZXN0dXJlLiRpbWFnZUVsIHx8IGdlc3R1cmUuJGltYWdlRWwubGVuZ3RoID09PSAwKSB7IHJldHVybjsgfVxuICAgIGlmIChTdXBwb3J0Lmdlc3R1cmVzKSB7XG4gICAgICBzd2lwZXIuem9vbS5zY2FsZSA9IGUuc2NhbGUgKiB6b29tLmN1cnJlbnRTY2FsZTtcbiAgICB9IGVsc2Uge1xuICAgICAgem9vbS5zY2FsZSA9IChnZXN0dXJlLnNjYWxlTW92ZSAvIGdlc3R1cmUuc2NhbGVTdGFydCkgKiB6b29tLmN1cnJlbnRTY2FsZTtcbiAgICB9XG4gICAgaWYgKHpvb20uc2NhbGUgPiBnZXN0dXJlLm1heFJhdGlvKSB7XG4gICAgICB6b29tLnNjYWxlID0gKGdlc3R1cmUubWF4UmF0aW8gLSAxKSArIChNYXRoLnBvdyggKCh6b29tLnNjYWxlIC0gZ2VzdHVyZS5tYXhSYXRpbykgKyAxKSwgMC41ICkpO1xuICAgIH1cbiAgICBpZiAoem9vbS5zY2FsZSA8IHBhcmFtcy5taW5SYXRpbykge1xuICAgICAgem9vbS5zY2FsZSA9IChwYXJhbXMubWluUmF0aW8gKyAxKSAtIChNYXRoLnBvdyggKChwYXJhbXMubWluUmF0aW8gLSB6b29tLnNjYWxlKSArIDEpLCAwLjUgKSk7XG4gICAgfVxuICAgIGdlc3R1cmUuJGltYWdlRWwudHJhbnNmb3JtKChcInRyYW5zbGF0ZTNkKDAsMCwwKSBzY2FsZShcIiArICh6b29tLnNjYWxlKSArIFwiKVwiKSk7XG4gIH0sXG4gIG9uR2VzdHVyZUVuZDogZnVuY3Rpb24gb25HZXN0dXJlRW5kKGUpIHtcbiAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICB2YXIgcGFyYW1zID0gc3dpcGVyLnBhcmFtcy56b29tO1xuICAgIHZhciB6b29tID0gc3dpcGVyLnpvb207XG4gICAgdmFyIGdlc3R1cmUgPSB6b29tLmdlc3R1cmU7XG4gICAgaWYgKCFTdXBwb3J0Lmdlc3R1cmVzKSB7XG4gICAgICBpZiAoIXpvb20uZmFrZUdlc3R1cmVUb3VjaGVkIHx8ICF6b29tLmZha2VHZXN0dXJlTW92ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGUudHlwZSAhPT0gJ3RvdWNoZW5kJyB8fCAoZS50eXBlID09PSAndG91Y2hlbmQnICYmIGUuY2hhbmdlZFRvdWNoZXMubGVuZ3RoIDwgMiAmJiAhRGV2aWNlLmFuZHJvaWQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHpvb20uZmFrZUdlc3R1cmVUb3VjaGVkID0gZmFsc2U7XG4gICAgICB6b29tLmZha2VHZXN0dXJlTW92ZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgaWYgKCFnZXN0dXJlLiRpbWFnZUVsIHx8IGdlc3R1cmUuJGltYWdlRWwubGVuZ3RoID09PSAwKSB7IHJldHVybjsgfVxuICAgIHpvb20uc2NhbGUgPSBNYXRoLm1heChNYXRoLm1pbih6b29tLnNjYWxlLCBnZXN0dXJlLm1heFJhdGlvKSwgcGFyYW1zLm1pblJhdGlvKTtcbiAgICBnZXN0dXJlLiRpbWFnZUVsLnRyYW5zaXRpb24oc3dpcGVyLnBhcmFtcy5zcGVlZCkudHJhbnNmb3JtKChcInRyYW5zbGF0ZTNkKDAsMCwwKSBzY2FsZShcIiArICh6b29tLnNjYWxlKSArIFwiKVwiKSk7XG4gICAgem9vbS5jdXJyZW50U2NhbGUgPSB6b29tLnNjYWxlO1xuICAgIHpvb20uaXNTY2FsaW5nID0gZmFsc2U7XG4gICAgaWYgKHpvb20uc2NhbGUgPT09IDEpIHsgZ2VzdHVyZS4kc2xpZGVFbCA9IHVuZGVmaW5lZDsgfVxuICB9LFxuICBvblRvdWNoU3RhcnQ6IGZ1bmN0aW9uIG9uVG91Y2hTdGFydChlKSB7XG4gICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgdmFyIHpvb20gPSBzd2lwZXIuem9vbTtcbiAgICB2YXIgZ2VzdHVyZSA9IHpvb20uZ2VzdHVyZTtcbiAgICB2YXIgaW1hZ2UgPSB6b29tLmltYWdlO1xuICAgIGlmICghZ2VzdHVyZS4kaW1hZ2VFbCB8fCBnZXN0dXJlLiRpbWFnZUVsLmxlbmd0aCA9PT0gMCkgeyByZXR1cm47IH1cbiAgICBpZiAoaW1hZ2UuaXNUb3VjaGVkKSB7IHJldHVybjsgfVxuICAgIGlmIChEZXZpY2UuYW5kcm9pZCkgeyBlLnByZXZlbnREZWZhdWx0KCk7IH1cbiAgICBpbWFnZS5pc1RvdWNoZWQgPSB0cnVlO1xuICAgIGltYWdlLnRvdWNoZXNTdGFydC54ID0gZS50eXBlID09PSAndG91Y2hzdGFydCcgPyBlLnRhcmdldFRvdWNoZXNbMF0ucGFnZVggOiBlLnBhZ2VYO1xuICAgIGltYWdlLnRvdWNoZXNTdGFydC55ID0gZS50eXBlID09PSAndG91Y2hzdGFydCcgPyBlLnRhcmdldFRvdWNoZXNbMF0ucGFnZVkgOiBlLnBhZ2VZO1xuICB9LFxuICBvblRvdWNoTW92ZTogZnVuY3Rpb24gb25Ub3VjaE1vdmUoZSkge1xuICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgIHZhciB6b29tID0gc3dpcGVyLnpvb207XG4gICAgdmFyIGdlc3R1cmUgPSB6b29tLmdlc3R1cmU7XG4gICAgdmFyIGltYWdlID0gem9vbS5pbWFnZTtcbiAgICB2YXIgdmVsb2NpdHkgPSB6b29tLnZlbG9jaXR5O1xuICAgIGlmICghZ2VzdHVyZS4kaW1hZ2VFbCB8fCBnZXN0dXJlLiRpbWFnZUVsLmxlbmd0aCA9PT0gMCkgeyByZXR1cm47IH1cbiAgICBzd2lwZXIuYWxsb3dDbGljayA9IGZhbHNlO1xuICAgIGlmICghaW1hZ2UuaXNUb3VjaGVkIHx8ICFnZXN0dXJlLiRzbGlkZUVsKSB7IHJldHVybjsgfVxuXG4gICAgaWYgKCFpbWFnZS5pc01vdmVkKSB7XG4gICAgICBpbWFnZS53aWR0aCA9IGdlc3R1cmUuJGltYWdlRWxbMF0ub2Zmc2V0V2lkdGg7XG4gICAgICBpbWFnZS5oZWlnaHQgPSBnZXN0dXJlLiRpbWFnZUVsWzBdLm9mZnNldEhlaWdodDtcbiAgICAgIGltYWdlLnN0YXJ0WCA9IFV0aWxzLmdldFRyYW5zbGF0ZShnZXN0dXJlLiRpbWFnZVdyYXBFbFswXSwgJ3gnKSB8fCAwO1xuICAgICAgaW1hZ2Uuc3RhcnRZID0gVXRpbHMuZ2V0VHJhbnNsYXRlKGdlc3R1cmUuJGltYWdlV3JhcEVsWzBdLCAneScpIHx8IDA7XG4gICAgICBnZXN0dXJlLnNsaWRlV2lkdGggPSBnZXN0dXJlLiRzbGlkZUVsWzBdLm9mZnNldFdpZHRoO1xuICAgICAgZ2VzdHVyZS5zbGlkZUhlaWdodCA9IGdlc3R1cmUuJHNsaWRlRWxbMF0ub2Zmc2V0SGVpZ2h0O1xuICAgICAgZ2VzdHVyZS4kaW1hZ2VXcmFwRWwudHJhbnNpdGlvbigwKTtcbiAgICAgIGlmIChzd2lwZXIucnRsKSB7IGltYWdlLnN0YXJ0WCA9IC1pbWFnZS5zdGFydFg7IH1cbiAgICAgIGlmIChzd2lwZXIucnRsKSB7IGltYWdlLnN0YXJ0WSA9IC1pbWFnZS5zdGFydFk7IH1cbiAgICB9XG4gICAgLy8gRGVmaW5lIGlmIHdlIG5lZWQgaW1hZ2UgZHJhZ1xuICAgIHZhciBzY2FsZWRXaWR0aCA9IGltYWdlLndpZHRoICogem9vbS5zY2FsZTtcbiAgICB2YXIgc2NhbGVkSGVpZ2h0ID0gaW1hZ2UuaGVpZ2h0ICogem9vbS5zY2FsZTtcblxuICAgIGlmIChzY2FsZWRXaWR0aCA8IGdlc3R1cmUuc2xpZGVXaWR0aCAmJiBzY2FsZWRIZWlnaHQgPCBnZXN0dXJlLnNsaWRlSGVpZ2h0KSB7IHJldHVybjsgfVxuXG4gICAgaW1hZ2UubWluWCA9IE1hdGgubWluKCgoZ2VzdHVyZS5zbGlkZVdpZHRoIC8gMikgLSAoc2NhbGVkV2lkdGggLyAyKSksIDApO1xuICAgIGltYWdlLm1heFggPSAtaW1hZ2UubWluWDtcbiAgICBpbWFnZS5taW5ZID0gTWF0aC5taW4oKChnZXN0dXJlLnNsaWRlSGVpZ2h0IC8gMikgLSAoc2NhbGVkSGVpZ2h0IC8gMikpLCAwKTtcbiAgICBpbWFnZS5tYXhZID0gLWltYWdlLm1pblk7XG5cbiAgICBpbWFnZS50b3VjaGVzQ3VycmVudC54ID0gZS50eXBlID09PSAndG91Y2htb3ZlJyA/IGUudGFyZ2V0VG91Y2hlc1swXS5wYWdlWCA6IGUucGFnZVg7XG4gICAgaW1hZ2UudG91Y2hlc0N1cnJlbnQueSA9IGUudHlwZSA9PT0gJ3RvdWNobW92ZScgPyBlLnRhcmdldFRvdWNoZXNbMF0ucGFnZVkgOiBlLnBhZ2VZO1xuXG4gICAgaWYgKCFpbWFnZS5pc01vdmVkICYmICF6b29tLmlzU2NhbGluZykge1xuICAgICAgaWYgKFxuICAgICAgICBzd2lwZXIuaXNIb3Jpem9udGFsKCkgJiZcbiAgICAgICAgKFxuICAgICAgICAgIChNYXRoLmZsb29yKGltYWdlLm1pblgpID09PSBNYXRoLmZsb29yKGltYWdlLnN0YXJ0WCkgJiYgaW1hZ2UudG91Y2hlc0N1cnJlbnQueCA8IGltYWdlLnRvdWNoZXNTdGFydC54KSB8fFxuICAgICAgICAgIChNYXRoLmZsb29yKGltYWdlLm1heFgpID09PSBNYXRoLmZsb29yKGltYWdlLnN0YXJ0WCkgJiYgaW1hZ2UudG91Y2hlc0N1cnJlbnQueCA+IGltYWdlLnRvdWNoZXNTdGFydC54KVxuICAgICAgICApXG4gICAgICApIHtcbiAgICAgICAgaW1hZ2UuaXNUb3VjaGVkID0gZmFsc2U7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICFzd2lwZXIuaXNIb3Jpem9udGFsKCkgJiZcbiAgICAgICAgKFxuICAgICAgICAgIChNYXRoLmZsb29yKGltYWdlLm1pblkpID09PSBNYXRoLmZsb29yKGltYWdlLnN0YXJ0WSkgJiYgaW1hZ2UudG91Y2hlc0N1cnJlbnQueSA8IGltYWdlLnRvdWNoZXNTdGFydC55KSB8fFxuICAgICAgICAgIChNYXRoLmZsb29yKGltYWdlLm1heFkpID09PSBNYXRoLmZsb29yKGltYWdlLnN0YXJ0WSkgJiYgaW1hZ2UudG91Y2hlc0N1cnJlbnQueSA+IGltYWdlLnRvdWNoZXNTdGFydC55KVxuICAgICAgICApXG4gICAgICApIHtcbiAgICAgICAgaW1hZ2UuaXNUb3VjaGVkID0gZmFsc2U7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICBpbWFnZS5pc01vdmVkID0gdHJ1ZTtcbiAgICBpbWFnZS5jdXJyZW50WCA9IChpbWFnZS50b3VjaGVzQ3VycmVudC54IC0gaW1hZ2UudG91Y2hlc1N0YXJ0LngpICsgaW1hZ2Uuc3RhcnRYO1xuICAgIGltYWdlLmN1cnJlbnRZID0gKGltYWdlLnRvdWNoZXNDdXJyZW50LnkgLSBpbWFnZS50b3VjaGVzU3RhcnQueSkgKyBpbWFnZS5zdGFydFk7XG5cbiAgICBpZiAoaW1hZ2UuY3VycmVudFggPCBpbWFnZS5taW5YKSB7XG4gICAgICBpbWFnZS5jdXJyZW50WCA9IChpbWFnZS5taW5YICsgMSkgLSAoTWF0aC5wb3coICgoaW1hZ2UubWluWCAtIGltYWdlLmN1cnJlbnRYKSArIDEpLCAwLjggKSk7XG4gICAgfVxuICAgIGlmIChpbWFnZS5jdXJyZW50WCA+IGltYWdlLm1heFgpIHtcbiAgICAgIGltYWdlLmN1cnJlbnRYID0gKGltYWdlLm1heFggLSAxKSArIChNYXRoLnBvdyggKChpbWFnZS5jdXJyZW50WCAtIGltYWdlLm1heFgpICsgMSksIDAuOCApKTtcbiAgICB9XG5cbiAgICBpZiAoaW1hZ2UuY3VycmVudFkgPCBpbWFnZS5taW5ZKSB7XG4gICAgICBpbWFnZS5jdXJyZW50WSA9IChpbWFnZS5taW5ZICsgMSkgLSAoTWF0aC5wb3coICgoaW1hZ2UubWluWSAtIGltYWdlLmN1cnJlbnRZKSArIDEpLCAwLjggKSk7XG4gICAgfVxuICAgIGlmIChpbWFnZS5jdXJyZW50WSA+IGltYWdlLm1heFkpIHtcbiAgICAgIGltYWdlLmN1cnJlbnRZID0gKGltYWdlLm1heFkgLSAxKSArIChNYXRoLnBvdyggKChpbWFnZS5jdXJyZW50WSAtIGltYWdlLm1heFkpICsgMSksIDAuOCApKTtcbiAgICB9XG5cbiAgICAvLyBWZWxvY2l0eVxuICAgIGlmICghdmVsb2NpdHkucHJldlBvc2l0aW9uWCkgeyB2ZWxvY2l0eS5wcmV2UG9zaXRpb25YID0gaW1hZ2UudG91Y2hlc0N1cnJlbnQueDsgfVxuICAgIGlmICghdmVsb2NpdHkucHJldlBvc2l0aW9uWSkgeyB2ZWxvY2l0eS5wcmV2UG9zaXRpb25ZID0gaW1hZ2UudG91Y2hlc0N1cnJlbnQueTsgfVxuICAgIGlmICghdmVsb2NpdHkucHJldlRpbWUpIHsgdmVsb2NpdHkucHJldlRpbWUgPSBEYXRlLm5vdygpOyB9XG4gICAgdmVsb2NpdHkueCA9IChpbWFnZS50b3VjaGVzQ3VycmVudC54IC0gdmVsb2NpdHkucHJldlBvc2l0aW9uWCkgLyAoRGF0ZS5ub3coKSAtIHZlbG9jaXR5LnByZXZUaW1lKSAvIDI7XG4gICAgdmVsb2NpdHkueSA9IChpbWFnZS50b3VjaGVzQ3VycmVudC55IC0gdmVsb2NpdHkucHJldlBvc2l0aW9uWSkgLyAoRGF0ZS5ub3coKSAtIHZlbG9jaXR5LnByZXZUaW1lKSAvIDI7XG4gICAgaWYgKE1hdGguYWJzKGltYWdlLnRvdWNoZXNDdXJyZW50LnggLSB2ZWxvY2l0eS5wcmV2UG9zaXRpb25YKSA8IDIpIHsgdmVsb2NpdHkueCA9IDA7IH1cbiAgICBpZiAoTWF0aC5hYnMoaW1hZ2UudG91Y2hlc0N1cnJlbnQueSAtIHZlbG9jaXR5LnByZXZQb3NpdGlvblkpIDwgMikgeyB2ZWxvY2l0eS55ID0gMDsgfVxuICAgIHZlbG9jaXR5LnByZXZQb3NpdGlvblggPSBpbWFnZS50b3VjaGVzQ3VycmVudC54O1xuICAgIHZlbG9jaXR5LnByZXZQb3NpdGlvblkgPSBpbWFnZS50b3VjaGVzQ3VycmVudC55O1xuICAgIHZlbG9jaXR5LnByZXZUaW1lID0gRGF0ZS5ub3coKTtcblxuICAgIGdlc3R1cmUuJGltYWdlV3JhcEVsLnRyYW5zZm9ybSgoXCJ0cmFuc2xhdGUzZChcIiArIChpbWFnZS5jdXJyZW50WCkgKyBcInB4LCBcIiArIChpbWFnZS5jdXJyZW50WSkgKyBcInB4LDApXCIpKTtcbiAgfSxcbiAgb25Ub3VjaEVuZDogZnVuY3Rpb24gb25Ub3VjaEVuZCgpIHtcbiAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICB2YXIgem9vbSA9IHN3aXBlci56b29tO1xuICAgIHZhciBnZXN0dXJlID0gem9vbS5nZXN0dXJlO1xuICAgIHZhciBpbWFnZSA9IHpvb20uaW1hZ2U7XG4gICAgdmFyIHZlbG9jaXR5ID0gem9vbS52ZWxvY2l0eTtcbiAgICBpZiAoIWdlc3R1cmUuJGltYWdlRWwgfHwgZ2VzdHVyZS4kaW1hZ2VFbC5sZW5ndGggPT09IDApIHsgcmV0dXJuOyB9XG4gICAgaWYgKCFpbWFnZS5pc1RvdWNoZWQgfHwgIWltYWdlLmlzTW92ZWQpIHtcbiAgICAgIGltYWdlLmlzVG91Y2hlZCA9IGZhbHNlO1xuICAgICAgaW1hZ2UuaXNNb3ZlZCA9IGZhbHNlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpbWFnZS5pc1RvdWNoZWQgPSBmYWxzZTtcbiAgICBpbWFnZS5pc01vdmVkID0gZmFsc2U7XG4gICAgdmFyIG1vbWVudHVtRHVyYXRpb25YID0gMzAwO1xuICAgIHZhciBtb21lbnR1bUR1cmF0aW9uWSA9IDMwMDtcbiAgICB2YXIgbW9tZW50dW1EaXN0YW5jZVggPSB2ZWxvY2l0eS54ICogbW9tZW50dW1EdXJhdGlvblg7XG4gICAgdmFyIG5ld1Bvc2l0aW9uWCA9IGltYWdlLmN1cnJlbnRYICsgbW9tZW50dW1EaXN0YW5jZVg7XG4gICAgdmFyIG1vbWVudHVtRGlzdGFuY2VZID0gdmVsb2NpdHkueSAqIG1vbWVudHVtRHVyYXRpb25ZO1xuICAgIHZhciBuZXdQb3NpdGlvblkgPSBpbWFnZS5jdXJyZW50WSArIG1vbWVudHVtRGlzdGFuY2VZO1xuXG4gICAgLy8gRml4IGR1cmF0aW9uXG4gICAgaWYgKHZlbG9jaXR5LnggIT09IDApIHsgbW9tZW50dW1EdXJhdGlvblggPSBNYXRoLmFicygobmV3UG9zaXRpb25YIC0gaW1hZ2UuY3VycmVudFgpIC8gdmVsb2NpdHkueCk7IH1cbiAgICBpZiAodmVsb2NpdHkueSAhPT0gMCkgeyBtb21lbnR1bUR1cmF0aW9uWSA9IE1hdGguYWJzKChuZXdQb3NpdGlvblkgLSBpbWFnZS5jdXJyZW50WSkgLyB2ZWxvY2l0eS55KTsgfVxuICAgIHZhciBtb21lbnR1bUR1cmF0aW9uID0gTWF0aC5tYXgobW9tZW50dW1EdXJhdGlvblgsIG1vbWVudHVtRHVyYXRpb25ZKTtcblxuICAgIGltYWdlLmN1cnJlbnRYID0gbmV3UG9zaXRpb25YO1xuICAgIGltYWdlLmN1cnJlbnRZID0gbmV3UG9zaXRpb25ZO1xuXG4gICAgLy8gRGVmaW5lIGlmIHdlIG5lZWQgaW1hZ2UgZHJhZ1xuICAgIHZhciBzY2FsZWRXaWR0aCA9IGltYWdlLndpZHRoICogem9vbS5zY2FsZTtcbiAgICB2YXIgc2NhbGVkSGVpZ2h0ID0gaW1hZ2UuaGVpZ2h0ICogem9vbS5zY2FsZTtcbiAgICBpbWFnZS5taW5YID0gTWF0aC5taW4oKChnZXN0dXJlLnNsaWRlV2lkdGggLyAyKSAtIChzY2FsZWRXaWR0aCAvIDIpKSwgMCk7XG4gICAgaW1hZ2UubWF4WCA9IC1pbWFnZS5taW5YO1xuICAgIGltYWdlLm1pblkgPSBNYXRoLm1pbigoKGdlc3R1cmUuc2xpZGVIZWlnaHQgLyAyKSAtIChzY2FsZWRIZWlnaHQgLyAyKSksIDApO1xuICAgIGltYWdlLm1heFkgPSAtaW1hZ2UubWluWTtcbiAgICBpbWFnZS5jdXJyZW50WCA9IE1hdGgubWF4KE1hdGgubWluKGltYWdlLmN1cnJlbnRYLCBpbWFnZS5tYXhYKSwgaW1hZ2UubWluWCk7XG4gICAgaW1hZ2UuY3VycmVudFkgPSBNYXRoLm1heChNYXRoLm1pbihpbWFnZS5jdXJyZW50WSwgaW1hZ2UubWF4WSksIGltYWdlLm1pblkpO1xuXG4gICAgZ2VzdHVyZS4kaW1hZ2VXcmFwRWwudHJhbnNpdGlvbihtb21lbnR1bUR1cmF0aW9uKS50cmFuc2Zvcm0oKFwidHJhbnNsYXRlM2QoXCIgKyAoaW1hZ2UuY3VycmVudFgpICsgXCJweCwgXCIgKyAoaW1hZ2UuY3VycmVudFkpICsgXCJweCwwKVwiKSk7XG4gIH0sXG4gIG9uVHJhbnNpdGlvbkVuZDogZnVuY3Rpb24gb25UcmFuc2l0aW9uRW5kKCkge1xuICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgIHZhciB6b29tID0gc3dpcGVyLnpvb207XG4gICAgdmFyIGdlc3R1cmUgPSB6b29tLmdlc3R1cmU7XG4gICAgaWYgKGdlc3R1cmUuJHNsaWRlRWwgJiYgc3dpcGVyLnByZXZpb3VzSW5kZXggIT09IHN3aXBlci5hY3RpdmVJbmRleCkge1xuICAgICAgZ2VzdHVyZS4kaW1hZ2VFbC50cmFuc2Zvcm0oJ3RyYW5zbGF0ZTNkKDAsMCwwKSBzY2FsZSgxKScpO1xuICAgICAgZ2VzdHVyZS4kaW1hZ2VXcmFwRWwudHJhbnNmb3JtKCd0cmFuc2xhdGUzZCgwLDAsMCknKTtcbiAgICAgIGdlc3R1cmUuJHNsaWRlRWwgPSB1bmRlZmluZWQ7XG4gICAgICBnZXN0dXJlLiRpbWFnZUVsID0gdW5kZWZpbmVkO1xuICAgICAgZ2VzdHVyZS4kaW1hZ2VXcmFwRWwgPSB1bmRlZmluZWQ7XG5cbiAgICAgIHpvb20uc2NhbGUgPSAxO1xuICAgICAgem9vbS5jdXJyZW50U2NhbGUgPSAxO1xuICAgIH1cbiAgfSxcbiAgLy8gVG9nZ2xlIFpvb21cbiAgdG9nZ2xlOiBmdW5jdGlvbiB0b2dnbGUoZSkge1xuICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgIHZhciB6b29tID0gc3dpcGVyLnpvb207XG5cbiAgICBpZiAoem9vbS5zY2FsZSAmJiB6b29tLnNjYWxlICE9PSAxKSB7XG4gICAgICAvLyBab29tIE91dFxuICAgICAgem9vbS5vdXQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gWm9vbSBJblxuICAgICAgem9vbS5pbihlKTtcbiAgICB9XG4gIH0sXG4gIGluOiBmdW5jdGlvbiBpbiQxKGUpIHtcbiAgICB2YXIgc3dpcGVyID0gdGhpcztcblxuICAgIHZhciB6b29tID0gc3dpcGVyLnpvb207XG4gICAgdmFyIHBhcmFtcyA9IHN3aXBlci5wYXJhbXMuem9vbTtcbiAgICB2YXIgZ2VzdHVyZSA9IHpvb20uZ2VzdHVyZTtcbiAgICB2YXIgaW1hZ2UgPSB6b29tLmltYWdlO1xuXG4gICAgaWYgKCFnZXN0dXJlLiRzbGlkZUVsKSB7XG4gICAgICBnZXN0dXJlLiRzbGlkZUVsID0gc3dpcGVyLmNsaWNrZWRTbGlkZSA/ICQkMShzd2lwZXIuY2xpY2tlZFNsaWRlKSA6IHN3aXBlci5zbGlkZXMuZXEoc3dpcGVyLmFjdGl2ZUluZGV4KTtcbiAgICAgIGdlc3R1cmUuJGltYWdlRWwgPSBnZXN0dXJlLiRzbGlkZUVsLmZpbmQoJ2ltZywgc3ZnLCBjYW52YXMnKTtcbiAgICAgIGdlc3R1cmUuJGltYWdlV3JhcEVsID0gZ2VzdHVyZS4kaW1hZ2VFbC5wYXJlbnQoKFwiLlwiICsgKHBhcmFtcy5jb250YWluZXJDbGFzcykpKTtcbiAgICB9XG4gICAgaWYgKCFnZXN0dXJlLiRpbWFnZUVsIHx8IGdlc3R1cmUuJGltYWdlRWwubGVuZ3RoID09PSAwKSB7IHJldHVybjsgfVxuXG4gICAgZ2VzdHVyZS4kc2xpZGVFbC5hZGRDbGFzcygoXCJcIiArIChwYXJhbXMuem9vbWVkU2xpZGVDbGFzcykpKTtcblxuICAgIHZhciB0b3VjaFg7XG4gICAgdmFyIHRvdWNoWTtcbiAgICB2YXIgb2Zmc2V0WDtcbiAgICB2YXIgb2Zmc2V0WTtcbiAgICB2YXIgZGlmZlg7XG4gICAgdmFyIGRpZmZZO1xuICAgIHZhciB0cmFuc2xhdGVYO1xuICAgIHZhciB0cmFuc2xhdGVZO1xuICAgIHZhciBpbWFnZVdpZHRoO1xuICAgIHZhciBpbWFnZUhlaWdodDtcbiAgICB2YXIgc2NhbGVkV2lkdGg7XG4gICAgdmFyIHNjYWxlZEhlaWdodDtcbiAgICB2YXIgdHJhbnNsYXRlTWluWDtcbiAgICB2YXIgdHJhbnNsYXRlTWluWTtcbiAgICB2YXIgdHJhbnNsYXRlTWF4WDtcbiAgICB2YXIgdHJhbnNsYXRlTWF4WTtcbiAgICB2YXIgc2xpZGVXaWR0aDtcbiAgICB2YXIgc2xpZGVIZWlnaHQ7XG5cbiAgICBpZiAodHlwZW9mIGltYWdlLnRvdWNoZXNTdGFydC54ID09PSAndW5kZWZpbmVkJyAmJiBlKSB7XG4gICAgICB0b3VjaFggPSBlLnR5cGUgPT09ICd0b3VjaGVuZCcgPyBlLmNoYW5nZWRUb3VjaGVzWzBdLnBhZ2VYIDogZS5wYWdlWDtcbiAgICAgIHRvdWNoWSA9IGUudHlwZSA9PT0gJ3RvdWNoZW5kJyA/IGUuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVkgOiBlLnBhZ2VZO1xuICAgIH0gZWxzZSB7XG4gICAgICB0b3VjaFggPSBpbWFnZS50b3VjaGVzU3RhcnQueDtcbiAgICAgIHRvdWNoWSA9IGltYWdlLnRvdWNoZXNTdGFydC55O1xuICAgIH1cblxuICAgIHpvb20uc2NhbGUgPSBnZXN0dXJlLiRpbWFnZVdyYXBFbC5hdHRyKCdkYXRhLXN3aXBlci16b29tJykgfHwgcGFyYW1zLm1heFJhdGlvO1xuICAgIHpvb20uY3VycmVudFNjYWxlID0gZ2VzdHVyZS4kaW1hZ2VXcmFwRWwuYXR0cignZGF0YS1zd2lwZXItem9vbScpIHx8IHBhcmFtcy5tYXhSYXRpbztcbiAgICBpZiAoZSkge1xuICAgICAgc2xpZGVXaWR0aCA9IGdlc3R1cmUuJHNsaWRlRWxbMF0ub2Zmc2V0V2lkdGg7XG4gICAgICBzbGlkZUhlaWdodCA9IGdlc3R1cmUuJHNsaWRlRWxbMF0ub2Zmc2V0SGVpZ2h0O1xuICAgICAgb2Zmc2V0WCA9IGdlc3R1cmUuJHNsaWRlRWwub2Zmc2V0KCkubGVmdDtcbiAgICAgIG9mZnNldFkgPSBnZXN0dXJlLiRzbGlkZUVsLm9mZnNldCgpLnRvcDtcbiAgICAgIGRpZmZYID0gKG9mZnNldFggKyAoc2xpZGVXaWR0aCAvIDIpKSAtIHRvdWNoWDtcbiAgICAgIGRpZmZZID0gKG9mZnNldFkgKyAoc2xpZGVIZWlnaHQgLyAyKSkgLSB0b3VjaFk7XG5cbiAgICAgIGltYWdlV2lkdGggPSBnZXN0dXJlLiRpbWFnZUVsWzBdLm9mZnNldFdpZHRoO1xuICAgICAgaW1hZ2VIZWlnaHQgPSBnZXN0dXJlLiRpbWFnZUVsWzBdLm9mZnNldEhlaWdodDtcbiAgICAgIHNjYWxlZFdpZHRoID0gaW1hZ2VXaWR0aCAqIHpvb20uc2NhbGU7XG4gICAgICBzY2FsZWRIZWlnaHQgPSBpbWFnZUhlaWdodCAqIHpvb20uc2NhbGU7XG5cbiAgICAgIHRyYW5zbGF0ZU1pblggPSBNYXRoLm1pbigoKHNsaWRlV2lkdGggLyAyKSAtIChzY2FsZWRXaWR0aCAvIDIpKSwgMCk7XG4gICAgICB0cmFuc2xhdGVNaW5ZID0gTWF0aC5taW4oKChzbGlkZUhlaWdodCAvIDIpIC0gKHNjYWxlZEhlaWdodCAvIDIpKSwgMCk7XG4gICAgICB0cmFuc2xhdGVNYXhYID0gLXRyYW5zbGF0ZU1pblg7XG4gICAgICB0cmFuc2xhdGVNYXhZID0gLXRyYW5zbGF0ZU1pblk7XG5cbiAgICAgIHRyYW5zbGF0ZVggPSBkaWZmWCAqIHpvb20uc2NhbGU7XG4gICAgICB0cmFuc2xhdGVZID0gZGlmZlkgKiB6b29tLnNjYWxlO1xuXG4gICAgICBpZiAodHJhbnNsYXRlWCA8IHRyYW5zbGF0ZU1pblgpIHtcbiAgICAgICAgdHJhbnNsYXRlWCA9IHRyYW5zbGF0ZU1pblg7XG4gICAgICB9XG4gICAgICBpZiAodHJhbnNsYXRlWCA+IHRyYW5zbGF0ZU1heFgpIHtcbiAgICAgICAgdHJhbnNsYXRlWCA9IHRyYW5zbGF0ZU1heFg7XG4gICAgICB9XG5cbiAgICAgIGlmICh0cmFuc2xhdGVZIDwgdHJhbnNsYXRlTWluWSkge1xuICAgICAgICB0cmFuc2xhdGVZID0gdHJhbnNsYXRlTWluWTtcbiAgICAgIH1cbiAgICAgIGlmICh0cmFuc2xhdGVZID4gdHJhbnNsYXRlTWF4WSkge1xuICAgICAgICB0cmFuc2xhdGVZID0gdHJhbnNsYXRlTWF4WTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdHJhbnNsYXRlWCA9IDA7XG4gICAgICB0cmFuc2xhdGVZID0gMDtcbiAgICB9XG4gICAgZ2VzdHVyZS4kaW1hZ2VXcmFwRWwudHJhbnNpdGlvbigzMDApLnRyYW5zZm9ybSgoXCJ0cmFuc2xhdGUzZChcIiArIHRyYW5zbGF0ZVggKyBcInB4LCBcIiArIHRyYW5zbGF0ZVkgKyBcInB4LDApXCIpKTtcbiAgICBnZXN0dXJlLiRpbWFnZUVsLnRyYW5zaXRpb24oMzAwKS50cmFuc2Zvcm0oKFwidHJhbnNsYXRlM2QoMCwwLDApIHNjYWxlKFwiICsgKHpvb20uc2NhbGUpICsgXCIpXCIpKTtcbiAgfSxcbiAgb3V0OiBmdW5jdGlvbiBvdXQoKSB7XG4gICAgdmFyIHN3aXBlciA9IHRoaXM7XG5cbiAgICB2YXIgem9vbSA9IHN3aXBlci56b29tO1xuICAgIHZhciBwYXJhbXMgPSBzd2lwZXIucGFyYW1zLnpvb207XG4gICAgdmFyIGdlc3R1cmUgPSB6b29tLmdlc3R1cmU7XG5cbiAgICBpZiAoIWdlc3R1cmUuJHNsaWRlRWwpIHtcbiAgICAgIGdlc3R1cmUuJHNsaWRlRWwgPSBzd2lwZXIuY2xpY2tlZFNsaWRlID8gJCQxKHN3aXBlci5jbGlja2VkU2xpZGUpIDogc3dpcGVyLnNsaWRlcy5lcShzd2lwZXIuYWN0aXZlSW5kZXgpO1xuICAgICAgZ2VzdHVyZS4kaW1hZ2VFbCA9IGdlc3R1cmUuJHNsaWRlRWwuZmluZCgnaW1nLCBzdmcsIGNhbnZhcycpO1xuICAgICAgZ2VzdHVyZS4kaW1hZ2VXcmFwRWwgPSBnZXN0dXJlLiRpbWFnZUVsLnBhcmVudCgoXCIuXCIgKyAocGFyYW1zLmNvbnRhaW5lckNsYXNzKSkpO1xuICAgIH1cbiAgICBpZiAoIWdlc3R1cmUuJGltYWdlRWwgfHwgZ2VzdHVyZS4kaW1hZ2VFbC5sZW5ndGggPT09IDApIHsgcmV0dXJuOyB9XG5cbiAgICB6b29tLnNjYWxlID0gMTtcbiAgICB6b29tLmN1cnJlbnRTY2FsZSA9IDE7XG4gICAgZ2VzdHVyZS4kaW1hZ2VXcmFwRWwudHJhbnNpdGlvbigzMDApLnRyYW5zZm9ybSgndHJhbnNsYXRlM2QoMCwwLDApJyk7XG4gICAgZ2VzdHVyZS4kaW1hZ2VFbC50cmFuc2l0aW9uKDMwMCkudHJhbnNmb3JtKCd0cmFuc2xhdGUzZCgwLDAsMCkgc2NhbGUoMSknKTtcbiAgICBnZXN0dXJlLiRzbGlkZUVsLnJlbW92ZUNsYXNzKChcIlwiICsgKHBhcmFtcy56b29tZWRTbGlkZUNsYXNzKSkpO1xuICAgIGdlc3R1cmUuJHNsaWRlRWwgPSB1bmRlZmluZWQ7XG4gIH0sXG4gIC8vIEF0dGFjaC9EZXRhY2ggRXZlbnRzXG4gIGVuYWJsZTogZnVuY3Rpb24gZW5hYmxlKCkge1xuICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgIHZhciB6b29tID0gc3dpcGVyLnpvb207XG4gICAgaWYgKHpvb20uZW5hYmxlZCkgeyByZXR1cm47IH1cbiAgICB6b29tLmVuYWJsZWQgPSB0cnVlO1xuXG4gICAgdmFyIHNsaWRlcyA9IHN3aXBlci5zbGlkZXM7XG5cbiAgICB2YXIgcGFzc2l2ZUxpc3RlbmVyID0gc3dpcGVyLnRvdWNoRXZlbnRzLnN0YXJ0ID09PSAndG91Y2hzdGFydCcgJiYgU3VwcG9ydC5wYXNzaXZlTGlzdGVuZXIgJiYgc3dpcGVyLnBhcmFtcy5wYXNzaXZlTGlzdGVuZXJzID8geyBwYXNzaXZlOiB0cnVlLCBjYXB0dXJlOiBmYWxzZSB9IDogZmFsc2U7XG5cbiAgICAvLyBTY2FsZSBpbWFnZVxuICAgIGlmIChTdXBwb3J0Lmdlc3R1cmVzKSB7XG4gICAgICBzbGlkZXMub24oJ2dlc3R1cmVzdGFydCcsIHpvb20ub25HZXN0dXJlU3RhcnQsIHBhc3NpdmVMaXN0ZW5lcik7XG4gICAgICBzbGlkZXMub24oJ2dlc3R1cmVjaGFuZ2UnLCB6b29tLm9uR2VzdHVyZUNoYW5nZSwgcGFzc2l2ZUxpc3RlbmVyKTtcbiAgICAgIHNsaWRlcy5vbignZ2VzdHVyZWVuZCcsIHpvb20ub25HZXN0dXJlRW5kLCBwYXNzaXZlTGlzdGVuZXIpO1xuICAgIH0gZWxzZSBpZiAoc3dpcGVyLnRvdWNoRXZlbnRzLnN0YXJ0ID09PSAndG91Y2hzdGFydCcpIHtcbiAgICAgIHNsaWRlcy5vbihzd2lwZXIudG91Y2hFdmVudHMuc3RhcnQsIHpvb20ub25HZXN0dXJlU3RhcnQsIHBhc3NpdmVMaXN0ZW5lcik7XG4gICAgICBzbGlkZXMub24oc3dpcGVyLnRvdWNoRXZlbnRzLm1vdmUsIHpvb20ub25HZXN0dXJlQ2hhbmdlLCBwYXNzaXZlTGlzdGVuZXIpO1xuICAgICAgc2xpZGVzLm9uKHN3aXBlci50b3VjaEV2ZW50cy5lbmQsIHpvb20ub25HZXN0dXJlRW5kLCBwYXNzaXZlTGlzdGVuZXIpO1xuICAgIH1cblxuICAgIC8vIE1vdmUgaW1hZ2VcbiAgICBzd2lwZXIuc2xpZGVzLmVhY2goZnVuY3Rpb24gKGluZGV4LCBzbGlkZUVsKSB7XG4gICAgICB2YXIgJHNsaWRlRWwgPSAkJDEoc2xpZGVFbCk7XG4gICAgICBpZiAoJHNsaWRlRWwuZmluZCgoXCIuXCIgKyAoc3dpcGVyLnBhcmFtcy56b29tLmNvbnRhaW5lckNsYXNzKSkpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgJHNsaWRlRWwub24oc3dpcGVyLnRvdWNoRXZlbnRzLm1vdmUsIHpvb20ub25Ub3VjaE1vdmUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICBkaXNhYmxlOiBmdW5jdGlvbiBkaXNhYmxlKCkge1xuICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgIHZhciB6b29tID0gc3dpcGVyLnpvb207XG4gICAgaWYgKCF6b29tLmVuYWJsZWQpIHsgcmV0dXJuOyB9XG5cbiAgICBzd2lwZXIuem9vbS5lbmFibGVkID0gZmFsc2U7XG5cbiAgICB2YXIgc2xpZGVzID0gc3dpcGVyLnNsaWRlcztcblxuICAgIHZhciBwYXNzaXZlTGlzdGVuZXIgPSBzd2lwZXIudG91Y2hFdmVudHMuc3RhcnQgPT09ICd0b3VjaHN0YXJ0JyAmJiBTdXBwb3J0LnBhc3NpdmVMaXN0ZW5lciAmJiBzd2lwZXIucGFyYW1zLnBhc3NpdmVMaXN0ZW5lcnMgPyB7IHBhc3NpdmU6IHRydWUsIGNhcHR1cmU6IGZhbHNlIH0gOiBmYWxzZTtcblxuICAgIC8vIFNjYWxlIGltYWdlXG4gICAgaWYgKFN1cHBvcnQuZ2VzdHVyZXMpIHtcbiAgICAgIHNsaWRlcy5vZmYoJ2dlc3R1cmVzdGFydCcsIHpvb20ub25HZXN0dXJlU3RhcnQsIHBhc3NpdmVMaXN0ZW5lcik7XG4gICAgICBzbGlkZXMub2ZmKCdnZXN0dXJlY2hhbmdlJywgem9vbS5vbkdlc3R1cmVDaGFuZ2UsIHBhc3NpdmVMaXN0ZW5lcik7XG4gICAgICBzbGlkZXMub2ZmKCdnZXN0dXJlZW5kJywgem9vbS5vbkdlc3R1cmVFbmQsIHBhc3NpdmVMaXN0ZW5lcik7XG4gICAgfSBlbHNlIGlmIChzd2lwZXIudG91Y2hFdmVudHMuc3RhcnQgPT09ICd0b3VjaHN0YXJ0Jykge1xuICAgICAgc2xpZGVzLm9mZihzd2lwZXIudG91Y2hFdmVudHMuc3RhcnQsIHpvb20ub25HZXN0dXJlU3RhcnQsIHBhc3NpdmVMaXN0ZW5lcik7XG4gICAgICBzbGlkZXMub2ZmKHN3aXBlci50b3VjaEV2ZW50cy5tb3ZlLCB6b29tLm9uR2VzdHVyZUNoYW5nZSwgcGFzc2l2ZUxpc3RlbmVyKTtcbiAgICAgIHNsaWRlcy5vZmYoc3dpcGVyLnRvdWNoRXZlbnRzLmVuZCwgem9vbS5vbkdlc3R1cmVFbmQsIHBhc3NpdmVMaXN0ZW5lcik7XG4gICAgfVxuXG4gICAgLy8gTW92ZSBpbWFnZVxuICAgIHN3aXBlci5zbGlkZXMuZWFjaChmdW5jdGlvbiAoaW5kZXgsIHNsaWRlRWwpIHtcbiAgICAgIHZhciAkc2xpZGVFbCA9ICQkMShzbGlkZUVsKTtcbiAgICAgIGlmICgkc2xpZGVFbC5maW5kKChcIi5cIiArIChzd2lwZXIucGFyYW1zLnpvb20uY29udGFpbmVyQ2xhc3MpKSkubGVuZ3RoID4gMCkge1xuICAgICAgICAkc2xpZGVFbC5vZmYoc3dpcGVyLnRvdWNoRXZlbnRzLm1vdmUsIHpvb20ub25Ub3VjaE1vdmUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxufTtcblxudmFyIFpvb20kMSA9IHtcbiAgbmFtZTogJ3pvb20nLFxuICBwYXJhbXM6IHtcbiAgICB6b29tOiB7XG4gICAgICBlbmFibGVkOiBmYWxzZSxcbiAgICAgIG1heFJhdGlvOiAzLFxuICAgICAgbWluUmF0aW86IDEsXG4gICAgICB0b2dnbGU6IHRydWUsXG4gICAgICBjb250YWluZXJDbGFzczogJ3N3aXBlci16b29tLWNvbnRhaW5lcicsXG4gICAgICB6b29tZWRTbGlkZUNsYXNzOiAnc3dpcGVyLXNsaWRlLXpvb21lZCcsXG4gICAgfSxcbiAgfSxcbiAgY3JlYXRlOiBmdW5jdGlvbiBjcmVhdGUoKSB7XG4gICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgdmFyIHpvb20gPSB7XG4gICAgICBlbmFibGVkOiBmYWxzZSxcbiAgICAgIHNjYWxlOiAxLFxuICAgICAgY3VycmVudFNjYWxlOiAxLFxuICAgICAgaXNTY2FsaW5nOiBmYWxzZSxcbiAgICAgIGdlc3R1cmU6IHtcbiAgICAgICAgJHNsaWRlRWw6IHVuZGVmaW5lZCxcbiAgICAgICAgc2xpZGVXaWR0aDogdW5kZWZpbmVkLFxuICAgICAgICBzbGlkZUhlaWdodDogdW5kZWZpbmVkLFxuICAgICAgICAkaW1hZ2VFbDogdW5kZWZpbmVkLFxuICAgICAgICAkaW1hZ2VXcmFwRWw6IHVuZGVmaW5lZCxcbiAgICAgICAgbWF4UmF0aW86IDMsXG4gICAgICB9LFxuICAgICAgaW1hZ2U6IHtcbiAgICAgICAgaXNUb3VjaGVkOiB1bmRlZmluZWQsXG4gICAgICAgIGlzTW92ZWQ6IHVuZGVmaW5lZCxcbiAgICAgICAgY3VycmVudFg6IHVuZGVmaW5lZCxcbiAgICAgICAgY3VycmVudFk6IHVuZGVmaW5lZCxcbiAgICAgICAgbWluWDogdW5kZWZpbmVkLFxuICAgICAgICBtaW5ZOiB1bmRlZmluZWQsXG4gICAgICAgIG1heFg6IHVuZGVmaW5lZCxcbiAgICAgICAgbWF4WTogdW5kZWZpbmVkLFxuICAgICAgICB3aWR0aDogdW5kZWZpbmVkLFxuICAgICAgICBoZWlnaHQ6IHVuZGVmaW5lZCxcbiAgICAgICAgc3RhcnRYOiB1bmRlZmluZWQsXG4gICAgICAgIHN0YXJ0WTogdW5kZWZpbmVkLFxuICAgICAgICB0b3VjaGVzU3RhcnQ6IHt9LFxuICAgICAgICB0b3VjaGVzQ3VycmVudDoge30sXG4gICAgICB9LFxuICAgICAgdmVsb2NpdHk6IHtcbiAgICAgICAgeDogdW5kZWZpbmVkLFxuICAgICAgICB5OiB1bmRlZmluZWQsXG4gICAgICAgIHByZXZQb3NpdGlvblg6IHVuZGVmaW5lZCxcbiAgICAgICAgcHJldlBvc2l0aW9uWTogdW5kZWZpbmVkLFxuICAgICAgICBwcmV2VGltZTogdW5kZWZpbmVkLFxuICAgICAgfSxcbiAgICB9O1xuICAgICgnb25HZXN0dXJlU3RhcnQgb25HZXN0dXJlQ2hhbmdlIG9uR2VzdHVyZUVuZCBvblRvdWNoU3RhcnQgb25Ub3VjaE1vdmUgb25Ub3VjaEVuZCBvblRyYW5zaXRpb25FbmQgdG9nZ2xlIGVuYWJsZSBkaXNhYmxlIGluIG91dCcpLnNwbGl0KCcgJykuZm9yRWFjaChmdW5jdGlvbiAobWV0aG9kTmFtZSkge1xuICAgICAgem9vbVttZXRob2ROYW1lXSA9IFpvb21bbWV0aG9kTmFtZV0uYmluZChzd2lwZXIpO1xuICAgIH0pO1xuICAgIFV0aWxzLmV4dGVuZChzd2lwZXIsIHtcbiAgICAgIHpvb206IHpvb20sXG4gICAgfSk7XG4gIH0sXG4gIG9uOiB7XG4gICAgaW5pdDogZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgICAgaWYgKHN3aXBlci5wYXJhbXMuem9vbS5lbmFibGVkKSB7XG4gICAgICAgIHN3aXBlci56b29tLmVuYWJsZSgpO1xuICAgICAgfVxuICAgIH0sXG4gICAgZGVzdHJveTogZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgICAgc3dpcGVyLnpvb20uZGlzYWJsZSgpO1xuICAgIH0sXG4gICAgdG91Y2hTdGFydDogZnVuY3Rpb24gdG91Y2hTdGFydChlKSB7XG4gICAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICAgIGlmICghc3dpcGVyLnpvb20uZW5hYmxlZCkgeyByZXR1cm47IH1cbiAgICAgIHN3aXBlci56b29tLm9uVG91Y2hTdGFydChlKTtcbiAgICB9LFxuICAgIHRvdWNoRW5kOiBmdW5jdGlvbiB0b3VjaEVuZChlKSB7XG4gICAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICAgIGlmICghc3dpcGVyLnpvb20uZW5hYmxlZCkgeyByZXR1cm47IH1cbiAgICAgIHN3aXBlci56b29tLm9uVG91Y2hFbmQoZSk7XG4gICAgfSxcbiAgICBkb3VibGVUYXA6IGZ1bmN0aW9uIGRvdWJsZVRhcChlKSB7XG4gICAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICAgIGlmIChzd2lwZXIucGFyYW1zLnpvb20uZW5hYmxlZCAmJiBzd2lwZXIuem9vbS5lbmFibGVkICYmIHN3aXBlci5wYXJhbXMuem9vbS50b2dnbGUpIHtcbiAgICAgICAgc3dpcGVyLnpvb20udG9nZ2xlKGUpO1xuICAgICAgfVxuICAgIH0sXG4gICAgdHJhbnNpdGlvbkVuZDogZnVuY3Rpb24gdHJhbnNpdGlvbkVuZCgpIHtcbiAgICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgICAgaWYgKHN3aXBlci56b29tLmVuYWJsZWQgJiYgc3dpcGVyLnBhcmFtcy56b29tLmVuYWJsZWQpIHtcbiAgICAgICAgc3dpcGVyLnpvb20ub25UcmFuc2l0aW9uRW5kKCk7XG4gICAgICB9XG4gICAgfSxcbiAgfSxcbn07XG5cbnZhciBMYXp5ID0ge1xuICBsb2FkSW5TbGlkZTogZnVuY3Rpb24gbG9hZEluU2xpZGUoaW5kZXgsIGxvYWRJbkR1cGxpY2F0ZSkge1xuICAgIGlmICggbG9hZEluRHVwbGljYXRlID09PSB2b2lkIDAgKSBsb2FkSW5EdXBsaWNhdGUgPSB0cnVlO1xuXG4gICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgdmFyIHBhcmFtcyA9IHN3aXBlci5wYXJhbXMubGF6eTtcbiAgICBpZiAodHlwZW9mIGluZGV4ID09PSAndW5kZWZpbmVkJykgeyByZXR1cm47IH1cbiAgICBpZiAoc3dpcGVyLnNsaWRlcy5sZW5ndGggPT09IDApIHsgcmV0dXJuOyB9XG4gICAgdmFyIGlzVmlydHVhbCA9IHN3aXBlci52aXJ0dWFsICYmIHN3aXBlci5wYXJhbXMudmlydHVhbC5lbmFibGVkO1xuXG4gICAgdmFyICRzbGlkZUVsID0gaXNWaXJ0dWFsXG4gICAgICA/IHN3aXBlci4kd3JhcHBlckVsLmNoaWxkcmVuKChcIi5cIiArIChzd2lwZXIucGFyYW1zLnNsaWRlQ2xhc3MpICsgXCJbZGF0YS1zd2lwZXItc2xpZGUtaW5kZXg9XFxcIlwiICsgaW5kZXggKyBcIlxcXCJdXCIpKVxuICAgICAgOiBzd2lwZXIuc2xpZGVzLmVxKGluZGV4KTtcblxuICAgIHZhciAkaW1hZ2VzID0gJHNsaWRlRWwuZmluZCgoXCIuXCIgKyAocGFyYW1zLmVsZW1lbnRDbGFzcykgKyBcIjpub3QoLlwiICsgKHBhcmFtcy5sb2FkZWRDbGFzcykgKyBcIik6bm90KC5cIiArIChwYXJhbXMubG9hZGluZ0NsYXNzKSArIFwiKVwiKSk7XG4gICAgaWYgKCRzbGlkZUVsLmhhc0NsYXNzKHBhcmFtcy5lbGVtZW50Q2xhc3MpICYmICEkc2xpZGVFbC5oYXNDbGFzcyhwYXJhbXMubG9hZGVkQ2xhc3MpICYmICEkc2xpZGVFbC5oYXNDbGFzcyhwYXJhbXMubG9hZGluZ0NsYXNzKSkge1xuICAgICAgJGltYWdlcyA9ICRpbWFnZXMuYWRkKCRzbGlkZUVsWzBdKTtcbiAgICB9XG4gICAgaWYgKCRpbWFnZXMubGVuZ3RoID09PSAwKSB7IHJldHVybjsgfVxuXG4gICAgJGltYWdlcy5lYWNoKGZ1bmN0aW9uIChpbWFnZUluZGV4LCBpbWFnZUVsKSB7XG4gICAgICB2YXIgJGltYWdlRWwgPSAkJDEoaW1hZ2VFbCk7XG4gICAgICAkaW1hZ2VFbC5hZGRDbGFzcyhwYXJhbXMubG9hZGluZ0NsYXNzKTtcblxuICAgICAgdmFyIGJhY2tncm91bmQgPSAkaW1hZ2VFbC5hdHRyKCdkYXRhLWJhY2tncm91bmQnKTtcbiAgICAgIHZhciBzcmMgPSAkaW1hZ2VFbC5hdHRyKCdkYXRhLXNyYycpO1xuICAgICAgdmFyIHNyY3NldCA9ICRpbWFnZUVsLmF0dHIoJ2RhdGEtc3Jjc2V0Jyk7XG4gICAgICB2YXIgc2l6ZXMgPSAkaW1hZ2VFbC5hdHRyKCdkYXRhLXNpemVzJyk7XG5cbiAgICAgIHN3aXBlci5sb2FkSW1hZ2UoJGltYWdlRWxbMF0sIChzcmMgfHwgYmFja2dyb3VuZCksIHNyY3NldCwgc2l6ZXMsIGZhbHNlLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc3dpcGVyID09PSAndW5kZWZpbmVkJyB8fCBzd2lwZXIgPT09IG51bGwgfHwgIXN3aXBlciB8fCAoc3dpcGVyICYmICFzd2lwZXIucGFyYW1zKSB8fCBzd2lwZXIuZGVzdHJveWVkKSB7IHJldHVybjsgfVxuICAgICAgICBpZiAoYmFja2dyb3VuZCkge1xuICAgICAgICAgICRpbWFnZUVsLmNzcygnYmFja2dyb3VuZC1pbWFnZScsIChcInVybChcXFwiXCIgKyBiYWNrZ3JvdW5kICsgXCJcXFwiKVwiKSk7XG4gICAgICAgICAgJGltYWdlRWwucmVtb3ZlQXR0cignZGF0YS1iYWNrZ3JvdW5kJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHNyY3NldCkge1xuICAgICAgICAgICAgJGltYWdlRWwuYXR0cignc3Jjc2V0Jywgc3Jjc2V0KTtcbiAgICAgICAgICAgICRpbWFnZUVsLnJlbW92ZUF0dHIoJ2RhdGEtc3Jjc2V0Jyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChzaXplcykge1xuICAgICAgICAgICAgJGltYWdlRWwuYXR0cignc2l6ZXMnLCBzaXplcyk7XG4gICAgICAgICAgICAkaW1hZ2VFbC5yZW1vdmVBdHRyKCdkYXRhLXNpemVzJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChzcmMpIHtcbiAgICAgICAgICAgICRpbWFnZUVsLmF0dHIoJ3NyYycsIHNyYyk7XG4gICAgICAgICAgICAkaW1hZ2VFbC5yZW1vdmVBdHRyKCdkYXRhLXNyYycpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgICRpbWFnZUVsLmFkZENsYXNzKHBhcmFtcy5sb2FkZWRDbGFzcykucmVtb3ZlQ2xhc3MocGFyYW1zLmxvYWRpbmdDbGFzcyk7XG4gICAgICAgICRzbGlkZUVsLmZpbmQoKFwiLlwiICsgKHBhcmFtcy5wcmVsb2FkZXJDbGFzcykpKS5yZW1vdmUoKTtcbiAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMubG9vcCAmJiBsb2FkSW5EdXBsaWNhdGUpIHtcbiAgICAgICAgICB2YXIgc2xpZGVPcmlnaW5hbEluZGV4ID0gJHNsaWRlRWwuYXR0cignZGF0YS1zd2lwZXItc2xpZGUtaW5kZXgnKTtcbiAgICAgICAgICBpZiAoJHNsaWRlRWwuaGFzQ2xhc3Moc3dpcGVyLnBhcmFtcy5zbGlkZUR1cGxpY2F0ZUNsYXNzKSkge1xuICAgICAgICAgICAgdmFyIG9yaWdpbmFsU2xpZGUgPSBzd2lwZXIuJHdyYXBwZXJFbC5jaGlsZHJlbigoXCJbZGF0YS1zd2lwZXItc2xpZGUtaW5kZXg9XFxcIlwiICsgc2xpZGVPcmlnaW5hbEluZGV4ICsgXCJcXFwiXTpub3QoLlwiICsgKHN3aXBlci5wYXJhbXMuc2xpZGVEdXBsaWNhdGVDbGFzcykgKyBcIilcIikpO1xuICAgICAgICAgICAgc3dpcGVyLmxhenkubG9hZEluU2xpZGUob3JpZ2luYWxTbGlkZS5pbmRleCgpLCBmYWxzZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBkdXBsaWNhdGVkU2xpZGUgPSBzd2lwZXIuJHdyYXBwZXJFbC5jaGlsZHJlbigoXCIuXCIgKyAoc3dpcGVyLnBhcmFtcy5zbGlkZUR1cGxpY2F0ZUNsYXNzKSArIFwiW2RhdGEtc3dpcGVyLXNsaWRlLWluZGV4PVxcXCJcIiArIHNsaWRlT3JpZ2luYWxJbmRleCArIFwiXFxcIl1cIikpO1xuICAgICAgICAgICAgc3dpcGVyLmxhenkubG9hZEluU2xpZGUoZHVwbGljYXRlZFNsaWRlLmluZGV4KCksIGZhbHNlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc3dpcGVyLmVtaXQoJ2xhenlJbWFnZVJlYWR5JywgJHNsaWRlRWxbMF0sICRpbWFnZUVsWzBdKTtcbiAgICAgIH0pO1xuXG4gICAgICBzd2lwZXIuZW1pdCgnbGF6eUltYWdlTG9hZCcsICRzbGlkZUVsWzBdLCAkaW1hZ2VFbFswXSk7XG4gICAgfSk7XG4gIH0sXG4gIGxvYWQ6IGZ1bmN0aW9uIGxvYWQoKSB7XG4gICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgdmFyICR3cmFwcGVyRWwgPSBzd2lwZXIuJHdyYXBwZXJFbDtcbiAgICB2YXIgc3dpcGVyUGFyYW1zID0gc3dpcGVyLnBhcmFtcztcbiAgICB2YXIgc2xpZGVzID0gc3dpcGVyLnNsaWRlcztcbiAgICB2YXIgYWN0aXZlSW5kZXggPSBzd2lwZXIuYWN0aXZlSW5kZXg7XG4gICAgdmFyIGlzVmlydHVhbCA9IHN3aXBlci52aXJ0dWFsICYmIHN3aXBlclBhcmFtcy52aXJ0dWFsLmVuYWJsZWQ7XG4gICAgdmFyIHBhcmFtcyA9IHN3aXBlclBhcmFtcy5sYXp5O1xuXG4gICAgdmFyIHNsaWRlc1BlclZpZXcgPSBzd2lwZXJQYXJhbXMuc2xpZGVzUGVyVmlldztcbiAgICBpZiAoc2xpZGVzUGVyVmlldyA9PT0gJ2F1dG8nKSB7XG4gICAgICBzbGlkZXNQZXJWaWV3ID0gMDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzbGlkZUV4aXN0KGluZGV4KSB7XG4gICAgICBpZiAoaXNWaXJ0dWFsKSB7XG4gICAgICAgIGlmICgkd3JhcHBlckVsLmNoaWxkcmVuKChcIi5cIiArIChzd2lwZXJQYXJhbXMuc2xpZGVDbGFzcykgKyBcIltkYXRhLXN3aXBlci1zbGlkZS1pbmRleD1cXFwiXCIgKyBpbmRleCArIFwiXFxcIl1cIikpLmxlbmd0aCkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHNsaWRlc1tpbmRleF0pIHsgcmV0dXJuIHRydWU7IH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gc2xpZGVJbmRleChzbGlkZUVsKSB7XG4gICAgICBpZiAoaXNWaXJ0dWFsKSB7XG4gICAgICAgIHJldHVybiAkJDEoc2xpZGVFbCkuYXR0cignZGF0YS1zd2lwZXItc2xpZGUtaW5kZXgnKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAkJDEoc2xpZGVFbCkuaW5kZXgoKTtcbiAgICB9XG5cbiAgICBpZiAoIXN3aXBlci5sYXp5LmluaXRpYWxJbWFnZUxvYWRlZCkgeyBzd2lwZXIubGF6eS5pbml0aWFsSW1hZ2VMb2FkZWQgPSB0cnVlOyB9XG4gICAgaWYgKHN3aXBlci5wYXJhbXMud2F0Y2hTbGlkZXNWaXNpYmlsaXR5KSB7XG4gICAgICAkd3JhcHBlckVsLmNoaWxkcmVuKChcIi5cIiArIChzd2lwZXJQYXJhbXMuc2xpZGVWaXNpYmxlQ2xhc3MpKSkuZWFjaChmdW5jdGlvbiAoZWxJbmRleCwgc2xpZGVFbCkge1xuICAgICAgICB2YXIgaW5kZXggPSBpc1ZpcnR1YWwgPyAkJDEoc2xpZGVFbCkuYXR0cignZGF0YS1zd2lwZXItc2xpZGUtaW5kZXgnKSA6ICQkMShzbGlkZUVsKS5pbmRleCgpO1xuICAgICAgICBzd2lwZXIubGF6eS5sb2FkSW5TbGlkZShpbmRleCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHNsaWRlc1BlclZpZXcgPiAxKSB7XG4gICAgICBmb3IgKHZhciBpID0gYWN0aXZlSW5kZXg7IGkgPCBhY3RpdmVJbmRleCArIHNsaWRlc1BlclZpZXc7IGkgKz0gMSkge1xuICAgICAgICBpZiAoc2xpZGVFeGlzdChpKSkgeyBzd2lwZXIubGF6eS5sb2FkSW5TbGlkZShpKTsgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzd2lwZXIubGF6eS5sb2FkSW5TbGlkZShhY3RpdmVJbmRleCk7XG4gICAgfVxuICAgIGlmIChwYXJhbXMubG9hZFByZXZOZXh0KSB7XG4gICAgICBpZiAoc2xpZGVzUGVyVmlldyA+IDEgfHwgKHBhcmFtcy5sb2FkUHJldk5leHRBbW91bnQgJiYgcGFyYW1zLmxvYWRQcmV2TmV4dEFtb3VudCA+IDEpKSB7XG4gICAgICAgIHZhciBhbW91bnQgPSBwYXJhbXMubG9hZFByZXZOZXh0QW1vdW50O1xuICAgICAgICB2YXIgc3B2ID0gc2xpZGVzUGVyVmlldztcbiAgICAgICAgdmFyIG1heEluZGV4ID0gTWF0aC5taW4oYWN0aXZlSW5kZXggKyBzcHYgKyBNYXRoLm1heChhbW91bnQsIHNwdiksIHNsaWRlcy5sZW5ndGgpO1xuICAgICAgICB2YXIgbWluSW5kZXggPSBNYXRoLm1heChhY3RpdmVJbmRleCAtIE1hdGgubWF4KHNwdiwgYW1vdW50KSwgMCk7XG4gICAgICAgIC8vIE5leHQgU2xpZGVzXG4gICAgICAgIGZvciAodmFyIGkkMSA9IGFjdGl2ZUluZGV4ICsgc2xpZGVzUGVyVmlldzsgaSQxIDwgbWF4SW5kZXg7IGkkMSArPSAxKSB7XG4gICAgICAgICAgaWYgKHNsaWRlRXhpc3QoaSQxKSkgeyBzd2lwZXIubGF6eS5sb2FkSW5TbGlkZShpJDEpOyB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gUHJldiBTbGlkZXNcbiAgICAgICAgZm9yICh2YXIgaSQyID0gbWluSW5kZXg7IGkkMiA8IGFjdGl2ZUluZGV4OyBpJDIgKz0gMSkge1xuICAgICAgICAgIGlmIChzbGlkZUV4aXN0KGkkMikpIHsgc3dpcGVyLmxhenkubG9hZEluU2xpZGUoaSQyKTsgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgbmV4dFNsaWRlID0gJHdyYXBwZXJFbC5jaGlsZHJlbigoXCIuXCIgKyAoc3dpcGVyUGFyYW1zLnNsaWRlTmV4dENsYXNzKSkpO1xuICAgICAgICBpZiAobmV4dFNsaWRlLmxlbmd0aCA+IDApIHsgc3dpcGVyLmxhenkubG9hZEluU2xpZGUoc2xpZGVJbmRleChuZXh0U2xpZGUpKTsgfVxuXG4gICAgICAgIHZhciBwcmV2U2xpZGUgPSAkd3JhcHBlckVsLmNoaWxkcmVuKChcIi5cIiArIChzd2lwZXJQYXJhbXMuc2xpZGVQcmV2Q2xhc3MpKSk7XG4gICAgICAgIGlmIChwcmV2U2xpZGUubGVuZ3RoID4gMCkgeyBzd2lwZXIubGF6eS5sb2FkSW5TbGlkZShzbGlkZUluZGV4KHByZXZTbGlkZSkpOyB9XG4gICAgICB9XG4gICAgfVxuICB9LFxufTtcblxudmFyIExhenkkMSA9IHtcbiAgbmFtZTogJ2xhenknLFxuICBwYXJhbXM6IHtcbiAgICBsYXp5OiB7XG4gICAgICBlbmFibGVkOiBmYWxzZSxcbiAgICAgIGxvYWRQcmV2TmV4dDogZmFsc2UsXG4gICAgICBsb2FkUHJldk5leHRBbW91bnQ6IDEsXG4gICAgICBsb2FkT25UcmFuc2l0aW9uU3RhcnQ6IGZhbHNlLFxuXG4gICAgICBlbGVtZW50Q2xhc3M6ICdzd2lwZXItbGF6eScsXG4gICAgICBsb2FkaW5nQ2xhc3M6ICdzd2lwZXItbGF6eS1sb2FkaW5nJyxcbiAgICAgIGxvYWRlZENsYXNzOiAnc3dpcGVyLWxhenktbG9hZGVkJyxcbiAgICAgIHByZWxvYWRlckNsYXNzOiAnc3dpcGVyLWxhenktcHJlbG9hZGVyJyxcbiAgICB9LFxuICB9LFxuICBjcmVhdGU6IGZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICBVdGlscy5leHRlbmQoc3dpcGVyLCB7XG4gICAgICBsYXp5OiB7XG4gICAgICAgIGluaXRpYWxJbWFnZUxvYWRlZDogZmFsc2UsXG4gICAgICAgIGxvYWQ6IExhenkubG9hZC5iaW5kKHN3aXBlciksXG4gICAgICAgIGxvYWRJblNsaWRlOiBMYXp5LmxvYWRJblNsaWRlLmJpbmQoc3dpcGVyKSxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH0sXG4gIG9uOiB7XG4gICAgYmVmb3JlSW5pdDogZnVuY3Rpb24gYmVmb3JlSW5pdCgpIHtcbiAgICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgICAgaWYgKHN3aXBlci5wYXJhbXMubGF6eS5lbmFibGVkICYmIHN3aXBlci5wYXJhbXMucHJlbG9hZEltYWdlcykge1xuICAgICAgICBzd2lwZXIucGFyYW1zLnByZWxvYWRJbWFnZXMgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGluaXQ6IGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICAgIGlmIChzd2lwZXIucGFyYW1zLmxhenkuZW5hYmxlZCAmJiAhc3dpcGVyLnBhcmFtcy5sb29wICYmIHN3aXBlci5wYXJhbXMuaW5pdGlhbFNsaWRlID09PSAwKSB7XG4gICAgICAgIHN3aXBlci5sYXp5LmxvYWQoKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHNjcm9sbDogZnVuY3Rpb24gc2Nyb2xsKCkge1xuICAgICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgICBpZiAoc3dpcGVyLnBhcmFtcy5mcmVlTW9kZSAmJiAhc3dpcGVyLnBhcmFtcy5mcmVlTW9kZVN0aWNreSkge1xuICAgICAgICBzd2lwZXIubGF6eS5sb2FkKCk7XG4gICAgICB9XG4gICAgfSxcbiAgICByZXNpemU6IGZ1bmN0aW9uIHJlc2l6ZSgpIHtcbiAgICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgICAgaWYgKHN3aXBlci5wYXJhbXMubGF6eS5lbmFibGVkKSB7XG4gICAgICAgIHN3aXBlci5sYXp5LmxvYWQoKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHNjcm9sbGJhckRyYWdNb3ZlOiBmdW5jdGlvbiBzY3JvbGxiYXJEcmFnTW92ZSgpIHtcbiAgICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgICAgaWYgKHN3aXBlci5wYXJhbXMubGF6eS5lbmFibGVkKSB7XG4gICAgICAgIHN3aXBlci5sYXp5LmxvYWQoKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRyYW5zaXRpb25TdGFydDogZnVuY3Rpb24gdHJhbnNpdGlvblN0YXJ0KCkge1xuICAgICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgICBpZiAoc3dpcGVyLnBhcmFtcy5sYXp5LmVuYWJsZWQpIHtcbiAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMubGF6eS5sb2FkT25UcmFuc2l0aW9uU3RhcnQgfHwgKCFzd2lwZXIucGFyYW1zLmxhenkubG9hZE9uVHJhbnNpdGlvblN0YXJ0ICYmICFzd2lwZXIubGF6eS5pbml0aWFsSW1hZ2VMb2FkZWQpKSB7XG4gICAgICAgICAgc3dpcGVyLmxhenkubG9hZCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICB0cmFuc2l0aW9uRW5kOiBmdW5jdGlvbiB0cmFuc2l0aW9uRW5kKCkge1xuICAgICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgICBpZiAoc3dpcGVyLnBhcmFtcy5sYXp5LmVuYWJsZWQgJiYgIXN3aXBlci5wYXJhbXMubGF6eS5sb2FkT25UcmFuc2l0aW9uU3RhcnQpIHtcbiAgICAgICAgc3dpcGVyLmxhenkubG9hZCgpO1xuICAgICAgfVxuICAgIH0sXG4gIH0sXG59O1xuXG4vKiBlc2xpbnQgbm8tYml0d2lzZTogW1wiZXJyb3JcIiwgeyBcImFsbG93XCI6IFtcIj4+XCJdIH1dICovXG52YXIgQ29udHJvbGxlciA9IHtcbiAgTGluZWFyU3BsaW5lOiBmdW5jdGlvbiBMaW5lYXJTcGxpbmUoeCwgeSkge1xuICAgIHZhciBiaW5hcnlTZWFyY2ggPSAoZnVuY3Rpb24gc2VhcmNoKCkge1xuICAgICAgdmFyIG1heEluZGV4O1xuICAgICAgdmFyIG1pbkluZGV4O1xuICAgICAgdmFyIGd1ZXNzO1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChhcnJheSwgdmFsKSB7XG4gICAgICAgIG1pbkluZGV4ID0gLTE7XG4gICAgICAgIG1heEluZGV4ID0gYXJyYXkubGVuZ3RoO1xuICAgICAgICB3aGlsZSAobWF4SW5kZXggLSBtaW5JbmRleCA+IDEpIHtcbiAgICAgICAgICBndWVzcyA9IG1heEluZGV4ICsgbWluSW5kZXggPj4gMTtcbiAgICAgICAgICBpZiAoYXJyYXlbZ3Vlc3NdIDw9IHZhbCkge1xuICAgICAgICAgICAgbWluSW5kZXggPSBndWVzcztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWF4SW5kZXggPSBndWVzcztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1heEluZGV4O1xuICAgICAgfTtcbiAgICB9KCkpO1xuICAgIHRoaXMueCA9IHg7XG4gICAgdGhpcy55ID0geTtcbiAgICB0aGlzLmxhc3RJbmRleCA9IHgubGVuZ3RoIC0gMTtcbiAgICAvLyBHaXZlbiBhbiB4IHZhbHVlICh4MiksIHJldHVybiB0aGUgZXhwZWN0ZWQgeTIgdmFsdWU6XG4gICAgLy8gKHgxLHkxKSBpcyB0aGUga25vd24gcG9pbnQgYmVmb3JlIGdpdmVuIHZhbHVlLFxuICAgIC8vICh4Myx5MykgaXMgdGhlIGtub3duIHBvaW50IGFmdGVyIGdpdmVuIHZhbHVlLlxuICAgIHZhciBpMTtcbiAgICB2YXIgaTM7XG5cbiAgICB0aGlzLmludGVycG9sYXRlID0gZnVuY3Rpb24gaW50ZXJwb2xhdGUoeDIpIHtcbiAgICAgIGlmICgheDIpIHsgcmV0dXJuIDA7IH1cblxuICAgICAgLy8gR2V0IHRoZSBpbmRleGVzIG9mIHgxIGFuZCB4MyAodGhlIGFycmF5IGluZGV4ZXMgYmVmb3JlIGFuZCBhZnRlciBnaXZlbiB4Mik6XG4gICAgICBpMyA9IGJpbmFyeVNlYXJjaCh0aGlzLngsIHgyKTtcbiAgICAgIGkxID0gaTMgLSAxO1xuXG4gICAgICAvLyBXZSBoYXZlIG91ciBpbmRleGVzIGkxICYgaTMsIHNvIHdlIGNhbiBjYWxjdWxhdGUgYWxyZWFkeTpcbiAgICAgIC8vIHkyIDo9ICgoeDLiiJJ4MSkgw5cgKHkz4oiSeTEpKSDDtyAoeDPiiJJ4MSkgKyB5MVxuICAgICAgcmV0dXJuICgoKHgyIC0gdGhpcy54W2kxXSkgKiAodGhpcy55W2kzXSAtIHRoaXMueVtpMV0pKSAvICh0aGlzLnhbaTNdIC0gdGhpcy54W2kxXSkpICsgdGhpcy55W2kxXTtcbiAgICB9O1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuICAvLyB4eHg6IGZvciBub3cgaSB3aWxsIGp1c3Qgc2F2ZSBvbmUgc3BsaW5lIGZ1bmN0aW9uIHRvIHRvXG4gIGdldEludGVycG9sYXRlRnVuY3Rpb246IGZ1bmN0aW9uIGdldEludGVycG9sYXRlRnVuY3Rpb24oYykge1xuICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgIGlmICghc3dpcGVyLmNvbnRyb2xsZXIuc3BsaW5lKSB7XG4gICAgICBzd2lwZXIuY29udHJvbGxlci5zcGxpbmUgPSBzd2lwZXIucGFyYW1zLmxvb3AgP1xuICAgICAgICBuZXcgQ29udHJvbGxlci5MaW5lYXJTcGxpbmUoc3dpcGVyLnNsaWRlc0dyaWQsIGMuc2xpZGVzR3JpZCkgOlxuICAgICAgICBuZXcgQ29udHJvbGxlci5MaW5lYXJTcGxpbmUoc3dpcGVyLnNuYXBHcmlkLCBjLnNuYXBHcmlkKTtcbiAgICB9XG4gIH0sXG4gIHNldFRyYW5zbGF0ZTogZnVuY3Rpb24gc2V0VHJhbnNsYXRlKHNldFRyYW5zbGF0ZSQxLCBieUNvbnRyb2xsZXIpIHtcbiAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICB2YXIgY29udHJvbGxlZCA9IHN3aXBlci5jb250cm9sbGVyLmNvbnRyb2w7XG4gICAgdmFyIG11bHRpcGxpZXI7XG4gICAgdmFyIGNvbnRyb2xsZWRUcmFuc2xhdGU7XG4gICAgZnVuY3Rpb24gc2V0Q29udHJvbGxlZFRyYW5zbGF0ZShjKSB7XG4gICAgICAvLyB0aGlzIHdpbGwgY3JlYXRlIGFuIEludGVycG9sYXRlIGZ1bmN0aW9uIGJhc2VkIG9uIHRoZSBzbmFwR3JpZHNcbiAgICAgIC8vIHggaXMgdGhlIEdyaWQgb2YgdGhlIHNjcm9sbGVkIHNjcm9sbGVyIGFuZCB5IHdpbGwgYmUgdGhlIGNvbnRyb2xsZWQgc2Nyb2xsZXJcbiAgICAgIC8vIGl0IG1ha2VzIHNlbnNlIHRvIGNyZWF0ZSB0aGlzIG9ubHkgb25jZSBhbmQgcmVjYWxsIGl0IGZvciB0aGUgaW50ZXJwb2xhdGlvblxuICAgICAgLy8gdGhlIGZ1bmN0aW9uIGRvZXMgYSBsb3Qgb2YgdmFsdWUgY2FjaGluZyBmb3IgcGVyZm9ybWFuY2VcbiAgICAgIHZhciB0cmFuc2xhdGUgPSBjLnJ0bCAmJiBjLnBhcmFtcy5kaXJlY3Rpb24gPT09ICdob3Jpem9udGFsJyA/IC1zd2lwZXIudHJhbnNsYXRlIDogc3dpcGVyLnRyYW5zbGF0ZTtcbiAgICAgIGlmIChzd2lwZXIucGFyYW1zLmNvbnRyb2xsZXIuYnkgPT09ICdzbGlkZScpIHtcbiAgICAgICAgc3dpcGVyLmNvbnRyb2xsZXIuZ2V0SW50ZXJwb2xhdGVGdW5jdGlvbihjKTtcbiAgICAgICAgLy8gaSBhbSBub3Qgc3VyZSB3aHkgdGhlIHZhbHVlcyBoYXZlIHRvIGJlIG11bHRpcGxpY2F0ZWQgdGhpcyB3YXksIHRyaWVkIHRvIGludmVydCB0aGUgc25hcEdyaWRcbiAgICAgICAgLy8gYnV0IGl0IGRpZCBub3Qgd29yayBvdXRcbiAgICAgICAgY29udHJvbGxlZFRyYW5zbGF0ZSA9IC1zd2lwZXIuY29udHJvbGxlci5zcGxpbmUuaW50ZXJwb2xhdGUoLXRyYW5zbGF0ZSk7XG4gICAgICB9XG5cbiAgICAgIGlmICghY29udHJvbGxlZFRyYW5zbGF0ZSB8fCBzd2lwZXIucGFyYW1zLmNvbnRyb2xsZXIuYnkgPT09ICdjb250YWluZXInKSB7XG4gICAgICAgIG11bHRpcGxpZXIgPSAoYy5tYXhUcmFuc2xhdGUoKSAtIGMubWluVHJhbnNsYXRlKCkpIC8gKHN3aXBlci5tYXhUcmFuc2xhdGUoKSAtIHN3aXBlci5taW5UcmFuc2xhdGUoKSk7XG4gICAgICAgIGNvbnRyb2xsZWRUcmFuc2xhdGUgPSAoKHRyYW5zbGF0ZSAtIHN3aXBlci5taW5UcmFuc2xhdGUoKSkgKiBtdWx0aXBsaWVyKSArIGMubWluVHJhbnNsYXRlKCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChzd2lwZXIucGFyYW1zLmNvbnRyb2xsZXIuaW52ZXJzZSkge1xuICAgICAgICBjb250cm9sbGVkVHJhbnNsYXRlID0gYy5tYXhUcmFuc2xhdGUoKSAtIGNvbnRyb2xsZWRUcmFuc2xhdGU7XG4gICAgICB9XG4gICAgICBjLnVwZGF0ZVByb2dyZXNzKGNvbnRyb2xsZWRUcmFuc2xhdGUpO1xuICAgICAgYy5zZXRUcmFuc2xhdGUoY29udHJvbGxlZFRyYW5zbGF0ZSwgc3dpcGVyKTtcbiAgICAgIGMudXBkYXRlQWN0aXZlSW5kZXgoKTtcbiAgICAgIGMudXBkYXRlU2xpZGVzQ2xhc3NlcygpO1xuICAgIH1cbiAgICBpZiAoQXJyYXkuaXNBcnJheShjb250cm9sbGVkKSkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb250cm9sbGVkLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGlmIChjb250cm9sbGVkW2ldICE9PSBieUNvbnRyb2xsZXIgJiYgY29udHJvbGxlZFtpXSBpbnN0YW5jZW9mIFN3aXBlciQxKSB7XG4gICAgICAgICAgc2V0Q29udHJvbGxlZFRyYW5zbGF0ZShjb250cm9sbGVkW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoY29udHJvbGxlZCBpbnN0YW5jZW9mIFN3aXBlciQxICYmIGJ5Q29udHJvbGxlciAhPT0gY29udHJvbGxlZCkge1xuICAgICAgc2V0Q29udHJvbGxlZFRyYW5zbGF0ZShjb250cm9sbGVkKTtcbiAgICB9XG4gIH0sXG4gIHNldFRyYW5zaXRpb246IGZ1bmN0aW9uIHNldFRyYW5zaXRpb24oZHVyYXRpb24sIGJ5Q29udHJvbGxlcikge1xuICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgIHZhciBjb250cm9sbGVkID0gc3dpcGVyLmNvbnRyb2xsZXIuY29udHJvbDtcbiAgICB2YXIgaTtcbiAgICBmdW5jdGlvbiBzZXRDb250cm9sbGVkVHJhbnNpdGlvbihjKSB7XG4gICAgICBjLnNldFRyYW5zaXRpb24oZHVyYXRpb24sIHN3aXBlcik7XG4gICAgICBpZiAoZHVyYXRpb24gIT09IDApIHtcbiAgICAgICAgYy50cmFuc2l0aW9uU3RhcnQoKTtcbiAgICAgICAgYy4kd3JhcHBlckVsLnRyYW5zaXRpb25FbmQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGlmICghY29udHJvbGxlZCkgeyByZXR1cm47IH1cbiAgICAgICAgICBpZiAoYy5wYXJhbXMubG9vcCAmJiBzd2lwZXIucGFyYW1zLmNvbnRyb2xsZXIuYnkgPT09ICdzbGlkZScpIHtcbiAgICAgICAgICAgIGMubG9vcEZpeCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjLnRyYW5zaXRpb25FbmQoKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChBcnJheS5pc0FycmF5KGNvbnRyb2xsZWQpKSB7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgY29udHJvbGxlZC5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBpZiAoY29udHJvbGxlZFtpXSAhPT0gYnlDb250cm9sbGVyICYmIGNvbnRyb2xsZWRbaV0gaW5zdGFuY2VvZiBTd2lwZXIkMSkge1xuICAgICAgICAgIHNldENvbnRyb2xsZWRUcmFuc2l0aW9uKGNvbnRyb2xsZWRbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChjb250cm9sbGVkIGluc3RhbmNlb2YgU3dpcGVyJDEgJiYgYnlDb250cm9sbGVyICE9PSBjb250cm9sbGVkKSB7XG4gICAgICBzZXRDb250cm9sbGVkVHJhbnNpdGlvbihjb250cm9sbGVkKTtcbiAgICB9XG4gIH0sXG59O1xudmFyIENvbnRyb2xsZXIkMSA9IHtcbiAgbmFtZTogJ2NvbnRyb2xsZXInLFxuICBwYXJhbXM6IHtcbiAgICBjb250cm9sbGVyOiB7XG4gICAgICBjb250cm9sOiB1bmRlZmluZWQsXG4gICAgICBpbnZlcnNlOiBmYWxzZSxcbiAgICAgIGJ5OiAnc2xpZGUnLCAvLyBvciAnY29udGFpbmVyJ1xuICAgIH0sXG4gIH0sXG4gIGNyZWF0ZTogZnVuY3Rpb24gY3JlYXRlKCkge1xuICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgIFV0aWxzLmV4dGVuZChzd2lwZXIsIHtcbiAgICAgIGNvbnRyb2xsZXI6IHtcbiAgICAgICAgY29udHJvbDogc3dpcGVyLnBhcmFtcy5jb250cm9sbGVyLmNvbnRyb2wsXG4gICAgICAgIGdldEludGVycG9sYXRlRnVuY3Rpb246IENvbnRyb2xsZXIuZ2V0SW50ZXJwb2xhdGVGdW5jdGlvbi5iaW5kKHN3aXBlciksXG4gICAgICAgIHNldFRyYW5zbGF0ZTogQ29udHJvbGxlci5zZXRUcmFuc2xhdGUuYmluZChzd2lwZXIpLFxuICAgICAgICBzZXRUcmFuc2l0aW9uOiBDb250cm9sbGVyLnNldFRyYW5zaXRpb24uYmluZChzd2lwZXIpLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfSxcbiAgb246IHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgICAgaWYgKCFzd2lwZXIuY29udHJvbGxlci5jb250cm9sKSB7IHJldHVybjsgfVxuICAgICAgaWYgKHN3aXBlci5jb250cm9sbGVyLnNwbGluZSkge1xuICAgICAgICBzd2lwZXIuY29udHJvbGxlci5zcGxpbmUgPSB1bmRlZmluZWQ7XG4gICAgICAgIGRlbGV0ZSBzd2lwZXIuY29udHJvbGxlci5zcGxpbmU7XG4gICAgICB9XG4gICAgfSxcbiAgICByZXNpemU6IGZ1bmN0aW9uIHJlc2l6ZSgpIHtcbiAgICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgICAgaWYgKCFzd2lwZXIuY29udHJvbGxlci5jb250cm9sKSB7IHJldHVybjsgfVxuICAgICAgaWYgKHN3aXBlci5jb250cm9sbGVyLnNwbGluZSkge1xuICAgICAgICBzd2lwZXIuY29udHJvbGxlci5zcGxpbmUgPSB1bmRlZmluZWQ7XG4gICAgICAgIGRlbGV0ZSBzd2lwZXIuY29udHJvbGxlci5zcGxpbmU7XG4gICAgICB9XG4gICAgfSxcbiAgICBvYnNlcnZlclVwZGF0ZTogZnVuY3Rpb24gb2JzZXJ2ZXJVcGRhdGUoKSB7XG4gICAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICAgIGlmICghc3dpcGVyLmNvbnRyb2xsZXIuY29udHJvbCkgeyByZXR1cm47IH1cbiAgICAgIGlmIChzd2lwZXIuY29udHJvbGxlci5zcGxpbmUpIHtcbiAgICAgICAgc3dpcGVyLmNvbnRyb2xsZXIuc3BsaW5lID0gdW5kZWZpbmVkO1xuICAgICAgICBkZWxldGUgc3dpcGVyLmNvbnRyb2xsZXIuc3BsaW5lO1xuICAgICAgfVxuICAgIH0sXG4gICAgc2V0VHJhbnNsYXRlOiBmdW5jdGlvbiBzZXRUcmFuc2xhdGUodHJhbnNsYXRlLCBieUNvbnRyb2xsZXIpIHtcbiAgICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgICAgaWYgKCFzd2lwZXIuY29udHJvbGxlci5jb250cm9sKSB7IHJldHVybjsgfVxuICAgICAgc3dpcGVyLmNvbnRyb2xsZXIuc2V0VHJhbnNsYXRlKHRyYW5zbGF0ZSwgYnlDb250cm9sbGVyKTtcbiAgICB9LFxuICAgIHNldFRyYW5zaXRpb246IGZ1bmN0aW9uIHNldFRyYW5zaXRpb24oZHVyYXRpb24sIGJ5Q29udHJvbGxlcikge1xuICAgICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgICBpZiAoIXN3aXBlci5jb250cm9sbGVyLmNvbnRyb2wpIHsgcmV0dXJuOyB9XG4gICAgICBzd2lwZXIuY29udHJvbGxlci5zZXRUcmFuc2l0aW9uKGR1cmF0aW9uLCBieUNvbnRyb2xsZXIpO1xuICAgIH0sXG4gIH0sXG59O1xuXG52YXIgYTExeSA9IHtcbiAgbWFrZUVsRm9jdXNhYmxlOiBmdW5jdGlvbiBtYWtlRWxGb2N1c2FibGUoJGVsKSB7XG4gICAgJGVsLmF0dHIoJ3RhYkluZGV4JywgJzAnKTtcbiAgICByZXR1cm4gJGVsO1xuICB9LFxuICBhZGRFbFJvbGU6IGZ1bmN0aW9uIGFkZEVsUm9sZSgkZWwsIHJvbGUpIHtcbiAgICAkZWwuYXR0cigncm9sZScsIHJvbGUpO1xuICAgIHJldHVybiAkZWw7XG4gIH0sXG4gIGFkZEVsTGFiZWw6IGZ1bmN0aW9uIGFkZEVsTGFiZWwoJGVsLCBsYWJlbCkge1xuICAgICRlbC5hdHRyKCdhcmlhLWxhYmVsJywgbGFiZWwpO1xuICAgIHJldHVybiAkZWw7XG4gIH0sXG4gIGRpc2FibGVFbDogZnVuY3Rpb24gZGlzYWJsZUVsKCRlbCkge1xuICAgICRlbC5hdHRyKCdhcmlhLWRpc2FibGVkJywgdHJ1ZSk7XG4gICAgcmV0dXJuICRlbDtcbiAgfSxcbiAgZW5hYmxlRWw6IGZ1bmN0aW9uIGVuYWJsZUVsKCRlbCkge1xuICAgICRlbC5hdHRyKCdhcmlhLWRpc2FibGVkJywgZmFsc2UpO1xuICAgIHJldHVybiAkZWw7XG4gIH0sXG4gIG9uRW50ZXJLZXk6IGZ1bmN0aW9uIG9uRW50ZXJLZXkoZSkge1xuICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgIHZhciBwYXJhbXMgPSBzd2lwZXIucGFyYW1zLmExMXk7XG4gICAgaWYgKGUua2V5Q29kZSAhPT0gMTMpIHsgcmV0dXJuOyB9XG4gICAgdmFyICR0YXJnZXRFbCA9ICQkMShlLnRhcmdldCk7XG4gICAgaWYgKHN3aXBlci5uYXZpZ2F0aW9uICYmIHN3aXBlci5uYXZpZ2F0aW9uLiRuZXh0RWwgJiYgJHRhcmdldEVsLmlzKHN3aXBlci5uYXZpZ2F0aW9uLiRuZXh0RWwpKSB7XG4gICAgICBpZiAoIShzd2lwZXIuaXNFbmQgJiYgIXN3aXBlci5wYXJhbXMubG9vcCkpIHtcbiAgICAgICAgc3dpcGVyLnNsaWRlTmV4dCgpO1xuICAgICAgfVxuICAgICAgaWYgKHN3aXBlci5pc0VuZCkge1xuICAgICAgICBzd2lwZXIuYTExeS5ub3RpZnkocGFyYW1zLmxhc3RTbGlkZU1lc3NhZ2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3dpcGVyLmExMXkubm90aWZ5KHBhcmFtcy5uZXh0U2xpZGVNZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHN3aXBlci5uYXZpZ2F0aW9uICYmIHN3aXBlci5uYXZpZ2F0aW9uLiRwcmV2RWwgJiYgJHRhcmdldEVsLmlzKHN3aXBlci5uYXZpZ2F0aW9uLiRwcmV2RWwpKSB7XG4gICAgICBpZiAoIShzd2lwZXIuaXNCZWdpbm5pbmcgJiYgIXN3aXBlci5wYXJhbXMubG9vcCkpIHtcbiAgICAgICAgc3dpcGVyLnNsaWRlUHJldigpO1xuICAgICAgfVxuICAgICAgaWYgKHN3aXBlci5pc0JlZ2lubmluZykge1xuICAgICAgICBzd2lwZXIuYTExeS5ub3RpZnkocGFyYW1zLmZpcnN0U2xpZGVNZXNzYWdlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN3aXBlci5hMTF5Lm5vdGlmeShwYXJhbXMucHJldlNsaWRlTWVzc2FnZSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChzd2lwZXIucGFnaW5hdGlvbiAmJiAkdGFyZ2V0RWwuaXMoKFwiLlwiICsgKHN3aXBlci5wYXJhbXMucGFnaW5hdGlvbi5idWxsZXRDbGFzcykpKSkge1xuICAgICAgJHRhcmdldEVsWzBdLmNsaWNrKCk7XG4gICAgfVxuICB9LFxuICBub3RpZnk6IGZ1bmN0aW9uIG5vdGlmeShtZXNzYWdlKSB7XG4gICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgdmFyIG5vdGlmaWNhdGlvbiA9IHN3aXBlci5hMTF5LmxpdmVSZWdpb247XG4gICAgaWYgKG5vdGlmaWNhdGlvbi5sZW5ndGggPT09IDApIHsgcmV0dXJuOyB9XG4gICAgbm90aWZpY2F0aW9uLmh0bWwoJycpO1xuICAgIG5vdGlmaWNhdGlvbi5odG1sKG1lc3NhZ2UpO1xuICB9LFxuICB1cGRhdGVOYXZpZ2F0aW9uOiBmdW5jdGlvbiB1cGRhdGVOYXZpZ2F0aW9uKCkge1xuICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuXG4gICAgaWYgKHN3aXBlci5wYXJhbXMubG9vcCkgeyByZXR1cm47IH1cbiAgICB2YXIgcmVmID0gc3dpcGVyLm5hdmlnYXRpb247XG4gICAgdmFyICRuZXh0RWwgPSByZWYuJG5leHRFbDtcbiAgICB2YXIgJHByZXZFbCA9IHJlZi4kcHJldkVsO1xuXG4gICAgaWYgKCRwcmV2RWwgJiYgJHByZXZFbC5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAoc3dpcGVyLmlzQmVnaW5uaW5nKSB7XG4gICAgICAgIHN3aXBlci5hMTF5LmRpc2FibGVFbCgkcHJldkVsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN3aXBlci5hMTF5LmVuYWJsZUVsKCRwcmV2RWwpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoJG5leHRFbCAmJiAkbmV4dEVsLmxlbmd0aCA+IDApIHtcbiAgICAgIGlmIChzd2lwZXIuaXNFbmQpIHtcbiAgICAgICAgc3dpcGVyLmExMXkuZGlzYWJsZUVsKCRuZXh0RWwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3dpcGVyLmExMXkuZW5hYmxlRWwoJG5leHRFbCk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICB1cGRhdGVQYWdpbmF0aW9uOiBmdW5jdGlvbiB1cGRhdGVQYWdpbmF0aW9uKCkge1xuICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgIHZhciBwYXJhbXMgPSBzd2lwZXIucGFyYW1zLmExMXk7XG4gICAgaWYgKHN3aXBlci5wYWdpbmF0aW9uICYmIHN3aXBlci5wYXJhbXMucGFnaW5hdGlvbi5jbGlja2FibGUgJiYgc3dpcGVyLnBhZ2luYXRpb24uYnVsbGV0cyAmJiBzd2lwZXIucGFnaW5hdGlvbi5idWxsZXRzLmxlbmd0aCkge1xuICAgICAgc3dpcGVyLnBhZ2luYXRpb24uYnVsbGV0cy5lYWNoKGZ1bmN0aW9uIChidWxsZXRJbmRleCwgYnVsbGV0RWwpIHtcbiAgICAgICAgdmFyICRidWxsZXRFbCA9ICQkMShidWxsZXRFbCk7XG4gICAgICAgIHN3aXBlci5hMTF5Lm1ha2VFbEZvY3VzYWJsZSgkYnVsbGV0RWwpO1xuICAgICAgICBzd2lwZXIuYTExeS5hZGRFbFJvbGUoJGJ1bGxldEVsLCAnYnV0dG9uJyk7XG4gICAgICAgIHN3aXBlci5hMTF5LmFkZEVsTGFiZWwoJGJ1bGxldEVsLCBwYXJhbXMucGFnaW5hdGlvbkJ1bGxldE1lc3NhZ2UucmVwbGFjZSgve3tpbmRleH19LywgJGJ1bGxldEVsLmluZGV4KCkgKyAxKSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG4gIGluaXQ6IGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgdmFyIHN3aXBlciA9IHRoaXM7XG5cbiAgICBzd2lwZXIuJGVsLmFwcGVuZChzd2lwZXIuYTExeS5saXZlUmVnaW9uKTtcblxuICAgIC8vIE5hdmlnYXRpb25cbiAgICB2YXIgcGFyYW1zID0gc3dpcGVyLnBhcmFtcy5hMTF5O1xuICAgIHZhciAkbmV4dEVsO1xuICAgIHZhciAkcHJldkVsO1xuICAgIGlmIChzd2lwZXIubmF2aWdhdGlvbiAmJiBzd2lwZXIubmF2aWdhdGlvbi4kbmV4dEVsKSB7XG4gICAgICAkbmV4dEVsID0gc3dpcGVyLm5hdmlnYXRpb24uJG5leHRFbDtcbiAgICB9XG4gICAgaWYgKHN3aXBlci5uYXZpZ2F0aW9uICYmIHN3aXBlci5uYXZpZ2F0aW9uLiRwcmV2RWwpIHtcbiAgICAgICRwcmV2RWwgPSBzd2lwZXIubmF2aWdhdGlvbi4kcHJldkVsO1xuICAgIH1cbiAgICBpZiAoJG5leHRFbCkge1xuICAgICAgc3dpcGVyLmExMXkubWFrZUVsRm9jdXNhYmxlKCRuZXh0RWwpO1xuICAgICAgc3dpcGVyLmExMXkuYWRkRWxSb2xlKCRuZXh0RWwsICdidXR0b24nKTtcbiAgICAgIHN3aXBlci5hMTF5LmFkZEVsTGFiZWwoJG5leHRFbCwgcGFyYW1zLm5leHRTbGlkZU1lc3NhZ2UpO1xuICAgICAgJG5leHRFbC5vbigna2V5ZG93bicsIHN3aXBlci5hMTF5Lm9uRW50ZXJLZXkpO1xuICAgIH1cbiAgICBpZiAoJHByZXZFbCkge1xuICAgICAgc3dpcGVyLmExMXkubWFrZUVsRm9jdXNhYmxlKCRwcmV2RWwpO1xuICAgICAgc3dpcGVyLmExMXkuYWRkRWxSb2xlKCRwcmV2RWwsICdidXR0b24nKTtcbiAgICAgIHN3aXBlci5hMTF5LmFkZEVsTGFiZWwoJHByZXZFbCwgcGFyYW1zLnByZXZTbGlkZU1lc3NhZ2UpO1xuICAgICAgJHByZXZFbC5vbigna2V5ZG93bicsIHN3aXBlci5hMTF5Lm9uRW50ZXJLZXkpO1xuICAgIH1cblxuICAgIC8vIFBhZ2luYXRpb25cbiAgICBpZiAoc3dpcGVyLnBhZ2luYXRpb24gJiYgc3dpcGVyLnBhcmFtcy5wYWdpbmF0aW9uLmNsaWNrYWJsZSAmJiBzd2lwZXIucGFnaW5hdGlvbi5idWxsZXRzICYmIHN3aXBlci5wYWdpbmF0aW9uLmJ1bGxldHMubGVuZ3RoKSB7XG4gICAgICBzd2lwZXIucGFnaW5hdGlvbi4kZWwub24oJ2tleWRvd24nLCAoXCIuXCIgKyAoc3dpcGVyLnBhcmFtcy5wYWdpbmF0aW9uLmJ1bGxldENsYXNzKSksIHN3aXBlci5hMTF5Lm9uRW50ZXJLZXkpO1xuICAgIH1cbiAgfSxcbiAgZGVzdHJveTogZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICBpZiAoc3dpcGVyLmExMXkubGl2ZVJlZ2lvbiAmJiBzd2lwZXIuYTExeS5saXZlUmVnaW9uLmxlbmd0aCA+IDApIHsgc3dpcGVyLmExMXkubGl2ZVJlZ2lvbi5yZW1vdmUoKTsgfVxuXG4gICAgdmFyICRuZXh0RWw7XG4gICAgdmFyICRwcmV2RWw7XG4gICAgaWYgKHN3aXBlci5uYXZpZ2F0aW9uICYmIHN3aXBlci5uYXZpZ2F0aW9uLiRuZXh0RWwpIHtcbiAgICAgICRuZXh0RWwgPSBzd2lwZXIubmF2aWdhdGlvbi4kbmV4dEVsO1xuICAgIH1cbiAgICBpZiAoc3dpcGVyLm5hdmlnYXRpb24gJiYgc3dpcGVyLm5hdmlnYXRpb24uJHByZXZFbCkge1xuICAgICAgJHByZXZFbCA9IHN3aXBlci5uYXZpZ2F0aW9uLiRwcmV2RWw7XG4gICAgfVxuICAgIGlmICgkbmV4dEVsKSB7XG4gICAgICAkbmV4dEVsLm9mZigna2V5ZG93bicsIHN3aXBlci5hMTF5Lm9uRW50ZXJLZXkpO1xuICAgIH1cbiAgICBpZiAoJHByZXZFbCkge1xuICAgICAgJHByZXZFbC5vZmYoJ2tleWRvd24nLCBzd2lwZXIuYTExeS5vbkVudGVyS2V5KTtcbiAgICB9XG5cbiAgICAvLyBQYWdpbmF0aW9uXG4gICAgaWYgKHN3aXBlci5wYWdpbmF0aW9uICYmIHN3aXBlci5wYXJhbXMucGFnaW5hdGlvbi5jbGlja2FibGUgJiYgc3dpcGVyLnBhZ2luYXRpb24uYnVsbGV0cyAmJiBzd2lwZXIucGFnaW5hdGlvbi5idWxsZXRzLmxlbmd0aCkge1xuICAgICAgc3dpcGVyLnBhZ2luYXRpb24uJGVsLm9mZigna2V5ZG93bicsIChcIi5cIiArIChzd2lwZXIucGFyYW1zLnBhZ2luYXRpb24uYnVsbGV0Q2xhc3MpKSwgc3dpcGVyLmExMXkub25FbnRlcktleSk7XG4gICAgfVxuICB9LFxufTtcbnZhciBBMTF5ID0ge1xuICBuYW1lOiAnYTExeScsXG4gIHBhcmFtczoge1xuICAgIGExMXk6IHtcbiAgICAgIGVuYWJsZWQ6IGZhbHNlLFxuICAgICAgbm90aWZpY2F0aW9uQ2xhc3M6ICdzd2lwZXItbm90aWZpY2F0aW9uJyxcbiAgICAgIHByZXZTbGlkZU1lc3NhZ2U6ICdQcmV2aW91cyBzbGlkZScsXG4gICAgICBuZXh0U2xpZGVNZXNzYWdlOiAnTmV4dCBzbGlkZScsXG4gICAgICBmaXJzdFNsaWRlTWVzc2FnZTogJ1RoaXMgaXMgdGhlIGZpcnN0IHNsaWRlJyxcbiAgICAgIGxhc3RTbGlkZU1lc3NhZ2U6ICdUaGlzIGlzIHRoZSBsYXN0IHNsaWRlJyxcbiAgICAgIHBhZ2luYXRpb25CdWxsZXRNZXNzYWdlOiAnR28gdG8gc2xpZGUge3tpbmRleH19JyxcbiAgICB9LFxuICB9LFxuICBjcmVhdGU6IGZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICBVdGlscy5leHRlbmQoc3dpcGVyLCB7XG4gICAgICBhMTF5OiB7XG4gICAgICAgIGxpdmVSZWdpb246ICQkMSgoXCI8c3BhbiBjbGFzcz1cXFwiXCIgKyAoc3dpcGVyLnBhcmFtcy5hMTF5Lm5vdGlmaWNhdGlvbkNsYXNzKSArIFwiXFxcIiBhcmlhLWxpdmU9XFxcImFzc2VydGl2ZVxcXCIgYXJpYS1hdG9taWM9XFxcInRydWVcXFwiPjwvc3Bhbj5cIikpLFxuICAgICAgfSxcbiAgICB9KTtcbiAgICBPYmplY3Qua2V5cyhhMTF5KS5mb3JFYWNoKGZ1bmN0aW9uIChtZXRob2ROYW1lKSB7XG4gICAgICBzd2lwZXIuYTExeVttZXRob2ROYW1lXSA9IGExMXlbbWV0aG9kTmFtZV0uYmluZChzd2lwZXIpO1xuICAgIH0pO1xuICB9LFxuICBvbjoge1xuICAgIGluaXQ6IGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICAgIGlmICghc3dpcGVyLnBhcmFtcy5hMTF5LmVuYWJsZWQpIHsgcmV0dXJuOyB9XG4gICAgICBzd2lwZXIuYTExeS5pbml0KCk7XG4gICAgICBzd2lwZXIuYTExeS51cGRhdGVOYXZpZ2F0aW9uKCk7XG4gICAgfSxcbiAgICB0b0VkZ2U6IGZ1bmN0aW9uIHRvRWRnZSgpIHtcbiAgICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgICAgaWYgKCFzd2lwZXIucGFyYW1zLmExMXkuZW5hYmxlZCkgeyByZXR1cm47IH1cbiAgICAgIHN3aXBlci5hMTF5LnVwZGF0ZU5hdmlnYXRpb24oKTtcbiAgICB9LFxuICAgIGZyb21FZGdlOiBmdW5jdGlvbiBmcm9tRWRnZSgpIHtcbiAgICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgICAgaWYgKCFzd2lwZXIucGFyYW1zLmExMXkuZW5hYmxlZCkgeyByZXR1cm47IH1cbiAgICAgIHN3aXBlci5hMTF5LnVwZGF0ZU5hdmlnYXRpb24oKTtcbiAgICB9LFxuICAgIHBhZ2luYXRpb25VcGRhdGU6IGZ1bmN0aW9uIHBhZ2luYXRpb25VcGRhdGUoKSB7XG4gICAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICAgIGlmICghc3dpcGVyLnBhcmFtcy5hMTF5LmVuYWJsZWQpIHsgcmV0dXJuOyB9XG4gICAgICBzd2lwZXIuYTExeS51cGRhdGVQYWdpbmF0aW9uKCk7XG4gICAgfSxcbiAgICBkZXN0cm95OiBmdW5jdGlvbiBkZXN0cm95KCkge1xuICAgICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgICBpZiAoIXN3aXBlci5wYXJhbXMuYTExeS5lbmFibGVkKSB7IHJldHVybjsgfVxuICAgICAgc3dpcGVyLmExMXkuZGVzdHJveSgpO1xuICAgIH0sXG4gIH0sXG59O1xuXG52YXIgSGlzdG9yeSA9IHtcbiAgaW5pdDogZnVuY3Rpb24gaW5pdCgpIHtcbiAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICBpZiAoIXN3aXBlci5wYXJhbXMuaGlzdG9yeSkgeyByZXR1cm47IH1cbiAgICBpZiAoIXdpbi5oaXN0b3J5IHx8ICF3aW4uaGlzdG9yeS5wdXNoU3RhdGUpIHtcbiAgICAgIHN3aXBlci5wYXJhbXMuaGlzdG9yeS5lbmFibGVkID0gZmFsc2U7XG4gICAgICBzd2lwZXIucGFyYW1zLmhhc2hOYXZpZ2F0aW9uLmVuYWJsZWQgPSB0cnVlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgaGlzdG9yeSA9IHN3aXBlci5oaXN0b3J5O1xuICAgIGhpc3RvcnkuaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgIGhpc3RvcnkucGF0aHMgPSBIaXN0b3J5LmdldFBhdGhWYWx1ZXMoKTtcbiAgICBpZiAoIWhpc3RvcnkucGF0aHMua2V5ICYmICFoaXN0b3J5LnBhdGhzLnZhbHVlKSB7IHJldHVybjsgfVxuICAgIGhpc3Rvcnkuc2Nyb2xsVG9TbGlkZSgwLCBoaXN0b3J5LnBhdGhzLnZhbHVlLCBzd2lwZXIucGFyYW1zLnJ1bkNhbGxiYWNrc09uSW5pdCk7XG4gICAgaWYgKCFzd2lwZXIucGFyYW1zLmhpc3RvcnkucmVwbGFjZVN0YXRlKSB7XG4gICAgICB3aW4uYWRkRXZlbnRMaXN0ZW5lcigncG9wc3RhdGUnLCBzd2lwZXIuaGlzdG9yeS5zZXRIaXN0b3J5UG9wU3RhdGUpO1xuICAgIH1cbiAgfSxcbiAgZGVzdHJveTogZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICBpZiAoIXN3aXBlci5wYXJhbXMuaGlzdG9yeS5yZXBsYWNlU3RhdGUpIHtcbiAgICAgIHdpbi5yZW1vdmVFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsIHN3aXBlci5oaXN0b3J5LnNldEhpc3RvcnlQb3BTdGF0ZSk7XG4gICAgfVxuICB9LFxuICBzZXRIaXN0b3J5UG9wU3RhdGU6IGZ1bmN0aW9uIHNldEhpc3RvcnlQb3BTdGF0ZSgpIHtcbiAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICBzd2lwZXIuaGlzdG9yeS5wYXRocyA9IEhpc3RvcnkuZ2V0UGF0aFZhbHVlcygpO1xuICAgIHN3aXBlci5oaXN0b3J5LnNjcm9sbFRvU2xpZGUoc3dpcGVyLnBhcmFtcy5zcGVlZCwgc3dpcGVyLmhpc3RvcnkucGF0aHMudmFsdWUsIGZhbHNlKTtcbiAgfSxcbiAgZ2V0UGF0aFZhbHVlczogZnVuY3Rpb24gZ2V0UGF0aFZhbHVlcygpIHtcbiAgICB2YXIgcGF0aEFycmF5ID0gd2luLmxvY2F0aW9uLnBhdGhuYW1lLnNsaWNlKDEpLnNwbGl0KCcvJykuZmlsdGVyKGZ1bmN0aW9uIChwYXJ0KSB7IHJldHVybiBwYXJ0ICE9PSAnJzsgfSk7XG4gICAgdmFyIHRvdGFsID0gcGF0aEFycmF5Lmxlbmd0aDtcbiAgICB2YXIga2V5ID0gcGF0aEFycmF5W3RvdGFsIC0gMl07XG4gICAgdmFyIHZhbHVlID0gcGF0aEFycmF5W3RvdGFsIC0gMV07XG4gICAgcmV0dXJuIHsga2V5OiBrZXksIHZhbHVlOiB2YWx1ZSB9O1xuICB9LFxuICBzZXRIaXN0b3J5OiBmdW5jdGlvbiBzZXRIaXN0b3J5KGtleSwgaW5kZXgpIHtcbiAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICBpZiAoIXN3aXBlci5oaXN0b3J5LmluaXRpYWxpemVkIHx8ICFzd2lwZXIucGFyYW1zLmhpc3RvcnkuZW5hYmxlZCkgeyByZXR1cm47IH1cbiAgICB2YXIgc2xpZGUgPSBzd2lwZXIuc2xpZGVzLmVxKGluZGV4KTtcbiAgICB2YXIgdmFsdWUgPSBIaXN0b3J5LnNsdWdpZnkoc2xpZGUuYXR0cignZGF0YS1oaXN0b3J5JykpO1xuICAgIGlmICghd2luLmxvY2F0aW9uLnBhdGhuYW1lLmluY2x1ZGVzKGtleSkpIHtcbiAgICAgIHZhbHVlID0ga2V5ICsgXCIvXCIgKyB2YWx1ZTtcbiAgICB9XG4gICAgdmFyIGN1cnJlbnRTdGF0ZSA9IHdpbi5oaXN0b3J5LnN0YXRlO1xuICAgIGlmIChjdXJyZW50U3RhdGUgJiYgY3VycmVudFN0YXRlLnZhbHVlID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoc3dpcGVyLnBhcmFtcy5oaXN0b3J5LnJlcGxhY2VTdGF0ZSkge1xuICAgICAgd2luLmhpc3RvcnkucmVwbGFjZVN0YXRlKHsgdmFsdWU6IHZhbHVlIH0sIG51bGwsIHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgd2luLmhpc3RvcnkucHVzaFN0YXRlKHsgdmFsdWU6IHZhbHVlIH0sIG51bGwsIHZhbHVlKTtcbiAgICB9XG4gIH0sXG4gIHNsdWdpZnk6IGZ1bmN0aW9uIHNsdWdpZnkodGV4dCkge1xuICAgIHJldHVybiB0ZXh0LnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKVxuICAgICAgLnJlcGxhY2UoL1xccysvZywgJy0nKVxuICAgICAgLnJlcGxhY2UoL1teXFx3LV0rL2csICcnKVxuICAgICAgLnJlcGxhY2UoLy0tKy9nLCAnLScpXG4gICAgICAucmVwbGFjZSgvXi0rLywgJycpXG4gICAgICAucmVwbGFjZSgvLSskLywgJycpO1xuICB9LFxuICBzY3JvbGxUb1NsaWRlOiBmdW5jdGlvbiBzY3JvbGxUb1NsaWRlKHNwZWVkLCB2YWx1ZSwgcnVuQ2FsbGJhY2tzKSB7XG4gICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gc3dpcGVyLnNsaWRlcy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB2YXIgc2xpZGUgPSBzd2lwZXIuc2xpZGVzLmVxKGkpO1xuICAgICAgICB2YXIgc2xpZGVIaXN0b3J5ID0gSGlzdG9yeS5zbHVnaWZ5KHNsaWRlLmF0dHIoJ2RhdGEtaGlzdG9yeScpKTtcbiAgICAgICAgaWYgKHNsaWRlSGlzdG9yeSA9PT0gdmFsdWUgJiYgIXNsaWRlLmhhc0NsYXNzKHN3aXBlci5wYXJhbXMuc2xpZGVEdXBsaWNhdGVDbGFzcykpIHtcbiAgICAgICAgICB2YXIgaW5kZXggPSBzbGlkZS5pbmRleCgpO1xuICAgICAgICAgIHN3aXBlci5zbGlkZVRvKGluZGV4LCBzcGVlZCwgcnVuQ2FsbGJhY2tzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzd2lwZXIuc2xpZGVUbygwLCBzcGVlZCwgcnVuQ2FsbGJhY2tzKTtcbiAgICB9XG4gIH0sXG59O1xuXG52YXIgSGlzdG9yeSQxID0ge1xuICBuYW1lOiAnaGlzdG9yeScsXG4gIHBhcmFtczoge1xuICAgIGhpc3Rvcnk6IHtcbiAgICAgIGVuYWJsZWQ6IGZhbHNlLFxuICAgICAgcmVwbGFjZVN0YXRlOiBmYWxzZSxcbiAgICAgIGtleTogJ3NsaWRlcycsXG4gICAgfSxcbiAgfSxcbiAgY3JlYXRlOiBmdW5jdGlvbiBjcmVhdGUoKSB7XG4gICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgVXRpbHMuZXh0ZW5kKHN3aXBlciwge1xuICAgICAgaGlzdG9yeToge1xuICAgICAgICBpbml0OiBIaXN0b3J5LmluaXQuYmluZChzd2lwZXIpLFxuICAgICAgICBzZXRIaXN0b3J5OiBIaXN0b3J5LnNldEhpc3RvcnkuYmluZChzd2lwZXIpLFxuICAgICAgICBzZXRIaXN0b3J5UG9wU3RhdGU6IEhpc3Rvcnkuc2V0SGlzdG9yeVBvcFN0YXRlLmJpbmQoc3dpcGVyKSxcbiAgICAgICAgc2Nyb2xsVG9TbGlkZTogSGlzdG9yeS5zY3JvbGxUb1NsaWRlLmJpbmQoc3dpcGVyKSxcbiAgICAgICAgZGVzdHJveTogSGlzdG9yeS5kZXN0cm95LmJpbmQoc3dpcGVyKSxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH0sXG4gIG9uOiB7XG4gICAgaW5pdDogZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgICAgaWYgKHN3aXBlci5wYXJhbXMuaGlzdG9yeS5lbmFibGVkKSB7XG4gICAgICAgIHN3aXBlci5oaXN0b3J5LmluaXQoKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGRlc3Ryb3k6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICAgIGlmIChzd2lwZXIucGFyYW1zLmhpc3RvcnkuZW5hYmxlZCkge1xuICAgICAgICBzd2lwZXIuaGlzdG9yeS5kZXN0cm95KCk7XG4gICAgICB9XG4gICAgfSxcbiAgICB0cmFuc2l0aW9uRW5kOiBmdW5jdGlvbiB0cmFuc2l0aW9uRW5kKCkge1xuICAgICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgICBpZiAoc3dpcGVyLmhpc3RvcnkuaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgc3dpcGVyLmhpc3Rvcnkuc2V0SGlzdG9yeShzd2lwZXIucGFyYW1zLmhpc3Rvcnkua2V5LCBzd2lwZXIuYWN0aXZlSW5kZXgpO1xuICAgICAgfVxuICAgIH0sXG4gIH0sXG59O1xuXG52YXIgSGFzaE5hdmlnYXRpb24gPSB7XG4gIG9uSGFzaENhbmdlOiBmdW5jdGlvbiBvbkhhc2hDYW5nZSgpIHtcbiAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICB2YXIgbmV3SGFzaCA9IGRvYy5sb2NhdGlvbi5oYXNoLnJlcGxhY2UoJyMnLCAnJyk7XG4gICAgdmFyIGFjdGl2ZVNsaWRlSGFzaCA9IHN3aXBlci5zbGlkZXMuZXEoc3dpcGVyLmFjdGl2ZUluZGV4KS5hdHRyKCdkYXRhLWhhc2gnKTtcbiAgICBpZiAobmV3SGFzaCAhPT0gYWN0aXZlU2xpZGVIYXNoKSB7XG4gICAgICBzd2lwZXIuc2xpZGVUbyhzd2lwZXIuJHdyYXBwZXJFbC5jaGlsZHJlbigoXCIuXCIgKyAoc3dpcGVyLnBhcmFtcy5zbGlkZUNsYXNzKSArIFwiW2RhdGEtaGFzaD1cXFwiXCIgKyBuZXdIYXNoICsgXCJcXFwiXVwiKSkuaW5kZXgoKSk7XG4gICAgfVxuICB9LFxuICBzZXRIYXNoOiBmdW5jdGlvbiBzZXRIYXNoKCkge1xuICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgIGlmICghc3dpcGVyLmhhc2hOYXZpZ2F0aW9uLmluaXRpYWxpemVkIHx8ICFzd2lwZXIucGFyYW1zLmhhc2hOYXZpZ2F0aW9uLmVuYWJsZWQpIHsgcmV0dXJuOyB9XG4gICAgaWYgKHN3aXBlci5wYXJhbXMuaGFzaE5hdmlnYXRpb24ucmVwbGFjZVN0YXRlICYmIHdpbi5oaXN0b3J5ICYmIHdpbi5oaXN0b3J5LnJlcGxhY2VTdGF0ZSkge1xuICAgICAgd2luLmhpc3RvcnkucmVwbGFjZVN0YXRlKG51bGwsIG51bGwsICgoXCIjXCIgKyAoc3dpcGVyLnNsaWRlcy5lcShzd2lwZXIuYWN0aXZlSW5kZXgpLmF0dHIoJ2RhdGEtaGFzaCcpKSkgfHwgJycpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHNsaWRlID0gc3dpcGVyLnNsaWRlcy5lcShzd2lwZXIuYWN0aXZlSW5kZXgpO1xuICAgICAgdmFyIGhhc2ggPSBzbGlkZS5hdHRyKCdkYXRhLWhhc2gnKSB8fCBzbGlkZS5hdHRyKCdkYXRhLWhpc3RvcnknKTtcbiAgICAgIGRvYy5sb2NhdGlvbi5oYXNoID0gaGFzaCB8fCAnJztcbiAgICB9XG4gIH0sXG4gIGluaXQ6IGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgaWYgKCFzd2lwZXIucGFyYW1zLmhhc2hOYXZpZ2F0aW9uLmVuYWJsZWQgfHwgKHN3aXBlci5wYXJhbXMuaGlzdG9yeSAmJiBzd2lwZXIucGFyYW1zLmhpc3RvcnkuZW5hYmxlZCkpIHsgcmV0dXJuOyB9XG4gICAgc3dpcGVyLmhhc2hOYXZpZ2F0aW9uLmluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICB2YXIgaGFzaCA9IGRvYy5sb2NhdGlvbi5oYXNoLnJlcGxhY2UoJyMnLCAnJyk7XG4gICAgaWYgKGhhc2gpIHtcbiAgICAgIHZhciBzcGVlZCA9IDA7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gc3dpcGVyLnNsaWRlcy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB2YXIgc2xpZGUgPSBzd2lwZXIuc2xpZGVzLmVxKGkpO1xuICAgICAgICB2YXIgc2xpZGVIYXNoID0gc2xpZGUuYXR0cignZGF0YS1oYXNoJykgfHwgc2xpZGUuYXR0cignZGF0YS1oaXN0b3J5Jyk7XG4gICAgICAgIGlmIChzbGlkZUhhc2ggPT09IGhhc2ggJiYgIXNsaWRlLmhhc0NsYXNzKHN3aXBlci5wYXJhbXMuc2xpZGVEdXBsaWNhdGVDbGFzcykpIHtcbiAgICAgICAgICB2YXIgaW5kZXggPSBzbGlkZS5pbmRleCgpO1xuICAgICAgICAgIHN3aXBlci5zbGlkZVRvKGluZGV4LCBzcGVlZCwgc3dpcGVyLnBhcmFtcy5ydW5DYWxsYmFja3NPbkluaXQsIHRydWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChzd2lwZXIucGFyYW1zLmhhc2hOYXZpZ2F0aW9uLndhdGNoU3RhdGUpIHtcbiAgICAgICQkMSh3aW4pLm9uKCdoYXNoY2hhbmdlJywgc3dpcGVyLmhhc2hOYXZpZ2F0aW9uLm9uSGFzaENhbmdlKTtcbiAgICB9XG4gIH0sXG4gIGRlc3Ryb3k6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgaWYgKHN3aXBlci5wYXJhbXMuaGFzaE5hdmlnYXRpb24ud2F0Y2hTdGF0ZSkge1xuICAgICAgJCQxKHdpbikub2ZmKCdoYXNoY2hhbmdlJywgc3dpcGVyLmhhc2hOYXZpZ2F0aW9uLm9uSGFzaENhbmdlKTtcbiAgICB9XG4gIH0sXG59O1xudmFyIEhhc2hOYXZpZ2F0aW9uJDEgPSB7XG4gIG5hbWU6ICdoYXNoLW5hdmlnYXRpb24nLFxuICBwYXJhbXM6IHtcbiAgICBoYXNoTmF2aWdhdGlvbjoge1xuICAgICAgZW5hYmxlZDogZmFsc2UsXG4gICAgICByZXBsYWNlU3RhdGU6IGZhbHNlLFxuICAgICAgd2F0Y2hTdGF0ZTogZmFsc2UsXG4gICAgfSxcbiAgfSxcbiAgY3JlYXRlOiBmdW5jdGlvbiBjcmVhdGUoKSB7XG4gICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgVXRpbHMuZXh0ZW5kKHN3aXBlciwge1xuICAgICAgaGFzaE5hdmlnYXRpb246IHtcbiAgICAgICAgaW5pdGlhbGl6ZWQ6IGZhbHNlLFxuICAgICAgICBpbml0OiBIYXNoTmF2aWdhdGlvbi5pbml0LmJpbmQoc3dpcGVyKSxcbiAgICAgICAgZGVzdHJveTogSGFzaE5hdmlnYXRpb24uZGVzdHJveS5iaW5kKHN3aXBlciksXG4gICAgICAgIHNldEhhc2g6IEhhc2hOYXZpZ2F0aW9uLnNldEhhc2guYmluZChzd2lwZXIpLFxuICAgICAgICBvbkhhc2hDYW5nZTogSGFzaE5hdmlnYXRpb24ub25IYXNoQ2FuZ2UuYmluZChzd2lwZXIpLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfSxcbiAgb246IHtcbiAgICBpbml0OiBmdW5jdGlvbiBpbml0KCkge1xuICAgICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgICBpZiAoc3dpcGVyLnBhcmFtcy5oYXNoTmF2aWdhdGlvbi5lbmFibGVkKSB7XG4gICAgICAgIHN3aXBlci5oYXNoTmF2aWdhdGlvbi5pbml0KCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBkZXN0cm95OiBmdW5jdGlvbiBkZXN0cm95KCkge1xuICAgICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgICBpZiAoc3dpcGVyLnBhcmFtcy5oYXNoTmF2aWdhdGlvbi5lbmFibGVkKSB7XG4gICAgICAgIHN3aXBlci5oYXNoTmF2aWdhdGlvbi5kZXN0cm95KCk7XG4gICAgICB9XG4gICAgfSxcbiAgICB0cmFuc2l0aW9uRW5kOiBmdW5jdGlvbiB0cmFuc2l0aW9uRW5kKCkge1xuICAgICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgICBpZiAoc3dpcGVyLmhhc2hOYXZpZ2F0aW9uLmluaXRpYWxpemVkKSB7XG4gICAgICAgIHN3aXBlci5oYXNoTmF2aWdhdGlvbi5zZXRIYXNoKCk7XG4gICAgICB9XG4gICAgfSxcbiAgfSxcbn07XG5cbnZhciBBdXRvcGxheSA9IHtcbiAgcnVuOiBmdW5jdGlvbiBydW4oKSB7XG4gICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgdmFyICRhY3RpdmVTbGlkZUVsID0gc3dpcGVyLnNsaWRlcy5lcShzd2lwZXIuYWN0aXZlSW5kZXgpO1xuICAgIHZhciBkZWxheSA9IHN3aXBlci5wYXJhbXMuYXV0b3BsYXkuZGVsYXk7XG4gICAgaWYgKCRhY3RpdmVTbGlkZUVsLmF0dHIoJ2RhdGEtc3dpcGVyLWF1dG9wbGF5JykpIHtcbiAgICAgIGRlbGF5ID0gJGFjdGl2ZVNsaWRlRWwuYXR0cignZGF0YS1zd2lwZXItYXV0b3BsYXknKSB8fCBzd2lwZXIucGFyYW1zLmF1dG9wbGF5LmRlbGF5O1xuICAgIH1cbiAgICBzd2lwZXIuYXV0b3BsYXkudGltZW91dCA9IFV0aWxzLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChzd2lwZXIucGFyYW1zLmxvb3ApIHtcbiAgICAgICAgc3dpcGVyLmxvb3BGaXgoKTtcbiAgICAgICAgc3dpcGVyLnNsaWRlTmV4dChzd2lwZXIucGFyYW1zLnNwZWVkLCB0cnVlLCB0cnVlKTtcbiAgICAgICAgc3dpcGVyLmVtaXQoJ2F1dG9wbGF5Jyk7XG4gICAgICB9IGVsc2UgaWYgKCFzd2lwZXIuaXNFbmQpIHtcbiAgICAgICAgc3dpcGVyLnNsaWRlTmV4dChzd2lwZXIucGFyYW1zLnNwZWVkLCB0cnVlLCB0cnVlKTtcbiAgICAgICAgc3dpcGVyLmVtaXQoJ2F1dG9wbGF5Jyk7XG4gICAgICB9IGVsc2UgaWYgKCFzd2lwZXIucGFyYW1zLmF1dG9wbGF5LnN0b3BPbkxhc3RTbGlkZSkge1xuICAgICAgICBzd2lwZXIuc2xpZGVUbygwLCBzd2lwZXIucGFyYW1zLnNwZWVkLCB0cnVlLCB0cnVlKTtcbiAgICAgICAgc3dpcGVyLmVtaXQoJ2F1dG9wbGF5Jyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzd2lwZXIuYXV0b3BsYXkuc3RvcCgpO1xuICAgICAgfVxuICAgIH0sIGRlbGF5KTtcbiAgfSxcbiAgc3RhcnQ6IGZ1bmN0aW9uIHN0YXJ0KCkge1xuICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgIGlmICh0eXBlb2Ygc3dpcGVyLmF1dG9wbGF5LnRpbWVvdXQgIT09ICd1bmRlZmluZWQnKSB7IHJldHVybiBmYWxzZTsgfVxuICAgIGlmIChzd2lwZXIuYXV0b3BsYXkucnVubmluZykgeyByZXR1cm4gZmFsc2U7IH1cbiAgICBzd2lwZXIuYXV0b3BsYXkucnVubmluZyA9IHRydWU7XG4gICAgc3dpcGVyLmVtaXQoJ2F1dG9wbGF5U3RhcnQnKTtcbiAgICBzd2lwZXIuYXV0b3BsYXkucnVuKCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gIHN0b3A6IGZ1bmN0aW9uIHN0b3AoKSB7XG4gICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgaWYgKCFzd2lwZXIuYXV0b3BsYXkucnVubmluZykgeyByZXR1cm4gZmFsc2U7IH1cbiAgICBpZiAodHlwZW9mIHN3aXBlci5hdXRvcGxheS50aW1lb3V0ID09PSAndW5kZWZpbmVkJykgeyByZXR1cm4gZmFsc2U7IH1cblxuICAgIGlmIChzd2lwZXIuYXV0b3BsYXkudGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHN3aXBlci5hdXRvcGxheS50aW1lb3V0KTtcbiAgICAgIHN3aXBlci5hdXRvcGxheS50aW1lb3V0ID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBzd2lwZXIuYXV0b3BsYXkucnVubmluZyA9IGZhbHNlO1xuICAgIHN3aXBlci5lbWl0KCdhdXRvcGxheVN0b3AnKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgcGF1c2U6IGZ1bmN0aW9uIHBhdXNlKHNwZWVkKSB7XG4gICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgaWYgKCFzd2lwZXIuYXV0b3BsYXkucnVubmluZykgeyByZXR1cm47IH1cbiAgICBpZiAoc3dpcGVyLmF1dG9wbGF5LnBhdXNlZCkgeyByZXR1cm47IH1cbiAgICBpZiAoc3dpcGVyLmF1dG9wbGF5LnRpbWVvdXQpIHsgY2xlYXJUaW1lb3V0KHN3aXBlci5hdXRvcGxheS50aW1lb3V0KTsgfVxuICAgIHN3aXBlci5hdXRvcGxheS5wYXVzZWQgPSB0cnVlO1xuICAgIGlmIChzcGVlZCA9PT0gMCkge1xuICAgICAgc3dpcGVyLmF1dG9wbGF5LnBhdXNlZCA9IGZhbHNlO1xuICAgICAgc3dpcGVyLmF1dG9wbGF5LnJ1bigpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzd2lwZXIuJHdyYXBwZXJFbC50cmFuc2l0aW9uRW5kKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCFzd2lwZXIgfHwgc3dpcGVyLmRlc3Ryb3llZCkgeyByZXR1cm47IH1cbiAgICAgICAgc3dpcGVyLmF1dG9wbGF5LnBhdXNlZCA9IGZhbHNlO1xuICAgICAgICBpZiAoIXN3aXBlci5hdXRvcGxheS5ydW5uaW5nKSB7XG4gICAgICAgICAgc3dpcGVyLmF1dG9wbGF5LnN0b3AoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzd2lwZXIuYXV0b3BsYXkucnVuKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcbn07XG5cbnZhciBBdXRvcGxheSQxID0ge1xuICBuYW1lOiAnYXV0b3BsYXknLFxuICBwYXJhbXM6IHtcbiAgICBhdXRvcGxheToge1xuICAgICAgZW5hYmxlZDogZmFsc2UsXG4gICAgICBkZWxheTogMzAwMCxcbiAgICAgIGRpc2FibGVPbkludGVyYWN0aW9uOiB0cnVlLFxuICAgICAgc3RvcE9uTGFzdFNsaWRlOiBmYWxzZSxcbiAgICB9LFxuICB9LFxuICBjcmVhdGU6IGZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICBVdGlscy5leHRlbmQoc3dpcGVyLCB7XG4gICAgICBhdXRvcGxheToge1xuICAgICAgICBydW5uaW5nOiBmYWxzZSxcbiAgICAgICAgcGF1c2VkOiBmYWxzZSxcbiAgICAgICAgcnVuOiBBdXRvcGxheS5ydW4uYmluZChzd2lwZXIpLFxuICAgICAgICBzdGFydDogQXV0b3BsYXkuc3RhcnQuYmluZChzd2lwZXIpLFxuICAgICAgICBzdG9wOiBBdXRvcGxheS5zdG9wLmJpbmQoc3dpcGVyKSxcbiAgICAgICAgcGF1c2U6IEF1dG9wbGF5LnBhdXNlLmJpbmQoc3dpcGVyKSxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH0sXG4gIG9uOiB7XG4gICAgaW5pdDogZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgICAgaWYgKHN3aXBlci5wYXJhbXMuYXV0b3BsYXkuZW5hYmxlZCkge1xuICAgICAgICBzd2lwZXIuYXV0b3BsYXkuc3RhcnQoKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGJlZm9yZVRyYW5zaXRpb25TdGFydDogZnVuY3Rpb24gYmVmb3JlVHJhbnNpdGlvblN0YXJ0KHNwZWVkLCBpbnRlcm5hbCkge1xuICAgICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgICBpZiAoc3dpcGVyLmF1dG9wbGF5LnJ1bm5pbmcpIHtcbiAgICAgICAgaWYgKGludGVybmFsIHx8ICFzd2lwZXIucGFyYW1zLmF1dG9wbGF5LmRpc2FibGVPbkludGVyYWN0aW9uKSB7XG4gICAgICAgICAgc3dpcGVyLmF1dG9wbGF5LnBhdXNlKHNwZWVkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzd2lwZXIuYXV0b3BsYXkuc3RvcCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBzbGlkZXJGaXJzdE1vdmU6IGZ1bmN0aW9uIHNsaWRlckZpcnN0TW92ZSgpIHtcbiAgICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgICAgaWYgKHN3aXBlci5hdXRvcGxheS5ydW5uaW5nKSB7XG4gICAgICAgIGlmIChzd2lwZXIucGFyYW1zLmF1dG9wbGF5LmRpc2FibGVPbkludGVyYWN0aW9uKSB7XG4gICAgICAgICAgc3dpcGVyLmF1dG9wbGF5LnN0b3AoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzd2lwZXIuYXV0b3BsYXkucGF1c2UoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgZGVzdHJveTogZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgICAgaWYgKHN3aXBlci5hdXRvcGxheS5ydW5uaW5nKSB7XG4gICAgICAgIHN3aXBlci5hdXRvcGxheS5zdG9wKCk7XG4gICAgICB9XG4gICAgfSxcbiAgfSxcbn07XG5cbnZhciBGYWRlID0ge1xuICBzZXRUcmFuc2xhdGU6IGZ1bmN0aW9uIHNldFRyYW5zbGF0ZSgpIHtcbiAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICB2YXIgc2xpZGVzID0gc3dpcGVyLnNsaWRlcztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsaWRlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgdmFyICRzbGlkZUVsID0gc3dpcGVyLnNsaWRlcy5lcShpKTtcbiAgICAgIHZhciBvZmZzZXQgPSAkc2xpZGVFbFswXS5zd2lwZXJTbGlkZU9mZnNldDtcbiAgICAgIHZhciB0eCA9IC1vZmZzZXQ7XG4gICAgICBpZiAoIXN3aXBlci5wYXJhbXMudmlydHVhbFRyYW5zbGF0ZSkgeyB0eCAtPSBzd2lwZXIudHJhbnNsYXRlOyB9XG4gICAgICB2YXIgdHkgPSAwO1xuICAgICAgaWYgKCFzd2lwZXIuaXNIb3Jpem9udGFsKCkpIHtcbiAgICAgICAgdHkgPSB0eDtcbiAgICAgICAgdHggPSAwO1xuICAgICAgfVxuICAgICAgdmFyIHNsaWRlT3BhY2l0eSA9IHN3aXBlci5wYXJhbXMuZmFkZUVmZmVjdC5jcm9zc0ZhZGUgP1xuICAgICAgICBNYXRoLm1heCgxIC0gTWF0aC5hYnMoJHNsaWRlRWxbMF0ucHJvZ3Jlc3MpLCAwKSA6XG4gICAgICAgIDEgKyBNYXRoLm1pbihNYXRoLm1heCgkc2xpZGVFbFswXS5wcm9ncmVzcywgLTEpLCAwKTtcbiAgICAgICRzbGlkZUVsXG4gICAgICAgIC5jc3Moe1xuICAgICAgICAgIG9wYWNpdHk6IHNsaWRlT3BhY2l0eSxcbiAgICAgICAgfSlcbiAgICAgICAgLnRyYW5zZm9ybSgoXCJ0cmFuc2xhdGUzZChcIiArIHR4ICsgXCJweCwgXCIgKyB0eSArIFwicHgsIDBweClcIikpO1xuICAgIH1cbiAgfSxcbiAgc2V0VHJhbnNpdGlvbjogZnVuY3Rpb24gc2V0VHJhbnNpdGlvbihkdXJhdGlvbikge1xuICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgIHZhciBzbGlkZXMgPSBzd2lwZXIuc2xpZGVzO1xuICAgIHZhciAkd3JhcHBlckVsID0gc3dpcGVyLiR3cmFwcGVyRWw7XG4gICAgc2xpZGVzLnRyYW5zaXRpb24oZHVyYXRpb24pO1xuICAgIGlmIChzd2lwZXIucGFyYW1zLnZpcnR1YWxUcmFuc2xhdGUgJiYgZHVyYXRpb24gIT09IDApIHtcbiAgICAgIHZhciBldmVudFRyaWdnZXJlZCA9IGZhbHNlO1xuICAgICAgc2xpZGVzLnRyYW5zaXRpb25FbmQoZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoZXZlbnRUcmlnZ2VyZWQpIHsgcmV0dXJuOyB9XG4gICAgICAgIGlmICghc3dpcGVyIHx8IHN3aXBlci5kZXN0cm95ZWQpIHsgcmV0dXJuOyB9XG4gICAgICAgIGV2ZW50VHJpZ2dlcmVkID0gdHJ1ZTtcbiAgICAgICAgc3dpcGVyLmFuaW1hdGluZyA9IGZhbHNlO1xuICAgICAgICB2YXIgdHJpZ2dlckV2ZW50cyA9IFsnd2Via2l0VHJhbnNpdGlvbkVuZCcsICd0cmFuc2l0aW9uZW5kJ107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdHJpZ2dlckV2ZW50cy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICR3cmFwcGVyRWwudHJpZ2dlcih0cmlnZ2VyRXZlbnRzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9LFxufTtcblxudmFyIEVmZmVjdEZhZGUgPSB7XG4gIG5hbWU6ICdlZmZlY3QtZmFkZScsXG4gIHBhcmFtczoge1xuICAgIGZhZGVFZmZlY3Q6IHtcbiAgICAgIGNyb3NzRmFkZTogZmFsc2UsXG4gICAgfSxcbiAgfSxcbiAgY3JlYXRlOiBmdW5jdGlvbiBjcmVhdGUoKSB7XG4gICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgVXRpbHMuZXh0ZW5kKHN3aXBlciwge1xuICAgICAgZmFkZUVmZmVjdDoge1xuICAgICAgICBzZXRUcmFuc2xhdGU6IEZhZGUuc2V0VHJhbnNsYXRlLmJpbmQoc3dpcGVyKSxcbiAgICAgICAgc2V0VHJhbnNpdGlvbjogRmFkZS5zZXRUcmFuc2l0aW9uLmJpbmQoc3dpcGVyKSxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH0sXG4gIG9uOiB7XG4gICAgYmVmb3JlSW5pdDogZnVuY3Rpb24gYmVmb3JlSW5pdCgpIHtcbiAgICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgICAgaWYgKHN3aXBlci5wYXJhbXMuZWZmZWN0ICE9PSAnZmFkZScpIHsgcmV0dXJuOyB9XG4gICAgICBzd2lwZXIuY2xhc3NOYW1lcy5wdXNoKCgoc3dpcGVyLnBhcmFtcy5jb250YWluZXJNb2RpZmllckNsYXNzKSArIFwiZmFkZVwiKSk7XG4gICAgICB2YXIgb3ZlcndyaXRlUGFyYW1zID0ge1xuICAgICAgICBzbGlkZXNQZXJWaWV3OiAxLFxuICAgICAgICBzbGlkZXNQZXJDb2x1bW46IDEsXG4gICAgICAgIHNsaWRlc1Blckdyb3VwOiAxLFxuICAgICAgICB3YXRjaFNsaWRlc1Byb2dyZXNzOiB0cnVlLFxuICAgICAgICBzcGFjZUJldHdlZW46IDAsXG4gICAgICAgIHZpcnR1YWxUcmFuc2xhdGU6IHRydWUsXG4gICAgICB9O1xuICAgICAgVXRpbHMuZXh0ZW5kKHN3aXBlci5wYXJhbXMsIG92ZXJ3cml0ZVBhcmFtcyk7XG4gICAgICBVdGlscy5leHRlbmQoc3dpcGVyLm9yaWdpbmFsUGFyYW1zLCBvdmVyd3JpdGVQYXJhbXMpO1xuICAgIH0sXG4gICAgc2V0VHJhbnNsYXRlOiBmdW5jdGlvbiBzZXRUcmFuc2xhdGUoKSB7XG4gICAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICAgIGlmIChzd2lwZXIucGFyYW1zLmVmZmVjdCAhPT0gJ2ZhZGUnKSB7IHJldHVybjsgfVxuICAgICAgc3dpcGVyLmZhZGVFZmZlY3Quc2V0VHJhbnNsYXRlKCk7XG4gICAgfSxcbiAgICBzZXRUcmFuc2l0aW9uOiBmdW5jdGlvbiBzZXRUcmFuc2l0aW9uKGR1cmF0aW9uKSB7XG4gICAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICAgIGlmIChzd2lwZXIucGFyYW1zLmVmZmVjdCAhPT0gJ2ZhZGUnKSB7IHJldHVybjsgfVxuICAgICAgc3dpcGVyLmZhZGVFZmZlY3Quc2V0VHJhbnNpdGlvbihkdXJhdGlvbik7XG4gICAgfSxcbiAgfSxcbn07XG5cbnZhciBDdWJlID0ge1xuICBzZXRUcmFuc2xhdGU6IGZ1bmN0aW9uIHNldFRyYW5zbGF0ZSgpIHtcbiAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICB2YXIgJGVsID0gc3dpcGVyLiRlbDtcbiAgICB2YXIgJHdyYXBwZXJFbCA9IHN3aXBlci4kd3JhcHBlckVsO1xuICAgIHZhciBzbGlkZXMgPSBzd2lwZXIuc2xpZGVzO1xuICAgIHZhciBzd2lwZXJXaWR0aCA9IHN3aXBlci53aWR0aDtcbiAgICB2YXIgc3dpcGVySGVpZ2h0ID0gc3dpcGVyLmhlaWdodDtcbiAgICB2YXIgcnRsID0gc3dpcGVyLnJ0bDtcbiAgICB2YXIgc3dpcGVyU2l6ZSA9IHN3aXBlci5zaXplO1xuICAgIHZhciBwYXJhbXMgPSBzd2lwZXIucGFyYW1zLmN1YmVFZmZlY3Q7XG4gICAgdmFyIGlzSG9yaXpvbnRhbCA9IHN3aXBlci5pc0hvcml6b250YWwoKTtcbiAgICB2YXIgaXNWaXJ0dWFsID0gc3dpcGVyLnZpcnR1YWwgJiYgc3dpcGVyLnBhcmFtcy52aXJ0dWFsLmVuYWJsZWQ7XG4gICAgdmFyIHdyYXBwZXJSb3RhdGUgPSAwO1xuICAgIHZhciAkY3ViZVNoYWRvd0VsO1xuICAgIGlmIChwYXJhbXMuc2hhZG93KSB7XG4gICAgICBpZiAoaXNIb3Jpem9udGFsKSB7XG4gICAgICAgICRjdWJlU2hhZG93RWwgPSAkd3JhcHBlckVsLmZpbmQoJy5zd2lwZXItY3ViZS1zaGFkb3cnKTtcbiAgICAgICAgaWYgKCRjdWJlU2hhZG93RWwubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgJGN1YmVTaGFkb3dFbCA9ICQkMSgnPGRpdiBjbGFzcz1cInN3aXBlci1jdWJlLXNoYWRvd1wiPjwvZGl2PicpO1xuICAgICAgICAgICR3cmFwcGVyRWwuYXBwZW5kKCRjdWJlU2hhZG93RWwpO1xuICAgICAgICB9XG4gICAgICAgICRjdWJlU2hhZG93RWwuY3NzKHsgaGVpZ2h0OiAoc3dpcGVyV2lkdGggKyBcInB4XCIpIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJGN1YmVTaGFkb3dFbCA9ICRlbC5maW5kKCcuc3dpcGVyLWN1YmUtc2hhZG93Jyk7XG4gICAgICAgIGlmICgkY3ViZVNoYWRvd0VsLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICRjdWJlU2hhZG93RWwgPSAkJDEoJzxkaXYgY2xhc3M9XCJzd2lwZXItY3ViZS1zaGFkb3dcIj48L2Rpdj4nKTtcbiAgICAgICAgICAkZWwuYXBwZW5kKCRjdWJlU2hhZG93RWwpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpZGVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICB2YXIgJHNsaWRlRWwgPSBzbGlkZXMuZXEoaSk7XG4gICAgICB2YXIgc2xpZGVJbmRleCA9IGk7XG4gICAgICBpZiAoaXNWaXJ0dWFsKSB7XG4gICAgICAgIHNsaWRlSW5kZXggPSBwYXJzZUludCgkc2xpZGVFbC5hdHRyKCdkYXRhLXN3aXBlci1zbGlkZS1pbmRleCcpLCAxMCk7XG4gICAgICB9XG4gICAgICB2YXIgc2xpZGVBbmdsZSA9IHNsaWRlSW5kZXggKiA5MDtcbiAgICAgIHZhciByb3VuZCA9IE1hdGguZmxvb3Ioc2xpZGVBbmdsZSAvIDM2MCk7XG4gICAgICBpZiAocnRsKSB7XG4gICAgICAgIHNsaWRlQW5nbGUgPSAtc2xpZGVBbmdsZTtcbiAgICAgICAgcm91bmQgPSBNYXRoLmZsb29yKC1zbGlkZUFuZ2xlIC8gMzYwKTtcbiAgICAgIH1cbiAgICAgIHZhciBwcm9ncmVzcyA9IE1hdGgubWF4KE1hdGgubWluKCRzbGlkZUVsWzBdLnByb2dyZXNzLCAxKSwgLTEpO1xuICAgICAgdmFyIHR4ID0gMDtcbiAgICAgIHZhciB0eSA9IDA7XG4gICAgICB2YXIgdHogPSAwO1xuICAgICAgaWYgKHNsaWRlSW5kZXggJSA0ID09PSAwKSB7XG4gICAgICAgIHR4ID0gLXJvdW5kICogNCAqIHN3aXBlclNpemU7XG4gICAgICAgIHR6ID0gMDtcbiAgICAgIH0gZWxzZSBpZiAoKHNsaWRlSW5kZXggLSAxKSAlIDQgPT09IDApIHtcbiAgICAgICAgdHggPSAwO1xuICAgICAgICB0eiA9IC1yb3VuZCAqIDQgKiBzd2lwZXJTaXplO1xuICAgICAgfSBlbHNlIGlmICgoc2xpZGVJbmRleCAtIDIpICUgNCA9PT0gMCkge1xuICAgICAgICB0eCA9IHN3aXBlclNpemUgKyAocm91bmQgKiA0ICogc3dpcGVyU2l6ZSk7XG4gICAgICAgIHR6ID0gc3dpcGVyU2l6ZTtcbiAgICAgIH0gZWxzZSBpZiAoKHNsaWRlSW5kZXggLSAzKSAlIDQgPT09IDApIHtcbiAgICAgICAgdHggPSAtc3dpcGVyU2l6ZTtcbiAgICAgICAgdHogPSAoMyAqIHN3aXBlclNpemUpICsgKHN3aXBlclNpemUgKiA0ICogcm91bmQpO1xuICAgICAgfVxuICAgICAgaWYgKHJ0bCkge1xuICAgICAgICB0eCA9IC10eDtcbiAgICAgIH1cblxuICAgICAgaWYgKCFpc0hvcml6b250YWwpIHtcbiAgICAgICAgdHkgPSB0eDtcbiAgICAgICAgdHggPSAwO1xuICAgICAgfVxuXG4gICAgICB2YXIgdHJhbnNmb3JtID0gXCJyb3RhdGVYKFwiICsgKGlzSG9yaXpvbnRhbCA/IDAgOiAtc2xpZGVBbmdsZSkgKyBcImRlZykgcm90YXRlWShcIiArIChpc0hvcml6b250YWwgPyBzbGlkZUFuZ2xlIDogMCkgKyBcImRlZykgdHJhbnNsYXRlM2QoXCIgKyB0eCArIFwicHgsIFwiICsgdHkgKyBcInB4LCBcIiArIHR6ICsgXCJweClcIjtcbiAgICAgIGlmIChwcm9ncmVzcyA8PSAxICYmIHByb2dyZXNzID4gLTEpIHtcbiAgICAgICAgd3JhcHBlclJvdGF0ZSA9IChzbGlkZUluZGV4ICogOTApICsgKHByb2dyZXNzICogOTApO1xuICAgICAgICBpZiAocnRsKSB7IHdyYXBwZXJSb3RhdGUgPSAoLXNsaWRlSW5kZXggKiA5MCkgLSAocHJvZ3Jlc3MgKiA5MCk7IH1cbiAgICAgIH1cbiAgICAgICRzbGlkZUVsLnRyYW5zZm9ybSh0cmFuc2Zvcm0pO1xuICAgICAgaWYgKHBhcmFtcy5zbGlkZVNoYWRvd3MpIHtcbiAgICAgICAgLy8gU2V0IHNoYWRvd3NcbiAgICAgICAgdmFyIHNoYWRvd0JlZm9yZSA9IGlzSG9yaXpvbnRhbCA/ICRzbGlkZUVsLmZpbmQoJy5zd2lwZXItc2xpZGUtc2hhZG93LWxlZnQnKSA6ICRzbGlkZUVsLmZpbmQoJy5zd2lwZXItc2xpZGUtc2hhZG93LXRvcCcpO1xuICAgICAgICB2YXIgc2hhZG93QWZ0ZXIgPSBpc0hvcml6b250YWwgPyAkc2xpZGVFbC5maW5kKCcuc3dpcGVyLXNsaWRlLXNoYWRvdy1yaWdodCcpIDogJHNsaWRlRWwuZmluZCgnLnN3aXBlci1zbGlkZS1zaGFkb3ctYm90dG9tJyk7XG4gICAgICAgIGlmIChzaGFkb3dCZWZvcmUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgc2hhZG93QmVmb3JlID0gJCQxKChcIjxkaXYgY2xhc3M9XFxcInN3aXBlci1zbGlkZS1zaGFkb3ctXCIgKyAoaXNIb3Jpem9udGFsID8gJ2xlZnQnIDogJ3RvcCcpICsgXCJcXFwiPjwvZGl2PlwiKSk7XG4gICAgICAgICAgJHNsaWRlRWwuYXBwZW5kKHNoYWRvd0JlZm9yZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNoYWRvd0FmdGVyLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHNoYWRvd0FmdGVyID0gJCQxKChcIjxkaXYgY2xhc3M9XFxcInN3aXBlci1zbGlkZS1zaGFkb3ctXCIgKyAoaXNIb3Jpem9udGFsID8gJ3JpZ2h0JyA6ICdib3R0b20nKSArIFwiXFxcIj48L2Rpdj5cIikpO1xuICAgICAgICAgICRzbGlkZUVsLmFwcGVuZChzaGFkb3dBZnRlcik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNoYWRvd0JlZm9yZS5sZW5ndGgpIHsgc2hhZG93QmVmb3JlWzBdLnN0eWxlLm9wYWNpdHkgPSBNYXRoLm1heCgtcHJvZ3Jlc3MsIDApOyB9XG4gICAgICAgIGlmIChzaGFkb3dBZnRlci5sZW5ndGgpIHsgc2hhZG93QWZ0ZXJbMF0uc3R5bGUub3BhY2l0eSA9IE1hdGgubWF4KHByb2dyZXNzLCAwKTsgfVxuICAgICAgfVxuICAgIH1cbiAgICAkd3JhcHBlckVsLmNzcyh7XG4gICAgICAnLXdlYmtpdC10cmFuc2Zvcm0tb3JpZ2luJzogKFwiNTAlIDUwJSAtXCIgKyAoc3dpcGVyU2l6ZSAvIDIpICsgXCJweFwiKSxcbiAgICAgICctbW96LXRyYW5zZm9ybS1vcmlnaW4nOiAoXCI1MCUgNTAlIC1cIiArIChzd2lwZXJTaXplIC8gMikgKyBcInB4XCIpLFxuICAgICAgJy1tcy10cmFuc2Zvcm0tb3JpZ2luJzogKFwiNTAlIDUwJSAtXCIgKyAoc3dpcGVyU2l6ZSAvIDIpICsgXCJweFwiKSxcbiAgICAgICd0cmFuc2Zvcm0tb3JpZ2luJzogKFwiNTAlIDUwJSAtXCIgKyAoc3dpcGVyU2l6ZSAvIDIpICsgXCJweFwiKSxcbiAgICB9KTtcblxuICAgIGlmIChwYXJhbXMuc2hhZG93KSB7XG4gICAgICBpZiAoaXNIb3Jpem9udGFsKSB7XG4gICAgICAgICRjdWJlU2hhZG93RWwudHJhbnNmb3JtKChcInRyYW5zbGF0ZTNkKDBweCwgXCIgKyAoKHN3aXBlcldpZHRoIC8gMikgKyBwYXJhbXMuc2hhZG93T2Zmc2V0KSArIFwicHgsIFwiICsgKC1zd2lwZXJXaWR0aCAvIDIpICsgXCJweCkgcm90YXRlWCg5MGRlZykgcm90YXRlWigwZGVnKSBzY2FsZShcIiArIChwYXJhbXMuc2hhZG93U2NhbGUpICsgXCIpXCIpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBzaGFkb3dBbmdsZSA9IE1hdGguYWJzKHdyYXBwZXJSb3RhdGUpIC0gKE1hdGguZmxvb3IoTWF0aC5hYnMod3JhcHBlclJvdGF0ZSkgLyA5MCkgKiA5MCk7XG4gICAgICAgIHZhciBtdWx0aXBsaWVyID0gMS41IC0gKFxuICAgICAgICAgIChNYXRoLnNpbigoc2hhZG93QW5nbGUgKiAyICogTWF0aC5QSSkgLyAzNjApIC8gMikgK1xuICAgICAgICAgIChNYXRoLmNvcygoc2hhZG93QW5nbGUgKiAyICogTWF0aC5QSSkgLyAzNjApIC8gMilcbiAgICAgICAgKTtcbiAgICAgICAgdmFyIHNjYWxlMSA9IHBhcmFtcy5zaGFkb3dTY2FsZTtcbiAgICAgICAgdmFyIHNjYWxlMiA9IHBhcmFtcy5zaGFkb3dTY2FsZSAvIG11bHRpcGxpZXI7XG4gICAgICAgIHZhciBvZmZzZXQgPSBwYXJhbXMuc2hhZG93T2Zmc2V0O1xuICAgICAgICAkY3ViZVNoYWRvd0VsLnRyYW5zZm9ybSgoXCJzY2FsZTNkKFwiICsgc2NhbGUxICsgXCIsIDEsIFwiICsgc2NhbGUyICsgXCIpIHRyYW5zbGF0ZTNkKDBweCwgXCIgKyAoKHN3aXBlckhlaWdodCAvIDIpICsgb2Zmc2V0KSArIFwicHgsIFwiICsgKC1zd2lwZXJIZWlnaHQgLyAyIC8gc2NhbGUyKSArIFwicHgpIHJvdGF0ZVgoLTkwZGVnKVwiKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHZhciB6RmFjdG9yID0gKEJyb3dzZXIuaXNTYWZhcmkgfHwgQnJvd3Nlci5pc1VpV2ViVmlldykgPyAoLXN3aXBlclNpemUgLyAyKSA6IDA7XG4gICAgJHdyYXBwZXJFbFxuICAgICAgLnRyYW5zZm9ybSgoXCJ0cmFuc2xhdGUzZCgwcHgsMCxcIiArIHpGYWN0b3IgKyBcInB4KSByb3RhdGVYKFwiICsgKHN3aXBlci5pc0hvcml6b250YWwoKSA/IDAgOiB3cmFwcGVyUm90YXRlKSArIFwiZGVnKSByb3RhdGVZKFwiICsgKHN3aXBlci5pc0hvcml6b250YWwoKSA/IC13cmFwcGVyUm90YXRlIDogMCkgKyBcImRlZylcIikpO1xuICB9LFxuICBzZXRUcmFuc2l0aW9uOiBmdW5jdGlvbiBzZXRUcmFuc2l0aW9uKGR1cmF0aW9uKSB7XG4gICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgdmFyICRlbCA9IHN3aXBlci4kZWw7XG4gICAgdmFyIHNsaWRlcyA9IHN3aXBlci5zbGlkZXM7XG4gICAgc2xpZGVzXG4gICAgICAudHJhbnNpdGlvbihkdXJhdGlvbilcbiAgICAgIC5maW5kKCcuc3dpcGVyLXNsaWRlLXNoYWRvdy10b3AsIC5zd2lwZXItc2xpZGUtc2hhZG93LXJpZ2h0LCAuc3dpcGVyLXNsaWRlLXNoYWRvdy1ib3R0b20sIC5zd2lwZXItc2xpZGUtc2hhZG93LWxlZnQnKVxuICAgICAgLnRyYW5zaXRpb24oZHVyYXRpb24pO1xuICAgIGlmIChzd2lwZXIucGFyYW1zLmN1YmVFZmZlY3Quc2hhZG93ICYmICFzd2lwZXIuaXNIb3Jpem9udGFsKCkpIHtcbiAgICAgICRlbC5maW5kKCcuc3dpcGVyLWN1YmUtc2hhZG93JykudHJhbnNpdGlvbihkdXJhdGlvbik7XG4gICAgfVxuICB9LFxufTtcblxudmFyIEVmZmVjdEN1YmUgPSB7XG4gIG5hbWU6ICdlZmZlY3QtY3ViZScsXG4gIHBhcmFtczoge1xuICAgIGN1YmVFZmZlY3Q6IHtcbiAgICAgIHNsaWRlU2hhZG93czogdHJ1ZSxcbiAgICAgIHNoYWRvdzogdHJ1ZSxcbiAgICAgIHNoYWRvd09mZnNldDogMjAsXG4gICAgICBzaGFkb3dTY2FsZTogMC45NCxcbiAgICB9LFxuICB9LFxuICBjcmVhdGU6IGZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICBVdGlscy5leHRlbmQoc3dpcGVyLCB7XG4gICAgICBjdWJlRWZmZWN0OiB7XG4gICAgICAgIHNldFRyYW5zbGF0ZTogQ3ViZS5zZXRUcmFuc2xhdGUuYmluZChzd2lwZXIpLFxuICAgICAgICBzZXRUcmFuc2l0aW9uOiBDdWJlLnNldFRyYW5zaXRpb24uYmluZChzd2lwZXIpLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfSxcbiAgb246IHtcbiAgICBiZWZvcmVJbml0OiBmdW5jdGlvbiBiZWZvcmVJbml0KCkge1xuICAgICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgICBpZiAoc3dpcGVyLnBhcmFtcy5lZmZlY3QgIT09ICdjdWJlJykgeyByZXR1cm47IH1cbiAgICAgIHN3aXBlci5jbGFzc05hbWVzLnB1c2goKChzd2lwZXIucGFyYW1zLmNvbnRhaW5lck1vZGlmaWVyQ2xhc3MpICsgXCJjdWJlXCIpKTtcbiAgICAgIHN3aXBlci5jbGFzc05hbWVzLnB1c2goKChzd2lwZXIucGFyYW1zLmNvbnRhaW5lck1vZGlmaWVyQ2xhc3MpICsgXCIzZFwiKSk7XG4gICAgICB2YXIgb3ZlcndyaXRlUGFyYW1zID0ge1xuICAgICAgICBzbGlkZXNQZXJWaWV3OiAxLFxuICAgICAgICBzbGlkZXNQZXJDb2x1bW46IDEsXG4gICAgICAgIHNsaWRlc1Blckdyb3VwOiAxLFxuICAgICAgICB3YXRjaFNsaWRlc1Byb2dyZXNzOiB0cnVlLFxuICAgICAgICByZXNpc3RhbmNlUmF0aW86IDAsXG4gICAgICAgIHNwYWNlQmV0d2VlbjogMCxcbiAgICAgICAgY2VudGVyZWRTbGlkZXM6IGZhbHNlLFxuICAgICAgICB2aXJ0dWFsVHJhbnNsYXRlOiB0cnVlLFxuICAgICAgfTtcbiAgICAgIFV0aWxzLmV4dGVuZChzd2lwZXIucGFyYW1zLCBvdmVyd3JpdGVQYXJhbXMpO1xuICAgICAgVXRpbHMuZXh0ZW5kKHN3aXBlci5vcmlnaW5hbFBhcmFtcywgb3ZlcndyaXRlUGFyYW1zKTtcbiAgICB9LFxuICAgIHNldFRyYW5zbGF0ZTogZnVuY3Rpb24gc2V0VHJhbnNsYXRlKCkge1xuICAgICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgICBpZiAoc3dpcGVyLnBhcmFtcy5lZmZlY3QgIT09ICdjdWJlJykgeyByZXR1cm47IH1cbiAgICAgIHN3aXBlci5jdWJlRWZmZWN0LnNldFRyYW5zbGF0ZSgpO1xuICAgIH0sXG4gICAgc2V0VHJhbnNpdGlvbjogZnVuY3Rpb24gc2V0VHJhbnNpdGlvbihkdXJhdGlvbikge1xuICAgICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgICBpZiAoc3dpcGVyLnBhcmFtcy5lZmZlY3QgIT09ICdjdWJlJykgeyByZXR1cm47IH1cbiAgICAgIHN3aXBlci5jdWJlRWZmZWN0LnNldFRyYW5zaXRpb24oZHVyYXRpb24pO1xuICAgIH0sXG4gIH0sXG59O1xuXG52YXIgRmxpcCA9IHtcbiAgc2V0VHJhbnNsYXRlOiBmdW5jdGlvbiBzZXRUcmFuc2xhdGUoKSB7XG4gICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgdmFyIHNsaWRlcyA9IHN3aXBlci5zbGlkZXM7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGlkZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIHZhciAkc2xpZGVFbCA9IHNsaWRlcy5lcShpKTtcbiAgICAgIHZhciBwcm9ncmVzcyA9ICRzbGlkZUVsWzBdLnByb2dyZXNzO1xuICAgICAgaWYgKHN3aXBlci5wYXJhbXMuZmxpcEVmZmVjdC5saW1pdFJvdGF0aW9uKSB7XG4gICAgICAgIHByb2dyZXNzID0gTWF0aC5tYXgoTWF0aC5taW4oJHNsaWRlRWxbMF0ucHJvZ3Jlc3MsIDEpLCAtMSk7XG4gICAgICB9XG4gICAgICB2YXIgb2Zmc2V0ID0gJHNsaWRlRWxbMF0uc3dpcGVyU2xpZGVPZmZzZXQ7XG4gICAgICB2YXIgcm90YXRlID0gLTE4MCAqIHByb2dyZXNzO1xuICAgICAgdmFyIHJvdGF0ZVkgPSByb3RhdGU7XG4gICAgICB2YXIgcm90YXRlWCA9IDA7XG4gICAgICB2YXIgdHggPSAtb2Zmc2V0O1xuICAgICAgdmFyIHR5ID0gMDtcbiAgICAgIGlmICghc3dpcGVyLmlzSG9yaXpvbnRhbCgpKSB7XG4gICAgICAgIHR5ID0gdHg7XG4gICAgICAgIHR4ID0gMDtcbiAgICAgICAgcm90YXRlWCA9IC1yb3RhdGVZO1xuICAgICAgICByb3RhdGVZID0gMDtcbiAgICAgIH0gZWxzZSBpZiAoc3dpcGVyLnJ0bCkge1xuICAgICAgICByb3RhdGVZID0gLXJvdGF0ZVk7XG4gICAgICB9XG5cbiAgICAgICRzbGlkZUVsWzBdLnN0eWxlLnpJbmRleCA9IC1NYXRoLmFicyhNYXRoLnJvdW5kKHByb2dyZXNzKSkgKyBzbGlkZXMubGVuZ3RoO1xuXG4gICAgICBpZiAoc3dpcGVyLnBhcmFtcy5mbGlwRWZmZWN0LnNsaWRlU2hhZG93cykge1xuICAgICAgICAvLyBTZXQgc2hhZG93c1xuICAgICAgICB2YXIgc2hhZG93QmVmb3JlID0gc3dpcGVyLmlzSG9yaXpvbnRhbCgpID8gJHNsaWRlRWwuZmluZCgnLnN3aXBlci1zbGlkZS1zaGFkb3ctbGVmdCcpIDogJHNsaWRlRWwuZmluZCgnLnN3aXBlci1zbGlkZS1zaGFkb3ctdG9wJyk7XG4gICAgICAgIHZhciBzaGFkb3dBZnRlciA9IHN3aXBlci5pc0hvcml6b250YWwoKSA/ICRzbGlkZUVsLmZpbmQoJy5zd2lwZXItc2xpZGUtc2hhZG93LXJpZ2h0JykgOiAkc2xpZGVFbC5maW5kKCcuc3dpcGVyLXNsaWRlLXNoYWRvdy1ib3R0b20nKTtcbiAgICAgICAgaWYgKHNoYWRvd0JlZm9yZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICBzaGFkb3dCZWZvcmUgPSAkJDEoKFwiPGRpdiBjbGFzcz1cXFwic3dpcGVyLXNsaWRlLXNoYWRvdy1cIiArIChzd2lwZXIuaXNIb3Jpem9udGFsKCkgPyAnbGVmdCcgOiAndG9wJykgKyBcIlxcXCI+PC9kaXY+XCIpKTtcbiAgICAgICAgICAkc2xpZGVFbC5hcHBlbmQoc2hhZG93QmVmb3JlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2hhZG93QWZ0ZXIubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgc2hhZG93QWZ0ZXIgPSAkJDEoKFwiPGRpdiBjbGFzcz1cXFwic3dpcGVyLXNsaWRlLXNoYWRvdy1cIiArIChzd2lwZXIuaXNIb3Jpem9udGFsKCkgPyAncmlnaHQnIDogJ2JvdHRvbScpICsgXCJcXFwiPjwvZGl2PlwiKSk7XG4gICAgICAgICAgJHNsaWRlRWwuYXBwZW5kKHNoYWRvd0FmdGVyKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2hhZG93QmVmb3JlLmxlbmd0aCkgeyBzaGFkb3dCZWZvcmVbMF0uc3R5bGUub3BhY2l0eSA9IE1hdGgubWF4KC1wcm9ncmVzcywgMCk7IH1cbiAgICAgICAgaWYgKHNoYWRvd0FmdGVyLmxlbmd0aCkgeyBzaGFkb3dBZnRlclswXS5zdHlsZS5vcGFjaXR5ID0gTWF0aC5tYXgocHJvZ3Jlc3MsIDApOyB9XG4gICAgICB9XG4gICAgICAkc2xpZGVFbFxuICAgICAgICAudHJhbnNmb3JtKChcInRyYW5zbGF0ZTNkKFwiICsgdHggKyBcInB4LCBcIiArIHR5ICsgXCJweCwgMHB4KSByb3RhdGVYKFwiICsgcm90YXRlWCArIFwiZGVnKSByb3RhdGVZKFwiICsgcm90YXRlWSArIFwiZGVnKVwiKSk7XG4gICAgfVxuICB9LFxuICBzZXRUcmFuc2l0aW9uOiBmdW5jdGlvbiBzZXRUcmFuc2l0aW9uKGR1cmF0aW9uKSB7XG4gICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgdmFyIHNsaWRlcyA9IHN3aXBlci5zbGlkZXM7XG4gICAgdmFyIGFjdGl2ZUluZGV4ID0gc3dpcGVyLmFjdGl2ZUluZGV4O1xuICAgIHZhciAkd3JhcHBlckVsID0gc3dpcGVyLiR3cmFwcGVyRWw7XG4gICAgc2xpZGVzXG4gICAgICAudHJhbnNpdGlvbihkdXJhdGlvbilcbiAgICAgIC5maW5kKCcuc3dpcGVyLXNsaWRlLXNoYWRvdy10b3AsIC5zd2lwZXItc2xpZGUtc2hhZG93LXJpZ2h0LCAuc3dpcGVyLXNsaWRlLXNoYWRvdy1ib3R0b20sIC5zd2lwZXItc2xpZGUtc2hhZG93LWxlZnQnKVxuICAgICAgLnRyYW5zaXRpb24oZHVyYXRpb24pO1xuICAgIGlmIChzd2lwZXIucGFyYW1zLnZpcnR1YWxUcmFuc2xhdGUgJiYgZHVyYXRpb24gIT09IDApIHtcbiAgICAgIHZhciBldmVudFRyaWdnZXJlZCA9IGZhbHNlO1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXG4gICAgICBzbGlkZXMuZXEoYWN0aXZlSW5kZXgpLnRyYW5zaXRpb25FbmQoZnVuY3Rpb24gb25UcmFuc2l0aW9uRW5kKCkge1xuICAgICAgICBpZiAoZXZlbnRUcmlnZ2VyZWQpIHsgcmV0dXJuOyB9XG4gICAgICAgIGlmICghc3dpcGVyIHx8IHN3aXBlci5kZXN0cm95ZWQpIHsgcmV0dXJuOyB9XG4gICAgICAgIC8vIGlmICghJCh0aGlzKS5oYXNDbGFzcyhzd2lwZXIucGFyYW1zLnNsaWRlQWN0aXZlQ2xhc3MpKSByZXR1cm47XG4gICAgICAgIGV2ZW50VHJpZ2dlcmVkID0gdHJ1ZTtcbiAgICAgICAgc3dpcGVyLmFuaW1hdGluZyA9IGZhbHNlO1xuICAgICAgICB2YXIgdHJpZ2dlckV2ZW50cyA9IFsnd2Via2l0VHJhbnNpdGlvbkVuZCcsICd0cmFuc2l0aW9uZW5kJ107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdHJpZ2dlckV2ZW50cy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICR3cmFwcGVyRWwudHJpZ2dlcih0cmlnZ2VyRXZlbnRzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9LFxufTtcblxudmFyIEVmZmVjdEZsaXAgPSB7XG4gIG5hbWU6ICdlZmZlY3QtZmxpcCcsXG4gIHBhcmFtczoge1xuICAgIGZsaXBFZmZlY3Q6IHtcbiAgICAgIHNsaWRlU2hhZG93czogdHJ1ZSxcbiAgICAgIGxpbWl0Um90YXRpb246IHRydWUsXG4gICAgfSxcbiAgfSxcbiAgY3JlYXRlOiBmdW5jdGlvbiBjcmVhdGUoKSB7XG4gICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgVXRpbHMuZXh0ZW5kKHN3aXBlciwge1xuICAgICAgZmxpcEVmZmVjdDoge1xuICAgICAgICBzZXRUcmFuc2xhdGU6IEZsaXAuc2V0VHJhbnNsYXRlLmJpbmQoc3dpcGVyKSxcbiAgICAgICAgc2V0VHJhbnNpdGlvbjogRmxpcC5zZXRUcmFuc2l0aW9uLmJpbmQoc3dpcGVyKSxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH0sXG4gIG9uOiB7XG4gICAgYmVmb3JlSW5pdDogZnVuY3Rpb24gYmVmb3JlSW5pdCgpIHtcbiAgICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgICAgaWYgKHN3aXBlci5wYXJhbXMuZWZmZWN0ICE9PSAnZmxpcCcpIHsgcmV0dXJuOyB9XG4gICAgICBzd2lwZXIuY2xhc3NOYW1lcy5wdXNoKCgoc3dpcGVyLnBhcmFtcy5jb250YWluZXJNb2RpZmllckNsYXNzKSArIFwiZmxpcFwiKSk7XG4gICAgICBzd2lwZXIuY2xhc3NOYW1lcy5wdXNoKCgoc3dpcGVyLnBhcmFtcy5jb250YWluZXJNb2RpZmllckNsYXNzKSArIFwiM2RcIikpO1xuICAgICAgdmFyIG92ZXJ3cml0ZVBhcmFtcyA9IHtcbiAgICAgICAgc2xpZGVzUGVyVmlldzogMSxcbiAgICAgICAgc2xpZGVzUGVyQ29sdW1uOiAxLFxuICAgICAgICBzbGlkZXNQZXJHcm91cDogMSxcbiAgICAgICAgd2F0Y2hTbGlkZXNQcm9ncmVzczogdHJ1ZSxcbiAgICAgICAgc3BhY2VCZXR3ZWVuOiAwLFxuICAgICAgICB2aXJ0dWFsVHJhbnNsYXRlOiB0cnVlLFxuICAgICAgfTtcbiAgICAgIFV0aWxzLmV4dGVuZChzd2lwZXIucGFyYW1zLCBvdmVyd3JpdGVQYXJhbXMpO1xuICAgICAgVXRpbHMuZXh0ZW5kKHN3aXBlci5vcmlnaW5hbFBhcmFtcywgb3ZlcndyaXRlUGFyYW1zKTtcbiAgICB9LFxuICAgIHNldFRyYW5zbGF0ZTogZnVuY3Rpb24gc2V0VHJhbnNsYXRlKCkge1xuICAgICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgICBpZiAoc3dpcGVyLnBhcmFtcy5lZmZlY3QgIT09ICdmbGlwJykgeyByZXR1cm47IH1cbiAgICAgIHN3aXBlci5mbGlwRWZmZWN0LnNldFRyYW5zbGF0ZSgpO1xuICAgIH0sXG4gICAgc2V0VHJhbnNpdGlvbjogZnVuY3Rpb24gc2V0VHJhbnNpdGlvbihkdXJhdGlvbikge1xuICAgICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgICBpZiAoc3dpcGVyLnBhcmFtcy5lZmZlY3QgIT09ICdmbGlwJykgeyByZXR1cm47IH1cbiAgICAgIHN3aXBlci5mbGlwRWZmZWN0LnNldFRyYW5zaXRpb24oZHVyYXRpb24pO1xuICAgIH0sXG4gIH0sXG59O1xuXG52YXIgQ292ZXJmbG93ID0ge1xuICBzZXRUcmFuc2xhdGU6IGZ1bmN0aW9uIHNldFRyYW5zbGF0ZSgpIHtcbiAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICB2YXIgc3dpcGVyV2lkdGggPSBzd2lwZXIud2lkdGg7XG4gICAgdmFyIHN3aXBlckhlaWdodCA9IHN3aXBlci5oZWlnaHQ7XG4gICAgdmFyIHNsaWRlcyA9IHN3aXBlci5zbGlkZXM7XG4gICAgdmFyICR3cmFwcGVyRWwgPSBzd2lwZXIuJHdyYXBwZXJFbDtcbiAgICB2YXIgc2xpZGVzU2l6ZXNHcmlkID0gc3dpcGVyLnNsaWRlc1NpemVzR3JpZDtcbiAgICB2YXIgcGFyYW1zID0gc3dpcGVyLnBhcmFtcy5jb3ZlcmZsb3dFZmZlY3Q7XG4gICAgdmFyIGlzSG9yaXpvbnRhbCA9IHN3aXBlci5pc0hvcml6b250YWwoKTtcbiAgICB2YXIgdHJhbnNmb3JtID0gc3dpcGVyLnRyYW5zbGF0ZTtcbiAgICB2YXIgY2VudGVyID0gaXNIb3Jpem9udGFsID8gLXRyYW5zZm9ybSArIChzd2lwZXJXaWR0aCAvIDIpIDogLXRyYW5zZm9ybSArIChzd2lwZXJIZWlnaHQgLyAyKTtcbiAgICB2YXIgcm90YXRlID0gaXNIb3Jpem9udGFsID8gcGFyYW1zLnJvdGF0ZSA6IC1wYXJhbXMucm90YXRlO1xuICAgIHZhciB0cmFuc2xhdGUgPSBwYXJhbXMuZGVwdGg7XG4gICAgLy8gRWFjaCBzbGlkZSBvZmZzZXQgZnJvbSBjZW50ZXJcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gc2xpZGVzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSArPSAxKSB7XG4gICAgICB2YXIgJHNsaWRlRWwgPSBzbGlkZXMuZXEoaSk7XG4gICAgICB2YXIgc2xpZGVTaXplID0gc2xpZGVzU2l6ZXNHcmlkW2ldO1xuICAgICAgdmFyIHNsaWRlT2Zmc2V0ID0gJHNsaWRlRWxbMF0uc3dpcGVyU2xpZGVPZmZzZXQ7XG4gICAgICB2YXIgb2Zmc2V0TXVsdGlwbGllciA9ICgoY2VudGVyIC0gc2xpZGVPZmZzZXQgLSAoc2xpZGVTaXplIC8gMikpIC8gc2xpZGVTaXplKSAqIHBhcmFtcy5tb2RpZmllcjtcblxuICAgICAgdmFyIHJvdGF0ZVkgPSBpc0hvcml6b250YWwgPyByb3RhdGUgKiBvZmZzZXRNdWx0aXBsaWVyIDogMDtcbiAgICAgIHZhciByb3RhdGVYID0gaXNIb3Jpem9udGFsID8gMCA6IHJvdGF0ZSAqIG9mZnNldE11bHRpcGxpZXI7XG4gICAgICAvLyB2YXIgcm90YXRlWiA9IDBcbiAgICAgIHZhciB0cmFuc2xhdGVaID0gLXRyYW5zbGF0ZSAqIE1hdGguYWJzKG9mZnNldE11bHRpcGxpZXIpO1xuXG4gICAgICB2YXIgdHJhbnNsYXRlWSA9IGlzSG9yaXpvbnRhbCA/IDAgOiBwYXJhbXMuc3RyZXRjaCAqIChvZmZzZXRNdWx0aXBsaWVyKTtcbiAgICAgIHZhciB0cmFuc2xhdGVYID0gaXNIb3Jpem9udGFsID8gcGFyYW1zLnN0cmV0Y2ggKiAob2Zmc2V0TXVsdGlwbGllcikgOiAwO1xuXG4gICAgICAvLyBGaXggZm9yIHVsdHJhIHNtYWxsIHZhbHVlc1xuICAgICAgaWYgKE1hdGguYWJzKHRyYW5zbGF0ZVgpIDwgMC4wMDEpIHsgdHJhbnNsYXRlWCA9IDA7IH1cbiAgICAgIGlmIChNYXRoLmFicyh0cmFuc2xhdGVZKSA8IDAuMDAxKSB7IHRyYW5zbGF0ZVkgPSAwOyB9XG4gICAgICBpZiAoTWF0aC5hYnModHJhbnNsYXRlWikgPCAwLjAwMSkgeyB0cmFuc2xhdGVaID0gMDsgfVxuICAgICAgaWYgKE1hdGguYWJzKHJvdGF0ZVkpIDwgMC4wMDEpIHsgcm90YXRlWSA9IDA7IH1cbiAgICAgIGlmIChNYXRoLmFicyhyb3RhdGVYKSA8IDAuMDAxKSB7IHJvdGF0ZVggPSAwOyB9XG5cbiAgICAgIHZhciBzbGlkZVRyYW5zZm9ybSA9IFwidHJhbnNsYXRlM2QoXCIgKyB0cmFuc2xhdGVYICsgXCJweCxcIiArIHRyYW5zbGF0ZVkgKyBcInB4LFwiICsgdHJhbnNsYXRlWiArIFwicHgpICByb3RhdGVYKFwiICsgcm90YXRlWCArIFwiZGVnKSByb3RhdGVZKFwiICsgcm90YXRlWSArIFwiZGVnKVwiO1xuXG4gICAgICAkc2xpZGVFbC50cmFuc2Zvcm0oc2xpZGVUcmFuc2Zvcm0pO1xuICAgICAgJHNsaWRlRWxbMF0uc3R5bGUuekluZGV4ID0gLU1hdGguYWJzKE1hdGgucm91bmQob2Zmc2V0TXVsdGlwbGllcikpICsgMTtcbiAgICAgIGlmIChwYXJhbXMuc2xpZGVTaGFkb3dzKSB7XG4gICAgICAgIC8vIFNldCBzaGFkb3dzXG4gICAgICAgIHZhciAkc2hhZG93QmVmb3JlRWwgPSBpc0hvcml6b250YWwgPyAkc2xpZGVFbC5maW5kKCcuc3dpcGVyLXNsaWRlLXNoYWRvdy1sZWZ0JykgOiAkc2xpZGVFbC5maW5kKCcuc3dpcGVyLXNsaWRlLXNoYWRvdy10b3AnKTtcbiAgICAgICAgdmFyICRzaGFkb3dBZnRlckVsID0gaXNIb3Jpem9udGFsID8gJHNsaWRlRWwuZmluZCgnLnN3aXBlci1zbGlkZS1zaGFkb3ctcmlnaHQnKSA6ICRzbGlkZUVsLmZpbmQoJy5zd2lwZXItc2xpZGUtc2hhZG93LWJvdHRvbScpO1xuICAgICAgICBpZiAoJHNoYWRvd0JlZm9yZUVsLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICRzaGFkb3dCZWZvcmVFbCA9ICQkMSgoXCI8ZGl2IGNsYXNzPVxcXCJzd2lwZXItc2xpZGUtc2hhZG93LVwiICsgKGlzSG9yaXpvbnRhbCA/ICdsZWZ0JyA6ICd0b3AnKSArIFwiXFxcIj48L2Rpdj5cIikpO1xuICAgICAgICAgICRzbGlkZUVsLmFwcGVuZCgkc2hhZG93QmVmb3JlRWwpO1xuICAgICAgICB9XG4gICAgICAgIGlmICgkc2hhZG93QWZ0ZXJFbC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAkc2hhZG93QWZ0ZXJFbCA9ICQkMSgoXCI8ZGl2IGNsYXNzPVxcXCJzd2lwZXItc2xpZGUtc2hhZG93LVwiICsgKGlzSG9yaXpvbnRhbCA/ICdyaWdodCcgOiAnYm90dG9tJykgKyBcIlxcXCI+PC9kaXY+XCIpKTtcbiAgICAgICAgICAkc2xpZGVFbC5hcHBlbmQoJHNoYWRvd0FmdGVyRWwpO1xuICAgICAgICB9XG4gICAgICAgIGlmICgkc2hhZG93QmVmb3JlRWwubGVuZ3RoKSB7ICRzaGFkb3dCZWZvcmVFbFswXS5zdHlsZS5vcGFjaXR5ID0gb2Zmc2V0TXVsdGlwbGllciA+IDAgPyBvZmZzZXRNdWx0aXBsaWVyIDogMDsgfVxuICAgICAgICBpZiAoJHNoYWRvd0FmdGVyRWwubGVuZ3RoKSB7ICRzaGFkb3dBZnRlckVsWzBdLnN0eWxlLm9wYWNpdHkgPSAoLW9mZnNldE11bHRpcGxpZXIpID4gMCA/IC1vZmZzZXRNdWx0aXBsaWVyIDogMDsgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNldCBjb3JyZWN0IHBlcnNwZWN0aXZlIGZvciBJRTEwXG4gICAgaWYgKEJyb3dzZXIuaWUpIHtcbiAgICAgIHZhciB3cyA9ICR3cmFwcGVyRWxbMF0uc3R5bGU7XG4gICAgICB3cy5wZXJzcGVjdGl2ZU9yaWdpbiA9IGNlbnRlciArIFwicHggNTAlXCI7XG4gICAgfVxuICB9LFxuICBzZXRUcmFuc2l0aW9uOiBmdW5jdGlvbiBzZXRUcmFuc2l0aW9uKGR1cmF0aW9uKSB7XG4gICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgc3dpcGVyLnNsaWRlc1xuICAgICAgLnRyYW5zaXRpb24oZHVyYXRpb24pXG4gICAgICAuZmluZCgnLnN3aXBlci1zbGlkZS1zaGFkb3ctdG9wLCAuc3dpcGVyLXNsaWRlLXNoYWRvdy1yaWdodCwgLnN3aXBlci1zbGlkZS1zaGFkb3ctYm90dG9tLCAuc3dpcGVyLXNsaWRlLXNoYWRvdy1sZWZ0JylcbiAgICAgIC50cmFuc2l0aW9uKGR1cmF0aW9uKTtcbiAgfSxcbn07XG5cbnZhciBFZmZlY3RDb3ZlcmZsb3cgPSB7XG4gIG5hbWU6ICdlZmZlY3QtY292ZXJmbG93JyxcbiAgcGFyYW1zOiB7XG4gICAgY292ZXJmbG93RWZmZWN0OiB7XG4gICAgICByb3RhdGU6IDUwLFxuICAgICAgc3RyZXRjaDogMCxcbiAgICAgIGRlcHRoOiAxMDAsXG4gICAgICBtb2RpZmllcjogMSxcbiAgICAgIHNsaWRlU2hhZG93czogdHJ1ZSxcbiAgICB9LFxuICB9LFxuICBjcmVhdGU6IGZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICBVdGlscy5leHRlbmQoc3dpcGVyLCB7XG4gICAgICBjb3ZlcmZsb3dFZmZlY3Q6IHtcbiAgICAgICAgc2V0VHJhbnNsYXRlOiBDb3ZlcmZsb3cuc2V0VHJhbnNsYXRlLmJpbmQoc3dpcGVyKSxcbiAgICAgICAgc2V0VHJhbnNpdGlvbjogQ292ZXJmbG93LnNldFRyYW5zaXRpb24uYmluZChzd2lwZXIpLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfSxcbiAgb246IHtcbiAgICBiZWZvcmVJbml0OiBmdW5jdGlvbiBiZWZvcmVJbml0KCkge1xuICAgICAgdmFyIHN3aXBlciA9IHRoaXM7XG4gICAgICBpZiAoc3dpcGVyLnBhcmFtcy5lZmZlY3QgIT09ICdjb3ZlcmZsb3cnKSB7IHJldHVybjsgfVxuXG4gICAgICBzd2lwZXIuY2xhc3NOYW1lcy5wdXNoKCgoc3dpcGVyLnBhcmFtcy5jb250YWluZXJNb2RpZmllckNsYXNzKSArIFwiY292ZXJmbG93XCIpKTtcbiAgICAgIHN3aXBlci5jbGFzc05hbWVzLnB1c2goKChzd2lwZXIucGFyYW1zLmNvbnRhaW5lck1vZGlmaWVyQ2xhc3MpICsgXCIzZFwiKSk7XG5cbiAgICAgIHN3aXBlci5wYXJhbXMud2F0Y2hTbGlkZXNQcm9ncmVzcyA9IHRydWU7XG4gICAgICBzd2lwZXIub3JpZ2luYWxQYXJhbXMud2F0Y2hTbGlkZXNQcm9ncmVzcyA9IHRydWU7XG4gICAgfSxcbiAgICBzZXRUcmFuc2xhdGU6IGZ1bmN0aW9uIHNldFRyYW5zbGF0ZSgpIHtcbiAgICAgIHZhciBzd2lwZXIgPSB0aGlzO1xuICAgICAgaWYgKHN3aXBlci5wYXJhbXMuZWZmZWN0ICE9PSAnY292ZXJmbG93JykgeyByZXR1cm47IH1cbiAgICAgIHN3aXBlci5jb3ZlcmZsb3dFZmZlY3Quc2V0VHJhbnNsYXRlKCk7XG4gICAgfSxcbiAgICBzZXRUcmFuc2l0aW9uOiBmdW5jdGlvbiBzZXRUcmFuc2l0aW9uKGR1cmF0aW9uKSB7XG4gICAgICB2YXIgc3dpcGVyID0gdGhpcztcbiAgICAgIGlmIChzd2lwZXIucGFyYW1zLmVmZmVjdCAhPT0gJ2NvdmVyZmxvdycpIHsgcmV0dXJuOyB9XG4gICAgICBzd2lwZXIuY292ZXJmbG93RWZmZWN0LnNldFRyYW5zaXRpb24oZHVyYXRpb24pO1xuICAgIH0sXG4gIH0sXG59O1xuXG4vLyBTd2lwZXIgQ2xhc3Ncbi8vIENvcmUgTW9kdWxlc1xuU3dpcGVyJDEudXNlKFtcbiAgRGV2aWNlJDIsXG4gIFN1cHBvcnQkMixcbiAgQnJvd3NlciQyLFxuICBSZXNpemUsXG4gIE9ic2VydmVyJDEsXG4gIFZpcnR1YWwkMSxcbiAgS2V5Ym9hcmQkMSxcbiAgTW91c2V3aGVlbCQxLFxuICBOYXZpZ2F0aW9uJDEsXG4gIFBhZ2luYXRpb24kMSxcbiAgU2Nyb2xsYmFyJDEsXG4gIFBhcmFsbGF4JDEsXG4gIFpvb20kMSxcbiAgTGF6eSQxLFxuICBDb250cm9sbGVyJDEsXG4gIEExMXksXG4gIEhpc3RvcnkkMSxcbiAgSGFzaE5hdmlnYXRpb24kMSxcbiAgQXV0b3BsYXkkMSxcbiAgRWZmZWN0RmFkZSxcbiAgRWZmZWN0Q3ViZSxcbiAgRWZmZWN0RmxpcCxcbiAgRWZmZWN0Q292ZXJmbG93XG5dKTtcblxucmV0dXJuIFN3aXBlciQxO1xuXG59KSkpO1xuIiwiY29uc3QgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyXG5jb25zdCBsb2FkU2NyaXB0ID0gcmVxdWlyZSgnbG9hZC1zY3JpcHQyJylcblxuY29uc3QgWU9VVFVCRV9JRlJBTUVfQVBJX1NSQyA9ICdodHRwczovL3d3dy55b3V0dWJlLmNvbS9pZnJhbWVfYXBpJ1xuXG5jb25zdCBZT1VUVUJFX1NUQVRFUyA9IHtcbiAgJy0xJzogJ3Vuc3RhcnRlZCcsXG4gICcwJzogJ2VuZGVkJyxcbiAgJzEnOiAncGxheWluZycsXG4gICcyJzogJ3BhdXNlZCcsXG4gICczJzogJ2J1ZmZlcmluZycsXG4gICc1JzogJ2N1ZWQnXG59XG5cbmNvbnN0IFlPVVRVQkVfRVJST1IgPSB7XG4gIC8vIFRoZSByZXF1ZXN0IGNvbnRhaW5zIGFuIGludmFsaWQgcGFyYW1ldGVyIHZhbHVlLiBGb3IgZXhhbXBsZSwgdGhpcyBlcnJvclxuICAvLyBvY2N1cnMgaWYgeW91IHNwZWNpZnkgYSB2aWRlb0lkIHRoYXQgZG9lcyBub3QgaGF2ZSAxMSBjaGFyYWN0ZXJzLCBvciBpZiB0aGVcbiAgLy8gdmlkZW9JZCBjb250YWlucyBpbnZhbGlkIGNoYXJhY3RlcnMsIHN1Y2ggYXMgZXhjbGFtYXRpb24gcG9pbnRzIG9yIGFzdGVyaXNrcy5cbiAgSU5WQUxJRF9QQVJBTTogMixcblxuICAvLyBUaGUgcmVxdWVzdGVkIGNvbnRlbnQgY2Fubm90IGJlIHBsYXllZCBpbiBhbiBIVE1MNSBwbGF5ZXIgb3IgYW5vdGhlciBlcnJvclxuICAvLyByZWxhdGVkIHRvIHRoZSBIVE1MNSBwbGF5ZXIgaGFzIG9jY3VycmVkLlxuICBIVE1MNV9FUlJPUjogNSxcblxuICAvLyBUaGUgdmlkZW8gcmVxdWVzdGVkIHdhcyBub3QgZm91bmQuIFRoaXMgZXJyb3Igb2NjdXJzIHdoZW4gYSB2aWRlbyBoYXMgYmVlblxuICAvLyByZW1vdmVkIChmb3IgYW55IHJlYXNvbikgb3IgaGFzIGJlZW4gbWFya2VkIGFzIHByaXZhdGUuXG4gIE5PVF9GT1VORDogMTAwLFxuXG4gIC8vIFRoZSBvd25lciBvZiB0aGUgcmVxdWVzdGVkIHZpZGVvIGRvZXMgbm90IGFsbG93IGl0IHRvIGJlIHBsYXllZCBpbiBlbWJlZGRlZFxuICAvLyBwbGF5ZXJzLlxuICBVTlBMQVlBQkxFXzE6IDEwMSxcblxuICAvLyBUaGlzIGVycm9yIGlzIHRoZSBzYW1lIGFzIDEwMS4gSXQncyBqdXN0IGEgMTAxIGVycm9yIGluIGRpc2d1aXNlIVxuICBVTlBMQVlBQkxFXzI6IDE1MFxufVxuXG5jb25zdCBsb2FkSWZyYW1lQVBJQ2FsbGJhY2tzID0gW11cblxuLyoqXG4gKiBZb3VUdWJlIFBsYXllci4gRXhwb3NlcyBhIGJldHRlciBBUEksIHdpdGggbmljZXIgZXZlbnRzLlxuICogQHBhcmFtIHtIVE1MRWxlbWVudHxzZWxlY3Rvcn0gZWxlbWVudFxuICovXG5jbGFzcyBZb3VUdWJlUGxheWVyIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgY29uc3RydWN0b3IgKGVsZW1lbnQsIG9wdHMpIHtcbiAgICBzdXBlcigpXG5cbiAgICBjb25zdCBlbGVtID0gdHlwZW9mIGVsZW1lbnQgPT09ICdzdHJpbmcnXG4gICAgICA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWxlbWVudClcbiAgICAgIDogZWxlbWVudFxuXG4gICAgaWYgKGVsZW0uaWQpIHtcbiAgICAgIHRoaXMuX2lkID0gZWxlbS5pZCAvLyB1c2UgZXhpc3RpbmcgZWxlbWVudCBpZFxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9pZCA9IGVsZW0uaWQgPSAneXRwbGF5ZXItJyArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMTYpLnNsaWNlKDIsIDgpXG4gICAgfVxuXG4gICAgdGhpcy5fb3B0cyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgd2lkdGg6IDY0MCxcbiAgICAgIGhlaWdodDogMzYwLFxuICAgICAgYXV0b3BsYXk6IGZhbHNlLFxuICAgICAgY2FwdGlvbnM6IHVuZGVmaW5lZCxcbiAgICAgIGNvbnRyb2xzOiB0cnVlLFxuICAgICAga2V5Ym9hcmQ6IHRydWUsXG4gICAgICBmdWxsc2NyZWVuOiB0cnVlLFxuICAgICAgYW5ub3RhdGlvbnM6IHRydWUsXG4gICAgICBtb2Rlc3RCcmFuZGluZzogZmFsc2UsXG4gICAgICByZWxhdGVkOiB0cnVlLFxuICAgICAgaW5mbzogdHJ1ZSxcbiAgICAgIHRpbWV1cGRhdGVGcmVxdWVuY3k6IDEwMDBcbiAgICB9LCBvcHRzKVxuXG4gICAgdGhpcy52aWRlb0lkID0gbnVsbFxuICAgIHRoaXMuZGVzdHJveWVkID0gZmFsc2VcblxuICAgIHRoaXMuX2FwaSA9IG51bGxcbiAgICB0aGlzLl9wbGF5ZXIgPSBudWxsXG4gICAgdGhpcy5fcmVhZHkgPSBmYWxzZSAvLyBpcyBwbGF5ZXIgcmVhZHk/XG4gICAgdGhpcy5fcXVldWUgPSBbXVxuXG4gICAgdGhpcy5faW50ZXJ2YWwgPSBudWxsXG5cbiAgICAvLyBTZXR1cCBsaXN0ZW5lcnMgZm9yICd0aW1ldXBkYXRlJyBldmVudHMuIFRoZSBZb3VUdWJlIFBsYXllciBkb2VzIG5vdCBmaXJlXG4gICAgLy8gJ3RpbWV1cGRhdGUnIGV2ZW50cywgc28gdGhleSBhcmUgc2ltdWxhdGVkIHVzaW5nIGEgc2V0SW50ZXJ2YWwoKS5cbiAgICB0aGlzLl9zdGFydEludGVydmFsID0gdGhpcy5fc3RhcnRJbnRlcnZhbC5iaW5kKHRoaXMpXG4gICAgdGhpcy5fc3RvcEludGVydmFsID0gdGhpcy5fc3RvcEludGVydmFsLmJpbmQodGhpcylcblxuICAgIHRoaXMub24oJ3Vuc3RhcnRlZCcsIHRoaXMuX3N0b3BJbnRlcnZhbClcbiAgICB0aGlzLm9uKCdlbmRlZCcsIHRoaXMuX3N0b3BJbnRlcnZhbClcbiAgICB0aGlzLm9uKCdwbGF5aW5nJywgdGhpcy5fc3RhcnRJbnRlcnZhbClcbiAgICB0aGlzLm9uKCdwYXVzZWQnLCB0aGlzLl9zdG9wSW50ZXJ2YWwpXG4gICAgdGhpcy5vbignYnVmZmVyaW5nJywgdGhpcy5fc3RvcEludGVydmFsKVxuXG4gICAgdGhpcy5fbG9hZElmcmFtZUFQSSgoZXJyLCBhcGkpID0+IHtcbiAgICAgIGlmIChlcnIpIHJldHVybiB0aGlzLl9kZXN0cm95KG5ldyBFcnJvcignWW91VHViZSBJZnJhbWUgQVBJIGZhaWxlZCB0byBsb2FkJykpXG4gICAgICB0aGlzLl9hcGkgPSBhcGlcblxuICAgICAgLy8gSWYgbG9hZCh2aWRlb0lkKSB3YXMgY2FsbGVkIGJlZm9yZSBJZnJhbWUgQVBJIGxvYWRlZCwgZW5zdXJlIGl0IGdldHNcbiAgICAgIC8vIGNhbGxlZCBhZ2FpbiBub3dcbiAgICAgIGlmICh0aGlzLnZpZGVvSWQpIHRoaXMubG9hZCh0aGlzLnZpZGVvSWQpXG4gICAgfSlcbiAgfVxuXG4gIGxvYWQgKHZpZGVvSWQsIGF1dG9wbGF5KSB7XG4gICAgaWYgKHRoaXMuZGVzdHJveWVkKSByZXR1cm5cbiAgICBpZiAoYXV0b3BsYXkgPT0gbnVsbCkgYXV0b3BsYXkgPSB0cnVlXG5cbiAgICB0aGlzLnZpZGVvSWQgPSB2aWRlb0lkXG5cbiAgICAvLyBJZiB0aGUgSWZyYW1lIEFQSSBpcyBub3QgcmVhZHkgeWV0LCBkbyBub3RoaW5nLiBPbmNlIHRoZSBJZnJhbWUgQVBJIGlzXG4gICAgLy8gcmVhZHksIGBsb2FkKHRoaXMudmlkZW9JZClgIHdpbGwgYmUgY2FsbGVkLlxuICAgIGlmICghdGhpcy5fYXBpKSByZXR1cm5cblxuICAgIC8vIElmIHRoZXJlIGlzIG5vIHBsYXllciBpbnN0YW5jZSwgY3JlYXRlIG9uZS5cbiAgICBpZiAoIXRoaXMuX3BsYXllcikge1xuICAgICAgdGhpcy5fY3JlYXRlUGxheWVyKHZpZGVvSWQpXG4gICAgICB0aGlzLmVtaXQoJ3Vuc3RhcnRlZCcpXG4gICAgICB0aGlzLmVtaXQoJ2J1ZmZlcmluZycpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgcGxheWVyIGluc3RhbmNlIGlzIG5vdCByZWFkeSB5ZXQsIGRvIG5vdGhpbmcuIE9uY2UgdGhlIHBsYXllclxuICAgIC8vIGluc3RhbmNlIGlzIHJlYWR5LCBgbG9hZCh0aGlzLnZpZGVvSWQpYCB3aWxsIGJlIGNhbGxlZC4gVGhpcyBlbnN1cmVzIHRoYXRcbiAgICAvLyB0aGUgbGFzdCBjYWxsIHRvIGBsb2FkKClgIGlzIHRoZSBvbmUgdGhhdCB0YWtlcyBlZmZlY3QuXG4gICAgaWYgKCF0aGlzLl9yZWFkeSkgcmV0dXJuXG5cbiAgICAvLyBJZiB0aGUgcGxheWVyIGluc3RhbmNlIGlzIHJlYWR5LCBsb2FkIHRoZSBnaXZlbiBgdmlkZW9JZGAuXG4gICAgaWYgKGF1dG9wbGF5KSB7XG4gICAgICB0aGlzLl9wbGF5ZXIubG9hZFZpZGVvQnlJZCh2aWRlb0lkKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9wbGF5ZXIuY3VlVmlkZW9CeUlkKHZpZGVvSWQpXG4gICAgfVxuICB9XG5cbiAgcGxheSAoKSB7XG4gICAgaWYgKHRoaXMuX3JlYWR5KSB0aGlzLl9wbGF5ZXIucGxheVZpZGVvKClcbiAgICBlbHNlIHRoaXMuX3F1ZXVlQ29tbWFuZCgncGxheScpXG4gIH1cblxuICBwYXVzZSAoKSB7XG4gICAgaWYgKHRoaXMuX3JlYWR5KSB0aGlzLl9wbGF5ZXIucGF1c2VWaWRlbygpXG4gICAgZWxzZSB0aGlzLl9xdWV1ZUNvbW1hbmQoJ3BhdXNlJylcbiAgfVxuXG4gIHN0b3AgKCkge1xuICAgIGlmICh0aGlzLl9yZWFkeSkgdGhpcy5fcGxheWVyLnN0b3BWaWRlbygpXG4gICAgZWxzZSB0aGlzLl9xdWV1ZUNvbW1hbmQoJ3N0b3AnKVxuICB9XG5cbiAgc2VlayAoc2Vjb25kcykge1xuICAgIGlmICh0aGlzLl9yZWFkeSkgdGhpcy5fcGxheWVyLnNlZWtUbyhzZWNvbmRzLCB0cnVlKVxuICAgIGVsc2UgdGhpcy5fcXVldWVDb21tYW5kKCdzZWVrJywgc2Vjb25kcylcbiAgfVxuXG4gIHNldFZvbHVtZSAodm9sdW1lKSB7XG4gICAgaWYgKHRoaXMuX3JlYWR5KSB0aGlzLl9wbGF5ZXIuc2V0Vm9sdW1lKHZvbHVtZSlcbiAgICBlbHNlIHRoaXMuX3F1ZXVlQ29tbWFuZCgnc2V0Vm9sdW1lJywgdm9sdW1lKVxuICB9XG5cbiAgc2V0UGxheWJhY2tSYXRlIChyYXRlKSB7XG4gICAgaWYgKHRoaXMuX3JlYWR5KSB0aGlzLl9wbGF5ZXIuc2V0UGxheWJhY2tSYXRlKHJhdGUpXG4gICAgZWxzZSB0aGlzLl9xdWV1ZUNvbW1hbmQoJ3NldFBsYXliYWNrUmF0ZScsIHJhdGUpXG4gIH1cblxuICBnZXRWb2x1bWUgKCkge1xuICAgIHJldHVybiAodGhpcy5fcmVhZHkgJiYgdGhpcy5fcGxheWVyLmdldFZvbHVtZSgpKSB8fCAwXG4gIH1cblxuICBnZXRQbGF5YmFja1JhdGUgKCkge1xuICAgIHJldHVybiAodGhpcy5fcmVhZHkgJiYgdGhpcy5fcGxheWVyLmdldFBsYXliYWNrUmF0ZSgpKSB8fCAxXG4gIH1cblxuICBnZXRBdmFpbGFibGVQbGF5YmFja1JhdGVzICgpIHtcbiAgICByZXR1cm4gKHRoaXMuX3JlYWR5ICYmIHRoaXMuX3BsYXllci5nZXRBdmFpbGFibGVQbGF5YmFja1JhdGVzKCkpIHx8IFsgMSBdXG4gIH1cblxuICBnZXREdXJhdGlvbiAoKSB7XG4gICAgcmV0dXJuICh0aGlzLl9yZWFkeSAmJiB0aGlzLl9wbGF5ZXIuZ2V0RHVyYXRpb24oKSkgfHwgMFxuICB9XG5cbiAgZ2V0UHJvZ3Jlc3MgKCkge1xuICAgIHJldHVybiAodGhpcy5fcmVhZHkgJiYgdGhpcy5fcGxheWVyLmdldFZpZGVvTG9hZGVkRnJhY3Rpb24oKSkgfHwgMFxuICB9XG5cbiAgZ2V0U3RhdGUgKCkge1xuICAgIHJldHVybiAodGhpcy5fcmVhZHkgJiYgWU9VVFVCRV9TVEFURVNbdGhpcy5fcGxheWVyLmdldFBsYXllclN0YXRlKCldKSB8fCAndW5zdGFydGVkJ1xuICB9XG5cbiAgZ2V0Q3VycmVudFRpbWUgKCkge1xuICAgIHJldHVybiAodGhpcy5fcmVhZHkgJiYgdGhpcy5fcGxheWVyLmdldEN1cnJlbnRUaW1lKCkpIHx8IDBcbiAgfVxuXG4gIGRlc3Ryb3kgKCkge1xuICAgIHRoaXMuX2Rlc3Ryb3koKVxuICB9XG5cbiAgX2Rlc3Ryb3kgKGVycikge1xuICAgIGlmICh0aGlzLmRlc3Ryb3llZCkgcmV0dXJuXG4gICAgdGhpcy5kZXN0cm95ZWQgPSB0cnVlXG5cbiAgICBpZiAodGhpcy5fcGxheWVyKSB7XG4gICAgICB0aGlzLl9wbGF5ZXIuc3RvcFZpZGVvKClcbiAgICAgIHRoaXMuX3BsYXllci5kZXN0cm95KClcbiAgICB9XG5cbiAgICB0aGlzLnZpZGVvSWQgPSBudWxsXG5cbiAgICB0aGlzLl9pZCA9IG51bGxcbiAgICB0aGlzLl9vcHRzID0gbnVsbFxuICAgIHRoaXMuX2FwaSA9IG51bGxcbiAgICB0aGlzLl9wbGF5ZXIgPSBudWxsXG4gICAgdGhpcy5fcmVhZHkgPSBmYWxzZVxuICAgIHRoaXMuX3F1ZXVlID0gbnVsbFxuXG4gICAgdGhpcy5fc3RvcEludGVydmFsKClcbiAgICB0aGlzLl9pbnRlcnZhbCA9IGZhbHNlXG5cbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKCdwbGF5aW5nJywgdGhpcy5fc3RhcnRJbnRlcnZhbClcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKCdwYXVzZWQnLCB0aGlzLl9zdG9wSW50ZXJ2YWwpXG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcignYnVmZmVyaW5nJywgdGhpcy5fc3RvcEludGVydmFsKVxuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIoJ3Vuc3RhcnRlZCcsIHRoaXMuX3N0b3BJbnRlcnZhbClcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKCdlbmRlZCcsIHRoaXMuX3N0b3BJbnRlcnZhbClcblxuICAgIGlmIChlcnIpIHRoaXMuZW1pdCgnZXJyb3InLCBlcnIpXG4gIH1cblxuICBfcXVldWVDb21tYW5kIChjb21tYW5kLCAuLi5hcmdzKSB7XG4gICAgaWYgKHRoaXMuZGVzdHJveWVkKSByZXR1cm5cbiAgICB0aGlzLl9xdWV1ZS5wdXNoKFtjb21tYW5kLCBhcmdzXSlcbiAgfVxuXG4gIF9mbHVzaFF1ZXVlICgpIHtcbiAgICB3aGlsZSAodGhpcy5fcXVldWUubGVuZ3RoKSB7XG4gICAgICBjb25zdCBjb21tYW5kID0gdGhpcy5fcXVldWUuc2hpZnQoKVxuICAgICAgdGhpc1tjb21tYW5kWzBdXS5hcHBseSh0aGlzLCBjb21tYW5kWzFdKVxuICAgIH1cbiAgfVxuXG4gIF9sb2FkSWZyYW1lQVBJIChjYikge1xuICAgIC8vIElmIEFQSSBpcyBsb2FkZWQsIHRoZXJlIGlzIG5vdGhpbmcgZWxzZSB0byBkb1xuICAgIGlmICh3aW5kb3cuWVQgJiYgdHlwZW9mIHdpbmRvdy5ZVC5QbGF5ZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBjYihudWxsLCB3aW5kb3cuWVQpXG4gICAgfVxuXG4gICAgLy8gT3RoZXJ3aXNlLCBxdWV1ZSBjYWxsYmFjayB1bnRpbCBBUEkgaXMgbG9hZGVkXG4gICAgbG9hZElmcmFtZUFQSUNhbGxiYWNrcy5wdXNoKGNiKVxuXG4gICAgY29uc3Qgc2NyaXB0cyA9IEFycmF5LmZyb20oZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpKVxuICAgIGNvbnN0IGlzTG9hZGluZyA9IHNjcmlwdHMuc29tZShzY3JpcHQgPT4gc2NyaXB0LnNyYyA9PT0gWU9VVFVCRV9JRlJBTUVfQVBJX1NSQylcblxuICAgIC8vIElmIEFQSSA8c2NyaXB0PiB0YWcgaXMgbm90IHByZXNlbnQgaW4gdGhlIHBhZ2UsIGluamVjdCBpdC4gRW5zdXJlcyB0aGF0XG4gICAgLy8gaWYgdXNlciBpbmNsdWRlcyBhIGhhcmRjb2RlZCA8c2NyaXB0PiB0YWcgaW4gSFRNTCBmb3IgcGVyZm9ybWFuY2UsIGFub3RoZXJcbiAgICAvLyBvbmUgd2lsbCBub3QgYmUgYWRkZWRcbiAgICBpZiAoIWlzTG9hZGluZykge1xuICAgICAgbG9hZFNjcmlwdChZT1VUVUJFX0lGUkFNRV9BUElfU1JDLCAoZXJyKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICB3aGlsZSAobG9hZElmcmFtZUFQSUNhbGxiYWNrcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnN0IGxvYWRDYiA9IGxvYWRJZnJhbWVBUElDYWxsYmFja3Muc2hpZnQoKVxuICAgICAgICAgICAgbG9hZENiKGVycilcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgLy8gSWYgcmVhZHkgZnVuY3Rpb24gaXMgbm90IHByZXNlbnQsIGNyZWF0ZSBpdFxuICAgIGlmICh0eXBlb2Ygd2luZG93Lm9uWW91VHViZUlmcmFtZUFQSVJlYWR5ICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB3aW5kb3cub25Zb3VUdWJlSWZyYW1lQVBJUmVhZHkgPSAoKSA9PiB7XG4gICAgICAgIHdoaWxlIChsb2FkSWZyYW1lQVBJQ2FsbGJhY2tzLmxlbmd0aCkge1xuICAgICAgICAgIGNvbnN0IGxvYWRDYiA9IGxvYWRJZnJhbWVBUElDYWxsYmFja3Muc2hpZnQoKVxuICAgICAgICAgIGxvYWRDYihudWxsLCB3aW5kb3cuWVQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfY3JlYXRlUGxheWVyICh2aWRlb0lkKSB7XG4gICAgaWYgKHRoaXMuZGVzdHJveWVkKSByZXR1cm5cblxuICAgIGNvbnN0IG9wdHMgPSB0aGlzLl9vcHRzXG5cbiAgICB0aGlzLl9wbGF5ZXIgPSBuZXcgdGhpcy5fYXBpLlBsYXllcih0aGlzLl9pZCwge1xuICAgICAgd2lkdGg6IG9wdHMud2lkdGgsXG4gICAgICBoZWlnaHQ6IG9wdHMuaGVpZ2h0LFxuICAgICAgdmlkZW9JZDogdmlkZW9JZCxcbiAgICAgIHBsYXllclZhcnM6IHtcbiAgICAgICAgLy8gVGhpcyBwYXJhbWV0ZXIgc3BlY2lmaWVzIHdoZXRoZXIgdGhlIGluaXRpYWwgdmlkZW8gd2lsbCBhdXRvbWF0aWNhbGx5XG4gICAgICAgIC8vIHN0YXJ0IHRvIHBsYXkgd2hlbiB0aGUgcGxheWVyIGxvYWRzLiBTdXBwb3J0ZWQgdmFsdWVzIGFyZSAwIG9yIDEuIFRoZVxuICAgICAgICAvLyBkZWZhdWx0IHZhbHVlIGlzIDAuXG4gICAgICAgIGF1dG9wbGF5OiBvcHRzLmF1dG9wbGF5ID8gMSA6IDAsXG5cbiAgICAgICAgLy8gU2V0dGluZyB0aGUgcGFyYW1ldGVyJ3MgdmFsdWUgdG8gMSBjYXVzZXMgY2xvc2VkIGNhcHRpb25zIHRvIGJlIHNob3duXG4gICAgICAgIC8vIGJ5IGRlZmF1bHQsIGV2ZW4gaWYgdGhlIHVzZXIgaGFzIHR1cm5lZCBjYXB0aW9ucyBvZmYuIFRoZSBkZWZhdWx0XG4gICAgICAgIC8vIGJlaGF2aW9yIGlzIGJhc2VkIG9uIHVzZXIgcHJlZmVyZW5jZS5cbiAgICAgICAgY2NfbG9hZF9wb2xpY3k6IG9wdHMuY2FwdGlvbnMgIT0gbnVsbFxuICAgICAgICAgID8gb3B0cy5jYXB0aW9ucyA/IDEgOiAwXG4gICAgICAgICAgOiB1bmRlZmluZWQsIC8vIGRlZmF1bHQgdG8gbm90IHNldHRpbmcgdGhpcyBvcHRpb25cblxuICAgICAgICAvLyBUaGlzIHBhcmFtZXRlciBpbmRpY2F0ZXMgd2hldGhlciB0aGUgdmlkZW8gcGxheWVyIGNvbnRyb2xzIGFyZVxuICAgICAgICAvLyBkaXNwbGF5ZWQuIEZvciBJRnJhbWUgZW1iZWRzIHRoYXQgbG9hZCBhIEZsYXNoIHBsYXllciwgaXQgYWxzbyBkZWZpbmVzXG4gICAgICAgIC8vIHdoZW4gdGhlIGNvbnRyb2xzIGRpc3BsYXkgaW4gdGhlIHBsYXllciBhcyB3ZWxsIGFzIHdoZW4gdGhlIHBsYXllclxuICAgICAgICAvLyB3aWxsIGxvYWQuIFN1cHBvcnRlZCB2YWx1ZXMgYXJlOlxuICAgICAgICAvLyAgIC0gY29udHJvbHM9MCDigJMgUGxheWVyIGNvbnRyb2xzIGRvIG5vdCBkaXNwbGF5IGluIHRoZSBwbGF5ZXIuIEZvclxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgIElGcmFtZSBlbWJlZHMsIHRoZSBGbGFzaCBwbGF5ZXIgbG9hZHMgaW1tZWRpYXRlbHkuXG4gICAgICAgIC8vICAgLSBjb250cm9scz0xIOKAkyAoZGVmYXVsdCkgUGxheWVyIGNvbnRyb2xzIGRpc3BsYXkgaW4gdGhlIHBsYXllci4gRm9yXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgSUZyYW1lIGVtYmVkcywgdGhlIGNvbnRyb2xzIGRpc3BsYXkgaW1tZWRpYXRlbHkgYW5kXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgdGhlIEZsYXNoIHBsYXllciBhbHNvIGxvYWRzIGltbWVkaWF0ZWx5LlxuICAgICAgICAvLyAgIC0gY29udHJvbHM9MiDigJMgUGxheWVyIGNvbnRyb2xzIGRpc3BsYXkgaW4gdGhlIHBsYXllci4gRm9yIElGcmFtZVxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgIGVtYmVkcywgdGhlIGNvbnRyb2xzIGRpc3BsYXkgYW5kIHRoZSBGbGFzaCBwbGF5ZXJcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICBsb2FkcyBhZnRlciB0aGUgdXNlciBpbml0aWF0ZXMgdGhlIHZpZGVvIHBsYXliYWNrLlxuICAgICAgICBjb250cm9sczogb3B0cy5jb250cm9scyA/IDIgOiAwLFxuXG4gICAgICAgIC8vIFNldHRpbmcgdGhlIHBhcmFtZXRlcidzIHZhbHVlIHRvIDEgY2F1c2VzIHRoZSBwbGF5ZXIgdG8gbm90IHJlc3BvbmQgdG9cbiAgICAgICAgLy8ga2V5Ym9hcmQgY29udHJvbHMuIFRoZSBkZWZhdWx0IHZhbHVlIGlzIDAsIHdoaWNoIG1lYW5zIHRoYXQga2V5Ym9hcmRcbiAgICAgICAgLy8gY29udHJvbHMgYXJlIGVuYWJsZWQuXG4gICAgICAgIGRpc2FibGVrYjogb3B0cy5rZXlib2FyZCA/IDAgOiAxLFxuXG4gICAgICAgIC8vICBTZXR0aW5nIHRoZSBwYXJhbWV0ZXIncyB2YWx1ZSB0byAxIGVuYWJsZXMgdGhlIHBsYXllciB0byBiZVxuICAgICAgICAvLyAgY29udHJvbGxlZCB2aWEgSUZyYW1lIG9yIEphdmFTY3JpcHQgUGxheWVyIEFQSSBjYWxscy4gVGhlIGRlZmF1bHRcbiAgICAgICAgLy8gIHZhbHVlIGlzIDAsIHdoaWNoIG1lYW5zIHRoYXQgdGhlIHBsYXllciBjYW5ub3QgYmUgY29udHJvbGxlZCB1c2luZ1xuICAgICAgICAvLyAgdGhvc2UgQVBJcy5cbiAgICAgICAgZW5hYmxlanNhcGk6IDEsXG5cbiAgICAgICAgLy8gU2V0dGluZyB0aGlzIHBhcmFtZXRlciB0byAwIHByZXZlbnRzIHRoZSBmdWxsc2NyZWVuIGJ1dHRvbiBmcm9tXG4gICAgICAgIC8vIGRpc3BsYXlpbmcgaW4gdGhlIHBsYXllci4gVGhlIGRlZmF1bHQgdmFsdWUgaXMgMSwgd2hpY2ggY2F1c2VzIHRoZVxuICAgICAgICAvLyBmdWxsc2NyZWVuIGJ1dHRvbiB0byBkaXNwbGF5LlxuICAgICAgICBmczogb3B0cy5mdWxsc2NyZWVuID8gMSA6IDAsXG5cbiAgICAgICAgLy8gU2V0dGluZyB0aGUgcGFyYW1ldGVyJ3MgdmFsdWUgdG8gMSBjYXVzZXMgdmlkZW8gYW5ub3RhdGlvbnMgdG8gYmVcbiAgICAgICAgLy8gc2hvd24gYnkgZGVmYXVsdCwgd2hlcmVhcyBzZXR0aW5nIHRvIDMgY2F1c2VzIHZpZGVvIGFubm90YXRpb25zIHRvIG5vdFxuICAgICAgICAvLyBiZSBzaG93biBieSBkZWZhdWx0LiBUaGUgZGVmYXVsdCB2YWx1ZSBpcyAxLlxuICAgICAgICBpdl9sb2FkX3BvbGljeTogb3B0cy5hbm5vdGF0aW9ucyA/IDEgOiAzLFxuXG4gICAgICAgIC8vIFRoaXMgcGFyYW1ldGVyIGxldHMgeW91IHVzZSBhIFlvdVR1YmUgcGxheWVyIHRoYXQgZG9lcyBub3Qgc2hvdyBhXG4gICAgICAgIC8vIFlvdVR1YmUgbG9nby4gU2V0IHRoZSBwYXJhbWV0ZXIgdmFsdWUgdG8gMSB0byBwcmV2ZW50IHRoZSBZb3VUdWJlIGxvZ29cbiAgICAgICAgLy8gZnJvbSBkaXNwbGF5aW5nIGluIHRoZSBjb250cm9sIGJhci4gTm90ZSB0aGF0IGEgc21hbGwgWW91VHViZSB0ZXh0XG4gICAgICAgIC8vIGxhYmVsIHdpbGwgc3RpbGwgZGlzcGxheSBpbiB0aGUgdXBwZXItcmlnaHQgY29ybmVyIG9mIGEgcGF1c2VkIHZpZGVvXG4gICAgICAgIC8vIHdoZW4gdGhlIHVzZXIncyBtb3VzZSBwb2ludGVyIGhvdmVycyBvdmVyIHRoZSBwbGF5ZXIuXG4gICAgICAgIG1vZGVzdGJyYW5kaW5nOiAxLFxuXG4gICAgICAgIC8vIFRoaXMgcGFyYW1ldGVyIHByb3ZpZGVzIGFuIGV4dHJhIHNlY3VyaXR5IG1lYXN1cmUgZm9yIHRoZSBJRnJhbWUgQVBJXG4gICAgICAgIC8vIGFuZCBpcyBvbmx5IHN1cHBvcnRlZCBmb3IgSUZyYW1lIGVtYmVkcy4gSWYgeW91IGFyZSB1c2luZyB0aGUgSUZyYW1lXG4gICAgICAgIC8vIEFQSSwgd2hpY2ggbWVhbnMgeW91IGFyZSBzZXR0aW5nIHRoZSBlbmFibGVqc2FwaSBwYXJhbWV0ZXIgdmFsdWUgdG8gMSxcbiAgICAgICAgLy8geW91IHNob3VsZCBhbHdheXMgc3BlY2lmeSB5b3VyIGRvbWFpbiBhcyB0aGUgb3JpZ2luIHBhcmFtZXRlciB2YWx1ZS5cbiAgICAgICAgb3JpZ2luOiB3aW5kb3cubG9jYXRpb24ub3JpZ2luLFxuXG4gICAgICAgIC8vIFRoaXMgcGFyYW1ldGVyIGNvbnRyb2xzIHdoZXRoZXIgdmlkZW9zIHBsYXkgaW5saW5lIG9yIGZ1bGxzY3JlZW4gaW4gYW5cbiAgICAgICAgLy8gSFRNTDUgcGxheWVyIG9uIGlPUy4gVmFsaWQgdmFsdWVzIGFyZTpcbiAgICAgICAgLy8gICAtIDA6IFRoaXMgdmFsdWUgY2F1c2VzIGZ1bGxzY3JlZW4gcGxheWJhY2suIFRoaXMgaXMgY3VycmVudGx5IHRoZVxuICAgICAgICAvLyAgICAgICAgZGVmYXVsdCB2YWx1ZSwgdGhvdWdoIHRoZSBkZWZhdWx0IGlzIHN1YmplY3QgdG8gY2hhbmdlLlxuICAgICAgICAvLyAgIC0gMTogVGhpcyB2YWx1ZSBjYXVzZXMgaW5saW5lIHBsYXliYWNrIGZvciBVSVdlYlZpZXdzIGNyZWF0ZWQgd2l0aFxuICAgICAgICAvLyAgICAgICAgdGhlIGFsbG93c0lubGluZU1lZGlhUGxheWJhY2sgcHJvcGVydHkgc2V0IHRvIFRSVUUuXG4gICAgICAgIHBsYXlzaW5saW5lOiAxLFxuXG4gICAgICAgIC8vIFRoaXMgcGFyYW1ldGVyIGluZGljYXRlcyB3aGV0aGVyIHRoZSBwbGF5ZXIgc2hvdWxkIHNob3cgcmVsYXRlZCB2aWRlb3NcbiAgICAgICAgLy8gd2hlbiBwbGF5YmFjayBvZiB0aGUgaW5pdGlhbCB2aWRlbyBlbmRzLiBTdXBwb3J0ZWQgdmFsdWVzIGFyZSAwIGFuZCAxLlxuICAgICAgICAvLyBUaGUgZGVmYXVsdCB2YWx1ZSBpcyAxLlxuICAgICAgICByZWw6IG9wdHMucmVsYXRlZCA/IDEgOiAwLFxuXG4gICAgICAgIC8vIFN1cHBvcnRlZCB2YWx1ZXMgYXJlIDAgYW5kIDEuIFNldHRpbmcgdGhlIHBhcmFtZXRlcidzIHZhbHVlIHRvIDBcbiAgICAgICAgLy8gY2F1c2VzIHRoZSBwbGF5ZXIgdG8gbm90IGRpc3BsYXkgaW5mb3JtYXRpb24gbGlrZSB0aGUgdmlkZW8gdGl0bGUgYW5kXG4gICAgICAgIC8vIHVwbG9hZGVyIGJlZm9yZSB0aGUgdmlkZW8gc3RhcnRzIHBsYXlpbmcuIElmIHRoZSBwbGF5ZXIgaXMgbG9hZGluZyBhXG4gICAgICAgIC8vIHBsYXlsaXN0LCBhbmQgeW91IGV4cGxpY2l0bHkgc2V0IHRoZSBwYXJhbWV0ZXIgdmFsdWUgdG8gMSwgdGhlbiwgdXBvblxuICAgICAgICAvLyBsb2FkaW5nLCB0aGUgcGxheWVyIHdpbGwgYWxzbyBkaXNwbGF5IHRodW1ibmFpbCBpbWFnZXMgZm9yIHRoZSB2aWRlb3NcbiAgICAgICAgLy8gaW4gdGhlIHBsYXlsaXN0LiBOb3RlIHRoYXQgdGhpcyBmdW5jdGlvbmFsaXR5IGlzIG9ubHkgc3VwcG9ydGVkIGZvclxuICAgICAgICAvLyB0aGUgQVMzIHBsYXllci5cbiAgICAgICAgc2hvd2luZm86IG9wdHMuaW5mbyA/IDEgOiAwLFxuXG4gICAgICAgIC8vIChOb3QgcGFydCBvZiBkb2N1bWVudGVkIEFQSSkgQWxsb3cgaHRtbCBlbGVtZW50cyB3aXRoIGhpZ2hlciB6LWluZGV4XG4gICAgICAgIC8vIHRvIGJlIHNob3duIG9uIHRvcCBvZiB0aGUgWW91VHViZSBwbGF5ZXIuXG4gICAgICAgIHdtb2RlOiAnb3BhcXVlJ1xuICAgICAgfSxcbiAgICAgIGV2ZW50czoge1xuICAgICAgICBvblJlYWR5OiAoKSA9PiB0aGlzLl9vblJlYWR5KHZpZGVvSWQpLFxuICAgICAgICBvblN0YXRlQ2hhbmdlOiAoZGF0YSkgPT4gdGhpcy5fb25TdGF0ZUNoYW5nZShkYXRhKSxcbiAgICAgICAgb25QbGF5YmFja1F1YWxpdHlDaGFuZ2U6IChkYXRhKSA9PiB0aGlzLl9vblBsYXliYWNrUXVhbGl0eUNoYW5nZShkYXRhKSxcbiAgICAgICAgb25QbGF5YmFja1JhdGVDaGFuZ2U6IChkYXRhKSA9PiB0aGlzLl9vblBsYXliYWNrUmF0ZUNoYW5nZShkYXRhKSxcbiAgICAgICAgb25FcnJvcjogKGRhdGEpID0+IHRoaXMuX29uRXJyb3IoZGF0YSlcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgZXZlbnQgZmlyZXMgd2hlbiB0aGUgcGxheWVyIGhhcyBmaW5pc2hlZCBsb2FkaW5nIGFuZCBpcyByZWFkeSB0byBiZWdpblxuICAgKiByZWNlaXZpbmcgQVBJIGNhbGxzLlxuICAgKi9cbiAgX29uUmVhZHkgKHZpZGVvSWQpIHtcbiAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVyblxuXG4gICAgdGhpcy5fcmVhZHkgPSB0cnVlXG5cbiAgICAvLyBJZiB0aGUgdmlkZW9JZCB0aGF0IHdhcyBsb2FkZWQgaXMgbm90IHRoZSBzYW1lIGFzIGB0aGlzLnZpZGVvSWRgLCB0aGVuXG4gICAgLy8gYGxvYWQoKWAgd2FzIGNhbGxlZCB0d2ljZSBiZWZvcmUgYG9uUmVhZHlgIGZpcmVkLiBKdXN0IGNhbGxcbiAgICAvLyBgbG9hZCh0aGlzLnZpZGVvSWQpYCB0byBsb2FkIHRoZSByaWdodCB2aWRlb0lkLlxuICAgIGlmICh2aWRlb0lkICE9PSB0aGlzLnZpZGVvSWQpIHtcbiAgICAgIHRoaXMubG9hZCh0aGlzLnZpZGVvSWQpXG4gICAgfVxuXG4gICAgdGhpcy5fZmx1c2hRdWV1ZSgpXG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIHBsYXllcidzIHN0YXRlIGNoYW5nZXMuIFdlIGVtaXQgZnJpZW5kbHkgZXZlbnRzIHNvIHRoZSB1c2VyXG4gICAqIGRvZXNuJ3QgbmVlZCB0byB1c2UgWW91VHViZSdzIFlULlBsYXllclN0YXRlLiogZXZlbnQgY29uc3RhbnRzLlxuICAgKi9cbiAgX29uU3RhdGVDaGFuZ2UgKGRhdGEpIHtcbiAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVyblxuXG4gICAgY29uc3Qgc3RhdGUgPSBZT1VUVUJFX1NUQVRFU1tkYXRhLmRhdGFdXG5cbiAgICBpZiAoc3RhdGUpIHtcbiAgICAgIC8vIFNlbmQgYSAndGltZXVwZGF0ZScgYW55dGltZSB0aGUgc3RhdGUgY2hhbmdlcy4gTm90ZTogSXQncyBpbXBvcnRhbnQgdGhhdCAncGxheWluZydcbiAgICAgIC8vIGdldHMgZW1pdHRlZCBiZWZvcmUgdGhlIGZpcnN0ICd0aW1ldXBkYXRlJywgYW5kIHRoYXQgbm8gJ3RpbWV1cGRhdGUnIGV2ZW50cyBhcmVcbiAgICAgIC8vIGVtaXR0ZWQgYWZ0ZXIgJ3BhdXNlJywgJ2VuZGVkJywgb3IgJ2J1ZmZlcmluZycuXG4gICAgICBpZiAoWydwYXVzZWQnXS5pbmNsdWRlcyhzdGF0ZSkpIHRoaXMuX29uVGltZXVwZGF0ZSgpXG4gICAgICB0aGlzLmVtaXQoc3RhdGUpXG4gICAgICBpZiAoc3RhdGUgPT09ICdwbGF5aW5nJykgdGhpcy5fb25UaW1ldXBkYXRlKClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbnJlY29nbml6ZWQgc3RhdGUgY2hhbmdlOiAnICsgZGF0YSlcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBldmVudCBmaXJlcyB3aGVuZXZlciB0aGUgdmlkZW8gcGxheWJhY2sgcXVhbGl0eSBjaGFuZ2VzLiBQb3NzaWJsZVxuICAgKiB2YWx1ZXMgYXJlOiAnc21hbGwnLCAnbWVkaXVtJywgJ2xhcmdlJywgJ2hkNzIwJywgJ2hkMTA4MCcsICdoaWdocmVzJy5cbiAgICovXG4gIF9vblBsYXliYWNrUXVhbGl0eUNoYW5nZSAoZGF0YSkge1xuICAgIGlmICh0aGlzLmRlc3Ryb3llZCkgcmV0dXJuXG4gICAgdGhpcy5lbWl0KCdwbGF5YmFja1F1YWxpdHlDaGFuZ2UnLCBkYXRhLmRhdGEpXG4gIH1cblxuICAvKipcbiAgICogVGhpcyBldmVudCBmaXJlcyB3aGVuZXZlciB0aGUgdmlkZW8gcGxheWJhY2sgcmF0ZSBjaGFuZ2VzLlxuICAgKi9cbiAgX29uUGxheWJhY2tSYXRlQ2hhbmdlIChkYXRhKSB7XG4gICAgaWYgKHRoaXMuZGVzdHJveWVkKSByZXR1cm5cbiAgICB0aGlzLmVtaXQoJ3BsYXliYWNrUmF0ZUNoYW5nZScsIGRhdGEuZGF0YSlcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGV2ZW50IGZpcmVzIGlmIGFuIGVycm9yIG9jY3VycyBpbiB0aGUgcGxheWVyLlxuICAgKi9cbiAgX29uRXJyb3IgKGRhdGEpIHtcbiAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVyblxuXG4gICAgY29uc3QgY29kZSA9IGRhdGEuZGF0YVxuXG4gICAgLy8gVGhlIEhUTUw1X0VSUk9SIGVycm9yIG9jY3VycyB3aGVuIHRoZSBZb3VUdWJlIHBsYXllciBuZWVkcyB0byBzd2l0Y2ggZnJvbVxuICAgIC8vIEhUTUw1IHRvIEZsYXNoIHRvIHNob3cgYW4gYWQuIElnbm9yZSBpdC5cbiAgICBpZiAoY29kZSA9PT0gWU9VVFVCRV9FUlJPUi5IVE1MNV9FUlJPUikgcmV0dXJuXG5cbiAgICAvLyBUaGUgcmVtYWluaW5nIGVycm9yIHR5cGVzIG9jY3VyIHdoZW4gdGhlIFlvdVR1YmUgcGxheWVyIGNhbm5vdCBwbGF5IHRoZVxuICAgIC8vIGdpdmVuIHZpZGVvLiBUaGlzIGlzIG5vdCBhIGZhdGFsIGVycm9yLiBSZXBvcnQgaXQgYXMgdW5wbGF5YWJsZSBzbyB0aGUgdXNlclxuICAgIC8vIGhhcyBhbiBvcHBvcnR1bml0eSB0byBwbGF5IGFub3RoZXIgdmlkZW8uXG4gICAgaWYgKGNvZGUgPT09IFlPVVRVQkVfRVJST1IuVU5QTEFZQUJMRV8xIHx8XG4gICAgICAgIGNvZGUgPT09IFlPVVRVQkVfRVJST1IuVU5QTEFZQUJMRV8yIHx8XG4gICAgICAgIGNvZGUgPT09IFlPVVRVQkVfRVJST1IuTk9UX0ZPVU5EIHx8XG4gICAgICAgIGNvZGUgPT09IFlPVVRVQkVfRVJST1IuSU5WQUxJRF9QQVJBTSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW1pdCgndW5wbGF5YWJsZScsIHRoaXMudmlkZW9JZClcbiAgICB9XG5cbiAgICAvLyBVbmV4cGVjdGVkIGVycm9yLCBkb2VzIG5vdCBtYXRjaCBhbnkga25vd24gdHlwZVxuICAgIHRoaXMuX2Rlc3Ryb3kobmV3IEVycm9yKCdZb3VUdWJlIFBsYXllciBFcnJvci4gVW5rbm93biBlcnJvciBjb2RlOiAnICsgY29kZSkpXG4gIH1cblxuICAvKipcbiAgICogVGhpcyBldmVudCBmaXJlcyB3aGVuIHRoZSB0aW1lIGluZGljYXRlZCBieSB0aGUgYGdldEN1cnJlbnRUaW1lKClgIG1ldGhvZFxuICAgKiBoYXMgYmVlbiB1cGRhdGVkLlxuICAgKi9cbiAgX29uVGltZXVwZGF0ZSAoKSB7XG4gICAgdGhpcy5lbWl0KCd0aW1ldXBkYXRlJywgdGhpcy5nZXRDdXJyZW50VGltZSgpKVxuICB9XG5cbiAgX3N0YXJ0SW50ZXJ2YWwgKCkge1xuICAgIHRoaXMuX2ludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4gdGhpcy5fb25UaW1ldXBkYXRlKCksIHRoaXMuX29wdHMudGltZXVwZGF0ZUZyZXF1ZW5jeSlcbiAgfVxuXG4gIF9zdG9wSW50ZXJ2YWwgKCkge1xuICAgIGNsZWFySW50ZXJ2YWwodGhpcy5faW50ZXJ2YWwpXG4gICAgdGhpcy5faW50ZXJ2YWwgPSBudWxsXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBZb3VUdWJlUGxheWVyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcblx0bWVkaWFRdWVyaWVzIDoge1xuXHRcdHNtOiB3aW5kb3cubWF0Y2hNZWRpYSgnKG1pbi13aWR0aDogNDAwcHgpJyksXG5cdFx0bWQ6IHdpbmRvdy5tYXRjaE1lZGlhKCcobWluLXdpZHRoOiA2ODBweCknKSxcblx0XHRsZzogd2luZG93Lm1hdGNoTWVkaWEoJyhtaW4td2lkdGg6IDk2MHB4KScpLFxuXHRcdHhsOiB3aW5kb3cubWF0Y2hNZWRpYSgnKG1pbi13aWR0aDogMTIwMHB4KScpXG5cdH0sXG5cdGV2ZW50czoge1xuXHRcdG1lbnVPcGVuOiAnTUVOVSBPUEVOJyxcblx0XHRsYW5nT3BlbjogJ0xBTkcgT1BFTidcblx0fVxufTtcbiIsIid1c2Ugc3RpcmN0JztcblxudmFyIHJhbmRvbUNoYXJzID0gJ2FiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihsZW5ndGgpIHtcblx0dmFyIHJuO1xuXHR2YXIgcm5kID0gJ2pzLSc7XG5cdHZhciBsZW4gPSBsZW5ndGggfHwgODtcblxuXHRmb3IgKHZhciBjaGFySW5kZXggPSAxOyBjaGFySW5kZXggPD0gbGVuOyBjaGFySW5kZXgrKykge1xuXHRcdHJuZCArPSByYW5kb21DaGFycy5zdWJzdHJpbmcocm4gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiByYW5kb21DaGFycy5sZW5ndGgpLCBybiArIDEpO1xuXHR9XG5cblx0cmV0dXJuIHJuZDtcbn07XG4iLCIndXNlIHN0aXJjdCc7XG5cbnZhciBIZWFkZXIgPSByZXF1aXJlKCcuL21vZHVsZXMvaGVhZGVyJyk7XG52YXIgTWVudSA9IHJlcXVpcmUoJy4vbW9kdWxlcy9tZW51Jyk7XG52YXIgT3ZlcmxheSA9IHJlcXVpcmUoJy4vbW9kdWxlcy9vdmVybGF5Jyk7XG52YXIgQ291bnRyeVNlbGVjdG9yID0gcmVxdWlyZSgnLi9tb2R1bGVzL2NvdW50cnktc2VsZWN0b3InKTtcbnZhciBTbGlkZXIgPSByZXF1aXJlKCcuL21vZHVsZXMvc2xpZGVyJyk7XG52YXIgWVRQbGF5ZXIgPSByZXF1aXJlKCcuL21vZHVsZXMveW91dHViZXBsYXllcicpO1xudmFyIFZpZGVvID0gcmVxdWlyZSgnLi9tb2R1bGVzL3ZpZGVvJyk7XG52YXIgVG9nZ2xlID0gcmVxdWlyZSgnLi9tb2R1bGVzL3RvZ2dsZScpO1xudmFyIEVtYmVkV3JhcCA9IHJlcXVpcmUoJy4vbW9kdWxlcy9lbWJlZC13cmFwJyk7XG5cblxudmFyIGluaXQgPSBmdW5jdGlvbigpIHtcblxuXHRPdmVybGF5KCk7XG5cblx0dmFyIGhlYWRlckVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhlYWRlcicpO1xuXHRpZihoZWFkZXJFbCkge1xuXHRcdEhlYWRlcihoZWFkZXJFbCk7XG5cdH1cblxuXHR2YXIgbWVudUVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLW1lbnUnKTtcblx0aWYobWVudUVsKSB7XG5cdFx0TWVudShtZW51RWwpO1xuXHR9XG5cblx0dmFyIGNvdW50cnlFbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1uYXYtY291bnRyeScpO1xuXHRpZihjb3VudHJ5RWwpIHtcblx0XHRDb3VudHJ5U2VsZWN0b3IoY291bnRyeUVsKTtcblx0fVxuXG5cdHZhciBzbGlkZXJFbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1zbGlkZXInKTtcblx0aWYoc2xpZGVyRWwubGVuZ3RoID4gMCkge1xuXHRcdGZvciAodmFyIHMgPSAwOyBzIDwgc2xpZGVyRWwubGVuZ3RoOyBzKyspIHtcblx0XHRcdFNsaWRlcihzbGlkZXJFbFtzXSk7XG5cdFx0fVxuXHR9XG5cblx0dmFyIHlvdXR1YmVFbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy15b3V0dWJlcGxheWVyJyk7XG5cdGlmKHlvdXR1YmVFbC5sZW5ndGggPiAwKSB7XG5cdFx0Zm9yICh2YXIgeXQgPSAwOyB5dCA8IHlvdXR1YmVFbC5sZW5ndGg7IHl0KyspIHtcblx0XHRcdFlUUGxheWVyKHlvdXR1YmVFbFt5dF0pO1xuXHRcdH1cblx0fVxuXG5cdHZhciB2aWRlb0VsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLXZpZGVvJyk7XG5cdGlmKHZpZGVvRWwubGVuZ3RoID4gMCkge1xuXHRcdGZvciAodmFyIHYgPSAwOyB2IDwgdmlkZW9FbC5sZW5ndGg7IHYrKykge1xuXHRcdFx0VmlkZW8odmlkZW9FbFt2XSk7XG5cdFx0fVxuXHR9XG5cblx0dmFyIHRvZ2dsZUVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLXRvZ2dsZScpO1xuXHRpZih0b2dnbGVFbC5sZW5ndGggPiAwKSB7XG5cdFx0Zm9yICh2YXIgYXQgPSAwOyBhdCA8IHRvZ2dsZUVsLmxlbmd0aDsgYXQrKykge1xuXHRcdFx0VG9nZ2xlKHRvZ2dsZUVsW2F0XSk7XG5cdFx0fVxuXHR9XG5cblx0dmFyIHJ0ZUNvbnRlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtcnRlLWNvbnRlbnQnKTtcblx0aWYocnRlQ29udGVudCkge1xuXHRcdHZhciBlbWJlZEVsID0gcnRlQ29udGVudC5xdWVyeVNlbGVjdG9yQWxsKCdpZnJhbWUsIGVtYmVkJyk7XG5cblx0XHRmb3IgKHZhciBldyA9IDA7IGV3IDwgZW1iZWRFbC5sZW5ndGg7IGV3KyspIHtcblx0XHRcdEVtYmVkV3JhcChlbWJlZEVsW2V3XSk7XG5cdFx0fVxuXHR9XG5cblx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGluaXQsIGZhbHNlKTtcbn07XG5cblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGluaXQsIHtvbmNlOiB0cnVlfSk7XG4iLCIndXNlIHN0aXJjdCc7XG5cbi8qIGdsb2JhbCBNb2Rlcm5penIgKi9cbnZhciBNZWRpYVF1ZXJpZXMgPSByZXF1aXJlKCcuLi9jb25maWcnKS5tZWRpYVF1ZXJpZXM7XG52YXIgRXZlbnRzID0gcmVxdWlyZSgnLi4vY29uZmlnJykuZXZlbnRzO1xuXG52YXIgbXEgPSBNZWRpYVF1ZXJpZXMuc207XG52YXIgZXZlbnRzU2VydmljZSA9IHJlcXVpcmUoJy4uL3NlcnZpY2VzL2V2ZW50cy5zZXJ2aWNlJyk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0YXJnZXQpIHtcblx0dmFyIG9wZW5lcnMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCggZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnanMtYnRuLWxhbmcnKSk7XG5cdHZhciB0YWJzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoIHRhcmdldC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdqcy1idG4tb3BlbmVyJykgKTtcblxuXHR2YXIgbGFuZ09wZW4gPSBmYWxzZTtcblx0dmFyIGxpc3RlbmVyc0FkZGVkID0gZmFsc2U7XG5cdHZhciBhY3RpdmVUYWI7XG5cblxuXHRmdW5jdGlvbiBhZGRMaXN0ZW5lcnMoKXtcblx0XHRpZighbGlzdGVuZXJzQWRkZWQpe1xuXG5cdFx0XHRvcGVuZXJzLmZvckVhY2goZnVuY3Rpb24oYnRuKXtcblx0XHRcdFx0YnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdG9nZ2xlTGFuZyk7XG5cdFx0XHR9KTtcblxuXHRcdFx0dGFicy5mb3JFYWNoKGZ1bmN0aW9uKGJ0bil7XG5cdFx0XHRcdGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFjdGl2YXRlVGFiKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRldmVudHNTZXJ2aWNlLmFkZExpc3RlbmVyKEV2ZW50cy5tZW51T3BlbiwgbWVudUV2ZW50TGlzdGVuZXIpO1xuXHRcdFx0bGlzdGVuZXJzQWRkZWQgPSB0cnVlO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIHRvZ2dsZUxhbmcoKXtcblx0XHRpZihsYW5nT3Blbil7XG5cdFx0XHRjbG9zZU1lbnUoKTtcblx0XHR9ZWxzZXtcblx0XHRcdG9wZW5NZW51KCk7XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGZ1bmN0aW9uIG9wZW5NZW51KCl7XG5cdFx0ZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdzaG93LW1lbnUtbGFuZycpO1xuXHRcdHRhcmdldC5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcblx0XHRsYW5nT3BlbiA9IHRydWU7XG5cdFx0ZXZlbnRzU2VydmljZS5lbWl0KEV2ZW50cy5sYW5nT3BlbiwgdHJ1ZSk7XG5cdH1cblxuXHRmdW5jdGlvbiBjbG9zZU1lbnUoKXtcblx0XHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3ctbWVudS1sYW5nJyk7XG5cdFx0dGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuXHRcdGxhbmdPcGVuID0gZmFsc2U7XG5cdFx0ZXZlbnRzU2VydmljZS5lbWl0KEV2ZW50cy5sYW5nT3BlbiwgZmFsc2UpO1xuXHR9XG5cblx0ZnVuY3Rpb24gbWVudUV2ZW50TGlzdGVuZXIobWVudU9wZW4pe1xuXHRcdGlmKG1lbnVPcGVuICYmIGxhbmdPcGVuKXtcblx0XHRcdGNsb3NlTWVudSgpO1xuXHRcdH1cblx0fVxuXG5cblx0ZnVuY3Rpb24gYWN0aXZhdGVUYWIoZXZlbnQpe1xuXHRcdHZhciBidG4gPSBldmVudC5jdXJyZW50VGFyZ2V0O1xuXHRcdHZhciB0YWIgPSBidG4ucGFyZW50RWxlbWVudDtcblxuXHRcdGlmKCF0YWIuY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKSl7XG5cblx0XHRcdGlmKGFjdGl2ZVRhYil7XG5cdFx0XHRcdGFjdGl2ZVRhYi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcblx0XHRcdH1cblx0XHRcdHRhYi5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcblx0XHRcdGFjdGl2ZVRhYiA9IHRhYjtcblxuXHRcdH1lbHNlIGlmKHRhYi5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpICYmIE1vZGVybml6ci5tYXRjaG1lZGlhICYmICFtcS5tYXRjaGVzKXtcblx0XHRcdGFjdGl2ZVRhYi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcblx0XHRcdGFjdGl2ZVRhYiA9IG51bGw7XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cblx0ZnVuY3Rpb24gc2V0QWN0aXZlVGFiKCkge1xuXHRcdHZhciBmaXJzdFRhYiA9IHRhYnNbMF0ucGFyZW50RWxlbWVudDtcblx0XHRmaXJzdFRhYi5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcblx0XHRhY3RpdmVUYWIgPSBmaXJzdFRhYjtcblx0fVxuXG5cdGZ1bmN0aW9uIHJlbW92ZUFjdGl2ZVRhYigpe1xuXHRcdGlmKGFjdGl2ZVRhYil7XG5cdFx0XHRhY3RpdmVUYWIuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG5cdFx0fVxuXHRcdGFjdGl2ZVRhYiA9IG51bGw7XG5cdH1cblxuXHRpZihNb2Rlcm5penIubWF0Y2htZWRpYSkge1xuXHRcdGlmKG1xLm1hdGNoZXMpIHtcblx0XHRcdHNldEFjdGl2ZVRhYigpO1xuXHRcdH1cblxuXHRcdG1xLmFkZExpc3RlbmVyKGZ1bmN0aW9uKGUpIHtcblx0XHRcdGlmKGUubWF0Y2hlcykge1xuXHRcdFx0XHRzZXRBY3RpdmVUYWIoKTtcblx0XHRcdH1lbHNle1xuXHRcdFx0XHRyZW1vdmVBY3RpdmVUYWIoKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdGFkZExpc3RlbmVycygpO1xuXG59O1xuIiwiJ3VzZSBzdGlyY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRhcmdldCkge1xuXHR2YXIgd3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHR3cmFwcGVyLmNsYXNzTGlzdC5hZGQoJ2VtYmVkLXJlc3BvbnNpdmUnKTtcblxuXHR0YXJnZXQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUod3JhcHBlciwgdGFyZ2V0KTtcblx0d3JhcHBlci5hcHBlbmRDaGlsZCh0YXJnZXQpO1xufTtcbiIsIid1c2Ugc3RpcmN0JztcblxuLyogZ2xvYmFsIE1vZGVybml6ciAqL1xudmFyIEhlYWRyb29tID0gcmVxdWlyZSgnaGVhZHJvb20uanMnKTtcbnZhciBNZWRpYVF1ZXJpZXMgPSByZXF1aXJlKCcuLi9jb25maWcnKS5tZWRpYVF1ZXJpZXM7XG5cbnZhciBtcSA9IE1lZGlhUXVlcmllcy5zbTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0YXJnZXQpIHtcblxuXHR2YXIgaHJPcHRpb25zID0ge307XG5cdHZhciBvcHRpb25zID0ge1xuXHRcdGluc3RhbmNlOiBuZXcgSGVhZHJvb20odGFyZ2V0LCBock9wdGlvbnMpXG5cdH07XG5cblx0aWYoTW9kZXJuaXpyLm1hdGNobWVkaWEpIHtcblx0XHRpZihtcS5tYXRjaGVzKSB7XG5cdFx0XHRvcHRpb25zLmluc3RhbmNlLmluaXQoKTtcblx0XHR9XG5cblx0XHRtcS5hZGRMaXN0ZW5lcihmdW5jdGlvbihlKSB7XG5cdFx0XHRpZighb3B0aW9ucy5pbnN0YW5jZSkge1xuXHRcdFx0XHRvcHRpb25zLmluc3RhbmNlID0gbmV3IEhlYWRyb29tKHRhcmdldCwgaHJPcHRpb25zKTtcblx0XHRcdH1cblxuXHRcdFx0aWYoZS5tYXRjaGVzKSB7XG5cdFx0XHRcdG9wdGlvbnMuaW5zdGFuY2UuaW5pdCgpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b3B0aW9ucy5pbnN0YW5jZS5kZXN0cm95KCk7XG5cdFx0XHRcdG9wdGlvbnMuaW5zdGFuY2UgPSBudWxsO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG59O1xuIiwiJ3VzZSBzdGlyY3QnO1xuXG4vKiBnbG9iYWwgTW9kZXJuaXpyICovXG52YXIgTWVkaWFRdWVyaWVzID0gcmVxdWlyZSgnLi4vY29uZmlnJykubWVkaWFRdWVyaWVzO1xudmFyIEV2ZW50cyA9IHJlcXVpcmUoJy4uL2NvbmZpZycpLmV2ZW50cztcbnZhciBtcSA9IE1lZGlhUXVlcmllcy5zbTtcbnZhciBldmVudHNTZXJ2aWNlID0gcmVxdWlyZSgnLi4vc2VydmljZXMvZXZlbnRzLnNlcnZpY2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0YXJnZXQpIHtcblxuXHR2YXIgYnRuTWVudSA9IHRhcmdldC5xdWVyeVNlbGVjdG9yKCcuanMtYnRuLW1lbnUnKTtcblxuXHR2YXIgbWVudU9wZW4gPSBmYWxzZTtcblx0dmFyIGxpc3RlbmVyc0FkZGVkID0gZmFsc2U7XG5cblx0aWYoTW9kZXJuaXpyLm1hdGNobWVkaWEpIHtcblx0XHRpZighbXEubWF0Y2hlcykge1xuXHRcdFx0YWRkTGlzdGVuZXJzKCk7XG5cdFx0fVxuXG5cdFx0bXEuYWRkTGlzdGVuZXIoZnVuY3Rpb24oZSkge1xuXHRcdFx0aWYoZS5tYXRjaGVzKSB7XG5cdFx0XHRcdHJlbW92ZUxpc3RlbmVycygpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YWRkTGlzdGVuZXJzKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXG5cdGZ1bmN0aW9uIGFkZExpc3RlbmVycygpe1xuXHRcdGlmKCFsaXN0ZW5lcnNBZGRlZCl7XG5cdFx0XHRidG5NZW51LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdG9nZ2xlTWVudSk7XG5cblx0XHRcdGV2ZW50c1NlcnZpY2UuYWRkTGlzdGVuZXIoRXZlbnRzLmxhbmdPcGVuLCBsYW5nRXZlbnRMaXN0ZW5lcik7XG5cdFx0XHRsaXN0ZW5lcnNBZGRlZCA9IHRydWU7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXJzKCl7XG5cdFx0YnRuTWVudS5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRvZ2dsZU1lbnUpO1xuXG5cdFx0ZXZlbnRzU2VydmljZS5yZW1vdmVMaXN0ZW5lcihFdmVudHMubGFuZ09wZW4sIGxhbmdFdmVudExpc3RlbmVyKTtcblx0XHRsaXN0ZW5lcnNBZGRlZCA9IGZhbHNlO1xuXHR9XG5cblx0ZnVuY3Rpb24gdG9nZ2xlTWVudSgpe1xuXHRcdGlmKG1lbnVPcGVuKXtcblx0XHRcdGNsb3NlTWVudSgpO1xuXG5cdFx0fWVsc2V7XG5cdFx0XHRvcGVuTWVudSgpO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRmdW5jdGlvbiBjbG9zZU1lbnUoKXtcblx0XHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3ctbWVudS1uYXYnKTtcblx0XHRtZW51T3BlbiA9IGZhbHNlO1xuXHRcdGV2ZW50c1NlcnZpY2UuZW1pdChFdmVudHMubWVudU9wZW4sIGZhbHNlKTtcblx0fVxuXG5cdGZ1bmN0aW9uIG9wZW5NZW51KCl7XG5cdFx0ZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdzaG93LW1lbnUtbmF2Jyk7XG5cdFx0bWVudU9wZW4gPSB0cnVlO1xuXHRcdGV2ZW50c1NlcnZpY2UuZW1pdChFdmVudHMubWVudU9wZW4sIHRydWUpO1xuXHR9XG5cblxuXHRmdW5jdGlvbiBsYW5nRXZlbnRMaXN0ZW5lcihsYW5nT3Blbil7XG5cdFx0aWYobGFuZ09wZW4gJiYgbWVudU9wZW4pe1xuXHRcdFx0Y2xvc2VNZW51KCk7XG5cdFx0fVxuXHR9XG59O1xuIiwiJ3VzZSBzdGlyY3QnO1xuXG52YXIgRXZlbnRzU2VydmljZSA9IHJlcXVpcmUoJy4uL3NlcnZpY2VzL2V2ZW50cy5zZXJ2aWNlJyk7XG52YXIgRXZlbnRzID0gcmVxdWlyZSgnLi4vY29uZmlnJykuZXZlbnRzO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgZXZlbnRzID0ge307XG5cblx0RXZlbnRzU2VydmljZS5hZGRMaXN0ZW5lcihFdmVudHMubWVudU9wZW4sIG1lbnVMaXN0ZW5lcik7XG5cdEV2ZW50c1NlcnZpY2UuYWRkTGlzdGVuZXIoRXZlbnRzLmxhbmdPcGVuLCBsYW5nTGlzdGVuZXIpO1xuXG5cblx0ZnVuY3Rpb24gbWVudUxpc3RlbmVyKGUpe1xuXHRcdGV2ZW50c1tFdmVudHMubWVudU9wZW5dID0gZTtcblx0XHRjaGVja092ZXJsYXkoKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGxhbmdMaXN0ZW5lcihlKXtcblx0XHRldmVudHNbRXZlbnRzLmxhbmdPcGVuXSA9IGU7XG5cdFx0Y2hlY2tPdmVybGF5KCk7XG5cdH1cblxuXHRmdW5jdGlvbiBjaGVja092ZXJsYXkoKXtcblx0XHR2YXIgc2hvdyA9IE9iamVjdC5rZXlzKGV2ZW50cykuc29tZShmdW5jdGlvbihrZXkpeyByZXR1cm4gZXZlbnRzW2tleV0gPT09IHRydWU7IH0pO1xuXHRcdC8vY29uc29sZS5sb2coJ3Nob3c6ICcsIGV2ZW50cywgc2hvdyk7XG5cblx0XHRpZihzaG93KXtcblx0XHRcdHNob3dPdmVybGF5KCk7XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHRoaWRlT3ZlcmxheSgpO1xuXHRcdH1cblx0fVxuXG5cblx0ZnVuY3Rpb24gc2hvd092ZXJsYXkoKXtcblx0XHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ3Nob3ctb3ZlcmxheScpO1xuXHR9XG5cblx0ZnVuY3Rpb24gaGlkZU92ZXJsYXkoKXtcblx0XHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3ctb3ZlcmxheScpO1xuXHR9XG59O1xuIiwiJ3VzZSBzdGlyY3QnO1xuXG52YXIgU3dpcGVyID0gcmVxdWlyZSgnc3dpcGVyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odGFyZ2V0KSB7XG5cblx0dmFyIFN3aXBlck9wdHMgPSB7XG5cdFx0aW5pdDogZmFsc2UsXG5cdFx0bG9vcDogdHJ1ZSxcblx0XHRwcmVsb2FkSW1hZ2VzOiB0cnVlLFxuXHRcdGxhenk6IHtcblx0XHRcdGxvYWRQcmV2TmV4dDogdHJ1ZSxcblx0XHR9LFxuXHRcdGxvYWRPblRyYW5zaXRpb25TdGFydCA6IHRydWUsXG5cdFx0Z3JhYkN1cnNvcjogdHJ1ZSxcblx0XHRwYWdpbmF0aW9uOiB7XG5cdFx0XHRlbDogJy5qcy1zbGlkZXItcGFnaW5hdGlvbicsXG5cdFx0XHRjbGlja2FibGU6IHRydWVcblx0XHR9LFxuXHRcdG5hdmlnYXRpb24gOiB7XG5cdFx0XHRuZXh0RWw6ICcuanMtc2xpZGVyLWJ1dHRvbi1uZXh0Jyxcblx0XHRcdHByZXZFbDogJy5qcy1zbGlkZXItYnV0dG9uLXByZXYnLFxuXHRcdH1cblx0fTtcblxuXHRpZih0YXJnZXQuZGF0YXNldC5wYWdpbmF0aW9uTGFiZWwgPT09ICd0cnVlJykge1xuXG5cdFx0dmFyIHNsaWRlcyA9IHRhcmdldC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtc2xpZGUnKTtcblxuXHRcdFN3aXBlck9wdHMucGFnaW5hdGlvbi5yZW5kZXJCdWxsZXQgPSBmdW5jdGlvbiAoaW5kZXgsIGNsYXNzTmFtZSkge1xuXHRcdFx0cmV0dXJuICc8c3BhbiBjbGFzcz1cIicgKyBjbGFzc05hbWUgKyAnXCI+JyArIHNsaWRlc1tpbmRleF0uZGF0YXNldC5sYWJlbCArICc8L3NwYW4+Jztcblx0XHR9O1xuXG5cdFx0dmFyIHNsaWRlckNvbnRyb2xzID0gdGFyZ2V0LnF1ZXJ5U2VsZWN0b3IoJy5qcy1zbGlkZXItY29udHJvbHMnKTtcblx0XHRzbGlkZXJDb250cm9scy5jbGFzc0xpc3QuYWRkKCdzbGlkZXItY29udHJvbHMtLWxhYmVscycpO1xuXG5cdH1cblxuXHR2YXIgb3B0aW9ucyA9IHtcblx0XHRpbnN0YW5jZTogbmV3IFN3aXBlcih0YXJnZXQsIFN3aXBlck9wdHMpXG5cdH07XG5cblx0b3B0aW9ucy5pbnN0YW5jZS5pbml0KCk7XG59O1xuIiwiJ3VzZSBzdGlyY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRhcmdldCkge1xuXHR2YXIgcGFyZW50ID0gdGFyZ2V0LmNsb3Nlc3QoJy5pdGVtJyk7XG5cblx0ZnVuY3Rpb24gb25DbGlja1RvZ2dsZSgpe1xuXHRcdHBhcmVudC5jbGFzc0xpc3QudG9nZ2xlKCdpcy1vcGVuJyk7XG5cdH1cblxuXHR0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBvbkNsaWNrVG9nZ2xlKTtcbn07XG4iLCIndXNlIHN0aXJjdCc7XG5cbnZhciBDbGFzc05hbWUgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2NsYXNzTmFtZXMnKTtcbnZhciBpblZpZXcgPSByZXF1aXJlKCdpbi12aWV3Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odGFyZ2V0KSB7XG5cblx0dmFyIHBsYXllcjtcblx0dmFyIGNsYXNzTmFtZSA9IENsYXNzTmFtZSgpO1xuXG5cdHRhcmdldC5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZSk7XG5cblx0ZnVuY3Rpb24gb25DYW5QbGF5ICgpIHtcblx0XHRwbGF5ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2FucGxheScsIG9uQ2FuUGxheSk7XG5cdFx0cGxheWVyLnBsYXkoKTtcblx0XHR0YXJnZXQuY2xhc3NMaXN0LmFkZCgnaXMtcGxheWluZycpO1xuXHRcdHRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1sb2FkaW5nJyk7XG5cdH1cblxuXHRmdW5jdGlvbiBpblZpZXdFbnRlciAoKSB7XG5cdFx0aWYoIXBsYXllcikge1xuXHRcdFx0dGFyZ2V0LmNsYXNzTGlzdC5hZGQoJ2lzLWxvYWRpbmcnKTtcblx0XHRcdHBsYXllciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ZpZGVvJyk7XG5cblx0XHRcdHBsYXllci5jbGFzc0xpc3QuYWRkKCd2aWRlby1wbGF5ZXInKTtcblx0XHRcdHBsYXllci5zZXRBdHRyaWJ1dGUoJ3BsYXlzaW5saW5lJywgdHJ1ZSk7XG5cdFx0XHRwbGF5ZXIuc2V0QXR0cmlidXRlKCdtdXRlZCcsIHRydWUpO1xuXHRcdFx0cGxheWVyLnNldEF0dHJpYnV0ZSgnYXV0b3BsYXknLCB0cnVlKTtcblx0XHRcdHBsYXllci5zZXRBdHRyaWJ1dGUoJ2xvb3AnLCB0cnVlKTtcblx0XHRcdHBsYXllci5zZXRBdHRyaWJ1dGUoJ3NyYycsIHRhcmdldC5kYXRhc2V0LnZpZGVvVXJsKTtcblx0XHRcdHRhcmdldC5hcHBlbmRDaGlsZChwbGF5ZXIpO1xuXG5cdFx0XHRwbGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignY2FucGxheScsIG9uQ2FuUGxheSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9uQ2FuUGxheSgpO1xuXHRcdH1cblxuXG5cblx0fVxuXG5cdGZ1bmN0aW9uIGluVmlld0V4aXQgKCkge1xuXHRcdGlmKHBsYXllcikge1xuXHRcdFx0cGxheWVyLnBhdXNlKCk7XG5cdFx0fVxuXHR9XG5cblx0aW5WaWV3KCcuJyArIGNsYXNzTmFtZSkub24oJ2VudGVyJywgaW5WaWV3RW50ZXIpLm9uKCdleGl0JywgaW5WaWV3RXhpdCk7XG5cbn07XG4iLCIndXNlIHN0aXJjdCc7XG5cbnZhciBDbGFzc05hbWUgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2NsYXNzTmFtZXMnKTtcbnZhciBZVFBsYXllciA9IHJlcXVpcmUoJ3l0LXBsYXllcicpO1xudmFyIGluVmlldyA9IHJlcXVpcmUoJ2luLXZpZXcnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0YXJnZXQpIHtcblxuXHR2YXIgVmlkZW9PcHRzID0ge1xuXHRcdGZ1bGxzY3JlZW46IGZhbHNlLFxuXHRcdG1vZGVzdEJyYW5kaW5nOiB0cnVlLFxuXHRcdHJlbGF0ZWQ6IGZhbHNlLFxuXHRcdGluZm86IGZhbHNlXG5cdH07XG5cblx0Ly8gRWxlbWVudHNcblx0dmFyIHBsYXlCdXR0b24gPSB0YXJnZXQucXVlcnlTZWxlY3RvcignLmpzLXBsYXktYnV0dG9uJyk7XG5cdHZhciBjbGFzc05hbWUgPSBDbGFzc05hbWUoKTtcblxuXHRmdW5jdGlvbiBpbml0WW91dHViZSgpe1xuXG5cdFx0dGFyZ2V0LmNsYXNzTGlzdC5hZGQoJ2lzLWxvYWRpbmcnKTtcblx0XHR0YXJnZXQuY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpO1xuXG5cdFx0cGxheUJ1dHRvbi5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGluaXRZb3V0dWJlKTtcblx0XHRwbGF5QnV0dG9uLmRpc2FibGVkID0gdHJ1ZTtcblxuXHRcdGlmKCFwbGF5ZXJFbCkge1xuXHRcdFx0dmFyIHBsYXllckVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHRwbGF5ZXJFbC5jbGFzc0xpc3QuYWRkKCd2aWRlby1wbGF5ZXInKTtcblx0XHRcdHRhcmdldC5hcHBlbmRDaGlsZChwbGF5ZXJFbCk7XG5cdFx0fVxuXG5cdFx0aWYoIXBsYXllcikge1xuXHRcdFx0dmFyIHBsYXllciA9IG5ldyBZVFBsYXllcihwbGF5ZXJFbCwgVmlkZW9PcHRzKTtcblx0XHRcdHBsYXllci5sb2FkKHRhcmdldC5kYXRhc2V0LnZpZGVvSWQpO1xuXHRcdH1cblxuXG5cdFx0cGxheWVyLnBsYXkoKTtcblxuXG5cdFx0cGxheWVyLm9uKCdwbGF5aW5nJywgZnVuY3Rpb24oKXtcblx0XHRcdHRhcmdldC5jbGFzc0xpc3QuYWRkKCdpcy1wbGF5aW5nJyk7XG5cdFx0XHR0YXJnZXQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtbG9hZGluZycpO1xuXHRcdH0pO1xuXG5cdFx0cGxheWVyLm9uKCdlbmRlZCcsIGZ1bmN0aW9uKCl7XG5cdFx0XHR0YXJnZXQuY2xhc3NMaXN0LnJlbW92ZSh0YXJnZXQuZGF0YXNldC52aWRlb0lkKTtcblxuXHRcdFx0dGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXBsYXlpbmcnKTtcblx0XHRcdHBsYXlCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBpbml0WW91dHViZSk7XG5cdFx0XHRwbGF5QnV0dG9uLmRpc2FibGVkID0gZmFsc2U7XG5cdFx0fSk7XG5cblx0XHRpblZpZXcoJy4nICsgY2xhc3NOYW1lKS5vbignZXhpdCcsIGZ1bmN0aW9uKCl7XG5cdFx0XHRwbGF5ZXIucGF1c2UoKTtcblx0XHR9KTtcblx0fVxuXG5cdHBsYXlCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBpbml0WW91dHViZSk7XG59O1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IERpZGVyaWtzZW4gb24gMTIvMTIvMjAxNy5cbiAqL1xuXG52YXIgbGlzdGVuZXJzID0ge1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGFkZExpc3RlbmVyOiBhZGRMaXN0ZW5lcixcblx0cmVtb3ZlTGlzdGVuZXI6IHJlbW92ZUxpc3RlbmVyLFxuXHRlbWl0OiBlbWl0XG59O1xuXG5mdW5jdGlvbiByZW1vdmVMaXN0ZW5lcihrZXksIGxpc3RlbmVyKSB7XG5cdGlmKGxpc3RlbmVyc1trZXldICYmIGxpc3RlbmVyc1trZXldLmxlbmd0aCAhPT0gMCkge1xuXHRcdHZhciBpbmRleCA9IGxpc3RlbmVyc1trZXldLmZpbmRJbmRleChmdW5jdGlvbiAoZWFjaCkge1xuXHRcdFx0cmV0dXJuIGVhY2ggPT09IGxpc3RlbmVyO1xuXHRcdH0pO1xuXG5cdFx0bGlzdGVuZXJzW2tleV0uc3BsaWNlKGluZGV4LCAxKTtcblx0fVxufVxuXG5mdW5jdGlvbiBhZGRMaXN0ZW5lcihrZXksIGxpc3RlbmVyKXtcblx0aWYobGlzdGVuZXJzW2tleV0pIHtcblx0XHRsaXN0ZW5lcnNba2V5XS5wdXNoKGxpc3RlbmVyKTtcblx0fSBlbHNlIHtcblx0XHRsaXN0ZW5lcnNba2V5XSA9IFtsaXN0ZW5lcl07XG5cdH1cbn1cblxuZnVuY3Rpb24gZW1pdChrZXksIGV2ZW50RGF0YSkge1xuXHRpZihsaXN0ZW5lcnNba2V5XSAmJiBsaXN0ZW5lcnNba2V5XS5sZW5ndGggIT09IDApe1xuXHRcdGxpc3RlbmVyc1trZXldLmZvckVhY2goZnVuY3Rpb24obGlzdGVuZXIpe1xuXHRcdFx0bGlzdGVuZXIoZXZlbnREYXRhKTtcblx0XHR9KTtcblx0fVxufVxuXG4iXX0=
