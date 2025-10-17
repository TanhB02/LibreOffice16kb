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
var PauseTimer = /** @class */ (function () {
    function PauseTimer() {
    }
    return PauseTimer;
}());
var PauseTimer2d = /** @class */ (function () {
    function PauseTimer2d(canvasContext, pauseDuration, onComplete) {
        this.onComplete = onComplete;
    }
    PauseTimer2d.prototype.startTimer = function () {
        this.onComplete();
    };
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    PauseTimer2d.prototype.stopTimer = function () { };
    return PauseTimer2d;
}());
var PauseTimerGl = /** @class */ (function (_super) {
    __extends(PauseTimerGl, _super);
    function PauseTimerGl(canvasContext, pauseDuration, onComplete) {
        var _this = _super.call(this, canvasContext) || this;
        _this.pauseDuration = pauseDuration;
        _this.pauseTimeRemaining = pauseDuration;
        _this.onComplete = onComplete;
        if (_this.context.isDisposed())
            return _this;
        _this.textCanvas = document.createElement('canvas');
        _this.textCanvas.width = _this.context.canvas.width;
        _this.textCanvas.height = _this.context.canvas.height;
        _this.ctx = _this.textCanvas.getContext('2d');
        _this.textTexture = _this.createTextTexture(_this.getPauseTextContent());
        _this.prepareTransition();
        return _this;
    }
    PauseTimerGl.prototype.startTimer = function () {
        if (this.context.isDisposed())
            return;
        this.startTime = performance.now();
        requestAnimationFrame(this.animate.bind(this));
    };
    PauseTimerGl.prototype.stopTimer = function () {
        this.pauseTimeRemaining = 0;
        this.delete2dTextCanvas();
    };
    PauseTimerGl.prototype.animate = function () {
        if (this.context.isDisposed())
            return;
        if (!this.textCanvas || !this.ctx)
            return;
        var currentTime = performance.now();
        var elapsedTime = (currentTime - this.startTime) / 1000;
        this.pauseTimeRemaining = Math.max(0, this.pauseDuration - elapsedTime);
        this.textTexture = this.createTextTexture(this.getPauseTextContent());
        this.render();
        requestAnimationFrame(this.animate.bind(this));
        if (this.pauseTimeRemaining <= 0) {
            this.onComplete();
            this.delete2dTextCanvas();
            return;
        }
    };
    PauseTimerGl.prototype.createTextTexture = function (displayText) {
        if (this.context.isDisposed())
            return null;
        this.clearCanvas();
        this.drawText(displayText);
        return this.load2dCanvasToGlCanvas(this.textCanvas);
    };
    PauseTimerGl.prototype.clearCanvas = function () {
        this.ctx.clearRect(0, 0, this.textCanvas.width, this.textCanvas.height);
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.textCanvas.width, this.textCanvas.height);
    };
    // add text on off screen canvas...
    PauseTimerGl.prototype.drawText = function (displayText) {
        if (this.context.isDisposed())
            return;
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(displayText, this.textCanvas.width / 2, this.textCanvas.height / 2);
    };
    PauseTimerGl.prototype.delete2dTextCanvas = function () {
        if (this.textCanvas) {
            this.textCanvas.remove();
            this.textCanvas = null;
            this.ctx = null;
        }
    };
    PauseTimerGl.prototype.getPauseTextContent = function () {
        return _('Pause... ( %SECONDS% )').replace('%SECONDS%', Math.ceil(this.pauseTimeRemaining).toString());
    };
    return PauseTimerGl;
}(StaticTextRenderer));
SlideShow.PauseTimer = PauseTimer;
SlideShow.PauseTimer2d = PauseTimer2d;
SlideShow.PauseTimerGl = PauseTimerGl;
//# sourceMappingURL=PauseTimer.js.map