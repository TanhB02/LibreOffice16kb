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
var CheckersSubType;
(function (CheckersSubType) {
    CheckersSubType[CheckersSubType["ACROSS"] = 0] = "ACROSS";
    CheckersSubType[CheckersSubType["DOWN"] = 1] = "DOWN";
})(CheckersSubType || (CheckersSubType = {}));
var CheckersTransition = /** @class */ (function (_super) {
    __extends(CheckersTransition, _super);
    function CheckersTransition(transitionParameters) {
        return _super.call(this, transitionParameters) || this;
    }
    CheckersTransition.prototype.initMaskFunctionParams = function () {
        var transitionSubType = this.transitionFilterInfo.transitionSubtype;
        if (transitionSubType == TransitionSubType.DOWN) {
            this.direction = CheckersSubType.DOWN;
        }
        else if (transitionSubType == TransitionSubType.ACROSS) {
            this.direction = CheckersSubType.ACROSS;
        }
    };
    // jscpd:ignore-start
    CheckersTransition.prototype.getMaskFunction = function () {
        var numSquares = 8;
        var edgeSize = 1.0 / numSquares;
        var isAcrossDir = this.direction == CheckersSubType.ACROSS;
        return "\n                float getMaskValue(vec2 uv, float time) {\n                    float progress = time * 2.0;\n\n                    vec2 squareSize = vec2(" + edgeSize + ", " + edgeSize + ");\n                    vec2 checkerCoord = floor(uv / squareSize);\n\n                    bool isWhiteSquare = mod(checkerCoord.x + checkerCoord.y, 2.0) == 0.0;\n                    vec2 localUV = fract(uv / squareSize);\n\n                    float adjustedProgress = isWhiteSquare ? progress : progress - 1.0;\n                    adjustedProgress = clamp(adjustedProgress, 0.0, 1.0);\n\n                    float localCoord = " + (isAcrossDir ? 'localUV.x' : 'localUV.y') + ";\n                    bool showEntering = localCoord < adjustedProgress;\n\n                    return float(showEntering);\n                }\n\t\t";
    };
    return CheckersTransition;
}(ClippingTransition));
SlideShow.CheckersTransition = CheckersTransition;
//# sourceMappingURL=CheckersTransition.js.map