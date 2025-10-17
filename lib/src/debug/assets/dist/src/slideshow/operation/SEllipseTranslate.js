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
var SEllipseTranslate = /** @class */ (function (_super) {
    __extends(SEllipseTranslate, _super);
    function SEllipseTranslate(dWidth, dHeight, dStartPosition, dEndPosition, bInter, T0, T1) {
        var _this = _super.call(this) || this;
        _this.width = 0.0;
        _this.height = 0.0;
        _this.startPosition = 0.0;
        _this.endPosition = 0.0;
        _this.mbInterpolate = false;
        _this.mnT0 = 0.0;
        _this.mnT1 = 0.0;
        _this.width = dWidth;
        _this.height = dHeight;
        _this.startPosition = dStartPosition;
        _this.endPosition = dEndPosition;
        _this.mbInterpolate = bInter;
        _this.mnT0 = T0;
        _this.mnT1 = T1;
        return _this;
    }
    SEllipseTranslate.prototype.interpolate = function (matrix, t, SlideWidthScale, SlideHeightScale) {
        if (t <= this.mnT0)
            return matrix;
        if (!this.mbInterpolate || t > this.mnT1)
            t = this.mnT1;
        t = OpsHelper.intervalInter(t, this.mnT0, this.mnT1);
        // let a1:number ,a2: number ,x :number, y: number ;
        var a1 = this.startPosition * 2 * Math.PI;
        var a2 = (this.startPosition + t * (this.endPosition - this.startPosition)) *
            2 *
            Math.PI;
        var x = (this.width * (Math.cos(a2) - Math.cos(a1))) / 2;
        var y = (this.height * (Math.sin(a2) - Math.sin(a1))) / 2;
        mat4.translate(matrix, matrix, vec3.fromValues(x, 0, y));
        return matrix;
    };
    return SEllipseTranslate;
}(Operation));
function makeSEllipseTranslate(dWidth, dHeight, dStartPosition, dEndPosition, bInter, T0, T1) {
    return new SEllipseTranslate(dWidth, dHeight, dStartPosition, dEndPosition, bInter, T0, T1);
}
SlideShow.makeSEllipseTranslate = makeSEllipseTranslate;
//# sourceMappingURL=SEllipseTranslate.js.map