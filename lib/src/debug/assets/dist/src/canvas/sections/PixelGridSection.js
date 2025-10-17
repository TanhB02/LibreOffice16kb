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
var PixelGridSection = /** @class */ (function (_super) {
    __extends(PixelGridSection, _super);
    function PixelGridSection() {
        var _this = _super.call(this) || this;
        _this.name = L.CSections.Debug.TilePixelGrid.name;
        _this.interactable = false;
        _this.anchor = ['top', 'left'];
        _this.processingOrder = L.CSections.Debug.TilePixelGrid.processingOrder;
        _this.drawingOrder = L.CSections.Debug.TilePixelGrid.drawingOrder;
        _this.zIndex = L.CSections.Debug.TilePixelGrid.zIndex;
        _this.boundToSection = 'tiles';
        return _this;
    }
    PixelGridSection.prototype.onDraw = function (frameCount, elapsedTime) {
        var offset = 8;
        var count;
        this.context.lineWidth = 1;
        var currentPos;
        this.context.strokeStyle = '#ff0000';
        currentPos = 0;
        count = Math.round(this.context.canvas.height / offset);
        for (var i = 0; i < count; i++) {
            this.context.beginPath();
            this.context.moveTo(0.5, currentPos + 0.5);
            this.context.lineTo(this.context.canvas.width + 0.5, currentPos + 0.5);
            this.context.stroke();
            currentPos += offset;
        }
        currentPos = 0;
        count = Math.round(this.context.canvas.width / offset);
        for (var i = 0; i < count; i++) {
            this.context.beginPath();
            this.context.moveTo(currentPos + 0.5, 0.5);
            this.context.lineTo(currentPos + 0.5, this.context.canvas.height + 0.5);
            this.context.stroke();
            currentPos += offset;
        }
    };
    return PixelGridSection;
}(app.definitions.canvasSectionObject));
app.definitions.pixelGridSection = PixelGridSection;
//# sourceMappingURL=PixelGridSection.js.map