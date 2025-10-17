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
var RenderContext = /** @class */ (function () {
    function RenderContext(canvas) {
        this.disposed = false;
        this.canvas = canvas;
    }
    RenderContext.prototype.getGl = function () {
        return this.gl;
    };
    RenderContext.prototype.get2dGl = function () {
        return this.gl instanceof CanvasRenderingContext2D ? this.gl : null;
    };
    RenderContext.prototype.get2dOffscreen = function () {
        return this.gl instanceof OffscreenCanvasRenderingContext2D
            ? this.gl
            : null;
    };
    RenderContext.prototype.isDisposed = function () {
        return this.disposed;
    };
    RenderContext.prototype.createTextureWithColor = function (color) {
        return null;
    };
    RenderContext.prototype.createEmptySlide = function () {
        return null;
    };
    RenderContext.prototype.createTransparentTexture = function () {
        return null;
    };
    return RenderContext;
}());
var RenderContextGl = /** @class */ (function (_super) {
    __extends(RenderContextGl, _super);
    function RenderContextGl(canvas) {
        var _this = _super.call(this, canvas) || this;
        _this.gl = _this.canvas.getContext('webgl2', {
            failIfMajorPerformanceCaveat: true,
        });
        if (!_this.gl) {
            console.error('WebGL2 not supported');
            throw new Error('WebGL2 not supported');
        }
        return _this;
    }
    RenderContextGl.prototype.is2dGl = function () {
        return false;
    };
    RenderContextGl.prototype.clear = function () {
        this.disposed = true;
        this.gl = null;
    };
    RenderContextGl.prototype.loadTexture = function (image, isMipMapEnable) {
        if (isMipMapEnable === void 0) { isMipMapEnable = false; }
        if (this.isDisposed())
            return null;
        var gl = this.getGl();
        var texture = gl.createTexture();
        if (!texture) {
            throw new Error('Failed to create texture');
        }
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        if (isMipMapEnable) {
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        }
        else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        if (image instanceof HTMLImageElement)
            console.debug("Texture loaded successfully");
        return texture;
    };
    RenderContextGl.prototype.deleteTexture = function (texture) {
        if (this.isDisposed())
            return;
        var gl = this.getGl();
        gl.deleteTexture(texture);
    };
    RenderContextGl.prototype.deleteVertexArray = function (vao) {
        if (this.isDisposed())
            return;
        var gl = this.getGl();
        gl.deleteVertexArray(vao);
    };
    RenderContextGl.prototype.createTextureWithColor = function (color) {
        if (this.isDisposed())
            return null;
        var gl = this.getGl();
        var texture = gl.createTexture();
        if (!texture) {
            throw new Error('Failed to create texture');
        }
        gl.bindTexture(gl.TEXTURE_2D, texture);
        var colorPixel = new Uint8Array(color);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, colorPixel);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return texture;
    };
    RenderContextGl.prototype.createEmptySlide = function () {
        return this.createTextureWithColor([0, 0, 0, 255]);
    };
    RenderContextGl.prototype.createTransparentTexture = function () {
        return this.createTextureWithColor([0, 0, 0, 0]);
    };
    RenderContextGl.prototype.createVertexShader = function (source) {
        return this.createShader(this.getGl().VERTEX_SHADER, source);
    };
    RenderContextGl.prototype.createFragmentShader = function (source) {
        return this.createShader(this.getGl().FRAGMENT_SHADER, source);
    };
    RenderContextGl.prototype.createShader = function (type, source) {
        if (this.isDisposed())
            return null;
        var gl = this.getGl();
        var shader = gl.createShader(type);
        if (!shader) {
            throw new Error('Failed to create shader');
        }
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            var info = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error("Could not compile shader: " + info);
        }
        console.log('Shader compiled successfully:', type === gl.VERTEX_SHADER ? 'VERTEX' : 'FRAGMENT');
        return shader;
    };
    RenderContextGl.prototype.createProgram = function (vertexShader, fragmentShader) {
        if (this.isDisposed())
            return null;
        var gl = this.getGl();
        var program = gl.createProgram();
        if (!program) {
            throw new Error('Failed to create program');
        }
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            var info = gl.getProgramInfoLog(program);
            gl.deleteProgram(program);
            throw new Error("Could not link program: " + info);
        }
        console.log('Program linked successfully');
        return program;
    };
    return RenderContextGl;
}(RenderContext));
var RenderContext2d = /** @class */ (function (_super) {
    __extends(RenderContext2d, _super);
    function RenderContext2d(canvas) {
        var _this = _super.call(this, canvas) || this;
        _this.gl = _this.canvas.getContext('2d');
        if (!_this.gl) {
            console.error('Canvas rendering not supported');
            throw new Error('Canvas rendering not supported');
        }
        return _this;
    }
    RenderContext2d.prototype.is2dGl = function () {
        return true;
    };
    RenderContext2d.prototype.clear = function () {
        this.disposed = true;
        this.gl = null;
    };
    RenderContext2d.prototype.loadTexture = function (image, isMipMapEnable) {
        if (isMipMapEnable === void 0) { isMipMapEnable = false; }
        return image;
    };
    RenderContext2d.prototype.createVertexShader = function (source) {
        return null;
    };
    RenderContext2d.prototype.createFragmentShader = function (source) {
        return null;
    };
    RenderContext2d.prototype.createShader = function (type, source) {
        return null;
    };
    RenderContext2d.prototype.deleteTexture = function (texture) {
        return;
    };
    RenderContext2d.prototype.deleteVertexArray = function (vao) {
        return;
    };
    RenderContext2d.prototype.createProgram = function (vertexShader, fragmentShader) {
        return null;
    };
    return RenderContext2d;
}(RenderContext));
//# sourceMappingURL=RenderContext.js.map