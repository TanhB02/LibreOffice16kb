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
var KeyStopLerp = /** @class */ (function () {
    function KeyStopLerp(aValueList) {
        KeyStopLerp.validateInput(aValueList);
        this.aKeyStopList = [];
        this.nLastIndex = 0;
        this.nKeyStopDistance = aValueList[1] - aValueList[0];
        if (this.nKeyStopDistance <= 0)
            this.nKeyStopDistance = 0.001;
        for (var i = 0; i < aValueList.length; ++i)
            this.aKeyStopList.push(aValueList[i]);
        this.nUpperBoundIndex = this.aKeyStopList.length - 2;
    }
    KeyStopLerp.validateInput = function (aValueList) {
        var nSize = aValueList.length;
        assert(nSize > 1, 'KeyStopLerp.validateInput: key stop vector must have two entries or more');
        for (var i = 1; i < nSize; ++i) {
            if (aValueList[i - 1] > aValueList[i])
                window.app.console.log('KeyStopLerp.validateInput: time vector is not sorted in ascending order!');
        }
    };
    KeyStopLerp.prototype.reset = function () {
        KeyStopLerp.validateInput(this.aKeyStopList);
        this.nLastIndex = 0;
        this.nKeyStopDistance = this.aKeyStopList[1] - this.aKeyStopList[0];
        if (this.nKeyStopDistance <= 0)
            this.nKeyStopDistance = 0.001;
    };
    KeyStopLerp.prototype.lerp = function (nAlpha) {
        if (nAlpha > this.aKeyStopList[this.nLastIndex + 1]) {
            do {
                var nIndex = this.nLastIndex + 1;
                this.nLastIndex = clampN(nIndex, 0, this.nUpperBoundIndex);
                this.nKeyStopDistance =
                    this.aKeyStopList[this.nLastIndex + 1] -
                        this.aKeyStopList[this.nLastIndex];
            } while (this.nKeyStopDistance <= 0 &&
                this.nLastIndex < this.nUpperBoundIndex);
        }
        var nRawLerp = (nAlpha - this.aKeyStopList[this.nLastIndex]) / this.nKeyStopDistance;
        nRawLerp = clampN(nRawLerp, 0.0, 1.0);
        return {
            nIndex: this.nLastIndex,
            nLerp: nRawLerp,
        };
    };
    return KeyStopLerp;
}());
var ContinuousKeyTimeActivityBase = /** @class */ (function (_super) {
    __extends(ContinuousKeyTimeActivityBase, _super);
    function ContinuousKeyTimeActivityBase(aCommonParamSet) {
        var _this = _super.call(this, aCommonParamSet) || this;
        var nSize = aCommonParamSet.aDiscreteTimes.length;
        assert(nSize > 1, 'ContinuousKeyTimeActivityBase constructor: assertion (aDiscreteTimes.length > 1) failed');
        assert(aCommonParamSet.aDiscreteTimes[0] == 0.0, 'ContinuousKeyTimeActivityBase constructor: assertion (aDiscreteTimes.front() == 0.0) failed');
        assert(aCommonParamSet.aDiscreteTimes[nSize - 1] <= 1.0, 'ContinuousKeyTimeActivityBase constructor: assertion (aDiscreteTimes.back() <= 1.0) failed');
        _this.aLerper = new KeyStopLerp(aCommonParamSet.aDiscreteTimes);
        return _this;
    }
    ContinuousKeyTimeActivityBase.prototype.activate = function (aEndElement) {
        _super.prototype.activate.call(this, aEndElement);
        this.aLerper.reset();
    };
    ContinuousKeyTimeActivityBase.prototype.simplePerform = function (nSimpleTime, nRepeatCount) {
        var nAlpha = this.calcAcceleratedTime(nSimpleTime);
        var aLerpResult = this.aLerper.lerp(nAlpha);
        this.performContinuousHook(aLerpResult.nIndex, aLerpResult.nLerp, nRepeatCount);
    };
    return ContinuousKeyTimeActivityBase;
}(SimpleContinuousActivityBase));
//# sourceMappingURL=ContinuousKeyTimeActivityBase.js.map