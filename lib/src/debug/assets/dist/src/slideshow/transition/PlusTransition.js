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
var PlusTransition = /** @class */ (function (_super) {
    __extends(PlusTransition, _super);
    function PlusTransition(transitionParameters) {
        return _super.call(this, transitionParameters) || this;
    }
    PlusTransition.prototype.getMaskFunction = function () {
        var transitionSubType = this.transitionFilterInfo.transitionSubtype;
        if (transitionSubType === TransitionSubType.CORNERSOUT)
            return "\n                  float getMaskValue(vec2 uv, float time) {\n                      vec2 center = vec2(0.5, 0.5);\n\n                      vec2 dist = abs(uv - center);\n\n                      float innerBound = 0.25 - time / 4.0;\n                      float outerBound = 0.25 + time / 4.0;\n\n                      // dist >= innerBound && dist <= outerBound\n                      float mask =\n                          step(innerBound, dist.x) * step(-outerBound, -dist.x) *\n                          step(innerBound, dist.y) * step(-outerBound, -dist.y);\n\n                      return mask;\n                  }\n          ";
        else if (transitionSubType === TransitionSubType.CORNERSIN)
            return "\n                  float getMaskValue(vec2 uv, float time) {\n                      vec2 center = vec2(0.5, 0.5);\n\n                      vec2 dist = abs(uv - center);\n\n                      float size = 1.01 * (1.0 - time) / 2.0;\n\n                      float mask = step(size, dist.x) * step(size, dist.y);\n\n                      return mask;\n                  }\n          ";
    };
    return PlusTransition;
}(ClippingTransition));
SlideShow.PlusTransition = PlusTransition;
//# sourceMappingURL=PlusTransition.js.map