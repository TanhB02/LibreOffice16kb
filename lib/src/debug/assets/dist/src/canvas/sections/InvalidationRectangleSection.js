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
/*
 * Copyright the Collabora Online contributors.
 *
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var sectionName = 'TileInvalidationRectangle';
var InvalidationRectangleSection = /** @class */ (function (_super) {
    __extends(InvalidationRectangleSection, _super);
    function InvalidationRectangleSection() {
        var _this = _super.call(this) || this;
        _this.name = sectionName;
        /*
            We don't want visibility issues.
            Since there will be more than one rectangles in this section, position property (thus document section) is not useful anymore.
        */
        _this.windowSection = true;
        _this.showSection = true;
        _this.zIndex = L.CSections.DefaultForDocumentObjects.zIndex;
        _this.drawingOrder = L.CSections.DefaultForDocumentObjects.drawingOrder;
        _this.processingOrder = L.CSections.DefaultForDocumentObjects.processingOrder;
        _this.interactable = false;
        _this.sectionProperties.rectangleList = [];
        return _this;
    }
    InvalidationRectangleSection.prototype.addRectangle = function (x, y, width, height) {
        var rectangleList = this.sectionProperties
            .rectangleList;
        if (rectangleList.length === 5)
            rectangleList.pop();
        rectangleList.unshift([x, y, width, height]);
    };
    InvalidationRectangleSection.prototype.onDraw = function (frameCount, elapsedTime, subsetBounds) {
        var rectangleList = this.sectionProperties
            .rectangleList;
        this.context.strokeStyle = 'red';
        var anchor = this.containerObject.getDocumentAnchor();
        var xDiff = anchor[0] - this.documentTopLeft[0];
        var yDiff = anchor[1] - this.documentTopLeft[1];
        for (var i = 0; i < rectangleList.length; i++) {
            this.context.globalAlpha = 1 - 0.15 * i;
            this.context.strokeRect(xDiff + rectangleList[i][0], yDiff + rectangleList[i][1], rectangleList[i][2], rectangleList[i][3]);
        }
        this.context.globalAlpha = 1;
    };
    InvalidationRectangleSection.prototype.checkDeletion = function () {
        var _this = this;
        if (this.sectionProperties.rectangleList.length > 0) {
            this.sectionProperties.rectangleList.pop();
            setTimeout(function () {
                _this.checkDeletion();
            }, 1000);
        }
        else {
            app.sectionContainer.removeSection(this.name);
        }
    };
    InvalidationRectangleSection.getSection = function () {
        var section;
        if (app.sectionContainer.doesSectionExist(sectionName))
            section = app.sectionContainer.getSectionWithName(sectionName);
        else {
            section = new InvalidationRectangleSection();
            app.sectionContainer.addSection(section);
            setTimeout(function () {
                section.checkDeletion();
            }, 2000); // Start the cycle.
        }
        return section;
    };
    InvalidationRectangleSection.setRectangle = function (x, y, width, height) {
        var section = this.getSection();
        section.addRectangle(x, y, width, height);
    };
    return InvalidationRectangleSection;
}(CanvasSectionObject));
//# sourceMappingURL=InvalidationRectangleSection.js.map