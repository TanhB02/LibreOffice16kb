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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var RippleTransitionImp = /** @class */ (function (_super) {
    __extends(RippleTransitionImp, _super);
    function RippleTransitionImp(transitionParameters) {
        return _super.call(this, transitionParameters) || this;
    }
    RippleTransitionImp.prototype.displayPermSlide_ = function () {
        var centerUniform = this.gl.getUniformLocation(this.program, 'center');
        this.gl.uniform2fv(centerUniform, [0.5, 0.5]);
        var slideRation = this.gl.getUniformLocation(this.program, 'slideRatio');
        this.gl.uniform1f(slideRation, 1.0);
    };
    RippleTransitionImp.prototype.getFragmentShader = function () {
        return "#version 300 es\n                precision mediump float;\n\n                #define M_PI 3.1415926535897932384626433832795\n\n\n                uniform sampler2D leavingSlideTexture;\n                uniform sampler2D enteringSlideTexture;\n                uniform float time;\n                uniform vec2 center;\n                uniform float slideRatio;\n\n                in vec2 v_texturePosition;\n                in vec3 v_normal;\n                out vec4 outColor;\n\n                float betterDistance(vec2 p1, vec2 p2)\n                {\n                    p1.x *= slideRatio;\n                    p2.x *= slideRatio;\n                    return distance(p1, p2);\n                }\n\n                void main() {\n                    const float w = 0.7;\n                    const float v = 0.1;\n\n                    float dist = betterDistance(center, v_texturePosition);\n\n                    float t = time * (sqrt(2.0) * (slideRatio < 1.0 ? 1.0 / slideRatio : slideRatio));\n\n                    float mixed = smoothstep(t*w-v, t*w+v, dist);\n\n                    vec2 offset = (v_texturePosition - center) * (sin(dist * 64.0 - time * 16.0) + 0.5) / 32.0;\n                    vec2 wavyTexCoord = mix(v_texturePosition + offset, v_texturePosition, time);\n\n                    vec2 pos = mix(wavyTexCoord, v_texturePosition, mixed);\n\n                    vec4 leaving = texture(leavingSlideTexture, pos);\n                    vec4 entering = texture(enteringSlideTexture, pos);\n                    outColor = mix(entering, leaving, mixed);\n                    \n                }\n";
    };
    return RippleTransitionImp;
}(PermTextureTransition));
function RippleTransition(transitionParameters) {
    var slide = new Primitive();
    slide.pushTriangle([0, 0], [1, 0], [0, 1]);
    slide.pushTriangle([1, 0], [0, 1], [1, 1]);
    var aLeavingPrimitives = [];
    aLeavingPrimitives.push(Primitive.cloneDeep(slide));
    var aEnteringPrimitives = [Primitive.cloneDeep(slide)];
    var newTransitionParameters = __assign(__assign({}, transitionParameters), { leavingPrimitives: aLeavingPrimitives, enteringPrimitives: aEnteringPrimitives, allOperations: [] });
    return new RippleTransitionImp(newTransitionParameters);
}
SlideShow.RippleTransition = RippleTransition;
//# sourceMappingURL=RippleTransition.js.map