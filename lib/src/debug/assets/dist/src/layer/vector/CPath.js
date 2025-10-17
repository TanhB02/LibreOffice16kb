// @ts-strict-ignore
/* -*- js-indent-level: 8 -*- */
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
/*
 * CPath is the base class for all vector paths like polygons and circles used to draw overlay
 * objects like cell-cursors, cell-selections etc.
 */
var CPath = /** @class */ (function (_super) {
    __extends(CPath, _super);
    function CPath(options) {
        var _this = _super.call(this) || this;
        _this.name = '';
        _this.stroke = true;
        _this.color = '#3388ff';
        _this.weight = 3;
        _this.opacity = 1;
        _this.lineCap = 'round';
        _this.lineJoin = 'round';
        _this.fill = false;
        _this.fillGradient = false;
        _this.fillColor = _this.color;
        _this.fillOpacity = 0.2;
        _this.fillRule = 'evenodd';
        _this.interactive = true;
        _this.fixed = false; // CPath coordinates are the same as overlay section coordinates.
        _this.thickness = 2;
        _this.viewId = -1;
        _this.groupType = PathGroupType.Other;
        _this.radius = 0;
        _this.radiusY = 0;
        _this.zIndex = 0;
        _this.isDeleted = false;
        _this.renderer = null;
        _this.underMouse = false;
        _this.popupHandlersAdded = false;
        _this.setStyleOptions(options);
        _this.radius = options.radius !== undefined ? options.radius : _this.radius;
        _this.radiusY = options.radiusY !== undefined ? options.radiusY : _this.radiusY;
        _this.point = options.point !== undefined ? options.point : _this.point;
        _this.toCompatUnits = options.toCompatUnits !== undefined ? options.toCompatUnits : _this.toCompatUnits;
        _this.viewId = CPath.getViewId(options);
        if (options.groupType !== undefined)
            _this.groupType = options.groupType;
        CPath.countObjects += 1;
        _this.id = CPath.countObjects;
        _this.zIndex = _this.id;
        _this.addSupportedEvents(['popupopen', 'popupclose']);
        return _this;
    }
    CPath.getViewId = function (options) {
        if (options.viewId === undefined || options.viewId === null) // Own cell cursor/selection
            return -1;
        else
            return parseInt(options.viewId);
    };
    CPath.prototype.setStyleOptions = function (options) {
        this.name = options.name !== undefined ? options.name : this.name;
        this.stroke = options.stroke !== undefined ? options.stroke : this.stroke;
        this.color = options.color !== undefined ? options.color : this.color;
        this.weight = options.weight !== undefined ? options.weight : this.weight;
        this.opacity = options.opacity !== undefined ? options.opacity : this.opacity;
        this.lineCap = options.lineCap !== undefined ? options.lineCap : this.lineCap;
        this.lineJoin = options.lineJoin !== undefined ? options.lineJoin : this.lineJoin;
        this.fill = options.fill !== undefined ? options.fill : this.fill;
        this.fillColor = options.fillColor !== undefined ? options.fillColor : this.fillColor;
        this.fillOpacity = options.fillOpacity !== undefined ? options.fillOpacity : this.fillOpacity;
        this.fillRule = options.fillRule !== undefined ? options.fillRule : this.fillRule;
        this.cursorType = options.cursorType !== undefined ? options.cursorType : this.cursorType;
        this.thickness = options.thickness !== undefined ? options.thickness : this.thickness;
        this.interactive = options.interactive !== undefined ? options.interactive : this.interactive;
        this.fixed = options.fixed !== undefined ? options.fixed : this.fixed;
    };
    CPath.prototype.setRenderer = function (rendererObj) {
        this.renderer = rendererObj;
        if (this.renderer) {
            this.addPathTestDiv();
        }
        this.fire('add', {});
    };
    // Adds a div for cypress-tests (if active) for this CPath if not already done.
    CPath.prototype.addPathTestDiv = function () {
        var testContainer = this.renderer.getTestDiv();
        if (testContainer && !this.testDiv) {
            this.testDiv = document.createElement('div');
            this.testDiv.id = 'test-div-overlay-' + this.name;
            testContainer.appendChild(this.testDiv);
        }
    };
    // Used by cypress tests to assert on the bounds of CPaths.
    CPath.prototype.updateTestData = function () {
        if (!this.testDiv)
            return;
        var bounds = this.getBounds();
        if (this.empty() || !bounds.isValid()) {
            this.testDiv.innerText = '{}';
            return;
        }
        var topLeft = bounds.getTopLeft();
        var size = bounds.getSize();
        this.testDiv.innerText = JSON.stringify({
            top: Math.round(topLeft.y),
            left: Math.round(topLeft.x),
            width: Math.round(size.x),
            height: Math.round(size.y)
        });
    };
    CPath.prototype.getId = function () {
        return this.id;
    };
    CPath.prototype.setDeleted = function () {
        this.fire('remove', {});
        this.isDeleted = true;
        if (this.testDiv) {
            this.testDiv.remove();
            this.testDiv = undefined;
        }
    };
    CPath.prototype.isUnderMouse = function () {
        return this.underMouse;
    };
    CPath.prototype.setUnderMouse = function (isUnder) {
        this.underMouse = isUnder;
    };
    CPath.prototype.onMouseEnter = function (position) {
        this.fire('mouseenter', { position: position });
    };
    CPath.prototype.onMouseLeave = function (position) {
        this.fire('mouseleave', { position: position });
    };
    CPath.prototype.redraw = function (oldBounds) {
        if (this.renderer)
            this.renderer.updatePath(this, oldBounds);
    };
    CPath.prototype.setStyle = function (style) {
        var oldBounds = this.getBounds();
        this.setStyleOptions(style);
        if (this.renderer) {
            this.renderer.updateStyle(this, oldBounds);
        }
    };
    CPath.prototype.updatePathAllPanes = function (paintArea) {
        var e_1, _a;
        var viewBounds = this.renderer.getBounds().clone();
        if (this.fixed) {
            // Ignore freeze-panes.
            var fixedMapArea = new cool.Bounds(new cool.Point(0, 0), viewBounds.getSize());
            this.updatePath(fixedMapArea, fixedMapArea);
            this.updateTestData();
            return;
        }
        var splitPanesContext = this.renderer.getSplitPanesContext();
        var paneBoundsList = splitPanesContext ?
            splitPanesContext.getPxBoundList() :
            [viewBounds];
        var maxXBound = 0;
        var maxYBound = 0;
        try {
            for (var paneBoundsList_1 = __values(paneBoundsList), paneBoundsList_1_1 = paneBoundsList_1.next(); !paneBoundsList_1_1.done; paneBoundsList_1_1 = paneBoundsList_1.next()) {
                var paneBounds = paneBoundsList_1_1.value;
                maxXBound = Math.max(maxXBound, paneBounds.min.x);
                maxYBound = Math.max(maxYBound, paneBounds.min.y);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (paneBoundsList_1_1 && !paneBoundsList_1_1.done && (_a = paneBoundsList_1.return)) _a.call(paneBoundsList_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        for (var i = 0; i < paneBoundsList.length; ++i) {
            var panePaintArea = paintArea ? paintArea.clone() : paneBoundsList[i].clone();
            var paneArea = paneBoundsList[i];
            if (paintArea) {
                if (!paneArea.intersects(panePaintArea))
                    continue;
                panePaintArea.min.x = Math.max(panePaintArea.min.x, paneArea.min.x);
                panePaintArea.min.y = Math.max(panePaintArea.min.y, paneArea.min.y);
                panePaintArea.max.x = Math.min(panePaintArea.max.x, paneArea.max.x);
                panePaintArea.max.y = Math.min(panePaintArea.max.y, paneArea.max.y);
            }
            var freezeX = void 0;
            var freezeY = void 0;
            if (paneArea.min.x === 0 && maxXBound !== 0) {
                freezeX = true;
            }
            else {
                freezeX = false;
            }
            if (paneArea.min.y === 0 && maxYBound !== 0) {
                freezeY = true;
            }
            else {
                freezeY = false;
            }
            this.updatePath(panePaintArea, paneArea, { freezeX: freezeX, freezeY: freezeY });
        }
        this.updateTestData();
    };
    CPath.prototype.updatePath = function (paintArea, paneBounds, freezePane) {
        // Overridden in implementations.
    };
    CPath.prototype.bringToFront = function () {
        if (this.renderer) {
            this.renderer.bringToFront(this);
        }
    };
    CPath.prototype.bringToBack = function () {
        if (this.renderer) {
            this.renderer.bringToBack(this);
        }
    };
    CPath.prototype.getBounds = function () {
        // Overridden in implementations.
        return undefined;
    };
    CPath.prototype.empty = function () {
        // Overridden in implementations.
        return true;
    };
    CPath.prototype.getParts = function () {
        // Overridden in implementations.
        return Array();
    };
    CPath.prototype.clickTolerance = function () {
        // used when doing hit detection for Canvas layers
        return ((this.stroke ? this.weight / 2 : 0) +
            (window.touch.currentlyUsingTouchscreen()
                ? 10
                : 0));
    };
    CPath.prototype.setCursorType = function (cursorType) {
        // TODO: Implement this using move-move + hover handler.
        this.cursorType = cursorType;
    };
    CPath.prototype.onResize = function () {
        // Overridden in implementations.
    };
    CPath.prototype.getMap = function () {
        if (this.renderer) {
            return this.renderer.getMap();
        }
    };
    CPath.countObjects = 0;
    return CPath;
}(CEventsHandler));
// This also defines partial rendering order.
var PathGroupType;
(function (PathGroupType) {
    PathGroupType[PathGroupType["CellSelection"] = 0] = "CellSelection";
    PathGroupType[PathGroupType["TextSelection"] = 1] = "TextSelection";
    PathGroupType[PathGroupType["CellCursor"] = 2] = "CellCursor";
    PathGroupType[PathGroupType["Other"] = 3] = "Other"; // top.
})(PathGroupType || (PathGroupType = {}));
var CPathGroup = /** @class */ (function () {
    function CPathGroup(paths) {
        this.paths = paths;
    }
    CPathGroup.prototype.forEach = function (callback) {
        this.paths.forEach(callback);
    };
    CPathGroup.prototype.push = function (path) {
        this.paths.push(path);
    };
    return CPathGroup;
}());
//# sourceMappingURL=CPath.js.map