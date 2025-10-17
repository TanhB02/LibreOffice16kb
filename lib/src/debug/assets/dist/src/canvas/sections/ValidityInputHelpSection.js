// @ts-strict-ignore
/* -*- js-indent-level: 8 -*- */
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
/*
 * Copyright the Collabora Online contributors.
 *
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
var ValidityInputHelpSection = /** @class */ (function (_super) {
    __extends(ValidityInputHelpSection, _super);
    function ValidityInputHelpSection(sectionName, objectWidth, objectHeight, documentPosition, extraClass, showSection) {
        if (extraClass === void 0) { extraClass = ""; }
        if (showSection === void 0) { showSection = true; }
        return _super.call(this, sectionName, objectWidth, objectHeight, documentPosition, extraClass, showSection) || this;
    }
    ValidityInputHelpSection.showValidityInputHelp = function (textMsg, documentPosition) {
        var message = textMsg.replace('validityinputhelp: ', '');
        message = JSON.parse(message);
        var section = new ValidityInputHelpSection(ValidityInputHelpSection.sectionName, null, null, documentPosition, ValidityInputHelpSection.className, true);
        app.sectionContainer.addSection(section);
        var objectDiv = section.getHTMLObject();
        var title = document.createElement('h4');
        title.textContent = message.title;
        objectDiv.appendChild(title);
        var content = document.createElement('p');
        content.textContent = message.content;
        objectDiv.appendChild(content);
    };
    ValidityInputHelpSection.removeValidityInputHelp = function () {
        if (app.sectionContainer.doesSectionExist(ValidityInputHelpSection.sectionName))
            app.sectionContainer.removeSection(ValidityInputHelpSection.sectionName);
    };
    ValidityInputHelpSection.sectionName = 'Validity Input Help';
    ValidityInputHelpSection.className = 'input-help';
    return ValidityInputHelpSection;
}(HTMLObjectSection));
app.definitions.validityInputHelpSection = ValidityInputHelpSection;
//# sourceMappingURL=ValidityInputHelpSection.js.map