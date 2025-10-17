var cool;
(function (cool) {
    /*
     * SplitPanesContext stores positions/sizes/objects related to split panes.
     */
    var SplitPanesContext = /** @class */ (function () {
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        function SplitPanesContext(docLayer) {
            console.assert(docLayer, 'no docLayer!');
            console.assert(docLayer._map, 'no map!');
            this._docLayer = docLayer;
            this._map = docLayer._map;
            this._setDefaults();
        }
        SplitPanesContext.prototype._setDefaults = function () {
            this._splitPos = new cool.Point(0, 0);
        };
        Object.defineProperty(SplitPanesContext.prototype, "options", {
            get: function () {
                return SplitPanesContext.options;
            },
            enumerable: false,
            configurable: true
        });
        SplitPanesContext.prototype.getMaxSplitPosX = function () {
            var rawMax = Math.floor(app.sectionContainer.getWidth() * this.options.maxHorizontalSplitPercent / 100);
            return this._docLayer.getSnapDocPosX(rawMax);
        };
        SplitPanesContext.prototype.getMaxSplitPosY = function () {
            var rawMax = Math.floor(app.sectionContainer.getHeight() * this.options.maxVerticalSplitPercent / 100);
            return this._docLayer.getSnapDocPosY(rawMax);
        };
        SplitPanesContext.prototype.setSplitPos = function (splitX, splitY, forceUpdate) {
            if (forceUpdate === void 0) { forceUpdate = false; }
            var xchanged = this.setHorizSplitPos(splitX, forceUpdate, true /* noFire */);
            var ychanged = this.setVertSplitPos(splitY, forceUpdate, true /* noFire */);
            if (xchanged || ychanged) {
                this._map.fire('splitposchanged');
                var section = app.sectionContainer.getSectionWithName(L.CSections.Splitter.name);
                if (section) {
                    section.setPosition(0, 0); // To refresh myTopLeft property.
                }
            }
        };
        SplitPanesContext.prototype.getSplitPos = function () {
            return this._splitPos.divideBy(app.dpiScale);
        };
        SplitPanesContext.prototype.justifySplitPos = function (split, isHoriz) {
            if (split <= 0) {
                return 0;
            }
            var maxSplitPos = isHoriz ? this.getMaxSplitPosX() : this.getMaxSplitPosY();
            if (split >= maxSplitPos) {
                return maxSplitPos;
            }
            return isHoriz ? this._docLayer.getSnapDocPosX(split) :
                this._docLayer.getSnapDocPosY(split);
        };
        SplitPanesContext.prototype.setHorizSplitPos = function (splitX, forceUpdate, noFire) {
            console.assert(typeof splitX === 'number', 'splitX must be a number');
            if (this._splitPos.x === splitX) {
                return false;
            }
            var changed = false;
            var newX = this.justifySplitPos(splitX, true /* isHoriz */);
            if (newX !== this._splitPos.x) {
                this._splitPos.x = newX;
                changed = true;
            }
            app.calc.splitCoordinate.pX = newX;
            if (!noFire)
                this._map.fire('splitposchanged');
            return changed;
        };
        SplitPanesContext.prototype.setVertSplitPos = function (splitY, forceUpdate, noFire) {
            console.assert(typeof splitY === 'number', 'splitY must be a number');
            if (this._splitPos.y === splitY) {
                return false;
            }
            var changed = false;
            var newY = this.justifySplitPos(splitY, false /* isHoriz */);
            if (newY !== this._splitPos.y) {
                this._splitPos.y = newY;
                changed = true;
            }
            app.calc.splitCoordinate.pY = newY;
            if (!noFire)
                this._map.fire('splitposchanged');
            return changed;
        };
        SplitPanesContext.prototype.getPanesProperties = function () {
            var paneStatusList = [];
            if (this._splitPos.x && this._splitPos.y) {
                // top-left pane
                paneStatusList.push({
                    xFixed: true,
                    yFixed: true,
                });
            }
            if (this._splitPos.y) {
                // top-right pane or top half pane
                paneStatusList.push({
                    xFixed: false,
                    yFixed: true,
                });
            }
            if (this._splitPos.x) {
                // bottom-left pane or left half pane
                paneStatusList.push({
                    xFixed: true,
                    yFixed: false,
                });
            }
            // bottom-right/bottom-half/right-half pane or the full pane (when there are no split-panes active)
            paneStatusList.push({
                xFixed: false,
                yFixed: false,
            });
            return paneStatusList;
        };
        // When view is split by horizontal and/or vertical line(s), there are up to 4 different parts of the file visible on the screen.
        // This function returns the viewed parts' coordinates as simple rectangles.
        SplitPanesContext.prototype.getViewRectangles = function () {
            var viewRectangles = new Array();
            viewRectangles.push(app.file.viewedRectangle.clone()); // If view is not splitted, this will be the only view rectangle.
            /*
                |----------------------------|
                | initial [0]  |  topright   |
                |              |             |
                |--------------|-------------|
                | bottomleft   |  bottomright|
                |              |             |
                |----------------------------|
    
            */
            if (this._splitPos.x) { // Vertical split.
                // There is vertical split, narrow down the initial view.
                viewRectangles[0].pX1 = 0;
                viewRectangles[0].pX2 = this._splitPos.x;
                var topRightPane = app.file.viewedRectangle.clone();
                var width = app.file.viewedRectangle.pWidth - viewRectangles[0].pWidth;
                topRightPane.pX1 = app.file.viewedRectangle.pX2 - width;
                topRightPane.pWidth = width;
                viewRectangles.push(topRightPane);
            }
            if (this._splitPos.y) {
                // There is a horizontal split, narrow down the initial view.
                viewRectangles[0].pY1 = 0;
                viewRectangles[0].pY2 = this._splitPos.y;
                var bottomLeftPane = app.file.viewedRectangle.clone();
                var height = app.file.viewedRectangle.pHeight - viewRectangles[0].pHeight;
                bottomLeftPane.pY1 = app.file.viewedRectangle.pY2 - height;
                bottomLeftPane.pHeight = height;
                viewRectangles.push(bottomLeftPane);
            }
            // If both splitters are active, don't let them overlap and add the bottom right pane.
            if (this._splitPos.x && this._splitPos.y) {
                viewRectangles[1].pY1 = 0;
                viewRectangles[1].pY2 = this._splitPos.y;
                viewRectangles[2].pX1 = 0;
                viewRectangles[2].pX2 = this._splitPos.x;
                var bottomRightPane = app.file.viewedRectangle.clone();
                var width = app.file.viewedRectangle.pWidth - viewRectangles[0].pWidth;
                var height = app.file.viewedRectangle.pHeight - viewRectangles[0].pHeight;
                bottomRightPane.pX1 = app.file.viewedRectangle.pX2 - width;
                bottomRightPane.pWidth = width;
                bottomRightPane.pY1 = app.file.viewedRectangle.pY2 - height;
                bottomRightPane.pHeight = height;
                viewRectangles.push(bottomRightPane);
            }
            return viewRectangles;
        };
        // returns all the pane rectangles for the provided full-map area (all in core pixels).
        SplitPanesContext.prototype.getPxBoundList = function (pxBounds) {
            if (!pxBounds) {
                pxBounds = this._map.getPixelBoundsCore();
            }
            var topLeft = pxBounds.getTopLeft();
            var bottomRight = pxBounds.getBottomRight();
            var boundList = [];
            if (this._splitPos.x && this._splitPos.y) {
                // top-left pane
                boundList.push(new cool.Bounds(new cool.Point(0, 0), this._splitPos));
            }
            if (this._splitPos.y) {
                // top-right pane or top half pane
                boundList.push(new cool.Bounds(new cool.Point(topLeft.x + this._splitPos.x, 0), new cool.Point(bottomRight.x, this._splitPos.y)));
            }
            if (this._splitPos.x) {
                // bottom-left pane or left half pane
                boundList.push(new cool.Bounds(new cool.Point(0, topLeft.y + this._splitPos.y), new cool.Point(this._splitPos.x, bottomRight.y)));
            }
            if (!boundList.length) {
                // the full pane (when there are no split-panes active)
                boundList.push(new cool.Bounds(topLeft, bottomRight));
            }
            else {
                // bottom-right/bottom-half/right-half pane
                boundList.push(new cool.Bounds(topLeft.add(this._splitPos), bottomRight));
            }
            return boundList;
        };
        SplitPanesContext.prototype.getTwipsBoundList = function (pxBounds) {
            var bounds = this.getPxBoundList(pxBounds);
            var docLayer = this._docLayer;
            return bounds.map(function (bound) {
                return new cool.Bounds(docLayer._corePixelsToTwips(bound.min), docLayer._corePixelsToTwips(bound.max));
            });
        };
        SplitPanesContext.prototype.intersectsVisible = function (areaPx) {
            var pixBounds = this._map.getPixelBoundsCore();
            var boundList = this.getPxBoundList(pixBounds);
            for (var i = 0; i < boundList.length; ++i) {
                if (areaPx.intersects(boundList[i])) {
                    return true;
                }
            }
            return false;
        };
        SplitPanesContext.options = {
            maxHorizontalSplitPercent: 70,
            maxVerticalSplitPercent: 70,
        };
        return SplitPanesContext;
    }());
    cool.SplitPanesContext = SplitPanesContext;
})(cool || (cool = {}));
L.SplitPanesContext = cool.SplitPanesContext;
//# sourceMappingURL=SplitPanesContext.js.map