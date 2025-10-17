// @ts-strict-ignore
/* -*- js-indent-level: 8 -*- */
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
 * Copyright the Collabora Online contributors.
 *
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/*
    See CanvasSectionContainer.ts explanations about sections, event handlers and more.

    This section is activated when user (currently) clicks on [View -> Focus Cell] button.
    When feature is activated, this section draws 2 rectangles:
        * One vertical that indicates the column of the cell cursor.
        * One horizontal that indicates the row of the cell cursor.

    So the purpose is to visually indicate the cell cursor position in the document better.
*/
var FocusCellSection = /** @class */ (function (_super) {
    __extends(FocusCellSection, _super);
    function FocusCellSection() {
        var _this = _super.call(this) || this;
        _this.name = L.CSections.FocusCell.name;
        _this.processingOrder = L.CSections.FocusCell.processingOrder;
        _this.drawingOrder = L.CSections.FocusCell.drawingOrder;
        _this.zIndex = L.CSections.FocusCell.zIndex;
        _this.documentObject = true;
        _this.interactable = false;
        _this.sectionProperties.columnRectangle = null;
        _this.sectionProperties.rowRectangle = null;
        _this.sectionProperties.maxCol = 268435455;
        _this.sectionProperties.maxRow = 20971124;
        return _this;
    }
    FocusCellSection.prototype.onCellAddressChanged = function () {
        this.size[0] = app.calc.cellCursorRectangle.pWidth;
        this.size[1] = app.calc.cellCursorRectangle.pHeight;
        this.setPosition(app.calc.cellCursorRectangle.pX1, app.calc.cellCursorRectangle.pY1);
    };
    FocusCellSection.addFocusCellSection = function () {
        if (FocusCellSection.instance === null) {
            FocusCellSection.instance = new FocusCellSection();
            app.sectionContainer.addSection(FocusCellSection.instance);
        }
        if (!this.instance.showSection)
            this.instance.setShowSection(true);
        this.instance.onCellAddressChanged();
    };
    FocusCellSection.hideFocusCellSection = function () {
        if (FocusCellSection.instance)
            FocusCellSection.instance.setShowSection(false);
    };
    FocusCellSection.showFocusCellSection = function () {
        if (FocusCellSection.instance)
            FocusCellSection.instance.setShowSection(true);
        else {
            this.addFocusCellSection();
        }
    };
    FocusCellSection.prototype.onDraw = function () {
        var style = getComputedStyle(document.documentElement).getPropertyValue('--column-row-highlight');
        this.context.fillStyle = style;
        this.context.strokeStyle = style;
        this.context.globalAlpha = 0.3;
        this.context.fillRect(0, -this.position[1], app.calc.cellCursorRectangle.pWidth, this.sectionProperties.maxCol);
        this.context.fillRect(-this.position[0], 0, this.sectionProperties.maxRow, app.calc.cellCursorRectangle.pHeight);
        this.context.globalAlpha = 1;
        this.context.lineWidth = 2 * app.dpiScale;
        this.context.strokeRect(0, -this.position[1], app.calc.cellCursorRectangle.pWidth, this.sectionProperties.maxCol);
        this.context.strokeRect(-this.position[0], 0, this.sectionProperties.maxRow, app.calc.cellCursorRectangle.pHeight);
    };
    FocusCellSection.instance = null;
    return FocusCellSection;
}(CanvasSectionObject));
//# sourceMappingURL=FocusCellSection.js.map