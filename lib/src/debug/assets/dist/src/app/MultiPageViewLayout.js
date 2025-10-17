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
var LayoutPageRectangle = /** @class */ (function (_super) {
    __extends(LayoutPageRectangle, _super);
    function LayoutPageRectangle() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // X and Y coordinates of the rectangle in multi page view.
        _this.layoutX = 0;
        _this.layoutY = 0;
        return _this;
    }
    return LayoutPageRectangle;
}(cool.SimpleRectangle));
var MultiPageViewLayout = /** @class */ (function () {
    function MultiPageViewLayout() {
    }
    MultiPageViewLayout.sendClientVisibleArea = function () {
        var visibleArea = this.getVisibleAreaRectangle();
        var visibleAreaCommand = 'clientvisiblearea x=' +
            visibleArea.x1 +
            ' y=' +
            visibleArea.y1 +
            ' width=' +
            visibleArea.width +
            ' height=' +
            visibleArea.height;
        +' splitx=' + Math.round(0) + ' splity=' + Math.round(0);
        app.socket.sendMessage(visibleAreaCommand);
        return new L.Bounds(new L.Point(visibleArea.pX1, visibleArea.pY1), new L.Point(visibleArea.pX2, visibleArea.pY2));
    };
    MultiPageViewLayout.resetViewLayout = function () {
        this.layoutRectangles.length = 0;
        var canvasSize = app.sectionContainer.getViewSize();
        // Copy the page rectangle array.
        for (var i = 0; i < app.file.writer.pageRectangleList.length; i++) {
            var temp = app.file.writer.pageRectangleList[i];
            this.layoutRectangles.push(new LayoutPageRectangle(temp[0], temp[1], temp[2], temp[3]));
            var currentPageRectangle = this.layoutRectangles[i];
            currentPageRectangle.part = i;
        }
        var lastY = this.gapBetweenPages;
        app.view.size.pX = canvasSize[0];
        for (var i = 0; i < this.layoutRectangles.length; i++) {
            var x = 0;
            var j = i;
            var totalWidth = 0;
            var go = true;
            while (go &&
                j - i < this.maxRowsSize &&
                j < this.layoutRectangles.length) {
                var addition = this.layoutRectangles[j].pWidth + this.gapBetweenPages;
                if (x + addition < canvasSize[0] || j === i) {
                    if (x + addition > canvasSize[0]) {
                        go = false;
                    }
                    x += addition;
                    totalWidth += this.layoutRectangles[j].pWidth;
                    j++;
                }
                else
                    go = false;
            }
            if (x < canvasSize[0]) {
                var rowItemCount = j - i;
                var gap = (rowItemCount - 1) * this.gapBetweenPages;
                var margin = (canvasSize[0] - totalWidth + gap) * 0.5;
                var currentX = margin + app.file.viewedRectangle.pX1;
                var maxY = 0;
                for (var k = i; k < j; k++) {
                    this.layoutRectangles[k].layoutX = currentX;
                    this.layoutRectangles[k].layoutY = lastY;
                    currentX += this.layoutRectangles[k].pWidth + this.gapBetweenPages;
                    maxY = Math.max(maxY, this.layoutRectangles[k].pHeight);
                }
                lastY += maxY + this.gapBetweenPages;
            }
            else {
                if (x > app.view.size.pX)
                    app.view.size.pX = x + this.gapBetweenPages * 2;
                this.layoutRectangles[i].layoutX = this.gapBetweenPages;
                this.layoutRectangles[i].layoutY = lastY;
                lastY += this.layoutRectangles[i].pHeight + this.gapBetweenPages;
            }
            i = j - 1;
        }
        app.view.size.pY = Math.max(lastY, canvasSize[1]);
    };
    MultiPageViewLayout.getVisibleAreaRectangle = function () {
        var viewedRectangle = app.file.viewedRectangle.clone();
        viewedRectangle.pWidth = app.view.size.pX;
        viewedRectangle.pHeight = app.view.size.pY;
        var resultingRectangle = new cool.SimpleRectangle(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
        for (var i = 0; i < this.layoutRectangles.length; i++) {
            var rectangle = this.layoutRectangles[i];
            var controlRectangle = [
                rectangle.layoutX,
                rectangle.layoutY,
                rectangle.pWidth,
                rectangle.pHeight,
            ];
            var intersection = LOUtil._getIntersectionRectangle(viewedRectangle.pToArray(), controlRectangle);
            if (intersection) {
                if (resultingRectangle.pX1 > rectangle.pX1)
                    resultingRectangle.pX1 = rectangle.pX1;
                if (resultingRectangle.pY1 > rectangle.pY1)
                    resultingRectangle.pY1 = rectangle.pY1;
                if (resultingRectangle.pX2 < rectangle.pX2)
                    resultingRectangle.pX2 = rectangle.pX2;
                if (resultingRectangle.pY2 < rectangle.pY2)
                    resultingRectangle.pY2 = rectangle.pY2;
            }
        }
        resultingRectangle.pX1 -= TileManager.tileSize;
        resultingRectangle.pY1 -= TileManager.tileSize;
        resultingRectangle.pWidth += TileManager.tileSize * 2;
        resultingRectangle.pHeight += TileManager.tileSize * 2;
        return resultingRectangle;
    };
    MultiPageViewLayout.reset = function () {
        if (!app.file.writer.multiPageView ||
            !app.file.writer.pageRectangleList.length)
            return;
        this.resetViewLayout();
        app.map._docLayer._sendClientZoom();
        var bounds = this.sendClientVisibleArea();
        TileManager.updateLayoutView(bounds);
    };
    MultiPageViewLayout.gapBetweenPages = 20; // Core pixels.
    MultiPageViewLayout.availableWidth = 0;
    MultiPageViewLayout.maxRowsSize = 2;
    MultiPageViewLayout.layoutRectangles = Array();
    return MultiPageViewLayout;
}());
//# sourceMappingURL=MultiPageViewLayout.js.map