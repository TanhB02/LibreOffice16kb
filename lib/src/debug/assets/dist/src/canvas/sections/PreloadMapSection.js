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
var PreloadMapSection = /** @class */ (function (_super) {
    __extends(PreloadMapSection, _super);
    function PreloadMapSection() {
        var _this = _super.call(this) || this;
        _this.name = L.CSections.Debug.PreloadMap.name;
        _this.interactable = false;
        _this.anchor = ['top', 'left'];
        _this.processingOrder = L.CSections.Debug.PreloadMap.processingOrder;
        _this.drawingOrder = L.CSections.Debug.PreloadMap.drawingOrder;
        _this.zIndex = L.CSections.Debug.PreloadMap.zIndex;
        _this.boundToSection = 'tiles';
        _this._map = L.Map.THIS;
        return _this;
    }
    PreloadMapSection.prototype.onDraw = function (frameCount, elapsedTime, subsetBounds) {
        var docLayer = this._map._docLayer;
        var ctx = docLayer._painter._paintContext();
        var zoom = Math.round(this._map.getZoom());
        var part = docLayer._selectedPart;
        var tileRanges = ctx.paneBoundsList.map(TileManager.pxBoundsToTileRange, TileManager);
        // Get the 'main' view
        var viewRange = tileRanges.length == 4 ? tileRanges[3] : tileRanges[0];
        var canvas = this.context;
        var tileRange = new L.Bounds(viewRange.min, viewRange.max);
        // stop annoying jitter as the view fits different numbers of tiles.
        var viewWidth = Math.floor((this._map.getPixelBoundsCore().getSize().x + TileManager.tileSize - 1) /
            TileManager.tileSize);
        var viewHeight = Math.floor((this._map.getPixelBoundsCore().getSize().y + TileManager.tileSize - 1) /
            TileManager.tileSize);
        // writer defaults
        var sizePix = 3;
        var numParts = 1;
        var enlargeX = 0.1;
        var enlargeY = 2;
        var mainYMultiply = 10.0;
        if (docLayer.isCalc()) {
            enlargeX = 2;
            enlargeY = 2;
            sizePix = 6;
            numParts = 3;
            mainYMultiply = 2;
        }
        else if (docLayer.isImpress()) {
            enlargeX = 0.5;
            enlargeY = 0.5;
            mainYMultiply = 0;
            sizePix = 6;
            numParts = 7;
        }
        // Enlarge in each dimension
        tileRange.min.x = tileRange.min.x - Math.floor(viewWidth * enlargeX);
        tileRange.max.x = tileRange.max.x + Math.floor(viewWidth * enlargeX);
        tileRange.min.y = tileRange.min.y - Math.floor(viewHeight * enlargeY);
        tileRange.max.y = tileRange.max.y + Math.floor(viewHeight * enlargeY);
        var preParts = (numParts - 1) / 2;
        var partBounds = new Array(numParts);
        for (var i = 0; i < partBounds.length; ++i) {
            partBounds[i] = new L.Bounds(tileRange.min, tileRange.max);
            partBounds[i].part = part + i - preParts;
        }
        // current view should be bigger vertically at least
        partBounds[preParts].min.y -= viewHeight * mainYMultiply;
        partBounds[preParts].max.y += viewHeight * mainYMultiply;
        var offx = 50;
        var offy = 200;
        var voffset = 0;
        for (var p = 0; p < partBounds.length; ++p) {
            var range = partBounds[p];
            for (var j = range.min.y; j <= range.max.y; ++j) {
                for (var i = range.min.x; i <= range.max.x; ++i) {
                    if (i >= 0 && j >= 0 && range.part >= 0) {
                        var coords = new TileCoordData(i * TileManager.tileSize, j * TileManager.tileSize, zoom, range.part, docLayer._selectedMode);
                        var key = coords.key();
                        var tile = TileManager.get(key);
                        if (!tile)
                            canvas.fillStyle = 'rgba(128, 128, 128, 0.5)'; // grey
                        // state of the tile
                        else if (!tile.hasContent())
                            canvas.fillStyle = 'rgba(255, 0, 0, 0.8)'; // red
                        else if (tile.needsFetch())
                            canvas.fillStyle = 'rgba(255, 255, 0, 0.8)'; // yellow
                        else if (!tile.image)
                            canvas.fillStyle = 'rgba(0, 96, 0, 0.8)'; // dark green
                        else if (tile.distanceFromView <= 0)
                            canvas.fillStyle = 'rgba(0, 255, 0, 0.5)'; // visible
                        else {
                            var expFactor = TileManager.getExpiryFactor(tile);
                            if (expFactor >= 0)
                                // expiry shown by more blue, and less green
                                canvas.fillStyle =
                                    'rgba(0, ' +
                                        Math.round(192 * (1.0 - expFactor)) +
                                        ', ' +
                                        Math.round(96 * expFactor) +
                                        ', 0.8)';
                        }
                    } // outside document range
                    else
                        canvas.fillStyle = 'rgba(0, 0, 0, 0.3)'; // dark grey
                    canvas.fillRect(offx + (i - range.min.x) * sizePix, offy + (j - range.min.y) * sizePix + voffset, sizePix, sizePix);
                }
            }
            // view rectangle
            if (range.part == part) {
                // viewport in tiles - not that accurate.
                canvas.strokeStyle = 'rgba(0, 0, 0, 0.5)';
                canvas.lineWidth = 1.0;
                canvas.strokeRect(offx + (viewRange.min.x - range.min.x) * sizePix, offy + (viewRange.min.y - range.min.y) * sizePix + voffset, viewWidth * sizePix, viewHeight * sizePix);
            }
            voffset += sizePix * (range.max.y - range.min.y + 4);
        }
    };
    return PreloadMapSection;
}(app.definitions.canvasSectionObject));
app.definitions.preloadMapSection = PreloadMapSection;
//# sourceMappingURL=PreloadMapSection.js.map