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
var AnimationTransformNode = /** @class */ (function (_super) {
    __extends(AnimationTransformNode, _super);
    function AnimationTransformNode(aNodeInfo, aParentNode, aNodeContext) {
        var _this = _super.call(this, aNodeInfo, aParentNode, aNodeContext) || this;
        _this.sClassName = 'AnimationTransformNode';
        return _this;
    }
    AnimationTransformNode.isValidTransformation = function (sType) {
        return (sType === 'translate' ||
            sType === 'scale' ||
            sType === 'rotate' ||
            sType === 'skewX' ||
            sType === 'skewY');
    };
    AnimationTransformNode.prototype.parseNodeInfo = function () {
        _super.prototype.parseNodeInfo.call(this);
        var aNodeInfo = this.aNodeInfo;
        if (!AnimationTransformNode.isValidTransformation(this.getTransformType())) {
            this.eCurrentState = NodeState.Invalid;
            window.app.console.log('AnimationTransformNode.parseElement: transformation type not found: ' +
                this.getTransformType());
        }
        else {
            this.attributeName = this.getTransformType();
        }
    };
    AnimationTransformNode.prototype.createActivity = function () {
        var aActivityParamSet = this.fillActivityParams();
        var aAnimation = null;
        if (this.getAttributeName() === 'scale' ||
            this.getAttributeName() === 'translate') {
            aAnimation = createPairPropertyAnimation(this.getAttributeName(), this.getAnimatedElement(), this.aNodeContext.aContext.nSlideWidth, this.aNodeContext.aContext.nSlideHeight);
        }
        else {
            aAnimation = createPropertyAnimation(this.getAttributeName(), this.getAnimatedElement(), this.aNodeContext.aContext.nSlideWidth, this.aNodeContext.aContext.nSlideHeight);
        }
        if (!aAnimation) {
            window.app.console.log('AnimationTransformNode.createActivity: failed to create animation.');
            return null;
        }
        var aInterpolator = null; // createActivity will compute it;
        return createActivity(aActivityParamSet, this, aAnimation, aInterpolator);
    };
    AnimationTransformNode.prototype.getTransformType = function () {
        return this.aNodeInfo.transformType.toLowerCase();
    };
    return AnimationTransformNode;
}(AnimationBaseNode3));
//# sourceMappingURL=AnimationTransformNode.js.map