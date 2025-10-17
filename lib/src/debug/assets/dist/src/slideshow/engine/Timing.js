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
var TimingType;
(function (TimingType) {
    TimingType[TimingType["Unknown"] = 0] = "Unknown";
    TimingType[TimingType["Offset"] = 1] = "Offset";
    TimingType[TimingType["WallClock"] = 2] = "WallClock";
    TimingType[TimingType["Indefinite"] = 3] = "Indefinite";
    TimingType[TimingType["Event"] = 4] = "Event";
    TimingType[TimingType["SyncBase"] = 5] = "SyncBase";
    TimingType[TimingType["Media"] = 6] = "Media";
})(TimingType || (TimingType = {}));
var EventTrigger;
(function (EventTrigger) {
    EventTrigger[EventTrigger["Unknown"] = 0] = "Unknown";
    EventTrigger[EventTrigger["OnBegin"] = 1] = "OnBegin";
    EventTrigger[EventTrigger["OnEnd"] = 2] = "OnEnd";
    EventTrigger[EventTrigger["BeginEvent"] = 3] = "BeginEvent";
    EventTrigger[EventTrigger["EndEvent"] = 4] = "EndEvent";
    EventTrigger[EventTrigger["OnClick"] = 5] = "OnClick";
    EventTrigger[EventTrigger["OnDblClick"] = 6] = "OnDblClick";
    EventTrigger[EventTrigger["OnMouseEnter"] = 7] = "OnMouseEnter";
    EventTrigger[EventTrigger["OnMouseLeave"] = 8] = "OnMouseLeave";
    EventTrigger[EventTrigger["OnNext"] = 9] = "OnNext";
    EventTrigger[EventTrigger["OnPrev"] = 10] = "OnPrev";
    EventTrigger[EventTrigger["Repeat"] = 11] = "Repeat";
})(EventTrigger || (EventTrigger = {}));
function getEventTriggerType(sEventTrigger) {
    if (sEventTrigger == 'BeginEvent')
        return EventTrigger.BeginEvent;
    else if (sEventTrigger == 'EndEvent')
        return EventTrigger.EndEvent;
    else if (sEventTrigger == 'OnNext')
        return EventTrigger.OnNext;
    else if (sEventTrigger == 'OnPrev')
        return EventTrigger.OnPrev;
    else if (sEventTrigger == 'OnClick')
        return EventTrigger.OnClick;
    else
        return EventTrigger.Unknown;
}
var Timing = /** @class */ (function () {
    function Timing(aAnimationNode, sTimingAttribute) {
        this.eTimingType = TimingType.Unknown;
        this.nOffset = 0.0;
        this.sEventBaseElementId = '';
        this.eEventType = EventTrigger.Unknown;
        this.aAnimationNode = aAnimationNode; // the node, the timing attribute belongs to
        this.sTimingDescription = removeWhiteSpaces(sTimingAttribute);
        this.nOffset = 0.0; // in seconds
        this.sEventBaseElementId = ''; // the element id for event based timing
    }
    Timing.prototype.getAnimationNode = function () {
        return this.aAnimationNode;
    };
    Timing.prototype.getType = function () {
        return this.eTimingType;
    };
    Timing.prototype.getOffset = function () {
        return this.nOffset;
    };
    Timing.prototype.getEventBaseElementId = function () {
        return this.sEventBaseElementId;
    };
    Timing.prototype.getEventType = function () {
        return this.eEventType;
    };
    Timing.prototype.parse = function () {
        if (!this.sTimingDescription) {
            this.eTimingType = TimingType.Offset;
            return;
        }
        if (this.sTimingDescription == 'indefinite')
            this.eTimingType = TimingType.Indefinite;
        else {
            var nFirstCharCode = this.sTimingDescription.charCodeAt(0);
            var bPositiveOffset = !(nFirstCharCode == Timing.CHARCODE_MINUS);
            if (nFirstCharCode == Timing.CHARCODE_PLUS ||
                nFirstCharCode == Timing.CHARCODE_MINUS ||
                (nFirstCharCode >= Timing.CHARCODE_0 &&
                    nFirstCharCode <= Timing.CHARCODE_9)) {
                var sClockValue = nFirstCharCode == Timing.CHARCODE_PLUS ||
                    nFirstCharCode == Timing.CHARCODE_MINUS
                    ? this.sTimingDescription.substring(1)
                    : this.sTimingDescription;
                var TimeInSec = Timing.parseClockValue(sClockValue);
                if (TimeInSec != undefined) {
                    this.eTimingType = TimingType.Offset;
                    this.nOffset = bPositiveOffset ? TimeInSec : -TimeInSec;
                }
            }
            else {
                var aTimingSplit = [];
                bPositiveOffset = true;
                if (this.sTimingDescription.indexOf('+') != -1) {
                    aTimingSplit = this.sTimingDescription.split('+');
                }
                else if (this.sTimingDescription.indexOf('-') != -1) {
                    aTimingSplit = this.sTimingDescription.split('-');
                    bPositiveOffset = false;
                }
                else {
                    aTimingSplit[0] = this.sTimingDescription;
                    aTimingSplit[1] = '';
                }
                if (aTimingSplit[0].indexOf('.') != -1) {
                    var aEventSplit = aTimingSplit[0].split('.');
                    this.sEventBaseElementId = aEventSplit[0];
                    this.eEventType = getEventTriggerType(aEventSplit[1]);
                }
                else {
                    this.eEventType = getEventTriggerType(aTimingSplit[0]);
                }
                if (this.eEventType == EventTrigger.Unknown)
                    return;
                if (this.eEventType == EventTrigger.BeginEvent ||
                    this.eEventType == EventTrigger.EndEvent) {
                    this.eTimingType = TimingType.SyncBase;
                }
                else {
                    this.eTimingType = TimingType.Event;
                }
                if (aTimingSplit[1]) {
                    var sClockValue = aTimingSplit[1];
                    var TimeInSec = Timing.parseClockValue(sClockValue);
                    if (TimeInSec != undefined) {
                        this.nOffset = bPositiveOffset ? TimeInSec : -TimeInSec;
                    }
                    else {
                        this.eTimingType = TimingType.Unknown;
                    }
                }
            }
        }
    };
    Timing.parseClockValue = function (sClockValue) {
        if (!sClockValue)
            return 0.0;
        var nTimeInSec = undefined;
        var reFullClockValue = /^([0-9]+):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?$/;
        var rePartialClockValue = /^([0-5][0-9]):([0-5][0-9])(.[0-9]+)?$/;
        var reTimeCountValue = /^([0-9]+)(.[0-9]+)?(h|min|s|ms)?$/;
        if (reFullClockValue.test(sClockValue)) {
            var aClockTimeParts = reFullClockValue.exec(sClockValue);
            var nHours = parseInt(aClockTimeParts[1]);
            var nMinutes = parseInt(aClockTimeParts[2]);
            var nSeconds = parseInt(aClockTimeParts[3]);
            if (aClockTimeParts[4])
                nSeconds += parseFloat(aClockTimeParts[4]);
            nTimeInSec = (nHours * 60 + nMinutes) * 60 + nSeconds;
        }
        else if (rePartialClockValue.test(sClockValue)) {
            var aClockTimeParts = rePartialClockValue.exec(sClockValue);
            var nMinutes = parseInt(aClockTimeParts[1]);
            var nSeconds = parseInt(aClockTimeParts[2]);
            if (aClockTimeParts[3])
                nSeconds += parseFloat(aClockTimeParts[3]);
            nTimeInSec = nMinutes * 60 + nSeconds;
        }
        else if (reTimeCountValue.test(sClockValue)) {
            var aClockTimeParts = reTimeCountValue.exec(sClockValue);
            var nTimeCount = parseInt(aClockTimeParts[1]);
            if (aClockTimeParts[2])
                nTimeCount += parseFloat(aClockTimeParts[2]);
            if (aClockTimeParts[3]) {
                if (aClockTimeParts[3] == 'h') {
                    nTimeInSec = nTimeCount * 3600;
                }
                else if (aClockTimeParts[3] == 'min') {
                    nTimeInSec = nTimeCount * 60;
                }
                else if (aClockTimeParts[3] == 's') {
                    nTimeInSec = nTimeCount;
                }
                else if (aClockTimeParts[3] == 'ms') {
                    nTimeInSec = nTimeCount / 1000;
                }
            }
            else {
                nTimeInSec = nTimeCount;
            }
        }
        if (nTimeInSec)
            nTimeInSec = parseFloat(nTimeInSec.toFixed(3));
        return nTimeInSec;
    };
    Timing.prototype.info = function (bVerbose) {
        if (bVerbose === void 0) { bVerbose = false; }
        var sInfo = '';
        if (bVerbose) {
            sInfo = 'description: ' + this.sTimingDescription + ', ';
            sInfo += ', type: ' + TimingType[this.getType()];
            sInfo += ', offset: ' + this.getOffset();
            sInfo += ', event base element id: ' + this.getEventBaseElementId();
            sInfo += ', timing event type: ' + EventTrigger[this.getEventType()];
        }
        else {
            switch (this.getType()) {
                case TimingType.Indefinite:
                    sInfo += 'indefinite';
                    break;
                case TimingType.Offset:
                    sInfo += this.getOffset();
                    break;
                case TimingType.Event:
                case TimingType.SyncBase:
                    if (this.getEventBaseElementId())
                        sInfo += this.getEventBaseElementId() + '.';
                    sInfo += EventTrigger[this.getEventType()];
                    if (this.getOffset()) {
                        if (this.getOffset() > 0)
                            sInfo += '+';
                        sInfo += this.getOffset();
                    }
                    break;
            }
        }
        return sInfo;
    };
    Timing.CHARCODE_PLUS = '+'.charCodeAt(0);
    Timing.CHARCODE_MINUS = '-'.charCodeAt(0);
    Timing.CHARCODE_0 = '0'.charCodeAt(0);
    Timing.CHARCODE_9 = '9'.charCodeAt(0);
    return Timing;
}());
//# sourceMappingURL=Timing.js.map