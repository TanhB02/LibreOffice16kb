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
var DirectionType;
(function (DirectionType) {
    DirectionType[DirectionType["Backward"] = 0] = "Backward";
    DirectionType[DirectionType["Forward"] = 1] = "Forward";
})(DirectionType || (DirectionType = {}));
var SimpleActivity = /** @class */ (function (_super) {
    __extends(SimpleActivity, _super);
    function SimpleActivity(aCommonParamSet, aNumberAnimation, eDirection) {
        var _this = _super.call(this, aCommonParamSet) || this;
        assert(eDirection == DirectionType.Backward ||
            eDirection == DirectionType.Forward, 'SimpleActivity constructor: animation direction is not valid');
        assert(aNumberAnimation, 'SimpleActivity constructor: animation object is not valid');
        _this.aAnimation = aNumberAnimation;
        _this.nDirection = eDirection == DirectionType.Forward ? 1.0 : 0.0;
        return _this;
    }
    SimpleActivity.prototype.startAnimation = function () {
        if (this.isDisposed() || !this.aAnimation)
            return;
        ANIMDBG.print('SimpleActivity.startAnimation invoked');
        _super.prototype.startAnimation.call(this);
        // start animation
        this.aAnimation.start(this.getTargetElement());
    };
    SimpleActivity.prototype.endAnimation = function () {
        if (this.aAnimation)
            this.aAnimation.end();
    };
    SimpleActivity.prototype.performContinuousHook = function (nModifiedTime, nRepeatCount) {
        // nRepeatCount is not used
        if (this.isDisposed() || !this.aAnimation)
            return;
        var nT = 1.0 - this.nDirection + nModifiedTime * (2.0 * this.nDirection - 1.0);
        this.aAnimation.perform(nT, nT === this.nDirection);
    };
    SimpleActivity.prototype.performEnd = function () {
        if (this.aAnimation) {
            console.debug('SimpleActivity.performEnd');
            this.aAnimation.perform(this.nDirection, /*last:*/ true);
        }
    };
    return SimpleActivity;
}(ContinuousActivityBase));
//# sourceMappingURL=SimpleActivity.js.map