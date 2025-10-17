// @ts-strict-ignore
/* -*- js-indent-level: 8 -*- */
var EventMultiplexer = /** @class */ (function () {
    function EventMultiplexer(aTimerEventQueue) {
        this.aEventMap = new Map();
        this.aAnimationsEndHandler = null;
        this.aSkipEffectEndHandlerSet = [];
        this.aMouseClickHandlerSet = null;
        this.aSkipEffectEvent = null;
        this.aRewindCurrentEffectEvent = null;
        this.aRewindLastEffectEvent = null;
        this.aSkipInteractiveEffectEventSet = new Map();
        this.aRewindRunningInteractiveEffectEventSet = new Map();
        this.aRewindEndedInteractiveEffectEventSet = new Map();
        this.aRewindedEffectHandlerSet = new Map();
        this.aElementChangedHandlerSet = new Map();
        this.nId = EventMultiplexer.getUniqueId();
        this.aTimerEventQueue = aTimerEventQueue;
        this.aMouseClickHandlerSet = new PriorityQueue(PriorityEntry.compare);
    }
    EventMultiplexer.getUniqueId = function () {
        ++EventMultiplexer.CURR_UNIQUE_ID;
        return EventMultiplexer.CURR_UNIQUE_ID;
    };
    EventMultiplexer.prototype.clear = function () {
        this.aEventMap.clear();
        this.aEventMap = null;
        this.aSkipEffectEndHandlerSet = null;
        this.aMouseClickHandlerSet.clear();
        this.aMouseClickHandlerSet = null;
        this.aSkipInteractiveEffectEventSet.clear();
        this.aSkipInteractiveEffectEventSet = null;
        this.aRewindRunningInteractiveEffectEventSet.clear();
        this.aRewindRunningInteractiveEffectEventSet = null;
        this.aRewindEndedInteractiveEffectEventSet.clear();
        this.aRewindEndedInteractiveEffectEventSet = null;
        this.aRewindedEffectHandlerSet.clear();
        this.aRewindedEffectHandlerSet = null;
        this.aElementChangedHandlerSet.clear();
        this.aElementChangedHandlerSet = null;
    };
    EventMultiplexer.prototype.getId = function () {
        return this.nId;
    };
    EventMultiplexer.prototype.hasRegisteredMouseClickHandlers = function () {
        return !this.aMouseClickHandlerSet.isEmpty();
    };
    EventMultiplexer.prototype.registerMouseClickHandler = function (aHandler, nPriority) {
        var aHandlerEntry = new PriorityEntry(aHandler, nPriority);
        this.aMouseClickHandlerSet.push(aHandlerEntry);
    };
    EventMultiplexer.prototype.notifyMouseClick = function (aMouseEvent) {
        var aMouseClickHandlerSet = this.aMouseClickHandlerSet.clone();
        while (!aMouseClickHandlerSet.isEmpty()) {
            var aHandlerEntry = aMouseClickHandlerSet.top();
            aMouseClickHandlerSet.pop();
            if (aHandlerEntry.aValue && aHandlerEntry.aValue.handleClick) {
                if (aHandlerEntry.aValue.handleClick(aMouseEvent))
                    break;
            }
        }
    };
    EventMultiplexer.prototype.notifyMouseMove = function (aMouseEvent) {
        var aMouseClickHandlerSet = this.aMouseClickHandlerSet.clone();
        while (!aMouseClickHandlerSet.isEmpty()) {
            var aHandlerEntry = aMouseClickHandlerSet.top();
            aMouseClickHandlerSet.pop();
            if (aHandlerEntry.aValue && aHandlerEntry.aValue.onMouseMove) {
                if (aHandlerEntry.aValue.onMouseMove(aMouseEvent.x, aMouseEvent.y))
                    break;
            }
        }
    };
    EventMultiplexer.prototype.registerEvent = function (eEventType, aNotifierId, aEvent) {
        var sNotifierId = '' + aNotifierId;
        this.DBG('registerEvent', eEventType, sNotifierId);
        if (!this.aEventMap.has(eEventType)) {
            this.aEventMap.set(eEventType, new Map());
        }
        if (!this.aEventMap.get(eEventType).has(sNotifierId)) {
            this.aEventMap.get(eEventType).set(sNotifierId, []);
        }
        this.aEventMap.get(eEventType).get(sNotifierId).push(aEvent);
    };
    EventMultiplexer.prototype.notifyEvent = function (eEventType, aNotifierId) {
        var sNotifierId = '' + aNotifierId;
        this.DBG('notifyEvent', eEventType, sNotifierId);
        if (this.aEventMap.has(eEventType)) {
            if (this.aEventMap.get(eEventType).has(sNotifierId)) {
                var aEventArray = this.aEventMap.get(eEventType).get(sNotifierId);
                var nSize = aEventArray.length;
                for (var i = 0; i < nSize; ++i) {
                    this.aTimerEventQueue.addEvent(aEventArray[i]);
                }
            }
        }
    };
    EventMultiplexer.prototype.registerAnimationsEndHandler = function (aHandler) {
        this.aAnimationsEndHandler = aHandler;
    };
    EventMultiplexer.prototype.notifyAnimationsEndEvent = function () {
        if (this.aAnimationsEndHandler)
            this.aAnimationsEndHandler();
    };
    EventMultiplexer.prototype.registerNextEffectEndHandler = function (aHandler) {
        this.aSkipEffectEndHandlerSet.push(aHandler);
    };
    EventMultiplexer.prototype.notifyNextEffectEndEvent = function () {
        var nSize = this.aSkipEffectEndHandlerSet.length;
        for (var i = 0; i < nSize; ++i) {
            this.aSkipEffectEndHandlerSet[i]();
        }
        this.aSkipEffectEndHandlerSet = [];
    };
    EventMultiplexer.prototype.registerSkipEffectEvent = function (aEvent) {
        this.aSkipEffectEvent = aEvent;
    };
    EventMultiplexer.prototype.notifySkipEffectEvent = function () {
        if (this.aSkipEffectEvent) {
            this.aTimerEventQueue.addEvent(this.aSkipEffectEvent);
            this.aSkipEffectEvent = null;
        }
    };
    EventMultiplexer.prototype.registerRewindCurrentEffectEvent = function (aEvent) {
        this.aRewindCurrentEffectEvent = aEvent;
    };
    EventMultiplexer.prototype.notifyRewindCurrentEffectEvent = function () {
        if (this.aRewindCurrentEffectEvent) {
            this.aTimerEventQueue.addEvent(this.aRewindCurrentEffectEvent);
            this.aRewindCurrentEffectEvent = null;
        }
    };
    EventMultiplexer.prototype.registerRewindLastEffectEvent = function (aEvent) {
        this.aRewindLastEffectEvent = aEvent;
    };
    EventMultiplexer.prototype.notifyRewindLastEffectEvent = function () {
        if (this.aRewindLastEffectEvent) {
            this.aTimerEventQueue.addEvent(this.aRewindLastEffectEvent);
            this.aRewindLastEffectEvent = null;
        }
    };
    EventMultiplexer.prototype.registerSkipInteractiveEffectEvent = function (nNotifierId, aEvent) {
        this.aSkipInteractiveEffectEventSet.set(nNotifierId, aEvent);
    };
    EventMultiplexer.prototype.notifySkipInteractiveEffectEvent = function (nNotifierId) {
        if (this.aSkipInteractiveEffectEventSet.has(nNotifierId)) {
            this.aTimerEventQueue.addEvent(this.aSkipInteractiveEffectEventSet.get(nNotifierId));
        }
    };
    EventMultiplexer.prototype.registerRewindRunningInteractiveEffectEvent = function (nNotifierId, aEvent) {
        this.aRewindRunningInteractiveEffectEventSet.set(nNotifierId, aEvent);
    };
    EventMultiplexer.prototype.notifyRewindRunningInteractiveEffectEvent = function (nNotifierId) {
        if (this.aRewindRunningInteractiveEffectEventSet.has(nNotifierId)) {
            this.aTimerEventQueue.addEvent(this.aRewindRunningInteractiveEffectEventSet.get(nNotifierId));
        }
    };
    EventMultiplexer.prototype.registerRewindEndedInteractiveEffectEvent = function (nNotifierId, aEvent) {
        this.aRewindEndedInteractiveEffectEventSet.set(nNotifierId, aEvent);
    };
    EventMultiplexer.prototype.notifyRewindEndedInteractiveEffectEvent = function (nNotifierId) {
        if (this.aRewindEndedInteractiveEffectEventSet.has(nNotifierId)) {
            this.aTimerEventQueue.addEvent(this.aRewindEndedInteractiveEffectEventSet.get(nNotifierId));
        }
    };
    EventMultiplexer.prototype.registerRewindedEffectHandler = function (aNotifierId, aHandler) {
        var sNotifierId = '' + aNotifierId;
        this.aRewindedEffectHandlerSet.set(sNotifierId, aHandler);
    };
    EventMultiplexer.prototype.notifyRewindedEffectEvent = function (aNotifierId) {
        var sNotifierId = '' + aNotifierId;
        if (this.aRewindedEffectHandlerSet.has(sNotifierId)) {
            this.aRewindedEffectHandlerSet.get(sNotifierId)();
        }
    };
    EventMultiplexer.prototype.registerElementChangedHandler = function (aNotifierId, aHandler) {
        this.aElementChangedHandlerSet.set(aNotifierId, aHandler);
    };
    EventMultiplexer.prototype.notifyElementChangedEvent = function (aNotifierId, aElement) {
        if (this.aElementChangedHandlerSet.has(aNotifierId)) {
            this.aElementChangedHandlerSet.get(aNotifierId)(aElement);
        }
    };
    EventMultiplexer.prototype.DBG = function (sMethodName, eEventType, nNotifierId, nTime) {
        if (aEventMultiplexerDebugPrinter.isEnabled()) {
            var sInfo = 'EventMultiplexer.' + sMethodName;
            sInfo += '( type: ' + EventTrigger[eEventType];
            sInfo += ', notifier: ' + nNotifierId + ' )';
            aEventMultiplexerDebugPrinter.print(sInfo, nTime);
        }
    };
    EventMultiplexer.CURR_UNIQUE_ID = 0;
    return EventMultiplexer;
}());
//# sourceMappingURL=EventMultiplexer.js.map