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
var WheelSubType;
(function (WheelSubType) {
    WheelSubType[WheelSubType["ONEWHEEL"] = 1] = "ONEWHEEL";
    WheelSubType[WheelSubType["TWOWHEEL"] = 2] = "TWOWHEEL";
    WheelSubType[WheelSubType["THREEWHEEL"] = 3] = "THREEWHEEL";
    WheelSubType[WheelSubType["FOURWHEEL"] = 4] = "FOURWHEEL";
    WheelSubType[WheelSubType["EIGHTWHEEL"] = 8] = "EIGHTWHEEL";
})(WheelSubType || (WheelSubType = {}));
var WheelTransition = /** @class */ (function (_super) {
    __extends(WheelTransition, _super);
    function WheelTransition(transitionParameters) {
        return _super.call(this, transitionParameters) || this;
    }
    WheelTransition.prototype.initMaskFunctionParams = function () {
        var transitionSubType = this.transitionFilterInfo.transitionSubtype;
        if (transitionSubType == TransitionSubType.TWOBLADEVERTICAL) {
            this.stocks = WheelSubType.TWOWHEEL;
        }
        else if (transitionSubType == TransitionSubType.THREEBLADE) {
            this.stocks = WheelSubType.THREEWHEEL;
        }
        else if (transitionSubType == TransitionSubType.FOURBLADE) {
            this.stocks = WheelSubType.FOURWHEEL;
        }
        else if (transitionSubType == TransitionSubType.EIGHTBLADE) {
            this.stocks = WheelSubType.EIGHTWHEEL;
        }
        else {
            this.stocks = WheelSubType.ONEWHEEL;
        }
    };
    WheelTransition.prototype.getMaskFunction = function () {
        var slice = (2.0 * Math.PI) / this.stocks;
        return "\n                float getMaskValue(vec2 uv, float time) {\n                    float progress = time;\n\n                    float angle = atan(uv.y - 0.5, uv.x - 0.5) + " + Math.PI / 2 + ";\n                    float mask = step(mod(angle, " + slice + "), " + slice + " * progress);\n\n                    return mask;\n                }\n\t\t";
    };
    return WheelTransition;
}(ClippingTransition));
SlideShow.WheelTransition = WheelTransition;
//# sourceMappingURL=WheelTransition.js.map