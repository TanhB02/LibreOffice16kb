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
var ShapeHandlePolySubSection = /** @class */ (function (_super) {
    __extends(ShapeHandlePolySubSection, _super);
    function ShapeHandlePolySubSection(parentHandlerSection, sectionName, size, documentPosition, ownInfo) {
        var _this = _super.call(this, parentHandlerSection, sectionName, size, documentPosition, ownInfo) || this;
        _this.sectionProperties.mousePointerType = 'move';
        return _this;
    }
    return ShapeHandlePolySubSection;
}(ShapeHandleCustomSubSection));
app.definitions.shapeHandlePolySubSection = ShapeHandlePolySubSection;
//# sourceMappingURL=ShapeHandlePolySubSection.js.map