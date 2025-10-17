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
var TextSelectionHandle = /** @class */ (function (_super) {
    __extends(TextSelectionHandle, _super);
    function TextSelectionHandle(sectionName, objectWidth, objectHeight, documentPosition, extraClass, showSection) {
        if (extraClass === void 0) { extraClass = ""; }
        if (showSection === void 0) { showSection = false; }
        var _this = _super.call(this, sectionName, objectWidth, objectHeight, documentPosition, extraClass, showSection) || this;
        _this.rectangle = null; // This is the rectangle sent from the core side.
        return _this;
    }
    TextSelectionHandle.prototype.onDrag = function (point) {
        window.IgnorePanning = true;
        var candidateX = Math.round((this.myTopLeft[0] + point[0]) / app.dpiScale);
        var candidateY = Math.round((this.myTopLeft[1] + point[1]) / app.dpiScale);
        this.sectionProperties.objectDiv.style.left = candidateX + 'px';
        this.sectionProperties.objectDiv.style.top = candidateY + 'px';
        app.map.fire('handleautoscroll', { pos: { x: candidateX, y: candidateY }, map: app.map });
    };
    TextSelectionHandle.prototype.setOpacity = function (value) {
        this.getHTMLObject().style.opacity = value;
    };
    TextSelectionHandle.prototype.onDragEnd = function (point) {
        window.IgnorePanning = undefined;
        var x = this.position[0] + point[0];
        var y = this.position[1] + point[1];
        this.setPosition(x, y);
        app.map.fire('scrollvelocity', { vx: 0, vy: 0 });
        var type = this.name === 'selection_start_handle' ? 'start' : 'end';
        if (type === 'start')
            x += 30 / app.dpiScale;
        if (!app.map._docLayer.isCalcRTL()) {
            app.map._docLayer._postSelectTextEvent(type, Math.round(x * app.pixelsToTwips), Math.round(y * app.pixelsToTwips));
        }
        else {
            var referenceX = app.file.viewedRectangle.pX1 + (app.file.viewedRectangle.pX2 - this.position[0]);
            app.map._docLayer._postSelectTextEvent(type, Math.round(referenceX * app.pixelsToTwips), Math.round(y * app.pixelsToTwips));
        }
    };
    TextSelectionHandle.prototype.onMouseMove = function (point, dragDistance, e) {
        e.stopPropagation();
        if (this.containerObject.isDraggingSomething()) {
            this.stopPropagating();
            this.onDrag(point);
        }
    };
    TextSelectionHandle.prototype.onDocumentObjectVisibilityChange = function () {
        if (this.showSection && this.isVisible)
            this.sectionProperties.objectDiv.style.display = '';
        else
            this.sectionProperties.objectDiv.style.display = 'none';
    };
    TextSelectionHandle.prototype.onClick = function (point, e) {
        e.stopPropagation();
        this.stopPropagating();
    };
    TextSelectionHandle.prototype.onMouseDown = function (point, e) {
        e.stopPropagation();
        this.stopPropagating();
    };
    TextSelectionHandle.prototype.onMouseUp = function (point, e) {
        e.stopPropagation();
        if (this.containerObject.isDraggingSomething()) {
            this.stopPropagating();
            this.onDragEnd(point);
        }
    };
    return TextSelectionHandle;
}(HTMLObjectSection));
app.definitions.textSelectionHandleSection = TextSelectionHandle;
//# sourceMappingURL=TextSelectionHandleSection.js.map