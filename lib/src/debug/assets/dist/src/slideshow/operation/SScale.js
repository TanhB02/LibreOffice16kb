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
var vec3 = glMatrix.vec3, mat4 = glMatrix.mat4;
var SScale = /** @class */ (function (_super) {
    __extends(SScale, _super);
    function SScale(scale, origin, mbInterpolate, mnT0, mnT1) {
        var _this = _super.call(this) || this;
        _this.scale = vec3.create();
        _this.origin = vec3.create();
        _this.mbInterpolate = false;
        _this.mnT0 = 0.0;
        _this.mnT1 = 0.0;
        _this.scale = scale;
        _this.origin = origin;
        _this.mbInterpolate = mbInterpolate;
        _this.mnT0 = mnT0;
        _this.mnT1 = mnT1;
        return _this;
    }
    SScale.prototype.scaleMatrix = function (matrix, t, scale) {
        var scaleFactor = vec3.create();
        vec3.scale(scaleFactor, scale, t); // (t * scale)
        vec3.add(scaleFactor, scaleFactor, [1 - t, 1 - t, 1 - t]); // (1 - t) + (t * scale)
        var scaledMatrix = mat4.clone(matrix);
        mat4.scale(scaledMatrix, scaledMatrix, scaleFactor);
        return scaledMatrix;
    };
    SScale.prototype.interpolate = function (matrix, t, SlideWidthScale, SlideHeightScale) {
        if (t <= this.mnT0)
            return matrix;
        if (!this.mbInterpolate || t > this.mnT1)
            t = this.mnT1;
        t = OpsHelper.intervalInter(t, this.mnT0, this.mnT1);
        var translationVector = vec3.fromValues(SlideWidthScale * this.origin[0], SlideHeightScale * this.origin[1], this.origin[2]);
        mat4.translate(matrix, matrix, translationVector);
        matrix = this.scaleMatrix(matrix, t, this.scale);
        mat4.translate(matrix, matrix, vec3.negate(vec3.create(), translationVector));
        return matrix;
    };
    return SScale;
}(Operation));
function makeSScale(scale, origin, mbInterpolate, mnT0, mnT1) {
    return new SScale(scale, origin, mbInterpolate, mnT0, mnT1);
}
SlideShow.makeSScale = makeSScale;
//# sourceMappingURL=SScale.js.map