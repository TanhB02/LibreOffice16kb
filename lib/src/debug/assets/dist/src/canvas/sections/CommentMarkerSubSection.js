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
/*
    This class is for Impress's and Draw's comment markers.
    This is a sub section, needs to know about the parent section.
*/
var CommentMarkerSubSection = /** @class */ (function (_super) {
    __extends(CommentMarkerSubSection, _super);
    function CommentMarkerSubSection(sectionName, objectWidth, objectHeight, documentPosition, extraClass, showSection, parentSection, // Parent section.
    data) {
        if (extraClass === void 0) { extraClass = ''; }
        if (showSection === void 0) { showSection = false; }
        var _this = _super.call(this, sectionName, objectWidth, objectHeight, documentPosition, extraClass, showSection) || this;
        _this.sectionProperties.parentSection = parentSection;
        _this.sectionProperties.data = data;
        _this.sectionProperties.dragStartPosition = null;
        return _this;
    }
    CommentMarkerSubSection.prototype.sendAnnotationPositionChange = function (newPosition) {
        if (app.file.fileBasedView) {
            app.map.setPart(this.sectionProperties.docLayer._selectedPart, false);
            newPosition[1] -= this.sectionProperties.data.yAddition;
        }
        var comment = {
            Id: {
                type: 'string',
                value: this.sectionProperties.data.id,
            },
            PositionX: {
                type: 'int32',
                value: newPosition[0],
            },
            PositionY: {
                type: 'int32',
                value: newPosition[1],
            },
        };
        app.map.sendUnoCommand('.uno:EditAnnotation', comment);
        if (app.file.fileBasedView)
            app.setPart(0, false);
    };
    CommentMarkerSubSection.prototype.onMouseMove = function (point, dragDistance, e) {
        if (this.sectionProperties.parentSection === null)
            return;
        if (app.sectionContainer.isDraggingSomething()) {
            window.IgnorePanning = true;
            if (this.sectionProperties.parent === null)
                return;
            if (this.sectionProperties.dragStartPosition === null)
                this.sectionProperties.dragStartPosition = this.position.slice();
            this.setPosition(this.sectionProperties.dragStartPosition[0] + dragDistance[0], this.sectionProperties.dragStartPosition[1] + dragDistance[1]);
        }
    };
    CommentMarkerSubSection.prototype.onDragEnd = function () {
        window.IgnorePanning = undefined;
        this.sectionProperties.dragStartPosition = null;
        var twips = [
            this.position[0] * app.pixelsToTwips,
            this.position[1] * app.pixelsToTwips,
        ];
        this.sendAnnotationPositionChange(twips);
    };
    CommentMarkerSubSection.prototype.onClick = function (point, e) {
        e.stopPropagation();
        this.stopPropagating();
        this.sectionProperties.parentSection.sectionProperties.commentListSection.selectById(this.sectionProperties.data.id);
    };
    CommentMarkerSubSection.prototype.onMouseDown = function (point, e) {
        e.stopPropagation();
        this.stopPropagating();
    };
    CommentMarkerSubSection.prototype.onMouseUp = function (point, e) {
        e.stopPropagation();
        if (this.containerObject.isDraggingSomething()) {
            this.stopPropagating();
            this.onDragEnd();
        }
    };
    return CommentMarkerSubSection;
}(HTMLObjectSection));
app.definitions.commentMarkerSubSection = CommentMarkerSubSection;
//# sourceMappingURL=CommentMarkerSubSection.js.map