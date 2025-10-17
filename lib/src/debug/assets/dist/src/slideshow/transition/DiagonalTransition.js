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
var DiagonalSubType;
(function (DiagonalSubType) {
    DiagonalSubType[DiagonalSubType["BOTTOMLEFT"] = 0] = "BOTTOMLEFT";
    DiagonalSubType[DiagonalSubType["TOPLEFT"] = 1] = "TOPLEFT";
    DiagonalSubType[DiagonalSubType["TOPRIGHT"] = 2] = "TOPRIGHT";
    DiagonalSubType[DiagonalSubType["BOTTOMRIGHT"] = 3] = "BOTTOMRIGHT";
})(DiagonalSubType || (DiagonalSubType = {}));
var DiagonalTransition = /** @class */ (function (_super) {
    __extends(DiagonalTransition, _super);
    function DiagonalTransition(transitionParameters) {
        return _super.call(this, transitionParameters) || this;
    }
    DiagonalTransition.prototype.initMaskFunctionParams = function () {
        var transitionSubType = this.transitionFilterInfo.transitionSubtype;
        if (transitionSubType == TransitionSubType.HORIZONTALRIGHT &&
            !this.transitionFilterInfo.isDirectionForward) {
            this.direction = DiagonalSubType.BOTTOMLEFT;
        }
        else if (transitionSubType == TransitionSubType.HORIZONTALLEFT &&
            !this.transitionFilterInfo.isDirectionForward) {
            this.direction = DiagonalSubType.BOTTOMRIGHT;
        }
        else if (transitionSubType == TransitionSubType.HORIZONTALRIGHT) {
            this.direction = DiagonalSubType.TOPRIGHT;
        }
        else {
            this.direction = DiagonalSubType.TOPLEFT;
        }
    };
    // jscpd:ignore-start
    DiagonalTransition.prototype.getMaskFunction = function () {
        var startsFromRight = this.direction == DiagonalSubType.TOPRIGHT ||
            this.direction == DiagonalSubType.BOTTOMRIGHT;
        var startsFromBottom = this.direction == DiagonalSubType.BOTTOMLEFT ||
            this.direction == DiagonalSubType.BOTTOMRIGHT;
        return "\n                float getMaskValue(vec2 uv, float time) {\n                    float u_steps = 10.0f;\n\n                    float xCoord = " + (startsFromRight ? '1.0f - uv.x' : 'uv.x') + ";\n                    float yCoord = floor(uv.y * u_steps) / u_steps;\n                    float yStep = " + (startsFromBottom ? '1.0f - yCoord' : 'yCoord') + ";\n\n                    float stepDelay = 1.0f;\n                    float adjustedTime = time * 2.0f - yStep * stepDelay;\n\n                    float stepWidth = 1.0f;\n                    float mask = step(xCoord * stepWidth, adjustedTime);\n\n                    return mask;\n                }\n\t\t";
    };
    return DiagonalTransition;
}(ClippingTransition));
SlideShow.DiagonalTransition = DiagonalTransition;
//# sourceMappingURL=DiagonalTransition.js.map