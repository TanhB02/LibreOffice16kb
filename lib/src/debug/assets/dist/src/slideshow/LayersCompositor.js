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
var LayersCompositor = /** @class */ (function (_super) {
    __extends(LayersCompositor, _super);
    function LayersCompositor(slideShowPresenter, metaPres) {
        var _this = _super.call(this, slideShowPresenter) || this;
        _this.metaPresentation = metaPres;
        return _this;
    }
    LayersCompositor.prototype._addHooks = function () {
        this.layerDrawing = new SlideShow.LayerDrawing(app.map, this);
        this.layerDrawing.addHooks();
    };
    LayersCompositor.prototype.removeHooks = function () {
        this.layerDrawing.removeHooks();
    };
    LayersCompositor.prototype.fetchAndRun = function (slideNumber, callback) {
        var _this = this;
        _super.prototype.fetchAndRun.call(this, slideNumber, callback);
        this.layerDrawing.requestSlide(this._initialSlideNumber, function () {
            var oldCallback = _this._onGotSlideCallback;
            _this._onGotSlideCallback = null;
            oldCallback();
        });
    };
    LayersCompositor.prototype.getSlideInfo = function (slideHash) {
        return this.metaPresentation.getSlideInfo(slideHash);
    };
    LayersCompositor.prototype.onUpdatePresentationInfo = function () {
        this.layerDrawing.onUpdatePresentationInfo();
        // TODO: optimize
        this.layerDrawing.invalidateAll();
    };
    LayersCompositor.prototype.getSlideHash = function (slideIndex) {
        return this.metaPresentation.getSlideHash(slideIndex);
    };
    LayersCompositor.prototype.getAnimatedElement = function (slideHash, animatedElementHash) {
        var metaSlide = this.metaPresentation.getMetaSlide(slideHash);
        if (!metaSlide) {
            window.app.console.log('LayersCompositor.getAnimatedElement: failed to retrieve meta slide for hash: ' +
                slideHash);
            return;
        }
        if (metaSlide.animationsHandler) {
            var animElemMap = metaSlide.animationsHandler.getAnimatedElementMap();
            return animElemMap.get(animatedElementHash);
        }
    };
    LayersCompositor.prototype.getSlideSizePixel = function () {
        return [
            app.twipsToPixels * this.metaPresentation.slideWidth,
            app.twipsToPixels * this.metaPresentation.slideHeight,
        ];
    };
    LayersCompositor.prototype.computeLayerResolution = function (width, height) {
        width *= 1.2;
        height *= 1.2;
        var resolutionWidth = 960;
        var resolutionHeight = 540;
        if (width > 3840 || height > 2160) {
            resolutionWidth = 3840;
            resolutionHeight = 2160;
        }
        else if (width > 2560 || height > 1440) {
            resolutionWidth = 2560;
            resolutionHeight = 1440;
        }
        else if (width > 1920 || height > 1080) {
            resolutionWidth = 1920;
            resolutionHeight = 1080;
        }
        else if (width > 1280 || height > 720) {
            resolutionWidth = 1280;
            resolutionHeight = 720;
        }
        return [resolutionWidth, resolutionHeight];
    };
    LayersCompositor.prototype.computeLayerSize = function (width, height) {
        // compute the slide size in pixel with respect to the current resolution
        var slideWidth = this.metaPresentation.slideWidth;
        var slideHeight = this.metaPresentation.slideHeight;
        var slideRatio = slideWidth / slideHeight;
        var resolutionRatio = width / height;
        if (slideRatio > resolutionRatio) {
            height = Math.trunc((width * slideHeight) / slideWidth);
        }
        else if (slideRatio < resolutionRatio) {
            width = Math.trunc((height * slideWidth) / slideHeight);
        }
        return [width, height];
    };
    // return [width, height]
    LayersCompositor.prototype.getCanvasSize = function () {
        return this.layerDrawing.getCanvasSize();
    };
    LayersCompositor.prototype.getSlide = function (slideNumber) {
        return this.layerDrawing.getSlide(slideNumber);
    };
    LayersCompositor.prototype.getLayerRendererContext = function () {
        return this.layerDrawing.getLayerRendererContext();
    };
    LayersCompositor.prototype.getVideoRenderer = function (slideHash, videoInfo) {
        return this.layerDrawing.getVideoRenderer(slideHash, videoInfo);
    };
    LayersCompositor.prototype.getAnimatedSlide = function (slideIndex) {
        return this.layerDrawing.getAnimatedSlide(slideIndex);
    };
    LayersCompositor.prototype.getAnimatedLayerInfo = function (slideHash, targetElement) {
        return this.layerDrawing.getAnimatedLayerInfo(slideHash, targetElement);
    };
    LayersCompositor.prototype.getLayerImage = function (slideHash, targetElement) {
        return this.layerDrawing.getLayerImage(slideHash, targetElement);
    };
    LayersCompositor.prototype.getLayerBounds = function (slideHash, targetElement) {
        return this.layerDrawing.getLayerBounds(slideHash, targetElement);
    };
    LayersCompositor.prototype.isSlideShowPlaying = function () {
        return this._slideShowPresenter._checkAlreadyPresenting();
    };
    LayersCompositor.prototype.deleteResources = function () {
        this.layerDrawing.deleteResources();
    };
    LayersCompositor.prototype.pauseVideos = function (slideHash) {
        this.layerDrawing.pauseVideos(slideHash);
    };
    LayersCompositor.prototype.notifyTransitionStart = function () {
        this.layerDrawing.notifyTransitionStart();
    };
    LayersCompositor.prototype.notifyTransitionEnd = function (slideHash) {
        this.layerDrawing.notifyTransitionEnd(slideHash);
    };
    return LayersCompositor;
}(SlideCompositor));
SlideShow.LayersCompositor = LayersCompositor;
//# sourceMappingURL=LayersCompositor.js.map