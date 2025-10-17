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
var DiscreteActivityBase = /** @class */ (function (_super) {
    __extends(DiscreteActivityBase, _super);
    function DiscreteActivityBase(aCommonParamSet) {
        var _this = _super.call(this, aCommonParamSet) || this;
        _this.aOriginalWakeupEvent = aCommonParamSet.aWakeupEvent;
        _this.aOriginalWakeupEvent.setActivity(_this);
        _this.aWakeupEvent = _this.aOriginalWakeupEvent;
        _this.aWakeupEvent = aCommonParamSet.aWakeupEvent;
        _this.aDiscreteTimes = aCommonParamSet.aDiscreteTimes;
        // Simple duration of activity
        _this.nMinSimpleDuration = aCommonParamSet.nMinDuration;
        // Actual number of frames shown until now.
        _this.nCurrPerformCalls = 0;
        return _this;
    }
    DiscreteActivityBase.prototype.activate = function (aEndElement) {
        _super.prototype.activate.call(this, aEndElement);
        this.aWakeupEvent = this.aOriginalWakeupEvent;
        this.aWakeupEvent.setNextTimeout(0);
        this.nCurrPerformCalls = 0;
    };
    DiscreteActivityBase.prototype.startAnimation = function () {
        this.aWakeupEvent.start();
    };
    DiscreteActivityBase.prototype.calcFrameIndex = function (nCurrCalls, nVectorSize) {
        if (this.isAutoReverse()) {
            // every full repeat run consists of one
            // forward and one backward traversal.
            var nFrameIndex = nCurrCalls % (2 * nVectorSize);
            // nFrameIndex values >= nVectorSize belong to
            // the backward traversal
            if (nFrameIndex >= nVectorSize)
                nFrameIndex = 2 * nVectorSize - nFrameIndex; // invert sweep
            return nFrameIndex;
        }
        else {
            return nCurrCalls % nVectorSize;
        }
    };
    DiscreteActivityBase.prototype.calcRepeatCount = function (nCurrCalls, nVectorSize) {
        if (this.isAutoReverse()) {
            return Math.floor(nCurrCalls / (2 * nVectorSize)); // we've got 2 cycles per repeat
        }
        else {
            return Math.floor(nCurrCalls / nVectorSize);
        }
    };
    // protected performDiscreteHook(nFrame: number, nRepeatCount: number): void {
    // 	// TODO throw abstract
    // }
    DiscreteActivityBase.prototype.perform = function () {
        // call base class, for start() calls and end handling
        if (!_super.prototype.perform.call(this))
            return false; // done, we're ended
        var nVectorSize = this.aDiscreteTimes.length;
        var nFrameIndex = this.calcFrameIndex(this.nCurrPerformCalls, nVectorSize);
        var nRepeatCount = this.calcRepeatCount(this.nCurrPerformCalls, nVectorSize);
        this.performDiscreteHook(nFrameIndex, nRepeatCount);
        // one more frame successfully performed
        ++this.nCurrPerformCalls;
        // calc currently reached repeat count
        var nCurrRepeat = this.nCurrPerformCalls / nVectorSize;
        // if auto-reverse is specified, halve the
        // effective repeat count, since we pass every
        // repeat run twice: once forward, once backward.
        if (this.isAutoReverse())
            nCurrRepeat /= 2;
        // schedule next frame, if either repeat is indefinite
        // (repeat forever), or we've not yet reached the requested
        // repeat count
        if (!this.isRepeatCountValid() || nCurrRepeat < this.getRepeatCount()) {
            // add wake-up event to queue (modulo vector size, to cope with repeats).
            // repeat is handled locally, only apply acceleration/deceleration.
            // Scale time vector with simple duration, offset with full repeat
            // times.
            // Note that calcAcceleratedTime() is only applied to the current repeat's value,
            // not to the total resulting time. This is in accordance with the SMIL spec.
            var nFrameIndex_1 = this.calcFrameIndex(this.nCurrPerformCalls, nVectorSize);
            var nCurrentRepeatTime = this.aDiscreteTimes[nFrameIndex_1];
            var nRepeatCount_1 = this.calcRepeatCount(this.nCurrPerformCalls, nVectorSize);
            var nNextTimeout = this.nMinSimpleDuration *
                (nRepeatCount_1 + this.calcAcceleratedTime(nCurrentRepeatTime));
            this.aWakeupEvent.setNextTimeout(nNextTimeout);
            this.getEventQueue().addEvent(this.aWakeupEvent);
        }
        else {
            // release event reference (relation to wake up event is circular!)
            this.aWakeupEvent = null;
            // done with this activity
            this.endActivity();
        }
        return false; // remove from queue, will be added back by the wakeup event.
    };
    DiscreteActivityBase.prototype.dispose = function () {
        // dispose event
        if (this.aWakeupEvent)
            this.aWakeupEvent.dispose();
        // release references
        this.aWakeupEvent = null;
        _super.prototype.dispose.call(this);
    };
    return DiscreteActivityBase;
}(ActivityBase));
//# sourceMappingURL=DiscreteActivityBase.js.map