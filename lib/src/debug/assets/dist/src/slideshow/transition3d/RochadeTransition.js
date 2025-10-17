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
var RochadeTransitionImp = /** @class */ (function (_super) {
    __extends(RochadeTransitionImp, _super);
    function RochadeTransitionImp(transitionParameters) {
        return _super.call(this, transitionParameters) || this;
    }
    // TODO - remove code duplication
    /* jscpd:ignore-start */
    RochadeTransitionImp.prototype.displaySlides_ = function (t) {
        this.applyAllOperation(t);
        if (t < 0.5) {
            this.displayPrimitive(t, this.gl.TEXTURE0, 1, this.enteringPrimitives, 'slideTexture');
            this.displayPrimitive(t, this.gl.TEXTURE0, 0, this.leavingPrimitives, 'slideTexture');
        }
        else {
            this.displayPrimitive(t, this.gl.TEXTURE0, 0, this.leavingPrimitives, 'slideTexture');
            this.displayPrimitive(t, this.gl.TEXTURE0, 1, this.enteringPrimitives, 'slideTexture');
        }
    };
    return RochadeTransitionImp;
}(SimpleTransition));
// TODO - remove code duplication
/* jscpd:ignore-start */
function RochadeTransition(transitionParameters) {
    var slide = new Primitive();
    var w = 2.2;
    var h = 10.0;
    slide.pushTriangle([0, 0], [1, 0], [0, 1]);
    slide.pushTriangle([1, 0], [0, 1], [1, 1]);
    slide.operations.push(makeSEllipseTranslate(w, h, 0.25, -0.25, true, 0, 1));
    slide.operations.push(makeRotateAndScaleDepthByWidth(vec3.fromValues(0, 1, 0), vec3.fromValues(0, 0, 0), -45, true, true, 0.0, 1.0));
    var aLeavingPrimitives = [];
    aLeavingPrimitives.push(Primitive.cloneDeep(slide));
    slide.operations.push(makeSScale(vec3.fromValues(1.0, -1.0, 1.0), vec3.fromValues(0, -1.02, 0), false, -1, 0));
    aLeavingPrimitives.push(Primitive.cloneDeep(slide));
    slide.clear();
    slide.operations.push(makeSEllipseTranslate(w, h, 0.75, 0.25, true, 0.0, 1.0));
    slide.operations.push(makeSTranslate(vec3.fromValues(0.0, 0.0, -h), false, -1.0, 0.0));
    slide.operations.push(makeRotateAndScaleDepthByWidth(vec3.fromValues(0.0, 1.0, 0.0), vec3.fromValues(0.0, 0.0, 0.0), -45.0, true, true, 0.0, 1.0));
    slide.operations.push(makeRotateAndScaleDepthByWidth(vec3.fromValues(0.0, 1.0, 0.0), vec3.fromValues(0.0, 0.0, 0.0), 45.0, true, false, -1.0, 0.0));
    var aEnteringPrimitives = [Primitive.cloneDeep(slide)];
    slide.operations.push(makeSScale(vec3.fromValues(1.0, -1.0, 1.0), vec3.fromValues(0, -1.02, 0), false, -1, 0));
    aEnteringPrimitives.push(Primitive.cloneDeep(slide));
    // Todo: Improve second view
    var newTransitionParameters = __assign(__assign({}, transitionParameters), { leavingPrimitives: aLeavingPrimitives, enteringPrimitives: aEnteringPrimitives, allOperations: [] });
    return new RochadeTransitionImp(newTransitionParameters);
}
/* jscpd:ignore-end */
SlideShow.RochadeTransition = RochadeTransition;
//# sourceMappingURL=RochadeTransition.js.map