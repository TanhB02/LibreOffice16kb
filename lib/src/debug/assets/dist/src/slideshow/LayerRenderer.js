// @ts-strict-ignore
/* -*- js-indent-level: 8 -*- */
var LayerRendererGl = /** @class */ (function () {
    function LayerRendererGl(offscreenCanvas) {
        this.imageBitmapIdCounter = 0;
        this.textureCache = new Map();
        this.imageBitmapIdMap = new WeakMap();
        this.vertexShaderSource = "\n\t\t\tattribute vec2 a_position;\n\t\t\tattribute vec2 a_texCoord;\n\t\t\tvarying vec2 v_texCoord;\n\t\t\tvoid main() {\n\t\t\t\tgl_Position = vec4(a_position, 0, 1);\n\t\t\t\tv_texCoord = a_texCoord;\n\t\t\t}\n\t\t";
        this.fragmentShaderSource = "\n\t\tprecision mediump float;\n\t\tuniform vec4 fromFillColor;\n\t\tuniform vec4 toFillColor;\n\t\tuniform vec4 fromLineColor;\n\t\tuniform vec4 toLineColor;\n\t\tuniform float alpha;\n\t\tvarying vec2 v_texCoord;\n\t\tuniform sampler2D u_sampler;\n\n\t\t" + GlHelpers.nearestPointOnSegment + "\n\t\t" + GlHelpers.computeColor + "\n\n\t\tvoid main() {\n\t\t\tvec4 color = texture2D(u_sampler, v_texCoord);\n\t\t\tcolor = computeColor(color);\n\t\t\tcolor = color * alpha;\n\t\t\tgl_FragColor = color;\n\t\t}\n\t\t";
        this.offscreenCanvas = offscreenCanvas;
        this.glContext = new RenderContextGl(this.offscreenCanvas);
        this.gl = this.glContext.getGl();
        this.initializeWebGL();
        this.disposed = false;
    }
    LayerRendererGl.prototype.initialize = function () {
        // do nothing!
    };
    LayerRendererGl.prototype.isGlRenderer = function () {
        return true;
    };
    LayerRendererGl.prototype.isDisposed = function () {
        return this.disposed;
    };
    LayerRendererGl.prototype.getRenderContext = function () {
        return this.glContext;
    };
    LayerRendererGl.prototype.initializeWebGL = function () {
        var gl = this.gl;
        // Compile shaders using RenderContextGl
        var vertexShader = this.glContext.createVertexShader(this.vertexShaderSource);
        var fragmentShader = this.glContext.createFragmentShader(this.fragmentShaderSource);
        // Link program using RenderContextGl
        this.program = this.glContext.createProgram(vertexShader, fragmentShader);
        // Get attribute and uniform locations
        this.positionLocation = gl.getAttribLocation(this.program, 'a_position');
        this.texCoordLocation = gl.getAttribLocation(this.program, 'a_texCoord');
        this.samplerLocation = gl.getUniformLocation(this.program, 'u_sampler');
        // Create buffers
        this.positionBuffer = gl.createBuffer();
        this.texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        var texCoords = new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]);
        gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.enableVertexAttribArray(this.positionLocation);
        gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.enableVertexAttribArray(this.texCoordLocation);
        gl.vertexAttribPointer(this.texCoordLocation, 2, gl.FLOAT, false, 0, 0);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        this.gl.disable(this.gl.DEPTH_TEST);
    };
    LayerRendererGl.prototype.initPositionBuffer = function (bounds) {
        var gl = this.gl;
        var vertices = LayerRendererGl.DefaultVertices;
        if (bounds) {
            vertices = [];
            // convert [0,1] => [-1,1]
            for (var i = 0; i < bounds.length; ++i) {
                var x = 2 * bounds[i].x - 1;
                vertices.push(x);
                // flip y coordinates
                var y = -(2 * bounds[i].y - 1);
                vertices.push(y);
            }
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        var positions = new Float32Array(vertices);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    };
    LayerRendererGl.prototype.clearCanvas = function () {
        if (!this.disposed) {
            var gl = this.gl;
            gl.clearColor(1.0, 1.0, 1.0, 1.0); // Clear to white
            gl.clear(gl.COLOR_BUFFER_BIT);
        }
    };
    LayerRendererGl.computeColor = function (properties) {
        var bounds = null;
        var alpha = 1.0;
        var fromFillColor = LayerRendererGl.DefaultFromColor;
        var toFillColor = LayerRendererGl.DefaultToColor;
        var fromLineColor = LayerRendererGl.DefaultFromColor;
        var toLineColor = LayerRendererGl.DefaultToColor;
        if (properties) {
            bounds = properties.bounds;
            alpha = properties.alpha;
            var colorMap = properties.colorMap;
            if (colorMap) {
                if (colorMap.fromFillColor && colorMap.toFillColor) {
                    fromFillColor = colorMap.fromFillColor.toFloat32Array();
                    toFillColor = colorMap.toFillColor.toFloat32Array();
                }
                if (colorMap.fromLineColor && colorMap.toLineColor) {
                    fromLineColor = colorMap.fromLineColor.toFloat32Array();
                    toLineColor = colorMap.toLineColor.toFloat32Array();
                }
            }
        }
        return {
            bounds: bounds,
            alpha: alpha,
            fromFillColor: fromFillColor,
            toFillColor: toFillColor,
            fromLineColor: fromLineColor,
            toLineColor: toLineColor,
        };
    };
    LayerRendererGl.prototype.drawBitmap = function (imageInfo, properties) {
        if (this.disposed) {
            console.log('LayerRenderer is disposed');
            return;
        }
        if (!imageInfo) {
            console.log('LayerRenderer.drawBitmap: no image');
            return;
        }
        var _a = LayerRendererGl.computeColor(properties), bounds = _a.bounds, alpha = _a.alpha, fromFillColor = _a.fromFillColor, toFillColor = _a.toFillColor, fromLineColor = _a.fromLineColor, toLineColor = _a.toLineColor;
        var texture;
        var textureKey;
        if (imageInfo instanceof ImageBitmap) {
            if (!this.imageBitmapIdMap.has(imageInfo)) {
                this.imageBitmapIdMap.set(imageInfo, this.imageBitmapIdCounter++);
            }
            textureKey = "imageBitmap_" + this.imageBitmapIdMap.get(imageInfo);
        }
        else {
            textureKey = imageInfo.checksum;
        }
        if (this.textureCache.has(textureKey)) {
            texture = this.textureCache.get(textureKey);
            // console.debug(`LayerDrawing.drawBitmap: cache hit: key: ${textureKey}`);
        }
        else {
            if (imageInfo instanceof ImageBitmap) {
                texture = this.glContext.loadTexture(imageInfo);
            }
            else {
                texture = this.glContext.loadTexture(imageInfo.data);
            }
            this.textureCache.set(textureKey, texture);
        }
        this.gl.useProgram(this.program);
        this.gl.bindVertexArray(this.vao);
        this.initPositionBuffer(bounds);
        this.gl.uniform1f(this.gl.getUniformLocation(this.program, 'alpha'), alpha);
        this.gl.uniform4fv(this.gl.getUniformLocation(this.program, 'fromFillColor'), fromFillColor);
        this.gl.uniform4fv(this.gl.getUniformLocation(this.program, 'toFillColor'), toFillColor);
        this.gl.uniform4fv(this.gl.getUniformLocation(this.program, 'fromLineColor'), fromLineColor);
        this.gl.uniform4fv(this.gl.getUniformLocation(this.program, 'toLineColor'), toLineColor);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.uniform1i(this.samplerLocation, 0);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    };
    LayerRendererGl.prototype.dispose = function () {
        this.gl = null;
        this.offscreenCanvas = null;
        this.disposed = true;
    };
    LayerRendererGl.prototype.hexToRgb = function (hex) {
        hex = hex.replace(/^#/, '');
        var bigint;
        if (hex.length === 3) {
            var r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
            var g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
            var b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
            return { r: r, g: g, b: b };
        }
        else if (hex.length === 6) {
            bigint = parseInt(hex, 16);
            var r = (bigint >> 16) & 255;
            var g = (bigint >> 8) & 255;
            var b = bigint & 255;
            return { r: r, g: g, b: b };
        }
        else {
            return null;
        }
    };
    LayerRendererGl.prototype.fillColor = function (slideInfo) {
        if (this.disposed)
            return true; // done
        if (slideInfo.background && slideInfo.background.fillColor) {
            var fillColor = slideInfo.background.fillColor;
            var rgb = this.hexToRgb(fillColor);
            if (rgb) {
                this.gl.clearColor(rgb.r / 255, rgb.g / 255, rgb.b / 255, 1.0);
            }
            else {
                this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
            }
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        }
        else {
            this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        }
        if (!slideInfo.background)
            return true;
        return false;
    };
    LayerRendererGl.DefaultVertices = [-1, -1, 1, -1, -1, 1, 1, 1];
    LayerRendererGl.DefaultFromColor = new Float32Array([0, 0, 0, 0]);
    LayerRendererGl.DefaultToColor = new Float32Array([0, 0, 0, 0]);
    return LayerRendererGl;
}());
var LayerRenderer2d = /** @class */ (function () {
    function LayerRenderer2d(offscreenCanvas) {
        this.offscreenCanvas = offscreenCanvas;
        this.context2d = new RenderContext2d(this.offscreenCanvas);
        this.offscreenContext = this.context2d.get2dOffscreen();
        if (!this.offscreenContext) {
            throw new Error('2D Canvas context not available');
        }
        this.disposed = false;
    }
    LayerRenderer2d.prototype.initialize = function () {
        // Initialization is handled in the constructor
    };
    LayerRenderer2d.prototype.isGlRenderer = function () {
        return false;
    };
    LayerRenderer2d.prototype.isDisposed = function () {
        return this.disposed;
    };
    LayerRenderer2d.prototype.getRenderContext = function () {
        return this.context2d;
    };
    LayerRenderer2d.prototype.clearCanvas = function () {
        if (this.disposed)
            return;
        this.offscreenContext.clearRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
        this.offscreenContext.fillStyle = '#FFFFFF';
        this.offscreenContext.fillRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
    };
    LayerRenderer2d.prototype.drawBitmap = function (imageInfo, properties) {
        if (this.disposed)
            return;
        if (!imageInfo) {
            console.log('Canvas2DRenderer.drawBitmap: no image');
            return;
        }
        if (imageInfo instanceof ImageBitmap) {
            this.offscreenContext.drawImage(imageInfo, 0, 0);
        }
        else if (imageInfo.type === 'png') {
            this.offscreenContext.drawImage(imageInfo.data, 0, 0);
        }
    };
    LayerRenderer2d.prototype.dispose = function () {
        // Cleanup references
        this.disposed = true;
        this.offscreenContext = null;
        this.offscreenCanvas = null;
    };
    LayerRenderer2d.prototype.fillColor = function (slideInfo) {
        if (this.disposed)
            return;
        // always draw a solid white rectangle behind the background
        this.offscreenContext.fillStyle = '#FFFFFF';
        this.offscreenContext.fillRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
        if (!slideInfo.background)
            return true;
        if (slideInfo.background.fillColor) {
            this.offscreenContext.fillStyle = '#' + slideInfo.background.fillColor;
            window.app.console.log('LayerDrawing.drawBackground: ' + this.offscreenContext.fillStyle);
            this.offscreenContext.fillRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
            return true;
        }
        return false;
    };
    return LayerRenderer2d;
}());
SlideShow.LayerRendererGl = LayerRendererGl;
SlideShow.LayerRenderer2d = LayerRenderer2d;
//# sourceMappingURL=LayerRenderer.js.map