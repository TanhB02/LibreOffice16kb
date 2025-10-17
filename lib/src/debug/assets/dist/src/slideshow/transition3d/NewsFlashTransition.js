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
function NewsFlashTransition(transitionParameters) {
    var lSlide = new Primitive();
    var eSlide = new Primitive();
    lSlide.pushTriangle([0, 0], [1, 0], [0, 1]);
    lSlide.pushTriangle([1, 0], [0, 1], [1, 1]);
    eSlide.pushTriangle([0, 0], [1, 0], [0, 1]);
    eSlide.pushTriangle([1, 0], [0, 1], [1, 1]);
    lSlide.operations.push(makeSRotate(vec3.fromValues(0, 0, 1), vec3.fromValues(0, 0, 0), 3000, true, 0, 0.5));
    lSlide.operations.push(makeSScale(vec3.fromValues(0.01, 0.01, 0.01), vec3.fromValues(0, 0, 0), true, 0, 0.5));
    lSlide.operations.push(makeSTranslate(vec3.fromValues(-10000, 0, 0), false, 0.5, 2));
    var aLeavingPrimitives = [lSlide];
    eSlide.operations.push(makeSRotate(vec3.fromValues(0, 0, 1), vec3.fromValues(0, 0, 0), -3000, true, 0.5, 1));
    eSlide.operations.push(makeSTranslate(vec3.fromValues(-100, 0, 0), false, -1, 1));
    eSlide.operations.push(makeSTranslate(vec3.fromValues(100, 0, 0), false, 0.5, 1));
    eSlide.operations.push(makeSScale(vec3.fromValues(0.01, 0.01, 0.01), vec3.fromValues(0, 0, 0), false, -1, 1));
    eSlide.operations.push(makeSScale(vec3.fromValues(100, 100, 100), vec3.fromValues(0, 0, 0), true, 0.5, 1));
    var aEnteringPrimitives = [eSlide];
    var aOperations = [];
    aOperations.push(makeSRotate(vec3.fromValues(0, 0, 1), vec3.fromValues(0.2, 0.2, 0), 1080, true, 0, 1));
    var newTransitionParameters = __assign(__assign({}, transitionParameters), { leavingPrimitives: aLeavingPrimitives, enteringPrimitives: aEnteringPrimitives, allOperations: aOperations });
    return new SimpleTransition(newTransitionParameters);
}
SlideShow.NewsFlashTransition = NewsFlashTransition;
//# sourceMappingURL=NewsFlashTransition.js.map