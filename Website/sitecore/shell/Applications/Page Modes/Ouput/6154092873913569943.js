/*  Prototype JavaScript framework, version 1.7
 *  (c) 2005-2010 Sam Stephenson
 *
 *  Prototype is freely distributable under the terms of an MIT-style license.
 *  For details, see the Prototype web site: http://www.prototypejs.org/
 *
 *--------------------------------------------------------------------------*/

var Prototype = {

  Version: '1.7',

  Browser: (function(){
    var ua = navigator.userAgent;
    var isOpera = Object.prototype.toString.call(window.opera) == '[object Opera]';
    return {
      IE:             !!window.attachEvent && !isOpera,
      Opera:          isOpera,
      WebKit:         ua.indexOf('AppleWebKit/') > -1,
      Gecko:          ua.indexOf('Gecko') > -1 && ua.indexOf('KHTML') === -1,
      MobileSafari:   /Apple.*Mobile/.test(ua)
    }
  })(),

  BrowserFeatures: {
    XPath: !!document.evaluate,

    SelectorsAPI: !!document.querySelector,

    ElementExtensions: (function() {
      var constructor = window.Element || window.HTMLElement;
      return !!(constructor && constructor.prototype);
    })(),
    SpecificElementExtensions: (function() {
      if (typeof window.HTMLDivElement !== 'undefined')
        return true;

      var div = document.createElement('div'),
          form = document.createElement('form'),
          isSupported = false;

      if (div['__proto__'] && (div['__proto__'] !== form['__proto__'])) {
        isSupported = true;
      }

      div = form = null;

      return isSupported;
    })()
  },

  ScriptFragment: '<script[^>]*>([\\S\\s]*?)<\/script>',
  JSONFilter: /^\/\*-secure-([\s\S]*)\*\/\s*$/,

  emptyFunction: function() { },

  K: function(x) { return x }
};

if (Prototype.Browser.MobileSafari)
  Prototype.BrowserFeatures.SpecificElementExtensions = false;


var Abstract = { };


var Try = {
  these: function() {
    var returnValue;

    for (var i = 0, length = arguments.length; i < length; i++) {
      var lambda = arguments[i];
      try {
        returnValue = lambda();
        break;
      } catch (e) { }
    }

    return returnValue;
  }
};

/* Based on Alex Arnell's inheritance implementation. */

var Class = (function() {

  var IS_DONTENUM_BUGGY = (function(){
    for (var p in { toString: 1 }) {
      if (p === 'toString') return false;
    }
    return true;
  })();

  function subclass() {};
  function create() {
    var parent = null, properties = $A(arguments);
    if (Object.isFunction(properties[0]))
      parent = properties.shift();

    function klass() {
      this.initialize.apply(this, arguments);
    }

    Object.extend(klass, Class.Methods);
    klass.superclass = parent;
    klass.subclasses = [];

    if (parent) {
      subclass.prototype = parent.prototype;
      klass.prototype = new subclass;
      parent.subclasses.push(klass);
    }

    for (var i = 0, length = properties.length; i < length; i++)
      klass.addMethods(properties[i]);

    if (!klass.prototype.initialize)
      klass.prototype.initialize = Prototype.emptyFunction;

    klass.prototype.constructor = klass;
    return klass;
  }

  function addMethods(source) {
    var ancestor   = this.superclass && this.superclass.prototype,
        properties = Object.keys(source);

    if (IS_DONTENUM_BUGGY) {
      if (source.toString != Object.prototype.toString)
        properties.push("toString");
      if (source.valueOf != Object.prototype.valueOf)
        properties.push("valueOf");
    }

    for (var i = 0, length = properties.length; i < length; i++) {
      var property = properties[i], value = source[property];
      if (ancestor && Object.isFunction(value) &&
          value.argumentNames()[0] == "$super") {
        var method = value;
        value = (function(m) {
          return function() { return ancestor[m].apply(this, arguments); };
        })(property).wrap(method);

        value.valueOf = method.valueOf.bind(method);
        value.toString = method.toString.bind(method);
      }
      this.prototype[property] = value;
    }

    return this;
  }

  return {
    create: create,
    Methods: {
      addMethods: addMethods
    }
  };
})();
(function() {

  var _toString = Object.prototype.toString,
      NULL_TYPE = 'Null',
      UNDEFINED_TYPE = 'Undefined',
      BOOLEAN_TYPE = 'Boolean',
      NUMBER_TYPE = 'Number',
      STRING_TYPE = 'String',
      OBJECT_TYPE = 'Object',
      FUNCTION_CLASS = '[object Function]',
      BOOLEAN_CLASS = '[object Boolean]',
      NUMBER_CLASS = '[object Number]',
      STRING_CLASS = '[object String]',
      ARRAY_CLASS = '[object Array]',
      DATE_CLASS = '[object Date]',
      NATIVE_JSON_STRINGIFY_SUPPORT = window.JSON &&
        typeof JSON.stringify === 'function' &&
        JSON.stringify(0) === '0' &&
        typeof JSON.stringify(Prototype.K) === 'undefined';

  function Type(o) {
    switch(o) {
      case null: return NULL_TYPE;
      case (void 0): return UNDEFINED_TYPE;
    }
    var type = typeof o;
    switch(type) {
      case 'boolean': return BOOLEAN_TYPE;
      case 'number':  return NUMBER_TYPE;
      case 'string':  return STRING_TYPE;
    }
    return OBJECT_TYPE;
  }

  function extend(destination, source) {
    for (var property in source)
      destination[property] = source[property];
    return destination;
  }

  function inspect(object) {
    try {
      if (isUndefined(object)) return 'undefined';
      if (object === null) return 'null';
      return object.inspect ? object.inspect() : String(object);
    } catch (e) {
      if (e instanceof RangeError) return '...';
      throw e;
    }
  }

  function toJSON(value) {
    return Str('', { '': value }, []);
  }

  function Str(key, holder, stack) {
    var value = holder[key],
        type = typeof value;

    if (Type(value) === OBJECT_TYPE && typeof value.toJSON === 'function') {
      value = value.toJSON(key);
    }

    var _class = _toString.call(value);

    switch (_class) {
      case NUMBER_CLASS:
      case BOOLEAN_CLASS:
      case STRING_CLASS:
        value = value.valueOf();
    }

    switch (value) {
      case null: return 'null';
      case true: return 'true';
      case false: return 'false';
    }

    type = typeof value;
    switch (type) {
      case 'string':
        return value.inspect(true);
      case 'number':
        return isFinite(value) ? String(value) : 'null';
      case 'object':

        for (var i = 0, length = stack.length; i < length; i++) {
          if (stack[i] === value) { throw new TypeError(); }
        }
        stack.push(value);

        var partial = [];
        if (_class === ARRAY_CLASS) {
          for (var i = 0, length = value.length; i < length; i++) {
            var str = Str(i, value, stack);
            partial.push(typeof str === 'undefined' ? 'null' : str);
          }
          partial = '[' + partial.join(',') + ']';
        } else {
          var keys = Object.keys(value);
          for (var i = 0, length = keys.length; i < length; i++) {
            var key = keys[i], str = Str(key, value, stack);
            if (typeof str !== "undefined") {
               partial.push(key.inspect(true)+ ':' + str);
             }
          }
          partial = '{' + partial.join(',') + '}';
        }
        stack.pop();
        return partial;
    }
  }

  function stringify(object) {
    return JSON.stringify(object);
  }

  function toQueryString(object) {
    return $H(object).toQueryString();
  }

  function toHTML(object) {
    return object && object.toHTML ? object.toHTML() : String.interpret(object);
  }

  function keys(object) {
    if (Type(object) !== OBJECT_TYPE) { throw new TypeError(); }
    var results = [];
    for (var property in object) {
      if (object.hasOwnProperty(property)) {
        results.push(property);
      }
    }
    return results;
  }

  function values(object) {
    var results = [];
    for (var property in object)
      results.push(object[property]);
    return results;
  }

  function clone(object) {
    return extend({ }, object);
  }

  function isElement(object) {
    return !!(object && object.nodeType == 1);
  }

  function isArray(object) {
    return _toString.call(object) === ARRAY_CLASS;
  }

  var hasNativeIsArray = (typeof Array.isArray == 'function')
    && Array.isArray([]) && !Array.isArray({});

  if (hasNativeIsArray) {
    isArray = Array.isArray;
  }

  function isHash(object) {
    return object instanceof Hash;
  }

  function isFunction(object) {
    return _toString.call(object) === FUNCTION_CLASS;
  }

  function isString(object) {
    return _toString.call(object) === STRING_CLASS;
  }

  function isNumber(object) {
    return _toString.call(object) === NUMBER_CLASS;
  }

  function isDate(object) {
    return _toString.call(object) === DATE_CLASS;
  }

  function isUndefined(object) {
    return typeof object === "undefined";
  }

  extend(Object, {
    extend:        extend,
    inspect:       inspect,
    toJSON:        NATIVE_JSON_STRINGIFY_SUPPORT ? stringify : toJSON,
    toQueryString: toQueryString,
    toHTML:        toHTML,
    keys:          Object.keys || keys,
    values:        values,
    clone:         clone,
    isElement:     isElement,
    isArray:       isArray,
    isHash:        isHash,
    isFunction:    isFunction,
    isString:      isString,
    isNumber:      isNumber,
    isDate:        isDate,
    isUndefined:   isUndefined
  });
})();
Object.extend(Function.prototype, (function() {
  var slice = Array.prototype.slice;

  function update(array, args) {
    var arrayLength = array.length, length = args.length;
    while (length--) array[arrayLength + length] = args[length];
    return array;
  }

  function merge(array, args) {
    array = slice.call(array, 0);
    return update(array, args);
  }

  function argumentNames() {
    var names = this.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
      .replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
      .replace(/\s+/g, '').split(',');
    return names.length == 1 && !names[0] ? [] : names;
  }

  function bind(context) {
    if (arguments.length < 2 && Object.isUndefined(arguments[0])) return this;
    var __method = this, args = slice.call(arguments, 1);
    return function() {
      var a = merge(args, arguments);
      return __method.apply(context, a);
    }
  }

  function bindAsEventListener(context) {
    var __method = this, args = slice.call(arguments, 1);
    return function(event) {
      var a = update([event || window.event], args);
      return __method.apply(context, a);
    }
  }

  function curry() {
    if (!arguments.length) return this;
    var __method = this, args = slice.call(arguments, 0);
    return function() {
      var a = merge(args, arguments);
      return __method.apply(this, a);
    }
  }

  function delay(timeout) {
    var __method = this, args = slice.call(arguments, 1);
    timeout = timeout * 1000;
    return window.setTimeout(function() {
      return __method.apply(__method, args);
    }, timeout);
  }

  function defer() {
    var args = update([0.01], arguments);
    return this.delay.apply(this, args);
  }

  function wrap(wrapper) {
    var __method = this;
    return function() {
      var a = update([__method.bind(this)], arguments);
      return wrapper.apply(this, a);
    }
  }

  function methodize() {
    if (this._methodized) return this._methodized;
    var __method = this;
    return this._methodized = function() {
      var a = update([this], arguments);
      return __method.apply(null, a);
    };
  }

  return {
    argumentNames:       argumentNames,
    bind:                bind,
    bindAsEventListener: bindAsEventListener,
    curry:               curry,
    delay:               delay,
    defer:               defer,
    wrap:                wrap,
    methodize:           methodize
  }
})());



(function(proto) {


  function toISOString() {
    return this.getUTCFullYear() + '-' +
      (this.getUTCMonth() + 1).toPaddedString(2) + '-' +
      this.getUTCDate().toPaddedString(2) + 'T' +
      this.getUTCHours().toPaddedString(2) + ':' +
      this.getUTCMinutes().toPaddedString(2) + ':' +
      this.getUTCSeconds().toPaddedString(2) + 'Z';
  }


  function toJSON() {
    return this.toISOString();
  }

  if (!proto.toISOString) proto.toISOString = toISOString;
  if (!proto.toJSON) proto.toJSON = toJSON;

})(Date.prototype);


RegExp.prototype.match = RegExp.prototype.test;

RegExp.escape = function(str) {
  return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
};
var PeriodicalExecuter = Class.create({
  initialize: function(callback, frequency) {
    this.callback = callback;
    this.frequency = frequency;
    this.currentlyExecuting = false;

    this.registerCallback();
  },

  registerCallback: function() {
    this.timer = setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);
  },

  execute: function() {
    this.callback(this);
  },

  stop: function() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  },

  onTimerEvent: function() {
    if (!this.currentlyExecuting) {
      try {
        this.currentlyExecuting = true;
        this.execute();
        this.currentlyExecuting = false;
      } catch(e) {
        this.currentlyExecuting = false;
        throw e;
      }
    }
  }
});
Object.extend(String, {
  interpret: function(value) {
    return value == null ? '' : String(value);
  },
  specialChar: {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '\\': '\\\\'
  }
});

