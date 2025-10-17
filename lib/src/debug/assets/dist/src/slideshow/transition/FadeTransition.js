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
var FadeSubType;
(function (FadeSubType) {
    FadeSubType[FadeSubType["FADEOVERBLACK"] = 0] = "FADEOVERBLACK";
    FadeSubType[FadeSubType["FADEOVERWHITE"] = 1] = "FADEOVERWHITE";
    FadeSubType[FadeSubType["SMOOTHLY"] = 2] = "SMOOTHLY";
})(FadeSubType || (FadeSubType = {}));
var FadeTransition = /** @class */ (function (_super) {
    __extends(FadeTransition, _super);
    function FadeTransition(transitionParameters) {
        var _this = _super.call(this, transitionParameters) || this;
        _this.effectTransition = 0;
        return _this;
    }
    FadeTransition.prototype.start = function () {
        var transitionSubType = this.transitionFilterInfo.transitionSubtype;
        this.effectTransition = FadeSubType.FADEOVERBLACK; // default
        if (transitionSubType == TransitionSubType.CROSSFADE) {
            this.effectTransition = FadeSubType.SMOOTHLY;
        }
        else if (transitionSubType == TransitionSubType.FADEOVERCOLOR &&
            this.transitionFilterInfo.fadeColor &&
            this.transitionFilterInfo.fadeColor.toUpperCase() === '#FFFFFF') {
            this.effectTransition = FadeSubType.FADEOVERWHITE;
        }
        this.startTransition();
    };
    FadeTransition.prototype.renderUniformValue = function () {
        this.gl.uniform1i(this.gl.getUniformLocation(this.program, 'effectType'), this.effectTransition);
    };
    FadeTransition.prototype.getFragmentShader = function () {
        return "#version 300 es\n\t\t\t\tprecision mediump float;\n\n\t\t\t\tuniform sampler2D leavingSlideTexture;\n\t\t\t\tuniform sampler2D enteringSlideTexture;\n\t\t\t\tuniform float time;\n\t\t\t\tuniform int effectType; // 0: Fade through black, 1: Fade through white, 2: Smooth fade\n\n\t\t\t\tin vec2 v_texCoord;\n\t\t\t\tout vec4 outColor;\n\n\t\t\t\tvoid main() {\n\t\t\t\t\tvec4 color0 = texture(leavingSlideTexture, v_texCoord);\n\t\t\t\t\tvec4 color1 = texture(enteringSlideTexture, v_texCoord);\n\t\t\t\t\tvec4 transitionColor;\n\n\t\t\t\t\tif (effectType == 0) {\n\t\t\t\t\t\t// Fade through black\n\t\t\t\t\t\ttransitionColor = vec4(0.0, 0.0, 0.0, 1.0);\n\t\t\t\t\t} else if (effectType == 1) {\n\t\t\t\t\t\t// Fade through white\n\t\t\t\t\t\ttransitionColor = vec4(1.0, 1.0, 1.0, 1.0);\n\t\t\t\t\t}\n\t\t\t\t\tif (effectType == 2) {\n\t\t\t\t\t\t// Smooth fade\n\t\t\t\t\t\tfloat smoothTime = smoothstep(0.0, 1.0, time);\n\t\t\t\t\t\toutColor = mix(color0, color1, smoothTime);\n\t\t\t\t\t} else {\n\t\t\t\t\t\tif (time < 0.5) {\n\t\t\t\t\t\t\toutColor = mix(color0, transitionColor, time * 2.0);\n\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\toutColor = mix(transitionColor, color1, (time - 0.5) * 2.0);\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\t";
    };
    return FadeTransition;
}(SlideShow.Transition2d));
SlideShow.FadeTransition = FadeTransition;
//# sourceMappingURL=FadeTransition.js.map