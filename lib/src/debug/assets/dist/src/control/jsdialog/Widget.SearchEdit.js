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
var SearchEditWidget = /** @class */ (function (_super) {
    __extends(SearchEditWidget, _super);
    function SearchEditWidget(parentContainer, data, builder, callback) {
        return _super.call(this, parentContainer, data, builder, callback) || this;
    }
    SearchEditWidget.prototype.onSearchInput = function () {
        this.updateSearchButtons();
        if (L.Map.THIS.getDocType() === 'text') {
            // perform the immediate search in Writer
            app.searchService.search(this.edit.input.value, false, '', 0, true /* expand search */);
        }
    };
    SearchEditWidget.prototype.onSearchKeyDown = function (e) {
        var entry = this.edit.input;
        if ((e.keyCode === 71 && e.ctrlKey) ||
            e.keyCode === 114 ||
            e.keyCode === 13) {
            if (e.shiftKey) {
                app.searchService.search(entry.value, true);
            }
            else {
                app.searchService.search(entry.value);
            }
            e.preventDefault();
        }
        else if (e.ctrlKey && e.keyCode === 70) {
            entry.focus();
            entry.select();
            e.preventDefault();
        }
        else if (e.keyCode === 27) {
            L.Map.THIS.cancelSearch();
        }
    };
    SearchEditWidget.prototype.onSearchFocus = function () {
        L.Map.THIS.fire('searchstart');
        this.updateSearchButtons();
    };
    SearchEditWidget.prototype.onSearchBlur = function () {
        L.Map.THIS._onGotFocus();
    };
    SearchEditWidget.prototype.updateSearchButtons = function () {
        var toolbar = window.mode.isMobile()
            ? app.map.mobileSearchBar
            : app.map.statusBar;
        if (!toolbar) {
            console.debug('Cannot find search bar');
            return;
        }
        // conditionally disabling until, we find a solution for tdf#108577
        if (this.edit.input.value === '') {
            toolbar.enableItem('searchprev', false);
            toolbar.enableItem('searchnext', false);
            toolbar.showItem('cancelsearch', false);
        }
        else {
            toolbar.enableItem('searchprev', true);
            toolbar.enableItem('searchnext', true);
            toolbar.showItem('cancelsearch', true);
        }
    };
    SearchEditWidget.prototype.setupEventListeners = function () {
        _super.prototype.setupEventListeners.call(this);
        this.edit.input.addEventListener('input', this.onSearchInput.bind(this));
        this.edit.input.addEventListener('keydown', this.onSearchKeyDown.bind(this));
        this.edit.input.addEventListener('focus', this.onSearchFocus.bind(this));
        this.edit.input.addEventListener('blur', this.onSearchBlur.bind(this));
    };
    return SearchEditWidget;
}(EditWidget));
JSDialog.searchEdit = function (parentContainer, data, builder, callback) {
    var widget = new SearchEditWidget(parentContainer, data, builder, callback);
    return widget.build();
};
//# sourceMappingURL=Widget.SearchEdit.js.map