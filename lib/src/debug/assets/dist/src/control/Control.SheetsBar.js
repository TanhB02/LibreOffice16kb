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
 * Control.SheetsBar - toolbar with buttons for scrolling tabs
 */
/* global _ JSDialog app */
var SheetsBar = /** @class */ (function () {
    function SheetsBar(map, showNavigation) {
        if (showNavigation === void 0) { showNavigation = true; }
        this.showNavigation = showNavigation;
        this.onAdd(map);
    }
    SheetsBar.prototype.onAdd = function (map) {
        this.map = map;
        this.parentContainer = L.DomUtil.get('spreadsheet-toolbar');
        this.builder = new L.control.jsDialogBuilder({
            mobileWizard: this,
            map: this.map,
            cssClass: 'jsdialog'
        });
        this.create();
        map.on('doclayerinit', this.onDocLayerInit, this);
        app.events.on('updatepermission', this.onUpdatePermission.bind(this));
    };
    SheetsBar.prototype.create = function () {
        var data = [
            {
                id: 'sheets-buttons-toolbox',
                type: 'toolbox',
                children: [
                    {
                        id: 'firstrecord',
                        type: 'customtoolitem',
                        text: _('Scroll to the first sheet'),
                        command: 'firstrecord',
                        visible: this.showNavigation
                    },
                    {
                        id: 'prevrecord',
                        type: 'customtoolitem',
                        text: _('Scroll left'),
                        command: 'prevrecord',
                        visible: this.showNavigation,
                        pressAndHold: true
                    },
                    {
                        id: 'nextrecord',
                        type: 'customtoolitem',
                        text: _('Scroll right'),
                        command: 'nextrecord',
                        visible: this.showNavigation,
                        pressAndHold: true
                    },
                    {
                        id: 'lastrecord',
                        type: 'customtoolitem',
                        text: _('Scroll to the last sheet'),
                        command: 'lastrecord',
                        visible: this.showNavigation
                    },
                    {
                        id: 'insertsheet',
                        type: 'customtoolitem',
                        text: _('Insert sheet'),
                        command: 'insertsheet'
                    }
                ]
            }
        ];
        this.parentContainer.replaceChildren();
        this.builder.build(this.parentContainer, data);
    };
    SheetsBar.prototype.onDocLayerInit = function () {
        var docType = this.map.getDocType();
        if (docType == 'spreadsheet') {
            if (!window.mode.isMobile()) {
                this.show();
            }
        }
    };
    SheetsBar.prototype.onUpdatePermission = function (e) {
        if (e.detail.perm === 'edit') {
            this.enableInsertion(true);
        }
        else {
            this.enableInsertion(false);
        }
    };
    SheetsBar.prototype.enableInsertion = function (enable) {
        this.builder.executeAction(this.parentContainer, {
            'control_id': 'insertsheet',
            'action_type': enable ? 'enable' : 'disable'
        });
    };
    SheetsBar.prototype.show = function () {
        this.parentContainer.style.display = 'grid';
    };
    SheetsBar.prototype.hide = function () {
        this.parentContainer.style.display = 'none';
    };
    return SheetsBar;
}());
JSDialog.SheetsBar = function (map, showNavigation) {
    return new SheetsBar(map, showNavigation);
};
//# sourceMappingURL=Control.SheetsBar.js.map