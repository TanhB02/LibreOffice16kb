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
var AnimationBaseNode = /** @class */ (function (_super) {
    __extends(AnimationBaseNode, _super);
    function AnimationBaseNode(aNodeInfo, aParentNode, aNodeContext) {
        var _this = _super.call(this, aNodeInfo, aParentNode, aNodeContext) || this;
        _this.sClassName = 'AnimationBaseNode';
        _this.bIsTargetTextElement = false;
        _this.aAnimatedElement = null;
        _this.aActivity = null;
        return _this;
    }
    AnimationBaseNode.prototype.parseNodeInfo = function () {
        _super.prototype.parseNodeInfo.call(this);
        // targetElement property
        var aNodeInfo = this.aNodeInfo;
        this.aTargetHash = aNodeInfo.targetElement;
        if (!this.aTargetHash) {
            this.eCurrentState = NodeState.Invalid;
            window.app.console.log('AnimationBaseNode.parseElement: target element not found: ' +
                aNodeInfo.targetElement);
        }
        // subItem property for text animated element
        this.bIsTargetTextElement =
            aNodeInfo.subItem && aNodeInfo.subItem === 'OnlyText';
        // additive property
        if (aNodeInfo.additive && aNodeInfo.additive in AdditiveMode) {
            var sAdditive = aNodeInfo.additive;
            this.eAdditiveMode = AdditiveMode[sAdditive];
        }
        else {
            this.eAdditiveMode = AdditiveMode.Replace;
        }
        // set up min frame count value;
        this.nMinFrameCount = this.getDuration().isValue()
            ? this.getDuration().getValue() *
                SlideShowHandler.MINIMUM_FRAMES_PER_SECONDS
            : SlideShowHandler.MINIMUM_FRAMES_PER_SECONDS;
        if (this.nMinFrameCount < 1.0)
            this.nMinFrameCount = 1;
        else if (this.nMinFrameCount > SlideShowHandler.MINIMUM_FRAMES_PER_SECONDS)
            this.nMinFrameCount = SlideShowHandler.MINIMUM_FRAMES_PER_SECONDS;
        if (this.aTargetHash) {
            if (!this.aNodeContext.aAnimatedElementMap.has(this.aTargetHash)) {
                var slideHash = this.aNodeContext.metaSlide.info.hash;
                var slideWidth = this.aNodeContext.aContext.nSlideWidth;
                var slideHeight = this.aNodeContext.aContext.nSlideHeight;
                var aAnimatedElement = this.bIsTargetTextElement
                    ? new AnimatedTextElement(this.aTargetHash, slideHash, slideWidth, slideHeight)
                    : new AnimatedElement(this.aTargetHash, slideHash, slideWidth, slideHeight);
                this.aNodeContext.aAnimatedElementMap.set(this.aTargetHash, aAnimatedElement);
            }
            this.aAnimatedElement = this.aNodeContext.aAnimatedElementMap.get(this.aTargetHash);
            // set additive mode
            this.aAnimatedElement.setAdditiveMode(this.eAdditiveMode);
        }
    };
    AnimationBaseNode.prototype.init_st = function () {
        if (this.aActivity)
            this.aActivity.activate(makeEvent(this.deactivate.bind(this)));
        else
            this.aActivity = this.createActivity();
        return true;
    };
    AnimationBaseNode.prototype.resolve_st = function () {
        return true;
    };
    AnimationBaseNode.prototype.activate_st = function () {
        if (this.aActivity) {
            this.saveStateOfAnimatedElement();
            this.aActivity.setTargets(this.getAnimatedElement());
            if (this.getContext().bIsSkipping) {
                this.aActivity.end();
            }
            else {
                this.getContext().aActivityQueue.addActivity(this.aActivity);
            }
        }
        else {
            _super.prototype.scheduleDeactivationEvent.call(this);
        }
    };
    AnimationBaseNode.prototype.deactivate_st = function (eDestState) {
        if (eDestState === NodeState.Frozen) {
            if (this.aActivity)
                this.aActivity.end();
        }
        if (eDestState === NodeState.Ended) {
            if (this.aActivity)
                this.aActivity.dispose();
            if (this.getFillMode() === FillModes.Remove && this.getAnimatedElement())
                this.removeEffect();
        }
    };
    AnimationBaseNode.prototype.fillActivityParams = function () {
        // compute duration
        var nDuration = 0.001;
        if (this.getDuration().isValue()) {
            nDuration = this.getDuration().getValue();
        }
        else {
            window.app.console.log('AnimationBaseNode.fillActivityParams: duration is not a number');
        }
        // create and set up activity params
        var aActivityParamSet = new ActivityParamSet();
        aActivityParamSet.aEndEvent = makeEvent(this.deactivate.bind(this));
        aActivityParamSet.aTimerEventQueue = this.aContext.aTimerEventQueue;
        aActivityParamSet.aActivityQueue = this.aContext.aActivityQueue;
        aActivityParamSet.nMinDuration = nDuration;
        aActivityParamSet.nMinNumberOfFrames = this.getMinFrameCount();
        aActivityParamSet.bAutoReverse = this.isAutoReverseEnabled();
        aActivityParamSet.nRepeatCount = this.getRepeatCount();
        aActivityParamSet.nAccelerationFraction = this.getAccelerateValue();
        aActivityParamSet.nDecelerationFraction = this.getDecelerateValue();
        aActivityParamSet.nSlideWidth = this.aNodeContext.aContext.nSlideWidth;
        aActivityParamSet.nSlideHeight = this.aNodeContext.aContext.nSlideHeight;
        return aActivityParamSet;
    };
    AnimationBaseNode.prototype.hasPendingAnimation = function () {
        return true;
    };
    AnimationBaseNode.prototype.saveStateOfAnimatedElement = function () {
        this.getAnimatedElement().saveState(this.getId());
    };
    AnimationBaseNode.prototype.removeEffect = function () {
        this.getAnimatedElement().restoreState(this.getId());
    };
    AnimationBaseNode.prototype.getTargetHash = function () {
        return this.aTargetHash;
    };
    AnimationBaseNode.prototype.getAnimatedElement = function () {
        return this.aAnimatedElement;
    };
    AnimationBaseNode.prototype.dispose = function () {
        if (this.aActivity)
            this.aActivity.dispose();
        _super.prototype.dispose.call(this);
    };
    AnimationBaseNode.prototype.getMinFrameCount = function () {
        return this.nMinFrameCount;
    };
    AnimationBaseNode.prototype.getAdditiveMode = function () {
        return this.eAdditiveMode;
    };
    AnimationBaseNode.prototype.info = function (bVerbose) {
        if (bVerbose === void 0) { bVerbose = false; }
        var sInfo = _super.prototype.info.call(this, bVerbose);
        if (bVerbose) {
            // min frame count
            if (this.getMinFrameCount())
                sInfo += ';  min frame count: ' + this.getMinFrameCount();
            // additive mode
            sInfo += ';  additive: ' + AdditiveMode[this.getAdditiveMode()];
            // target element
            if (this.getTargetHash()) {
                var sElemId = this.getTargetHash();
                sInfo += ';  targetElement: ' + sElemId;
            }
        }
        return sInfo;
    };
    return AnimationBaseNode;
}(BaseNode));
var AnimationBaseNode2 = /** @class */ (function (_super) {
    __extends(AnimationBaseNode2, _super);
    function AnimationBaseNode2(aNodeInfo, aParentNode, aNodeContext) {
        var _this = _super.call(this, aNodeInfo, aParentNode, aNodeContext) || this;
        _this.attributeName = '';
        _this.aToValue = null;
        return _this;
    }
    AnimationBaseNode2.prototype.parseNodeInfo = function () {
        _super.prototype.parseNodeInfo.call(this);
        var aNodeInfo = this.aNodeInfo;
        this.attributeName = aNodeInfo.attributeName;
        if (!this.attributeName) {
            this.eCurrentState = NodeState.Invalid;
            window.app.console.log(this.sClassName + ".parseElement: target attribute name not found");
        }
        else {
            this.attributeName = this.attributeName.toLowerCase();
        }
        this.aToValue = aNodeInfo.to;
    };
    AnimationBaseNode2.prototype.getAttributeName = function () {
        return this.attributeName;
    };
    AnimationBaseNode2.prototype.getToValue = function () {
        return this.aToValue;
    };
    AnimationBaseNode2.prototype.info = function (verbose) {
        var sInfo = _super.prototype.info.call(this, verbose);
        if (verbose) {
            if (this.getAttributeName())
                sInfo +=
                    ';  \x1B[31mattributeName: ' + this.getAttributeName() + '\x1B[m';
            if (this.getToValue())
                sInfo += ';  to: ' + this.getToValue();
        }
        return sInfo;
    };
    return AnimationBaseNode2;
}(AnimationBaseNode));
var AnimationBaseNode3 = /** @class */ (function (_super) {
    __extends(AnimationBaseNode3, _super);
    function AnimationBaseNode3(aNodeInfo, aParentNode, aNodeContext) {
        var _this = _super.call(this, aNodeInfo, aParentNode, aNodeContext) || this;
        _this.eAccumulate = undefined;
        _this.eCalcMode = undefined;
        _this.aFromValue = null;
        _this.aByValue = null;
        _this.aKeyTimes = null;
        _this.aValues = null;
        _this.aFormula = null;
        return _this;
    }
    AnimationBaseNode3.prototype.parseNodeInfo = function () {
        _super.prototype.parseNodeInfo.call(this);
        var aNodeInfo = this.aNodeInfo;
        // accumulate propert
        this.eAccumulate = AccumulateMode.None;
        var sAccumulateAttr = aNodeInfo.accumulate;
        if (sAccumulateAttr === 'sum')
            this.eAccumulate = AccumulateMode.Sum;
        // calcMode property
        this.eCalcMode = CalcMode.Linear;
        if (aNodeInfo.calcMode && aNodeInfo.calcMode in CalcMode) {
            var sCalcMode = aNodeInfo.calcMode;
            this.eCalcMode = CalcMode[sCalcMode];
        }
        this.aFromValue = aNodeInfo.from;
        this.aByValue = aNodeInfo.by;
        // keyTimes property
        this.aKeyTimes = [];
        var sKeyTimesAttr = aNodeInfo.keyTimes;
        sKeyTimesAttr = removeWhiteSpaces(sKeyTimesAttr);
        if (sKeyTimesAttr) {
            var aKeyTimes = sKeyTimesAttr.split(';');
            for (var i = 0; i < aKeyTimes.length; ++i)
                this.aKeyTimes.push(parseFloat(aKeyTimes[i]));
        }
        // values property
        this.aValues = aNodeInfo.values ? aNodeInfo.values.split(';') : [];
        // formula property
        this.aFormula = aNodeInfo.formula;
    };
    AnimationBaseNode3.prototype.getAccumulate = function () {
        return this.eAccumulate;
    };
    AnimationBaseNode3.prototype.getCalcMode = function () {
        return this.eCalcMode;
    };
    AnimationBaseNode3.prototype.getFromValue = function () {
        return this.aFromValue;
    };
    AnimationBaseNode3.prototype.getByValue = function () {
        return this.aByValue;
    };
    AnimationBaseNode3.prototype.getKeyTimes = function () {
        return this.aKeyTimes;
    };
    AnimationBaseNode3.prototype.getValues = function () {
        return this.aValues;
    };
    AnimationBaseNode3.prototype.getFormula = function () {
        return this.aFormula;
    };
    AnimationBaseNode3.prototype.info = function (verbose) {
        var sInfo = _super.prototype.info.call(this, verbose);
        if (verbose) {
            // accumulate mode
            if (this.getAccumulate())
                sInfo += ';  accumulate: ' + AccumulateMode[this.getAccumulate()];
            // calcMode
            sInfo += ';  calcMode: ' + CalcMode[this.getCalcMode()];
            // from
            if (this.getFromValue())
                sInfo += ';  from: ' + this.getFromValue();
            // by
            if (this.getByValue())
                sInfo += ';  by: ' + this.getByValue();
            // keyTimes
            if (this.getKeyTimes().length)
                sInfo += ';  keyTimes: ' + this.getKeyTimes().join(',');
            // values
            if (this.getValues().length)
                sInfo += ';  values: ' + this.getValues().join(',');
            // formula
            if (this.getFormula())
                sInfo += ';  formula: ' + this.getFormula();
        }
        return sInfo;
    };
    return AnimationBaseNode3;
}(AnimationBaseNode2));
//# sourceMappingURL=AnimationBaseNode.js.map