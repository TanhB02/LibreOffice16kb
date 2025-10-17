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
var SplitterLinesSection = /** @class */ (function (_super) {
    __extends(SplitterLinesSection, _super);
    function SplitterLinesSection() {
        var _this = _super.call(this) || this;
        _this.name = L.CSections.Splitter.name;
        _this.interactable = false;
        _this.processingOrder = L.CSections.Splitter.processingOrder;
        _this.drawingOrder = L.CSections.Splitter.drawingOrder;
        _this.zIndex = L.CSections.Splitter.zIndex;
        _this.documentObject = true;
        return _this;
    }
    SplitterLinesSection.prototype.onInitialize = function () {
        var splittersDataDiv = document.createElement('div');
        splittersDataDiv.className = 'splitters-data';
        var canvasContainer = document.getElementById('canvas-container');
        if (canvasContainer)
            canvasContainer.appendChild(splittersDataDiv);
        this.size = [1000000, 1000000];
        this.position = [0, 0];
        this.sectionProperties = {
            fillColor: 'rgba(0, 0, 0, 0)',
            fillOpacity: 0,
            thickness: 0,
        };
        this.readCSSProperties();
    };
    SplitterLinesSection.prototype.readCSSProperties = function () {
        var splittersDataDiv = document.querySelector('.splitters-data');
        if (splittersDataDiv) {
            this.sectionProperties.fillColor =
                getComputedStyle(splittersDataDiv).getPropertyValue('color');
            this.sectionProperties.fillOpacity =
                getComputedStyle(splittersDataDiv).getPropertyValue('opacity');
            this.sectionProperties.thickness =
                parseFloat(getComputedStyle(splittersDataDiv)
                    .getPropertyValue('border-top-width')
                    .replace('px', '')) * app.dpiScale;
        }
    };
    SplitterLinesSection.prototype.setBoxGradient = function (splitPos, isVertical) {
        var selectionBackgroundGradient = null;
        // last row geometry data will be a good for setting deafult raw height
        var spanlist = app.map._docLayer.sheetGeometry.getRowsGeometry()._visibleSizes._spanlist;
        var rowData = spanlist[spanlist.length - 1];
        // Create a linear gradient based on the extracted color stops
        // get raw data from sheet geometry. use index = 1
        var deafultRowSize = rowData.data.sizecore;
        // gradient width should be half a default row hight.
        var gradientWidth = Math.ceil(deafultRowSize / 2);
        //adjust horizontal position for RTL mode
        splitPos.x = this.isCalcRTL() ? this.size[0] - splitPos.x : splitPos.x;
        // Create a linear gradient based on the extracted color stops
        selectionBackgroundGradient = this.createSplitLineGradient(splitPos, gradientWidth, isVertical);
        return { selectionBackgroundGradient: selectionBackgroundGradient, gradientWidth: gradientWidth };
    };
    SplitterLinesSection.prototype.createSplitLineGradient = function (splitPos, gradientWidth, isVertSplitter) {
        var linearGradient = null;
        var colorStops = [
            { colorCode: this.sectionProperties.fillColor, offset: 0 },
            { colorCode: 'rgba(240, 240, 240, 0)', offset: 1 },
        ];
        if (isVertSplitter) {
            linearGradient = this.context.createLinearGradient(0, splitPos.y, 0, splitPos.y + gradientWidth);
        }
        else {
            var x0 = splitPos.x;
            var x1 = splitPos.x + gradientWidth;
            if (this.isCalcRTL()) {
                x0 = splitPos.x - gradientWidth;
                x1 = splitPos.x;
            }
            linearGradient = this.context.createLinearGradient(x0, 0, x1, 0);
        }
        // Add color stops to the gradient
        for (var i = 0; i < colorStops.length; i++) {
            // set offset with colorcode & handle special case for horizontal line in RTL mode
            var offset = !isVertSplitter && this.isCalcRTL()
                ? colorStops[colorStops.length - i - 1].offset
                : colorStops[i].offset;
            linearGradient.addColorStop(offset, colorStops[i].colorCode);
        }
        return linearGradient;
    };
    SplitterLinesSection.prototype.GetColumnHeaderHeight = function () {
        if (this.containerObject.getSectionWithName(L.CSections.ColumnHeader.name)) {
            return this.containerObject.getSectionWithName(L.CSections.ColumnHeader.name).size[1];
        }
        else
            return 0;
    };
    SplitterLinesSection.prototype.GetRowHeaderWidth = function () {
        if (this.containerObject.getSectionWithName(L.CSections.RowHeader.name)) {
            return this.containerObject.getSectionWithName(L.CSections.RowHeader.name)
                .size[0];
        }
        else
            return 0;
    };
    SplitterLinesSection.prototype.onDraw = function () {
        var splitPanesContext = app.map._docLayer.getSplitPanesContext();
        if (splitPanesContext) {
            var splitPos = splitPanesContext.getSplitPos();
            if (splitPos.x || splitPos.y) {
                this.context.globalAlpha = this.sectionProperties.fillOpacity;
                this.context.lineWidth = this.sectionProperties.thickness;
                if (splitPos.x) {
                    var width = void 0, style = void 0;
                    if (this.documentTopLeft[0] === 0) {
                        width = this.sectionProperties.thickness;
                        style = this.sectionProperties.fillColor;
                    }
                    else {
                        var temp = this.setBoxGradient(splitPos.clone(), false);
                        width = temp.gradientWidth;
                        style = temp.selectionBackgroundGradient;
                    }
                    this.context.fillStyle = style;
                    this.context.fillRect(splitPos.x * app.dpiScale, -this.GetColumnHeaderHeight(), width, this.size[1]);
                }
                if (splitPos.y) {
                    var width = void 0, style = void 0;
                    if (this.documentTopLeft[1] === 0) {
                        width = this.sectionProperties.thickness;
                        style = this.sectionProperties.fillColor;
                    }
                    else {
                        var temp = this.setBoxGradient(splitPos.clone(), true);
                        width = temp.gradientWidth;
                        style = temp.selectionBackgroundGradient;
                    }
                    this.context.fillStyle = style;
                    this.context.fillRect(-this.GetRowHeaderWidth(), splitPos.y * app.dpiScale, this.size[0], width);
                }
            }
        }
        this.context.globalAlpha = 1;
    };
    return SplitterLinesSection;
}(CanvasSectionObject));
//# sourceMappingURL=SplitterLinesSection.js.map