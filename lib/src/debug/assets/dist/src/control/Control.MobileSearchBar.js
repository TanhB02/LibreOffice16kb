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
 * JSDialog.MobileSearchBar - mobile search bar
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
/* global _ _UNO */
var MobileSearchBar = /** @class */ (function (_super) {
    __extends(MobileSearchBar, _super);
    function MobileSearchBar(map) {
        return _super.call(this, map, 'toolbar-search') || this;
    }
    MobileSearchBar.prototype.getToolItems = function () {
        return [
            {
                type: 'customtoolitem',
                id: 'hidesearchbar',
                w2icon: 'unfold',
                text: _('Hide the search bar'),
            },
            { type: 'searchedit', id: 'search', placeholder: _('Search'), text: '' },
            {
                type: 'customtoolitem',
                id: 'searchprev',
                text: _UNO('.uno:UpSearch'),
                enabled: false,
                pressAndHold: true,
            },
            {
                type: 'customtoolitem',
                id: 'searchnext',
                text: _UNO('.uno:DownSearch'),
                enabled: false,
                pressAndHold: true,
            },
            {
                type: 'customtoolitem',
                id: 'cancelsearch',
                text: _('Clear the search field'),
                visible: false,
            },
            { type: 'spacer', id: 'left' },
        ];
    };
    MobileSearchBar.prototype.create = function () {
        var items = this.getToolItems();
        this.builder.build(this.parentContainer, items, undefined);
    };
    return MobileSearchBar;
}(Toolbar));
JSDialog.MobileSearchBar = function (map) {
    return new MobileSearchBar(map);
};
//# sourceMappingURL=Control.MobileSearchBar.js.map