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
 * L.Control.CornerGroup
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
    This file is Calc only. This adds a header section for grouped columns and rows in Calc.
    When user uses row grouping and column grouping at the same time, there occurs a space at the crossing point of the row group and column group sections.
    This sections fills that gap.

    This class is an extended version of "CanvasSectionObject".
*/
var cool;
(function (cool) {
    var CornerGroup = /** @class */ (function (_super) {
        __extends(CornerGroup, _super);
        function CornerGroup() {
            var _this = _super.call(this) || this;
            _this.name = L.CSections.CornerGroup.name;
            _this.anchor = ['top', 'left'];
            _this.processingOrder = L.CSections.CornerGroup.processingOrder;
            _this.drawingOrder = L.CSections.CornerGroup.drawingOrder;
            _this.zIndex = L.CSections.CornerGroup.zIndex;
            _this.sectionProperties = { cursor: 'pointer' };
            return _this;
        }
        CornerGroup.prototype.onInitialize = function () {
            this._map = L.Map.THIS;
            this._map.on('sheetgeometrychanged', this.update, this);
            this._map.on('viewrowcolumnheaders', this.update, this);
            this._map.on('darkmodechanged', this._cornerGroupColors, this);
            this._cornerGroupColors();
        };
        CornerGroup.prototype._cornerGroupColors = function () {
            var colors = cool.GroupBase.getColors();
            this.backgroundColor = colors.backgroundColor;
            this.borderColor = colors.borderColor;
        };
        CornerGroup.prototype.update = function () {
            // Below 2 sections exist (since this section is added), unless they are being removed.
            var rowGroupSection = this.containerObject.getSectionWithName(L.CSections.RowGroup.name);
            if (rowGroupSection) {
                rowGroupSection.update(); // This will update its size.
                this.size[0] = rowGroupSection.size[0];
            }
            var columnGroupSection = this.containerObject.getSectionWithName(L.CSections.ColumnGroup.name);
            if (columnGroupSection) {
                columnGroupSection.update(); // This will update its size.
                this.size[1] = columnGroupSection.size[1];
            }
        };
        CornerGroup.prototype.onClick = function () {
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
        CornerGroup.prototype.onMouseEnter = function () {
            this.containerObject.getCanvasStyle().cursor = 'pointer';
            $.contextMenu('destroy', '#document-canvas');
        };
        CornerGroup.prototype.onMouseLeave = function () {
            this.containerObject.getCanvasStyle().cursor = 'default';
        };
        return CornerGroup;
    }(app.definitions.canvasSectionObject));
    cool.CornerGroup = CornerGroup;
})(cool || (cool = {}));
L.Control.CornerGroup = cool.CornerGroup;
L.control.cornerGroup = function () {
    return new L.Control.CornerGroup();
};
//# sourceMappingURL=Control.CornerGroup.js.map