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
var TransitionFilterInfo = /** @class */ (function () {
    function TransitionFilterInfo(type, subtype, isDirectionForward, isModeIn, fadeColor) {
        if (isDirectionForward === void 0) { isDirectionForward = true; }
        if (isModeIn === void 0) { isModeIn = true; }
        this.transitionType = null;
        this.transitionSubtype = null;
        this.isDirectionForward = true;
        this.isModeIn = true;
        this.fadeColor = null;
        this.transitionType = type;
        this.transitionSubtype = subtype;
        this.isDirectionForward = isDirectionForward;
        this.isModeIn = isModeIn;
        this.fadeColor = fadeColor;
    }
    TransitionFilterInfo.fromSlideInfo = function (slideInfo) {
        var transitionFilterInfo = new TransitionFilterInfo();
        if (!slideInfo)
            return null;
        if (slideInfo.transitionType)
            transitionFilterInfo.transitionType =
                stringToTransitionTypeMap[slideInfo.transitionType];
        if (slideInfo.transitionSubtype)
            transitionFilterInfo.transitionSubtype =
                stringToTransitionSubTypeMap[slideInfo.transitionSubtype];
        if (typeof slideInfo.transitionDirection === 'boolean')
            transitionFilterInfo.isDirectionForward = slideInfo.transitionDirection;
        if (slideInfo.transitionFadeColor)
            transitionFilterInfo.fadeColor = slideInfo.transitionFadeColor;
        return transitionFilterInfo;
    };
    return TransitionFilterInfo;
}());
var AnimationTransitionFilterNode = /** @class */ (function (_super) {
    __extends(AnimationTransitionFilterNode, _super);
    function AnimationTransitionFilterNode(aNodeInfo, aParentNode, aNodeContext) {
        var _this = _super.call(this, aNodeInfo, aParentNode, aNodeContext) || this;
        _this.bIsReverseDirection = false;
        _this.sClassName = 'AnimationTransitionFilterNode';
        return _this;
    }
    AnimationTransitionFilterNode.prototype.parseNodeInfo = function () {
        _super.prototype.parseNodeInfo.call(this);
        var bIsValidTransition = true;
        var aNodeInfo = this.aNodeInfo;
        // type property
        this.eTransitionType = undefined;
        if (aNodeInfo.transitionType &&
            stringToTransitionTypeMap[aNodeInfo.transitionType] in TransitionType) {
            this.eTransitionType =
                stringToTransitionTypeMap[aNodeInfo.transitionType];
        }
        else {
            bIsValidTransition = false;
            window.app.console.log('AnimationTransitionFilterNode.parseElement: transition type not valid: ' +
                aNodeInfo.transitionType);
        }
        // subtype property
        this.eTransitionSubType = undefined;
        if (!aNodeInfo.transitionSubType)
            aNodeInfo.transitionSubType = 'Default';
        if (stringToTransitionSubTypeMap[aNodeInfo.transitionSubType] in
            TransitionSubType) {
            this.eTransitionSubType =
                stringToTransitionSubTypeMap[aNodeInfo.transitionSubType];
        }
        else {
            bIsValidTransition = false;
            window.app.console.log('AnimationTransitionFilterNode.parseElement: transition subtype not valid: ' +
                aNodeInfo.transitionSubType);
        }
        // if we do not support the requested transition type we fall back to crossfade transition;
        // note: if we do not provide an alternative transition and we set the state of the animation node to 'invalid'
        // the animation engine stops itself;
        if (!bIsValidTransition) {
            this.eTransitionType = TransitionType.FADE;
            this.eTransitionSubType = TransitionSubType.CROSSFADE;
            window.app.console.log('AnimationTransitionFilterNode.parseElement: in place of the invalid transition a crossfade transition is used');
        }
        this.bIsReverseDirection = aNodeInfo.transitionDirection === 'reverse';
        this.eTransitionMode = TransitionMode.in;
        if (aNodeInfo.transitionMode &&
            aNodeInfo.transitionMode in TransitionMode) {
            var sMode = aNodeInfo.transitionMode;
            this.eTransitionMode = TransitionMode[sMode];
        }
    };
    AnimationTransitionFilterNode.prototype.createActivity = function () {
        var aActivityParamSet = this.fillActivityParams();
        // in the 2d context case map any transition to cross-fade
        if (!this.aNodeContext.aContext.aSlideShowHandler.isGlSupported()) {
            var bModeIn = this.getTransitionMode() == TransitionMode.in;
            return createCrossFadeTransition(aActivityParamSet, this.getAnimatedElement(), this.aNodeContext.aContext.nSlideWidth, this.aNodeContext.aContext.nSlideHeight, bModeIn);
        }
        return createShapeTransition(aActivityParamSet, this.getAnimatedElement(), this.aNodeContext.aContext.nSlideWidth, this.aNodeContext.aContext.nSlideHeight, this);
    };
    AnimationTransitionFilterNode.prototype.getTransitionType = function () {
        return this.eTransitionType;
    };
    AnimationTransitionFilterNode.prototype.getTransitionSubtype = function () {
        return this.eTransitionSubType;
    };
    AnimationTransitionFilterNode.prototype.getTransitionMode = function () {
        return this.eTransitionMode;
    };
    AnimationTransitionFilterNode.prototype.getReverseDirection = function () {
        return this.bIsReverseDirection;
    };
    AnimationTransitionFilterNode.prototype.info = function (verbose) {
        if (verbose === void 0) { verbose = false; }
        var sInfo = _super.prototype.info.call(this, verbose);
        if (verbose) {
            if (this.getTransitionType())
                sInfo += '; type: ' + TransitionType[this.getTransitionType()];
            if (this.getTransitionSubtype())
                sInfo += '; subtype: ' + TransitionSubType[this.getTransitionSubtype()];
            sInfo += '; is reverse direction: ' + this.getReverseDirection();
            sInfo += '; mode: ' + TransitionMode[this.getTransitionMode()];
        }
        return sInfo;
    };
    return AnimationTransitionFilterNode;
}(AnimationBaseNode));
//# sourceMappingURL=AnimationTransitionFilterNode.js.map