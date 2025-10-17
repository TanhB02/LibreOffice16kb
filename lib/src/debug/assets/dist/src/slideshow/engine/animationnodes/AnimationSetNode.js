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
var AnimationSetNode = /** @class */ (function (_super) {
    __extends(AnimationSetNode, _super);
    function AnimationSetNode(aNodeInfo, aParentNode, aNodeContext) {
        var _this = _super.call(this, aNodeInfo, aParentNode, aNodeContext) || this;
        _this.sClassName = 'AnimationSetNode';
        return _this;
    }
    AnimationSetNode.prototype.createActivity = function () {
        var aAnimation = createPropertyAnimation(this.getAttributeName(), this.getAnimatedElement(), this.aNodeContext.aContext.nSlideWidth, this.aNodeContext.aContext.nSlideHeight);
        var aActivityParamSet = this.fillActivityParams();
        return new SetActivity(aActivityParamSet, this, aAnimation);
    };
    return AnimationSetNode;
}(AnimationBaseNode2));
//# sourceMappingURL=AnimationSetNode.js.map