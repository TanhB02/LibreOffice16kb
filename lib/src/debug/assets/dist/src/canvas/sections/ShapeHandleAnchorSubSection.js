// @ts-strict-ignore
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
    This class is for the sub sections (handles) of ShapeHandlesSection.
    Shape is rendered on the core side. Only the handles are drawn here and modification commands are sent to the core side.
*/
var ShapeHandleAnchorSubSection = /** @class */ (function (_super) {
    __extends(ShapeHandleAnchorSubSection, _super);
    function ShapeHandleAnchorSubSection(parentHandlerSection, sectionName, size, documentPosition, ownInfo) {
        var _this = _super.call(this, sectionName, size[0], size[1], documentPosition, 'anchor-marker') || this;
        _this.getHTMLObject().style.opacity = 1;
        _this.getHTMLObject().remove();
        document.getElementById('map').appendChild(_this.getHTMLObject());
        app.definitions.shapeHandlesSection.mirrorEventsFromSourceToCanvasSectionContainer(_this.getHTMLObject());
        _this.sectionProperties.parentHandlerSection = parentHandlerSection;
        _this.sectionProperties.ownInfo = ownInfo;
        _this.sectionProperties.mouseIsInside = false;
        return _this;
    }
    ShapeHandleAnchorSubSection.prototype.onMouseEnter = function () {
        this.backgroundColor = 'grey';
        this.containerObject.requestReDraw();
    };
    ShapeHandleAnchorSubSection.prototype.onMouseLeave = function () {
        this.backgroundColor = null;
        this.containerObject.requestReDraw();
    };
    ShapeHandleAnchorSubSection.prototype.tableMouseUp = function (point, e) {
        var parameters = {
            'TransformPosX': {
                'type': 'long',
                'value': Math.round((point[0] + this.position[0]) * app.pixelsToTwips)
            },
            'TransformPosY': {
                'type': 'long',
                'value': Math.round((point[1] + this.position[1]) * app.pixelsToTwips)
            }
        };
        app.map.sendUnoCommand('.uno:TransformDialog', parameters);
    };
    ShapeHandleAnchorSubSection.prototype.shapeMouseUp = function (point, e) {
        var parameters = {
            'HandleNum': {
                'type': 'long',
                'value': this.sectionProperties.ownInfo.id
            },
            'NewPosX': {
                'type': 'long',
                'value': Math.round((point[0] + this.position[0]) * app.pixelsToTwips)
            },
            'NewPosY': {
                'type': 'long',
                'value': Math.round((point[1] + this.position[1]) * app.pixelsToTwips)
            }
        };
        app.map.sendUnoCommand('.uno:MoveShapeHandle', parameters);
    };
    ShapeHandleAnchorSubSection.prototype.onMouseUp = function (point, e) {
        if (this.containerObject.isDraggingSomething()) {
            // Tables don't have parent sections. This is used for separating table anchors from other anchors.
            if (this.sectionProperties.parentHandlerSection) {
                this.shapeMouseUp(point, e);
            }
            else {
                this.tableMouseUp(point, e);
            }
        }
    };
    ShapeHandleAnchorSubSection.prototype.onMouseMove = function (point, dragDistance, e) {
        if (this.containerObject.isDraggingSomething()) {
            // Show preview in its final position.
            var svg = void 0;
            var initialPosition = void 0;
            if (this.sectionProperties.parentHandlerSection) {
                this.sectionProperties.parentHandlerSection.showSVG();
                svg = this.sectionProperties.parentHandlerSection.sectionProperties.svg;
                initialPosition = this.sectionProperties.parentHandlerSection.sectionProperties.svgPosition;
            }
            else {
                // Table..
                svg = document.getElementById('canvas-container').querySelector('svg');
                svg.style.display = '';
                if (!this.sectionProperties.initialPosition) {
                    this.sectionProperties.initialPosition = [parseFloat(svg.style.left.replace('px', '')) * app.dpiScale, parseFloat(svg.style.top.replace('px', '')) * app.dpiScale];
                }
                initialPosition = this.sectionProperties.initialPosition;
            }
            svg.style.left = (dragDistance[0] + initialPosition[0]) / app.dpiScale + 'px';
            svg.style.top = (dragDistance[1] + initialPosition[1]) / app.dpiScale + 'px';
            this.stopPropagating();
            e.stopPropagation();
        }
    };
    ShapeHandleAnchorSubSection.tableAnchorIconSize = [20, 20]; // CSS pixels.
    return ShapeHandleAnchorSubSection;
}(HTMLObjectSection));
app.definitions.shapeHandleAnchorSubSection = ShapeHandleAnchorSubSection;
//# sourceMappingURL=ShapeHandleAnchorSubSection.js.map