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
    var RowHeader = /** @class */ (function (_super) {
        __extends(RowHeader, _super);
        function RowHeader(cursor) {
            var _this = _super.call(this) || this;
            _this.name = L.CSections.RowHeader.name;
            _this.anchor = [[L.CSections.CornerHeader.name, 'bottom', 'top'], [L.CSections.RowGroup.name, 'right', 'left']];
            _this.position = [0, 0]; // This section's myTopLeft is placed according to corner header and row group sections.
            _this.size = [48 * app.dpiScale, 0]; // No initial height is necessary.
            _this.expand = ['top', 'bottom']; // Expand vertically.
            _this.processingOrder = L.CSections.RowHeader.processingOrder;
            _this.drawingOrder = L.CSections.RowHeader.drawingOrder;
            _this.zIndex = L.CSections.RowHeader.zIndex;
            _this.cursor = 'row-resize';
            if (cursor)
                _this.cursor = cursor;
            return _this;
        }
        RowHeader.prototype.onInitialize = function () {
            this._map = L.Map.THIS;
            this._isColumn = false;
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
            this._initHeaderEntryStyles('spreadsheet-header-row');
            this._initHeaderEntryHoverStyles('spreadsheet-header-row-hover');
            this._initHeaderEntrySelectedStyles('spreadsheet-header-row-selected');
            this._initHeaderEntryResizeStyles('spreadsheet-header-row-resize');
            this._menuItem = {
                '.uno:InsertRowsBefore': {
                    name: _UNO('.uno:InsertRowsBefore', 'spreadsheet', true),
                    callback: (this._insertRowAbove).bind(this)
                },
                '.uno:InsertRowsAfter': {
                    name: _UNO('.uno:InsertRowsAfter', 'spreadsheet', true),
                    callback: (this._insertRowBelow).bind(this)
                },
                '.uno:DeleteRows': {
                    name: _UNO('.uno:DeleteRows', 'spreadsheet', true),
                    callback: (this._deleteSelectedRow).bind(this)
                },
                '.uno:RowHeight': {
                    name: _UNO('.uno:RowHeight', 'spreadsheet', true),
                    callback: (this._rowHeight).bind(this)
                },
                '.uno:SetOptimalRowHeight': {
                    name: _UNO('.uno:SetOptimalRowHeight', 'spreadsheet', true),
                    callback: (this._optimalHeight).bind(this)
                },
                '.uno:HideRow': {
                    name: _UNO('.uno:HideRow', 'spreadsheet', true),
                    callback: (this._hideRow).bind(this)
                },
                '.uno:ShowRow': {
                    name: _UNO('.uno:ShowRow', 'spreadsheet', true),
                    callback: (this._showRow).bind(this)
                },
                '.uno:FreezePanes': {
                    name: _UNO('.uno:FreezePanes', 'spreadsheet', true),
                    callback: (this._freezePanes).bind(this)
                }
            };
            this._menuData = L.Control.JSDialogBuilder.getMenuStructureForMobileWizard(this._menuItem, true, '');
            this._headerInfo = new cool.HeaderInfo(this._map, false /* isCol */);
        };
        RowHeader.prototype.drawHeaderEntry = function (entry) {
            if (!entry)
                return;
            var content = entry.index + 1;
            var startY = entry.pos - entry.size;
            if (entry.size <= 0)
                return;
            var highlight = entry.isCurrent || entry.isHighlighted;
            // background gradient
            var selectionBackgroundGradient = null;
            if (highlight) {
                selectionBackgroundGradient = this.context.createLinearGradient(0, startY, 0, startY + entry.size);
                selectionBackgroundGradient.addColorStop(0, this._selectionBackgroundGradient[0]);
                selectionBackgroundGradient.addColorStop(0.5, this._selectionBackgroundGradient[1]);
                selectionBackgroundGradient.addColorStop(1, this._selectionBackgroundGradient[2]);
            }
            // draw background
            this.context.beginPath();
            this.context.fillStyle = highlight ? selectionBackgroundGradient : entry.isOver ? this._hoverColor : this._backgroundColor;
            this.context.fillRect(0, startY, this.size[0], entry.size);
            // draw resize handle
            var handleSize = this._resizeHandleSize;
            if (entry.isCurrent && entry.size > 2 * handleSize && !this.inResize()) {
                var center = startY + entry.size - handleSize / 2;
                var x = 2 * app.dpiScale;
                var w = this.size[0] - 4 * app.dpiScale;
                var size = 2 * app.dpiScale;
                var offsetOnePixel = 1 * app.dpiScale;
                this.context.fillStyle = '#BBBBBB';
                this.context.beginPath();
                this.context.fillRect(x + 2 * app.dpiScale, center - size - offsetOnePixel, w - 4 * app.dpiScale, size);
                this.context.beginPath();
                this.context.fillRect(x + 2 * app.dpiScale, center + offsetOnePixel, w - 4 * app.dpiScale, size);
            }
            // draw text content
            this.context.fillStyle = highlight ? this._selectionTextColor : this._textColor;
            this.context.font = this.getFont();
            this.context.textAlign = 'center';
            this.context.textBaseline = 'middle';
            this.context.fillText(content.toString(), this.size[0] / 2, entry.pos - (entry.size / 2) + app.roundedDpiScale);
            // draw row borders.
            this.context.strokeStyle = this._borderColor;
            var offset = this.getLineOffset();
            this.context.lineWidth = this.getLineWidth();
            this.context.strokeRect(offset, startY - offset, this.size[0], entry.size);
        };
        RowHeader.prototype.getHeaderEntryBoundingClientRect = function (index) {
            var entry = this._mouseOverEntry;
            if (index)
                entry = this._headerInfo.getRowData(index);
            if (!entry)
                return;
            var rect = this.containerObject.getCanvasBoundingClientRect();
            var rowStart = (entry.pos - entry.size) / app.dpiScale;
            var rowEnd = entry.pos / app.dpiScale;
            var left = rect.left;
            var right = rect.right;
            var top = rect.top + rowStart;
            var bottom = rect.top + rowEnd;
            return { left: left, right: right, top: top, bottom: bottom };
        };
        RowHeader.prototype.onClick = function (point, e) {
            if (!this._mouseOverEntry)
                return;
            var row = this._mouseOverEntry.index;
            var modifier = 0;
            if (e.shiftKey) {
                modifier += UNOModifier.SHIFT;
            }
            if (e.ctrlKey) {
                modifier += UNOModifier.CTRL;
            }
            this._selectRow(row, modifier);
        };
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        RowHeader.prototype._onDialogResult = function (e) {
            if (e.type === 'submit' && !isNaN(e.value)) {
                var extra = {
                    aExtraHeight: {
                        type: 'unsigned short',
                        value: e.value
                    }
                };
                this._map.sendUnoCommand('.uno:SetOptimalRowHeight', extra);
            }
        };
        RowHeader.prototype.onDragEnd = function (dragDistance) {
            if (dragDistance[1] === 0)
                return;
            var height = this._dragEntry.size;
            var row = this._dragEntry.index;
            var nextRow = this._headerInfo.getNextIndex(this._dragEntry.index);
            if (this._headerInfo.isZeroSize(nextRow)) {
                row = nextRow;
                height = 0;
            }
            height += dragDistance[1];
            height /= app.dpiScale;
            height = this._map._docLayer._pixelsToTwips({ x: 0, y: height }).y;
            var command = {
                RowHeight: {
                    type: 'unsigned short',
                    value: this._map._docLayer.twipsToHMM(Math.max(height, 0))
                },
                Row: {
                    type: 'long',
                    value: row + 1 // core expects 1-based index.
                }
            };
            this._map.sendUnoCommand('.uno:RowHeight', command);
            this._mouseOverEntry = null;
        };
        RowHeader.prototype.onMouseUp = function () {
            _super.prototype.onMouseUp.call(this);
            if (!(this.containerObject.isDraggingSomething() && this._dragEntry)) {
                this._lastSelectedIndex = null;
                this._startSelectionEntry = null;
            }
        };
        RowHeader.prototype.setOptimalHeightAuto = function () {
            if (this._mouseOverEntry) {
                var row = this._mouseOverEntry.index;
                var command = {
                    Row: {
                        type: 'long',
                        value: row
                    },
                    Modifier: {
                        type: 'unsigned short',
                        value: 0
                    }
                };
                var extra = {
                    aExtraHeight: {
                        type: 'unsigned short',
                        value: 0
                    }
                };
                this._map.sendUnoCommand('.uno:SelectRow', command);
                this._map.sendUnoCommand('.uno:SetOptimalRowHeight', extra);
            }
        };
        RowHeader.prototype._getParallelPos = function (point) {
            return point.y;
        };
        RowHeader.prototype._getOrthogonalPos = function (point) {
            return point.x;
        };
        RowHeader.prototype.selectIndex = function (index, modifier) {
            this._selectRow(index, modifier);
        };
        return RowHeader;
    }(cool.Header));
    cool.RowHeader = RowHeader;
})(cool || (cool = {}));
app.definitions.rowHeader = cool.RowHeader;
//# sourceMappingURL=Control.RowHeader.js.map