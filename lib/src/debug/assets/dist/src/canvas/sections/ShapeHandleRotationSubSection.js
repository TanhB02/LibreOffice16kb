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
var ShapeHandleRotationSubSection = /** @class */ (function (_super) {
    __extends(ShapeHandleRotationSubSection, _super);
    function ShapeHandleRotationSubSection(parentHandlerSection, sectionName, size, documentPosition, ownInfo) {
        var _this = _super.call(this) || this;
        _this.processingOrder = L.CSections.DefaultForDocumentObjects.processingOrder;
        _this.drawingOrder = L.CSections.DefaultForDocumentObjects.drawingOrder + 1; // Handle events before the parent section.
        _this.zIndex = L.CSections.DefaultForDocumentObjects.zIndex;
        _this.documentObject = true;
        _this.name = sectionName;
        _this.size = size;
        _this.sectionProperties.position = documentPosition.clone();
        _this.sectionProperties.parentHandlerSection = parentHandlerSection;
        _this.sectionProperties.ownInfo = ownInfo;
        _this.sectionProperties.mouseIsInside = false;
        _this.sectionProperties.previousCursorStyle = null;
        _this.sectionProperties.lastDraggingDistance = null;
        _this.sectionProperties.mapPane = (document.querySelectorAll('.leaflet-map-pane')[0]);
        _this.sectionProperties.previousCursorStyle = null;
        _this.sectionProperties.cursorStyle = 'pointer';
        app.events.on('TextCursorVisibility', _this.onTextCursorVisibility.bind(_this));
        return _this;
    }
    ShapeHandleRotationSubSection.prototype.onTextCursorVisibility = function (event) {
        if (event.detail.visible) {
            this.setShowSection(false);
            this.interactable = false;
        }
        else {
            this.setShowSection(true);
            this.interactable = true;
        }
    };
    ShapeHandleRotationSubSection.prototype.calculateAngle = function (center, target) {
        var angle = Math.atan2(target.y - center.y, target.x - center.x);
        while (angle < 0)
            angle += 2 * Math.PI;
        while (angle > Math.PI * 2)
            angle -= Math.PI * 2;
        angle = (angle * 180) / Math.PI;
        angle *= 100; // Core side multiplies degrees with 100.
        return angle;
    };
    ShapeHandleRotationSubSection.prototype.onInitialize = function () {
        this.setPosition(this.sectionProperties.position.pX, this.sectionProperties.position.pY);
    };
    ShapeHandleRotationSubSection.prototype.onMouseEnter = function (point, e) {
        app.map.dontHandleMouse = true;
        this.sectionProperties.previousCursorStyle = this.sectionProperties.mapPane.style.cursor;
        this.sectionProperties.mapPane.style.cursor = this.sectionProperties.cursorStyle;
    };
    ShapeHandleRotationSubSection.prototype.onMouseLeave = function (point, e) {
        app.map.dontHandleMouse = false;
        this.sectionProperties.mapPane.style.cursor = this.sectionProperties.previousCursorStyle;
    };
    ShapeHandleRotationSubSection.prototype.onDraw = function (frameCount, elapsedTime) {
        this.context.fillStyle = 'white';
        this.context.strokeStyle = 'black';
        this.context.beginPath();
        this.context.arc(this.size[0] * 0.5, this.size[1] * 0.5, this.size[0] * 0.5, 0, Math.PI * 2);
        this.context.closePath();
        this.context.fill();
        this.context.stroke();
    };
    // This is called after dragging the rotation handler. It re-calculates initial angle with the handler's new position.
    ShapeHandleRotationSubSection.prototype.getAngleDifference = function () {
        var dragDistanceInTwips = [this.sectionProperties.lastDraggingDistance[0] * app.pixelsToTwips, this.sectionProperties.lastDraggingDistance[1] * app.pixelsToTwips];
        var draggedToPoint = new app.definitions.simplePoint(dragDistanceInTwips[0], dragDistanceInTwips[1]);
        draggedToPoint.pX += this.position[0];
        draggedToPoint.pY += this.position[1];
        var selectionCenter = new app.definitions.simplePoint(GraphicSelection.rectangle.center[0], GraphicSelection.rectangle.center[1]);
        var initialPoint = this.sectionProperties.ownInfo.initialPosition;
        var initialAngle = this.calculateAngle(selectionCenter, initialPoint);
        var newAngle = this.calculateAngle(selectionCenter, draggedToPoint);
        return initialAngle - newAngle;
    };
    ShapeHandleRotationSubSection.prototype.onMouseDown = function (point, e) {
        window.IgnorePanning = true;
    };
    ShapeHandleRotationSubSection.prototype.onMouseUp = function (point, e) {
        if (this.containerObject.isDraggingSomething()) {
            if (this.sectionProperties.lastDraggingDistance) {
                var center = GraphicSelection.rectangle.center;
                var commandParameters = {
                    'TransformRotationDeltaAngle': {
                        'type': 'long',
                        'value': this.getAngleDifference()
                    },
                    'TransformRotationX': {
                        'type': 'long',
                        'value': center[0]
                    },
                    'TransformRotationY': {
                        'type': 'long',
                        'value': center[1]
                    }
                };
                app.map.sendUnoCommand('.uno:TransformDialog ', commandParameters);
            }
            this.sectionProperties.parentHandlerSection.hideSVG();
        }
        window.IgnorePanning = false;
    };
    ShapeHandleRotationSubSection.prototype.onMouseMove = function (position, distance) {
        if (this.containerObject.isDraggingSomething()) {
            this.sectionProperties.lastDraggingDistance = distance;
            if (this.containerObject.isDraggingSomething() && this.sectionProperties.parentHandlerSection.sectionProperties.svg) {
                this.sectionProperties.parentHandlerSection.sectionProperties.svg.style.opacity = 0.5;
                var angleDifference = -this.getAngleDifference() / 100;
                this.sectionProperties.parentHandlerSection.sectionProperties.svg.style.transform = 'rotate(' + angleDifference + 'deg)';
                this.containerObject.requestReDraw();
                this.sectionProperties.parentHandlerSection.showSVG();
            }
        }
    };
    return ShapeHandleRotationSubSection;
}(CanvasSectionObject));
app.definitions.shapeHandleRotationSubSection = ShapeHandleRotationSubSection;
//# sourceMappingURL=ShapeHandleRotationSubSection.js.map