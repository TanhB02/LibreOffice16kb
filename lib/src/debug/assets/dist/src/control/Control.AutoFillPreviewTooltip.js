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
 * Control.AutoFillPreviewTooltip - class for tooltip of cell previews during auto fill
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
/* global app */
var AutoFillPreviewTooltip = /** @class */ (function (_super) {
    __extends(AutoFillPreviewTooltip, _super);
    function AutoFillPreviewTooltip(map) {
        return _super.call(this, 'autoFillPreviewTooltip', map) || this;
    }
    AutoFillPreviewTooltip.prototype.onAdd = function () {
        this.newPopupData.isAutoFillPreviewTooltip = true;
        this.newPopupData.noOverlay = true;
        this.newPopupData.id = 'autoFillPreviewTooltip';
        this.map.on('openautofillpreviewpopup', this.openAutoFillPreviewPopup, this);
        this.map.on('closeautofillpreviewpopup', this.closeAutoFillPreviewPopup, this);
    };
    AutoFillPreviewTooltip.prototype.getSimpleTextJSON = function (cellValue) {
        return {
            id: this.popupId + 'fixedtext',
            type: 'fixedtext',
            text: cellValue,
            enabled: false,
        };
    };
    AutoFillPreviewTooltip.prototype.openAutoFillPreviewPopup = function (ev) {
        // calculate the popup position
        var cellRange = this.map._docLayer._parseCellRange(JSON.stringify(ev.data.celladdress));
        ev.data.celladdress = this.map._docLayer
            ._cellRangeToTwipRect(cellRange)
            .toRectangle();
        ev.data.celladdress = new app.definitions.simplePoint(parseInt(ev.data.celladdress[0]), parseInt(ev.data.celladdress[1]));
        ev.data.celladdress.pX -=
            app.sectionContainer.getDocumentTopLeft()[0] -
                app.sectionContainer.getDocumentAnchor()[0];
        ev.data.celladdress.pY -=
            app.sectionContainer.getDocumentTopLeft()[1] -
                app.sectionContainer.getDocumentAnchor()[1];
        var entry = ev.data.text;
        var data;
        if (entry.length > 0) {
            this.closeAutoFillPreviewPopup();
            var control = this.getSimpleTextJSON(entry);
            if (L.DomUtil.get(this.popupId + 'fixedtext')) {
                data = this.getPopupJSON(control, {
                    x: ev.data.celladdress.cX,
                    y: ev.data.celladdress.cY,
                });
                this.sendUpdate(data);
                return;
            }
            if (L.DomUtil.get(this.popupId))
                this.closeAutoFillPreviewPopup();
            data = Object.assign({}, this.newPopupData);
            data.children[0].children[0] = control;
        }
        // add position
        data.posx = ev.data.celladdress.cX;
        data.posy = ev.data.celladdress.cY;
        this.sendJSON(data);
    };
    AutoFillPreviewTooltip.prototype.closeAutoFillPreviewPopup = function () {
        _super.prototype.closePopup.call(this);
    };
    return AutoFillPreviewTooltip;
}(L.Control.AutoCompletePopup));
L.control.autofillpreviewtooltip = function (map) {
    return new AutoFillPreviewTooltip(map);
};
//# sourceMappingURL=Control.AutoFillPreviewTooltip.js.map