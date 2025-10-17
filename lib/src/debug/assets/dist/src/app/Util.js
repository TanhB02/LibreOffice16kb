// @ts-strict-ignore
/* -*- js-indent-level: 8 -*- */
/*
 * Copyright the Collabora Online contributors.
 *
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var Util = /** @class */ (function () {
    function Util() {
    }
    Util.nextId = function () {
        return ++Util.lastId;
    };
    /// Returns the id of the object. Initializes it if necessary.
    Util.stamp = function (obj) {
        if (obj._leaflet_id > 0) {
            return obj._leaflet_id;
        }
        obj._leaflet_id = Util.nextId();
        return obj._leaflet_id;
    };
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    Util.merge = function (one, two) {
        return __assign(__assign({}, one), two);
    };
    // return a function that won't be called more often than the given interval
    Util.throttle = function (fn, time, 
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    context) {
        var lock = false;
        // eslint-disable-next-line prefer-const
        var wrapperFn;
        var args = false;
        var later = function () {
            // reset lock and call if queued.
            lock = false;
            if (args) {
                wrapperFn.apply(context, args);
                args = false;
            }
        };
        wrapperFn = function () {
            var args_ = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args_[_i] = arguments[_i];
            }
            if (lock) {
                // called too soon, queue to call later
                args = args_;
            }
            else {
                // call and lock until later
                fn.apply(context, args_);
                setTimeout(later, time);
                lock = true;
            }
        };
        return wrapperFn;
    };
    // wrap the given number to lie within a certain range (used for wrapping longitude)
    Util.wrapNum = function (x, range, includeMax) {
        var max = range[1];
        var min = range[0];
        var d = max - min;
        return x === max && includeMax ? x : ((((x - min) % d) + d) % d) + min;
    };
    // do nothing (used as a noop throughout the code)
    Util.falseFn = function () {
        return false;
    };
    // round a given number to a given precision
    Util.formatNum = function (num, digits) {
        var pow = Math.pow(10, digits || 5);
        return Math.round(num * pow) / pow;
    };
    // removes prefix from string if string starts with that prefix
    Util.trimStart = function (str, prefix) {
        if (str.indexOf(prefix) === 0)
            return str.substring(prefix.length);
        return str;
    };
    // removes suffix from string if string ends with that suffix
    Util.trimEnd = function (str, suffix) {
        var suffixIndex = str.lastIndexOf(suffix);
        if (suffixIndex !== -1 && str.length - suffix.length === suffixIndex)
            return str.substring(0, suffixIndex);
        return str;
    };
    // removes given prefix and suffix from the string if exists
    // if suffix is not specified, prefix is trimmed from both end of string
    // trim whitespace from both sides of a string if prefix and suffix are not given
    Util.trim = function (str, prefix, suffix) {
        if (!prefix)
            return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
        var result = Util.trimStart(str, prefix);
        result = Util.trimEnd(result, suffix);
        return result;
    };
    // split a string into words
    Util.splitWords = function (str) {
        return Util.trim(str).split(/\s+/);
    };
    Util.round = function (x, e) {
        if (!e) {
            return Math.round(x);
        }
        var f = 1.0 / e;
        return Math.round(x * f) * e;
    };
    // super-simple templating facility, used for TileLayer URLs
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    Util.template = function (str, data) {
        return str.replace(Util.templateRe, function (str, key) {
            var value = data[key];
            if (value === undefined) {
                throw new Error('No value provided for variable ' + str);
            }
            else if (typeof value === 'function') {
                value = value(data);
            }
            return value;
        });
    };
    Util.toggleFullScreen = function () {
        var doc = document;
        if (!doc.fullscreenElement &&
            !doc.mozFullscreenElement &&
            !doc.msFullscreenElement &&
            !doc.webkitFullscreenElement) {
            if (doc.documentElement.requestFullscreen) {
                doc.documentElement.requestFullscreen();
            }
            else if (doc.documentElement.msRequestFullscreen) {
                doc.documentElement.msRequestFullscreen();
            }
            else if (doc.documentElement.mozRequestFullScreen) {
                doc.documentElement.mozRequestFullScreen();
            }
            else if (doc.documentElement.webkitRequestFullscreen) {
                doc.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        }
        else if (doc.exitFullscreen) {
            doc.exitFullscreen();
        }
        else if (doc.msExitFullscreen) {
            doc.msExitFullscreen();
        }
        else if (doc.mozCancelFullScreen) {
            doc.mozCancelFullScreen();
        }
        else if (doc.webkitExitFullscreen) {
            doc.webkitExitFullscreen();
        }
    };
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    Util.isEmpty = function (o) {
        return !(o && o.length);
    };
    Util.mm100thToInch = function (mm) {
        return mm / 2540;
    };
    Util.getTempCanvas = function () {
        if (Util._canvas) {
            return Util._canvas;
        }
        Util._canvas = document.createElement('canvas');
        return Util._canvas;
    };
    Util.getTextWidth = function (text, font) {
        var canvas = Util.getTempCanvas();
        var context = canvas.getContext('2d');
        context.font = font;
        var metrics = context.measureText(text);
        return Math.floor(metrics.width);
    };
    Util.getProduct = function () {
        var brandFAQURL = typeof brandProductFAQURL !== 'undefined'
            ? brandProductFAQURL
            : 'https://collaboraonline.github.io/post/faq/';
        var customWindow = window;
        if (customWindow.feedbackUrl && customWindow.buyProductUrl) {
            var integratorUrl = encodeURIComponent(customWindow.buyProductUrl);
            brandFAQURL = customWindow.feedbackUrl;
            brandFAQURL =
                brandFAQURL.substring(0, brandFAQURL.lastIndexOf('/')) +
                    '/product.html?integrator=' +
                    integratorUrl;
        }
        return brandFAQURL;
    };
    Util.replaceCtrlAltInMac = function (msg) {
        if (L.Browser.mac) {
            var ctrl = /Ctrl/g;
            var alt = /Alt/g;
            var CustomString = String;
            if (CustomString.locale.startsWith('de') ||
                CustomString.locale.startsWith('dsb') ||
                CustomString.locale.startsWith('hsb')) {
                ctrl = /Strg/g;
            }
            if (CustomString.locale.startsWith('lt')) {
                ctrl = /Vald/g;
            }
            if (CustomString.locale.startsWith('sl')) {
                ctrl = /Krmilka/gi;
                alt = /Izmenjalka/gi;
            }
            return msg.replace(ctrl, '⌘').replace(alt, '⌥');
        }
        return msg;
    };
    Util.randomString = function (len) {
        var result = '';
        var ValidCharacters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        for (var i = 0; i < len; i++) {
            result += ValidCharacters.charAt(Math.floor(Math.random() * ValidCharacters.length));
        }
        return result;
    };
    Util.requestAnimFrame = function (fn, 
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    context) {
        return window.requestAnimationFrame(fn.bind(context));
    };
    Util.cancelAnimFrame = function (id) {
        if (id) {
            window.cancelAnimationFrame(id);
        }
    };
    Util.lastId = 0;
    Util.templateRe = /\{ *([\w_]+) *\}/g;
    Util.isArray = Array.isArray ||
        function (obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        };
    // minimal image URI, set to an image when disposing to flush memory
    Util.emptyImageUrl = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
    Util._canvas = null;
    Util.MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;
    Util.MIN_SAFE_INTEGER = -Util.MAX_SAFE_INTEGER;
    return Util;
}());
app.util = Util;
//# sourceMappingURL=Util.js.map