// @ts-strict-ignore
/* -*- js-indent-level: 8 -*- */
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
app.definitions.AutoFillMarkerSection = /** @class */ (function (_super) {
    __extends(AutoFillMarkerSection, _super);
    function AutoFillMarkerSection() {
        var _this = _super.call(this) || this;
        _this.name = L.CSections.AutoFillMarker.name;
        _this.processingOrder = L.CSections.AutoFillMarker.processingOrder;
        _this.drawingOrder = L.CSections.AutoFillMarker.drawingOrder;
        _this.zIndex = L.CSections.AutoFillMarker.zIndex;
        _this.cursorBorderWidth = 2;
        _this.selectionBorderWidth = 1;
        _this.documentObject = true;
        _this.map = L.Map.THIS;
        _this.sectionProperties.docLayer = _this.map._docLayer;
        _this.sectionProperties.selectedAreaPoint = null;
        _this.sectionProperties.cellCursorPoint = null;
        _this.sectionProperties.inMouseDown = false;
        _this.sectionProperties.draggingStarted = false;
        _this.sectionProperties.dragStartPosition = null;
        _this.sectionProperties.mapPane = (document.querySelectorAll('.leaflet-map-pane')[0]);
        var cursorStyle = getComputedStyle(_this.sectionProperties.docLayer._cursorDataDiv);
        var selectionStyle = getComputedStyle(_this.sectionProperties.docLayer._selectionsDataDiv);
        var cursorColor = cursorStyle.getPropertyValue('border-top-color');
        _this.backgroundColor = cursorColor ? cursorColor : _this.backgroundColor;
        _this.cursorBorderWidth = Math.round(window.devicePixelRatio * parseInt(cursorStyle.getPropertyValue('border-top-width')));
        _this.selectionBorderWidth = Math.round(window.devicePixelRatio * parseInt(selectionStyle.getPropertyValue('border-top-width')));
        return _this;
    }
    AutoFillMarkerSection.prototype.onInitialize = function () {
        if (window.mode.isDesktop()) {
            this.size = [Math.round(6 * app.dpiScale), Math.round(6 * app.dpiScale)];
        }
        else {
            this.size = [Math.round(16 * app.dpiScale), Math.round(16 * app.dpiScale)];
        }
    };
    AutoFillMarkerSection.prototype.onResize = function () {
        return;
    };
    AutoFillMarkerSection.prototype.setMarkerPosition = function () {
        var center = 0;
        if (!window.mode.isDesktop()) {
            center = app.calc.cellCursorRectangle.pWidth * 0.5;
        }
        var position = [0, 0];
        this.setShowSection(true);
        if (this.sectionProperties.selectedAreaPoint !== null)
            position = [this.sectionProperties.selectedAreaPoint[0] - center, this.sectionProperties.selectedAreaPoint[1]];
        else if (this.sectionProperties.cellCursorPoint !== null)
            position = [this.sectionProperties.cellCursorPoint[0] - center, this.sectionProperties.cellCursorPoint[1]];
        else
            this.setShowSection(false);
        this.setPosition(position[0], position[1]);
    };
    AutoFillMarkerSection.prototype.calculatePositionFromPoint = function (point) {
        var calcPoint;
        if (point === null) {
            calcPoint = null;
        }
        else {
            var translation = [Math.floor(this.size[0] * 0.5), Math.floor(this.size[1] * 0.5)];
            calcPoint = [point[0] - translation[0], point[1] - translation[1]];
        }
        return calcPoint;
    };
    // Give bottom right position of selected area, in core pixels. Call with null parameter when auto fill marker is not visible.
    AutoFillMarkerSection.prototype.calculatePositionViaCellSelection = function (point) {
        this.sectionProperties.selectedAreaPoint = this.calculatePositionFromPoint(point);
        this.setMarkerPosition();
    };
    // Give bottom right position of cell cursor, in core pixels. Call with null parameter when auto fill marker is not visible.
    AutoFillMarkerSection.prototype.calculatePositionViaCellCursor = function (point) {
        this.sectionProperties.cellCursorPoint = this.calculatePositionFromPoint(point);
        this.setMarkerPosition();
    };
    // This is for enhancing contrast of the marker with the background
    // similar to what we have for cell cursors.
    AutoFillMarkerSection.prototype.drawWhiteOuterBorders = function () {
        var _this = this;
        this.context.strokeStyle = 'white';
        this.context.lineCap = 'square';
        this.context.lineWidth = 1;
        var desktop = window.mode.isDesktop();
        var translation = desktop ?
            [this.size[0], this.size[1]] :
            [Math.floor(this.size[0] * 0.5), Math.floor(this.size[1] * 0.5)];
        var adjustForRTL = app.map._docLayer.isCalcRTL();
        var transformX = function (xcoord) {
            return adjustForRTL ? _this.size[0] - xcoord : xcoord;
        };
        // top white line
        this.context.beginPath();
        this.context.moveTo(transformX(-0.5), -0.5);
        var borderWidth = this.sectionProperties.selectedAreaPoint ? this.selectionBorderWidth : this.cursorBorderWidth;
        this.context.lineTo(transformX(this.size[0] + 0.5 - (desktop ? borderWidth : 0)), -0.5);
        this.context.stroke();
        if (!desktop) {
            this.context.beginPath();
            this.context.moveTo(transformX(this.size[0] - 0.5 - (desktop ? borderWidth : 0)), -0.5);
            this.context.lineTo(transformX(this.size[0] - 0.5 - (desktop ? borderWidth : 0)), translation[1] - 0.5 - borderWidth);
            this.context.stroke();
        }
        // bottom white line
        this.context.beginPath();
        this.context.moveTo(transformX(-0.5), -0.5);
        this.context.lineTo(transformX(-0.5), translation[1] + 0.5 - borderWidth);
        this.context.stroke();
    };
    AutoFillMarkerSection.prototype.onDraw = function () {
        this.drawWhiteOuterBorders();
    };
    AutoFillMarkerSection.prototype.onMouseMove = function (point, dragDistance, e) {
        if (window.mode.isDesktop())
            return;
        if (dragDistance === null || !this.sectionProperties.docLayer._cellAutoFillAreaPixels)
            return; // No dragging or no event handling or auto fill marker is not visible.
        var pos;
        if (!this.sectionProperties.draggingStarted) { // Is it first move?
            this.sectionProperties.draggingStarted = true;
            this.sectionProperties.dragStartPosition = this.sectionProperties.docLayer._cellAutoFillAreaPixels.getCenter();
            pos = new L.Point(this.sectionProperties.dragStartPosition[0], this.sectionProperties.dragStartPosition[1]);
            pos = this.sectionProperties.docLayer._corePixelsToTwips(pos);
            this.sectionProperties.docLayer._postMouseEvent('buttondown', pos.x, pos.y, 1, 1, 0);
        }
        point[0] = this.sectionProperties.dragStartPosition[0] + dragDistance[0];
        point[1] = this.sectionProperties.dragStartPosition[1] + dragDistance[1];
        pos = this.sectionProperties.docLayer._corePixelsToTwips(new L.Point(point[0], point[1]));
        this.sectionProperties.docLayer._postMouseEvent('move', pos.x, pos.y, 1, 1, 0);
        this.map.scrollingIsHandled = true;
        this.stopPropagating(); // Stop propagating to sections.
        e.stopPropagation(); // Stop native event.
    };
    AutoFillMarkerSection.prototype.onMouseUp = function (point, e) {
        if (this.sectionProperties.draggingStarted) {
            this.sectionProperties.draggingStarted = false;
            point[0] += this.myTopLeft[0] + this.size[0] * 0.5;
            point[1] += this.myTopLeft[1] + this.size[1] * 0.5;
            var pos = this.sectionProperties.docLayer._corePixelsToTwips(new L.Point(point[0], point[1]));
            this.sectionProperties.docLayer._postMouseEvent('buttonup', pos.x, pos.y, 1, 1, 0);
        }
        this.map.scrollingIsHandled = false;
        this.stopPropagating();
        e.stopPropagation();
        window.IgnorePanning = false;
    };
    AutoFillMarkerSection.prototype.onMouseDown = function (point, e) {
        if (window.mode.isDesktop()) {
            if (this.sectionProperties.inMouseDown)
                return;
            this.sectionProperties.inMouseDown = true;
            // revert coordinates to global and fire event again with position in the center
            // inverse of convertPositionToCanvasLocale
            var canvasClientRect = this.containerObject.getCanvasBoundingClientRect();
            point[0] = (this.myTopLeft[0] + this.size[0] * 0.5 + 1) / app.dpiScale + canvasClientRect.left;
            point[1] = (this.myTopLeft[1] + this.size[1] * 0.5 + 1) / app.dpiScale + canvasClientRect.top;
            var newPoint = {
                clientX: point[0],
                clientY: point[1],
            };
            var newEvent = this.sectionProperties.docLayer._createNewMouseEvent('mousedown', newPoint);
            this.sectionProperties.mapPane.dispatchEvent(newEvent);
        }
        // Just to be safe. We don't need this, but it makes no harm.
        this.stopPropagating();
        e.stopPropagation();
        window.IgnorePanning = true; // We'll keep this until we have consistent sections and remove map element.
        this.sectionProperties.inMouseDown = false;
    };
    AutoFillMarkerSection.prototype.onMouseEnter = function () {
        this.sectionProperties.mapPane.style.cursor = 'crosshair';
    };
    AutoFillMarkerSection.prototype.onMouseLeave = function () {
        this.sectionProperties.mapPane.style.cursor = 'default';
    };
    AutoFillMarkerSection.prototype.onNewDocumentTopLeft = function () {
        this.setMarkerPosition();
    };
    AutoFillMarkerSection.prototype.onMouseWheel = function () { return; };
    AutoFillMarkerSection.prototype.onClick = function () { return; };
    AutoFillMarkerSection.prototype.onDoubleClick = function (point, e) {
        this.sectionProperties.dragStartPosition = this.sectionProperties.docLayer._cellAutoFillAreaPixels.getCenter();
        var pos = new L.Point(this.sectionProperties.dragStartPosition[0], this.sectionProperties.dragStartPosition[1]);
        pos = this.sectionProperties.docLayer._corePixelsToTwips(pos);
        this.sectionProperties.docLayer._postMouseEvent('buttondown', pos.x, pos.y, 2, 1, 0);
        this.stopPropagating(); // Stop propagating to sections.
        e.stopPropagation(); // Stop native event.
    };
    AutoFillMarkerSection.prototype.onContextMenu = function () { return; };
    AutoFillMarkerSection.prototype.onMultiTouchStart = function () { return; };
    AutoFillMarkerSection.prototype.onMultiTouchMove = function () { return; };
    AutoFillMarkerSection.prototype.onMultiTouchEnd = function () { return; };
    return AutoFillMarkerSection;
}(CanvasSectionObject));
//# sourceMappingURL=AutoFillMarkerSection.js.map