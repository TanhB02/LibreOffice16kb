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
var AddressInputField = /** @class */ (function () {
    function AddressInputField(map) {
        this.map = map;
        this.parentContainer = L.DomUtil.get('addressInput');
        this.map.on('jsdialogupdate', this.onJSUpdate, this);
        this.map.on('jsdialogaction', this.onJSAction, this);
        this.map.on('doclayerinit', this.onDocLayerInit, this);
        this.map.on('celladdress', this.onCellAddress, this);
        this.builder = new L.control.jsDialogBuilder({
            mobileWizard: this,
            map: this.map,
            cssClass: 'addressInput jsdialog',
            windowId: -4,
        });
        this.createAddressInputField();
    }
    AddressInputField.prototype.onRemove = function () {
        this.map.off('jsdialogupdate', this.onJSUpdate, this);
        this.map.off('jsdialogaction', this.onJSAction, this);
        this.map.off('doclayerinit', this.onDocLayerInit, this);
        this.map.off('celladdress', this.onCellAddress, this);
    };
    AddressInputField.prototype.onCellAddress = function (event) {
        var addressInput = document.querySelector('#addressInput input');
        if (addressInput && document.activeElement !== addressInput) {
            // if the user is not editing the address field
            addressInput.value = event.address;
            addressInput.setAttribute('aria-label', event.address);
        }
        this.map.formulabarSetDirty();
    };
    AddressInputField.prototype.createAddressInputField = function () {
        var data = [
            {
                id: 'pos_window',
                type: 'combobox',
                text: _('cell address'),
                enabled: true,
                changeOnEnterOnly: true,
                focusMapOnEnter: true,
                children: [
                    {
                        id: 'expand',
                        type: 'pushbutton',
                        text: '',
                        symbol: 'SPIN_DOWN',
                    },
                    {
                        id: '',
                        type: 'edit',
                        text: '',
                        enabled: true,
                    },
                    {
                        id: '',
                        type: 'borderwindow',
                        text: '',
                        enabled: true,
                        children: [
                            {
                                type: 'edit',
                                id: '',
                                text: '',
                                enabled: true,
                            },
                        ],
                    },
                ],
                selectedEntries: [],
                selectedCount: 0,
            },
        ];
        this.parentContainer.replaceChildren();
        this.builder.build(this.parentContainer, data);
    };
    AddressInputField.prototype.onJSUpdate = function (e) {
        var data = e === null || e === void 0 ? void 0 : e.data;
        if (data.jsontype !== 'addressinputfield')
            return;
        // we don't want to send change event on every keypress,
        // otherwise core will keep on adding new named range on every keypress.
        // we want to create a named range only when user presses the 'Enter' key.
        data.control.changeOnEnterOnly = true;
        data.control.focusMapOnEnter = true;
        this.builder.updateWidget(this.parentContainer, data.control);
    };
    AddressInputField.prototype.onDocLayerInit = function () {
        var docType = this.map.getDocType();
        if (docType == 'spreadsheet' && this.parentContainer) {
            this.parentContainer.style.setProperty('display', 'table-cell');
        }
    };
    AddressInputField.prototype.onJSAction = function (e) {
        var data = e.data;
        if (data.jsontype !== 'addressinputfield')
            return;
        var innerData = data === null || data === void 0 ? void 0 : data.data;
        this.builder.executeAction(this.parentContainer, innerData);
    };
    return AddressInputField;
}());
JSDialog.AddressInputField = function (map) {
    return new AddressInputField(map);
};
//# sourceMappingURL=Control.AddressInputField.js.map