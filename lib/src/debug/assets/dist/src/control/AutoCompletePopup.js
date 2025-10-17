// @ts-strict-ignore
/* -*- js-indent-level: 8 -*- */
/*
 * Copyright the Collabora Online contributors.
 *
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/*
 * AutoCompletePopup - base class for mention, formula auto complete, auto fill popup and auto fill preview popup
 */
var AutoCompletePopup = /** @class */ (function () {
    function AutoCompletePopup(popupId, map) {
        this.map = map;
        this.popupId = popupId;
        this.newPopupData = {
            children: [
                {
                    id: 'container',
                    type: 'container',
                    enabled: true,
                    children: new Array(),
                    vertical: true,
                },
            ],
            jsontype: 'dialog',
            type: 'modalpopup',
            cancellable: true,
            popupParent: '_POPOVER_',
            clickToClose: '_POPOVER_',
            id: this.popupId,
            persistKeyboard: true,
        };
        this.isMobile = window.mode.isMobile();
        this.onAdd();
        this.map.on('closepopup', this.closePopup, this);
    }
    AutoCompletePopup.prototype.closePopup = function () {
        var popupExists = L.DomUtil.get(this.popupId);
        if (!popupExists)
            return;
        this.map.jsdialog.focusToLastElement(this.popupId);
        this.map.jsdialog.clearDialog(this.popupId);
    };
    AutoCompletePopup.prototype.getPopupJSON = function (control, framePos) {
        return {
            jsontype: 'dialog',
            id: this.popupId,
            action: 'update',
            control: control,
            posx: framePos.x,
            posy: framePos.y,
            children: undefined,
        };
    };
    AutoCompletePopup.prototype.getTreeJSON = function () {
        return {
            id: this.popupId + 'List',
            type: 'treelistbox',
            text: '',
            enabled: true,
            singleclickactivate: false,
            fireKeyEvents: true,
            entries: [],
        };
    };
    AutoCompletePopup.prototype.sendUpdate = function (data) {
        this.map.fire('jsdialogupdate', {
            data: data,
            callback: this.callback.bind(this),
        });
    };
    AutoCompletePopup.prototype.sendJSON = function (data) {
        var fireEvent = this.isMobile ? 'mobilewizard' : 'jsdialog';
        this.map.fire(fireEvent, {
            data: data,
            callback: this.callback.bind(this),
        });
    };
    AutoCompletePopup.prototype.getCursorPosition = function () {
        var commentSection = app.sectionContainer.getSectionWithName(L.CSections.CommentList.name);
        if (commentSection === null || commentSection === void 0 ? void 0 : commentSection.getActiveEdit()) {
            var caretRect = window
                .getSelection()
                .getRangeAt(0)
                .getBoundingClientRect();
            var mapRect = this.map._container.getBoundingClientRect();
            return new L.Point(caretRect.left - mapRect.left, caretRect.bottom - mapRect.top);
        }
        var currPos = {
            x: app.file.textCursor.rectangle.cX1,
            y: app.file.textCursor.rectangle.cY2,
        };
        var origin = this.map.getPixelOrigin();
        var panePos = this.map._getMapPanePos();
        return new L.Point(Math.round(currPos.x + panePos.x - origin.x), Math.round(currPos.y + panePos.y - origin.y));
    };
    AutoCompletePopup.prototype.openPopup = function (ev) {
        var entries = this.getPopupEntries(ev);
        if (entries.length === 0)
            return;
        var cursorPos = this.getCursorPosition();
        var control = this.getTreeJSON();
        if (L.DomUtil.get(this.popupId + 'List')) {
            var data_1 = this.getPopupJSON(control, cursorPos);
            data_1.control.entries = entries;
            this.sendUpdate(data_1);
            return;
        }
        if (L.DomUtil.get(this.popupId))
            this.closePopup();
        var data = this.newPopupData;
        data.children[0].children[0] = control;
        data.children[0].children[0].entries = entries;
        var isSpreadsheetRTL = this.map._docLayer.isCalcRTL();
        var canvasEl = this.map._docLayer._canvas.getBoundingClientRect();
        var offsetX = isSpreadsheetRTL
            ? 0
            : app.sectionContainer.getSectionWithName(L.CSections.RowHeader.name)
                .size[0];
        var offsetY = app.sectionContainer.getSectionWithName(L.CSections.ColumnHeader.name).size[1];
        if (isSpreadsheetRTL)
            cursorPos.x = this.map._size.x - cursorPos.x;
        data.posx = cursorPos.x + offsetX + canvasEl.left;
        data.posy = cursorPos.y + offsetY + canvasEl.top;
        this.sendJSON(data);
    };
    AutoCompletePopup.prototype.getPopupId = function () {
        return this.popupId;
    };
    AutoCompletePopup.prototype.callback = function (objectType, eventType, object, index) {
        if (eventType === 'keydown') {
            if (object.key !== 'Tab' && object.key !== 'Shift') {
                this.map.focus();
                return true;
            }
        }
        return false;
    };
    return AutoCompletePopup;
}());
L.Control.AutoCompletePopup = AutoCompletePopup;
//# sourceMappingURL=AutoCompletePopup.js.map