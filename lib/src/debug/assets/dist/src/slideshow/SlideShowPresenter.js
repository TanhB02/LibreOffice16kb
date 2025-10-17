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
function hitTest(bounds, x, y) {
    return (x >= bounds.x &&
        x <= bounds.x + bounds.width &&
        y >= bounds.y &&
        y <= bounds.y + bounds.height);
}
var SlideShowPresenter = /** @class */ (function () {
    function SlideShowPresenter(map) {
        this._map = null;
        this._presentationInfo = null;
        this._slideCompositor = null;
        this._fullscreen = null;
        this._presenterContainer = null;
        this._slideShowCanvas = null;
        this._slideShowWindowProxy = null;
        this._windowCloseInterval = null;
        this._slideRenderer = null;
        this._canvasLoader = null;
        this._presentationInfoChanged = false;
        this._skipNextSlideShowInfoChangedMsg = false;
        this._cypressSVGPresentationTest = false;
        this._onImpressModeChanged = null;
        this._startingPresentation = false;
        this._cypressSVGPresentationTest =
            L.Browser.cypressTest || 'Cypress' in window;
        this._map = map;
        this._init();
        this.addHooks();
    }
    SlideShowPresenter.prototype.addHooks = function () {
        this._map.on('presentationinfo', this.onSlideShowInfo, this);
        this._map.on('newfullscreen', this._onStart, this);
        this._map.on('newpresentinwindow', this._onStartInWindow, this);
        L.DomEvent.on(document, 'fullscreenchange', this._onFullScreenChange, this);
        this._map.on('updateparts', this.onUpdateParts, this);
    };
    SlideShowPresenter.prototype.removeHooks = function () {
        this._map.off('presentationinfo', this.onSlideShowInfo, this);
        this._map.off('newfullscreen', this._onStart, this);
        this._map.off('newpresentinwindow', this._onStartInWindow, this);
        L.DomEvent.off(document, 'fullscreenchange', this._onFullScreenChange, this);
        this._map.off('updateparts', this.onUpdateParts, this);
    };
    SlideShowPresenter.prototype._init = function () {
        this._slideShowHandler = new SlideShowHandler(this);
        this._slideShowNavigator = new SlideShowNavigator(this._slideShowHandler);
        // do not allow user interaction until we get presentation info
        this._slideShowNavigator.disable();
        this._slideShowHandler.setNavigator(this._slideShowNavigator);
        this._slideShowNavigator.setPresenter(this);
        this._onKeyDownHandler = this._slideShowNavigator.onKeyDown.bind(this._slideShowNavigator);
    };
    SlideShowPresenter.prototype.onUpdateParts = function () {
        if (this._checkAlreadyPresenting() && !this._startingPresentation)
            this.onSlideShowInfoChanged();
    };
    SlideShowPresenter.prototype.getNavigator = function () {
        return this._slideShowNavigator;
    };
    SlideShowPresenter.prototype.getSlideInfo = function (slideNumber) {
        return this._presentationInfo
            ? this._presentationInfo.slides[slideNumber]
            : null;
    };
    SlideShowPresenter.prototype._getSlidesCount = function () {
        return this._presentationInfo ? this._presentationInfo.slides.length : 0;
    };
    SlideShowPresenter.prototype._getRepeatDuration = function () {
        return this._presentationInfo
            ? this._presentationInfo.loopAndRepeatDuration
            : 0;
    };
    SlideShowPresenter.prototype.isSlideHidden = function (slideNumber) {
        var slideInfo = this.getSlideInfo(slideNumber);
        return slideInfo ? slideInfo.hidden : true;
    };
    SlideShowPresenter.prototype.getVisibleSlidesCount = function () {
        var count = 0;
        var slideCount = this._getSlidesCount();
        for (var i = 0; i < slideCount; ++i) {
            if (this.isSlideHidden(i))
                continue;
            ++count;
        }
        return count;
    };
    SlideShowPresenter.prototype.getNextVisibleSlide = function (slideNumber) {
        var next = slideNumber;
        while (next < this._getSlidesCount()) {
            ++next;
            if (!this.isSlideHidden(next))
                break;
        }
        return next;
    };
    SlideShowPresenter.prototype.getVisibleIndex = function (slideNumber) {
        var index = slideNumber;
        for (var i = 0; i < slideNumber; ++i) {
            if (this.isSlideHidden(i))
                --index;
        }
        return index;
    };
    SlideShowPresenter.prototype.isFullscreen = function () {
        if (this._cypressSVGPresentationTest)
            return false;
        return !!this._fullscreen;
    };
    SlideShowPresenter.prototype.getCanvas = function () {
        return this._slideShowCanvas;
    };
    SlideShowPresenter.prototype.getNotes = function (slide) {
        var info = this.getSlideInfo(slide);
        return info.notes;
    };
    SlideShowPresenter.prototype.getVideoRenderer = function (slideHash, videoInfo) {
        return this._slideCompositor.getVideoRenderer(slideHash, videoInfo);
    };
    SlideShowPresenter.prototype._onFullScreenChange = function () {
        this._fullscreen = document.fullscreenElement;
        if (this._fullscreen) {
            // window.addEventListener('keydown', this._onCanvasKeyDown.bind(this));
            window.addEventListener('keydown', this._onKeyDownHandler);
            this.centerCanvas();
        }
        else {
            // we need to cleanup current/prev slide
            this._slideShowNavigator.quit();
        }
    };
    SlideShowPresenter.prototype._stopFullScreen = function () {
        if (!this._slideShowCanvas)
            return;
        if (this._slideCompositor)
            this._slideCompositor.deleteResources();
        this._slideRenderer.deleteResources();
        window.removeEventListener('keydown', this._onKeyDownHandler);
        L.DomUtil.remove(this._slideShowCanvas);
        this._slideShowCanvas = null;
        if (this._presenterContainer) {
            L.DomUtil.remove(this._presenterContainer);
            this._presenterContainer = null;
        }
        // #7102 on exit from fullscreen we don't get a 'focus' event
        // in Chrome so a later second attempt at launching a presentation
        // fails
        this._map.focus();
    };
    SlideShowPresenter.prototype.centerCanvas = function () {
        if (!this._slideShowCanvas)
            return;
        var winWidth = 0;
        var winHeight = 0;
        if (this._slideShowWindowProxy) {
            winWidth = this._slideShowWindowProxy.clientWidth;
            winHeight = this._slideShowWindowProxy.clientHeight;
        }
        else if (this.isFullscreen()) {
            winWidth = window.screen.width;
            winHeight = window.screen.height;
        }
        // set canvas styles
        if (winWidth * this._slideShowCanvas.height <
            winHeight * this._slideShowCanvas.width) {
            // clean previous styles
            this._slideShowCanvas.style.height = '';
            this._slideShowCanvas.style.left = '';
            // set new styles
            this._slideShowCanvas.style.width = '100%';
            this._slideShowCanvas.style.top = '50%';
            this._slideShowCanvas.style.transform = 'translateY(-50%)';
        }
        else {
            // clean previous styles
            this._slideShowCanvas.style.width = '';
            this._slideShowCanvas.style.top = '';
            // set new styles
            this._slideShowCanvas.style.height = '100%';
            this._slideShowCanvas.style.left = '50%';
            this._slideShowCanvas.style.transform = 'translateX(-50%)';
        }
    };
    SlideShowPresenter.prototype._createPresenterHTML = function (parent, width, height) {
        var presenterContainer = L.DomUtil.create('div', 'leaflet-slideshow2', parent);
        presenterContainer.id = 'presenter-container';
        var slideshowContainer = L.DomUtil.create('div', 'leaflet-slideshow2', presenterContainer);
        slideshowContainer.id = 'slideshow-container';
        this._slideShowCanvas = this._createCanvas(slideshowContainer, width, height);
        return presenterContainer;
    };
    SlideShowPresenter.prototype._createCanvas = function (parent, width, height) {
        var canvas = L.DomUtil.create('canvas', 'leaflet-slideshow2', parent);
        canvas.id = 'slideshow-canvas';
        // set canvas styles
        canvas.style.margin = 0;
        canvas.style.position = 'absolute';
        canvas.addEventListener('click', this._slideShowNavigator.onClick.bind(this._slideShowNavigator));
        canvas.addEventListener('mousemove', this._slideShowNavigator.onMouseMove.bind(this._slideShowNavigator));
        if (this._hammer) {
            this._hammer.off('swipe');
        }
        this._hammer = new Hammer(canvas);
        this._hammer.get('swipe').set({
            direction: Hammer.DIRECTION_ALL,
        });
        this._hammer.on('swipe', window.touch
            .touchOnly(this._slideShowNavigator.onSwipe)
            .bind(this._slideShowNavigator));
        this._slideShowHandler.getContext().aCanvas = canvas;
        try {
            this._slideRenderer = new SlideRendererGl(canvas);
        }
        catch (error) {
            this._slideRenderer = new SlideRenderer2d(canvas);
        }
        return canvas;
    };
    SlideShowPresenter.prototype.exitSlideshowWithWarning = function () {
        // TODO 2D version for disabled webGL
        if (this._slideRenderer._context.is2dGl())
            return false;
        new SlideShow.StaticTextRenderer(this._slideRenderer._context).display(_('Click to exit presentation...'));
        return true;
    };
    SlideShowPresenter.prototype.startTimer = function (loopAndRepeatDuration) {
        console.debug('SlideShowPresenter.startTimer');
        var renderContext = this._slideRenderer._context;
        var onTimeoutHandler = this._slideShowNavigator.goToFirstSlide.bind(this._slideShowNavigator);
        var PauseTimerType = renderContext instanceof RenderContextGl ? PauseTimerGl : PauseTimer2d;
        this._pauseTimer = new PauseTimerType(renderContext, loopAndRepeatDuration, onTimeoutHandler);
        this._pauseTimer.startTimer();
    };
    SlideShowPresenter.prototype.endPresentation = function (force) {
        console.debug('SlideShowPresenter.endPresentation');
        if (this._pauseTimer)
            this._pauseTimer.stopTimer();
        var settings = this._presentationInfo;
        if (force || !settings.isEndless) {
            if (!force && this.exitSlideshowWithWarning()) {
                return;
            }
            this._stopFullScreen();
            this._closeSlideShowWindow();
            return;
        }
        this.startTimer(settings.loopAndRepeatDuration);
    };
    SlideShowPresenter.prototype.startLoader = function () {
        try {
            this._canvasLoader = new CanvasLoaderGl(this._slideRenderer._context);
        }
        catch (error) {
            this._canvasLoader = new CanvasLoader2d(this._slideRenderer._context);
        }
        this._canvasLoader.startLoader();
        this._startingPresentation = false;
    };
    SlideShowPresenter.prototype.stopLoader = function () {
        if (!this._canvasLoader)
            return;
        this._canvasLoader.stopLoader();
        this._canvasLoader = null;
    };
    SlideShowPresenter.prototype._generateSlideWindowHtml = function (title) {
        var sanitizer = document.createElement('div');
        sanitizer.innerText = title;
        var sanitizedTitle = sanitizer.innerHTML;
        return "\n\t\t\t<!DOCTYPE html>\n\t\t\t<html lang=\"en\">\n\t\t\t<head>\n\t\t\t\t<meta charset=\"UTF-8\">\n\t\t\t\t<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n\t\t\t\t<title>" + sanitizedTitle + "</title>\n\t\t\t</head>\n\t\t\t<body>\n\t\t\t\t<div id=\"root-in-window\"></div>\n\t\t\t</body>\n\t\t\t</html>\n\t\t\t";
    };
    SlideShowPresenter.prototype._closeSlideShowWindow = function () {
        if (this._slideShowWindowProxy) {
            this._slideShowWindowProxy.parentElement.removeChild(this._slideShowWindowProxy);
            this._map.fire('presentinwindowclose');
            this._slideShowWindowProxy = null;
        }
        // enable present in console on closeSlideShowWindow
        this._enablePresenterConsole(false);
        this._map.uiManager.closeSnackbar();
        this._map.focus();
    };
    SlideShowPresenter.prototype._doFallbackPresentation = function () {
        this._stopFullScreen();
        this._doInWindowPresentation();
    };
    SlideShowPresenter.prototype._getProxyDocumentNode = function () {
        return this._slideShowWindowProxy.contentWindow.document;
    };
    SlideShowPresenter.prototype._doInWindowPresentation = function () {
        var popupTitle = _('Windowed Presentation: ') + this._map['wopi'].BaseFileName;
        var htmlContent = this._generateSlideWindowHtml(popupTitle);
        this._slideShowWindowProxy = L.DomUtil.createWithId('iframe', 'slideshow-cypress-iframe', document.body);
        this._getProxyDocumentNode().open();
        this._getProxyDocumentNode().write(htmlContent);
        if (!this._slideShowWindowProxy) {
            this._notifyBlockedPresenting();
            return;
        }
        this._slideShowWindowProxy.focus();
        // set body styles
        this._getProxyDocumentNode().body.style.margin = '0';
        this._getProxyDocumentNode().body.style.padding = '0';
        this._getProxyDocumentNode().body.style.height = '100%';
        this._getProxyDocumentNode().body.style.overflow = 'hidden';
        var body = this._getProxyDocumentNode().querySelector('#root-in-window');
        this._presenterContainer = this._createPresenterHTML(body, window.screen.width, window.screen.height);
        this._slideShowCanvas.focus();
        window.addEventListener('resize', this.onSlideWindowResize.bind(this));
        this._getProxyDocumentNode().addEventListener('keydown', this._onKeyDownHandler);
        this._slideShowWindowProxy.addEventListener('unload', L.bind(this._closeSlideShowWindow, this));
        var slideShowWindow = this._slideShowWindowProxy;
        this._map.uiManager.showSnackbar(_('Presenting in window'), _('Close Presentation'), L.bind(this._closeSlideShowWindow, this), -1, false, true);
        this._windowCloseInterval = setInterval(function () {
            if (!slideShowWindow.isConnected)
                this.slideshowWindowCleanUp();
        }.bind(this), 500);
        window.addEventListener('beforeunload', this.slideshowWindowCleanUp.bind(this));
    };
    SlideShowPresenter.prototype.slideshowWindowCleanUp = function () {
        clearInterval(this._windowCloseInterval);
        this._slideShowNavigator.quit();
        this._map.uiManager.closeSnackbar();
        this._slideShowCanvas = null;
        this._presenterContainer = null;
        this._slideShowWindowProxy = null;
        window.removeEventListener('resize', this.onSlideWindowResize.bind(this));
        window.removeEventListener('beforeunload', this.slideshowWindowCleanUp.bind(this));
    };
    SlideShowPresenter.prototype._onImpressModeChangedImpl = function (e, inWindow) {
        if (this._onImpressModeChanged && e.mode === 0) {
            this._map.off('impressmodechanged', this._onImpressModeChanged, this);
            this._onImpressModeChanged = null;
            var startSlide = {
                startSlideNumber: this._startSlide,
            };
            var startSlideshow = inWindow ? this._onStartInWindow : this._onStart;
            setTimeout(startSlideshow.bind(this, startSlide), 500);
        }
    };
    /// returns true on success
    SlideShowPresenter.prototype._onPrepareScreen = function (inWindow) {
        var e_1, _a;
        var _this = this;
        if (this._checkPresentationDisabled()) {
            this._notifyPresentationDisabled();
            return false;
        }
        if (this._checkAlreadyPresenting()) {
            this._notifyAlreadyPresenting();
            return false;
        }
        if (app.impress.notesMode) {
            console.debug('SlideShowPresenter._onPrepareScreen: notes mode is enabled, exiting');
            // exit notes view mode and wait for status update notification
            // so we're sure that impress mode is changed
            // finally skip next partsupdate event,
            // since it's only due to the mode change
            this._skipNextSlideShowInfoChangedMsg = true;
            this._onImpressModeChanged = function (e) {
                this._onImpressModeChangedImpl(e, inWindow);
            };
            this._map.on('impressmodechanged', this._onImpressModeChanged, this);
            app.map.sendUnoCommand('.uno:NormalMultiPaneGUI');
            return false;
        }
        if (app.impress.areAllSlidesHidden()) {
            this._notifyAllSlidesHidden();
            return false;
        }
        // if we're playing a video, it'll continue *under* the presentation if we aren't careful
        // that's not a problem for visuals, but the audio of the video will also play
        // we don't currently need to do this for <audio> elements, since as we just use <video> tags for that anyway
        var videos = document.getElementsByTagName('video');
        try {
            for (var _b = __values(Array.from(videos)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var video = _c.value;
                video.pause();
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (!this._map['wopi'].DownloadAsPostMessage) {
            if (inWindow) {
                this._doInWindowPresentation();
                return true;
            }
            // fullscreen
            this._presenterContainer = this._createPresenterHTML(this._map._container, window.screen.width, window.screen.height);
            if (this._presenterContainer.requestFullscreen) {
                this._presenterContainer
                    .requestFullscreen()
                    .then(function () {
                    // success
                })
                    .catch(function () {
                    _this._doFallbackPresentation();
                });
                return true;
            }
        }
        this._doFallbackPresentation();
        return true;
    };
    SlideShowPresenter.prototype.onSlideWindowResize = function () {
        this.centerCanvas();
    };
    SlideShowPresenter.prototype._checkAlreadyPresenting = function () {
        if (this._slideShowCanvas)
            return true;
        return false;
    };
    SlideShowPresenter.prototype._notifyAllSlidesHidden = function () {
        this._map.uiManager.showInfoModal('allslidehidden-modal', _('Empty Slide Show'), 'All slides are hidden!', '', _('OK'), function () {
            0;
        }, false, 'allslidehidden-modal-response');
    };
    SlideShowPresenter.prototype._notifyAlreadyPresenting = function () {
        this._map.uiManager.showInfoModal('already-presenting-modal', _('Already presenting'), _('You are already presenting this document'), '', _('OK'), null, false);
    };
    SlideShowPresenter.prototype._notifyBlockedPresenting = function () {
        this._enablePresenterConsole(false);
        this._map.uiManager.showInfoModal('popup-blocked-modal', _('Windowed Presentation Blocked'), _('Presentation was blocked. Please allow pop-ups in your browser. This lets slide shows to be displayed in separated windows, allowing for easy screen sharing.'), '', _('OK'), null, false);
    };
    SlideShowPresenter.prototype._enablePresenterConsole = function (state) {
        this._map.fire('commandstatechanged', {
            commandName: 'presenterconsole',
            disabled: state,
        });
    };
    SlideShowPresenter.prototype._checkPresentationDisabled = function () {
        return this._map['wopi'].DisablePresentation;
    };
    SlideShowPresenter.prototype._notifyPresentationDisabled = function () {
        this._map.uiManager.showInfoModal('presentation-disabled-modal', _('Presentation disabled'), _('Presentation mode has been disabled for this document'), '', _('OK'), null, false);
    };
    /// called when user triggers the presentation using UI
    SlideShowPresenter.prototype._onStart = function (that) {
        var _a;
        this._startSlide = (_a = that === null || that === void 0 ? void 0 : that.startSlideNumber) !== null && _a !== void 0 ? _a : 0;
        if (!this._onPrepareScreen(false))
            // opens full screen, has to be on user interaction
            return;
        // disable slide sorter or it will receive key events
        this._map._docLayer._preview.partsFocused = false;
        this._startingPresentation = true;
        app.socket.sendMessage('getpresentationinfo');
    };
    /// called when user triggers the in-window presentation using UI
    SlideShowPresenter.prototype._onStartInWindow = function (that) {
        var _a;
        this._startSlide = (_a = that === null || that === void 0 ? void 0 : that.startSlideNumber) !== null && _a !== void 0 ? _a : 0;
        if (!this._onPrepareScreen(true))
            // opens full screen, has to be on user interaction
            return;
        // disable present in console onStartInWindow
        this._enablePresenterConsole(true);
        this._startingPresentation = true;
        app.socket.sendMessage('getpresentationinfo');
    };
    /// called as a response on getpresentationinfo
    SlideShowPresenter.prototype.onSlideShowInfo = function (data) {
        console.debug('SlideShow: received information about presentation');
        this._presentationInfo = data;
        var numberOfSlides = this._getSlidesCount();
        if (numberOfSlides === 0)
            return;
        if (!this.getCanvas()) {
            console.debug('onSlideShowInfo: no canvas available');
            return;
        }
        var skipTransition = false;
        if (!this._metaPresentation) {
            this._metaPresentation = new MetaPresentation(data, this._slideShowHandler, this._slideShowNavigator);
            this._slideShowHandler.setMetaPresentation(this._metaPresentation);
            this._slideShowNavigator.setMetaPresentation(this._metaPresentation);
        }
        else {
            // don't allow user interaction
            this._slideShowNavigator.disable();
            var currentSlideHash = this._metaPresentation.getCurrentSlideHash();
            if (this._presentationInfoChanged || currentSlideHash) {
                // presentation is changed and presentation info has been updated
                this._presentationInfoChanged = false;
                // clean
                if (currentSlideHash)
                    this._slideCompositor.pauseVideos(currentSlideHash);
                this._slideShowHandler.skipAllEffects();
                this._slideShowHandler.cleanLeavingSlideStatus(this._slideShowNavigator.currentSlideIndex, true);
                this._metaPresentation.update(data);
                // try to restore previously displayed slide
                var slideInfo = this._metaPresentation.getSlideInfo(currentSlideHash);
                this._startSlide = slideInfo ? slideInfo.indexInSlideShow : 0;
                skipTransition = true;
            }
            else {
                // slideshow has been started again
                this._metaPresentation.update(data);
            }
        }
        if (!this._slideCompositor) {
            this._slideCompositor = new SlideShow.LayersCompositor(this, this._metaPresentation);
        }
        this._slideCompositor.onUpdatePresentationInfo();
        var canvasSize = this._slideCompositor.getCanvasSize();
        this._slideShowCanvas.width = canvasSize[0];
        this._slideShowCanvas.height = canvasSize[1];
        this.centerCanvas();
        // animated elements needs to update canvas size
        this._metaPresentation.getMetaSlides().forEach(function (metaSlide) {
            if (metaSlide.animationsHandler) {
                var animElemMap = metaSlide.animationsHandler.getAnimatedElementMap();
                animElemMap.forEach(function (animatedElement) {
                    animatedElement.updateCanvasSize(canvasSize);
                });
            }
        });
        this.startLoader();
        // allow user interaction
        this._slideShowNavigator.enable();
        this._slideShowNavigator.startPresentation(this._startSlide, skipTransition);
    };
    SlideShowPresenter.prototype.onSlideShowInfoChanged = function () {
        if (this._presentationInfoChanged)
            return;
        if (this._skipNextSlideShowInfoChangedMsg) {
            this._skipNextSlideShowInfoChangedMsg = false;
            return;
        }
        this._presentationInfoChanged = true;
        app.socket.sendMessage('getpresentationinfo');
    };
    return SlideShowPresenter;
}());
SlideShow.SlideShowPresenter = SlideShowPresenter;
//# sourceMappingURL=SlideShowPresenter.js.map