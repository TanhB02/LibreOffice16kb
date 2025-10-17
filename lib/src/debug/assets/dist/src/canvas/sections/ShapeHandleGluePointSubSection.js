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
var ShapeHandleGluePointSubSection = /** @class */ (function (_super) {
    __extends(ShapeHandleGluePointSubSection, _super);
    function ShapeHandleGluePointSubSection(parentHandlerSection, sectionName, size, documentPosition, ownInfo) {
        var _this = _super.call(this) || this;
        _this.processingOrder = L.CSections.DefaultForDocumentObjects.processingOrder;
        _this.drawingOrder = L.CSections.DefaultForDocumentObjects.drawingOrder + 1; // Handle events before the parent section.
        _this.zIndex = L.CSections.DefaultForDocumentObjects.zIndex;
        _this.documentObject = true;
        _this.name = sectionName;
        _this.size = size;
        _this.position = [documentPosition.pX, documentPosition.pY];
        _this.sectionProperties.parentHandlerSection = parentHandlerSection;
        _this.sectionProperties.ownInfo = ownInfo;
        return _this;
    }
    ShapeHandleGluePointSubSection.prototype.onDraw = function (frameCount, elapsedTime) {
        this.context.fillStyle = '#EE3E3E';
        this.context.beginPath();
        this.context.arc(0, 0, this.size[0] * 0.5, 0, Math.PI * 2);
        this.context.fill();
    };
    return ShapeHandleGluePointSubSection;
}(CanvasSectionObject));
app.definitions.shapeHandleGluePointSubSection = ShapeHandleGluePointSubSection;
//# sourceMappingURL=ShapeHandleGluePointSubSection.js.map