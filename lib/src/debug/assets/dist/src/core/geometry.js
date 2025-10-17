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
/*
    Notes about the design:
        * Because there are more then one definitions of rectangle and point, we need a prefix. The prefix is "Simple".
        * This file is meant to be the base for geometry classes.
        * Needs to keep things simple and maintainable:
            * Interoperability between classes is important. These classes don't get other classes as inputs.
            * There shouldn't be something like "rectangle.testSomething(otherRectangle)", instead "rectangle.testSometghing(otherRectangle.toArray())"
            * We need this approach to keep things maintainable. These classes are not base for others for now. We shouldn't force types.
            * Function inputs are primitives, like number, array of numbers, array of arrays of numbers, ..
        * We have 3 types of coordinate units in Collabora Online.
            * CSS pixels.
            * Core pixels.
            * twips.
        * Core pixels are indeed equal to Canvas pixels. So:
            * Core pixels = Canvas pixels.
        * We are using term "core pixels" in many places.
        * Why are there a CSS pixels and core / canvas pixels?
            * Because now many devices have extreme pixel densities.
            * If you render a page with traditional pixel density using CSS: the buttons, UI, whatever is on the page will be rendered very small. Because pixels or too small.
            * Browsers are solving this issue with "devicePixelRatio" variable. They are rendering the page using this variable. The result is called CSS pixels.
            * This variable is equal to: "device's pixel density" / "traditional pixel density"
            * If devicePixelRatio is different than "1", the device has a bigger pixel density than traditional devices.
            * Canvas HTML elements are using device's pixel density. So we can use high definiton images on our canvas.
            * app.dpiScale is a *divider* for converting core pixels into CSS pixels. CSS pixels conversion probably will always be used for positioning etc. of HTML elements.
            * Search "devicePixelRatio" for more info.
        * We need to convert these 3 types where we need.
        * Every class is initiated with "twips" units. twips is the base unit. Every other type is calculated.
        * One can use "app.twipsToPixels", "app.pixelsToTwips" and "app.dpiScale" for initiating new classes with non-base units.
        * We use below terminology:
            * x => to get and set x.
            * pX => to get and set x using core / canvas units. Internally, it is converted into twips.
            * cX => to get and set x using CSS units. Internally, it is converted into twips.
        * Every type has its own sub functions:
            * toArray (native-twips), cToArray (CSS), pToArray (core / canvas), containsPoint (takes number array as input), pContainsPoint, cContainsPoint and the like.
        * twips is an integer unit. We also prefer integer types here, since other types are pixels.
        * If one needs hairlines in drawing, they can always add 0.5 or something to result.
        * Our canvas uses special positioning and sizing, it doesn't / shouldn't use these classes for resizing. Sections can use these safely. See CanvasSectionContainer::onResize if curious.
        * Rounding errors:
            * Converting between units is never lossless. But once a variable is set, variable's unit should be consistent. For this:
                * We are using calculated variables inside the unit. For example, when pX2 is queried:
                    * We use "return pX1 + pWidth"
                    * If we used "(_x1 + _width) * app.twipsToPixels", we would have raised the possibility of inconsistency. Then below 2 may or may not be equal:
                        * object.pX1 + object.pWidth !== object.pX2 => We want these to be equal so we don't use "(_x1 + _width) * app.twipsToPixels".
                * This ensures the consistency once the variables are set, but the compound error increases (if one modifies the non-base values again and again, and again).
*/
var cool;
(function (cool) {
    // Simple point, for simple purposes.
    var SimplePoint = /** @class */ (function () {
        // Constructor uses twips.
        function SimplePoint(x, y) {
            this._x = Math.round(x);
            this._y = Math.round(y);
        }
        Object.defineProperty(SimplePoint.prototype, "x", {
            // twips.
            get: function () { return this._x; },
            set: function (x) { this._x = Math.round(x); },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SimplePoint.prototype, "y", {
            get: function () { return this._y; },
            set: function (y) { this._y = Math.round(y); },
            enumerable: false,
            configurable: true
        });
        SimplePoint.prototype.equals = function (point) { return this._x === Math.round(point[0]) && this._y === Math.round(point[1]); };
        SimplePoint.prototype.toArray = function () { return [this._x, this._y]; };
        SimplePoint.prototype.distanceTo = function (point) { return Math.sqrt(Math.pow(this._x - point[0], 2) + Math.pow(this._y - point[1], 2)); };
        Object.defineProperty(SimplePoint.prototype, "pX", {
            // Core / canvas pixel.
            get: function () { return Math.round(this._x * app.twipsToPixels); },
            set: function (x) { this._x = Math.round(x * app.pixelsToTwips); },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SimplePoint.prototype, "pY", {
            get: function () { return Math.round(this._y * app.twipsToPixels); },
            set: function (y) { this._y = Math.round(y * app.pixelsToTwips); },
            enumerable: false,
            configurable: true
        });
        SimplePoint.prototype.pEquals = function (point) { return this.pX === Math.round(point[0]) && this.pY === Math.round(point[1]); };
        SimplePoint.prototype.pToArray = function () { return [this.pX, this.pY]; };
        SimplePoint.prototype.pDistanceTo = function (point) { return Math.sqrt(Math.pow(this.pX - point[0], 2) + Math.pow(this.pY - point[1], 2)); };
        Object.defineProperty(SimplePoint.prototype, "cX", {
            // CSS pixel.
            get: function () { return Math.round(this._x * app.twipsToPixels / app.dpiScale); },
            set: function (x) { this._x = Math.round(x * app.dpiScale * app.pixelsToTwips); },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SimplePoint.prototype, "cY", {
            get: function () { return Math.round(this._y * app.twipsToPixels / app.dpiScale); },
            set: function (y) { this._y = Math.round(y * app.dpiScale * app.pixelsToTwips); },
            enumerable: false,
            configurable: true
        });
        SimplePoint.prototype.cEquals = function (point) { return this.cX === Math.round(point[0]) && this.cY === Math.round(point[1]); };
        SimplePoint.prototype.cToArray = function () { return [this.cX, this.cY]; };
        SimplePoint.prototype.cDistanceTo = function (point) { return Math.sqrt(Math.pow(this.cX - point[0], 2) + Math.pow(this.cY - point[1], 2)); };
        SimplePoint.prototype.clone = function () { return new SimplePoint(this._x, this._y); };
        return SimplePoint;
    }());
    cool.SimplePoint = SimplePoint;
    /**
     * Represents a rectangle object which works with core pixels.
     * x1 and y1 should always <= x2 and y2. In other words width >= 0 && height >= 0 is a precondition.
     * This class doesn't check for above conditions.
     */
    var SimpleRectangle = /** @class */ (function () {
        // Constructor uses twips.
        function SimpleRectangle(x, y, width, height) {
            this._x1 = Math.round(x);
            this._y1 = Math.round(y);
            this._width = Math.round(width);
            this._height = Math.round(height);
        }
        Object.defineProperty(SimpleRectangle.prototype, "x1", {
            // twips.
            get: function () { return this._x1; },
            set: function (x1) { this._x1 = Math.round(x1); },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SimpleRectangle.prototype, "y1", {
            get: function () { return this._y1; },
            set: function (y1) { this._y1 = Math.round(y1); },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SimpleRectangle.prototype, "x2", {
            get: function () { return (this._x1 + this._width); },
            set: function (x2) { this._width = Math.round(x2) - this._x1; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SimpleRectangle.prototype, "y2", {
            get: function () { return (this._y1 + this._height); },
            set: function (y2) { this._height = Math.round(y2) - this._y1; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SimpleRectangle.prototype, "width", {
            get: function () { return this._width; },
            set: function (width) { this._width = Math.round(width); },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SimpleRectangle.prototype, "height", {
            get: function () { return this._height; },
            set: function (height) { this._height = Math.round(height); },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SimpleRectangle.prototype, "area", {
            get: function () { return (this._width * this._height); },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SimpleRectangle.prototype, "center", {
            get: function () { return [(this.x1 + this.x2) / 2, (this.y1 + this.y2) / 2]; },
            enumerable: false,
            configurable: true
        });
        SimpleRectangle.prototype.toArray = function () { return [this._x1, this._y1, this._width, this._height]; };
        // twips checkers for coordinate match.
        SimpleRectangle.prototype.containsPoint = function (point) { return (Math.round(point[0]) >= this.x1 && Math.round(point[0]) <= this.x2 && Math.round(point[1]) >= this.y1 && Math.round(point[1]) <= this.y2); };
        SimpleRectangle.prototype.containsX = function (x) { return (Math.round(x) >= this.x1 && Math.round(x) <= this.x2); };
        SimpleRectangle.prototype.containsY = function (y) { return (Math.round(y) >= this.y1 && Math.round(y) <= this.y2); };
        SimpleRectangle.prototype.containsRectangle = function (rectangle) { return this.containsPoint([rectangle[0], rectangle[1]]) && this.containsPoint([rectangle[0] + rectangle[2], rectangle[1] + rectangle[3]]); };
        SimpleRectangle.prototype.intersectsRectangle = function (rectangle) {
            return app.LOUtil._doRectanglesIntersect(this.toArray(), rectangle);
        };
        SimpleRectangle.prototype.equals = function (rectangle) { return this.x1 === Math.round(rectangle[0]) && this.y1 === Math.round(rectangle[1]) && this.width === Math.round(rectangle[2]) && this.height === Math.round(rectangle[3]); };
        SimpleRectangle.prototype.moveTo = function (point) { this._x1 = Math.round(point[0]); this._y1 = Math.round(point[1]); };
        SimpleRectangle.prototype.moveBy = function (point) { this._x1 += Math.round(point[0]); this._y1 += Math.round(point[1]); };
        Object.defineProperty(SimpleRectangle.prototype, "pX1", {
            // Pixel.
            get: function () { return Math.round(this._x1 * app.twipsToPixels); },
            set: function (x1) { this._x1 = Math.round(x1 * app.pixelsToTwips); },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SimpleRectangle.prototype, "pY1", {
            get: function () { return Math.round(this._y1 * app.twipsToPixels); },
            set: function (y1) { this._y1 = Math.round(y1 * app.pixelsToTwips); },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SimpleRectangle.prototype, "pX2", {
            get: function () { return this.pX1 + this.pWidth; },
            set: function (x2) { this._width = Math.round(x2 * app.pixelsToTwips) - this._x1; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SimpleRectangle.prototype, "pY2", {
            get: function () { return this.pY1 + this.pHeight; },
            set: function (y2) { this._height = Math.round(y2 * app.pixelsToTwips) - this._y1; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SimpleRectangle.prototype, "pWidth", {
            get: function () { return Math.round(this._width * app.twipsToPixels); },
            set: function (width) { this._width = Math.round(width * app.pixelsToTwips); },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SimpleRectangle.prototype, "pHeight", {
            get: function () { return Math.round(this._height * app.twipsToPixels); },
            set: function (height) { this._height = Math.round(height * app.pixelsToTwips); },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SimpleRectangle.prototype, "pArea", {
            get: function () { return this.pWidth * this.pHeight; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SimpleRectangle.prototype, "pCenter", {
            get: function () { return [(this.pX1 + this.pX2) / 2, (this.pY1 + this.pY2) / 2]; },
            enumerable: false,
            configurable: true
        });
        SimpleRectangle.prototype.pToArray = function () { return [this.pX1, this.pY1, this.pWidth, this.pHeight]; };
        // Pixel checkers for coordinate match.
        SimpleRectangle.prototype.pContainsPoint = function (point) { return (Math.round(point[0]) >= this.pX1 && Math.round(point[0]) <= this.pX2 && Math.round(point[1]) >= this.pY1 && Math.round(point[1]) <= this.pY2); };
        SimpleRectangle.prototype.pContainsX = function (x) { return (Math.round(x) >= this.pX1 && Math.round(x) <= this.pX2); };
        SimpleRectangle.prototype.pContainsY = function (y) { return (Math.round(y) >= this.pY1 && Math.round(y) <= this.pY2); };
        SimpleRectangle.prototype.pContainsRectangle = function (rectangle) { return this.pContainsPoint([rectangle[0], rectangle[1]]) && this.pContainsPoint([rectangle[0] + rectangle[2], rectangle[1] + rectangle[3]]); };
        SimpleRectangle.prototype.pIntersectsRectangle = function (rectangle) {
            return app.LOUtil._doRectanglesIntersect(this.pToArray(), rectangle);
        };
        SimpleRectangle.prototype.pEquals = function (rectangle) { return this.pX1 === Math.round(rectangle[0]) && this.pY1 === Math.round(rectangle[1]) && this.pWidth === Math.round(rectangle[2]) && this.pHeight === Math.round(rectangle[3]); };
        SimpleRectangle.prototype.pMoveTo = function (point) { this._x1 = Math.round(point[0] * app.pixelsToTwips); this._y1 = Math.round(point[1] * app.pixelsToTwips); };
        SimpleRectangle.prototype.pMoveBy = function (point) { this._x1 += Math.round(point[0] * app.pixelsToTwips); this._y1 += Math.round(point[1] * app.pixelsToTwips); };
        Object.defineProperty(SimpleRectangle.prototype, "cX1", {
            // CSS pixel.
            get: function () { return Math.round(this._x1 * app.twipsToPixels / app.dpiScale); },
            set: function (x1) { this._x1 = Math.round(x1 * app.dpiScale * app.pixelsToTwips); },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SimpleRectangle.prototype, "cY1", {
            get: function () { return Math.round(this._y1 * app.twipsToPixels / app.dpiScale); },
            set: function (y1) { this._y1 = Math.round(y1 * app.dpiScale * app.pixelsToTwips); },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SimpleRectangle.prototype, "cX2", {
            get: function () { return this.cX1 + this.cWidth; },
            set: function (x2) { this._width = Math.round(x2 * app.dpiScale * app.pixelsToTwips); },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SimpleRectangle.prototype, "cY2", {
            get: function () { return this.cY1 + this.cHeight; },
            set: function (y2) { this._height = Math.round(y2 * app.dpiScale * app.pixelsToTwips); },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SimpleRectangle.prototype, "cWidth", {
            get: function () { return Math.round(this._width * app.twipsToPixels / app.dpiScale); },
            set: function (width) { this._width = Math.round(width * app.dpiScale * app.pixelsToTwips); },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SimpleRectangle.prototype, "cHeight", {
            get: function () { return Math.round(this._height * app.twipsToPixels / app.dpiScale); },
            set: function (height) { this._height = Math.round(height * app.dpiScale * app.pixelsToTwips); },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SimpleRectangle.prototype, "cArea", {
            get: function () { return this.cWidth * this.cHeight; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SimpleRectangle.prototype, "cCenter", {
            get: function () { return [(this.cX1 + this.cX2) / 2, (this.cY1 + this.cY2) / 2]; },
            enumerable: false,
            configurable: true
        });
        SimpleRectangle.prototype.cToArray = function () { return [this.cX1, this.cY1, this.cWidth, this.cHeight]; };
        // CSS pixel checkers for coordinate match.
        SimpleRectangle.prototype.cContainsPoint = function (point) { return (Math.round(point[0]) >= this.cX1 && Math.round(point[0]) <= this.cX2 && Math.round(point[1]) >= this.cY1 && Math.round(point[1]) <= this.cY2); };
        SimpleRectangle.prototype.cContainsX = function (x) { return (Math.round(x) >= this.cX1 && Math.round(x) <= this.cX2); };
        SimpleRectangle.prototype.cContainsY = function (y) { return (Math.round(y) >= this.cY1 && Math.round(y) <= this.cY2); };
        SimpleRectangle.prototype.cContainsRectangle = function (rectangle) { return this.cContainsPoint([rectangle[0], rectangle[1]]) && this.cContainsPoint([rectangle[0] + rectangle[2], rectangle[1] + rectangle[3]]); };
        SimpleRectangle.prototype.cIntersectsRectangle = function (rectangle) {
            return app.LOUtil._doRectanglesIntersect(this.cToArray(), rectangle);
        };
        SimpleRectangle.prototype.cEquals = function (rectangle) { return this.cX1 === Math.round(rectangle[0]) && this.cY1 === Math.round(rectangle[this.y1]) && this.cWidth === Math.round(rectangle[2]) && this.cHeight === Math.round(rectangle[3]); };
        SimpleRectangle.prototype.cMoveTo = function (point) { this._x1 = Math.round(point[0] * app.dpiScale * app.pixelsToTwips); this._y1 = Math.round(point[1] * app.dpiScale * app.pixelsToTwips); };
        SimpleRectangle.prototype.cMoveBy = function (point) { this._x1 += Math.round(point[0] * app.dpiScale * app.pixelsToTwips); this._y1 += Math.round(point[1] * app.dpiScale * app.pixelsToTwips); };
        SimpleRectangle.prototype.clone = function () { return new SimpleRectangle(this.x1, this.y1, this.width, this.height); };
        return SimpleRectangle;
    }());
    cool.SimpleRectangle = SimpleRectangle;
    /*
        We have rectangle arrays in some places. We mostly combine these arrays in order to shape the border of a selection.
        The merged result is a polygon. See ASCII art below for an example.
    
        Rectangles (2):
        ___________________
        |_________________|______
        |________________________|
    
        ^ Combined result of above rectangles is (a polygon):
        ________________
        |              |_______
        |_____________________|
    
        Give rectangles as array of rectangle arrays (x, y, width, height).
        Converter constant is used to convert the result into CSS pixels/ Core pixels or twips.
        Tolerance is used to determine if the rectangles are in the same row.
    */
    function rectanglesToPolygon(rectangles, converterConstant, tolerance) {
        /*
            Here we can create a geometric function that handles all the edge cases.
            But we don't need to.
            Conditions:
                * If the rectangles are in the same row:
                    * They should have same height.
                    * They can't have spaces between them.
                * This code doesn't take holes in the polygon into account.
            These conditions will ease our work.
            In the future, we can expand our approach if we need to.
        */
        if (converterConstant === void 0) { converterConstant = 1; }
        if (tolerance === void 0) { tolerance = 5; }
        /*
            First, determine the rows.
            Array of array of rectangles.
        */
        var rowArray = [];
        for (var i = 0; i < rectangles.length; i++) {
            var rectangle = rectangles[i];
            var found = false;
            for (var j = 0; j < rowArray.length; j++) {
                var row = rowArray[j];
                if (Math.abs(row[0][1] - rectangle[1]) <= tolerance) {
                    row.push(rectangle);
                    found = true;
                    break;
                }
            }
            if (!found) {
                rowArray.push([rectangle]);
            }
        }
        var finalRows = [];
        // Now we have rows. We will find the leftmost and rightmost points of each row and push them as rectangles.
        for (var i = 0; i < rowArray.length; i++) {
            var leftmost = rowArray[i][0][0];
            var rightmost = rowArray[i][0][0] + rowArray[i][0][2];
            for (var j = 1; j < rowArray[i].length; j++) {
                var rectangle = rowArray[i][j];
                if (rectangle[0] < leftmost) {
                    leftmost = rectangle[0];
                }
                if (rectangle[0] + rectangle[2] > rightmost) {
                    rightmost = rectangle[0] + rectangle[2];
                }
            }
            finalRows.push([leftmost, rowArray[i][0][1], rightmost - leftmost, rowArray[i][0][3]]);
        }
        // Now we need to sort the rows by y.
        for (var i = 0; i < finalRows.length; i++) {
            for (var j = i + 1; j < finalRows.length; j++) {
                if (finalRows[i][1] > finalRows[j][1]) {
                    var temp = finalRows[i];
                    finalRows[i] = finalRows[j];
                    finalRows[j] = temp;
                }
            }
        }
        // Now we need to merge the rows (the polygon).
        var polygon = [];
        for (var i = 0; i < finalRows.length; i++) { // From leftmost to bottom.
            if (i === 0) {
                // Draw top line, then continue from left to bottom.
                polygon.push(finalRows[i][0] + finalRows[i][2]);
                polygon.push(finalRows[i][1]);
                polygon.push(finalRows[i][0]);
                polygon.push(finalRows[i][1]);
                polygon.push(finalRows[i][0]);
                polygon.push(finalRows[i][1] + finalRows[i][3]);
            }
            else {
                if (finalRows[i][0] !== polygon[polygon.length - 2] || finalRows[i][1] !== polygon[polygon.length - 1]) {
                    polygon.push(finalRows[i][0]);
                    polygon.push(finalRows[i][1]);
                }
                polygon.push(finalRows[i][0]);
                polygon.push(finalRows[i][1] + finalRows[i][3]);
            }
            if (i === finalRows.length - 1) {
                // Draw bottom line.
                polygon.push(finalRows[i][0] + finalRows[i][2]);
                polygon.push(finalRows[i][1] + finalRows[i][3]);
            }
        }
        // Now we will draw from rightmost bottom to top.
        for (var i = finalRows.length - 1; i >= 0; i--) {
            if (finalRows[i][0] + finalRows[i][2] !== polygon[polygon.length - 2] || finalRows[i][1] + finalRows[i][3] !== polygon[polygon.length - 1]) {
                polygon.push(finalRows[i][0] + finalRows[i][2]);
                polygon.push(finalRows[i][1] + finalRows[i][3]);
            }
            polygon.push(finalRows[i][0] + finalRows[i][2]);
            polygon.push(finalRows[i][1]);
        }
        // That's it. We should have drawn the polygon.
        if (converterConstant !== 1) {
            for (var i = 0; i < polygon.length; i++) {
                polygon[i] = Math.round(converterConstant * polygon[i]);
            }
        }
        //return [100, 100, 200, 100, 200, 200, 100, 200]; // Test polygon (to see if caller function draws it correctly).;
        return polygon;
    }
    cool.rectanglesToPolygon = rectanglesToPolygon;
})(cool || (cool = {}));
app.definitions.simpleRectangle = cool.SimpleRectangle;
app.definitions.simplePoint = cool.SimplePoint;
//# sourceMappingURL=geometry.js.map