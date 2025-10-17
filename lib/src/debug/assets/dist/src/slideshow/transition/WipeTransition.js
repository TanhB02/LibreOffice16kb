// @ts-strict-ignore
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
var WipeSubType;
(function (WipeSubType) {
    WipeSubType[WipeSubType["LEFTTORIGHT"] = 0] = "LEFTTORIGHT";
    WipeSubType[WipeSubType["RIGHTTOLEFT"] = 1] = "RIGHTTOLEFT";
    WipeSubType[WipeSubType["TOPTOBOTTOM"] = 2] = "TOPTOBOTTOM";
    WipeSubType[WipeSubType["BOTTOMTOTOP"] = 3] = "BOTTOMTOTOP";
})(WipeSubType || (WipeSubType = {}));
var WipeTransition = /** @class */ (function (_super) {
    __extends(WipeTransition, _super);
    function WipeTransition(transitionParameters) {
        return _super.call(this, transitionParameters) || this;
    }
    WipeTransition.prototype.initMaskFunctionParams = function () {
        var transitionSubType = this.transitionFilterInfo.transitionSubtype;
        if (transitionSubType == TransitionSubType.TOPTOBOTTOM &&
            this.transitionFilterInfo.isDirectionForward) {
            this.direction = WipeSubType.TOPTOBOTTOM;
        }
        else if (transitionSubType == TransitionSubType.TOPTOBOTTOM &&
            !this.transitionFilterInfo.isDirectionForward) {
            this.direction = WipeSubType.BOTTOMTOTOP;
        }
        else if (transitionSubType == TransitionSubType.LEFTTORIGHT &&
            this.transitionFilterInfo.isDirectionForward) {
            this.direction = WipeSubType.LEFTTORIGHT;
        }
        else {
            this.direction = WipeSubType.RIGHTTOLEFT;
        }
    };
    // jscpd:ignore-start
    WipeTransition.prototype.getMaskFunction = function () {
        var isHorizontalDir = this.direction == WipeSubType.LEFTTORIGHT ||
            this.direction == WipeSubType.RIGHTTOLEFT;
        var isBackwardDir = this.direction == WipeSubType.RIGHTTOLEFT ||
            this.direction == WipeSubType.BOTTOMTOTOP;
        return "\n        float getMaskValue(vec2 uv, float time) {\n            float progress = time;\n\n            float coord = " + (isHorizontalDir ? 'uv.x' : 'uv.y') + ";\n            " + (isBackwardDir ? 'coord = 1.0 - coord;' : '') + "\n            float mask = step(coord, progress);\n            return mask;\n        }\n\t\t";
    };
    return WipeTransition;
}(ClippingTransition));
SlideShow.WipeTransition = WipeTransition;
//# sourceMappingURL=WipeTransition.js.map