// @ts-strict-ignore
/* -*- js-indent-level: 8 -*- */
var SlideCompositor = /** @class */ (function () {
    function SlideCompositor(slideShowPresenter) {
        this._slideShowPresenter = null;
        this._initialSlideNumber = 0;
        this._onGotSlideCallback = null;
        this._slideShowPresenter = slideShowPresenter;
        this._addHooks();
    }
    SlideCompositor.prototype.fetchAndRun = function (slideNumber, callback) {
        this._initialSlideNumber = slideNumber;
        this._onGotSlideCallback = callback;
    };
    return SlideCompositor;
}());
SlideShow.SlideCompositor = SlideCompositor;
//# sourceMappingURL=SlideCompositor.js.map