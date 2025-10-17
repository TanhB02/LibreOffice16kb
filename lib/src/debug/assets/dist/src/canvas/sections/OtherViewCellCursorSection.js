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
/*
 * Copyright the Collabora Online contributors.
 *
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
// This is used for other views' cell cursors.
var OtherViewCellCursorSection = /** @class */ (function (_super) {
    __extends(OtherViewCellCursorSection, _super);
    function OtherViewCellCursorSection(viewId, rectangle, part) {
        var _this = _super.call(this) || this;
        _this.documentObject = true;
        _this.interactable = false; // We don't bother with events.
        _this.zIndex = L.CSections.ColumnHeader.zIndex;
        _this.drawingOrder = L.CSections.OtherViewCellCursor.drawingOrder;
        _this.processingOrder = L.CSections.OtherViewCellCursor.processingOrder;
        _this.size = [rectangle.pWidth, rectangle.pHeight];
        _this.position = [rectangle.pX1, rectangle.pY1];
        _this.sectionProperties.color = app.LOUtil.rgbToHex(app.LOUtil.getViewIdColor(viewId));
        _this.name = OtherViewCellCursorSection.sectionNamePrefix + viewId;
        _this.sectionProperties.viewId = viewId;
        _this.sectionProperties.part = part;
        _this.sectionProperties.popUpContainer = null;
        _this.sectionProperties.popUpShown = false;
        _this.sectionProperties.username = null;
        _this.sectionProperties.popUpTimer = null;
        return _this;
    }
    OtherViewCellCursorSection.prototype.onDraw = function (frameCount, elapsedTime) {
        if (app.map._docLayer._isZooming)
            return;
        this.adjustPopUpPosition();
        this.context.strokeStyle = this.sectionProperties.color;
        this.context.lineWidth = 2;
        this.context.strokeRect(-0.5, -0.5, this.size[0], this.size[1]);
    };
    OtherViewCellCursorSection.prototype.checkMyVisibility = function () {
        if (app.map._docLayer._selectedPart !== this.sectionProperties.part)
            return false;
        else
            return true;
    };
    OtherViewCellCursorSection.prototype.adjustPopUpPosition = function () {
        var width = this.sectionProperties.popUpContainer.getBoundingClientRect().width;
        var height = this.sectionProperties.popUpContainer.getBoundingClientRect().height;
        var pos = [this.myTopLeft[0] / app.dpiScale + this.size[0] * 0.5 / app.dpiScale - (width * 0.5), (this.myTopLeft[1] / app.dpiScale) - (height + 15)];
        this.sectionProperties.popUpContainer.style.left = pos[0] + 'px';
        this.sectionProperties.popUpContainer.style.top = pos[1] + 'px';
        if (!this.showSection)
            this.hideUsernamePopUp();
    };
    OtherViewCellCursorSection.prototype.onNewDocumentTopLeft = function (size) {
        this.adjustPopUpPosition();
    };
    OtherViewCellCursorSection.prototype.prepareUsernamePopUp = function () {
        if (this.sectionProperties.popUpContainer === null) {
            var popUpContainer = document.createElement('div');
            popUpContainer.className = 'username-pop-up';
            var nameContainer = document.createElement('div');
            popUpContainer.appendChild(nameContainer);
            var nameParagraph = document.createElement('p');
            nameContainer.appendChild(nameParagraph);
            nameParagraph.textContent = this.sectionProperties.username;
            var arrowDiv = document.createElement('div');
            arrowDiv.className = 'arrow-div';
            popUpContainer.appendChild(arrowDiv);
            popUpContainer.style.backgroundColor = nameContainer.style.backgroundColor = this.sectionProperties.color;
            arrowDiv.style.backgroundColor = nameParagraph.style.backgroundColor = this.sectionProperties.color;
            document.getElementById('document-container').appendChild(popUpContainer);
            this.sectionProperties.popUpContainer = popUpContainer;
            this.hideUsernamePopUp();
        }
    };
    OtherViewCellCursorSection.prototype.clearPopUpTimer = function () {
        if (this.sectionProperties.popUpTimer) {
            clearTimeout(this.sectionProperties.popUpTimer);
            this.sectionProperties.popUpTimer = null;
        }
    };
    OtherViewCellCursorSection.prototype.showUsernamePopUp = function () {
        var _this = this;
        var textCursorSectionName = CursorHeaderSection.namePrefix + this.sectionProperties.viewId;
        if (app.sectionContainer.doesSectionExist(textCursorSectionName))
            return; // Don't show the popup if the cursor header is shown.
        if (this.sectionProperties.popUpContainer && this.isVisible) {
            this.adjustPopUpPosition();
            this.sectionProperties.popUpShown = true;
            this.sectionProperties.popUpContainer.style.display = '';
            this.clearPopUpTimer();
            this.sectionProperties.popUpTimer = setTimeout(function () {
                _this.hideUsernamePopUp();
            }, 3000);
        }
    };
    OtherViewCellCursorSection.prototype.hideUsernamePopUp = function () {
        if (this.sectionProperties.popUpContainer) {
            this.sectionProperties.popUpShown = false;
            if (this.sectionProperties.popUpContainer.style.display !== 'none')
                this.sectionProperties.popUpContainer.style.display = 'none';
        }
        this.clearPopUpTimer();
    };
    OtherViewCellCursorSection.prototype.onDocumentObjectVisibilityChange = function () {
        if (this.sectionProperties.popUpShown && !this.isVisible)
            this.hideUsernamePopUp();
    };
    OtherViewCellCursorSection.addOrUpdateOtherViewCellCursor = function (viewId, username, rectangleData, part) {
        var rectangle = new cool.SimpleRectangle(0, 0, 0, 0);
        if (rectangleData)
            rectangle = new app.definitions.simpleRectangle(parseInt(rectangleData[0]), parseInt(rectangleData[1]), parseInt(rectangleData[2]), parseInt(rectangleData[3]));
        var sectionName = OtherViewCellCursorSection.sectionNamePrefix + viewId;
        var section;
        var newSection = false;
        if (app.sectionContainer.doesSectionExist(sectionName)) {
            section = app.sectionContainer.getSectionWithName(sectionName);
            section.sectionProperties.part = part;
            section.size[0] = rectangle.pWidth;
            section.size[1] = rectangle.pHeight;
            section.setPosition(rectangle.pX1, rectangle.pY1);
        }
        else {
            section = new OtherViewCellCursorSection(viewId, rectangle, part);
            app.sectionContainer.addSection(section);
            OtherViewCellCursorSection.sectionPointers.push(section);
            newSection = true;
        }
        section.sectionProperties.username = username;
        section.prepareUsernamePopUp();
        section.setShowSection(section.checkMyVisibility());
        if (section.showSection && !newSection)
            section.showUsernamePopUp();
        if (!section.showSection)
            section.hideUsernamePopUp();
        app.sectionContainer.requestReDraw();
    };
    OtherViewCellCursorSection.removeView = function (viewId) {
        var sectionName = OtherViewCellCursorSection.sectionNamePrefix + viewId;
        if (app.sectionContainer.doesSectionExist(sectionName)) {
            var section = app.sectionContainer.getSectionWithName(sectionName);
            OtherViewCellCursorSection.sectionPointers.splice(OtherViewCellCursorSection.sectionPointers.indexOf(section), 1);
            app.sectionContainer.removeSection(sectionName);
            app.sectionContainer.requestReDraw();
        }
    };
    OtherViewCellCursorSection.updateVisibilities = function () {
        for (var i = 0; i < OtherViewCellCursorSection.sectionPointers.length; i++) {
            var section = OtherViewCellCursorSection.sectionPointers[i];
            var newState = section.checkMyVisibility();
            if (newState !== section.showSection) {
                section.setShowSection(newState);
                if (newState === false)
                    section.hideUsernamePopUp();
            }
        }
        app.sectionContainer.requestReDraw();
    };
    OtherViewCellCursorSection.closePopups = function () {
        for (var i = 0; i < OtherViewCellCursorSection.sectionPointers.length; i++)
            OtherViewCellCursorSection.sectionPointers[i].hideUsernamePopUp();
    };
    OtherViewCellCursorSection.getViewCursorSection = function (viewId) {
        var name = OtherViewCellCursorSection.sectionNamePrefix + viewId;
        return app.sectionContainer.getSectionWithName(name);
    };
    OtherViewCellCursorSection.doesViewCursorExist = function (viewId) {
        var name = OtherViewCellCursorSection.sectionNamePrefix + viewId;
        return app.sectionContainer.doesSectionExist(name);
    };
    OtherViewCellCursorSection.showPopUpForView = function (viewId) {
        if (OtherViewCellCursorSection.doesViewCursorExist(viewId)) {
            var section = OtherViewCellCursorSection.getViewCursorSection(viewId);
            section.showUsernamePopUp();
        }
    };
    OtherViewCellCursorSection.sectionNamePrefix = 'OtherViewCellCursorSection ';
    OtherViewCellCursorSection.sectionPointers = [];
    return OtherViewCellCursorSection;
}(CanvasSectionObject));
app.definitions.otherViewCellCursorSection = OtherViewCellCursorSection;
//# sourceMappingURL=OtherViewCellCursorSection.js.map