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
var SlideRenderer = /** @class */ (function () {
    function SlideRenderer(canvas) {
        this._context = null;
        this._renderedSlideIndex = undefined;
        this._requestAnimationFrameId = null;
        this._activeLayers = new Set();
        this._playingVideos = new Set();
        this._canvas = canvas;
    }
    SlideRenderer.prototype.isDisposed = function () {
        return this._context && this._context.isDisposed();
    };
    Object.defineProperty(SlideRenderer.prototype, "lastRenderedSlideIndex", {
        get: function () {
            return this._renderedSlideIndex;
        },
        enumerable: false,
        configurable: true
    });
    SlideRenderer.prototype.getSlideTexture = function () {
        return this._slideTexture;
    };
    SlideRenderer.prototype.getAnimatedSlideImage = function () {
        var presenter = app.map.slideShowPresenter;
        return presenter._slideCompositor.getAnimatedSlide(this._renderedSlideIndex);
    };
    SlideRenderer.prototype.renderSlide = function (currentSlideTexture, slideInfo) {
        this.deleteCurrentSlideTexture();
        this._activeLayers.clear();
        this._renderedSlideIndex = slideInfo.indexInSlideShow;
        this._slideTexture = currentSlideTexture;
        requestAnimationFrame(this.render.bind(this));
    };
    SlideRenderer.prototype.createEmptyTexture = function () {
        return null;
    };
    SlideRenderer.prototype.notifyAnimationStarted = function (sId) {
        var isAnyLayerActive = this.isAnyLayerActive();
        this._activeLayers.add(sId);
        if (!isAnyLayerActive) {
            this._requestAnimationFrameId = requestAnimationFrame(this.render.bind(this));
        }
    };
    SlideRenderer.prototype.notifyAnimationEnded = function (sId) {
        this._activeLayers.delete(sId);
    };
    SlideRenderer.prototype.isAnyLayerActive = function () {
        return this._activeLayers.size > 0;
    };
    SlideRenderer.prototype.notifyVideoStarted = function (sId) {
        var isAnyVideoAlreadyPlaying = this.isAnyVideoPlaying;
        this._playingVideos.add(sId);
        if (!isAnyVideoAlreadyPlaying) {
            this._requestAnimationFrameId = requestAnimationFrame(this.render.bind(this));
        }
    };
    SlideRenderer.prototype.notifyVideoEnded = function (sId) {
        this._playingVideos.delete(sId);
    };
    Object.defineProperty(SlideRenderer.prototype, "isAnyVideoPlaying", {
        get: function () {
            return this._playingVideos.size > 0;
        },
        enumerable: false,
        configurable: true
    });
    return SlideRenderer;
}());
var SlideRenderer2d = /** @class */ (function (_super) {
    __extends(SlideRenderer2d, _super);
    function SlideRenderer2d(canvas) {
        var _this = _super.call(this, canvas) || this;
        _this._context = new RenderContext2d(canvas);
        return _this;
    }
    SlideRenderer2d.prototype.createTexture = function (image, _isMipMapsEnable) {
        return image;
    };
    SlideRenderer2d.prototype.deleteCurrentSlideTexture = function () {
        return;
    };
    SlideRenderer2d.prototype.deleteResources = function () {
        return;
    };
    SlideRenderer2d.prototype.render = function () {
        if (this.isDisposed())
            return;
        var gl = this._context.get2dGl();
        gl.clearRect(0, 0, gl.canvas.width, gl.canvas.height);
        var slideImage = this.getAnimatedSlideImage();
        app.map.fire('newslideshowframe', {
            frame: slideImage,
        });
        gl.drawImage(slideImage, 0, 0);
        slideImage.close();
        gl.setTransform(1, 0, 0, 1, 0, 0);
        if (this.isAnyLayerActive() || this.isAnyVideoPlaying) {
            this._requestAnimationFrameId = requestAnimationFrame(this.render.bind(this));
        }
    };
    return SlideRenderer2d;
}(SlideRenderer));
var SlideRendererGl = /** @class */ (function (_super) {
    __extends(SlideRendererGl, _super);
    function SlideRendererGl(canvas) {
        var _this = _super.call(this, canvas) || this;
        _this._program = null;
        _this._vao = null;
        _this._context = new RenderContextGl(canvas);
        var vertexShader = _this._context.createVertexShader(_this.getVertexShader());
        var fragmentShader = _this._context.createFragmentShader(_this.getFragmentShader());
        _this._program = _this._context.createProgram(vertexShader, fragmentShader);
        _this._vao = _this.setupPositions(-1.0, 1.0, 1.0, -1.0);
        _this._context.getGl().useProgram(_this._program);
        return _this;
    }
    SlideRendererGl.prototype.getVertexShader = function () {
        return "#version 300 es\n\t\t\t\tin vec4 a_position;\n\t\t\t\tin vec2 a_texCoord;\n\t\t\t\tout vec2 v_texCoord;\n\n\t\t\t\tvoid main() {\n\t\t\t\t\tgl_Position = a_position;\n\t\t\t\t\tv_texCoord = a_texCoord;\n\t\t\t\t}\n\t\t\t\t";
    };
    SlideRendererGl.prototype.getFragmentShader = function () {
        return "#version 300 es\n\t\t\t\tprecision mediump float;\n\n\t\t\t\tuniform sampler2D slideTexture;\n\n\t\t\t\tin vec2 v_texCoord;\n\t\t\t\tout vec4 outColor;\n\n\t\t\t\tvoid main() {\n\t\t\t\t\toutColor = texture(slideTexture, v_texCoord);\n\t\t\t\t}\n\t\t\t\t";
    };
    SlideRendererGl.prototype.updateTexture = function (texture, video) {
        var gl = this._context.getGl();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
    };
    SlideRendererGl.prototype.setupPositions = function (xMin, xMax, yMin, yMax) {
        if (this.isDisposed())
            return null;
        if (this._context.is2dGl())
            return;
        var gl = this._context.getGl();
        // 5 numbers -> 3 x vertex X,Y,Z and 2x texture X,Y
        var positions = new Float32Array(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], [xMin, -yMin, 0.0, 0.0, 1.0], false), [xMax, -yMin, 0.0, 1.0, 1.0], false), [xMin, -yMax, 0.0, 0.0, 0.0], false), [xMax, -yMax, 0.0, 1.0, 0.0], false));
        var buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
        var vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        var positionLocation = gl.getAttribLocation(this._program, 'a_position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 5 * 4, 0);
        var texCoordLocation = gl.getAttribLocation(this._program, 'a_texCoord');
        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 5 * 4, 3 * 4);
        return vao;
    };
    SlideRendererGl.prototype.getNextTexture = function () {
        var slideImage = this.getAnimatedSlideImage();
        app.map.fire('newslideshowframe', {
            frame: slideImage,
        });
        this.updateTexture(this._slideTexture, slideImage);
        slideImage.close();
        return this._slideTexture;
    };
    SlideRendererGl.prototype.createTexture = function (image, isMipMapsEnable) {
        if (isMipMapsEnable === void 0) { isMipMapsEnable = false; }
        return this._context.loadTexture(image, isMipMapsEnable);
    };
    SlideRendererGl.prototype.createEmptyTexture = function () {
        return this._context.createEmptySlide();
    };
    SlideRendererGl.prototype.deleteCurrentSlideTexture = function () {
        this._context.deleteTexture(this._slideTexture);
        this._slideTexture = null;
    };
    SlideRendererGl.prototype.deleteResources = function () {
        if (this.isDisposed())
            return;
        this.deleteCurrentSlideTexture();
        if (this._context)
            this._context.clear();
    };
    SlideRendererGl.prototype.render = function () {
        if (this.isDisposed())
            return;
        var gl = this._context.getGl();
        gl.viewport(0, 0, this._canvas.width, this._canvas.height);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(this._program);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.getNextTexture());
        gl.uniform1i(gl.getUniformLocation(this._program, 'slideTexture'), 0);
        gl.bindVertexArray(this._vao);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        if (this.isAnyLayerActive() || this.isAnyVideoPlaying)
            this._requestAnimationFrameId = requestAnimationFrame(this.render.bind(this));
    };
    return SlideRendererGl;
}(SlideRenderer));
//# sourceMappingURL=SlideRenderer.js.map