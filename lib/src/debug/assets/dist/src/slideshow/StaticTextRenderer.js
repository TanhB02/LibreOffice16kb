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
var StaticTextRenderer = /** @class */ (function (_super) {
    __extends(StaticTextRenderer, _super);
    function StaticTextRenderer(canvasContext) {
        return _super.call(this, canvasContext) || this;
    }
    StaticTextRenderer.prototype.display = function (displayText) {
        if (this.context.isDisposed())
            return;
        this.textTexture = this.createTextTexture(displayText);
        this.prepareTransition();
        requestAnimationFrame(this.animate.bind(this));
    };
    StaticTextRenderer.prototype.animate = function () {
        requestAnimationFrame(this.render.bind(this));
    };
    StaticTextRenderer.prototype.createTextTexture = function (displayText) {
        var textCanvas = this.create2DCanvasWithText(displayText);
        return this.load2dCanvasToGlCanvas(textCanvas);
    };
    // Create an off-screen 2D canvas with text centered
    StaticTextRenderer.prototype.create2DCanvasWithText = function (displayText) {
        if (this.context.isDisposed())
            return null;
        var canvas = document.createElement('canvas');
        canvas.width = this.context.canvas.width;
        canvas.height = this.context.canvas.height;
        var ctx = canvas.getContext('2d');
        // Set background color
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Set text attributes
        ctx.fillStyle = 'white';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(displayText, canvas.width / 2, canvas.height / 2);
        return canvas;
    };
    StaticTextRenderer.prototype.load2dCanvasToGlCanvas = function (canvas) {
        if (this.context.isDisposed())
            return null;
        var texture = this.gl.createTexture();
        if (!texture) {
            throw new Error('Failed to create texture');
        }
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, canvas);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        return texture;
    };
    StaticTextRenderer.prototype.render = function () {
        if (this.context.isDisposed())
            return;
        this.gl.viewport(0, 0, this.context.canvas.width, this.context.canvas.height);
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.useProgram(this.program);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textTexture);
        var textureLocation = this.gl.getUniformLocation(this.program, 'u_texture');
        this.gl.uniform1i(textureLocation, 0);
        this.gl.bindVertexArray(this.vao);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    };
    StaticTextRenderer.prototype.getFragmentShader = function () {
        return "#version 300 es\n\t\t\tprecision highp float;\n\t\t\tin vec2 v_texCoord;\n\t\t\tuniform sampler2D u_texture;\n\t\t\tout vec4 outColor;\n\n\t\t\tvoid main() {\n\t\t\t\toutColor = texture(u_texture, v_texCoord);\n\t\t\t}";
    };
    return StaticTextRenderer;
}(TextureAnimationBase));
SlideShow.StaticTextRenderer = StaticTextRenderer;
//# sourceMappingURL=StaticTextRenderer.js.map