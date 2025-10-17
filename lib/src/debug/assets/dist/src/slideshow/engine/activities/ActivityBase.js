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
var ActivityBase = /** @class */ (function (_super) {
    __extends(ActivityBase, _super);
    function ActivityBase(aCommonParamSet) {
        var _this = _super.call(this) || this;
        _this.aTargetElement = null;
        _this.aEndEvent = aCommonParamSet.aEndEvent;
        _this.aTimerEventQueue = aCommonParamSet.aTimerEventQueue;
        _this.nRepeats = aCommonParamSet.nRepeatCount;
        _this.nAccelerationFraction = aCommonParamSet.nAccelerationFraction;
        _this.nDecelerationFraction = aCommonParamSet.nDecelerationFraction;
        _this.bAutoReverse = aCommonParamSet.bAutoReverse;
        _this.bFirstPerformCall = true;
        _this.bIsActive = true;
        return _this;
    }
    ActivityBase.prototype.activate = function (aEndEvent) {
        this.aEndEvent = aEndEvent;
        this.bFirstPerformCall = true;
        this.bIsActive = true;
    };
    ActivityBase.prototype.dispose = function () {
        // deactivate
        this.bIsActive = false;
        // dispose event
        if (this.aEndEvent)
            this.aEndEvent.dispose();
        this.aEndEvent = null;
    };
    ActivityBase.prototype.perform = function () {
        // still active?
        if (!this.isActive())
            return false; // no, early exit.
        assert(!this.bFirstPerformCall, 'ActivityBase.perform: assertion (!this.FirstPerformCall) failed');
        return true;
    };
    ActivityBase.prototype.calcTimeLag = function () {
        // TODO: implement different init process!
        if (this.isActive() && this.bFirstPerformCall) {
            this.bFirstPerformCall = false;
            // notify derived classes that we're
            // starting now
            this.startAnimation();
        }
        return 0.0;
    };
    ActivityBase.prototype.isActive = function () {
        return this.bIsActive;
    };
    ActivityBase.prototype.isDisposed = function () {
        return !this.bIsActive && !this.aEndEvent;
    };
    ActivityBase.prototype.dequeued = function () {
        if (!this.isActive())
            this.endAnimation();
    };
    ActivityBase.prototype.setTargets = function (aTargetElement) {
        assert(aTargetElement, 'ActivityBase.setTargets: target element is not valid');
        this.aTargetElement = aTargetElement;
    };
    // public abstract startAnimation(): void;
    ActivityBase.prototype.startAnimation = function () {
        throw 'ActivityBase.startAnimation: abstract method invoked';
    };
    // public endAnimation(): void {
    // 	// TODO throw abstract
    // }
    ActivityBase.prototype.endActivity = function () {
        // this is a regular activity end
        this.bIsActive = false;
        // Activity is ending, queue event, then
        if (this.aEndEvent)
            this.aTimerEventQueue.addEvent(this.aEndEvent);
        this.aEndEvent = null;
    };
    ActivityBase.prototype.calcAcceleratedTime = function (nT) {
        // Handle acceleration/deceleration
        // clamp nT to permissible [0,1] range
        nT = clampN(nT, 0.0, 1.0);
        // take acceleration/deceleration into account. if the sum
        // of nAccelerationFraction and nDecelerationFraction
        // exceeds 1.0, ignore both (that's according to SMIL spec)
        if ((this.nAccelerationFraction > 0.0 || this.nDecelerationFraction > 0.0) &&
            this.nAccelerationFraction + this.nDecelerationFraction <= 1.0) {
            var nC = 1.0 -
                0.5 * this.nAccelerationFraction -
                0.5 * this.nDecelerationFraction;
            // this variable accumulates the new time value
            var nTPrime = 0.0;
            if (nT < this.nAccelerationFraction) {
                nTPrime += (0.5 * nT * nT) / this.nAccelerationFraction; // partial first interval
            }
            else {
                nTPrime += 0.5 * this.nAccelerationFraction; // full first interval
                if (nT <= 1.0 - this.nDecelerationFraction) {
                    nTPrime += nT - this.nAccelerationFraction; // partial second interval
                }
                else {
                    nTPrime +=
                        1.0 - this.nAccelerationFraction - this.nDecelerationFraction; // full second interval
                    var nTRelative = nT - 1.0 + this.nDecelerationFraction;
                    nTPrime +=
                        nTRelative -
                            (0.5 * nTRelative * nTRelative) / this.nDecelerationFraction;
                }
            }
            // normalize, and assign to work variable
            nT = nTPrime / nC;
        }
        return nT;
    };
    ActivityBase.prototype.getEventQueue = function () {
        return this.aTimerEventQueue;
    };
    ActivityBase.prototype.getTargetElement = function () {
        return this.aTargetElement;
    };
    ActivityBase.prototype.isRepeatCountValid = function () {
        return !!this.nRepeats; // first ! convert to bool
    };
    ActivityBase.prototype.getRepeatCount = function () {
        return this.nRepeats;
    };
    ActivityBase.prototype.isAutoReverse = function () {
        return this.bAutoReverse;
    };
    ActivityBase.prototype.end = function () {
        if (!this.isActive() || this.isDisposed())
            return;
        // assure animation is started:
        if (this.bFirstPerformCall) {
            this.bFirstPerformCall = false;
            // notify derived classes that we're starting now
            this.startAnimation();
        }
        this.performEnd();
        this.endAnimation();
        this.endActivity();
    };
    return ActivityBase;
}(AnimationActivity));
//# sourceMappingURL=ActivityBase.js.map