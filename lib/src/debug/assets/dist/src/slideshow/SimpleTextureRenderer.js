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
/*
 * Copyright the Collabora Online contributors.
 *
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var SimpleTextureRenderer = /** @class */ (function () {
    function SimpleTextureRenderer(canvasContext, createProgram) {
        if (createProgram === void 0) { createProgram = true; }
        this.context = canvasContext;
        this.gl = this.context.getGl();
        if (createProgram)
            this.createProgram();
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    SimpleTextureRenderer.prototype.initProgramTemplateParams = function () { };
    SimpleTextureRenderer.prototype.createProgram = function () {
        if (this.context.isDisposed())
            return;
        this.initProgramTemplateParams();
        var vertexShaderSource = this.getVertexShader();
        var fragmentShaderSource = this.getFragmentShader();
        var vertexShader = this.context.createVertexShader(vertexShaderSource);
        var fragmentShader = this.context.createFragmentShader(fragmentShaderSource);
        this.program = this.context.createProgram(vertexShader, fragmentShader);
    };
    SimpleTextureRenderer.prototype.getVertexShader = function () {
        return "#version 300 es\n\t\t\t\tin vec4 a_position;\n\t\t\t\tin vec2 a_texCoord;\n\t\t\t\tout vec2 v_texCoord;\n\n\t\t\t\tvoid main() {\n\t\t\t\t\tgl_Position = a_position;\n\t\t\t\t\tv_texCoord = a_texCoord;\n\t\t\t\t}\n\t\t\t\t";
    };
    SimpleTextureRenderer.prototype.prepareTransition = function () {
        if (this.context.isDisposed())
            return;
        this.initBuffers();
        this.initUniforms();
    };
    SimpleTextureRenderer.prototype.initUniforms = function () {
        if (this.context.isDisposed())
            return;
        this.gl.useProgram(this.program);
        // Add more uniform here if needed.
    };
    SimpleTextureRenderer.prototype.initBuffers = function () {
        var positions = new Float32Array(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], [-1.0, -1.0, 0, 0, 1], false), [1.0, -1.0, 0, 1, 1], false), [-1.0, 1.0, 0, 0, 0], false), [1.0, 1.0, 0, 1, 0], false));
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
        this.vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.vao);
        var positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
        var texCoordLocation = this.gl.getAttribLocation(this.program, 'a_texCoord');
        if (positionLocation !== -1) {
            this.gl.enableVertexAttribArray(positionLocation);
            this.gl.vertexAttribPointer(positionLocation, 3, this.gl.FLOAT, false, 5 * 4, 0);
        }
        if (texCoordLocation !== -1) {
            this.gl.enableVertexAttribArray(texCoordLocation);
            this.gl.vertexAttribPointer(texCoordLocation, 2, this.gl.FLOAT, false, 5 * 4, 3 * 4);
        }
    };
    return SimpleTextureRenderer;
}());
// handle animation timing too
var TextureAnimationBase = /** @class */ (function (_super) {
    __extends(TextureAnimationBase, _super);
    function TextureAnimationBase(canvasContext) {
        var _this = _super.call(this, canvasContext) || this;
        _this.time = 0;
        _this.startTime = null;
        return _this;
    }
    return TextureAnimationBase;
}(SimpleTextureRenderer));
//# sourceMappingURL=SimpleTextureRenderer.js.map