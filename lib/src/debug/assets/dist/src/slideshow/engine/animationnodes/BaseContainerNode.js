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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
/*
 * Copyright the Collabora Online contributors.
 *
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var BaseContainerNode = /** @class */ (function (_super) {
    __extends(BaseContainerNode, _super);
    function BaseContainerNode(aNodeInfo, aParentNode, aNodeContext) {
        var _this = _super.call(this, aNodeInfo, aParentNode, aNodeContext) || this;
        _this.bIsEffect = false;
        _this.sClassName = 'BaseContainerNode';
        _this.bIsContainer = true;
        _this.aChildrenArray = [];
        _this.nFinishedChildren = 0;
        _this.bDurationIndefinite = false;
        _this.nLeftIterations = 1;
        _this.eImpressNodeType = undefined;
        return _this;
    }
    BaseContainerNode.prototype.parseNodeInfo = function () {
        var e_1, _a;
        _super.prototype.parseNodeInfo.call(this);
        var aNodeInfo = this.aNodeInfo;
        if (this.getParentNode() && this.getParentNode().isMainSequenceRootNode()) {
            if (this.getBegin().getEventType() !== EventTrigger.OnNext) {
                this.bIsFirstAutoEffect = true;
            }
        }
        // nodeType property
        this.eImpressNodeType = ImpressNodeType.Default;
        if (aNodeInfo.nodeType && aNodeInfo.nodeType in ImpressNodeType) {
            var sImpressNodeType = aNodeInfo.nodeType;
            this.eImpressNodeType = ImpressNodeType[sImpressNodeType];
        }
        this.bIsMainSequenceRootNode =
            this.eImpressNodeType === ImpressNodeType.MainSequence;
        this.bIsInteractiveSequenceRootNode =
            this.eImpressNodeType === ImpressNodeType.InteractiveSequence;
        this.bIsEffect = !!this.aNodeInfo.presetId;
        try {
            for (var _b = __values(this.aChildrenArray), _c = _b.next(); !_c.done; _c = _b.next()) {
                var childNode = _c.value;
                childNode.parseNodeInfo();
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        // resolve duration
        this.bDurationIndefinite =
            (!this.getDuration() || this.getDuration().isIndefinite()) &&
                (!this.getEnd() || this.getEnd().getType() != TimingType.Offset);
    };
    BaseContainerNode.prototype.appendChildNode = function (aAnimationNode) {
        if (!this.checkValidNode())
            return;
        if (aAnimationNode.registerDeactivatingListener(this))
            this.aChildrenArray.push(aAnimationNode);
    };
    BaseContainerNode.prototype.removeAllChildrenNodes = function () {
        this.aChildrenArray = [];
    };
    BaseContainerNode.prototype.init_st = function () {
        this.nLeftIterations = this.getRepeatCount();
        return this.init_children();
    };
    BaseContainerNode.prototype.init_children = function () {
        this.nFinishedChildren = 0;
        var nChildrenCount = this.aChildrenArray.length;
        var nInitChildren = 0;
        for (var i = 0; i < nChildrenCount; ++i) {
            if (this.aChildrenArray[i].init()) {
                ++nInitChildren;
            }
        }
        return nChildrenCount === nInitChildren;
    };
    BaseContainerNode.prototype.deactivate_st = function (eDestState) {
        this.nLeftIterations = 0;
        if (eDestState === NodeState.Frozen) {
            // deactivate all children that are not FROZEN or ENDED:
            this.forEachChildNode(BaseNode.prototype.deactivate, ~(NodeState.Frozen | NodeState.Ended));
        }
        else {
            // end all children that are not ENDED:
            this.forEachChildNode(BaseNode.prototype.end, ~NodeState.Ended);
            if (this.getFillMode() === FillModes.Remove)
                this.removeEffect();
        }
    };
    BaseContainerNode.prototype.hasPendingAnimation = function () {
        var nChildrenCount = this.aChildrenArray.length;
        for (var i = 0; i < nChildrenCount; ++i) {
            if (this.aChildrenArray[i].hasPendingAnimation())
                return true;
        }
        return false;
    };
    BaseContainerNode.prototype.isDurationIndefinite = function () {
        return this.bDurationIndefinite;
    };
    BaseContainerNode.prototype.isChildNode = function (aAnimationNode) {
        var nChildrenCount = this.aChildrenArray.length;
        for (var i = 0; i < nChildrenCount; ++i) {
            if (this.aChildrenArray[i].getId() == aAnimationNode.getId())
                return true;
        }
        return false;
    };
    BaseContainerNode.prototype.notifyDeactivatedChild = function (aChildNode) {
        assert(aChildNode.getState() == NodeState.Frozen ||
            aChildNode.getState() == NodeState.Ended, 'BaseContainerNode.notifyDeactivatedChild: passed child node is neither in FROZEN nor in ENDED state');
        assert(this.getState() !== NodeState.Invalid, 'BaseContainerNode.notifyDeactivatedChild: this node is invalid');
        if (!this.isChildNode(aChildNode)) {
            window.app.console.log('BaseContainerNode.notifyDeactivatedChild: unknown child notifier!');
            return false;
        }
        var nChildrenCount = this.aChildrenArray.length;
        assert(this.nFinishedChildren < nChildrenCount, 'BaseContainerNode.notifyDeactivatedChild: assert(this.nFinishedChildren < nChildrenCount) failed');
        ++this.nFinishedChildren;
        var bFinished = this.nFinishedChildren >= nChildrenCount;
        if (bFinished && this.isDurationIndefinite()) {
            if (this.nLeftIterations >= 1.0) {
                this.nLeftIterations -= 1.0;
            }
            if (this.nLeftIterations >= 1.0) {
                bFinished = false;
                var aRepetitionEvent = makeDelay(this.repeat.bind(this), 0.0);
                this.aContext.aTimerEventQueue.addEvent(aRepetitionEvent);
            }
            else {
                this.deactivate();
            }
        }
        return bFinished;
    };
    BaseContainerNode.prototype.repeat = function () {
        // end all children that are not ENDED:
        this.forEachChildNode(BaseNode.prototype.end, ~NodeState.Ended);
        this.removeEffect();
        var bInitialized = this.init_children();
        if (bInitialized)
            this.activate_st();
        return bInitialized;
    };
    BaseContainerNode.prototype.removeEffect = function () {
        var nChildrenCount = this.aChildrenArray.length;
        if (nChildrenCount == 0)
            return;
        // We remove effect in reverse order.
        for (var i = nChildrenCount - 1; i >= 0; --i) {
            if ((this.aChildrenArray[i].getState() &
                (NodeState.Frozen | NodeState.Ended)) ==
                0) {
                window.app.console.log('BaseContainerNode.removeEffect: child(id:' +
                    this.aChildrenArray[i].getId() +
                    ') is neither frozen nor ended;' +
                    ' state: ' +
                    NodeState[this.aChildrenArray[i].getState()]);
                continue;
            }
            this.aChildrenArray[i].removeEffect();
        }
    };
    BaseContainerNode.prototype.saveStateOfAnimatedElement = function () {
        var nChildrenCount = this.aChildrenArray.length;
        for (var i = 0; i < nChildrenCount; ++i) {
            this.aChildrenArray[i].saveStateOfAnimatedElement();
        }
    };
    BaseContainerNode.prototype.forEachChildNode = function (aFunction, eNodeStateMask) {
        var e_2, _a;
        if (!eNodeStateMask)
            eNodeStateMask = -1;
        try {
            for (var _b = __values(this.aChildrenArray), _c = _b.next(); !_c.done; _c = _b.next()) {
                var childNode = _c.value;
                if (eNodeStateMask != -1 && (childNode.getState() & eNodeStateMask) == 0)
                    continue;
                aFunction.call(childNode);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    BaseContainerNode.prototype.getImpressNodeType = function () {
        return this.eImpressNodeType;
    };
    BaseContainerNode.prototype.dispose = function () {
        var nChildrenCount = this.aChildrenArray.length;
        for (var i = 0; i < nChildrenCount; ++i) {
            this.aChildrenArray[i].dispose();
        }
        _super.prototype.dispose.call(this);
    };
    BaseContainerNode.prototype.info = function (verbose) {
        var e_3, _a;
        var sInfo = _super.prototype.info.call(this, verbose);
        if (verbose) {
            if (this.getImpressNodeType())
                sInfo += "; \u001B[31mnodeType: " + ImpressNodeType[this.getImpressNodeType()] + "\u001B[m";
        }
        try {
            for (var _b = __values(this.aChildrenArray), _c = _b.next(); !_c.done; _c = _b.next()) {
                var child = _c.value;
                sInfo += '\n';
                sInfo += child.info(verbose);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return sInfo;
    };
    BaseContainerNode.prototype.isEmpty = function () {
        return this.aChildrenArray.length === 0;
    };
    return BaseContainerNode;
}(BaseNode));
var ParallelTimeContainer = /** @class */ (function (_super) {
    __extends(ParallelTimeContainer, _super);
    function ParallelTimeContainer(aNodeInfo, aParentNode, aNodeContext) {
        var _this = _super.call(this, aNodeInfo, aParentNode, aNodeContext) || this;
        _this.sClassName = 'ParallelTimeContainer';
        return _this;
    }
    ParallelTimeContainer.prototype.activate_st = function () {
        var nChildrenCount = this.aChildrenArray.length;
        var nResolvedChildren = 0;
        for (var i = 0; i < nChildrenCount; ++i) {
            if (this.aChildrenArray[i].resolve()) {
                ++nResolvedChildren;
            }
        }
        if (nChildrenCount != nResolvedChildren) {
            window.app.console.log('ParallelTimeContainer.activate_st: resolving all children failed');
            return;
        }
        if (this.isDurationIndefinite() && nChildrenCount == 0) {
            this.scheduleDeactivationEvent(this.makeDeactivationEvent(0.0));
        }
        else {
            this.scheduleDeactivationEvent();
        }
    };
    ParallelTimeContainer.prototype.notifyDeactivating = function (aAnimationNode) {
        this.notifyDeactivatedChild(aAnimationNode);
    };
    return ParallelTimeContainer;
}(BaseContainerNode));
var SequentialTimeContainer = /** @class */ (function (_super) {
    __extends(SequentialTimeContainer, _super);
    function SequentialTimeContainer(aNodeInfo, aParentNode, aNodeContext) {
        var _this = _super.call(this, aNodeInfo, aParentNode, aNodeContext) || this;
        _this.sClassName = 'SequentialTimeContainer';
        _this.bIsRewinding = false;
        _this.aCurrentSkipEvent = null;
        _this.aRewindCurrentEffectEvent = null;
        _this.aRewindLastEffectEvent = null;
        return _this;
    }
    SequentialTimeContainer.prototype.activate_st = function () {
        var nChildrenCount = this.aChildrenArray.length;
        for (; this.nFinishedChildren < nChildrenCount; ++this.nFinishedChildren) {
            if (this.resolveChild(this.aChildrenArray[this.nFinishedChildren]))
                break;
            else
                window.app.console.log("SequentialTimeContainer(" + this.getId() + ").activate_st: resolving child(" + this.nFinishedChildren + ") failed!");
        }
        if (this.isDurationIndefinite() &&
            (nChildrenCount == 0 || this.nFinishedChildren >= nChildrenCount)) {
            // deactivate ASAP:
            this.scheduleDeactivationEvent(this.makeDeactivationEvent(0.0));
        }
        else {
            this.scheduleDeactivationEvent();
        }
    };
    SequentialTimeContainer.prototype.notifyDeactivating = function (aNotifier) {
        // If we are rewinding we have not to resolve the next child.
        if (this.bIsRewinding)
            return;
        if (this.notifyDeactivatedChild(aNotifier))
            return;
        assert(this.nFinishedChildren < this.aChildrenArray.length, 'SequentialTimeContainer.notifyDeactivating: assertion (this.nFinishedChildren < this.aChildrenArray.length) failed');
        var aNextChild = this.aChildrenArray[this.nFinishedChildren];
        assert(aNextChild.getState() === NodeState.Unresolved, 'SequentialTimeContainer.notifyDeactivating: assertion (aNextChild.getState == UNRESOLVED_NODE) failed');
        if (!this.resolveChild(aNextChild)) {
            // could not resolve child - since we risk to
            // stall the chain of events here, play it safe
            // and deactivate this node (only if we have
            // indefinite duration - otherwise, we'll get a
            // deactivation event, anyways).
            this.deactivate();
        }
    };
    /** skipEffect
     *  Skip the current playing shape effect.
     *  Requires: the current node is the main sequence root node.
     *
     *  @param aChildNode
     *      An animation node representing the root node of the shape effect being
     *      played.
     */
    SequentialTimeContainer.prototype.skipEffect = function (aChildNode) {
        if (this.isChildNode(aChildNode)) {
            // First off we end all queued activities.
            this.getContext().aActivityQueue.endAll();
            // We signal that we are going to skip all subsequent animations by
            // setting the bIsSkipping flag to 'true', then all queued events are
            // fired immediately. In such a way the correct order of the various
            // events that belong to the animation time-line is preserved.
            this.getContext().bIsSkipping = true;
            this.getContext().aTimerEventQueue.forceEmpty();
            this.getContext().bIsSkipping = false;
            var aEvent = makeEvent(aChildNode.deactivate.bind(aChildNode));
            this.getContext().aTimerEventQueue.addEvent(aEvent);
        }
        else {
            window.app.console.log('SequentialTimeContainer.skipEffect: unknown child: ' +
                aChildNode.getId());
        }
    };
    /** rewindCurrentEffect
     *  Rewind a playing shape effect.
     *  Requires: the current node is the main sequence root node.
     *
     *  @param aChildNode
     *      An animation node representing the root node of the shape effect being
     *      played
     */
    SequentialTimeContainer.prototype.rewindCurrentEffect = function (aChildNode) {
        if (this.isChildNode(aChildNode)) {
            assert(!this.bIsRewinding, 'SequentialTimeContainer.rewindCurrentEffect: is already rewinding.');
            // We signal we are rewinding so the notifyDeactivating method returns
            // immediately without increment the finished children counter and
            // resolve the next child.
            this.bIsRewinding = true;
            // First off we end all queued activities.
            this.getContext().aActivityQueue.endAll();
            // We signal that we are going to skip all subsequent animations by
            // setting the bIsSkipping flag to 'true', then all queued events are
            // fired immediately. In such a way the correct order of the various
            // events that belong to the animation time-line is preserved.
            this.getContext().bIsSkipping = true;
            this.getContext().aTimerEventQueue.forceEmpty();
            this.getContext().bIsSkipping = false;
            // We end all new activities appended to the activity queue by
            // the fired events.
            this.getContext().aActivityQueue.endAll();
            // Now we perform a final 'end' and restore the animated shape to
            // the state it was before the current effect was applied.
            aChildNode.end();
            aChildNode.removeEffect();
            // Finally we place the child node to the 'unresolved' state and
            // resolve it again.
            aChildNode.init();
            this.resolveChild(aChildNode);
            this.notifyRewindedEvent(aChildNode);
            this.bIsRewinding = false;
        }
        else {
            window.app.console.log('SequentialTimeContainer.rewindCurrentEffect: unknown child: ' +
                aChildNode.getId());
        }
    };
    /** rewindLastEffect
     *  Rewind the last ended effect.
     *  Requires: the current node is the main sequence root node.
     *
     *  @param aChildNode
     *      An animation node representing the root node of the next shape effect
     *      to be played.
     */
    SequentialTimeContainer.prototype.rewindLastEffect = function (aChildNode) {
        if (this.isChildNode(aChildNode)) {
            assert(!this.bIsRewinding, 'SequentialTimeContainer.rewindLastEffect: is already rewinding.');
            // We signal we are rewinding so the notifyDeactivating method returns
            // immediately without increment the finished children counter and
            // resolve the next child.
            this.bIsRewinding = true;
            // We end the current effect.
            this.getContext().aTimerEventQueue.forceEmpty();
            this.getContext().aActivityQueue.clear();
            aChildNode.end();
            // Invoking the end method on the current child node that has not yet
            // been activated should not lead to any change on the animated shape.
            // However for safety we used to call the removeEffect method but
            // lately we noticed that when interactive animation sequences are
            // involved into the shape effect invoking such a method causes
            // some issue.
            //aChildNode.removeEffect();
            // As we rewind the previous effect we need to decrease the finished
            // children counter.
            --this.nFinishedChildren;
            var aPreviousChildNode = this.aChildrenArray[this.nFinishedChildren];
            // No need to invoke the end method for the previous child as it is
            // already in the ENDED state.
            aPreviousChildNode.removeEffect();
            // We place the child node to the 'unresolved' state.
            aPreviousChildNode.init();
            // We need to re-initialize the old current child too, because it is
            // in ENDED state now, On the contrary it cannot be resolved again later.
            aChildNode.init();
            this.resolveChild(aPreviousChildNode);
            this.notifyRewindedEvent(aChildNode);
            this.bIsRewinding = false;
        }
        else {
            window.app.console.log('SequentialTimeContainer.rewindLastEffect: unknown child: ' +
                aChildNode.getId());
        }
    };
    /** resolveChild
     *  Resolve the passed child.
     *  In case this node is a main sequence root node events for skipping and
     *  rewinding the effect related to the passed child node are created and
     *  registered.
     *
     *  @param aChildNode
     *      An animation node representing the root node of the next shape effect
     *      to be played.
     *  @return
     *      It returns true if the passed child has been resolved successfully,
     *      false otherwise.
     */
    SequentialTimeContainer.prototype.resolveChild = function (aChildNode) {
        var bResolved = aChildNode.resolve();
        if (bResolved &&
            (this.isMainSequenceRootNode() || this.isInteractiveSequenceRootNode())) {
            if (this.aCurrentSkipEvent)
                this.aCurrentSkipEvent.dispose();
            this.aCurrentSkipEvent = makeEvent(this.skipEffect.bind(this, aChildNode));
            if (this.aRewindCurrentEffectEvent)
                this.aRewindCurrentEffectEvent.dispose();
            this.aRewindCurrentEffectEvent = makeEvent(this.rewindCurrentEffect.bind(this, aChildNode));
            if (this.aRewindLastEffectEvent)
                this.aRewindLastEffectEvent.dispose();
            this.aRewindLastEffectEvent = makeEvent(this.rewindLastEffect.bind(this, aChildNode));
            if (this.isMainSequenceRootNode()) {
                this.aContext.aEventMultiplexer.registerSkipEffectEvent(this.aCurrentSkipEvent);
                this.aContext.aEventMultiplexer.registerRewindCurrentEffectEvent(this.aRewindCurrentEffectEvent);
                this.aContext.aEventMultiplexer.registerRewindLastEffectEvent(this.aRewindLastEffectEvent);
            }
            else if (this.isInteractiveSequenceRootNode()) {
                this.aContext.aEventMultiplexer.registerSkipInteractiveEffectEvent(aChildNode.getId(), this.aCurrentSkipEvent);
                this.aContext.aEventMultiplexer.registerRewindRunningInteractiveEffectEvent(aChildNode.getId(), this.aRewindCurrentEffectEvent);
                this.aContext.aEventMultiplexer.registerRewindEndedInteractiveEffectEvent(aChildNode.getId(), this.aRewindLastEffectEvent);
            }
        }
        return bResolved;
    };
    SequentialTimeContainer.prototype.notifyRewindedEvent = function (aChildNode) {
        if (this.isInteractiveSequenceRootNode()) {
            this.aContext.aEventMultiplexer.notifyRewindedEffectEvent(aChildNode.getId());
            var sId = aChildNode.getBegin().getEventBaseElementId();
            if (sId) {
                this.aContext.aEventMultiplexer.notifyRewindedEffectEvent(sId);
            }
        }
    };
    SequentialTimeContainer.prototype.dispose = function () {
        if (this.aCurrentSkipEvent)
            this.aCurrentSkipEvent.dispose();
        _super.prototype.dispose.call(this);
    };
    return SequentialTimeContainer;
}(BaseContainerNode));
//# sourceMappingURL=BaseContainerNode.js.map