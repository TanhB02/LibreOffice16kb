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
var CanvasLoader = /** @class */ (function () {
    function CanvasLoader() {
    }
    return CanvasLoader;
}());
var CanvasLoader2d = /** @class */ (function () {
    function CanvasLoader2d(canvasContext) {
    } // eslint-disable-line
    CanvasLoader2d.prototype.startLoader = function () { }; // eslint-disable-line
    CanvasLoader2d.prototype.stopLoader = function () { }; // eslint-disable-line
    return CanvasLoader2d;
}());
var CanvasLoaderGl = /** @class */ (function (_super) {
    __extends(CanvasLoaderGl, _super);
    function CanvasLoaderGl(canvasContext) {
        var _this = _super.call(this, canvasContext) || this;
        _this.animationId = null;
        _this.animate = function () {
            if (!_this.startTime)
                _this.startTime = performance.now();
            _this.time = (performance.now() - _this.startTime) / 1000; // Convert to seconds
            _this.render();
            _this.animationId = requestAnimationFrame(_this.animate);
        };
        _this.prepareTransition();
        _this.uResolutionLoc = _this.gl.getUniformLocation(_this.program, 'u_resolution');
        _this.uTimeLoc = _this.gl.getUniformLocation(_this.program, 'u_time');
        return _this;
    }
    CanvasLoaderGl.prototype.renderUniformValue = function () {
        if (this.context.isDisposed())
            return;
        this.gl.uniform2f(this.uResolutionLoc, this.context.canvas.width, this.context.canvas.height);
        this.gl.uniform1f(this.uTimeLoc, this.time);
    };
    CanvasLoaderGl.prototype.startLoader = function () {
        if (this.context.isDisposed())
            return;
        if (this.animationId === null) {
            this.startTime = performance.now();
            this.animate();
        }
    };
    CanvasLoaderGl.prototype.stopLoader = function () {
        if (this.context.isDisposed())
            return;
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
            this.startTime = null;
            // Clear the canvas
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
            // Delete WebGL resources
            if (this.vao) {
                this.gl.deleteVertexArray(this.vao);
                this.vao = null;
            }
            if (this.program) {
                this.gl.deleteProgram(this.program);
                this.program = null;
            }
            // Unbind any bound buffers or textures
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
            this.gl.bindVertexArray(null);
            // Reset WebGL state
            this.gl.useProgram(null);
            // Flush any pending WebGL commands
            this.gl.flush();
        }
    };
    CanvasLoaderGl.prototype.render = function () {
        if (this.context.isDisposed())
            return;
        this.gl.viewport(0, 0, this.context.canvas.width, this.context.canvas.height);
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0); // Black background
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.useProgram(this.program);
        this.renderUniformValue();
        this.gl.bindVertexArray(this.vao);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    };
    CanvasLoaderGl.prototype.getVertexShader = function () {
        return "#version 300 es\n                in vec4 a_position;\n                void main() {\n                    gl_Position = a_position;\n                }";
    };
    CanvasLoaderGl.prototype.getFragmentShader = function () {
        return "#version 300 es\n                precision highp float;\n                uniform vec2 u_resolution;\n                uniform float u_time;\n                out vec4 outColor;\n\n                // Directly defined constants\n                const float LOADER_SIZE = 0.04;\n                const float LOADER_THICKNESS = 0.2;\n                const vec3 LOADER_COLOR = vec3(0.8, 0.8, 0.8);\n                const float ROTATION_SPEED = 5.0;\n\n                void main() {\n                    vec2 center = vec2(0.5, 0.5);\n                    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);\n                    vec2 position = (gl_FragCoord.xy / u_resolution - center) * aspect;\n                    float radius = length(position);\n                    float angle = atan(position.y, position.x) + u_time * ROTATION_SPEED;\n\n                    float outerRadius = LOADER_SIZE;\n                    float innerRadius = outerRadius - LOADER_SIZE * LOADER_THICKNESS;\n\n                    if (radius > outerRadius || radius < innerRadius) {\n                        discard;\n                    }\n\n                    float segmentAngle = 3.14159 * 0.5; // Quarter circle\n\n                    if (mod(angle, 6.28318) > segmentAngle) {\n                        discard;\n                    }\n\n                    outColor = vec4(LOADER_COLOR, 1.0);\n                }";
    };
    return CanvasLoaderGl;
}(TextureAnimationBase));
SlideShow.CanvasLoaderGl = CanvasLoaderGl;
SlideShow.CanvasLoader2d = CanvasLoader2d;
//# sourceMappingURL=CanvasLoader.js.map