/* -*- js-indent-level: 8 -*- */
/*
 * Copyright the Collabora Online contributors.
 *
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var TimerEventQueue = /** @class */ (function () {
    function TimerEventQueue(aTimer) {
        this.aTimer = aTimer;
        this.aEventSet = new PriorityQueue(EventEntry.compare);
    }
    TimerEventQueue.prototype.addEvent = function (aEvent) {
        this.DBG('TimerEventQueue.addEvent event(' + aEvent.getId() + ') appended.');
        if (!aEvent) {
            window.app.console.log('TimerEventQueue.addEvent: null event');
            return false;
        }
        var nTime = aEvent.getActivationTime(this.aTimer.getElapsedTime());
        var aEventEntry = new EventEntry(aEvent, nTime);
        this.aEventSet.push(aEventEntry);
        return true;
    };
    TimerEventQueue.prototype.forceEmpty = function () {
        this.process_(true);
    };
    TimerEventQueue.prototype.process = function () {
        this.process_(false);
    };
    TimerEventQueue.prototype.process_ = function (bFireAllEvents) {
        var nCurrentTime = this.aTimer.getElapsedTime();
        while (!this.isEmpty() &&
            (bFireAllEvents || this.aEventSet.top().nActivationTime <= nCurrentTime)) {
            var aEventEntry = this.aEventSet.top();
            this.aEventSet.pop();
            var aEvent = aEventEntry.aEvent;
            if (aEvent.isCharged())
                aEvent.fire();
        }
    };
    TimerEventQueue.prototype.isEmpty = function () {
        return this.aEventSet.isEmpty();
    };
    TimerEventQueue.prototype.nextTimeout = function () {
        var nTimeout = Number.MAX_VALUE;
        var nCurrentTime = this.aTimer.getElapsedTime();
        if (!this.isEmpty())
            nTimeout = this.aEventSet.top().nActivationTime - nCurrentTime;
        return nTimeout;
    };
    TimerEventQueue.prototype.clear = function () {
        this.DBG('TimerEventQueue.clear invoked');
        this.aEventSet.clear();
    };
    TimerEventQueue.prototype.getTimer = function () {
        return this.aTimer;
    };
    TimerEventQueue.prototype.DBG = function (sMessage, nTime) {
        aTimerEventQueueDebugPrinter.print(sMessage, nTime);
    };
    return TimerEventQueue;
}());
var EventEntry = /** @class */ (function () {
    function EventEntry(aEvent, nTime) {
        this.aEvent = aEvent;
        this.nActivationTime = nTime;
    }
    EventEntry.compare = function (aLhsEventEntry, aRhsEventEntry) {
        if (aLhsEventEntry.nActivationTime > aRhsEventEntry.nActivationTime) {
            return -1;
        }
        else if (aLhsEventEntry.nActivationTime < aRhsEventEntry.nActivationTime) {
            return 1;
        }
        else {
            return 0;
        }
    };
    return EventEntry;
}());
//# sourceMappingURL=TimerEventQueue.js.map