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
var CombSubType;
(function (CombSubType) {
    CombSubType[CombSubType["COMBHORIZONTAL"] = 0] = "COMBHORIZONTAL";
    CombSubType[CombSubType["COMBVERTICAL"] = 1] = "COMBVERTICAL";
})(CombSubType || (CombSubType = {}));
var CombTransition = /** @class */ (function (_super) {
    __extends(CombTransition, _super);
    function CombTransition(transitionParameters) {
        var _this = _super.call(this, transitionParameters) || this;
        _this.direction = 0;
        return _this;
    }
    CombTransition.prototype.initProgramTemplateParams = function () {
        var transitionSubType = this.transitionFilterInfo.transitionSubtype;
        if (transitionSubType == TransitionSubType.COMBVERTICAL) {
            this.direction = CombSubType.COMBVERTICAL;
        }
        else {
            this.direction = CombSubType.COMBHORIZONTAL;
        }
    };
    // jscpd:ignore-start
    CombTransition.prototype.getFragmentShader = function () {
        var isVertical = this.direction == CombSubType.COMBVERTICAL;
        // prettier-ignore
        return "#version 300 es\n                precision mediump float;\n\n                uniform sampler2D leavingSlideTexture;\n                uniform sampler2D enteringSlideTexture;\n                uniform float time;\n\n                in vec2 v_texCoord;\n                out vec4 outColor;\n\n                void main() {\n                    const float numTeeth = 20.0;\n\n                    float progress = smoothstep(0.0, 1.0, time);\n\n                    float coord = " + (isVertical ? 'v_texCoord.x' : 'v_texCoord.y') + ";\n\n                    float toothIndex = floor(coord * numTeeth);\n\n                    float moveDirection = mod(toothIndex, 2.0) == 0.0 ? 1.0 : -1.0;\n\n                    float offset = moveDirection * (1.0 - progress);\n\n                    float threshold = moveDirection > 0.0 ?\n                        " + (isVertical ? 'v_texCoord.y' : 'v_texCoord.x') + " :\n                        " + (isVertical ? '1.0 - v_texCoord.y' : '1.0 - v_texCoord.x') + ";\n\n                    if (threshold < progress) {\n                       vec2 enteringCoord = " + (isVertical ?
            'vec2(v_texCoord.x, fract(v_texCoord.y + offset))' :
            'vec2(fract(v_texCoord.x + offset), v_texCoord.y)') + ";\n                       outColor = texture(enteringSlideTexture, enteringCoord);\n                    } else {\n                        vec2 leavingCoord = " + (isVertical ?
            'vec2(v_texCoord.x, fract(v_texCoord.y + offset))' :
            'vec2(fract(v_texCoord.x + offset), v_texCoord.y)') + ";\n                        outColor = texture(leavingSlideTexture, leavingCoord);\n                    }\n                }";
    };
    return CombTransition;
}(Transition2d));
SlideShow.CombTransition = CombTransition;
//# sourceMappingURL=CombTransition.js.map