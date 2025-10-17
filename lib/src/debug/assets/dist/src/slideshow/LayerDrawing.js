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
var LayerDrawing = /** @class */ (function () {
    function LayerDrawing(mapObj, helper) {
        this.map = null;
        this.slideCache = new SlideCache();
        this.requestedSlideHash = null;
        this.prefetchedSlideHash = null;
        this.nextRequestedSlideHash = null;
        this.nextPrefetchedSlideHash = null;
        this.slideRequestTimeout = null;
        this.resolutionWidth = 960;
        this.resolutionHeight = 540;
        this.canvasWidth = 0;
        this.canvasHeight = 0;
        this.backgroundChecksums = new Map();
        this.cachedBackgrounds = new Map();
        this.cachedMasterPages = new Map();
        this.cachedDrawPages = new Map();
        this.cachedTextFields = new Map();
        this.slideTextFieldsMap = new Map();
        this.offscreenCanvas = null;
        this.onSlideRenderingCompleteCallback = null;
        this.videoRenderers = new Map();
        this.isTransitionActive = false;
        this.queuedLayers = [];
        this.map = mapObj;
        this.helper = helper;
    }
    LayerDrawing.prototype.addHooks = function () {
        this.map.on('slidelayer', this.onSlideLayerMsg, this);
        this.map.on('sliderenderingcomplete', this.onSlideRenderingComplete, this);
    };
    LayerDrawing.prototype.removeHooks = function () {
        this.map.off('slidelayer', this.onSlideLayerMsg, this);
        this.map.off('sliderenderingcomplete', this.onSlideRenderingComplete, this);
    };
    LayerDrawing.prototype.isDisposed = function () {
        return this.layerRenderer && this.layerRenderer.isDisposed();
    };
    LayerDrawing.prototype.deleteResources = function () {
        this.requestedSlideHash = null;
        this.prefetchedSlideHash = null;
        this.nextRequestedSlideHash = null;
        this.nextPrefetchedSlideHash = null;
        this.deleteVideosResources();
        this.layerRenderer.dispose();
    };
    LayerDrawing.prototype.getSlideInfo = function (slideHash) {
        return this.helper.getSlideInfo(slideHash);
    };
    LayerDrawing.prototype.getSlide = function (slideNumber) {
        var startSlideHash = this.helper.getSlideHash(slideNumber);
        return this.slideCache.get(startSlideHash);
    };
    LayerDrawing.prototype.getLayerBounds = function (slideHash, targetElement) {
        var layers = this.cachedDrawPages.get(slideHash);
        if (!layers)
            return null;
        for (var i in layers) {
            var animatedInfo = layers[i].content;
            if (animatedInfo &&
                animatedInfo.hash === targetElement &&
                animatedInfo.content)
                return animatedInfo.bounds;
        }
        return null;
    };
    LayerDrawing.prototype.getAnimatedSlide = function (slideIndex) {
        console.debug('LayerDrawing.getAnimatedSlide: slide index: ' + slideIndex);
        var slideHash = this.helper.getSlideHash(slideIndex);
        this.composeLayers(slideHash);
        return this.offscreenCanvas.transferToImageBitmap();
    };
    LayerDrawing.prototype.composeLayers = function (slideHash) {
        if (this.isDisposed())
            return;
        this.drawBackground(slideHash);
        this.drawMasterPage(slideHash);
        this.drawDrawPage(slideHash);
        this.drawVideos(slideHash);
    };
    LayerDrawing.prototype.handleVideos = function (slideHash) {
        var slideInfo = this.getSlideInfo(slideHash);
        var videosInfo = slideInfo.videos;
        if (!videosInfo || videosInfo.length === 0)
            return;
        this.videoRenderers.set(slideHash, []);
        if (!this.layerRenderer.getRenderContext().is2dGl() &&
            !VideoRendererGl.videoProgramInitialized) {
            VideoRendererGl.createProgram(this.layerRenderer.getRenderContext());
        }
        for (var i = 0; i < videosInfo.length; ++i) {
            var videoInfo = videosInfo[i];
            this.handleVideo(i, slideHash, videoInfo);
        }
    };
    LayerDrawing.prototype.handleVideo = function (index, slideHash, videoInfo) {
        var slideShowPresenter = app.map.slideShowPresenter;
        var slideRenderer = slideShowPresenter._slideRenderer;
        var metaPres = slideShowPresenter._metaPresentation;
        var videoId = slideHash + index;
        var videoRenderer = makeVideoRenderer(videoId, this.layerRenderer.getRenderContext(), slideRenderer);
        videoRenderer.prepareVideo(videoInfo, metaPres.docWidth, metaPres.docHeight);
        this.videoRenderers.get(slideHash).push(videoRenderer);
    };
    LayerDrawing.prototype.drawVideos = function (slideHash) {
        var e_1, _a;
        var videoRenderers = this.videoRenderers.get(slideHash);
        if (!videoRenderers)
            return;
        try {
            for (var videoRenderers_1 = __values(videoRenderers), videoRenderers_1_1 = videoRenderers_1.next(); !videoRenderers_1_1.done; videoRenderers_1_1 = videoRenderers_1.next()) {
                var videoRenderer = videoRenderers_1_1.value;
                videoRenderer.render();
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (videoRenderers_1_1 && !videoRenderers_1_1.done && (_a = videoRenderers_1.return)) _a.call(videoRenderers_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    LayerDrawing.prototype.loadVideos = function (slideHash) {
        var e_2, _a;
        var videoRenderers = this.videoRenderers.get(slideHash);
        if (!videoRenderers)
            return;
        try {
            for (var videoRenderers_2 = __values(videoRenderers), videoRenderers_2_1 = videoRenderers_2.next(); !videoRenderers_2_1.done; videoRenderers_2_1 = videoRenderers_2.next()) {
                var videoRenderer = videoRenderers_2_1.value;
                videoRenderer.loadVideo();
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (videoRenderers_2_1 && !videoRenderers_2_1.done && (_a = videoRenderers_2.return)) _a.call(videoRenderers_2);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    LayerDrawing.prototype.pauseVideos = function (slideHash) {
        var e_3, _a;
        var videoRenderers = this.videoRenderers.get(slideHash);
        if (!videoRenderers)
            return;
        try {
            for (var videoRenderers_3 = __values(videoRenderers), videoRenderers_3_1 = videoRenderers_3.next(); !videoRenderers_3_1.done; videoRenderers_3_1 = videoRenderers_3.next()) {
                var videoRenderer = videoRenderers_3_1.value;
                videoRenderer.pauseVideo();
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (videoRenderers_3_1 && !videoRenderers_3_1.done && (_a = videoRenderers_3.return)) _a.call(videoRenderers_3);
            }
            finally { if (e_3) throw e_3.error; }
        }
    };
    LayerDrawing.prototype.getVideoRenderer = function (slideHash, videoInfo) {
        var e_4, _a;
        var videoRenderers = this.videoRenderers.get(slideHash);
        try {
            for (var videoRenderers_4 = __values(videoRenderers), videoRenderers_4_1 = videoRenderers_4.next(); !videoRenderers_4_1.done; videoRenderers_4_1 = videoRenderers_4.next()) {
                var videoRenderer = videoRenderers_4_1.value;
                if (videoRenderer.videoInfoId === videoInfo.id) {
                    return videoRenderer;
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (videoRenderers_4_1 && !videoRenderers_4_1.done && (_a = videoRenderers_4.return)) _a.call(videoRenderers_4);
            }
            finally { if (e_4) throw e_4.error; }
        }
    };
    LayerDrawing.prototype.deleteVideosResources = function () {
        this.videoRenderers.forEach(function (videoRenderers) {
            var e_5, _a;
            try {
                for (var videoRenderers_5 = __values(videoRenderers), videoRenderers_5_1 = videoRenderers_5.next(); !videoRenderers_5_1.done; videoRenderers_5_1 = videoRenderers_5.next()) {
                    var videoRenderer = videoRenderers_5_1.value;
                    videoRenderer.deleteResources();
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (videoRenderers_5_1 && !videoRenderers_5_1.done && (_a = videoRenderers_5.return)) _a.call(videoRenderers_5);
                }
                finally { if (e_5) throw e_5.error; }
            }
        });
        VideoRendererGl.deleteProgram(this.layerRenderer.getRenderContext());
    };
    LayerDrawing.prototype.getAnimatedLayerInfo = function (slideHash, targetElement) {
        console.debug("LayerDrawing.getAnimatedLayerInfo(" + slideHash + ", " + targetElement + ")");
        var layers = this.cachedDrawPages.get(slideHash);
        if (!layers)
            return null;
        for (var i in layers) {
            var animatedInfo = layers[i].content;
            if (animatedInfo && animatedInfo.hash === targetElement)
                return animatedInfo;
        }
        return null;
    };
    LayerDrawing.prototype.getLayerImage = function (slideHash, targetElement) {
        var layers = this.cachedDrawPages.get(slideHash);
        if (!layers)
            return null;
        for (var i in layers) {
            var animatedInfo = layers[i].content;
            if (animatedInfo &&
                animatedInfo.hash === targetElement &&
                animatedInfo.content)
                return animatedInfo.content.data;
        }
        return null;
    };
    LayerDrawing.prototype.invalidateAll = function () {
        this.slideCache.invalidateAll();
        this.slideTextFieldsMap.clear();
        this.cachedTextFields.clear();
        this.cachedBackgrounds.clear();
        this.cachedMasterPages.clear();
        this.cachedDrawPages.clear();
        this.videoRenderers.clear();
    };
    LayerDrawing.prototype.getCanvasSize = function () {
        return [this.canvasWidth, this.canvasHeight];
    };
    LayerDrawing.prototype.onUpdatePresentationInfo = function () {
        this.computeInitialResolution();
        this.initializeCanvas();
    };
    LayerDrawing.prototype.requestSlide = function (slideNumber, callback) {
        this.onSlideRenderingCompleteCallback = callback;
        var startSlideHash = this.helper.getSlideHash(slideNumber);
        this.requestSlideImpl(startSlideHash);
    };
    LayerDrawing.prototype.initializeCanvas = function () {
        this.computeCanvasSize(this.resolutionWidth, this.resolutionHeight);
        this.createRenderingCanvas();
    };
    LayerDrawing.prototype.createRenderingCanvas = function () {
        this.offscreenCanvas = new OffscreenCanvas(this.canvasWidth, this.canvasHeight);
        try {
            this.layerRenderer = new SlideShow.LayerRendererGl(this.offscreenCanvas);
        }
        catch (error) {
            console.log('LayerDrawing: WebGl offscreen rendering not supported');
            this.layerRenderer = new SlideShow.LayerRenderer2d(this.offscreenCanvas);
        }
    };
    LayerDrawing.prototype.requestSlideImpl = function (slideHash, prefetch) {
        var _this = this;
        if (prefetch === void 0) { prefetch = false; }
        if (this.isDisposed())
            return;
        console.debug('LayerDrawing.requestSlideImpl: slide hash: ' +
            slideHash +
            ', prefetching: ' +
            prefetch);
        var slideInfo = this.getSlideInfo(slideHash);
        if (!slideInfo) {
            window.app.console.log('LayerDrawing.requestSlideImpl: No info for requested slide: hash: ' +
                slideHash);
            return;
        }
        if (slideHash === this.requestedSlideHash ||
            slideHash === this.prefetchedSlideHash ||
            slideHash === this.nextRequestedSlideHash ||
            slideHash === this.nextPrefetchedSlideHash) {
            console.debug('LayerDrawing.requestSlideImpl: no need to fetch slide again');
            return;
        }
        if (this.requestedSlideHash ||
            this.prefetchedSlideHash ||
            this.slideRequestTimeout) {
            if (!prefetch || !this.slideRequestTimeout) {
                if (!prefetch) {
                    // maybe user has switched to a new slide
                    clearTimeout(this.slideRequestTimeout);
                    this.nextRequestedSlideHash = slideHash;
                    this.nextPrefetchedSlideHash = null;
                }
                else {
                    // prefetching and nothing already queued
                    this.nextPrefetchedSlideHash = slideHash;
                }
                this.slideRequestTimeout = setTimeout(function () {
                    if (!_this.helper.isSlideShowPlaying())
                        return;
                    _this.slideRequestTimeout = null;
                    _this.nextRequestedSlideHash = null;
                    _this.nextPrefetchedSlideHash = null;
                    _this.requestSlideImpl(slideHash, prefetch);
                }, 500);
            }
            return;
        }
        if (prefetch) {
            this.prefetchedSlideHash = slideHash;
            this.requestedSlideHash = null;
        }
        else {
            this.requestedSlideHash = slideHash;
            this.prefetchedSlideHash = null;
        }
        if (this.slideCache.has(slideHash)) {
            this.onSlideRenderingComplete({ success: true });
            return;
        }
        var backgroundRendered = this.drawBackground(slideHash);
        var masterPageRendered = this.drawMasterPage(slideHash);
        if (backgroundRendered && masterPageRendered) {
            if (this.drawDrawPage(slideHash)) {
                this.onSlideRenderingComplete({ success: true });
                return;
            }
        }
        app.socket.sendMessage("getslide hash=" + slideInfo.hash + " part=" + slideInfo.index + " width=" + this.canvasWidth + " height=" + this.canvasHeight + " " +
            ("renderBackground=" + (backgroundRendered ? 0 : 1) + " renderMasterPage=" + (masterPageRendered ? 0 : 1) + " devicePixelRatio=" + window.devicePixelRatio));
    };
    LayerDrawing.prototype.onSlideLayerMsg = function (e) {
        if (this.isDisposed())
            return;
        if (this.isTransitionActive) {
            this.queuedLayers.push(e);
            return;
        }
        var info = e.message;
        if (!info) {
            window.app.console.log('LayerDrawing.onSlideLayerMsg: no json data available.');
            return;
        }
        if (!this.getSlideInfo(info.slideHash)) {
            window.app.console.log('LayerDrawing.onSlideLayerMsg: no slide info available for ' +
                info.slideHash +
                '.');
            return;
        }
        if (!info.content) {
            window.app.console.log('LayerDrawing.onSlideLayerMsg: no layer content available.');
            return;
        }
        switch (info.group) {
            case 'Background':
                this.handleBackgroundMsg(info, e.image);
                break;
            case 'MasterPage':
                this.handleMasterPageLayerMsg(info, e.image);
                break;
            case 'DrawPage':
                this.handleDrawPageLayerMsg(info, e.image);
                break;
            case 'TextFields':
                this.handleTextFieldMsg(info, e.image);
        }
    };
    LayerDrawing.prototype.handleTextFieldMsg = function (info, img) {
        var textFieldInfo = info.content;
        var imageInfo = textFieldInfo.content;
        if (!this.checkAndAttachImageData(imageInfo, img))
            return;
        var textFields = this.slideTextFieldsMap.get(info.slideHash);
        if (!textFields) {
            textFields = new Map();
            this.slideTextFieldsMap.set(info.slideHash, textFields);
        }
        textFields.set(textFieldInfo.hash, imageInfo.checksum);
        this.cachedTextFields.set(imageInfo.checksum, textFieldInfo);
    };
    LayerDrawing.prototype.handleBackgroundMsg = function (info, img) {
        var slideInfo = this.getSlideInfo(info.slideHash);
        if (!slideInfo.background) {
            return;
        }
        if (info.type === 'bitmap') {
            var imageInfo = info.content;
            if (!this.checkAndAttachImageData(imageInfo, img))
                return;
            var pageHash = slideInfo.background.isCustom
                ? info.slideHash
                : slideInfo.masterPage;
            this.backgroundChecksums.set(pageHash, imageInfo.checksum);
            this.cachedBackgrounds.set(imageInfo.checksum, imageInfo);
            this.clearCanvas();
            this.drawBitmap(imageInfo);
        }
    };
    LayerDrawing.prototype.handleMasterPageLayerMsg = function (info, img) {
        var slideInfo = this.getSlideInfo(info.slideHash);
        if (!slideInfo.masterPageObjectsVisibility) {
            return;
        }
        if (info.index === 0 || !this.cachedMasterPages.get(slideInfo.masterPage))
            this.cachedMasterPages.set(slideInfo.masterPage, new Array());
        var layers = this.cachedMasterPages.get(slideInfo.masterPage);
        if (layers.length !== info.index) {
            window.app.console.log('LayerDrawing.handleMasterPageLayerMsg: missed any layers ?');
        }
        var layerEntry = {
            type: info.type,
            content: info.content,
            isField: info.isField,
        };
        if (info.type === 'bitmap') {
            if (!this.checkAndAttachImageData(layerEntry.content, img))
                return;
        }
        layers.push(layerEntry);
        this.drawMasterPageLayer(layerEntry, info.slideHash);
    };
    LayerDrawing.prototype.handleDrawPageLayerMsg = function (info, img) {
        if (info.index === 0 || !this.cachedDrawPages.get(info.slideHash)) {
            this.cachedDrawPages.set(info.slideHash, new Array());
        }
        var layers = this.cachedDrawPages.get(info.slideHash);
        if (layers.length !== info.index) {
            window.app.console.log('LayerDrawing.handleDrawPageLayerMsg: missed any layers ?');
        }
        var layerEntry = {
            type: info.type,
            content: info.content,
        };
        if (info.type === 'bitmap') {
            if (!this.checkAndAttachImageData(layerEntry.content, img))
                return;
        }
        else if (info.type === 'animated') {
            var content = layerEntry.content;
            if (content.type === 'bitmap') {
                if (!this.checkAndAttachImageData(content.content, img))
                    return;
                var animatedElement = this.helper.getAnimatedElement(info.slideHash, content.hash);
                if (animatedElement) {
                    animatedElement.updateAnimationInfo(content);
                }
            }
        }
        layers.push(layerEntry);
        this.drawDrawPageLayer(info.slideHash, layerEntry);
    };
    LayerDrawing.prototype.clearCanvas = function () {
        this.layerRenderer.clearCanvas();
    };
    LayerDrawing.prototype.drawBackground = function (slideHash) {
        this.clearCanvas();
        var slideInfo = this.getSlideInfo(slideHash);
        if (this.layerRenderer.fillColor(slideInfo))
            return true;
        var pageHash = slideInfo.background.isCustom
            ? slideHash
            : slideInfo.masterPage;
        var checksum = this.backgroundChecksums.get(pageHash);
        if (!checksum)
            return false;
        var imageInfo = this.cachedBackgrounds.get(checksum);
        if (!imageInfo) {
            window.app.console.log('LayerDrawing: no cached background for slide: ' + slideHash);
            return false;
        }
        this.drawBitmap(imageInfo);
        return true;
    };
    LayerDrawing.prototype.drawMasterPage = function (slideHash) {
        var e_6, _a;
        var slideInfo = this.getSlideInfo(slideHash);
        if (!slideInfo.masterPageObjectsVisibility)
            return true;
        var layers = this.cachedMasterPages.get(slideInfo.masterPage);
        if (!layers || layers.length === 0) {
            window.app.console.log('LayerDrawing: No layer cached for master page: ' +
                slideInfo.masterPage);
            return false;
        }
        try {
            for (var layers_1 = __values(layers), layers_1_1 = layers_1.next(); !layers_1_1.done; layers_1_1 = layers_1.next()) {
                var layer = layers_1_1.value;
                this.drawMasterPageLayer(layer, slideHash);
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (layers_1_1 && !layers_1_1.done && (_a = layers_1.return)) _a.call(layers_1);
            }
            finally { if (e_6) throw e_6.error; }
        }
        return true;
    };
    LayerDrawing.prototype.drawMasterPageLayer = function (layer, slideHash) {
        if (layer.type === 'bitmap') {
            this.drawBitmap(layer.content);
        }
        else if (layer.type === 'placeholder') {
            var placeholder = layer.content;
            var slideTextFields = this.slideTextFieldsMap.get(slideHash);
            var checksum = slideTextFields
                ? slideTextFields.get(placeholder.hash)
                : null;
            if (!checksum) {
                window.app.console.log('LayerDrawing: No content found for text field placeholder, type: ' +
                    placeholder.type);
                return;
            }
            var imageInfo = this.cachedTextFields.get(checksum).content;
            this.drawBitmap(imageInfo);
        }
    };
    LayerDrawing.prototype.drawDrawPage = function (slideHash) {
        var e_7, _a;
        var slideInfo = this.getSlideInfo(slideHash);
        if (slideInfo.empty) {
            return true;
        }
        var layers = this.cachedDrawPages.get(slideHash);
        if (!layers || layers.length === 0) {
            window.app.console.log('LayerDrawing: No layer cached for draw page: ' + slideHash);
            return false;
        }
        try {
            for (var layers_2 = __values(layers), layers_2_1 = layers_2.next(); !layers_2_1.done; layers_2_1 = layers_2.next()) {
                var layer = layers_2_1.value;
                this.drawDrawPageLayer(slideHash, layer);
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (layers_2_1 && !layers_2_1.done && (_a = layers_2.return)) _a.call(layers_2);
            }
            finally { if (e_7) throw e_7.error; }
        }
        return true;
    };
    LayerDrawing.prototype.drawDrawPageLayer = function (slideHash, layer) {
        if (layer.type === 'bitmap') {
            this.drawBitmap(layer.content);
        }
        else if (layer.type === 'animated') {
            var content = layer.content;
            if (content.type === 'bitmap') {
                var animatedElement = this.helper.getAnimatedElement(slideHash, content.hash);
                if (animatedElement) {
                    console.debug('LayerDrawing.drawDrawPageLayer: retrieved animatedElement');
                    if (animatedElement.isValid()) {
                        animatedElement.renderLayer(this.layerRenderer);
                        return;
                    }
                }
                this.drawBitmap(content.content);
            }
        }
    };
    LayerDrawing.prototype.drawBitmap = function (imageInfo) {
        this.layerRenderer.drawBitmap(imageInfo);
    };
    LayerDrawing.prototype.onSlideRenderingComplete = function (e) {
        if (this.isDisposed())
            return;
        if (!e.success) {
            var slideHash = this.requestedSlideHash || this.prefetchedSlideHash;
            var slideInfo = this.getSlideInfo(slideHash);
            var index = slideInfo ? slideInfo.index : undefined;
            this.requestedSlideHash = null;
            this.prefetchedSlideHash = null;
            console.debug('LayerDrawing.onSlideRenderingComplete: rendering failed for slide: ' +
                index);
            return;
        }
        if (this.prefetchedSlideHash) {
            this.prefetchedSlideHash = null;
            return;
        }
        var reqSlideInfo = this.getSlideInfo(this.requestedSlideHash);
        this.cacheAndNotify();
        // fetch next slide and draw it on offscreen canvas
        if (reqSlideInfo.next && !this.slideCache.has(reqSlideInfo.next)) {
            this.requestSlideImpl(reqSlideInfo.next, true);
        }
    };
    LayerDrawing.prototype.cacheAndNotify = function () {
        if (!this.offscreenCanvas) {
            window.app.console.log('LayerDrawing.onSlideRenderingComplete: no offscreen canvas available.');
            return;
        }
        if (!this.slideCache.has(this.requestedSlideHash)) {
            var renderedSlide = this.offscreenCanvas.transferToImageBitmap();
            this.slideCache.set(this.requestedSlideHash, renderedSlide);
        }
        this.requestedSlideHash = null;
        var oldCallback = this.onSlideRenderingCompleteCallback;
        this.onSlideRenderingCompleteCallback = null;
        if (oldCallback)
            // if we already closed presentation it is missing
            oldCallback.call(this.helper);
    };
    LayerDrawing.prototype.checkAndAttachImageData = function (imageInfo, img) {
        if (!img || (imageInfo.type === 'png' && !img.src)) {
            window.app.console.log('LayerDrawing.checkAndAttachImageData: no bitmap available.');
            return false;
        }
        imageInfo.data = img;
        return true;
    };
    LayerDrawing.prototype.computeInitialResolution = function () {
        var viewWidth = window.screen.width;
        var viewHeight = window.screen.height;
        this.computeResolution(viewWidth, viewHeight);
    };
    LayerDrawing.prototype.computeResolution = function (viewWidth, viewHeight) {
        var _a;
        _a = __read(this.helper.computeLayerResolution(viewWidth, viewHeight), 2), this.resolutionWidth = _a[0], this.resolutionHeight = _a[1];
    };
    LayerDrawing.prototype.computeCanvasSize = function (resWidth, resHeight) {
        var _a;
        _a = __read(this.helper.computeLayerSize(resWidth, resHeight), 2), this.canvasWidth = _a[0], this.canvasHeight = _a[1];
    };
    LayerDrawing.prototype.getLayerRendererContext = function () {
        return this.layerRenderer.getRenderContext();
    };
    LayerDrawing.prototype.notifyTransitionStart = function () {
        this.isTransitionActive = true;
        this.queuedLayers = [];
    };
    LayerDrawing.prototype.notifyTransitionEnd = function (slideHash) {
        this.isTransitionActive = false;
        while (this.queuedLayers.length > 0) {
            var layer = this.queuedLayers.shift();
            this.onSlideLayerMsg(layer);
        }
        this.handleVideos(slideHash);
        if (this.videoRenderers.has(slideHash)) {
            this.loadVideos(slideHash);
        }
    };
    return LayerDrawing;
}());
SlideShow.LayerDrawing = LayerDrawing;
//# sourceMappingURL=LayerDrawing.js.map