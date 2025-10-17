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
var cool;
(function (cool) {
    /**
     * Represents a rectangle object which works with core pixels.
     * x1 and y1 should always <= x2 and y2. In other words width >= 0 && height >= 0 is a precondition.
     * This class doesn't check for above conditions. There is a isValid function for use when needed.
     */
    var Rectangle = /** @class */ (function () {
        function Rectangle(x, y, width, height) {
            this.x1 = x;
            this.y1 = y;
            this.width = width;
            this.height = height;
        }
        Object.defineProperty(Rectangle.prototype, "x2", {
            // convenience private getters
            get: function () {
                return this.x1 + this.width;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "y2", {
            get: function () {
                return this.y1 + this.height;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "area", {
            get: function () {
                return this.width * this.height;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "rx1", {
            // Rounded coordinates private getters
            get: function () {
                return Math.round(this.x1);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "ry1", {
            get: function () {
                return Math.round(this.y1);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "rx2", {
            get: function () {
                return Math.round(this.x2);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "ry2", {
            get: function () {
                return Math.round(this.y2);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "rwidth", {
            get: function () {
                return this.rx2 - this.rx1;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "rheight", {
            get: function () {
                return this.ry2 - this.ry1;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "rarea", {
            get: function () {
                return this.rwidth * this.rheight;
            },
            enumerable: false,
            configurable: true
        });
        Rectangle.prototype.isValid = function () {
            if (this.x1 <= this.x2 && this.y1 <= this.y2)
                return true;
            return false;
        };
        Rectangle.prototype.clone = function () {
            return new Rectangle(this.x1, this.x2, this.width, this.height);
        };
        Rectangle.prototype.containsPoint = function (x, y) {
            if (x >= this.x1 && x <= this.x2 && y >= this.y1 && y <= this.y2)
                return true;
            return false;
        };
        Rectangle.prototype.containsPixel = function (px, py) {
            if (px >= this.rx1 && px <= this.rx2 && py >= this.ry1 && py <= this.ry2)
                return true;
            return false;
        };
        Rectangle.prototype.containsXOrdinate = function (ox) {
            if (ox >= this.x1 && ox <= this.x2)
                return true;
            return false;
        };
        Rectangle.prototype.containsYOrdinate = function (oy) {
            if (oy >= this.y1 && oy <= this.y2)
                return true;
            return false;
        };
        Rectangle.prototype.containsPixelOrdinateX = function (ox) {
            if (ox >= this.rx1 && ox <= this.rx2)
                return true;
            return false;
        };
        Rectangle.prototype.containsPixelOrdinateY = function (oy) {
            if (oy >= this.ry1 && oy <= this.ry2)
                return true;
            return false;
        };
        /// Sets x1 of the rectangle without changing x2.
        Rectangle.prototype.setX1 = function (x1) {
            this.width += this.x1 - x1;
            this.x1 = x1;
        };
        /// Sets x2 of the rectangle without changing x1.
        Rectangle.prototype.setX2 = function (x2) {
            this.width = x2 - this.x1;
        };
        /// Sets y1 of the rectangle without changing y2.
        Rectangle.prototype.setY1 = function (y1) {
            this.height += this.y1 - y1;
            this.y1 = y1;
        };
        /// Sets y2 of the rectangle without changing y1.
        Rectangle.prototype.setY2 = function (y2) {
            this.height = y2 - this.y1;
        };
        /// Sets width keeping x1 constant.
        Rectangle.prototype.setWidth = function (width) {
            this.width = width;
        };
        /// Sets height keeping y1 constant.
        Rectangle.prototype.setHeight = function (height) {
            this.height = height;
        };
        /// Sets area by either keeping height or width as constant.
        Rectangle.prototype.setArea = function (area, preserveHeight) {
            if (!preserveHeight) {
                //preserve width
                var height = area / this.width;
                this.setHeight(height);
            }
            else {
                // preserve height
                var width = area / this.height;
                this.setWidth(width);
            }
        };
        /// Moves the whole rectangle by (dx, dy) by preserving width and height.
        Rectangle.prototype.moveBy = function (dx, dy) {
            this.x1 += dx;
            this.y1 += dy;
        };
        /**
         * Moves the rectangle to (x, y) as its new x1, y1 without changing
         * its size.
         */
        Rectangle.prototype.moveTo = function (x, y) {
            this.x1 = x;
            this.y1 = y;
        };
        // TODO: Following methods could be replaced with js getters
        // but we need to change their users to access getters.
        Rectangle.prototype.getX1 = function () {
            return this.x1;
        };
        Rectangle.prototype.getX2 = function () {
            return this.x2;
        };
        Rectangle.prototype.getY1 = function () {
            return this.y1;
        };
        Rectangle.prototype.getY2 = function () {
            return this.y2;
        };
        Rectangle.prototype.getWidth = function () {
            return this.width;
        };
        Rectangle.prototype.getHeight = function () {
            return this.height;
        };
        Rectangle.prototype.getArea = function () {
            return this.area;
        };
        Rectangle.prototype.getCenter = function () {
            return [(this.x2 + this.x1) / 2, (this.y2 + this.y1) / 2];
        };
        Rectangle.prototype.getPxX1 = function () {
            return this.rx1;
        };
        Rectangle.prototype.getPxX2 = function () {
            return this.rx2;
        };
        Rectangle.prototype.getPxY1 = function () {
            return this.ry1;
        };
        Rectangle.prototype.getPxY2 = function () {
            return this.ry2;
        };
        Rectangle.prototype.getPxWidth = function () {
            return this.rwidth;
        };
        Rectangle.prototype.getPxHeight = function () {
            return this.rheight;
        };
        Rectangle.prototype.getPxArea = function () {
            return this.rarea;
        };
        Rectangle.prototype.getPxCenter = function () {
            return [
                Math.round((this.rx2 + this.rx1) / 2),
                Math.round((this.ry2 + this.ry1) / 2),
            ];
        };
        return Rectangle;
    }());
    cool.Rectangle = Rectangle;
    function createRectangle(x, y, width, height) {
        return new Rectangle(x, y, width, height);
    }
    cool.createRectangle = createRectangle;
})(cool || (cool = {}));
//# sourceMappingURL=Rectangle.js.map