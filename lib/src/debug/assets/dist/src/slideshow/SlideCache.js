// @ts-strict-ignore
/** */
var SlideCache = /** @class */ (function () {
    function SlideCache() {
        this.renderedSlides = new Map();
    }
    // TODO: cache other layers here
    SlideCache.prototype.has = function (slideHash) {
        return this.renderedSlides.has(slideHash);
    };
    SlideCache.prototype.get = function (slideHash) {
        return this.renderedSlides.get(slideHash);
    };
    SlideCache.prototype.set = function (slideHash, image) {
        this.renderedSlides.set(slideHash, image);
    };
    SlideCache.prototype.invalidate = function (slideHash) {
        this.renderedSlides.delete(slideHash);
    };
    SlideCache.prototype.invalidateAll = function () {
        this.renderedSlides.clear();
    };
    return SlideCache;
}());
SlideShow.SlideCache = SlideCache;
//# sourceMappingURL=SlideCache.js.map