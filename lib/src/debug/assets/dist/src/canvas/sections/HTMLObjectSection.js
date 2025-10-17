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
var HTMLObjectSection = /** @class */ (function (_super) {
    __extends(HTMLObjectSection, _super);
    function HTMLObjectSection(sectionName, objectWidth, objectHeight, documentPosition, extraClass, showSection) {
        if (extraClass === void 0) { extraClass = ""; }
        if (showSection === void 0) { showSection = true; }
        var _this = _super.call(this) || this;
        _this.name = "will-be-set-at-initialization"; // There may be multiple instances of this class.
        _this.processingOrder = L.CSections.HTMLObject.processingOrder;
        _this.drawingOrder = L.CSections.HTMLObject.drawingOrder;
        _this.zIndex = L.CSections.HTMLObject.zIndex;
        _this.documentObject = true;
        _this.name = sectionName;
        _this.size = [objectWidth * app.dpiScale, objectHeight * app.dpiScale];
        _this.position = [documentPosition.pX, documentPosition.pY];
        _this.sectionProperties.objectWidth = objectWidth;
        _this.sectionProperties.objectHeight = objectHeight;
        _this.sectionProperties.objectDiv = document.createElement('div');
        _this.sectionProperties.objectDiv.className = 'html-object-section';
        if (objectWidth === null)
            _this.sectionProperties.objectDiv.style.width = 'auto';
        else
            _this.sectionProperties.objectDiv.style.width = objectWidth + 'px';
        if (objectHeight === null)
            _this.sectionProperties.objectDiv.style.height = 'auto';
        else
            _this.sectionProperties.objectDiv.style.height = objectHeight + 'px';
        if (extraClass)
            _this.sectionProperties.objectDiv.classList.add(extraClass);
        // canvas-container and canvas overlap entirely. We can append the html object to canvas-container.
        document.getElementById('canvas-container').appendChild(_this.sectionProperties.objectDiv);
        if (!showSection) {
            _this.sectionProperties.objectDiv.style.display = 'none';
            _this.showSection = false;
        }
        return _this;
    }
    HTMLObjectSection.prototype.onInitialize = function () {
        this.setPosition(this.position[0], this.position[1]);
        this.adjustHTMLObjectPosition();
    };
    HTMLObjectSection.prototype.onSectionShowStatusChange = function () {
        if (this.showSection)
            this.sectionProperties.objectDiv.style.display = '';
        else
            this.sectionProperties.objectDiv.style.display = 'none';
    };
    HTMLObjectSection.prototype.adjustHTMLObjectPosition = function () {
        var leftAddition = 0;
        var topAddition = 0;
        if (this.sectionProperties.objectDiv.parentNode.id === 'map') {
            var clientRectMap = document.getElementById('map').getBoundingClientRect();
            var clientRectCanvas = document.getElementById('canvas-container').getBoundingClientRect();
            leftAddition = clientRectMap.width - clientRectCanvas.width;
            topAddition = clientRectMap.height - clientRectCanvas.height;
        }
        var left = Math.round((this.myTopLeft[0] + leftAddition) / app.dpiScale) + 'px';
        var top = Math.round((this.myTopLeft[1] + topAddition) / app.dpiScale) + 'px';
        if (this.sectionProperties.objectDiv.style.left !== left)
            this.sectionProperties.objectDiv.style.left = left;
        if (this.sectionProperties.objectDiv.style.top !== top)
            this.sectionProperties.objectDiv.style.top = top;
    };
    HTMLObjectSection.prototype.onDraw = function (frameCount, elapsedTime) {
        this.adjustHTMLObjectPosition();
    };
    HTMLObjectSection.prototype.getHTMLObject = function () {
        return this.sectionProperties.objectDiv;
    };
    HTMLObjectSection.prototype.onNewDocumentTopLeft = function () {
        this.adjustHTMLObjectPosition();
        if (this.isVisible && this.isSectionShown()) {
            if (this.sectionProperties.objectDiv.style.display !== '')
                this.sectionProperties.objectDiv.style.display = '';
        }
        else
            this.sectionProperties.objectDiv.style.display = 'none';
    };
    HTMLObjectSection.prototype.getPosition = function () {
        var twips = [Math.round(this.position[0] * app.pixelsToTwips), Math.round(this.position[1] * app.pixelsToTwips)];
        return new cool.SimplePoint(twips[0], twips[1]);
    };
    HTMLObjectSection.prototype.onRemove = function () {
        this.sectionProperties.objectDiv.remove();
    };
    return HTMLObjectSection;
}(CanvasSectionObject));
app.definitions.htmlObjectSection = HTMLObjectSection;
//# sourceMappingURL=HTMLObjectSection.js.map