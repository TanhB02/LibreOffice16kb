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
var BoxTransition = /** @class */ (function (_super) {
    __extends(BoxTransition, _super);
    function BoxTransition(transitionParameters) {
        return _super.call(this, transitionParameters) || this;
    }
    // jscpd:ignore-start
    BoxTransition.prototype.getMaskFunction = function () {
        return "\n                float getMaskValue(vec2 uv, float time) {\n                    float progress = time;\n\n                    vec2 center = vec2(0.5, 0.5);\n\n                    vec2 dist = abs(uv - center);\n\n                    float size = progress * 1.5;\n\n                    float mask = step(dist.x, size / 2.0) * step(dist.y, size / 2.0);\n\n                    return mask;\n                }\n\t\t";
    };
    return BoxTransition;
}(ClippingTransition));
SlideShow.BoxTransition = BoxTransition;
//# sourceMappingURL=BoxTransition.js.map