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
var RotateAndScaleDepth = /** @class */ (function (_super) {
    __extends(RotateAndScaleDepth, _super);
    function RotateAndScaleDepth(axis, origin, angle, scale, mbInterpolate, mnT0, mnT1, isDepthByWidth) {
        var _this = _super.call(this) || this;
        _this.axis = vec3.create();
        _this.origin = vec3.create();
        _this.angle = 0.0;
        _this.scale = false;
        _this.mbInterpolate = false;
        _this.mnT0 = 0.0;
        _this.mnT1 = 0.0;
        _this.isDepthByWidth = true;
        _this.axis = axis;
        _this.origin = origin;
        _this.angle = OpsHelper.deg2rad(angle);
        _this.scale = scale;
        _this.mbInterpolate = mbInterpolate;
        _this.mnT0 = mnT0;
        _this.mnT1 = mnT1;
        _this.isDepthByWidth = isDepthByWidth;
        return _this;
    }
    RotateAndScaleDepth.prototype.interpolate = function (matrix, t, SlideWidthScale, SlideHeightScale) {
        if (t <= this.mnT0) {
            return matrix;
        }
        if (!this.mbInterpolate || t > this.mnT1) {
            t = this.mnT1;
        }
        t = OpsHelper.intervalInter(t, this.mnT0, this.mnT1);
        var translationVector = vec3.fromValues(SlideWidthScale * this.origin[0], SlideHeightScale * this.origin[1], (this.isDepthByWidth ? SlideWidthScale : SlideHeightScale) *
            this.origin[2]);
        var scaleVector = vec3.fromValues(SlideWidthScale * SlideWidthScale, SlideHeightScale * SlideHeightScale, 1);
        mat4.translate(matrix, matrix, translationVector);
        if (this.scale) {
            mat4.scale(matrix, matrix, scaleVector);
        }
        mat4.rotate(matrix, matrix, this.angle * t, this.axis);
        if (this.scale) {
            mat4.scale(matrix, matrix, vec3.fromValues(1 / scaleVector[0], 1 / scaleVector[1], 1 / scaleVector[2]));
        }
        mat4.translate(matrix, matrix, vec3.negate(vec3.create(), translationVector));
        return matrix;
    };
    return RotateAndScaleDepth;
}(Operation));
function makeRotateAndScaleDepthByWidth(axis, origin, angle, scale, mbInterpolate, mnT0, mnT1) {
    return new RotateAndScaleDepth(axis, origin, angle, scale, mbInterpolate, mnT0, mnT1, true);
}
function makeRotateAndScaleDepthByHeight(axis, origin, angle, scale, mbInterpolate, mnT0, mnT1) {
    return new RotateAndScaleDepth(axis, origin, angle, scale, mbInterpolate, mnT0, mnT1, false);
}
SlideShow.makeRotateAndScaleDepthByWidth = makeRotateAndScaleDepthByWidth;
SlideShow.makeRotateAndScaleDepthByHeight = makeRotateAndScaleDepthByHeight;
//# sourceMappingURL=RotateAndScaleDepth.js.map