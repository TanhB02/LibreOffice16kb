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
 * Control.SidebarBase
 */
var SidebarType;
(function (SidebarType) {
    SidebarType["Sidebar"] = "sidebar";
    SidebarType["Navigator"] = "navigator";
})(SidebarType || (SidebarType = {}));
var SidebarBase = /** @class */ (function () {
    function SidebarBase(map, options /* Default speed: to be used on load */, type) {
        if (options === void 0) { options = {
            animSpeed: 1000,
        }; }
        this.type = type;
        this.options = options;
        this.onAdd(map);
    }
    SidebarBase.prototype.onAdd = function (map) {
        this.map = map;
        app.events.on('resize', this.onResize.bind(this));
        this.builder = new L.control.jsDialogBuilder({
            mobileWizard: this,
            map: map,
            cssClass: "jsdialog sidebar", // use sidebar css for now, maybe have seperate css for navigator later
        });
        this.container = L.DomUtil.create('div', this.type + "-container", $("#" + this.type + "-panel").get(0));
        this.wrapper = document.getElementById(this.type + "-dock-wrapper");
        this.documentContainer = document.querySelector('#document-container');
        this.map.on('jsdialogupdate', this.onJSUpdate, this);
        this.map.on('jsdialogaction', this.onJSAction, this);
    };
    SidebarBase.prototype.onRemove = function () {
        this.map.off('jsdialogupdate', this.onJSUpdate, this);
        this.map.off('jsdialogaction', this.onJSAction, this);
    };
    SidebarBase.prototype.isVisible = function () {
        return $("#" + this.type + "-dock-wrapper").hasClass('visible');
    };
    SidebarBase.prototype.closeSidebar = function () {
        $("#" + this.type + "-dock-wrapper").removeClass('visible');
        if (!this.map.editorHasFocus()) {
            this.map.fire('editorgotfocus');
            this.map.focus();
        }
        var upperCaseType = this.type[0].toUpperCase() + this.type.slice(1);
        this.map.uiManager.setDocTypePref('Show' + upperCaseType, false);
    };
    SidebarBase.prototype.onJSUpdate = function (e) {
        var data = e.data;
        if (data.jsontype !== this.type)
            return;
        if (!this.container)
            return;
        if (!this.builder)
            return;
        // reduce unwanted warnings in console
        if (data.control.id === 'addonimage') {
            window.app.console.log('Ignored update for control: ' + data.control.id);
            return;
        }
        this.builder.updateWidget(this.container, data.control);
    };
    SidebarBase.prototype.onJSAction = function (e) {
        var data = e.data;
        if (data.jsontype !== this.type)
            return;
        if (!this.builder)
            return;
        if (!this.container)
            return;
        var innerData = data.data;
        if (!innerData)
            return;
        var controlId = innerData.control_id;
        // Panels share the same name for main containers, do not execute actions for them
        // if panel has to be shown or hidden, full update will appear
        if (controlId.indexOf('contents') === 0 ||
            controlId.indexOf('titlebar') === 0 ||
            controlId.indexOf('expander') === 0 ||
            controlId.indexOf('addonimage') === 0) {
            window.app.console.log('Ignored action: ' +
                innerData.action_type +
                ' for control: ' +
                controlId);
            return;
        }
        this.builder.executeAction(this.container, innerData);
    };
    SidebarBase.prototype.markNavigatorTreeView = function (data) {
        if (!data)
            return false;
        if (data.type === 'treelistbox') {
            data.draggable = false;
            return true;
        }
        for (var i in data.children) {
            if (this.markNavigatorTreeView(data.children[i])) {
                return true;
            }
        }
        return false;
    };
    SidebarBase.prototype.onResize = function () {
        this.wrapper.style.maxHeight =
            this.documentContainer.getBoundingClientRect().height + 'px';
    };
    return SidebarBase;
}());
JSDialog.SidebarBase = SidebarBase;
//# sourceMappingURL=Control.SidebarBase.js.map