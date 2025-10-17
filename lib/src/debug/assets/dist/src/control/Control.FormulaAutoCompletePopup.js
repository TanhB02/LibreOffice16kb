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
 * Control.FormulaAutoCompletePopup
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
/* global app */
var FormulaAutoCompletePopup = /** @class */ (function (_super) {
    __extends(FormulaAutoCompletePopup, _super);
    function FormulaAutoCompletePopup(map) {
        return _super.call(this, 'formulaautocompletePopup', map) || this;
    }
    FormulaAutoCompletePopup.prototype.onAdd = function () {
        this.newPopupData.isAutoCompletePopup = true;
        this.map.on('openformulaautocompletepopup', this.openFormulaAutoCompletePopup, this);
        this.map.on('sendformulatext', this.sendFormulaText, this);
        this.functionList = null;
    };
    FormulaAutoCompletePopup.prototype.openFormulaAutoCompletePopup = function (ev) {
        this.map.fire('closepopup');
        this.openPopup({ data: ev });
    };
    FormulaAutoCompletePopup.prototype.sendFormulaText = function (ev) {
        this.openFormulaAutoCompletePopup(ev);
    };
    FormulaAutoCompletePopup.prototype.getPopupEntries = function (ev) {
        var entries = [];
        this.functionList = ev.data.data;
        if (this.functionList.length !== 0) {
            for (var i in this.functionList) {
                var entry = {
                    text: this.functionList[i].name,
                    columns: [
                        { text: this.functionList[i].name },
                        { text: '\n' + this.functionList[i].description },
                    ],
                    row: i.toString(),
                };
                entries.push(entry);
            }
        }
        return entries;
    };
    FormulaAutoCompletePopup.prototype.getAutocompleteText = function (currentCellFormula, functionName, endIndex) {
        // Step-1: Find indexes of all the '(', ';', '-', '+', '*', '/'
        var openBracketIndex = [];
        var semicolonIndex = [];
        var plusIndex = [];
        var multiplyIndex = [];
        var divideIndex = [];
        var minusIndex = [];
        var equalIndex = 0;
        for (var i = 0; i < currentCellFormula.length; i++) {
            var char = currentCellFormula.charAt(i);
            if (char === '(')
                openBracketIndex.push(i);
            else if (char === ';')
                semicolonIndex.push(i);
            else if (char === '+')
                plusIndex.push(i);
            else if (char === '*')
                multiplyIndex.push(i);
            else if (char === '/')
                divideIndex.push(i);
            else if (char === '-')
                minusIndex.push(i);
        }
        // Step-2: Find smallest difference between endIndex and indexes of all the '(', ';'
        // that will give us the startIndex
        var minDiff = Number.MAX_VALUE;
        var startIndex;
        var updateMinDiff = function (index) {
            var tmp = endIndex - index;
            if (tmp >= 0 && tmp < minDiff) {
                minDiff = tmp;
                startIndex = index + 1;
            }
        };
        updateMinDiff(equalIndex);
        openBracketIndex.forEach(updateMinDiff);
        semicolonIndex.forEach(updateMinDiff);
        plusIndex.forEach(updateMinDiff);
        minusIndex.forEach(updateMinDiff);
        multiplyIndex.forEach(updateMinDiff);
        divideIndex.forEach(updateMinDiff);
        // Step-3: extract the text we want to complete using startIndex and endIndex
        var partialText = currentCellFormula
            .substring(startIndex, endIndex + 1)
            .trim();
        // Step-4: compare partialText and functionName to find remaining text need to autocomplete
        var autoCompleteFunctionName = '';
        for (var i = 0; i < Math.max(partialText.length, functionName.length); i++) {
            if (partialText.charAt(i).toLowerCase() !=
                functionName.charAt(i).toLowerCase()) {
                autoCompleteFunctionName = functionName.substring(i);
                break;
            }
        }
        return autoCompleteFunctionName;
    };
    FormulaAutoCompletePopup.prototype.callback = function (objectType, eventType, object, index) {
        if (eventType === 'close') {
            this.closePopup();
        }
        else if (eventType === 'select' || eventType === 'activate') {
            var namedRange = this.functionList[index].namedRange;
            var currentText = this.map._docLayer._lastFormula;
            var addedCharacterIndex = this.map._docLayer._newFormulaDiffIndex;
            var functionName = this.getAutocompleteText(currentText, this.functionList[index].name, addedCharacterIndex);
            if (namedRange)
                this.map._textInput._sendText(functionName);
            else
                this.map._textInput._sendText(functionName + '(');
            this.closePopup();
        }
        else if (eventType === 'keydown') {
            if (object.key !== 'Tab' && object.key !== 'Shift') {
                this.map.focus();
                return true;
            }
        }
        return false;
    };
    return FormulaAutoCompletePopup;
}(L.Control.AutoCompletePopup));
L.control.formulaautocomplete = function (map) {
    return new FormulaAutoCompletePopup(map);
};
//# sourceMappingURL=Control.FormulaAutoCompletePopup.js.map