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
/*
    This class is for custom handlers of shapes.
*/
var ShapeHandleCustomSubSection = /** @class */ (function (_super) {
    __extends(ShapeHandleCustomSubSection, _super);
    function ShapeHandleCustomSubSection(parentHandlerSection, sectionName, size, documentPosition, ownInfo) {
        var _this = _super.call(this) || this;
        _this.processingOrder = L.CSections.DefaultForDocumentObjects.processingOrder;
        _this.drawingOrder = L.CSections.DefaultForDocumentObjects.drawingOrder + 1; // Handle events before the parent section.
        _this.zIndex = L.CSections.DefaultForDocumentObjects.zIndex;
        _this.documentObject = true;
        _this.size = size;
        _this.name = sectionName;
        _this.sectionProperties.position = documentPosition.clone();
        _this.sectionProperties.parentHandlerSection = parentHandlerSection;
        _this.sectionProperties.ownInfo = ownInfo;
        _this.sectionProperties.previousCursorStyle = null;
        _this.sectionProperties.mousePointerType = 'grab';
        _this.sectionProperties.mapPane = (document.querySelectorAll('.leaflet-map-pane')[0]);
        return _this;
    }
    ShapeHandleCustomSubSection.prototype.onDraw = function (frameCount, elapsedTime) {
        this.context.fillStyle = 'yellow';
        this.context.strokeStyle = 'black';
        this.context.beginPath();
        this.context.arc(this.size[0] * 0.5, this.size[1] * 0.5, this.size[0] * 0.5, 0, Math.PI * 2);
        this.context.closePath();
        this.context.fill();
        this.context.stroke();
    };
    ShapeHandleCustomSubSection.prototype.onInitialize = function () {
        this.setPosition(this.sectionProperties.position.pX, this.sectionProperties.position.pY);
    };
    ShapeHandleCustomSubSection.prototype.onMouseEnter = function (point, e) {
        app.map.dontHandleMouse = true;
        this.sectionProperties.previousCursorStyle = this.sectionProperties.mapPane.style.cursor;
        this.sectionProperties.mapPane.style.cursor = this.sectionProperties.mousePointerType;
        this.stopPropagating();
        e.stopPropagation();
        this.containerObject.requestReDraw();
    };
    ShapeHandleCustomSubSection.prototype.onMouseLeave = function (point, e) {
        app.map.dontHandleMouse = false;
        this.sectionProperties.mapPane.style.cursor = this.sectionProperties.previousCursorStyle;
        this.stopPropagating();
        e.stopPropagation();
        this.containerObject.requestReDraw();
    };
    ShapeHandleCustomSubSection.prototype.onMouseDown = function (point, e) {
        window.IgnorePanning = true;
    };
    ShapeHandleCustomSubSection.prototype.onMouseUp = function (point, e) {
        if (this.containerObject.isDraggingSomething()) {
            var parameters = {
                HandleNum: { type: 'long', value: this.sectionProperties.ownInfo.id },
                NewPosX: { type: 'long', value: Math.round((point[0] + this.position[0]) * app.pixelsToTwips) },
                NewPosY: { type: 'long', value: Math.round((point[1] + this.position[1]) * app.pixelsToTwips) }
            };
            app.map.sendUnoCommand('.uno:MoveShapeHandle', parameters);
            this.stopPropagating();
            e.stopPropagation();
        }
        window.IgnorePanning = false;
    };
    ShapeHandleCustomSubSection.prototype.onMouseMove = function (point, dragDistance, e) {
        if (this.containerObject.isDraggingSomething()) {
            this.stopPropagating();
            e.stopPropagation();
        }
    };
    return ShapeHandleCustomSubSection;
}(CanvasSectionObject));
app.definitions.shapeHandleCustomSubSection = ShapeHandleCustomSubSection;
//# sourceMappingURL=ShapeHandleCustomSubSection.js.map