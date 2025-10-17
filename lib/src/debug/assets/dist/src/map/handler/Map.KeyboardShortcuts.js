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
function isCtrlKey(e) {
    if (window.ThisIsTheiOSApp || L.Browser.mac)
        return e.metaKey;
    else
        return e.ctrlKey;
}
function isMacCtrlKey(e) {
    if (window.ThisIsTheiOSApp || L.Browser.mac)
        return e.ctrlKey;
    else
        return false;
}
var Mod;
(function (Mod) {
    Mod[Mod["NONE"] = 0] = "NONE";
    Mod[Mod["CTRL"] = 1] = "CTRL";
    Mod[Mod["ALT"] = 2] = "ALT";
    Mod[Mod["SHIFT"] = 4] = "SHIFT";
    Mod[Mod["MACCTRL"] = 8] = "MACCTRL";
})(Mod || (Mod = {}));
var ViewType;
(function (ViewType) {
    ViewType[ViewType["Edit"] = 0] = "Edit";
    ViewType[ViewType["ReadOnly"] = 1] = "ReadOnly";
})(ViewType || (ViewType = {}));
var Platform;
(function (Platform) {
    Platform[Platform["ANDROIDAPP"] = 1] = "ANDROIDAPP";
    Platform[Platform["IOSAPP"] = 2] = "IOSAPP";
    Platform[Platform["MAC"] = 4] = "MAC";
    Platform[Platform["WINDOWS"] = 8] = "WINDOWS";
    Platform[Platform["LINUX"] = 16] = "LINUX";
    Platform[Platform["CHROMEOSAPP"] = 32] = "CHROMEOSAPP";
})(Platform || (Platform = {}));
var ShortcutDescriptor = /** @class */ (function () {
    function ShortcutDescriptor(_a) {
        var _b = _a.docType, docType = _b === void 0 ? null : _b, eventType = _a.eventType, _c = _a.modifier, modifier = _c === void 0 ? Mod.NONE : _c, _d = _a.keyCode, keyCode = _d === void 0 ? null : _d, _e = _a.key, key = _e === void 0 ? null : _e, _f = _a.unoAction, unoAction = _f === void 0 ? null : _f, _g = _a.dispatchAction, dispatchAction = _g === void 0 ? null : _g, _h = _a.viewType, viewType = _h === void 0 ? null : _h, _j = _a.preventDefault, preventDefault = _j === void 0 ? true : _j, _k = _a.platform, platform = _k === void 0 ? null : _k;
        app.console.assert(keyCode !== null || key !== null, 'registering a keyboard shortcut without specifying either a key or a keyCode - this will result in an untriggerable shortcut');
        this.docType = docType;
        this.eventType = eventType;
        this.modifier = modifier;
        this.keyCode = keyCode;
        this.key = key;
        this.unoAction = unoAction;
        this.dispatchAction = dispatchAction;
        this.viewType = viewType;
        this.preventDefault = preventDefault;
        this.platform = platform;
    }
    return ShortcutDescriptor;
}());
var KeyboardShortcuts = /** @class */ (function () {
    function KeyboardShortcuts() {
        this.definitions = new Map();
    }
    KeyboardShortcuts.prototype.findShortcut = function (language, eventType, modifier, keyCode, key, platform) {
        var descriptors = this.definitions.get(language);
        if (!descriptors) {
            return undefined;
        }
        var docType = this.map._docLayer ? this.map._docLayer._docType : '';
        var viewType = this.map.isEditMode() ? ViewType.Edit : ViewType.ReadOnly;
        var shortcuts = descriptors.filter(function (descriptor) {
            var keyMatches = descriptor.key === key;
            var keyCodeMatches = Array.isArray(descriptor.keyCode) ? descriptor.keyCode.includes(keyCode) : descriptor.keyCode === keyCode;
            return (!descriptor.docType || descriptor.docType === docType) &&
                (Array.isArray(descriptor.eventType) ? descriptor.eventType.includes(eventType) : descriptor.eventType === eventType) &&
                descriptor.modifier === modifier &&
                (descriptor.viewType === null || descriptor.viewType === viewType) &&
                (!descriptor.platform || (descriptor.platform & platform)) &&
                (keyMatches || keyCodeMatches);
        });
        if (shortcuts.length > 1) {
            throw 'Multiple definitions of the same keyboard shortcut';
        }
        if (shortcuts.length) {
            return shortcuts[0];
        }
        return undefined;
    };
    /// returns true if handled action
    KeyboardShortcuts.prototype.processEventImpl = function (language, event) {
        var eventType = event.type;
        var ctrl = isCtrlKey(event);
        var shift = event.shiftKey;
        var alt = event.altKey;
        var keyCode = event.which;
        var key = event.key;
        var macctrl = isMacCtrlKey(event);
        var modifier = (ctrl ? Mod.CTRL : Mod.NONE) |
            (shift ? Mod.SHIFT : Mod.NONE) |
            (alt ? Mod.ALT : Mod.NONE) |
            (macctrl ? Mod.MACCTRL : Mod.NONE);
        var platform = window.mode.isChromebook() ? Platform.CHROMEOSAPP :
            window.ThisIsTheAndroidApp ? Platform.ANDROIDAPP : // Cannot come before window.mode.isChromebook() as all Chromebook app users are necessarily also Android app users
                window.ThisIsTheiOSApp ? Platform.IOSAPP :
                    L.Browser.mac ? Platform.MAC :
                        L.Browser.win ? Platform.WINDOWS :
                            Platform.LINUX;
        var shortcut = this.findShortcut(language, eventType, modifier, keyCode, key, platform);
        if (shortcut) {
            var action = 'disabled';
            if (shortcut.unoAction) {
                action = shortcut.unoAction;
                this.map.sendUnoCommand(action);
            }
            else if (shortcut.dispatchAction) {
                action = shortcut.dispatchAction;
                app.dispatcher.dispatch(action);
            }
            if (shortcut.preventDefault) {
                event.preventDefault();
            }
            console.debug('handled keyboard shortcut: ' + action);
            return true;
        }
        return false;
    };
    // has to be called before use
    KeyboardShortcuts.prototype.initialize = function (map) {
        this.map = map;
        // in cypress it can fail on load to not allow for duplicated shortcuts
        if (L.Browser.cypressTest) {
            this.map.on('docloaded', function () { keyboardShortcuts.verifyShortcuts(); });
        }
    };
    KeyboardShortcuts.prototype.processEvent = function (language, event) {
        if (!this.map) {
            throw 'KeyboardShortcuts not initialized';
        }
        if (this.processEventImpl(language, event)) {
            return true;
        }
        return this.processEventImpl('default', event);
    };
    KeyboardShortcuts.prototype.verifyShortcuts = function () {
        var _this = this;
        console.debug('KeyboardShortcuts.verifyShortcuts start');
        this.definitions.forEach(function (shortcuts, language) {
            shortcuts.forEach(function (shortcut) {
                var e_1, _a, e_2, _b;
                // throws an exception if finds duplicated
                var shortcutEventTypes = Array.isArray(shortcut.eventType) ? shortcut.eventType : [shortcut.eventType];
                var shortcutKeyCodes = Array.isArray(shortcut.keyCode) ? shortcut.keyCode : [shortcut.keyCode];
                try {
                    for (var shortcutEventTypes_1 = __values(shortcutEventTypes), shortcutEventTypes_1_1 = shortcutEventTypes_1.next(); !shortcutEventTypes_1_1.done; shortcutEventTypes_1_1 = shortcutEventTypes_1.next()) {
                        var eventType = shortcutEventTypes_1_1.value;
                        try {
                            for (var shortcutKeyCodes_1 = (e_2 = void 0, __values(shortcutKeyCodes)), shortcutKeyCodes_1_1 = shortcutKeyCodes_1.next(); !shortcutKeyCodes_1_1.done; shortcutKeyCodes_1_1 = shortcutKeyCodes_1.next()) {
                                var keyCode = shortcutKeyCodes_1_1.value;
                                if (keyCode === null) {
                                    continue;
                                }
                                _this.findShortcut(language, eventType, shortcut.modifier, keyCode, undefined, shortcut.platform);
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (shortcutKeyCodes_1_1 && !shortcutKeyCodes_1_1.done && (_b = shortcutKeyCodes_1.return)) _b.call(shortcutKeyCodes_1);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                        if (shortcut.key === null) {
                            continue;
                        }
                        _this.findShortcut(language, eventType, shortcut.modifier, undefined, shortcut.key, shortcut.platform);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (shortcutEventTypes_1_1 && !shortcutEventTypes_1_1.done && (_a = shortcutEventTypes_1.return)) _a.call(shortcutEventTypes_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            });
        });
        console.debug('KeyboardShortcuts.verifyShortcuts finished');
    };
    return KeyboardShortcuts;
}());
var keyboardShortcuts = new KeyboardShortcuts();
// Default shortcuts.
keyboardShortcuts.definitions.set('default', new Array(
/*
    Disable F5 or assign it something to prevent browser refresh.
    Disable multi-sheet selection shortcuts in Calc.
    Disable F2 in Writer, formula bar is unsupported, and messes with further input.
*/
new ShortcutDescriptor({ eventType: 'keydown', key: 'F1', dispatchAction: 'showhelp' }), new ShortcutDescriptor({ eventType: 'keydown', modifier: Mod.ALT, key: 'F1', dispatchAction: 'focustonotebookbar' }), new ShortcutDescriptor({ eventType: 'keydown', modifier: Mod.CTRL, key: 'f', dispatchAction: 'home-search' }), new ShortcutDescriptor({ docType: 'spreadsheet', eventType: 'keydown', modifier: Mod.CTRL | Mod.SHIFT, key: 'PageUp' }), new ShortcutDescriptor({ docType: 'spreadsheet', eventType: 'keydown', modifier: Mod.CTRL | Mod.SHIFT, key: 'PageDown' }), new ShortcutDescriptor({ docType: 'spreadsheet', eventType: 'keydown', key: 'F5' }), new ShortcutDescriptor({ docType: 'text', eventType: 'keydown', key: 'F2' }), new ShortcutDescriptor({ docType: 'text', eventType: 'keydown', key: 'F3', unoAction: '.uno:ExpandGlossary' }), new ShortcutDescriptor({ docType: 'text', eventType: 'keydown', modifier: Mod.CTRL, key: 'F3' }), new ShortcutDescriptor({ docType: 'text', eventType: 'keydown', key: 'F5' }), new ShortcutDescriptor({ docType: 'presentation', eventType: 'keydown', key: 'F5', dispatchAction: 'presentation' }), new ShortcutDescriptor({ docType: 'presentation', eventType: 'keydown', key: 'PageUp', dispatchAction: 'previouspart', viewType: ViewType.ReadOnly }), new ShortcutDescriptor({ docType: 'presentation', eventType: 'keydown', key: 'PageDown', dispatchAction: 'nextpart', viewType: ViewType.ReadOnly }), new ShortcutDescriptor({ docType: 'drawing', eventType: 'keydown', key: 'F5' }), new ShortcutDescriptor({ docType: 'drawing', eventType: 'keydown', key: 'PageUp', dispatchAction: 'previouspart', viewType: ViewType.ReadOnly }), new ShortcutDescriptor({ docType: 'drawing', eventType: 'keydown', key: 'PageDown', dispatchAction: 'nextpart', viewType: ViewType.ReadOnly }), new ShortcutDescriptor({ docType: 'drawing', eventType: 'keydown', key: 'End', dispatchAction: 'lastpart', viewType: ViewType.ReadOnly }), new ShortcutDescriptor({ docType: 'drawing', eventType: 'keydown', key: 'Home', dispatchAction: 'firstpart', viewType: ViewType.ReadOnly }), new ShortcutDescriptor({ eventType: 'keydown', modifier: Mod.ALT | Mod.CTRL, key: 'p', dispatchAction: 'userlist' }), 
// Passthrough some system shortcuts
new ShortcutDescriptor({ eventType: 'keydown', modifier: Mod.CTRL | Mod.SHIFT, key: 'I', preventDefault: false, platform: Platform.WINDOWS | Platform.LINUX }), // Open browser developer tools on Non-MacOS - shift means the I here is capital
new ShortcutDescriptor({ eventType: 'keydown', modifier: Mod.CTRL | Mod.ALT, keyCode: 73 /* keyCode('I') === 73 */, preventDefault: false, platform: Platform.MAC }), // Open browser developer tools on MacOS - registered with keyCode as alt+i triggers a dead key on MacOS
new ShortcutDescriptor({ eventType: ['keydown', 'keypress'], modifier: Mod.CTRL | Mod.MACCTRL, key: ' ', preventDefault: false, platform: Platform.MAC | Platform.IOSAPP }), // On MacOS, open system emoji picker - bound to keypress as well as keydown since as that is needed on webkit browsers (such as Safari or Orion)
new ShortcutDescriptor({ eventType: 'keydown', modifier: Mod.CTRL, key: 'r', preventDefault: false, platform: Platform.MAC }), // Refresh browser tab
new ShortcutDescriptor({ eventType: 'keydown', modifier: Mod.CTRL, key: 'm', preventDefault: false, platform: Platform.MAC }), // On MacOS, minimize window
new ShortcutDescriptor({ eventType: 'keydown', modifier: Mod.CTRL, key: 'q', preventDefault: false, platform: Platform.MAC }), // On MacOS, quit browser
new ShortcutDescriptor({ eventType: 'keydown', modifier: Mod.CTRL, key: 'w', preventDefault: false }), // Close current tab
new ShortcutDescriptor({ eventType: 'keydown', modifier: Mod.CTRL, key: 'n', preventDefault: false }), // Open new browser window
new ShortcutDescriptor({ eventType: 'keydown', modifier: Mod.CTRL, key: 't', preventDefault: false })));
// German shortcuts.
keyboardShortcuts.definitions.set('de', new Array(new ShortcutDescriptor({ eventType: 'keydown', key: 'F12', dispatchAction: 'saveas' }), new ShortcutDescriptor({ docType: 'presentation', eventType: 'keydown', modifier: Mod.SHIFT, key: 'F9', unoAction: '.uno:GridVisible' }), new ShortcutDescriptor({ docType: 'presentation', eventType: 'keydown', modifier: Mod.SHIFT, key: 'F3', unoAction: '.uno:ChangeCaseRotateCase' }), new ShortcutDescriptor({ docType: 'presentation', eventType: 'keydown', modifier: Mod.SHIFT, key: 'F5', dispatchAction: 'presentation' }), // Already available without this shortcut.
new ShortcutDescriptor({ eventType: 'keydown', modifier: Mod.SHIFT | Mod.CTRL, key: 'F', unoAction: '.uno:Bold' }), new ShortcutDescriptor({ eventType: 'keydown', modifier: Mod.SHIFT | Mod.CTRL, key: 'K', unoAction: '.uno:Italic' }), new ShortcutDescriptor({ eventType: 'keydown', modifier: Mod.SHIFT | Mod.CTRL, key: 'U', unoAction: '.uno:Underline' }), new ShortcutDescriptor({ docType: 'text', eventType: 'keydown', modifier: Mod.SHIFT, key: 'F3', unoAction: '.uno:ChangeCaseRotateCase' }), new ShortcutDescriptor({ docType: 'text', eventType: 'keydown', key: 'F5', unoAction: '.uno:GoToPage' }), new ShortcutDescriptor({ docType: 'text', eventType: 'keydown', modifier: Mod.ALT | Mod.CTRL, key: 's', dispatchAction: 'home-search' }), new ShortcutDescriptor({ docType: 'spreadsheet', eventType: 'keydown', modifier: Mod.SHIFT, key: 'F3', unoAction: '.uno:FunctionDialog' }), new ShortcutDescriptor({ docType: 'spreadsheet', eventType: 'keydown', modifier: Mod.SHIFT, key: 'F2', dispatchAction: 'insertcomment' }), new ShortcutDescriptor({ docType: 'spreadsheet', eventType: 'keydown', key: 'F4', dispatchAction: 'togglerelative' }), new ShortcutDescriptor({ docType: 'spreadsheet', eventType: 'keydown', key: 'F9', unoAction: '.uno:Calculate' }), new ShortcutDescriptor({ docType: 'spreadsheet', eventType: 'keydown', key: 'F5', dispatchAction: 'focusonaddressinput' }), new ShortcutDescriptor({ docType: 'spreadsheet', eventType: 'keydown', modifier: Mod.ALT, key: '0', unoAction: '.uno:FormatCellDialog' })));
window.KeyboardShortcuts = keyboardShortcuts;
//# sourceMappingURL=Map.KeyboardShortcuts.js.map