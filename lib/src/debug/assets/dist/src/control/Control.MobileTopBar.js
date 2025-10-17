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
 * JSDialog.MobileTopBar - component of top bar on mobile
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
var MobileTopBar = /** @class */ (function (_super) {
    __extends(MobileTopBar, _super);
    function MobileTopBar(map) {
        var _this = _super.call(this, map, 'toolbar-up') || this;
        app.events.on('updatepermission', _this.onUpdatePermission.bind(_this));
        map.on('commandstatechanged', _this.onCommandStateChanged, _this);
        return _this;
    }
    MobileTopBar.prototype.getToolItems = function () {
        if (this.docType == 'text') {
            return [
                { type: 'toolitem', id: 'signstatus', command: '.uno:Signature', w2icon: '', text: _UNO('.uno:Signature'), visible: false },
                { type: 'toolitem', id: 'undo', text: _UNO('.uno:Undo'), command: '.uno:Undo', enabled: false },
                { type: 'toolitem', id: 'redo', text: _UNO('.uno:Redo'), command: '.uno:Redo', enabled: false },
                { type: 'spacer', id: 'before-permissionmode' },
                this._generateHtmlItem('permissionmode'),
                { type: 'spacer', id: 'after-permissionmode' },
                { type: 'customtoolitem', id: 'mobile_wizard', command: 'mobile_wizard' },
                { type: 'customtoolitem', id: 'insertion_mobile_wizard', command: 'insertion_mobile_wizard' },
                { type: 'customtoolitem', id: 'comment_wizard', command: 'comment_wizard', w2icon: 'viewcomments' },
                { type: 'menubutton', id: 'userlist:UsersListMenu', visible: false },
            ];
        }
        else if (this.docType == 'spreadsheet') {
            return [
                { type: 'toolitem', id: 'signstatus', command: '.uno:Signature', w2icon: '', text: _UNO('.uno:Signature'), visible: false },
                { type: 'toolitem', id: 'undo', text: _UNO('.uno:Undo'), command: '.uno:Undo', enabled: false },
                { type: 'toolitem', id: 'redo', text: _UNO('.uno:Redo'), command: '.uno:Redo', enabled: false },
                { type: 'customtoolitem', visible: false, id: 'acceptformula', command: 'acceptformula', text: _('Accept') },
                { type: 'customtoolitem', visible: false, id: 'cancelformula', command: 'cancelformula', text: _('Cancel') },
                { type: 'spacer', id: 'before-PermissionMode' },
                this._generateHtmlItem('permissionmode'),
                { type: 'spacer', id: 'after-PermissionMode' },
                { type: 'customtoolitem', id: 'mobile_wizard', command: 'mobile_wizard' },
                { type: 'customtoolitem', id: 'insertion_mobile_wizard', command: 'insertion_mobile_wizard' },
                { type: 'customtoolitem', id: 'comment_wizard', command: 'comment_wizard', w2icon: 'viewcomments' },
                { type: 'menubutton', id: 'userlist:UsersListMenu', visible: false },
            ];
        }
        else if (this.docType == 'presentation') {
            return [
                { type: 'toolitem', id: 'signstatus', command: '.uno:Signature', w2icon: '', text: _UNO('.uno:Signature'), visible: false },
                { type: 'toolitem', id: 'undo', text: _UNO('.uno:Undo'), command: '.uno:Undo', enabled: false },
                { type: 'toolitem', id: 'redo', text: _UNO('.uno:Redo'), command: '.uno:Redo', enabled: false },
                { type: 'spacer', id: 'before-permissionmode' },
                this._generateHtmlItem('permissionmode'),
                { type: 'spacer', id: 'after-permissionmode' },
                { type: 'customtoolitem', id: 'mobile_wizard', command: 'mobile_wizard' },
                { type: 'customtoolitem', id: 'insertion_mobile_wizard', command: 'insertion_mobile_wizard' },
                { type: 'customtoolitem', id: 'comment_wizard', command: 'comment_wizard', w2icon: 'viewcomments' },
                { type: 'customtoolitem', id: 'fullscreen-' + this.docType, text: _UNO('.uno:FullScreen', this.docType) },
                { type: 'menubutton', id: 'userlist:UsersListMenu', visible: false },
            ];
        }
        else if (this.docType == 'drawing') {
            return [
                { type: 'toolitem', id: 'signstatus', command: '.uno:Signature', w2icon: '', text: _UNO('.uno:Signature'), visible: false },
                { type: 'toolitem', id: 'undo', text: _UNO('.uno:Undo'), command: '.uno:Undo', enabled: false },
                { type: 'toolitem', id: 'redo', text: _UNO('.uno:Redo'), command: '.uno:Redo', enabled: false },
                { type: 'spacer', id: 'before-PermissionMode' },
                this._generateHtmlItem('permissionmode'),
                { type: 'spacer', id: 'after-PermissionMode' },
                { type: 'customtoolitem', id: 'mobile_wizard', command: 'mobile_wizard' },
                { type: 'customtoolitem', id: 'insertion_mobile_wizard', command: 'insertion_mobile_wizard' },
                { type: 'customtoolitem', id: 'comment_wizard', command: 'comment_wizard', w2icon: 'viewcomments' },
                { type: 'menubutton', id: 'userlist:UsersListMenu', visible: false },
            ];
        }
    };
    MobileTopBar.prototype.create = function () {
        var items = this.getToolItems();
        this.builder.build(this.parentContainer, items);
    };
    MobileTopBar.prototype.onUpdatePermission = function (e) {
        var _this = this;
        var toolbarButtons = ['undo', 'redo', 'mobile_wizard', 'insertion_mobile_wizard', 'comment_wizard'];
        if (e.detail.perm === 'edit') {
            toolbarButtons.forEach(function (id) {
                _this.showItem(id, true);
            });
            this.showItem('PermissionMode', false);
        }
        else {
            toolbarButtons.forEach(function (id) {
                _this.showItem(id, false);
            });
            this.showItem('comment_wizard', true);
            if ($('#mobile-edit-button').is(':hidden')) {
                this.showItem('PermissionMode', true);
            }
        }
    };
    MobileTopBar.prototype.onCommandStateChanged = function (e) {
        var commandName = e.commandName;
        var state = e.state;
        if (this.map.isEditMode() && (state === 'enabled' || state === 'disabled')) {
            var id = window.unoCmdToToolbarId(commandName);
            if (state === 'enabled') {
                this.enableItem(id, true);
            }
            else {
                //this.uncheck(id);
                this.enableItem(id, false);
            }
        }
    };
    MobileTopBar.prototype._generateHtmlItem = function (id) {
        var isReadOnlyMode = app.map ? app.isReadOnly() : true;
        var canUserWrite = !app.isReadOnly();
        return {
            type: 'container',
            id: id + '-container',
            children: [
                { type: 'htmlcontent', id: id, htmlId: id, text: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp', isReadOnlyMode: isReadOnlyMode, canUserWrite: canUserWrite, visible: false },
                { type: 'spacer', id: id + '-break' }
            ],
            vertical: false,
        };
    };
    return MobileTopBar;
}(JSDialog.Toolbar));
JSDialog.MobileTopBar = function (map) {
    return new MobileTopBar(map);
};
//# sourceMappingURL=Control.MobileTopBar.js.map