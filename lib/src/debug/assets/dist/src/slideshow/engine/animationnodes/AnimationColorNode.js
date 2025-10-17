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
var ColorSpace;
(function (ColorSpace) {
    ColorSpace[ColorSpace["rgb"] = 0] = "rgb";
    ColorSpace[ColorSpace["hsl"] = 1] = "hsl";
})(ColorSpace || (ColorSpace = {}));
var ClockDirection;
(function (ClockDirection) {
    ClockDirection[ClockDirection["clockwise"] = 0] = "clockwise";
    ClockDirection[ClockDirection["counterClockwise"] = 1] = "counterClockwise";
})(ClockDirection || (ClockDirection = {}));
var AnimationColorNode = /** @class */ (function (_super) {
    __extends(AnimationColorNode, _super);
    function AnimationColorNode(aNodeInfo, aParentNode, aNodeContext) {
        var _this = _super.call(this, aNodeInfo, aParentNode, aNodeContext) || this;
        _this.sClassName = 'AnimationColorNode';
        return _this;
    }
    AnimationColorNode.prototype.parseNodeInfo = function () {
        _super.prototype.parseNodeInfo.call(this);
        var aNodeInfo = this.aNodeInfo;
        this.eColorInterpolation = ColorSpace.rgb;
        if (aNodeInfo.colorInterpolation &&
            aNodeInfo.colorInterpolation in ColorSpace) {
            var sColorInterpolation = aNodeInfo.colorInterpolation;
            this.eColorInterpolation = ColorSpace[sColorInterpolation];
        }
        this.eColorInterpolationDirection = ClockDirection.clockwise;
        if (aNodeInfo.colorInterpolationDirection &&
            aNodeInfo.colorInterpolationDirection in ClockDirection) {
            var sColorInterpolationDir = aNodeInfo.colorInterpolationDirection;
            this.eColorInterpolationDirection =
                ClockDirection[sColorInterpolationDir];
        }
    };
    AnimationColorNode.prototype.createActivity = function () {
        var aActivityParamSet = this.fillActivityParams();
        // initialize object dim color
        if (this.getAnimatedElement() &&
            this.getToValue() &&
            this.getAttributeName() === 'dimcolor') {
            this.getAnimatedElement().setDefaultDimColor(colorParser(this.getToValue()));
        }
        var aAnimation = createPropertyAnimation(this.getAttributeName(), this.getAnimatedElement(), this.aNodeContext.aContext.nSlideWidth, this.aNodeContext.aContext.nSlideHeight);
        var aColorAnimation;
        var aInterpolator;
        if (this.getColorInterpolation() === ColorSpace.hsl) {
            ANIMDBG.print('AnimationColorNode.createActivity: color space hsl');
            aColorAnimation = new HSLAnimationWrapper(aAnimation);
            aInterpolator = PropertyInterpolator.getInterpolator(PropertyValueType.Color, ColorSpace.hsl, this.getColorInterpolationDirection());
        }
        else {
            ANIMDBG.print('AnimationColorNode.createActivity: color space rgb');
            aColorAnimation = aAnimation;
            aInterpolator = PropertyInterpolator.getInterpolator(PropertyValueType.Color, ColorSpace.rgb);
        }
        return createActivity(aActivityParamSet, this, aColorAnimation, aInterpolator);
    };
    AnimationColorNode.prototype.getColorInterpolation = function () {
        return this.eColorInterpolation;
    };
    AnimationColorNode.prototype.getColorInterpolationDirection = function () {
        return this.eColorInterpolationDirection;
    };
    AnimationColorNode.prototype.info = function (bVerbose) {
        if (bVerbose === void 0) { bVerbose = false; }
        var sInfo = _super.prototype.info.call(this, bVerbose);
        if (bVerbose) {
            // color interpolation
            sInfo +=
                ';  color-interpolation: ' + ColorSpace[this.getColorInterpolation()];
            // color interpolation direction
            sInfo +=
                ';  color-interpolation-direction: ' +
                    ClockDirection[this.getColorInterpolationDirection()];
        }
        return sInfo;
    };
    return AnimationColorNode;
}(AnimationBaseNode3));
//# sourceMappingURL=AnimationColorNode.js.map