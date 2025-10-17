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
var ContinuousActivityBase = /** @class */ (function (_super) {
    __extends(ContinuousActivityBase, _super);
    function ContinuousActivityBase(aCommonParamSet) {
        return _super.call(this, aCommonParamSet) || this;
    }
    // protected performContinuousHook(nModifiedTime: number, nRepeatCount: number): void {
    // 	// TODO throw abstract
    // }
    ContinuousActivityBase.prototype.simplePerform = function (nSimpleTime, nRepeatCount) {
        this.performContinuousHook(this.calcAcceleratedTime(nSimpleTime), nRepeatCount);
    };
    return ContinuousActivityBase;
}(SimpleContinuousActivityBase));
//# sourceMappingURL=ContinuousActivityBase.js.map