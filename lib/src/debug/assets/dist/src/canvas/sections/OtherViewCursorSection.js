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
// This is used for other views' cursors.
var OtherViewCursorSection = /** @class */ (function (_super) {
    __extends(OtherViewCursorSection, _super);
    function OtherViewCursorSection(viewId, color, rectangle, part, mode) {
        var _this = _super.call(this, OtherViewCursorSection.sectionNamePrefix + viewId, rectangle.pWidth / app.dpiScale, rectangle.pHeight / app.dpiScale, new cool.SimplePoint(rectangle.x1, rectangle.y1)) || this;
        _this.documentObject = true;
        _this.interactable = false; // We don't bother with events.
        _this.zIndex = L.CSections.DefaultForDocumentObjects.processingOrder;
        _this.drawingOrder = L.CSections.DefaultForDocumentObjects.drawingOrder;
        _this.processingOrder = L.CSections.DefaultForDocumentObjects.processingOrder;
        _this.sectionProperties.color = color;
        _this.sectionProperties.viewId = viewId;
        _this.sectionProperties.part = part;
        _this.sectionProperties.mode = mode;
        _this.sectionProperties.showCursor = true;
        _this.showSection = true;
        _this.getHTMLObject().style.backgroundColor = _this.sectionProperties.color;
        return _this;
    }
    OtherViewCursorSection.prototype.checkMyVisibility = function () {
        var result = this.sectionProperties.showCursor && this.size[1] > 0;
        if (result) {
            if (!app.map._docLayer.isWriter()) {
                if (this.sectionProperties.part !== app.map._docLayer._selectedPart || this.sectionProperties.mode !== app.map._docLayer._selectedMode)
                    result = false;
            }
        }
        if (result && app.file.textCursor.visible) {
            var pos = [app.file.textCursor.rectangle.pX1, app.file.textCursor.rectangle.pY1];
            if (this.position[0] === pos[0] && this.position[1] === pos[1])
                result = false;
        }
        if (result && app.map.isViewReadOnly(this.sectionProperties.viewId))
            result = false;
        return result;
    };
    OtherViewCursorSection.addOrUpdateOtherViewCursor = function (viewId, username, rectangleData, part, mode) {
        var rectangle = new cool.SimpleRectangle(0, 0, 0, 0);
        var color = app.LOUtil.rgbToHex(app.LOUtil.getViewIdColor(viewId));
        if (rectangleData) {
            rectangle = new app.definitions.simpleRectangle(rectangleData[0], rectangleData[1], rectangleData[2], rectangleData[3]);
        }
        rectangle.pWidth = 2 * app.dpiScale; // Width of the cursor.
        var sectionName = OtherViewCursorSection.sectionNamePrefix + viewId;
        var section;
        if (app.sectionContainer.doesSectionExist(sectionName)) {
            section = app.sectionContainer.getSectionWithName(sectionName);
            section.sectionProperties.part = part;
            section.sectionProperties.mode = mode;
            section.size[0] = rectangle.pWidth;
            section.size[1] = rectangle.pHeight;
            section.getHTMLObject().style.width = (section.size[0] / app.dpiScale) + 'px';
            section.getHTMLObject().style.height = (section.size[1] / app.dpiScale) + 'px';
            section.setPosition(rectangle.pX1, rectangle.pY1);
        }
        else {
            section = new OtherViewCursorSection(viewId, color, rectangle, part, mode);
            app.sectionContainer.addSection(section);
            OtherViewCursorSection.sectionPointers.push(section);
        }
        section.setShowSection(section.checkMyVisibility());
        section.onNewDocumentTopLeft();
        section.adjustHTMLObjectPosition();
        var documentPosition = new cool.SimplePoint(section.position[0] * app.pixelsToTwips, (section.position[1] - 20) * app.pixelsToTwips);
        if (section.showSection && section.isVisible)
            app.definitions.cursorHeaderSection.showCursorHeader(viewId, username, documentPosition, color);
        app.sectionContainer.requestReDraw();
    };
    OtherViewCursorSection.removeView = function (viewId) {
        var sectionName = OtherViewCursorSection.sectionNamePrefix + viewId;
        if (app.sectionContainer.doesSectionExist(sectionName)) {
            var section = app.sectionContainer.getSectionWithName(sectionName);
            OtherViewCursorSection.sectionPointers.splice(OtherViewCursorSection.sectionPointers.indexOf(section), 1);
            app.sectionContainer.removeSection(sectionName);
            app.sectionContainer.requestReDraw();
        }
    };
    OtherViewCursorSection.doesViewCursorSectionExist = function (viewId) {
        var name = OtherViewCursorSection.sectionNamePrefix + viewId;
        return app.sectionContainer.doesSectionExist(name);
    };
    OtherViewCursorSection.getViewCursorSection = function (viewId) {
        if (OtherViewCursorSection.doesViewCursorSectionExist(viewId)) {
            var name_1 = OtherViewCursorSection.sectionNamePrefix + viewId;
            return app.sectionContainer.getSectionWithName(name_1);
        }
        else
            return null;
    };
    OtherViewCursorSection.updateVisibilities = function (hideCursors) {
        if (hideCursors === void 0) { hideCursors = false; }
        for (var i = 0; i < OtherViewCursorSection.sectionPointers.length; i++) {
            var section = OtherViewCursorSection.sectionPointers[i];
            section.setShowSection(section.checkMyVisibility());
            if (hideCursors)
                section.getHTMLObject().style.opacity = '0';
            else
                section.getHTMLObject().style.opacity = '1';
        }
        app.sectionContainer.requestReDraw();
    };
    OtherViewCursorSection.sectionNamePrefix = 'OtherViewCursor ';
    OtherViewCursorSection.sectionPointers = [];
    return OtherViewCursorSection;
}(HTMLObjectSection));
app.definitions.otherViewCursorSection = OtherViewCursorSection;
//# sourceMappingURL=OtherViewCursorSection.js.map