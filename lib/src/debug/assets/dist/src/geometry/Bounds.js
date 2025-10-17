// @ts-strict-ignore
/* -*- js-indent-level: 8 -*- */
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var cool;
(function (cool) {
    function PointConstruct(x, y, round) {
        return new L.Point(x, y, round);
    }
    function toPoint(x, y, round) {
        return L.point(x, y, round);
    }
    /// Bounds represents a rectangular area on the screen.
    var Bounds = /** @class */ (function () {
        function Bounds(a, b) {
            var e_1, _a;
            if (!a)
                return;
            // Bounds construction is called very often so it's important to avoid object construction
            // when possible. This is the reason for the amount of convolution here (that and ES6's lack
            // of multiple constructors...)
            if (b) {
                this.min = a instanceof cool.Point ? a.clone() : toPoint(a);
                var maybeMax = b instanceof cool.Point ? b.clone() : toPoint(b);
                if (maybeMax.x >= this.min.x && maybeMax.y >= this.min.y)
                    this.max = maybeMax;
                else {
                    this.max = this.min.clone();
                    this.extend(maybeMax);
                }
            }
            else
                try {
                    for (var _b = __values(a), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var point = _c.value;
                        this.extend(point);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
        }
        Bounds.parse = function (rectString) {
            if (typeof rectString !== 'string') {
                console.error('invalid input type, expected string');
                return undefined;
            }
            var rectParts = rectString.match(/\d+/g);
            if (rectParts === null || rectParts.length < 4) {
                console.error('incomplete rectangle');
                return undefined;
            }
            var refPoint1 = PointConstruct(parseInt(rectParts[0]), parseInt(rectParts[1]));
            var offset = PointConstruct(parseInt(rectParts[2]), parseInt(rectParts[3]));
            var refPoint2 = refPoint1.add(offset);
            return new Bounds(refPoint1, refPoint2);
        };
        Bounds.parseArray = function (rectListString) {
            if (typeof rectListString !== 'string') {
                console.error('invalid input type, expected string');
                return undefined;
            }
            var parts = rectListString.match(/\d+/g);
            if (parts === null || parts.length < 4) {
                return [];
            }
            var rectangles = [];
            for (var i = 0; (i + 3) < parts.length; i += 4) {
                var refPoint1 = PointConstruct(parseInt(parts[i]), parseInt(parts[i + 1]));
                var offset = PointConstruct(parseInt(parts[i + 2]), parseInt(parts[i + 3]));
                var refPoint2 = refPoint1.add(offset);
                rectangles.push(new Bounds(refPoint1, refPoint2));
            }
            return rectangles;
        };
        // extend the bounds to contain the given point
        Bounds.prototype.extend = function (pointSrc) {
            var point = toPoint(pointSrc);
            if (!this.min && !this.max) {
                this.min = point.clone();
                this.max = point.clone();
            }
            else {
                this.min.x = Math.min(point.x, this.min.x);
                this.max.x = Math.max(point.x, this.max.x);
                this.min.y = Math.min(point.y, this.min.y);
                this.max.y = Math.max(point.y, this.max.y);
            }
            return this;
        };
        Bounds.prototype.clone = function () {
            return new Bounds(this.min, this.max);
        };
        Bounds.prototype.getCenter = function (round) {
            return PointConstruct((this.min.x + this.max.x) / 2, (this.min.y + this.max.y) / 2, round);
        };
        Bounds.prototype.round = function () {
            this.min.x = Math.round(this.min.x);
            this.min.y = Math.round(this.min.y);
            this.max.x = Math.round(this.max.x);
            this.max.y = Math.round(this.max.y);
        };
        Bounds.prototype.translate = function (x, y) {
            this.min.x += x;
            this.min.y += y;
            this.max.x += x;
            this.max.y += y;
        };
        Bounds.prototype.getBottomLeft = function () {
            return PointConstruct(this.min.x, this.max.y);
        };
        Bounds.prototype.getTopRight = function () {
            return PointConstruct(this.max.x, this.min.y);
        };
        Bounds.prototype.getTopLeft = function () {
            return PointConstruct(this.min.x, this.min.y);
        };
        Bounds.prototype.getBottomRight = function () {
            return PointConstruct(this.max.x, this.max.y);
        };
        Bounds.prototype.getSize = function () {
            return this.max.subtract(this.min);
        };
        Bounds.prototype.contains = function (obj) {
            var min, max;
            var bounds;
            var point;
            if (Array.isArray(obj) || obj instanceof L.Point || obj instanceof cool.SimplePoint) {
                point = toPoint(obj);
            }
            else {
                bounds = Bounds.toBounds(obj);
            }
            if (bounds) {
                min = bounds.min;
                max = bounds.max;
            }
            else {
                min = max = point;
            }
            return (min.x >= this.min.x) &&
                (max.x <= this.max.x) &&
                (min.y >= this.min.y) &&
                (max.y <= this.max.y);
        };
        Bounds.prototype.intersects = function (boundsSrc) {
            var bounds = Bounds.toBounds(boundsSrc);
            var min = this.min;
            var max = this.max;
            var min2 = bounds.min;
            var max2 = bounds.max;
            var xIntersects = (max2.x >= min.x) && (min2.x <= max.x);
            var yIntersects = (max2.y >= min.y) && (min2.y <= max.y);
            return xIntersects && yIntersects;
        };
        Bounds.prototype.distanceTo = function (bounds) {
            var min = this.min;
            var max = this.max;
            var min2 = bounds.min;
            var max2 = bounds.max;
            var xIntersects = (max2.x >= min.x) && (min2.x <= max.x);
            var yIntersects = (max2.y >= min.y) && (min2.y <= max.y);
            if (xIntersects) {
                if (yIntersects)
                    return 0;
                if (max2.y < min.y)
                    return min.y - max2.y;
                return min2.y - max.y;
            }
            if (yIntersects) {
                if (max2.x < min.x)
                    return min.x - max2.x;
                return min2.x - max.x;
            }
            var xdist = (min.x > max2.x) ? (min.x - max2.x) : (min2.x - max.x);
            var ydist = (min.y > max2.y) ? (min.y - max2.y) : (min2.y - max.y);
            return Math.sqrt(xdist * xdist + ydist * ydist);
        };
        // non-destructive, returns a new Bounds
        Bounds.prototype.add = function (point) {
            return this.clone()._add(point);
        };
        // destructive, used directly for performance in situations where it's safe to modify existing Bounds
        Bounds.prototype._add = function (point) {
            this.min._add(point);
            this.max._add(point);
            return this;
        };
        Bounds.prototype.getPointArray = function () {
            return [
                this.getBottomLeft(), this.getBottomRight(),
                this.getTopLeft(), this.getTopRight()
            ];
        };
        Bounds.prototype.toString = function () {
            return '[' +
                this.min.toString() + ', ' +
                this.max.toString() + ']';
        };
        Bounds.prototype.isValid = function () {
            return !!(this.min && this.max);
        };
        Bounds.prototype.intersectsAny = function (boundsArray) {
            for (var i = 0; i < boundsArray.length; ++i) {
                if (boundsArray[i].intersects(this)) {
                    return true;
                }
            }
            return false;
        };
        Bounds.prototype.clampX = function (x) {
            return Math.max(this.min.x, Math.min(this.max.x, x));
        };
        Bounds.prototype.clampY = function (y) {
            return Math.max(this.min.y, Math.min(this.max.y, y));
        };
        Bounds.prototype.clamp = function (obj) {
            if (obj instanceof L.Point) {
                return PointConstruct(this.clampX(obj.x), this.clampY(obj.y));
            }
            if (obj instanceof Bounds) {
                return new Bounds(PointConstruct(this.clampX(obj.min.x), this.clampY(obj.min.y)), PointConstruct(this.clampX(obj.max.x), this.clampY(obj.max.y)));
            }
            console.error('invalid argument type');
        };
        Bounds.prototype.equals = function (bounds) {
            return this.min.equals(bounds.min) && this.max.equals(bounds.max);
        };
        Bounds.prototype.toRectangle = function () {
            return [
                this.min.x, this.min.y,
                this.max.x - this.min.x,
                this.max.y - this.min.y
            ];
        };
        Bounds.prototype.toCoreString = function () {
            return this.min.x + ', ' + this.min.y + ', ' + (this.max.x - this.min.x) + ', ' + (this.max.y - this.min.y);
        };
        Bounds.toBounds = function (a, b) {
            if (!a || a instanceof Bounds) {
                return a;
            }
            return new Bounds(a, b);
        };
        return Bounds;
    }());
    cool.Bounds = Bounds;
})(cool || (cool = {}));
L.Bounds = cool.Bounds;
L.bounds = cool.Bounds.toBounds;
//# sourceMappingURL=Bounds.js.map