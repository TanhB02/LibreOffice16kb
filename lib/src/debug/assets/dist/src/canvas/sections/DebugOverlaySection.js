// @ts-strict-ignore
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
var DebugOverlaySection = /** @class */ (function (_super) {
    __extends(DebugOverlaySection, _super);
    function DebugOverlaySection(debug) {
        var _this = _super.call(this) || this;
        _this.name = L.CSections.Debug.DebugOverlay.name;
        _this.interactable = false;
        _this.anchor = ['top', 'left'];
        _this.processingOrder = L.CSections.Debug.DebugOverlay.processingOrder;
        _this.drawingOrder = L.CSections.Debug.DebugOverlay.drawingOrder;
        _this.zIndex = L.CSections.Debug.DebugOverlay.zIndex;
        _this.boundToSection = 'tiles';
        _this._debug = debug;
        return _this;
    }
    DebugOverlaySection.prototype.onDraw = function (frameCount, elapsedTime, subsetBounds) {
        TileManager.updateOverlayMessages();
        var msgs = this._debug.getOverlayMessages();
        if (!msgs)
            return;
        var topValues = Object.entries(msgs)
            .filter(function (_a) {
            var _b = __read(_a, 1), key = _b[0];
            return key.startsWith('top-');
        })
            .map(function (_a) {
            var _b = __read(_a, 2), value = _b[1];
            return value.toString();
        });
        var bottomValues = Object.entries(msgs)
            .filter(function (_a) {
            var _b = __read(_a, 1), key = _b[0];
            return !key.startsWith('top-');
        })
            .map(function (_a) {
            var _b = __read(_a, 2), value = _b[1];
            return value.toString();
        });
        var drawValues = function (ctx, top, lines) {
            var textLines = lines.join('\n').split('\n');
            if (textLines.length < 1)
                return;
            var lineHeight = 22;
            ctx.font = '18px Arial';
            var ybase;
            if (top)
                ybase = lineHeight * 2;
            else
                ybase = ctx.canvas.height - lineHeight * textLines.length;
            ctx.textAlign = 'left';
            ctx.fillStyle = 'rgba(255.0, 255.0, 255.0, 0.7)';
            textLines.forEach(function (txt, i) {
                var xpad = lineHeight;
                var y = ybase + i * lineHeight;
                var metrics = ctx.measureText(txt);
                ctx.fillRect(0, y - lineHeight, metrics.width + xpad, lineHeight * 1.5);
            });
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            textLines.forEach(function (txt, i) {
                var xpad = lineHeight;
                var y = ybase + i * lineHeight;
                ctx.fillText(txt, xpad, y);
            });
        };
        drawValues(this.context, true, topValues);
        drawValues(this.context, false, bottomValues);
    };
    return DebugOverlaySection;
}(app.definitions.canvasSectionObject));
app.definitions.debugOverlaySection = DebugOverlaySection;
//# sourceMappingURL=DebugOverlaySection.js.map