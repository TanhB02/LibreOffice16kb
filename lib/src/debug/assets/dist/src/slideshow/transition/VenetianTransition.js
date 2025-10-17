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
var VenetianSubType;
(function (VenetianSubType) {
    VenetianSubType[VenetianSubType["HORIZONTAL"] = 0] = "HORIZONTAL";
    VenetianSubType[VenetianSubType["VERTICAL"] = 1] = "VERTICAL";
})(VenetianSubType || (VenetianSubType = {}));
var VenetianTransition = /** @class */ (function (_super) {
    __extends(VenetianTransition, _super);
    function VenetianTransition(transitionParameters) {
        return _super.call(this, transitionParameters) || this;
    }
    VenetianTransition.prototype.initMaskFunctionParams = function () {
        var transitionSubType = this.transitionFilterInfo.transitionSubtype;
        if (transitionSubType == TransitionSubType.HORIZONTAL) {
            this.direction = VenetianSubType.HORIZONTAL;
        }
        else {
            this.direction = VenetianSubType.VERTICAL;
        }
    };
    VenetianTransition.prototype.getMaskFunction = function () {
        var numBlinds = 6.0;
        var blindWidth = this.gl.canvas.width / numBlinds;
        var blindHeight = this.gl.canvas.height / numBlinds;
        var blindSize = this.direction == VenetianSubType.VERTICAL ? blindWidth : blindHeight;
        var comp = this.direction == VenetianSubType.VERTICAL ? 'x' : 'y';
        return "\n                #define CANVAS_WIDTH " + this.gl.canvas.width + "\n                #define CANVAS_HEIGHT " + this.gl.canvas.height + "\n\n                float getMaskValue(vec2 uv, float time) {\n                    float progress = time;\n\n                    vec2 resolution = vec2(CANVAS_WIDTH, CANVAS_HEIGHT);\n                    float blindSize = float(" + blindSize + ");\n\n                    float position = mod(uv." + comp + " * resolution." + comp + ", blindSize);\n\n                    float mask = step(position / blindSize, progress);\n\n                    return mask;\n                }\n\t\t";
    };
    return VenetianTransition;
}(ClippingTransition));
SlideShow.VenetianTransition = VenetianTransition;
//# sourceMappingURL=VenetianTransition.js.map