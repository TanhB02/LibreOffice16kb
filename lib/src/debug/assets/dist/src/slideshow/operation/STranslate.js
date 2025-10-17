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
var STranslate = /** @class */ (function (_super) {
    __extends(STranslate, _super);
    // TODO - remove code duplication
    /* jscpd:ignore-start */
    function STranslate(vector, mbInterpolate, mnT0, mnT1) {
        var _this = _super.call(this) || this;
        _this.mbInterpolate = false;
        _this.mnT0 = 0.0;
        _this.mnT1 = 0.0;
        _this.vector = vector;
        _this.mbInterpolate = mbInterpolate;
        _this.mnT0 = mnT0;
        _this.mnT1 = mnT1;
        return _this;
    }
    STranslate.prototype.interpolate = function (matrix, t, SlideWidthScale, SlideHeightScale) {
        if (t <= this.mnT0)
            return matrix;
        if (!this.mbInterpolate || t > this.mnT1)
            t = this.mnT1;
        t = OpsHelper.intervalInter(t, this.mnT0, this.mnT1);
        mat4.translate(matrix, matrix, vec3.fromValues(SlideWidthScale * t * this.vector[0], SlideHeightScale * t * this.vector[1], t * this.vector[2]));
        return matrix;
    };
    return STranslate;
}(Operation));
function makeSTranslate(vector, mbInterpolate, mnT0, mnT1) {
    return new STranslate(vector, mbInterpolate, mnT0, mnT1);
}
SlideShow.makeSTranslate = makeSTranslate;
//# sourceMappingURL=STranslate.js.map