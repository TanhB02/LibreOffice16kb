// @ts-strict-ignore
/* -*- tab-width: 4 -*- */
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
var EventBase = /** @class */ (function () {
    function EventBase() {
        this.nId = EventBase.getUniqueId();
    }
    EventBase.getUniqueId = function () {
        ++EventBase.CURR_UNIQUE_ID;
        return EventBase.CURR_UNIQUE_ID;
    };
    EventBase.prototype.getId = function () {
        return this.nId;
    };
    EventBase.CURR_UNIQUE_ID = 0;
    return EventBase;
}());
var DelayEvent = /** @class */ (function (_super) {
    __extends(DelayEvent, _super);
    function DelayEvent(aFunctor, nTimeout) {
        var _this = _super.call(this) || this;
        _this.bWasFired = false;
        _this.aFunctor = aFunctor;
        _this.nTimeout = nTimeout;
        return _this;
    }
    DelayEvent.prototype.fire = function () {
        assert(this.isCharged(), 'DelayEvent.fire: assertion isCharged failed');
        this.bWasFired = true;
        this.aFunctor();
        return true;
    };
    DelayEvent.prototype.isCharged = function () {
        return !this.bWasFired;
    };
    DelayEvent.prototype.getActivationTime = function (nCurrentTime) {
        return this.nTimeout + nCurrentTime;
    };
    DelayEvent.prototype.dispose = function () {
        // don't clear unconditionally, because it may currently be executed:
        if (this.isCharged())
            this.bWasFired = true;
    };
    DelayEvent.prototype.charge = function () {
        if (!this.isCharged())
            this.bWasFired = false;
    };
    return DelayEvent;
}(EventBase));
var WakeupEvent = /** @class */ (function (_super) {
    __extends(WakeupEvent, _super);
    function WakeupEvent(aTimer, aActivityQueue) {
        var _this = _super.call(this) || this;
        _this.nNextTime = 0.0;
        _this.aActivity = null;
        _this.aTimer = new ElapsedTime(aTimer);
        _this.aActivityQueue = aActivityQueue;
        return _this;
    }
    WakeupEvent.prototype.clone = function () {
        var aWakeupEvent = new WakeupEvent(this.aTimer.getTimeBase(), this.aActivityQueue);
        aWakeupEvent.nNextTime = this.nNextTime;
        aWakeupEvent.aActivity = this.aActivity;
        return aWakeupEvent;
    };
    WakeupEvent.prototype.dispose = function () {
        this.aActivity = null;
    };
    WakeupEvent.prototype.fire = function () {
        if (!this.aActivity)
            return false;
        return this.aActivityQueue.addActivity(this.aActivity);
    };
    WakeupEvent.prototype.isCharged = function () {
        // this event won't expire, we fire every time we're
        // re-inserted into the event queue.
        return true;
    };
    WakeupEvent.prototype.getActivationTime = function (nCurrentTime) {
        var nElapsedTime = this.aTimer.getElapsedTime();
        return Math.max(nCurrentTime, nCurrentTime - nElapsedTime + this.nNextTime);
    };
    WakeupEvent.prototype.start = function () {
        this.aTimer.reset();
    };
    WakeupEvent.prototype.setNextTimeout = function (nNextTime) {
        this.nNextTime = nNextTime;
    };
    WakeupEvent.prototype.setActivity = function (aActivity) {
        this.aActivity = aActivity;
    };
    return WakeupEvent;
}(EventBase));
function makeEvent(aFunctor) {
    return new DelayEvent(aFunctor, 0.0);
}
function makeDelay(aFunctor, nTimeout) {
    return new DelayEvent(aFunctor, nTimeout);
}
function registerEvent(nNodeId, aSlideShow, aTiming, aEvent, aNodeContext) {
    var aSlideShowContext = aNodeContext.aContext;
    var eTimingType = aTiming.getType();
    aRegisterEventDebugPrinter.print('registerEvent( node id: ' + nNodeId + ', timing: ' + aTiming.info() + ' )');
    if (eTimingType == TimingType.Offset) {
        aSlideShowContext.aTimerEventQueue.addEvent(aEvent);
    }
    else if (aNodeContext.bFirstRun) {
        var aEventMultiplexer = aSlideShowContext.aEventMultiplexer;
        if (!aEventMultiplexer) {
            window.app.console.log('registerEvent: event multiplexer not initialized');
            return;
        }
        var aNextEffectEventArray = aSlideShowContext.aNextEffectEventArray;
        if (!aNextEffectEventArray) {
            window.app.console.log('registerEvent: next effect event array not initialized');
            return;
        }
        var aInteractiveAnimationSequenceMap = aSlideShowContext.aInteractiveAnimationSequenceMap;
        if (!aInteractiveAnimationSequenceMap) {
            window.app.console.log('registerEvent: interactive animation sequence map not initialized');
            return;
        }
        switch (eTimingType) {
            case TimingType.Event:
                {
                    var eEventType = aTiming.getEventType();
                    var sEventBaseElemId = aTiming.getEventBaseElementId();
                    if (sEventBaseElemId) {
                        var aSourceEventElement = aNodeContext.makeSourceEventElement(sEventBaseElemId, aSlideShow);
                        if (!aInteractiveAnimationSequenceMap.has(nNodeId)) {
                            aInteractiveAnimationSequenceMap.set(nNodeId, new InteractiveAnimationSequence(nNodeId, aSlideShow));
                        }
                        var bEventRegistered = false;
                        switch (eEventType) {
                            case EventTrigger.OnClick:
                                aEventMultiplexer.registerEvent(eEventType, aSourceEventElement.getId(), aEvent);
                                aEventMultiplexer.registerRewindedEffectHandler(aSourceEventElement.getId(), aSourceEventElement.charge.bind(aSourceEventElement));
                                bEventRegistered = true;
                                break;
                            default:
                                window.app.console.log('generateEvent: not handled event type: ' + eEventType);
                        }
                        if (bEventRegistered) {
                            var aStartEvent = aInteractiveAnimationSequenceMap
                                .get(nNodeId)
                                .getStartEvent();
                            var aEndEvent = aInteractiveAnimationSequenceMap
                                .get(nNodeId)
                                .getEndEvent();
                            aEventMultiplexer.registerEvent(eEventType, aSourceEventElement.getId(), aStartEvent);
                            aEventMultiplexer.registerEvent(EventTrigger.EndEvent, nNodeId, aEndEvent);
                            aEventMultiplexer.registerRewindedEffectHandler(nNodeId, aInteractiveAnimationSequenceMap
                                .get(nNodeId)
                                .chargeEvents.bind(aInteractiveAnimationSequenceMap.get(nNodeId)));
                        }
                    } // no base event element present
                    else {
                        switch (eEventType) {
                            case EventTrigger.OnNext:
                                aNextEffectEventArray.appendEvent(aEvent);
                                break;
                            default:
                                window.app.console.log('registerEvent: not handled event type: ' + eEventType);
                        }
                    }
                }
                break;
            case TimingType.SyncBase:
                {
                    var eEventType = aTiming.getEventType();
                    var sEventBaseElemId = aTiming.getEventBaseElementId();
                    if (sEventBaseElemId) {
                        var aAnimationNode = aNodeContext.aAnimationNodeMap.get(sEventBaseElemId);
                        if (!aAnimationNode) {
                            window.app.console.log('registerEvent: TimingType.SyncBase: event base element not found: ' +
                                sEventBaseElemId);
                            return;
                        }
                        aEventMultiplexer.registerEvent(eEventType, aAnimationNode.getId(), aEvent);
                    }
                    else {
                        window.app.console.log('registerEvent: TimingType.SyncBase: event base element not specified');
                    }
                }
                break;
            default:
                window.app.console.log('registerEvent: not handled timing type: ' + eTimingType);
        }
    }
}
//# sourceMappingURL=Event.js.map