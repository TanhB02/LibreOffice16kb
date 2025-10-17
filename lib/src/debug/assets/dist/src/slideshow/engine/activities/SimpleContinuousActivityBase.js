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
var SimpleContinuousActivityBase = /** @class */ (function (_super) {
    __extends(SimpleContinuousActivityBase, _super);
    function SimpleContinuousActivityBase(aCommonParamSet) {
        var _this = _super.call(this, aCommonParamSet) || this;
        // Time elapsed since activity started
        _this.aTimer = new ElapsedTime(aCommonParamSet.aActivityQueue.getTimer());
        // Simple duration of activity
        _this.nMinSimpleDuration = aCommonParamSet.nMinDuration;
        // Minimal number of frames to show
        _this.nMinNumberOfFrames = aCommonParamSet.nMinNumberOfFrames;
        // Actual number of frames shown until now.
        _this.nCurrPerformCalls = 0;
        return _this;
    }
    SimpleContinuousActivityBase.prototype.startAnimation = function () {
        // init timer. We measure animation time only when we're
        // actually started.
        this.aTimer.reset();
    };
    SimpleContinuousActivityBase.prototype.calcTimeLag = function () {
        _super.prototype.calcTimeLag.call(this);
        if (!this.isActive())
            return 0.0;
        // retrieve locally elapsed time
        var nCurrElapsedTime = this.aTimer.getElapsedTime();
        // go to great length to ensure a proper animation
        // run. Since we don't know how often we will be called
        // here, try to spread the animator calls uniquely over
        // the [0,1] parameter range. Be aware of the fact that
        // perform will be called at least mnMinNumberOfTurns
        // times.
        // fraction of time elapsed
        var nFractionElapsedTime = nCurrElapsedTime / this.nMinSimpleDuration;
        // fraction of minimum calls performed
        var nFractionRequiredCalls = this.nCurrPerformCalls / this.nMinNumberOfFrames;
        // okay, so now, the decision is easy:
        //
        // If the fraction of time elapsed is smaller than the
        // number of calls required to be performed, then we calc
        // the position on the animation range according to
        // elapsed time. That is, we're so to say ahead of time.
        //
        // In contrary, if the fraction of time elapsed is larger,
        // then we're lagging, and we thus calc the position on
        // the animation time line according to the fraction of
        // calls performed. Thus, the animation is forced to slow
        // down, and take the required minimal number of steps,
        // sufficiently equally distributed across the animation
        // time line.
        if (nFractionElapsedTime < nFractionRequiredCalls) {
            return 0.0;
        }
        else {
            // lag global time, so all other animations lag, too:
            return ((nFractionElapsedTime - nFractionRequiredCalls) *
                this.nMinSimpleDuration);
        }
    };
    SimpleContinuousActivityBase.prototype.perform = function () {
        // call base class, for start() calls and end handling
        if (!_super.prototype.perform.call(this))
            return false; // done, we're ended
        // get relative animation position
        var nCurrElapsedTime = this.aTimer.getElapsedTime();
        var nT = nCurrElapsedTime / this.nMinSimpleDuration;
        // one of the stop criteria reached?
        // will be set to true below, if one of the termination criteria matched.
        var bActivityEnding = false;
        if (this.isRepeatCountValid()) {
            // Finite duration case
            // When we've autoreverse on, the repeat count doubles
            var nRepeatCount = this.getRepeatCount();
            var nEffectiveRepeat = this.isAutoReverse()
                ? 2.0 * nRepeatCount
                : nRepeatCount;
            // time (or frame count) elapsed?
            if (nEffectiveRepeat <= nT) {
                // Ok done for now. Will not exit right here,
                // to give animation the chance to render the last
                // frame below
                bActivityEnding = true;
                // clamp animation to max permissible value
                nT = nEffectiveRepeat;
            }
        }
        // need to do auto-reverse?
        var nRepeats;
        var nRelativeSimpleTime;
        // TODO(Q3): Refactor this mess
        if (this.isAutoReverse()) {
            // divert active duration into repeat and
            // fractional part.
            nRepeats = Math.floor(nT);
            var nFractionalActiveDuration = nT - nRepeats;
            // for auto-reverse, map ranges [1,2), [3,4), ...
            // to ranges [0,1), [1,2), etc.
            if (nRepeats % 2) {
                // we're in an odd range, reverse sweep
                nRelativeSimpleTime = 1.0 - nFractionalActiveDuration;
            }
            else {
                // we're in an even range, pass on as is
                nRelativeSimpleTime = nFractionalActiveDuration;
            }
            // effective repeat count for autoreverse is half of
            // the input time's value (each run of an autoreverse
            // cycle is half of a repeat)
            nRepeats /= 2;
        }
        else {
            // determine repeat
            // calc simple time and number of repeats from nT
            // Now, that's easy, since the fractional part of
            // nT gives the relative simple time, and the
            // integer part the number of full repeats:
            nRepeats = Math.floor(nT);
            nRelativeSimpleTime = nT - nRepeats;
            // clamp repeats to max permissible value (maRepeats.getValue() - 1.0)
            if (this.isRepeatCountValid() && nRepeats >= this.getRepeatCount()) {
                // Note that this code here only gets
                // triggered if this.nRepeats is an
                // _integer_. Otherwise, nRepeats will never
                // reach nor exceed
                // maRepeats.getValue(). Thus, the code below
                // does not need to handle cases of fractional
                // repeats, and can always assume that a full
                // animation run has ended (with
                // nRelativeSimpleTime = 1.0 for
                // non-autoreversed activities).
                // with modf, nRelativeSimpleTime will never
                // become 1.0, since nRepeats is incremented and
                // nRelativeSimpleTime set to 0.0 then.
                //
                // For the animation to reach its final value,
                // nRepeats must although become this.nRepeats - 1.0,
                // and nRelativeSimpleTime = 1.0.
                nRelativeSimpleTime = 1.0;
                nRepeats -= 1.0;
            }
        }
        // actually perform something
        this.simplePerform(nRelativeSimpleTime, nRepeats);
        // delayed endActivity() call from end condition check
        // below. Issued after the simplePerform() call above, to
        // give animations the chance to correctly reach the
        // animation end value, without spurious bail-outs because
        // of isActive() returning false.
        if (bActivityEnding)
            this.endActivity();
        // one more frame successfully performed
        ++this.nCurrPerformCalls;
        return this.isActive();
    };
    SimpleContinuousActivityBase.prototype.simplePerform = function (nSimpleTime, nRepeatCount) {
        // empty body
    };
    return SimpleContinuousActivityBase;
}(ActivityBase));
//# sourceMappingURL=SimpleContinuousActivityBase.js.map