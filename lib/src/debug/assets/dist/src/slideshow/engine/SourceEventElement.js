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
var SourceEventElement = /** @class */ (function () {
    function SourceEventElement(sId, aCanvas, bounds, priority, aSlideShow, aEventMultiplexer) {
        this.aSlideShow = null;
        this.bClickHandled = false;
        this.bIsPointerOver = false;
        this.sId = sId;
        this.aCanvas = aCanvas;
        this.bounds = bounds;
        this.aSlideShow = aSlideShow;
        this.aEventMultiplexer = aEventMultiplexer;
        this.aEventMultiplexer.registerMouseClickHandler(this, 1000 + priority);
    }
    SourceEventElement.prototype.getId = function () {
        return this.sId;
    };
    SourceEventElement.prototype.onMouseMove = function (cursorX, cursorY) {
        var bIsOver = this.isOver(cursorX, cursorY);
        if (bIsOver !== this.bIsPointerOver) {
            if (bIsOver)
                this.onMouseEnter();
            else
                this.onMouseLeave();
        }
        return bIsOver;
    };
    SourceEventElement.prototype.isOver = function (x, y) {
        // console.debug('SourceEventElement.isOver: x: ' + x + ', y: ' + y);
        var bounds = this.bounds;
        return (x >= bounds.x &&
            x <= bounds.x + bounds.width &&
            y >= bounds.y &&
            y <= bounds.y + bounds.height);
    };
    SourceEventElement.prototype.onMouseEnter = function () {
        this.bIsPointerOver = true;
        this.setPointerCursor();
    };
    SourceEventElement.prototype.onMouseLeave = function () {
        this.bIsPointerOver = false;
        this.setDefaultCursor();
    };
    SourceEventElement.prototype.charge = function () {
        this.bClickHandled = false;
        this.setPointerCursor();
    };
    SourceEventElement.prototype.handleClick = function ( /*aMouseEvent*/) {
        if (!this.bIsPointerOver)
            return false;
        if (this.bClickHandled)
            return false;
        this.aEventMultiplexer.notifyEvent(EventTrigger.OnClick, this.getId());
        this.aSlideShow.update();
        this.bClickHandled = true;
        this.setDefaultCursor();
        return true;
    };
    SourceEventElement.prototype.setPointerCursor = function () {
        if (this.bClickHandled)
            return;
        this.aCanvas.style.cursor = 'pointer';
    };
    SourceEventElement.prototype.setDefaultCursor = function () {
        this.aCanvas.style.cursor = 'default';
    };
    return SourceEventElement;
}());
//# sourceMappingURL=SourceEventElement.js.map