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
This file defines the SaveState class, which handles the logic for managing the document's save state.
It controls the display of the saving status, saved status, and triggers the associated animations and icon changes.
*/
var SaveState = /** @class */ (function () {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    function SaveState(map) {
        this.map = map;
        this.saveEle = document.getElementById('save');
        this.saveIconEl = document.querySelector('#save img');
    }
    // Function to show the saving status
    SaveState.prototype.showSavingStatus = function () {
        if (window.mode.isMobile())
            return;
        // Only do saving animation if any content is modified in document
        if (this.saveEle.classList.contains('savemodified')) {
            this.saveEle.classList.remove('savemodified');
            // Dynamically set the content string for saving state
            var savingText = _('Saving');
            this.saveEle.style.setProperty('--save-state', "\"" + savingText + "\"");
            this.saveEle.classList.add('saving');
            this.saveIconEl.classList.add('rotate-icon'); // Start the icon rotation
            this.saveEle.setAttribute('disabled', 'true'); // Disable the button
        }
    };
    // Function to show the saved status
    SaveState.prototype.showSavedStatus = function () {
        var _this = this;
        if (window.mode.isMobile())
            return;
        if (!this.saveEle.classList.contains('savemodified')) {
            this.saveEle.classList.remove('saving');
            this.saveIconEl.classList.remove('rotate-icon'); // Stop the icon rotation
            // Dynamically set the content string for saved state
            var savedText = _('Saved');
            this.saveEle.style.setProperty('--save-state', "\"" + savedText + "\"");
            this.saveEle.classList.add('saved');
            // Add some delay to show "saved" status, then hide this info
            setTimeout(function () {
                _this.saveEle.classList.remove('saved');
                _this.saveEle.removeAttribute('disabled'); // Enable the button
            }, 2000);
        }
    };
    SaveState.prototype.showModifiedStatus = function () {
        this.saveEle.classList.remove('saving');
        this.saveEle.classList.remove('saved');
        this.saveIconEl.classList.remove('rotate-icon'); // Stop the icon rotation
        this.saveEle.removeAttribute('disabled'); // Enable the button
        this.saveEle.classList.add('savemodified');
    };
    return SaveState;
}());
app.definitions.saveState = SaveState;
//# sourceMappingURL=Control.SaveState.js.map