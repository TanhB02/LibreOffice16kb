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
var HelixTransition = /** @class */ (function (_super) {
    __extends(HelixTransition, _super);
    function HelixTransition(transitionParameters) {
        return _super.call(this, transitionParameters) || this;
    }
    HelixTransition.prototype.displaySlides_ = function (t) {
        this.applyAllOperation(t);
        if (t < 0.5)
            this.displayPrimitive(t, this.gl.TEXTURE0, 0, this.leavingPrimitives, 'slideTexture');
        else
            this.displayPrimitive(t, this.gl.TEXTURE0, 1, this.enteringPrimitives, 'slideTexture');
    };
    return HelixTransition;
}(SimpleTransition));
function makeHelixTransition(transitionParameters, nRows) {
    if (nRows === void 0) { nRows = 20; }
    var invN = 1.0 / nRows;
    var delayFactor = 0.2; // Adjust this to control the delay between the leaving and entering operations
    var iDn = 0.0;
    var iPDn = invN;
    var aLeavingPrimitives = [];
    var aEnteringPrimitives = [];
    var aOperations = [];
    for (var i = 0; i < nRows; i++) {
        var Tile_1 = new Primitive();
        Tile_1.pushTriangle([1.0, iDn], [0.0, iDn], [0.0, iPDn]);
        Tile_1.pushTriangle([1.0, iPDn], [1.0, iDn], [0.0, iPDn]);
        var leaveStartTime = Math.min(Math.max(((i - nRows / 2.0) * invN) / 2.0, 0.0), 1.0);
        var leaveEndTime = Math.min(Math.max(((i + nRows / 2.0) * invN) / 2.0, 0.0), 1.0);
        Tile_1.operations.push(makeSRotate(vec3.fromValues(0, 1, 0), vec3.fromValues(0, 1, 0), 180, true, leaveStartTime, leaveEndTime));
        aLeavingPrimitives.push(Primitive.cloneDeep(Tile_1));
        var enterStartTime = leaveEndTime + delayFactor * invN;
        var enterEndTime = enterStartTime + (1.0 - leaveEndTime);
        Tile_1.operations.push(makeSRotate(vec3.fromValues(0, 1, 0), vec3.fromValues(0, 1, 0), -180, true, enterStartTime, enterEndTime));
        aEnteringPrimitives.push(Tile_1);
        iDn += invN;
        iPDn += invN;
    }
    var newTransitionParameters = __assign(__assign({}, transitionParameters), { leavingPrimitives: aLeavingPrimitives, enteringPrimitives: aEnteringPrimitives, allOperations: aOperations });
    return new HelixTransition(newTransitionParameters);
}
SlideShow.makeHelixTransition = makeHelixTransition;
//# sourceMappingURL=HelixTransition.js.map