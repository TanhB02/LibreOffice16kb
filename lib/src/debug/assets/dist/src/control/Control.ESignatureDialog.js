/*
 * Copyright the Collabora Online contributors.
 *
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var cool;
(function (cool) {
    /**
     * Provides a dialog to select an electronic signing provider.
     */
    var ESignatureDialog = /** @class */ (function () {
        function ESignatureDialog(countries, providers) {
            this.id = 'ESignatureDialog';
            this.defaultCountryCode = '';
            this.defaultProviderId = '';
            // Providers available in the selected country
            this.filteredProviders = [];
            // Sort the lists based on the UI name.
            this.availableCountries = countries;
            this.availableCountries.sort(function (a, b) { return a.name.localeCompare(b.name); });
            this.availableProviders = providers;
            this.availableProviders.sort(function (a, b) { return a.name.localeCompare(b.name); });
        }
        // Produces the JSDialog JSON for the provider listbox
        ESignatureDialog.prototype.getProviderLbJSON = function (providers, defaultProviderIndex) {
            return {
                id: 'providerlb',
                type: 'listbox',
                enabled: true,
                children: [
                    {
                        id: '',
                        type: 'control',
                        enabled: true,
                        children: [],
                    },
                    {
                        type: 'pushbutton',
                        enabled: true,
                        symbol: 'SPIN_DOWN',
                    },
                ],
                labelledBy: 'providerft',
                entries: providers,
                selectedCount: 1,
                selectedEntries: [String(defaultProviderIndex)],
            };
        };
        ESignatureDialog.prototype.getChildrenJSON = function (countries, defaultCountryIndex, providers, defaultProviderIndex) {
            return [
                {
                    id: 'countryft',
                    type: 'fixedtext',
                    text: _('Country:'),
                    enabled: true,
                    labelFor: 'countrylb',
                },
                {
                    id: 'countrylb',
                    type: 'listbox',
                    enabled: true,
                    children: [
                        {
                            id: '',
                            type: 'control',
                            enabled: true,
                            children: [],
                        },
                        {
                            type: 'pushbutton',
                            enabled: true,
                            symbol: 'SPIN_DOWN',
                        },
                    ],
                    labelledBy: 'countryft',
                    entries: countries,
                    selectedCount: 1,
                    selectedEntries: [String(defaultCountryIndex)],
                },
                {
                    id: 'providerft',
                    type: 'fixedtext',
                    text: _('Provider:'),
                    enabled: true,
                    labelFor: 'providerlb',
                },
                this.getProviderLbJSON(providers, defaultProviderIndex),
                {
                    id: this.id + '-buttonbox',
                    type: 'buttonbox',
                    children: [
                        {
                            id: 'ok',
                            type: 'pushbutton',
                            text: _('OK'),
                        },
                    ],
                    layoutstyle: 'end',
                },
            ];
        };
        // Updates the filtered provider list based on a country code and gets a default
        // provider index.
        ESignatureDialog.prototype.getDefaultProviderIndex = function () {
            var _this = this;
            this.filteredProviders = this.availableProviders.filter(function (provider) {
                return provider.countryCodes.includes(_this.defaultCountryCode);
            });
            var defaultProviderIndex = this.filteredProviders
                .map(function (entry) { return entry.action_type; })
                .indexOf(this.defaultProviderId);
            if (defaultProviderIndex == -1) {
                defaultProviderIndex = 0;
            }
            return defaultProviderIndex;
        };
        ESignatureDialog.prototype.getJSON = function () {
            var countries = this.availableCountries.map(function (entry) { return entry.name; });
            var defaultCountryIndex = this.availableCountries
                .map(function (entry) { return entry.code; })
                .indexOf(this.defaultCountryCode);
            if (defaultCountryIndex == -1) {
                defaultCountryIndex = 0;
            }
            var defaultProviderIndex = this.getDefaultProviderIndex();
            var providers = this.filteredProviders.map(function (entry) { return entry.name; });
            var children = this.getChildrenJSON(countries, defaultCountryIndex, providers, defaultProviderIndex);
            return {
                id: this.id,
                dialogid: this.id,
                type: 'dialog',
                text: _('Insert Electronic Signature'),
                title: _('Insert Electronic Signature'),
                jsontype: 'dialog',
                responses: [
                    {
                        id: 'ok',
                        response: 1,
                    },
                ],
                children: [
                    {
                        id: this.id + '-mainbox',
                        type: 'container',
                        vertical: true,
                        children: children,
                    },
                ],
            };
        };
        ESignatureDialog.prototype.close = function () {
            var closeEvent = {
                data: {
                    action: 'close',
                    id: this.id,
                },
            };
            app.map.fire('jsdialog', closeEvent);
        };
        ESignatureDialog.prototype.callback = function (objectType, eventType, object, data, builder) {
            if (eventType === 'response' || object.id === 'ok') {
                var providers = (document.querySelector('#ESignatureDialog select#providerlb-input'));
                var providerId = this.filteredProviders[providers.selectedIndex].action_type;
                var countries = (document.querySelector('#ESignatureDialog select#countrylb-input'));
                var countryCode = this.availableCountries[countries.selectedIndex].code;
                this.close();
                app.map.eSignature.handleSelectedProvider(countryCode, providerId);
            }
            else if (eventType === 'selected' && object.id === 'countrylb') {
                // The selected country changed, update the list of providers
                // accordingly
                // Index-label pair
                var countryIndex = parseInt(data.split(';')[0]);
                this.defaultCountryCode = this.availableCountries[countryIndex].code;
                var defaultProviderIndex = this.getDefaultProviderIndex();
                var providers = this.filteredProviders.map(function (entry) { return entry.name; });
                var providerLbJSON = this.getProviderLbJSON(providers, defaultProviderIndex);
                app.map.fire('jsdialogupdate', {
                    data: {
                        jsontype: 'dialog',
                        action: 'update',
                        id: 'ESignatureDialog',
                        control: providerLbJSON,
                    },
                    callback: this.callback.bind(this),
                });
            }
        };
        ESignatureDialog.prototype.open = function () {
            var dialogBuildEvent = {
                data: this.getJSON(),
                callback: this.callback.bind(this),
            };
            app.map.fire('jsdialog', dialogBuildEvent);
        };
        ESignatureDialog.prototype.setDefaultCountryCode = function (countryCode) {
            this.defaultCountryCode = countryCode;
        };
        ESignatureDialog.prototype.setDefaultProviderId = function (providerId) {
            this.defaultProviderId = providerId;
        };
        return ESignatureDialog;
    }());
    cool.ESignatureDialog = ESignatureDialog;
})(cool || (cool = {}));
JSDialog.eSignatureDialog = function (countries, providers) {
    return new cool.ESignatureDialog(countries, providers);
};
//# sourceMappingURL=Control.ESignatureDialog.js.map