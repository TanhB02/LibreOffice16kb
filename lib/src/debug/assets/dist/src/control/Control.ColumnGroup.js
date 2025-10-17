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
 * L.Control.ColumnGroup
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
/* global app */
/*
    This file is Calc only. This adds a section for grouped columns in Calc.
    When user selects some columns and groups them using "Data->Group and Outline->Group" menu path, this section is added into
    sections list of CanvasSectionContainer. See _addRemoveGroupSections in file CalcTileLayer.js

    This class is an extended version of "CanvasSectionObject".
*/
var cool;
(function (cool) {
    var ColumnGroup = /** @class */ (function (_super) {
        __extends(ColumnGroup, _super);
        function ColumnGroup() {
            var _this = _super.call(this) || this;
            _this.name = L.CSections.ColumnGroup.name;
            _this.anchor = ['top', [L.CSections.CornerGroup.name, 'right', 'left']];
            _this.expand = ['left', 'right']; // Expand horizontally.
            _this.processingOrder = L.CSections.ColumnGroup.processingOrder;
            _this.drawingOrder = L.CSections.ColumnGroup.drawingOrder;
            _this.zIndex = L.CSections.ColumnGroup.zIndex;
            return _this;
        }
        ColumnGroup.prototype.update = function () {
            if (this.isRemoved) // Prevent calling while deleting the section. It causes errors.
                return;
            this._sheetGeometry = this._map._docLayer.sheetGeometry;
            this._groups = Array(this._sheetGeometry.getColumnGroupLevels());
            // Calculate width on the fly.
            this.size[1] = this._computeSectionHeight();
            this._cornerHeaderWidth = this.containerObject.getSectionWithName(L.CSections.CornerHeader.name).size[0];
            this._splitPos = this._map._docLayer._splitPanesContext.getSplitPos();
            this._collectGroupsData(this._sheetGeometry.getColumnGroupsDataInView());
        };
        // This returns the required height for the section.
        ColumnGroup.prototype._computeSectionHeight = function () {
            return this._levelSpacing + (this._groupHeadSize + this._levelSpacing) * (this._groups.length + 1);
        };
        ColumnGroup.prototype.isGroupHeaderVisible = function (startX, startPos) {
            if (startPos > this._splitPos.x) {
                return startX > this._splitPos.x + this._cornerHeaderWidth;
            }
            else {
                return startX >= this._cornerHeaderWidth && (startX > this.documentTopLeft[0] || startX < this._splitPos.x);
            }
        };
        ColumnGroup.prototype.getEndPosition = function (endPos) {
            if (endPos <= this._splitPos.x)
                return endPos;
            else {
                return Math.max(endPos + this._cornerHeaderWidth - this.documentTopLeft[0], this._splitPos.x + this._cornerHeaderWidth);
            }
        };
        ColumnGroup.prototype.getRelativeX = function (docPos) {
            if (docPos < this._splitPos.x)
                return docPos + this._cornerHeaderWidth;
            else
                return Math.max(docPos - this.documentTopLeft[0], this._splitPos.x) + this._cornerHeaderWidth;
        };
        ColumnGroup.prototype.drawGroupControl = function (group) {
            var startX = this.getRelativeX(group.startPos);
            var startY = this._levelSpacing + (this._groupHeadSize + this._levelSpacing) * group.level;
            var strokeColor = cool.GroupBase.getColors().strokeColor;
            var endX = this.getEndPosition(group.endPos);
            if (this.isGroupHeaderVisible(startX, group.startPos)) {
                // draw head
                this.context.beginPath();
                this.context.fillStyle = this.backgroundColor;
                this.context.fillRect(this.transformRectX(startX, this._groupHeadSize), startY, this._groupHeadSize, this._groupHeadSize);
                this.context.strokeStyle = strokeColor;
                this.context.lineWidth = 1.0;
                this.context.strokeRect(this.transformRectX(startX + 0.5, this._groupHeadSize), startY + 0.5, this._groupHeadSize, this._groupHeadSize);
                if (!group.hidden) {
                    // draw '-'
                    this.context.beginPath();
                    this.context.moveTo(this.transformX(startX + this._groupHeadSize * 0.25), startY + this._groupHeadSize * 0.5 + 0.5);
                    this.context.lineTo(this.transformX(startX + this._groupHeadSize * 0.75 + app.roundedDpiScale), startY + this._groupHeadSize * 0.5 + 0.5);
                    this.context.stroke();
                }
                else {
                    // draw '+'
                    this.context.beginPath();
                    this.context.moveTo(this.transformX(startX + this._groupHeadSize * 0.25), startY + this._groupHeadSize * 0.5 + 0.5);
                    this.context.lineTo(this.transformX(startX + this._groupHeadSize * 0.75 + app.roundedDpiScale), startY + this._groupHeadSize * 0.5 + 0.5);
                    this.context.stroke();
                    this.context.moveTo(this.transformX(startX + this._groupHeadSize * 0.50 + 0.5), startY + this._groupHeadSize * 0.25);
                    this.context.lineTo(this.transformX(startX + this._groupHeadSize * 0.50 + 0.5), startY + this._groupHeadSize * 0.75 + app.roundedDpiScale);
                    this.context.stroke();
                }
            }
            if (!group.hidden && endX > this._cornerHeaderWidth + this._groupHeadSize && endX > startX) {
                //draw tail
                this.context.beginPath();
                startX += this._groupHeadSize;
                startX = startX >= this._cornerHeaderWidth + this._groupHeadSize ? startX : this._cornerHeaderWidth + this._groupHeadSize;
                startY += this._groupHeadSize * 0.5;
                startX = Math.round(startX) + 1;
                startY = Math.round(startY);
                this.context.strokeStyle = strokeColor;
                this.context.lineWidth = 2.0;
                this.context.moveTo(this.transformX(startX), startY);
                this.context.lineTo(this.transformX(endX - app.roundedDpiScale), startY);
                this.context.stroke();
            }
        };
        ColumnGroup.prototype.drawLevelHeader = function (level) {
            this.context.beginPath();
            var ctx = this.context;
            var ctrlHeadSize = this._groupHeadSize;
            var levelSpacing = this._levelSpacing;
            var startX = Math.round((this._cornerHeaderWidth - ctrlHeadSize) * 0.5);
            var startY = levelSpacing + (ctrlHeadSize + levelSpacing) * level;
            ctx.strokeStyle = cool.GroupBase.getColors().strokeColor;
            ctx.lineWidth = 1.0;
            ctx.strokeRect(this.transformRectX(startX + 0.5, ctrlHeadSize), startY + 0.5, ctrlHeadSize, ctrlHeadSize);
            // draw level number
            ctx.fillStyle = this._textColor;
            ctx.font = this._getFont();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText((level + 1).toString(), this.transformX(startX + (ctrlHeadSize / 2)), startY + (ctrlHeadSize / 2) + 2 * app.dpiScale);
        };
        // Handle user interaction.
        ColumnGroup.prototype._updateOutlineState = function (group) {
            var state = group.hidden ? 'visible' : 'hidden'; // we have to send the new state
            var payload = 'outlinestate type=column' + ' level=' + group.level + ' index=' + group.index + ' state=' + state;
            app.socket.sendMessage(payload);
        };
        // When user clicks somewhere on the section, onMouseClick event is called by CanvasSectionContainer.
        // Clicked point is also given to handler function. This function finds the clicked header.
        ColumnGroup.prototype.findClickedLevel = function (point) {
            var mirrorX = this.isCalcRTL();
            if ((!mirrorX && point[0] < this._cornerHeaderWidth)
                || (mirrorX && point[0] > this.size[0] - this._cornerHeaderWidth)) {
                var index = (point[1] / this.size[1]) * 100; // Percentage.
                var levelPercentage = (1 / (this._groups.length + 1)) * 100; // There is one more button than the number of levels.
                index = Math.floor(index / levelPercentage);
                return index;
            }
            return -1;
        };
        ColumnGroup.prototype.findClickedGroup = function (point) {
            var mirrorX = this.isCalcRTL();
            for (var i = 0; i < this._groups.length; i++) {
                if (this._groups[i]) {
                    for (var group in this._groups[i]) {
                        if (Object.prototype.hasOwnProperty.call(this._groups[i], group)) {
                            var group_ = this._groups[i][group];
                            var startX = this.getRelativeX(group_.startPos);
                            var startY = this._levelSpacing + (this._groupHeadSize + this._levelSpacing) * group_.level;
                            var endX = startX + this._groupHeadSize;
                            var endY = startY + this._groupHeadSize;
                            if (group_.level == 0 && this.isPointInRect(point, startX, startY, endX, endY, mirrorX))
                                return group_;
                            else if (this._isPreviousGroupVisible(group_.level, group_.startPos, group_.endPos, group_.hidden) && this.isPointInRect(point, startX, startY, endX, endY, mirrorX)) {
                                return group_;
                            }
                        }
                    }
                }
            }
            return null;
        };
        ColumnGroup.prototype.getTailsGroupRect = function (group) {
            var startX = this.getRelativeX(group.startPos);
            var startY = this._levelSpacing + (this._groupHeadSize + this._levelSpacing) * group.level;
            var endX = group.endPos + this._cornerHeaderWidth - this.documentTopLeft[0];
            var endY = startY + this._groupHeadSize;
            return [startX, endX, startY, endY];
        };
        ColumnGroup.prototype.onRemove = function () {
            this.isRemoved = true;
            this.containerObject.getSectionWithName(L.CSections.ColumnHeader.name).position[1] = 0;
            this.containerObject.getSectionWithName(L.CSections.CornerHeader.name).position[1] = 0;
        };
        return ColumnGroup;
    }(cool.GroupBase));
    cool.ColumnGroup = ColumnGroup;
})(cool || (cool = {}));
L.Control.ColumnGroup = cool.ColumnGroup;
L.control.columnGroup = function () {
    return new L.Control.ColumnGroup();
};
//# sourceMappingURL=Control.ColumnGroup.js.map