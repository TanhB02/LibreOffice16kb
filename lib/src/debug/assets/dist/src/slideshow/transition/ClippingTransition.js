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
var ClippingTransition = /** @class */ (function (_super) {
    __extends(ClippingTransition, _super);
    function ClippingTransition(transitionParameters) {
        return _super.call(this, transitionParameters) || this;
    }
    ClippingTransition.prototype.initProgramTemplateParams = function () {
        this.forwardParameterSweep = true;
        this.invertMask = false;
        this.scaleIsotropically = false;
        var transitionType = this.transitionFilterInfo.transitionType;
        var transitionSubtype = this.transitionFilterInfo.transitionSubtype;
        var isDirectionForward = this.transitionFilterInfo.isDirectionForward;
        var isModeIn = this.transitionFilterInfo.isModeIn;
        var transitionInfo = aTransitionInfoTable[transitionType][transitionSubtype];
        if (!transitionInfo) {
            window.app.console.log("ClippingTransition: no transition info found for type: " +
                (transitionType + " and subtype: " + transitionSubtype));
            return;
        }
        this.scaleIsotropically = transitionInfo.scaleIsotropically;
        if (!isDirectionForward) {
            // At present Rotate180, FlipX, FlipY reverse methods are handled
            // case by case in each mask function transition
            switch (transitionInfo.reverseMethod) {
                default:
                    window.app.console.log("ClippingTransition: unexpected reverse method for type: " +
                        (transitionType + " and subtype: " + transitionSubtype));
                    return;
                case TransitionReverseMethod.Ignore:
                    break;
                case TransitionReverseMethod.SubtractAndInvert:
                    this.forwardParameterSweep = !this.forwardParameterSweep;
                    this.invertMask = !this.invertMask;
                    break;
                case TransitionReverseMethod.Rotate180:
                    // to be handled
                    break;
                case TransitionReverseMethod.FlipX:
                    // to be handled
                    break;
                case TransitionReverseMethod.FlipY:
                    // to be handled
                    break;
            }
        }
        if (!isModeIn) {
            if (transitionInfo.outInvertsSweep)
                this.forwardParameterSweep = !this.forwardParameterSweep;
            else
                this.invertMask = !this.invertMask;
        }
        console.debug("ClippingTransition: \n\t\t\ttype: " + transitionType + " \n\t\t\tsubtype: " + transitionSubtype + " \n\t\t\tdirection forward: " + isDirectionForward + "\n\t\t\tmode in: " + isModeIn + "\n\t\t\treverse method: " + TransitionReverseMethod[transitionInfo.reverseMethod] + "\n\t\t\toutInvertsSweep: " + transitionInfo.outInvertsSweep + "\n\t\t\tforwardParameterSweep: " + this.forwardParameterSweep + "\n\t\t\tinvertMask: " + this.invertMask + "\n\t\t\t");
        this.initMaskFunctionParams();
    };
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    ClippingTransition.prototype.initMaskFunctionParams = function () { };
    ClippingTransition.prototype.getMaskFunction = function () {
        return '';
    };
    ClippingTransition.prototype.getFragmentShader = function () {
        var isSlideTransition = !!this.leavingSlide;
        var scaleFactor = 1.0;
        var isLandscape;
        if (this.scaleIsotropically) {
            var ctx = this.transitionParameters.context;
            var width = ctx.canvas.width;
            var height = ctx.canvas.height;
            isLandscape = width > height;
            scaleFactor = isLandscape ? height / width : width / height;
        }
        var needScaling = scaleFactor != 1.0;
        var comp = isLandscape ? 'y' : 'x';
        // prettier-ignore
        return "#version 300 es\n                precision mediump float;\n\n                " + (isSlideTransition
            ? 'uniform sampler2D leavingSlideTexture;'
            : '') + "\n                uniform sampler2D enteringSlideTexture;\n                uniform float time;\n                " + (!isSlideTransition
            ? "\n                          uniform float alpha;\n                          uniform vec4 fromFillColor;\n                          uniform vec4 toFillColor;\n                          uniform vec4 fromLineColor;\n                          uniform vec4 toLineColor;\n                          "
            : '') + "\n\n                in vec2 v_texCoord;\n                out vec4 outColor;\n\n                " + this.getMaskFunction() + "\n\n\t\t            float scaleCompWrtCenter(float c, float s) {\n\t\t                return (c - 0.5) * s + 0.5;\n\t\t            }\n\n                " + (!isSlideTransition
            ? "\n                          " + GlHelpers.nearestPointOnSegment + "\n                          " + GlHelpers.computeColor + "\n                          "
            : '') + "\n\n                void main() {\n                    // reverse direction / mode out ?\n                    float progress = " + (this.forwardParameterSweep
            ? 'time'
            : '1.0 - time') + ";\n\n\n                    vec2 uv = v_texCoord;\n                    // isotropic scale case ?\n                    " + (needScaling ? "uv." + comp + " = scaleCompWrtCenter(uv." + comp + ", " + scaleFactor + ")" : '') + ";\n\n                    float mask = getMaskValue(uv, progress);\n                    // reverse direction / mode out ?\n                    " + (this.invertMask ? 'mask = 1.0 - mask;' : '') + "\n\n                    vec4 color1 = " + (isSlideTransition
            ? 'texture(leavingSlideTexture, v_texCoord)'
            : 'vec4(0, 0, 0, 0)') + ";\n                    vec4 color2 = texture(enteringSlideTexture, v_texCoord);\n                    " + (!isSlideTransition
            ? "\n                              color2 = computeColor(color2);\n                              color2 *= alpha;\n                              "
            : '') + "\n\n                    outColor = mix(color1, color2, mask);\n                }\n                ";
    };
    return ClippingTransition;
}(Transition2d));
SlideShow.ClippingTransition = ClippingTransition;
//# sourceMappingURL=ClippingTransition.js.map