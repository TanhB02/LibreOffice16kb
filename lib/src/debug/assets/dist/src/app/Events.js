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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var Evented = /** @class */ (function (_super) {
    __extends(Evented, _super);
    function Evented(outerObject) {
        var _this = _super.call(this) || this;
        _this._eventsAuto = new Map();
        _this._eventsExt = new Map();
        _this._numEvents = new Map();
        _this._eventParents = new Map();
        _this._outerObject = outerObject ? outerObject : _this;
        return _this;
    }
    Evented.prototype.on = function (types, fn, context) {
        var e_1, _a;
        if (typeof types === 'string') {
            // types can be a list of event names strings delimited by spaces.
            var parts = Util.splitWords(types);
            for (var i = 0, len = parts.length; i < len; i++) {
                this._addEventHandlerImpl(parts[i], fn, context);
            }
        }
        // types can be a map of types/handlers
        else if (types instanceof Map) {
            try {
                for (var types_1 = __values(types), types_1_1 = types_1.next(); !types_1_1.done; types_1_1 = types_1.next()) {
                    var _b = __read(types_1_1.value, 2), type = _b[0], listener = _b[1];
                    this._addEventHandlerImpl(type, listener, fn);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (types_1_1 && !types_1_1.done && (_a = types_1.return)) _a.call(types_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        // types can also be a generic object with type-name as properties and
        // handlers as their values.
        else {
            var typeNames = Object.keys(types);
            for (var i_1 = 0, len_1 = typeNames.length; i_1 < len_1; ++i_1) {
                var typeName = typeNames[i_1];
                var listener = types[typeName];
                this._addEventHandlerImpl(typeName, listener, fn);
            }
        }
        return this;
    };
    Evented.prototype.off = function (types, fn, context) {
        var e_2, _a;
        if (!types) {
            // clear all handler maps if called without arguments.
            this._eventsExt.clear();
            this._eventsAuto.clear();
            this._numEvents.clear();
        }
        else if (typeof types === 'string') {
            var parts = Util.splitWords(types);
            for (var i = 0, len = parts.length; i < len; i++) {
                this._removeEventHandlerImpl(parts[i], fn, context);
            }
        }
        else if (types instanceof Map) {
            try {
                for (var types_2 = __values(types), types_2_1 = types_2.next(); !types_2_1.done; types_2_1 = types_2.next()) {
                    var _b = __read(types_2_1.value, 2), type = _b[0], listener = _b[1];
                    this._removeEventHandlerImpl(type, listener, fn);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (types_2_1 && !types_2_1.done && (_a = types_2.return)) _a.call(types_2);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
        else {
            var typeNames = Object.keys(types);
            for (var i_2 = 0, len_2 = typeNames.length; i_2 < len_2; ++i_2) {
                var typeName = typeNames[i_2];
                var listener = types[typeName];
                this._removeEventHandlerImpl(typeName, listener, fn);
            }
        }
        return this;
    };
    Evented.prototype._addHandlerForeignCtxt = function (foreignCtxtId, type, fn, context) {
        // Store handlers with 'foreign' contexts and their count in separate maps.
        if (!this._eventsExt.has(type)) {
            this._eventsExt.set(type, new Map());
        }
        var typeIndex = this._eventsExt.get(type);
        var id = Util.stamp(fn) + '_' + foreignCtxtId;
        if (!typeIndex.has(id)) {
            typeIndex.set(id, { fn: fn, ctx: context });
            // keep track of the number of keys in the index to quickly check if it's empty
            var count = this._numEvents.has(type) ? this._numEvents.get(type) : 0;
            this._numEvents.set(type, count + 1);
        }
    };
    Evented.prototype._addEventHandlerImpl = function (type, fn, context) {
        var foreignCtxtId = 0;
        // After killing L.Evented, the following check should change to
        // context !== this.
        if (context && context !== this._outerObject) {
            foreignCtxtId = Util.stamp(context);
        }
        if (foreignCtxtId) {
            this._addHandlerForeignCtxt(foreignCtxtId, type, fn, context);
        }
        else {
            // Context is the current Evented object itself.
            // Append just the handler to 'auto' map (context is implicitly known).
            // eslint-disable-next-line no-lonely-if
            if (!this._eventsAuto.has(type)) {
                this._eventsAuto.set(type, [{ fn: fn }]);
            }
            else {
                this._eventsAuto.get(type).push({ fn: fn });
            }
        }
    };
    Evented.prototype._removeHandlerForeignCtxt = function (foreignCtxtId, type, fn) {
        var listener = null;
        var id = Util.stamp(fn) + '_' + foreignCtxtId;
        var listeners = this._eventsExt.get(type);
        if (listeners && listeners.get(id)) {
            listener = listeners.get(id);
            listeners.delete(id);
            this._numEvents.set(type, this._numEvents.get(type) - 1);
        }
        return listener;
    };
    Evented.prototype._removeHandlerSelfCtxt = function (type, fn) {
        var listener = null;
        var listeners = this._eventsAuto.get(type);
        if (listeners) {
            var len = listeners.length;
            for (var i = 0; i < len; i++) {
                if (listeners[i].fn === fn) {
                    listener = listeners[i];
                    listeners.splice(i, 1);
                    break;
                }
            }
        }
        return listener;
    };
    Evented.prototype._removeEventHandlerImpl = function (type, fn, context) {
        if (!this._eventsExt.size && !this._eventsAuto.size) {
            return;
        }
        if (!fn) {
            // clear all handler maps for the type if handler isn't specified.
            this._eventsExt.delete(type);
            this._numEvents.delete(type);
            this._eventsAuto.delete(type);
            return;
        }
        var foreignCtxtId = 0;
        // After killing L.Evented, the following check should change to
        // context !== this.
        if (context && context !== this._outerObject) {
            foreignCtxtId = Util.stamp(context);
        }
        var listener;
        if (foreignCtxtId) {
            listener = this._removeHandlerForeignCtxt(foreignCtxtId, type, fn);
        }
        else {
            listener = this._removeHandlerSelfCtxt(type, fn);
        }
        // ensure the removed handler is not called if remove happens in fire
        if (listener) {
            listener.fn = Util.falseFn;
        }
    };
    Evented.prototype.fire = function (type, data, propagate) {
        var e_3, _a;
        if (!this.listens(type, propagate)) {
            return this;
        }
        var event = __assign(__assign({}, data), { type: type, target: this._outerObject });
        if (this._eventsExt.size || this._eventsAuto.size) {
            var typeIndex = this._eventsExt.get(type);
            var simpleListeners = this._eventsAuto.get(type);
            if (simpleListeners) {
                // Don't cause an infinite loop due to nested .on()/.off() calls.
                // Make a copy of the array to ensure this.
                var listeners = simpleListeners.slice();
                for (var i = 0, len = listeners.length; i < len; i++) {
                    listeners[i].fn.call(this._outerObject, event);
                }
            }
            if (typeIndex) {
                try {
                    // fire event using foreign context handlers as well.
                    for (var typeIndex_1 = __values(typeIndex), typeIndex_1_1 = typeIndex_1.next(); !typeIndex_1_1.done; typeIndex_1_1 = typeIndex_1.next()) {
                        var _b = __read(typeIndex_1_1.value, 2), _1 = _b[0], value = _b[1];
                        value.fn.call(value.ctx, event);
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (typeIndex_1_1 && !typeIndex_1_1.done && (_a = typeIndex_1.return)) _a.call(typeIndex_1);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
            }
        }
        if (propagate) {
            // Call fire() on this instance's parents.
            this._propagateEvent(event);
        }
        return this;
    };
    Evented.prototype.addEventParent = function (obj) {
        this._eventParents.set(Util.stamp(obj), obj);
        return this;
    };
    Evented.prototype.removeEventParent = function (obj) {
        if (this._eventParents.size) {
            this._eventParents.delete(Util.stamp(obj));
        }
        return this;
    };
    Evented.prototype.hasContextListeners = function (type) {
        if (!this._eventsExt.size) {
            return false;
        }
        var mp = this._eventsExt.get(type);
        if (!mp || !mp.size) {
            return false;
        }
        return true;
    };
    Evented.prototype.hasNoContextListener = function (type) {
        if (!this._eventsAuto.size) {
            return false;
        }
        var arr = this._eventsAuto.get(type);
        if (!arr || !arr.length) {
            return false;
        }
        return true;
    };
    Evented.prototype.listens = function (type, propagate) {
        var e_4, _a;
        if (this.hasContextListeners(type) || this.hasNoContextListener(type)) {
            return true;
        }
        if (propagate) {
            try {
                // also see if parents are listening in this case.
                for (var _b = __values(this._eventParents), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = __read(_c.value, 2), _2 = _d[0], parent_1 = _d[1];
                    if (parent_1.listens(type, propagate)) {
                        return true;
                    }
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_4) throw e_4.error; }
            }
        }
        return false;
    };
    Evented.prototype.once = function (types, fn, context) {
        var e_5, _a;
        if (typeof types == 'string') {
            var handler = function () {
                this.off(types, fn, context).off(types, handler, context);
            }.bind(this);
            // add a handler which is executed once and removed soon after.
            return this.on(types, fn, context).on(types, handler, context);
        }
        else if (types instanceof Map) {
            try {
                for (var types_3 = __values(types), types_3_1 = types_3.next(); !types_3_1.done; types_3_1 = types_3.next()) {
                    var _b = __read(types_3_1.value, 2), type = _b[0], listener = _b[1];
                    this.once(type, listener, fn);
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (types_3_1 && !types_3_1.done && (_a = types_3.return)) _a.call(types_3);
                }
                finally { if (e_5) throw e_5.error; }
            }
            return this;
        }
        else {
            var typeNames = Object.keys(types);
            for (var i = 0, len = typeNames.length; i < len; ++i) {
                var typeName = typeNames[i];
                var listener = types[typeName];
                this.once(typeName, listener, fn);
            }
            return this;
        }
    };
    Evented.prototype._propagateEvent = function (e) {
        var e_6, _a;
        try {
            for (var _b = __values(this._eventParents), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), _3 = _d[0], parent_2 = _d[1];
                parent_2.fire(e.type, __assign({ layer: e.target }, e), true);
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_6) throw e_6.error; }
        }
    };
    return Evented;
}(BaseClass));
app.Evented = Evented;
//# sourceMappingURL=Events.js.map