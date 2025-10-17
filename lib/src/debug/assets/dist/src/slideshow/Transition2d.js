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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var TransitionParameters = /** @class */ (function () {
    function TransitionParameters() {
        this.context = null;
        this.current = null;
        this.next = null;
        this.transitionFilterInfo = null;
        this.callback = null;
    }
    return TransitionParameters;
}());
var TransitionBase = /** @class */ (function (_super) {
    __extends(TransitionBase, _super);
    function TransitionBase(transitionParameters) {
        var _this = _super.call(this, transitionParameters) || this;
        _this.transitionFilterInfo = null;
        _this.transitionFilterInfo = transitionParameters.transitionFilterInfo;
        _this.createProgram();
        _this.prepareTransition();
        return _this;
    }
    TransitionBase.prototype.startTransition = function () {
        this.time = null;
        this.isLastFrame = false;
        this.requestAnimationFrameId = requestAnimationFrame(this.animate.bind(this));
    };
    TransitionBase.prototype.start = function () {
        this.startTransition();
    };
    TransitionBase.prototype.endTransition = function () {
        this.releaseResources();
        console.debug('Transition completed');
    };
    TransitionBase.prototype.releaseResources = function () {
        var _this = this;
        if (this.context.isDisposed())
            return;
        // Clean up vertex array
        this.gl.bindVertexArray(null);
        if (this.vao) {
            this.gl.deleteVertexArray(this.vao);
            this.vao = null;
        }
        // Unbind
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        // Detach and delete shaders from the program
        var attachedShaders = this.gl.getAttachedShaders(this.program);
        if (attachedShaders) {
            attachedShaders.forEach(function (shader) {
                _this.gl.detachShader(_this.program, shader);
                _this.gl.deleteShader(shader);
            });
        }
        // Delete the program
        this.gl.deleteProgram(this.program);
        this.program = null;
    };
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    TransitionBase.prototype.renderUniformValue = function () { };
    return TransitionBase;
}(SlideChangeGl));
var Transition2d = /** @class */ (function (_super) {
    __extends(Transition2d, _super);
    function Transition2d(transitionParameters) {
        var _this = _super.call(this, transitionParameters) || this;
        _this._uniformCache = new Map();
        return _this;
    }
    Transition2d.prototype.getFragmentShader = function () {
        var isSlideTransition = !!this.leavingSlide;
        return "#version 300 es\n\t\t\t\tprecision mediump float;\n\n\t\t\t\t" + (isSlideTransition ? 'uniform sampler2D leavingSlideTexture;' : '') + "\n\t\t\t\tuniform sampler2D enteringSlideTexture;\n\t\t\t\tuniform float time;\n\t\t\t\t" + (!isSlideTransition ? 'uniform float alpha;' : '') + "\n\n\t\t\t\tin vec2 v_texCoord;\n\t\t\t\tout vec4 outColor;\n\n\t\t\t\tvoid main() {\n\t\t\t\t\tvec4 color0 = " + (isSlideTransition
            ? 'texture(leavingSlideTexture, v_texCoord)'
            : 'vec4(0, 0, 0, 0)') + ";\n\t\t\t\t\tvec4 color1 = texture(enteringSlideTexture, v_texCoord);\n\t\t\t\t\t" + (!isSlideTransition ? 'color1 *= alpha;' : '') + "\n\t\t\t\t\toutColor = mix(color0, color1, time);\n\t\t\t\t}\n\t\t\t\t";
    };
    Transition2d.prototype.setPositionBuffer = function (bounds) {
        if (!bounds)
            return;
        var v = [];
        // convert [0,1] => [-1,1]
        for (var i = 0; i < bounds.length; ++i) {
            var x = 2 * bounds[i].x - 1;
            v.push(x);
            // flip y coordinates
            var y = -(2 * bounds[i].y - 1);
            v.push(y);
        }
        var positions = new Float32Array(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], [v[0], v[1], 0, 0, 1], false), [v[2], v[3], 0, 1, 1], false), [v[4], v[5], 0, 0, 0], false), [v[6], v[7], 0, 1, 0], false));
        var gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    };
    Transition2d.prototype.getUniformLocation = function (name) {
        if (!this.program)
            return null;
        if (this._uniformCache.has(name)) {
            return this._uniformCache.get(name);
        }
        var loc = this.gl.getUniformLocation(this.program, name);
        this._uniformCache.set(name, loc);
        return loc;
    };
    Transition2d.prototype.render = function (nT, properties) {
        if (this.context.isDisposed())
            return;
        var isSlideTransition = !!this.leavingSlide;
        console.debug("Transition2d.render: nT: " + nT);
        var gl = this.gl;
        if (isSlideTransition) {
            gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
        }
        if (!this.program) {
            console.error('Transition2d.render: this.program is missing');
            return;
        }
        gl.useProgram(this.program);
        gl.bindVertexArray(this.vao);
        gl.uniform1f(gl.getUniformLocation(this.program, 'time'), nT);
        if (isSlideTransition) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.leavingSlide);
            gl.uniform1i(gl.getUniformLocation(this.program, 'leavingSlideTexture'), 0);
        }
        else {
            var _a = LayerRendererGl.computeColor(properties), bounds = _a.bounds, alpha = _a.alpha, fromFillColor = _a.fromFillColor, toFillColor = _a.toFillColor, fromLineColor = _a.fromLineColor, toLineColor = _a.toLineColor;
            console.debug("Transition2d.render: alpha: " + alpha);
            this.setPositionBuffer(bounds);
            this.gl.uniform1f(this.getUniformLocation('alpha'), alpha);
            this.gl.uniform4fv(this.getUniformLocation('fromFillColor'), fromFillColor);
            this.gl.uniform4fv(this.getUniformLocation('toFillColor'), toFillColor);
            this.gl.uniform4fv(this.getUniformLocation('fromLineColor'), fromLineColor);
            this.gl.uniform4fv(this.getUniformLocation('toLineColor'), toLineColor);
        }
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.enteringSlide);
        gl.uniform1i(gl.getUniformLocation(this.program, 'enteringSlideTexture'), 1);
        this.renderUniformValue();
        gl.bindVertexArray(this.vao);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        if (isSlideTransition) {
            app.map.fire('newslideshowframe', {
                frame: gl.canvas,
            });
        }
    };
    Transition2d.DefaultFromColor = new Float32Array([0, 0, 0, 0]);
    Transition2d.DefaultToColor = new Float32Array([0, 0, 0, 0]);
    return Transition2d;
}(TransitionBase));
SlideShow.Transition2d = Transition2d;
//# sourceMappingURL=Transition2d.js.map