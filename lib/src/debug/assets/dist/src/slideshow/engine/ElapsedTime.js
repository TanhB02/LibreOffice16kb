// @ts-strict-ignore
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
var ElapsedTime = /** @class */ (function () {
    function ElapsedTime(aTimeBase) {
        this.aTimeBase = null;
        this.aTimeBase = aTimeBase;
        this.reset();
    }
    ElapsedTime.prototype.getTimeBase = function () {
        return this.aTimeBase;
    };
    ElapsedTime.prototype.reset = function () {
        this.nLastQueriedTime = 0.0;
        this.nStartTime = this.getCurrentTime();
        this.nFrozenTime = 0.0;
        this.bInPauseMode = false;
        this.bInHoldMode = false;
    };
    ElapsedTime.prototype.getElapsedTime = function () {
        this.nLastQueriedTime = this.getElapsedTimeImpl();
        return this.nLastQueriedTime;
    };
    ElapsedTime.prototype.pauseTimer = function () {
        this.nFrozenTime = this.getElapsedTimeImpl();
        this.bInPauseMode = true;
    };
    ElapsedTime.prototype.continueTimer = function () {
        this.bInPauseMode = false;
        // stop pausing, time runs again. Note that
        // getElapsedTimeImpl() honors hold mode, i.e. a
        // continueTimer() in hold mode will preserve the latter
        var nPauseDuration = this.getElapsedTimeImpl() - this.nFrozenTime;
        // adjust start time, such that subsequent getElapsedTime() calls
        // will virtually start from m_fFrozenTime.
        this.nStartTime += nPauseDuration;
    };
    ElapsedTime.prototype.adjustTimer = function (nOffset) {
        // to make getElapsedTime() become _larger_, have to reduce nStartTime.
        this.nStartTime -= nOffset;
        // also adjust frozen time, this method must _always_ affect the
        // value returned by getElapsedTime()!
        if (this.bInHoldMode || this.bInPauseMode)
            this.nFrozenTime += nOffset;
    };
    ElapsedTime.prototype.holdTimer = function () {
        // when called during hold mode (e.g. more than once per time
        // object), the original hold time will be maintained.
        this.nFrozenTime = this.getElapsedTimeImpl();
        this.bInHoldMode = true;
    };
    ElapsedTime.prototype.releaseTimer = function () {
        this.bInHoldMode = false;
    };
    ElapsedTime.prototype.getSystemTime = function () {
        return getCurrentSystemTime() / 1000.0;
    };
    ElapsedTime.prototype.getCurrentTime = function () {
        var nCurrentTime;
        if (!this.aTimeBase) {
            nCurrentTime = this.getSystemTime();
        }
        else {
            nCurrentTime = this.aTimeBase.getElapsedTimeImpl();
        }
        assert(typeof nCurrentTime === typeof 0 && isFinite(nCurrentTime), 'ElapsedTime.getCurrentTime: assertion failed: nCurrentTime == ' +
            nCurrentTime);
        return nCurrentTime;
    };
    ElapsedTime.prototype.getElapsedTimeImpl = function () {
        if (this.bInHoldMode || this.bInPauseMode) {
            return this.nFrozenTime;
        }
        var nCurTime = this.getCurrentTime();
        return nCurTime - this.nStartTime;
    };
    return ElapsedTime;
}());
//# sourceMappingURL=ElapsedTime.js.map