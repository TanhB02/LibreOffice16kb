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
function Venetian3dTransition(transitionParameters, vertical, parts) {
    var t30 = Math.tan(Math.PI / 6.0);
    var ln = 0;
    var p = 1.0 / parts;
    var aLeavingPrimitives = [];
    var aEnteringPrimitives = [];
    for (var i = 0; i < parts; i++) {
        var Slide = new Primitive();
        var n = (i + 1.0) / parts;
        if (!vertical) {
            Slide.pushTriangle([0, ln], [1, ln], [0, n]);
            Slide.pushTriangle([1, ln], [0, n], [1, n]);
            Slide.operations.push(makeRotateAndScaleDepthByHeight(vec3.fromValues(1, 0, 0), vec3.fromValues(0, 1 - n - ln, -t30 * p), -120, true, true, 0.0, 1.0));
        }
        else {
            Slide.pushTriangle([ln, 0], [n, 0], [ln, 1]);
            Slide.pushTriangle([n, 0], [ln, 1], [n, 1]);
            Slide.operations.push(makeRotateAndScaleDepthByWidth(vec3.fromValues(0, 1, 0), vec3.fromValues(n + ln - 1, 0, -t30 * p), -120, true, true, 0.0, 1.0));
        }
        aLeavingPrimitives.push(Primitive.cloneDeep(Slide));
        if (!vertical) {
            Slide.operations.push(makeSRotate(vec3.fromValues(1, 0, 0), vec3.fromValues(0, 1 - 2 * n, 0), -60, false, -1, 0));
            Slide.operations.push(makeSRotate(vec3.fromValues(1, 0, 0), vec3.fromValues(0, 1 - n - ln, 0), 180, false, -1, 0));
        }
        else {
            Slide.operations.push(makeSRotate(vec3.fromValues(0, 1, 0), vec3.fromValues(2 * n - 1, 0, 0), -60, false, -1, 0));
            Slide.operations.push(makeSRotate(vec3.fromValues(0, 1, 0), vec3.fromValues(n + ln - 1, 0, 0), 180, false, -1, 0));
        }
        aEnteringPrimitives.push(Slide);
        ln = n;
    }
    var newTransitionParameters = __assign(__assign({}, transitionParameters), { leavingPrimitives: aLeavingPrimitives, enteringPrimitives: aEnteringPrimitives, allOperations: [] });
    return new SimpleTransition(newTransitionParameters);
}
SlideShow.Venetian3dTransition = Venetian3dTransition;
//# sourceMappingURL=Venetian3dTransition.js.map