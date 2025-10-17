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
var VideoRenderInfo = /** @class */ (function () {
    function VideoRenderInfo() {
        this.texture = null;
        this.vao = null;
    }
    VideoRenderInfo.prototype.getTexture = function () {
        return this.texture;
    };
    VideoRenderInfo.prototype.replaceTexture = function (context, newtexture) {
        context.deleteTexture(this.texture);
        this.texture = newtexture;
    };
    VideoRenderInfo.prototype.getVao = function () {
        return this.vao;
    };
    VideoRenderInfo.prototype.replaceVao = function (context, newVao) {
        context.deleteVertexArray(this.vao);
        this.vao = newVao;
    };
    VideoRenderInfo.prototype.deleteResources = function (context) {
        this.replaceTexture(context, null);
        this.replaceVao(context, null);
    };
    return VideoRenderInfo;
}());
var VideoRenderer = /** @class */ (function () {
    function VideoRenderer(sId, context, slideRenderer) {
        this.sId = sId;
        this._context = context;
        this._slideRenderer = slideRenderer;
    }
    VideoRenderer.prototype.isDisposed = function () {
        return this._context && this._context.isDisposed();
    };
    VideoRenderer.prototype.loadVideo = function () {
        if (!this.videoRenderInfo)
            return;
        this.videoRenderInfo.videoElement.load();
    };
    VideoRenderer.prototype.playVideo = function (reset) {
        if (reset === void 0) { reset = true; }
        if (!this.videoRenderInfo)
            return;
        if (reset)
            this.videoRenderInfo.videoElement.currentTime = 0;
        this.videoRenderInfo.videoElement.play();
    };
    VideoRenderer.prototype.pauseVideo = function () {
        if (!this.videoRenderInfo)
            return;
        console.debug('VideoRenderer.pauseVideo');
        this.videoRenderInfo.videoElement.pause();
    };
    VideoRenderer.prototype.deleteResources = function () {
        if (this.isDisposed())
            return;
        this.pauseVideo();
        this.videoRenderInfo.deleteResources(this._context);
    };
    VideoRenderer.prototype.handleClick = function () {
        if (this.videoRenderInfo.playing) {
            this.pauseVideo();
        }
        else if (this.videoRenderInfo.ended) {
            this.playVideo(true);
        }
        else {
            this.playVideo(false);
        }
    };
    VideoRenderer.prototype.setupVideo = function (videoRenderInfo, url) {
        var _this = this;
        var video = document.createElement('video');
        video.playsInline = true;
        video.crossOrigin = 'anonymous';
        video.addEventListener('playing', function () {
            videoRenderInfo.playing = true;
            videoRenderInfo.ended = false;
            _this._slideRenderer.notifyVideoStarted(_this.sId);
        }, true);
        video.addEventListener('pause', function () {
            videoRenderInfo.playing = false;
            _this._slideRenderer.notifyVideoEnded(_this.sId);
        }, true);
        video.addEventListener('ended', function () {
            videoRenderInfo.playing = false;
            videoRenderInfo.ended = true;
            _this._slideRenderer.notifyVideoEnded(_this.sId);
        }, true);
        video.src = url;
        return video;
    };
    VideoRenderer.prototype.getDocumentPositions = function (x, y, width, height, docWidth, docHeight) {
        var xMin = x / docWidth;
        var xMax = (x + width) / docWidth;
        var yMin = y / docHeight;
        var yMax = (y + height) / docHeight;
        return [xMin, xMax, yMin, yMax];
    };
    return VideoRenderer;
}());
var VideoRenderer2d = /** @class */ (function (_super) {
    __extends(VideoRenderer2d, _super);
    function VideoRenderer2d() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    VideoRenderer2d.prototype.prepareVideo = function (videoInfo, docWidth, docHeight) {
        this.pauseVideo();
        var video = new VideoRenderInfo();
        video.videoElement = this.setupVideo(video, videoInfo.url);
        video.pos2d = this.getDocumentPositions(videoInfo.x, videoInfo.y, videoInfo.width, videoInfo.height, docWidth, docHeight);
        this.videoRenderInfo = video;
        this.videoInfoId = videoInfo.id;
    };
    VideoRenderer2d.prototype.render = function () {
        if (this.isDisposed())
            return;
        var ctx = this._context.get2dGl();
        var video = this.videoRenderInfo;
        var width = ctx.canvas.width;
        var height = ctx.canvas.height;
        ctx.drawImage(video.videoElement, video.pos2d[0] * width, video.pos2d[2] * height, video.pos2d[1] * width - video.pos2d[0] * width, video.pos2d[3] * height - video.pos2d[2] * height);
    };
    return VideoRenderer2d;
}(VideoRenderer));
var VideoRendererGl = /** @class */ (function (_super) {
    __extends(VideoRendererGl, _super);
    function VideoRendererGl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    VideoRendererGl.getVertexShader = function () {
        return "#version 300 es\n\t\t\t\tin vec4 a_position;\n\t\t\t\tin vec2 a_texCoord;\n\t\t\t\tout vec2 v_texCoord;\n\n\t\t\t\tvoid main() {\n\t\t\t\t\tgl_Position = a_position;\n\t\t\t\t\tv_texCoord = a_texCoord;\n\t\t\t\t}\n\t\t\t\t";
    };
    VideoRendererGl.getFragmentShader = function () {
        return "#version 300 es\n\t\t\t\tprecision mediump float;\n\n\t\t\t\tuniform sampler2D slideTexture;\n\n\t\t\t\tin vec2 v_texCoord;\n\t\t\t\tout vec4 outColor;\n\n\t\t\t\tvoid main() {\n\t\t\t\t\toutColor = texture(slideTexture, v_texCoord);\n\t\t\t\t}\n\t\t\t\t";
    };
    VideoRendererGl.createProgram = function (context) {
        if (context.is2dGl() || context.isDisposed())
            return;
        var vertexShader = context.createVertexShader(VideoRendererGl.getVertexShader());
        var fragmentShader = context.createFragmentShader(VideoRendererGl.getFragmentShader());
        VideoRendererGl._program = context.createProgram(vertexShader, fragmentShader);
        VideoRendererGl.videoProgramInitialized = true;
    };
    VideoRendererGl.deleteProgram = function (context) {
        if (context.is2dGl() || context.isDisposed())
            return;
        var gl = context.getGl();
        gl.deleteProgram(VideoRendererGl._program);
        VideoRendererGl._program = null;
        VideoRendererGl.videoProgramInitialized = false;
    };
    VideoRendererGl.prototype.prepareVideo = function (videoInfo, docWidth, docHeight) {
        this.pauseVideo();
        var video = new VideoRenderInfo();
        video.videoElement = this.setupVideo(video, videoInfo.url);
        video.replaceTexture(this._context, this.initTexture());
        video.replaceVao(this._context, this.setupRectangleInDocumentPositions(videoInfo.x, videoInfo.y, videoInfo.width, videoInfo.height, docWidth, docHeight));
        this.videoRenderInfo = video;
        this.videoInfoId = videoInfo.id;
    };
    VideoRendererGl.prototype.initTexture = function () {
        var gl = this._context.getGl();
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        var pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        return texture;
    };
    // jscpd:ignore-start
    VideoRendererGl.prototype.setupPositions = function (xMin, xMax, yMin, yMax) {
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
        var program = VideoRendererGl._program;
        if (!program) {
            console.log('VideoRenderer: program is not valid');
            return;
        }
        var positionLocation = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 5 * 4, 0);
        var texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 5 * 4, 3 * 4);
        return vao;
    };
    // jscpd:ignore-end
    VideoRendererGl.prototype.setupRectangleInDocumentPositions = function (x, y, width, height, docWidth, docHeight) {
        var positions = this.getDocumentPositions(x, y, width, height, docWidth, docHeight);
        return this.setupPositions(positions[0] * 2.0 - 1.0, positions[1] * 2.0 - 1.0, positions[2] * 2.0 - 1.0, positions[3] * 2.0 - 1.0);
    };
    VideoRendererGl.prototype.updateTexture = function (texture, video) {
        var gl = this._context.getGl();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
    };
    VideoRendererGl.prototype.render = function () {
        if (this.isDisposed())
            return;
        console.debug('SlideRendererGl.render');
        var gl = this._context.getGl();
        if (!VideoRendererGl._program) {
            console.log('VideoRendererGl: program is not valid');
            return;
        }
        gl.useProgram(VideoRendererGl._program);
        gl.activeTexture(gl.TEXTURE0);
        var video = this.videoRenderInfo;
        if (!video.ended && video.videoElement.currentTime > 0) {
            gl.bindVertexArray(video.getVao());
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            this.updateTexture(video.getTexture(), video.videoElement);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        }
    };
    VideoRendererGl.videoProgramInitialized = false;
    return VideoRendererGl;
}(VideoRenderer));
function makeVideoRenderer(sId, context, slideRenderer) {
    return context.is2dGl()
        ? new VideoRenderer2d(sId, context, slideRenderer)
        : new VideoRendererGl(sId, context, slideRenderer);
}
//# sourceMappingURL=VideoRenderer.js.map