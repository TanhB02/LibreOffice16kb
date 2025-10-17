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
var ReflectionTransition = /** @class */ (function (_super) {
    __extends(ReflectionTransition, _super);
    function ReflectionTransition(transitionParameters) {
        return _super.call(this, transitionParameters) || this;
    }
    // TODO - remove code duplication
    /* jscpd:ignore-start */
    ReflectionTransition.prototype.displaySlides_ = function (t) {
        this.applyAllOperation(t);
        if (t < 0.5) {
            this.displayPrimitive(t, this.gl.TEXTURE0, 0, this.leavingPrimitives, 'slideTexture');
        }
        else {
            this.displayPrimitive(t, this.gl.TEXTURE0, 1, this.enteringPrimitives, 'slideTexture');
        }
    };
    return ReflectionTransition;
}(SimpleTransition));
SlideShow.ReflectionTransition = ReflectionTransition;
//# sourceMappingURL=ReflectionTransition.js.map