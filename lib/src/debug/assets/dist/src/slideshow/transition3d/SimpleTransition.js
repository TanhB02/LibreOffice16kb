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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var SimpleTransition = /** @class */ (function (_super) {
    __extends(SimpleTransition, _super);
    function SimpleTransition(transitionParameters) {
        var _this = _super.call(this, transitionParameters) || this;
        _this.leavingPrimitives = [];
        _this.enteringPrimitives = [];
        _this.allOperations = [];
        _this.textures = [];
        _this.leavingPrimitives = transitionParameters.leavingPrimitives;
        _this.enteringPrimitives = transitionParameters.enteringPrimitives;
        _this.allOperations = transitionParameters.allOperations;
        _this.textures = [transitionParameters.current, transitionParameters.next];
        _this.initWebglFlags();
        _this.prepareTransition();
        return _this;
    }
    SimpleTransition.prototype.initWebglFlags = function () {
        if (this.context.isDisposed())
            return;
        this.gl.disable(this.gl.DEPTH_TEST);
        this.gl.disable(this.gl.CULL_FACE);
        // Enable alpha blending
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    };
    SimpleTransition.prototype.initBuffers = function () {
        this.vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.vao);
        this.buffer = this.gl.createBuffer();
        if (!this.buffer) {
            throw new Error('Failed to create buffer');
        }
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        // prettier-ignore
        var initialPositions = new Float32Array([
            -1, -1, 0, 0, 1,
            1, -1, 0, 1, 1,
            -1, 1, 0, 0, 0,
            1, 1, 0, 1, 0,
        ]);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, initialPositions, this.gl.STATIC_DRAW);
        var positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
        var normalLocation = this.gl.getAttribLocation(this.program, 'a_normal');
        var texCoordLocation = this.gl.getAttribLocation(this.program, 'a_texCoord');
        if (positionLocation !== -1) {
            this.gl.enableVertexAttribArray(positionLocation);
            this.gl.vertexAttribPointer(positionLocation, 3, this.gl.FLOAT, false, 8 * 4, 0);
        }
        if (normalLocation !== -1) {
            this.gl.enableVertexAttribArray(normalLocation);
            this.gl.vertexAttribPointer(normalLocation, 3, this.gl.FLOAT, false, 8 * 4, 3 * 4);
        }
        if (texCoordLocation !== -1) {
            this.gl.enableVertexAttribArray(texCoordLocation);
            this.gl.vertexAttribPointer(texCoordLocation, 2, this.gl.FLOAT, false, 8 * 4, 6 * 4);
        }
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        this.gl.bindVertexArray(null);
        console.debug('Simple Transition buffer initialized.');
    };
    SimpleTransition.prototype.applyAllOperation = function (t) {
        var e_1, _a;
        var matrix = mat4.create();
        try {
            for (var _b = __values(this.allOperations), _c = _b.next(); !_c.done; _c = _b.next()) {
                var operation = _c.value;
                matrix = operation.interpolate(matrix, t, 1.0, 1.0);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, 'u_operationsTransformMatrix'), false, matrix);
    };
    SimpleTransition.prototype.applyLeavingOperations = function (t, operations) {
        var e_2, _a;
        var matrix = mat4.create();
        try {
            for (var operations_1 = __values(operations), operations_1_1 = operations_1.next(); !operations_1_1.done; operations_1_1 = operations_1.next()) {
                var operation = operations_1_1.value;
                matrix = operation.interpolate(matrix, t, 1.0, 1.0);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (operations_1_1 && !operations_1_1.done && (_a = operations_1.return)) _a.call(operations_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, 'u_primitiveTransformMatrix'), false, matrix);
    };
    SimpleTransition.prototype.applyEnteringOperations = function (t, operations) {
        var e_3, _a;
        var matrix = mat4.create();
        try {
            for (var operations_2 = __values(operations), operations_2_1 = operations_2.next(); !operations_2_1.done; operations_2_1 = operations_2.next()) {
                var operation = operations_2_1.value;
                matrix = operation.interpolate(matrix, t, 1.0, 1.0);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (operations_2_1 && !operations_2_1.done && (_a = operations_2.return)) _a.call(operations_2);
            }
            finally { if (e_3) throw e_3.error; }
        }
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, 'u_primitiveTransformMatrix'), false, matrix);
    };
    SimpleTransition.prototype.displayPrimitive = function (t, textureType, textureNum, texturePrimitive, textureName) {
        var e_4, _a;
        this.gl.activeTexture(textureType);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[textureNum]);
        this.gl.uniform1i(this.gl.getUniformLocation(this.program, textureName), 0);
        try {
            for (var texturePrimitive_1 = __values(texturePrimitive), texturePrimitive_1_1 = texturePrimitive_1.next(); !texturePrimitive_1_1.done; texturePrimitive_1_1 = texturePrimitive_1.next()) {
                var primitive = texturePrimitive_1_1.value;
                this.setBufferData(primitive.vertices);
                this.applyLeavingOperations(t, primitive.operations);
                this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, primitive.vertices.length);
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (texturePrimitive_1_1 && !texturePrimitive_1_1.done && (_a = texturePrimitive_1.return)) _a.call(texturePrimitive_1);
            }
            finally { if (e_4) throw e_4.error; }
        }
    };
    SimpleTransition.prototype.displaySlides_ = function (t) {
        this.applyAllOperation(t);
        this.displayPrimitive(t, this.gl.TEXTURE0, 0, this.leavingPrimitives, 'slideTexture');
        this.displayPrimitive(t, this.gl.TEXTURE0, 1, this.enteringPrimitives, 'slideTexture');
    };
    SimpleTransition.prototype.render = function (nT) {
        if (this.context.isDisposed())
            return;
        this.gl.viewport(0, 0, this.context.canvas.width, this.context.canvas.height);
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.useProgram(this.program);
        this.gl.uniform1f(this.gl.getUniformLocation(this.program, 'time'), nT);
        this.gl.bindVertexArray(this.vao);
        this.displaySlides_(nT);
        this.gl.bindVertexArray(null);
        app.map.fire('newslideshowframe', {
            frame: this.gl.canvas,
        });
    };
    SimpleTransition.prototype.setBufferData = function (vertices) {
        var e_5, _a;
        var positionData = [];
        try {
            for (var vertices_1 = __values(vertices), vertices_1_1 = vertices_1.next(); !vertices_1_1.done; vertices_1_1 = vertices_1.next()) {
                var vertex = vertices_1_1.value;
                positionData.push.apply(positionData, __spreadArray(__spreadArray(__spreadArray([], __read(vertex.position), false), __read(vertex.normal), false), __read(vertex.texCoord), false));
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (vertices_1_1 && !vertices_1_1.done && (_a = vertices_1.return)) _a.call(vertices_1);
            }
            finally { if (e_5) throw e_5.error; }
        }
        var positions = new Float32Array(positionData);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
    };
    return SimpleTransition;
}(SlideShow.Transition3d));
SlideShow.SimpleTransition = SimpleTransition;
//# sourceMappingURL=SimpleTransition.js.map