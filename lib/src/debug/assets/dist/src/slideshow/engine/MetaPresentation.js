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
var MetaPresentation = /** @class */ (function () {
    function MetaPresentation(info, aSlideShowHandler, aSlideShowNavigator) {
        this.aSlideShowHandler = aSlideShowHandler;
        this.update(info);
        this.setNavigator(aSlideShowNavigator);
    }
    MetaPresentation.prototype.setNavigator = function (nav) {
        var _this = this;
        this.slideShowNavigator = nav;
        // We set up a low priority for the invocation of canvas handleClick
        // in order to make clicks on shapes, that start interactive animation
        // sequence (on click), have a higher priority.
        this.metaSlides.forEach(function (metaSlide) {
            if (metaSlide.animationsHandler) {
                var eventMultiplexer = metaSlide.animationsHandler.eventMultiplexer;
                if (eventMultiplexer)
                    eventMultiplexer.registerMouseClickHandler(_this.slideShowNavigator.canvasClickHandler, 100);
            }
        });
    };
    Object.defineProperty(MetaPresentation.prototype, "slideShowHandler", {
        get: function () {
            return this.aSlideShowHandler;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MetaPresentation.prototype, "startSlideIndex", {
        get: function () {
            return this._startSlideIndex;
        },
        enumerable: false,
        configurable: true
    });
    MetaPresentation.prototype.update = function (info) {
        this.docWidth = info.docWidth;
        this.docHeight = info.docHeight;
        var aContext = this.aSlideShowHandler.getContext();
        aContext.nSlideWidth = this.docWidth;
        aContext.nSlideHeight = this.docHeight;
        this._numberOfSlides = info.slides.length;
        if (this._numberOfSlides === 0)
            return;
        this.firstSlideHash = info.slides[0].hash;
        this.lastSlideHash = info.slides[this._numberOfSlides - 1].hash;
        this.metaSlides = new Map();
        this.partHashes = new Map();
        var prevSlideHash = null;
        for (var i = 0; i < this._numberOfSlides; ++i) {
            var slide = info.slides[i];
            slide.indexInSlideShow = i;
            slide.prev = prevSlideHash;
            slide.next =
                i + 1 < this._numberOfSlides ? info.slides[i + 1].hash : null;
            var metaSlide = new MetaSlide(slide, this);
            this.metaSlides.set(slide.hash, metaSlide);
            this.partHashes.set(slide.index, slide.hash);
            prevSlideHash = slide.hash;
        }
    };
    MetaPresentation.prototype.isEmpty = function () {
        return this._numberOfSlides === 0;
    };
    Object.defineProperty(MetaPresentation.prototype, "numberOfSlides", {
        get: function () {
            return this._numberOfSlides;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MetaPresentation.prototype, "slideWidth", {
        get: function () {
            return this.docWidth;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MetaPresentation.prototype, "slideHeight", {
        get: function () {
            return this.docHeight;
        },
        enumerable: false,
        configurable: true
    });
    MetaPresentation.prototype.getCurrentSlideIndex = function () {
        return this.slideShowNavigator.currentSlideIndex;
    };
    MetaPresentation.prototype.getCurrentSlideHash = function () {
        return this.getSlideHash(this.getCurrentSlideIndex());
    };
    MetaPresentation.prototype.getSlideHash = function (slideIndex) {
        return this.partHashes.get(slideIndex);
    };
    MetaPresentation.prototype.isFirstSlide = function (hash) {
        return hash === this.firstSlideHash;
    };
    MetaPresentation.prototype.isLastSlide = function (hash) {
        return hash === this.lastSlideHash;
    };
    MetaPresentation.prototype.getMetaSlide = function (slideHash) {
        return this.metaSlides.get(slideHash);
    };
    MetaPresentation.prototype.getMetaSlideByIndex = function (slideIndex) {
        return this.getMetaSlide(this.getSlideHash(slideIndex));
    };
    MetaPresentation.prototype.getSlideInfo = function (slideHash) {
        var metaSlide = this.getMetaSlide(slideHash);
        return metaSlide ? metaSlide.info : null;
    };
    MetaPresentation.prototype.getSlideInfoByIndex = function (slideIndex) {
        var slideHash = this.getSlideHash(slideIndex);
        return slideHash ? this.getSlideInfo(slideHash) : null;
    };
    MetaPresentation.prototype.getMetaSlides = function () {
        return this.metaSlides;
    };
    MetaPresentation.prototype.setCurrentSlide = function (nSlideIndex) {
        if (nSlideIndex >= 0 && nSlideIndex < this.numberOfSlides) {
            var nCurSlide = this.getCurrentSlideIndex();
            if (nCurSlide !== undefined)
                this.getMetaSlideByIndex(nCurSlide).hide();
            this.getMetaSlideByIndex(nCurSlide).show();
        }
        else {
            window.app.console.log('MetaPresentation.setCurrentSlide: slide index out of range: ' +
                nSlideIndex);
        }
    };
    return MetaPresentation;
}());
//# sourceMappingURL=MetaPresentation.js.map