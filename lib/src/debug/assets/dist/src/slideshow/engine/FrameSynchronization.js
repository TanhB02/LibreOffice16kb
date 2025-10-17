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
var FrameSynchronization = /** @class */ (function () {
    function FrameSynchronization(nFrameDuration) {
        this.aTimer = new ElapsedTime();
        this.nNextFrameTargetTime = 0.0;
        this.bIsActive = false;
        this.nFrameDuration = nFrameDuration;
        this.markCurrentFrame();
    }
    FrameSynchronization.prototype.markCurrentFrame = function () {
        this.nNextFrameTargetTime =
            this.aTimer.getElapsedTime() + this.nFrameDuration;
    };
    FrameSynchronization.prototype.synchronize = function () {
        if (this.bIsActive) {
            // Do busy waiting for now.
            while (this.aTimer.getElapsedTime() < this.nNextFrameTargetTime)
                ;
        }
        this.markCurrentFrame();
    };
    FrameSynchronization.prototype.activate = function () {
        this.bIsActive = true;
    };
    FrameSynchronization.prototype.deactivate = function () {
        this.bIsActive = false;
    };
    return FrameSynchronization;
}());
//# sourceMappingURL=FrameSynchronization.js.map