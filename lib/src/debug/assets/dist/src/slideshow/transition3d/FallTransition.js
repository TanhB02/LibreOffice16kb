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
var FallTransition = /** @class */ (function (_super) {
    __extends(FallTransition, _super);
    function FallTransition(transitionParameters) {
        return _super.call(this, transitionParameters) || this;
    }
    FallTransition.prototype.displaySlides_ = function (t) {
        this.applyAllOperation(t);
        this.displayPrimitive(t, this.gl.TEXTURE0, 1, this.enteringPrimitives, 'slideTexture');
        this.displayPrimitive(t, this.gl.TEXTURE0, 0, this.leavingPrimitives, 'slideTexture');
    };
    return FallTransition;
}(SimpleTransition));
function makeFallTransition(transitionParameters) {
    var slide = new Primitive();
    slide.pushTriangle([0, 0], [1, 0], [0, 1]);
    slide.pushTriangle([1, 0], [0, 1], [1, 1]);
    var aEnteringPrimitives = [];
    aEnteringPrimitives.push(Primitive.cloneDeep(slide));
    slide.operations.push(makeRotateAndScaleDepthByWidth(vec3.fromValues(1, 0, 0), vec3.fromValues(0, -1, 0), 90, true, true, 0.0, 1.0));
    var aLeavingPrimitives = [];
    aLeavingPrimitives.push(Primitive.cloneDeep(slide));
    var aOperations = [];
    var newTransitionParameters = __assign(__assign({}, transitionParameters), { leavingPrimitives: aLeavingPrimitives, enteringPrimitives: aEnteringPrimitives, allOperations: aOperations });
    return new FallTransition(newTransitionParameters);
}
SlideShow.makeFallTransition = makeFallTransition;
//# sourceMappingURL=FallTransition.js.map