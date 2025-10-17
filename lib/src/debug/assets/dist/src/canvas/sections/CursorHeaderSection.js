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
var CursorHeaderSection = /** @class */ (function (_super) {
    __extends(CursorHeaderSection, _super);
    function CursorHeaderSection(viewId, username, documentPosition, color) {
        var _this = _super.call(this, CursorHeaderSection.namePrefix + viewId, null, null, documentPosition) || this;
        _this.sectionProperties.deletionTimeout = null;
        _this.sectionProperties.viewId = viewId;
        _this.sectionProperties.color = color;
        _this.sectionProperties.username = username;
        var div = _this.getHTMLObject();
        div.textContent = username;
        div.style.color = 'white';
        div.style.backgroundColor = color;
        return _this;
    }
    CursorHeaderSection.prototype.deleteThis = function (force) {
        var _this = this;
        if (force === void 0) { force = false; }
        if (this.sectionProperties.deletionTimeout)
            clearTimeout(this.sectionProperties.deletionTimeout);
        this.sectionProperties.deletionTimeout = setTimeout(function () {
            app.sectionContainer.removeSection(_this.name);
        }, (force ? 10 : CursorHeaderSection.duration));
    };
    // This section is for text cursor username popups in Calc. When we want to remove the popup before it times out, we use this function.
    CursorHeaderSection.deletePopUpNow = function (viewId) {
        // If cursor header is also shown, delete it.
        var name = CursorHeaderSection.namePrefix + viewId;
        if (app.sectionContainer.doesSectionExist(name)) {
            var section = app.sectionContainer.getSectionWithName(name);
            section.deleteThis(true);
        }
    };
    CursorHeaderSection.showCursorHeader = function (viewId, username, documentPosition, color) {
        var sectionName = CursorHeaderSection.namePrefix + viewId;
        var section;
        if (viewId && !username) { // This should be an update, section should exist.
            section = app.sectionContainer.getSectionWithName(sectionName);
            if (section)
                section.deleteThis();
        }
        else {
            section = app.sectionContainer.getSectionWithName(sectionName);
            if (!section) {
                section = new CursorHeaderSection(viewId, username, documentPosition, color);
                app.sectionContainer.addSection(section);
            }
            section.setPosition(documentPosition.pX, documentPosition.pY);
            section.deleteThis();
        }
        // If this is calc and cell cursor username popup is shown, hide it.
        if (app.map._docLayer._docType === 'spreadsheet') {
            var cellCursorSection = OtherViewCellCursorSection.getViewCursorSection(viewId);
            if (cellCursorSection)
                cellCursorSection.hideUsernamePopUp();
        }
    };
    CursorHeaderSection.namePrefix = 'CursorHeader ';
    CursorHeaderSection.duration = 3000;
    return CursorHeaderSection;
}(HTMLObjectSection));
app.definitions.cursorHeaderSection = CursorHeaderSection;
//# sourceMappingURL=CursorHeaderSection.js.map