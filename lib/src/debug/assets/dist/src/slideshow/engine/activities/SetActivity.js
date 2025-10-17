// @ts-strict-ignore
/* -*- js-indent-level: 8 -*- */
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
var SetActivity = /** @class */ (function (_super) {
    __extends(SetActivity, _super);
    function SetActivity(aCommonParamSet, aAnimationNode, aAnimation) {
        var _this = _super.call(this) || this;
        _this.aAnimation = aAnimation;
        _this.aTargetElement = null;
        _this.aEndEvent = aCommonParamSet.aEndEvent;
        _this.aTimerEventQueue = aCommonParamSet.aTimerEventQueue;
        _this.bIsActive = true;
        var aAnimatedElement = aAnimationNode.getAnimatedElement();
        var sAttributeName = aAnimationNode.getAttributeName();
        var sKey = sAttributeName;
        var aAttributeProp = aPropertyGetterSetterMap[sKey];
        var eValueType = aAttributeProp['type'];
        var aValueSet = [aAnimationNode.getToValue()];
        ANIMDBG.print('SetActivity: value type: ' +
            PropertyValueType[eValueType] +
            ', aTo = ' +
            aValueSet[0]);
        var aValueList = [];
        extractAttributeValues(eValueType, aValueList, aValueSet, aAnimatedElement.getBaseBBox(), aCommonParamSet.nSlideWidth, aCommonParamSet.nSlideHeight);
        ANIMDBG.print('SetActivity ctor: aTo = ' + aValueList[0]);
        _this.aToAttr = aValueList[0];
        return _this;
    }
    SetActivity.prototype.activate = function (aEndEvent) {
        this.aEndEvent = aEndEvent;
        this.bIsActive = true;
    };
    SetActivity.prototype.dispose = function () {
        this.bIsActive = false;
        if (this.aEndEvent && this.aEndEvent.isCharged())
            this.aEndEvent.dispose();
    };
    SetActivity.prototype.calcTimeLag = function () {
        return 0.0;
    };
    SetActivity.prototype.perform = function () {
        if (!this.isActive())
            return false;
        // we're going inactive immediately:
        this.bIsActive = false;
        if (this.aAnimation && this.aTargetElement) {
            this.aAnimation.start(this.aTargetElement);
            this.aAnimation.perform(this.aToAttr);
            this.aAnimation.end();
        }
        if (this.aEndEvent)
            this.aTimerEventQueue.addEvent(this.aEndEvent);
    };
    SetActivity.prototype.isActive = function () {
        return this.bIsActive;
    };
    SetActivity.prototype.dequeued = function () {
        // empty body
    };
    SetActivity.prototype.end = function () {
        this.perform();
    };
    SetActivity.prototype.setTargets = function (aTargetElement) {
        assert(aTargetElement, 'SetActivity.setTargets: target element is not valid');
        this.aTargetElement = aTargetElement;
    };
    return SetActivity;
}(AnimationActivity));
//# sourceMappingURL=SetActivity.js.map