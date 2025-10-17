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
var WedgeTransition = /** @class */ (function (_super) {
    __extends(WedgeTransition, _super);
    function WedgeTransition(transitionParameters) {
        return _super.call(this, transitionParameters) || this;
    }
    WedgeTransition.prototype.getMaskFunction = function () {
        return "\n\t\t            #define M_PI " + Math.PI + "\n\n                float getMaskValue(vec2 uv, float time) {\n                    float progress = time;\n\n                    vec2 center = vec2(0.5, 0.5);\n\n                    vec2 dist = uv - center;\n                    float angle = atan(dist.x, dist.y);\n\n                    if (angle < 0.0) {\n                        angle += 2.0 * M_PI;\n                    }\n\n                    float wedgeAngle = M_PI * progress;\n\n                    float mask = step(angle, wedgeAngle) + step(2.0 * M_PI - wedgeAngle, angle);\n\t\t\t\t\t\t\t\t\t\tmask = min(mask, 1.0);\n\n                    return mask;\n                }\n\t\t";
    };
    return WedgeTransition;
}(ClippingTransition));
SlideShow.WedgeTransition = WedgeTransition;
//# sourceMappingURL=WedgeTransition.js.map