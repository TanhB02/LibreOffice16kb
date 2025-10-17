/* -*- js-indent-level: 8 -*- */
var Operation_t = /** @class */ (function () {
    function Operation_t(OperationCB) {
        this.OperationCB = OperationCB;
    }
    Operation_t.prototype.applyOperations = function (matrix, t, SlideWidthScale, SlideHeightScale) {
        return this.OperationCB().interpolate(matrix, t, SlideWidthScale, SlideHeightScale);
    };
    return Operation_t;
}());
SlideShow.Operation_t = Operation_t;
//# sourceMappingURL=Operation_t.js.map