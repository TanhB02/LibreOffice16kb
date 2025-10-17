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
 * L.Control.GroupBase
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
var cool;
(function (cool) {
    /*
        This file is Calc only. This is the base class for Control.RowGroup and Control.ColumnGroup files.
    
        This class is an extended version of "CanvasSectionObject".
    */
    var GroupBase = /** @class */ (function (_super) {
        __extends(GroupBase, _super);
        function GroupBase() {
            var _this = _super.call(this) || this;
            _this.isRemoved = false;
            return _this;
        }
        // This function is called by CanvasSectionContainer when the section is added to the sections list.
        GroupBase.prototype.onInitialize = function () {
            this._map = L.Map.THIS;
            this.sectionProperties.docLayer = this._map._docLayer;
            this._groups = null;
            // group control styles
            this._groupHeadSize = Math.round(12 * app.dpiScale);
            this._levelSpacing = app.roundedDpiScale;
            this._map.on('sheetgeometrychanged', this.update, this);
            this._map.on('viewrowcolumnheaders', this.update, this);
            this._map.on('darkmodechanged', this._groupBaseColors, this);
            this._createFont();
            this._groupBaseColors();
            this.update();
            this.isRemoved = false;
        };
        // Create font for the group headers. Group headers are on the left side of corner header.
        GroupBase.prototype._createFont = function () {
            var baseElem = document.getElementsByTagName('body')[0];
            var elem = L.DomUtil.create('div', 'spreadsheet-header-row', baseElem);
            var fontFamily = L.DomUtil.getStyle(elem, 'font-family');
            var fontSize = parseInt(L.DomUtil.getStyle(elem, 'font-size'));
            this._getFont = function () {
                return Math.round(fontSize * app.dpiScale) + 'px ' + fontFamily;
            };
            L.DomUtil.remove(elem);
        };
        GroupBase.getColors = function () {
            var baseElem = document.getElementsByTagName('body')[0];
            var elem = L.DomUtil.create('div', 'spreadsheet-header-row', baseElem);
            var isDark = window.prefs.getBoolean('darkTheme');
            this.backgroundColor = L.DomUtil.getStyle(elem, 'background-color');
            this.borderColor = this.backgroundColor;
            this._textColor = L.DomUtil.getStyle(elem, 'color');
            L.DomUtil.remove(elem);
            return {
                backgroundColor: this.backgroundColor,
                borderColor: this.borderColor,
                textColor: this._textColor,
                strokeColor: isDark ? 'white' : 'black'
            };
        };
        GroupBase.prototype._groupBaseColors = function () {
            var colors = GroupBase.getColors();
            this.backgroundColor = colors.backgroundColor;
            this.borderColor = colors.borderColor;
            this._textColor = colors.textColor;
        };
        // This returns the required width for the section.
        GroupBase.prototype._computeSectionWidth = function () {
            return this._levelSpacing + (this._groupHeadSize + this._levelSpacing) * (this._groups.length + 1);
        };
        // This function puts data into a good shape for use of this class.
        GroupBase.prototype._collectGroupsData = function (groups) {
            var level, groupEntry;
            var lastGroupIndex = new Array(groups.length);
            var firstChildGroupIndex = new Array(groups.length);
            var lastLevel = -1;
            for (var i = 0; i < groups.length; ++i) {
                // a new group start
                var groupData = groups[i];
                level = parseInt(groupData.level) - 1;
                if (!this._groups[level]) {
                    this._groups[level] = [];
                }
                var startPos = parseInt(groupData.startPos);
                var endPos = parseInt(groupData.endPos);
                var isHidden = !!parseInt(groupData.hidden);
                if (!isHidden) {
                    var moved = false;
                    // if the first child is collapsed the parent head has to be top-aligned with the child
                    if (level < lastLevel && firstChildGroupIndex[lastLevel] !== undefined) {
                        var childGroupEntry = this._groups[lastLevel][firstChildGroupIndex[lastLevel]];
                        if (childGroupEntry.hidden) {
                            if (startPos > childGroupEntry.startPos && startPos < childGroupEntry.endPos) {
                                startPos = childGroupEntry.startPos;
                                moved = true;
                            }
                        }
                    }
                    // if 2 groups belonging to the same level are contiguous and the first group is collapsed,
                    // the second one has to be shifted as much as possible in order to avoid overlapping.
                    if (!moved && lastGroupIndex[level] !== undefined) {
                        var prevGroupEntry = this._groups[level][lastGroupIndex[level]];
                        if (prevGroupEntry.hidden) {
                            if (startPos <= prevGroupEntry.endPos) {
                                startPos = prevGroupEntry.endPos + this._groupHeadSize;
                            }
                        }
                    }
                }
                groupEntry = {
                    level: level,
                    index: parseInt(groupData.index),
                    startPos: startPos,
                    endPos: endPos,
                    hidden: isHidden
                };
                this._groups[level][parseInt(groupData.index)] = groupEntry;
                lastGroupIndex[level] = groupData.index;
                if (level > lastLevel) {
                    firstChildGroupIndex[level] = groupData.index;
                    lastLevel = level;
                }
                else if (level === lastLevel) {
                    firstChildGroupIndex[level + 1] = undefined;
                }
            }
        };
        GroupBase.prototype._isParentGroupVisible = function (group_) {
            if (group_.hidden === false) {
                if (group_.level > 0) {
                    // This recursive call is needed.
                    // Because first upper group may have been expanded and second upper group may have been collapsed.
                    // If one of the upper groups is not expanded, this function should return false.
                    if (this._isPreviousGroupVisible(group_.level, group_.startPos, group_.endPos, group_.hidden)) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                else {
                    return true;
                }
            }
            else {
                return false;
            }
        };
        // If previous group is visible (expanded), current group's plus sign etc. will be drawn. If previous group is not expanded, current group's plus sign etc. won't be drawn.
        GroupBase.prototype._isPreviousGroupVisible = function (level, startPos, endPos, hidden) {
            for (var i = 0; i < this._groups.length; i++) {
                var parentGroup;
                // find the correct parent group level
                if (i == level - 1) {
                    for (var group in this._groups[i]) {
                        if (Object.prototype.hasOwnProperty.call(this._groups[i], group)) {
                            var group_ = this._groups[i][group];
                            // parent group is expanded
                            if ((startPos != endPos) && (startPos >= group_.startPos && endPos <= group_.endPos)) {
                                return this._isParentGroupVisible(group_);
                            }
                            // parent group is collapsed and has a '-' sign
                            else if ((startPos == endPos) && hidden == false) {
                                if ((startPos == group_.startPos && endPos == group_.endPos)) {
                                    parentGroup = group_;
                                    // special condition: parent group is found, return.
                                    return this._isParentGroupVisible(parentGroup);
                                }
                                else if ((startPos == group_.startPos && endPos != group_.endPos)) {
                                    parentGroup = group_;
                                }
                                else if ((startPos != group_.startPos && endPos == group_.endPos)) {
                                    parentGroup = group_;
                                }
                                else if ((startPos > group_.startPos && endPos < group_.endPos)) {
                                    parentGroup = group_;
                                }
                            }
                            // parent group is collapsed and has a '+' sign
                            else if ((startPos == endPos) && hidden == true) {
                                if ((startPos == group_.startPos && endPos == group_.endPos)) {
                                    parentGroup = group_;
                                }
                                else if ((startPos == group_.startPos && endPos != group_.endPos)) {
                                    parentGroup = group_;
                                }
                                else if ((startPos != group_.startPos && endPos == group_.endPos)) {
                                    parentGroup = group_;
                                }
                                else if ((startPos > group_.startPos && endPos < group_.endPos)) {
                                    parentGroup = group_;
                                }
                            }
                        }
                    }
                    if (parentGroup !== undefined) {
                        return this._isParentGroupVisible(parentGroup);
                    }
                }
            }
        };
        GroupBase.prototype.drawGroupControl = function (entry) {
            return;
        };
        // This calls drawing functions related to tails and plus & minus signs etc.
        GroupBase.prototype.drawOutline = function () {
            if (this._groups) {
                for (var i = 0; i < this._groups.length; i++) {
                    if (this._groups[i]) {
                        for (var group in this._groups[i]) {
                            if (Object.prototype.hasOwnProperty.call(this._groups[i], group)) {
                                // always draw the first level
                                if (this._groups[i][group].level == 0) {
                                    this.drawGroupControl(this._groups[i][group]);
                                }
                                else if (this._isPreviousGroupVisible(this._groups[i][group].level, this._groups[i][group].startPos, this._groups[i][group].endPos, this._groups[i][group].hidden)) {
                                    this.drawGroupControl(this._groups[i][group]);
                                }
                            }
                        }
                    }
                }
            }
        };
        GroupBase.prototype.drawLevelHeader = function (level) {
            return;
        };
        // This function calls drawing function for related to headers of groups. Headers are drawn on the left of corner header.
        GroupBase.prototype.drawLevelHeaders = function () {
            for (var i = 0; i < this._groups.length + 1; ++i) {
                this.drawLevelHeader(i);
            }
        };
        /// In Calc RTL mode, x-coordinate of a given rectangle of given width is horizontally mirrored
        GroupBase.prototype.transformRectX = function (xcoord, rectWidth) {
            return this.isCalcRTL() ? this.size[0] - xcoord - rectWidth : xcoord;
        };
        /// In Calc RTL mode, x-coordinate of a given point is horizontally mirrored
        GroupBase.prototype.transformX = function (xcoord) {
            return this.isCalcRTL() ? this.size[0] - xcoord : xcoord;
        };
        /**
         * Checks if the given point is within the bounds of the rectangle defined by
         * startX, startY, endX, endY. If mirrorX is true then point is horizontally
         * mirrored before checking.
         */
        GroupBase.prototype.isPointInRect = function (point, startX, startY, endX, endY, mirrorX) {
            var x = mirrorX ? this.size[0] - point[0] : point[0];
            var y = point[1];
            return (x > startX && x < endX && y > startY && y < endY);
        };
        GroupBase.prototype.onDraw = function () {
            this.drawOutline();
            this.drawLevelHeaders();
        };
        GroupBase.prototype.findClickedGroup = function (point) {
            return null;
        };
        GroupBase.prototype.findClickedLevel = function (point) {
            return -1;
        };
        GroupBase.prototype.onMouseMove = function (point) {
            // If mouse is above a group header or a group control, we change the cursor.
            if (this.findClickedGroup(point) !== null || this.findClickedLevel(point) !== -1)
                this.context.canvas.style.cursor = 'pointer';
            else
                this.context.canvas.style.cursor = 'default';
        };
        GroupBase.prototype.onMouseLeave = function () {
            this.context.canvas.style.cursor = 'default';
        };
        GroupBase.prototype._updateOutlineState = function (group) {
            return;
        };
        GroupBase.prototype.onClick = function (point) {
            // User may have clicked on one of the level headers.
            var level = this.findClickedLevel(point);
            if (level !== -1) {
                this._updateOutlineState({ level: level, index: -1 }); // index: -1 targets all groups (there may be multiple separate row groups.).
            }
            else {
                // User may have clicked on one of the group control boxes (boxes with plus / minus symbols).
                var group = this.findClickedGroup(point);
                if (group) {
                    this._updateOutlineState(group);
                }
            }
        };
        // returns [startX, endX, startY, endY]
        GroupBase.prototype.getTailsGroupRect = function (group) {
            return [0, 0, 0, 0];
        };
        GroupBase.prototype.findTailsGroup = function (point) {
            var mirrorX = this.isCalcRTL();
            for (var i = 0; i < this._groups.length; i++) {
                if (this._groups[i]) {
                    for (var group in this._groups[i]) {
                        if (Object.prototype.hasOwnProperty.call(this._groups[i], group)) {
                            var group_ = this._groups[i][group];
                            var rect = this.getTailsGroupRect(group_);
                            var startX = rect[0];
                            var startY = rect[2];
                            var endX = rect[1];
                            var endY = rect[3];
                            if (this.isPointInRect(point, startX, startY, endX, endY, mirrorX)) {
                                return group_;
                            }
                        }
                    }
                }
            }
        };
        /* Double clicking on a group's tail closes it. */
        GroupBase.prototype.onDoubleClick = function (point) {
            var group = this.findTailsGroup(point);
            if (group)
                this._updateOutlineState(group);
        };
        GroupBase.prototype.onMouseEnter = function () {
            $.contextMenu('destroy', '#document-canvas');
        };
        GroupBase.prototype.onRemove = function () {
            this.isRemoved = true;
            this.containerObject.getSectionWithName(L.CSections.RowHeader.name).position[0] = 0;
            this.containerObject.getSectionWithName(L.CSections.CornerHeader.name).position[0] = 0;
        };
        return GroupBase;
    }(app.definitions.canvasSectionObject));
    cool.GroupBase = GroupBase;
})(cool || (cool = {}));
L.Control.GroupBase = cool.GroupBase;
//# sourceMappingURL=Control.GroupBase.js.map