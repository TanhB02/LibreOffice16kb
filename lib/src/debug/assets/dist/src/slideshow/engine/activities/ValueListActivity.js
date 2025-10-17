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
function ValueListActivityTemplate(BaseType) {
    var ValueListActivity = /** @class */ (function (_super) {
        __extends(ValueListActivity, _super);
        function ValueListActivity() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var _this = this;
            assert(args.length === 6, 'ValueListActivity, constructor args length is wrong');
            var aValueList = args[0];
            var aActivityParamSet = args[1];
            var aAnimation = args[2];
            var aInterpolator = args[3];
            var aOperatorSet = args[4];
            var bAccumulate = args[5];
            assert(aAnimation, 'ValueListActivity constructor: invalid animation object');
            assert(aValueList.length != 0, 'ValueListActivity: value list is empty');
            _this = _super.call(this, aValueList, aActivityParamSet, aAnimation, aInterpolator, aOperatorSet, bAccumulate) || this;
            _this.aValueList = aValueList;
            _this.aAnimation = aAnimation;
            _this.aInterpolator = aInterpolator;
            _this.add = aOperatorSet.add;
            _this.scale = aOperatorSet.scale;
            _this.bCumulative = bAccumulate;
            _this.aLastValue = _this.aValueList[_this.aValueList.length - 1];
            _this.aFormula = aActivityParamSet.aFormula;
            return _this;
        }
        ValueListActivity.prototype.activate = function (aEndEvent) {
            _super.prototype.activate.call(this, aEndEvent);
            for (var i = 0; i < this.aValueList.length; ++i) {
                ANIMDBG.print('ValueListActivity.activate: value[' +
                    i +
                    '] = ' +
                    this.aValueList[i]);
            }
        };
        ValueListActivity.prototype.initAnimatedElement = function () {
            if (this.aAnimation) {
                var aValue = this.aValueList[0];
                aValue = this.aFormula ? this.aFormula(aValue) : aValue;
                this.aAnimation.perform(aValue);
            }
        };
        ValueListActivity.prototype.startAnimation = function () {
            if (this.isDisposed() || !this.aAnimation) {
                window.app.console.log('ValueListActivity.startAnimation: activity disposed or not valid animation');
                return;
            }
            _super.prototype.startAnimation.call(this);
            this.aAnimation.start(this.getTargetElement());
        };
        ValueListActivity.prototype.endAnimation = function () {
            if (this.aAnimation)
                this.aAnimation.end();
        };
        // perform hook override for ContinuousKeyTimeActivityBase base
        ValueListActivity.prototype.performContinuousHook = function (nIndex, nFractionalIndex, nRepeatCount) {
            if (this.isDisposed() || !this.aAnimation) {
                window.app.console.log('ValueListActivity.performContinuousHook: activity disposed or not valid animation');
                return;
            }
            assert(nIndex + 1 < this.aValueList.length, 'ValueListActivity.performContinuousHook: assertion (nIndex + 1 < this.aValueList.length) failed');
            // interpolate between nIndex and nIndex+1 values
            var aValue = this.aInterpolator(this.aValueList[nIndex], this.aValueList[nIndex + 1], nFractionalIndex);
            if (this.bCumulative) {
                //aValue = aValue + nRepeatCount * this.aLastValue;
                aValue = this.add(aValue, this.scale(nRepeatCount, this.aLastValue));
            }
            aValue = this.aFormula ? this.aFormula(aValue) : aValue;
            this.aAnimation.perform(aValue);
        };
        // perform hook override for DiscreteActivityBase base
        ValueListActivity.prototype.performDiscreteHook = function (nFrame, nRepeatCount) {
            if (this.isDisposed() || !this.aAnimation) {
                window.app.console.log('ValueListActivity.performDiscreteHook: activity disposed or not valid animation');
                return;
            }
            assert(nFrame < this.aValueList.length, 'ValueListActivity.performDiscreteHook: assertion ( nFrame < this.aValueList.length) failed');
            // this is discrete, thus no lerp here.
            var aValue = this.aValueList[nFrame];
            if (this.bCumulative) {
                aValue = this.add(aValue, this.scale(nRepeatCount, this.aLastValue));
                // for numbers:   aValue = aValue + nRepeatCount * this.aLastValue;
                // for enums, bools or strings:   aValue = aValue;
            }
            aValue = this.aFormula ? this.aFormula(aValue) : aValue;
            this.aAnimation.perform(aValue);
        };
        ValueListActivity.prototype.performEnd = function () {
            if (this.aAnimation) {
                var aValue = this.aFormula
                    ? this.aFormula(this.aLastValue)
                    : this.aLastValue;
                this.aAnimation.perform(aValue);
            }
        };
        ValueListActivity.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
        };
        return ValueListActivity;
    }(BaseType));
    return ValueListActivity;
}
var ContinuousKeyTimeActivityBaseValueListCtor = /** @class */ (function (_super) {
    __extends(ContinuousKeyTimeActivityBaseValueListCtor, _super);
    function ContinuousKeyTimeActivityBaseValueListCtor(aValueList, aActivityParamSet, aAnimation, aInterpolator, aOperatorSet, bAccumulate) {
        return _super.call(this, aActivityParamSet) || this;
    }
    return ContinuousKeyTimeActivityBaseValueListCtor;
}(ContinuousKeyTimeActivityBase));
var AbstractLinearValueListActivity = ValueListActivityTemplate(ContinuousKeyTimeActivityBaseValueListCtor);
var LinearValueListActivity = /** @class */ (function (_super) {
    __extends(LinearValueListActivity, _super);
    function LinearValueListActivity() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return LinearValueListActivity;
}(AbstractLinearValueListActivity));
var DiscreteActivityBaserValueListCtor = /** @class */ (function (_super) {
    __extends(DiscreteActivityBaserValueListCtor, _super);
    function DiscreteActivityBaserValueListCtor(aValueList, aActivityParamSet, aAnimation, aInterpolator, aOperatorSet, bAccumulate) {
        return _super.call(this, aActivityParamSet) || this;
    }
    return DiscreteActivityBaserValueListCtor;
}(DiscreteActivityBase));
var AbstractDiscreteValueListActivity = ValueListActivityTemplate(DiscreteActivityBaserValueListCtor);
var DiscreteValueListActivity = /** @class */ (function (_super) {
    __extends(DiscreteValueListActivity, _super);
    function DiscreteValueListActivity() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return DiscreteValueListActivity;
}(AbstractDiscreteValueListActivity));
//# sourceMappingURL=ValueListActivity.js.map