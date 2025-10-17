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
 * Control.ColumnHeader
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
/* global _UNO app UNOModifier */
var cool;
(function (cool) {
    var ColumnHeader = /** @class */ (function (_super) {
        __extends(ColumnHeader, _super);
        function ColumnHeader(cursor) {
            var _this = _super.call(this) || this;
            _this.name = L.CSections.ColumnHeader.name;
            _this.anchor = [[L.CSections.ColumnGroup.name, 'bottom', 'top'], [L.CSections.CornerHeader.name, 'right', 'left']];
            _this.position = [0, 0]; // This section's myTopLeft is placed according to corner header and column group sections.
            _this.size = [0, 19 * app.dpiScale]; // No initial width is necessary.
            _this.expand = ['right']; // Expand horizontally.
            _this.processingOrder = L.CSections.ColumnHeader.processingOrder;
            _this.drawingOrder = L.CSections.ColumnHeader.drawingOrder;
            _this.zIndex = L.CSections.ColumnHeader.zIndex;
            _this.cursor = 'col-resize';
            if (cursor)
                _this.cursor = cursor;
            return _this;
        }
        ColumnHeader.prototype.onInitialize = function () {
            this._map = L.Map.THIS;
            this._isColumn = true;
            this._current = -1;
            this._resizeHandleSize = 15 * app.dpiScale;
            this._selection = { start: -1, end: -1 };
            this._mouseOverEntry = null;
            this._lastMouseOverIndex = undefined;
            this._hitResizeArea = false;
            this.sectionProperties.docLayer = this._map._docLayer;
            this._selectionBackgroundGradient = ['#3465A4', '#729FCF', '#004586'];
            this._map.on('move zoomchanged sheetgeometrychanged splitposchanged', this._updateCanvas, this);
            this._map.on('darkmodechanged', this._reInitRowColumnHeaderStylesAfterModeChange, this);
            this._initHeaderEntryStyles('spreadsheet-header-column');
            this._initHeaderEntryHoverStyles('spreadsheet-header-column-hover');
            this._initHeaderEntrySelectedStyles('spreadsheet-header-column-selected');
            this._initHeaderEntryResizeStyles('spreadsheet-header-column-resize');
            this._menuItem = {
                '.uno:InsertColumnsBefore': {
                    name: _UNO('.uno:InsertColumnsBefore', 'spreadsheet', true),
                    callback: (this._insertColBefore).bind(this)
                },
                '.uno:InsertColumnsAfter': {
                    name: _UNO('.uno:InsertColumnsAfter', 'spreadsheet', true),
                    callback: (this._insertColAfter).bind(this)
                },
                '.uno:DeleteColumns': {
                    name: _UNO('.uno:DeleteColumns', 'spreadsheet', true),
                    callback: (this._deleteSelectedCol).bind(this)
                },
                '.uno:ColumnWidth': {
                    name: _UNO('.uno:ColumnWidth', 'spreadsheet', true),
                    callback: (this._columnWidth).bind(this)
                },
                '.uno:SetOptimalColumnWidth': {
                    name: _UNO('.uno:SetOptimalColumnWidth', 'spreadsheet', true),
                    callback: (this._optimalWidth).bind(this)
                },
                '.uno:HideColumn': {
                    name: _UNO('.uno:HideColumn', 'spreadsheet', true),
                    callback: (this._hideColumn).bind(this)
                },
                '.uno:ShowColumn': {
                    name: _UNO('.uno:ShowColumn', 'spreadsheet', true),
                    callback: (this._showColumn).bind(this)
                },
                '.uno:FreezePanes': {
                    name: _UNO('.uno:FreezePanes', 'spreadsheet', true),
                    callback: (this._freezePanes).bind(this)
                }
            };
            this._menuData = L.Control.JSDialogBuilder.getMenuStructureForMobileWizard(this._menuItem, true, '');
            this._headerInfo = new cool.HeaderInfo(this._map, true /* isCol */);
        };
        ColumnHeader.prototype.drawHeaderEntry = function (entry) {
            if (!entry)
                return;
            var isRTL = this.isCalcRTL();
            var content = this._colIndexToAlpha(entry.index + 1);
            var startX = isRTL ? this.size[0] - entry.pos : entry.pos - entry.size;
            if (entry.size <= 0)
                return;
            var highlight = entry.isCurrent || entry.isHighlighted;
            // background gradient
            var selectionBackgroundGradient = null;
            if (highlight) {
                selectionBackgroundGradient = this.context.createLinearGradient(startX, 0, startX, this.size[1]);
                selectionBackgroundGradient.addColorStop(0, this._selectionBackgroundGradient[0]);
                selectionBackgroundGradient.addColorStop(0.5, this._selectionBackgroundGradient[1]);
                selectionBackgroundGradient.addColorStop(1, this._selectionBackgroundGradient[2]);
            }
            // draw background
            this.context.beginPath();
            this.context.fillStyle = highlight ? selectionBackgroundGradient : entry.isOver ? this._hoverColor : this._backgroundColor;
            this.context.fillRect(startX, 0, entry.size, this.size[1]);
            // draw resize handle
            var handleSize = this._resizeHandleSize;
            if (entry.isCurrent && entry.size > 2 * handleSize && !this.inResize()) {
                var center = isRTL ? startX + handleSize / 2 : startX + entry.size - handleSize / 2;
                var y = 2 * app.dpiScale;
                var h = this.size[1] - 4 * app.dpiScale;
                var size = 2 * app.dpiScale;
                var offset_1 = 1 * app.dpiScale;
                this.context.fillStyle = '#BBBBBB';
                this.context.beginPath();
                this.context.fillRect(center - size - offset_1, y + 2 * app.dpiScale, size, h - 4 * app.dpiScale);
                this.context.beginPath();
                this.context.fillRect(center + offset_1, y + 2 * app.dpiScale, size, h - 4 * app.dpiScale);
            }
            // draw text content
            this.context.fillStyle = highlight ? this._selectionTextColor : this._textColor;
            this.context.font = this.getFont();
            this.context.textAlign = 'center';
            this.context.textBaseline = 'middle';
            // The '+ 1' below is a hack - it's currently not possible to measure
            // the exact bounding box in html5's canvas, and the textBaseline
            // 'middle' measures everything including the descent etc.
            // '+ 1' looks visually fine, and seems safe enough
            this.context.fillText(content, isRTL ? startX + (entry.size / 2) : entry.pos - (entry.size / 2), (this.size[1] / 2) + 1);
            // draw column borders.
            this.context.strokeStyle = this._borderColor;
            var offset = this.getLineOffset();
            this.context.lineWidth = this.getLineWidth();
            this.context.strokeRect(startX - offset, offset, entry.size, this.size[1]);
        };
        ColumnHeader.prototype.getHeaderEntryBoundingClientRect = function (index) {
            var entry = this._mouseOverEntry;
            if (index) {
                entry = this._headerInfo.getColData(index);
            }
            if (!entry)
                return;
            var rect = this.containerObject.getCanvasBoundingClientRect();
            var colStart = (entry.pos - entry.size) / app.dpiScale;
            var colEnd = entry.pos / app.dpiScale;
            var isRTL = this.isCalcRTL();
            var left = isRTL ? rect.right - colEnd : rect.left + colStart;
            var right = isRTL ? rect.right - colStart : rect.left + colEnd;
            var top = rect.top;
            var bottom = rect.bottom;
            return { left: left, right: right, top: top, bottom: bottom };
        };
        ColumnHeader.prototype.onClick = function (point, e) {
            if (!this._mouseOverEntry)
                return;
            if (this._hitResizeArea)
                return;
            var col = this._mouseOverEntry.index;
            var modifier = 0;
            if (e.shiftKey) {
                modifier += UNOModifier.SHIFT;
            }
            if (e.ctrlKey) {
                modifier += UNOModifier.CTRL;
            }
            this._selectColumn(col, modifier);
        };
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        ColumnHeader.prototype._onDialogResult = function (e) {
            if (e.type === 'submit' && !isNaN(e.value)) {
                var extra = {
                    aExtraWidth: {
                        type: 'unsigned short',
                        value: e.value
                    }
                };
                this._map.sendUnoCommand('.uno:SetOptimalColumnWidth', extra);
            }
        };
        ColumnHeader.prototype.onDragEnd = function (dragDistance) {
            if (dragDistance[0] === 0)
                return;
            var width = this._dragEntry.size;
            var column = this._dragEntry.index;
            var nextCol = this._headerInfo.getNextIndex(this._dragEntry.index);
            if (this._headerInfo.isZeroSize(nextCol)) {
                column = nextCol;
                width = 0;
            }
            var isRTL = this.isCalcRTL();
            if (isRTL) {
                width -= dragDistance[0];
            }
            else {
                width += dragDistance[0];
            }
            width /= app.dpiScale;
            width = this._map._docLayer._pixelsToTwips({ x: width, y: 0 }).x;
            var command = {
                ColumnWidth: {
                    type: 'unsigned short',
                    value: this._map._docLayer.twipsToHMM(Math.max(width, 0))
                },
                Column: {
                    type: 'unsigned short',
                    value: column + 1 // core expects 1-based index.
                }
            };
            this._map.sendUnoCommand('.uno:ColumnWidth', command);
            this._mouseOverEntry = null;
        };
        ColumnHeader.prototype.onMouseUp = function () {
            _super.prototype.onMouseUp.call(this);
            if (!(this.containerObject.isDraggingSomething() && this._dragEntry)) {
                this._lastSelectedIndex = null;
                this._startSelectionEntry = null;
            }
        };
        ColumnHeader.prototype.setOptimalWidthAuto = function () {
            if (this._mouseOverEntry) {
                var column = this._mouseOverEntry.index;
                if (!this._hitResizeArea) {
                    var command = {
                        Column: {
                            type: 'long',
                            value: column
                        },
                        Modifier: {
                            type: 'unsigned short',
                            value: 0
                        }
                    };
                    this._map.sendUnoCommand('.uno:SelectColumn', command);
                }
                var extra = {
                    aExtraHeight: {
                        type: 'unsigned short',
                        value: 0
                    }
                };
                this._map.sendUnoCommand('.uno:SetOptimalColumnWidthDirect', extra);
            }
        };
        ColumnHeader.prototype._getParallelPos = function (point) {
            return point.x;
        };
        ColumnHeader.prototype._getOrthogonalPos = function (point) {
            return point.y;
        };
        ColumnHeader.prototype.selectIndex = function (index, modifier) {
            this._selectColumn(index, modifier);
        };
        return ColumnHeader;
    }(cool.Header));
    cool.ColumnHeader = ColumnHeader;
})(cool || (cool = {}));
app.definitions.columnHeader = cool.ColumnHeader;
//# sourceMappingURL=Control.ColumnHeader.js.map