// @ts-strict-ignore
/**
 /*
 * Copyright the Collabora Online contributors.
 *
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Ruler.ts - Base Class for Ruler Functionality
 *
 * This file defines the core logic for the Ruler feature, shared by both
 * horizontal (HRuler) and vertical (VRuler) implementations.
 *
 * ### Key Features:
 * - **Configurable Options**: Supports margins, tab stops, interactivity, and display settings.
 * - **Abstract Design**: Subclasses must implement `_updateBreakPoints()` for specific behaviors.
 * - **Shared Utilities**: Includes reusable methods like `_updatePaintTimer` and `getWindowProperty`.
 * - **Easy Initialization**: `initializeRuler` simplifies setup for HRuler and VRuler.
 *
 * ### Guidelines:
 * - Extend the `Options` interface for new features.
 * - Implement subclass-specific logic in `_updateBreakPoints()`.
 * - Ensure event handling (e.g., `rulerchanged`) for updates.
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
var Ruler = /** @class */ (function () {
    function Ruler(options) {
        // Init default values for ruler options
        this.options = __assign({ interactive: true, marginSet: false, displayNumber: true, tileMargin: 18, margin1: null, margin2: null, leftOffset: null, pageOffset: null, pageWidth: null, pageTopMargin: null, pageBottomMargin: null, firstLineIndent: null, leftParagraphIndent: null, rightParagraphIndent: null, tabs: '', unit: null, DraggableConvertRatio: null, timer: null, showruler: true, position: 'topleft', disableMarker: false }, options);
    }
    Ruler.prototype._updatePaintTimer = function () {
        clearTimeout(this.options.timer);
        this.options.timer = setTimeout(L.bind(this._updateBreakPoints, this), 300);
    };
    Ruler.prototype.getWindowProperty = function (propertyName) {
        return window[propertyName];
    };
    // Static method to handle the initialization of rulers
    Ruler.initializeRuler = function (map, options) {
        var _a;
        var isRTL = document.documentElement.dir === 'rtl';
        var interactiveRuler = map.isEditMode();
        var showRuler = (_a = options.showruler) !== null && _a !== void 0 ? _a : true;
        // Initialize the horizontal ruler
        new HRuler(map, {
            position: isRTL ? 'topright' : 'topleft',
            interactive: interactiveRuler,
            showruler: showRuler,
        });
        // Initialize the vertical ruler if not in presentation or drawing mode
        if (!map.isPresentationOrDrawing()) {
            new VRuler(map, {
                position: isRTL ? 'topright' : 'topleft',
                interactive: interactiveRuler,
                showruler: showRuler,
            });
        }
        // Fire the 'rulerchanged' event
        map.fire('rulerchanged');
    };
    return Ruler;
}());
app.definitions.ruler = Ruler;
//# sourceMappingURL=Ruler.js.map