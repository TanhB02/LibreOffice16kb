/* -*- js-indent-level: 8 -*- */
var vec2 = glMatrix.vec2, vec3 = glMatrix.vec3, mat4 = glMatrix.mat4;
var Operation = /** @class */ (function () {
    function Operation() {
    }
    Operation.prototype.interpolate = function (matrix, t, SlideWidthScale, SlideHeightScale) {
        return matrix;
    };
    return Operation;
}());
SlideShow.Operation = Operation;
var OpsHelper = /** @class */ (function () {
    function OpsHelper() {
    }
    OpsHelper.intervalInter = function (t, T0, T1) {
        return (t - T0) / (T1 - T0);
    };
    OpsHelper.deg2rad = function (v, degMultiple) {
        if (degMultiple === void 0) { degMultiple = 1; }
        // Divide first for exact values at multiples of 90 degrees
        return ((v / (90.0 * degMultiple)) * Math.PI) / 2;
    };
    return OpsHelper;
}());
SlideShow.OpsHelper = OpsHelper;
//# sourceMappingURL=Operation.js.map