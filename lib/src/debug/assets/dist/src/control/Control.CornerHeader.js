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
/*
 * L.Control.CornerHeader
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
/*
    Calc only.
*/
/* global $ app */
var cool;
(function (cool) {
    var CornerHeader = /** @class */ (function (_super) {
        __extends(CornerHeader, _super);
        function CornerHeader() {
            var _this = _super.call(this) || this;
            _this.name = L.CSections.CornerHeader.name;
            _this.anchor = [[L.CSections.ColumnGroup.name, 'bottom', 'top'], [L.CSections.RowGroup.name, 'right', 'left']];
            _this.size = [48 * app.dpiScale, 19 * app.dpiScale]; // These values are static.
            _this.processingOrder = L.CSections.CornerHeader.processingOrder;
            _this.drawingOrder = L.CSections.CornerHeader.drawingOrder;
            _this.zIndex = L.CSections.CornerHeader.zIndex;
            _this.sectionProperties = { cursor: 'pointer' };
            return _this;
        }
        CornerHeader.prototype.onInitialize = function () {
            this._map = L.Map.THIS;
            this._map.on('darkmodechanged', this._initCornerHeaderStyle, this);
            this._initCornerHeaderStyle();
        };
        CornerHeader.prototype.onClick = function () {
            this._map.wholeRowSelected = true;
            this._map.wholeColumnSelected = true;
            this._map.sendUnoCommand('.uno:SelectAll');
            // Row and column selections trigger updatecursor: message
            // and eventually _updateCursorAndOverlay function is triggered and focus will be at the map
            // thus the keyboard shortcuts like delete will work again.
            // selecting whole page does not trigger that and the focus will be lost.
            var docLayer = this._map._docLayer;
            if (docLayer)
                docLayer._updateCursorAndOverlay();
        };
        CornerHeader.prototype.onMouseEnter = function () {
            this.containerObject.getCanvasStyle().cursor = this.sectionProperties.cursor;
            $.contextMenu('destroy', '#document-canvas');
        };
        CornerHeader.prototype.onMouseLeave = function () {
            this.containerObject.getCanvasStyle().cursor = 'default';
        };
        CornerHeader.prototype._initCornerHeaderStyle = function () {
            var baseElem = document.getElementsByTagName('body')[0];
            var elem = L.DomUtil.create('div', 'spreadsheet-header-row', baseElem);
            this._textColor = L.DomUtil.getStyle(elem, 'color');
            this.backgroundColor = L.DomUtil.getStyle(elem, 'background-color'); // This is a section property.
            this.borderColor = L.DomUtil.getStyle(elem, 'border-top-color'); // This is a section property.
            L.DomUtil.remove(elem);
        };
        return CornerHeader;
    }(app.definitions.canvasSectionObject));
    cool.CornerHeader = CornerHeader;
})(cool || (cool = {}));
L.Control.CornerHeader = cool.CornerHeader;
L.control.cornerHeader = function () {
    return new L.Control.CornerHeader();
};
//# sourceMappingURL=Control.CornerHeader.js.map