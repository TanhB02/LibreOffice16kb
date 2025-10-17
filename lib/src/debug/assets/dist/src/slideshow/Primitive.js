/* -*- js-indent-level: 8 -*- */
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var Primitive = /** @class */ (function () {
    function Primitive() {
        this.vertices = [];
        this.operations = [];
    }
    Primitive.cloneDeep = function (oldPrimitive) {
        var newPrimitive = new Primitive();
        newPrimitive.vertices = __spreadArray([], __read(oldPrimitive.vertices), false);
        newPrimitive.operations = oldPrimitive.operations.map(function (operation) {
            return operation;
        });
        return newPrimitive;
    };
    Primitive.prototype.pushTriangle = function (slideLocation0, slideLocation1, slideLocation2) {
        var verts = [];
        var texs = [];
        verts.push([2 * slideLocation0[0] - 1, -2 * slideLocation0[1] + 1, 0.0]);
        verts.push([2 * slideLocation1[0] - 1, -2 * slideLocation1[1] + 1, 0.0]);
        verts.push([2 * slideLocation2[0] - 1, -2 * slideLocation2[1] + 1, 0.0]);
        var normal = this.cross(this.subtract(verts[0], verts[1]), this.subtract(verts[1], verts[2]));
        var isFacingUs = normal[2] >= 0.0;
        if (isFacingUs) {
            texs.push(slideLocation0);
            texs.push(slideLocation1);
            texs.push(slideLocation2);
        }
        else {
            texs.push(slideLocation0);
            texs.push(slideLocation2);
            texs.push(slideLocation1);
            verts = [];
            verts.push([2 * slideLocation0[0] - 1, -2 * slideLocation0[1] + 1, 0.0]);
            verts.push([2 * slideLocation2[0] - 1, -2 * slideLocation2[1] + 1, 0.0]);
            verts.push([2 * slideLocation1[0] - 1, -2 * slideLocation1[1] + 1, 0.0]);
        }
        this.vertices.push({ position: verts[0], normal: [0, 0, 1], texCoord: texs[0] }, { position: verts[1], normal: [0, 0, 1], texCoord: texs[1] }, { position: verts[2], normal: [0, 0, 1], texCoord: texs[2] });
    };
    Primitive.prototype.getVertex = function (n) {
        return this.vertices[n].position;
    };
    Primitive.prototype.subtract = function (a, b) {
        return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    };
    Primitive.prototype.cross = function (a, b) {
        return [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0],
        ];
    };
    Primitive.prototype.clear = function () {
        this.operations = [];
    };
    return Primitive;
}());
SlideShow.Primitive = Primitive;
//# sourceMappingURL=Primitive.js.map