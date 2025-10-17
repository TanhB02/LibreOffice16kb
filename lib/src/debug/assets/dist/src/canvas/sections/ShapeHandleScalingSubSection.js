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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
/*
    This class is for the sub sections (handles) of ShapeHandlesSection.
    Shape is rendered on the core side. Only the handles are drawn here and modification commands are sent to the core side.
*/
var ShapeHandleScalingSubSection = /** @class */ (function (_super) {
    __extends(ShapeHandleScalingSubSection, _super);
    function ShapeHandleScalingSubSection(parentHandlerSection, sectionName, size, documentPosition, ownInfo, cropModeEnabled) {
        var _this = _super.call(this) || this;
        _this.processingOrder = L.CSections.DefaultForDocumentObjects.processingOrder;
        _this.drawingOrder = L.CSections.DefaultForDocumentObjects.drawingOrder + 1; // Handle events before the parent section.
        _this.zIndex = L.CSections.DefaultForDocumentObjects.zIndex;
        _this.documentObject = true;
        _this.size = size;
        _this.sectionProperties.position = documentPosition.clone();
        _this.name = sectionName;
        _this.sectionProperties.parentHandlerSection = parentHandlerSection;
        _this.sectionProperties.ownInfo = ownInfo;
        _this.sectionProperties.mousePointerType = null;
        _this.sectionProperties.previousCursorStyle = null;
        _this.sectionProperties.initialAngle = null; // Initial angle of the point (handle) to the center in radians.
        _this.sectionProperties.distanceToCenter = null; // Distance to center.
        _this.sectionProperties.mapPane = (document.querySelectorAll('.leaflet-map-pane')[0]);
        _this.sectionProperties.cropModeEnabled = cropModeEnabled;
        _this.sectionProperties.cropCursor = 'url(' + app.LOUtil.getURL("images/cursors/crop.png") + ') 8 8, auto';
        _this.setMousePointerType();
        app.events.on('TextCursorVisibility', _this.onTextCursorVisibility.bind(_this));
        return _this;
    }
    ShapeHandleScalingSubSection.prototype.onInitialize = function () {
        this.setPosition(this.sectionProperties.position.pX, this.sectionProperties.position.pY);
    };
    ShapeHandleScalingSubSection.prototype.onTextCursorVisibility = function (event) {
        if (event.detail.visible) {
            this.setShowSection(false);
            this.interactable = false;
        }
        else {
            this.setShowSection(true);
            this.interactable = true;
        }
    };
    ShapeHandleScalingSubSection.prototype.onDraw = function (frameCount, elapsedTime) {
        this.context.fillStyle = 'wheat';
        this.context.strokeStyle = 'black';
        this.context.beginPath();
        if (this.sectionProperties.cropModeEnabled)
            this.drawCropHandles();
        else
            this.context.arc(this.size[0] * 0.5, this.size[1] * 0.5, this.size[0] * 0.5, 0, Math.PI * 2);
        this.context.closePath();
        this.context.fill();
        this.context.stroke();
    };
    ShapeHandleScalingSubSection.prototype.drawCropCornerHandle = function () {
        var markerWidth = this.size[0];
        var halfMarkerWidth = markerWidth * 0.5;
        var shapeAngle = this.sectionProperties.parentHandlerSection.sectionProperties.shapeRectangleProperties.angleRadian;
        var x = halfMarkerWidth, y = halfMarkerWidth;
        this.context.translate(x, y);
        this.context.rotate(shapeAngle * -1);
        this.context.translate(-x, -y);
        this.context.moveTo(x, y);
        x += markerWidth;
        this.context.lineTo(x, y);
        y += halfMarkerWidth;
        this.context.lineTo(x, y);
        x -= halfMarkerWidth;
        this.context.lineTo(x, y);
        y += halfMarkerWidth;
        this.context.lineTo(x, y);
        x -= halfMarkerWidth;
        this.context.lineTo(x, y);
    };
    ShapeHandleScalingSubSection.prototype.drawCropSideHandle = function () {
        var markerWidth = this.size[0];
        var halfMarkerWidth = markerWidth * 0.5;
        var shapeAngle = this.sectionProperties.parentHandlerSection.sectionProperties.shapeRectangleProperties.angleRadian;
        var x = halfMarkerWidth, y = halfMarkerWidth;
        this.context.translate(x, y);
        this.context.rotate(shapeAngle * -1);
        this.context.translate(-x, -y);
        this.context.moveTo(x, y);
        x += markerWidth;
        this.context.lineTo(x, y);
        y += halfMarkerWidth;
        this.context.lineTo(x, y);
        x -= markerWidth;
        this.context.lineTo(x, y);
    };
    ShapeHandleScalingSubSection.prototype.drawCropHandles = function () {
        var markerWidth = this.size[0];
        this.context.save();
        switch (this.sectionProperties.ownInfo.kind) {
            case '1':
                this.drawCropCornerHandle();
                break;
            case '2':
                this.drawCropSideHandle();
                break;
            case '3':
                this.context.rotate(Math.PI / 2);
                this.context.translate(0, -markerWidth);
                this.drawCropCornerHandle();
                break;
            case '4':
                this.context.rotate(-Math.PI / 2);
                this.context.translate(-markerWidth, 0);
                this.drawCropSideHandle();
                break;
            case '5':
                this.context.rotate(Math.PI / 2);
                this.context.translate(0, -markerWidth);
                this.drawCropSideHandle();
                break;
            case '6':
                this.context.rotate(-Math.PI / 2);
                this.context.translate(-markerWidth, 0);
                this.drawCropCornerHandle();
                break;
            case '7':
                this.context.rotate(Math.PI);
                this.context.translate(-markerWidth, -markerWidth);
                this.drawCropSideHandle();
                break;
            case '8':
                this.context.rotate(Math.PI);
                this.context.translate(-markerWidth, -markerWidth);
                this.drawCropCornerHandle();
                break;
        }
        this.context.restore();
    };
    ShapeHandleScalingSubSection.prototype.setMousePointerType = function () {
        if (this.sectionProperties.ownInfo.kind === '1')
            this.sectionProperties.mousePointerType = 'nwse-resize';
        else if (this.sectionProperties.ownInfo.kind === '2')
            this.sectionProperties.mousePointerType = 'ns-resize';
        else if (this.sectionProperties.ownInfo.kind === '3')
            this.sectionProperties.mousePointerType = 'nesw-resize';
        else if (this.sectionProperties.ownInfo.kind === '4')
            this.sectionProperties.mousePointerType = 'ew-resize';
        else if (this.sectionProperties.ownInfo.kind === '5')
            this.sectionProperties.mousePointerType = 'ew-resize';
        else if (this.sectionProperties.ownInfo.kind === '6')
            this.sectionProperties.mousePointerType = 'nesw-resize';
        else if (this.sectionProperties.ownInfo.kind === '7')
            this.sectionProperties.mousePointerType = 'ns-resize';
        else if (this.sectionProperties.ownInfo.kind === '8')
            this.sectionProperties.mousePointerType = 'nwse-resize';
    };
    ShapeHandleScalingSubSection.prototype.onMouseEnter = function (point, e) {
        app.map.dontHandleMouse = true;
        e.stopPropagation();
        this.stopPropagating();
        this.sectionProperties.previousCursorStyle = this.sectionProperties.mapPane.style.cursor;
        if (this.sectionProperties.cropModeEnabled)
            this.sectionProperties.mapPane.style.cursor = this.sectionProperties.cropCursor;
        else
            this.sectionProperties.mapPane.style.cursor = this.sectionProperties.mousePointerType;
        this.containerObject.requestReDraw();
    };
    ShapeHandleScalingSubSection.prototype.onMouseLeave = function (point, e) {
        app.map.dontHandleMouse = false;
        e.stopPropagation();
        this.stopPropagating();
        this.sectionProperties.mapPane.style.cursor = this.sectionProperties.previousCursorStyle;
        this.containerObject.requestReDraw();
    };
    ShapeHandleScalingSubSection.prototype.overrideHandle = function (kind) {
        var handle = {
            id: this.sectionProperties.ownInfo.id,
            x: this.position[0],
            y: this.position[1],
        };
        var subSections = this.sectionProperties.parentHandlerSection.sectionProperties.subSections;
        if (kind === '5') {
            handle.id = '7';
            handle.y = subSections['7'].position[1];
        }
        else if (kind === '4') {
            handle.id = '5';
            handle.y = subSections['5'].position[1];
        }
        else if (kind === '2') {
            handle.id = '2';
            handle.x = subSections['2'].position[0];
        }
        else if (kind === '7') {
            handle.id = '7';
            handle.x = subSections['7'].position[0];
        }
        return [handle.id, handle.x, handle.y];
    };
    ShapeHandleScalingSubSection.prototype.onMouseUp = function (point, e) {
        var _a;
        var _b, _c;
        if (this.containerObject.isDraggingSomething()) {
            this.stopPropagating();
            e.stopPropagation();
            var keepRatio = e.ctrlKey && e.shiftKey;
            var handleId = this.sectionProperties.ownInfo.id;
            var parentHandlerSection = this.sectionProperties.parentHandlerSection;
            var x = (_b = parentHandlerSection.sectionProperties.closestX) !== null && _b !== void 0 ? _b : point[0] + this.position[0];
            var y = (_c = parentHandlerSection.sectionProperties.closestY) !== null && _c !== void 0 ? _c : point[1] + this.position[1];
            if (keepRatio) {
                _a = __read(this.overrideHandle(this.sectionProperties.ownInfo.kind), 3), handleId = _a[0], x = _a[1], y = _a[2];
            }
            var parameters = {
                HandleNum: { type: 'long', value: handleId },
                NewPosX: { type: 'long', value: Math.round(x * app.pixelsToTwips) },
                NewPosY: { type: 'long', value: Math.round(y * app.pixelsToTwips) }
            };
            app.map.sendUnoCommand('.uno:MoveShapeHandle', parameters);
            parentHandlerSection.hideSVG();
        }
        window.IgnorePanning = false;
    };
    ShapeHandleScalingSubSection.prototype.adjustSVGProperties = function (shapeRecProps) {
        if (this.sectionProperties.parentHandlerSection.sectionProperties.svg) {
            var svg = this.sectionProperties.parentHandlerSection.sectionProperties.svg;
            var scaleX = shapeRecProps.width / this.sectionProperties.parentHandlerSection.sectionProperties.shapeRectangleProperties.width;
            var scaleY = shapeRecProps.height / this.sectionProperties.parentHandlerSection.sectionProperties.shapeRectangleProperties.height;
            var diffX = shapeRecProps.center[0] - this.sectionProperties.parentHandlerSection.sectionProperties.shapeRectangleProperties.center[0];
            var diffY = shapeRecProps.center[1] - this.sectionProperties.parentHandlerSection.sectionProperties.shapeRectangleProperties.center[1];
            diffX = diffX / app.dpiScale;
            diffY = diffY / app.dpiScale;
            svg.children[0].style.transform = 'translate(' + Math.round(diffX) + 'px, ' + Math.round(diffY) + 'px)' + 'rotate(' + -shapeRecProps.angleRadian + 'rad) scale(' + scaleX + ', ' + scaleY + ') rotate(' + shapeRecProps.angleRadian + 'rad)';
            this.sectionProperties.parentHandlerSection.showSVG();
        }
    };
    ShapeHandleScalingSubSection.prototype.calculateRatioPoint = function (point, shapeRecProps) {
        var isVerticalHandler = ['2', '7'].includes(this.sectionProperties.ownInfo.kind);
        var primaryDelta = isVerticalHandler
            ? point[1] - shapeRecProps.center[1]
            : point[0] - shapeRecProps.center[0];
        var aspectRatio = isVerticalHandler
            ? shapeRecProps.width / shapeRecProps.height
            : shapeRecProps.height / shapeRecProps.width;
        var secondaryDelta = primaryDelta * aspectRatio;
        var direction = ['3', '4', '6', '2'].includes(this.sectionProperties.ownInfo.kind) ? -1 : 1;
        if (isVerticalHandler) {
            point[0] = shapeRecProps.center[0] + secondaryDelta * direction;
        }
        else {
            point[1] = shapeRecProps.center[1] + secondaryDelta * direction;
        }
        return point;
    };
    ShapeHandleScalingSubSection.prototype.calculateNewShapeRectangleProperties = function (point, e) {
        var shapeRecProps = JSON.parse(JSON.stringify(this.sectionProperties.parentHandlerSection.sectionProperties.shapeRectangleProperties));
        var keepRatio = e.ctrlKey && e.shiftKey;
        if (keepRatio) {
            point = this.calculateRatioPoint(point, shapeRecProps);
        }
        var diff = [point[0] - shapeRecProps.center[0], -(point[1] - shapeRecProps.center[1])];
        var length = Math.pow(Math.pow(diff[0], 2) + Math.pow(diff[1], 2), 0.5);
        var pointAngle = Math.atan2(diff[1], diff[0]);
        point[0] = shapeRecProps.center[0] + length * Math.cos(pointAngle - shapeRecProps.angleRadian);
        point[1] = shapeRecProps.center[1] - length * Math.sin(pointAngle - shapeRecProps.angleRadian);
        var rectangle = new cool.SimpleRectangle((shapeRecProps.center[0] - shapeRecProps.width * 0.5) * app.pixelsToTwips, (shapeRecProps.center[1] - shapeRecProps.height * 0.5) * app.pixelsToTwips, shapeRecProps.width * app.pixelsToTwips, shapeRecProps.height * app.pixelsToTwips);
        var oldpCenter = rectangle.pCenter;
        if (['1', '4', '6'].includes(this.sectionProperties.ownInfo.kind)) {
            var pX2 = rectangle.pX2;
            rectangle.pX1 = point[0];
            rectangle.pX2 = pX2;
        }
        else if (['3', '5', '8'].includes(this.sectionProperties.ownInfo.kind))
            rectangle.pX2 = point[0];
        if (['1', '2', '3'].includes(this.sectionProperties.ownInfo.kind)) {
            var pY2 = rectangle.pY2;
            rectangle.pY1 = point[1];
            rectangle.pY2 = pY2;
        }
        else if (['6', '7', '8'].includes(this.sectionProperties.ownInfo.kind))
            rectangle.pY2 = point[1];
        if (keepRatio) {
            if (['4', '5'].includes(this.sectionProperties.ownInfo.kind)) {
                rectangle.pY2 = point[1];
            }
            else if (['2', '7'].includes(this.sectionProperties.ownInfo.kind)) {
                rectangle.pX2 = point[0];
            }
        }
        var centerAngle = Math.atan2(oldpCenter[1] - rectangle.pCenter[1], rectangle.pCenter[0] - oldpCenter[0]);
        var centerLength = Math.pow(Math.pow(rectangle.pCenter[1] - oldpCenter[1], 2) + Math.pow(rectangle.pCenter[0] - oldpCenter[0], 2), 0.5);
        var x = centerLength * Math.cos(shapeRecProps.angleRadian + centerAngle);
        var y = centerLength * Math.sin(shapeRecProps.angleRadian + centerAngle);
        shapeRecProps.center[0] += x;
        shapeRecProps.center[1] -= y;
        shapeRecProps.width = rectangle.pWidth;
        shapeRecProps.height = rectangle.pHeight;
        return shapeRecProps;
    };
    // While dragging a handle, we want to simulate handles to their final positions.
    ShapeHandleScalingSubSection.prototype.moveHandlesOnDrag = function (point, e) {
        var shapeRecProps = this.calculateNewShapeRectangleProperties([
            point[0] + this.myTopLeft[0] + this.documentTopLeft[0] - this.containerObject.getDocumentAnchor()[0],
            point[1] + this.myTopLeft[1] + this.documentTopLeft[1] - this.containerObject.getDocumentAnchor()[1]
        ], e);
        this.sectionProperties.parentHandlerSection.calculateInitialAnglesOfShapeHandlers(shapeRecProps);
        var halfWidth = this.sectionProperties.parentHandlerSection.sectionProperties.handleWidth * 0.5;
        var halfHeight = this.sectionProperties.parentHandlerSection.sectionProperties.handleHeight * 0.5;
        var subSections = this.sectionProperties.parentHandlerSection.sectionProperties.subSections;
        var x = 0, y = 0;
        var pointAngle = 0;
        for (var i = 0; i < subSections.length; i++) {
            var subSection = subSections[i];
            pointAngle = subSection.sectionProperties.initialAngle + shapeRecProps.angleRadian;
            x = shapeRecProps.center[0] + subSection.sectionProperties.distanceToCenter * Math.cos(pointAngle);
            y = shapeRecProps.center[1] - subSection.sectionProperties.distanceToCenter * Math.sin(pointAngle);
            subSection.setPosition(x - halfWidth, y - halfHeight);
        }
        if (!this.sectionProperties.cropModeEnabled)
            this.adjustSVGProperties(shapeRecProps);
    };
    ShapeHandleScalingSubSection.prototype.onMouseMove = function (point, dragDistance, e) {
        if (this.containerObject.isDraggingSomething()) {
            window.IgnorePanning = true;
            this.stopPropagating();
            e.stopPropagation();
            this.sectionProperties.parentHandlerSection.sectionProperties.svg.style.opacity = 0.5;
            this.moveHandlesOnDrag(point, e);
            // Here we are checking a point, so the size 0. dragDistance is also 0 because we already set the new position (moveHandlesOnDrag).
            this.sectionProperties.parentHandlerSection.checkHelperLinesAndSnapPoints([0, 0], this.position, [0, 0]);
            this.containerObject.requestReDraw();
            this.sectionProperties.parentHandlerSection.showSVG();
        }
        else
            window.IgnorePanning = false;
    };
    return ShapeHandleScalingSubSection;
}(CanvasSectionObject));
app.definitions.shapeHandleScalingSubSection = ShapeHandleScalingSubSection;
//# sourceMappingURL=ShapeHandleScalingSubSection.js.map