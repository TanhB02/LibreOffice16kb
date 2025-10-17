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
var EditWidget = /** @class */ (function () {
    function EditWidget(parentContainer, data, builder, callback) {
        this.parentContainer = parentContainer;
        this.data = data;
        this.builder = builder;
        this.callback = callback;
    }
    EditWidget.buildImpl = function (parentContainer, data, builder) {
        var result = { container: null, input: null };
        var container = L.DomUtil.create('div', 'ui-edit-container ' + builder.options.cssClass, parentContainer);
        container.id = data.id;
        result.container = container;
        var edit = L.DomUtil.create('input', 'ui-edit ' + builder.options.cssClass, container);
        edit.value = data.text;
        edit.id = data.id + '-input';
        edit.dir = 'auto';
        edit.setAttribute('autocomplete', 'off');
        result.input = edit;
        if (data.password === true)
            edit.type = 'password';
        if (data.enabled === false) {
            container.setAttribute('disabled', 'true');
            edit.disabled = true;
        }
        JSDialog.SynchronizeDisabledState(container, [edit]);
        if (data.hidden)
            $(edit).hide();
        if (data.placeholder) {
            edit.setAttribute('placeholder', data.placeholder);
            edit.setAttribute('aria-label', data.placeholder);
        }
        return result;
    };
    EditWidget.prototype.onKeyUp = function (e) {
        var callbackToUse = e.key === 'Enter' && this.data.changedCallback
            ? this.data.changedCallback
            : null;
        if (this.callback)
            callbackToUse = this.callback;
        if (typeof callbackToUse === 'function')
            callbackToUse(this.edit.input.value);
        else
            this.builder.callback('edit', 'change', this.edit.container, this.edit.input.value, this.builder);
    };
    EditWidget.prototype.onClick = function (e) {
        e.stopPropagation();
    };
    EditWidget.prototype.setupEventListeners = function () {
        this.edit.input.addEventListener('keyup', this.onKeyUp.bind(this));
        this.edit.input.addEventListener('click', this.onClick.bind(this));
    };
    EditWidget.prototype.build = function () {
        this.edit = EditWidget.buildImpl(this.parentContainer, this.data, this.builder);
        this.setupEventListeners();
        return false;
    };
    return EditWidget;
}());
JSDialog.edit = function (parentContainer, data, builder, callback) {
    var widget = new EditWidget(parentContainer, data, builder, callback);
    return widget.build();
};
//# sourceMappingURL=Widget.Edit.js.map