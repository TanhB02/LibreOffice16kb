// @ts-strict-ignore
/* -*- tab-width: 4 -*- */
/*
 * Copyright the Collabora Online contributors.
 *
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var SlideShowNavigator = /** @class */ (function () {
    function SlideShowNavigator(slideShowHandler) {
        this.theMetaPres = null;
        this.slideShowHandler = slideShowHandler;
        this.currentSlide = undefined;
        this.prevSlide = undefined;
        this.isRewindingToPrevSlide = false;
        this.initKeyMap();
        this.addHandlers();
    }
    SlideShowNavigator.prototype.initKeyMap = function () {
        var _a;
        this.keyHandlerMap = {
            ArrowLeft: this.rewindEffect.bind(this),
            ArrowRight: this.dispatchEffect.bind(this),
            ArrowUp: this.rewindEffect.bind(this),
            ArrowDown: this.skipEffect.bind(this),
            PageUp: this.rewindAllEffects.bind(this),
            PageDown: this.skipAllEffects.bind(this),
            Home: this.goToFirstSlide.bind(this),
            End: this.goToLastSlide.bind(this),
            Space: this.dispatchEffect.bind(this),
            Backspace: this.rewindEffect.bind(this),
            Escape: this.quit.bind(this),
        };
        this.swipeHandlerMap = (_a = {},
            _a[Hammer.DIRECTION_RIGHT] = this.rewindEffect.bind(this),
            _a[Hammer.DIRECTION_LEFT] = this.dispatchEffect.bind(this),
            _a[Hammer.DIRECTION_UP] = this.quit.bind(this),
            _a[Hammer.DIRECTION_DOWN] = this.quit.bind(this),
            _a);
    };
    SlideShowNavigator.prototype.addHandlers = function () {
        this._canvasClickHandler = {
            handleClick: this.clickHandler.bind(this),
        };
    };
    SlideShowNavigator.prototype.removeHandlers = function () {
        this._canvasClickHandler.handleClick = null;
    };
    SlideShowNavigator.prototype.setMetaPresentation = function (metaPres) {
        this.theMetaPres = metaPres;
    };
    Object.defineProperty(SlideShowNavigator.prototype, "currentSlideIndex", {
        get: function () {
            return this.currentSlide;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SlideShowNavigator.prototype, "canvasClickHandler", {
        get: function () {
            return this._canvasClickHandler;
        },
        enumerable: false,
        configurable: true
    });
    SlideShowNavigator.prototype.dispatchEffect = function () {
        NAVDBG.print('SlideShowNavigator.dispatchEffect: current index: ' + this.currentSlide);
        var bRet = this.slideShowHandler.nextEffect();
        if (!bRet) {
            this.switchSlide(1, false);
        }
    };
    SlideShowNavigator.prototype.skipEffect = function () {
        NAVDBG.print('SlideShowNavigator.skipEffect: current index: ' + this.currentSlide);
        var bRet = this.slideShowHandler.skipPlayingOrNextEffect();
        if (!bRet) {
            this.switchSlide(1, true);
        }
    };
    SlideShowNavigator.prototype.skipAllEffects = function () {
        NAVDBG.print('SlideShowNavigator.skipAllEffects: current index: ' + this.currentSlide);
        var bRet = this.slideShowHandler.skipAllEffects();
        if (!bRet) {
            this.switchSlide(1, true);
        }
    };
    SlideShowNavigator.prototype.rewindEffect = function () {
        NAVDBG.print('SlideShowNavigator.rewindEffect: current index: ' + this.currentSlide);
        if (this.backToLastSlide())
            return;
        this.slideShowHandler.rewindEffect();
    };
    SlideShowNavigator.prototype.rewindAllEffects = function () {
        NAVDBG.print('SlideShowNavigator.rewindAllEffects: current index: ' +
            this.currentSlide);
        if (this.backToLastSlide())
            return;
        this.slideShowHandler.rewindAllEffects();
    };
    SlideShowNavigator.prototype.goToFirstSlide = function () {
        NAVDBG.print('SlideShowNavigator.goToFirstSlide: current index: ' + this.currentSlide);
        this.startPresentation(0, false);
    };
    SlideShowNavigator.prototype.goToLastSlide = function () {
        NAVDBG.print('SlideShowNavigator.goToLastSlide: current index: ' + this.currentSlide);
        this.displaySlide(this.theMetaPres.numberOfSlides - 1, true);
    };
    SlideShowNavigator.prototype.goToSlideAtBookmark = function (bookmark) {
        NAVDBG.print('SlideShowNavigator.goToSlideAtBookmark: ' +
            bookmark +
            ' current index: ' +
            this.currentSlide);
        for (var i = 0; i < this.theMetaPres.numberOfSlides; i++) {
            var slideInfo = this.theMetaPres.getSlideInfo(this.theMetaPres.getSlideHash(i));
            if (slideInfo.name == bookmark) {
                this.displaySlide(i, true);
                break;
            }
        }
    };
    SlideShowNavigator.prototype.backToLastSlide = function () {
        if (this.currentSlide >= this.theMetaPres.numberOfSlides) {
            this.goToLastSlide();
            return true;
        }
        return false;
    };
    SlideShowNavigator.prototype.quit = function () {
        NAVDBG.print('SlideShowNavigator.quit: current index: ' + this.currentSlide);
        this.endPresentation(true);
        this.currentSlide = undefined;
        this.prevSlide = undefined;
        this.removeHandlers();
    };
    SlideShowNavigator.prototype.switchSlide = function (nOffset, bSkipTransition) {
        NAVDBG.print('SlideShowNavigator.switchSlide: nOffset: ' + nOffset);
        this.displaySlide(this.currentSlide + nOffset, bSkipTransition);
    };
    SlideShowNavigator.prototype.rewindToPreviousSlide = function () {
        // play again transition on first slide and any effect that starts
        // automatically after the first slide is displayed
        if (this.currentSlide === 0)
            this.goToFirstSlide();
        var prevSlide = 0;
        if (this.currentSlide !== undefined && this.currentSlide > 0) {
            prevSlide = this.currentSlide - 1;
        }
        NAVDBG.print('SlideShowNavigator.rewindToPreviousSlide: slide to display: ' +
            prevSlide);
        this.isRewindingToPrevSlide = true;
        this.displaySlide(prevSlide, true);
        this.isRewindingToPrevSlide = false;
    };
    SlideShowNavigator.prototype.displaySlide = function (nNewSlide, bSkipTransition) {
        var _this = this;
        NAVDBG.print('SlideShowNavigator.displaySlide: current index: ' +
            this.currentSlide +
            ', nNewSlide: ' +
            nNewSlide +
            ', bSkipTransition: ' +
            bSkipTransition);
        if (this.presenter && !this.presenter._checkAlreadyPresenting()) {
            NAVDBG.print('SlideShowNavigator.displaySlide: no more presenting');
            this.quit();
            return;
        }
        if (nNewSlide === undefined || nNewSlide < 0) {
            NAVDBG.print('SlideShowNavigator.displaySlide: unexpected nNewSlide');
            return;
        }
        if (nNewSlide >= this.theMetaPres.numberOfSlides) {
            this.currentSlide = nNewSlide;
            var force = nNewSlide > this.theMetaPres.numberOfSlides;
            if (force)
                this.quit();
            else
                this.endPresentation(false);
            return;
        }
        var slideAvailable = true;
        var aNewMetaSlide = this.theMetaPres.getMetaSlideByIndex(nNewSlide);
        if (!aNewMetaSlide) {
            window.app.console.log('SlideShowNavigator.displaySlide: no meta slide for index: ' +
                nNewSlide);
            slideAvailable = false;
        }
        else if (aNewMetaSlide.hidden) {
            NAVDBG.print('SlideShowNavigator.displaySlide: hidden slide: ' + nNewSlide);
            slideAvailable = false;
        }
        if (!slideAvailable) {
            var offset = 1;
            if (this.currentSlide !== undefined)
                offset = Math.sign(nNewSlide - this.currentSlide);
            if (offset === 0) {
                NAVDBG.print('SlideShowNavigator.displaySlide: offset === 0');
                return;
            }
            this.displaySlide(nNewSlide + offset, bSkipTransition);
            return;
        }
        this.slideCompositor.fetchAndRun(nNewSlide, function () {
            assert(_this instanceof SlideShowNavigator, 'SlideShowNavigator.displaySlide: slideCompositor.fetchAndRun: ' +
                'callback: this is not a SlideShowNavigator instance');
            _this.prevSlide = _this.currentSlide;
            if (_this.prevSlide >= _this.theMetaPres.numberOfSlides)
                _this.prevSlide = undefined;
            _this.currentSlide = nNewSlide;
            if (_this.currentSlide === _this.prevSlide) {
                NAVDBG.print('SlideShowNavigator.displaySlide: slideCompositor.fetchAndRun: this.currentSlide === this.prevSlide');
                return;
            }
            _this.slideShowHandler.displaySlide(_this.currentSlide, _this.prevSlide, bSkipTransition);
            if (_this.isRewindingToPrevSlide) {
                _this.slideShowHandler.skipAllEffects();
                _this.isRewindingToPrevSlide = false;
            }
        });
    };
    SlideShowNavigator.prototype.startPresentation = function (nStartSlide, bSkipTransition) {
        NAVDBG.print('SlideShowNavigator.startPresentation: current index: ' +
            this.currentSlide +
            ', nStartSlide: ' +
            nStartSlide);
        this.slideShowHandler.isStarting = true;
        this.isRewindingToPrevSlide = false;
        this.currentSlide = undefined;
        this.prevSlide = undefined;
        this.displaySlide(nStartSlide, bSkipTransition);
    };
    SlideShowNavigator.prototype.endPresentation = function (force) {
        if (force === void 0) { force = false; }
        this.presenter.endPresentation(force);
    };
    SlideShowNavigator.prototype.onClick = function (aEvent) {
        aEvent.preventDefault();
        aEvent.stopPropagation();
        if (!this.isEnabled)
            return;
        var metaSlide = this.theMetaPres.getMetaSlideByIndex(this.currentSlide);
        if (!metaSlide)
            window.app.console.log('SlideShowNavigator.onClick: no meta slide available for index: ' +
                this.currentSlide);
        if (metaSlide && metaSlide.animationsHandler) {
            var aEventMultiplexer = metaSlide.animationsHandler.eventMultiplexer;
            if (aEventMultiplexer) {
                if (aEventMultiplexer.hasRegisteredMouseClickHandlers()) {
                    aEventMultiplexer.notifyMouseClick(aEvent);
                    return;
                }
            }
        }
        this.clickHandler(aEvent);
    };
    SlideShowNavigator.prototype.clickHandler = function (aEvent) {
        if (aEvent.button === 0) {
            var slideInfo = this.theMetaPres.getSlideInfoByIndex(this.currentSlide);
            var slideHasInteractions = slideInfo &&
                slideInfo.interactions &&
                slideInfo.interactions.length > 0;
            var slideHasVideos = slideInfo && slideInfo.videos && slideInfo.videos.length > 0;
            if (!slideHasInteractions && !slideHasVideos) {
                this.dispatchEffect();
                return;
            }
            // Get the coordinates of the click
            var canvas = this.presenter.getCanvas();
            var width = canvas.clientWidth;
            var height = canvas.clientHeight;
            var x_1 = (aEvent.offsetX / width) * this.theMetaPres.slideWidth;
            var y_1 = (aEvent.offsetY / height) * this.theMetaPres.slideHeight;
            var shape = slideInfo.interactions.find(function (shape) {
                return hitTest(shape.bounds, x_1, y_1);
            });
            var videoInfo = slideInfo.videos.find(function (videoInfo) {
                return hitTest(videoInfo, x_1, y_1);
            });
            if (shape) {
                this._onExecuteInteraction(shape.clickAction);
            }
            else if (videoInfo) {
                var video = this.presenter.getVideoRenderer(slideInfo.hash, videoInfo);
                video.handleClick();
            }
            else {
                this.dispatchEffect();
            }
        }
        else if (aEvent.button === 2) {
            this.switchSlide(-1, false);
        }
    };
    SlideShowNavigator.prototype.onMouseMove = function (aEvent) {
        if (!this.isEnabled)
            return;
        var metaSlide = this.theMetaPres.getMetaSlideByIndex(this.currentSlide);
        if (!metaSlide)
            window.app.console.log('SlideShowNavigator.onMouseMove: no meta slide available for index: ' +
                this.currentSlide);
        if (metaSlide && metaSlide.animationsHandler) {
            var aEventMultiplexer = metaSlide.animationsHandler.eventMultiplexer;
            if (aEventMultiplexer) {
                if (aEventMultiplexer.hasRegisteredMouseClickHandlers()) {
                    var canvas = this.presenter.getCanvas();
                    var width = canvas.clientWidth;
                    var height = canvas.clientHeight;
                    var x = (aEvent.offsetX / width) * this.theMetaPres.slideWidth;
                    var y = (aEvent.offsetY / height) * this.theMetaPres.slideHeight;
                    aEventMultiplexer.notifyMouseMove({ x: x, y: y });
                    return;
                }
            }
        }
    };
    SlideShowNavigator.prototype._onExecuteInteraction = function (action) {
        if (action) {
            switch (action.action) {
                case 'prevpage':
                    this.switchSlide(-1, true);
                    break;
                case 'nextpage':
                    this.switchSlide(1, true);
                    break;
                case 'firstpage':
                    this.goToFirstSlide();
                    break;
                case 'lastpage':
                    this.goToLastSlide();
                    break;
                case 'bookmark':
                    this.goToSlideAtBookmark(action.bookmark);
                    break;
                case 'stoppresentation':
                    this.quit();
                    break;
            }
        }
        else {
            this.dispatchEffect();
        }
    };
    SlideShowNavigator.prototype.onKeyDown = function (aEvent) {
        aEvent.preventDefault();
        aEvent.stopPropagation();
        if (!this.isEnabled && aEvent.code !== 'Escape')
            return;
        var handler = this.keyHandlerMap[aEvent.code];
        if (handler)
            handler();
    };
    SlideShowNavigator.prototype.onSwipe = function (event) {
        event.preventDefault();
        if (!this.isEnabled &&
            event.direction !== Hammer.DIRECTION_DOWN &&
            event.direction !== Hammer.DIRECTION_UP)
            return;
        var handler = this.swipeHandlerMap[event.direction];
        if (handler)
            handler();
    };
    SlideShowNavigator.prototype.setPresenter = function (presenter) {
        this.presenter = presenter;
    };
    Object.defineProperty(SlideShowNavigator.prototype, "slideCompositor", {
        get: function () {
            return this.presenter._slideCompositor;
        },
        enumerable: false,
        configurable: true
    });
    SlideShowNavigator.prototype.enable = function () {
        this.isEnabled = true;
    };
    SlideShowNavigator.prototype.disable = function () {
        this.isEnabled = false;
    };
    return SlideShowNavigator;
}());
//# sourceMappingURL=SlideShowNavigator.js.map