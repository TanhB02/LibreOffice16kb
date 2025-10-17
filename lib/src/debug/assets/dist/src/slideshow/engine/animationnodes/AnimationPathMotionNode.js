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
var AnimationPathMotionNode = /** @class */ (function (_super) {
    __extends(AnimationPathMotionNode, _super);
    function AnimationPathMotionNode(aNodeInfo, aParentNode, aNodeContext) {
        var _this = _super.call(this, aNodeInfo, aParentNode, aNodeContext) || this;
        _this.sClassName = 'AnimationPathMotionNode';
        return _this;
    }
    AnimationPathMotionNode.prototype.parseNodeInfo = function () {
        _super.prototype.parseNodeInfo.call(this);
        var aNodeInfo = this.aNodeInfo;
        if (!aNodeInfo.path) {
            this.eCurrentState = NodeState.Invalid;
            window.app.console.log('AnimationPathMotionNode.parseElement: path is not valid');
        }
        this.path = aNodeInfo.path;
    };
    AnimationPathMotionNode.prototype.createActivity = function () {
        var aActivityParamSet = this.fillActivityParams();
        var aAnimation = new PathAnimation(this.path, this.getAdditiveMode(), aActivityParamSet.nSlideWidth, aActivityParamSet.nSlideHeight);
        return new SimpleActivity(aActivityParamSet, aAnimation, DirectionType.Forward);
    };
    AnimationPathMotionNode.prototype.getPath = function () {
        return this.path;
    };
    AnimationPathMotionNode.prototype.info = function (bVerbose) {
        if (bVerbose === void 0) { bVerbose = false; }
        var sInfo = _super.prototype.info.call(this, bVerbose);
        if (bVerbose) {
            // svg path
            sInfo += ';  path: ' + this.getPath();
        }
        return sInfo;
    };
    return AnimationPathMotionNode;
}(AnimationBaseNode));
//# sourceMappingURL=AnimationPathMotionNode.js.map