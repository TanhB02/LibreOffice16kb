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
 * Control.FormulaUsagePopup
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
var FormulaUsagePopup = /** @class */ (function (_super) {
    __extends(FormulaUsagePopup, _super);
    function FormulaUsagePopup(map) {
        var _this = _super.call(this, 'formulausagePopup', map) || this;
        _this.newPopupData = {
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
            type: 'dialog',
            cancellable: true,
            hasClose: false,
            isAutoCompletePopup: true,
            popupParent: undefined,
            clickToClose: undefined,
            id: 'formulausagePopup',
            title: '', // no titlebar
        };
        return _this;
    }
    FormulaUsagePopup.prototype.onAdd = function () {
        this.newPopupData.isAutoCompletePopup = true;
        this.map.on('openformulausagepopup', this.openFormulaUsagePopup, this);
        this.map.on('sendformulausagetext', this.sendFormulaUsageText, this);
    };
    FormulaUsagePopup.prototype.openFormulaUsagePopup = function (ev) {
        this.openPopup({ data: ev });
        this.map.focus();
    };
    FormulaUsagePopup.prototype.sendFormulaUsageText = function (ev) {
        this.openFormulaUsagePopup(ev);
    };
    FormulaUsagePopup.prototype.getPopupEntries = function (ev) {
        this.usageText = ev.data.data;
        var chIndex = this.usageText.indexOf(':');
        var functionUsage = this.usageText.substring(0, chIndex);
        var usageDescription = this.usageText.substring(chIndex + 1);
        var entries = [
            {
                row: 0,
                columns: [{ text: functionUsage }],
                collapsed: false,
                children: [{ row: 1, columns: [{ text: usageDescription }] }],
            },
        ];
        return entries;
    };
    FormulaUsagePopup.prototype.callback = function (objectType, eventType, object, index) {
        if (eventType === 'close') {
            this.closePopup();
        }
        return false;
    };
    return FormulaUsagePopup;
}(L.Control.AutoCompletePopup));
L.control.formulausage = function (map) {
    return new FormulaUsagePopup(map);
};
//# sourceMappingURL=Control.FormulaUsagePopup.js.map