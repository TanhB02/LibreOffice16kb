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
var OvalSubType;
(function (OvalSubType) {
    OvalSubType[OvalSubType["HORIZONTAL"] = 0] = "HORIZONTAL";
    OvalSubType[OvalSubType["VERTICAL"] = 1] = "VERTICAL";
})(OvalSubType || (OvalSubType = {}));
var OvalTransition = /** @class */ (function (_super) {
    __extends(OvalTransition, _super);
    function OvalTransition(transitionParameters) {
        return _super.call(this, transitionParameters) || this;
    }
    OvalTransition.prototype.initMaskFunctionParams = function () {
        var transitionSubType = this.transitionFilterInfo.transitionSubtype;
        if (transitionSubType == TransitionSubType.HORIZONTAL) {
            this.direction = OvalSubType.HORIZONTAL;
        }
        else if (transitionSubType == TransitionSubType.VERTICAL) {
            this.direction = OvalSubType.VERTICAL;
        }
    };
    // jscpd:ignore-start
    OvalTransition.prototype.getMaskFunction = function () {
        var isHorizontalDir = this.direction == OvalSubType.HORIZONTAL;
        return "\n                float getMaskValue(vec2 uv, float time) {\n                    float progress = time;\n\n                    vec2 center = vec2(0.5, 0.5);\n\n                    vec2 dist = abs(uv - center);\n\n                    " + (isHorizontalDir ? 'dist.y' : 'dist.x') + " *= 2.0;\n\n                    float size = progress * 1.2;\n\n                    float mask = step(length(dist), size);\n\n                    mask = min(mask, 1.0);\n\n                    return mask;\n                }\n\t\t";
    };
    return OvalTransition;
}(ClippingTransition));
SlideShow.OvalTransition = OvalTransition;
//# sourceMappingURL=OvalTransition.js.map