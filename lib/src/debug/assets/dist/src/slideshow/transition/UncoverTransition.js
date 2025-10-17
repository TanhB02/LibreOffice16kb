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
var UncoverSubType;
(function (UncoverSubType) {
    UncoverSubType[UncoverSubType["FROMTOP"] = 0] = "FROMTOP";
    UncoverSubType[UncoverSubType["FROMRIGHT"] = 1] = "FROMRIGHT";
    UncoverSubType[UncoverSubType["FROMLEFT"] = 2] = "FROMLEFT";
    UncoverSubType[UncoverSubType["FROMBOTTOM"] = 3] = "FROMBOTTOM";
})(UncoverSubType || (UncoverSubType = {}));
var UncoverTransition = /** @class */ (function (_super) {
    __extends(UncoverTransition, _super);
    function UncoverTransition(transitionParameters) {
        var _this = _super.call(this, transitionParameters) || this;
        _this.direction = 0;
        return _this;
    }
    UncoverTransition.prototype.start = function () {
        var transitionSubType = this.transitionFilterInfo.transitionSubtype;
        if (transitionSubType == TransitionSubType.FROMTOP) {
            this.direction = UncoverSubType.FROMTOP;
        }
        else if (transitionSubType == TransitionSubType.FROMLEFT) {
            this.direction = UncoverSubType.FROMLEFT;
        }
        else if (transitionSubType == TransitionSubType.FROMRIGHT) {
            this.direction = UncoverSubType.FROMRIGHT;
        }
        else {
            this.direction = UncoverSubType.FROMBOTTOM;
        }
        this.startTransition();
    };
    UncoverTransition.prototype.renderUniformValue = function () {
        this.gl.uniform1i(this.gl.getUniformLocation(this.program, 'direction'), this.direction);
    };
    // jscpd:ignore-start
    UncoverTransition.prototype.getFragmentShader = function () {
        return "#version 300 es\n\t\t\t\tprecision mediump float;\n\n\t\t\t\tuniform sampler2D leavingSlideTexture;\n\t\t\t\tuniform sampler2D enteringSlideTexture;\n\t\t\t\tuniform float time;\n\t\t\t\tuniform int direction;\n\n\t\t\t\tin vec2 v_texCoord;\n\t\t\t\tout vec4 outColor;\n\n\t\t\t\tvoid main() {\n\t\t\t\t\tvec2 uv = v_texCoord;\n\t\t\t\t\tfloat progress = time;\n\n\t\t\t\t\tvec2 leavingUV = uv;\n\t\t\t\t\tvec2 enteringUV = uv;\n\n\t\t\t\t\tif (direction == 0) {\n\t\t\t\t\t\tleavingUV = uv + vec2(0.0, -progress);\n\t\t\t\t\t} else if (direction == 1) {\n\t\t\t\t\t\tleavingUV = uv + vec2(progress, 0.0);\n\t\t\t\t\t} else if (direction == 2) {\n\t\t\t\t\t\tleavingUV = uv + vec2(-progress, 0.0);\n\t\t\t\t\t} else if (direction == 3) {\n\t\t\t\t\t\tleavingUV = uv + vec2(0.0, progress);\n\t\t\t\t\t}\n\t\t\t\t\telse if (direction == 4) {\n\t\t\t\t\t\t// TODO: Meed to fix this bug, top right to bottom left\n\t\t\t\t\t\tleavingUV = uv + vec2(progress, -progress);\n\t\t\t\t\t}\n\n\t\t\t\t\tbool showEntering = false;\n\t\t\t\t\tif (direction == 0) {\n\t\t\t\t\t\tshowEntering = uv.y < progress;\n\t\t\t\t\t} else if (direction == 1) {\n\t\t\t\t\t\tshowEntering = uv.x > 1.0 - progress;\n\t\t\t\t\t} else if (direction == 2) {\n\t\t\t\t\t\tshowEntering = uv.x < progress;\n\t\t\t\t\t} else if (direction == 3) {\n\t\t\t\t\t\tshowEntering = uv.y > 1.0 - progress;\n\t\t\t\t\t} else if (direction == 4) {\n\t\t\t\t\t\tshowEntering = uv.x > 1.0 - progress && uv.y < progress;\n\t\t\t\t\t}\n\n\t\t\t\t\tif (showEntering) {\n\t\t\t\t\t\toutColor = texture(enteringSlideTexture, enteringUV);\n\t\t\t\t\t} else {\n\t\t\t\t\t\toutColor = texture(leavingSlideTexture, leavingUV);\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\t";
    };
    return UncoverTransition;
}(Transition2d));
SlideShow.UncoverTransition = UncoverTransition;
//# sourceMappingURL=UncoverTransition.js.map