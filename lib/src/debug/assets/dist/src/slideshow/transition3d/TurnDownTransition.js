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
function TurnDownTransition(transitionParameters) {
    var slide = new Primitive();
    slide.pushTriangle([0, 0], [1, 0], [0, 1]);
    slide.pushTriangle([1, 0], [0, 1], [1, 1]);
    var aLeavingPrimitives = [];
    aLeavingPrimitives.push(Primitive.cloneDeep(slide));
    slide.operations.push(makeSTranslate(vec3.fromValues(0, 0, 0.0001), false, -1.0, 0.0));
    slide.operations.push(makeSRotate(vec3.fromValues(0, 0, 1), vec3.fromValues(-1, 1, 0), -90, true, 0.0, 1.0));
    slide.operations.push(makeSRotate(vec3.fromValues(0, 0, 1), vec3.fromValues(-1, 1, 0), 90, false, -1.0, 0.0));
    var aEnteringPrimitives = [];
    aEnteringPrimitives.push(slide);
    var newTransitionParameters = __assign(__assign({}, transitionParameters), { leavingPrimitives: aLeavingPrimitives, enteringPrimitives: aEnteringPrimitives, allOperations: [] });
    return new SimpleTransition(newTransitionParameters);
}
/* jscpd:ignore-end */
SlideShow.TurnDownTransition = TurnDownTransition;
//# sourceMappingURL=TurnDownTransition.js.map