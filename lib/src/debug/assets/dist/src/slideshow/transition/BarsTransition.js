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
var BarsSubType;
(function (BarsSubType) {
    BarsSubType[BarsSubType["VERTICAL"] = 0] = "VERTICAL";
    BarsSubType[BarsSubType["HORIZONTAL"] = 1] = "HORIZONTAL";
})(BarsSubType || (BarsSubType = {}));
var BarsTransition = /** @class */ (function (_super) {
    __extends(BarsTransition, _super);
    function BarsTransition(transitionParameters) {
        return _super.call(this, transitionParameters) || this;
    }
    BarsTransition.prototype.initMaskFunctionParams = function () {
        var transitionSubType = this.transitionFilterInfo.transitionSubtype;
        if (transitionSubType == TransitionSubType.VERTICAL) {
            this.direction = BarsSubType.VERTICAL;
        }
        else if (transitionSubType == TransitionSubType.HORIZONTAL) {
            this.direction = BarsSubType.HORIZONTAL;
        }
    };
    // jscpd:ignore-start
    BarsTransition.prototype.getMaskFunction = function () {
        var isVerticalDir = this.direction == BarsSubType.VERTICAL;
        return "\n                float random(vec2 co) {\n                    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);\n                }\n\n                float getMaskValue(vec2 uv, float time) {\n                    float progress = time;\n\n                    float numBars = 128.0;\n                    float coord = " + (isVerticalDir ? 'uv.x' : 'uv.y') + ";\n                    float randValue = random(vec2(floor(coord * numBars), 0.0));\n\n                    bool showEntering = (randValue < progress);\n                    return float(showEntering);\n                }\n\t\t";
    };
    return BarsTransition;
}(ClippingTransition));
SlideShow.BarsTransition = BarsTransition;
//# sourceMappingURL=BarsTransition.js.map