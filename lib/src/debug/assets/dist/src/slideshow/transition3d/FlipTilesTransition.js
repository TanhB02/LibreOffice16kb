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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var FlipTilesTransition = /** @class */ (function (_super) {
    __extends(FlipTilesTransition, _super);
    function FlipTilesTransition(transitionParameters) {
        return _super.call(this, transitionParameters) || this;
    }
    FlipTilesTransition.prototype.initWebglFlags = function () {
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        // Enable face culling
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.cullFace(this.gl.BACK);
        // Disable blending
        this.gl.disable(this.gl.BLEND);
    };
    FlipTilesTransition.prototype.processPrimitives = function (t, texturePrimitive, applyOperations) {
        var e_1, _a;
        try {
            for (var texturePrimitive_1 = __values(texturePrimitive), texturePrimitive_1_1 = texturePrimitive_1.next(); !texturePrimitive_1_1.done; texturePrimitive_1_1 = texturePrimitive_1.next()) {
                var primitive = texturePrimitive_1_1.value;
                this.setBufferData(primitive.vertices);
                applyOperations.call(this, t, primitive.operations);
                this.gl.drawArrays(this.gl.TRIANGLES, 0, primitive.vertices.length);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (texturePrimitive_1_1 && !texturePrimitive_1_1.done && (_a = texturePrimitive_1.return)) _a.call(texturePrimitive_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    FlipTilesTransition.prototype.displaySlides_ = function (t) {
        this.applyAllOperation(t);
        // Render the entering slide primitives
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[1]);
        this.gl.uniform1i(this.gl.getUniformLocation(this.program, 'slideTexture'), 0);
        this.processPrimitives(t, this.enteringPrimitives, this.applyEnteringOperations);
        // Render the leaving slide primitives
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[0]);
        this.gl.uniform1i(this.gl.getUniformLocation(this.program, 'slideTexture'), 0);
        this.processPrimitives(t, this.leavingPrimitives, this.applyLeavingOperations);
    };
    return FlipTilesTransition;
}(SimpleTransition));
function vec(x, y, nx, ny) {
    x = x < 0.0 ? 0.0 : x;
    x = Math.min(x, nx);
    y = y < 0.0 ? 0.0 : y;
    y = Math.min(y, ny);
    return [x / nx, y / ny];
}
function calculateMidpoint(vec1, vec2) {
    return [
        (vec1[0] + vec2[0]) / 2.0,
        (vec1[1] + vec2[1]) / 2.0,
        (vec1[2] + vec2[2]) / 2.0, // Z coordinate
    ];
}
function makeFlipTilesTransition(transitionParameters, n, m) {
    if (n === void 0) { n = 8; }
    if (m === void 0) { m = 6; }
    var aLeavingPrimitives = [];
    var aEnteringPrimitives = [];
    for (var x = 0; x < n; x++) {
        for (var y = 0; y < n; y++) {
            var aTile = new Primitive();
            var x11 = vec(x, y, n, m);
            var x12 = vec(x, y + 1, n, m);
            var x21 = vec(x + 1, y, n, m);
            var x22 = vec(x + 1, y + 1, n, m);
            aTile.pushTriangle(x21, x11, x12);
            aTile.pushTriangle(x22, x21, x12);
            aTile.operations.push(makeSRotate(vec3.fromValues(0, 1, 0), calculateMidpoint(aTile.getVertex(1), aTile.getVertex(3)), 180, true, (x11[0] * x11[1]) / 2.0, (x22[0] * x22[1] + 1.0) / 2.0));
            aLeavingPrimitives.push(Primitive.cloneDeep(aTile));
            aTile.operations.push(makeSRotate(vec3.fromValues(0, 1, 0), calculateMidpoint(aTile.getVertex(1), aTile.getVertex(3)), -180, false, (x11[0] * x11[1]) / 2.0, (x22[0] * x22[1] + 1.0) / 2.0));
            aEnteringPrimitives.push(aTile);
        }
    }
    var newTransitionParameters = __assign(__assign({}, transitionParameters), { leavingPrimitives: aLeavingPrimitives, enteringPrimitives: aEnteringPrimitives, allOperations: [] });
    return new FlipTilesTransition(newTransitionParameters);
}
SlideShow.makeFlipTilesTransition = makeFlipTilesTransition;
//# sourceMappingURL=FlipTilesTransition.js.map