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
 * L.Control.RowGroup
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
    This file is Calc only. This adds a section for grouped rows in Calc.
    When user selects some rows and groups them using "Data->Group and Outline->Group" menu path, this section is added into
    sections list of CanvasSectionContainer. See _addRemoveGroupSections in file CalcTileLayer.js

    This class is an extended version of "CanvasSectionObject".
*/
var cool;
(function (cool) {
    var RowGroup = /** @class */ (function (_super) {
        __extends(RowGroup, _super);
        function RowGroup() {
            var _this = _super.call(this) || this;
            _this.name = L.CSections.RowGroup.name;
            _this.anchor = [[L.CSections.CornerGroup.name, 'bottom', 'top'], 'left'];
            _this.expand = ['top', 'bottom']; // Expand vertically.
            _this.processingOrder = L.CSections.RowGroup.processingOrder;
            _this.drawingOrder = L.CSections.RowGroup.drawingOrder;
            _this.zIndex = L.CSections.RowGroup.zIndex;
            return _this;
        }
        RowGroup.prototype.update = function () {
            if (this.isRemoved) // Prevent calling while deleting the section. It causes errors.
                return;
            this._sheetGeometry = this._map._docLayer.sheetGeometry;
            this._groups = Array(this._sheetGeometry.getRowGroupLevels());
            // Calculate width on the fly.
            this.size[0] = this._computeSectionWidth();
            this._cornerHeaderHeight = this.containerObject.getSectionWithName(L.CSections.CornerHeader.name).size[1];
            this._splitPos = this._map._docLayer._splitPanesContext.getSplitPos();
            this._collectGroupsData(this._sheetGeometry.getRowGroupsDataInView());
        };
        // This returns the required width for the section.
        RowGroup.prototype._computeSectionWidth = function () {
            return this._levelSpacing + (this._groupHeadSize + this._levelSpacing) * (this._groups.length + 1);
        };
        RowGroup.prototype.isGroupHeaderVisible = function (startY, startPos) {
            if (startPos > this._splitPos.y) {
                return startY > this._splitPos.y + this._cornerHeaderHeight;
            }
            else {
                return startY >= this._cornerHeaderHeight;
            }
        };
        RowGroup.prototype.getEndPosition = function (endPos) {
            if (endPos <= this._splitPos.y)
                return endPos;
            else {
                return Math.max(endPos + this._cornerHeaderHeight - this.documentTopLeft[1], this._splitPos.y + this._cornerHeaderHeight);
            }
        };
        RowGroup.prototype.getRelativeY = function (docPos) {
            if (docPos < this._splitPos.y)
                return docPos + this._cornerHeaderHeight;
            else
                return Math.max(docPos - this.documentTopLeft[1], this._splitPos.y) + this._cornerHeaderHeight;
        };
        RowGroup.prototype.drawGroupControl = function (group) {
            var startX = this._levelSpacing + (this._groupHeadSize + this._levelSpacing) * group.level;
            var startY = this.getRelativeY(group.startPos);
            var endY = this.getEndPosition(group.endPos);
            var strokeColor = cool.GroupBase.getColors().strokeColor;
            if (this.isGroupHeaderVisible(startY, group.startPos)) {
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
                    this.context.moveTo(this.transformX(startX + this._groupHeadSize * 0.25), startY + this._groupHeadSize / 2 + 0.5);
                    this.context.lineTo(this.transformX(startX + this._groupHeadSize * 0.75 + app.roundedDpiScale), startY + this._groupHeadSize / 2 + 0.5);
                    this.context.stroke();
                }
                else {
                    // draw '+'
                    this.context.beginPath();
                    this.context.moveTo(this.transformX(startX + this._groupHeadSize * 0.25), startY + this._groupHeadSize / 2 + 0.5);
                    this.context.lineTo(this.transformX(startX + this._groupHeadSize * 0.75 + app.roundedDpiScale), startY + this._groupHeadSize / 2 + 0.5);
                    this.context.stroke();
                    this.context.moveTo(this.transformX(startX + this._groupHeadSize * 0.50 + 0.5), startY + this._groupHeadSize * 0.25);
                    this.context.lineTo(this.transformX(startX + this._groupHeadSize * 0.50 + 0.5), startY + this._groupHeadSize * 0.75 + app.roundedDpiScale);
                    this.context.stroke();
                }
            }
            if (!group.hidden && endY > this._cornerHeaderHeight + this._groupHeadSize && endY > startY) {
                //draw tail
                this.context.beginPath();
                startY += this._groupHeadSize;
                startY = startY >= this._cornerHeaderHeight + this._groupHeadSize ? startY : this._cornerHeaderHeight + this._groupHeadSize;
                startX += this._groupHeadSize * 0.5;
                startX = Math.round(startX);
                startY = Math.round(startY) + 1;
                this.context.strokeStyle = strokeColor;
                this.context.lineWidth = 2.0;
                this.context.moveTo(this.transformX(startX), startY);
                this.context.lineTo(this.transformX(startX), endY - app.roundedDpiScale);
                this.context.stroke();
                this.context.lineTo(Math.round(this.transformX(startX + this._groupHeadSize / 2)), endY - app.roundedDpiScale);
                this.context.stroke();
            }
        };
        RowGroup.prototype.drawLevelHeader = function (level) {
            this.context.beginPath();
            var ctx = this.context;
            var ctrlHeadSize = this._groupHeadSize;
            var levelSpacing = this._levelSpacing;
            var startX = levelSpacing + (ctrlHeadSize + levelSpacing) * level;
            var startY = Math.round((this._cornerHeaderHeight - ctrlHeadSize) * 0.5);
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
        RowGroup.prototype._updateOutlineState = function (group) {
            var state = group.hidden ? 'visible' : 'hidden'; // we have to send the new state
            var payload = 'outlinestate type=row' + ' level=' + group.level + ' index=' + group.index + ' state=' + state;
            app.socket.sendMessage(payload);
        };
        // When user clicks somewhere on the section, onMouseClick event is called by CanvasSectionContainer.
        // Clicked point is also given to handler function. This function finds the clicked header.
        RowGroup.prototype.findClickedLevel = function (point) {
            if (point[1] < this._cornerHeaderHeight) {
                var index = (this.transformX(point[0]) / this.size[0]) * 100; // Percentage.
                var levelPercentage = (1 / (this._groups.length + 1)) * 100; // There is one more button than the number of levels.
                index = Math.floor(index / levelPercentage);
                return index;
            }
            return -1;
        };
        RowGroup.prototype.findClickedGroup = function (point) {
            var mirrorX = this.isCalcRTL();
            for (var i = 0; i < this._groups.length; i++) {
                if (this._groups[i]) {
                    for (var group in this._groups[i]) {
                        if (Object.prototype.hasOwnProperty.call(this._groups[i], group)) {
                            var group_ = this._groups[i][group];
                            var startX = this._levelSpacing + (this._groupHeadSize + this._levelSpacing) * group_.level;
                            var startY = this.getRelativeY(group_.startPos);
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
        RowGroup.prototype.getTailsGroupRect = function (group) {
            var startX = this._levelSpacing + (this._groupHeadSize + this._levelSpacing) * group.level;
            var startY = this.getRelativeY(group.startPos);
            var endX = startX + this._groupHeadSize; // Let's use this as thikcness. User doesn't have to double click on a pixel:)
            var endY = group.endPos + this._cornerHeaderHeight - this.documentTopLeft[1];
            return [startX, endX, startY, endY];
        };
        RowGroup.prototype.onRemove = function () {
            this.isRemoved = true;
            this.containerObject.getSectionWithName(L.CSections.RowHeader.name).position[0] = 0;
            this.containerObject.getSectionWithName(L.CSections.CornerHeader.name).position[0] = 0;
        };
        return RowGroup;
    }(cool.GroupBase));
    cool.RowGroup = RowGroup;
})(cool || (cool = {}));
L.Control.RowGroup = cool.RowGroup;
L.control.rowGroup = function () {
    return new L.Control.RowGroup();
};
//# sourceMappingURL=Control.RowGroup.js.map