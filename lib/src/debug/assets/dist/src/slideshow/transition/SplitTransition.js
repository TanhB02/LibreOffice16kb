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
var SplitTransition = /** @class */ (function (_super) {
    __extends(SplitTransition, _super);
    function SplitTransition(transitionParameters) {
        return _super.call(this, transitionParameters) || this;
    }
    // jscpd:ignore-start
    SplitTransition.prototype.getMaskFunction = function () {
        var transitionSubType = this.transitionFilterInfo.transitionSubtype;
        var isHorizontalDir = transitionSubType == TransitionSubType.HORIZONTAL;
        // Horizontal Out, Vertical Out
        return "\n                float getMaskValue(vec2 uv, float time) {\n                    float progress = time;\n\n                    vec2 center = vec2(0.5, 0.5);\n\n                    vec2 dist = abs(uv - center);\n\n                    float size = progress * 1.5;\n\n                    float distCoord = " + (isHorizontalDir ? 'dist.y' : 'dist.x') + ";\n\n                    float mask = step(size / 2.0, distCoord);\n\n                    mask = 1.0 - mask;\n\n                    return mask;\n                }\n\t\t";
    };
    return SplitTransition;
}(ClippingTransition));
SlideShow.SplitTransition = SplitTransition;
//# sourceMappingURL=SplitTransition.js.map