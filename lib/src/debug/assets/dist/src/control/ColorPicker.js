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
 * L.ColorPicker is used for building a native HTML color picker
 * panel to be used by the properties mobile wizard.
 */
var ColorPicker = /** @class */ (function () {
    function ColorPicker(selectedColorSample, options) {
        var _this = this;
        this.statics = {
            ID: 0,
            ID_TAG: 'color-picker-',
            // we need a tight layout in order to be able to show 11 colors as in gdoc
            BASIC_COLORS: [
                '#000000',
                '#980000',
                '#ff0000',
                '#ff9900',
                '#ffff00',
                '#00ff00',
                '#00ffff' /*'#4a86e8',*/,
                '#0000ff',
                '#9900ff',
                '#ff00ff',
            ],
            TINTS: {
                '#000000': [
                    '#000000',
                    '#434343',
                    '#666666',
                    '#888888',
                    '#bbbbbb',
                    '#dddddd',
                    '#eeeeee',
                    '#ffffff',
                ],
                '#980000': [
                    '#5b0f00',
                    '#85200c',
                    '#a61c00',
                    '#980000',
                    '#cc4125',
                    '#dd7e6b',
                    '#e6b8af',
                    '#ffffff',
                ],
                '#ff0000': [
                    '#660000',
                    '#990000',
                    '#cc0000',
                    '#ff0000',
                    '#e06666',
                    '#ea9999',
                    '#f4cccc',
                    '#ffffff',
                ],
                '#ff9900': [
                    '#783f04',
                    '#b45f06',
                    '#e69138',
                    '#ff9900',
                    '#f6b26b',
                    '#f9cb9c',
                    '#fce5cd',
                    '#ffffff',
                ],
                '#ffff00': [
                    '#7f6000',
                    '#bf9000',
                    '#f1c232',
                    '#ffff00',
                    '#ffd966',
                    '#ffe599',
                    '#fff2cc',
                    '#ffffff',
                ],
                '#00ff00': [
                    '#274e13',
                    '#38761d',
                    '#6aa84f',
                    '#00ff00',
                    '#93c47d',
                    '#b6d7a8',
                    '#d9ead3',
                    '#ffffff',
                ],
                '#00ffff': [
                    '#0c343d',
                    '#134f5c',
                    '#45818e',
                    '#00ffff',
                    '#76a5af',
                    '#a2c4c9',
                    '#d0e0e3',
                    '#ffffff',
                ],
                // '#4a86e8': ['#1c4587', '#1155cc', '#3c78d8', '#4a86e8',
                // 	'#6d9eeb', '#a4c2f4', '#c9daf8', '#ffffff'],
                '#0000ff': [
                    '#073763',
                    '#0b5394',
                    '#3d85c6',
                    '#0000ff',
                    '#6fa8dc',
                    '#9fc5e8',
                    '#cfe2f3',
                    '#ffffff',
                ],
                '#9900ff': [
                    '#20124d',
                    '#351c75',
                    '#674ea7',
                    '#9900ff',
                    '#8e7cc3',
                    '#b4a7d6',
                    '#d9d2e9',
                    '#ffffff',
                ],
                '#ff00ff': [
                    '#4c1130',
                    '#741b47',
                    '#a64d79',
                    '#ff00ff',
                    '#c27ba0',
                    '#d5a6bd',
                    '#ead1dc',
                    '#ffffff',
                ],
            },
        };
        this.onShow = function () {
            if (!_this._initialized || _this._selectedColor === '#')
                return;
            _this._initIndexes();
            _this._updateTintsView();
        };
        this.options = Object.assign({
            selectedColor: '#ff0000',
            noColorControl: true,
            autoColorControl: false,
            selectionCallback: function (_) {
                /* no-op */
            },
        }, options);
        if (this.options.noColorControl && this.options.autoColorControl) {
            this.options.autoColorControl = false;
            window.app.console.warn('L.ColorPicker: requested both no color and auto color control');
        }
        this._selectedBasicColorIndex = 0;
        this._selectedTintIndex = 0;
        var pickerID = this.statics.ID++;
        this._basicColorSampleIdTag =
            this.statics.ID_TAG + pickerID + '-basic-color-';
        this._tintSampleIdTag = this.statics.ID_TAG + pickerID + '-tint-';
        this._noColorControlId = this.statics.ID_TAG + pickerID + '-no-color';
        this._autoColorControlId = this.statics.ID_TAG + pickerID + '-auto-color';
        this._createBasicColorSelectionMark();
        this._selectedColorElement = selectedColorSample;
        this._selectedColor = this.options.selectedColor;
        this._selectionCallback = this.options.selectionCallback;
        this._initIndexes();
        this._container = this._createControl();
        this._initialized = true;
    }
    ColorPicker.prototype.getContainer = function () {
        return this._container;
    };
    ColorPicker.prototype._initIndexes = function () {
        for (var i = 0; i < this._getBasicColorCount(); ++i) {
            var tintSet = this._getTintSet(i);
            if (!tintSet)
                return;
            for (var j = 0; j < tintSet.length; ++j) {
                var tint = tintSet[j];
                if (tint === this._selectedColor) {
                    this._selectedBasicColorIndex = i;
                    this._selectedTintIndex = j;
                    return;
                }
            }
        }
    };
    ColorPicker.prototype._createControl = function () {
        var children = [];
        if (this.options.noColorControl || this.options.autoColorControl)
            children.push(this._createPseudoColorControl());
        children.push(this._createBasicColorSamples());
        children.push(this._createTintSamples());
        return {
            type: 'divcontainer',
            style: 'colors-container',
            children: children,
        };
    };
    ColorPicker.prototype._createPseudoColorControl = function () {
        var noColorControl = this.options.noColorControl;
        var icon = {
            type: 'fixedtext',
            text: '',
            style: noColorControl
                ? 'no-color-control-icon'
                : 'auto-color-control-icon',
        };
        var label = noColorControl
            ? {
                type: 'fixedtext',
                style: 'no-color-control-label',
                text: _('No color'),
            }
            : {
                type: 'fixedtext',
                style: 'auto-color-control-label',
                text: _('Automatic color'),
            };
        var description = { type: 'divcontainer', children: [icon, label] };
        var checked = noColorControl
            ? {
                type: 'fixedtext',
                id: this._noColorControlId,
                style: 'no-color-control-mark',
                text: '',
            }
            : {
                type: 'fixedtext',
                id: this._autoColorControlId,
                style: 'auto-color-control-mark',
                text: '',
            };
        var container = {
            type: 'divcontainer',
            style: noColorControl
                ? 'colors-container-no-color-row'
                : 'colors-container-auto-color-row',
            handlers: [
                { event: 'click', handler: L.bind(this.onClickPseudoColor, this) },
            ],
            children: [description, checked],
        };
        return container;
    };
    ColorPicker.prototype._createBasicColorSamples = function () {
        var colorEntries = [];
        for (var k = 0; k < this._getBasicColorCount(); ++k) {
            var selected = k === this._selectedBasicColorIndex;
            var entry = {
                type: 'colorsample',
                id: this._basicColorSampleIdTag + k,
                selected: selected,
                color: this._getBasicColor(k),
                size: 'small',
                handlers: [
                    {
                        event: 'click',
                        handler: L.bind(this.onClickBasicColorSample, this),
                    },
                ],
            };
            if (selected) {
                entry.mark = this._basicColorSelectionMark;
            }
            colorEntries.push(entry);
        }
        return {
            type: 'divcontainer',
            style: 'colors-container-basic-colors-row',
            children: colorEntries,
        };
    };
    ColorPicker.prototype._createTintSamples = function () {
        var tints = this._getTintSet(this._selectedBasicColorIndex);
        var k, selected, entry, tintRowLength = tints.length / 2;
        // first tints row
        var tintsEntries1 = [];
        for (k = 0; k < tintRowLength; ++k) {
            selected = tints[k] === this._selectedColor;
            entry = {
                type: 'colorsample',
                id: this._tintSampleIdTag + k,
                selected: selected,
                color: tints[k],
                size: 'big',
                handlers: [
                    { event: 'click', handler: L.bind(this.onClickTintSample, this) },
                ],
            };
            tintsEntries1.push(entry);
        }
        var tintsRow1 = {
            type: 'divcontainer',
            style: 'colors-container-tints',
            children: tintsEntries1,
        };
        // second tints row
        var tintsEntries2 = [];
        for (k = tintRowLength; k < tints.length; ++k) {
            selected = tints[k] === this._selectedColor;
            entry = {
                type: 'colorsample',
                id: this._tintSampleIdTag + k,
                selected: selected,
                color: tints[k],
                size: 'big',
                handlers: [
                    { event: 'click', handler: L.bind(this.onClickTintSample, this) },
                ],
            };
            tintsEntries2.push(entry);
        }
        var tintsRow2 = {
            type: 'divcontainer',
            style: 'colors-container-tints',
            children: tintsEntries2,
        };
        return { type: 'divcontainer', children: [tintsRow1, tintsRow2] };
    };
    ColorPicker.prototype._createBasicColorSelectionMark = function () {
        this._basicColorSelectionMark = L.DomUtil.create('div', 'colors-container-basic-color-mark', null);
    };
    ColorPicker.prototype._getBasicColorCount = function () {
        return this.statics.BASIC_COLORS.length;
    };
    ColorPicker.prototype._getBasicColor = function (index) {
        if (!(index >= 0 && index < this.statics.BASIC_COLORS.length)) {
            return '';
        }
        return this.statics.BASIC_COLORS[index];
    };
    ColorPicker.prototype._getTintSet = function (basicColorIndex) {
        var basicColor = this._getBasicColor(basicColorIndex);
        if (basicColor === '')
            return [];
        return this.statics.TINTS[basicColor];
    };
    ColorPicker.prototype._extractBasicColorIndex = function (sampleId) {
        if (!sampleId.startsWith(this._basicColorSampleIdTag))
            return -1;
        var index = parseInt(sampleId.substring(this._basicColorSampleIdTag.length));
        if (index < 0 || index >= this._getBasicColorCount())
            return -1;
        return index;
    };
    ColorPicker.prototype._extractTintIndex = function (sampleId) {
        if (!sampleId.startsWith(this._tintSampleIdTag))
            return -1;
        var index = parseInt(sampleId.substring(this._tintSampleIdTag.length));
        if (index < 0 ||
            index >= this._getTintSet(this._selectedBasicColorIndex).length)
            return -1;
        return index;
    };
    ColorPicker.prototype._getColorCode = function (colorIndex, colorType) {
        var sampleElem = this._getSampleElement(colorIndex, colorType);
        return sampleElem.name;
    };
    ColorPicker.prototype.onClickPseudoColor = function () {
        this._selectedColor = '#';
        this._unselectSample(this._selectedTintIndex, 'TINT');
        this._updatePseudoColorControl(true);
        // transparent is fine for both no color and automatic color
        this._selectionCallback('transparent');
    };
    ColorPicker.prototype.onClickBasicColorSample = function (e) {
        var basicColorIndex = this._extractBasicColorIndex(e.id);
        if (basicColorIndex < 0)
            return;
        this._selectedBasicColorIndex = this._updateSelectedSample(basicColorIndex, this._selectedBasicColorIndex, 'BASIC_COLOR');
        this._updateTintsView();
        this._selectTintIndex(3);
    };
    ColorPicker.prototype.onClickTintSample = function (e) {
        var tintIndex = this._extractTintIndex(e.id);
        if (tintIndex < 0)
            return;
        this._selectTintIndex(tintIndex);
    };
    ColorPicker.prototype._selectTintIndex = function (tintIndex) {
        this._selectedTintIndex = this._updateSelectedSample(tintIndex, this._selectedTintIndex, 'TINT');
        this._selectedColor =
            '#' + this._getColorCode(this._selectedTintIndex, 'TINT');
        this._updatePseudoColorControl(false);
        this._updateSelectedColorElement();
        this._selectionCallback(this._getColorCode(this._selectedTintIndex, 'TINT'));
    };
    ColorPicker.prototype._updateSelectedSample = function (colorIndex, selectedColorIndex, colorType) {
        this._unselectSample(selectedColorIndex, colorType);
        this._selectSample(colorIndex, colorType);
        return colorIndex;
    };
    ColorPicker.prototype._unselectSample = function (colorIndex, colorType) {
        var sampleElem = this._getSampleElement(colorIndex, colorType);
        if (sampleElem && sampleElem.firstChild) {
            if (colorType === 'BASIC_COLOR') {
                sampleElem.removeChild(sampleElem.firstChild);
                L.DomUtil.removeClass(sampleElem, 'colors-container-selected-basic-color');
            }
            else if (colorType === 'TINT') {
                var child = sampleElem.firstChild;
                if (!('style' in child)) {
                    throw new Error('Assertion failed: sampleElem.firstChild is not a HTMLElement');
                }
                child.style.visibility = 'hidden';
            }
        }
    };
    ColorPicker.prototype._selectSample = function (colorIndex, colorType) {
        var sampleElem = this._getSampleElement(colorIndex, colorType);
        if (sampleElem) {
            if (colorType === 'BASIC_COLOR') {
                sampleElem.appendChild(this._basicColorSelectionMark);
                L.DomUtil.addClass(sampleElem, 'colors-container-selected-basic-color');
            }
            else if (colorType === 'TINT' && sampleElem.firstChild) {
                var child = sampleElem.firstChild;
                if (!('style' in child)) {
                    throw new Error('Assertion failed: sampleElem.firstChild is not a HTMLElement');
                }
                child.style.visibility = 'visible';
            }
        }
    };
    ColorPicker.prototype._updateTintsView = function () {
        var tintSet = this._getTintSet(this._selectedBasicColorIndex);
        if (!tintSet)
            return;
        for (var i = 0; i < tintSet.length; ++i) {
            var tint = tintSet[i];
            var sampleElem = this._getSampleElement(i, 'TINT');
            if (sampleElem) {
                sampleElem.style.backgroundColor = tint;
                sampleElem.name = tint.substring(1);
                if (sampleElem.firstChild) {
                    var child = sampleElem.firstChild;
                    if (!('style' in child)) {
                        throw new Error('Assertion failed: sampleElem.firstChild is not a HTMLElement');
                    }
                    if (tint === this._selectedColor) {
                        child.style.visibility = 'visible';
                    }
                    else {
                        child.style.visibility = 'hidden';
                    }
                }
            }
        }
    };
    ColorPicker.prototype._updatePseudoColorControl = function (checked) {
        if (this.options.noColorControl)
            this._updateNoColorControl(checked);
        else if (this.options.autoColorControl)
            this._updateAutoColorControl(checked);
    };
    ColorPicker.prototype._updateNoColorControl = function (checked) {
        var noColorElem = L.DomUtil.get(this._noColorControlId);
        if (noColorElem) {
            if (noColorElem.checked !== checked) {
                noColorElem.checked = checked;
                if (this._selectedColorElement) {
                    if (checked) {
                        noColorElem.innerHTML = '&#10004;';
                        // update value for the related menu entry
                        L.DomUtil.addClass(this._selectedColorElement, 'no-color-selected');
                        this._selectedColorElement.innerHTML = '\\';
                    }
                    else {
                        noColorElem.replaceChildren();
                        // update value for the related menu entry
                        L.DomUtil.removeClass(this._selectedColorElement, 'no-color-selected');
                        this._selectedColorElement.replaceChildren();
                    }
                }
            }
        }
    };
    ColorPicker.prototype._updateAutoColorControl = function (checked) {
        var autoColorElem = L.DomUtil.get(this._autoColorControlId);
        if (autoColorElem) {
            if (autoColorElem.checked !== checked) {
                autoColorElem.checked = checked;
                if (this._selectedColorElement) {
                    if (checked) {
                        autoColorElem.innerHTML = '&#10004;';
                        // update value for the related menu entry
                        L.DomUtil.addClass(this._selectedColorElement, 'auto-color-selected');
                        this._selectedColorElement.innerHTML = '\\';
                    }
                    else {
                        autoColorElem.replaceChildren();
                        // update value for the related menu entry
                        L.DomUtil.removeClass(this._selectedColorElement, 'auto-color-selected');
                        this._selectedColorElement.replaceChildren();
                    }
                }
            }
        }
    };
    ColorPicker.prototype._getSampleElement = function (index, type) {
        var sampleId;
        if (type === 'BASIC_COLOR') {
            sampleId = this._basicColorSampleIdTag + index;
        }
        else if (type === 'TINT') {
            sampleId = this._tintSampleIdTag + index;
        }
        return L.DomUtil.get(sampleId);
    };
    ColorPicker.prototype._updateSelectedColorElement = function () {
        if (this._selectedColorElement) {
            this._selectedColorElement.style.backgroundColor = this._selectedColor;
        }
    };
    return ColorPicker;
}());
L.ColorPicker = ColorPicker;
//# sourceMappingURL=ColorPicker.js.map