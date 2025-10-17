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
// TODO - remove code duplication
/* jscpd:ignore-start */
function TurnAroundTransition(transitionParameters) {
    var slide = new Primitive();
    slide.pushTriangle([0, 0], [1, 0], [0, 1]);
    slide.pushTriangle([1, 0], [0, 1], [1, 1]);
    var aLeavingPrimitives = [];
    aLeavingPrimitives.push(Primitive.cloneDeep(slide));
    slide.operations.push(makeSScale(vec3.fromValues(1.0, -1.0, 1.0), vec3.fromValues(0, -1.02, 0), false, -1, 0));
    aLeavingPrimitives.push(Primitive.cloneDeep(slide));
    slide.clear();
    slide.operations.push(makeRotateAndScaleDepthByWidth(vec3.fromValues(0, 1, 0), vec3.fromValues(0, 0, 0), -180, true, false, 0.0, 1.0));
    var aEnteringPrimitives = [Primitive.cloneDeep(slide)];
    slide.operations.push(makeSScale(vec3.fromValues(1.0, -1.0, 1.0), vec3.fromValues(0, -1.02, 0), false, -1, 0));
    aEnteringPrimitives.push(Primitive.cloneDeep(slide));
    var aOperations = [];
    aOperations.push(makeSTranslate(vec3.fromValues(0, 0, -1.5), true, 0, 0.5));
    aOperations.push(makeSTranslate(vec3.fromValues(0, 0, 1.5), true, 0.5, 1));
    aOperations.push(makeRotateAndScaleDepthByWidth(vec3.fromValues(0, 1, 0), vec3.fromValues(0, 0, 0), -180, true, true, 0.0, 1.0));
    var newTransitionParameters = __assign(__assign({}, transitionParameters), { leavingPrimitives: aLeavingPrimitives, enteringPrimitives: aEnteringPrimitives, allOperations: aOperations });
    return new ReflectionTransition(newTransitionParameters);
}
/* jscpd:ignore-end */
SlideShow.TurnAroundTransition = TurnAroundTransition;
//# sourceMappingURL=TurnAroundTransition.js.map