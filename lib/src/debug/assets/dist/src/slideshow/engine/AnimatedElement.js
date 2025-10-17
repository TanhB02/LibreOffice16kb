// @ts-strict-ignore
/* -*- tab-width: 4 -*- */
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
var NSS_SVG = 'http://www.w3.org/2000/svg';
var PropertyValueType;
(function (PropertyValueType) {
    PropertyValueType[PropertyValueType["Unknown"] = 0] = "Unknown";
    PropertyValueType[PropertyValueType["Number"] = 1] = "Number";
    PropertyValueType[PropertyValueType["Enum"] = 2] = "Enum";
    PropertyValueType[PropertyValueType["Color"] = 3] = "Color";
    PropertyValueType[PropertyValueType["String"] = 4] = "String";
    PropertyValueType[PropertyValueType["Bool"] = 5] = "Bool";
    PropertyValueType[PropertyValueType["TupleNumber"] = 6] = "TupleNumber";
})(PropertyValueType || (PropertyValueType = {}));
var PropertyOperators;
(function (PropertyOperators) {
    var GenericPropOpSet = {
        equal: function (a, b) {
            return a === b;
        },
        add: function (a, b) {
            return a;
        },
        scale: function (k, v) {
            return v;
        },
    };
    var NumberPropOpSet = {
        equal: function (a, b) {
            return a === b;
        },
        add: function (a, b) {
            return a + b;
        },
        scale: function (k, v) {
            return k * v;
        },
    };
    var TupleNumberPropOpSet = {
        equal: function (a, b) {
            assert(a.length === b.length, 'Tuples length mismatch.');
            return a.toString() === b.toString();
        },
        add: function (a, b) {
            assert(a.length === b.length, 'Tuples length mismatch.');
            var r = [];
            for (var i = 0; i < a.length; ++i) {
                r.push(a[i] + b[i]);
            }
            return r;
        },
        scale: function (k, v) {
            var r = [];
            for (var i = 0; i < v.length; ++i) {
                r.push(k * v[i]);
            }
            return r;
        },
    };
    var ColorPropOpSet = {
        equal: function (a, b) {
            return a.equal(b);
        },
        add: function (a, b) {
            var c = a.clone();
            c.add(b);
            return c;
        },
        scale: function (k, v) {
            var c = v.clone();
            c.scale(k);
            return c;
        },
    };
    PropertyOperators.aOperatorSetMap = new Map();
    PropertyOperators.aOperatorSetMap.set(PropertyValueType.Number, NumberPropOpSet);
    PropertyOperators.aOperatorSetMap.set(PropertyValueType.Enum, GenericPropOpSet);
    PropertyOperators.aOperatorSetMap.set(PropertyValueType.String, GenericPropOpSet);
    PropertyOperators.aOperatorSetMap.set(PropertyValueType.Bool, GenericPropOpSet);
    PropertyOperators.aOperatorSetMap.set(PropertyValueType.TupleNumber, TupleNumberPropOpSet);
    PropertyOperators.aOperatorSetMap.set(PropertyValueType.Color, ColorPropOpSet);
})(PropertyOperators || (PropertyOperators = {}));
var aOperatorSetMap = PropertyOperators.aOperatorSetMap;
var PropertyInterpolator;
(function (PropertyInterpolator) {
    function getInterpolator(eValueType, eValueSubType, eClockDirection) {
        switch (eValueType) {
            case PropertyValueType.Number:
                return function (nFrom, nTo, nT) {
                    return (1.0 - nT) * nFrom + nT * nTo;
                };
            case PropertyValueType.TupleNumber:
                return function (aFrom, aTo, nT) {
                    var aRes = [];
                    for (var i = 0; i < aFrom.length; ++i) {
                        aRes.push((1.0 - nT) * aFrom[i] + nT * aTo[i]);
                    }
                    return aRes;
                };
            case PropertyValueType.Color:
                if (eValueSubType !== undefined) {
                    switch (eValueSubType) {
                        case ColorSpace.rgb:
                            return function (nFrom, nTo, nT) {
                                return RGBColor.interpolate(nFrom, nTo, nT);
                            };
                        case ColorSpace.hsl: {
                            var bCCW_1 = eClockDirection == ClockDirection.counterClockwise;
                            return function (nFrom, nTo, nT) {
                                return HSLColor.interpolate(nFrom, nTo, nT, bCCW_1);
                            };
                        }
                    }
                }
                else {
                    window.app.console.log('PropertyInterpolator.getInterpolator: color space not defined.');
                }
                break;
            default:
                window.app.console.log('PropertyInterpolator.getInterpolator: not found any valid interpolator for value type ' +
                    PropertyValueType[eValueType]);
        }
        return null;
    }
    PropertyInterpolator.getInterpolator = getInterpolator;
})(PropertyInterpolator || (PropertyInterpolator = {}));
var aPropertyGetterSetterMap = {
    height: {
        type: PropertyValueType.Number,
        get: 'getHeight',
        set: 'setHeight',
        getmod: 'makeScaler( 1/nHeight )',
        setmod: 'makeScaler( nHeight)',
    },
    opacity: {
        type: PropertyValueType.Number,
        get: 'getOpacity',
        set: 'setOpacity',
    },
    scale: {
        type: PropertyValueType.TupleNumber,
        get: 'getSize',
        set: 'setSize',
    },
    translate: {
        type: PropertyValueType.TupleNumber,
        get: 'getPos',
        set: 'setPos',
    },
    rotate: {
        type: PropertyValueType.Number,
        get: 'getRotationAngle',
        set: 'setRotationAngle',
    },
    skewx: {
        type: PropertyValueType.Number,
        get: 'getSkewX',
        set: 'setSkewX',
    },
    skewy: {
        type: PropertyValueType.Number,
        get: 'getSkewY',
        set: 'setSkewY',
    },
    width: {
        type: PropertyValueType.Number,
        get: 'getWidth',
        set: 'setWidth',
        getmod: 'makeScaler( 1/nWidth )',
        setmod: 'makeScaler( nWidth)',
    },
    x: {
        type: PropertyValueType.Number,
        get: 'getX',
        set: 'setX',
        getmod: 'makeScaler( 1/nWidth )',
        setmod: 'makeScaler( nWidth)',
    },
    y: {
        type: PropertyValueType.Number,
        get: 'getY',
        set: 'setY',
        getmod: 'makeScaler( 1/nHeight )',
        setmod: 'makeScaler( nHeight)',
    },
    visibility: {
        type: PropertyValueType.Enum,
        get: 'getVisibility',
        set: 'setVisibility',
    },
    fillstyle: {
        type: PropertyValueType.String,
        get: 'getFillStyle',
        set: 'setFillStyle',
    },
    linestyle: {
        type: PropertyValueType.String,
        get: 'getLineStyle',
        set: 'setLineStyle',
    },
    fillcolor: {
        type: PropertyValueType.Color,
        get: 'getFillColor',
        set: 'setFillColor',
    },
    linecolor: {
        type: PropertyValueType.Color,
        get: 'getStrokeColor',
        set: 'setStrokeColor',
    },
    charcolor: {
        type: PropertyValueType.Color,
        get: 'getFontColor',
        set: 'setFontColor',
    },
    dimcolor: {
        type: PropertyValueType.Color,
        get: 'getDimColor',
        set: 'setDimColor',
    },
};
var TransitionFiltersManager = /** @class */ (function () {
    function TransitionFiltersManager() {
        this.filterQueue = new Array();
        this.frameInfoMap = new Map();
    }
    TransitionFiltersManager.prototype.isEmpty = function () {
        return this.filterQueue.length === 0;
    };
    TransitionFiltersManager.prototype.add = function (animation, time) {
        this.frameInfoMap.set(animation.getNodeId(), {
            animation: animation,
            time: time,
        });
        this.updateQueue(animation.getNodeId());
    };
    TransitionFiltersManager.prototype.updateQueue = function (nodeId) {
        var length = this.filterQueue.length;
        var last = this.filterQueue[length];
        if (nodeId === last)
            return;
        var index = this.filterQueue.indexOf(nodeId);
        if (index > -1) {
            // remove it
            this.filterQueue.splice(index, 1);
        }
        this.filterQueue.push(nodeId);
    };
    TransitionFiltersManager.prototype.apply = function (properties) {
        var _this = this;
        var applied = false;
        this.filterQueue.forEach(function (nodeId) {
            var frameInfo = _this.frameInfoMap.get(nodeId);
            if (frameInfo) {
                applied = true;
                ANIMDBG.print("TransitionFiltersManager.apply: node: " + nodeId);
                frameInfo.animation.renderFrame(frameInfo.time, properties);
            }
        });
        return applied;
    };
    TransitionFiltersManager.prototype.clear = function () {
        this.frameInfoMap.forEach(function (frameInfo) {
            frameInfo.animation.notifySlideEnd();
        });
        this.filterQueue = [];
        this.frameInfoMap.clear();
    };
    TransitionFiltersManager.prototype.getState = function () {
        return {
            filterQueue: structuredClone(this.filterQueue),
            frameInfoMap: new Map(this.frameInfoMap),
        };
    };
    TransitionFiltersManager.prototype.setState = function (state) {
        this.filterQueue = structuredClone(state.filterQueue);
        this.frameInfoMap = new Map(state.frameInfoMap);
    };
    return TransitionFiltersManager;
}());
function BBoxToString(aBB) {
    return "{ x: " + aBB.x + ", y: " + aBB.y + ", width: " + aBB.width + ", height: " + aBB.height + " }";
}
var AnimatedElement = /** @class */ (function () {
    function AnimatedElement(sId, slideHash, slideWidth, slideHeight) {
        this.animatedLayerInfo = null;
        this.aLayer = null;
        this.aBaseBBox = null;
        this.nBaseCenterX = 0;
        this.nBaseCenterY = 0;
        this.eAdditiveMode = AdditiveMode.Replace;
        this.aStateSet = new Map();
        this.aStateOnNextEffectSet = new Map();
        this.nScaleFactorX = 1.0;
        this.nScaleFactorY = 1.0;
        this.nRotationAngle = 0;
        this.nSkewX = 0;
        this.nSkewY = 0;
        this.aBaseFillColor = AnimatedElement.DefaultColor;
        this.aFillColor = AnimatedElement.DefaultColor;
        this.aBaseLineColor = AnimatedElement.DefaultColor;
        this.aLineColor = AnimatedElement.DefaultColor;
        this.aBaseFontColor = AnimatedElement.DefaultColor;
        this.aFontColor = AnimatedElement.DefaultColor;
        this.aDimColor = AnimatedElement.DefaultColor;
        this.aClipPath = null;
        this.runningAnimations = 0;
        // effect -> animation nodes
        this.activeAnimationNodes = new Map();
        ANIMDBG.print("AnimatedElement(" + sId + ", " + slideHash + ")");
        this.sId = sId;
        this.slideHash = slideHash;
        this.slideWidth = slideWidth;
        this.slideHeight = slideHeight;
        this.bIsValid = false;
        this.transitionFiltersManager = new TransitionFiltersManager();
        var presenter = app.map.slideShowPresenter;
        this.slideRenderer = presenter._slideRenderer;
    }
    AnimatedElement.prototype.getId = function () {
        return this.sId;
    };
    AnimatedElement.prototype.isValid = function () {
        return this.bIsValid;
    };
    AnimatedElement.prototype.isGlSupported = function () {
        return !this.tfContext.is2dGl();
    };
    AnimatedElement.prototype.isTextElement = function () {
        return false;
    };
    AnimatedElement.prototype.cloneBBox = function (aBBox) {
        if (!aBBox)
            return null;
        return new DOMRect(aBBox.x, aBBox.y, aBBox.width, aBBox.height);
    };
    AnimatedElement.prototype.createBaseElement = function (layer, bounds) {
        var canvas = new OffscreenCanvas(bounds.width, bounds.height);
        var context = canvas.getContext('2d');
        context.drawImage(layer, bounds.x, bounds.y, bounds.width, bounds.height, 0, 0, bounds.width, bounds.height);
        return canvas.transferToImageBitmap();
    };
    AnimatedElement.prototype.clone = function (aElement) {
        if (!aElement)
            return null;
        var canvas = new OffscreenCanvas(aElement.width, aElement.height);
        var context = canvas.getContext('2d');
        context.drawImage(aElement, 0, 0, canvas.width, canvas.height);
        return canvas.transferToImageBitmap();
    };
    AnimatedElement.prototype.updateCanvasSize = function (size) {
        this.canvasWidth = size[0];
        this.canvasHeight = size[1];
        this.canvasScaleFactor = {
            x: this.canvasWidth / this.slideWidth,
            y: this.canvasHeight / this.slideHeight,
        };
        console.debug("AnimatedElement.updateCanvasSize: (" + this.canvasWidth + "x" + this.canvasHeight + "), scale factor: " + this.canvasScaleFactor);
    };
    AnimatedElement.prototype.updateAnimationInfo = function (animatedLayerInfo) {
        var _a;
        if (!animatedLayerInfo) {
            // create a dummy bounding box for not break animation engine
            this.aBaseBBox = new DOMRect(0, 0, 1920, 1080);
            window.app.console.log('AnimatedElement.updateAnimationInfo: passed info is not valid');
            return;
        }
        this.animatedLayerInfo = animatedLayerInfo;
        this.aLayer = this.animatedLayerInfo.content.data;
        if (!this.aLayer) {
            window.app.console.log('AnimatedElement.updateAnimationInfo: layer not valid');
        }
        this.aBaseBBox = this.cloneBBox(this.animatedLayerInfo.bounds);
        (_a = getRectCenter(this.aBaseBBox), this.nBaseCenterX = _a.x, this.nBaseCenterY = _a.y);
        this.aBBoxInCanvas = convert(this.canvasScaleFactor, this.aBaseBBox);
        this.aBaseElement = this.createBaseElement(this.aLayer, this.aBBoxInCanvas);
        if (this.animatedLayerInfo.fillColor) {
            this.aBaseFillColor = colorParser(this.animatedLayerInfo.fillColor);
        }
        if (this.animatedLayerInfo.lineColor) {
            this.aBaseLineColor = colorParser(this.animatedLayerInfo.lineColor);
        }
        if (this.animatedLayerInfo.fontColor) {
            this.aBaseFontColor = colorParser(this.animatedLayerInfo.fontColor);
        }
        this.DBG('.updateAnimationInfo: ' +
            ("\n  aBaseBBox: " + BBoxToString(this.aBaseBBox)) +
            ("\n  aBBoxInCanvas: " + BBoxToString(this.aBBoxInCanvas)) +
            ("\n  base center: x: " + this.nBaseCenterX + " y: " + this.nBaseCenterY));
        this.bIsValid = true;
    };
    AnimatedElement.prototype.getTextureFromElement = function (element) {
        return this.tfContext.loadTexture(element);
    };
    AnimatedElement.prototype.setTransitionParameters = function (transitionParameters) {
        if (!this.tfContext) {
            var layerCompositor = this.getLayerCompositor();
            if (!layerCompositor) {
                window.app.console.error('AnimatedElement.setTransitionParameters: layer compositor is undefined');
                return;
            }
            this.tfContext = layerCompositor.getLayerRendererContext();
            if (!this.tfContext) {
                window.app.console.error('AnimatedElement.setTransitionParameters: layer renderer context is undefined');
                return;
            }
        }
        transitionParameters.context = this.tfContext;
        transitionParameters.current = null;
        transitionParameters.next = this.getTextureFromElement(this.aBaseElement);
    };
    AnimatedElement.prototype.resetProperties = function () {
        this.nCenterX = this.nBaseCenterX;
        this.nCenterY = this.nBaseCenterY;
        this.nScaleFactorX = 1.0;
        this.nScaleFactorY = 1.0;
        this.nRotationAngle = 0.0;
        this.nSkewX = 0.0;
        this.nSkewY = 0.0;
        this.aTMatrix = new DOMMatrix([1, 0, 0, 1, 0, 0]);
        this.nOpacity = 1;
        this.aFillColor = this.aBaseFillColor;
        this.aLineColor = this.aBaseLineColor;
        this.aFontColor = this.aBaseFontColor;
        this.bVisible = this.animatedLayerInfo
            ? this.animatedLayerInfo.initVisible
            : false;
        this.transitionFiltersManager.clear();
        // this.aActiveBBox = this.cloneBBox(this.aBaseBBox);
    };
    AnimatedElement.prototype.initClipPath = function () {
        this.aClipPath = document.createElementNS(NSS_SVG, 'path');
        var nWidth = this.aActiveBBox.width;
        var nHeight = this.aActiveBBox.height;
        var sPathData = 'M ' +
            this.aActiveBBox.x +
            ' ' +
            this.aActiveBBox.y +
            ' h ' +
            nWidth +
            ' v ' +
            nHeight +
            ' h -' +
            nWidth +
            ' z';
        this.aClipPath.setAttribute('d', sPathData);
    };
    AnimatedElement.prototype.cleanClipPath = function () {
        this.aClipPath = null;
    };
    AnimatedElement.prototype.getLayerCompositor = function () {
        var presenter = app.map.slideShowPresenter;
        if (presenter) {
            return presenter._slideCompositor;
        }
        return null;
    };
    AnimatedElement.prototype.applyTransitionFilters = function (properties) {
        if (this.transitionFiltersManager.isEmpty() || !this.isGlSupported()) {
            return false;
        }
        return this.transitionFiltersManager.apply(properties);
    };
    AnimatedElement.prototype.renderLayer = function (renderer) {
        if (!this.bVisible)
            return;
        if (renderer instanceof LayerRendererGl)
            this.renderLayerGl(renderer);
        else if (renderer instanceof LayerRenderer2d)
            this.renderLayer2d(renderer);
    };
    AnimatedElement.prototype.renderLayer2d = function (renderer) {
        if (renderer.isDisposed())
            return;
        var renderContext = renderer.getRenderContext();
        var renderingContext = renderContext.get2dOffscreen();
        renderingContext.save();
        // renderingContext.scale(sf.x, sf.y);
        // factor to convert from slide coordinate to canvas coordinate
        var sf = this.canvasScaleFactor;
        renderingContext.globalAlpha = this.nOpacity;
        var T = this.aTMatrix;
        var transform = new DOMMatrix([
            T.a,
            T.b,
            T.c,
            T.d,
            T.e * sf.x,
            T.f * sf.y,
        ]);
        renderingContext.setTransform(transform);
        var aElement = this.aBaseElement;
        console.debug("AnimatedElement(" + this.sId + ").renderLayer2d:\n\t\t\t\telement width: " + aElement.width + "\n\t\t\t\telement height: " + aElement.height + "\n\t\t\t\tbase center: (" + this.nBaseCenterX + ", " + this.nBaseCenterY + ")\n\t\t\t\tactual center: (" + this.nCenterX + ", " + this.nCenterY + ")\n\t\t\t\ttransform: " + transform.toString());
        // renderingContext.drawImage(
        // 	aElement,
        // 	0,
        // 	0,
        // 	aElement.width,
        // 	aElement.height,
        // 	this.aBaseBBox.x,
        // 	this.aBaseBBox.y,
        // 	this.aBaseBBox.width,
        // 	this.aBaseBBox.height,
        // );
        renderingContext.drawImage(aElement, 0, 0, aElement.width, aElement.height, this.aBBoxInCanvas.x, this.aBBoxInCanvas.y, aElement.width, aElement.height);
        renderingContext.restore();
    };
    AnimatedElement.prototype.renderLayerGl = function (renderer) {
        var e_1, _a;
        if (renderer.isDisposed())
            return;
        var T = this.aTMatrix;
        console.debug("AnimatedElement(" + this.sId + ").renderLayerGl:\n\t\t\t\telement width: " + this.aBaseElement.width + "\n\t\t\t\telement height: " + this.aBaseElement.height + "\n\t\t\t\tbase center: (" + this.nBaseCenterX + ", " + this.nBaseCenterY + ")\n\t\t\t\tactual center: (" + this.nCenterX + ", " + this.nCenterY + ")\n\t\t\t\ttransform: " + T.toString());
        var tl = new DOMPoint(this.aBaseBBox.x, this.aBaseBBox.y);
        var br = new DOMPoint(tl.x + this.aBaseBBox.width, tl.y + this.aBaseBBox.height);
        var bl = new DOMPoint(tl.x, br.y);
        var tr = new DOMPoint(br.x, tl.y);
        var unitBounds = [];
        try {
            for (var _b = __values([bl, br, tl, tr]), _c = _b.next(); !_c.done; _c = _b.next()) {
                var v = _c.value;
                var u = v.matrixTransform(T);
                u.x = u.x / this.slideWidth;
                u.y = u.y / this.slideHeight;
                unitBounds.push(u);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        // This color mapping solution doesn't work if fill and line colors have
        // the same initial value. For a proper solution we would need separated
        // layers for stroke and fill, at least when a color animation is involved.
        var colorMap = {};
        if (this.isTextElement()) {
            // On desktop, fill and line color animations seem to have no effect
            // when applied to a paragraph, so here we take into account font color
            // changes only, and we forward them to the renderer as a fill color map,
            // so that we can avoid to perform a further color comparison
            // in the fragment shader.
            if (!this.aFontColor.equal(this.aBaseFontColor)) {
                colorMap.fromFillColor = this.aBaseFontColor;
                colorMap.toFillColor = this.aFontColor;
            }
        }
        else if (!this.aFillColor.equal(this.aBaseFillColor) ||
            !this.aLineColor.equal(this.aBaseLineColor)) {
            colorMap.fromFillColor = this.aBaseFillColor;
            colorMap.toFillColor = this.aFillColor;
            colorMap.fromLineColor = this.aBaseLineColor;
            colorMap.toLineColor = this.aLineColor;
        }
        var properties = {
            bounds: unitBounds,
            alpha: this.nOpacity,
            colorMap: colorMap,
        };
        if (this.applyTransitionFilters(properties))
            return;
        renderer.drawBitmap(this.aBaseElement, properties);
    };
    AnimatedElement.prototype.notifySlideStart = function (aSlideShowContext) {
        if (!aSlideShowContext) {
            window.app.console.log('AnimatedElement.notifySlideStart: slideshow context is not valid');
        }
        this.aSlideShowContext = aSlideShowContext;
        this.runningAnimations = 0;
        this.activeAnimationNodes.clear();
        this.nCurrentEffect = undefined;
        this.aStateOnNextEffectSet.clear();
        var aAnimatedLayerInfo = this.aSlideShowContext.aSlideShowHandler.getAnimatedLayerInfo(this.slideHash, this.sId);
        this.updateAnimationInfo(aAnimatedLayerInfo);
        // this.aActiveElement = this.clone(this.aBaseElement);
        this.resetProperties();
        this.DBG('.notifySlideStart invoked');
    };
    AnimatedElement.prototype.notifySlideEnd = function () {
        this.transitionFiltersManager.clear();
    };
    AnimatedElement.prototype.notifyAnimationStart = function () {
        if (!this.isActive()) {
            this.slideRenderer.notifyAnimationStarted(this.sId);
        }
        ++this.runningAnimations;
    };
    AnimatedElement.prototype.isActive = function () {
        return this.runningAnimations > 0;
    };
    AnimatedElement.prototype.notifyAnimationEnd = function () {
        if (this.runningAnimations <= 0) {
            window.app.console.log('AnimatedElement.notifyAnimationEnd: running animations <= 0');
            return;
        }
        --this.runningAnimations;
        if (!this.isActive()) {
            this.slideRenderer.notifyAnimationEnded(this.sId);
        }
    };
    AnimatedElement.prototype.notifyNextEffectStart = function (nEffectIndex) {
        this.nCurrentEffect = nEffectIndex;
        this.activeAnimationNodes.set(this.nCurrentEffect, new Set());
    };
    // TODO remove it
    AnimatedElement.prototype.setToElement = function (aElement) {
        if (!aElement) {
            window.app.console.log('AnimatedElement(' +
                this.getId() +
                ').setToElement: element is not valid');
            return false;
        }
        this.aActiveElement = this.clone(aElement);
        return true;
    };
    /** saveState
     *  Save the state of the managed animated element and append it to aStateSet
     *  using the passed animation node id as key.
     *
     *  @param nAnimationNodeId
     *      A non negative integer representing the unique id of an animation node.
     */
    AnimatedElement.prototype.saveState = function (nAnimationNodeId) {
        ANIMDBG.print('AnimatedElement(' +
            this.getId() +
            ').saveState(' +
            nAnimationNodeId +
            ')');
        var aState = {
            nCenterX: this.nCenterX,
            nCenterY: this.nCenterY,
            nScaleFactorX: this.nScaleFactorX,
            nScaleFactorY: this.nScaleFactorY,
            nRotationAngle: this.nRotationAngle,
            nSkewX: this.nSkewX,
            nSkewY: this.nSkewY,
            aTMatrix: DOMMatrix.fromMatrix(this.aTMatrix),
            nOpacity: this.nOpacity,
            aFillColor: this.aFillColor,
            aLineColor: this.aLineColor,
            aFontColor: this.aFontColor,
            bVisible: this.bVisible,
            transitionFiltersState: this.transitionFiltersManager.getState(),
        };
        this.aStateSet.set(nAnimationNodeId, aState);
        // if it's the first animation for current effect set as the state
        // on effect started
        var currentEffectNodes = this.activeAnimationNodes.get(this.nCurrentEffect);
        if (currentEffectNodes) {
            currentEffectNodes.add(nAnimationNodeId);
            if (currentEffectNodes.size === 1)
                this.aStateOnNextEffectSet.set(this.nCurrentEffect, aState);
        }
        else {
            window.app.console.log("AnimatedElement(" + this.getId() + ").saveState(" + nAnimationNodeId + "): " +
                ("current effect not found: " + this.nCurrentEffect));
        }
    };
    /** restoreState
     *  Restore the state of the managed animated element to the state with key
     *  the passed animation node id.
     *
     *  @param nAnimationNodeId
     *      A non negative integer representing the unique id of an animation node.
     *
     *  @return
     *      True if the restoring operation is successful, false otherwise.
     */
    AnimatedElement.prototype.restoreState = function (nAnimationNodeId) {
        var _this = this;
        if (!this.aStateSet.has(nAnimationNodeId)) {
            window.app.console.log('AnimatedElement(' +
                this.getId() +
                ').restoreState: state ' +
                nAnimationNodeId +
                ' is not valid');
            return false;
        }
        ANIMDBG.print('AnimatedElement(' +
            this.getId() +
            ').restoreState(' +
            nAnimationNodeId +
            ')');
        var aState = this.aStateSet.get(nAnimationNodeId);
        this.activeAnimationNodes.forEach(function (nodes, effect, map) {
            if (nodes.has(nAnimationNodeId)) {
                nodes.delete(nAnimationNodeId);
                // if an effect has been completely removed restore the state saved
                // when effect started
                if (nodes.size === 0) {
                    map.delete(effect);
                    var state = _this.aStateOnNextEffectSet.get(effect);
                    if (state)
                        aState = state;
                    _this.aStateOnNextEffectSet.delete(effect);
                }
                return;
            }
        });
        var bRet = true;
        if (bRet) {
            this.nCenterX = aState.nCenterX;
            this.nCenterY = aState.nCenterY;
            this.nScaleFactorX = aState.nScaleFactorX;
            this.nScaleFactorY = aState.nScaleFactorY;
            this.nRotationAngle = aState.nRotationAngle;
            this.nSkewX = aState.nSkewX;
            this.nSkewY = aState.nSkewY;
            this.aTMatrix = DOMMatrix.fromMatrix(aState.aTMatrix);
            this.nOpacity = aState.nOpacity;
            this.aFillColor = aState.aFillColor;
            this.aLineColor = aState.aLineColor;
            this.aFontColor = aState.aFontColor;
            this.bVisible = aState.bVisible;
            this.transitionFiltersManager.setState(aState.transitionFiltersState);
        }
        this.aStateSet.delete(nAnimationNodeId);
        // we need to trigger at least one request animation frame for SlideRenderer.render method
        // maybe we could implement a SlideRenderer.oneShot method.
        this.notifyAnimationStart();
        this.notifyAnimationEnd();
        return bRet;
    };
    AnimatedElement.prototype.getBaseBBox = function () {
        return this.aBaseBBox;
    };
    AnimatedElement.prototype.getBaseCenterX = function () {
        return this.nBaseCenterX;
    };
    AnimatedElement.prototype.getBaseCenterY = function () {
        return this.nBaseCenterY;
    };
    AnimatedElement.prototype.applyTransform = function () {
        // empty body
    };
    AnimatedElement.prototype.getAdditiveMode = function () {
        return this.eAdditiveMode;
    };
    AnimatedElement.prototype.setAdditiveMode = function (eAdditiveMode) {
        this.eAdditiveMode = eAdditiveMode;
    };
    AnimatedElement.prototype.updateTransformationMatrix = function () {
        var aTMatrix = new DOMMatrix([1, 0, 0, 1, 0, 0]);
        var skewXAngle = (180 * Math.atan(this.nSkewX)) / Math.PI;
        var skewYAngle = (180 * Math.atan(this.nSkewY)) / Math.PI;
        aTMatrix
            .translateSelf(this.nCenterX, this.nCenterY)
            .rotateSelf(this.nRotationAngle)
            .scaleSelf(this.nScaleFactorX, this.nScaleFactorY)
            .skewXSelf(skewYAngle)
            .skewXSelf(skewXAngle)
            .translateSelf(-this.nBaseCenterX, -this.nBaseCenterY);
        this.aTMatrix = aTMatrix;
    };
    // Get/Set Properties
    AnimatedElement.prototype.getX = function () {
        return this.nCenterX;
    };
    AnimatedElement.prototype.getY = function () {
        return this.nCenterY;
    };
    AnimatedElement.prototype.getPos = function () {
        return [this.getX(), this.getY()];
    };
    AnimatedElement.prototype.getWidth = function () {
        return this.nScaleFactorX * this.getBaseBBox().width;
    };
    AnimatedElement.prototype.getHeight = function () {
        return this.nScaleFactorY * this.getBaseBBox().height;
    };
    AnimatedElement.prototype.getSize = function () {
        return [this.getWidth(), this.getHeight()];
    };
    AnimatedElement.prototype.setX = function (nNewCenterX) {
        ANIMDBG.print('AnimatedElement.setX(' + nNewCenterX + ')');
        if (nNewCenterX === this.nCenterX)
            return;
        this.nCenterX = nNewCenterX;
        this.updateTransformationMatrix();
    };
    AnimatedElement.prototype.setY = function (nNewCenterY) {
        ANIMDBG.print('AnimatedElement.setY(' + nNewCenterY + ')');
        if (nNewCenterY === this.nCenterY)
            return;
        this.nCenterY = nNewCenterY;
        this.updateTransformationMatrix();
    };
    AnimatedElement.prototype.setPos = function (aNewPos) {
        var nNewCenterX = aNewPos[0];
        var nNewCenterY = aNewPos[1];
        ANIMDBG.print('AnimatedElement.setPos(' + nNewCenterX + ', ' + nNewCenterY + ')');
        if (nNewCenterX === this.nCenterX && nNewCenterY === this.nCenterY)
            return;
        this.nCenterX = nNewCenterX;
        this.nCenterY = nNewCenterY;
        this.updateTransformationMatrix();
    };
    AnimatedElement.prototype.setWidth = function (nNewWidth) {
        ANIMDBG.print('AnimatedElement.setWidth(' + nNewWidth + ')');
        var nBaseWidth = this.getBaseBBox().width;
        var nScaleFactorX = nNewWidth / nBaseWidth;
        if (Math.abs(nScaleFactorX) < 1e-5)
            nScaleFactorX = Math.sign(nScaleFactorX) * 1e-5;
        if (nScaleFactorX == this.nScaleFactorX)
            return;
        this.nScaleFactorX = nScaleFactorX;
        this.updateTransformationMatrix();
    };
    AnimatedElement.prototype.setHeight = function (nNewHeight) {
        ANIMDBG.print('AnimatedElement.setHeight(' + nNewHeight + ')');
        var nBaseHeight = this.getBaseBBox().height;
        var nScaleFactorY = nNewHeight / nBaseHeight;
        if (Math.abs(nScaleFactorY) < 1e-5)
            nScaleFactorY = Math.sign(nScaleFactorY) * 1e-5;
        if (nScaleFactorY == this.nScaleFactorY)
            return;
        this.nScaleFactorY = nScaleFactorY;
        this.updateTransformationMatrix();
    };
    AnimatedElement.prototype.setSize = function (aNewSize) {
        var nNewWidth = aNewSize[0];
        var nNewHeight = aNewSize[1];
        ANIMDBG.print('AnimatedElement.setSize(' + nNewWidth + ', ' + nNewHeight + ')');
        var nBaseWidth = this.getBaseBBox().width;
        var nScaleFactorX = nNewWidth / nBaseWidth;
        if (Math.abs(nScaleFactorX) < 1e-5)
            nScaleFactorX = Math.sign(nScaleFactorX) * 1e-5;
        var nBaseHeight = this.getBaseBBox().height;
        var nScaleFactorY = nNewHeight / nBaseHeight;
        if (Math.abs(nScaleFactorY) < 1e-5)
            nScaleFactorY = Math.sign(nScaleFactorY) * 1e-5;
        if (nScaleFactorX == this.nScaleFactorX &&
            nScaleFactorY == this.nScaleFactorY)
            return;
        this.nScaleFactorX = nScaleFactorX;
        this.nScaleFactorY = nScaleFactorY;
        this.updateTransformationMatrix();
    };
    AnimatedElement.prototype.getOpacity = function () {
        return this.nOpacity;
    };
    AnimatedElement.prototype.setOpacity = function (nValue) {
        this.nOpacity = clampN(nValue, 0, 1);
        ANIMDBG.print('AnimatedElement.setOpacity(' + nValue + ')');
    };
    AnimatedElement.prototype.getRotationAngle = function () {
        return this.nRotationAngle;
    };
    AnimatedElement.prototype.setRotationAngle = function (nNewRotAngle) {
        this.nRotationAngle = nNewRotAngle;
        this.updateTransformationMatrix();
        ANIMDBG.print('AnimatedElement.setRotationAngle(' + nNewRotAngle + ')');
    };
    AnimatedElement.prototype.getSkewX = function () {
        return this.nSkewX;
    };
    AnimatedElement.prototype.setSkewX = function (nSkewValue) {
        this.nSkewX = nSkewValue;
        this.updateTransformationMatrix();
        ANIMDBG.print('AnimatedElement.setSkewX(' + nSkewValue + ')');
    };
    AnimatedElement.prototype.getSkewY = function () {
        return this.nSkewY;
    };
    AnimatedElement.prototype.setSkewY = function (nSkewValue) {
        this.nSkewY = nSkewValue;
        this.updateTransformationMatrix();
        ANIMDBG.print('AnimatedElement.setSkewY(' + nSkewValue + ')');
    };
    AnimatedElement.prototype.getVisibility = function () {
        return this.bVisible;
    };
    AnimatedElement.prototype.setVisibility = function (sValue) {
        this.bVisible = sValue === 'visible';
        console.debug('AnimatedElement.setVisibility(' + sValue + ')');
    };
    AnimatedElement.prototype.getFillColor = function () {
        return this.aFillColor;
    };
    AnimatedElement.prototype.setFillColor = function (aRGBValue) {
        window.app.console.log('AnimatedElement.setFillColor(' + aRGBValue.toString() + ')');
        this.aFillColor = aRGBValue;
    };
    AnimatedElement.prototype.getStrokeColor = function () {
        return this.aLineColor;
    };
    AnimatedElement.prototype.setStrokeColor = function (aRGBValue) {
        window.app.console.log('AnimatedElement.setStrokeColor(' + aRGBValue.toString() + ')');
        this.aLineColor = aRGBValue;
    };
    AnimatedElement.prototype.getFontColor = function () {
        return this.aFontColor;
    };
    AnimatedElement.prototype.setFontColor = function (aRGBValue) {
        window.app.console.log('AnimatedElement.setFontColor(' + aRGBValue.toString() + ')');
        this.aFontColor = aRGBValue;
    };
    AnimatedElement.prototype.setDefaultDimColor = function (aRGBValue) {
        window.app.console.log('AnimatedElement.setDefaultDimColor(' + aRGBValue.toString() + ')');
        this.aDimColor = aRGBValue;
    };
    AnimatedElement.prototype.getDimColor = function () {
        return this.aDimColor;
    };
    AnimatedElement.prototype.setDimColor = function (aRGBValue) {
        window.app.console.log('AnimatedElement.setDimColor(' + aRGBValue.toString() + ')');
        this.aDimColor = aRGBValue;
        this.aLineColor = aRGBValue;
        this.aFillColor = aRGBValue;
        this.aFontColor = aRGBValue;
    };
    AnimatedElement.prototype.getFillStyle = function () {
        return 'solid';
    };
    AnimatedElement.prototype.setFillStyle = function (sValue) {
        window.app.console.log('AnimatedElement.setFillStyle(' + sValue + ') not implemented');
    };
    AnimatedElement.prototype.getLineStyle = function () {
        return 'solid';
    };
    AnimatedElement.prototype.setLineStyle = function (sValue) {
        window.app.console.log('AnimatedElement.setLineStyle(' + sValue + ') not implemented');
    };
    AnimatedElement.prototype.setClipPath = function (aClipPath) {
        // TODO: maybe we can reuse the path for creating a texture mask
        if (this.aClipPath) {
            // We need to translate the clip path to the top left corner of
            // the element bounding box.
            // var aTranslation = SVGIdentityMatrix.translate( this.aActiveBBox.x,
            // 	this.aActiveBBox.y);
            // aClipPath.matrixTransform( aTranslation );
            var sPathData = aClipPath.getAttribute('d');
            this.aClipPath.setAttribute('d', sPathData);
        }
    };
    AnimatedElement.prototype.setTransitionFilterFrame = function (aTransitionFilterAnimation, nT) {
        this.transitionFiltersManager.add(aTransitionFilterAnimation, nT);
    };
    AnimatedElement.prototype.DBG = function (sMessage, nTime) {
        aAnimatedElementDebugPrinter.print('AnimatedElement(' + this.getId() + ')' + sMessage, nTime);
    };
    AnimatedElement.DefaultColor = new RGBColor(0, 0, 0);
    AnimatedElement.SupportedProperties = new Set([
        'x',
        'y',
        'width',
        'height',
        'opacity',
        'visibility',
        'rotate',
        'skewx',
        'skewy',
        'fillstyle',
        'linestyle',
        'fillcolor',
        'linecolor',
        'charcolor',
        'dimcolor',
    ]);
    AnimatedElement.SupportedTransformations = new Set([
        'translate',
        'scale',
        'rotate',
    ]);
    return AnimatedElement;
}());
var AnimatedTextElement = /** @class */ (function (_super) {
    __extends(AnimatedTextElement, _super);
    function AnimatedTextElement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AnimatedTextElement.prototype.isTextElement = function () {
        return true;
    };
    return AnimatedTextElement;
}(AnimatedElement));
//# sourceMappingURL=AnimatedElement.js.map