Object.extend(String.prototype, (function() {
  var NATIVE_JSON_PARSE_SUPPORT = window.JSON &&
    typeof JSON.parse === 'function' &&
    JSON.parse('{"test": true}').test;

  function prepareReplacement(replacement) {
    if (Object.isFunction(replacement)) return replacement;
    var template = new Template(replacement);
    return function(match) { return template.evaluate(match) };
  }

  function gsub(pattern, replacement) {
    var result = '', source = this, match;
    replacement = prepareReplacement(replacement);

    if (Object.isString(pattern))
      pattern = RegExp.escape(pattern);

    if (!(pattern.length || pattern.source)) {
      replacement = replacement('');
      return replacement + source.split('').join(replacement) + replacement;
    }

    while (source.length > 0) {
      if (match = source.match(pattern)) {
        result += source.slice(0, match.index);
        result += String.interpret(replacement(match));
        source  = source.slice(match.index + match[0].length);
      } else {
        result += source, source = '';
      }
    }
    return result;
  }

  function sub(pattern, replacement, count) {
    replacement = prepareReplacement(replacement);
    count = Object.isUndefined(count) ? 1 : count;

    return this.gsub(pattern, function(match) {
      if (--count < 0) return match[0];
      return replacement(match);
    });
  }

  function scan(pattern, iterator) {
    this.gsub(pattern, iterator);
    return String(this);
  }

  function truncate(length, truncation) {
    length = length || 30;
    truncation = Object.isUndefined(truncation) ? '...' : truncation;
    return this.length > length ?
      this.slice(0, length - truncation.length) + truncation : String(this);
  }

  function strip() {
    return this.replace(/^\s+/, '').replace(/\s+$/, '');
  }

  function stripTags() {
    return this.replace(/<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?>|<\/\w+>/gi, '');
  }

  function stripScripts() {
    return this.replace(new RegExp(Prototype.ScriptFragment, 'img'), '');
  }

  function extractScripts() {
    var matchAll = new RegExp(Prototype.ScriptFragment, 'img'),
        matchOne = new RegExp(Prototype.ScriptFragment, 'im');
    return (this.match(matchAll) || []).map(function(scriptTag) {
      return (scriptTag.match(matchOne) || ['', ''])[1];
    });
  }

  function evalScripts() {
    return this.extractScripts().map(function(script) { return eval(script) });
  }

  function escapeHTML() {
    return this.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function unescapeHTML() {
    return this.stripTags().replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
  }


  function toQueryParams(separator) {
    var match = this.strip().match(/([^?#]*)(#.*)?$/);
    if (!match) return { };

    return match[1].split(separator || '&').inject({ }, function(hash, pair) {
      if ((pair = pair.split('='))[0]) {
        var key = decodeURIComponent(pair.shift()),
            value = pair.length > 1 ? pair.join('=') : pair[0];

        if (value != undefined) value = decodeURIComponent(value);

        if (key in hash) {
          if (!Object.isArray(hash[key])) hash[key] = [hash[key]];
          hash[key].push(value);
        }
        else hash[key] = value;
      }
      return hash;
    });
  }

  function toArray() {
    return this.split('');
  }

  function succ() {
    return this.slice(0, this.length - 1) +
      String.fromCharCode(this.charCodeAt(this.length - 1) + 1);
  }

  function times(count) {
    return count < 1 ? '' : new Array(count + 1).join(this);
  }

  function camelize() {
    return this.replace(/-+(.)?/g, function(match, chr) {
      return chr ? chr.toUpperCase() : '';
    });
  }

  function capitalize() {
    return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
  }

  function underscore() {
    return this.replace(/::/g, '/')
               .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
               .replace(/([a-z\d])([A-Z])/g, '$1_$2')
               .replace(/-/g, '_')
               .toLowerCase();
  }

  function dasherize() {
    return this.replace(/_/g, '-');
  }

  function inspect(useDoubleQuotes) {
    var escapedString = this.replace(/[\x00-\x1f\\]/g, function(character) {
      if (character in String.specialChar) {
        return String.specialChar[character];
      }
      return '\\u00' + character.charCodeAt().toPaddedString(2, 16);
    });
    if (useDoubleQuotes) return '"' + escapedString.replace(/"/g, '\\"') + '"';
    return "'" + escapedString.replace(/'/g, '\\\'') + "'";
  }

  function unfilterJSON(filter) {
    return this.replace(filter || Prototype.JSONFilter, '$1');
  }

  function isJSON() {
    var str = this;
    if (str.blank()) return false;
    str = str.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@');
    str = str.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']');
    str = str.replace(/(?:^|:|,)(?:\s*\[)+/g, '');
    return (/^[\],:{}\s]*$/).test(str);
  }

  function evalJSON(sanitize) {
    var json = this.unfilterJSON(),
        cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    if (cx.test(json)) {
      json = json.replace(cx, function (a) {
        return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
      });
    }
    try {
      if (!sanitize || json.isJSON()) return eval('(' + json + ')');
    } catch (e) { }
    throw new SyntaxError('Badly formed JSON string: ' + this.inspect());
  }

  function parseJSON() {
    var json = this.unfilterJSON();
    return JSON.parse(json);
  }

  function include(pattern) {
    return this.indexOf(pattern) > -1;
  }

  function startsWith(pattern) {
    return this.lastIndexOf(pattern, 0) === 0;
  }

  function endsWith(pattern) {
    var d = this.length - pattern.length;
    return d >= 0 && this.indexOf(pattern, d) === d;
  }

  function empty() {
    return this == '';
  }

  function blank() {
    return /^\s*$/.test(this);
  }

  function interpolate(object, pattern) {
    return new Template(this, pattern).evaluate(object);
  }

  return {
    gsub:           gsub,
    sub:            sub,
    scan:           scan,
    truncate:       truncate,
    strip:          String.prototype.trim || strip,
    stripTags:      stripTags,
    stripScripts:   stripScripts,
    extractScripts: extractScripts,
    evalScripts:    evalScripts,
    escapeHTML:     escapeHTML,
    unescapeHTML:   unescapeHTML,
    toQueryParams:  toQueryParams,
    parseQuery:     toQueryParams,
    toArray:        toArray,
    succ:           succ,
    times:          times,
    camelize:       camelize,
    capitalize:     capitalize,
    underscore:     underscore,
    dasherize:      dasherize,
    inspect:        inspect,
    unfilterJSON:   unfilterJSON,
    isJSON:         isJSON,
    evalJSON:       NATIVE_JSON_PARSE_SUPPORT ? parseJSON : evalJSON,
    include:        include,
    startsWith:     startsWith,
    endsWith:       endsWith,
    empty:          empty,
    blank:          blank,
    interpolate:    interpolate
  };
})());

var Template = Class.create({
  initialize: function(template, pattern) {
    this.template = template.toString();
    this.pattern = pattern || Template.Pattern;
  },

  evaluate: function(object) {
    if (object && Object.isFunction(object.toTemplateReplacements))
      object = object.toTemplateReplacements();

    return this.template.gsub(this.pattern, function(match) {
      if (object == null) return (match[1] + '');

      var before = match[1] || '';
      if (before == '\\') return match[2];

      var ctx = object, expr = match[3],
          pattern = /^([^.[]+|\[((?:.*?[^\\])?)\])(\.|\[|$)/;

      match = pattern.exec(expr);
      if (match == null) return before;

      while (match != null) {
        var comp = match[1].startsWith('[') ? match[2].replace(/\\\\]/g, ']') : match[1];
        ctx = ctx[comp];
        if (null == ctx || '' == match[3]) break;
        expr = expr.substring('[' == match[3] ? match[1].length : match[0].length);
        match = pattern.exec(expr);
      }

      return before + String.interpret(ctx);
    });
  }
});
Template.Pattern = /(^|.|\r|\n)(#\{(.*?)\})/;

var $break = { };

var Enumerable = (function() {
  function each(iterator, context) {
    var index = 0;
    try {
      this._each(function(value) {
        iterator.call(context, value, index++);
      });
    } catch (e) {
      if (e != $break) throw e;
    }
    return this;
  }

  function eachSlice(number, iterator, context) {
    var index = -number, slices = [], array = this.toArray();
    if (number < 1) return array;
    while ((index += number) < array.length)
      slices.push(array.slice(index, index+number));
    return slices.collect(iterator, context);
  }

  function all(iterator, context) {
    iterator = iterator || Prototype.K;
    var result = true;
    this.each(function(value, index) {
      result = result && !!iterator.call(context, value, index);
      if (!result) throw $break;
    });
    return result;
  }

  function any(iterator, context) {
    iterator = iterator || Prototype.K;
    var result = false;
    this.each(function(value, index) {
      if (result = !!iterator.call(context, value, index))
        throw $break;
    });
    return result;
  }

  function collect(iterator, context) {
    iterator = iterator || Prototype.K;
    var results = [];
    this.each(function(value, index) {
      results.push(iterator.call(context, value, index));
    });
    return results;
  }

  function detect(iterator, context) {
    var result;
    this.each(function(value, index) {
      if (iterator.call(context, value, index)) {
        result = value;
        throw $break;
      }
    });
    return result;
  }

  function findAll(iterator, context) {
    var results = [];
    this.each(function(value, index) {
      if (iterator.call(context, value, index))
        results.push(value);
    });
    return results;
  }

  function grep(filter, iterator, context) {
    iterator = iterator || Prototype.K;
    var results = [];

    if (Object.isString(filter))
      filter = new RegExp(RegExp.escape(filter));

    this.each(function(value, index) {
      if (filter.match(value))
        results.push(iterator.call(context, value, index));
    });
    return results;
  }

  function include(object) {
    if (Object.isFunction(this.indexOf))
      if (this.indexOf(object) != -1) return true;

    var found = false;
    this.each(function(value) {
      if (value == object) {
        found = true;
        throw $break;
      }
    });
    return found;
  }

  function inGroupsOf(number, fillWith) {
    fillWith = Object.isUndefined(fillWith) ? null : fillWith;
    return this.eachSlice(number, function(slice) {
      while(slice.length < number) slice.push(fillWith);
      return slice;
    });
  }

  function inject(memo, iterator, context) {
    this.each(function(value, index) {
      memo = iterator.call(context, memo, value, index);
    });
    return memo;
  }

  function invoke(method) {
    var args = $A(arguments).slice(1);
    return this.map(function(value) {
      return value[method].apply(value, args);
    });
  }

  function max(iterator, context) {
    iterator = iterator || Prototype.K;
    var result;
    this.each(function(value, index) {
      value = iterator.call(context, value, index);
      if (result == null || value >= result)
        result = value;
    });
    return result;
  }

  function min(iterator, context) {
    iterator = iterator || Prototype.K;
    var result;
    this.each(function(value, index) {
      value = iterator.call(context, value, index);
      if (result == null || value < result)
        result = value;
    });
    return result;
  }

  function partition(iterator, context) {
    iterator = iterator || Prototype.K;
    var trues = [], falses = [];
    this.each(function(value, index) {
      (iterator.call(context, value, index) ?
        trues : falses).push(value);
    });
    return [trues, falses];
  }

  function pluck(property) {
    var results = [];
    this.each(function(value) {
      results.push(value[property]);
    });
    return results;
  }

  function reject(iterator, context) {
    var results = [];
    this.each(function(value, index) {
      if (!iterator.call(context, value, index))
        results.push(value);
    });
    return results;
  }

  function sortBy(iterator, context) {
    return this.map(function(value, index) {
      return {
        value: value,
        criteria: iterator.call(context, value, index)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }).pluck('value');
  }

  function toArray() {
    return this.map();
  }

  function zip() {
    var iterator = Prototype.K, args = $A(arguments);
    if (Object.isFunction(args.last()))
      iterator = args.pop();

    var collections = [this].concat(args).map($A);
    return this.map(function(value, index) {
      return iterator(collections.pluck(index));
    });
  }

  function size() {
    return this.toArray().length;
  }

  function inspect() {
    return '#<Enumerable:' + this.toArray().inspect() + '>';
  }









  return {
    each:       each,
    eachSlice:  eachSlice,
    all:        all,
    every:      all,
    any:        any,
    some:       any,
    collect:    collect,
    map:        collect,
    detect:     detect,
    findAll:    findAll,
    select:     findAll,
    filter:     findAll,
    grep:       grep,
    include:    include,
    member:     include,
    inGroupsOf: inGroupsOf,
    inject:     inject,
    invoke:     invoke,
    max:        max,
    min:        min,
    partition:  partition,
    pluck:      pluck,
    reject:     reject,
    sortBy:     sortBy,
    toArray:    toArray,
    entries:    toArray,
    zip:        zip,
    size:       size,
    inspect:    inspect,
    find:       detect
  };
})();

function $A(iterable) {
  if (!iterable) return [];
  if ('toArray' in Object(iterable)) return iterable.toArray();
  var length = iterable.length || 0, results = new Array(length);
  while (length--) results[length] = iterable[length];
  return results;
}


function $w(string) {
  if (!Object.isString(string)) return [];
  string = string.strip();
  return string ? string.split(/\s+/) : [];
}

Array.from = $A;


(function() {
  var arrayProto = Array.prototype,
      slice = arrayProto.slice,
      _each = arrayProto.forEach; // use native browser JS 1.6 implementation if available

  function each(iterator, context) {
    for (var i = 0, length = this.length >>> 0; i < length; i++) {
      if (i in this) iterator.call(context, this[i], i, this);
    }
  }
  if (!_each) _each = each;

  function clear() {
    this.length = 0;
    return this;
  }

  function first() {
    return this[0];
  }

  function last() {
    return this[this.length - 1];
  }

  function compact() {
    return this.select(function(value) {
      return value != null;
    });
  }

  function flatten() {
    return this.inject([], function(array, value) {
      if (Object.isArray(value))
        return array.concat(value.flatten());
      array.push(value);
      return array;
    });
  }

  function without() {
    var values = slice.call(arguments, 0);
    return this.select(function(value) {
      return !values.include(value);
    });
  }

  function reverse(inline) {
    return (inline === false ? this.toArray() : this)._reverse();
  }

  function uniq(sorted) {
    return this.inject([], function(array, value, index) {
      if (0 == index || (sorted ? array.last() != value : !array.include(value)))
        array.push(value);
      return array;
    });
  }

  function intersect(array) {
    return this.uniq().findAll(function(item) {
      return array.detect(function(value) { return item === value });
    });
  }


  function clone() {
    return slice.call(this, 0);
  }

  function size() {
    return this.length;
  }

  function inspect() {
    return '[' + this.map(Object.inspect).join(', ') + ']';
  }

  function indexOf(item, i) {
    i || (i = 0);
    var length = this.length;
    if (i < 0) i = length + i;
    for (; i < length; i++)
      if (this[i] === item) return i;
    return -1;
  }

  function lastIndexOf(item, i) {
    i = isNaN(i) ? this.length : (i < 0 ? this.length + i : i) + 1;
    var n = this.slice(0, i).reverse().indexOf(item);
    return (n < 0) ? n : i - n - 1;
  }

  function concat() {
    var array = slice.call(this, 0), item;
    for (var i = 0, length = arguments.length; i < length; i++) {
      item = arguments[i];
      if (Object.isArray(item) && !('callee' in item)) {
        for (var j = 0, arrayLength = item.length; j < arrayLength; j++)
          array.push(item[j]);
      } else {
        array.push(item);
      }
    }
    return array;
  }

  Object.extend(arrayProto, Enumerable);

  if (!arrayProto._reverse)
    arrayProto._reverse = arrayProto.reverse;

  Object.extend(arrayProto, {
    _each:     _each,
    clear:     clear,
    first:     first,
    last:      last,
    compact:   compact,
    flatten:   flatten,
    without:   without,
    reverse:   reverse,
    uniq:      uniq,
    intersect: intersect,
    clone:     clone,
    toArray:   clone,
    size:      size,
    inspect:   inspect
  });

  var CONCAT_ARGUMENTS_BUGGY = (function() {
    return [].concat(arguments)[0][0] !== 1;
  })(1,2)

  if (CONCAT_ARGUMENTS_BUGGY) arrayProto.concat = concat;

  if (!arrayProto.indexOf) arrayProto.indexOf = indexOf;
  if (!arrayProto.lastIndexOf) arrayProto.lastIndexOf = lastIndexOf;
})();
function $H(object) {
  return new Hash(object);
};

var Hash = Class.create(Enumerable, (function() {
  function initialize(object) {
    this._object = Object.isHash(object) ? object.toObject() : Object.clone(object);
  }


  function _each(iterator) {
    for (var key in this._object) {
      var value = this._object[key], pair = [key, value];
      pair.key = key;
      pair.value = value;
      iterator(pair);
    }
  }

  function set(key, value) {
    return this._object[key] = value;
  }

  function get(key) {
    if (this._object[key] !== Object.prototype[key])
      return this._object[key];
  }

  function unset(key) {
    var value = this._object[key];
    delete this._object[key];
    return value;
  }

  function toObject() {
    return Object.clone(this._object);
  }



  function keys() {
    return this.pluck('key');
  }

  function values() {
    return this.pluck('value');
  }

  function index(value) {
    var match = this.detect(function(pair) {
      return pair.value === value;
    });
    return match && match.key;
  }

  function merge(object) {
    return this.clone().update(object);
  }

  function update(object) {
    return new Hash(object).inject(this, function(result, pair) {
      result.set(pair.key, pair.value);
      return result;
    });
  }

  function toQueryPair(key, value) {
    if (Object.isUndefined(value)) return key;
    return key + '=' + encodeURIComponent(String.interpret(value));
  }

  function toQueryString() {
    return this.inject([], function(results, pair) {
      var key = encodeURIComponent(pair.key), values = pair.value;

      if (values && typeof values == 'object') {
        if (Object.isArray(values)) {
          var queryValues = [];
          for (var i = 0, len = values.length, value; i < len; i++) {
            value = values[i];
            queryValues.push(toQueryPair(key, value));
          }
          return results.concat(queryValues);
        }
      } else results.push(toQueryPair(key, values));
      return results;
    }).join('&');
  }

  function inspect() {
    return '#<Hash:{' + this.map(function(pair) {
      return pair.map(Object.inspect).join(': ');
    }).join(', ') + '}>';
  }

  function clone() {
    return new Hash(this);
  }

  return {
    initialize:             initialize,
    _each:                  _each,
    set:                    set,
    get:                    get,
    unset:                  unset,
    toObject:               toObject,
    toTemplateReplacements: toObject,
    keys:                   keys,
    values:                 values,
    index:                  index,
    merge:                  merge,
    update:                 update,
    toQueryString:          toQueryString,
    inspect:                inspect,
    toJSON:                 toObject,
    clone:                  clone
  };
})());

Hash.from = $H;
Object.extend(Number.prototype, (function() {
  function toColorPart() {
    return this.toPaddedString(2, 16);
  }

  function succ() {
    return this + 1;
  }

  function times(iterator, context) {
    $R(0, this, true).each(iterator, context);
    return this;
  }

  function toPaddedString(length, radix) {
    var string = this.toString(radix || 10);
    return '0'.times(length - string.length) + string;
  }

  function abs() {
    return Math.abs(this);
  }

  function round() {
    return Math.round(this);
  }

  function ceil() {
    return Math.ceil(this);
  }

  function floor() {
    return Math.floor(this);
  }

  return {
    toColorPart:    toColorPart,
    succ:           succ,
    times:          times,
    toPaddedString: toPaddedString,
    abs:            abs,
    round:          round,
    ceil:           ceil,
    floor:          floor
  };
})());

function $R(start, end, exclusive) {
  return new ObjectRange(start, end, exclusive);
}

var ObjectRange = Class.create(Enumerable, (function() {
  function initialize(start, end, exclusive) {
    this.start = start;
    this.end = end;
    this.exclusive = exclusive;
  }

  function _each(iterator) {
    var value = this.start;
    while (this.include(value)) {
      iterator(value);
      value = value.succ();
    }
  }

  function include(value) {
    if (value < this.start)
      return false;
    if (this.exclusive)
      return value < this.end;
    return value <= this.end;
  }

  return {
    initialize: initialize,
    _each:      _each,
    include:    include
  };
})());



var Ajax = {
  getTransport: function() {
    return Try.these(
      function() {return new XMLHttpRequest()},
      function() {return new ActiveXObject('Msxml2.XMLHTTP')},
      function() {return new ActiveXObject('Microsoft.XMLHTTP')}
    ) || false;
  },

  activeRequestCount: 0
};

Ajax.Responders = {
  responders: [],

  _each: function(iterator) {
    this.responders._each(iterator);
  },

  register: function(responder) {
    if (!this.include(responder))
      this.responders.push(responder);
  },

  unregister: function(responder) {
    this.responders = this.responders.without(responder);
  },

  dispatch: function(callback, request, transport, json) {
    this.each(function(responder) {
      if (Object.isFunction(responder[callback])) {
        try {
          responder[callback].apply(responder, [request, transport, json]);
        } catch (e) { }
      }
    });
  }
};

Object.extend(Ajax.Responders, Enumerable);

Ajax.Responders.register({
  onCreate:   function() { Ajax.activeRequestCount++ },
  onComplete: function() { Ajax.activeRequestCount-- }
});
Ajax.Base = Class.create({
  initialize: function(options) {
    this.options = {
      method:       'post',
      asynchronous: true,
      contentType:  'application/x-www-form-urlencoded',
      encoding:     'UTF-8',
      parameters:   '',
      evalJSON:     true,
      evalJS:       true
    };
    Object.extend(this.options, options || { });

    this.options.method = this.options.method.toLowerCase();

    if (Object.isHash(this.options.parameters))
      this.options.parameters = this.options.parameters.toObject();
  }
});
Ajax.Request = Class.create(Ajax.Base, {
  _complete: false,

  initialize: function($super, url, options) {
    $super(options);
    this.transport = Ajax.getTransport();
    this.request(url);
  },

  request: function(url) {
    this.url = url;
    this.method = this.options.method;
    var params = Object.isString(this.options.parameters) ?
          this.options.parameters :
          Object.toQueryString(this.options.parameters);

    if (!['get', 'post'].include(this.method)) {
      params += (params ? '&' : '') + "_method=" + this.method;
      this.method = 'post';
    }

    if (params && this.method === 'get') {
      this.url += (this.url.include('?') ? '&' : '?') + params;
    }

    this.parameters = params.toQueryParams();

    try {
      var response = new Ajax.Response(this);
      if (this.options.onCreate) this.options.onCreate(response);
      Ajax.Responders.dispatch('onCreate', this, response);

      this.transport.open(this.method.toUpperCase(), this.url,
        this.options.asynchronous);

      if (this.options.asynchronous) this.respondToReadyState.bind(this).defer(1);

      this.transport.onreadystatechange = this.onStateChange.bind(this);
      this.setRequestHeaders();

      this.body = this.method == 'post' ? (this.options.postBody || params) : null;
      this.transport.send(this.body);

      /* Force Firefox to handle ready state 4 for synchronous requests */
      if (!this.options.asynchronous && this.transport.overrideMimeType)
        this.onStateChange();

    }
    catch (e) {
      this.dispatchException(e);
    }
  },

  onStateChange: function() {
    var readyState = this.transport.readyState;
    if (readyState > 1 && !((readyState == 4) && this._complete))
      this.respondToReadyState(this.transport.readyState);
  },

  setRequestHeaders: function() {
    var headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'X-Prototype-Version': Prototype.Version,
      'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
    };

    if (this.method == 'post') {
      headers['Content-type'] = this.options.contentType +
        (this.options.encoding ? '; charset=' + this.options.encoding : '');

      /* Force "Connection: close" for older Mozilla browsers to work
       * around a bug where XMLHttpRequest sends an incorrect
       * Content-length header. See Mozilla Bugzilla #246651.
       */
      if (this.transport.overrideMimeType &&
          (navigator.userAgent.match(/Gecko\/(\d{4})/) || [0,2005])[1] < 2005)
            headers['Connection'] = 'close';
    }

    if (typeof this.options.requestHeaders == 'object') {
      var extras = this.options.requestHeaders;

      if (Object.isFunction(extras.push))
        for (var i = 0, length = extras.length; i < length; i += 2)
          headers[extras[i]] = extras[i+1];
      else
        $H(extras).each(function(pair) { headers[pair.key] = pair.value });
    }

    for (var name in headers)
      this.transport.setRequestHeader(name, headers[name]);
  },

  success: function() {
    var status = this.getStatus();
    return !status || (status >= 200 && status < 300) || status == 304;
  },

  getStatus: function() {
    try {
      if (this.transport.status === 1223) return 204;
      return this.transport.status || 0;
    } catch (e) { return 0 }
  },

  respondToReadyState: function(readyState) {
    var state = Ajax.Request.Events[readyState], response = new Ajax.Response(this);

    if (state == 'Complete') {
      try {
        this._complete = true;
        (this.options['on' + response.status]
         || this.options['on' + (this.success() ? 'Success' : 'Failure')]
         || Prototype.emptyFunction)(response, response.headerJSON);
      } catch (e) {
        this.dispatchException(e);
      }

      var contentType = response.getHeader('Content-type');
      if (this.options.evalJS == 'force'
          || (this.options.evalJS && this.isSameOrigin() && contentType
          && contentType.match(/^\s*(text|application)\/(x-)?(java|ecma)script(;.*)?\s*$/i)))
        this.evalResponse();
    }

    try {
      (this.options['on' + state] || Prototype.emptyFunction)(response, response.headerJSON);
      Ajax.Responders.dispatch('on' + state, this, response, response.headerJSON);
    } catch (e) {
      this.dispatchException(e);
    }

    if (state == 'Complete') {
      this.transport.onreadystatechange = Prototype.emptyFunction;
    }
  },

  isSameOrigin: function() {
    var m = this.url.match(/^\s*https?:\/\/[^\/]*/);
    return !m || (m[0] == '#{protocol}//#{domain}#{port}'.interpolate({
      protocol: location.protocol,
      domain: document.domain,
      port: location.port ? ':' + location.port : ''
    }));
  },

  getHeader: function(name) {
    try {
      return this.transport.getResponseHeader(name) || null;
    } catch (e) { return null; }
  },

  evalResponse: function() {
    try {
      return eval((this.transport.responseText || '').unfilterJSON());
    } catch (e) {
      this.dispatchException(e);
    }
  },

  dispatchException: function(exception) {
    (this.options.onException || Prototype.emptyFunction)(this, exception);
    Ajax.Responders.dispatch('onException', this, exception);
  }
});

Ajax.Request.Events =
  ['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'];








Ajax.Response = Class.create({
  initialize: function(request){
    this.request = request;
    var transport  = this.transport  = request.transport,
        readyState = this.readyState = transport.readyState;

    if ((readyState > 2 && !Prototype.Browser.IE) || readyState == 4) {
      this.status       = this.getStatus();
      this.statusText   = this.getStatusText();
      this.responseText = String.interpret(transport.responseText);
      this.headerJSON   = this._getHeaderJSON();
    }

    if (readyState == 4) {
      var xml = transport.responseXML;
      this.responseXML  = Object.isUndefined(xml) ? null : xml;
      this.responseJSON = this._getResponseJSON();
    }
  },

  status:      0,

  statusText: '',

  getStatus: Ajax.Request.prototype.getStatus,

  getStatusText: function() {
    try {
      return this.transport.statusText || '';
    } catch (e) { return '' }
  },

  getHeader: Ajax.Request.prototype.getHeader,

  getAllHeaders: function() {
    try {
      return this.getAllResponseHeaders();
    } catch (e) { return null }
  },

  getResponseHeader: function(name) {
    return this.transport.getResponseHeader(name);
  },

  getAllResponseHeaders: function() {
    return this.transport.getAllResponseHeaders();
  },

  _getHeaderJSON: function() {
    var json = this.getHeader('X-JSON');
    if (!json) return null;
    json = decodeURIComponent(escape(json));
    try {
      return json.evalJSON(this.request.options.sanitizeJSON ||
        !this.request.isSameOrigin());
    } catch (e) {
      this.request.dispatchException(e);
    }
  },

  _getResponseJSON: function() {
    var options = this.request.options;
    if (!options.evalJSON || (options.evalJSON != 'force' &&
      !(this.getHeader('Content-type') || '').include('application/json')) ||
        this.responseText.blank())
          return null;
    try {
      return this.responseText.evalJSON(options.sanitizeJSON ||
        !this.request.isSameOrigin());
    } catch (e) {
      this.request.dispatchException(e);
    }
  }
});

Ajax.Updater = Class.create(Ajax.Request, {
  initialize: function($super, container, url, options) {
    this.container = {
      success: (container.success || container),
      failure: (container.failure || (container.success ? null : container))
    };

    options = Object.clone(options);
    var onComplete = options.onComplete;
    options.onComplete = (function(response, json) {
      this.updateContent(response.responseText);
      if (Object.isFunction(onComplete)) onComplete(response, json);
    }).bind(this);

    $super(url, options);
  },

  updateContent: function(responseText) {
    var receiver = this.container[this.success() ? 'success' : 'failure'],
        options = this.options;

    if (!options.evalScripts) responseText = responseText.stripScripts();

    if (receiver = p$(receiver)) {
      if (options.insertion) {
        if (Object.isString(options.insertion)) {
          var insertion = { }; insertion[options.insertion] = responseText;
          receiver.insert(insertion);
        }
        else options.insertion(receiver, responseText);
      }
      else receiver.update(responseText);
    }
  }
});

Ajax.PeriodicalUpdater = Class.create(Ajax.Base, {
  initialize: function($super, container, url, options) {
    $super(options);
    this.onComplete = this.options.onComplete;

    this.frequency = (this.options.frequency || 2);
    this.decay = (this.options.decay || 1);

    this.updater = { };
    this.container = container;
    this.url = url;

    this.start();
  },

  start: function() {
    this.options.onComplete = this.updateComplete.bind(this);
    this.onTimerEvent();
  },

  stop: function() {
    this.updater.options.onComplete = undefined;
    clearTimeout(this.timer);
    (this.onComplete || Prototype.emptyFunction).apply(this, arguments);
  },

  updateComplete: function(response) {
    if (this.options.decay) {
      this.decay = (response.responseText == this.lastText ?
        this.decay * this.options.decay : 1);

      this.lastText = response.responseText;
    }
    this.timer = this.onTimerEvent.bind(this).delay(this.decay * this.frequency);
  },

  onTimerEvent: function() {
    this.updater = new Ajax.Updater(this.container, this.url, this.options);
  }
});


//function $(element) {
//  if (arguments.length > 1) {
//    for (var i = 0, elements = [], length = arguments.length; i < length; i++)
//      elements.push(p$(arguments[i]));
//    return elements;
//  }
//  if (Object.isString(element))
//    element = document.getElementById(element);
//  return Element.extend(element);
//}

function p$(element) {
  if (arguments.length > 1) {
    for (var i = 0, elements = [], length = arguments.length; i < length; i++)
      elements.push(p$(arguments[i]));
    return elements;
  }
  if (Object.isString(element))
    element = document.getElementById(element);
  return Element.extend(element);
}

if (Prototype.BrowserFeatures.XPath) {
  document._getElementsByXPath = function(expression, parentElement) {
    var results = [];
    var query = document.evaluate(expression, p$(parentElement) || document,
      null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (var i = 0, length = query.snapshotLength; i < length; i++)
      results.push(Element.extend(query.snapshotItem(i)));
    return results;
  };
}

/*--------------------------------------------------------------------------*/

if (!Node) var Node = { };

if (!Node.ELEMENT_NODE) {
  Object.extend(Node, {
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    ENTITY_REFERENCE_NODE: 5,
    ENTITY_NODE: 6,
    PROCESSING_INSTRUCTION_NODE: 7,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_TYPE_NODE: 10,
    DOCUMENT_FRAGMENT_NODE: 11,
    NOTATION_NODE: 12
  });
}



(function(global) {
  function shouldUseCache(tagName, attributes) {
    if (tagName === 'select') return false;
    if ('type' in attributes) return false;
    return true;
  }

  var HAS_EXTENDED_CREATE_ELEMENT_SYNTAX = (function(){
    try {
      var el = document.createElement('<input name="x">');
      return el.tagName.toLowerCase() === 'input' && el.name === 'x';
    }
    catch(err) {
      return false;
    }
  })();

  var element = global.Element;

  global.Element = function(tagName, attributes) {
    attributes = attributes || { };
    tagName = tagName.toLowerCase();
    var cache = Element.cache;

    if (HAS_EXTENDED_CREATE_ELEMENT_SYNTAX && attributes.name) {
      tagName = '<' + tagName + ' name="' + attributes.name + '">';
      delete attributes.name;
      return Element.writeAttribute(document.createElement(tagName), attributes);
    }

    if (!cache[tagName]) cache[tagName] = Element.extend(document.createElement(tagName));

    var node = shouldUseCache(tagName, attributes) ?
     cache[tagName].cloneNode(false) : document.createElement(tagName);

    return Element.writeAttribute(node, attributes);
  };

  Object.extend(global.Element, element || { });
  if (element) global.Element.prototype = element.prototype;

})(this);

Element.idCounter = 1;
Element.cache = { };

Element._purgeElement = function(element) {
  var uid = element._prototypeUID;
  if (uid) {
    Element.stopObserving(element);
    element._prototypeUID = void 0;
    delete Element.Storage[uid];
  }
}

Element.Methods = {
  visible: function(element) {
    return p$(element).style.display != 'none';
  },

  toggle: function(element) {
    element = p$(element);
    Element[Element.visible(element) ? 'hide' : 'show'](element);
    return element;
  },

  hide: function(element) {
    element = p$(element);
    element.style.display = 'none';
    return element;
  },

  show: function(element) {
    element = p$(element);
    element.style.display = '';
    return element;
  },

  remove: function(element) {
    element = p$(element);
    element.parentNode.removeChild(element);
    return element;
  },

  update: (function(){

    var SELECT_ELEMENT_INNERHTML_BUGGY = (function(){
      var el = document.createElement("select"),
          isBuggy = true;
      el.innerHTML = "<option value=\"test\">test</option>";
      if (el.options && el.options[0]) {
        isBuggy = el.options[0].nodeName.toUpperCase() !== "OPTION";
      }
      el = null;
      return isBuggy;
    })();

    var TABLE_ELEMENT_INNERHTML_BUGGY = (function(){
      try {
        var el = document.createElement("table");
        if (el && el.tBodies) {
          el.innerHTML = "<tbody><tr><td>test</td></tr></tbody>";
          var isBuggy = typeof el.tBodies[0] == "undefined";
          el = null;
          return isBuggy;
        }
      } catch (e) {
        return true;
      }
    })();

    var LINK_ELEMENT_INNERHTML_BUGGY = (function() {
      try {
        var el = document.createElement('div');
        el.innerHTML = "<link>";
        var isBuggy = (el.childNodes.length === 0);
        el = null;
        return isBuggy;
      } catch(e) {
        return true;
      }
    })();

    var ANY_INNERHTML_BUGGY = SELECT_ELEMENT_INNERHTML_BUGGY ||
     TABLE_ELEMENT_INNERHTML_BUGGY || LINK_ELEMENT_INNERHTML_BUGGY;

    var SCRIPT_ELEMENT_REJECTS_TEXTNODE_APPENDING = (function () {
      var s = document.createElement("script"),
          isBuggy = false;
      try {
        s.appendChild(document.createTextNode(""));
        isBuggy = !s.firstChild ||
          s.firstChild && s.firstChild.nodeType !== 3;
      } catch (e) {
        isBuggy = true;
      }
      s = null;
      return isBuggy;
    })();


    function update(element, content) {
      element = p$(element);
      var purgeElement = Element._purgeElement;

      var descendants = element.getElementsByTagName('*'),
       i = descendants.length;
      while (i--) purgeElement(descendants[i]);

      if (content && content.toElement)
        content = content.toElement();

      if (Object.isElement(content))
        return element.update().insert(content);

      content = Object.toHTML(content);

      var tagName = element.tagName.toUpperCase();

      if (tagName === 'SCRIPT' && SCRIPT_ELEMENT_REJECTS_TEXTNODE_APPENDING) {
        element.text = content;
        return element;
      }

      if (ANY_INNERHTML_BUGGY) {
        if (tagName in Element._insertionTranslations.tags) {
          while (element.firstChild) {
            element.removeChild(element.firstChild);
          }
          Element._getContentFromAnonymousElement(tagName, content.stripScripts())
            .each(function(node) {
              element.appendChild(node)
            });
        } else if (LINK_ELEMENT_INNERHTML_BUGGY && Object.isString(content) && content.indexOf('<link') > -1) {
          while (element.firstChild) {
            element.removeChild(element.firstChild);
          }
          var nodes = Element._getContentFromAnonymousElement(tagName, content.stripScripts(), true);
          nodes.each(function(node) { element.appendChild(node) });
        }
        else {
          element.innerHTML = content.stripScripts();
        }
      }
      else {
        element.innerHTML = content.stripScripts();
      }

      content.evalScripts.bind(content).defer();
      return element;
    }

    return update;
  })(),

  replace: function(element, content) {
    element = p$(element);
    if (content && content.toElement) content = content.toElement();
    else if (!Object.isElement(content)) {
      content = Object.toHTML(content);
      var range = element.ownerDocument.createRange();
      range.selectNode(element);
      content.evalScripts.bind(content).defer();
      content = range.createContextualFragment(content.stripScripts());
    }
    element.parentNode.replaceChild(content, element);
    return element;
  },

  insert: function(element, insertions) {
    element = p$(element);

    if (Object.isString(insertions) || Object.isNumber(insertions) ||
        Object.isElement(insertions) || (insertions && (insertions.toElement || insertions.toHTML)))
          insertions = {bottom:insertions};

    var content, insert, tagName, childNodes;

    for (var position in insertions) {
      content  = insertions[position];
      position = position.toLowerCase();
      insert = Element._insertionTranslations[position];

      if (content && content.toElement) content = content.toElement();
      if (Object.isElement(content)) {
        insert(element, content);
        continue;
      }

      content = Object.toHTML(content);

      tagName = ((position == 'before' || position == 'after')
        ? element.parentNode : element).tagName.toUpperCase();

      childNodes = Element._getContentFromAnonymousElement(tagName, content.stripScripts());

      if (position == 'top' || position == 'after') childNodes.reverse();
      childNodes.each(insert.curry(element));

      content.evalScripts.bind(content).defer();
    }

    return element;
  },

  wrap: function(element, wrapper, attributes) {
    element = p$(element);
    if (Object.isElement(wrapper))
      p$(wrapper).writeAttribute(attributes || { });
    else if (Object.isString(wrapper)) wrapper = new Element(wrapper, attributes);
    else wrapper = new Element('div', wrapper);
    if (element.parentNode)
      element.parentNode.replaceChild(wrapper, element);
    wrapper.appendChild(element);
    return wrapper;
  },

  inspect: function(element) {
    element = p$(element);
    var result = '<' + element.tagName.toLowerCase();
    $H({'id': 'id', 'className': 'class'}).each(function(pair) {
      var property = pair.first(),
          attribute = pair.last(),
          value = (element[property] || '').toString();
      if (value) result += ' ' + attribute + '=' + value.inspect(true);
    });
    return result + '>';
  },

  recursivelyCollect: function(element, property, maximumLength) {
    element = p$(element);
    maximumLength = maximumLength || -1;
    var elements = [];

    while (element = element[property]) {
      if (element.nodeType == 1)
        elements.push(Element.extend(element));
      if (elements.length == maximumLength)
        break;
    }

    return elements;
  },

  ancestors: function(element) {
    return Element.recursivelyCollect(element, 'parentNode');
  },

  descendants: function(element) {
    return Element.select(element, "*");
  },

  firstDescendant: function(element) {
    element = p$(element).firstChild;
    while (element && element.nodeType != 1) element = element.nextSibling;
    return p$(element);
  },

  immediateDescendants: function(element) {
    var results = [], child = p$(element).firstChild;
    while (child) {
      if (child.nodeType === 1) {
        results.push(Element.extend(child));
      }
      child = child.nextSibling;
    }
    return results;
  },

  previousSiblings: function(element, maximumLength) {
    return Element.recursivelyCollect(element, 'previousSibling');
  },

  nextSiblings: function(element) {
    return Element.recursivelyCollect(element, 'nextSibling');
  },

  siblings: function(element) {
    element = p$(element);
    return Element.previousSiblings(element).reverse()
      .concat(Element.nextSiblings(element));
  },

  match: function(element, selector) {
    element = p$(element);
    if (Object.isString(selector))
      return Prototype.Selector.match(element, selector);
    return selector.match(element);
  },

  up: function(element, expression, index) {
    element = p$(element);
    if (arguments.length == 1) return p$(element.parentNode);
    var ancestors = Element.ancestors(element);
    return Object.isNumber(expression) ? ancestors[expression] :
      Prototype.Selector.find(ancestors, expression, index);
  },

  down: function(element, expression, index) {
    element = p$(element);
    if (arguments.length == 1) return Element.firstDescendant(element);
    return Object.isNumber(expression) ? Element.descendants(element)[expression] :
      Element.select(element, expression)[index || 0];
  },

  previous: function(element, expression, index) {
    element = p$(element);
    if (Object.isNumber(expression)) index = expression, expression = false;
    if (!Object.isNumber(index)) index = 0;

    if (expression) {
      return Prototype.Selector.find(element.previousSiblings(), expression, index);
    } else {
      return element.recursivelyCollect("previousSibling", index + 1)[index];
    }
  },

  next: function(element, expression, index) {
    element = p$(element);
    if (Object.isNumber(expression)) index = expression, expression = false;
    if (!Object.isNumber(index)) index = 0;

    if (expression) {
      return Prototype.Selector.find(element.nextSiblings(), expression, index);
    } else {
      var maximumLength = Object.isNumber(index) ? index + 1 : 1;
      return element.recursivelyCollect("nextSibling", index + 1)[index];
    }
  },


  select: function(element) {
    element = p$(element);
    var expressions = Array.prototype.slice.call(arguments, 1).join(', ');
    return Prototype.Selector.select(expressions, element);
  },

  adjacent: function(element) {
    element = p$(element);
    var expressions = Array.prototype.slice.call(arguments, 1).join(', ');
    return Prototype.Selector.select(expressions, element.parentNode).without(element);
  },

  identify: function(element) {
    element = p$(element);
    var id = Element.readAttribute(element, 'id');
    if (id) return id;
    do { id = 'anonymous_element_' + Element.idCounter++ } while (p$(id));
    Element.writeAttribute(element, 'id', id);
    return id;
  },

  readAttribute: function(element, name) {
    element = p$(element);
    if (Prototype.Browser.IE) {
      var t = Element._attributeTranslations.read;
      if (t.values[name]) return t.values[name](element, name);
      if (t.names[name]) name = t.names[name];
      if (name.include(':')) {
        return (!element.attributes || !element.attributes[name]) ? null :
         element.attributes[name].value;
      }
    }
    return element.getAttribute(name);
  },

  writeAttribute: function(element, name, value) {
    element = p$(element);
    var attributes = { }, t = Element._attributeTranslations.write;

    if (typeof name == 'object') attributes = name;
    else attributes[name] = Object.isUndefined(value) ? true : value;

    for (var attr in attributes) {
      name = t.names[attr] || attr;
      value = attributes[attr];
      if (t.values[attr]) name = t.values[attr](element, value);
      if (value === false || value === null)
        element.removeAttribute(name);
      else if (value === true)
        element.setAttribute(name, name);
      else element.setAttribute(name, value);
    }
    return element;
  },

  getHeight: function(element) {
    return Element.getDimensions(element).height;
  },

  getWidth: function(element) {
    return Element.getDimensions(element).width;
  },

  classNames: function(element) {
    return new Element.ClassNames(element);
  },

  hasClassName: function(element, className) {
    if (!(element = p$(element))) return;
    var elementClassName = element.className;
    return (elementClassName.length > 0 && (elementClassName == className ||
      new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
  },

  addClassName: function(element, className) {
    if (!(element = p$(element))) return;
    if (!Element.hasClassName(element, className))
      element.className += (element.className ? ' ' : '') + className;
    return element;
  },

  removeClassName: function(element, className) {
    if (!(element = p$(element))) return;
    element.className = element.className.replace(
      new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' ').strip();
    return element;
  },

  toggleClassName: function(element, className) {
    if (!(element = p$(element))) return;
    return Element[Element.hasClassName(element, className) ?
      'removeClassName' : 'addClassName'](element, className);
  },

  cleanWhitespace: function(element) {
    element = p$(element);
    var node = element.firstChild;
    while (node) {
      var nextNode = node.nextSibling;
      if (node.nodeType == 3 && !/\S/.test(node.nodeValue))
        element.removeChild(node);
      node = nextNode;
    }
    return element;
  },

  empty: function(element) {
    return p$(element).innerHTML.blank();
  },

  descendantOf: function(element, ancestor) {
    element = p$(element), ancestor = p$(ancestor);

    if (element.compareDocumentPosition)
      return (element.compareDocumentPosition(ancestor) & 8) === 8;

    if (ancestor.contains)
      return ancestor.contains(element) && ancestor !== element;

    while (element = element.parentNode)
      if (element == ancestor) return true;

    return false;
  },

  scrollTo: function(element) {
    element = p$(element);
    var pos = Element.cumulativeOffset(element);
    window.scrollTo(pos[0], pos[1]);
    return element;
  },

  getStyle: function(element, style) {
    element = p$(element);
    style = style == 'float' ? 'cssFloat' : style.camelize();
    var value = element.style[style];
    if (!value || value == 'auto') {
      var css = document.defaultView.getComputedStyle(element, null);
      value = css ? css[style] : null;
    }
    if (style == 'opacity') return value ? parseFloat(value) : 1.0;
    return value == 'auto' ? null : value;
  },

  getOpacity: function(element) {
    return p$(element).getStyle('opacity');
  },

  setStyle: function(element, styles) {
    element = p$(element);
    var elementStyle = element.style, match;
    if (Object.isString(styles)) {
      element.style.cssText += ';' + styles;
      return styles.include('opacity') ?
        element.setOpacity(styles.match(/opacity:\s*(\d?\.?\d*)/)[1]) : element;
    }
    for (var property in styles)
      if (property == 'opacity') element.setOpacity(styles[property]);
      else
        elementStyle[(property == 'float' || property == 'cssFloat') ?
          (Object.isUndefined(elementStyle.styleFloat) ? 'cssFloat' : 'styleFloat') :
            property] = styles[property];

    return element;
  },

  setOpacity: function(element, value) {
    element = p$(element);
    element.style.opacity = (value == 1 || value === '') ? '' :
      (value < 0.00001) ? 0 : value;
    return element;
  },

  makePositioned: function(element) {
    element = p$(element);
    var pos = Element.getStyle(element, 'position');
    if (pos == 'static' || !pos) {
      element._madePositioned = true;
      element.style.position = 'relative';
      if (Prototype.Browser.Opera) {
        element.style.top = 0;
        element.style.left = 0;
      }
    }
    return element;
  },

  undoPositioned: function(element) {
    element = p$(element);
    if (element._madePositioned) {
      element._madePositioned = undefined;
      element.style.position =
        element.style.top =
        element.style.left =
        element.style.bottom =
        element.style.right = '';
    }
    return element;
  },

  makeClipping: function(element) {
    element = p$(element);
    if (element._overflow) return element;
    element._overflow = Element.getStyle(element, 'overflow') || 'auto';
    if (element._overflow !== 'hidden')
      element.style.overflow = 'hidden';
    return element;
  },

  undoClipping: function(element) {
    element = p$(element);
    if (!element._overflow) return element;
    element.style.overflow = element._overflow == 'auto' ? '' : element._overflow;
    element._overflow = null;
    return element;
  },

  clonePosition: function(element, source) {
    var options = Object.extend({
      setLeft:    true,
      setTop:     true,
      setWidth:   true,
      setHeight:  true,
      offsetTop:  0,
      offsetLeft: 0
    }, arguments[2] || { });

    source = p$(source);
    var p = Element.viewportOffset(source), delta = [0, 0], parent = null;

    element = p$(element);

    if (Element.getStyle(element, 'position') == 'absolute') {
      parent = Element.getOffsetParent(element);
      delta = Element.viewportOffset(parent);
    }

    if (parent == document.body) {
      delta[0] -= document.body.offsetLeft;
      delta[1] -= document.body.offsetTop;
    }

    if (options.setLeft)   element.style.left  = (p[0] - delta[0] + options.offsetLeft) + 'px';
    if (options.setTop)    element.style.top   = (p[1] - delta[1] + options.offsetTop) + 'px';
    if (options.setWidth)  element.style.width = source.offsetWidth + 'px';
    if (options.setHeight) element.style.height = source.offsetHeight + 'px';
    return element;
  }
};

Object.extend(Element.Methods, {
  getElementsBySelector: Element.Methods.select,

  childElements: Element.Methods.immediateDescendants
});

Element._attributeTranslations = {
  write: {
    names: {
      className: 'class',
      htmlFor:   'for'
    },
    values: { }
  }
};

if (Prototype.Browser.Opera) {
  Element.Methods.getStyle = Element.Methods.getStyle.wrap(
    function(proceed, element, style) {
      switch (style) {
        case 'height': case 'width':
          if (!Element.visible(element)) return null;

          var dim = parseInt(proceed(element, style), 10);

          if (dim !== element['offset' + style.capitalize()])
            return dim + 'px';

          var properties;
          if (style === 'height') {
            properties = ['border-top-width', 'padding-top',
             'padding-bottom', 'border-bottom-width'];
          }
          else {
            properties = ['border-left-width', 'padding-left',
             'padding-right', 'border-right-width'];
          }
          return properties.inject(dim, function(memo, property) {
            var val = proceed(element, property);
            return val === null ? memo : memo - parseInt(val, 10);
          }) + 'px';
        default: return proceed(element, style);
      }
    }
  );

  Element.Methods.readAttribute = Element.Methods.readAttribute.wrap(
    function(proceed, element, attribute) {
      if (attribute === 'title') return element.title;
      return proceed(element, attribute);
    }
  );
}

else if (Prototype.Browser.IE) {
  Element.Methods.getStyle = function(element, style) {
    element = p$(element);
    style = (style == 'float' || style == 'cssFloat') ? 'styleFloat' : style.camelize();
    var value = element.style[style];
    if (!value && element.currentStyle) value = element.currentStyle[style];

    if (style == 'opacity') {
      if (value = (element.getStyle('filter') || '').match(/alpha\(opacity=(.*)\)/))
        if (value[1]) return parseFloat(value[1]) / 100;
      return 1.0;
    }

    if (value == 'auto') {
      if ((style == 'width' || style == 'height') && (element.getStyle('display') != 'none'))
        return element['offset' + style.capitalize()] + 'px';
      return null;
    }
    return value;
  };

  Element.Methods.setOpacity = function(element, value) {
    function stripAlpha(filter){
      return filter.replace(/alpha\([^\)]*\)/gi,'');
    }
    element = p$(element);
    var currentStyle = element.currentStyle;
    if ((currentStyle && !currentStyle.hasLayout) ||
      (!currentStyle && element.style.zoom == 'normal'))
        element.style.zoom = 1;

    var filter = element.getStyle('filter'), style = element.style;
    if (value == 1 || value === '') {
      (filter = stripAlpha(filter)) ?
        style.filter = filter : style.removeAttribute('filter');
      return element;
    } else if (value < 0.00001) value = 0;
    style.filter = stripAlpha(filter) +
      'alpha(opacity=' + (value * 100) + ')';
    return element;
  };

  Element._attributeTranslations = (function(){

    var classProp = 'className',
        forProp = 'for',
        el = document.createElement('div');

    el.setAttribute(classProp, 'x');

    if (el.className !== 'x') {
      el.setAttribute('class', 'x');
      if (el.className === 'x') {
        classProp = 'class';
      }
    }
    el = null;

    el = document.createElement('label');
    el.setAttribute(forProp, 'x');
    if (el.htmlFor !== 'x') {
      el.setAttribute('htmlFor', 'x');
      if (el.htmlFor === 'x') {
        forProp = 'htmlFor';
      }
    }
    el = null;

    return {
      read: {
        names: {
          'class':      classProp,
          'className':  classProp,
          'for':        forProp,
          'htmlFor':    forProp
        },
        values: {
          _getAttr: function(element, attribute) {
            return element.getAttribute(attribute);
          },
          _getAttr2: function(element, attribute) {
            return element.getAttribute(attribute, 2);
          },
          _getAttrNode: function(element, attribute) {
            var node = element.getAttributeNode(attribute);
            return node ? node.value : "";
          },
          _getEv: (function(){

            var el = document.createElement('div'), f;
            el.onclick = Prototype.emptyFunction;
            var value = el.getAttribute('onclick');

            if (String(value).indexOf('{') > -1) {
              f = function(element, attribute) {
                attribute = element.getAttribute(attribute);
                if (!attribute) return null;
                attribute = attribute.toString();
                attribute = attribute.split('{')[1];
                attribute = attribute.split('}')[0];
                return attribute.strip();
              };
            }
            else if (value === '') {
              f = function(element, attribute) {
                attribute = element.getAttribute(attribute);
                if (!attribute) return null;
                return attribute.strip();
              };
            }
            el = null;
            return f;
          })(),
          _flag: function(element, attribute) {
            return p$(element).hasAttribute(attribute) ? attribute : null;
          },
          style: function(element) {
            return element.style.cssText.toLowerCase();
          },
          title: function(element) {
            return element.title;
          }
        }
      }
    }
  })();

  Element._attributeTranslations.write = {
    names: Object.extend({
      cellpadding: 'cellPadding',
      cellspacing: 'cellSpacing'
    }, Element._attributeTranslations.read.names),
    values: {
      checked: function(element, value) {
        element.checked = !!value;
      },

      style: function(element, value) {
        element.style.cssText = value ? value : '';
      }
    }
  };

  Element._attributeTranslations.has = {};

  $w('colSpan rowSpan vAlign dateTime accessKey tabIndex ' +
      'encType maxLength readOnly longDesc frameBorder').each(function(attr) {
    Element._attributeTranslations.write.names[attr.toLowerCase()] = attr;
    Element._attributeTranslations.has[attr.toLowerCase()] = attr;
  });

  (function(v) {
    Object.extend(v, {
      href:        v._getAttr2,
      src:         v._getAttr2,
      type:        v._getAttr,
      action:      v._getAttrNode,
      disabled:    v._flag,
      checked:     v._flag,
      readonly:    v._flag,
      multiple:    v._flag,
      onload:      v._getEv,
      onunload:    v._getEv,
      onclick:     v._getEv,
      ondblclick:  v._getEv,
      onmousedown: v._getEv,
      onmouseup:   v._getEv,
      onmouseover: v._getEv,
      onmousemove: v._getEv,
      onmouseout:  v._getEv,
      onfocus:     v._getEv,
      onblur:      v._getEv,
      onkeypress:  v._getEv,
      onkeydown:   v._getEv,
      onkeyup:     v._getEv,
      onsubmit:    v._getEv,
      onreset:     v._getEv,
      onselect:    v._getEv,
      onchange:    v._getEv
    });
  })(Element._attributeTranslations.read.values);

  if (Prototype.BrowserFeatures.ElementExtensions) {
    (function() {
      function _descendants(element) {
        var nodes = element.getElementsByTagName('*'), results = [];
        for (var i = 0, node; node = nodes[i]; i++)
          if (node.tagName !== "!") // Filter out comment nodes.
            results.push(node);
        return results;
      }

      Element.Methods.down = function(element, expression, index) {
        element = p$(element);
        if (arguments.length == 1) return element.firstDescendant();
        return Object.isNumber(expression) ? _descendants(element)[expression] :
          Element.select(element, expression)[index || 0];
      }
    })();
  }

}

else if (Prototype.Browser.Gecko && /rv:1\.8\.0/.test(navigator.userAgent)) {
  Element.Methods.setOpacity = function(element, value) {
    element = p$(element);
    element.style.opacity = (value == 1) ? 0.999999 :
      (value === '') ? '' : (value < 0.00001) ? 0 : value;
    return element;
  };
}

else if (Prototype.Browser.WebKit) {
  Element.Methods.setOpacity = function(element, value) {
    element = p$(element);
    element.style.opacity = (value == 1 || value === '') ? '' :
      (value < 0.00001) ? 0 : value;

    if (value == 1)
      if (element.tagName.toUpperCase() == 'IMG' && element.width) {
        element.width++; element.width--;
      } else try {
        var n = document.createTextNode(' ');
        element.appendChild(n);
        element.removeChild(n);
      } catch (e) { }

    return element;
  };
}

if ('outerHTML' in document.documentElement) {
  Element.Methods.replace = function(element, content) {
    element = p$(element);

    if (content && content.toElement) content = content.toElement();
    if (Object.isElement(content)) {
      element.parentNode.replaceChild(content, element);
      return element;
    }

    content = Object.toHTML(content);
    var parent = element.parentNode, tagName = parent.tagName.toUpperCase();

    if (Element._insertionTranslations.tags[tagName]) {
      var nextSibling = element.next(),
          fragments = Element._getContentFromAnonymousElement(tagName, content.stripScripts());
      parent.removeChild(element);
      if (nextSibling)
        fragments.each(function(node) { parent.insertBefore(node, nextSibling) });
      else
        fragments.each(function(node) { parent.appendChild(node) });
    }
    else element.outerHTML = content.stripScripts();

    content.evalScripts.bind(content).defer();
    return element;
  };
}

Element._returnOffset = function(l, t) {
  var result = [l, t];
  result.left = l;
  result.top = t;
  return result;
};

Element._getContentFromAnonymousElement = function(tagName, html, force) {
  var div = new Element('div'),
      t = Element._insertionTranslations.tags[tagName];

  var workaround = false;
  if (t) workaround = true;
  else if (force) {
    workaround = true;
    t = ['', '', 0];
  }

  if (workaround) {
    div.innerHTML = '&nbsp;' + t[0] + html + t[1];
    div.removeChild(div.firstChild);
    for (var i = t[2]; i--; ) {
      div = div.firstChild;
    }
  }
  else {
    div.innerHTML = html;
  }
  return $A(div.childNodes);
};

Element._insertionTranslations = {
  before: function(element, node) {
    element.parentNode.insertBefore(node, element);
  },
  top: function(element, node) {
    element.insertBefore(node, element.firstChild);
  },
  bottom: function(element, node) {
    element.appendChild(node);
  },
  after: function(element, node) {
    element.parentNode.insertBefore(node, element.nextSibling);
  },
  tags: {
    TABLE:  ['<table>',                '</table>',                   1],
    TBODY:  ['<table><tbody>',         '</tbody></table>',           2],
    TR:     ['<table><tbody><tr>',     '</tr></tbody></table>',      3],
    TD:     ['<table><tbody><tr><td>', '</td></tr></tbody></table>', 4],
    SELECT: ['<select>',               '</select>',                  1]
  }
};

(function() {
  var tags = Element._insertionTranslations.tags;
  Object.extend(tags, {
    THEAD: tags.TBODY,
    TFOOT: tags.TBODY,
    TH:    tags.TD
  });
})();

Element.Methods.Simulated = {
  hasAttribute: function(element, attribute) {
    attribute = Element._attributeTranslations.has[attribute] || attribute;
    var node = p$(element).getAttributeNode(attribute);
    return !!(node && node.specified);
  }
};

Element.Methods.ByTag = { };

Object.extend(Element, Element.Methods);

(function(div) {

  if (!Prototype.BrowserFeatures.ElementExtensions && div['__proto__']) {
    window.HTMLElement = { };
    window.HTMLElement.prototype = div['__proto__'];
    Prototype.BrowserFeatures.ElementExtensions = true;
  }

  div = null;

})(document.createElement('div'));

Element.extend = (function() {

  function checkDeficiency(tagName) {
    if (typeof window.Element != 'undefined') {
      var proto = window.Element.prototype;
      if (proto) {
        var id = '_' + (Math.random()+'').slice(2),
            el = document.createElement(tagName);
        proto[id] = 'x';
        var isBuggy = (el[id] !== 'x');
        delete proto[id];
        el = null;
        return isBuggy;
      }
    }
    return false;
  }

  function extendElementWith(element, methods) {
    for (var property in methods) {
      var value = methods[property];
      if (Object.isFunction(value) && !(property in element))
        element[property] = value.methodize();
    }
  }

  var HTMLOBJECTELEMENT_PROTOTYPE_BUGGY = checkDeficiency('object');

  if (Prototype.BrowserFeatures.SpecificElementExtensions) {
    if (HTMLOBJECTELEMENT_PROTOTYPE_BUGGY) {
      return function(element) {
        if (element && typeof element._extendedByPrototype == 'undefined') {
          var t = element.tagName;
          if (t && (/^(?:object|applet|embed)$/i.test(t))) {
            extendElementWith(element, Element.Methods);
            extendElementWith(element, Element.Methods.Simulated);
            extendElementWith(element, Element.Methods.ByTag[t.toUpperCase()]);
          }
        }
        return element;
      }
    }
    return Prototype.K;
  }

  var Methods = { }, ByTag = Element.Methods.ByTag;

  var extend = Object.extend(function(element) {
    if (!element || typeof element._extendedByPrototype != 'undefined' ||
        element.nodeType != 1 || element == window) return element;

    var methods = Object.clone(Methods),
        tagName = element.tagName.toUpperCase();

    if (ByTag[tagName]) Object.extend(methods, ByTag[tagName]);

    extendElementWith(element, methods);

    element._extendedByPrototype = Prototype.emptyFunction;
    return element;

  }, {
    refresh: function() {
      if (!Prototype.BrowserFeatures.ElementExtensions) {
        Object.extend(Methods, Element.Methods);
        Object.extend(Methods, Element.Methods.Simulated);
      }
    }
  });

  extend.refresh();
  return extend;
})();

if (document.documentElement.hasAttribute) {
  Element.hasAttribute = function(element, attribute) {
    return element.hasAttribute(attribute);
  };
}
else {
  Element.hasAttribute = Element.Methods.Simulated.hasAttribute;
}

Element.addMethods = function(methods) {
  var F = Prototype.BrowserFeatures, T = Element.Methods.ByTag;

  if (!methods) {
    Object.extend(Form, Form.Methods);
    Object.extend(Form.Element, Form.Element.Methods);
    Object.extend(Element.Methods.ByTag, {
      "FORM":     Object.clone(Form.Methods),
      "INPUT":    Object.clone(Form.Element.Methods),
      "SELECT":   Object.clone(Form.Element.Methods),
      "TEXTAREA": Object.clone(Form.Element.Methods),
      "BUTTON":   Object.clone(Form.Element.Methods)
    });
  }

  if (arguments.length == 2) {
    var tagName = methods;
    methods = arguments[1];
  }

  if (!tagName) Object.extend(Element.Methods, methods || { });
  else {
    if (Object.isArray(tagName)) tagName.each(extend);
    else extend(tagName);
  }

  function extend(tagName) {
    tagName = tagName.toUpperCase();
    if (!Element.Methods.ByTag[tagName])
      Element.Methods.ByTag[tagName] = { };
    Object.extend(Element.Methods.ByTag[tagName], methods);
  }

  function copy(methods, destination, onlyIfAbsent) {
    onlyIfAbsent = onlyIfAbsent || false;
    for (var property in methods) {
      var value = methods[property];
      if (!Object.isFunction(value)) continue;
      if (!onlyIfAbsent || !(property in destination))
        destination[property] = value.methodize();
    }
  }

  function findDOMClass(tagName) {
    var klass;
    var trans = {
      "OPTGROUP": "OptGroup", "TEXTAREA": "TextArea", "P": "Paragraph",
      "FIELDSET": "FieldSet", "UL": "UList", "OL": "OList", "DL": "DList",
      "DIR": "Directory", "H1": "Heading", "H2": "Heading", "H3": "Heading",
      "H4": "Heading", "H5": "Heading", "H6": "Heading", "Q": "Quote",
      "INS": "Mod", "DEL": "Mod", "A": "Anchor", "IMG": "Image", "CAPTION":
      "TableCaption", "COL": "TableCol", "COLGROUP": "TableCol", "THEAD":
      "TableSection", "TFOOT": "TableSection", "TBODY": "TableSection", "TR":
      "TableRow", "TH": "TableCell", "TD": "TableCell", "FRAMESET":
      "FrameSet", "IFRAME": "IFrame"
    };
    if (trans[tagName]) klass = 'HTML' + trans[tagName] + 'Element';
    if (window[klass]) return window[klass];
    klass = 'HTML' + tagName + 'Element';
    if (window[klass]) return window[klass];
    klass = 'HTML' + tagName.capitalize() + 'Element';
    if (window[klass]) return window[klass];

    var element = document.createElement(tagName),
        proto = element['__proto__'] || element.constructor.prototype;

    element = null;
    return proto;
  }

  var elementPrototype = window.HTMLElement ? HTMLElement.prototype :
   Element.prototype;

  if (F.ElementExtensions) {
    copy(Element.Methods, elementPrototype);
    copy(Element.Methods.Simulated, elementPrototype, true);
  }

  if (F.SpecificElementExtensions) {
    for (var tag in Element.Methods.ByTag) {
      var klass = findDOMClass(tag);
      if (Object.isUndefined(klass)) continue;
      copy(T[tag], klass.prototype);
    }
  }

  Object.extend(Element, Element.Methods);
  delete Element.ByTag;

  if (Element.extend.refresh) Element.extend.refresh();
  Element.cache = { };
};


document.viewport = {

  getDimensions: function() {
    return { width: this.getWidth(), height: this.getHeight() };
  },

  getScrollOffsets: function() {
    return Element._returnOffset(
      window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
      window.pageYOffset || document.documentElement.scrollTop  || document.body.scrollTop);
  }
};

(function(viewport) {
  var B = Prototype.Browser, doc = document, element, property = {};

  function getRootElement() {
    if (B.WebKit && !doc.evaluate)
      return document;

    if (B.Opera && window.parseFloat(window.opera.version()) < 9.5)
      return document.body;

    return document.documentElement;
  }

  function define(D) {
    if (!element) element = getRootElement();

    property[D] = 'client' + D;

    viewport['get' + D] = function() { return element[property[D]] };
    return viewport['get' + D]();
  }

  viewport.getWidth  = define.curry('Width');

  viewport.getHeight = define.curry('Height');
})(document.viewport);


Element.Storage = {
  UID: 1
};

Element.addMethods({
  getStorage: function(element) {
    if (!(element = p$(element))) return;

    var uid;
    if (element === window) {
      uid = 0;
    } else {
      if (typeof element._prototypeUID === "undefined")
        element._prototypeUID = Element.Storage.UID++;
      uid = element._prototypeUID;
    }

    if (!Element.Storage[uid])
      Element.Storage[uid] = $H();

    return Element.Storage[uid];
  },

  store: function(element, key, value) {
    if (!(element = p$(element))) return;

    if (arguments.length === 2) {
      Element.getStorage(element).update(key);
    } else {
      Element.getStorage(element).set(key, value);
    }

    return element;
  },

  retrieve: function(element, key, defaultValue) {
    if (!(element = p$(element))) return;
    var hash = Element.getStorage(element), value = hash.get(key);

    if (Object.isUndefined(value)) {
      hash.set(key, defaultValue);
      value = defaultValue;
    }

    return value;
  },

  clone: function(element, deep) {
    if (!(element = p$(element))) return;
    var clone = element.cloneNode(deep);
    clone._prototypeUID = void 0;
    if (deep) {
      var descendants = Element.select(clone, '*'),
          i = descendants.length;
      while (i--) {
        descendants[i]._prototypeUID = void 0;
      }
    }
    return Element.extend(clone);
  },

  purge: function(element) {
    if (!(element = p$(element))) return;
    var purgeElement = Element._purgeElement;

    purgeElement(element);

    var descendants = element.getElementsByTagName('*'),
     i = descendants.length;

    while (i--) purgeElement(descendants[i]);

    return null;
  }
});

(function() {

  function toDecimal(pctString) {
    var match = pctString.match(/^(\d+)%?$/i);
    if (!match) return null;
    return (Number(match[1]) / 100);
  }

  function getPixelValue(value, property, context) {
    var element = null;
    if (Object.isElement(value)) {
      element = value;
      value = element.getStyle(property);
    }

    if (value === null) {
      return null;
    }

    if ((/^(?:-)?\d+(\.\d+)?(px)?$/i).test(value)) {
      return window.parseFloat(value);
    }

    var isPercentage = value.include('%'), isViewport = (context === document.viewport);

    if (/\d/.test(value) && element && element.runtimeStyle && !(isPercentage && isViewport)) {
      var style = element.style.left, rStyle = element.runtimeStyle.left;
      element.runtimeStyle.left = element.currentStyle.left;
      element.style.left = value || 0;
      value = element.style.pixelLeft;
      element.style.left = style;
      element.runtimeStyle.left = rStyle;

      return value;
    }

    if (element && isPercentage) {
      context = context || element.parentNode;
      var decimal = toDecimal(value);
      var whole = null;
      var position = element.getStyle('position');

      var isHorizontal = property.include('left') || property.include('right') ||
       property.include('width');

      var isVertical =  property.include('top') || property.include('bottom') ||
        property.include('height');

      if (context === document.viewport) {
        if (isHorizontal) {
          whole = document.viewport.getWidth();
        } else if (isVertical) {
          whole = document.viewport.getHeight();
        }
      } else {
        if (isHorizontal) {
          whole = p$(context).measure('width');
        } else if (isVertical) {
          whole = p$(context).measure('height');
        }
      }

      return (whole === null) ? 0 : whole * decimal;
    }

    return 0;
  }

  function toCSSPixels(number) {
    if (Object.isString(number) && number.endsWith('px')) {
      return number;
    }
    return number + 'px';
  }

  function isDisplayed(element) {
    var originalElement = element;
    while (element && element.parentNode) {
      var display = element.getStyle('display');
      if (display === 'none') {
        return false;
      }
      element = p$(element.parentNode);
    }
    return true;
  }

  var hasLayout = Prototype.K;
  if ('currentStyle' in document.documentElement) {
    hasLayout = function(element) {
      if (!element.currentStyle.hasLayout) {
        element.style.zoom = 1;
      }
      return element;
    };
  }

  function cssNameFor(key) {
    if (key.include('border')) key = key + '-width';
    return key.camelize();
  }

  Element.Layout = Class.create(Hash, {
    initialize: function($super, element, preCompute) {
      $super();
      this.element = p$(element);

      Element.Layout.PROPERTIES.each( function(property) {
        this._set(property, null);
      }, this);

      if (preCompute) {
        this._preComputing = true;
        this._begin();
        Element.Layout.PROPERTIES.each( this._compute, this );
        this._end();
        this._preComputing = false;
      }
    },

    _set: function(property, value) {
      return Hash.prototype.set.call(this, property, value);
    },

    set: function(property, value) {
      throw "Properties of Element.Layout are read-only.";
    },

    get: function($super, property) {
      var value = $super(property);
      return value === null ? this._compute(property) : value;
    },

    _begin: function() {
      if (this._prepared) return;

      var element = this.element;
      if (isDisplayed(element)) {
        this._prepared = true;
        return;
      }

      var originalStyles = {
        position:   element.style.position   || '',
        width:      element.style.width      || '',
        visibility: element.style.visibility || '',
        display:    element.style.display    || ''
      };

      element.store('prototype_original_styles', originalStyles);

      var position = element.getStyle('position'),
       width = element.getStyle('width');

      if (width === "0px" || width === null) {
        element.style.display = 'block';
        width = element.getStyle('width');
      }

      var context = (position === 'fixed') ? document.viewport :
       element.parentNode;

      element.setStyle({
        position:   'absolute',
        visibility: 'hidden',
        display:    'block'
      });

      var positionedWidth = element.getStyle('width');

      var newWidth;
      if (width && (positionedWidth === width)) {
        newWidth = getPixelValue(element, 'width', context);
      } else if (position === 'absolute' || position === 'fixed') {
        newWidth = getPixelValue(element, 'width', context);
      } else {
        var parent = element.parentNode, pLayout = p$(parent).getLayout();

        newWidth = pLayout.get('width') -
         this.get('margin-left') -
         this.get('border-left') -
         this.get('padding-left') -
         this.get('padding-right') -
         this.get('border-right') -
         this.get('margin-right');
      }

      element.setStyle({ width: newWidth + 'px' });

      this._prepared = true;
    },

    _end: function() {
      var element = this.element;
      var originalStyles = element.retrieve('prototype_original_styles');
      element.store('prototype_original_styles', null);
      element.setStyle(originalStyles);
      this._prepared = false;
    },

    _compute: function(property) {
      var COMPUTATIONS = Element.Layout.COMPUTATIONS;
      if (!(property in COMPUTATIONS)) {
        throw "Property not found.";
      }

      return this._set(property, COMPUTATIONS[property].call(this, this.element));
    },

    toObject: function() {
      var args = $A(arguments);
      var keys = (args.length === 0) ? Element.Layout.PROPERTIES :
       args.join(' ').split(' ');
      var obj = {};
      keys.each( function(key) {
        if (!Element.Layout.PROPERTIES.include(key)) return;
        var value = this.get(key);
        if (value != null) obj[key] = value;
      }, this);
      return obj;
    },

    toHash: function() {
      var obj = this.toObject.apply(this, arguments);
      return new Hash(obj);
    },

    toCSS: function() {
      var args = $A(arguments);
      var keys = (args.length === 0) ? Element.Layout.PROPERTIES :
       args.join(' ').split(' ');
      var css = {};

      keys.each( function(key) {
        if (!Element.Layout.PROPERTIES.include(key)) return;
        if (Element.Layout.COMPOSITE_PROPERTIES.include(key)) return;

        var value = this.get(key);
        if (value != null) css[cssNameFor(key)] = value + 'px';
      }, this);
      return css;
    },

    inspect: function() {
      return "#<Element.Layout>";
    }
  });

  Object.extend(Element.Layout, {
    PROPERTIES: $w('height width top left right bottom border-left border-right border-top border-bottom padding-left padding-right padding-top padding-bottom margin-top margin-bottom margin-left margin-right padding-box-width padding-box-height border-box-width border-box-height margin-box-width margin-box-height'),

    COMPOSITE_PROPERTIES: $w('padding-box-width padding-box-height margin-box-width margin-box-height border-box-width border-box-height'),

    COMPUTATIONS: {
      'height': function(element) {
        if (!this._preComputing) this._begin();

        var bHeight = this.get('border-box-height');
        if (bHeight <= 0) {
          if (!this._preComputing) this._end();
          return 0;
        }

        var bTop = this.get('border-top'),
         bBottom = this.get('border-bottom');

        var pTop = this.get('padding-top'),
         pBottom = this.get('padding-bottom');

        if (!this._preComputing) this._end();

        return bHeight - bTop - bBottom - pTop - pBottom;
      },

      'width': function(element) {
        if (!this._preComputing) this._begin();

        var bWidth = this.get('border-box-width');
        if (bWidth <= 0) {
          if (!this._preComputing) this._end();
          return 0;
        }

        var bLeft = this.get('border-left'),
         bRight = this.get('border-right');

        var pLeft = this.get('padding-left'),
         pRight = this.get('padding-right');

        if (!this._preComputing) this._end();

        return bWidth - bLeft - bRight - pLeft - pRight;
      },

      'padding-box-height': function(element) {
        var height = this.get('height'),
         pTop = this.get('padding-top'),
         pBottom = this.get('padding-bottom');

        return height + pTop + pBottom;
      },

      'padding-box-width': function(element) {
        var width = this.get('width'),
         pLeft = this.get('padding-left'),
         pRight = this.get('padding-right');

        return width + pLeft + pRight;
      },

      'border-box-height': function(element) {
        if (!this._preComputing) this._begin();
        var height = element.offsetHeight;
        if (!this._preComputing) this._end();
        return height;
      },

      'border-box-width': function(element) {
        if (!this._preComputing) this._begin();
        var width = element.offsetWidth;
        if (!this._preComputing) this._end();
        return width;
      },

      'margin-box-height': function(element) {
        var bHeight = this.get('border-box-height'),
         mTop = this.get('margin-top'),
         mBottom = this.get('margin-bottom');

        if (bHeight <= 0) return 0;

        return bHeight + mTop + mBottom;
      },

      'margin-box-width': function(element) {
        var bWidth = this.get('border-box-width'),
         mLeft = this.get('margin-left'),
         mRight = this.get('margin-right');

        if (bWidth <= 0) return 0;

        return bWidth + mLeft + mRight;
      },

      'top': function(element) {
        var offset = element.positionedOffset();
        return offset.top;
      },

      'bottom': function(element) {
        var offset = element.positionedOffset(),
         parent = element.getOffsetParent(),
         pHeight = parent.measure('height');

        var mHeight = this.get('border-box-height');

        return pHeight - mHeight - offset.top;
      },

      'left': function(element) {
        var offset = element.positionedOffset();
        return offset.left;
      },

      'right': function(element) {
        var offset = element.positionedOffset(),
         parent = element.getOffsetParent(),
         pWidth = parent.measure('width');

        var mWidth = this.get('border-box-width');

        return pWidth - mWidth - offset.left;
      },

      'padding-top': function(element) {
        return getPixelValue(element, 'paddingTop');
      },

      'padding-bottom': function(element) {
        return getPixelValue(element, 'paddingBottom');
      },

      'padding-left': function(element) {
        return getPixelValue(element, 'paddingLeft');
      },

      'padding-right': function(element) {
        return getPixelValue(element, 'paddingRight');
      },

      'border-top': function(element) {
        return getPixelValue(element, 'borderTopWidth');
      },

      'border-bottom': function(element) {
        return getPixelValue(element, 'borderBottomWidth');
      },

      'border-left': function(element) {
        return getPixelValue(element, 'borderLeftWidth');
      },

      'border-right': function(element) {
        return getPixelValue(element, 'borderRightWidth');
      },

      'margin-top': function(element) {
        return getPixelValue(element, 'marginTop');
      },

      'margin-bottom': function(element) {
        return getPixelValue(element, 'marginBottom');
      },

      'margin-left': function(element) {
        return getPixelValue(element, 'marginLeft');
      },

      'margin-right': function(element) {
        return getPixelValue(element, 'marginRight');
      }
    }
  });

  if ('getBoundingClientRect' in document.documentElement) {
    Object.extend(Element.Layout.COMPUTATIONS, {
      'right': function(element) {
        var parent = hasLayout(element.getOffsetParent());
        var rect = element.getBoundingClientRect(),
         pRect = parent.getBoundingClientRect();

        return (pRect.right - rect.right).round();
      },

      'bottom': function(element) {
        var parent = hasLayout(element.getOffsetParent());
        var rect = element.getBoundingClientRect(),
         pRect = parent.getBoundingClientRect();

        return (pRect.bottom - rect.bottom).round();
      }
    });
  }

  Element.Offset = Class.create({
    initialize: function(left, top) {
      this.left = left.round();
      this.top  = top.round();

      this[0] = this.left;
      this[1] = this.top;
    },

    relativeTo: function(offset) {
      return new Element.Offset(
        this.left - offset.left,
        this.top  - offset.top
      );
    },

    inspect: function() {
      return "#<Element.Offset left: #{left} top: #{top}>".interpolate(this);
    },

    toString: function() {
      return "[#{left}, #{top}]".interpolate(this);
    },

    toArray: function() {
      return [this.left, this.top];
    }
  });

  function getLayout(element, preCompute) {
    return new Element.Layout(element, preCompute);
  }

  function measure(element, property) {
    return p$(element).getLayout().get(property);
  }

  function getDimensions(element) {
    element = p$(element);
    var display = Element.getStyle(element, 'display');

    if (display && display !== 'none') {
      return { width: element.offsetWidth, height: element.offsetHeight };
    }

    var style = element.style;
    var originalStyles = {
      visibility: style.visibility,
      position:   style.position,
      display:    style.display
    };

    var newStyles = {
      visibility: 'hidden',
      display:    'block'
    };

    if (originalStyles.position !== 'fixed')
      newStyles.position = 'absolute';

    Element.setStyle(element, newStyles);

    var dimensions = {
      width:  element.offsetWidth,
      height: element.offsetHeight
    };

    Element.setStyle(element, originalStyles);

    return dimensions;
  }

  function getOffsetParent(element) {
    element = p$(element);

    if (isDocument(element) || isDetached(element) || isBody(element) || isHtml(element))
      return p$(document.body);

    var isInline = (Element.getStyle(element, 'display') === 'inline');
    if (!isInline && element.offsetParent) return p$(element.offsetParent);

    while ((element = element.parentNode) && element !== document.body) {
      if (Element.getStyle(element, 'position') !== 'static') {
        return isHtml(element) ? p$(document.body) : p$(element);
      }
    }

    return p$(document.body);
  }


  function cumulativeOffset(element) {
    element = p$(element);
    var valueT = 0, valueL = 0;
    if (element.parentNode) {
      do {
        valueT += element.offsetTop  || 0;
        valueL += element.offsetLeft || 0;
        element = element.offsetParent;
      } while (element);
    }
    return new Element.Offset(valueL, valueT);
  }

  function positionedOffset(element) {
    element = p$(element);

    var layout = element.getLayout();

    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
      if (element) {
        if (isBody(element)) break;
        var p = Element.getStyle(element, 'position');
        if (p !== 'static') break;
      }
    } while (element);

    valueL -= layout.get('margin-top');
    valueT -= layout.get('margin-left');

    return new Element.Offset(valueL, valueT);
  }

  function cumulativeScrollOffset(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.scrollTop  || 0;
      valueL += element.scrollLeft || 0;
      element = element.parentNode;
    } while (element);
    return new Element.Offset(valueL, valueT);
  }

  function viewportOffset(forElement) {
    element = p$(element);
    var valueT = 0, valueL = 0, docBody = document.body;

    var element = forElement;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      if (element.offsetParent == docBody &&
        Element.getStyle(element, 'position') == 'absolute') break;
    } while (element = element.offsetParent);

    element = forElement;
    do {
      if (element != docBody) {
        valueT -= element.scrollTop  || 0;
        valueL -= element.scrollLeft || 0;
      }
    } while (element = element.parentNode);
    return new Element.Offset(valueL, valueT);
  }

  function absolutize(element) {
    element = p$(element);

    if (Element.getStyle(element, 'position') === 'absolute') {
      return element;
    }

    var offsetParent = getOffsetParent(element);
    var eOffset = element.viewportOffset(),
     pOffset = offsetParent.viewportOffset();

    var offset = eOffset.relativeTo(pOffset);
    var layout = element.getLayout();

    element.store('prototype_absolutize_original_styles', {
      left:   element.getStyle('left'),
      top:    element.getStyle('top'),
      width:  element.getStyle('width'),
      height: element.getStyle('height')
    });

    element.setStyle({
      position: 'absolute',
      top:    offset.top + 'px',
      left:   offset.left + 'px',
      width:  layout.get('width') + 'px',
      height: layout.get('height') + 'px'
    });

    return element;
  }

  function relativize(element) {
    element = p$(element);
    if (Element.getStyle(element, 'position') === 'relative') {
      return element;
    }

    var originalStyles =
     element.retrieve('prototype_absolutize_original_styles');

    if (originalStyles) element.setStyle(originalStyles);
    return element;
  }

  if (Prototype.Browser.IE) {
    getOffsetParent = getOffsetParent.wrap(
      function(proceed, element) {
        element = p$(element);

        if (isDocument(element) || isDetached(element) || isBody(element) || isHtml(element))
          return p$(document.body);

        var position = element.getStyle('position');
        if (position !== 'static') return proceed(element);

        element.setStyle({ position: 'relative' });
        var value = proceed(element);
        element.setStyle({ position: position });
        return value;
      }
    );

    positionedOffset = positionedOffset.wrap(function(proceed, element) {
      element = p$(element);
      if (!element.parentNode) return new Element.Offset(0, 0);
      var position = element.getStyle('position');
      if (position !== 'static') return proceed(element);

      var offsetParent = element.getOffsetParent();
      if (offsetParent && offsetParent.getStyle('position') === 'fixed')
        hasLayout(offsetParent);

      element.setStyle({ position: 'relative' });
      var value = proceed(element);
      element.setStyle({ position: position });
      return value;
    });
  } else if (Prototype.Browser.Webkit) {
    cumulativeOffset = function(element) {
      element = p$(element);
      var valueT = 0, valueL = 0;
      do {
        valueT += element.offsetTop  || 0;
        valueL += element.offsetLeft || 0;
        if (element.offsetParent == document.body)
          if (Element.getStyle(element, 'position') == 'absolute') break;

        element = element.offsetParent;
      } while (element);

      return new Element.Offset(valueL, valueT);
    };
  }


  Element.addMethods({
    getLayout:              getLayout,
    measure:                measure,
    getDimensions:          getDimensions,
    getOffsetParent:        getOffsetParent,
    cumulativeOffset:       cumulativeOffset,
    positionedOffset:       positionedOffset,
    cumulativeScrollOffset: cumulativeScrollOffset,
    viewportOffset:         viewportOffset,
    absolutize:             absolutize,
    relativize:             relativize
  });

  function isBody(element) {
    return element.nodeName.toUpperCase() === 'BODY';
  }

  function isHtml(element) {
    return element.nodeName.toUpperCase() === 'HTML';
  }

  function isDocument(element) {
    return element.nodeType === Node.DOCUMENT_NODE;
  }

  function isDetached(element) {
    return element !== document.body &&
     !Element.descendantOf(element, document.body);
  }

  if ('getBoundingClientRect' in document.documentElement) {
    Element.addMethods({
      viewportOffset: function(element) {
        element = p$(element);
        if (isDetached(element)) return new Element.Offset(0, 0);

        var rect = element.getBoundingClientRect(),
         docEl = document.documentElement;
        return new Element.Offset(rect.left - docEl.clientLeft,
         rect.top - docEl.clientTop);
      }
    });
  }
})();
window.$$ = function() {
  var expression = $A(arguments).join(', ');
  return Prototype.Selector.select(expression, document);
};

Prototype.Selector = (function() {

  function select() {
    throw new Error('Method "Prototype.Selector.select" must be defined.');
  }

  function match() {
    throw new Error('Method "Prototype.Selector.match" must be defined.');
  }

  function find(elements, expression, index) {
    index = index || 0;
    var match = Prototype.Selector.match, length = elements.length, matchIndex = 0, i;

    for (i = 0; i < length; i++) {
      if (match(elements[i], expression) && index == matchIndex++) {
        return Element.extend(elements[i]);
      }
    }
  }

  function extendElements(elements) {
    for (var i = 0, length = elements.length; i < length; i++) {
      Element.extend(elements[i]);
    }
    return elements;
  }


  var K = Prototype.K;

  return {
    select: select,
    match: match,
    find: find,
    extendElements: (Element.extend === K) ? K : extendElements,
    extendElement: Element.extend
  };
})();
Prototype._original_property = window.Sizzle;
/*!
 * Sizzle CSS Selector Engine - v1.0
 *  Copyright 2009, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function(){

var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^[\]]*\]|['"][^'"]*['"]|[^[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
	done = 0,
	toString = Object.prototype.toString,
	hasDuplicate = false,
	baseHasDuplicate = true;

[0, 0].sort(function(){
	baseHasDuplicate = false;
	return 0;
});

var Sizzle = function(selector, context, results, seed) {
	results = results || [];
	var origContext = context = context || document;

	if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
		return [];
	}

	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	var parts = [], m, set, checkSet, check, mode, extra, prune = true, contextXML = isXML(context),
		soFar = selector;

	while ( (chunker.exec(""), m = chunker.exec(soFar)) !== null ) {
		soFar = m[3];

		parts.push( m[1] );

		if ( m[2] ) {
			extra = m[3];
			break;
		}
	}

	if ( parts.length > 1 && origPOS.exec( selector ) ) {
		if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
			set = posProcess( parts[0] + parts[1], context );
		} else {
			set = Expr.relative[ parts[0] ] ?
				[ context ] :
				Sizzle( parts.shift(), context );

			while ( parts.length ) {
				selector = parts.shift();

				if ( Expr.relative[ selector ] )
					selector += parts.shift();

				set = posProcess( selector, set );
			}
		}
	} else {
		if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
				Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {
			var ret = Sizzle.find( parts.shift(), context, contextXML );
			context = ret.expr ? Sizzle.filter( ret.expr, ret.set )[0] : ret.set[0];
		}

		if ( context ) {
			var ret = seed ?
				{ expr: parts.pop(), set: makeArray(seed) } :
				Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );
			set = ret.expr ? Sizzle.filter( ret.expr, ret.set ) : ret.set;

			if ( parts.length > 0 ) {
				checkSet = makeArray(set);
			} else {
				prune = false;
			}

			while ( parts.length ) {
				var cur = parts.pop(), pop = cur;

				if ( !Expr.relative[ cur ] ) {
					cur = "";
				} else {
					pop = parts.pop();
				}

				if ( pop == null ) {
					pop = context;
				}

				Expr.relative[ cur ]( checkSet, pop, contextXML );
			}
		} else {
			checkSet = parts = [];
		}
	}

	if ( !checkSet ) {
		checkSet = set;
	}

	if ( !checkSet ) {
		throw "Syntax error, unrecognized expression: " + (cur || selector);
	}

	if ( toString.call(checkSet) === "[object Array]" ) {
		if ( !prune ) {
			results.push.apply( results, checkSet );
		} else if ( context && context.nodeType === 1 ) {
			for ( var i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && contains(context, checkSet[i])) ) {
					results.push( set[i] );
				}
			}
		} else {
			for ( var i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
					results.push( set[i] );
				}
			}
		}
	} else {
		makeArray( checkSet, results );
	}

	if ( extra ) {
		Sizzle( extra, origContext, results, seed );
		Sizzle.uniqueSort( results );
	}

	return results;
};

Sizzle.uniqueSort = function(results){
	if ( sortOrder ) {
		hasDuplicate = baseHasDuplicate;
		results.sort(sortOrder);

		if ( hasDuplicate ) {
			for ( var i = 1; i < results.length; i++ ) {
				if ( results[i] === results[i-1] ) {
					results.splice(i--, 1);
				}
			}
		}
	}

	return results;
};

Sizzle.matches = function(expr, set){
	return Sizzle(expr, null, null, set);
};

Sizzle.find = function(expr, context, isXML){
	var set, match;

	if ( !expr ) {
		return [];
	}

	for ( var i = 0, l = Expr.order.length; i < l; i++ ) {
		var type = Expr.order[i], match;

		if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
			var left = match[1];
			match.splice(1,1);

			if ( left.substr( left.length - 1 ) !== "\\" ) {
				match[1] = (match[1] || "").replace(/\\/g, "");
				set = Expr.find[ type ]( match, context, isXML );
				if ( set != null ) {
					expr = expr.replace( Expr.match[ type ], "" );
					break;
				}
			}
		}
	}

	if ( !set ) {
		set = context.getElementsByTagName("*");
	}

	return {set: set, expr: expr};
};

Sizzle.filter = function(expr, set, inplace, not){
	var old = expr, result = [], curLoop = set, match, anyFound,
		isXMLFilter = set && set[0] && isXML(set[0]);

	while ( expr && set.length ) {
		for ( var type in Expr.filter ) {
			if ( (match = Expr.match[ type ].exec( expr )) != null ) {
				var filter = Expr.filter[ type ], found, item;
				anyFound = false;

				if ( curLoop == result ) {
					result = [];
				}

				if ( Expr.preFilter[ type ] ) {
					match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

					if ( !match ) {
						anyFound = found = true;
					} else if ( match === true ) {
						continue;
					}
				}

				if ( match ) {
					for ( var i = 0; (item = curLoop[i]) != null; i++ ) {
						if ( item ) {
							found = filter( item, match, i, curLoop );
							var pass = not ^ !!found;

							if ( inplace && found != null ) {
								if ( pass ) {
									anyFound = true;
								} else {
									curLoop[i] = false;
								}
							} else if ( pass ) {
								result.push( item );
								anyFound = true;
							}
						}
					}
				}

				if ( found !== undefined ) {
					if ( !inplace ) {
						curLoop = result;
					}

					expr = expr.replace( Expr.match[ type ], "" );

					if ( !anyFound ) {
						return [];
					}

					break;
				}
			}
		}

		if ( expr == old ) {
			if ( anyFound == null ) {
				throw "Syntax error, unrecognized expression: " + expr;
			} else {
				break;
			}
		}

		old = expr;
	}

	return curLoop;
};

var Expr = Sizzle.selectors = {
	order: [ "ID", "NAME", "TAG" ],
	match: {
		ID: /#((?:[\w\u00c0-\uFFFF-]|\\.)+)/,
		CLASS: /\.((?:[\w\u00c0-\uFFFF-]|\\.)+)/,
		NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF-]|\\.)+)['"]*\]/,
		ATTR: /\[\s*((?:[\w\u00c0-\uFFFF-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,
		TAG: /^((?:[\w\u00c0-\uFFFF\*-]|\\.)+)/,
		CHILD: /:(only|nth|last|first)-child(?:\((even|odd|[\dn+-]*)\))?/,
		POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^-]|$)/,
		PSEUDO: /:((?:[\w\u00c0-\uFFFF-]|\\.)+)(?:\((['"]*)((?:\([^\)]+\)|[^\2\(\)]*)+)\2\))?/
	},
	leftMatch: {},
	attrMap: {
		"class": "className",
		"for": "htmlFor"
	},
	attrHandle: {
		href: function(elem){
			return elem.getAttribute("href");
		}
	},
	relative: {
		"+": function(checkSet, part, isXML){
			var isPartStr = typeof part === "string",
				isTag = isPartStr && !/\W/.test(part),
				isPartStrNotTag = isPartStr && !isTag;

			if ( isTag && !isXML ) {
				part = part.toUpperCase();
			}

			for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
				if ( (elem = checkSet[i]) ) {
					while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

					checkSet[i] = isPartStrNotTag || elem && elem.nodeName === part ?
						elem || false :
						elem === part;
				}
			}

			if ( isPartStrNotTag ) {
				Sizzle.filter( part, checkSet, true );
			}
		},
		">": function(checkSet, part, isXML){
			var isPartStr = typeof part === "string";

			if ( isPartStr && !/\W/.test(part) ) {
				part = isXML ? part : part.toUpperCase();

				for ( var i = 0, l = checkSet.length; i < l; i++ ) {
					var elem = checkSet[i];
					if ( elem ) {
						var parent = elem.parentNode;
						checkSet[i] = parent.nodeName === part ? parent : false;
					}
				}
			} else {
				for ( var i = 0, l = checkSet.length; i < l; i++ ) {
					var elem = checkSet[i];
					if ( elem ) {
						checkSet[i] = isPartStr ?
							elem.parentNode :
							elem.parentNode === part;
					}
				}

				if ( isPartStr ) {
					Sizzle.filter( part, checkSet, true );
				}
			}
		},
		"": function(checkSet, part, isXML){
			var doneName = done++, checkFn = dirCheck;

			if ( !/\W/.test(part) ) {
				var nodeCheck = part = isXML ? part : part.toUpperCase();
				checkFn = dirNodeCheck;
			}

			checkFn("parentNode", part, doneName, checkSet, nodeCheck, isXML);
		},
		"~": function(checkSet, part, isXML){
			var doneName = done++, checkFn = dirCheck;

			if ( typeof part === "string" && !/\W/.test(part) ) {
				var nodeCheck = part = isXML ? part : part.toUpperCase();
				checkFn = dirNodeCheck;
			}

			checkFn("previousSibling", part, doneName, checkSet, nodeCheck, isXML);
		}
	},
	find: {
		ID: function(match, context, isXML){
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				return m ? [m] : [];
			}
		},
		NAME: function(match, context, isXML){
			if ( typeof context.getElementsByName !== "undefined" ) {
				var ret = [], results = context.getElementsByName(match[1]);

				for ( var i = 0, l = results.length; i < l; i++ ) {
					if ( results[i].getAttribute("name") === match[1] ) {
						ret.push( results[i] );
					}
				}

				return ret.length === 0 ? null : ret;
			}
		},
		TAG: function(match, context){
			return context.getElementsByTagName(match[1]);
		}
	},
	preFilter: {
		CLASS: function(match, curLoop, inplace, result, not, isXML){
			match = " " + match[1].replace(/\\/g, "") + " ";

			if ( isXML ) {
				return match;
			}

			for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
				if ( elem ) {
					if ( not ^ (elem.className && (" " + elem.className + " ").indexOf(match) >= 0) ) {
						if ( !inplace )
							result.push( elem );
					} else if ( inplace ) {
						curLoop[i] = false;
					}
				}
			}

			return false;
		},
		ID: function(match){
			return match[1].replace(/\\/g, "");
		},
		TAG: function(match, curLoop){
			for ( var i = 0; curLoop[i] === false; i++ ){}
			return curLoop[i] && isXML(curLoop[i]) ? match[1] : match[1].toUpperCase();
		},
		CHILD: function(match){
			if ( match[1] == "nth" ) {
				var test = /(-?)(\d*)n((?:\+|-)?\d*)/.exec(
					match[2] == "even" && "2n" || match[2] == "odd" && "2n+1" ||
					!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

				match[2] = (test[1] + (test[2] || 1)) - 0;
				match[3] = test[3] - 0;
			}

			match[0] = done++;

			return match;
		},
		ATTR: function(match, curLoop, inplace, result, not, isXML){
			var name = match[1].replace(/\\/g, "");

			if ( !isXML && Expr.attrMap[name] ) {
				match[1] = Expr.attrMap[name];
			}

			if ( match[2] === "~=" ) {
				match[4] = " " + match[4] + " ";
			}

			return match;
		},
		PSEUDO: function(match, curLoop, inplace, result, not){
			if ( match[1] === "not" ) {
				if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
					match[3] = Sizzle(match[3], null, null, curLoop);
				} else {
					var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);
					if ( !inplace ) {
						result.push.apply( result, ret );
					}
					return false;
				}
			} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
				return true;
			}

			return match;
		},
		POS: function(match){
			match.unshift( true );
			return match;
		}
	},
	filters: {
		enabled: function(elem){
			return elem.disabled === false && elem.type !== "hidden";
		},
		disabled: function(elem){
			return elem.disabled === true;
		},
		checked: function(elem){
			return elem.checked === true;
		},
		selected: function(elem){
			elem.parentNode.selectedIndex;
			return elem.selected === true;
		},
		parent: function(elem){
			return !!elem.firstChild;
		},
		empty: function(elem){
			return !elem.firstChild;
		},
		has: function(elem, i, match){
			return !!Sizzle( match[3], elem ).length;
		},
		header: function(elem){
			return /h\d/i.test( elem.nodeName );
		},
		text: function(elem){
			return "text" === elem.type;
		},
		radio: function(elem){
			return "radio" === elem.type;
		},
		checkbox: function(elem){
			return "checkbox" === elem.type;
		},
		file: function(elem){
			return "file" === elem.type;
		},
		password: function(elem){
			return "password" === elem.type;
		},
		submit: function(elem){
			return "submit" === elem.type;
		},
		image: function(elem){
			return "image" === elem.type;
		},
		reset: function(elem){
			return "reset" === elem.type;
		},
		button: function(elem){
			return "button" === elem.type || elem.nodeName.toUpperCase() === "BUTTON";
		},
		input: function(elem){
			return /input|select|textarea|button/i.test(elem.nodeName);
		}
	},
	setFilters: {
		first: function(elem, i){
			return i === 0;
		},
		last: function(elem, i, match, array){
			return i === array.length - 1;
		},
		even: function(elem, i){
			return i % 2 === 0;
		},
		odd: function(elem, i){
			return i % 2 === 1;
		},
		lt: function(elem, i, match){
			return i < match[3] - 0;
		},
		gt: function(elem, i, match){
			return i > match[3] - 0;
		},
		nth: function(elem, i, match){
			return match[3] - 0 == i;
		},
		eq: function(elem, i, match){
			return match[3] - 0 == i;
		}
	},
	filter: {
		PSEUDO: function(elem, match, i, array){
			var name = match[1], filter = Expr.filters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			} else if ( name === "contains" ) {
				return (elem.textContent || elem.innerText || "").indexOf(match[3]) >= 0;
			} else if ( name === "not" ) {
				var not = match[3];

				for ( var i = 0, l = not.length; i < l; i++ ) {
					if ( not[i] === elem ) {
						return false;
					}
				}

				return true;
			}
		},
		CHILD: function(elem, match){
			var type = match[1], node = elem;
			switch (type) {
				case 'only':
				case 'first':
					while ( (node = node.previousSibling) )  {
						if ( node.nodeType === 1 ) return false;
					}
					if ( type == 'first') return true;
					node = elem;
				case 'last':
					while ( (node = node.nextSibling) )  {
						if ( node.nodeType === 1 ) return false;
					}
					return true;
				case 'nth':
					var first = match[2], last = match[3];

					if ( first == 1 && last == 0 ) {
						return true;
					}

					var doneName = match[0],
						parent = elem.parentNode;

					if ( parent && (parent.sizcache !== doneName || !elem.nodeIndex) ) {
						var count = 0;
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.nodeIndex = ++count;
							}
						}
						parent.sizcache = doneName;
					}

					var diff = elem.nodeIndex - last;
					if ( first == 0 ) {
						return diff == 0;
					} else {
						return ( diff % first == 0 && diff / first >= 0 );
					}
			}
		},
		ID: function(elem, match){
			return elem.nodeType === 1 && elem.getAttribute("id") === match;
		},
		TAG: function(elem, match){
			return (match === "*" && elem.nodeType === 1) || elem.nodeName === match;
		},
		CLASS: function(elem, match){
			return (" " + (elem.className || elem.getAttribute("class")) + " ")
				.indexOf( match ) > -1;
		},
		ATTR: function(elem, match){
			var name = match[1],
				result = Expr.attrHandle[ name ] ?
					Expr.attrHandle[ name ]( elem ) :
					elem[ name ] != null ?
						elem[ name ] :
						elem.getAttribute( name ),
				value = result + "",
				type = match[2],
				check = match[4];

			return result == null ?
				type === "!=" :
				type === "=" ?
				value === check :
				type === "*=" ?
				value.indexOf(check) >= 0 :
				type === "~=" ?
				(" " + value + " ").indexOf(check) >= 0 :
				!check ?
				value && result !== false :
				type === "!=" ?
				value != check :
				type === "^=" ?
				value.indexOf(check) === 0 :
				type === "$=" ?
				value.substr(value.length - check.length) === check :
				type === "|=" ?
				value === check || value.substr(0, check.length + 1) === check + "-" :
				false;
		},
		POS: function(elem, match, i, array){
			var name = match[2], filter = Expr.setFilters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			}
		}
	}
};

var origPOS = Expr.match.POS;

for ( var type in Expr.match ) {
	Expr.match[ type ] = new RegExp( Expr.match[ type ].source + /(?![^\[]*\])(?![^\(]*\))/.source );
	Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source );
}

var makeArray = function(array, results) {
	array = Array.prototype.slice.call( array, 0 );

	if ( results ) {
		results.push.apply( results, array );
		return results;
	}

	return array;
};

try {
	Array.prototype.slice.call( document.documentElement.childNodes, 0 );

} catch(e){
	makeArray = function(array, results) {
		var ret = results || [];

		if ( toString.call(array) === "[object Array]" ) {
			Array.prototype.push.apply( ret, array );
		} else {
			if ( typeof array.length === "number" ) {
				for ( var i = 0, l = array.length; i < l; i++ ) {
					ret.push( array[i] );
				}
			} else {
				for ( var i = 0; array[i]; i++ ) {
					ret.push( array[i] );
				}
			}
		}

		return ret;
	};
}

var sortOrder;

if ( document.documentElement.compareDocumentPosition ) {
	sortOrder = function( a, b ) {
		if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
			if ( a == b ) {
				hasDuplicate = true;
			}
			return 0;
		}

		var ret = a.compareDocumentPosition(b) & 4 ? -1 : a === b ? 0 : 1;
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
} else if ( "sourceIndex" in document.documentElement ) {
	sortOrder = function( a, b ) {
		if ( !a.sourceIndex || !b.sourceIndex ) {
			if ( a == b ) {
				hasDuplicate = true;
			}
			return 0;
		}

		var ret = a.sourceIndex - b.sourceIndex;
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
} else if ( document.createRange ) {
	sortOrder = function( a, b ) {
		if ( !a.ownerDocument || !b.ownerDocument ) {
			if ( a == b ) {
				hasDuplicate = true;
			}
			return 0;
		}

		var aRange = a.ownerDocument.createRange(), bRange = b.ownerDocument.createRange();
		aRange.setStart(a, 0);
		aRange.setEnd(a, 0);
		bRange.setStart(b, 0);
		bRange.setEnd(b, 0);
		var ret = aRange.compareBoundaryPoints(Range.START_TO_END, bRange);
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
}

(function(){
	var form = document.createElement("div"),
		id = "script" + (new Date).getTime();
	form.innerHTML = "<a name='" + id + "'/>";

	var root = document.documentElement;
	root.insertBefore( form, root.firstChild );

	if ( !!document.getElementById( id ) ) {
		Expr.find.ID = function(match, context, isXML){
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				return m ? m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ? [m] : undefined : [];
			}
		};

		Expr.filter.ID = function(elem, match){
			var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
			return elem.nodeType === 1 && node && node.nodeValue === match;
		};
	}

	root.removeChild( form );
	root = form = null; // release memory in IE
})();

(function(){

	var div = document.createElement("div");
	div.appendChild( document.createComment("") );

	if ( div.getElementsByTagName("*").length > 0 ) {
		Expr.find.TAG = function(match, context){
			var results = context.getElementsByTagName(match[1]);

			if ( match[1] === "*" ) {
				var tmp = [];

				for ( var i = 0; results[i]; i++ ) {
					if ( results[i].nodeType === 1 ) {
						tmp.push( results[i] );
					}
				}

				results = tmp;
			}

			return results;
		};
	}

	div.innerHTML = "<a href='#'></a>";
	if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
			div.firstChild.getAttribute("href") !== "#" ) {
		Expr.attrHandle.href = function(elem){
			return elem.getAttribute("href", 2);
		};
	}

	div = null; // release memory in IE
})();

if ( document.querySelectorAll ) (function(){
	var oldSizzle = Sizzle, div = document.createElement("div");
	div.innerHTML = "<p class='TEST'></p>";

	if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
		return;
	}

	Sizzle = function(query, context, extra, seed){
		context = context || document;

		if ( !seed && context.nodeType === 9 && !isXML(context) ) {
			try {
				return makeArray( context.querySelectorAll(query), extra );
			} catch(e){}
		}

		return oldSizzle(query, context, extra, seed);
	};

	for ( var prop in oldSizzle ) {
		Sizzle[ prop ] = oldSizzle[ prop ];
	}

	div = null; // release memory in IE
})();

if ( document.getElementsByClassName && document.documentElement.getElementsByClassName ) (function(){
	var div = document.createElement("div");
	div.innerHTML = "<div class='test e'></div><div class='test'></div>";

	if ( div.getElementsByClassName("e").length === 0 )
		return;

	div.lastChild.className = "e";

	if ( div.getElementsByClassName("e").length === 1 )
		return;

	Expr.order.splice(1, 0, "CLASS");
	Expr.find.CLASS = function(match, context, isXML) {
		if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
			return context.getElementsByClassName(match[1]);
		}
	};

	div = null; // release memory in IE
})();

function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	var sibDir = dir == "previousSibling" && !isXML;
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];
		if ( elem ) {
			if ( sibDir && elem.nodeType === 1 ){
				elem.sizcache = doneName;
				elem.sizset = i;
			}
			elem = elem[dir];
			var match = false;

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 && !isXML ){
					elem.sizcache = doneName;
					elem.sizset = i;
				}

				if ( elem.nodeName === cur ) {
					match = elem;
					break;
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	var sibDir = dir == "previousSibling" && !isXML;
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];
		if ( elem ) {
			if ( sibDir && elem.nodeType === 1 ) {
				elem.sizcache = doneName;
				elem.sizset = i;
			}
			elem = elem[dir];
			var match = false;

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 ) {
					if ( !isXML ) {
						elem.sizcache = doneName;
						elem.sizset = i;
					}
					if ( typeof cur !== "string" ) {
						if ( elem === cur ) {
							match = true;
							break;
						}

					} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
						match = elem;
						break;
					}
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

var contains = document.compareDocumentPosition ?  function(a, b){
	return a.compareDocumentPosition(b) & 16;
} : function(a, b){
	return a !== b && (a.contains ? a.contains(b) : true);
};

var isXML = function(elem){
	return elem.nodeType === 9 && elem.documentElement.nodeName !== "HTML" ||
		!!elem.ownerDocument && elem.ownerDocument.documentElement.nodeName !== "HTML";
};

var posProcess = function(selector, context){
	var tmpSet = [], later = "", match,
		root = context.nodeType ? [context] : context;

	while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
		later += match[0];
		selector = selector.replace( Expr.match.PSEUDO, "" );
	}

	selector = Expr.relative[selector] ? selector + "*" : selector;

	for ( var i = 0, l = root.length; i < l; i++ ) {
		Sizzle( selector, root[i], tmpSet );
	}

	return Sizzle.filter( later, tmpSet );
};


window.Sizzle = Sizzle;

})();

;(function(engine) {
  var extendElements = Prototype.Selector.extendElements;

  function select(selector, scope) {
    return extendElements(engine(selector, scope || document));
  }

  function match(element, selector) {
    return engine.matches(selector, [element]).length == 1;
  }

  Prototype.Selector.engine = engine;
  Prototype.Selector.select = select;
  Prototype.Selector.match = match;
})(Sizzle);

window.Sizzle = Prototype._original_property;
delete Prototype._original_property;

var Form = {
  reset: function(form) {
    form = p$(form);
    form.reset();
    return form;
  },

  serializeElements: function(elements, options) {
    if (typeof options != 'object') options = { hash: !!options };
    else if (Object.isUndefined(options.hash)) options.hash = true;
    var key, value, submitted = false, submit = options.submit, accumulator, initial;

    if (options.hash) {
      initial = {};
      accumulator = function(result, key, value) {
        if (key in result) {
          if (!Object.isArray(result[key])) result[key] = [result[key]];
          result[key].push(value);
        } else result[key] = value;
        return result;
      };
    } else {
      initial = '';
      accumulator = function(result, key, value) {
        return result + (result ? '&' : '') + encodeURIComponent(key) + '=' + encodeURIComponent(value);
      }
    }

    return elements.inject(initial, function(result, element) {
      if (!element.disabled && element.name) {
        key = element.name; value = p$(element).getValue();
        if (value != null && element.type != 'file' && (element.type != 'submit' || (!submitted &&
            submit !== false && (!submit || key == submit) && (submitted = true)))) {
          result = accumulator(result, key, value);
        }
      }
      return result;
    });
  }
};

Form.Methods = {
  serialize: function(form, options) {
    return Form.serializeElements(Form.getElements(form), options);
  },

  getElements: function(form) {
    var elements = p$(form).getElementsByTagName('*'),
        element,
        arr = [ ],
        serializers = Form.Element.Serializers;
    for (var i = 0; element = elements[i]; i++) {
      arr.push(element);
    }
    return arr.inject([], function(elements, child) {
      if (serializers[child.tagName.toLowerCase()])
        elements.push(Element.extend(child));
      return elements;
    })
  },

  getInputs: function(form, typeName, name) {
    form = p$(form);
    var inputs = form.getElementsByTagName('input');

    if (!typeName && !name) return $A(inputs).map(Element.extend);

    for (var i = 0, matchingInputs = [], length = inputs.length; i < length; i++) {
      var input = inputs[i];
      if ((typeName && input.type != typeName) || (name && input.name != name))
        continue;
      matchingInputs.push(Element.extend(input));
    }

    return matchingInputs;
  },

  disable: function(form) {
    form = p$(form);
    Form.getElements(form).invoke('disable');
    return form;
  },

  enable: function(form) {
    form = p$(form);
    Form.getElements(form).invoke('enable');
    return form;
  },

  findFirstElement: function(form) {
    var elements = p$(form).getElements().findAll(function(element) {
      return 'hidden' != element.type && !element.disabled;
    });
    var firstByIndex = elements.findAll(function(element) {
      return element.hasAttribute('tabIndex') && element.tabIndex >= 0;
    }).sortBy(function(element) { return element.tabIndex }).first();

    return firstByIndex ? firstByIndex : elements.find(function(element) {
      return /^(?:input|select|textarea)$/i.test(element.tagName);
    });
  },

  focusFirstElement: function(form) {
    form = p$(form);
    var element = form.findFirstElement();
    if (element) element.activate();
    return form;
  },

  request: function(form, options) {
    form = p$(form), options = Object.clone(options || { });

    var params = options.parameters, action = form.readAttribute('action') || '';
    if (action.blank()) action = window.location.href;
    options.parameters = form.serialize(true);

    if (params) {
      if (Object.isString(params)) params = params.toQueryParams();
      Object.extend(options.parameters, params);
    }

    if (form.hasAttribute('method') && !options.method)
      options.method = form.method;

    return new Ajax.Request(action, options);
  }
};

/*--------------------------------------------------------------------------*/


Form.Element = {
  focus: function(element) {
    p$(element).focus();
    return element;
  },

  select: function(element) {
    p$(element).select();
    return element;
  }
};

Form.Element.Methods = {

  serialize: function(element) {
    element = p$(element);
    if (!element.disabled && element.name) {
      var value = element.getValue();
      if (value != undefined) {
        var pair = { };
        pair[element.name] = value;
        return Object.toQueryString(pair);
      }
    }
    return '';
  },

  getValue: function(element) {
    element = p$(element);
    var method = element.tagName.toLowerCase();
    return Form.Element.Serializers[method](element);
  },

  setValue: function(element, value) {
    element = p$(element);
    var method = element.tagName.toLowerCase();
    Form.Element.Serializers[method](element, value);
    return element;
  },

  clear: function(element) {
    p$(element).value = '';
    return element;
  },

  present: function(element) {
    return p$(element).value != '';
  },

  activate: function(element) {
    element = p$(element);
    try {
      element.focus();
      if (element.select && (element.tagName.toLowerCase() != 'input' ||
          !(/^(?:button|reset|submit)$/i.test(element.type))))
        element.select();
    } catch (e) { }
    return element;
  },

  disable: function(element) {
    element = p$(element);
    element.disabled = true;
    return element;
  },

  enable: function(element) {
    element = p$(element);
    element.disabled = false;
    return element;
  }
};

/*--------------------------------------------------------------------------*/

var Field = Form.Element;

var $F = Form.Element.Methods.getValue;

/*--------------------------------------------------------------------------*/

Form.Element.Serializers = (function() {
  function input(element, value) {
    switch (element.type.toLowerCase()) {
      case 'checkbox':
      case 'radio':
        return inputSelector(element, value);
      default:
        return valueSelector(element, value);
    }
  }

  function inputSelector(element, value) {
    if (Object.isUndefined(value))
      return element.checked ? element.value : null;
    else element.checked = !!value;
  }

  function valueSelector(element, value) {
    if (Object.isUndefined(value)) return element.value;
    else element.value = value;
  }

  function select(element, value) {
    if (Object.isUndefined(value))
      return (element.type === 'select-one' ? selectOne : selectMany)(element);

    var opt, currentValue, single = !Object.isArray(value);
    for (var i = 0, length = element.length; i < length; i++) {
      opt = element.options[i];
      currentValue = this.optionValue(opt);
      if (single) {
        if (currentValue == value) {
          opt.selected = true;
          return;
        }
      }
      else opt.selected = value.include(currentValue);
    }
  }

  function selectOne(element) {
    var index = element.selectedIndex;
    return index >= 0 ? optionValue(element.options[index]) : null;
  }

  function selectMany(element) {
    var values, length = element.length;
    if (!length) return null;

    for (var i = 0, values = []; i < length; i++) {
      var opt = element.options[i];
      if (opt.selected) values.push(optionValue(opt));
    }
    return values;
  }

  function optionValue(opt) {
    return Element.hasAttribute(opt, 'value') ? opt.value : opt.text;
  }

  return {
    input:         input,
    inputSelector: inputSelector,
    textarea:      valueSelector,
    select:        select,
    selectOne:     selectOne,
    selectMany:    selectMany,
    optionValue:   optionValue,
    button:        valueSelector
  };
})();

/*--------------------------------------------------------------------------*/


Abstract.TimedObserver = Class.create(PeriodicalExecuter, {
  initialize: function($super, element, frequency, callback) {
    $super(callback, frequency);
    this.element   = p$(element);
    this.lastValue = this.getValue();
  },

  execute: function() {
    var value = this.getValue();
    if (Object.isString(this.lastValue) && Object.isString(value) ?
        this.lastValue != value : String(this.lastValue) != String(value)) {
      this.callback(this.element, value);
      this.lastValue = value;
    }
  }
});

Form.Element.Observer = Class.create(Abstract.TimedObserver, {
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

Form.Observer = Class.create(Abstract.TimedObserver, {
  getValue: function() {
    return Form.serialize(this.element);
  }
});

/*--------------------------------------------------------------------------*/

Abstract.EventObserver = Class.create({
  initialize: function(element, callback) {
    this.element  = p$(element);
    this.callback = callback;

    this.lastValue = this.getValue();
    if (this.element.tagName.toLowerCase() == 'form')
      this.registerFormCallbacks();
    else
      this.registerCallback(this.element);
  },

  onElementEvent: function() {
    var value = this.getValue();
    if (this.lastValue != value) {
      this.callback(this.element, value);
      this.lastValue = value;
    }
  },

  registerFormCallbacks: function() {
    Form.getElements(this.element).each(this.registerCallback, this);
  },

  registerCallback: function(element) {
    if (element.type) {
      switch (element.type.toLowerCase()) {
        case 'checkbox':
        case 'radio':
          Event.observe(element, 'click', this.onElementEvent.bind(this));
          break;
        default:
          Event.observe(element, 'change', this.onElementEvent.bind(this));
          break;
      }
    }
  }
});

Form.Element.EventObserver = Class.create(Abstract.EventObserver, {
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

Form.EventObserver = Class.create(Abstract.EventObserver, {
  getValue: function() {
    return Form.serialize(this.element);
  }
});
(function() {

  var Event = {
    KEY_BACKSPACE: 8,
    KEY_TAB:       9,
    KEY_RETURN:   13,
    KEY_ESC:      27,
    KEY_LEFT:     37,
    KEY_UP:       38,
    KEY_RIGHT:    39,
    KEY_DOWN:     40,
    KEY_DELETE:   46,
    KEY_HOME:     36,
    KEY_END:      35,
    KEY_PAGEUP:   33,
    KEY_PAGEDOWN: 34,
    KEY_INSERT:   45,

    cache: {}
  };

  var docEl = document.documentElement;
  var MOUSEENTER_MOUSELEAVE_EVENTS_SUPPORTED = 'onmouseenter' in docEl
    && 'onmouseleave' in docEl;



  var isIELegacyEvent = function(event) { return false; };

  if (window.attachEvent) {
    if (window.addEventListener) {
      isIELegacyEvent = function(event) {
        return !(event instanceof window.Event);
      };
    } else {
      isIELegacyEvent = function(event) { return true; };
    }
  }

  var _isButton;

  function _isButtonForDOMEvents(event, code) {
    return event.which ? (event.which === code + 1) : (event.button === code);
  }

  var legacyButtonMap = { 0: 1, 1: 4, 2: 2 };
  function _isButtonForLegacyEvents(event, code) {
    return event.button === legacyButtonMap[code];
  }

  function _isButtonForWebKit(event, code) {
    switch (code) {
      case 0: return event.which == 1 && !event.metaKey;
      case 1: return event.which == 2 || (event.which == 1 && event.metaKey);
      case 2: return event.which == 3;
      default: return false;
    }
  }

  if (window.attachEvent) {
    if (!window.addEventListener) {
      _isButton = _isButtonForLegacyEvents;
    } else {
      _isButton = function(event, code) {
        return isIELegacyEvent(event) ? _isButtonForLegacyEvents(event, code) :
         _isButtonForDOMEvents(event, code);
      }
    }
  } else if (Prototype.Browser.WebKit) {
    _isButton = _isButtonForWebKit;
  } else {
    _isButton = _isButtonForDOMEvents;
  }

  function isLeftClick(event)   { return _isButton(event, 0) }

  function isMiddleClick(event) { return _isButton(event, 1) }

  function isRightClick(event)  { return _isButton(event, 2) }

  function element(event) {
    event = Event.extend(event);

    var node = event.target, type = event.type,
     currentTarget = event.currentTarget;

    if (currentTarget && currentTarget.tagName) {
      if (type === 'load' || type === 'error' ||
        (type === 'click' && currentTarget.tagName.toLowerCase() === 'input'
          && currentTarget.type === 'radio'))
            node = currentTarget;
    }

    if (node.nodeType == Node.TEXT_NODE)
      node = node.parentNode;

    return Element.extend(node);
  }

  function findElement(event, expression) {
    var element = Event.element(event);

    if (!expression) return element;
    while (element) {
      if (Object.isElement(element) && Prototype.Selector.match(element, expression)) {
        return Element.extend(element);
      }
      element = element.parentNode;
    }
  }

  function pointer(event) {
    return { x: pointerX(event), y: pointerY(event) };
  }

  function pointerX(event) {
    var docElement = document.documentElement,
     body = document.body || { scrollLeft: 0 };

    return event.pageX || (event.clientX +
      (docElement.scrollLeft || body.scrollLeft) -
      (docElement.clientLeft || 0));
  }

  function pointerY(event) {
    var docElement = document.documentElement,
     body = document.body || { scrollTop: 0 };

    return  event.pageY || (event.clientY +
       (docElement.scrollTop || body.scrollTop) -
       (docElement.clientTop || 0));
  }


  function stop(event) {
    Event.extend(event);
    event.preventDefault();
    event.stopPropagation();

    event.stopped = true;
  }


  Event.Methods = {
    isLeftClick:   isLeftClick,
    isMiddleClick: isMiddleClick,
    isRightClick:  isRightClick,

    element:     element,
    findElement: findElement,

    pointer:  pointer,
    pointerX: pointerX,
    pointerY: pointerY,

    stop: stop
  };

  var methods = Object.keys(Event.Methods).inject({ }, function(m, name) {
    m[name] = Event.Methods[name].methodize();
    return m;
  });

  if (window.attachEvent) {
    function _relatedTarget(event) {
      var element;
      switch (event.type) {
        case 'mouseover':
        case 'mouseenter':
          element = event.fromElement;
          break;
        case 'mouseout':
        case 'mouseleave':
          element = event.toElement;
          break;
        default:
          return null;
      }
      return Element.extend(element);
    }

    var additionalMethods = {
      stopPropagation: function() { this.cancelBubble = true },
      preventDefault:  function() { this.returnValue = false },
      inspect: function() { return '[object Event]' }
    };

    Event.extend = function(event, element) {
      if (!event) return false;

      if (!isIELegacyEvent(event)) return event;

      if (event._extendedByPrototype) return event;
      event._extendedByPrototype = Prototype.emptyFunction;

      var pointer = Event.pointer(event);

      Object.extend(event, {
        target: event.srcElement || element,
        relatedTarget: _relatedTarget(event),
        pageX:  pointer.x,
        pageY:  pointer.y
      });

      Object.extend(event, methods);
      Object.extend(event, additionalMethods);

      return event;
    };
  } else {
    Event.extend = Prototype.K;
  }

  if (window.addEventListener) {
    Event.prototype = window.Event.prototype || document.createEvent('HTMLEvents').__proto__;
    Object.extend(Event.prototype, methods);
  }

  function _createResponder(element, eventName, handler) {
    var registry = Element.retrieve(element, 'prototype_event_registry');

    if (Object.isUndefined(registry)) {
      CACHE.push(element);
      registry = Element.retrieve(element, 'prototype_event_registry', $H());
    }

    var respondersForEvent = registry.get(eventName);
    if (Object.isUndefined(respondersForEvent)) {
      respondersForEvent = [];
      registry.set(eventName, respondersForEvent);
    }

    if (respondersForEvent.pluck('handler').include(handler)) return false;

    var responder;
    if (eventName.include(":")) {
      responder = function(event) {
        if (Object.isUndefined(event.eventName))
          return false;

        if (event.eventName !== eventName)
          return false;

        Event.extend(event, element);
        handler.call(element, event);
      };
    } else {
      if (!MOUSEENTER_MOUSELEAVE_EVENTS_SUPPORTED &&
       (eventName === "mouseenter" || eventName === "mouseleave")) {
        if (eventName === "mouseenter" || eventName === "mouseleave") {
          responder = function(event) {
            Event.extend(event, element);

            var parent = event.relatedTarget;
            while (parent && parent !== element) {
              try { parent = parent.parentNode; }
              catch(e) { parent = element; }
            }

            if (parent === element) return;

            handler.call(element, event);
          };
        }
      } else {
        responder = function(event) {
          Event.extend(event, element);
          handler.call(element, event);
        };
      }
    }

    responder.handler = handler;
    respondersForEvent.push(responder);
    return responder;
  }

  function _destroyCache() {
    for (var i = 0, length = CACHE.length; i < length; i++) {
      Event.stopObserving(CACHE[i]);
      CACHE[i] = null;
    }
  }

  var CACHE = [];

  if (Prototype.Browser.IE)
    window.attachEvent('onunload', _destroyCache);

  if (Prototype.Browser.WebKit)
    window.addEventListener('unload', Prototype.emptyFunction, false);


  var _getDOMEventName = Prototype.K,
      translations = { mouseenter: "mouseover", mouseleave: "mouseout" };

  if (!MOUSEENTER_MOUSELEAVE_EVENTS_SUPPORTED) {
    _getDOMEventName = function(eventName) {
      return (translations[eventName] || eventName);
    };
  }

  function observe(element, eventName, handler) {
    element = p$(element);

    var responder = _createResponder(element, eventName, handler);

    if (!responder) return element;

    if (eventName.include(':')) {
      if (element.addEventListener)
        element.addEventListener("dataavailable", responder, false);
      else {
        element.attachEvent("ondataavailable", responder);
        element.attachEvent("onlosecapture", responder);
      }
    } else {
      var actualEventName = _getDOMEventName(eventName);

      if (element.addEventListener)
        element.addEventListener(actualEventName, responder, false);
      else
        element.attachEvent("on" + actualEventName, responder);
    }

    return element;
  }

  function stopObserving(element, eventName, handler) {
    element = p$(element);

    var registry = Element.retrieve(element, 'prototype_event_registry');
    if (!registry) return element;

    if (!eventName) {
      registry.each( function(pair) {
        var eventName = pair.key;
        stopObserving(element, eventName);
      });
      return element;
    }

    var responders = registry.get(eventName);
    if (!responders) return element;

    if (!handler) {
      responders.each(function(r) {
        stopObserving(element, eventName, r.handler);
      });
      return element;
    }

    var i = responders.length, responder;
    while (i--) {
      if (responders[i].handler === handler) {
        responder = responders[i];
        break;
      }
    }
    if (!responder) return element;

    if (eventName.include(':')) {
      if (element.removeEventListener)
        element.removeEventListener("dataavailable", responder, false);
      else {
        element.detachEvent("ondataavailable", responder);
        element.detachEvent("onlosecapture", responder);
      }
    } else {
      var actualEventName = _getDOMEventName(eventName);
      if (element.removeEventListener)
        element.removeEventListener(actualEventName, responder, false);
      else
        element.detachEvent('on' + actualEventName, responder);
    }

    registry.set(eventName, responders.without(responder));

    return element;
  }

  function fire(element, eventName, memo, bubble) {
    element = p$(element);

    if (Object.isUndefined(bubble))
      bubble = true;

    if (element == document && document.createEvent && !element.dispatchEvent)
      element = document.documentElement;

    var event;
    if (document.createEvent) {
      event = document.createEvent('HTMLEvents');
      event.initEvent('dataavailable', bubble, true);
    } else {
      event = document.createEventObject();
      event.eventType = bubble ? 'ondataavailable' : 'onlosecapture';
    }

    event.eventName = eventName;
    event.memo = memo || { };

    if (document.createEvent)
      element.dispatchEvent(event);
    else
      element.fireEvent(event.eventType, event);

    return Event.extend(event);
  }

  Event.Handler = Class.create({
    initialize: function(element, eventName, selector, callback) {
      this.element   = p$(element);
      this.eventName = eventName;
      this.selector  = selector;
      this.callback  = callback;
      this.handler   = this.handleEvent.bind(this);
    },

    start: function() {
      Event.observe(this.element, this.eventName, this.handler);
      return this;
    },

    stop: function() {
      Event.stopObserving(this.element, this.eventName, this.handler);
      return this;
    },

    handleEvent: function(event) {
      var element = Event.findElement(event, this.selector);
      if (element) this.callback.call(this.element, event, element);
    }
  });

  function on(element, eventName, selector, callback) {
    element = p$(element);
    if (Object.isFunction(selector) && Object.isUndefined(callback)) {
      callback = selector, selector = null;
    }

    return new Event.Handler(element, eventName, selector, callback).start();
  }

  Object.extend(Event, Event.Methods);

  Object.extend(Event, {
    fire:          fire,
    observe:       observe,
    stopObserving: stopObserving,
    on:            on
  });

  Element.addMethods({
    fire:          fire,

    observe:       observe,

    stopObserving: stopObserving,

    on:            on
  });

  Object.extend(document, {
    fire:          fire.methodize(),

    observe:       observe.methodize(),

    stopObserving: stopObserving.methodize(),

    on:            on.methodize(),

    loaded:        false
  });

  if (window.Event) Object.extend(window.Event, Event);
  else window.Event = Event;
})();

(function() {
  /* Support for the DOMContentLoaded event is based on work by Dan Webb,
     Matthias Miller, Dean Edwards, John Resig, and Diego Perini. */

  var timer;

  function fireContentLoadedEvent() {
    if (document.loaded) return;
    if (timer) window.clearTimeout(timer);
    document.loaded = true;
    document.fire('dom:loaded');
  }

  function checkReadyState() {
    if (document.readyState === 'complete') {
      document.stopObserving('readystatechange', checkReadyState);
      fireContentLoadedEvent();
    }
  }

  function pollDoScroll() {
    try { document.documentElement.doScroll('left'); }
    catch(e) {
      timer = pollDoScroll.defer();
      return;
    }
    fireContentLoadedEvent();
  }

  if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', fireContentLoadedEvent, false);
  } else {
    document.observe('readystatechange', checkReadyState);
    if (window == top)
      timer = pollDoScroll.defer();
  }

  Event.observe(window, 'load', fireContentLoadedEvent);
})();

Element.addMethods();

/*------------------------------- DEPRECATED -------------------------------*/

Hash.toQueryString = Object.toQueryString;

var Toggle = { display: Element.toggle };

Element.Methods.childOf = Element.Methods.descendantOf;

var Insertion = {
  Before: function(element, content) {
    return Element.insert(element, {before:content});
  },

  Top: function(element, content) {
    return Element.insert(element, {top:content});
  },

  Bottom: function(element, content) {
    return Element.insert(element, {bottom:content});
  },

  After: function(element, content) {
    return Element.insert(element, {after:content});
  }
};

var $continue = new Error('"throw $continue" is deprecated, use "return" instead');

var Position = {
  includeScrollOffsets: false,

  prepare: function() {
    this.deltaX =  window.pageXOffset
                || document.documentElement.scrollLeft
                || document.body.scrollLeft
                || 0;
    this.deltaY =  window.pageYOffset
                || document.documentElement.scrollTop
                || document.body.scrollTop
                || 0;
  },

  within: function(element, x, y) {
    if (this.includeScrollOffsets)
      return this.withinIncludingScrolloffsets(element, x, y);
    this.xcomp = x;
    this.ycomp = y;
    this.offset = Element.cumulativeOffset(element);

    return (y >= this.offset[1] &&
            y <  this.offset[1] + element.offsetHeight &&
            x >= this.offset[0] &&
            x <  this.offset[0] + element.offsetWidth);
  },

  withinIncludingScrolloffsets: function(element, x, y) {
    var offsetcache = Element.cumulativeScrollOffset(element);

    this.xcomp = x + offsetcache[0] - this.deltaX;
    this.ycomp = y + offsetcache[1] - this.deltaY;
    this.offset = Element.cumulativeOffset(element);

    return (this.ycomp >= this.offset[1] &&
            this.ycomp <  this.offset[1] + element.offsetHeight &&
            this.xcomp >= this.offset[0] &&
            this.xcomp <  this.offset[0] + element.offsetWidth);
  },

  overlap: function(mode, element) {
    if (!mode) return 0;
    if (mode == 'vertical')
      return ((this.offset[1] + element.offsetHeight) - this.ycomp) /
        element.offsetHeight;
    if (mode == 'horizontal')
      return ((this.offset[0] + element.offsetWidth) - this.xcomp) /
        element.offsetWidth;
  },


  cumulativeOffset: Element.Methods.cumulativeOffset,

  positionedOffset: Element.Methods.positionedOffset,

  absolutize: function(element) {
    Position.prepare();
    return Element.absolutize(element);
  },

  relativize: function(element) {
    Position.prepare();
    return Element.relativize(element);
  },

  realOffset: Element.Methods.cumulativeScrollOffset,

  offsetParent: Element.Methods.getOffsetParent,

  page: Element.Methods.viewportOffset,

  clone: function(source, target, options) {
    options = options || { };
    return Element.clonePosition(target, source, options);
  }
};

/*--------------------------------------------------------------------------*/

if (!document.getElementsByClassName) document.getElementsByClassName = function(instanceMethods){
  function iter(name) {
    return name.blank() ? null : "[contains(concat(' ', @class, ' '), ' " + name + " ')]";
  }

  instanceMethods.getElementsByClassName = Prototype.BrowserFeatures.XPath ?
  function(element, className) {
    className = className.toString().strip();
    var cond = /\s/.test(className) ? $w(className).map(iter).join('') : iter(className);
    return cond ? document._getElementsByXPath('.//*' + cond, element) : [];
  } : function(element, className) {
    className = className.toString().strip();
    var elements = [], classNames = (/\s/.test(className) ? $w(className) : null);
    if (!classNames && !className) return elements;

    var nodes = p$(element).getElementsByTagName('*');
    className = ' ' + className + ' ';

    for (var i = 0, child, cn; child = nodes[i]; i++) {
      if (child.className && (cn = ' ' + child.className + ' ') && (cn.include(className) ||
          (classNames && classNames.all(function(name) {
            return !name.toString().blank() && cn.include(' ' + name + ' ');
          }))))
        elements.push(Element.extend(child));
    }
    return elements;
  };

  return function(className, parentElement) {
    return p$(parentElement || document.body).getElementsByClassName(className);
  };
}(Element.Methods);

/*--------------------------------------------------------------------------*/

Element.ClassNames = Class.create();
Element.ClassNames.prototype = {
  initialize: function(element) {
    this.element = p$(element);
  },

  _each: function(iterator) {
    this.element.className.split(/\s+/).select(function(name) {
      return name.length > 0;
    })._each(iterator);
  },

  set: function(className) {
    this.element.className = className;
  },

  add: function(classNameToAdd) {
    if (this.include(classNameToAdd)) return;
    this.set($A(this).concat(classNameToAdd).join(' '));
  },

  remove: function(classNameToRemove) {
    if (!this.include(classNameToRemove)) return;
    this.set($A(this).without(classNameToRemove).join(' '));
  },

  toString: function() {
    return $A(this).join(' ');
  }
};

Object.extend(Element.ClassNames.prototype, Enumerable);

/*--------------------------------------------------------------------------*/

(function() {
  window.Selector = Class.create({
    initialize: function(expression) {
      this.expression = expression.strip();
    },

    findElements: function(rootElement) {
      return Prototype.Selector.select(this.expression, rootElement);
    },

    match: function(element) {
      return Prototype.Selector.match(element, this.expression);
    },

    toString: function() {
      return this.expression;
    },

    inspect: function() {
      return "#<Selector: " + this.expression + ">";
    }
  });

  Object.extend(Selector, {
    matchElements: function(elements, expression) {
      var match = Prototype.Selector.match,
          results = [];

      for (var i = 0, length = elements.length; i < length; i++) {
        var element = elements[i];
        if (match(element, expression)) {
          results.push(Element.extend(element));
        }
      }
      return results;
    },

    findElement: function(elements, expression, index) {
      index = index || 0;
      var matchIndex = 0, element;
      for (var i = 0, length = elements.length; i < length; i++) {
        element = elements[i];
        if (Prototype.Selector.match(element, expression) && index === matchIndex++) {
          return Element.extend(element);
        }
      }
    },

    findChildElements: function(element, expressions) {
      var selector = expressions.toArray().join(', ');
      return Prototype.Selector.select(selector, element || document);
    }
  });
})();
function scBrowser() {
  this.isIE = false;
  var ua = navigator.userAgent.toLowerCase();
  this.isChrome = ua.indexOf('chrome') >= 0;
  this.isWebkit = ua.indexOf('applewebkit/') > -1;
  this.isSafari = this.isWebkit && !this.isChrome;
  this.isFirefox = ua.indexOf('gecko') > -1 && ua.indexOf('khtml') === -1;
  this.onPopupClosed = null;
}

scBrowser.prototype.initialize = function() {
  /* excess in content editor - see if we need this in other apps */
  this.attachEvent(document.body, "onclick", function() { scGeckoActivate(); scGeckoClosePopups("body onclick"); });
  this.attachEvent(document.body, "ondblclick", function() { scGeckoClosePopups("body ondblclick"); });
  this.attachEvent(document.body, "oncontextmenu", function() { scGeckoClosePopups("body oncontextmenu"); });
  this.adjustFillParentElements();
  this.initializeFixsizeElements();
  this.fixSafariModalDialogs();
  this.scInitializeIEFocusKeeper();
  Event.observe(window, "resize", function () { setTimeout(scForm.browser.resizeFixsizeElements.bind(scForm.browser), 1); });
};

scBrowser.prototype.attachEvent = function(object, eventName, method) {
  eventName = eventName.replace(/^on/, "");
  var isWrapperNeeded = !this.isWebkit && !Prototype.Browser.IE;
  method._eventHandler = function(evt) {
    if (isWrapperNeeded) {
      try {
        window.event = evt;
      } catch (e) { }
    }
    return method();
  };

  Event.observe(object, eventName, method._eventHandler, false);
};

scBrowser.prototype.detachEvent = function(object, eventName, method) {
  eventName = eventName.replace(/on/, "");

  if (typeof(method._eventHandler) == "function") {
    Event.stopObserving(object, eventName, method._eventHandler, false);
  } else {
    Event.stopObserving(object, eventName, method, true);
  }
};

scBrowser.prototype.clearEvent = function(evt, cancelBubble, returnValue, keyCode) {
  if (evt != null) {
    if (cancelBubble == true) {
      if (evt.stopPropagation != null) {
        evt.stopPropagation();
      } else {
        evt.cancelBubble = true;
      }
    }
    if (returnValue == false) {
      if (evt.preventDefault != null) {
        evt.preventDefault();
      } else {
        evt.returnValue = false;
      }
    }
  }
  // ignore keycode
};

scBrowser.prototype.closePopups = function (reason, exclusions) {
  if (window.top && window.top.popups != null) {
    if (reason == "mainWindowBlur") {
      return;
    }

    for (var n = 0; n < window.top.popups.length; n++) {
      if (exclusions && exclusions.indexOf(window.top.popups[n]) >= 0) {
        continue;
      }

      var ctl = $(window.top.popups[n]);
      if (ctl) {
          try {
        var id = ctl.getAttribute('data-openerId');
        var opener = document.getElementById(id) || top.document.getElementById(id);
        Element.removeClassName(opener, 'scPopupOpener');
              ctl.remove();
          } catch (ex) {
              try {
                  if (ctl.parentNode != undefined) 
                      ctl.parentNode.removeChild(ctl);
                  
              } catch (e) {
                  /*eat up any further exceptions */
              }
          }
      }
    }
  }

  if (window.top) {
    window.top.popups = exclusions ? $$(".scPopup") : null;
    if (this.onPopupClosed) {
      this.onPopupClosed.call(this, reason);
    }
  }
};

scBrowser.prototype.createHttpRequest = function() {
  return new XMLHttpRequest();
};

scBrowser.prototype.getControl = function(id, doc) {
  return (doc || document).getElementById(id);
};

scBrowser.prototype.getEnumerator = function(collection) {
  return new scGeckoEnumerator(collection);
};

scBrowser.prototype.getFrameElement = function(win) {
  return (win || window).frameElement;
};

scBrowser.prototype.getImageSrc = function(img) {
  return img.src;
};

scBrowser.prototype.getChildren = function (ctl) {
  var childNodes = ctl.childNodes;
  var children = new Array();

  for (var i = childNodes.length - 1; i >= 0; i--) {
    var childNode = childNodes[i];
    if (childNode.nodeType == 1) {
      children.push(childNode);
    }
  }
  
  return children;
};

scBrowser.prototype.getVisibleChildren = function (ctl) {
  var children = scForm.browser.getChildren(ctl);
  var visibleChildren = new Array();
  
  for (var i = children.length - 1; i >= 0; i--) {
    var child = children[i];
    if (child.getStyle("display") != "none") {
      visibleChildren.push(child);
    }
  }

  return visibleChildren;
};

scBrowser.prototype.getMouseButton = function(evt) {
  return 1;
};

scBrowser.prototype.getNextSibling = function(ctl) {
  ctl = ctl.nextSibling;

  while (ctl != null && ctl.nodeType != 1) {
    ctl = ctl.nextSibling;
  }

  return ctl;
};

scBrowser.prototype.getOffset = function(evt) {
  var result = new Object();

  result.x = evt.pageX != null ? evt.pageX : 0;
  result.y = evt.pageY != null ? evt.pageY : 0;

  return result;
};

scBrowser.prototype.getOuterHtml = function(control) {
  var attr;
  var attrs = control.attributes;
  var str = "<" + control.tagName;

  for (var i = 0; i < attrs.length; i++) {
    attr = attrs[i];
    if (attr.specified) {
      str += " " + attr.name + '="' + attr.value + '"';
    }
  }

  switch (control.tagName) {
  case "AREA":
  case "BASE":
  case "BASEFONT":
  case "COL":
  case "FRAME":
  case "HR":
  case "IMG":
  case "BR":
  case "INPUT":
  case "ISINDEX":
  case "LINK":
  case "META":
  case "PARAM":
    return str + ">";
  }

  return str + ">" + control.innerHTML + "</" + control.tagName + ">";
};

scBrowser.prototype.getParentWindow = function(doc) {
  var result = doc.contentWindow || doc.parentWindow;

  if (result == null) {
    result = doc.defaultView;
  }

  return result;
};

scBrowser.prototype.getPreviousSibling = function(ctl) {
  ctl = ctl.previousSibling;

  while (ctl != null && ctl.nodeType != 1) {
    ctl = ctl.previousSibling;
  }

  return ctl;
};

scBrowser.prototype.getSrcElement = function (evt) {
  try {
    return evt.target || evt.srcElement;
  }
  catch (e) {
    return null;
  }
};

scBrowser.prototype.getTableRows = function(table) {
  var result = [];

  for (var n = 0; n < table.childNodes.length; n++) {
    var ctl = table.childNodes[n];

    if (ctl.tagName == "TR") {
      result.push(ctl);
    } else if (ctl.tagName == "TBODY") {
      for (var i = 0; i < ctl.childNodes.length; i++) {
        var c = ctl.childNodes[i];

        if (c.tagName == "TR") {
          result.push(c);
        }
      }
    }
  }

  return result;
};

scBrowser.prototype.insertAdjacentHTML = function(control, where, html) {
  control.insertAdjacentHTML(where, html);
};

scBrowser.prototype.releaseCapture = function (control) {
  if (document.documentMode == 8) {
    control.releaseCapture();
  } else {
    scGeckoCapturedControl = null;
    scGeckoCaptureFunction = null;
    this.releaseCaptureWindow(window);
  }
};

scBrowser.prototype.releaseCaptureWindow = function(win) {
  //we need try\catch because we might not have access to frames running in some other domains or frames with silverlight applications loaded.
  try {
    win.document.onclick = win.scGeckoDocumentClick;
    win.document.onmousedown = win.scGeckoDocumentMouseDown;
    win.document.onmousemove = win.scGeckoDocumentMouseMove;
    win.document.onmouseup = win.scGeckoDocumentMouseUp;
  } catch(err) {
  }

  for (var n = 0; n < win.frames.length; n++) {
    this.releaseCaptureWindow(win.frames[n]);
  }
};

scBrowser.prototype.scrollIntoView = function(control) {
  control.scrollIntoView();
};

scBrowser.prototype.setCapture = function (control, func) {
  if (document.documentMode == 8) {
    control.setCapture();
  } else {
    scGeckoCapturedControl = control;
    scGeckoCaptureFunction = func;
    this.setCaptureWindow(window, control);
  }
};

scBrowser.prototype.setCaptureWindow = function(win, control) {
  //we need try\catch because we might not have access to frames running in some other domains or loading silverlight applications in a frame.
  try {
    win.scGeckoDocumentClick = win.document.onclick;
    win.scGeckoDocumentMouseDown = win.document.onmousedown;
    win.scGeckoDocumentMouseMove = win.document.onmousemove;
    win.scGeckoDocumentMouseUp = win.document.onmouseup;

    this.getAllDocuments(top).each(function(doc) {
      doc.onclick = scGeckoDispatchCapturedEvent;
      doc.onmousedown = scGeckoDispatchCapturedEvent;
      doc.onmousemove = scGeckoDispatchCapturedEvent;
      doc.onmouseup = scGeckoDispatchCapturedEvent;
    });
  } catch(err) {
  }

  for (var n = 0; n < win.frames.length; n++) {
    this.setCaptureWindow(win.frames[n], control);
  }
};

scBrowser.prototype.removeChild = function(tag) {
  if (tag.parentNode != null) {
    tag.parentNode.removeChild(tag);
  }
};

scBrowser.prototype.setImageSrc = function(img, src) {
  img.src = src;
};

scBrowser.prototype.setOuterHtml = function(control, html) {
  if (Prototype.Browser.IE) {
    if (control.tagName == "TR") {
      var container = control.ownerDocument.createElement("div");

      container.innerHTML = "<table>" + html + "</table>";

      var row = container.childNodes[0].rows[0];

      control.parentNode.replaceChild(row, control);
    } else {
      control.outerHTML = html;
    }
  } else {
    var range = control.ownerDocument.createRange();

    range.setStartBefore(control);

    var fragment = range.createContextualFragment(html);

    control.parentNode.replaceChild(fragment, control);
  }
};

scBrowser.prototype.showPopup = function(data) {
  var id = data.id;

  var evt = (scForm.lastEvent != null ? scForm.lastEvent : event);

  this.clearEvent(evt, true, false);

  var doc = document;
  var srcElement = this.getSrcElement(scForm.lastEvent);
  if (scForm.lastEvent != null && srcElement != null) {
    doc = srcElement.ownerDocument;
  }

  var popup = document.createElement("div");

  popup.className = "scPopup" ;
  popup.style.position = "absolute";
  popup.style.left = "0px";
  popup.style.top = "0px";
  popup.onBlur = "scForm.browser.removeChild(this.parentNode)";
  var self = this;
  this.attachEvent(popup, "onclick", function (evtArg) {
    Event.stop(evtArg || window.event);
    self.closePopups(null, [popup]);
  });

  this.attachEvent(popup, "ondblclick", function (evtArg) {
    Event.stop(evtArg || window.event);
    self.closePopups(null, [popup]);
  });

  var html = "";

  if (typeof(data.value) == "string") {
    html = data.value;
  } else {
    html = this.getOuterHtml(data.value);

    var p = html.indexOf(">");
    if (p > 0) {
      html = html.substring(0, p).replace(/display[\s]*\:[\s]*none/gi, "") + html.substr(p);
      html = html.substring(0, p).replace(/position[\s]*\:[\s]*absolute/gi, "") + html.substr(p);
    }
  }

   
  popup.innerHTML = html;

  var form = $$("form")[0];
  if (!form) {
      return;
  }
  form.appendChild(popup);
  // popupTrapper.appendChild(popup);
    
  var width = popup.offsetWidth;
  var height = popup.offsetHeight;

  var x = evt.clientX != null ? evt.clientX : 0;
  var y = evt.clientY != null ? evt.clientY : 0;

  if (id) {
    try {
      // exception occurs in case if id contains parentheses
      var nodes = (doc || document).querySelectorAll('#' + id);
    } catch (e) {
      nodes = (doc || document).getElementById(id);
    }

    var ctl = nodes.length ? nodes[nodes.length - 1] : nodes;

    if (ctl != null) {
      ctl = $(ctl);

      Element.addClassName(ctl, 'scPopupOpener');

      var dimensions = ctl.getDimensions();

      if (dimensions.width > 0) {
        switch (data.where) {
        case "contextmenu":
          x = evt.pageX || evt.x;
          y = evt.pageY || evt.y;
          break;
        case "left":
          x = -width;
          y = 0;
          break;
        case "right":
          x = dimensions.width - 3;
          y = 0;
          break;
        case "above":
          x = 0;
          y = -height;
          break;
        case "below-right":
          x = dimensions.width - width;
          y = dimensions.height;
          break;
        case "dropdown":
          x = 0;
          y = dimensions.height;
          width = dimensions.width;
          break;
        default:
          x = 0;
          y = dimensions.height;
        }

        if (data.where != "contextmenu"){
          var vp = ctl.viewportOffset();
          x += vp.left;
          y += vp.top;
        }
      }
    }
  }

  var viewport = document.body;
  if (viewport.clientHeight == 0) {
  
    if (form && form.clientHeight > 0) {
      viewport = form;
    }
  }

  if (x + width > viewport.clientWidth) {
    x = document.body.clientWidth - width;
  }
  if (y + height > viewport.clientHeight) {
    y = viewport.clientHeight - height;
  }
  if (x < 0) {
    x = 0;
  }
  if (y < 0) {
    y = 0;
  }

  if (height > viewport.clientHeight) {
    height = viewport.clientHeight;
    var scrolWidth = getScrollBarWidth();
    width += scrolWidth;
    x -= scrolWidth;
    popup.style.overflow = "auto";
  }

  if (height < 10) {
    popup.style.display = "none";
  }

  popup.style.width = "" + width + "px";
  popup.style.maxHeight = "" + height + "px";
  popup.style.top = "" + y + "px";
  popup.style.left = "" + x + "px";
  popup.style.zIndex = (window.top.popups == null ? 1000 : 1000 + window.top.popups.length);

  popup.setAttribute('data-openerId', id);

  if (window.top.popups != null) {
    window.top.popups.push(popup);
  } else {
    window.top.popups = new Array(popup);
  }

  var parentPopup = this.findParentPopup(evt);
  if (parentPopup) {
    popup.scParentPopup = parentPopup;

    var exclusions = new Array();
    var iterator = popup;

    while (iterator) {
      exclusions.push(iterator);
      iterator = $(iterator.scParentPopup);
    }
  }

  this.closePopups("show popup", exclusions || [popup]);
  popup.id = "Popup" + (window.top.popups ? window.top.popups.length : 0);

  scForm.focus(popup);
};

scBrowser.prototype.findParentPopup = function(evt) {
  var srcElement = this.getSrcElement(evt);
  if (!window.top.popups || !evt || !srcElement || !srcElement.descendantOf) {
    return null;
  }

  var target = srcElement;

  return window.top.popups.find(function(popup) { return target.descendantOf(popup); });
};

scBrowser.prototype.swapNode = function(control, withControl) {
  var parent = control.parentNode;

  var clone = control.cloneNode(true);

  withControl = parent.replaceChild(clone, withControl);

  parent.replaceChild(withControl, control);
  parent.replaceChild(control, clone);
};

/* Hacky fix "Characters entered twice in form field in modal dialog under safari 5.1" https://discussions.apple.com/thread/3336946?start=0&tstart=0 */
scBrowser.prototype.fixSafariModalDialogs = function () {
  var ua = navigator.userAgent.toLowerCase();
  if (this.isSafari && window.dialogArguments && ua.indexOf('version/5.1') > -1 && ua.indexOf('windows') > -1) {
    $A(this.getAllDocuments(window)).each(function (element) {
      element.body.onkeydown = function (event) {
        switch (event.keyCode) {
          case 8:  // Backspace
          case 33: // Page up
          case 34: // Page down
          case 35: // End
          case 36: // Home
          case 37: // Left
          case 38: // Up
          case 39: // Rigth
          case 40: // Down
          case 46: // Del
          case 9:  // Tab
            return true;
          default:
            if (!event.ctrlKey) return false;
        }
        
        return true;
      };
    });
  }
};

scBrowser.prototype.scInitializeIEFocusKeeper = function() {
  if (navigator.userAgent.indexOf('Trident') > 0 && !top.document.getElementById('scIEFocusKeeper')) {
    Element.insert(top.document.body, { bottom: '<input id="scIEFocusKeeper" type="text" style="position:absolute;width:0px;height:0px;top:-1px;opacity:0;" />' });
  }
};

scBrowser.prototype.getAllDocuments = function(win) {
  var result = [win.document];
  for (var i = 0; i < win.frames.length; i++) {
    result = result.concat(this.getAllDocuments(win.frames[i].window));
  }
  return result;
};

/* Hacky fix of FF problems with table layout and td height=100%. Does not work with hidden elements.*/
scBrowser.prototype.adjustFillParentElements = function() {
  if (this.isFirefox) {
    setTimeout(function() {
      try {
        var elements = $$(".scFillParent");
        elements.each(function(el) {
          el.addClassName("scTmpCalculateSize");

          // If 'el' parent element is not shown now then its offsetHeight is 0. It would be nice to fix this limitation.
          el.setStyle({ height: el.parentNode.offsetHeight + "px" });
          el.removeClassName("scTmpCalculateSize");
        });
      } catch(e) {
        if (window.console) {
          window.console.log("Failed to stretch element to fill its parent height.");
        }
      }
    }, 1);
  }
};

/* fixsize elements */
scBrowser.prototype.initializeFixsizeElements = function(preserveFixSize) {
  this.fixsizeElements = $$(".scFixSize").concat($$(".scFixSizeInitialized"));
  var form = $$("form")[0];

  this.fixsizeElements.each(function(element) {
    if (Prototype.Browser.IE && element.parentNode != null && scForm.browser.getVisibleChildren(element.parentNode).length == 1) {
      scForm.browser.preProcessFixSizeElementIE(element);
    }
  });

  this.fixsizeElements.each(function (element) {
    if (Prototype.Browser.IE && element.needsProcessing) {
      scForm.browser.postProcessFixSizeElementIE(element);
      element.removeClassName("scFixSize").addClassName("scFixSizeInitialized");
    } else {
      var scrollTop = element.scrollTop;
      var scrollLeft = element.scrollLeft;

      element.addClassName("scFixSize");
      element.setStyle({ height: "100%" });

      var elementHeight = element.getHeight();
      if (elementHeight == 0) {
          if (!preserveFixSize && !element.hasClassName("scKeepFixSize")) {
              element.removeClassName("scFixSize");
          }
          return;
      }

      var padding = element.getStyle("padding");
      if (padding != null && padding != "") {
          var result = padding.match(/[0-9]+/gi);
          if (result != null && result.length == 4) {
              elementHeight -= parseInt(result[0], 10) + parseInt(result[2], 10);
          }
      }

      var borderWidth = element.getStyle("border-width");
      var border = element.getStyle("border-style");
      if (border != "none none none none" && borderWidth != null && borderWidth != "" && border != "none") {
          elementHeight -= 2;
      }

      if (element.hasClassName("scFixSize4")) {
          elementHeight -= 4;
      }
      if (element.hasClassName("scFixSize8")) {
          elementHeight -= 8;
      }
      if (element.hasClassName("scFixSize12")) {
          elementHeight -= 12;
      }
      if (element.hasClassName("scFixSize20")) {
          elementHeight -= 20;
      }

      element.scHeightAdjustment = form.getHeight() - elementHeight;
      element.setStyle({ height: elementHeight + "px" });

      element.removeClassName("scFixSize").addClassName("scFixSizeInitialized");

      element.scrollTop = scrollTop;
      element.scrollLeft = scrollLeft;
    }
  });

  if (this.onInitializeElementComplete) {
    for (var k = 0; k < this.onInitializeElementComplete.length; k++) {
      this.onInitializeElementComplete[k]();
    }
  }
};

scBrowser.prototype.resizeFixsizeElements = function() {
  var form = $$("form")[0];
  if (!form) {
    return;
  }

  this.fixsizeElements.each(function (element) {
    if (Prototype.Browser.IE && element.parentNode != null && scForm.browser.getVisibleChildren(element.parentNode).length == 1) {
      scForm.browser.preProcessFixSizeElementIE(element);
    } else {
      if (!element.hasClassName('scFixSizeNested')) {
        element.setStyle({ height: '100%' });
      }
    }
  });

  var maxHeight = 0;
  var formChilds = form.childNodes;

  for (var i = 0; i != formChilds.length; i++) {
    var elementHeight = formChilds[i].offsetHeight;
    if (elementHeight > maxHeight) {
      maxHeight = elementHeight;
    }
  }

  var formHeight = form.offsetHeight;

  this.fixsizeElements.each(function (element) {
    if (Prototype.Browser.IE && element.needsProcessing) {
      scForm.browser.postProcessFixSizeElementIE(element);
    } else {
      var height = element.hasClassName('scFixSizeNested')
        ? (form.getHeight() - element.scHeightAdjustment) + 'px'
        : (element.offsetHeight - (maxHeight - formHeight)) + 'px';
      element.setStyle({ height: height });
    }
  });

  /* trigger re-layouting to fix the firefox bug: table is not shrinking itself down on resize */
  scGeckoRelayout();
};

scBrowser.prototype.preProcessFixSizeElementIE = function(element) {
  element.originalHeight = element.getHeight();
  element.originalDisplay = element.getStyle("display");
  element.setStyle({ display: "none" });
  element.originalParentHeight = element.parentNode.offsetHeight;
  element.needsProcessing = true;
};

scBrowser.prototype.postProcessFixSizeElementIE = function (element) {
  if (element.originalDisplay != "none") {
    if (element.originalHeight != element.originalParentHeight && element.originalParentHeight > 0) {
      
      element.setStyle({ height: element.originalParentHeight + "px" });
    }
    element.setStyle({ display: element.originalDisplay });
  }
  element.needsProcessing = false;
};

scBrowser.prototype.shouldKeyPressBeCleared = function(evt) {
  if (navigator.userAgent.indexOf('Firefox') < 0) {
    return true;
  }

  if (evt.ctrlKey && (evt.keyCode == 83 || evt.charCode == 115)) { // Ctrl + S should be cleared
    return true;
  }

  return false;
};

scBrowser.prototype.onInitializeElementComplete = [];
scBrowser.prototype.subscribeToInitializeElementCompleteEvent = function(delegate) {
  if (!delegate) {
    return;
  }

  if (!scBrowser.prototype.onInitializeElementComplete) {
    scBrowser.prototype.onInitializeElementComplete = [];
  }

  scBrowser.prototype.onInitializeElementComplete[scBrowser.prototype.onInitializeElementComplete.length] = delegate;
};

function scGeckoEnumerator(collection) {
  this.m_collection = collection;
  this.m_current = 0;
}

scGeckoEnumerator.prototype.atEnd = function() {
  return (this.m_collection == null) || (this.m_current >= this.m_collection.length);
};

scGeckoEnumerator.prototype.item = function() {
  return this.m_collection[this.m_current];
};

scGeckoEnumerator.prototype.moveNext = function() {
  this.m_current++;
};

scGeckoEnumerator.prototype.moveFirst = function() {
  this.m_current = 0;
};

var scGeckoCapturedControl = null;
var scGeckoCapturedEventExecuting = false;
var scGeckoCaptureFunction = null;

function scGeckoDispatchCapturedEvent(evt) {
  if (window && window.scGeckoCapturedControl && !scGeckoCapturedEventExecuting) {
    scGeckoCapturedEventExecuting = true;

    try {
      if (scGeckoCaptureFunction != null) {
        scGeckoCaptureFunction(scGeckoCapturedControl, evt);
      } else {
        var scGeckoEvent = document.createEvent('MouseEvents');
        scGeckoEvent.initMouseEvent(evt.type, true, true, window, 0, evt.screenX, evt.screenY, evt.clientX, evt.clientY, false, false, false, false, 0, null);
        scGeckoCapturedControl.dispatchEvent(scGeckoEvent);
      }
    } finally {
      scGeckoCapturedEventExecuting = false;
    }

    evt.stopPropagation();
    evt.preventDefault();

    return false;
  }
}

function scGeckoClosePopups(reason) {
  scForm.browser.closePopups(reason || "geckoClosePopups");
}

function scGeckoActivate() {
  var win = window;

  while (win && !win.scWin) {
    if (win == win.parent) {
      break;
    }

    win = win.parent;
  }

  if (win && win.scWin && win.scWin.activate) {
    win.scWin.activate();
  }
}

function scGeckoRelayout() {
  var form = $$("form")[0];

  /* trigger re-layouting to fix the firefox bug: table is not shrinking itself down on resize */
  form.setStyle({ opacity: "0.999" });

  setTimeout(function() {
    form.setStyle({ opacity: "1" });
  }, 100);
}

function getScrollBarWidth() {
  var inner = document.createElement('p');
  inner.style.width = "100%";
  inner.style.height = "200px";

  var outer = document.createElement('div');
  outer.style.position = "absolute";
  outer.style.top = "0px";
  outer.style.left = "0px";
  outer.style.visibility = "hidden";
  outer.style.width = "200px";
  outer.style.height = "150px";
  outer.style.overflow = "hidden";
  outer.appendChild(inner);

  document.body.appendChild(outer);
  var w1 = inner.offsetWidth;
  outer.style.overflow = 'scroll';
  var w2 = inner.offsetWidth;
  if (w1 == w2) w2 = outer.clientWidth;

  document.body.removeChild(outer);

  return (w1 - w2);
}function scSitecore() {
  this.cache = {};
  this.requests = [];
  this.contextmenu = "";
  this.dragMouseDown = null;
  this.frameName = null;
  this.modified = false;
  this.modifiedItems = {};
  this.modifiedHandlingEnabled = false;
  this.source = null;
  this.keymap = {};
  this.dictionary = {};
  this.suspended = {};
  this.uniqueID = 0;
  this.state = {};
  this.scrollPositions = {};
  this.browser = new scBrowser();

  this.browser.attachEvent(window, "onload", function (evt) { if (scForm != null) { scForm.onLoad(); } });
  this.browser.attachEvent(window, "onunload", function (evt) { if (scForm != null) scForm.onUnload(evt ? evt : window.event); });
  this.browser.attachEvent(window, "onblur", function (evt) { if (scForm != null) scForm.onBlur(evt ? evt : window.event); });
}

scSitecore.prototype.initializeModalDialogs = function () {
  if (!top.scIsDialogsInitialized) {
    top.scIsDialogsInitialized = true;

    var jqueryModalDialogsFrame = top.document.createElement("iframe");
    jqueryModalDialogsFrame.setAttribute("frameborder", "0");
    jqueryModalDialogsFrame.setAttribute("allowTransparency", "true");
    jqueryModalDialogsFrame.setAttribute("id", "jqueryModalDialogsFrame");
    jqueryModalDialogsFrame.setAttribute("src", "/sitecore/shell/Controls/JqueryModalDialogs.html");
    jqueryModalDialogsFrame.setAttribute("style", "position: fixed; left: 0; right: 0; top: 0; bottom: 0; width: 100%; height: 100%; z-index: -1; margin: 0; padding: 0; border-width: 0; overflow: hidden");
    top.document.body.appendChild(jqueryModalDialogsFrame);

    if (!top.scForm) {
      top.scForm = { getTopModalDialog: window.scForm.getTopModalDialog, keymap: this.keymap, translate: this.translate };
    }
  }
};

scSitecore.prototype.showModalDialog = function (url, dialogArguments, features, request, dialogClosedCallback) {

  var jqueryModalDialogsFrame = top.document.getElementById("jqueryModalDialogsFrame");
  if (jqueryModalDialogsFrame && jqueryModalDialogsFrame.contentWindow) {
    jqueryModalDialogsFrame.contentWindow.showModalDialog(url, dialogArguments, features, request, this.modifiedHandling, window, dialogClosedCallback);
  }
};

scSitecore.prototype.setDialogDimension = function (width, height) {
  var jqueryModalDialogsFrame = top.document.getElementById("jqueryModalDialogsFrame");
  if (jqueryModalDialogsFrame && jqueryModalDialogsFrame.contentWindow) {
    jqueryModalDialogsFrame.contentWindow.setDialogDimension(width, height);
  }
};

scSitecore.prototype.hideCloseButton = function () {
  top._scDialogs[0] && top._scDialogs[0].contentIframe.dialog('widget').addClass('no-close');
};

scSitecore.prototype.showCloseButton = function () {
  top._scDialogs[0] && top._scDialogs[0].contentIframe.dialog('widget').removeClass('no-close');
};

scSitecore.prototype.hideDialogTitlebarButtons = function () {
  top._scDialogs[0] && top._scDialogs[0].contentIframe.dialog('widget').addClass('no-close no-maximize no-restore');
};

scSitecore.prototype.showDialogTitlebarButtons = function () {
  top._scDialogs[0] && top._scDialogs[0].contentIframe.dialog('widget').removeClass('no-close no-maximize no-restore');
};

scSitecore.prototype.getTopModalDialog = function () {
  return top._scDialogs[0] && top._scDialogs[0].contentIframe[0].contentWindow;
};

/**
 * @deprecated It fails for multiple dialogs, Please use getDialogArgumentsForCurrentFrame() instead
 */
scSitecore.prototype.getDialogArguments = function () {
    return top._scDialogs[0] && top._scDialogs[0].dialogArguments;
}

scSitecore.prototype.getDialogArgumentsForCurrentFrame = function () {
    return this.getDialogArgumentsByFrameId(window.frameElement.id);
}

scSitecore.prototype.getDialogArgumentsByFrameId = function (frameId) {
    for (var i = 0; i < top._scDialogs.length; i++) {
        if (frameId == top._scDialogs[i].contentIframe[0].id)
            return top._scDialogs[i] && top._scDialogs[i].dialogArguments;
    }

    return top._scDialogs[0] && top._scDialogs[0].dialogArguments;
}



scSitecore.prototype.autoIncreaseModalDialogHeight = function (element, contextWindow, extraCalling) {
  contextWindow = contextWindow || window;
  var contextDocument = contextWindow.document;
  element = element || contextDocument.querySelector('.scDialogContentContainer');
  if (!element) {
    return;
  }

  var heightDelta = element.scrollHeight - element.clientHeight;
  if (heightDelta > 0) {
    var initialDialogHeight = this.getViewPortSize(contextWindow).height;
    var maxDialogHeight = this.getViewPortSize(top).height - 80;

    var bottomDialogContentContainerPadding = 15;
    var newHeight = initialDialogHeight + heightDelta + bottomDialogContentContainerPadding;

    scForm.setDialogDimension(null, newHeight < maxDialogHeight ? newHeight : maxDialogHeight);
    if (contextWindow.Flexie) {
      contextWindow.Flexie.updateInstance();
    }

    // Extra calling is necessary in case if dialog height initially was very small
    if (!extraCalling) {
      this.autoIncreaseModalDialogHeight(element, contextWindow, true);
    }
  }
}

scSitecore.prototype.enableModifiedHandling = function(beforeUnloadCallback) {
  this.modifiedHandlingEnabled = true;
  window.scBeforeUnload = function () { };
  if (beforeUnloadCallback) window.onbeforeunload = beforeUnloadCallback;
};

scSitecore.prototype.modifiedHandling = function () {
  return !this.modifiedHandlingEnabled || !top._scDialogs[0].modified || confirm(scForm.translate("There are unsaved changes. Are you sure you want to continue?"));
};

scSitecore.prototype.onBlur = function () {
  this.browser.closePopups("mainWindowBlur");
};

scSitecore.prototype.onKeyDown = function (evt) {
  evt = (evt != null ? evt : window.event);

  if (evt != null) {
    if (evt.keyCode == 123 && evt.altKey && evt.shiftKey && evt.ctrlKey) {
      return window.open().document.open('text/plain').write(document.documentElement.outerHTML);
    }

    var srcElement = scForm.browser.getSrcElement(evt);

    if (srcElement.tagName == "INPUT" || srcElement.tagName == "SELECT" || srcElement.tagName == "TEXTAREA" || srcElement.isContentEditable) {
      if (!(srcElement.readOnly == true || srcElement.disabled == true || srcElement.className.indexOf("scIgnoreModified") >= 0)) {
        if (!scForm.isFunctionKey(evt, true)) {
          this.setModified(true);
        }
      }

      if (evt.keyCode == 8 && (srcElement.className && srcElement.className.toLowerCase().indexOf("checkbox") >= 0) ||
        (srcElement.type && srcElement.type.toLowerCase() == "checkbox")) {
        scForm.browser.clearEvent(evt, false, false, 8);
      }
    } else {
      if (evt.keyCode == 8 && !isSilverlightApplicationLoaded(srcElement)) {
        scForm.browser.clearEvent(evt, false, false, 8);
      }
    }

    var result = this.handleKey(evt.srcElement, evt, null, null, true);

    if (evt.keyCode == 112 && evt.altKey) {
      for (var e = this.browser.getEnumerator(document.getElementsByTagName("span")) ; !e.atEnd() ; e.moveNext()) {
        var ctl = e.item();

        if (ctl.className.indexOf("scRibbonToolbarKeyCode") >= 0) {
          ctl.style.display = ctl.style.display == "" ? "none" : "";
        }
      }
    }

    return result;
  }
};

scSitecore.prototype.onLoad = function () {
  this.browser.attachEvent(document, "onkeydown", function (evt) {
    if (scForm != null) {
      return scForm.onKeyDown(evt);
    }
  });
  this.browser.attachEvent(document, "onkeypress", function (evt) {
    evt = evt || window.event;
    if (evt.keyCode == 0 && evt.ctrlKey && scForm.browser.shouldKeyPressBeCleared(evt)) {
      scForm.browser.clearEvent(evt, true, false);
    }
  });

  this.browser.initialize();

  this.initializeModalDialogs();

  if (scForm.Settings && scForm.Settings.SessionTimeout) {
    //Keep alive action should be performed earlier then session expires. That's why - 30 * 1000
    var keepAliveTimeout = scForm.Settings.SessionTimeout - 30 * 1000;
  } else {
    if (window.console) {
      console.warn("SessionTimeout not found in settings scForm.Settings");
    }
    keepAliveTimeout = 1200 * 1000 - 30 * 1000;
  }

  window.setInterval(scKeepAlive, keepAliveTimeout);
};

scSitecore.prototype.onUnload = function () {
  this.browser.closePopups("mainWindowUnload");
};

scSitecore.prototype.activate = function (tag, evt) {
  if (!tag.disabled) {
    this.setClass(tag, evt.type == "activate", "_Active");
  }

  return false;
};

scSitecore.prototype.broadcast = function (win, request, command) {
  if (typeof (win.scForm) != "undefined" && typeof (win.scForm.browser) != "undefined") {
    if (win.scForm.frameName == null) {
      win.scForm.frameName = "";

      var ctl = win.scForm.browser.getControl("__FRAMENAME");

      if (ctl != null) {
        win.scForm.frameName = ctl.value;
      }
    }

    if (command.framename == "*" || command.framename == win.scForm.frameName) {
      win.scForm.process(request, command, command.framecommand);
      return true;
    }
  }

  for (var n = 0; n < win.frames.length; n++) {
    try {
      if (this.broadcast(win.frames[n], request, command)) {
        return true;
      }
    } catch (ex) {
      console.log("Failed to accees frame. This typically happens due to a Permission Denied exception in IE9 caused by an intricate issue with Popup and ShowModalDialog calls. " + ex.message);
    }
  }

  return false;
};

scSitecore.prototype.drag = function (tag, evt, parameters) {
  switch (evt.type) {
    case "mousedown":
      if (evt.button == 1) {
        this.dragMouseDown = tag;
        this.dragMouseDownX = evt.x;
        this.dragMouseDownY = evt.y;
      }
      break;
    case "mousemove":
      if (this.dragMouseDown != null && this.dragMouseDown == tag && evt.button == 1) {
        if (Math.abs(this.dragMouseDownX - evt.x) > 4 || Math.abs(this.dragMouseDownY - evt.y) > 4) {
          evt.srcElement.dragDrop();
          this.dragMouseDown = null;
        }
      } else {
        this.dragMouseDown = null;
      }
      break;
    case "dragstart":
      evt.dataTransfer.setData("text", "sitecore:" + parameters);
      evt.dataTransfer.effectAllowed = "all";
      break;
  }
};

scSitecore.prototype.dragover = function(tag, evt, parameters) {
    this.browser.clearEvent(evt, true, false);
    return true;
};

scSitecore.prototype.drop = function(tag, evt, parameters) {
  var data = evt.dataTransfer.getData("text");   
  if (data != null) {
    if (data.substring(0, 9) == "sitecore:") {
        this.browser.clearEvent(evt, true, false);
        this.postEvent(tag, evt, parameters.replace(/\$Data/gi, data));
    } else {
      evt.dataTransfer.dropEffect = "none";
      this.browser.clearEvent(evt, null, false);
    }
  }
  return false;
};

scSitecore.prototype.expandHtml = function (html) {
  var n = html.indexOf("[[X:");
  if (n < 0) {
    return html;
  }

  var blockQuotes = "";

  for (var e = this.browser.getEnumerator(document.getElementsByTagName("BLOCKQUOTE")) ; !e.atEnd() ; e.moveNext()) {
    var ctl = e.item();
    blockQuotes += ctl.innerHTML;
  }

  while (n >= 0) {
    e = html.indexOf("]]", n);
    if (e < 0) {
      e = n + 2;
    }

    var text = "";

    var id = html.substring(n + 4, e);

    ctl = this.browser.getControl(id);
    if (ctl != null) {
      text = this.browser.getOuterHtml(ctl);
      var i = text.toUpperCase().lastIndexOf("</DIV>");
      text = text.substring(0, i) + "</div id=\"" + id + "\">";

      var div = document.createElement("DIV");
      div.innerHTML = text;

      text = scForm.getInnerHtmlWithParsedAttributes(div);
      text = text.substring("<div>".length, text.length - "</div>".length);
    } else {
      var h = blockQuotes.indexOf(id);

      if (h >= 0) {
        var i1 = blockQuotes.lastIndexOf("<div", h);
        var i2 = blockQuotes.lastIndexOf("<DIV", h);

        i = (i1 > i2 ? i1 : i2);

        var j = blockQuotes.indexOf("</div id=\"" + id + "\">", i);

        if(j < 0){
          var openDivsCounter = 1;
          var reg = new RegExp("<div|</div", "ig");
          reg.lastIndex = i+ "<div".length;
          var nextDiv;
          while(openDivsCounter > 0 && (nextDiv = reg.exec(blockQuotes)))
          {
            openDivsCounter = nextDiv[0] === "<div" ? openDivsCounter + 1 : openDivsCounter - 1;
            reg.lastIndex = nextDiv.index + nextDiv[0].length;
          }

          j = reg.lastIndex - nextDiv[0].length;
        }

        if (j >= 0) {
          text = blockQuotes.substring(i, j) + "</div id=\"" + id + "\">";
        }
      }
    }

    html = html.substr(0, n) + text + html.substr(e + 2);

    n = html.indexOf("[[X:");
  }

  return html;
};

scSitecore.prototype.focus = function (ctl) {
  try {
    ctl.focus();
  } catch (e) {
  }
};

scSitecore.prototype.getParentForm = function () {
  var frame = this.browser.getFrameElement(window);

  if (frame != null) {
    var win = this.browser.getParentWindow(frame.ownerDocument);

    if (typeof (win.scForm) != "undefined") {
      return win.scForm;
    }
  }

  return null;
};

scSitecore.prototype.getViewPortSize = function (win) {
  win = win || window;
  var w = win,
      d = win.document,
      e = d.documentElement,
      g = d.getElementsByTagName('body')[0],
      x = w.innerWidth || e.clientWidth || g.clientWidth,
      y = w.innerHeight || e.clientHeight || g.clientHeight;

  return { width: x, height: y };
};

scSitecore.prototype.invoke = function (method) {
  var e = window.event;
  if (method != "LoadItem" && scForm && scForm.disableRequests) {
    alert(this.translate("Please wait while the Content Editor is loading."));
    return;
  }

  if (arguments.length > 1) {
    var argumentsList = [];
    for (var n = 1; n < arguments.length; n++) {
      var arg = arguments[n];
      var isEventArg = arg && (typeof (arg.stopPropagation) != "undefined" || typeof (arg.cancelBubble) != "undefined");
      if (isEventArg) {
        e = arg;
        continue;
      }

      argumentsList.push("\"" + arg + "\"");
    }

    if (argumentsList.length) {
      // should the arguments be separated with a delimiter, e.g. comma?
      // Not in the original code.
      method += "(" + argumentsList.join(",") + ")";
    }
  }

  if (method.substring(0, 11) == "javascript:") {
    if (e != null) {
      scForm.browser.clearEvent(e, true, false);
    }

    var result = eval(method.substr(11).replace(/#quote#|&quot;/gi, "'"));

    return result;
  }

  if (e != null) {
    scForm.browser.clearEvent(e, true, false);
  }

  return this.postRequest("", "", "", method);
};

scSitecore.prototype.invokeCallback = function (method, callback, async) {
  if (arguments.length > 0) {
    method += "(";

    for (var n = 2; n < arguments.length; n++) {
      method += "\"" + arguments[n] + "\"";
    }

    method += ")";
  }

  return this.postRequest("", "", "", method, callback, async);
};

scSitecore.prototype.invokeAsync = function (object) {
  var request = new scRequest();

  request.async = true;
  request.url = "/sitecore/shell/invoke.aspx";

  var form = "__ISEVENT=1&__OBJECT=" + encodeURIComponent(object);

  if (arguments.length > 0) {
    for (var n = 1; n < arguments.length - 1; n += 2) {
      form += "&" + arguments[n] + "=" + encodeURIComponent(arguments[n + 1]);
    }
  }

  request.form = form;

  request.execute();
};

scSitecore.prototype.invokeUrl = function (url, async, callback) {
  var request = new scRequest();

  request.async = async == true;
  request.url = url;

  if (callback != null) {
    request.callback = new Function("result", callback + "(result)");
  }

  var form = "__PAGESTATE=" + encodeURIComponent(scForm.browser.getControl("__PAGESTATE").value);

  if (arguments.length > 2) {
    for (var n = 3; n < arguments.length - 1; n += 2) {
      form += "&" + arguments[n] + "=" + encodeURIComponent(arguments[n + 1]);
    }
  }

  request.form = form;

  request.execute();
};

scSitecore.prototype.isSiblingsHidden = function (tag) {
  for (var e = this.browser.getEnumerator(tag.parentNode.childNodes) ; !e.atEnd() ; e.moveNext()) {
    var ctl = e.item();

    if (ctl != tag && ctl.style.display != "none") {
      return false;
    }
  }

  return true;
};

scSitecore.prototype.getCookie = function (name) {
  name = name + "=";

  var i = 0;

  while (i < document.cookie.length) {
    var j = i + name.length;

    if (document.cookie.substring(i, j) == name) {
      var n = document.cookie.indexOf(";", j);

      if (n == -1) {
        n = document.cookie.length;
      }

      return unescape(document.cookie.substring(j, n));
    }

    i = document.cookie.indexOf(" ", i) + 1;

    if (i == 0) {
      break;
    }
  }

  return null;
};

scSitecore.prototype.getCookieName = function () {
  var href = window.location.href;

  var n = href.indexOf("xmlcontrol=");
  if (n >= 0) {
    href = href.substr(n + 11);
  }

  n = href.indexOf("&");
  if (n >= 0) {
    href = href.substr(0, n);
  }

  return href;
};

scSitecore.prototype.getEventControl = function (evt, tag) {
  var ctl = this.browser.getSrcElement(evt);

  while (ctl != null && ctl != tag && (ctl.id == null || ctl.id == "")) {
    ctl = ctl.parentNode;
  }

  return ctl;
};

scSitecore.prototype.getParameters = function (form) {
  // for overriding
  return form;
};

scSitecore.prototype.help = function (tag, evt, link) {
  window.showHelp(link);
};

scSitecore.prototype.insertIntoTable = function (ctl, command) {
  var container = ctl.ownerDocument.createElement("div");

  container.innerHTML = "<table>" + command.value + "</table>";

  var table = container.childNodes[0];
  var parent = ctl.parentNode;

  ctl = ctl.nextSibling;

  var rows = this.browser.getTableRows(table);

  var n;
  if (ctl == null) {
    for (n = 0; n < rows.length; n++) {
      parent.appendChild(rows[n]);
    }
  } else {
    for (n = 0; n < rows.length; n++) {
      parent.insertBefore(rows[n], ctl);
    }
  }
};

scSitecore.prototype.insertIntoDiv = function (control, command) {
  var container = control.ownerDocument.createElement("div");
  container.innerHTML = "<div>" + command.value + "</div>";
  var grid = container.childNodes[0];
  var rows = this.getGridRows(grid);
  var parent = control.parentNode;
  control = control.nextSibling;

  for (var i = 0; i < rows.length; i++) {
    if (control == null) {
      parent.appendChild(rows[i]);
    } else {
      parent.insertBefore(rows[i], control);
    }
  }
};

scSitecore.prototype.getGridRows = function (grid) {
  var result = [];

  for (var i = 0; i < grid.childNodes.length; i++) {
    var control = grid.childNodes[i];

    if (control.tagName == "UL") {
      result.push(control);
    }
  }

  return result;
};

scSitecore.prototype.handleKey = function (tag, evt, parameters, keyFilter, global) {
  if (evt.keyCode == null) {
    return;
  }

  // special delete key handling
  if (evt.keyCode == 46 && tag != null && (tag.tagName == "INPUT" || tag.tagName == "SELECT" || tag.tagName == "TEXTAREA" || tag.isContentEditable)) {
    return;
  }
  // special enter key handling
  if (evt.keyCode == 13 && tag != null && (tag.tagName == "TEXTAREA" || tag.isContentEditable)) {
    return;
  }
  // special tab key handling
  if (evt.keyCode == 9 && tag && (tag.tagName == "BUTTON" || tag.tagName == "INPUT") && tag.id == "Cancel" && !evt.shiftKey) {
    var firstInput = document.querySelector('input:not([type=hidden])');
    firstInput && firstInput.focus();
    this.browser.clearEvent(evt, true, false);
    return;
  }

  global = (global != null);

  var ok = true;
  var key = "";

  if (evt.shiftKey) {
    key += "s";
  }
  if (evt.ctrlKey) {
    key += "c";
  }
  if (evt.altKey) {
    key += "a";
  }

  key += evt.keyCode.toString();

  if (global) {
    var k = this.keymap[key];

    if (k != null) {
      parameters = k.click;
    }

    ok = (parameters != null);
  } else {
    if (keyFilter != null && keyFilter != "") {
      keyFilter = "," + keyFilter + ",";

      if (keyFilter.indexOf("," + key + ",") < 0) {
        ok = false;
      }
    }
  }

  if (key == "c0") {
    this.browser.clearEvent(evt, true, false, 0);
  }

  if (ok) {
    this.browser.clearEvent(evt, true, false, evt.keyCode);

    this.postEvent(tag, evt, parameters);

    return false;
  } else if (global) {
    var win = window.parent;

    if (win != null && win != window) {
      if (typeof (win.scForm) != "undefined" && win.scForm.handleKey) {
        return win.scForm.handleKey(tag, evt, parameters, keyFilter, global);
      }
    }
  }
};

scSitecore.prototype.registerKey = function (key, click, group) {
  this.keymap[key] = { click: click, group: group };
};

scSitecore.prototype.isFunctionKey = function (evt, editorKeys) {
  if (editorKeys == true) {
    // Ctrl+B, Ctrl+I, Ctrl+U
    if (evt.ctrlKey && (evt.keyCode == 66 || evt.keyCode == 73 || evt.keyCode == 85)) {
      return false;
    }
  }

  // ignore all Ctrl-key combinations (except Ctrl-X and Ctrl-V)
  if (evt.ctrlKey && evt.keyCode != 88 && evt.keyCode != 86) {
    return true;
  }

  switch (evt.keyCode) {
    // check misc. control keys 
    case 9:       // Tab
    case 16:      // Shift
    case 17:      // Ctrl
    case 18:      // Alt
    case 20:      // Caps
    case 27:      // Esc
    case 35:      // Home
    case 36:      // End
    case 37:      // Arrows (37-40)
    case 38:
    case 39:
    case 40:
    case 112:     // F1-F12 (112-123)
    case 113:
    case 114:
    case 115:
    case 116:
    case 117:
    case 118:
    case 119:
    case 120:
    case 121:
    case 122:
    case 123:
      return true;

      // check for Shift-Insert (paste)
    case 45:      // Insert
      return !evt.shiftKey;
  }

  return false;
};

scSitecore.prototype.postEvent = function (tag, evt, parameters) {
  var result;

  if (evt.type == "contextmenu") {
    if (evt.ctrlKey) {
      return null;
    }

    this.contextmenu = this.browser.getSrcElement(evt);
  }

  this.lastEvent = evt;

  if (parameters != null && parameters.substring(0, 11) == "javascript:") {
    result = eval(parameters.substr(11).replace(/#quote#|&quot;/gi, "'"));
  } else {
    var ctl = this.getEventControl(evt, tag);

    var request = new scRequest();
    request.evt = evt;

    request.build(tag ? tag.id : "", (ctl != null ? ctl.id : ""), evt.type, parameters, true, this.contextmenu, this.getModified());

    request.buildFields();

    result = request.execute();
  }

  this.lastEvent = null;

  this.browser.clearEvent(evt, true, result);

  return result;
};

scSitecore.prototype.postMessage = function (message, target, top, postSelf) {
  var win = window;
  var topWindow;

  do {
    topWindow = win;
    var form = win.scForm;
    if (form == null) {
      return;
    }

    var ctl = form.browser.getControl("__FRAMENAME");

    if (ctl != null) {
      if (ctl.value == top) {
        break;
      }
    }

    if (win.parent == null || win.parent == win) {
      if (win.opener != null && win.opener != win) {
        this.postMessageToWindow(win, message, target, postSelf);

        win = win.opener;
      } else if (win.dialogHeight != null) {
        this.postMessageToWindow(win, message, target, postSelf);

        try {
          win = win.dialogArguments[0];
          var dummy = win.scForm;
        } catch (e) {
          win = null;
        }
      } else {
        win = null;
      }
    } else {
      win = win.parent;
    }
  } while (win != null);

  if (topWindow != null) {
    this.postMessageToWindow(topWindow, message, target, postSelf);
  }
};

scSitecore.prototype.postMessageToWindow = function (win, message, target, postSelf) {
  if (win.scForm != null) {
    var ok = true;

    if (target != null) {
      var ctl = win.scForm.browser.getControl("__FRAMENAME");
      ok = (ctl != null && ctl.value == target);
    }

    ctl = win.scForm.browser.getControl("__IGNOREMESSAGES");
    if (ctl != null && ctl.value == "1") {
      ok = false;
    }

    if (ok && (postSelf == true || win != window)) {
      win.scForm.postRequest("", "", "", message);
    }
  }

  for (var n = 0; n < win.frames.length; n++) {
    try {
      this.postMessageToWindow(win.frames[n], message, target, postSelf);
    } catch (ex) {
      console.log("Failed to accees frame. This typically happens due to a Permission Denied exception in IE9 caused by an intricate issue with Popup and ShowModalDialog calls. " + ex.message);
    }
  }
};

scSitecore.prototype.postRequest = function (control, source, eventtype, parameters, callback, async) {
  var request = new scRequest();

  request.parameters = parameters;

  request.build(control, source, eventtype, parameters, true, this.contextmenu, this.getModified());
  request.buildFields();

  request.callback = callback;
  request.async = (async == true);

  return request.execute();
};

scSitecore.prototype.postResult = function (result, pipeline) {
  var request = new scRequest();

  request.form = "&__RESULT=" + encodeURIComponent(result) +
    "&__PIPELINE=" + encodeURIComponent(pipeline);
  request.buildFields();

  request.pipeline = pipeline;

  return request.execute();
};

scSitecore.prototype.process = function (request, command, name) {
  name = (name == null ? command.command : name);
  this.state.pipeline = request.pipeline;
  var r;
  switch (name) {
    case "Alert":
      if (request.dialogResult == "__!!NoDialogResult!!__") {
        this.browser.closePopups("ShowModalWindowCommand");

        this.showModalDialog(command.url, { message: command.value.replace(/(?:\r\n|\r|\n)/g, '<br />'), header: command.header}, "dialogWidth:400px;dialogHeight:190px;help:no;scroll:no;resizable:no;maximizable:no;status:no;center:yes;autoIncreaseHeight:yes", request, request.onCloseModalDialogCallback);
        request.onCloseModalDialogCallback = null;
      } else {
        if (command.response) {
          this.postResult(command.response, request.pipeline);
        }
      }

      break;
    case "Broadcast":
      if (window.dialogArguments != null) {
        this.broadcast(window.dialogArguments[0].top, request, command);
      }
      this.broadcast(window.top, request, command);
      break;
    case "Cache":
      this.cache[request.cacheKey] = request.response;
      break;
    case "CheckModified":
      var form;
      if (!command.frame) {
        form = this;
      } else {
        var frame = this.browser.getControl(command.frame);
        if (frame) {
          form = frame.contentWindow.scForm;
        }
      }

      var modified = false;
      if (form != null) {
        try {
          modified = form.getModified();
        } catch (e) {
        }
      }

      if (modified) {
        if (request.dialogResult == "__!!NoDialogResult!!__") {
          this.browser.closePopups("checkModifiedShowModalDialog");
          this.showModalDialog("/sitecore/shell/default.aspx?xmlcontrol=YesNoCancel&te=" + command.value, [window], "dialogWidth:430px;dialogHeight:190px;help:no;scroll:auto;resizable:yes;maximizable:no;status:no;center:yes;autoIncreaseHeight:yes", request);
        }
        r = request.dialogResult || 'cancel';
        if (r != "__!!NoDialogResult!!__") {
          switch (r) {
              case "yes":
                  form.setModified(false);
                  var disableNotifications;
                  var previousPipeline;
                  var parameter;
                  if (command.disableNotifications === "1") {
                      disableNotifications = "disableNotifications=true";
                  }
                  else {
                      disableNotifications = "";
                  }
                  if (command.resumePreviousPipeline === "1") {
                      previousPipeline = "postaction=pipeline:resume(pipelineId=" + request.pipeline + ")";
                  }
                  else {
                      previousPipeline = "";
                  }
                  var commaSeperator = (disableNotifications !== "" && previousPipeline !== "") ? "," : "";
                  var commandArgs = (disableNotifications !== "" || previousPipeline !== "") ? "(" + disableNotifications + commaSeperator + (previousPipeline === "" ? "" : previousPipeline) + ")" : "";
                  parameter = "item:save" + commandArgs;

                  var saved = form.postRequest("", "", "", parameter);

                  if (saved === "failed") {
                      form.setModified(true);
                      request.abort = true;
                      r = "cancel";
                  }
                  if (command.resumePreviousPipeline === "1") {
                      return;
                  }

                  break;
            case "no":
              form.setModified(false);
              form.disableRequests = false;
              break;
            case "cancel":
              request.abort = true;
              form.disableRequests = false;
              break;
          }

          if (command.response == "1") {
            modified = form.getModified();
            this.postResult(r, request.pipeline);
            form.setModified(modified);
          }
        }
      } else {
        if (command.response == "1") {
          this.postResult("no", request.pipeline);
        }
      }
      break;
    case "CloseWindow":
    if (window.top.dialogClose != undefined) {
        window.top.dialogClose();
    }
      break;
    case "ClosePopups":
      if (command.value == "1") {
        this.browser.closePopups("ClosePopupsCommand");
      } else {
        request.closePopups = false;
      }
      break;
    case "Confirm":
      if (request.dialogResult == "__!!NoDialogResult!!__") {
        this.browser.closePopups("ShowModalWindowCommand");

        this.showModalDialog(command.url, { message: command.value }, "dialogWidth:500px;dialogHeight:190px;help:no;scroll:no;resizable:no;maximizable:no;status:no;center:yes;autoIncreaseHeight:yes", request, request.onCloseModalDialogCallback);
        request.onCloseModalDialogCallback = null;
      }

      r = request.dialogResult || 'no';
      if (r != "__!!NoDialogResult!!__") {
        this.postResult(r, request.pipeline);
      }
      break;
    case "Debug":
      window.defaultStatus =
        "ViewState: " + command.viewstatesize + " bytes; " +
          "ControlStore: " + command.controlstoresize + " bytes; " +
          "Controls: " + command.controlcount + "; " +
          "Client time: " + request.timer + "ms; " +
          "Response: " + request.response.length + " bytes; " +
          "Commands: " + request.commands.length + ";";
      break;
    case "Download":
      var iframe = document.createElement("iframe");
      if (command.value.substring(0, 4) == 'http') {
        iframe.src = command.value;
      } else {
        iframe.src = "/sitecore/shell/download.aspx?file=" + encodeURIComponent(command.value);
      }
      iframe.width = "1";
      iframe.height = "1";
      iframe.style.position = "absolute";
      iframe.style.display = "none";
      document.body.appendChild(iframe);
      break;
    case "Eval":
      r = eval(command.value);
      if (command.response != null) {
        this.postResult(r, request.pipeline);
      }
      break;
    case "Error":
      this.showModalDialog("/sitecore/shell/controls/reload.htm", [command.value], "center:yes;help:no;resizable:yes;scroll:yes;status:no;", request);
      window.top.location.href = window.top.location.href;
      break;
    case "Focus":
      ctl = this.browser.getControl(command.value);
      if (ctl != null) {
        this.focus(ctl);

        if (command.scrollintoview == "1") {
          this.browser.scrollIntoView(ctl);
        }
      }
      break;
    case "Input":
      if (request.dialogResult == "__!!NoDialogResult!!__") {
        this.browser.closePopups("ShowModalWindowCommand");

        var dialogArguments = {
          message: command.value,
          defaultValue: command.defaultValue,
          maxLength: command.maxlength,
          validation: command.validation,
          validationText: command.validationtext,
          maxLengthValidatationText: command.maxLengthValidatationText,
          header: command.header
        };

        this.showModalDialog(command.url, dialogArguments, "dialogWidth:400px;dialogHeight:190px;help:no;scroll:no;resizable:no;maximizable:no;status:no;center:yes;autoIncreaseHeight:yes", request, request.onCloseModalDialogCallback);
        request.onCloseModalDialogCallback = null;
      }

      r = request.dialogResult;
      if (r != "__!!NoDialogResult!!__") {
          this.postResult(r, request.pipeline);     
      }
      break;
    case "Insert":
      var id = command.id;
      var where = command.where;

      var ctl = (id != null && id != "" ? this.browser.getControl(id) : document.body);

      if (ctl != null) {
        if (where == "table") {
          this.insertIntoTable(ctl, command);
        } else if (where == "div") {
          this.insertIntoDiv(ctl, command);
          scTreeview.align();
        } else if (where == "append") {
          var div = document.createElement("div");

          if (command.tag != null) {
            command.value = "<" + command.tag + ">" + command.value + "</" + command.tag + ">";
          }

          div.innerHTML = command.value;

          var source = (command.tag != null ? div.childNodes[0] : div);

          while (source.childNodes.length > 0) {
            ctl.appendChild(source.childNodes[0]);
          }
        } else {
          if (where == null || where == "") {
            where = "afterBegin";
          }
          this.browser.insertAdjacentHTML(ctl, where, command.value);
        }

        this.evalScriptTags(command.value);
      }
      break;
    case "Redraw":
      request.currentCommand++;
      request.suspend = true;

      this.suspended[this.uniqueID] = request;
      setTimeout("scForm.resume(" + this.uniqueID + ")", 0);

      this.uniqueID++;
      break;
    case "RegisterKey":
      this.registerKey(command.keycode, command.value, command.group);
      break;
    case "RegisterTranslation":
      this.registerTranslation(command.key, command.value);
      break;
    case "Remove":
      ctl = this.browser.getControl(command.id);
      if (ctl != null) {
        this.browser.removeChild(ctl);
      }
      break;
    case "SetAttribute":
      ctl = this.browser.getControl(command.id);
      if (ctl != null) {
        value = command.value;

        switch (command.name) {
          case "id":
            ctl.id = value;
            break;
          case "class":
          case "className":
            ctl.className = value;
            break;
          case "disabled":
            ctl.disabled = value;
            break;
          case "checked":
            ctl.checked = value;
            break;
          case "value":
            ctl.value = value;
            break;
          default:
            ctl.setAttribute(command.name, value);
        }
      }
      break;
    case "SetDialogValue":
      window.returnValue = command.value;
      window.top.returnValue = command.value;
      break;
    case "SetInnerHtml":
      ctl = this.browser.getControl(command.id);
      if (ctl != null) {
        var frames = $$('#' + command.id + " iframe");
        for (var i = 0; i < frames.length; i++) {
          try {
            if (frames[i].contentWindow.scDisplose) frames[i].contentWindow.scDisplose();
          } catch (e) { }
        }

        var value = this.expandHtml(command.value);

        if (ctl.tagName == "TEXTAREA") {
          ctl.value = value;
        } else {
          if (command.preserveScrollTop) {
            this.saveScrollPosition(command.preserveScrollElement || command.id);
          }

          ctl.innerHTML = value;

          this.evalScriptTags(value);

          if (command.preserveScrollTop) {
            this.restoreScrollPosition(command.preserveScrollElement || command.id, command.preserveScrollElement || command.id);
          }
        }
      }
      break;
    case "SetLocation":
      try {
        if (command.value != null && command.value != "") {
          var fullUrl = this.getAbsoluteUrl(command.value);
          window.location.href = fullUrl;
        } else {
          window.location.reload(true);
        }
      } catch (e) {
        // silent - user may have aborted action
      }
      break;
    case "SetModified":
      this.setModified(command.value);
      break;
    case "SetOuterHtml":
      ctl = this.browser.getControl(command.id);

      if (command.preserveScrollTop) {
        this.saveScrollPosition(command.preserveScrollElement || command.id);
      }

      if (ctl != null) {
        this.browser.setOuterHtml(ctl, this.expandHtml(command.value));
      }

      if (command.preserveScrollTop) {
        this.restoreScrollPosition(command.preserveScrollElement || command.id, command.preserveScrollElement || command.id);
      }
      break;
    case "SetPipeline":
      request.pipeline = command.value;
      break;
    case "SetReturnValue":
      request.returnValue = command.value;
      break;
    case "SetStyle":
      ctl = this.browser.getControl(command.id);
      if (ctl != null) {
        ctl.style[command.name] = command.value;
      }
      break;
    case "SetTableRowClass":
      ctl = this.browser.getControl(command.id);
      if (ctl != null) {
        ctl.className = command.row;

        ctl.childNodes[0].className = command.firstcell;

        for (var n = 1; n < ctl.childNodes.length - 1; n++) {
          ctl.childNodes[n].className = command.cell;
        }

        ctl.childNodes[ctl.childNodes.length - 1].className = command.lastcell;
      }
      break;
    case "ShowModalDialog":
      if (request.dialogResult == "__!!NoDialogResult!!__") {
        this.browser.closePopups("ShowModalWindowCommand");

        window.___Message = command.message;
        this.showModalDialog(command.value, [window], command.features, request, request.onCloseModalDialogCallback);
        request.onCloseModalDialogCallback = null;
      }
      r = request.dialogResult;
      if (r != "__!!NoDialogResult!!__") {
        if (command.response != null) {
          this.postResult(r, request.pipeline);
        }

        if (r != null && command.message != null) {
          this.postRequest("", "", "", command.message);
        }
      }
      break;
    case "ShowPopup":
      this.showPopup(command);
      request.closePopups = false;
      break;
    case "Timer":
      setTimeout("scForm.postRequest(\"\", \"\", \"\", \"" + command["event"] + "\")", command.delay);
      break;
    case "UnregisterKeyGroup":
      this.unregisterKeyGroup(command.value);
      break;
  }
};

scSitecore.prototype.evalScriptTags = function (value) {
  var doc = new DOMParser().parseFromString(value, "text/html");
  var scriptElements = doc.getElementsByTagName("script");

  for (var i = 0; i < scriptElements.length; i++) {
    eval(scriptElements[i].innerHTML);
  }
};

scSitecore.prototype.getInnerHtmlWithParsedAttributes = function (elem) {
  if(elem.nodeType!==1){
    return elem.nodeType===8 ? "<!--" + elem.nodeValue + "-->" : elem.nodeValue;
  }

  var innerHtml = "";
  var attributes = "";
  var outerHtml = document.createElement(elem.tagName).outerHTML;

  for(var i = 0; i < elem.attributes.length; i++){
    attributes += " " + this.encodeAttribute(elem.attributes[i]);
  }

  var attrIndex = outerHtml.indexOf("><");

  if(attrIndex === -1){
    attrIndex = outerHtml.indexOf(">");
    return [outerHtml.slice(0, attrIndex), attributes," /", outerHtml.slice(attrIndex)].join("");
  }

  for(i = 0; i < elem.childNodes.length; i++){
    innerHtml += this.getInnerHtmlWithParsedAttributes(elem.childNodes[i]);
  }

  return [outerHtml.slice(0, attrIndex), attributes, ">", innerHtml, outerHtml.slice(attrIndex + 1)].join("");
}

scSitecore.prototype.encodeAttribute = function (attr) {
  var attrValue = attr.value;

  if (attr.name.indexOf("on") !== 0) {
    attrValue = ("" + attrValue).replace(/&/g, "&amp;")
      .replace(/'/g, "&apos;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  return attr.name + "=\"" + attrValue + "\"";
}

scSitecore.prototype.getAbsoluteUrl = function(relativeOrAbsoluteUrl) {
  // Handle absolute URLs (with protocol-relative prefix)
  // Example: //domain.com/file.png
  if (relativeOrAbsoluteUrl.search(/^\/\//) != -1) {
    return window.location.protocol + relativeOrAbsoluteUrl;
  }

  // Handle absolute URLs (with explicit origin)
  // Example: http://domain.com/file.png
  if (relativeOrAbsoluteUrl.search(/:\/\//) != -1) {
    return relativeOrAbsoluteUrl;
  }

  // Handle absolute URLs (without explicit origin)
  // Example: /file.png
  if (relativeOrAbsoluteUrl.search(/^\//) != -1) {
    if (!window.location.origin) {
      window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? (':' + window.location.port) : '');
    }

    return window.location.origin + relativeOrAbsoluteUrl;
  }

  // Handle relative URLs
  // Example: file.png
  var base = window.location.href.match(/(.*\/)/)[0];
  return base + relativeOrAbsoluteUrl;
};

scSitecore.prototype.resume = function (suspendID) {
  var request = this.suspended[suspendID];

  if (request != null) {
    delete this.suspended[suspendID];
    request.resume();
  }
};

scSitecore.prototype.hasSuspendedRequests = function () {
  for (var n in this.suspended) {
    if (n != null) {
      return true;
    }
  }

  return false;
};

scSitecore.prototype.rollOver = function (tag, evt) {
  if (!tag.disabled) {
    if (tag.tagName == "IMG") {
      var src = this.browser.getImageSrc(tag);

      var ext = src.substr(src.lastIndexOf("."));
      src = src.substr(0, src.length - ext.length);

      if (src.indexOf("_h") >= 0) {
        src = src.substr(0, src.lastIndexOf("_h"));
      }

      switch (evt.type) {
        case "mouseover":
        case "focus":
          this.browser.setImageSrc(tag, src + "_h" + ext);
          break;
        case "mouseout":
        case "blur":
          this.browser.setImageSrc(tag, src + ext);
          break;
      }
    } else {
      this.setClass(tag, evt.type == "mouseover" || evt.type == "focus", "_Hover");

      for (var n = 0; n < tag.childNodes.length; n++) {
        this.setClass(tag.childNodes[n], evt.type == "mouseover", "_Hover");
      }
    }
  }

  return false;
};

scSitecore.prototype.scrollIntoView = function (id, alignToTop, force) {
  if (force == null || force == false) {
    if (window.dialogArguments == null) {
      return;
    }
  }

  var ctl = scForm.browser.getControl(id);
  if (ctl != null) {
    ctl.scrollIntoView(alignToTop == null ? false : alignToTop);
  }
};

scSitecore.prototype.setClass = function (tag, enable, modifier) {
  var className = tag.className;

  if (className != null && className != "") {
    var tail = className.substr(className.length - modifier.length, modifier.length);

    if (enable) {
      if (tail != modifier) {
        tag.className = className + modifier;
      }
    } else {
      if (tail == modifier) {
        tag.className = className.substr(0, className.length - modifier.length);
      }
    }
  }
};

scSitecore.prototype.setCookie = function (name, value, expires, path, domain, secure) {
  if (expires == null) {
    expires = new Date();
    expires.setMonth(expires.getMonth() + 3);
  }

  if (path == null) {
    path = "/";
  }

  document.cookie = name + "=" + escape(value) +
    (expires ? "; expires=" + expires.toGMTString() : "") +
    (path ? "; path=" + path : "") +
    (domain ? "; domain=" + domain : "") +
    (secure ? "; secure" : "");
};

scSitecore.prototype.getModified = function (itemId) {
  var activeItemId = itemId || this.Content && this.Content.getActiveItemId();
    if (activeItemId) {
        return !!this.modifiedItems[activeItemId];
    } else {
        return this.modified;
    }
};

scSitecore.prototype.setModified = function (value, itemId) {
    itemId = itemId || this.Content && this.Content.getActiveItemId();
    if (itemId) {
      this.modifiedItems[itemId] = value;
      var activeEditorTab = this.Content.getActiveEditorTab();

      if (activeEditorTab) {
        var tabHeaderElement = activeEditorTab.querySelector(".scEditorTabHeaderActive > span, .scEditorTabHeaderNormal > span");

        if (value) {
          tabHeaderElement.classList.add("scEditorTabHeaderModified");
        } else {
          tabHeaderElement.classList.remove("scEditorTabHeaderModified");
        }
      }

    } else {
        this.modified = value;
    }

    if (top._scDialogs && top._scDialogs.length != 0) top._scDialogs[0].modified = value;
};

scSitecore.prototype.showContextMenu = function (tag, evt, controlid) {
  if (evt.ctrlKey == true) {
    return null;
  }

  var ctl = this.getEventControl(evt, tag);

  this.contextmenu = (ctl != null ? ctl.id : "");

  if (!this.browser.isIE && !this.browser.isWebkit) {
    window.event = evt;
  }

  this.showPopup(null, null, controlid);

  this.browser.clearEvent(evt, true, false);

  return false;
};

scSitecore.prototype.showPopup = function (node, id, controlid, where, value, doc) {
  var evt = (scForm.lastEvent != null ? scForm.lastEvent : window.event);

  if (doc == null) {
    doc = document;

    if (document.popup != null && evt != null && evt.srcElement != null) {
      doc = evt.srcElement.ownerDocument;
    }
  }

  if (!node) {
    node = { controlid: controlid, id: id, where: where, value: value };
  }

  if (node.controlid != null) {
    var ctl = this.browser.getControl(node.controlid, doc);

    if (ctl == null) {
      alert("Control \"" + node.controlid + "\" not found.");
      return;
    }

    node.value = ctl;
  }

  this.browser.showPopup(node);
};

scSitecore.prototype.registerTranslation = function (key, message) {
  this.keymap[key] = { message: message };
};

scSitecore.prototype.translate = function (key) {
  var k = this.keymap[key];

  if (k != null) {
    return k.message;
  }

  return key;
};

scSitecore.prototype.unregisterKeyGroup = function (group) {
  for (var key in this.keymap) {
    if (this.keymap[key].group == group) {
      delete this.keymap[key];
    }
  }
};

scSitecore.prototype.saveScrollPosition = function (sourceId) {
  var sourceElement = document.getElementById(sourceId);
  if (sourceElement) {
    this.scrollPositions[sourceId] = sourceElement.scrollTop;
  }
}

scSitecore.prototype.restoreScrollPosition = function (sourceId, targetId) {
  var targetElement = document.getElementById(targetId);
  if (targetElement) {
    targetElement.scrollTop = this.scrollPositions[sourceId] || 0;
  }

  delete this.scrollPositions[sourceId];
}


function scRequest() {
  this.abort = false;
  this.async = false;
  this.cacheKey = "";
  this.closePopups = true;
  this.contextmenu = "";
  this.control = "";
  this.currentCommand = 0;
  this.dialogResult = "__!!NoDialogResult!!__";
  this.evt = null;
  this.eventtype = "";
  this.form = "";
  this.isevent = false;
  this.modified = false;
  this.parameters = "";
  this.pipeline = "";
  this.response = null;
  this.returnValue = false;
  this.source = "";
  this.suspend = false;
  this.timer = new Date();
  this.url = null;

  this.async = this.isAsync();
}

scRequest.prototype.debug = function () {
  for (var index = 0; index < this.commands.length; index++) {
    var command = this.commands[index];

    if (command.command != null) {
      var text = "";

      for (var key in command) {
        if (key != "value") {
          text += "\n" + key + "=" + command[key];
        }
      }

      text = command.command + text + "\n\n" + command.value;
    }
  }
};

scRequest.prototype.build = function (control, source, eventtype, parameters, isevent, contextmenu, modified) {
  this.control = control;
  this.source = source;
  this.eventtype = eventtype;
  this.parameters = parameters;
  this.isevent = isevent;
  this.contextmenu = contextmenu;
  this.modified = modified;

  this.form += "&__PARAMETERS=" + escape(this.parameters != null ? this.parameters : "") +
    "&__EVENTTARGET=" + escape(this.control) +
    "&__EVENTARGUMENT=" +
    "&__SOURCE=" + escape(this.source) +
    "&__EVENTTYPE=" + escape(this.eventtype) +
    "&__CONTEXTMENU=" + escape(this.contextmenu) +
    "&__MODIFIED=" + (this.modified ? "1" : "");

  if (this.isevent) {
    this.form += "&__ISEVENT=1";
  }

  this.cacheKey = this.form;

  if (this.evt != null) {
    this.form += "&__SHIFTKEY=" + (this.evt.shiftKey ? "1" : "") +
      "&__CTRLKEY=" + (this.evt.ctrlKey ? "1" : "") +
      "&__ALTKEY=" + (this.evt.altKey ? "1" : "") +
      "&__BUTTON=" + this.evt.button +
      "&__KEYCODE=" + this.evt.keyCode +
      "&__X=" + this.evt.clientX +
      "&__Y=" + this.evt.clientY +
      "&__URL=" + escape(location.href);
  }

  if (window.dialogWidth != null) {
    this.form += "&__DIALOGWIDTH=" + escape(window.dialogWidth) +
      "&__DIALOGHEIGHT=" + escape(window.dialogHeight);
  }

  this.form = scForm.getParameters(this.form);
};

appendFormData = function(form, value) {
  form += value;

  return form;
};

scRequest.prototype.buildFields = function (doc) {
  if (doc == null) {
    doc = document;
  }
  var e;
  var ctl;

  for (e = scForm.browser.getEnumerator(doc.getElementsByTagName("INPUT")) ; !e.atEnd() ; e.moveNext()) {
    ctl = e.item();

    if ((ctl.type != "checkbox" && ctl.type != "radio") || ctl.checked) {
      this.form = appendFormData(this.form, this.getValue(ctl, ctl.value));
    }
  }

  for (e = scForm.browser.getEnumerator(doc.getElementsByTagName("TEXTAREA")) ; !e.atEnd() ; e.moveNext()) {
    ctl = e.item();
    if (ctl.className != "scSheerIgnore") {
      this.form = appendFormData(this.form, this.getValue(ctl, ctl.value));
    }
  }

  for (e = scForm.browser.getEnumerator(doc.getElementsByTagName("IFRAME")) ; !e.atEnd() ; e.moveNext()) {
    var iframe = e.item();

    try {
      if (typeof (iframe.contentWindow.scGetFrameValue) != "undefined") {
        var v = iframe.contentWindow.scGetFrameValue(this.form, this);

        if (v != null) {
          this.form = appendFormData(this.form, this.getValue(iframe, v));
        }
      } else {
        var attr = iframe.attributes["sc_value"];

        if (attr != null) {
          this.form = appendFormData(this.form, this.getValue(iframe, attr.value));
        }
      }
    } catch (ex) {
      console.log("Failed to call scGetFrameValue in IFrame tag. This typically happens due to a Permission Denied exception in IE9 caused by an intricate issue with Popup and ShowModalDialog calls. " + ex.message);
    }
  }

  for (e = scForm.browser.getEnumerator(doc.getElementsByTagName("SELECT")) ; !e.atEnd() ; e.moveNext()) {
    var options = "";

    for (var o = scForm.browser.getEnumerator(e.item().options) ; !o.atEnd() ; o.moveNext()) {
      if (o.item().selected) {
        options += (options != "" ? "," : "") + o.item().value;
      }
    }

    if (options != "") {
      this.form = appendFormData(this.form, this.getValue(e.item(), options));
    }
  }
};

scRequest.prototype.execute = function () {
  this.evt = null;

  this.send();

  if (!this.async) {
    return this.handle();
  }

  return false;
};

scRequest.prototype.handle = function () {
  if (this.httpRequest != null) {
    if (this.httpRequest.status != "200") {
        scForm.showModalDialog("/sitecore/shell/controls/error.htm", [this.httpRequest.responseText], "center:yes;help:no;resizable:yes;scroll:yes;status:no;dialogMinHeight:150;dialogMinWidth:250;dialogWidth:580;dialogHeight:150;header:" + scForm.translate("Error"));
      return false;
    }

    if (this.httpRequest.getResponseHeader("SC-Login") == 'true') {
      var parser = document.createElement('a');
      parser.href = this.httpRequest.responseURL;
      window.top.location = parser.protocol + "//" + parser.host + (parser.pathname[0] == '/' ? '' : '/') + parser.pathname +
        "?returnUrl=" + (top.location.pathname[0] == '/' ? '' : '/') + encodeURIComponent(top.location.pathname + top.location.search + top.location.hash);
      return false;
    }

    this.response = this.httpRequest.responseText;
  }

  if (this.response != null) {
    var result;

    if (this.response.substr(0, 12) != "{\"commands\":") {
      result = this.response;
    } else {
      this.parse();

      this.resume();

      result = this.returnValue;
    }

    if (this.callback != null) {
      this.callback(result);
    }

    return result;
  }

  return false;
};

scRequest.prototype.getValue = function (ctl, value) {
  var key = (ctl.name != null && ctl.name != "" ? ctl.name : (ctl.id != null && ctl.id != "" ? ctl.id : null));

  if (key != null) {
    return "&" + key + "=" + encodeURIComponent(value);
  }

  return "";
};

scRequest.prototype.isAsync = function () {
  var ctl = document.getElementsByName("__VIEWSTATE");

  if (ctl != null) {
    for (var n = 0; n < ctl.length; n++) {
      var value = ctl[n].value;

      if (value != null && value.length > 0) {
        return value.indexOf(":async") >= 0;
      }
    }
  }

  return false;
};

scRequest.prototype.sortCommands = function (unsortedCommands) {
  var sortedCommands = new Array(unsortedCommands.length);

  var simpleCommandIndex = 0;
  var closeCommandIndex = unsortedCommands.length - 1;

  for (var i = 0; i < unsortedCommands.length; i++) {
    var command = unsortedCommands[i];
    if (command.command == "CloseWindow") {
      sortedCommands[closeCommandIndex] = command;
      closeCommandIndex--;
    }
    else {
      sortedCommands[simpleCommandIndex] = command;
      simpleCommandIndex++;
    }
  }

  return sortedCommands;
};

scRequest.prototype.parse = function () {
  var c = eval('(' + this.response + ')');

  this.commands = this.sortCommands(c.commands);

  if (scForm.debug) {
    this.debug();
  }
};

scRequest.prototype.resume = function () {
  this.suspend = false;

  while (this.currentCommand < this.commands.length) {
    if (!window.scForm) {
      return;
    }

    // It is not allowed to perform a SetLocation command before the ShowModalDialog one since Sitecore 7.1. So, here is a tricky fix for such kind of rare situations:
    // If a "SetLocation" command is placed before the "ShowModalDialog" one, then "SetLocation" command will not performed immediatly
    // It will be performed after closing the modal dialog.
    if (this.commands[this.currentCommand].command == "SetLocation") {
      for (var i = this.currentCommand; i < this.commands.length; i++) {
        var command = this.commands[i];
        if (["ShowModalDialog", "Input", "Confirm", "Alert"].indexOf(command.command) > -1) {
          var newLocation = this.commands[this.currentCommand].value;
          this.onCloseModalDialogCallback = function () {
            try {
              if (newLocation) { location.href = newLocation; }
              else { location.reload(true); }
            } catch (e) { }
          };
        }
      }
    }

    if (!(this.commands[this.currentCommand].command == "SetLocation" && this.onCloseModalDialogCallback)) {
      scForm.process(this, this.commands[this.currentCommand]);
    }

    this.dialogResult = "__!!NoDialogResult!!__";

    if (this.abort || this.suspend) {
      break;
    }

    this.currentCommand++;
  }

  var canClose = false;

  if (!window.scForm) {
    return;
  }

  if (this.source != "") {
    var ctl = $(this.source);

    if (ctl == null) {
      var lastEvent = scForm.lastEvent;
      if (lastEvent != null) {
        var srcElement = scForm.browser.getSrcElement(lastEvent);
        if (srcElement != null) {
          var win = scForm.browser.getParentWindow(srcElement.ownerDocument);
          if (win != null && win.document) {
            ctl = $(win.document.getElementById(this.source));
          }
        }
      }
    }

    if (ctl != null && ctl.ancestors) {
      canClose = true;
      var ancestors = ctl.ancestors();
      var popupTree = null;
      try {
        popupTree = ancestors.find(function (e) { return e.tagName != "BODY" && e.hasClassName("scPopupTree"); });
      } catch (ex) { }

      if (popupTree != null) {
        canClose = ancestors.find(function (e) { return e.hasClassName("scTreeItem"); }) != null;
      }
    }
  }

  if (canClose && this.closePopups && typeof (scForm) != "undefined") {
    scForm.browser.closePopups("Request");
  }

  return this.returnValue;
};

scSitecore.prototype.postRequestUrlRewriter = function (url) {
  return url;
};

scRequest.prototype.send = function () {
  if (this.cacheKey != null && this.cacheKey != "") {
    this.response = scForm.cache[this.cacheKey];
  }

  if (this.response == null) {
    var url = this.url;

    if (url == null) {
      url = location.href;

      if (url.indexOf(".aspx") < 0 &&
        (url.substr(url.length - "/sitecore/shell/".length, "/sitecore/shell/".length) == "/sitecore/shell/" ||
          url.substr(url.length - "/sitecore/shell".length, "/sitecore/shell".length) == "/sitecore/shell")) {
        var n = url.indexOf("?");
        var qs = "";

        if (n >= 0) {
          qs = url.substr(n);
          url = url.substr(0, n);
        }

        url += (url.substr(url.length - 1) != "/" ? "/" : "") + "default.aspx" + qs;
      }

      if (url.indexOf("#") >= 0) {
        url = url.substr(0, url.indexOf("#"));
      }
    }

    url = scSitecore.prototype.postRequestUrlRewriter(url);
    this.httpRequest = scForm.browser.createHttpRequest();

    this.httpRequest.open("POST", url, this.async);
    this.httpRequest.responseURL = url;

    this.httpRequest.setRequestHeader("lastCached", new Date().toUTCString());
    this.httpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    if (this.async) {
      this.httpRequest.onreadystatechange = scRequestHandler;
      scForm.requests.push(this);
    } else {
      var status = window.defaultStatus;
      window.defaultStatus = "Communicating with the Sitecore server...";
    }

    this.timer = new Date();

    try {
      this.httpRequest.send(this.form);
    } catch (e) {
      alert("An error occured while communicating with the Sitecore server:\n\n" + e.message);
    }

    if (!this.async) {
      //var sleep = new Date();
      //while(new Date() - sleep < 500) {
      //}

      this.timer = new Date() - this.timer;

      window.defaultStatus = status;
    }
  }
};

scSitecore.prototype.getChildrenModified = function () {
  if (this.modified) {
    return true;
  }

  if (Object.keys(this.modifiedItems).some(function (itemId) { return this.modifiedItems[itemId]; }.bind(this))) {
    return true;
  }

  for (var i = 0; i < frames.length; i++) {
    if (frames[i].scForm && frames[i].scForm.getChildrenModified()) {
      return true;
    }
  }

  return false;
};

scSitecore.prototype.registerLaunchpadClick = function () {
  var logo = $("globalLogo");

  if (logo) {
    Event.observe(logo, "click", function (e) {
      if (scForm.getChildrenModified()) {
        scForm.browser.closePopups("checkModifiedShowModalDialog");

        var arguments = { message: scForm.translate("There are unsaved changes. Are you sure you want to continue?") };
        var features = "dialogWidth:430px;dialogHeight:190px;help:no;scroll:auto;resizable:yes;maximizable:no;status:no;center:yes;autoIncreaseHeight:yes";

        scForm.showModalDialog("/sitecore/shell/default.aspx?xmlcontrol=Confirm", arguments, features, null, function (result) {
          if (result === "yes") {
            window.location.href = e.target.href;
          }
        });

        e.preventDefault();
      }
    });
  }
};

scSitecore.prototype.expandMessageBarDetails = function (evt) {
    evt.currentTarget.parentNode.parentNode.classList.toggle("scExpanded");
}

function scRequestHandler() {
  for (var n = scForm.requests.length - 1; n >= 0; n--) {
    var request = scForm.requests[n];

    if (request != null) {
      if (request.httpRequest.readyState == 4) {
        if (scForm.requests.length == 1) {
          scForm.requests = [];
        }
        else {
          scForm.requests.splice(n, 1);
        }

        request.handle();
      }
    }
  }
}

function scKeepAlive() {
  var img = document.getElementById("scKeepAlive");

  if (img == null) {
    img = document.createElement("img");

    img.id = "scKeepAlive";
    img.width = "1";
    img.height = "1";
    img.alt = "";
    img.style.position = "absolute";
    img.style.display = "none"; /* if set to "", causes scrollbars in firefox */

    document.body.appendChild(img);
  }

  img.src = "/sitecore/service/keepalive.aspx?ts=" + Math.round(Math.random() * 12361814);
}

function scDing() {
  var span = scForm.browser.getControl("ding");

  if (span == null) {
    span = document.createElement("bgsound");
    document.body.appendChild(span);
    span.id = "ding";
  }

  span.src = "/sitecore/shell/themes/standard/phaser.wav";
}

var scForm = new scSitecore();

function scInitializeGrid(sender, args) {
  try {
    new ComponentArtGrid(sender);
  }
  catch (e) {
    console.warn("Grid handler class is not loaded: %s", e.message);
  }
}

var scFlashDetection = function () {
  var isIE = (navigator.appVersion.indexOf("MSIE") != -1) ? true : false;
  var isWin = (navigator.appVersion.toLowerCase().indexOf("win") != -1) ? true : false;
  var isOpera = (navigator.userAgent.indexOf("Opera") != -1) ? true : false;

  function ControlVersion() {
    var version;
    var axo;
    var e;

    try {
      axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
      version = axo.GetVariable("$version");
    } catch (e) {
    }

    if (!version) {
      try {
        axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");

        version = "WIN 6,0,21,0";

        axo.AllowScriptAccess = "sameDomain";

        version = axo.GetVariable("$version");

      } catch (e) {
      }
    }

    if (!version) {
      try {
        axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.3");
        version = axo.GetVariable("$version");
      } catch (e) {
      }
    }

    if (!version) {
      try {
        axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.3");
        version = "WIN 3,0,18,0";
      } catch (e) {
      }
    }

    if (!version) {
      try {
        axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
        version = "WIN 2,0,0,11";
      } catch (e) {
        version = -1;
      }
    }

    return version;
  }

  function GetSwfVer() {
    var flashVer = -1;

    if (navigator.plugins != null && navigator.plugins.length > 0) {
      if (navigator.plugins["Shockwave Flash 2.0"] || navigator.plugins["Shockwave Flash"]) {
        var swVer2 = navigator.plugins["Shockwave Flash 2.0"] ? " 2.0" : "";
        var flashDescription = navigator.plugins["Shockwave Flash" + swVer2].description;
        var descArray = flashDescription.split(" ");
        var tempArrayMajor = descArray[2].split(".");
        var versionMajor = tempArrayMajor[0];
        var versionMinor = tempArrayMajor[1];
        var tempArrayMinor;
        if (descArray[3] != "") {
          tempArrayMinor = descArray[3].split("r");
        } else {
          tempArrayMinor = descArray[4].split("r");
        }
        var versionRevision = tempArrayMinor[1] > 0 ? tempArrayMinor[1] : 0;
        flashVer = versionMajor + "." + versionMinor + "." + versionRevision;
      }
    }
    else if (navigator.userAgent.toLowerCase().indexOf("webtv/2.6") != -1) flashVer = 4;
    else if (navigator.userAgent.toLowerCase().indexOf("webtv/2.5") != -1) flashVer = 3;
    else if (navigator.userAgent.toLowerCase().indexOf("webtv") != -1) flashVer = 2;
    else if (isIE && isWin && !isOpera) {
      flashVer = ControlVersion();
    }
    return flashVer;
  }

  function scPersistFlashVersion() {
    var versionStr = GetSwfVer();
    if (versionStr == -1) {
      scForm.setCookie("sc_fv", "0.0.0", "");
    }
    else if (versionStr != 0) {
      var versionArray;
      if (isIE && isWin && !isOpera) {
        // Given "WIN 2,0,0,11"
        var tempArray = versionStr.split(" ");   // ["WIN", "2,0,0,11"]
        var tempString = tempArray[1];      // "2,0,0,11"
        versionArray = tempString.split(",");  // ['2', '0', '0', '11']
      }
      else {
        versionArray = versionStr.split(".");
      }

      var versionMajor = versionArray[0];
      var versionMinor = versionArray[1];
      var versionRevision = versionArray[2];

      var version = versionMajor + "." + versionMinor + "." + versionRevision;
      scForm.setCookie("sc_fv", version, "");
    }
  }

  scPersistFlashVersion();
};

if (!scForm.getCookie("sc_fv")) {
  scFlashDetection();
}

/*
 * Treeview.
 */

var scTreeview = new Treeview();

function Treeview()
{
  this.columnCount = null;
  this.initialized = false;
  this.rows = null;
  this.treeview = null;
  this.isHidden = false;
}

Treeview.prototype.align = function () {
  try {
    this.initialize();
  } catch (exception) {
    return;
  }

  if (this.treeview.getHeight() == 0) {
    this.isHidden = true;
    return;
  }

  this.isHidden = false;

  for (var i = 0; i < this.columnCount; i++) {
    this.alignColumn(i);
  }
};

Treeview.prototype.alignColumn = function (column) {
  var cells = this.getColumnCells(column);
  var maxWidth = this.getMaxCellWidth(cells);

  for (var i = 0; i < cells.length; i++) {
    cells[i].setStyle("width: " + maxWidth + "px");
  }
};

Treeview.prototype.getColumnCells = function (column) {
  var cells = [];

  for (var i = 0; i < this.rows.length; i++) {
    cells.push(this.rows[i].childElements()[column]);
  }

  return cells;
};

Treeview.prototype.getMaxCellWidth = function (cells) {
  var maxWidth = 0;

  for (var i = 0; i < cells.length; i++) {
    var width = cells[i].offsetWidth;

    if (width > maxWidth) {
      maxWidth = width;
    }
  }

  return maxWidth;
};

Treeview.prototype.getRows = function () {
  var treeHeader = $$(".scTreeHeader")[0];

  if (!treeHeader) {
    throw "Treeview exception: Tree header was not found.";
  }

  var dataRows = $$(".scTreeItem");

  if (dataRows.length == 0) {
    throw "Treeview exception: Data rows were not found.";
  }

  var rows = [treeHeader];

  for (var i = 0; i < dataRows.length; i++) {
    rows.push(dataRows[i]);
  }

  return rows;
};

Treeview.prototype.getTreeviewWidth = function () {
  if (this.rows.length == 0) {
    return 0;
  }

  var width = 0;
  var cells = this.rows[0].childElements();

  for (var i = 0; i < cells.length; i++) {
    width += cells[i].offsetWidth + 1;
  }

  return width;
};

Treeview.prototype.initialize = function () {
  this.rows = this.getRows();

  if (this.initialized) {
    return;
  }

  var columnCount = this.rows[0].childElements().length;

  if (columnCount == 0) {
    throw "Treeview exception: No columns found.";
  }

  this.columnCount = columnCount;

  var treeview = $$(".scTreeview")[0];

  if ((treeview == undefined) || !treeview) {
    throw "Treeview exception: Treeview was not found.";
  }

  this.treeview = treeview;

  this.initialized = true;
};

Treeview.prototype.FixLayout = function()
{
  var widthAdjustment = 17;

  if (scForm.browser.isIE) {
    var itemsToFix = $$('.scTreeview .cell.text');
    if (itemsToFix.length == 0 && document.popup) {
      itemsToFix = Element.select(document.popup.document, '.scTreeview .cell.text');
    }

    itemsToFix
      .findAll(function (el) { return !el.style.width; })
      .each(function (el) { el.style.width = widthAdjustment + parseInt(el.style.marginLeft, 10) + el.down('div').offsetWidth + 'px'; });

  }
  else if (scForm.browser.isFirefox) {
    $$('.scTreeview .cell.text')
      .findAll(function (el) { return !el.style.minWidth; })
      .each(function (el) { el.style.minWidth = widthAdjustment + parseInt(el.style.marginLeft, 10) + el.down('div').offsetWidth + 'px'; });
  }
};

/*
* Checks if the element is the silverlight Engagement Plan object
*/
function isSilverlightApplicationLoaded(element) {
  return (element != null && (element.id == "scSilverlightEngagementPlan" || element.id == "scSilverlightExecutiveDashboard"));
}var scSavedTab = null;
var enabledSaveIcon = null;
var isRibbonVisible;
var isRibbonFixed = null;
var scShowDeletedNotification = true;

if (typeof (p$) != "undefined") {
  scContentEditorUpdated = function () {
    scForm.disableRequests = false;

    var body = p$(document.body);
    var editor = p$("ContentEditor");
    if (editor) {
      body.fire("sc:contenteditorupdated");

      // obsolete. should only fire on body instead(above).
      editor.fire("sc:contenteditorupdated");
    }

    if (typeof (scGeckoRelayout) != "undefined") {
      scForm.browser.initializeFixsizeElements(true);
      scGeckoRelayout();
    }
  }
}

function scSave(postaction) {
  var saveButton = $('scRibbonButton_Save');
  //Workaround for FF not appriciating disabled attribute
  if (saveButton && saveButton.disabled) {
    return;
  }
  
  Sitecore.PageEditorProxy.save(postaction);  
}

function scBeginEdit() {
  scForm.postRequest('','','','webedit:beginedit');
}

function scNew() {
  scForm.postRequest('','','','webedit:new');
}

function scNewRendering() {
  Sitecore.PageEditorProxy.showRenderingTargets();
}

function scDelete(id) {
  scForm.postRequest('','','','webedit:delete(id=' + id + ')');
}

function scSetLayout() {
  scForm.postRequest('','','','webedit:changelayout');
}

function scClose() {
  scForm.postRequest('','','','webedit:close');
}

function scSearch() {
  scForm.postRequest('','','','webedit:search');
}

function scNotifications() {
    scForm.postRequest('', '', '', 'webedit:notifications');
}

function scNavigate(href) {
  window.parent.location.href = href;
}

function scSetHtmlValue(controlid, preserveInnerContent, clearIfEmpty) {
  var ctl = $.noConflict ? window.parent.document.getElementById("scHtmlValue") : $("scHtmlValue");
  if (ctl == null) {
    return;
  }
  
  var plainValueControl = $.noConflict ? window.parent.document.getElementById("scPlainValue") : $("scPlainValue");
  if (plainValueControl == null) {
    return;
  }
  
  var value = ctl.value;
  var plainValue = plainValueControl.value;
  
  ctl.value = "";
  plainValueControl.value = "";
  
  var win = window.parent;
  if (win == null) {
    return;
  }
 
  if (!clearIfEmpty && typeof(plainValue) != "undefined" && !plainValue.length) {
    plainValue = undefined;
  }

  Sitecore.PageEditorProxy.updateField(controlid, value, plainValue, preserveInnerContent);
}

function scSetSaveButtonState(isEnabled) {
  var saveButtonState = window.parent.document.getElementById("__SAVEBUTTONSTATE");
  if (document.querySelector('[data-sc-id="QuickSave"]') != null
    && saveButtonState) {
    if (isEnabled) {
      saveButtonState.value = 1;
      saveButtonState.onchange();
    } else {
      setTimeout(function () { // IE related Fix
        try {
          var chromes = window.parent.Sitecore.PageModes.ChromeManager.chromes();
          for (var i = 0; i < chromes.length; i++) {
            chromes[i].type.load();
          }
        } catch (error) {
          console.warn("Attempt to make chrome element editable failed.\n" + error);
        }
      }, 1000);
    }

    return;
  }

  var scSaveButton = $("scRibbonButton_Save"); 
  if (scSaveButton == null) {
    return;
  }
  
  // the state is not defined. Get the persisted value from hidden input
  if (typeof(isEnabled) == "undefined") {
    isEnabled = $("__SAVEBUTTONSTATE").value == 1;
  }

  scSaveButton.disabled = !isEnabled;
  $("__SAVEBUTTONSTATE").value = isEnabled ? "1" : "0";
  if (isEnabled) {
    scSaveButton.removeClassName("scDisabledButton");
    if (typeof(disabledSaveIcon) != 'undefined') {
      var icon = scSaveButton.select("img")[0];
      if (icon != null && enabledSaveIcon != null) {
        icon.src = enabledSaveIcon;
      }
    }
  }
  else {
    scSaveButton.addClassName("scDisabledButton");
    var icon = scSaveButton.select("img")[0];    
    if (icon && typeof(disabledSaveIcon) != 'undefined') {
      if (enabledSaveIcon == null) {
        enabledSaveIcon = icon.src;
      }

      icon.src = disabledSaveIcon;
    }
  }      
}

function scShowRibbon() {  
  scSetRibbonVisibility(!isRibbonVisible);    
  var toggleIcon = $("scToggleRibbon");
  if (toggleIcon) {
    toggleIcon.src = isRibbonVisible ? 
                "/sitecore/shell/themes/standard/Images/WebEdit/more_expanded.png" :
                "/sitecore/shell/themes/standard/Images/WebEdit/more_collapsed.png";
  }
    
  scAdjustSize();  
  scForm.setCookie("sitecore_webedit_ribbon", isRibbonVisible ? "1" : "0");

  if (!isRibbonVisible) {
    scDiactiveCurrentTab();
  }    
}

function scShowPalette() {
  window.top.location.href = scSetDesigning(true);
}

function scOnLoad() { 
  scAdjustPositioning();
  var tabsContainer = $$(".scRibbonNavigatorButtonsGroupButtons");
  if (tabsContainer != null && tabsContainer.length > 0 ) {
    tabsContainer = tabsContainer[0];
    tabsContainer.childElements().each( function(tab) {
      tab.observe("click", scTabClicked);
      tab.observe("dblclick", scTabDblClicked);
    });
  }
     
  if (scIsRibbonFixed()) {    
    window.parent.$sc("<div id='scCrossPiece' style='visibility: hidden'> </div>")
      .prependTo(window.parent.document.body);    
  }
 
  scAdjustSize(); 
  Event.observe(document.body, "contextmenu", function(e) {  
    e.stop();
  });

  prepareHeaderButtons();

  if (window.parent.NotifcationMessages != undefined) {
    window.parent.NotifcationMessages.forEach(function (entry) {
      console.log(entry);
      var notificaton = new window.parent.Sitecore.PageModes.Notification("pageeditorchrome" + entry.text, entry.text, {
        type: entry.type
      });
      Sitecore.PageEditorProxy.showNotification(notificaton);
    });
  }
}

function prepareHeaderButtons() {
  var globalLogo = document.getElementsByClassName("sc-global-logo");
  if (globalLogo.length > 0) {
    globalLogo[0].setAttribute("target", "_parent");
  }
}

function scAdjustSize() {
  var frame = scForm.browser.getFrameElement(window);    
  frame.style.height = "1px"; 
  var height = (scForm.browser.isQuirksMode ? document.body : document.documentElement).scrollHeight;
  var crossPiece = window.parent.document.getElementById("scCrossPiece");   
  if (crossPiece) {      
    crossPiece.style.height = "" + height + "px";
  }

  var frameElement = window.parent.$sc(frame);
  if (frameElement) 
  {
   if (!isRibbonVisible) {
    frameElement.addClass("scCollapsedRibbon");
   }
   else {
    frameElement.removeClass("scCollapsedRibbon");
   }

   if (scIsTreecrumbVisible() && isRibbonVisible) {
      frameElement.addClass("scTreecrumbVisible");
   }
   else
   {
      frameElement.removeClass("scTreecrumbVisible");
   }
  }

  frame.style.height = "" + height + "px";
}

function execFunction(func) {
  if (!func || typeof (func) != "function") {
    return;
  }

  func();
}

function modalDialogLazyLoading() {
  // JqueryModalDialogs lazy initialization
  if (typeof (top.scIsDialogsInitialized) != "undefined") {
    return;
  }

  top.scIsDialogsInitialized = true;
  top.scForm = { getTopModalDialog: window.scForm.getTopModalDialog, keymap: scSitecore.keymap || {}, translate: scSitecore.prototype.translate };
  top.dialogInit = scSitecore.prototype.initializeModalDialogs;
  top.initModalDialog = function (callbackFunc) {
    var jqueryModalDialogsFrame = top.document.getElementById("jqueryModalDialogsFrame");
    if (jqueryModalDialogsFrame) {
      execFunction(callbackFunc);
      return;
    }

    top.scIsDialogsInitialized = false;
    top.dialogInit();

    var interval = setInterval(function() { 
      var jqueryModalDialogsFrame = top.document.getElementById("jqueryModalDialogsFrame");
      if (jqueryModalDialogsFrame && jqueryModalDialogsFrame.contentWindow.showModalDialog) {
        clearInterval(interval);
        execFunction(callbackFunc);
      }
    }, 10);

  };

  var eventName = "click";
  var listener = function (event) {
    top.initModalDialog();
    document.removeEventListener(eventName, listener);
    window.parent.document.removeEventListener(eventName, listener);
  };
  document.addEventListener(eventName, listener);
  window.parent.document.addEventListener(eventName, listener);
}

if (typeof (scSitecore) != 'undefined') {
  modalDialogLazyLoading();
  scBrowser.prototype.getControlEx = scBrowser.prototype.getControl;
  scBrowser.prototype.getControl = function (id, doc) {
    var control = this.getControlEx(id, doc);
    if (control == null) {
      control = this.getControlEx(id, window.parent.document);
    }

    return control;
  };

  scSitecore.prototype.setModifiedEx = scSitecore.prototype.setModified;
  scSitecore.prototype.setModified = function (value) {
    scSetSaveButtonState(value);
    this.setModifiedEx(value);
  }

  scSitecore.prototype.onKeyDownEx = scSitecore.prototype.onKeyDown;
  scSitecore.prototype.onKeyDown = function(evt) {
    var e = (evt != null ? evt : window.event);
    if (e && e.ctrlKey && e.keyCode == 83) {
      //Ctrl + S is handled in Page Editor        
      return;
    }

    this.onKeyDownEx(evt);
  };
  
  scSitecore.prototype.postRequestUrlRewriter = function (url) {
    var webFormRibbon = "/sitecore/shell/Applications/WebEdit/WebEditRibbon.aspx";
    if (url.indexOf(webFormRibbon) != -1) {
      return url;
    }

    var frame = document.getElementById("scWebEditRibbon") || window.parent.document.getElementById("scWebEditRibbon");
    var frameUrl = frame.src.replace("&sc_lang=", "&la=");
    frameUrl = frameUrl.replace("&itemId=", "&id=");
    frameUrl = frameUrl.replace("&deviceId=", "&dev=");
    frameUrl = frameUrl.replace("&database=", "&db=");
    frameUrl = frameUrl.replace("&lang=", "&la=");
    frameUrl = frameUrl.replace("&sc_content=core", "&sc_content=master");
    frameUrl = frameUrl.replace("?sc_content=core", "?sc_content=master");
    frameUrl += "&sc_speakribbon=1";
    frameUrl = frameUrl.replace("/sitecore/client/Applications/ExperienceEditor/Ribbon.aspx", webFormRibbon);
    var index = frameUrl.indexOf(webFormRibbon);
    frameUrl = frameUrl.substring(index, frameUrl.length);

    return frameUrl;
  };

   scSitecore.prototype.postRequestEx = scSitecore.prototype.postRequest;
   scSitecore.prototype.postRequest = function (control, source, eventtype, parameters, callback, async) {
     var res = this.postRequestEx(control, source, eventtype, parameters, callback, async);
     if (parameters && (parameters === "item:save" || parameters.indexOf("item:save(") === 0) && res !== "failed") {
       Sitecore.PageEditorProxy.onSaving();
     }

     if (parameters && parameters === "webedit:save" && res !== "failed") {
       window.parent.location.reload(true);
     }

     return res;
   };
}

scRequest.prototype.buildFieldsEx = scRequest.prototype.buildFields;

scRequest.prototype.buildFields = function (doc) {
  this.buildFieldsEx(parent.document);

  this.form = this.form.replace("__VIEWSTATE=", "__VIEWSTATE2=");
  
  // Issue:311421
  this.form = this.form.replace("__PREVIOUSPAGE=", "__PREVIOUSPAGE2=");
  
  this.buildFieldsEx();
}

if (typeof (scContentEditor) != "undefined") {
  scContentEditor.prototype.setActiveStripEx = scContentEditor.prototype.setActiveStrip;

  scContentEditor.prototype.setActiveStrip = function(id, toggleRibbon) {
    scContentEditor.prototype.setActiveStripEx(id, toggleRibbon);

    var ctl = scForm.browser.getControl("scActiveRibbonStrip");

    if (ctl != null) {
      scForm.setCookie("sitecore_webedit_activestrip", ctl.value);
    }

    scFixIeMinMaxWidth();
  }

  scContentEditor.prototype.showGallery = function(sender, evt, id, src, parameters, width, height, where) {
    this.showOutOfFrameGallery(sender, evt, src, { width: width, height: height }, parameters);
  }
}

function scSetDesigning(enabled) {
  var page = window.top.location.href;
  
  var params = page.toQueryParams();
  
  if (enabled) {
    params["sc_de"] = "1";
  }
  else {
    delete params["sc_de"];
  }
  
  var n = page.indexOf("?");
  if (n >= 0) {
    page = page.substr(0, n + 1);
  }
  else {
    page += "?";
  }

  return page + Object.toQueryString(params);
}

function scSetModified(modified) {
  var doc = scForm.browser.getParentWindow(scForm.browser.getFrameElement(window).ownerDocument);

  if (doc.Sitecore.WebEdit) {
    doc.Sitecore.WebEdit.modified = modified;
  }
  else {
    doc.Sitecore.Designer.setModified(modified);
  }
}

function scTabClicked() {      
  scSavedTab = null;
  if (!isRibbonVisible) {
     var param = new Object();
     param.target = $$("a.scToggleIcon img")[0];
     scShowRibbon(param);
  }
}

function scTabDblClicked(e) { 
  if (isRibbonVisible) {
     var param = new Object();
     param.target = $$("a.scToggleIcon img")[0];
     scShowRibbon(param);
  }
}

function scSetRibbonVisibility(visibility) {
  var ribbon = $("Ribbon");
  if (ribbon.down() && ribbon.down().hasClassName("scRibbonNavigator")) {
    ribbon = $("Ribbon_Toolbar");    
  }
  else {
    ribbon = $("RibbonPane");    
  }

  var treeCrumb = $("TreecrumbPane");
  var notifications = $("NotificationPane");
  isRibbonVisible = visibility;
  if (isRibbonVisible) {
    ribbon.show();
    if (scIsTreecrumbVisible()) {
      treeCrumb.show();
    }
    notifications.show();
    if (scSavedTab != null) {
      scSavedTab.className = "scRibbonNavigatorButtonsActive";
    }
  }
  else {
    ribbon.hide();
    treeCrumb.hide();
    notifications.hide();
  }
}

function scDiactiveCurrentTab() {
  var activeTabs = $$(".scRibbonNavigatorButtonsActive");
  if (activeTabs != null && activeTabs.length > 0) {      
    activeTabs[0].className = "scRibbonNavigatorButtonsNormal";
    scSavedTab = activeTabs[0];
  }
}

function scAdjustPositioning() {
  var buttonsContainer = $("Buttons");
  if (buttonsContainer == null) return;
  var commands = buttonsContainer.select(".scCommandIcon, .scMenuDevider");
  var commandWidth = 0;
  if (commands.length > 0) {
    commandWidth = commands[0].measure("margin-box-width");      
  }

  var deviders = buttonsContainer.select(".scMenuDevider");
  var deviderWidth = 0;
   if (deviders.length > 0) {
    deviderWidth = deviders[0].measure("margin-box-width");      
  }

  var ribbonNavigators = $$(".scRibbonNavigator");
  //Set the navigator margin according to the number of commands
  if (ribbonNavigators.length > 0 && ribbonNavigators[0].visible()) {
    ribbonNavigators[0].setStyle({ marginLeft: commands.length * commandWidth + deviders.length * deviderWidth + 12 + "px" });
  }
  // There's no ribbon tabs. Add the margin to the toolbar to avoid overlaping with commands
  else if (buttonsContainer.childElements
    && buttonsContainer.childElements().length > 0) {
    var ribbonPanel = $("RibbonPanel");
    if (ribbonPanel) {
      var marginValue = buttonsContainer.measure("border-box-height");
      if (marginValue >= 1 && Prototype.Browser.IE) {
        marginValue -= 1;
      }

      ribbonPanel.setStyle({ marginTop: marginValue + "px" });
    }
  }

  scFixIeMinMaxWidth();
}

function scFixIeMinMaxWidth() {
  if (!scForm.browser.isIE) {
    return;
  }

  var elementsToFix = $$(".scFixIeMinMaxWidth");
  elementsToFix.each(function(elem) {
    var maxWidth = parseInt(elem.getStyle("max-width"));
    var minWidth = parseInt(elem.getStyle("min-width"));
    maxWidth = maxWidth ? maxWidth : 9999;
    minWidth = minWidth ? minWidth : 0;
    var width = elem.getWidth();
    if (width > 0) {
      elem.removeClassName("scFixIeMinMaxWidth");
    }

    if (width > maxWidth) {
      elem.setStyle({ width: maxWidth + "px" });
      return;
    }

    if (width < minWidth) {
      elem.setStyle({ width: minWidth + "px" });
    }
  });
}

function scShowControlsClick(enabled) {  
  Sitecore.PageEditorProxy.changeShowControls(enabled);
  // enforce ribbon refresh
    scRefreshRibbon();
}

function scShowOptimizationClick(enabled) {
    Sitecore.PageEditorProxy.changeShowOptimization(enabled);
    // enforce ribbon refresh
    scRefreshRibbon();
}


function scCapabilityClick(capability, enabled) {    
  Sitecore.PageEditorProxy.changeCapability(capability, enabled);
  // enforce ribbon refresh to make capabilty button have appropriate state
    scRefreshRibbon();
}

function scShowTreecrumb(isTreecrumbVisisble)
{ 
  if (!isTreecrumbVisisble) {   
    scTreecrumbVisible = false;
    $("TreecrumbPane").hide();    
  }
  else {
    scTreecrumbVisible = true;    
    $("TreecrumbPane").show();
  }

  // enforce ribbon refresh
    scRefreshRibbon();
  scAdjustSize();
}


function scToggleControlBar(isVisible) {
  scControlBar = isVisible;    
  Sitecore.PageEditorProxy.controlBarStateChange();
   // enforce ribbon refresh
    scRefreshRibbon();
}

function scIsRibbonFixed() {
  if (isRibbonFixed == null) {
    var frame = window.parent.$sc("#scWebEditRibbon")
    if (frame && frame.length > 0) {
      isRibbonFixed = frame.hasClass("scFixedRibbon");
    }
  }

  return isRibbonFixed;
}

function scIsTreecrumbVisible() {
  return typeof(scTreecrumbVisible) != 'undefined' && scTreecrumbVisible == true;
}

function scShowComponentsGallery(sender, e, galleryName, dimensions, params) {
  var layout = Sitecore.PageEditorProxy.layout();
  var deviceID = Sitecore.PageEditorProxy.deviceId();
  if (!params) {
    params = {};
  }

  params.layout = layout;
  params.device = deviceID;
 
  params.isTestRunning = Sitecore.PageEditorProxy.isTestRunning();
  return scContent.showOutOfFrameGallery(sender,e, galleryName, dimensions, params, "POST");
}

function scShowItemDeletedNotification(text) {
  if (!window.scShowDeletedNotification) {
    return;
  }

  var win = window.parent;
  var notificaton = new win.Sitecore.PageModes.Notification("itemdeleted", text, {
    type: "error"
  });

  Sitecore.PageEditorProxy.showNotification(notificaton);
  window.scShowDeletedNotification = false; 
}

function scRefreshRibbon() {
  scForm.postRequest("", "", "", "ribbon:update", null, true);
}﻿if (typeof(Sitecore) == "undefined") {
  Sitecore = {}
}

Sitecore.PageEditorProxy = new function() {
  this._instance = null;
  this._pe = function() {
    if (this._instance) {
      return this._instance;
    }
    
    var win = window.self;
    while (true) {
      if (win.Sitecore && win.Sitecore.PageModes) {
        this._instance = win.Sitecore.PageModes.PageEditor;
        break;
      }

      if (win == window.top) {
        break;
      }

      win = win.parent;
    } 
        
    return this._instance || this._getStub(); 
  };

  this.changeCapability = function(capability, enabled) {
    this._pe().changeCapability(capability, enabled);
  }

  this.changeShowControls = function(enabled) {
    this._pe().changeShowControls(enabled);
  };
    
  this.changeShowOptimization = function (enabled) {
      this._pe().changeShowOptimization(enabled);
  };

  this.changeVariations = function(combination, selectChrome) {
    this._pe().changeVariations(combination, selectChrome);
  };

  this.editVariationsComplete = function(controlId, params) {
    this._pe().editVariationsComplete(controlId, params);
  };
  
  this.deviceId = function() {
    return this._pe().deviceId();
  };

  this.isTestRunning = function() {
    return this._pe().isTestRunning();
  };

  this.itemId = function() {
    return this._pe().itemId();
  };

  this.language = function() {
    return this._pe().language();
  };

  this.layout = function() {
    return this._pe().layout();
  };

  this.getTestingComponents = function() {
     return this._pe().getTestingComponents();
  };

  this.onSaving = function() {
    this._pe().onSaving();
  };

  this.controlBarStateChange = function() {
    this._pe().controlBarStateChange();
  };

  this.refreshRibbon = function() {
    this._pe().refreshRibbon();
  };

  this.save = function(postaction) {
    this._pe().save(postaction);
  };

  this.selectElement = function(id, sender, e) {
    this._pe().selectElement(id);
  };

  this.showNotification = function(notification) {
    this._pe().notificationBar.addNotification(notification);
    this._pe().showNotificationBar();
  };

  this.showRenderingTargets = function() {
    this._pe().showRenderingTargets();
  };

  this.updateField = function(controlid, value, plainValue, preserveInnerContent) {
    this._pe().updateField(controlid, value, plainValue, preserveInnerContent);
  };

  this._getStub = function() {
    if (this._stub) {
      return this._stub;
    }

    var stub = {};
    for (var n in this) {
      if (this.hasOwnProperty(n)) {
        stub[n] = this._logNotSupported;
      }
    }

    stub.notificationBar = {};
    stub.notificationBar.addNotification = this._logNotSupported;
    stub.notificationBar.showNotificationBar = this._logNotSupported; 
    this._stub = stub;
    return this._stub;
  };

  this._logNotSupported = function() {
    if (window.top && window.top.console) {
      window.top.console.log("Not supported operation")
    }
  };
}