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
// This is used for other views' graphic selections.
var OtherViewGraphicSelectionSection = /** @class */ (function (_super) {
    __extends(OtherViewGraphicSelectionSection, _super);
    function OtherViewGraphicSelectionSection(viewId, rectangle, part, mode) {
        var _this = _super.call(this) || this;
        _this.documentObject = true;
        _this.interactable = false; // We don't bother with events.
        _this.zIndex = L.CSections.DefaultForDocumentObjects.processingOrder;
        _this.drawingOrder = L.CSections.DefaultForDocumentObjects.drawingOrder;
        _this.processingOrder = L.CSections.DefaultForDocumentObjects.processingOrder;
        _this.size = [rectangle.pWidth, rectangle.pHeight];
        _this.position = [rectangle.pX1, rectangle.pY1];
        _this.sectionProperties.color = app.LOUtil.rgbToHex(app.LOUtil.getViewIdColor(viewId));
        _this.name = OtherViewGraphicSelectionSection.sectionNamePrefix + viewId;
        _this.sectionProperties.viewId = viewId;
        _this.sectionProperties.part = part;
        _this.sectionProperties.mode = mode;
        return _this;
    }
    OtherViewGraphicSelectionSection.prototype.onDraw = function (frameCount, elapsedTime) {
        this.context.strokeStyle = this.sectionProperties.color;
        this.context.lineWidth = 2;
        this.context.strokeRect(-0.5, -0.5, this.size[0], this.size[1]);
    };
    OtherViewGraphicSelectionSection.prototype.checkMyVisibility = function () {
        var result = this.size[0] > 0 && this.size[1] > 0;
        if (result) {
            if (!app.map._docLayer.isWriter()) {
                if (this.sectionProperties.part !== app.map._docLayer._selectedPart || this.sectionProperties.mode !== app.map._docLayer._selectedMode)
                    result = false;
            }
        }
        return result;
    };
    OtherViewGraphicSelectionSection.addOrUpdateGraphicSelectionIndicator = function (viewId, rectangleData, part, mode) {
        var rectangle = new cool.SimpleRectangle(0, 0, 0, 0);
        if (rectangleData)
            rectangle = new app.definitions.simpleRectangle(parseInt(rectangleData[0]), parseInt(rectangleData[1]), parseInt(rectangleData[2]), parseInt(rectangleData[3]));
        var sectionName = OtherViewGraphicSelectionSection.sectionNamePrefix + viewId;
        var section;
        if (app.sectionContainer.doesSectionExist(sectionName)) {
            section = app.sectionContainer.getSectionWithName(sectionName);
            section.sectionProperties.part = part;
            section.sectionProperties.mode = mode;
            section.size[0] = rectangle.pWidth;
            section.size[1] = rectangle.pHeight;
            section.setPosition(rectangle.pX1, rectangle.pY1);
        }
        else {
            section = new OtherViewGraphicSelectionSection(viewId, rectangle, part, mode);
            app.sectionContainer.addSection(section);
            OtherViewGraphicSelectionSection.sectionPointers.push(section);
        }
        section.setShowSection(section.checkMyVisibility());
        app.sectionContainer.requestReDraw();
    };
    OtherViewGraphicSelectionSection.removeView = function (viewId) {
        var sectionName = OtherViewGraphicSelectionSection.sectionNamePrefix + viewId;
        if (app.sectionContainer.doesSectionExist(sectionName)) {
            var section = app.sectionContainer.getSectionWithName(sectionName);
            OtherViewGraphicSelectionSection.sectionPointers.splice(OtherViewGraphicSelectionSection.sectionPointers.indexOf(section), 1);
            app.sectionContainer.removeSection(sectionName);
            app.sectionContainer.requestReDraw();
        }
    };
    OtherViewGraphicSelectionSection.updateVisibilities = function () {
        for (var i = 0; i < OtherViewGraphicSelectionSection.sectionPointers.length; i++) {
            var section = OtherViewGraphicSelectionSection.sectionPointers[i];
            section.setShowSection(section.checkMyVisibility());
        }
        app.sectionContainer.requestReDraw();
    };
    OtherViewGraphicSelectionSection.sectionNamePrefix = 'OtherViewGraphicSelection ';
    OtherViewGraphicSelectionSection.sectionPointers = [];
    return OtherViewGraphicSelectionSection;
}(CanvasSectionObject));
app.definitions.otherViewGraphicSelectionSection = OtherViewGraphicSelectionSection;
//# sourceMappingURL=OtherViewGraphicSelectionSection.js.map