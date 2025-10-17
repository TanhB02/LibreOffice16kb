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
var DissolveTransition3dImp = /** @class */ (function (_super) {
    __extends(DissolveTransition3dImp, _super);
    function DissolveTransition3dImp(transitionParameters) {
        return _super.call(this, transitionParameters) || this;
    }
    DissolveTransition3dImp.prototype.getFragmentShader = function () {
        return "#version 300 es\n                precision mediump float;\n\n                uniform sampler2D leavingSlideTexture;\n                uniform sampler2D enteringSlideTexture;\n                uniform sampler2D permTexture;\n                uniform float time;\n\n                in vec2 v_texturePosition;\n                in vec3 v_normal;\n                out vec4 outColor;\n\n                float snoise(vec2 P) {\n                    return texture(permTexture, P).r;\n                }\n\n                void main() {\n                    float sn = snoise(10.0*v_texturePosition);\n                    if( sn < time)\n                        outColor = texture(enteringSlideTexture, v_texturePosition);\n                    else\n                        outColor = texture(leavingSlideTexture, v_texturePosition);\n                }\n                ";
    };
    return DissolveTransition3dImp;
}(PermTextureTransition));
// TODO - remove code duplication
/* jscpd:ignore-start */
function DissolveTransition3d(transitionParameters) {
    var slide = new Primitive();
    slide.pushTriangle([0, 0], [1, 0], [0, 1]);
    slide.pushTriangle([1, 0], [0, 1], [1, 1]);
    var aLeavingPrimitives = [];
    aLeavingPrimitives.push(Primitive.cloneDeep(slide));
    var aEnteringPrimitives = [Primitive.cloneDeep(slide)];
    var newTransitionParameters = __assign(__assign({}, transitionParameters), { leavingPrimitives: aLeavingPrimitives, enteringPrimitives: aEnteringPrimitives, allOperations: [] });
    return new DissolveTransition3dImp(newTransitionParameters);
}
/* jscpd:ignore-end */
SlideShow.DissolveTransition3d = DissolveTransition3d;
//# sourceMappingURL=DissolveTransition3d.js.map