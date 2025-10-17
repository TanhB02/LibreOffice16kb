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
var StaticNoiseTransitionImp = /** @class */ (function (_super) {
    __extends(StaticNoiseTransitionImp, _super);
    function StaticNoiseTransitionImp(transitionParameters) {
        return _super.call(this, transitionParameters) || this;
    }
    StaticNoiseTransitionImp.prototype.getFragmentShader = function () {
        return "#version 300 es\n\t\t\t\tprecision mediump float;\n\n\t\t\t\tuniform sampler2D leavingSlideTexture;\n\t\t\t\tuniform sampler2D enteringSlideTexture;\n\t\t\t\tuniform sampler2D permTexture;\n\t\t\t\tuniform float time;\n\n\t\t\t\tin vec2 v_texturePosition;\n\t\t\t\tin vec3 v_normal;\n\t\t\t\tout vec4 outColor;\n\n\t\t\t\tfloat snoise(vec2 P) {\n\t\t\t\t\treturn texture(permTexture, P).r;\n\t\t\t\t}\n\n\t\t\t\t#define PART 0.5\n\t\t\t\t#define START 0.4\n\t\t\t\t#define END 0.9\n\n\t\t\t\tvoid main() {\n\t\t\t\t\tfloat sn = snoise(10.0 * v_texturePosition + time * 0.07);\n\t\t\t\t\t\n\t\t\t\t\tif (time < PART) {\n\t\t\t\t\t\tfloat sn1 = snoise(vec2(time * 15.0, 20.0 * v_texturePosition.y));\n\t\t\t\t\t\tfloat sn2 = snoise(v_texturePosition);\n\t\t\t\t\t\t\n\t\t\t\t\t\tif (sn1 > 1.0 - time * time && sn2 < 2.0 * time + 0.1)\n\t\t\t\t\t\t\toutColor = vec4(sn, sn, sn, 1.0);\n\t\t\t\t\t\telse if (time > START)\n\t\t\t\t\t\t\toutColor = mix(texture(leavingSlideTexture, v_texturePosition), vec4(sn, sn, sn, 1.0), (time - START) / (PART - START));\n\t\t\t\t\t\telse\n\t\t\t\t\t\t\toutColor = texture(leavingSlideTexture, v_texturePosition);\n\t\t\t\t\t} else if (time > END) {\n\t\t\t\t\t\toutColor = mix(vec4(sn, sn, sn, 1.0), texture(enteringSlideTexture, v_texturePosition), (time - END) / (1.0 - END));\n\t\t\t\t\t} else {\n\t\t\t\t\t\toutColor = vec4(sn, sn, sn, 1.0);\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\t";
    };
    return StaticNoiseTransitionImp;
}(PermTextureTransition));
function StaticNoiseTransition(transitionParameters) {
    var slide = new Primitive();
    slide.pushTriangle([0, 0], [1, 0], [0, 1]);
    slide.pushTriangle([1, 0], [0, 1], [1, 1]);
    var aLeavingPrimitives = [];
    aLeavingPrimitives.push(Primitive.cloneDeep(slide));
    slide.operations.push(makeRotateAndScaleDepthByWidth(vec3.fromValues(0, 1, 0), vec3.fromValues(0, 0, -1), 90, false, false, 0.0, 1.0));
    var aEnteringPrimitives = [];
    aEnteringPrimitives.push(slide);
    var aOperations = [];
    aOperations.push(makeRotateAndScaleDepthByWidth(vec3.fromValues(0, 1, 0), vec3.fromValues(0, 0, -1), -90, false, true, 0.0, 1.0));
    var newTransitionParameters = __assign(__assign({}, transitionParameters), { leavingPrimitives: aLeavingPrimitives, enteringPrimitives: aEnteringPrimitives, allOperations: aOperations });
    return new StaticNoiseTransitionImp(newTransitionParameters);
}
SlideShow.StaticNoiseTransition = StaticNoiseTransition;
//# sourceMappingURL=StaticNoiseTransition.js.map