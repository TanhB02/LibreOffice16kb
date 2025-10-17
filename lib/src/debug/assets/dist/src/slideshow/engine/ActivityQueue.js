// @ts-strict-ignore
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
var ActivityQueue = /** @class */ (function () {
    function ActivityQueue(aTimer) {
        this.aTimer = aTimer;
        this.aCurrentActivityWaitingSet = [];
        this.aCurrentActivityReinsertSet = [];
        this.aDequeuedActivitySet = [];
    }
    ActivityQueue.prototype.addActivity = function (aActivity) {
        if (!aActivity) {
            window.app.console.log('ActivityQueue.addActivity: activity is not valid');
            return false;
        }
        this.aCurrentActivityWaitingSet.push(aActivity);
        aActivityQueueDebugPrinter.print('ActivityQueue.addActivity: activity appended');
        return true;
    };
    ActivityQueue.prototype.process = function () {
        var nSize = this.aCurrentActivityWaitingSet.length;
        var nLag = 0.0;
        for (var i = 0; i < nSize; ++i) {
            nLag = Math.max(nLag, this.aCurrentActivityWaitingSet[i].calcTimeLag());
        }
        if (nLag > 0.0)
            this.aTimer.adjustTimer(-nLag);
        while (this.aCurrentActivityWaitingSet.length != 0) {
            var aActivity = this.aCurrentActivityWaitingSet.shift();
            var bReinsert = false;
            bReinsert = aActivity.perform();
            if (bReinsert) {
                this.aCurrentActivityReinsertSet.push(aActivity);
            }
            else {
                this.aDequeuedActivitySet.push(aActivity);
            }
        }
        if (this.aCurrentActivityReinsertSet.length != 0) {
            // TODO: optimization, try to swap reference here
            this.aCurrentActivityWaitingSet = this.aCurrentActivityReinsertSet;
            this.aCurrentActivityReinsertSet = [];
        }
    };
    ActivityQueue.prototype.processDequeued = function () {
        // notify all dequeued activities from last round
        var nSize = this.aDequeuedActivitySet.length;
        for (var i = 0; i < nSize; ++i)
            this.aDequeuedActivitySet[i].dequeued();
        this.aDequeuedActivitySet = [];
    };
    ActivityQueue.prototype.isEmpty = function () {
        return (this.aCurrentActivityWaitingSet.length == 0 &&
            this.aCurrentActivityReinsertSet.length == 0);
    };
    ActivityQueue.prototype.clear = function () {
        aActivityQueueDebugPrinter.print('ActivityQueue.clear invoked');
        var nSize = this.aCurrentActivityWaitingSet.length;
        for (var i = 0; i < nSize; ++i)
            this.aCurrentActivityWaitingSet[i].dequeued();
        this.aCurrentActivityWaitingSet = [];
        nSize = this.aCurrentActivityReinsertSet.length;
        for (var i = 0; i < nSize; ++i)
            this.aCurrentActivityReinsertSet[i].dequeued();
        this.aCurrentActivityReinsertSet = [];
    };
    ActivityQueue.prototype.endAll = function () {
        aActivityQueueDebugPrinter.print('ActivityQueue.endAll invoked');
        var nSize = this.aCurrentActivityWaitingSet.length;
        for (var i = 0; i < nSize; ++i)
            this.aCurrentActivityWaitingSet[i].end();
        this.aCurrentActivityWaitingSet = [];
        nSize = this.aCurrentActivityReinsertSet.length;
        for (var i = 0; i < nSize; ++i)
            this.aCurrentActivityReinsertSet[i].end();
        this.aCurrentActivityReinsertSet = [];
    };
    ActivityQueue.prototype.getTimer = function () {
        return this.aTimer;
    };
    ActivityQueue.prototype.size = function () {
        return (this.aCurrentActivityWaitingSet.length +
            this.aCurrentActivityReinsertSet.length +
            this.aDequeuedActivitySet.length);
    };
    return ActivityQueue;
}());
//# sourceMappingURL=ActivityQueue.js.map