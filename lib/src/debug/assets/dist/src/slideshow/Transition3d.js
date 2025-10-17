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
var TransitionParameters3D = /** @class */ (function (_super) {
    __extends(TransitionParameters3D, _super);
    function TransitionParameters3D() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.leavingPrimitives = [];
        _this.enteringPrimitives = [];
        _this.allOperations = [];
        return _this;
    }
    return TransitionParameters3D;
}(TransitionParameters));
var Transition3d = /** @class */ (function (_super) {
    __extends(Transition3d, _super);
    function Transition3d(transitionParameters) {
        var _this = _super.call(this, transitionParameters) || this;
        if (_this.context.isDisposed())
            return _this;
        _this.gl.enable(_this.gl.BLEND);
        _this.gl.blendFunc(_this.gl.SRC_ALPHA, _this.gl.ONE_MINUS_SRC_ALPHA);
        return _this;
    }
    Transition3d.prototype.getVertexShader = function () {
        return "#version 300 es\n\t\t\t\tprecision mediump float;\n\n\t\t\t\tin vec4 a_position;\n\t\t\t\tin vec3 a_normal;\n\t\t\t\tin vec2 a_texCoord;\n\n\t\t\t\tuniform mat4 u_projectionMatrix;\n\t\t\t\tuniform mat4 u_modelViewMatrix;\n\t\t\t\tuniform mat4 u_sceneTransformMatrix;\n\t\t\t\tuniform mat4 u_primitiveTransformMatrix;\n\t\t\t\tuniform mat4 u_operationsTransformMatrix;\n\n\t\t\t\tout vec2 v_texturePosition;\n\t\t\t\tout vec3 v_normal;\n\n\t\t\t\tmat4 customTranspose(mat4 m) {\n\t\t\t\t\treturn mat4(\n\t\t\t\t\t\tm[0][0], m[1][0], m[2][0], m[3][0],\n\t\t\t\t\t\tm[0][1], m[1][1], m[2][1], m[3][1],\n\t\t\t\t\t\tm[0][2], m[1][2], m[2][2], m[3][2],\n\t\t\t\t\t\tm[0][3], m[1][3], m[2][3], m[3][3]\n\t\t\t\t\t);\n\t\t\t\t}\n\n\t\t\t\tmat4 customInverse(mat4 m) {\n\t\t\t\t\tfloat a00 = m[0][0], a01 = m[0][1], a02 = m[0][2], a03 = m[0][3];\n\t\t\t\t\tfloat a10 = m[1][0], a11 = m[1][1], a12 = m[1][2], a13 = m[1][3];\n\t\t\t\t\tfloat a20 = m[2][0], a21 = m[2][1], a22 = m[2][2], a23 = m[2][3];\n\t\t\t\t\tfloat a30 = m[3][0], a31 = m[3][1], a32 = m[3][2], a33 = m[3][3];\n\n\t\t\t\t\tfloat b00 = a00 * a11 - a01 * a10;\n\t\t\t\t\tfloat b01 = a00 * a12 - a02 * a10;\n\t\t\t\t\tfloat b02 = a00 * a13 - a03 * a10;\n\t\t\t\t\tfloat b03 = a01 * a12 - a02 * a11;\n\t\t\t\t\tfloat b04 = a01 * a13 - a03 * a11;\n\t\t\t\t\tfloat b05 = a02 * a13 - a03 * a12;\n\t\t\t\t\tfloat b06 = a20 * a31 - a21 * a30;\n\t\t\t\t\tfloat b07 = a20 * a32 - a22 * a30;\n\t\t\t\t\tfloat b08 = a20 * a33 - a23 * a30;\n\t\t\t\t\tfloat b09 = a21 * a32 - a22 * a31;\n\t\t\t\t\tfloat b10 = a21 * a33 - a23 * a31;\n\t\t\t\t\tfloat b11 = a22 * a33 - a23 * a32;\n\n\t\t\t\t\tfloat det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;\n\n\t\t\t\t\treturn mat4(\n\t\t\t\t\t\ta11 * b11 - a12 * b10 + a13 * b09,\n\t\t\t\t\t\ta02 * b10 - a01 * b11 - a03 * b09,\n\t\t\t\t\t\ta31 * b05 - a32 * b04 + a33 * b03,\n\t\t\t\t\t\ta22 * b04 - a21 * b05 - a23 * b03,\n\t\t\t\t\t\ta12 * b08 - a10 * b11 - a13 * b07,\n\t\t\t\t\t\ta00 * b11 - a02 * b08 + a03 * b07,\n\t\t\t\t\t\ta32 * b02 - a30 * b05 - a33 * b01,\n\t\t\t\t\t\ta20 * b05 - a22 * b02 + a23 * b01,\n\t\t\t\t\t\ta10 * b10 - a11 * b08 + a13 * b06,\n\t\t\t\t\t\ta01 * b08 - a00 * b10 - a03 * b06,\n\t\t\t\t\t\ta30 * b04 - a31 * b02 + a33 * b00,\n\t\t\t\t\t\ta21 * b02 - a20 * b04 - a23 * b00,\n\t\t\t\t\t\ta11 * b07 - a10 * b09 - a12 * b06,\n\t\t\t\t\t\ta00 * b09 - a01 * b07 + a02 * b06,\n\t\t\t\t\t\ta31 * b01 - a30 * b03 - a32 * b00,\n\t\t\t\t\t\ta20 * b03 - a21 * b01 + a22 * b00) / det;\n\t\t\t\t}\n\n\t\t\t\tvoid main(void) {\n\t\t\t\t\tmat4 modelViewMatrix = u_modelViewMatrix * u_operationsTransformMatrix * u_sceneTransformMatrix * u_primitiveTransformMatrix;\n\t\t\t\t\tmat3 normalMatrix = mat3(customTranspose(customInverse(modelViewMatrix)));\n\t\t\t\t\tgl_Position = u_projectionMatrix * modelViewMatrix * a_position;\n\t\t\t\t\tv_texturePosition = a_texCoord;\n\t\t\t\t\tv_normal = normalize(normalMatrix * a_normal);\n\t\t\t\t}\n\t\t\t\t";
    };
    Transition3d.prototype.getFragmentShader = function () {
        return "#version 300 es\n\t\t\t\tprecision mediump float;\n\n\t\t\t\tuniform sampler2D slideTexture;\n\t\t\t\tin vec2 v_texturePosition;\n\t\t\t\tin vec3 v_normal;\n\n\t\t\t\tout vec4 outColor;\n\n\t\t\t\tvoid main() {\n\t\t\t\t\tvec3 lightVector = vec3(0.0, 0.0, 1.0);\n\t\t\t\t\tfloat light = max(dot(lightVector, v_normal), 0.0);\n\t\t\t\t\tvec4 fragment = texture(slideTexture, v_texturePosition);\n\t\t\t\t\tvec4 black = vec4(0.0, 0.0, 0.0, fragment.a);\n\t\t\t\t\toutColor = mix(black, fragment, light);\n\t\t\t\t}\n\t\t\t\t";
    };
    Transition3d.prototype.calculateModelViewMatrix = function () {
        var EyePos = 10.0;
        var modelView = glMatrix.mat4.create();
        glMatrix.mat4.translate(modelView, modelView, new Float32Array([0, 0, -EyePos]));
        return modelView;
    };
    Transition3d.prototype.calculateProjectionMatrix = function () {
        var EyePos = 10.0;
        var RealN = -1.0, RealF = 1.0;
        var RealL = -1.0, RealR = 1.0, RealB = -1.0, RealT = 1.0;
        var ClipN = EyePos + 5.0 * RealN;
        var ClipF = EyePos + 15.0 * RealF;
        var ClipL = RealL * 8.0;
        var ClipR = RealR * 8.0;
        var ClipB = RealB * 8.0;
        var ClipT = RealT * 8.0;
        var projection = glMatrix.mat4.create();
        glMatrix.mat4.frustum(projection, ClipL, ClipR, ClipB, ClipT, ClipN, ClipF);
        var scale = new Float32Array([
            1.0 /
                ((RealR * 2.0 * ClipN) / (EyePos * (ClipR - ClipL)) -
                    (ClipR + ClipL) / (ClipR - ClipL)),
            1.0 /
                ((RealT * 2.0 * ClipN) / (EyePos * (ClipT - ClipB)) -
                    (ClipT + ClipB) / (ClipT - ClipB)),
            1.0,
        ]);
        glMatrix.mat4.scale(projection, projection, scale);
        return projection;
    };
    Transition3d.prototype.initUniforms = function () {
        if (this.context.isDisposed())
            return;
        this.gl.useProgram(this.program);
        var modelViewMatrix = this.calculateModelViewMatrix();
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, 'u_modelViewMatrix'), false, modelViewMatrix);
        var projectionMatrix = this.calculateProjectionMatrix();
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, 'u_projectionMatrix'), false, projectionMatrix);
        // prettier-ignore
        var sceneTransformMatrix = new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, 'u_sceneTransformMatrix'), false, sceneTransformMatrix);
        // prettier-ignore
        var primitiveTransformMatrix = new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, 'u_primitiveTransformMatrix'), false, primitiveTransformMatrix);
        // prettier-ignore
        var operationsTransformMatrix = new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, 'u_operationsTransformMatrix'), false, operationsTransformMatrix);
        this.otherUniformsInitialization();
        console.log('Uniforms initialized');
    };
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    Transition3d.prototype.otherUniformsInitialization = function () { };
    Transition3d.prototype.render = function (nT) {
        if (this.context.isDisposed())
            return;
        this.gl.viewport(0, 0, this.context.canvas.width, this.context.canvas.height);
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.useProgram(this.program);
        this.gl.uniform1f(this.gl.getUniformLocation(this.program, 'time'), nT);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.leavingSlide);
        this.gl.uniform1i(this.gl.getUniformLocation(this.program, 'leavingSlideTexture'), 0);
        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.enteringSlide);
        this.gl.uniform1i(this.gl.getUniformLocation(this.program, 'enteringSlideTexture'), 1);
        this.renderUniformValue();
        this.gl.bindVertexArray(this.vao);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        app.map.fire('newslideshowframe', {
            frame: this.gl.canvas,
        });
    };
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    Transition3d.prototype.renderUniformValue = function () { };
    return Transition3d;
}(TransitionBase));
SlideShow.Transition3d = Transition3d;
//# sourceMappingURL=Transition3d.js.map