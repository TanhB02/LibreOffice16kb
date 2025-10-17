/* global Proxy _ */
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
var CellCursorSection = /** @class */ (function (_super) {
    __extends(CellCursorSection, _super);
    function CellCursorSection(color, weight, viewId) {
        var _this = _super.call(this) || this;
        _this.name = L.CSections.CellCursor.name;
        _this.zIndex = L.CSections.CellCursor.zIndex;
        _this.drawingOrder = L.CSections.CellCursor.drawingOrder;
        _this.processingOrder = L.CSections.CellCursor.processingOrder;
        _this.documentObject = true;
        _this.sectionProperties.viewId = viewId;
        _this.sectionProperties.weight = weight;
        _this.sectionProperties.color = color;
        return _this;
    }
    CellCursorSection.prototype.getViewId = function () {
        return this.sectionProperties.viewId;
    };
    CellCursorSection.prototype.setViewId = function (viewId) {
        this.sectionProperties.viewId = viewId;
    };
    CellCursorSection.prototype.onDraw = function () {
        if (app.calc.cellCursorVisible) {
            this.context.lineJoin = 'miter';
            this.context.lineCap = 'butt';
            this.context.lineWidth = 1;
            this.context.strokeStyle = this.sectionProperties.color;
            var x = 0;
            if (app.calc.isRTL()) {
                var rightMost = this.containerObject.getDocumentAnchor()[0] + this.containerObject.getDocumentAnchorSection().size[0];
                x = rightMost - this.size[0];
            }
            for (var i = 0; i < this.sectionProperties.weight; i++)
                this.context.strokeRect(x + -0.5 - i, -0.5 - i, this.size[0] + i * 2, this.size[1] + i * 2);
            if (window.prefs.getBoolean('darkTheme')) {
                this.context.strokeStyle = 'white';
                var diff = 1;
                this.context.strokeRect(x + -0.5 + diff, -0.5 + diff, this.size[0] - 2 * diff, this.size[1] - 2 * diff);
                this.context.strokeRect(x + -0.5 + diff, -0.5 + diff, this.size[0] - 2 * diff, this.size[1] - 2 * diff);
            }
        }
    };
    return CellCursorSection;
}(CanvasSectionObject));
app.definitions.cellCursorSection = CellCursorSection;
//# sourceMappingURL=CellCursorSection.js.map