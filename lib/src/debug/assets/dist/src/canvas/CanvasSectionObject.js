// @ts-strict-ignore
/* -*- js-indent-level: 8 -*- */
/*
 * Copyright the Collabora Online contributors.
 *
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
// This class will be used internally by CanvasSectionContainer.
var CanvasSectionObject = /** @class */ (function () {
    function CanvasSectionObject() {
        this.myTopLeft = [0, 0];
        this.documentTopLeft = [0, 0]; // Document top left will be updated by container.
        this.containerObject = null;
        this.name = null;
        this.backgroundColor = null; // Default is null (container's background color will be used).
        this.backgroundOpacity = 1; // Valid when backgroundColor is valid.
        this.borderColor = null; // Default is null (no borders).
        this.boundToSection = null;
        this.anchor = [];
        // When section is a document object, its position should be the real position inside the document, in core pixels.
        this.isVisible = false; // Is section visible on the viewed area of the document? This property is valid for document objects. This is managed by the section container.
        this.showSection = true; // Show / hide section.
        this.position = [0, 0];
        this.size = [0, 0];
        this.expand = [];
        this.interactable = true;
        this.isAnimating = false;
        this.windowSection = false;
        this.sectionProperties = {};
        this.boundsList = []; // The sections those this section can propagate events to. Updated by container.
    }
    CanvasSectionObject.prototype.onInitialize = function () { return; };
    CanvasSectionObject.prototype.onCursorPositionChanged = function (newPosition) { return; };
    CanvasSectionObject.prototype.onCellAddressChanged = function () { return; };
    CanvasSectionObject.prototype.onMouseMove = function (point, dragDistance, e) { return; };
    CanvasSectionObject.prototype.onMouseDown = function (point, e) { return; };
    CanvasSectionObject.prototype.onMouseUp = function (point, e) { return; };
    CanvasSectionObject.prototype.setShowSection = function (show) { return; };
    CanvasSectionObject.prototype.onSectionShowStatusChange = function () { return; }; /// Called when setShowSection is called.
    CanvasSectionObject.prototype.isSectionShown = function () { return; };
    CanvasSectionObject.prototype.onDocumentObjectVisibilityChange = function () { return; };
    CanvasSectionObject.prototype.onMouseEnter = function (point, e) { return; };
    CanvasSectionObject.prototype.onMouseLeave = function (point, e) { return; };
    CanvasSectionObject.prototype.onClick = function (point, e) { return; };
    CanvasSectionObject.prototype.onDoubleClick = function (point, e) { return; };
    CanvasSectionObject.prototype.onContextMenu = function (e) { return; };
    CanvasSectionObject.prototype.onMouseWheel = function (point, delta, e) { return; };
    CanvasSectionObject.prototype.onMultiTouchStart = function (e) { return; };
    CanvasSectionObject.prototype.onMultiTouchMove = function (point, dragDistance, e) { return; };
    CanvasSectionObject.prototype.onMultiTouchEnd = function (e) { return; };
    CanvasSectionObject.prototype.onResize = function () { return; };
    CanvasSectionObject.prototype.onDraw = function (frameCount, elapsedTime) { return; };
    CanvasSectionObject.prototype.onUpdateDOM = function () { return; }; // Called before onDraw, to update the DOM if required.
    CanvasSectionObject.prototype.onDrawArea = function (area, paneTopLeft, canvasContext) { return; }; // area is the area to be painted using canvasContext.
    CanvasSectionObject.prototype.onAnimate = function (frameCount, elapsedTime) { return; };
    CanvasSectionObject.prototype.onAnimationEnded = function (frameCount, elapsedTime) { return; }; // frameCount, elapsedTime. Sections that will use animation, have to have this function defined.
    CanvasSectionObject.prototype.onNewDocumentTopLeft = function (size) { return; };
    CanvasSectionObject.prototype.onRemove = function () { return; }; // This Function is called right before section is removed.
    CanvasSectionObject.prototype.setDrawingOrder = function (drawingOrder) { return; };
    CanvasSectionObject.prototype.setZIndex = function (zIndex) { return; };
    CanvasSectionObject.prototype.bindToSection = function (sectionName) { return; };
    CanvasSectionObject.prototype.stopPropagating = function () { return; };
    CanvasSectionObject.prototype.startAnimating = function (options) { return; };
    CanvasSectionObject.prototype.resetAnimation = function () { return; };
    CanvasSectionObject.prototype.getTestDiv = function () { return; };
    CanvasSectionObject.prototype.setPosition = function (x, y) { return; }; // Document objects only.
    // All below functions should be included in their respective section definitions (or other classes), not here.
    CanvasSectionObject.prototype.isCalcRTL = function () { return; };
    CanvasSectionObject.prototype.setViewResolved = function (on) { return; };
    CanvasSectionObject.prototype.setView = function (on) { return; };
    CanvasSectionObject.prototype.scrollVerticalWithOffset = function (offset) { return; };
    CanvasSectionObject.prototype.remove = function (id) { return; };
    CanvasSectionObject.prototype.deleteThis = function () { return; };
    CanvasSectionObject.prototype.getActiveEdit = function () { return; };
    CanvasSectionObject.prototype.isMobileCommentActive = function () { return false; };
    CanvasSectionObject.prototype.getMobileCommentModalId = function () { return ''; };
    CanvasSectionObject.prototype.rejectAllTrackedCommentChanges = function () { return; };
    CanvasSectionObject.prototype.removeHighlighters = function () { return; };
    CanvasSectionObject.prototype.showUsernamePopUp = function () { return; };
    CanvasSectionObject.prototype._selectColumn = function (colNumber, modifier) { return; };
    CanvasSectionObject.prototype._selectRow = function (row, modifier) { return; };
    CanvasSectionObject.prototype.insertColumnBefore = function (index) { return; };
    CanvasSectionObject.prototype.insertRowAbove = function (index) { return; };
    CanvasSectionObject.prototype.deleteColumn = function (index) { return; };
    CanvasSectionObject.prototype.deleteRow = function (index) { return; };
    CanvasSectionObject.prototype.resetStrokeStyle = function () { return; };
    CanvasSectionObject.prototype.hasAnyComments = function () { return false; };
    CanvasSectionObject.prototype.getLineWidth = function () {
        if (app.dpiScale > 1.0) {
            return app.roundedDpiScale;
        }
        else {
            return app.dpiScale;
        }
    };
    CanvasSectionObject.prototype.getLineOffset = function () {
        if (app.dpiScale > 1.0) {
            return app.roundedDpiScale % 2 === 0 ? 0 : 0.5;
        }
        else {
            return 0.5;
        }
    };
    return CanvasSectionObject;
}());
app.definitions.canvasSectionObject = CanvasSectionObject;
//# sourceMappingURL=CanvasSectionObject.js.map