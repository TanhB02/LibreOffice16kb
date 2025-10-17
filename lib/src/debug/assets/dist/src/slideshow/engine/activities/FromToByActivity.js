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
function FromToByActivityTemplate(BaseType) {
    var FromToByActivity = /** @class */ (function (_super) {
        __extends(FromToByActivity, _super);
        function FromToByActivity() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var _this = this;
            assert(args.length === 8, 'FromToByActivity, constructor args length is wrong');
            var aFromValue = args[0];
            var aToValue = args[1];
            var aByValue = args[2];
            var aActivityParamSet = args[3];
            var aAnimation = args[4];
            var aInterpolator = args[5];
            var aOperatorSet = args[6];
            var bAccumulate = args[7];
            _this = _super.call(this, aFromValue, aToValue, aByValue, aActivityParamSet, aAnimation, aInterpolator, aOperatorSet, bAccumulate) || this;
            _this.aFrom = aFromValue;
            _this.aTo = aToValue;
            _this.aBy = aByValue;
            _this.aStartValue = null;
            _this.aEndValue = null;
            _this.aPreviousValue = null;
            _this.aStartInterpolationValue = null;
            _this.aAnimation = aAnimation;
            _this.aInterpolator = aInterpolator;
            _this.equal = aOperatorSet.equal;
            _this.add = aOperatorSet.add;
            _this.scale = aOperatorSet.scale;
            _this.bDynamicStartValue = false;
            _this.nIteration = 0;
            _this.bCumulative = bAccumulate;
            _this.aFormula = aActivityParamSet.aFormula;
            return _this;
        }
        FromToByActivity.prototype.initAnimatedElement = function () {
            if (this.aAnimation && hasValue(this.aFrom)) {
                var aValue = this.aFormula ? this.aFormula(this.aFrom) : this.aFrom;
                this.aAnimation.perform(aValue);
            }
        };
        FromToByActivity.prototype.startAnimation = function () {
            if (this.isDisposed() || !this.aAnimation) {
                window.app.console.log('FromToByActivity.startAnimation: activity disposed or not valid animation');
                return;
            }
            _super.prototype.startAnimation.call(this);
            this.aAnimation.start(this.getTargetElement());
            var aAnimationStartValue = this.aAnimation.getUnderlyingValue();
            // first of all, determine general type of
            // animation, by inspecting which of the FromToBy values
            // are actually valid.
            // See http://www.w3.org/TR/smil20/animation.html#AnimationNS-FromToBy
            // for a definition
            if (hasValue(this.aFrom)) {
                // From-to or From-by animation. According to
                // SMIL spec, the To value takes precedence
                // over the By value, if both are specified
                if (hasValue(this.aTo)) {
                    // From-To animation
                    this.aStartValue = this.aFrom;
                    this.aEndValue = this.aTo;
                }
                else if (hasValue(this.aBy)) {
                    // From-By animation
                    this.aStartValue = this.aFrom;
                    this.aEndValue = this.add(this.aStartValue, this.aBy);
                }
                this.aStartInterpolationValue = this.aStartValue;
            }
            else {
                this.aStartValue = aAnimationStartValue;
                this.aStartInterpolationValue = this.aStartValue;
                // By or To animation. According to SMIL spec,
                // the To value takes precedence over the By
                // value, if both are specified
                if (hasValue(this.aTo)) {
                    // To animation
                    // According to the SMIL spec
                    // (http://www.w3.org/TR/smil20/animation.html#animationNS-ToAnimation),
                    // the to animation interpolates between
                    // the _running_ underlying value and the to value (as the end value)
                    this.bDynamicStartValue = true;
                    this.aPreviousValue = this.aStartValue;
                    this.aEndValue = this.aTo;
                }
                else if (hasValue(this.aBy)) {
                    // By animation
                    this.aStartValue = aAnimationStartValue;
                    this.aEndValue = this.add(this.aStartValue, this.aBy);
                }
            }
            ANIMDBG.print('FromToByActivity.startAnimation: aStartValue = ' +
                this.aStartValue +
                ', aEndValue = ' +
                this.aEndValue);
        };
        FromToByActivity.prototype.endAnimation = function () {
            if (this.aAnimation)
                this.aAnimation.end();
        };
        // perform hook override for ContinuousActivityBase
        FromToByActivity.prototype.performContinuousHook = function (nModifiedTime, nRepeatCount) {
            if (this.isDisposed() || !this.aAnimation) {
                window.app.console.log('FromToByActivity.performContinuousHook: activity disposed or not valid animation');
                return;
            }
            // According to SMIL 3.0 spec 'to' animation if no other (lower priority)
            // animations are active or frozen then a simple interpolation is performed.
            // That is, the start interpolation value is constant while the animation
            // is running, and is equal to the underlying value retrieved when
            // the animation start.
            // However if another animation is manipulating the underlying value,
            // the 'to' animation will initially add to the effect of the lower priority
            // animation, and increasingly dominate it as it nears the end of the
            // simple duration, eventually overriding it completely.
            // That is, each time the underlying value is changed between two
            // computations of the animation function the new underlying value is used
            // as start value for the interpolation.
            // See:
            // http://www.w3.org/TR/SMIL3/smil-animation.html#animationNS-ToAnimation
            // (Figure 6 - Effect of Additive to animation example)
            // Moreover when a 'to' animation is repeated, at each new iteration
            // the start interpolation value is reset to the underlying value
            // of the animated property when the animation started,
            // as it is shown in the example provided by the SMIL 3.0 spec.
            // This is exactly as Firefox performs SVG 'to' animations.
            if (this.bDynamicStartValue) {
                if (this.nIteration != nRepeatCount) {
                    this.nIteration = nRepeatCount;
                    this.aStartInterpolationValue = this.aStartValue;
                }
                else {
                    var aActualValue = this.aAnimation.getUnderlyingValue();
                    if (!this.equal(aActualValue, this.aPreviousValue))
                        this.aStartInterpolationValue = aActualValue;
                }
            }
            var aValue = this.aInterpolator(this.aStartInterpolationValue, this.aEndValue, nModifiedTime);
            // According to the SMIL spec:
            // Because 'to' animation is defined in terms of absolute values of
            // the target attribute, cumulative animation is not defined.
            if (this.bCumulative && !this.bDynamicStartValue) {
                // aValue = this.aEndValue * nRepeatCount + aValue;
                aValue = this.add(this.scale(nRepeatCount, this.aEndValue), aValue);
            }
            aValue = this.aFormula ? this.aFormula(aValue) : aValue;
            this.aAnimation.perform(aValue);
            if (this.bDynamicStartValue) {
                this.aPreviousValue = this.aAnimation.getUnderlyingValue();
            }
        };
        // perform hook override for DiscreteActivityBase
        FromToByActivity.prototype.performDiscreteHook = function ( /*nFrame, nRepeatCount*/) {
            if (this.isDisposed() || !this.aAnimation) {
                window.app.console.log('FromToByActivity.performDiscreteHook: activity disposed or not valid animation');
                return;
            }
        };
        FromToByActivity.prototype.performEnd = function () {
            if (this.aAnimation) {
                var aValue = this.isAutoReverse() ? this.aStartValue : this.aEndValue;
                aValue = this.aFormula ? this.aFormula(aValue) : aValue;
                this.aAnimation.perform(aValue);
            }
        };
        FromToByActivity.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
        };
        return FromToByActivity;
    }(BaseType));
    return FromToByActivity;
}
var ContinuousActivityBaserFromToByCtor = /** @class */ (function (_super) {
    __extends(ContinuousActivityBaserFromToByCtor, _super);
    function ContinuousActivityBaserFromToByCtor(aFromValue, aToValue, aByValue, aActivityParamSet, aAnimation, aInterpolator, aOperatorSet, bAccumulate) {
        return _super.call(this, aActivityParamSet) || this;
    }
    return ContinuousActivityBaserFromToByCtor;
}(ContinuousActivityBase));
var AbstractLinearFromToByActivity = FromToByActivityTemplate(ContinuousActivityBaserFromToByCtor);
var LinearFromToByActivity = /** @class */ (function (_super) {
    __extends(LinearFromToByActivity, _super);
    function LinearFromToByActivity() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return LinearFromToByActivity;
}(AbstractLinearFromToByActivity));
var DiscreteActivityBaserFromToByCtor = /** @class */ (function (_super) {
    __extends(DiscreteActivityBaserFromToByCtor, _super);
    function DiscreteActivityBaserFromToByCtor(aFromValue, aToValue, aByValue, aActivityParamSet, aAnimation, aInterpolator, aOperatorSet, bAccumulate) {
        return _super.call(this, aActivityParamSet) || this;
    }
    return DiscreteActivityBaserFromToByCtor;
}(DiscreteActivityBase));
var AbstractDiscreteFromToByActivity = FromToByActivityTemplate(DiscreteActivityBaserFromToByCtor);
var DiscreteFromToByActivity = /** @class */ (function (_super) {
    __extends(DiscreteFromToByActivity, _super);
    function DiscreteFromToByActivity() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return DiscreteFromToByActivity;
}(AbstractDiscreteFromToByActivity));
//# sourceMappingURL=FromToByActivity.js.map