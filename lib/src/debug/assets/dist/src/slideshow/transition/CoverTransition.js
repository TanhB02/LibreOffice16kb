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
var CoverSubType;
(function (CoverSubType) {
    CoverSubType[CoverSubType["FROMBOTTOM"] = 0] = "FROMBOTTOM";
    CoverSubType[CoverSubType["FROMLEFT"] = 1] = "FROMLEFT";
    CoverSubType[CoverSubType["FROMRIGHT"] = 2] = "FROMRIGHT";
    CoverSubType[CoverSubType["FROMTOP"] = 3] = "FROMTOP";
})(CoverSubType || (CoverSubType = {}));
var CoverTransition = /** @class */ (function (_super) {
    __extends(CoverTransition, _super);
    function CoverTransition(transitionParameters) {
        var _this = _super.call(this, transitionParameters) || this;
        _this.direction = 0;
        return _this;
    }
    CoverTransition.prototype.start = function () {
        var transitionSubType = this.transitionFilterInfo.transitionSubtype;
        if (transitionSubType == TransitionSubType.FROMTOP) {
            this.direction = CoverSubType.FROMTOP;
        }
        else if (transitionSubType == TransitionSubType.FROMLEFT) {
            this.direction = CoverSubType.FROMLEFT;
        }
        else if (transitionSubType == TransitionSubType.FROMRIGHT) {
            this.direction = CoverSubType.FROMRIGHT;
        }
        else {
            this.direction = CoverSubType.FROMBOTTOM;
        }
        this.startTransition();
    };
    // jscpd:ignore-start
    CoverTransition.prototype.renderUniformValue = function () {
        this.gl.uniform1i(this.gl.getUniformLocation(this.program, 'direction'), this.direction);
    };
    CoverTransition.prototype.getFragmentShader = function () {
        return "#version 300 es\n                precision mediump float;\n\n                uniform sampler2D leavingSlideTexture;\n                uniform sampler2D enteringSlideTexture;\n                uniform float time;\n                uniform int direction;\n\n                in vec2 v_texCoord;\n                out vec4 outColor;\n\n                void main() {\n                    vec2 uv = v_texCoord;\n                    float progress = time;\n\n                    vec2 leavingUV = uv;\n                    vec2 enteringUV = uv;\n\n                    if (direction == 0) {\n                        enteringUV = uv + vec2(0.0, -1.0 + progress);\n                    } else if (direction == 1) {\n                        enteringUV = uv + vec2(1.0 - progress, 0.0);\n                    } else if (direction == 2) {\n                        enteringUV = uv + vec2(-1.0 + progress, 0.0);\n                    } else if (direction == 3) {\n                        enteringUV = uv + vec2(0.0, 1.0 - progress);\n                    } else if (direction == 4) {\n                        // bottom left to top right\n                        enteringUV = uv + vec2(1.0 - progress, -1.0 + progress);\n                    } else if (direction == 5) {\n                        // top right to bottom left\n                        enteringUV = uv + vec2(-1.0 + progress, 1.0 - progress);\n                    } else if (direction == 6) {\n                        // top left to bottom right\n                        enteringUV = uv + vec2(1.0 - progress, 1.0 - progress);\n                    } else if (direction == 7) {\n                        // bottom right to top left\n                        enteringUV = uv + vec2(-1.0 + progress, -1.0 + progress);\n                    }\n\n                    bool showEntering = false;\n                    if (direction == 0) {\n                        showEntering = uv.y > 1.0 - progress;\n                    } else if (direction == 1) {\n                        showEntering = uv.x < progress;\n                    } else if (direction == 2) {\n                        showEntering = uv.x > 1.0 - progress;\n                    } else if (direction == 3) {\n                        showEntering = uv.y < progress;\n                    } else if (direction == 4) {\n                        showEntering = uv.x < progress && uv.y > 1.0 - progress;\n                    } else if (direction == 5) {\n                        showEntering = uv.x > 1.0 - progress && uv.y < progress;\n                    } else if (direction == 6) {\n                        showEntering = uv.x < progress && uv.y < progress;\n                    } else if (direction == 7) {\n                        showEntering = uv.x > 1.0 - progress && uv.y > 1.0 - progress;\n                    }\n\n                    if (showEntering) {\n                        outColor = texture(enteringSlideTexture, enteringUV);\n                    } else {\n                        outColor = texture(leavingSlideTexture, leavingUV);\n                    }\n                }\n                ";
    };
    return CoverTransition;
}(Transition2d));
SlideShow.CoverTransition = CoverTransition;
//# sourceMappingURL=CoverTransition.js.map