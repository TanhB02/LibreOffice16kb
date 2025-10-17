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
var InteractiveAnimationSequence = /** @class */ (function () {
    function InteractiveAnimationSequence(nNodeId, aSlideShow) {
        this.bIsRunning = false;
        this.aStartEvent = null;
        this.aEndEvent = null;
        this.nId = nNodeId;
        this.aSlideShow = aSlideShow;
        if (!this.aSlideShow) {
            window.app.console.log('InteractiveAnimationSequence.constructor: invalid slide show handler');
        }
    }
    InteractiveAnimationSequence.prototype.getId = function () {
        return this.nId;
    };
    InteractiveAnimationSequence.prototype.getStartEvent = function () {
        if (!this.aStartEvent) {
            this.aStartEvent = makeEvent(this.start.bind(this));
        }
        return this.aStartEvent;
    };
    InteractiveAnimationSequence.prototype.getEndEvent = function () {
        if (!this.aEndEvent) {
            this.aEndEvent = makeEvent(this.end.bind(this));
        }
        return this.aEndEvent;
    };
    InteractiveAnimationSequence.prototype.chargeEvents = function () {
        if (this.aStartEvent)
            this.aStartEvent.charge();
        if (this.aEndEvent)
            this.aEndEvent.charge();
    };
    InteractiveAnimationSequence.prototype.isRunning = function () {
        return this.bIsRunning;
    };
    InteractiveAnimationSequence.prototype.start = function () {
        this.aSlideShow.notifyInteractiveAnimationSequenceStart(this.getId());
        this.bIsRunning = true;
    };
    InteractiveAnimationSequence.prototype.end = function () {
        this.aSlideShow.notifyInteractiveAnimationSequenceEnd(this.getId());
        this.bIsRunning = false;
    };
    return InteractiveAnimationSequence;
}());
//# sourceMappingURL=InteractiveAnimationSequence.js.map