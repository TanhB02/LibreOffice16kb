/* -*- js-indent-level: 8; fill-column: 100 -*- */
var LayoutingService = /** @class */ (function () {
    function LayoutingService() {
        this._requestedFrame = null;
        this._layoutTasks = [];
        this._layoutTaskFlush = null;
        // get something around 25 fps as minimum (35ms + some overflow = ~40ms)
        this.MAX_TASK_DURATION_MS = 35;
        this.MIN_TIMER_DELAY_MS = 10;
    }
    LayoutingService.prototype.appendLayoutingTask = function (task) {
        this._layoutTasks.push(task);
        this._scheduleLayouting();
    };
    LayoutingService.prototype.hasTasksPending = function () {
        return this._layoutTasks.length > 0;
    };
    LayoutingService.prototype.runTheTopTask = function () {
        var task = this._layoutTasks.shift();
        if (!task)
            return false;
        try {
            task();
        }
        catch (ex) {
            console.error('LayoutingTask exception: ' + ex);
        }
        return true;
    };
    LayoutingService.prototype.cancelFrame = function () {
        if (this._requestedFrame)
            window.cancelAnimationFrame(this._requestedFrame);
        this._requestedFrame = null;
    };
    // internal implementation below
    LayoutingService.prototype._setupTimer = function () {
        this._layoutTaskFlush = setTimeout(this._flushLayoutingQueue.bind(this), this.MIN_TIMER_DELAY_MS);
    };
    LayoutingService.prototype._reachedTaskTimeout = function (start) {
        var duration = performance.now() - start;
        if (duration > this.MAX_TASK_DURATION_MS)
            return true;
        return false;
    };
    LayoutingService.prototype._flushLayoutingQueue = function () {
        var _this = this;
        this._layoutTaskFlush = null;
        if (!this.hasTasksPending())
            return;
        this._requestedFrame = window.requestAnimationFrame(function () {
            _this._requestedFrame = null;
            var start = performance.now();
            while (_this.runTheTopTask()) {
                if (_this._reachedTaskTimeout(start)) {
                    _this._scheduleLayouting();
                    return;
                }
            }
        });
    };
    LayoutingService.prototype._scheduleLayouting = function () {
        if (this._layoutTaskFlush)
            return;
        this._setupTimer();
    };
    return LayoutingService;
}());
//# sourceMappingURL=LayoutingService.js.map