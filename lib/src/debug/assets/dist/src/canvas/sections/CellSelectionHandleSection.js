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
var CellSelectionHandle = /** @class */ (function (_super) {
    __extends(CellSelectionHandle, _super);
    function CellSelectionHandle(name) {
        var _this = _super.call(this) || this;
        _this.showSection = false;
        _this.processingOrder = L.CSections.DefaultForDocumentObjects.processingOrder;
        _this.drawingOrder = L.CSections.DefaultForDocumentObjects.drawingOrder;
        _this.zIndex = L.CSections.DefaultForDocumentObjects.zIndex;
        _this.documentObject = true;
        _this.sectionProperties.circleRadius = 10 * app.dpiScale;
        _this.size = [_this.sectionProperties.circleRadius * 2, _this.sectionProperties.circleRadius * 2];
        _this.name = name; // There will be multiple instances of this class. For the viewer's cursor, name will be owncellcursor. Others will have viewId-cellcursor.
        return _this;
    }
    CellSelectionHandle.prototype.onDragEnd = function (point) {
        app.map.focus();
        app.map.fire('scrollvelocity', { vx: 0, vy: 0 });
        var newPoint = new cool.SimplePoint(0, 0);
        newPoint.pX = this.position[0] + point[0];
        newPoint.pY = this.position[1] + point[1];
        this.sharedOnDragAndEnd(newPoint);
        app.map._docLayer._onUpdateCellResizeMarkers();
        app.map.scrollingIsHandled = false;
    };
    CellSelectionHandle.prototype.sharedOnDragAndEnd = function (point) {
        var type = this.name === 'cell_selection_handle_start' ? 'start' : 'end';
        app.map._docLayer._postSelectTextEvent(type, point.x, point.y);
    };
    CellSelectionHandle.prototype.onDrag = function (point) {
        var newPoint = new cool.SimplePoint(0, 0);
        newPoint.pX = this.position[0] + point[0];
        newPoint.pY = this.position[1] + point[1];
        app.map.fire('handleautoscroll', { pos: { x: newPoint.cX, y: newPoint.cY }, map: app.map });
        this.sharedOnDragAndEnd(newPoint);
    };
    CellSelectionHandle.prototype.onDraw = function () {
        this.context.strokeStyle = window.prefs.getBoolean('darkTheme') ? 'white' : 'black';
        this.context.lineWidth = 2;
        this.context.beginPath();
        this.context.arc(this.sectionProperties.circleRadius, this.sectionProperties.circleRadius, this.sectionProperties.circleRadius, 0, 2 * Math.PI);
        this.context.stroke();
    };
    CellSelectionHandle.prototype.onMouseMove = function (point, dragDistance, e) {
        e.stopPropagation();
        if (this.containerObject.isDraggingSomething()) {
            app.map.scrollingIsHandled = true;
            this.stopPropagating();
            this.onDrag(point);
        }
    };
    CellSelectionHandle.prototype.onMouseDown = function (point, e) {
        e.stopPropagation();
        this.stopPropagating();
    };
    CellSelectionHandle.prototype.onMouseUp = function (point, e) {
        e.stopPropagation();
        if (this.containerObject.isDraggingSomething()) {
            this.stopPropagating();
            this.onDragEnd(point);
        }
    };
    return CellSelectionHandle;
}(app.definitions.canvasSectionObject));
app.definitions.cellSelectionHandle = CellSelectionHandle;
//# sourceMappingURL=CellSelectionHandleSection.js.map