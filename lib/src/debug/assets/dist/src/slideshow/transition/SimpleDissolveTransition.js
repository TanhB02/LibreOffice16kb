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
var SimpleDissolveTransition = /** @class */ (function (_super) {
    __extends(SimpleDissolveTransition, _super);
    function SimpleDissolveTransition(transitionParameters) {
        return _super.call(this, transitionParameters) || this;
    }
    SimpleDissolveTransition.prototype.getMaskFunction = function () {
        var numSquares = 16;
        var edgeSize = 1.0 / numSquares;
        return "\n\t\t\t\t// generate a pseudo-random value based on coordinates\n\t\t\t\tfloat random(vec2 co) {\n\t\t\t\t\treturn fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);\n\t\t\t\t}\n\n\t\t\t\tfloat getMaskValue(vec2 uv, float time) {\n\t\t\t\t\tfloat progress = time;\n\n\t\t\t\t\tvec2 squareSize = vec2(" + edgeSize + ", " + edgeSize + ");\n\n\t\t\t\t\tvec2 checkerCoord = floor(uv / squareSize);\n\n\t\t\t\t\tfloat randValue = random(checkerCoord);\n\n\t\t\t\t\tbool showEntering = progress > randValue;\n\n\t\t\t\t\treturn float(showEntering);\n\t\t\t\t}\n\t\t";
    };
    return SimpleDissolveTransition;
}(ClippingTransition));
SlideShow.SimpleDissolveTransition = SimpleDissolveTransition;
//# sourceMappingURL=SimpleDissolveTransition.js.map