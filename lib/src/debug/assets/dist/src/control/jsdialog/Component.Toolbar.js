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
var Toolbar = /** @class */ (function () {
    function Toolbar(map, toolbarElementId) {
        this.map = map;
        this.docType = map.getDocType();
        this.customItems = [];
        this.toolbarElementId = toolbarElementId;
        this.builder = new L.control.jsDialogBuilder({
            mobileWizard: this,
            map: this.map,
            cssClass: 'jsdialog',
            noLabelsForUnoButtons: true,
            callback: this.callback ? this.callback.bind(this) : undefined,
        });
        this.reset();
        this.create();
        this.updateVisibilityForToolbar('');
    }
    Toolbar.prototype.getToolItems = function () {
        return [];
    };
    Toolbar.prototype.reset = function () {
        this.parentContainer = L.DomUtil.get(this.toolbarElementId);
        // In case it contains garbage
        if (this.parentContainer)
            this.parentContainer.replaceChildren();
        L.DomUtil.addClass(this.parentContainer, 'ui-toolbar');
    };
    Toolbar.prototype.create = function () {
        this.reset();
        var items = this.getToolItems();
        this.builder.build(this.parentContainer, items, undefined);
        JSDialog.MakeScrollable(this.parentContainer, this.parentContainer.querySelector('div'));
        JSDialog.RefreshScrollables();
        if (this.map.isRestrictedUser()) {
            for (var i = 0; i < items.length; i++) {
                var it = items[i];
                var item = $('#' + it.id)[0];
                this.map.hideRestrictedItems(it, item, item);
            }
        }
        if (this.map.isLockedUser()) {
            for (var i = 0; i < items.length; i++) {
                var it = items[i];
                var item = $('#' + it.id)[0];
                this.map.disableLockedItem(it, item, item);
            }
        }
    };
    Toolbar.prototype.hasItem = function (id) {
        return (this.getToolItems().filter(function (item) {
            return item.id === id;
        }).length > 0);
    };
    Toolbar.prototype.insertItem = function (beforeId, items) {
        this.customItems.push({ beforeId: beforeId, items: items });
        this.create();
    };
    Toolbar.prototype.showItem = function (command, show) {
        if (!command)
            return;
        this.builder.executeAction(this.parentContainer, {
            control_id: command,
            control: { id: command },
            action_type: show ? 'show' : 'hide',
        });
        JSDialog.RefreshScrollables();
    };
    Toolbar.prototype.enableItem = function (command, enable) {
        if (!command)
            return;
        this.builder.executeAction(this.parentContainer, {
            control_id: command,
            action_type: enable ? 'enable' : 'disable',
        });
    };
    Toolbar.prototype.selectItem = function (command, select) {
        if (!command)
            return;
        this.builder.executeAction(this.parentContainer, {
            control_id: command,
            action_type: select ? 'select' : 'unselect',
        });
    };
    Toolbar.prototype.updateItem = function (data) {
        this.builder.updateWidget(this.parentContainer, data);
        this.updateVisibilityForToolbar('');
        JSDialog.RefreshScrollables();
    };
    Toolbar.prototype.updateVisibilityForToolbar = function (context) {
        var _this = this;
        var toShow = [];
        var toHide = [];
        var items = this.getToolItems();
        items.forEach(function (item) {
            if (window.ThisIsTheiOSApp &&
                window.mode.isTablet() &&
                item.iosapptablet === false) {
                toHide.push(item.id);
            }
            else if (((window.mode.isMobile() && item.mobile === false) ||
                (window.mode.isTablet() && item.tablet === false) ||
                (window.mode.isDesktop() && item.desktop === false) ||
                (!window.ThisIsAMobileApp &&
                    item.mobilebrowser === false)) &&
                !item.hidden) {
                toHide.push(item.id);
            }
            else if (((window.mode.isMobile() && item.mobile === true) ||
                (window.mode.isTablet() && item.tablet === true) ||
                (window.mode.isDesktop() && item.desktop === true) ||
                (window.ThisIsAMobileApp && item.mobilebrowser === true)) &&
                item.hidden) {
                toShow.push(item.id);
            }
            if (context && item.context) {
                if (item.context.indexOf(context) >= 0)
                    toShow.push(item.id);
                else
                    toHide.push(item.id);
            }
            else if (!context && item.context) {
                if (item.context.indexOf('default') >= 0)
                    toShow.push(item.id);
                else
                    toHide.push(item.id);
            }
        });
        window.app.console.log('explicitly hiding: ' + toHide);
        window.app.console.log('explicitly showing: ' + toShow);
        toHide.forEach(function (item) {
            _this.showItem(item, false);
        });
        toShow.forEach(function (item) {
            _this.showItem(item, true);
        });
    };
    return Toolbar;
}());
JSDialog.Toolbar = Toolbar;
//# sourceMappingURL=Component.Toolbar.js.map