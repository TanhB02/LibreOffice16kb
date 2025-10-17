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
 * Control.Header
 *
 * Abstract class, basis for ColumnHeader and RowHeader controls.
 * Used only in spreadsheets, implements the row/column headers.
 */
/* global $ L app */
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
    var Header = /** @class */ (function (_super) {
        __extends(Header, _super);
        function Header() {
            return _super.call(this) || this;
        }
        Header.prototype._initHeaderEntryStyles = function (className) {
            var baseElem = document.getElementsByTagName('body')[0];
            var elem = L.DomUtil.create('div', className, baseElem);
            this._textColor = L.DomUtil.getStyle(elem, 'color');
            this._backgroundColor = L.DomUtil.getStyle(elem, 'background-color');
            var fontFamily = L.DomUtil.getStyle(elem, 'font-family');
            this.getFont = function () {
                var selectedSize = this._getFontSize();
                return selectedSize + 'px ' + fontFamily;
            }.bind(this);
            this._borderColor = L.DomUtil.getStyle(elem, 'border-top-color');
            var borderWidth = L.DomUtil.getStyle(elem, 'border-top-width');
            this._borderWidth = Math.round(parseFloat(borderWidth));
            this._cursor = L.DomUtil.getStyle(elem, 'cursor');
            L.DomUtil.remove(elem);
        };
        Header.prototype._getFontSize = function () {
            var map = this._map;
            var zoomScale = map.getZoomScale(map.getZoom(), map.options.defaultZoom);
            if (zoomScale < 0.68)
                return Math.round(8 * app.dpiScale);
            else if (zoomScale < 0.8)
                return Math.round(10 * app.dpiScale);
            else
                return Math.round(12 * app.dpiScale);
        };
        Header.prototype._initHeaderEntryHoverStyles = function (className) {
            var baseElem = document.getElementsByTagName('body')[0];
            var elem = L.DomUtil.create('div', className, baseElem);
            this._hoverColor = L.DomUtil.getStyle(elem, 'background-color');
            L.DomUtil.remove(elem);
        };
        Header.prototype._initHeaderEntrySelectedStyles = function (className) {
            var baseElem = document.getElementsByTagName('body')[0];
            var elem = L.DomUtil.create('div', className, baseElem);
            this._selectionTextColor = L.DomUtil.getStyle(elem, 'color');
            var selectionBackgroundGradient = [];
            var gradientColors = L.DomUtil.getStyle(elem, 'background-image');
            gradientColors = gradientColors.slice('linear-gradient('.length, -1);
            while (gradientColors) {
                var color = gradientColors.split(',', 3);
                var colorJoin = color.join(','); // color = 'rgb(r, g, b)'
                selectionBackgroundGradient.push(colorJoin);
                gradientColors = gradientColors.substr(color.length); // remove last parsed color
                gradientColors = gradientColors.substr(gradientColors.indexOf('r')); // remove ', ' stuff
            }
            if (selectionBackgroundGradient.length) {
                this._selectionBackgroundGradient = selectionBackgroundGradient;
            }
            L.DomUtil.remove(elem);
        };
        Header.prototype._initHeaderEntryResizeStyles = function (className) {
            if (this.cursor) {
                this._resizeCursor = this.cursor;
            }
            else {
                var baseElem = document.getElementsByTagName('body')[0];
                var elem = L.DomUtil.create('div', className, baseElem);
                this._resizeCursor = L.DomUtil.getStyle(elem, 'cursor');
                L.DomUtil.remove(elem);
            }
        };
        Header.prototype._isRowColumnInSelectedRange = function (index) {
            var _a, _b;
            return (!!((_a = this._headerInfo.getElementData(index)) === null || _a === void 0 ? void 0 : _a.isCurrent)) || (!!((_b = this._headerInfo.getElementData(index)) === null || _b === void 0 ? void 0 : _b.isHighlighted));
        };
        Header.prototype.onContextMenu = function (evt) {
            if (window.mode.isMobile() && this._map.isEditMode()) {
                window.contextMenuWizard = true;
                this._map.fire('mobilewizard', { data: this._menuData });
            }
            else if (this._map.isEditMode()) {
                this._bindContextMenu();
                $('#canvas-container').contextMenu({ x: evt.clientX, y: evt.clientY });
            }
        };
        Header.prototype._updateCanvas = function () {
            if (this._headerInfo) {
                this._headerInfo.update(this);
                this.containerObject.requestReDraw();
            }
        };
        Header.prototype._reInitRowColumnHeaderStylesAfterModeChange = function () {
            // add a separation to update row/column DOM element info
            if (this._isColumn) {
                // update column DOM element info
                this._initHeaderEntryStyles('spreadsheet-header-column');
                this._initHeaderEntryHoverStyles('spreadsheet-header-column-hover');
                this._initHeaderEntrySelectedStyles('spreadsheet-header-column-selected');
                this._initHeaderEntryResizeStyles('spreadsheet-header-column-resize');
            }
            else {
                // update row DOM element info
                this._initHeaderEntryStyles('spreadsheet-header-row');
                this._initHeaderEntryHoverStyles('spreadsheet-header-row-hover');
                this._initHeaderEntrySelectedStyles('spreadsheet-header-row-selected');
                this._initHeaderEntryResizeStyles('spreadsheet-header-row-resize');
            }
        };
        Header.prototype.optimalHeight = function (index) {
            if (!this._isRowColumnInSelectedRange(index)) {
                this._selectRow(index, 0);
            }
            this._map.sendUnoCommand('.uno:SetOptimalRowHeight');
        };
        Header.prototype.insertRowAbove = function (index) {
            // First select the corresponding row because
            // .uno:InsertRows doesn't accept any row number
            // as argument and just inserts before the selected row
            if (!this._isRowColumnInSelectedRange(index)) {
                this._selectRow(index, 0);
            }
            this._map.sendUnoCommand('.uno:InsertRows');
        };
        Header.prototype.insertRowBelow = function (index) {
            if (!this._isRowColumnInSelectedRange(index)) {
                this._selectRow(index, 0);
            }
            this._map.sendUnoCommand('.uno:InsertRowsAfter');
        };
        Header.prototype.deleteRow = function (index) {
            if (!this._isRowColumnInSelectedRange(index)) {
                this._selectRow(index, 0);
            }
            this._map.sendUnoCommand('.uno:DeleteRows');
        };
        Header.prototype.hideRow = function (index) {
            if (!this._isRowColumnInSelectedRange(index)) {
                this._selectRow(index, 0);
            }
            this._map.sendUnoCommand('.uno:HideRow');
        };
        Header.prototype.showRow = function (index) {
            if (!this._isRowColumnInSelectedRange(index)) {
                this._selectRow(index, 0);
            }
            this._map.sendUnoCommand('.uno:ShowRow');
        };
        Header.prototype._selectRow = function (row, modifier) {
            // If function dialog is open and user wants to add the whole row to function.
            if (this._map.dialog.hasOpenedDialog() && this._map.dialog.getCurrentDialogContainer()) {
                var dialogContainer = this._map.dialog.getCurrentDialogContainer();
                if (dialogContainer.dataset.uniqueId === 'FormulaDialog') {
                    var alpha = String(row + 1);
                    var text = alpha + ':' + alpha;
                    this._map._textInput._sendText(text);
                }
                return;
            }
            // Normal behavior.
            var command = {
                Row: {
                    type: 'long',
                    value: row
                },
                Modifier: {
                    type: 'unsigned short',
                    value: modifier
                }
            };
            this._map.wholeRowSelected = true; // This variable is set early, state change will set this again.
            this._map.sendUnoCommand('.uno:SelectRow ', command);
            // Ensures the focus is returned to the map area after the row is selected
            this._map.focus();
        };
        Header.prototype._insertRowAbove = function () {
            var index = this._lastMouseOverIndex;
            if (index !== undefined) {
                this.insertRowAbove.call(this, index);
            }
        };
        Header.prototype._insertRowBelow = function () {
            var index = this._lastMouseOverIndex;
            if (index !== undefined) {
                this.insertRowBelow.call(this, index);
            }
        };
        Header.prototype._deleteSelectedRow = function () {
            var index = this._lastMouseOverIndex;
            if (index !== undefined) {
                this.deleteRow.call(this, index);
            }
        };
        Header.prototype._rowHeight = function () {
            this._map.sendUnoCommand('.uno:RowHeight');
        };
        Header.prototype._optimalHeight = function () {
            var index = this._lastMouseOverIndex;
            if (index !== undefined) {
                this.optimalHeight.call(this, index);
            }
        };
        Header.prototype._hideRow = function () {
            var index = this._lastMouseOverIndex;
            if (index !== undefined) {
                this.hideRow.call(this, index);
            }
        };
        Header.prototype._showRow = function () {
            var index = this._lastMouseOverIndex;
            if (index !== undefined) {
                this.showRow.call(this, index);
            }
        };
        Header.prototype.optimalWidth = function (index) {
            if (!this._isRowColumnInSelectedRange(index)) {
                this._selectColumn(index, 0);
            }
            this._map.sendUnoCommand('.uno:SetOptimalColumnWidth');
        };
        Header.prototype.insertColumnBefore = function (index) {
            // First select the corresponding column because
            // .uno:InsertColumn doesn't accept any column number
            // as argument and just inserts before the selected column
            if (!this._isRowColumnInSelectedRange(index)) {
                this._selectColumn(index, 0);
            }
            this._map.sendUnoCommand('.uno:InsertColumns');
            this._updateColumnHeader();
        };
        Header.prototype.insertColumnAfter = function (index) {
            if (!this._isRowColumnInSelectedRange(index)) {
                this._selectColumn(index, 0);
            }
            this._map.sendUnoCommand('.uno:InsertColumnsAfter');
            this._updateColumnHeader();
        };
        Header.prototype.deleteColumn = function (index) {
            if (!this._isRowColumnInSelectedRange(index)) {
                this._selectColumn(index, 0);
            }
            this._map.sendUnoCommand('.uno:DeleteColumns');
            this._updateColumnHeader();
        };
        Header.prototype.hideColumn = function (index) {
            if (!this._isRowColumnInSelectedRange(index)) {
                this._selectColumn(index, 0);
            }
            this._map.sendUnoCommand('.uno:HideColumn');
            this._updateColumnHeader();
        };
        Header.prototype.showColumn = function (index) {
            if (!this._isRowColumnInSelectedRange(index)) {
                this._selectColumn(index, 0);
            }
            this._map.sendUnoCommand('.uno:ShowColumn');
            this._updateColumnHeader();
        };
        Header.prototype._updateColumnHeader = function () {
            this._map._docLayer.refreshViewData({ x: this._map._getTopLeftPoint().x, y: 0, offset: { x: undefined, y: 0 } });
        };
        Header.prototype._colIndexToAlpha = function (columnNumber) {
            var offset = 'A'.charCodeAt(0);
            var dividend = columnNumber;
            var columnName = '';
            while (dividend > 0) {
                var modulo = (dividend - 1) % 26;
                columnName = String.fromCharCode(offset + modulo) + columnName;
                dividend = Math.floor((dividend - modulo) / 26);
            }
            return columnName;
        };
        Header.prototype._selectColumn = function (colNumber, modifier) {
            // If function dialog is open and user wants to add the whole column to function.
            if (this._map.dialog.hasOpenedDialog() && this._map.dialog.getCurrentDialogContainer()) {
                var dialogContainer = this._map.dialog.getCurrentDialogContainer();
                if (dialogContainer.dataset.uniqueId === 'FormulaDialog') {
                    var alpha = this._colIndexToAlpha(colNumber + 1);
                    var text = alpha + ':' + alpha;
                    this._map._textInput._sendText(text);
                }
                return;
            }
            // Normal behavior.
            var command = {
                Col: {
                    type: 'unsigned short',
                    value: colNumber
                },
                Modifier: {
                    type: 'unsigned short',
                    value: modifier
                }
            };
            this._map.wholeColumnSelected = true; // This variable is set early, state change will set this again.
            this._map.sendUnoCommand('.uno:SelectColumn ', command);
            // Ensures the focus is returned to the map area after the column is selected
            this._map.focus();
        };
        Header.prototype._insertColBefore = function () {
            var index = this._lastMouseOverIndex;
            if (index !== undefined) {
                this.insertColumnBefore.call(this, index);
            }
        };
        Header.prototype._insertColAfter = function () {
            var index = this._lastMouseOverIndex;
            if (index !== undefined) {
                this.insertColumnAfter.call(this, index);
            }
        };
        Header.prototype._deleteSelectedCol = function () {
            var index = this._lastMouseOverIndex;
            if (index !== undefined) {
                this.deleteColumn.call(this, index);
            }
        };
        Header.prototype._columnWidth = function () {
            this._map.sendUnoCommand('.uno:ColumnWidth');
        };
        Header.prototype._optimalWidth = function () {
            var index = this._lastMouseOverIndex;
            if (index !== undefined) {
                this.optimalWidth.call(this, index);
            }
        };
        Header.prototype._hideColumn = function () {
            var index = this._lastMouseOverIndex;
            if (index !== undefined) {
                this.hideColumn.call(this, index);
            }
        };
        Header.prototype._showColumn = function () {
            var index = this._lastMouseOverIndex;
            if (index !== undefined) {
                this.showColumn.call(this, index);
            }
        };
        Header.prototype._freezePanes = function () {
            this._map.sendUnoCommand('.uno:FreezePanes');
        };
        Header.prototype._entryAtPoint = function (point) {
            if (!this._headerInfo)
                return undefined;
            var isColumn = this._headerInfo._isColumn;
            var position = isColumn ? point[0] : point[1];
            var result = null;
            var isRTL = isColumn && this.isCalcRTL();
            this._headerInfo.forEachElement(function (entry) {
                var end = isRTL ? this.size[0] - entry.pos + entry.size : entry.pos;
                var start = end - entry.size;
                if (position >= start && position < end) {
                    // NOTE: From a geometric perspective resizeAreaStart is really "resizeAreaEnd" in RTL case.
                    var resizeAreaStart = isRTL ? Math.min(start + 3 * app.dpiScale, end) : Math.max(start, end - 3 * app.dpiScale);
                    if (entry.isCurrent || window.mode.isMobile()) {
                        resizeAreaStart = isRTL ? start + this._resizeHandleSize : end - this._resizeHandleSize;
                    }
                    var isMouseOverResizeArea = isRTL ? (position < resizeAreaStart) : (position > resizeAreaStart);
                    result = { entry: entry, hit: isMouseOverResizeArea };
                    return true;
                }
            }.bind(this));
            return result;
        };
        Header.prototype.drawHeaderEntry = function (entry) {
            return;
        };
        Header.prototype.onDraw = function () {
            this._headerInfo.forEachElement(function (elemData) {
                this.drawHeaderEntry(elemData);
                return false; // continue till last.
            }.bind(this));
            this.drawResizeLineIfNeeded();
        };
        Header.prototype.onDragEnd = function (dragDistance) {
            return;
        };
        Header.prototype.onMouseEnter = function () {
            this.containerObject.getCanvasStyle().cursor = this._cursor;
            this._bindContextMenu();
        };
        Header.prototype.onMouseLeave = function (point) {
            if (point === null) { // This means that the mouse pointer is outside the canvas.
                if (this.containerObject.isDraggingSomething() && this._dragEntry) { // Were we resizing a row / column before mouse left.
                    this.onDragEnd(this.containerObject.getDragDistance());
                }
            }
            if (this._mouseOverEntry) {
                this.containerObject.setPenPosition(this);
                this._mouseOverEntry.isOver = false;
                this.drawHeaderEntry(this._mouseOverEntry);
                this._mouseOverEntry = null;
            }
            this._hitResizeArea = false;
            this.containerObject.getCanvasStyle().cursor = 'default';
        };
        Header.prototype._bindContextMenu = function () {
            if (window.mode.isMobile() || this._map.isReadOnlyMode()) {
                // On mobile, we use the mobile wizard rather than the context menu
                return;
            }
            this._unBindContextMenu();
            $.contextMenu({
                selector: '#canvas-container',
                className: 'cool-font',
                zIndex: 1500,
                items: this._menuItem,
                callback: function () { return; }
            });
            $('#canvas-container').contextMenu('update');
            this._map._contextMenu.stopRightMouseUpEvent();
        };
        Header.prototype._unBindContextMenu = function () {
            $.contextMenu('destroy', '#canvas-container');
        };
        Header.prototype.inResize = function () {
            return this.containerObject.isDraggingSomething() && this._dragEntry && (this._dragDistance !== null);
        };
        Header.prototype.drawResizeLineIfNeeded = function () {
            if (!this.inResize())
                return;
            this.containerObject.setPenPosition(this);
            var isRTL = this.isCalcRTL();
            var x = this._isColumn ? ((isRTL ? this.size[0] - this._dragEntry.pos : this._dragEntry.pos) + this._dragDistance[0]) : (isRTL ? 0 : this.size[0]);
            var y = this._isColumn ? this.size[1] : (this._dragEntry.pos + this._dragDistance[1]);
            this.context.lineWidth = app.dpiScale;
            this.context.strokeStyle = 'darkblue';
            this.context.beginPath();
            this.context.moveTo(x, y);
            this.context.lineTo(this._isColumn ? x : (isRTL ? -this.myTopLeft[0] : this.containerObject.getWidth()), this._isColumn ? this.containerObject.getHeight() : y);
            this.context.stroke();
        };
        Header.prototype.onMouseMove = function (point, dragDistance) {
            var result = this._entryAtPoint(point); // Data related to current entry that the mouse is over now.
            if (result) { // Is mouse over an entry.
                this._prevMouseOverEntry = this._mouseOverEntry;
                this._mouseOverEntry = result.entry;
            }
            else
                return;
            if (!this.containerObject.isDraggingSomething()) { // If we are not dragging anything.
                this._dragDistance = null;
                // If mouse was over another entry previously, we draw that again (without mouse-over effect).
                if (this._prevMouseOverEntry && (result && result.entry.index !== this._prevMouseOverEntry.index)) {
                    this.containerObject.setPenPosition(this);
                    this._prevMouseOverEntry.isOver = false;
                    this.drawHeaderEntry(this._prevMouseOverEntry);
                }
                var isMouseOverResizeArea = false;
                this._mouseOverEntry.isOver = true;
                this._lastMouseOverIndex = this._mouseOverEntry.index; // used by context menu
                this.containerObject.setPenPosition(this);
                this.drawHeaderEntry(result.entry);
                isMouseOverResizeArea = result.hit;
                // cypress mobile emulation sometimes triggers resizing unintentionally.
                if (L.Browser.cypressTest)
                    return;
                if (isMouseOverResizeArea !== this._hitResizeArea) { // Do we need to change cursor (to resize or pointer).
                    var cursor = isMouseOverResizeArea ? this._resizeCursor : this._cursor;
                    this.containerObject.getCanvasStyle().cursor = cursor;
                    this._hitResizeArea = isMouseOverResizeArea;
                }
            }
            else { // We are in dragging mode.
                this._dragDistance = dragDistance;
                this.containerObject.requestReDraw(); // Remove previously drawn line and paint a new one.
                if (this._prevMouseOverEntry && this._lastSelectedIndex == this._prevMouseOverEntry.index)
                    return;
                if (this._dragEntry)
                    return;
                var modifier = typeof this._lastSelectedIndex === 'number' && this._lastSelectedIndex >= 0 ? UNOModifier.SHIFT : 0;
                this._lastSelectedIndex = this._mouseOverEntry.index;
                this.selectIndex(this._mouseOverEntry.index, modifier);
            }
        };
        Header.prototype.selectIndex = function (index, modifier) {
            return;
        };
        Header.prototype.setOptimalWidthAuto = function () {
            return;
        };
        Header.prototype.setOptimalHeightAuto = function () {
            return;
        };
        Header.prototype.onDoubleClick = function () {
            this._isColumn ? this.setOptimalWidthAuto() : this.setOptimalHeightAuto();
        };
        Header.prototype.onMouseDown = function (point) {
            this.onMouseMove(point);
            if (this._hitResizeArea) {
                L.DomUtil.disableImageDrag();
                L.DomUtil.disableTextSelection();
                // When code is here, this._mouseOverEntry should never be null.
                this._dragEntry = {
                    index: this._mouseOverEntry.index,
                    origsize: this._mouseOverEntry.origsize,
                    pos: this._mouseOverEntry.pos,
                    size: this._mouseOverEntry.size
                };
            }
            else {
                this._dragEntry = null;
            }
            this._startSelectionEntry = this._mouseOverEntry;
            this._lastSelectedIndex = null;
        };
        Header.prototype.onMouseUp = function () {
            L.DomUtil.enableImageDrag();
            L.DomUtil.enableTextSelection();
            this._map.fire('closepopups'); // close all popups if a row/column header is selected
            if (this.containerObject.isDraggingSomething() && this._dragEntry) {
                this.onDragEnd(this.containerObject.getDragDistance());
                this._dragEntry = null;
            }
        };
        Header.prototype.onNewDocumentTopLeft = function () {
            return;
        };
        return Header;
    }(app.definitions.canvasSectionObject));
    cool.Header = Header;
    var HeaderInfo = /** @class */ (function () {
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        function HeaderInfo(map, _isColumn) {
            window.app.console.assert(map && _isColumn !== undefined, 'map and isCol required');
            this._map = map;
            this._isColumn = _isColumn;
            window.app.console.assert(this._map._docLayer.sheetGeometry, 'no sheet geometry data-structure found!');
            var sheetGeom = this._map._docLayer.sheetGeometry;
            this._dimGeom = this._isColumn ? sheetGeom.getColumnsGeometry() : sheetGeom.getRowsGeometry();
        }
        HeaderInfo.prototype.findXInCellSelections = function (cellSelections, ordinate) {
            for (var i = 0; i < cellSelections.length; i++) {
                if (cellSelections[i].containsPixelOrdinateX(ordinate))
                    return true;
            }
            return false;
        };
        HeaderInfo.prototype.findYInCellSelections = function (cellSelections, ordinate) {
            for (var i = 0; i < cellSelections.length; i++) {
                if (cellSelections[i].containsPixelOrdinateY(ordinate))
                    return true;
            }
            return false;
        };
        HeaderInfo.prototype.isHeaderEntryHighLighted = function (cellSelections, ordinate) {
            if (this._isColumn && this._map.wholeRowSelected)
                return true;
            else if (!this._isColumn && this._map.wholeColumnSelected)
                return true;
            else if (this._isColumn && cellSelections.length > 0) {
                return this.findXInCellSelections(cellSelections, ordinate);
            }
            else if (!this._isColumn && cellSelections.length > 0) {
                return this.findYInCellSelections(cellSelections, ordinate);
            }
            else
                return false;
        };
        HeaderInfo.prototype.update = function (section) {
            var _this = this;
            var cellSelections = this._map._docLayer._cellSelections;
            var currentIndex;
            if (app.calc.cellCursorVisible) {
                currentIndex = this._isColumn ? app.calc.cellAddress.x : app.calc.cellAddress.y;
            }
            else {
                currentIndex = -1;
            }
            var tsManager = this._map._docLayer._painter;
            var ctx = tsManager._paintContext();
            var splitPos = this._isColumn ?
                ctx.splitPos.x
                : ctx.splitPos.y;
            var startPx;
            var scale;
            if (tsManager._inZoomAnim) {
                var viewBounds = ctx.viewBounds;
                var freePaneBounds = new L.Bounds(viewBounds.min.add(ctx.splitPos), viewBounds.max);
                scale = tsManager._zoomFrameScale;
                var zoomPos = tsManager._getZoomDocPos(tsManager._newCenter, tsManager._layer._pinchStartCenter, freePaneBounds, { freezeX: false, freezeY: false }, ctx.splitPos, scale, false);
                startPx = this._isColumn ?
                    zoomPos.topLeft.x
                    : zoomPos.topLeft.y;
            }
            else {
                startPx = this._isColumn ?
                    section.documentTopLeft[0] + splitPos
                    : section.documentTopLeft[1] + splitPos;
                scale = 1;
            }
            var endPx = this._isColumn ?
                startPx + section.size[0] / scale
                : startPx + section.size[1] / scale;
            this._docVisStart = startPx;
            var startIdx = this._dimGeom.getIndexFromPos(startPx, 'corepixels');
            var maxIndex = this._isColumn ? this._map._docLayer.sheetGeometry.maxVisibleColumnIndex : this._map._docLayer.sheetGeometry.maxVisibleRowIndex;
            var endIdx = Math.min(this._dimGeom.getIndexFromPos(endPx - 1, 'corepixels'), 1048576 - 1, maxIndex);
            this._elements = [];
            this._hasSplits = false;
            this._splitIndex = 0;
            if (splitPos) {
                var splitIndex = this._dimGeom.getIndexFromPos(splitPos + 1, 'corepixels');
                if (splitIndex) {
                    this._splitPos = splitPos;
                    this._dimGeom.forEachInRange(0, splitIndex - 1, function (idx, data) {
                        _this._elements[idx] = {
                            index: idx,
                            pos: (data.startpos + data.size) * scale,
                            size: data.size * scale,
                            origsize: data.size,
                            isHighlighted: _this.isHeaderEntryHighLighted(cellSelections, data.startpos + data.size * 0.5),
                            isCurrent: idx === currentIndex
                        };
                    });
                    this._hasSplits = true;
                    this._splitIndex = splitIndex;
                    var freeStartPos = startPx;
                    var freeStartIndex = this._dimGeom.getIndexFromPos(freeStartPos + 1, 'corepixels');
                    startIdx = freeStartIndex;
                }
            }
            // first free index
            var dataFirstFree = this._dimGeom.getElementData(startIdx);
            var firstFreeEnd = dataFirstFree.startpos + dataFirstFree.size - startPx + splitPos;
            var firstFreeStart = splitPos;
            var firstFreeSize = Math.max(0, firstFreeEnd - firstFreeStart);
            this._elements[startIdx] = {
                index: startIdx,
                pos: firstFreeEnd * scale,
                size: firstFreeSize * scale,
                origsize: dataFirstFree.size,
                isHighlighted: this.isHeaderEntryHighLighted(cellSelections, dataFirstFree.startpos + dataFirstFree.size * 0.5),
                isCurrent: startIdx === currentIndex
            };
            this._dimGeom.forEachInRange(startIdx + 1, endIdx, function (idx, data) {
                _this._elements[idx] = {
                    index: idx,
                    pos: (data.startpos - startPx + splitPos + data.size) * scale,
                    size: data.size * scale,
                    origsize: data.size,
                    isHighlighted: _this.isHeaderEntryHighLighted(cellSelections, data.startpos + data.size * 0.5),
                    isCurrent: idx === currentIndex
                };
            });
            this._startIndex = startIdx;
            this._endIndex = endIdx;
        };
        HeaderInfo.prototype.docToHeaderPos = function (docPos) {
            if (!this._hasSplits) {
                return docPos - this._docVisStart;
            }
            if (docPos <= this._splitPos) {
                return docPos;
            }
            // max here is to prevent encroachment of the fixed pane-area.
            return Math.max(docPos - this._docVisStart, this._splitPos);
        };
        HeaderInfo.prototype.headerToDocPos = function (hdrPos) {
            if (!this._hasSplits) {
                return hdrPos + this._docVisStart;
            }
            if (hdrPos <= this._splitPos) {
                return hdrPos;
            }
            return hdrPos + this._docVisStart;
        };
        HeaderInfo.prototype.isZeroSize = function (i) {
            var elem = this._elements[i];
            window.app.console.assert(elem, 'queried a non existent row/col in the header : ' + i);
            return elem.size === 0;
        };
        HeaderInfo.prototype.getMinIndex = function () {
            return this._hasSplits ? 0 : this._startIndex;
        };
        HeaderInfo.prototype.getMaxIndex = function () {
            return this._endIndex;
        };
        HeaderInfo.prototype.getElementData = function (index) {
            return this._elements[index];
        };
        HeaderInfo.prototype.getRowData = function (index) {
            window.app.console.assert(!this._isColumn, 'this is a column header instance!');
            return this.getElementData(index);
        };
        HeaderInfo.prototype.getColData = function (index) {
            window.app.console.assert(this._isColumn, 'this is a row header instance!');
            return this.getElementData(index);
        };
        HeaderInfo.prototype.getPreviousIndex = function (index) {
            var prevIndex;
            if (this._splitIndex && index === this._startIndex) {
                prevIndex = this._splitIndex - 1;
            }
            else {
                prevIndex = index - 1;
            }
            return prevIndex;
        };
        HeaderInfo.prototype.getNextIndex = function (index) {
            var nextIndex;
            if (this._splitIndex && index === (this._splitIndex - 1)) {
                nextIndex = this._startIndex;
            }
            else {
                nextIndex = index + 1;
            }
            return nextIndex;
        };
        HeaderInfo.prototype.forEachElement = function (callback) {
            var idx;
            if (this._hasSplits) {
                for (idx = 0; idx < this._splitIndex; ++idx) {
                    window.app.console.assert(this._elements[idx], 'forEachElement failed');
                    if (callback(this._elements[idx])) {
                        return;
                    }
                }
            }
            for (idx = this._startIndex; idx <= this._endIndex; ++idx) {
                window.app.console.assert(this._elements[idx], 'forEachElement failed');
                if (callback(this._elements[idx])) {
                    return;
                }
            }
        };
        return HeaderInfo;
    }());
    cool.HeaderInfo = HeaderInfo;
})(cool || (cool = {}));
L.Control.Header = cool.Header;
L.Control.Header.HeaderInfo = cool.HeaderInfo;
//# sourceMappingURL=Control.Header.js.map