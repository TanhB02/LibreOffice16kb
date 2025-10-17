/* global Proxy _ */
/*
 * Copyright the Collabora Online contributors.
 *
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
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
var SplitSection = /** @class */ (function (_super) {
    __extends(SplitSection, _super);
    function SplitSection() {
        var _this = _super.call(this) || this;
        _this.name = L.CSections.Debug.Splits.name;
        _this.interactable = false;
        _this.anchor = ['top', 'left'];
        _this.processingOrder = L.CSections.Debug.Splits.processingOrder;
        _this.drawingOrder = L.CSections.Debug.Splits.drawingOrder;
        _this.zIndex = L.CSections.Debug.Splits.zIndex;
        _this.boundToSection = 'tiles';
        _this.sectionProperties = {
            docLayer: app.map._docLayer,
        };
        return _this;
    }
    SplitSection.prototype.onDraw = function () {
        var splitPanesContext = this.sectionProperties.docLayer.getSplitPanesContext();
        if (splitPanesContext) {
            var splitPos = splitPanesContext.getSplitPos();
            this.context.strokeStyle = 'red';
            this.context.strokeRect(0, 0, splitPos.x * app.dpiScale, splitPos.y * app.dpiScale);
        }
    };
    return SplitSection;
}(CanvasSectionObject));
app.definitions.splitSection = SplitSection;
//# sourceMappingURL=SplitSection.js.map