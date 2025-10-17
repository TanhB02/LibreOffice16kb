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
var CutTransition = /** @class */ (function (_super) {
    __extends(CutTransition, _super);
    function CutTransition(transitionParameters) {
        return _super.call(this, transitionParameters) || this;
    }
    CutTransition.prototype.getFragmentShader = function () {
        return "#version 300 es\n                precision mediump float;\n\n                uniform sampler2D leavingSlideTexture;\n                uniform sampler2D enteringSlideTexture;\n                uniform float time;\n\n                in vec2 v_texCoord;\n                out vec4 outColor;\n\n                void main() {\n                    if (time < 1.0) {\n                        outColor =  vec4(0.0f, 0.0f, 0.0f, 1.0f);\n                    } else {\n                        outColor = texture(enteringSlideTexture, v_texCoord);\n                    }\n                }\n                ";
    };
    return CutTransition;
}(SlideShow.Transition2d));
SlideShow.CutTransition = CutTransition;
//# sourceMappingURL=CutTransition.js.map