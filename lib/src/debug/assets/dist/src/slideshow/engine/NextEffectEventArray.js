/* -*- tab-width: 4 -*- */
/*
 * Copyright the Collabora Online contributors.
 *
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var NextEffectEventArray = /** @class */ (function () {
    function NextEffectEventArray() {
        this.aEventArray = [];
    }
    NextEffectEventArray.prototype.size = function () {
        return this.aEventArray.length;
    };
    NextEffectEventArray.prototype.at = function (nIndex) {
        return this.aEventArray[nIndex];
    };
    NextEffectEventArray.prototype.appendEvent = function (aEvent) {
        var nSize = this.size();
        for (var i = 0; i < nSize; ++i) {
            if (this.aEventArray[i].getId() == aEvent.getId()) {
                aNextEffectEventArrayDebugPrinter.print('NextEffectEventArray.appendEvent: event(' +
                    aEvent.getId() +
                    ') already present');
                return false;
            }
        }
        this.aEventArray.push(aEvent);
        aNextEffectEventArrayDebugPrinter.print('NextEffectEventArray.appendEvent: event(' +
            aEvent.getId() +
            ') appended');
        return true;
    };
    NextEffectEventArray.prototype.clear = function () {
        this.aEventArray = [];
    };
    return NextEffectEventArray;
}());
//# sourceMappingURL=NextEffectEventArray.js.map