/* -*- js-indent-level: 8 -*- */
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
function CubeTransition(transitionParameters, isOutside) {
    if (isOutside === void 0) { isOutside = true; }
    var slide = new Primitive();
    slide.pushTriangle([0, 0], [1, 0], [0, 1]);
    slide.pushTriangle([1, 0], [0, 1], [1, 1]);
    var aLeavingPrimitives = [];
    aLeavingPrimitives.push(Primitive.cloneDeep(slide));
    if (isOutside) {
        slide.operations.push(makeRotateAndScaleDepthByWidth(vec3.fromValues(0, 1, 0), vec3.fromValues(0, 0, -1), 90, false, false, 0.0, 1.0));
    }
    else {
        slide.operations.push(makeRotateAndScaleDepthByWidth(vec3.fromValues(0, 1, 0), vec3.fromValues(0, 0, 1), -90, false, false, 0.0, 1.0));
    }
    var aEnteringPrimitives = [];
    aEnteringPrimitives.push(slide);
    var aOperations = [];
    aOperations.push(makeSScale(vec3.fromValues(0.9, 0.9, 0.9), vec3.fromValues(0, 0, 0), true, 0.0, 0.5));
    aOperations.push(makeSScale(vec3.fromValues(1.1, 1.1, 1.1), vec3.fromValues(0, 0, 0), true, 0.5, 1.0));
    if (isOutside) {
        aOperations.push(makeRotateAndScaleDepthByWidth(vec3.fromValues(0, 1, 0), vec3.fromValues(0, 0, -1), -90, false, true, 0.0, 1.0));
    }
    else {
        aOperations.push(makeRotateAndScaleDepthByWidth(vec3.fromValues(0, 1, 0), vec3.fromValues(0, 0, 1), 90, false, true, 0.0, 1.0));
    }
    var newTransitionParameters = __assign(__assign({}, transitionParameters), { leavingPrimitives: aLeavingPrimitives, enteringPrimitives: aEnteringPrimitives, allOperations: aOperations });
    return new SimpleTransition(newTransitionParameters);
}
SlideShow.CubeTransition = CubeTransition;
//# sourceMappingURL=CubeTransition.js.map