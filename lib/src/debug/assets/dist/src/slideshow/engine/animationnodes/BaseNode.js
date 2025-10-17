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
var NodeState;
(function (NodeState) {
    NodeState[NodeState["Invalid"] = 0] = "Invalid";
    NodeState[NodeState["Unresolved"] = 1] = "Unresolved";
    NodeState[NodeState["Resolved"] = 2] = "Resolved";
    NodeState[NodeState["Active"] = 4] = "Active";
    NodeState[NodeState["Frozen"] = 8] = "Frozen";
    NodeState[NodeState["Ended"] = 16] = "Ended";
})(NodeState || (NodeState = {}));
var FillModes;
(function (FillModes) {
    FillModes[FillModes["Default"] = 0] = "Default";
    FillModes[FillModes["Inherit"] = 0] = "Inherit";
    FillModes[FillModes["Remove"] = 1] = "Remove";
    FillModes[FillModes["Freeze"] = 2] = "Freeze";
    FillModes[FillModes["Hold"] = 3] = "Hold";
    FillModes[FillModes["Transition"] = 4] = "Transition";
    FillModes[FillModes["Auto"] = 5] = "Auto";
})(FillModes || (FillModes = {}));
var RestartMode;
(function (RestartMode) {
    RestartMode[RestartMode["Default"] = 0] = "Default";
    RestartMode[RestartMode["Inherit"] = 0] = "Inherit";
    RestartMode[RestartMode["Always"] = 1] = "Always";
    RestartMode[RestartMode["WhenNotActive"] = 2] = "WhenNotActive";
    RestartMode[RestartMode["Never"] = 3] = "Never";
})(RestartMode || (RestartMode = {}));
var ImpressNodeType;
(function (ImpressNodeType) {
    ImpressNodeType[ImpressNodeType["Default"] = 0] = "Default";
    ImpressNodeType[ImpressNodeType["OnClick"] = 1] = "OnClick";
    ImpressNodeType[ImpressNodeType["WithPrevious"] = 2] = "WithPrevious";
    ImpressNodeType[ImpressNodeType["AfterPrevious"] = 3] = "AfterPrevious";
    ImpressNodeType[ImpressNodeType["MainSequence"] = 4] = "MainSequence";
    ImpressNodeType[ImpressNodeType["TimingRoot"] = 5] = "TimingRoot";
    ImpressNodeType[ImpressNodeType["InteractiveSequence"] = 6] = "InteractiveSequence";
})(ImpressNodeType || (ImpressNodeType = {}));
var TransitionMode;
(function (TransitionMode) {
    TransitionMode[TransitionMode["out"] = 0] = "out";
    TransitionMode[TransitionMode["in"] = 1] = "in";
})(TransitionMode || (TransitionMode = {}));
var AdditiveMode;
(function (AdditiveMode) {
    AdditiveMode[AdditiveMode["Unknown"] = 0] = "Unknown";
    AdditiveMode[AdditiveMode["Base"] = 1] = "Base";
    AdditiveMode[AdditiveMode["Replace"] = 2] = "Replace";
    AdditiveMode[AdditiveMode["Multiply"] = 3] = "Multiply";
    AdditiveMode[AdditiveMode["None"] = 4] = "None";
})(AdditiveMode || (AdditiveMode = {}));
var AccumulateMode;
(function (AccumulateMode) {
    AccumulateMode[AccumulateMode["None"] = 0] = "None";
    AccumulateMode[AccumulateMode["Sum"] = 1] = "Sum";
})(AccumulateMode || (AccumulateMode = {}));
var CalcMode;
(function (CalcMode) {
    CalcMode[CalcMode["Discrete"] = 1] = "Discrete";
    CalcMode[CalcMode["Linear"] = 2] = "Linear";
    CalcMode[CalcMode["Paced"] = 3] = "Paced";
    CalcMode[CalcMode["Spline"] = 4] = "Spline";
})(CalcMode || (CalcMode = {}));
function createStateTransitionTable() {
    var aSTT = new Map();
    aSTT.set(RestartMode.Never, new Map());
    aSTT.set(RestartMode.WhenNotActive, new Map());
    aSTT.set(RestartMode.Always, new Map());
    // transition table for restart=NEVER, fill=REMOVE
    var aTable0 = new Map([
        [NodeState.Invalid, NodeState.Invalid],
        [NodeState.Unresolved, NodeState.Resolved | NodeState.Ended],
        [NodeState.Resolved, NodeState.Active | NodeState.Ended],
        [NodeState.Active, NodeState.Ended],
        [NodeState.Frozen, NodeState.Invalid],
        [NodeState.Ended, NodeState.Ended], // this state is a sink here (cannot restart)
    ]);
    aSTT.get(RestartMode.Never).set(FillModes.Remove, aTable0);
    // transition table for restart=NEVER, fill=FREEZE, HOLD, TRANSITION
    var aTable1 = new Map([
        [NodeState.Invalid, NodeState.Invalid],
        [NodeState.Unresolved, NodeState.Resolved | NodeState.Ended],
        [NodeState.Resolved, NodeState.Active | NodeState.Ended],
        [NodeState.Active, NodeState.Frozen | NodeState.Ended],
        [NodeState.Frozen, NodeState.Ended],
        [NodeState.Ended, NodeState.Ended], // this state is a sink here (cannot restart)
    ]);
    aSTT.get(RestartMode.Never).set(FillModes.Freeze, aTable1);
    aSTT.get(RestartMode.Never).set(FillModes.Hold, aTable1);
    aSTT.get(RestartMode.Never).set(FillModes.Transition, aTable1);
    // transition table for restart=WHEN_NOT_ACTIVE, fill=REMOVE
    var aTable2 = new Map([
        [NodeState.Invalid, NodeState.Invalid],
        [NodeState.Unresolved, NodeState.Resolved | NodeState.Ended],
        [NodeState.Resolved, NodeState.Active | NodeState.Ended],
        [NodeState.Active, NodeState.Ended],
        [NodeState.Frozen, NodeState.Invalid],
        [NodeState.Ended, NodeState.Resolved | NodeState.Active | NodeState.Ended], // restart is possible
    ]);
    aSTT.get(RestartMode.WhenNotActive).set(FillModes.Remove, aTable2);
    // transition table for restart=WHEN_NOT_ACTIVE, fill=FREEZE, HOLD, TRANSITION
    var aTable3 = new Map([
        [NodeState.Invalid, NodeState.Invalid],
        [NodeState.Unresolved, NodeState.Resolved | NodeState.Ended],
        [NodeState.Resolved, NodeState.Active | NodeState.Ended],
        [NodeState.Active, NodeState.Frozen | NodeState.Ended],
        [NodeState.Frozen, NodeState.Resolved | NodeState.Active | NodeState.Ended],
        [NodeState.Ended, NodeState.Resolved | NodeState.Active | NodeState.Ended], // restart is possible
    ]);
    aSTT.get(RestartMode.WhenNotActive).set(FillModes.Freeze, aTable3);
    aSTT.get(RestartMode.WhenNotActive).set(FillModes.Hold, aTable3);
    aSTT.get(RestartMode.WhenNotActive).set(FillModes.Transition, aTable3);
    // transition table for restart=ALWAYS, fill=REMOVE
    var aTable4 = new Map([
        [NodeState.Invalid, NodeState.Invalid],
        [NodeState.Unresolved, NodeState.Resolved | NodeState.Ended],
        [NodeState.Resolved, NodeState.Active | NodeState.Ended],
        [NodeState.Active, NodeState.Resolved | NodeState.Active | NodeState.Ended],
        [NodeState.Frozen, NodeState.Invalid],
        [NodeState.Ended, NodeState.Resolved | NodeState.Active | NodeState.Ended], // restart is possible
    ]);
    aSTT.get(RestartMode.Always).set(FillModes.Remove, aTable4);
    // transition table for restart=ALWAYS, fill=FREEZE, HOLD, TRANSITION
    var aTable5 = new Map([
        [NodeState.Invalid, NodeState.Invalid],
        [NodeState.Unresolved, NodeState.Resolved | NodeState.Ended],
        [NodeState.Resolved, NodeState.Active | NodeState.Ended],
        [
            NodeState.Active,
            NodeState.Resolved |
                NodeState.Active |
                NodeState.Frozen |
                NodeState.Ended,
        ],
        [NodeState.Frozen, NodeState.Resolved | NodeState.Active | NodeState.Ended],
        [NodeState.Ended, NodeState.Resolved | NodeState.Active | NodeState.Ended], // restart is possible
    ]);
    aSTT.get(RestartMode.Always).set(FillModes.Freeze, aTable5);
    aSTT.get(RestartMode.Always).set(FillModes.Hold, aTable5);
    aSTT.get(RestartMode.Always).set(FillModes.Transition, aTable5);
    return aSTT;
}
var aStateTransitionTable = createStateTransitionTable();
function getTransitionTable(eRestartMode, eFillMode) {
    // If restart mode has not been resolved we use 'never'.
    // Note: RestartMode.Default == RestartMode.Inherit.
    if (eRestartMode == RestartMode.Default) {
        window.app.console.log('getTransitionTable: unexpected restart mode: ' +
            eRestartMode +
            '. Used NEVER instead.');
        eRestartMode = RestartMode.Never;
    }
    // If fill mode has not been resolved we use 'remove'.
    // Note: FillModes.Default == FillModes.Inherit.
    if (eFillMode == FillModes.Default || eFillMode == FillModes.Auto) {
        eFillMode = FillModes.Remove;
    }
    return aStateTransitionTable.get(eRestartMode).get(eFillMode);
}
var StateTransition = /** @class */ (function () {
    function StateTransition(aBaseNode) {
        this.aNode = aBaseNode;
        this.eToState = NodeState.Invalid;
    }
    StateTransition.prototype.enter = function (eNodeState, bForce) {
        if (!bForce)
            bForce = false;
        if (this.eToState != NodeState.Invalid) {
            window.app.console.log('StateTransition.enter: commit() before enter()ing again!');
            return false;
        }
        if (!bForce && !this.aNode.isTransition(this.aNode.getState(), eNodeState))
            return false;
        // recursion detection:
        if ((this.aNode.nCurrentStateTransition & eNodeState) != 0)
            return false; // already in wanted transition
        // mark transition:
        this.aNode.nCurrentStateTransition |= eNodeState;
        this.eToState = eNodeState;
        return true;
    };
    StateTransition.prototype.commit = function () {
        if (this.eToState != NodeState.Invalid) {
            this.aNode.setState(this.eToState);
            this.clear();
        }
    };
    StateTransition.prototype.clear = function () {
        if (this.eToState != NodeState.Invalid) {
            this.aNode.nCurrentStateTransition &= ~this.eToState;
            this.eToState = NodeState.Invalid;
        }
    };
    return StateTransition;
}());
var BaseNode = /** @class */ (function () {
    function BaseNode(aNodeInfo, aParentNode, aNodeContext) {
        this.sClassName = 'BaseNode';
        this.bIsFirstAutoEffect = false;
        this.bIsMainSequenceRootNode = false;
        this.bIsInteractiveSequenceRootNode = false;
        this.nId = BaseNode.getUniqueId();
        if (!aNodeInfo)
            window.app.console.log('BaseNode(id:' + this.nId + ') constructor: aNodeInfo is not valid');
        if (!aNodeContext)
            window.app.console.log('BaseNode(id:' + this.nId + ') constructor: aNodeContext is not valid');
        if (!aNodeContext.aContext)
            window.app.console.log('BaseNode(id:' +
                this.nId +
                ') constructor: aNodeContext.aContext is not valid');
        this.eAnimationNodeType = getAnimationNodeType(aNodeInfo);
        this.bIsContainer = false;
        this.aNodeInfo = aNodeInfo;
        this.aParentNode = aParentNode;
        this.aNodeContext = aNodeContext;
        this.aContext = aNodeContext.aContext;
        this.nStartDelay = aNodeContext.nStartDelay;
        this.eCurrentState = NodeState.Unresolved;
        this.nCurrentStateTransition = 0;
        this.aDeactivatingListenerArray = [];
        this.aActivationEvent = null;
        this.aDeactivationEvent = null;
        this.aBegin = null;
        this.aDuration = null;
        this.aEnd = null;
        this.eFillMode = FillModes.Freeze;
        this.eRestartMode = RestartMode.Never;
        this.nRepeatCount = undefined;
        this.nAccelerate = 0.0;
        this.nDecelerate = 0.0;
        this.bAutoReverse = false;
    }
    BaseNode.getUniqueId = function () {
        ++BaseNode.CURR_UNIQUE_ID;
        return BaseNode.CURR_UNIQUE_ID;
    };
    BaseNode.prototype.getId = function () {
        return this.nId;
    };
    BaseNode.prototype.parseNodeInfo = function () {
        if (this.aNodeInfo.id)
            this.aNodeContext.aAnimationNodeMap.set(this.aNodeInfo.id, this);
        this.aBegin = new Timing(this, this.aNodeInfo.begin);
        this.aBegin.parse();
        this.aEnd = null;
        if (this.aNodeInfo.end) {
            this.aEnd = new Timing(this, this.aNodeInfo.end);
            this.aEnd.parse();
        }
        this.aDuration = new Duration(this.aNodeInfo.dur);
        if (!this.aDuration.isSet()) {
            if (this.isContainer())
                this.aDuration = null;
            else
                this.aDuration = new Duration('indefinite');
        }
        if (this.aNodeInfo.fill && this.aNodeInfo.fill in FillModes) {
            var sFill = this.aNodeInfo.fill;
            this.eFillMode = FillModes[sFill];
        }
        else {
            this.eFillMode = FillModes.Default;
        }
        if (this.aNodeInfo.restart && this.aNodeInfo.restart in RestartMode) {
            var sRestart = this.aNodeInfo.restart;
            this.eRestartMode = RestartMode[sRestart];
        }
        else {
            this.eRestartMode = RestartMode.Default;
        }
        this.nRepeatCount = 1;
        if (this.aNodeInfo.repeatCount)
            this.nRepeatCount = parseFloat(this.aNodeInfo.repeatCount);
        if (isNaN(this.nRepeatCount) && this.aNodeInfo.repeatCount !== 'indefinite')
            this.nRepeatCount = 1;
        this.nAccelerate = 0.0;
        var sAccelerate = this.aNodeInfo.accelerate;
        if (sAccelerate)
            this.nAccelerate = parseFloat(sAccelerate);
        if (isNaN(this.nAccelerate))
            this.nAccelerate = 0.0;
        this.nDecelerate = 0.0;
        var sDecelerate = this.aNodeInfo.decelerate;
        if (sDecelerate)
            this.nDecelerate = parseFloat(sDecelerate);
        if (isNaN(this.nDecelerate))
            this.nDecelerate = 0.0;
        this.bAutoReverse = false;
        var sAutoReverse = this.aNodeInfo.autoreverse;
        if (sAutoReverse == 'true')
            this.bAutoReverse = true;
        // resolve fill value
        if (this.eFillMode === FillModes.Default) {
            if (this.getParentNode())
                this.eFillMode = this.getParentNode().getFillMode();
            else
                this.eFillMode = FillModes.Auto;
        }
        if (this.eFillMode === FillModes.Auto) {
            // see SMIL recommendation document
            this.eFillMode =
                this.aEnd ||
                    this.nRepeatCount != 1 ||
                    (this.aDuration && !this.aDuration.isIndefinite())
                    ? FillModes.Remove
                    : FillModes.Freeze;
        }
        // resolve restart value
        if (this.eRestartMode === RestartMode.Default) {
            if (this.getParentNode())
                this.eRestartMode = this.getParentNode().getRestartMode();
            // SMIL recommendation document says to set it to 'always'
            else
                this.eRestartMode = RestartMode.Always;
        }
        // resolve accelerate and decelerate attributes
        // from the SMIL recommendation document: if the individual values of the accelerate
        // and decelerate attributes are between 0 and 1 and the sum is greater than 1,
        // then both the accelerate and decelerate attributes will be ignored and the timed
        // element will behave as if neither attribute was specified.
        if (this.nAccelerate + this.nDecelerate > 1.0) {
            this.nAccelerate = 0.0;
            this.nDecelerate = 0.0;
        }
        this.aStateTransTable = getTransitionTable(this.getRestartMode(), this.getFillMode());
    };
    BaseNode.prototype.getParentNode = function () {
        return this.aParentNode;
    };
    BaseNode.prototype.init = function () {
        this.DBG(this.callInfo('init'));
        if (!this.checkValidNode())
            return false;
        if (this.aActivationEvent)
            this.aActivationEvent.dispose();
        if (this.aDeactivationEvent)
            this.aDeactivationEvent.dispose();
        this.eCurrentState = NodeState.Unresolved;
        return this.init_st();
    };
    BaseNode.prototype.resolve = function () {
        if (this.aNodeContext.bIsInvalid || !this.checkValidNode())
            return false;
        this.DBG(this.callInfo('resolve'));
        if (this.eCurrentState == NodeState.Resolved)
            window.app.console.log('BaseNode.resolve: already in RESOLVED state');
        var aStateTrans = new StateTransition(this);
        if (aStateTrans.enter(NodeState.Resolved) &&
            this.isTransition(NodeState.Resolved, NodeState.Active) &&
            this.resolve_st()) {
            aStateTrans.commit();
            if (this.aActivationEvent) {
                this.aActivationEvent.charge();
            }
            else {
                this.aActivationEvent = makeDelay(this.activate.bind(this), this.getBegin().getOffset() + this.nStartDelay);
            }
            registerEvent(this.getId(), this.aNodeContext.aContext.aSlideShowHandler, this.getBegin(), this.aActivationEvent, this.aNodeContext);
            return true;
        }
        return false;
    };
    BaseNode.prototype.activate = function () {
        if (!this.checkValidNode())
            return false;
        if (this.eCurrentState === NodeState.Active)
            window.app.console.log('BaseNode.activate: already in ACTIVE state');
        this.DBG(this.callInfo('activate'), getCurrentSystemTime());
        var aStateTrans = new StateTransition(this);
        if (aStateTrans.enter(NodeState.Active)) {
            this.activate_st();
            aStateTrans.commit();
            if (this.bIsFirstAutoEffect)
                this.aNodeContext.aContext.aSlideShowHandler.notifyFirstAutoEffectStarted();
            if (!this.aContext.aEventMultiplexer)
                window.app.console.log('BaseNode.activate: this.aContext.aEventMultiplexer is not valid');
            this.aContext.aEventMultiplexer.notifyEvent(EventTrigger.BeginEvent, this.getId());
            return true;
        }
        return false;
    };
    BaseNode.prototype.deactivate = function () {
        if (this.inStateOrTransition(NodeState.Ended | NodeState.Frozen) ||
            !this.checkValidNode())
            return;
        if (this.isTransition(this.eCurrentState, NodeState.Frozen)) {
            this.DBG(this.callInfo('deactivate'), getCurrentSystemTime());
            var aStateTrans = new StateTransition(this);
            if (aStateTrans.enter(NodeState.Frozen, true /* FORCE */)) {
                this.deactivate_st(NodeState.Frozen);
                aStateTrans.commit();
                this.notifyEndListeners();
                if (this.bIsFirstAutoEffect)
                    this.aNodeContext.aContext.aSlideShowHandler.notifyFirstAutoEffectEnded();
                if (this.aActivationEvent)
                    this.aActivationEvent.dispose();
                if (this.aDeactivationEvent)
                    this.aDeactivationEvent.dispose();
            }
        }
        else {
            this.end();
        }
        // state has changed either to FROZEN or ENDED
    };
    BaseNode.prototype.end = function () {
        var bIsFrozenOrInTransitionToFrozen = this.inStateOrTransition(NodeState.Frozen);
        if (this.inStateOrTransition(NodeState.Ended) || !this.checkValidNode())
            return;
        if (!this.isTransition(this.eCurrentState, NodeState.Ended))
            window.app.console.log('BaseNode.end: end state not reachable in transition table');
        this.DBG(this.callInfo('end'), getCurrentSystemTime());
        var aStateTrans = new StateTransition(this);
        if (aStateTrans.enter(NodeState.Ended, true /* FORCE */)) {
            this.deactivate_st(NodeState.Ended);
            aStateTrans.commit();
            // if is FROZEN or is to be FROZEN, then
            // will/already notified deactivating listeners
            if (!bIsFrozenOrInTransitionToFrozen)
                this.notifyEndListeners();
            if (this.bIsFirstAutoEffect)
                this.aNodeContext.aContext.aSlideShowHandler.notifyFirstAutoEffectEnded();
            if (this.aActivationEvent)
                this.aActivationEvent.dispose();
            if (this.aDeactivationEvent)
                this.aDeactivationEvent.dispose();
        }
    };
    BaseNode.prototype.dispose = function () {
        if (this.aActivationEvent)
            this.aActivationEvent.dispose();
        if (this.aDeactivationEvent)
            this.aDeactivationEvent.dispose();
        this.aDeactivatingListenerArray = [];
    };
    BaseNode.prototype.getState = function () {
        return this.eCurrentState;
    };
    BaseNode.prototype.setState = function (nodeState) {
        this.eCurrentState = nodeState;
    };
    BaseNode.prototype.registerDeactivatingListener = function (aNotifiee) {
        if (!this.checkValidNode())
            return false;
        if (!aNotifiee) {
            window.app.console.log('BaseNode.registerDeactivatingListener(): invalid notifiee');
            return false;
        }
        this.aDeactivatingListenerArray.push(aNotifiee);
        return true;
    };
    BaseNode.prototype.notifyDeactivating = function (aNotifier) {
        assert(aNotifier.getState() === NodeState.Frozen ||
            aNotifier.getState() === NodeState.Ended, 'BaseNode.notifyDeactivating: Notifier node is neither in FROZEN nor in ENDED state');
    };
    BaseNode.prototype.isContainer = function () {
        return this.bIsContainer;
    };
    BaseNode.prototype.isMainSequenceRootNode = function () {
        return this.bIsMainSequenceRootNode;
    };
    BaseNode.prototype.isInteractiveSequenceRootNode = function () {
        return this.bIsInteractiveSequenceRootNode;
    };
    BaseNode.prototype.makeDeactivationEvent = function (nDelay) {
        if (this.aDeactivationEvent) {
            this.aDeactivationEvent.charge();
        }
        else if (typeof nDelay == typeof 0) {
            this.aDeactivationEvent = makeDelay(this.deactivate.bind(this), nDelay);
        }
        else {
            this.aDeactivationEvent = null;
        }
        return this.aDeactivationEvent;
    };
    BaseNode.prototype.scheduleDeactivationEvent = function (aEvent) {
        this.DBG(this.callInfo('scheduleDeactivationEvent'));
        if (!aEvent) {
            if (this.getDuration() && this.getDuration().isValue())
                aEvent = this.makeDeactivationEvent(this.getDuration().getValue());
        }
        if (aEvent) {
            this.aContext.aTimerEventQueue.addEvent(aEvent);
        }
    };
    BaseNode.prototype.checkValidNode = function () {
        return this.eCurrentState !== NodeState.Invalid;
    };
    BaseNode.prototype.init_st = function () {
        return true;
    };
    BaseNode.prototype.resolve_st = function () {
        return true;
    };
    BaseNode.prototype.activate_st = function () {
        this.scheduleDeactivationEvent();
    };
    BaseNode.prototype.deactivate_st = function (aNodeState) {
        // empty body
    };
    BaseNode.prototype.notifyEndListeners = function () {
        var nDeactivatingListenerCount = this.aDeactivatingListenerArray.length;
        for (var i = 0; i < nDeactivatingListenerCount; ++i) {
            this.aDeactivatingListenerArray[i].notifyDeactivating(this);
        }
        this.aContext.aEventMultiplexer.notifyEvent(EventTrigger.EndEvent, this.getId());
        if (this.getParentNode() && this.getParentNode().isMainSequenceRootNode())
            this.aContext.aEventMultiplexer.notifyNextEffectEndEvent();
        if (this.isMainSequenceRootNode())
            this.aContext.aEventMultiplexer.notifyAnimationsEndEvent();
    };
    BaseNode.prototype.getContext = function () {
        return this.aContext;
    };
    BaseNode.prototype.isTransition = function (eFromState, eToState) {
        return (this.aStateTransTable.get(eFromState) & eToState) !== 0;
    };
    BaseNode.prototype.inStateOrTransition = function (nMask) {
        return ((this.eCurrentState & nMask) != 0 ||
            (this.nCurrentStateTransition & nMask) != 0);
    };
    BaseNode.prototype.getBegin = function () {
        return this.aBegin;
    };
    BaseNode.prototype.getEnd = function () {
        return this.aEnd;
    };
    BaseNode.prototype.getDuration = function () {
        return this.aDuration;
    };
    BaseNode.prototype.getFillMode = function () {
        return this.eFillMode;
    };
    BaseNode.prototype.getRestartMode = function () {
        return this.eRestartMode;
    };
    BaseNode.prototype.getRepeatCount = function () {
        return this.nRepeatCount;
    };
    BaseNode.prototype.getAccelerateValue = function () {
        return this.nAccelerate;
    };
    BaseNode.prototype.getDecelerateValue = function () {
        return this.nDecelerate;
    };
    BaseNode.prototype.isAutoReverseEnabled = function () {
        return this.bAutoReverse;
    };
    BaseNode.prototype.info = function (bVerbose) {
        if (bVerbose === void 0) { bVerbose = false; }
        var sInfo = this.sClassName + "(" + this.aNodeInfo.nodeName + ", " + this.getId() + ", " + NodeState[this.getState()] + ")";
        if (bVerbose) {
            // is container
            sInfo += ';  is container: ' + this.isContainer();
            // begin
            if (this.getBegin()) {
                if (this.getBegin().getEventType() === EventTrigger.OnNext)
                    // on click starts the next effect
                    sInfo += ';  \x1B[31mbegin: ' + this.getBegin().info() + '\x1B[m';
                else
                    sInfo += ';  begin: ' + this.getBegin().info();
            }
            // duration
            if (this.getDuration())
                sInfo += ';  dur: ' + this.getDuration().info();
            // end
            if (this.getEnd())
                sInfo += ';  end: ' + this.getEnd().info();
            // fill mode
            if (this.getFillMode())
                sInfo += ';  fill: ' + FillModes[this.getFillMode()];
            // restart mode
            if (this.getRestartMode())
                sInfo += ';  restart: ' + RestartMode[this.getRestartMode()];
            // repeatCount
            if (this.getRepeatCount() && this.getRepeatCount() != 1.0)
                sInfo += ';  repeatCount: ' + this.getRepeatCount();
            // preset id (effect type)
            if (this.aNodeInfo.presetId)
                sInfo += "; \u001B[31mpresetId: " + this.aNodeInfo.presetId + "\u001B[m";
            // preset subType
            if (this.aNodeInfo.presetSubType)
                sInfo += "; presetSubType: " + this.aNodeInfo.presetSubType;
            // accelerate
            if (this.getAccelerateValue())
                sInfo += ';  accelerate: ' + this.getAccelerateValue();
            // decelerate
            if (this.getDecelerateValue())
                sInfo += ';  decelerate: ' + this.getDecelerateValue();
            // auto reverse
            if (this.isAutoReverseEnabled())
                sInfo += ';  autoReverse: true';
        }
        return sInfo;
    };
    BaseNode.prototype.callInfo = function (sMethodName) {
        var sInfo = this.sClassName +
            '( ' +
            this.getId() +
            ', ' +
            NodeState[this.getState()] +
            ' ).' +
            sMethodName;
        return sInfo;
    };
    BaseNode.prototype.DBG = function (sMessage, nTime) {
        ANIMDBG.print(sMessage, nTime);
    };
    BaseNode.CURR_UNIQUE_ID = 0;
    return BaseNode;
}());
//# sourceMappingURL=BaseNode.js.map