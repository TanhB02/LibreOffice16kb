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
var PushSubType;
(function (PushSubType) {
    PushSubType[PushSubType["FROMBOTTOM"] = 0] = "FROMBOTTOM";
    PushSubType[PushSubType["FROMLEFT"] = 1] = "FROMLEFT";
    PushSubType[PushSubType["FROMRIGHT"] = 2] = "FROMRIGHT";
    PushSubType[PushSubType["FROMTOP"] = 3] = "FROMTOP";
})(PushSubType || (PushSubType = {}));
var PushTransition = /** @class */ (function (_super) {
    __extends(PushTransition, _super);
    function PushTransition(transitionParameters) {
        var _this = _super.call(this, transitionParameters) || this;
        _this.direction = 0;
        return _this;
    }
    PushTransition.prototype.start = function () {
        var transitionSubType = this.transitionFilterInfo.transitionSubtype;
        if (transitionSubType == TransitionSubType.FROMTOP) {
            this.direction = PushSubType.FROMTOP;
        }
        else if (transitionSubType == TransitionSubType.FROMRIGHT) {
            this.direction = PushSubType.FROMRIGHT;
        }
        else if (transitionSubType == TransitionSubType.FROMLEFT) {
            this.direction = PushSubType.FROMLEFT;
        }
        else {
            this.direction = PushSubType.FROMBOTTOM;
        }
        this.startTransition();
    };
    // jscpd:ignore-start
    PushTransition.prototype.renderUniformValue = function () {
        this.gl.uniform1i(this.gl.getUniformLocation(this.program, 'direction'), this.direction);
    };
    PushTransition.prototype.getFragmentShader = function () {
        return "#version 300 es\n                precision mediump float;\n\n                uniform sampler2D leavingSlideTexture;\n                uniform sampler2D enteringSlideTexture;\n                uniform float time;\n                uniform int direction;\n\n                in vec2 v_texCoord;\n                out vec4 outColor;\n\n                void main() {\n                    vec2 uv = v_texCoord;\n                    float progress = time;\n\n                    vec2 leavingUV = uv;\n                    vec2 enteringUV = uv;\n\n                    if (direction == 0) {\n                        // bottom to top\n                        leavingUV = uv + vec2(0.0, progress);\n                        enteringUV = uv + vec2(0.0, -1.0 + progress);\n                    } else if (direction == 1) {\n                        // left to right\n                        leavingUV = uv + vec2(-progress, 0.0);\n                        enteringUV = uv + vec2(1.0 - progress, 0.0);\n                    } else if (direction == 2) {\n                        // right to left\n                        leavingUV = uv + vec2(progress, 0.0);\n                        enteringUV = uv + vec2(-1.0 + progress, 0.0);\n                    } else if (direction == 3) {\n                        // top to bottom\n                        leavingUV = uv + vec2(0.0, -progress);\n                        enteringUV = uv + vec2(0.0, 1.0 - progress);\n                    }\n\n                    if ((direction == 0 && uv.y > 1.0 - progress) ||\n                        (direction == 1 && uv.x < progress) ||\n                        (direction == 2 && uv.x > 1.0 - progress) ||\n                        (direction == 3 && uv.y < progress)) {\n                        outColor = texture(enteringSlideTexture, enteringUV);\n                    } else {\n                        outColor = texture(leavingSlideTexture, leavingUV);\n                    }\n                }\n                ";
    };
    return PushTransition;
}(Transition2d));
SlideShow.PushTransition = PushTransition;
//# sourceMappingURL=PushTransition.js.map